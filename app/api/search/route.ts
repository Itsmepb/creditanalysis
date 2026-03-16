import { NextRequest, NextResponse } from "next/server";
import { DATA } from "@/lib/data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    const record = DATA[entityId.toUpperCase().trim()];

    if (!record) {
      return NextResponse.json(
        { error: `Entity "${entityId}" not found.` },
        { status: 404 }
      );
    }

    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json(record.entity);

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entity" },
      { status: 500 }
    );
  }
}