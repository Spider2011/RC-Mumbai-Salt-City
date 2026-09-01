/**
 * RCMSC form -> Google Sheets bridge.
 *
 * Every form on the site POSTs JSON like:
 *   { "sheet": "Join", "timestamp": "...", "name": "...", "email": "...", ... }
 *
 * This script routes each submission to a tab named by `sheet` (creating the
 * tab and its header row the first time it sees that form), then appends a row.
 *
 * PHOTO UPLOADS
 * Some forms (e.g. Garba Gala) can attach a photo. Those submissions include
 *   _imageData (base64), _imageName, _imageType
 * The script saves the image to a Drive folder ("RCMSC Form Uploads/<sheet>"),
 * makes it viewable by anyone with the link, and stores that link in a `photo`
 * column instead of the raw base64.
 *
 * SETUP
 * 1. Create a Google Sheet (this becomes the destination).
 * 2. Extensions -> Apps Script. Delete any code, paste this whole file.
 * 3. Save. Then Deploy -> Manage deployments -> edit -> New version (or
 *    Deploy -> New deployment -> Web app for the first time):
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Deploy, AUTHORISE (it now also asks for Drive access), and COPY the
 *    Web app URL (ends in /exec).
 * 4. In Vercel -> Project -> Settings -> Environment Variables add:
 *      NEXT_PUBLIC_SHEETS_ENDPOINT = <that /exec URL>
 *    Redeploy. Done.
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

    // If a photo is attached, save it to Drive and keep only the link.
    if (data._imageData) {
      try {
        data.photo = saveImageToDrive(
          sheetName,
          data._imageName || 'photo.jpg',
          data._imageType || 'image/jpeg',
          data._imageData
        );
      } catch (imgErr) {
        data.photo = 'UPLOAD FAILED: ' + String(imgErr);
      }
      delete data._imageData;
      delete data._imageName;
      delete data._imageType;
    }

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

/** Saves a base64 image to Drive and returns a shareable link. */
function saveImageToDrive(sheetName, name, mime, base64) {
  const root = getOrCreateFolder(DriveApp.getRootFolder(), 'RCMSC Form Uploads');
  const folder = getOrCreateFolder(root, sheetName);
  const cleaned = String(base64).replace(/^data:[^;]+;base64,/, '');
  const bytes = Utilities.base64Decode(cleaned);
  const stamped = Utilities.formatDate(new Date(), 'GMT+5:30', 'yyyyMMdd-HHmmss') + '-' + name;
  const blob = Utilities.newBlob(bytes, mime || 'image/jpeg', stamped);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function getOrCreateFolder(parent, name) {
  const existing = parent.getFoldersByName(name);
  return existing.hasNext() ? existing.next() : parent.createFolder(name);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
