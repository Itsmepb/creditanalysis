import { NextRequest, NextResponse } from "next/server";
import { STATEMENTS, FinancialRow } from "@/lib/data";

const VALUE_COLUMNS: Record<string, string> = {
  revenue:             "Revenue",
  ebitda:              "EBITDA",
  net_income:          "Net Income",
  total_assets:        "Total Assets",
  total_liabilities:   "Total Liabilities",
  total_equity:        "Total Equity",
  interest_expense:    "Interest Expense",
  operating_cashflow:  "Operating Cash Flow",
  gross_margin:        "Gross Margin",
  net_margin:          "Net Margin",
  debt_ratio:          "Debt Ratio",
  interest_coverage:   "Interest Coverage",
  benchmark:           "Benchmark",
  variance:            "Variance",
  status:              "Status",
};

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

    let statement;

    if (!spreadLabel) {
      // No filter → fetch first statement for this entity
      statement = STATEMENTS.find((s) => s.entityId === entityId);
    } else {
      // spreadLabel = "statement_year · spread_name"
      const separatorIndex = spreadLabel.indexOf(" · ");
      const statementYear  = spreadLabel.substring(0, separatorIndex).trim();
      const spreadName     = spreadLabel.substring(separatorIndex + 3).trim();

      statement = STATEMENTS.find(
        (s) =>
          s.entityId      === entityId &&
          s.statementYear === statementYear &&
          s.spreadName    === spreadName
      );
    }

    if (!statement) {
      return NextResponse.json(
        { error: `No statement found for "${entityId}".` },
        { status: 404 }
      );
    }

    const dbRows = statement.rows;

    // Build columns — only show columns with at least one value
    const columns: { key: string; label: string }[] = [
      { key: "metric", label: "Metric" },
    ];

    Object.entries(VALUE_COLUMNS).forEach(([col, label]) => {
      const hasValue = dbRows.some((row) => {
        const val = (row as Record<string, string | undefined>)[col];
        return val !== null && val !== undefined && val !== "";
      });
      if (hasValue) {
        columns.push({ key: col, label });
      }
    });

    // Build rows
    const rows = dbRows.map((dbRow: FinancialRow) => {
      const tableRow: Record<string, string> = {
        metric: dbRow.metric ?? "—",
      };
      columns.forEach((col) => {
        if (col.key !== "metric") {
          const val = (dbRow as Record<string, string | undefined>)[col.key];
          tableRow[col.key] = val ?? "—";
        }
      });
      return tableRow;
    });

    const filterLabel = `${statement.statementYear} · ${statement.spreadName}`;

    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json({
      columns,
      rows,
      statementType: statement.spreadName,
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