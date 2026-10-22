// TEMPORARY diagnostic — remove after reading. Reports only presence/shape of settings, never values.
export const dynamic = 'force-dynamic';

const short = (e: unknown) => String(e instanceof Error ? `${e.name}: ${e.message}` : e).slice(0, 400);

export async function GET() {
  const pk = process.env.FIREBASE_PRIVATE_KEY ?? '';
  const out: Record<string, unknown> = {
    node: process.version,
    settings: Object.fromEntries(
      ['FIREBASE_WEB_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'].map((k) => [k, process.env[k] ? `set (${process.env[k]!.length} chars)` : 'MISSING']),
    ),
    privateKeyShape: { startsWithQuote: pk.startsWith('"'), hasBeginLine: pk.includes('BEGIN PRIVATE KEY'), literalBackslashN: pk.includes('\\n'), realNewlines: pk.includes('\n') },
  };
  try {
    const { createPrivateKey } = await import('node:crypto');
    createPrivateKey(pk.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n'));
    out.privateKeyParses = true;
  } catch {
    out.privateKeyParses = false;
  }
  try { await import('server-only'); out.serverOnly = 'ok'; } catch (e) { out.serverOnly = short(e); }
  try { await import('firebase-admin/app'); out.adminApp = 'ok'; } catch (e) { out.adminApp = short(e); }
  try { await import('firebase-admin/auth'); out.adminAuthMod = 'ok'; } catch (e) { out.adminAuthMod = short(e); }
  try { await import('firebase-admin/firestore'); out.adminFirestoreMod = 'ok'; } catch (e) { out.adminFirestoreMod = short(e); }
  try { const m = await import('@/lib/firebase/admin'); m.adminAuth(); m.db(); out.init = 'ok'; } catch (e) { out.init = short(e); }
  try { const m = await import('@/lib/director/dal'); out.dal = typeof m.getMemberOrNull; } catch (e) { out.dal = short(e); }
  return Response.json(out, { headers: { 'Cache-Control': 'no-store' } });
}
