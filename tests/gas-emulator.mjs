/**
 * Minimal Google Apps Script emulator for testing google-apps-script/Code.gs
 * locally (no Google account needed). Implements just the services Code.gs uses.
 *
 *   node tests/gas-emulator.mjs [port]     → HTTP server that behaves like the Web App
 *   import { loadGas } from "./gas-emulator.mjs"  → in-process for unit tests
 */
import fs from "node:fs";
import http from "node:http";
import vm from "node:vm";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const CODE = fs.readFileSync(path.join(here, "..", "google-apps-script", "Code.gs"), "utf8");

function makeSheet(name) {
  const rows = [];
  const sheet = {
    name,
    rows,
    validations: 0,
    getLastRow: () => rows.length,
    getMaxRows: () => Math.max(1000, rows.length),
    appendRow: (values) => { rows.push(values.slice()); return sheet; },
    setFrozenRows: () => sheet,
    setColumnWidth: () => sheet,
    getRange: (r, c, nr = 1, nc = 1) => {
      const range = {
        getValues: () => {
          const out = [];
          for (let i = 0; i < nr; i++) {
            const row = rows[r - 1 + i] || [];
            const vals = [];
            for (let j = 0; j < nc; j++) vals.push(row[c - 1 + j] ?? "");
            out.push(vals);
          }
          return out;
        },
        setValues: (vals) => {
          vals.forEach((v, i) => {
            rows[r - 1 + i] = rows[r - 1 + i] || [];
            v.forEach((x, j) => (rows[r - 1 + i][c - 1 + j] = x));
          });
          return range;
        },
        setFontWeight: () => range, setBackground: () => range, setFontColor: () => range,
        setNumberFormat: () => range, setWrap: () => range,
        setDataValidation: () => { sheet.validations++; return range; },
      };
      return range;
    },
  };
  return sheet;
}

export function loadGas() {
  const sheets = new Map();
  const ss = {
    getSheetByName: (n) => sheets.get(n) || null,
    insertSheet: (n) => { const s = makeSheet(n); sheets.set(n, s); return s; },
    setSpreadsheetTimeZone: () => {},
    getUrl: () => "https://docs.google.com/spreadsheets/d/EMULATED",
  };
  const cacheStore = new Map();
  const cache = {
    get: (k) => { const e = cacheStore.get(k); if (!e) return null; if (Date.now() > e.exp) { cacheStore.delete(k); return null; } return e.v; },
    put: (k, v, sec = 600) => { if (String(v).length > 100000) throw new Error("Argument too large"); cacheStore.set(k, { v: String(v), exp: Date.now() + sec * 1000 }); },
    remove: (k) => cacheStore.delete(k),
  };
  const ctx = {
    console,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ss,
      openById: () => ss,
      flush: () => {},
      newDataValidation: () => ({ requireCheckbox() { return this; }, build: () => ({}) }),
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (s) => ({ content: s, setMimeType() { return this; }, getContent() { return s; } }),
    },
    CacheService: { getScriptCache: () => cache },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      DigestAlgorithm: { MD5: "md5" },
      Charset: { UTF_8: "utf8" },
      computeDigest: (alg, s) => Array.from(crypto.createHash(alg).update(String(s), "utf8").digest()).map((b) => (b > 127 ? b - 256 : b)),
      base64EncodeWebSafe: (bytes) => Buffer.from(bytes.map((b) => (b + 256) % 256)).toString("base64url"),
    },
    Date, JSON, Math, Number, String, Array, Object, RegExp, Error, isFinite,
  };
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx, { filename: "Code.gs" });
  return { ctx, ss, sheets, cache, cacheStore };
}

/* --------------------------------------------------------- HTTP server -- */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = Number(process.argv[2] || 8787);
  const gas = loadGas();
  let mode = "normal"; // normal | fail500 | slow | reject | down
  const send = (res, status, body) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" });
    res.end(body);
  };
  http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname === "/__mode") { mode = url.searchParams.get("m") || "normal"; return send(res, 200, JSON.stringify({ mode })); }
    if (url.pathname === "/__sheet") return send(res, 200, JSON.stringify(gas.sheets.get("RSVP")?.rows || []));
    if (url.pathname === "/__reset") { gas.sheets.clear(); gas.cacheStore.clear(); return send(res, 200, "{}"); }
    if (url.pathname === "/__seed") {
      // seed N wishes
      const n = Number(url.searchParams.get("n") || 3);
      for (let i = 0; i < n; i++) {
        gas.ctx.doPost({ postData: { contents: JSON.stringify({ submissionId: `seed-${Date.now()}-${i}`, invitationSlug: "seed", guestName: `Tamu Contoh ${i + 1}`, attendance: i % 2 ? "not_attending" : "attending", guestCount: 1, message: `Selamat menempuh hidup baru! Semoga sakinah, mawaddah, warahmah. (${i + 1})` }) } });
      }
      gas.cacheStore.clear();
      return send(res, 200, JSON.stringify({ seeded: n }));
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const run = () => {
        if (mode === "down") { req.socket.destroy(); return; }
        if (mode === "fail500") return send(res, 500, "<html>Error</html>");
        if (mode === "reject") return send(res, 200, JSON.stringify({ ok: false, error: "Simulasi: server menolak permintaan." }));
        const out = req.method === "POST"
          ? gas.ctx.doPost({ postData: { contents: body, type: req.headers["content-type"] }, parameter: Object.fromEntries(url.searchParams) })
          : gas.ctx.doGet({ parameter: Object.fromEntries(url.searchParams) });
        send(res, 200, out.getContent());
      };
      if (mode === "slow") setTimeout(run, 4000); else run();
    });
  }).listen(port, () => console.log(`GAS emulator on http://127.0.0.1:${port}`));
}
