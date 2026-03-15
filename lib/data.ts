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

export type EntityMaster = {
  entityId:   string;
  entityName: string;
  entityType: string;
  industry:   string;
  country:    string;
  overview:   OverviewLine[];
  filters:    Filter[];
};

export type FinancialRow = {
  metric:            string;
  revenue?:          string;
  ebitda?:           string;
  net_income?:       string;
  total_assets?:     string;
  total_liabilities?:string;
  total_equity?:     string;
  interest_expense?: string;
  operating_cashflow?:string;
  gross_margin?:     string;
  net_margin?:       string;
  debt_ratio?:       string;
  interest_coverage?:string;
  benchmark?:        string;
  variance?:         string;
  status?:           string;
};

export type FinancialStatement = {
  entityId:      string;
  spreadName:    string;
  statementYear: string;
  rows:          FinancialRow[];
};

// ─── Entity Master Data ───────────────────────────────

export const ENTITIES: Record<string, EntityMaster> = {

  "ENT-001": {
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

  "ENT-002": {
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

  "ENT-003": {
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
        label:   "Financial Spread",
        options: [
          "2024 · Management Accounts",
          "2024 · Unaudited",
        ],
      },
    ],
  },

  "ENT-004": {
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
        label:   "Financial Spread",
        options: [
          "2024 · IMF Assessment",
          "2023 · IMF Assessment",
          "2022 · IMF Assessment",
        ],
      },
    ],
  },

  "ENT-005": {
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
        label:   "Financial Spread",
        options: [
          "2024 · SIBOR+150bps",
          "2024 · SIBOR+175bps",
          "2024 · Fixed 5.2%",
        ],
      },
    ],
  },

  "ENT-990": {
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
        label:   "Financial Spread",
        options: [
          "FY 2024 · Annual Report",
          "FY 2023 · Annual Report",
          "Q1 2024 · Quarterly Report",
        ],
      },
    ],
  },
};

// ─── Financial Statements Data ────────────────────────

export const STATEMENTS: FinancialStatement[] = [

  // ── ENT-001: 1 spread → no dropdown ──
  {
    entityId: "ENT-001", spreadName: "Annual Report", statementYear: "FY 2024",
    rows: [
      { metric: "Revenue",          revenue:  "$5.2M", variance: "+14.2%", status: "Above Benchmark" },
      { metric: "EBITDA",           ebitda:   "$1.7M", variance: "+19.4%", status: "Above Benchmark" },
      { metric: "Net Income",       net_income:"$1.0M",variance: "+20.3%", status: "Above Benchmark" },
      { metric: "Total Assets",     total_assets:"$8.9M",variance:"+16.3%",status: "Above Benchmark" },
      { metric: "Total Liabilities",total_liabilities:"$2.7M",variance:"+9.3%",status:"Stable"       },
      { metric: "Total Equity",     total_equity:"$6.1M",variance:"+19.8%",status:"Stable"           },
    ],
  },

  // ── ENT-002: 3 spreads → dropdown ──
  {
    entityId: "ENT-002", spreadName: "Audited Accounts", statementYear: "2024",
    rows: [
      { metric: "Net Interest Income",  revenue: "£3.1M",  variance: "+6.2%",  status: "Strong" },
      { metric: "Total Loans",          total_assets: "£18.5M", variance: "+7.6%",  status: "Stable" },
      { metric: "Non-Performing Loans", total_liabilities: "£0.9M", variance: "+19.5%", status: "Watch"  },
      { metric: "Total Deposits",       revenue: "£22.0M", variance: "+7.3%",  status: "Strong" },
      { metric: "Tier 1 Capital",       total_assets: "£4.2M",  variance: "+7.7%",  status: "Strong" },
      { metric: "Operating Expenses",   interest_expense: "£1.8M", variance: "+6.3%",  status: "Stable" },
    ],
  },
  {
    entityId: "ENT-002", spreadName: "Audited Accounts", statementYear: "2023",
    rows: [
      { metric: "Net Interest Income",  revenue: "£2.9M",  variance: "+5.1%", status: "Stable" },
      { metric: "Total Loans",          total_assets: "£17.2M", variance: "+4.9%", status: "Stable" },
      { metric: "Non-Performing Loans", total_liabilities: "£0.8M", variance: "+8.2%", status: "Watch"  },
      { metric: "Total Deposits",       revenue: "£20.5M", variance: "+5.1%", status: "Stable" },
      { metric: "Tier 1 Capital",       total_assets: "£3.9M",  variance: "+5.4%", status: "Strong" },
      { metric: "Operating Expenses",   interest_expense: "£1.7M", variance: "+4.8%", status: "Stable" },
    ],
  },
  {
    entityId: "ENT-002", spreadName: "Management Accounts", statementYear: "2024",
    rows: [
      { metric: "Net Interest Income", revenue: "£3.0M",  variance: "+3.4%", status: "Unaudited" },
      { metric: "Total Loans",         ebitda:  "£18.1M", variance: "+5.2%", status: "Unaudited" },
      { metric: "Operating Expenses",  variance: "+2.1%", status: "Unaudited"                     },
    ],
  },

  // ── ENT-003: 2 spreads → dropdown ──
  {
    entityId: "ENT-003", spreadName: "Management Accounts", statementYear: "2024",
    rows: [
      { metric: "Revenue",          revenue:   "₹850K", benchmark: "₹1.2M", variance: "-29.2%", status: "Below Benchmark" },
      { metric: "EBITDA",           ebitda:    "₹83K",  benchmark: "₹180K", variance: "-53.9%", status: "Below Benchmark" },
      { metric: "Net Income",       net_income:"₹12K",  benchmark: "₹96K",  variance: "-87.5%", status: "Critical"        },
      { metric: "Total Assets",     benchmark: "₹900K", variance: "-31.1%", status: "Below Benchmark"                    },
      { metric: "Interest Expense", benchmark: "₹54K",  variance: "+74.1%", status: "Above Benchmark"                    },
    ],
  },
  {
    entityId: "ENT-003", spreadName: "Unaudited", statementYear: "2024",
    rows: [
      { metric: "Revenue",    revenue:   "₹790K", status: "Critical" },
      { metric: "EBITDA",     ebitda:    "₹71K",  status: "Critical" },
      { metric: "Net Income", net_income:"₹8K",   status: "Critical" },
    ],
  },

  // ── ENT-004: 3 spreads → dropdown ──
  {
    entityId: "ENT-004", spreadName: "IMF Assessment", statementYear: "2024",
    rows: [
      { metric: "GDP (USD Bn)",           revenue: "$285B",  benchmark: "$275B",  variance: "+3.6%",  status: "Positive", debt_ratio: undefined  },
      { metric: "Government Revenue",     revenue: "$68.4M", benchmark: "$65.0M", variance: "+5.2%",  status: "Stable"                            },
      { metric: "Government Expenditure", revenue: "$74.4M", benchmark: "$70.0M", variance: "+6.3%",  status: "Watch"                             },
      { metric: "Public Debt",            revenue: "$149M",  benchmark: "$140M",  variance: "+6.7%",  status: "Watch",   debt_ratio: "52.4%"      },
      { metric: "Foreign Reserves",       revenue: "$42.5M", benchmark: "$38.0M", variance: "+11.8%", status: "Positive"                          },
    ],
  },
  {
    entityId: "ENT-004", spreadName: "IMF Assessment", statementYear: "2023",
    rows: [
      { metric: "GDP (USD Bn)",           revenue: "$274B",  benchmark: "$265B",  variance: "+3.4%",  status: "Stable"   },
      { metric: "Government Revenue",     revenue: "$63.1M", benchmark: "$61.0M", variance: "+3.4%",  status: "Stable"   },
      { metric: "Public Debt",            revenue: "$140M",  benchmark: "$135M",  variance: "+4.1%",  status: "Watch"    },
      { metric: "Foreign Reserves",       revenue: "$39.8M", benchmark: "$36.0M", variance: "+10.6%", status: "Positive" },
    ],
  },
  {
    entityId: "ENT-004", spreadName: "IMF Assessment", statementYear: "2022",
    rows: [
      { metric: "GDP (USD Bn)",       revenue: "$261B",  benchmark: "$255B",  variance: "+2.4%" },
      { metric: "Government Revenue", revenue: "$58.7M", benchmark: "$57.0M", variance: "+3.0%" },
      { metric: "Public Debt",        revenue: "$132M",  benchmark: "$130M",  variance: "+1.8%" },
    ],
  },

  // ── ENT-005: 3 spreads → dropdown ──
  {
    entityId: "ENT-005", spreadName: "SIBOR+150bps", statementYear: "2024",
    rows: [
      { metric: "Portfolio Value",    total_assets: "S$920M",  status: "Active" },
      { metric: "Rental Income",      revenue:      "S$52.4M", status: "Active" },
      { metric: "Net Asset Value",    total_assets: "S$383M",  status: "Active" },
      { metric: "Operating Cash Flow",operating_cashflow:"S$41.9M",status:"Active"},
    ],
  },
  {
    entityId: "ENT-005", spreadName: "SIBOR+175bps", statementYear: "2024",
    rows: [
      { metric: "Total Debt",      total_liabilities: "S$536M",  variance: "-10.3%", status: "Refinance Due" },
      { metric: "Interest Expense",interest_expense:  "S$26.8M", variance: "+3.2%",  status: "Refinance Due" },
      { metric: "Loan Repayment",  total_liabilities: "S$45.0M", status: "Refinance Due"                     },
      { metric: "Hedging Cost",    interest_expense:  "S$3.2M",  status: "Watch"                             },
    ],
  },
  {
    entityId: "ENT-005", spreadName: "Fixed 5.2%", statementYear: "2024",
    rows: [
      { metric: "Fixed Rate Debt", total_liabilities: "S$180M", status: "Stable" },
      { metric: "Annual Interest", interest_expense:  "S$9.4M", status: "Stable" },
      { metric: "Amortization",    total_liabilities: "S$12.0M",status: "Stable" },
    ],
  },

  // ── ENT-990: 3 spreads → dropdown ──
  {
    entityId: "ENT-990", spreadName: "Annual Report", statementYear: "FY 2024",
    rows: [
      { metric: "Revenue",    revenue:   "$12.4M", status: "Above Benchmark" },
      { metric: "EBITDA",     ebitda:    "$3.1M",  gross_margin: "25.0%", status: "Above Benchmark" },
      { metric: "Net Income", net_income:"$1.8M",  net_margin:   "14.5%", status: "Above Benchmark" },
      { metric: "Total Debt", status: "Stable"                                                       },
    ],
  },
  {
    entityId: "ENT-990", spreadName: "Annual Report", statementYear: "FY 2023",
    rows: [
      { metric: "Revenue",    revenue:    "$11.2M", status: "Stable" },
      { metric: "EBITDA",     ebitda:     "$2.7M",  status: "Stable" },
      { metric: "Net Income", net_income: "$1.5M",  status: "Stable" },
    ],
  },
  {
    entityId: "ENT-990", spreadName: "Quarterly Report", statementYear: "Q1 2024",
    rows: [
      { metric: "Revenue",       revenue: "$3.2M", variance: "+2.4%", status: "On Track" },
      { metric: "EBITDA",        ebitda:  "$0.8M", variance: "+1.8%", status: "On Track" },
      { metric: "Operating Cost",revenue: "$2.1M", variance: "+5.2%", status: "Watch"    },
    ],
  },
];