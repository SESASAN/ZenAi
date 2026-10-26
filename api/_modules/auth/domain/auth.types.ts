export type VerifiedUser = { uid: string };

export type TokenVerifier = (idToken: string) => Promise<VerifiedUser>;
