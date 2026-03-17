import { NextRequest, NextResponse } from "next/server";
import { ENTITY_DATA } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body        = await req.json();
    const entityId    = (body.entityId || "").toUpperCase().trim();
    const filterValue = body.filterValue ?? null;

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    const entityData = ENTITY_DATA[entityId];
    if (!entityData) {
      return NextResponse.json(
        { error: `Entity "${entityId}" not found.` },
        { status: 404 }
      );
    }

    // Find table by shape
    const tableKey = Object.keys(entityData).find((k) => {
      const val = entityData[k];
      return (
        typeof val === "object" &&
        val !== null &&
        "columns" in val &&
        "rows" in val &&
        Array.isArray((val as Record<string, unknown>).columns) &&
        Array.isArray((val as Record<string, unknown>).rows)
      );
    });

    if (!tableKey) {
      return NextResponse.json(
        { error: `No table found for "${entityId}".` },
        { status: 404 }
      );
    }

    const tableData = entityData[tableKey] as {
      columns: { key: string; label: string }[];
      rows:    Record<string, string>[];
    };

    // Filter rows if filterValue provided
    const filteredRows = filterValue
      ? tableData.rows.filter((row) =>
          Object.values(row).includes(filterValue)
        )
      : tableData.rows;

    return NextResponse.json({
      columns: tableData.columns,
      rows:    filteredRows,
    });

  } catch (error) {
    console.error("Statement error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statement" },
      { status: 500 }
    );
  }
}