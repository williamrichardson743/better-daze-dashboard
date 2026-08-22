import * as jose from "jose";
import { env } from "../lib/env.js";

type SessionPayload = {
  unionId: string;
  clientId: string;
};

const JWT_ALG = "HS256";

function sessionSecret() {
  if (!env.sessionSecret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return new TextEncoder().encode(env.sessionSecret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(sessionSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, sessionSecret(), {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) return null;
    return { unionId: String(unionId), clientId: String(clientId) };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
