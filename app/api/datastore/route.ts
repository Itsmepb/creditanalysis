import { NextRequest, NextResponse } from "next/server";

// Fresh in-memory store — clears on every server restart
const store: Record<string, Record<string, unknown>> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = (searchParams.get("entityId") || "").toUpperCase();
  return NextResponse.json({ data: store[entityId] ?? null });
}

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json();
    const entityId = (body.entityId || "").toUpperCase();
    store[entityId] = body.data;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}