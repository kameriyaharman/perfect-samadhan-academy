/** Redirect using a relative Location (works behind proxies) — absolute URLs pass through unchanged. */
export function go(path: string, status = 302) {
  return new Response(null, { status, headers: { Location: path, "Cache-Control": "no-store" } });
}
