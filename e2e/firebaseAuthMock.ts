import type { Page, Route } from "@playwright/test"

type FakeUser = { uid: string; email: string; password: string; displayName?: string }

const PROJECT_ID = "zenai-e2e"

function base64url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

/** Unsigned JWT with the claims the Firebase JS SDK reads. The e2e API server trusts `user_id`. */
export function fakeIdToken(user: FakeUser) {
  const now = Math.floor(Date.now() / 1000)
  return [
    base64url({ alg: "RS256", typ: "JWT", kid: "e2e" }),
    base64url({
      iss: `https://securetoken.google.com/${PROJECT_ID}`,
      aud: PROJECT_ID,
      auth_time: now,
      user_id: user.uid,
      sub: user.uid,
      iat: now,
      exp: now + 3600,
      email: user.email,
      email_verified: false,
      ...(user.displayName ? { name: user.displayName } : {}),
      firebase: { identities: { email: [user.email] }, sign_in_provider: "password" },
    }),
    "e2e-signature",
  ].join(".")
}

function accountInfo(user: FakeUser) {
  return {
    localId: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: false,
    providerUserInfo: [{ providerId: "password", email: user.email, federatedId: user.email, rawId: user.email, displayName: user.displayName }],
    lastLoginAt: String(Date.now()),
    createdAt: String(Date.now()),
  }
}

function session(user: FakeUser) {
  return {
    kind: "identitytoolkit#VerifyPasswordResponse",
    localId: user.uid,
    email: user.email,
    displayName: user.displayName ?? "",
    idToken: fakeIdToken(user),
    refreshToken: `refresh-${user.uid}`,
    expiresIn: "3600",
    registered: true,
  }
}

/**
 * Emulates the Firebase Auth REST API (identitytoolkit/securetoken) inside the browser,
 * so e2e tests run without a real Firebase project.
 */
export async function mockFirebaseAuth(page: Page, initialUsers: FakeUser[] = []) {
  const users = new Map(initialUsers.map((u) => [u.email, u]))
  const byUid = () => new Map([...users.values()].map((u) => [u.uid, u]))
  let nextUid = 1

  const reply = (route: Route, status: number, body: unknown) =>
    route.fulfill({
      status,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*" },
      body: JSON.stringify(body),
    })

  const error = (route: Route, message: string) => reply(route, 400, { error: { code: 400, message, errors: [{ message }] } })

  const userFromToken = (token: string | undefined) => {
    try {
      const payload = JSON.parse(Buffer.from(token?.split(".")[1] ?? "", "base64url").toString())
      return byUid().get(payload.user_id)
    } catch {
      return undefined
    }
  }

  await page.route(/https:\/\/(identitytoolkit|securetoken)\.googleapis\.com\/.*/, async (route) => {
    const request = route.request()
    if (request.method() === "OPTIONS") return reply(route, 204, {})

    const url = new URL(request.url())
    const body = (() => {
      try {
        return request.postDataJSON() ?? {}
      } catch {
        return Object.fromEntries(new URLSearchParams(request.postData() ?? ""))
      }
    })()

    if (url.pathname.endsWith("accounts:signUp")) {
      if (users.has(body.email)) return error(route, "EMAIL_EXISTS")
      const user = { uid: `e2e-user-${nextUid++}`, email: body.email, password: body.password }
      users.set(user.email, user)
      return reply(route, 200, session(user))
    }

    if (url.pathname.endsWith("accounts:signInWithPassword")) {
      const user = users.get(body.email)
      if (!user || user.password !== body.password) return error(route, "INVALID_LOGIN_CREDENTIALS")
      return reply(route, 200, session(user))
    }

    if (url.pathname.endsWith("accounts:lookup")) {
      const user = userFromToken(body.idToken)
      if (!user) return error(route, "INVALID_ID_TOKEN")
      return reply(route, 200, { kind: "identitytoolkit#GetAccountInfoResponse", users: [accountInfo(user)] })
    }

    if (url.pathname.endsWith("accounts:update")) {
      const user = userFromToken(body.idToken)
      if (!user) return error(route, "INVALID_ID_TOKEN")
      if (typeof body.displayName === "string") user.displayName = body.displayName
      return reply(route, 200, { ...accountInfo(user), idToken: fakeIdToken(user), refreshToken: `refresh-${user.uid}`, expiresIn: "3600" })
    }

    if (url.hostname === "securetoken.googleapis.com") {
      const uid = String(body.refresh_token ?? "").replace("refresh-", "")
      const user = byUid().get(uid)
      if (!user) return error(route, "INVALID_REFRESH_TOKEN")
      return reply(route, 200, {
        access_token: fakeIdToken(user),
        id_token: fakeIdToken(user),
        refresh_token: `refresh-${uid}`,
        expires_in: "3600",
        token_type: "Bearer",
        user_id: uid,
        project_id: PROJECT_ID,
      })
    }

    // e.g. recaptchaConfig / projects config: not needed for email+password.
    return reply(route, 200, {})
  })

  return { users }
}
