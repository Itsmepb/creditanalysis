import { NextRequest, NextResponse } from "next/server";
import { ENTITY_DATA } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get("entityId");

  if (!entityId) {
    return NextResponse.json(
      { error: "entityId is required" },
      { status: 400 }
    );
  }

  const data = ENTITY_DATA[entityId.toUpperCase().trim()];

  if (!data) {
    return NextResponse.json(
      { error: `"${entityId}" not found. Try ENT-001 to ENT-010.` },
      { status: 404 }
    );
  }

  // Return raw JSON as-is — UI renders whatever comes back
  return NextResponse.json(data);
}