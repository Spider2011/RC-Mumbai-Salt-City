/**
 * RCMSC form -> Google Sheets bridge.
 *
 * Every form on the site POSTs JSON like:
 *   { "sheet": "Join", "timestamp": "...", "name": "...", "email": "...", ... }
 *
 * This script routes each submission to a tab named by `sheet` (creating the
 * tab and its header row the first time it sees that form), then appends a row.
 *
 * SETUP
 * 1. Create a Google Sheet (this becomes the destination).
 * 2. Extensions -> Apps Script. Delete any code, paste this whole file.
 * 3. Save. Then Deploy -> New deployment -> type "Web app".
 *      - Description: RCMSC forms
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Deploy, authorise, and COPY the Web app URL (ends in /exec).
 * 4. In Vercel -> Project -> Settings -> Environment Variables add:
 *      NEXT_PUBLIC_SHEETS_ENDPOINT = <that /exec URL>
 *    Redeploy. Done — submissions now land in the sheet, one tab per form.
 *
 * To change fields later, no script edit is needed: new keys simply appear as
 * new columns (see appendAligned).
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetName = String(data.sheet || 'Misc').replace(/[:\\\/\?\*\[\]]/g, ' ').substring(0, 95);
    delete data.sheet;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    appendAligned(sheet, data);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Quick health check when you open the /exec URL in a browser.
function doGet() {
  return json({ ok: true, service: 'RCMSC forms' });
}

/**
 * Appends `data` to `sheet`, keeping columns aligned to the header row.
 * Unknown keys are added as new trailing columns automatically.
 */
function appendAligned(sheet, data) {
  let headers =
    sheet.getLastRow() === 0
      ? []
      : sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].filter(String);

  // Add any brand-new keys as columns.
  Object.keys(data).forEach((key) => {
    if (headers.indexOf(key) === -1) headers.push(key);
  });

  // (Re)write the header row.
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const row = headers.map((h) => (data[h] !== undefined ? data[h] : ''));
  sheet.appendRow(row);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
