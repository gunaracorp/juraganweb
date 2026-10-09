// Marker for static export compatibility (no-op in dev/standalone)
export const dynamic = "force-static";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}