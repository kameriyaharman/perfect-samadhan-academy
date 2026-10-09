import { NextRequest, NextResponse } from "next/server";

// Demo access gate: har visitor ko site dekhne se pehle ek baar code dalna hoga.
// Code env var DEMO_PASSWORD se aata hai (default 8654). Gate band karne ke liye DEMO_GATE=off set karein.
export const DEMO_COOKIE = "psa_demo_access";

async function tokenFor(password: string) {
  const data = new TextEncoder().encode(`psa-demo:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const OPEN_PATHS = ["/demo-lock", "/api/demo-unlock"];

export async function middleware(req: NextRequest) {
  if (process.env.DEMO_GATE === "off") return NextResponse.next();

  const { pathname, search } = req.nextUrl;
  if (OPEN_PATHS.includes(pathname)) return NextResponse.next();

  const expected = await tokenFor(process.env.DEMO_PASSWORD || "8654");
  if (req.cookies.get(DEMO_COOKIE)?.value === expected) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Demo access code required" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/demo-lock";
  url.search = "";
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // Static assets, Next internals aur logo/favicon gate se bahar rahenge
  matcher: ["/((?!_next/|favicon\\.png|apple-touch-icon\\.png|logo\\.png|robots\\.txt).*)"],
};
