import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { one } from "./db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "psa-default-secret-change-me");
export const COOKIE = "psa_token";

export type SessionUser = {
  id: number; name: string; mobile: string; email: string | null; role: string; city: string | null;
  target_exam: string | null; exam_date: string | null; premium_plan: string | null; premium_till: string | null;
};

export async function signToken(userId: number) {
  return new SignJWT({ uid: userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret);
}

export async function getUser(): Promise<SessionUser | null> {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret);
    const u = await one<SessionUser & { blocked: boolean }>(
      "SELECT id,name,mobile,email,role,city,target_exam,exam_date,premium_plan,premium_till,blocked FROM users WHERE id=$1",
      [payload.uid]
    );
    if (!u || u.blocked) return null;
    return u;
  } catch {
    return null;
  }
}

export function isPremium(u: SessionUser | null) {
  if (!u) return false;
  if (u.role === "admin") return true;
  return !!u.premium_till && new Date(u.premium_till).getTime() > Date.now();
}

export async function requireAdmin() {
  const u = await getUser();
  if (!u || u.role !== "admin") return null;
  return u;
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
