export type OverviewLine = {
  label: string;
  value: string;
  type:  "good" | "warn" | "bad";
};

export type Filter = {
  key:     string;
  label:   string;
  options: string[];
};

export type Column = {
  key:   string;
  label: string;
};

export type Row = Record<string, string>;

export type Statement = {
  columns: Column[];
  rows:    Row[];
};

export type EntityData = {
  entityId:   string;
  entityName: string;
  entityType: string;
  industry:   string;
  country:    string;
  overview:   OverviewLine[];
  filters:    Filter[];
  statement?: Statement;
};

// ─────────────────────────────────────────────────────────
// Full entity + statement data — all in JSON
// columns and rows are 100% dynamic
// UI renders exactly what is here — nothing hardcoded
// ─────────────────────────────────────────────────────────

export const DATA: Record<string, {
  entity:     Omit<EntityData, "statement">;
  statements: Record<string, Statement>;
}> = {

  // ── ENT-001 ──────────────────────────────────────────
  // 2 overview lines
  // 1 spread → no dropdown
  // 5 columns
  "ENT-001": {
    entity: {
      entityId:   "ENT-001",
      entityName: "Apex Global Corporation",
      entityType: "Corporate",
      industry:   "Technology",
      country:    "United States",
      overview: [
        { label: "Credit Rating", value: "AA+",    type: "good" },
        { label: "Risk Score",    value: "22/100", type: "good" },
      ],
      filters: [],
    },
    statements: {
      "default": {
        columns: [
          { key: "metric",   label: "Metric"      },
          { key: "fy2024",   label: "FY 2024"     },
          { key: "fy2023",   label: "FY 2023"     },
          { key: "fy2022",   label: "FY 2022"     },
          { key: "variance", label: "YoY Change"  },
          { key: "status",   label: "Status"      },
        ],
        rows: [
          { metric: "Revenue",          fy2024: "$5.2M", fy2023: "$4.5M", fy2022: "$3.9M", variance: "+14.2%", status: "Above Benchmark" },
          { metric: "EBITDA",           fy2024: "$1.7M", fy2023: "$1.5M", fy2022: "$1.2M", variance: "+19.4%", status: "Above Benchmark" },
          { metric: "Net Income",       fy2024: "$1.0M", fy2023: "$0.8M", fy2022: "$0.7M", variance: "+20.3%", status: "Above Benchmark" },
          { metric: "Total Assets",     fy2024: "$8.9M", fy2023: "$7.6M", fy2022: "$6.8M", variance: "+16.3%", status: "Above Benchmark" },
          { metric: "Total Liabilities",fy2024: "$2.7M", fy2023: "$2.5M", fy2022: "$2.2M", variance: "+9.3%",  status: "Stable"          },
          { metric: "Total Equity",     fy2024: "$6.1M", fy2023: "$5.1M", fy2022: "$4.5M", variance: "+19.8%", status: "Stable"          },
        ],
      },
    },
  },

  // ── ENT-002 ──────────────────────────────────────────
  // 6 overview lines
  // 3 spreads → dropdown
  // columns change per spread
  "ENT-002": {
    entity: {
      entityId:   "ENT-002",
      entityName: "Meridian Capital Bank",
      entityType: "Financial Institution",
      industry:   "Banking",
      country:    "United Kingdom",
      overview: [
        { label: "Credit Rating",    value: "BBB+",  type: "warn" },
        { label: "Risk Score",       value: "45/100",type: "warn" },
        { label: "NPL Ratio",        value: "5.0%",  type: "warn" },
        { label: "Capital Adequacy", value: "18.2%", type: "good" },
        { label: "ROE",              value: "7.4%",  type: "good" },
        { label: "Loan to Deposit",  value: "84.1%", type: "warn" },
      ],
      filters: [
        {
          key:     "spread",
          label:   "Financial Spread",
          options: [
            "2024 · Audited Accounts",
            "2023 · Audited Accounts",
            "2024 · Management Accounts",
          ],
        },
      ],
    },
    statements: {
      "2024 · Audited Accounts": {
        columns: [
          { key: "metric",   label: "Banking Metric" },
          { key: "gbp",      label: "Value (GBP)"    },
          { key: "usd",      label: "Value (USD)"    },
          { key: "variance", label: "Variance %"     },
          { key: "rating",   label: "Rating"         },
        ],
        rows: [
          { metric: "Net Interest Income",  gbp: "£3.1M",  usd: "$3.9M",  variance: "+6.2%",  rating: "Strong" },
          { metric: "Total Loans",          gbp: "£18.5M", usd: "$23.5M", variance: "+7.6%",  rating: "Stable" },
          { metric: "Non-Performing Loans", gbp: "£0.9M",  usd: "$1.2M",  variance: "+19.5%", rating: "Watch"  },
          { metric: "Total Deposits",       gbp: "£22.0M", usd: "$27.9M", variance: "+7.3%",  rating: "Strong" },
          { metric: "Tier 1 Capital",       gbp: "£4.2M",  usd: "$5.3M",  variance: "+7.7%",  rating: "Strong" },
          { metric: "Operating Expenses",   gbp: "£1.8M",  usd: "$2.3M",  variance: "+6.3%",  rating: "Stable" },
        ],
      },
      "2023 · Audited Accounts": {
        columns: [
          { key: "metric",   label: "Banking Metric" },
          { key: "gbp",      label: "Value (GBP)"    },
          { key: "usd",      label: "Value (USD)"    },
          { key: "variance", label: "Variance %"     },
          { key: "rating",   label: "Rating"         },
        ],
        rows: [
          { metric: "Net Interest Income",  gbp: "£2.9M",  usd: "$3.7M",  variance: "+5.1%", rating: "Stable" },
          { metric: "Total Loans",          gbp: "£17.2M", usd: "$21.8M", variance: "+4.9%", rating: "Stable" },
          { metric: "Non-Performing Loans", gbp: "£0.8M",  usd: "$1.0M",  variance: "+8.2%", rating: "Watch"  },
          { metric: "Total Deposits",       gbp: "£20.5M", usd: "$26.0M", variance: "+5.1%", rating: "Stable" },
          { metric: "Tier 1 Capital",       gbp: "£3.9M",  usd: "$5.0M",  variance: "+5.4%", rating: "Strong" },
          { metric: "Operating Expenses",   gbp: "£1.7M",  usd: "$2.2M",  variance: "+4.8%", rating: "Stable" },
        ],
      },
      "2024 · Management Accounts": {
        columns: [
          { key: "metric",   label: "Banking Metric" },
          { key: "value",    label: "Value (GBP)"    },
          { key: "variance", label: "Variance %"     },
          { key: "notes",    label: "Notes"          },
        ],
        rows: [
          { metric: "Net Interest Income", value: "£3.0M",  variance: "+3.4%", notes: "Unaudited estimate" },
          { metric: "Total Loans",         value: "£18.1M", variance: "+5.2%", notes: "Unaudited estimate" },
          { metric: "Operating Expenses",  value: "£1.7M",  variance: "+2.1%", notes: "Unaudited estimate" },
        ],
      },
    },
  },

  // ── ENT-003 ──────────────────────────────────────────
  // 10 overview lines
  // 2 spreads → dropdown
  // columns change per spread (4 cols vs 2 cols)
  "ENT-003": {
    entity: {
      entityId:   "ENT-003",
      entityName: "Redstone SME Ventures",
      entityType: "SME",
      industry:   "Manufacturing",
      country:    "India",
      overview: [
        { label: "Credit Rating",     value: "BB-",    type: "bad"  },
        { label: "Risk Score",        value: "74/100", type: "bad"  },
        { label: "Debt Ratio",        value: "0.76",   type: "bad"  },
        { label: "Revenue Growth",    value: "-3.2%",  type: "bad"  },
        { label: "EBITDA Margin",     value: "9.8%",   type: "warn" },
        { label: "Interest Coverage", value: "1.8x",   type: "bad"  },
        { label: "Current Ratio",     value: "0.91",   type: "bad"  },
        { label: "Quick Ratio",       value: "0.62",   type: "bad"  },
        { label: "Net Margin",        value: "1.5%",   type: "bad"  },
        { label: "Asset Turnover",    value: "1.37x",  type: "warn" },
      ],
      filters: [
        {
          key:     "spread",
          label:   "Financial Statement",
          options: [
            "2024 · Management Accounts",
            "2024 · Unaudited",
          ],
        },
      ],
    },
    statements: {
      "2024 · Management Accounts": {
        columns: [
          { key: "metric",    label: "Metric"             },
          { key: "actual",    label: "Actual"             },
          { key: "benchmark", label: "Industry Benchmark" },
          { key: "variance",  label: "Variance"           },
          { key: "status",    label: "Status"             },
        ],
        rows: [
          { metric: "Revenue",          actual: "₹850K", benchmark: "₹1.2M", variance: "-29.2%", status: "Below Benchmark" },
          { metric: "EBITDA",           actual: "₹83K",  benchmark: "₹180K", variance: "-53.9%", status: "Below Benchmark" },
          { metric: "Net Income",       actual: "₹12K",  benchmark: "₹96K",  variance: "-87.5%", status: "Critical"        },
          { metric: "Total Assets",     actual: "₹620K", benchmark: "₹900K", variance: "-31.1%", status: "Below Benchmark" },
          { metric: "Interest Expense", actual: "₹94K",  benchmark: "₹54K",  variance: "+74.1%", status: "Above Benchmark" },
        ],
      },
      "2024 · Unaudited": {
        columns: [
          { key: "metric", label: "Metric" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { metric: "Revenue",          status: "Critical"        },
          { metric: "EBITDA",           status: "Critical"        },
          { metric: "Net Income",       status: "Critical"        },
          { metric: "Total Liabilities",status: "Above Benchmark" },
          { metric: "Total Equity",     status: "Critical"        },
          { metric: "Interest Expense", status: "Above Benchmark" },
        ],
      },
    },
  },

  // ── ENT-004 ──────────────────────────────────────────
  // 4 overview lines
  // 3 spreads → dropdown
  // columns change per year (5 → 4 → 3)
  "ENT-004": {
    entity: {
      entityId:   "ENT-004",
      entityName: "Sovereign State of Aldoria",
      entityType: "Sovereign",
      industry:   "Government",
      country:    "Aldoria",
      overview: [
        { label: "Credit Rating",  value: "A-",     type: "good" },
        { label: "Risk Score",     value: "38/100", type: "good" },
        { label: "GDP Growth",     value: "+3.8%",  type: "good" },
        { label: "Fiscal Deficit", value: "-2.1%",  type: "warn" },
      ],
      filters: [
        {
          key:     "spread",
          label:   "Year",
          options: [
            "2024 · IMF Assessment",
            "2023 · IMF Assessment",
            "2022 · IMF Assessment",
          ],
        },
      ],
    },
    statements: {
      "2024 · IMF Assessment": {
        columns: [
          { key: "metric",    label: "Sovereign Metric" },
          { key: "actual",    label: "Actual 2024"      },
          { key: "benchmark", label: "IMF Benchmark"    },
          { key: "deviation", label: "Deviation"        },
          { key: "outlook",   label: "Outlook"          },
        ],
        rows: [
          { metric: "GDP (USD Bn)",           actual: "$285B",  benchmark: "$275B",  deviation: "+3.6%",  outlook: "Positive" },
          { metric: "Government Revenue",     actual: "$68.4M", benchmark: "$65.0M", deviation: "+5.2%",  outlook: "Stable"   },
          { metric: "Government Expenditure", actual: "$74.4M", benchmark: "$70.0M", deviation: "+6.3%",  outlook: "Watch"    },
          { metric: "Public Debt",            actual: "$149M",  benchmark: "$140M",  deviation: "+6.7%",  outlook: "Watch"    },
          { metric: "Foreign Reserves",       actual: "$42.5M", benchmark: "$38.0M", deviation: "+11.8%", outlook: "Positive" },
        ],
      },
      "2023 · IMF Assessment": {
        columns: [
          { key: "metric",    label: "Sovereign Metric" },
          { key: "actual",    label: "Actual 2023"      },
          { key: "benchmark", label: "IMF Benchmark"    },
          { key: "deviation", label: "Deviation"        },
        ],
        rows: [
          { metric: "GDP (USD Bn)",           actual: "$274B",  benchmark: "$265B",  deviation: "+3.4%"  },
          { metric: "Government Revenue",     actual: "$63.1M", benchmark: "$61.0M", deviation: "+3.4%"  },
          { metric: "Government Expenditure", actual: "$68.9M", benchmark: "$66.0M", deviation: "+4.4%"  },
          { metric: "Public Debt",            actual: "$140M",  benchmark: "$135M",  deviation: "+4.1%"  },
          { metric: "Foreign Reserves",       actual: "$39.8M", benchmark: "$36.0M", deviation: "+10.6%" },
        ],
      },
      "2022 · IMF Assessment": {
        columns: [
          { key: "metric",    label: "Sovereign Metric" },
          { key: "actual",    label: "Actual 2022"      },
          { key: "benchmark", label: "IMF Benchmark"    },
        ],
        rows: [
          { metric: "GDP (USD Bn)",           actual: "$261B",  benchmark: "$255B"  },
          { metric: "Government Revenue",     actual: "$58.7M", benchmark: "$57.0M" },
          { metric: "Government Expenditure", actual: "$65.2M", benchmark: "$63.0M" },
          { metric: "Public Debt",            actual: "$132M",  benchmark: "$130M"  },
          { metric: "Foreign Reserves",       actual: "$36.5M", benchmark: "$34.0M" },
        ],
      },
    },
  },

  // ── ENT-005 ──────────────────────────────────────────
  // 8 overview lines
  // 3 spreads → dropdown
  // completely different columns per spread
  "ENT-005": {
    entity: {
      entityId:   "ENT-005",
      entityName: "Orion Real Estate Fund",
      entityType: "Corporate",
      industry:   "Real Estate",
      country:    "Singapore",
      overview: [
        { label: "Credit Rating",      value: "BBB",    type: "warn" },
        { label: "Risk Score",         value: "55/100", type: "warn" },
        { label: "Debt Ratio",         value: "0.62",   type: "warn" },
        { label: "NAV Growth",         value: "+8.4%",  type: "good" },
        { label: "Occupancy Rate",     value: "91.2%",  type: "good" },
        { label: "Loan to Value",      value: "58.3%",  type: "warn" },
        { label: "WALE",               value: "4.2 yrs",type: "good" },
        { label: "Distribution Yield", value: "5.8%",   type: "good" },
      ],
      filters: [
        {
          key:     "spread",
          label:   "Loan Spread",
          options: [
            "2024 · SIBOR+150bps",
            "2024 · SIBOR+175bps",
            "2024 · Fixed 5.2%",
          ],
        },
      ],
    },
    statements: {
      "2024 · SIBOR+150bps": {
        columns: [
          { key: "metric",   label: "Portfolio Metric" },
          { key: "sgd",      label: "SGD Value"        },
          { key: "usd",      label: "USD Value"        },
          { key: "maturity", label: "Maturity Date"    },
          { key: "status",   label: "Status"           },
        ],
        rows: [
          { metric: "Portfolio Value",    sgd: "S$920M",  usd: "$683M", maturity: "2027-06-30", status: "Active" },
          { metric: "Rental Income",      sgd: "S$52.4M", usd: "$38.9M",maturity: "2027-06-30", status: "Active" },
          { metric: "Net Asset Value",    sgd: "S$383M",  usd: "$284M", maturity: "2027-06-30", status: "Active" },
          { metric: "Operating Cash Flow",sgd: "S$41.9M", usd: "$31.1M",maturity: "2027-06-30", status: "Active" },
        ],
      },
      "2024 · SIBOR+175bps": {
        columns: [
          { key: "metric",   label: "Debt Metric"     },
          { key: "sgd",      label: "SGD Value"       },
          { key: "maturity", label: "Maturity Date"   },
          { key: "status",   label: "Status"          },
          { key: "action",   label: "Required Action" },
        ],
        rows: [
          { metric: "Total Debt",      sgd: "S$536M",  maturity: "2026-03-31", status: "Refinance Due", action: "Refinance"        },
          { metric: "Interest Expense",sgd: "S$26.8M", maturity: "2026-03-31", status: "Refinance Due", action: "Review Rate"       },
          { metric: "Loan Repayment",  sgd: "S$45.0M", maturity: "2026-03-31", status: "Refinance Due", action: "Schedule Payment"  },
          { metric: "Hedging Cost",    sgd: "S$3.2M",  maturity: "2026-03-31", status: "Watch",         action: "Monitor"           },
        ],
      },
      "2024 · Fixed 5.2%": {
        columns: [
          { key: "metric",   label: "Fixed Rate Metric" },
          { key: "sgd",      label: "SGD Value"         },
          { key: "maturity", label: "Maturity Date"     },
          { key: "rate",     label: "Rate"              },
        ],
        rows: [
          { metric: "Fixed Rate Debt", sgd: "S$180M",  maturity: "2028-12-31", rate: "5.2%" },
          { metric: "Annual Interest", sgd: "S$9.4M",  maturity: "2028-12-31", rate: "5.2%" },
          { metric: "Amortization",    sgd: "S$12.0M", maturity: "2028-12-31", rate: "5.2%" },
        ],
      },
    },
  },

  // ── ENT-990 ──────────────────────────────────────────
  // 4 overview lines
  // 3 spreads → dropdown
  // columns change per spread
  "ENT-990": {
    entity: {
      entityId:   "ENT-990",
      entityName: "Nordic Health Sciences Ltd",
      entityType: "Corporate",
      industry:   "Healthcare",
      country:    "Denmark",
      overview: [
        { label: "Credit Rating",  value: "A-",     type: "good" },
        { label: "Risk Score",     value: "35/100", type: "good" },
        { label: "Debt Ratio",     value: "0.42",   type: "warn" },
        { label: "Revenue Growth", value: "+11.8%", type: "good" },
      ],
      filters: [
        {
          key:     "spread",
          label:   "Period",
          options: [
            "FY 2024 · Annual Report",
            "FY 2023 · Annual Report",
            "Q1 2024 · Quarterly Report",
          ],
        },
      ],
    },
    statements: {
      "FY 2024 · Annual Report": {
        columns: [
          { key: "metric",     label: "Metric"      },
          { key: "fy2024",     label: "FY 2024"     },
          { key: "prior_year", label: "Prior Year"  },
          { key: "change",     label: "YoY Change"  },
          { key: "margin",     label: "Margin"      },
          { key: "status",     label: "Status"      },
        ],
        rows: [
          { metric: "Revenue",    fy2024: "$12.4M", prior_year: "$11.2M", change: "+11.8%", margin: "32.1%", status: "Above Benchmark" },
          { metric: "EBITDA",     fy2024: "$3.1M",  prior_year: "$2.7M",  change: "+14.8%", margin: "25.0%", status: "Above Benchmark" },
          { metric: "Net Income", fy2024: "$1.8M",  prior_year: "$1.5M",  change: "+20.0%", margin: "14.5%", status: "Above Benchmark" },
          { metric: "Total Debt", fy2024: "$5.2M",  prior_year: "$5.8M",  change: "-10.3%", margin: "",      status: "Improving"        },
        ],
      },
      "FY 2023 · Annual Report": {
        columns: [
          { key: "metric",  label: "Metric"     },
          { key: "fy2023",  label: "FY 2023"    },
          { key: "change",  label: "YoY Change" },
          { key: "status",  label: "Status"     },
        ],
        rows: [
          { metric: "Revenue",    fy2023: "$11.2M", change: "+8.7%", status: "Stable" },
          { metric: "EBITDA",     fy2023: "$2.7M",  change: "+8.0%", status: "Stable" },
          { metric: "Net Income", fy2023: "$1.5M",  change: "+7.1%", status: "Stable" },
        ],
      },
      "Q1 2024 · Quarterly Report": {
        columns: [
          { key: "metric",     label: "Metric"      },
          { key: "q1_value",   label: "Q1 Value"    },
          { key: "annualised", label: "Annualised"  },
          { key: "vs_budget",  label: "vs Budget"   },
          { key: "status",     label: "Status"      },
        ],
        rows: [
          { metric: "Revenue",       q1_value: "$3.2M", annualised: "$12.8M", vs_budget: "+2.4%", status: "On Track" },
          { metric: "EBITDA",        q1_value: "$0.8M", annualised: "$3.2M",  vs_budget: "+1.8%", status: "On Track" },
          { metric: "Operating Cost",q1_value: "$2.1M", annualised: "$8.4M",  vs_budget: "+5.2%", status: "Watch"    },
        ],
      },
    },
  },
};