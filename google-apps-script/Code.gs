/**
 * ============================================================================
 *  RSVP + Wedding Wishes backend
 *  The Wedding of Alghifari & Laeli · 21 October 2026
 *
 *  Google Sheets (database) ← Google Apps Script Web App (this file) ← website
 *
 *  Setup (full guide: docs/GOOGLE-SHEETS.md)
 *   1. Create a Google Sheet → Extensions → Apps Script → paste this file.
 *   2. Run `setup` once (authorise when asked).
 *   3. Deploy → New deployment → Web app
 *        Execute as: Me    ·    Who has access: Anyone
 *   4. Copy the Web App URL (ends with /exec) into js/config.js → rsvp.apiUrl
 *
 *  Endpoints
 *   GET  ?action=wishes   → { ok, total, wishes: [{ id, name, message }] }  (public data only)
 *   GET  ?action=ping     → { ok, time }
 *   POST (JSON body, Content-Type text/plain)
 *        { action:"rsvp", submissionId, invitationSlug, guestName,
 *          attendance:"attending"|"not_attending", guestCount, message, website }
 *        → { ok:true, status:"created"|"duplicate" } | { ok:false, error, field? }
 *
 *  Privacy: attendance, guest count, timestamps and slugs are NEVER returned
 *  by the public endpoint. Untick "Show on Website" in the sheet to hide a wish.
 *  No secrets live in the website: the Web App URL only allows these actions.
 * ============================================================================
 */

var SETTINGS = {
  SPREADSHEET_ID: '',          // Leave '' when this script is bound to the sheet (recommended).
  SHEET_NAME: 'RSVP',
  TIMEZONE: 'Asia/Jakarta',
  MAX_NAME: 80,
  MAX_MESSAGE: 500,
  MAX_GUESTS: 5,               // Keep in sync with js/config.js → rsvp.maxGuests
  MAX_PUBLIC_WISHES: 300,      // Newest N wishes returned to the website
  SCAN_ROWS: 400,              // Recent rows checked for duplicates
  DUPLICATE_WINDOW_MIN: 10,    // Same person + same message within N minutes = duplicate
  RATE_LIMIT_COUNT: 6,         // Max submissions per name+invitation …
  RATE_LIMIT_WINDOW_SEC: 600,  // … per 10 minutes
  WISHES_CACHE_SEC: 20         // Public wishes are cached briefly to keep polling cheap
};

var HEADERS = ['Timestamp', 'Invitation Slug', 'Guest Name', 'Attendance', 'Guest Count',
  'Wedding Message', 'Submission ID', 'Show on Website'];
var COL = { TS: 1, SLUG: 2, NAME: 3, ATT: 4, COUNT: 5, MSG: 6, SID: 7, SHOW: 8 };
var WISHES_CACHE_KEY = 'wishes:v1';

/* =============================================================== HTTP == */

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'wishes';
    if (action === 'wishes') {
      var result = getPublicWishes_();
      return json_({ ok: true, total: result.total, wishes: result.wishes });
    }
    if (action === 'ping') return json_({ ok: true, time: new Date().toISOString() });
    return json_({ ok: false, error: 'Unknown action.' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Server error.' });
  }
}

function doPost(e) {
  var lock = null;
  try {
    var body = parseBody_(e);
    if (body.action && body.action !== 'rsvp') return json_({ ok: false, error: 'Unknown action.' });

    // Honeypot: bots fill hidden fields. Pretend success, store nothing.
    if (body.website) return json_({ ok: true, status: 'created' });

    var data = validate_(body);

    lock = LockService.getScriptLock();
    lock.waitLock(15000);

    var sheet = getSheet_();
    if (isDuplicate_(sheet, data)) return json_({ ok: true, status: 'duplicate' });
    if (isRateLimited_(data)) {
      return json_({ ok: false, error: 'Terlalu banyak percobaan. Silakan coba lagi beberapa menit lagi.' });
    }

    sheet.appendRow([
      new Date(),
      safeCell_(data.slug),
      safeCell_(data.name),
      data.attendanceLabel,
      data.guestCount,
      safeCell_(data.message),
      safeCell_(data.submissionId),
      true
    ]);
    SpreadsheetApp.flush();

    var cache = CacheService.getScriptCache();
    cache.put('sid:' + data.submissionId, '1', 21600);
    cache.remove(WISHES_CACHE_KEY);

    return json_({ ok: true, status: 'created' });
  } catch (err) {
    if (err && err.isValidation) return json_({ ok: false, error: err.message, field: err.field });
    console.error(err);
    return json_({ ok: false, error: 'Maaf, terjadi kendala pada server. Silakan coba lagi.' });
  } finally {
    if (lock) {
      try { lock.releaseLock(); } catch (ignore) { /* noop */ }
    }
  }
}

/* ========================================================== VALIDATION == */

function validationError_(field, message) {
  var err = new Error(message);
  err.isValidation = true;
  err.field = field;
  return err;
}

function cleanLine_(value) {
  return String(value == null ? '' : value)
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤﻿]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanMessage_(value) {
  return String(value == null ? '' : value)
    .replace(/\r\n?/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤﻿]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function charLength_(s) {
  return Array.from ? Array.from(s).length : s.length;
}

function validate_(body) {
  var name = cleanLine_(body.guestName);
  if (!name) throw validationError_('guestName', 'Mohon isi nama lengkap Anda.');
  if (charLength_(name) < 2) throw validationError_('guestName', 'Nama terlalu pendek.');
  if (charLength_(name) > SETTINGS.MAX_NAME) throw validationError_('guestName', 'Nama maksimal ' + SETTINGS.MAX_NAME + ' karakter.');

  var attendance = String(body.attendance || '');
  if (attendance !== 'attending' && attendance !== 'not_attending') {
    throw validationError_('attendance', 'Mohon pilih konfirmasi kehadiran.');
  }

  var guestCount = 0;
  if (attendance === 'attending') {
    guestCount = Number(body.guestCount);
    if (!isFinite(guestCount) || Math.floor(guestCount) !== guestCount || guestCount < 1 || guestCount > SETTINGS.MAX_GUESTS) {
      throw validationError_('guestCount', 'Jumlah tamu antara 1 dan ' + SETTINGS.MAX_GUESTS + ' orang.');
    }
  }

  var message = cleanMessage_(body.message);
  if (charLength_(message) > SETTINGS.MAX_MESSAGE) {
    throw validationError_('message', 'Ucapan maksimal ' + SETTINGS.MAX_MESSAGE + ' karakter.');
  }

  var slug = String(body.invitationSlug || '').toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) slug = 'umum';

  var submissionId = String(body.submissionId || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(submissionId)) submissionId = Utilities.getUuid();

  return {
    name: name,
    attendance: attendance,
    attendanceLabel: attendance === 'attending' ? 'Hadir' : 'Tidak Hadir',
    guestCount: guestCount,
    message: message,
    slug: slug,
    submissionId: submissionId
  };
}

/** Prevent spreadsheet formula injection (=, +, -, @ at the start of a cell). */
function safeCell_(value) {
  var s = String(value == null ? '' : value);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

/** Undo safeCell_ for display. */
function unsafeCell_(value) {
  var s = String(value == null ? '' : value);
  return s.charAt(0) === "'" && /^'[=+\-@]/.test(s) ? s.slice(1) : s;
}

/* ============================================================ STORAGE == */

function getSpreadsheet_() {
  return SETTINGS.SPREADSHEET_ID
    ? SpreadsheetApp.openById(SETTINGS.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SETTINGS.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SETTINGS.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function recentRows_(sheet, maxRows) {
  var last = sheet.getLastRow();
  if (last < 2) return { start: 2, rows: [] };
  var start = Math.max(2, last - maxRows + 1);
  return { start: start, rows: sheet.getRange(start, 1, last - start + 1, HEADERS.length).getValues() };
}

function isDuplicate_(sheet, data) {
  var cache = CacheService.getScriptCache();
  if (cache.get('sid:' + data.submissionId)) return true;

  var recent = recentRows_(sheet, SETTINGS.SCAN_ROWS).rows;
  var windowMs = SETTINGS.DUPLICATE_WINDOW_MIN * 60 * 1000;
  var now = Date.now();
  var nameKey = data.name.toLowerCase();
  for (var i = recent.length - 1; i >= 0; i--) {
    var row = recent[i];
    if (unsafeCell_(row[COL.SID - 1]) === data.submissionId) return true;
    var ts = row[COL.TS - 1] instanceof Date ? row[COL.TS - 1].getTime() : Date.parse(row[COL.TS - 1]);
    if (!ts || now - ts > windowMs) continue;
    if (String(unsafeCell_(row[COL.NAME - 1])).toLowerCase() === nameKey &&
        String(unsafeCell_(row[COL.SLUG - 1])) === data.slug &&
        String(row[COL.ATT - 1]) === data.attendanceLabel &&
        String(unsafeCell_(row[COL.MSG - 1])) === data.message) {
      return true;
    }
  }
  return false;
}

function isRateLimited_(data) {
  var cache = CacheService.getScriptCache();
  var key = 'rl:' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, data.slug + '|' + data.name.toLowerCase(), Utilities.Charset.UTF_8));
  var count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), SETTINGS.RATE_LIMIT_WINDOW_SEC);
  return count > SETTINGS.RATE_LIMIT_COUNT;
}

/* ===================================================== PUBLIC WISHES == */

function getPublicWishes_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(WISHES_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  var sheet = getSheet_();
  var recent = recentRows_(sheet, 3000);
  var wishes = [];
  for (var i = recent.rows.length - 1; i >= 0; i--) {
    var row = recent.rows[i];
    var show = row[COL.SHOW - 1];
    if (show === false || String(show).toUpperCase() === 'FALSE') continue;
    var message = cleanMessage_(unsafeCell_(row[COL.MSG - 1]));
    var name = cleanLine_(unsafeCell_(row[COL.NAME - 1]));
    if (!message || !name) continue;
    wishes.push({
      id: unsafeCell_(row[COL.SID - 1]) || ('row-' + (recent.start + i)),
      name: name,                 // ONLY name + message are public
      message: message
    });
  }
  var result = { total: wishes.length, wishes: wishes.slice(0, SETTINGS.MAX_PUBLIC_WISHES) };
  try {
    cache.put(WISHES_CACHE_KEY, JSON.stringify(result), SETTINGS.WISHES_CACHE_SEC);
  } catch (ignore) { /* value too large for cache: skip caching */ }
  return result;
}

/* ============================================================ HELPERS == */

function parseBody_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (ignore) { /* fall back to form parameters */ }
  }
  return e.parameter || {};
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ============================================== ONE-TIME SETUP (run me) == */

/**
 * Run once from the Apps Script editor (select `setup` → Run).
 * Creates/formats the RSVP sheet and sets the spreadsheet timezone.
 */
function setup() {
  var ss = getSpreadsheet_();
  ss.setSpreadsheetTimeZone(SETTINGS.TIMEZONE);
  var sheet = getSheet_();
  var header = sheet.getRange(1, 1, 1, HEADERS.length);
  header.setValues([HEADERS]).setFontWeight('bold').setBackground('#17130F').setFontColor('#F2E8D8');
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(COL.TS, 160);
  sheet.setColumnWidth(COL.SLUG, 160);
  sheet.setColumnWidth(COL.NAME, 200);
  sheet.setColumnWidth(COL.ATT, 110);
  sheet.setColumnWidth(COL.COUNT, 100);
  sheet.setColumnWidth(COL.MSG, 420);
  sheet.setColumnWidth(COL.SID, 120);
  sheet.setColumnWidth(COL.SHOW, 130);
  sheet.getRange(2, COL.TS, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(2, COL.MSG, sheet.getMaxRows() - 1, 1).setWrap(true);
  // Checkbox validation only (no values), so getLastRow()/appendRow keep working.
  sheet.getRange(2, COL.SHOW, sheet.getMaxRows() - 1, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  CacheService.getScriptCache().remove(WISHES_CACHE_KEY);
  Logger.log('RSVP sheet ready: ' + ss.getUrl());
}

/** Optional: run from the editor to check everything works end-to-end. */
function selfTest() {
  var res = doPost({ postData: { contents: JSON.stringify({
    action: 'rsvp', submissionId: 'selftest-' + Date.now(), invitationSlug: 'selftest',
    guestName: 'Self Test', attendance: 'not_attending', guestCount: 0, message: ''
  }) } });
  Logger.log(res.getContent());
  Logger.log(doGet({ parameter: { action: 'ping' } }).getContent());
}
