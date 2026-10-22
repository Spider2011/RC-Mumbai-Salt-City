/**
 * Firebase connection details for the director portal, read from the
 * environment. Everything runs on the server (Admin SDK + the Auth REST API),
 * so none of these are exposed to the browser.
 *
 * Local testing against the Firebase Emulator Suite only needs
 * FIREBASE_PROJECT_ID plus FIREBASE_AUTH_EMULATOR_HOST / FIRESTORE_EMULATOR_HOST.
 */
export function usingEmulators(): boolean {
  return Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
}

export function isFirebaseConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) return false;
  if (usingEmulators()) return true;
  return Boolean(
    process.env.FIREBASE_WEB_API_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}
