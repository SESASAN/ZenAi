import {
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

let authStateListener: ((user: User | null) => void) | null = null;

export function subscribeToAuthState(callback: (user: User | null) => void) {
  authStateListener = callback;
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithGithub() {
  return signInWithPopup(auth, githubProvider);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
    // Force refresh to update the auth state
    await userCredential.user.reload();
    const currentUser = auth.currentUser;
    if (currentUser && authStateListener) {
      authStateListener(currentUser);
    }
  }
  
  return userCredential;
}

export async function signOutUser() {
  return signOut(auth);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function updateDisplayName(displayName: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No hay una sesión activa.");
  await updateProfile(currentUser, { displayName });
  await currentUser.reload();
  if (auth.currentUser && authStateListener) authStateListener(auth.currentUser);
}

export async function deleteCurrentUser() {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No hay una sesión activa.");
  await deleteUser(currentUser);
}
