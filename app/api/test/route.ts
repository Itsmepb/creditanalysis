import { NextResponse } from "next/server";
import { ENTITY_DATA } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    success:    true,
    entities:   Object.keys(ENTITY_DATA).length,
    entityList: Object.keys(ENTITY_DATA),
    message:    "Data loaded from local file — no database needed",
  });
}