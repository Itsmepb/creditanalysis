import { NextRequest, NextResponse } from "next/server";

type Column = { key: string; label: string };
type Row    = Record<string, string>;

type StatementResult = {
  columns: Column[];
  rows:    Row[];
};

const financialDB: Record<string, Record<string, StatementResult>> = {

  "ENT-001": {
    default: {
      columns: [
        { key: "metric", label: "Metric"  },
        { key: "fy2024", label: "FY 2024" },
        { key: "fy2023", label: "FY 2023" },
      ],
      rows: [
        { metric: "Revenue",           fy2024: "$5.2M", fy2023: "$4.5M" },
        { metric: "EBITDA",            fy2024: "$1.7M", fy2023: "$1.5M" },
        { metric: "Net Income",        fy2024: "$1.0M", fy2023: "$0.8M" },
        { metric: "Total Assets",      fy2024: "$8.9M", fy2023: "$7.6M" },
        { metric: "Total Liabilities", fy2024: "$2.7M", fy2023: "$2.5M" },
        { metric: "Total Equity",      fy2024: "$6.1M", fy2023: "$5.1M" },
      ],
    },
  },

  "ENT-002": {
    // statementDate + currency combined key
    "2024-06-30_GBP": {
      columns: [
        { key: "metric",   label: "Banking Metric" },
        { key: "value",    label: "Value (GBP)"    },
        { key: "variance", label: "Variance %"     },
        { key: "rating",   label: "Rating"         },
      ],
      rows: [
        { metric: "Net Interest Income",  value: "£3.1M",  variance: "+6.2%",  rating: "Strong" },
        { metric: "Total Loans",          value: "£18.5M", variance: "+7.6%",  rating: "Stable" },
        { metric: "Non-Performing Loans", value: "£0.9M",  variance: "+19.5%", rating: "Watch"  },
        { metric: "Total Deposits",       value: "£22.0M", variance: "+7.3%",  rating: "Strong" },
        { metric: "Tier 1 Capital",       value: "£4.2M",  variance: "+7.7%",  rating: "Strong" },
        { metric: "Operating Expenses",   value: "£1.8M",  variance: "+6.3%",  rating: "Stable" },
      ],
    },
    "2024-06-30_USD": {
      columns: [
        { key: "metric",   label: "Banking Metric" },
        { key: "value",    label: "Value (USD)"    },
        { key: "variance", label: "Variance %"     },
        { key: "rating",   label: "Rating"         },
      ],
      rows: [
        { metric: "Net Interest Income",  value: "$3.9M",  variance: "+6.2%",  rating: "Strong" },
        { metric: "Total Loans",          value: "$23.5M", variance: "+7.6%",  rating: "Stable" },
        { metric: "Non-Performing Loans", value: "$1.2M",  variance: "+19.5%", rating: "Watch"  },
        { metric: "Total Deposits",       value: "$27.9M", variance: "+7.3%",  rating: "Strong" },
        { metric: "Tier 1 Capital",       value: "$5.3M",  variance: "+7.7%",  rating: "Strong" },
        { metric: "Operating Expenses",   value: "$2.3M",  variance: "+6.3%",  rating: "Stable" },
      ],
    },
    "2023-06-30_GBP": {
      columns: [
        { key: "metric",   label: "Banking Metric" },
        { key: "value",    label: "Value (GBP)"    },
        { key: "variance", label: "Variance %"     },
        { key: "rating",   label: "Rating"         },
      ],
      rows: [
        { metric: "Net Interest Income",  value: "£2.9M",  variance: "+5.1%", rating: "Stable" },
        { metric: "Total Loans",          value: "£17.2M", variance: "+4.9%", rating: "Stable" },
        { metric: "Non-Performing Loans", value: "£0.8M",  variance: "+8.2%", rating: "Watch"  },
        { metric: "Total Deposits",       value: "£20.5M", variance: "+5.1%", rating: "Stable" },
        { metric: "Tier 1 Capital",       value: "£3.9M",  variance: "+5.4%", rating: "Strong" },
        { metric: "Operating Expenses",   value: "£1.7M",  variance: "+4.8%", rating: "Stable" },
      ],
    },
    "2023-06-30_USD": {
      columns: [
        { key: "metric",   label: "Banking Metric" },
        { key: "value",    label: "Value (USD)"    },
        { key: "variance", label: "Variance %"     },
        { key: "rating",   label: "Rating"         },
      ],
      rows: [
        { metric: "Net Interest Income",  value: "$3.7M",  variance: "+5.1%", rating: "Stable" },
        { metric: "Total Loans",          value: "$21.8M", variance: "+4.9%", rating: "Stable" },
        { metric: "Non-Performing Loans", value: "$1.0M",  variance: "+8.2%", rating: "Watch"  },
        { metric: "Total Deposits",       value: "$26.0M", variance: "+5.1%", rating: "Stable" },
        { metric: "Tier 1 Capital",       value: "$5.0M",  variance: "+5.4%", rating: "Strong" },
        { metric: "Operating Expenses",   value: "$2.2M",  variance: "+4.8%", rating: "Stable" },
      ],
    },
  },

  "ENT-003": {
    "Management Accounts": {
      columns: [
        { key: "metric",    label: "Metric"             },
        { key: "actual",    label: "Actual"             },
        { key: "benchmark", label: "Industry Benchmark" },
        { key: "status",    label: "Status"             },
      ],
      rows: [
        { metric: "Revenue",           actual: "₹850K", benchmark: "₹1.2M", status: "Below Benchmark" },
        { metric: "EBITDA",            actual: "₹83K",  benchmark: "₹180K", status: "Below Benchmark" },
        { metric: "Net Income",        actual: "₹12K",  benchmark: "₹96K",  status: "Critical"        },
        { metric: "Total Assets",      actual: "₹620K", benchmark: "₹900K", status: "Below Benchmark" },
        { metric: "Total Liabilities", actual: "₹471K", benchmark: "₹450K", status: "Above Benchmark" },
        { metric: "Total Equity",      actual: "₹148K", benchmark: "₹450K", status: "Critical"        },
        { metric: "Interest Expense",  actual: "₹94K",  benchmark: "₹54K",  status: "Above Benchmark" },
      ],
    },
    "Unaudited": {
      columns: [
        { key: "metric", label: "Metric" },
        { key: "status", label: "Status" },
      ],
      rows: [
        { metric: "Revenue",           status: "Critical"        },
        { metric: "EBITDA",            status: "Critical"        },
        { metric: "Net Income",        status: "Critical"        },
        { metric: "Total Assets",      status: "Below Benchmark" },
        { metric: "Total Liabilities", status: "Above Benchmark" },
        { metric: "Total Equity",      status: "Critical"        },
        { metric: "Interest Expense",  status: "Above Benchmark" },
      ],
    },
  },

  "ENT-004": {
    "2024": {
      columns: [
        { key: "metric",    label: "Sovereign Metric" },
        { key: "value",     label: "Actual 2024"      },
        { key: "imf",       label: "IMF Benchmark"    },
        { key: "deviation", label: "Deviation"        },
        { key: "outlook",   label: "Outlook"          },
      ],
      rows: [
        { metric: "GDP (USD Bn)",           value: "$285B",  imf: "$275B",  deviation: "+3.6%",  outlook: "Positive" },
        { metric: "Government Revenue",     value: "$68.4M", imf: "$65.0M", deviation: "+5.2%",  outlook: "Stable"   },
        { metric: "Government Expenditure", value: "$74.4M", imf: "$70.0M", deviation: "+6.3%",  outlook: "Watch"    },
        { metric: "Public Debt",            value: "$149M",  imf: "$140M",  deviation: "+6.7%",  outlook: "Watch"    },
        { metric: "Foreign Reserves",       value: "$42.5M", imf: "$38.0M", deviation: "+11.8%", outlook: "Positive" },
        { metric: "Current Account",        value: "$5.7M",  imf: "$4.5M",  deviation: "+26.7%", outlook: "Positive" },
      ],
    },
    "2023": {
      columns: [
        { key: "metric",    label: "Sovereign Metric" },
        { key: "value",     label: "Actual 2023"      },
        { key: "imf",       label: "IMF Benchmark"    },
        { key: "deviation", label: "Deviation"        },
      ],
      rows: [
        { metric: "GDP (USD Bn)",           value: "$274B",  imf: "$265B",  deviation: "+3.4%"  },
        { metric: "Government Revenue",     value: "$63.1M", imf: "$61.0M", deviation: "+3.4%"  },
        { metric: "Government Expenditure", value: "$68.9M", imf: "$66.0M", deviation: "+4.4%"  },
        { metric: "Public Debt",            value: "$140M",  imf: "$135M",  deviation: "+4.1%"  },
        { metric: "Foreign Reserves",       value: "$39.8M", imf: "$36.0M", deviation: "+10.6%" },
        { metric: "Current Account",        value: "$4.9M",  imf: "$4.2M",  deviation: "+16.7%" },
      ],
    },
    "2022": {
      columns: [
        { key: "metric", label: "Sovereign Metric" },
        { key: "value",  label: "Actual 2022"      },
        { key: "imf",    label: "IMF Benchmark"    },
      ],
      rows: [
        { metric: "GDP (USD Bn)",           value: "$261B",  imf: "$255B"  },
        { metric: "Government Revenue",     value: "$58.7M", imf: "$57.0M" },
        { metric: "Government Expenditure", value: "$65.2M", imf: "$63.0M" },
        { metric: "Public Debt",            value: "$132M",  imf: "$130M"  },
        { metric: "Foreign Reserves",       value: "$36.5M", imf: "$34.0M" },
        { metric: "Current Account",        value: "$3.8M",  imf: "$3.8M"  },
      ],
    },
  },

  "ENT-005": {
    "SIBOR+150bps": {
      columns: [
        { key: "metric",   label: "Portfolio Metric" },
        { key: "value",    label: "Value"            },
        { key: "maturity", label: "Maturity Date"    },
        { key: "status",   label: "Status"           },
      ],
      rows: [
        { metric: "Portfolio Value",     value: "$920M",  maturity: "2027-06-30", status: "Active" },
        { metric: "Rental Income",       value: "$52.4M", maturity: "2027-06-30", status: "Active" },
        { metric: "Net Asset Value",     value: "$383M",  maturity: "2027-06-30", status: "Active" },
        { metric: "Operating Cash Flow", value: "$41.9M", maturity: "2027-06-30", status: "Active" },
      ],
    },
    "SIBOR+175bps": {
      columns: [
        { key: "metric",   label: "Debt Metric"    },
        { key: "value",    label: "Value"          },
        { key: "maturity", label: "Maturity Date"  },
        { key: "status",   label: "Status"         },
        { key: "action",   label: "Required Action"},
      ],
      rows: [
        { metric: "Total Debt",      value: "$536M",  maturity: "2026-03-31", status: "Refinance Due", action: "Refinance"      },
        { metric: "Interest Expense",value: "$26.8M", maturity: "2026-03-31", status: "Refinance Due", action: "Review Rate"     },
        { metric: "Loan Repayment",  value: "$45.0M", maturity: "2026-03-31", status: "Refinance Due", action: "Schedule Payment"},
        { metric: "Hedging Cost",    value: "$3.2M",  maturity: "2026-03-31", status: "Watch",         action: "Monitor"        },
      ],
    },
    "Fixed 5.2%": {
      columns: [
        { key: "metric",   label: "Fixed Rate Metric" },
        { key: "value",    label: "Value"             },
        { key: "maturity", label: "Maturity Date"     },
      ],
      rows: [
        { metric: "Fixed Rate Debt", value: "$180M",  maturity: "2028-12-31" },
        { metric: "Annual Interest", value: "$9.4M",  maturity: "2028-12-31" },
        { metric: "Amortization",    value: "$12.0M", maturity: "2028-12-31" },
      ],
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { entityId, filters } = await req.json();

    if (!entityId) {
      return NextResponse.json({ error: "Entity ID required" }, { status: 400 });
    }

    const upperEntityId = entityId.toUpperCase().trim();
    const entityData    = financialDB[upperEntityId];

    if (!entityData) {
      return NextResponse.json({ error: `No financial data for ${entityId}` }, { status: 404 });
    }

    // Build the lookup key from filters
    let key = "default";

    if (filters && Object.keys(filters).length > 0) {
      const vals = Object.values(filters) as string[];

      // ENT-002: combine statementDate_currency
      if (upperEntityId === "ENT-002" && vals.length >= 2) {
        key = `${vals[0]}_${vals[1]}`;
      } else {
        key = vals[0];
      }
    }

    // Try the exact key, fallback to first available
    const result =
      entityData[key] ||
      entityData[Object.keys(entityData)[0]];

    await new Promise((r) => setTimeout(r, 350));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Financial API error:", error);
    return NextResponse.json({ error: "Failed to fetch statement" }, { status: 500 });
  }
}