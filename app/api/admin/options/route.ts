import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { includeOptions } from "@/lib/access";

export const dynamic = "force-dynamic";
// Admin forms: lesson folders dropdown, test series list, plan "kya unlock hoga" picker
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(await includeOptions());
}
