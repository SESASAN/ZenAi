import { getAdminAuth } from "../../../_shared/firebaseAdmin.js";
import { InvalidTokenError } from "../domain/auth.errors.js";
import type { VerifiedUser } from "../domain/auth.types.js";

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedUser> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch {
    throw new InvalidTokenError();
  }
}
