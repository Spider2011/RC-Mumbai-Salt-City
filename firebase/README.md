# Director Portal — Firebase

A hidden portal at **`/director`** (not linked anywhere, marked `noindex`).

| Access | Who | Can |
|---|---|---|
| **director** | Avenue directors | Submit reports; see their own and their avenue's reports |
| **core** | The core team (website Team page) | See every report, submit reports, use the **Project tracker** |
| **admin** | President, Secretary (core + `isAdmin`) | Everything above, plus delete reports |

Everything runs on the free **Spark** plan. The website talks to Firebase only
from its server (Admin SDK); browsers never get a key or direct database access,
and `firestore.rules` denies all client access.

## Environment variables (Vercel → Settings → Environment Variables, and `.env.local`)

| Name | From |
|---|---|
| `FIREBASE_WEB_API_KEY` | Firebase → Settings → General → Your apps → web app → `apiKey` |
| `FIREBASE_PROJECT_ID` | Service account JSON → `project_id` |
| `FIREBASE_CLIENT_EMAIL` | Service account JSON → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Service account JSON → `private_key` |

None of them start with `NEXT_PUBLIC_`, so Next.js never puts them in browser code.
Never commit `.env.local`, the service account JSON, or the logins spreadsheet.

## Adding or changing a person

```bash
node --env-file=.env.local scripts/firebase/add-member.mjs --email first.last@rcmsc.club --name "Rtr. First Last" --role director --avenue "Club Service"
node --env-file=.env.local scripts/firebase/add-member.mjs --email first.last@rcmsc.club --name "Rtr. First Last" --role core
```

Add `--admin` for the President / Secretary and `--password <pw>` to set a password;
otherwise a new person gets a random one, printed once. Members can change their
own password with the **Password** button in the portal.

## Where things live (Firestore)

- `members/{uid}` — name, role, avenue, isAdmin
- `reports/{id}` — project reports
- `files/{id}` + `files/{id}/chunks/*` — report photos and documents (Spark has no
  Cloud Storage, so files are stored in 700 KB chunks; the free plan allows 1 GiB)
- `tracker/plan` — the core team's project tracker (one document)

## History

Moved from Supabase on 22 Oct 2026 with `scripts/firebase/migrate-from-supabase.mjs`
(logins kept their passwords via bcrypt hash import).
