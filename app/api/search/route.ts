import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// SHAPE REFERENCE — what the UI understands from this response:
//
//  steps[]       → drives the top wizard nav (tab count + labels vary per entity)
//  statements[]  → drives Screen 3 statement selection cards
//  overview[]    → { label, value, type }  → colored pill grid
//  table         → { columns, rows }       → data table
//  keyValues     → { key: value }          → info grid
//  top-level strings/numbers              → entity header + left sidebar
// ─────────────────────────────────────────────────────────────────────────────

// Shared step definitions — each entity picks its own subset and order
const FULL_STEPS = [
  { id: "entity",      label: "Entity"      },
  { id: "model",       label: "Model Routing" },
  { id: "statement",   label: "Statement"   },
  { id: "quantitative",label: "Quantitative" },
  { id: "qualitative", label: "Qualitative"  },
  { id: "adjustments", label: "Adjustments"  },
  { id: "summary",     label: "PD Summary"   },
];

const ENTITIES: Record<string, Record<string, unknown>> = {

  // ── ENT-001: Corporate / Technology ──────────────────────────────────────
  "ENT-001": {
    entityId:   "ENT-001",
    entityName: "Apex Global Corporation",
    entityType: "Corporate",
    industry:   "Technology",
    country:    "United States",

    // Steps array — UI builds the top nav from this exactly
    steps: FULL_STEPS,

    // Statements array — UI renders each as a selectable card on Screen 3
    statements: [
      {
        id: "ent001-fy2024-audited", label: "FY2024 Audited Annual", period: "Annual", date: "2024-12-31", badge: "Audited",
        detail: {
          auditor: "Deloitte & Co", reportingStandard: "US GAAP", currency: "USD",
          totalAssets: "$8.9M", totalRevenue: "$5.2M", netIncome: "$1.0M",
          dqScore: "96 / 100", notes: "Clean audit opinion. No material weaknesses identified.",
        },
      },
      {
        id: "ent001-fy2023-audited", label: "FY2023 Audited Annual", period: "Annual", date: "2023-12-31", badge: "Audited",
        detail: {
          auditor: "Deloitte & Co", reportingStandard: "US GAAP", currency: "USD",
          totalAssets: "$7.6M", totalRevenue: "$4.5M", netIncome: "$0.8M",
          dqScore: "91 / 100", notes: "Clean audit opinion. Minor disclosure adjustment noted.",
        },
      },
      {
        id: "ent001-ttm-reviewed", label: "TTM Sep 2024 Reviewed", period: "TTM", date: "2024-09-30", badge: "Reviewed",
        detail: {
          auditor: "PwC (Review)", reportingStandard: "US GAAP", currency: "USD",
          totalRevenue: "$4.9M (annualised)", dqScore: "82 / 100",
          notes: "TTM review only. Qualitative assessment not required for this period type.",
        },
      },
    ],

    overview: [
      { label: "Credit Rating",  value: "AA+",    type: "good" },
      { label: "Risk Score",     value: "22/100", type: "good" },
      { label: "Debt Ratio",     value: "0.31",   type: "good" },
      { label: "Revenue Growth", value: "+14.2%", type: "good" },
      { label: "EBITDA Margin",  value: "32.8%",  type: "good" },
    ],
    table: {
      columns: [
        { key: "metric",   label: "Metric"     },
        { key: "fy2024",   label: "FY 2024"    },
        { key: "fy2023",   label: "FY 2023"    },
        { key: "variance", label: "YoY Change" },
      ],
      rows: [
        { metric: "Revenue",           fy2024: "$5.2M", fy2023: "$4.5M", variance: "+14.2%" },
        { metric: "EBITDA",            fy2024: "$1.7M", fy2023: "$1.5M", variance: "+19.4%" },
        { metric: "Net Income",        fy2024: "$1.0M", fy2023: "$0.8M", variance: "+20.3%" },
        { metric: "Total Assets",      fy2024: "$8.9M", fy2023: "$7.6M", variance: "+16.3%" },
        { metric: "Total Liabilities", fy2024: "$2.7M", fy2023: "$2.5M", variance: "+9.3%"  },
        { metric: "Total Equity",      fy2024: "$6.1M", fy2023: "$5.1M", variance: "+19.8%" },
      ],
    },
  },

  // ── ENT-002: Financial Institution / Bank ────────────────────────────────
  "ENT-002": {
    entityId:   "ENT-002",
    entityName: "Meridian Capital Bank",
    entityType: "Financial Institution",
    country:    "United Kingdom",

    steps: FULL_STEPS,

    statements: [
      {
        id: "ent002-fy2024-audited", label: "FY2024 Audited Annual", period: "Annual", date: "2024-06-30", badge: "Audited",
        detail: {
          auditor: "KPMG UK", reportingStandard: "IFRS", currency: "GBP",
          totalAssets: "£28.4B", netInterestIncome: "£3.1M", tier1Capital: "£4.2M",
          dqScore: "98 / 100", notes: "Audited under PRA / FCA supervision. Full ICAAP submission included.",
        },
      },
      {
        id: "ent002-fy2023-audited", label: "FY2023 Audited Annual", period: "Annual", date: "2023-06-30", badge: "Audited",
        detail: {
          auditor: "KPMG UK", reportingStandard: "IFRS", currency: "GBP",
          totalAssets: "£26.1B", netInterestIncome: "£2.9M", tier1Capital: "£3.9M",
          dqScore: "96 / 100", notes: "Prior year audited financials. Used for trend comparison.",
        },
      },
      {
        id: "ent002-mgmt-2024", label: "2024 Management Accounts", period: "TTM", date: "2024-03-31", badge: "Management",
        detail: {
          preparedBy: "Internal Finance", reportingStandard: "IFRS (unaudited)", currency: "GBP",
          dqScore: "74 / 100", notes: "Management accounts only. Qualitative assessment deferred to audited period.",
        },
      },
    ],

    overview: [
      { label: "NPL Ratio",        value: "5.0%",  type: "warn" },
      { label: "Capital Adequacy", value: "18.2%", type: "good" },
      { label: "ROE",              value: "7.4%",  type: "good" },
      { label: "Loan to Deposit",  value: "84.1%", type: "warn" },
      { label: "Stress Test",      value: "Pass",  type: "good" },
    ],
    keyValues: {
      regulatoryTier:         "Tier 1",
      liquidityCoverageRatio: "142%",
      stressTestResult:       "Pass",
    },
  },

  // ── ENT-003: SME / Manufacturing ─────────────────────────────────────────
  "ENT-003": {
    entityId:   "ENT-003",
    entityName: "Redstone SME Ventures",
    entityType: "SME",
    industry:   "Manufacturing",
    country:    "India",

    steps: FULL_STEPS,

    statements: [
      {
        id: "ent003-fy2023-compiled", label: "FY2023 Compiled Annual", period: "Annual", date: "2023-03-31", badge: "Compiled",
        detail: {
          preparedBy: "CA Ramesh & Associates", reportingStandard: "Ind AS", currency: "INR",
          totalRevenue: "₹850K", netIncome: "₹12K",
          dqScore: "68 / 100", notes: "Compiled by external CA. No audit or review performed. Director CIBIL verified separately.",
        },
      },
      {
        id: "ent003-fy2022-tax", label: "FY2022 Tax Return", period: "Annual", date: "2022-03-31", badge: "Tax Return",
        detail: {
          preparedBy: "Internal", reportingStandard: "Income Tax Act", currency: "INR",
          totalRevenue: "₹720K",
          dqScore: "55 / 100", notes: "ITR filing only. Limited financial detail available. Use as secondary reference only.",
        },
      },
    ],

    overview: [
      { label: "Annual Turnover",   value: "₹850K", type: "warn" },
      { label: "Outstanding Loans", value: "₹620K", type: "bad"  },
      { label: "Collateral Value",  value: "₹480K", type: "warn" },
      { label: "Director CIBIL",    value: "724",   type: "warn" },
      { label: "Years Operating",   value: "8",     type: "good" },
    ],
    keyValues: {
      employeeCount:    "47",
      collateralValue:  "₹480K",
      outstandingLoans: "₹620K",
    },
    table: {
      columns: [
        { key: "metric",    label: "Metric"    },
        { key: "actual",    label: "Actual"    },
        { key: "benchmark", label: "Benchmark" },
        { key: "variance",  label: "Variance"  },
      ],
      rows: [
        { metric: "Revenue",    actual: "₹850K", benchmark: "₹1.2M", variance: "-29.2%" },
        { metric: "EBITDA",     actual: "₹83K",  benchmark: "₹180K", variance: "-53.9%" },
        { metric: "Net Income", actual: "₹12K",  benchmark: "₹96K",  variance: "-87.5%" },
      ],
    },
  },

  // ── ENT-004: Sovereign ────────────────────────────────────────────────────
  "ENT-004": {
    entityId:     "ENT-004",
    entityName:   "Republic of Aldoria",
    entityType:   "Sovereign",
    region:       "Eastern Europe",
    currencyCode: "ALD",

    // Sovereign skips Qualitative step
    steps: [
      { id: "entity",       label: "Entity"       },
      { id: "model",        label: "Model Routing" },
      { id: "statement",    label: "Statement"    },
      { id: "quantitative", label: "Quantitative" },
      { id: "adjustments",  label: "Adjustments"  },
      { id: "summary",      label: "PD Summary"   },
    ],

    statements: [
      {
        id: "ent004-2024-imf", label: "2024 IMF Article IV", period: "Annual", date: "2024-12-31", badge: "IMF",
        detail: {
          source: "IMF Article IV Consultation", missionDate: "October 2024",
          gdp: "$285B", gdpGrowth: "+3.8%", debtToGDP: "52.4%",
          dqScore: "94 / 100", notes: "Full Article IV consultation completed. Staff report published November 2024.",
        },
      },
      {
        id: "ent004-2023-imf", label: "2023 IMF Article IV", period: "Annual", date: "2023-12-31", badge: "IMF",
        detail: {
          source: "IMF Article IV Consultation", missionDate: "September 2023",
          gdp: "$274B", gdpGrowth: "+3.4%", debtToGDP: "51.1%",
          dqScore: "93 / 100", notes: "Prior year Article IV. Used for trend comparison.",
        },
      },
      {
        id: "ent004-2024-govt", label: "2024 Government Budget", period: "Annual", date: "2024-12-31", badge: "Official",
        detail: {
          source: "Ministry of Finance — Budget Statement", currency: "ALD",
          totalRevenue: "$68.4M", totalExpenditure: "$74.4M",
          dqScore: "88 / 100", notes: "Official government budget. Cross-referenced against IMF Article IV projections.",
        },
      },
    ],

    overview: [
      { label: "GDP",            value: "$285B",  type: "good" },
      { label: "GDP Growth",     value: "+3.8%",  type: "good" },
      { label: "Inflation",      value: "2.4%",   type: "good" },
      { label: "Unemployment",   value: "4.1%",   type: "warn" },
      { label: "Debt to GDP",    value: "52.4%",  type: "warn" },
      { label: "Credit Outlook", value: "Stable", type: "good" },
    ],
    table: {
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
  },

  // ── ENT-005: Real Estate Fund ─────────────────────────────────────────────
  "ENT-005": {
    entityId:   "ENT-005",
    entityName: "Orion Real Estate Fund III",
    entityType: "Real Estate Fund",
    industry:   "Commercial Real Estate",
    country:    "Singapore",

    steps: FULL_STEPS,

    statements: [
      {
        id: "ent005-fy2024-audited", label: "FY2024 Audited Annual", period: "Annual", date: "2024-12-31", badge: "Audited",
        detail: {
          auditor: "Ernst & Young Singapore", reportingStandard: "SFRS", currency: "SGD",
          portfolioValue: "S$920M", nav: "S$383M", occupancy: "91.2%",
          dqScore: "95 / 100", notes: "Fund audited annually. Valuations by independent RICS-certified valuers.",
        },
      },
      {
        id: "ent005-h1-2024", label: "H1 2024 Interim", period: "Interim", date: "2024-06-30", badge: "Interim",
        detail: {
          preparedBy: "Internal — Orion Capital", reportingStandard: "SFRS (unaudited)", currency: "SGD",
          nav: "S$371M", occupancy: "90.8%",
          dqScore: "80 / 100", notes: "Half-year interim report. Unaudited. Full year audit preferred.",
        },
      },
      {
        id: "ent005-fy2023-audited", label: "FY2023 Audited Annual", period: "Annual", date: "2023-12-31", badge: "Audited",
        detail: {
          auditor: "Ernst & Young Singapore", reportingStandard: "SFRS", currency: "SGD",
          portfolioValue: "S$880M", nav: "S$352M", occupancy: "89.4%",
          dqScore: "94 / 100", notes: "Prior year audited. Used for YoY comparison.",
        },
      },
      {
        id: "ent005-fy2022-audited", label: "FY2022 Audited Annual", period: "Annual", date: "2022-12-31", badge: "Audited",
        detail: {
          auditor: "Ernst & Young Singapore", reportingStandard: "SFRS", currency: "SGD",
          portfolioValue: "S$840M", nav: "S$328M", occupancy: "87.1%",
          dqScore: "92 / 100", notes: "Two-year prior audited. Available for 3-year trend analysis.",
        },
      },
    ],

    overview: [
      { label: "Fund Size",          value: "S$1.2B",  type: "good" },
      { label: "NAV",                value: "S$383M",  type: "good" },
      { label: "Occupancy Rate",     value: "91.2%",   type: "good" },
      { label: "WALE",               value: "4.2 yrs", type: "good" },
      { label: "Distribution Yield", value: "5.8%",    type: "good" },
    ],
    keyValues: {
      fundManager:    "Orion Capital Pte Ltd",
      assetClass:     "Commercial Office",
      geographyFocus: "Asia Pacific",
    },
  },

  // ── ENT-006: Healthcare ───────────────────────────────────────────────────
  "ENT-006": {
    entityId:      "ENT-006",
    entityName:    "MedCore Diagnostics AG",
    entityType:    "Healthcare",
    licenseNumber: "DE-MED-2019-4821",
    country:       "Germany",

    steps: FULL_STEPS,

    statements: [
      {
        id: "ent006-fy2024-audited", label: "FY2024 Audited Annual", period: "Annual", date: "2024-12-31", badge: "Audited",
        detail: {
          auditor: "BDO AG Germany", reportingStandard: "HGB / IFRS", currency: "EUR",
          totalRevenue: "€842M", operatingProfit: "€263M", netIncome: "€189M",
          dqScore: "97 / 100", notes: "JCI Gold Seal accreditation confirmed. Auditor issued unqualified opinion.",
        },
      },
      {
        id: "ent006-fy2023-audited", label: "FY2023 Audited Annual", period: "Annual", date: "2023-12-31", badge: "Audited",
        detail: {
          auditor: "BDO AG Germany", reportingStandard: "HGB / IFRS", currency: "EUR",
          totalRevenue: "€690M", operatingProfit: "€198M", netIncome: "€141M",
          dqScore: "95 / 100", notes: "Prior year audited financials.",
        },
      },
      {
        id: "ent006-q3-2024", label: "Q3 2024 Management", period: "QTD", date: "2024-09-30", badge: "Management",
        detail: {
          preparedBy: "MedCore Internal Finance", reportingStandard: "Internal", currency: "EUR",
          totalRevenue: "€631M (YTD)",
          dqScore: "72 / 100", notes: "Quarterly management accounts. Unaudited. Full year audit preferred for scoring.",
        },
      },
    ],

    keyValues: {
      bedCapacity:              "1,240",
      occupancyRate:            "87.4%",
      patientVolume2024:        "142,000",
      revenuePerBed:            "€420/day",
      debtServiceCoverageRatio: "2.4x",
    },
    table: {
      columns: [
        { key: "metric",     label: "Healthcare Metric" },
        { key: "eur",        label: "EUR (M)"           },
        { key: "prior_year", label: "Prior Year"        },
        { key: "yoy",        label: "YoY Growth"        },
      ],
      rows: [
        { metric: "Total Revenue",    eur: "€842M", prior_year: "€690M", yoy: "+22.1%" },
        { metric: "Diagnostics Div",  eur: "€521M", prior_year: "€418M", yoy: "+24.6%" },
        { metric: "R&D Expenditure",  eur: "€155M", prior_year: "€127M", yoy: "+22.0%" },
        { metric: "Operating Profit", eur: "€263M", prior_year: "€198M", yoy: "+32.8%" },
        { metric: "Net Income",       eur: "€189M", prior_year: "€141M", yoy: "+34.0%" },
      ],
    },
  },

  // ── ENT-007: Logistics ────────────────────────────────────────────────────
  "ENT-007": {
    entityId:   "ENT-007",
    entityName: "Brasil Logistics Group SA",
    entityType: "Corporate",
    industry:   "Logistics & Transportation",
    country:    "Brazil",

    steps: FULL_STEPS,

    statements: [
      {
        id: "ent007-fy2024-audited", label: "FY2024 Audited Annual", period: "Annual", date: "2024-12-31", badge: "Audited",
        detail: {
          auditor: "Deloitte Brasil", reportingStandard: "BR GAAP / IFRS", currency: "BRL",
          totalRevenue: "R$2,840M", ebitda: "R$630M", netIncome: "R$180M",
          dqScore: "93 / 100", notes: "Audited consolidated financials. ESG disclosure included per CVM requirements.",
        },
      },
      {
        id: "ent007-ttm-sep24", label: "TTM Sep 2024 Reviewed", period: "TTM", date: "2024-09-30", badge: "Reviewed",
        detail: {
          auditor: "Deloitte Brasil (Review)", reportingStandard: "BR GAAP", currency: "BRL",
          totalRevenue: "R$2,710M (annualised)",
          dqScore: "84 / 100", notes: "TTM review. Qualitative assessment not required for this period.",
        },
      },
      {
        id: "ent007-fy2023-audited", label: "FY2023 Audited Annual", period: "Annual", date: "2023-12-31", badge: "Audited",
        detail: {
          auditor: "Deloitte Brasil", reportingStandard: "BR GAAP / IFRS", currency: "BRL",
          totalRevenue: "R$2,593M", ebitda: "R$555M", netIncome: "R$165M",
          dqScore: "91 / 100", notes: "Prior year audited. Used for YoY trend analysis.",
        },
      },
    ],

    overview: [
      { label: "Fleet Size",       value: "4,200",   type: "good" },
      { label: "Warehouses",       value: "38",      type: "good" },
      { label: "On-Time Delivery", value: "88.7%",   type: "warn" },
      { label: "Fuel Cost Ratio",  value: "31.4%",   type: "bad"  },
      { label: "Carbon Emissions", value: "142g/km", type: "bad"  },
      { label: "ESG Rating",       value: "B+",      type: "warn" },
    ],
    table: {
      columns: [
        { key: "metric",     label: "Metric"  },
        { key: "value_2024", label: "2024"    },
        { key: "value_2023", label: "2023"    },
        { key: "target",     label: "Target"  },
        { key: "status",     label: "Status"  },
      ],
      rows: [
        { metric: "Freight Tonnage",  value_2024: "4.2M tons", value_2023: "3.9M tons", target: "5.0M tons", status: "On Track" },
        { metric: "Total Revenue",    value_2024: "R$2,840M",  value_2023: "R$2,593M",  target: "R$3,000M",  status: "On Track" },
        { metric: "EBITDA",           value_2024: "R$630M",    value_2023: "R$555M",    target: "R$680M",    status: "On Track" },
        { metric: "Carbon Emissions", value_2024: "142g/km",   value_2023: "158g/km",   target: "120g/km",   status: "Watch"    },
      ],
    },
  },

  // ── ENT-008: Pension Fund ─────────────────────────────────────────────────
  "ENT-008": {
    entityId:   "ENT-008",
    entityName: "Nordic Pension Fund AS",
    entityType: "Pension Fund",
    country:    "Norway",
    custodian:  "DNB Bank ASA",

    steps: FULL_STEPS,

    // Single annual statement — pension fund
    statements: [
      {
        id: "ent008-fy2024-audited", label: "FY2024 Audited Annual", period: "Annual", date: "2024-12-31", badge: "Audited",
        detail: {
          auditor: "PwC Norway", reportingStandard: "NGAAP / IFRS", currency: "NOK",
          aum: "$4.2B", fundingRatio: "112%", returns1Y: "+9.2%",
          dqScore: "97 / 100", notes: "Annual report filed with Finanstilsynet. Custodian confirmation from DNB Bank ASA received.",
        },
      },
      {
        id: "ent008-fy2023-audited", label: "FY2023 Audited Annual", period: "Annual", date: "2023-12-31", badge: "Audited",
        detail: {
          auditor: "PwC Norway", reportingStandard: "NGAAP / IFRS", currency: "NOK",
          aum: "$3.9B", fundingRatio: "108%", returns1Y: "+7.4%",
          dqScore: "96 / 100", notes: "Prior year audited. Used for comparison.",
        },
      },
    ],

    overview: [
      { label: "AUM",           value: "$4.2B",  type: "good" },
      { label: "Funding Ratio", value: "112%",   type: "good" },
      { label: "Members",       value: "84,200", type: "good" },
      { label: "Sharpe Ratio",  value: "1.84",   type: "good" },
      { label: "1Y Returns",    value: "+9.2%",  type: "good" },
    ],
    table: {
      columns: [
        { key: "asset_class", label: "Asset Class"  },
        { key: "allocation",  label: "Allocation %" },
        { key: "value",       label: "Value (USD)"  },
        { key: "returns_1y",  label: "1Y Returns"   },
        { key: "benchmark",   label: "Benchmark"    },
      ],
      rows: [
        { asset_class: "Global Equities", allocation: "42%", value: "$1.76B", returns_1y: "+18.4%", benchmark: "MSCI World"    },
        { asset_class: "Fixed Income",    allocation: "28%", value: "$1.18B", returns_1y: "+4.2%",  benchmark: "Bloomberg Agg" },
        { asset_class: "Real Estate",     allocation: "15%", value: "$630M",  returns_1y: "+8.1%",  benchmark: "MSCI RE"       },
        { asset_class: "Private Equity",  allocation: "10%", value: "$420M",  returns_1y: "+22.1%", benchmark: "Cambridge PE"  },
        { asset_class: "Infrastructure",  allocation: "5%",  value: "$210M",  returns_1y: "+6.8%",  benchmark: "CPI+4%"        },
      ],
    },
  },

  // ── ENT-009: Fintech Startup ──────────────────────────────────────────────
  "ENT-009": {
    entityId:   "ENT-009",
    entityName: "FinTech Nexus Ltd",
    entityType: "Startup",
    stage:      "Series C",
    country:    "United Kingdom",

    steps: FULL_STEPS,

    statements: [
      {
        id: "ent009-fy2024-mgmt", label: "FY2024 Management Accounts", period: "Annual", date: "2024-12-31", badge: "Management",
        detail: {
          preparedBy: "FinTech Nexus Internal Finance", reportingStandard: "UK GAAP (unaudited)", currency: "USD",
          arr: "$21.2M", burnRate: "$2.1M/mo", runway: "18 months",
          dqScore: "71 / 100", notes: "Management accounts only. First audit expected Q2 2025. Apply additional management overlay.",
        },
      },
      {
        id: "ent009-ttm-sep24", label: "TTM Sep 2024", period: "TTM", date: "2024-09-30", badge: "Reviewed",
        detail: {
          preparedBy: "FinTech Nexus + Tiger Global CFO review", reportingStandard: "UK GAAP", currency: "USD",
          arr: "$17.4M (TTM)", burnRate: "$2.3M/mo",
          dqScore: "76 / 100", notes: "Reviewed by investor CFO team. Qualitative step not required for TTM.",
        },
      },
      {
        id: "ent009-fy2023-compiled", label: "FY2023 Compiled Annual", period: "Annual", date: "2023-12-31", badge: "Compiled",
        detail: {
          preparedBy: "Grant Thornton UK (Compiled)", reportingStandard: "UK GAAP", currency: "USD",
          arr: "$8.2M", netLoss: "-$4.1M",
          dqScore: "68 / 100", notes: "Compiled financials. Earliest available period. Use primarily for trend direction.",
        },
      },
    ],

    overview: [
      { label: "Valuation", value: "$480M",     type: "good" },
      { label: "ARR",       value: "$21.2M",    type: "good" },
      { label: "Burn Rate", value: "$2.1M/mo",  type: "warn" },
      { label: "Runway",    value: "18 months", type: "warn" },
      { label: "LTV/CAC",   value: "4.2x",      type: "good" },
      { label: "Churn",     value: "2.1%",      type: "good" },
    ],
    keyValues: {
      founded:   "2019",
      investors: "Sequoia, Tiger Global, GIC",
      nps:       "72",
    },
    table: {
      columns: [
        { key: "metric", label: "KPI"        },
        { key: "q1",     label: "Q1 2024"    },
        { key: "q2",     label: "Q2 2024"    },
        { key: "q3",     label: "Q3 2024"    },
        { key: "q4",     label: "Q4 2024"    },
        { key: "growth", label: "QoQ Growth" },
      ],
      rows: [
        { metric: "ARR",          q1: "$8.2M", q2: "$11.4M", q3: "$15.8M", q4: "$21.2M", growth: "+34.2%" },
        { metric: "Active Users", q1: "42K",   q2: "61K",    q3: "89K",    q4: "124K",   growth: "+39.3%" },
        { metric: "Gross Margin", q1: "61%",   q2: "64%",    q3: "67%",    q4: "71%",    growth: "+4pp"   },
        { metric: "CAC",          q1: "$124",  q2: "$108",   q3: "$94",    q4: "$82",    growth: "-12.8%" },
        { metric: "Churn Rate",   q1: "3.8%",  q2: "3.2%",  q3: "2.6%",  q4: "2.1%",  growth: "-0.5pp" },
      ],
    },
  },

  // ── ENT-010: Infrastructure Project ──────────────────────────────────────
  "ENT-010": {
    entityId:           "ENT-010",
    entityName:         "Thames Tideway Tunnel",
    entityType:         "Infrastructure",
    sponsor:            "Bazalgette Tunnel Ltd",
    country:            "United Kingdom",
    totalProjectCost:   "£4.2B",
    constructionStatus: "98% Complete",

    // Infrastructure — no Qualitative step
    steps: [
      { id: "entity",       label: "Entity"       },
      { id: "model",        label: "Model Routing" },
      { id: "statement",    label: "Statement"    },
      { id: "quantitative", label: "Quantitative" },
      { id: "adjustments",  label: "Adjustments"  },
      { id: "summary",      label: "PD Summary"   },
    ],

    statements: [
      {
        id: "ent010-fy2024-audited", label: "FY2024 Project Audited", period: "Annual", date: "2024-12-31", badge: "Audited",
        detail: {
          auditor: "Grant Thornton UK", reportingStandard: "IFRS", currency: "GBP",
          totalProjectCost: "£4.2B", constructionProgress: "98%", dscr: "1.92x",
          dqScore: "96 / 100", notes: "Project company audited financials. Ofwat regulatory accounts filed separately.",
        },
      },
      {
        id: "ent010-h1-2024", label: "H1 2024 Progress Report", period: "Interim", date: "2024-06-30", badge: "Interim",
        detail: {
          preparedBy: "Bazalgette Tunnel Ltd Internal", reportingStandard: "IFRS (unaudited)", currency: "GBP",
          constructionProgress: "94%", dscr: "1.88x",
          dqScore: "82 / 100", notes: "Half-year progress report submitted to lenders. Construction on track.",
        },
      },
      {
        id: "ent010-fy2023-audited", label: "FY2023 Project Audited", period: "Annual", date: "2023-12-31", badge: "Audited",
        detail: {
          auditor: "Grant Thornton UK", reportingStandard: "IFRS", currency: "GBP",
          totalProjectCost: "£4.1B", constructionProgress: "87%", dscr: "1.74x",
          dqScore: "94 / 100", notes: "Prior year project audited financials.",
        },
      },
    ],

    keyValues: {
      equityStake:  "22%",
      dscr:         "1.92x",
      projectedIRR: "+9.8%",
      moic:         "2.4x",
      projectType:  "Water Infrastructure",
    },
    table: {
      columns: [
        { key: "project", label: "Project"       },
        { key: "country", label: "Country"       },
        { key: "value",   label: "Asset Value"   },
        { key: "equity",  label: "Equity Stake"  },
        { key: "dscr",    label: "DSCR"          },
        { key: "irr",     label: "Projected IRR" },
        { key: "status",  label: "Status"        },
      ],
      rows: [
        { project: "Thames Tideway",     country: "UK",      value: "$4.2B", equity: "22%", dscr: "1.92x", irr: "+9.8%",  status: "Active" },
        { project: "A9 Motorway",        country: "Germany", value: "$2.8B", equity: "18%", dscr: "1.75x", irr: "+8.4%",  status: "Active" },
        { project: "Heathrow T5 Ext",    country: "UK",      value: "$1.9B", equity: "31%", dscr: "2.10x", irr: "+12.1%", status: "Active" },
        { project: "North Sea Wind Farm",country: "UK",      value: "$2.1B", equity: "28%", dscr: "1.88x", irr: "+11.4%", status: "Active" },
        { project: "Bavaria Solar Park", country: "Germany", value: "$0.8B", equity: "35%", dscr: "1.72x", irr: "+8.9%",  status: "Active" },
      ],
    },
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = (searchParams.get("entityId") ?? "").toUpperCase().trim();

  if (!entityId) {
    return NextResponse.json({ error: "entityId is required" }, { status: 400 });
  }

  const data = ENTITIES[entityId];

  if (!data) {
    return NextResponse.json(
      { error: `"${entityId}" not found. Try ENT-001 through ENT-010.` },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}