import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const adminApp = getApps()[0] ?? initializeApp();

export const adminDb = getFirestore(adminApp);
