import { adminAuth } from "../../../_shared/firebaseAdmin.js";
import { InvalidTokenError } from "../domain/auth.errors.js";

type DecodedToken = {
  uid: string;
};

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedToken> {
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch {
    throw new InvalidTokenError();
  }
}

