import { NextResponse } from "next/server";
import { ENTITIES, STATEMENTS } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    success:    true,
    entities:   Object.keys(ENTITIES).length,
    statements: STATEMENTS.length,
    message:    "Data loaded from local file — no database needed",
  });
}