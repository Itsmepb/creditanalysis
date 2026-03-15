import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const VALUE_COLUMNS: Record<string, string> = {
  revenue:            "Revenue",
  ebitda:             "EBITDA",
  net_income:         "Net Income",
  total_assets:       "Total Assets",
  total_liabilities:  "Total Liabilities",
  total_equity:       "Total Equity",
  interest_expense:   "Interest Expense",
  operating_cashflow: "Operating Cash Flow",
  gross_margin:       "Gross Margin",
  net_margin:         "Net Margin",
  debt_ratio:         "Debt Ratio",
  interest_coverage:  "Interest Coverage",
  benchmark:          "Benchmark",
  variance:           "Variance",
  status:             "Status",
};

type DbRow = Record<string, string | null>;

export async function POST(req: NextRequest) {
  try {
    const body        = await req.json();
    const entityId    = (body.entityId  || "").toUpperCase().trim();
    const spreadLabel = body.filterValue ?? null;

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    let result;

    if (!spreadLabel) {
      result = await pool.query(
        `SELECT *
         FROM financial_statements
         WHERE entity_id = $1
         ORDER BY statement_year DESC, spread_name ASC, id ASC`,
        [entityId]
      );
    } else {
      const separatorIndex = spreadLabel.indexOf(" · ");
      const statementYear  = spreadLabel.substring(0, separatorIndex).trim();
      const spreadName     = spreadLabel.substring(separatorIndex + 3).trim();

      result = await pool.query(
        `SELECT *
         FROM financial_statements
         WHERE entity_id      = $1
           AND statement_year = $2
           AND spread_name    = $3
         ORDER BY id ASC`,
        [entityId, statementYear, spreadName]
      );
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: `No statement found for "${entityId}".` },
        { status: 404 }
      );
    }

    const dbRows: DbRow[] = result.rows;

    const columns: { key: string; label: string }[] = [
      { key: "metric", label: "Metric" },
    ];

    Object.entries(VALUE_COLUMNS).forEach(([col, label]) => {
      const hasValue = dbRows.some(
        (row) =>
          row[col] !== null &&
          row[col] !== undefined &&
          row[col] !== ""
      );
      if (hasValue) {
        columns.push({ key: col, label });
      }
    });

    const rows = dbRows.map((dbRow) => {
      const tableRow: Record<string, string> = {
        metric: dbRow["metric"] ?? "—",
      };
      columns.forEach((col) => {
        if (col.key !== "metric") {
          tableRow[col.key] = dbRow[col.key] ?? "—";
        }
      });
      return tableRow;
    });

    const firstRow    = dbRows[0];
    const filterLabel = `${firstRow["statement_year"]} · ${firstRow["spread_name"]}`;

    return NextResponse.json({
      columns,
      rows,
      statementType: firstRow["spread_name"] ?? "",
      filterLabel,
    });

  } catch (error) {
    console.error("Statement error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statement" },
      { status: 500 }
    );
  }
}