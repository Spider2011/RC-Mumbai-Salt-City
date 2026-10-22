// Add a portal login, or update someone's role / avenue / password.
//
//   node --env-file=.env.local scripts/firebase/add-member.mjs \
//     --email rtr.name@example.com --name "Rtr. Full Name" --role director --avenue "Club Service"
//
//   --role core          core team: sees every report and the project tracker (avenue optional)
//   --admin              President / Secretary: may also delete reports
//   --password <pw>      set this password (otherwise a new person gets a random one, printed once)
import { randomBytes } from 'node:crypto';
import { AVENUES, arg, auth, db } from './_admin.mjs';

const email = arg('email');
const name = arg('name');
const role = arg('role', 'director');
const avenue = arg('avenue', '');
const password = arg('password');
const isAdmin = arg('admin') === true;

const fail = (msg) => { console.error(msg); process.exit(1); };
if (typeof email !== 'string' || !email.includes('@')) fail('Pass --email');
if (typeof name !== 'string') fail('Pass --name "Rtr. Full Name"');
if (role !== 'director' && role !== 'core') fail('--role must be director or core');
if (role === 'director' && !AVENUES.includes(avenue)) fail(`Directors need --avenue, one of:\n  ${AVENUES.join('\n  ')}`);
if (avenue && !AVENUES.includes(avenue)) fail(`Unknown avenue "${avenue}"`);
if (password !== undefined && (typeof password !== 'string' || password.length < 8)) fail('--password must be at least 8 characters');

let user = await auth.getUserByEmail(email).catch(() => null);
let tempPassword = null;
if (user) {
  if (typeof password === 'string') await auth.updateUser(user.uid, { password });
  console.log(`Updated ${email}`);
} else {
  tempPassword = typeof password === 'string' ? null : randomBytes(9).toString('base64url');
  user = await auth.createUser({ email, password: password || tempPassword, displayName: name, emailVerified: true });
  console.log(`Created ${email}`);
}

await db.collection('members').doc(user.uid).set({ fullName: name, role, avenue: avenue || '', isAdmin, email });
console.log(`  ${name} · ${role}${avenue ? ` · ${avenue}` : ''}${isAdmin ? ' · admin' : ''}`);
if (tempPassword) console.log(`  Temporary password: ${tempPassword}  (share it privately; they can change it in the portal)`);
await db.terminate();
