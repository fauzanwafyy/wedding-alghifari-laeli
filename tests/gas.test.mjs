/**
 * Unit tests for google-apps-script/Code.gs (run: node --test tests/)
 */
import test from "node:test";
import assert from "node:assert/strict";
import { loadGas } from "./gas-emulator.mjs";

const post = (gas, body) => JSON.parse(gas.ctx.doPost({ postData: { contents: JSON.stringify(body) } }).getContent());
const get = (gas, action = "wishes") => JSON.parse(gas.ctx.doGet({ parameter: { action } }).getContent());
const base = (over = {}) => ({
  action: "rsvp", submissionId: `t-${Math.random().toString(36).slice(2, 12)}`, invitationSlug: "pujo-partner",
  guestName: "Pujo", attendance: "attending", guestCount: 2, message: "Selamat ya!", website: "", ...over,
});

test("creates a row with the expected columns", () => {
  const gas = loadGas();
  const r = post(gas, base());
  assert.deepEqual(r, { ok: true, status: "created" });
  const rows = gas.sheets.get("RSVP").rows;
  assert.deepEqual([...rows[0]], ["Timestamp", "Invitation Slug", "Guest Name", "Attendance", "Guest Count", "Wedding Message", "Submission ID", "Show on Website"]);
  assert.equal(rows.length, 2);
  assert.ok(rows[1][0] instanceof Date);
  assert.deepEqual([...rows[1].slice(1, 6)], ["pujo-partner", "Pujo", "Hadir", 2, "Selamat ya!"]);
  assert.equal(rows[1][7], true);
});

test("every submission creates a NEW row", () => {
  const gas = loadGas();
  post(gas, base({ guestName: "Ade" }));
  post(gas, base({ guestName: "Budi", message: "Barakallah" }));
  post(gas, base({ guestName: "Citra", attendance: "not_attending", guestCount: 0, message: "" }));
  assert.equal(gas.sheets.get("RSVP").rows.length, 4);
});

test("validation errors return field + message, nothing stored", () => {
  const gas = loadGas();
  assert.equal(post(gas, base({ guestName: "" })).field, "guestName");
  assert.equal(post(gas, base({ guestName: "A" })).field, "guestName");
  assert.equal(post(gas, base({ guestName: "x".repeat(81) })).field, "guestName");
  assert.equal(post(gas, base({ attendance: "maybe" })).field, "attendance");
  assert.equal(post(gas, base({ guestCount: 0 })).field, "guestCount");
  assert.equal(post(gas, base({ guestCount: 6 })).field, "guestCount");
  assert.equal(post(gas, base({ guestCount: 1.5 })).field, "guestCount");
  assert.equal(post(gas, base({ message: "m".repeat(501) })).field, "message");
  assert.equal(gas.sheets.get("RSVP"), undefined);
});

test("not attending forces guest count 0", () => {
  const gas = loadGas();
  post(gas, base({ attendance: "not_attending", guestCount: 4 }));
  const row = gas.sheets.get("RSVP").rows[1];
  assert.equal(row[3], "Tidak Hadir");
  assert.equal(row[4], 0);
});

test("same submissionId is a duplicate (safe retries)", () => {
  const gas = loadGas();
  const body = base({ submissionId: "retry-1234567" });
  assert.equal(post(gas, body).status, "created");
  assert.equal(post(gas, body).status, "duplicate");
  gas.cacheStore.clear(); // also detected from the sheet, not only the cache
  assert.equal(post(gas, body).status, "duplicate");
  assert.equal(gas.sheets.get("RSVP").rows.length, 2);
});

test("identical re-send within the window is a duplicate", () => {
  const gas = loadGas();
  post(gas, base({ submissionId: "aaaaaaaa1" }));
  assert.equal(post(gas, base({ submissionId: "bbbbbbbb2" })).status, "duplicate");
  assert.equal(post(gas, base({ submissionId: "cccccccc3", message: "Pesan lain" })).status, "created");
});

test("honeypot submissions are swallowed", () => {
  const gas = loadGas();
  assert.deepEqual(post(gas, base({ website: "http://spam" })), { ok: true, status: "created" });
  assert.equal(gas.sheets.get("RSVP"), undefined);
});

test("sanitises input: tags, control chars, formula injection", () => {
  const gas = loadGas();
  post(gas, base({ guestName: "  <b>Eko</b>\u0007  Prasetyo ", message: "=HYPERLINK(\"http://x\")\n\n\n\nhi<script>x</script>" }));
  const row = gas.sheets.get("RSVP").rows[1];
  assert.equal(row[2], "Eko Prasetyo");
  assert.equal(row[5], "'=HYPERLINK(\"http://x\")\n\nhix");
  const w = get(gas).wishes[0];
  assert.equal(w.message, "=HYPERLINK(\"http://x\")\n\nhix"); // shown as plain text, apostrophe removed
});

test("public wishes expose ONLY id, name, message (newest first)", () => {
  const gas = loadGas();
  post(gas, base({ guestName: "Ade", message: "Pertama" }));
  post(gas, base({ guestName: "Budi", message: "Kedua" }));
  post(gas, base({ guestName: "Citra", message: "" }));
  gas.cacheStore.clear();
  const res = get(gas);
  assert.equal(res.ok, true);
  assert.equal(res.total, 2);
  assert.deepEqual(res.wishes.map((w) => w.name), ["Budi", "Ade"]);
  for (const w of res.wishes) assert.deepEqual(Object.keys(w).sort(), ["id", "message", "name"]);
  const raw = JSON.stringify(res);
  assert.ok(!raw.includes("Hadir") && !raw.includes("pujo-partner"));
});

test("unticking Show on Website hides a wish", () => {
  const gas = loadGas();
  post(gas, base({ guestName: "Spammer", message: "beli sekarang" }));
  gas.sheets.get("RSVP").rows[1][7] = false;
  gas.cacheStore.clear();
  assert.equal(get(gas).total, 0);
});

test("rate limit per name + invitation", () => {
  const gas = loadGas();
  let last;
  for (let i = 0; i < 8; i++) last = post(gas, base({ message: `pesan ${i}` }));
  assert.equal(last.ok, false);
  assert.match(last.error, /Terlalu banyak/);
});

test("ping + unknown action + malformed body", () => {
  const gas = loadGas();
  assert.equal(get(gas, "ping").ok, true);
  assert.equal(get(gas, "nope").ok, false);
  const r = JSON.parse(gas.ctx.doPost({ postData: { contents: "not json" } }).getContent());
  assert.equal(r.ok, false);
  assert.equal(r.field, "guestName");
});

test("setup() formats without breaking appendRow", () => {
  const gas = loadGas();
  gas.ctx.setup();
  post(gas, base());
  assert.equal(gas.sheets.get("RSVP").rows.length, 2);
});
