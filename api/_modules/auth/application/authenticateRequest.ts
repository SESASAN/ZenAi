import { extractBearerToken } from "../../shared/http/bearerToken.js";
import { getHeader, type HttpRequest } from "../../shared/http/types.js";
import { AuthRequiredError } from "../domain/auth.errors.js";
import type { TokenVerifier, VerifiedUser } from "../domain/auth.types.js";

export async function authenticateRequest(req: HttpRequest, verifyToken: TokenVerifier): Promise<VerifiedUser> {
  const token = extractBearerToken(getHeader(req, "authorization"));
  if (!token) throw new AuthRequiredError();
  return verifyToken(token);
}
