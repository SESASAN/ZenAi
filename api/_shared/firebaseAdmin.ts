import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

type ServiceAccount = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

export function parseServiceAccount(raw: string | undefined): ServiceAccount | null {
  const value = raw?.trim();
  if (!value) return null;

  const jsonText = value.startsWith("{") ? value : Buffer.from(value, "base64").toString("utf8");
  const parsed = JSON.parse(jsonText) as ServiceAccount;

  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  return parsed;
}

let db: Firestore | undefined;

/** Lazily initialized so importing this module never requires credentials (e.g. in tests). */
export function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (serviceAccount?.client_email && serviceAccount.private_key) {
    return initializeApp({
      credential: cert(serviceAccount as never),
      projectId: serviceAccount.project_id,
    });
  }

  // Fallback: Application Default Credentials (e.g. GOOGLE_APPLICATION_CREDENTIALS).
  return initializeApp();
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
}
