import { NextRequest, NextResponse } from "next/server";
import { DATA } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body        = await req.json();
    const entityId    = (body.entityId || "").toUpperCase().trim();
    const spreadLabel = body.filterValue ?? null;

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    const record = DATA[entityId];

    if (!record) {
      return NextResponse.json(
        { error: `Entity "${entityId}" not found.` },
        { status: 404 }
      );
    }

    // No filter → use first available statement
    const key = spreadLabel
      ? spreadLabel
      : Object.keys(record.statements)[0];

    const statement = record.statements[key];

    if (!statement) {
      return NextResponse.json(
        { error: `No statement found for "${entityId}" with spread "${key}".` },
        { status: 404 }
      );
    }

    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json({
      columns:       statement.columns,
      rows:          statement.rows,
      statementType: key,
      filterLabel:   key,
    });

  } catch (error) {
    console.error("Statement error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statement" },
      { status: 500 }
    );
  }
}