# Wiring RCMSC forms to a Google Sheet

Every form on the site (the **Join** form and each **event registration** form)
sends its submissions to one Google Sheet, with **a separate tab per form**.

- Join form → tab **`Join`**
- Each upcoming event's form → a tab named after the event
  (e.g. **`World Chess Day`**, **`PickleBall Tournament`**, **`Installation Ceremony`**,
  **`Oh My Friend Ganesha`**)

Tabs are created automatically the first time a form is submitted — you don't
need to make them yourself.

## One-time setup (~5 minutes)

1. **Create a Google Sheet** — this is where everything lands. Name it anything
   (e.g. "RCMSC Registrations").

2. **Open the script editor** — in that sheet: **Extensions → Apps Script**.
   Delete whatever is there, then paste the entire contents of
   [`Code.gs`](./Code.gs). Click the **Save** icon.

3. **Deploy as a Web App**
   - Click **Deploy → New deployment**.
   - Click the gear → select **Web app**.
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
   - Click **Deploy**, then **Authorize access** and allow the permissions.
   - **Copy the Web app URL** (it ends in `/exec`).

4. **Tell the site about it** — in **Vercel → your project → Settings →
   Environment Variables**, add:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SHEETS_ENDPOINT` | the `/exec` URL you copied |

   Set it for **Production** (and Preview if you like), then **redeploy** the
   site (Deployments → ⋯ → Redeploy).

That's it. New submissions now append to the sheet in real time, each form in
its own tab.

## Testing it

- Open the `/exec` URL in a browser — you should see `{"ok":true,...}`.
- Submit the Join form on the live site → a `Join` tab appears with a row.
- Submit an event registration → a tab for that event appears with a row.

## Notes

- Before the env var is set, forms still work on the site but **don't** send
  data (demo mode) — so nothing breaks while you set this up.
- To add fields later, just change the form; new fields show up as new columns
  automatically (no script edit needed).
- If you ever change the script, **create a new deployment version** (or
  "Manage deployments → edit → new version") for changes to take effect.
- The endpoint is a public write URL by design. It only ever appends rows; it
  can't read your sheet back out.
