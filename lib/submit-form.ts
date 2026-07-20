/**
 * Sends a form submission to the club's Google Sheet via a Google Apps Script
 * Web App. Each submission carries a `sheet` name — the Apps Script routes it
 * to (and auto-creates) a tab with that name, so every form lands in its own
 * tab (Join, World Chess Day, PickleBall Tournament, …).
 *
 * Endpoint is configured via NEXT_PUBLIC_SHEETS_ENDPOINT (set in Vercel).
 * When it is not set, submission is a no-op that still resolves, so the site
 * keeps working in demo mode before the Sheet is connected.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_SHEETS_ENDPOINT;

export type SheetFields = Record<string, string | number>;

export async function submitToSheet(sheet: string, fields: SheetFields): Promise<void> {
  const payload = {
    sheet,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  if (!ENDPOINT) {
    // Not configured yet — behave like the previous demo (no data sent).
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[submitToSheet] NEXT_PUBLIC_SHEETS_ENDPOINT not set — submission skipped.', payload);
    }
    return;
  }

  // `no-cors` + text/plain keeps this a CORS "simple request": no preflight,
  // no CORS read error. The Apps Script still receives and writes the row; we
  // treat a completed request as success (network failures still reject).
  await fetch(ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
}
