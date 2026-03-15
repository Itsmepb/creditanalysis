import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const METRIC_COLUMNS: Record<string, string> = {
  credit_rating:      "Credit Rating",
  risk_score:         "Risk Score",
  debt_ratio:         "Debt Ratio",
  revenue_growth:     "Revenue Growth",
  ebitda_margin:      "EBITDA Margin",
  interest_coverage:  "Interest Coverage",
  current_ratio:      "Current Ratio",
  quick_ratio:        "Quick Ratio",
  net_margin:         "Net Margin",
  asset_turnover:     "Asset Turnover",
  npl_ratio:          "NPL Ratio",
  capital_adequacy:   "Capital Adequacy",
  roe:                "ROE",
  loan_to_deposit:    "Loan to Deposit",
  nav_growth:         "NAV Growth",
  occupancy_rate:     "Occupancy Rate",
  loan_to_value:      "Loan to Value",
  wale:               "WALE",
  distribution_yield: "Distribution Yield",
  gdp_growth:         "GDP Growth",
  fiscal_deficit:     "Fiscal Deficit",
  debt_to_gdp:        "Debt to GDP",
  foreign_reserves:   "Foreign Reserves",
};

function getType(col: string, value: string): "good" | "warn" | "bad" {
  if (col === "credit_rating") {
    if (["AAA","AA+","AA","AA-","A+","A","A-"].includes(value)) return "good";
    if (["BBB+","BBB","BBB-"].includes(value)) return "warn";
    return "bad";
  }
  if (col === "risk_score") {
    const n = parseInt(value);
    if (n <= 30) return "good";
    if (n <= 60) return "warn";
    return "bad";
  }
  if (typeof value === "string" && value.startsWith("+")) return "good";
  if (typeof value === "string" && value.startsWith("-")) return "bad";
  return "warn";
}

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

    const id = entityId.toUpperCase().trim();

    const entityResult = await pool.query(
      `SELECT * FROM entity_master WHERE entity_id = $1`,
      [id]
    );

    if (entityResult.rows.length === 0) {
      return NextResponse.json(
        { error: `Entity "${entityId}" not found.` },
        { status: 404 }
      );
    }

    const row = entityResult.rows[0] as Record<string, string | null>;

    const overview = Object.entries(METRIC_COLUMNS)
      .filter(([col]) => {
        const val = row[col];
        return val !== null && val !== undefined && val !== "";
      })
      .map(([col, label]) => ({
        label,
        value: row[col] as string,
        type:  getType(col, row[col] as string),
      }));

    const spreadResult = await pool.query(
      `SELECT DISTINCT
         statement_year || ' · ' || spread_name AS "spreadLabel"
       FROM financial_statements
       WHERE entity_id = $1
       ORDER BY "spreadLabel" DESC`,
      [id]
    );

    const spreadCount = spreadResult.rows.length;

    const filters =
      spreadCount > 1
        ? [
            {
              key:     "spread",
              label:   "Financial Spread",
              options: spreadResult.rows.map(
                (r: Record<string, string>) => r["spreadLabel"]
              ),
            },
          ]
        : [];

    return NextResponse.json({
      entityId:   row["entity_id"],
      entityName: row["entity_name"],
      entityType: row["entity_type"],
      industry:   row["industry"],
      country:    row["country"],
      overview,
      filters,
    });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch entity" },
      { status: 500 }
    );
  }
}