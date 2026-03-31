import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// FIELDS API
//
// POST { statementId, entityId, modelId }
// Returns pre-filled field values, pd_grade, and sections.
//
// Each field has an optional `value` — the system's best known value
// from the financial spreading. User can edit any value.
//
// pd_grade and pd_label are the API's computed starting grade.
// The UI adjusts this live as the user edits.
// ─────────────────────────────────────────────────────────────────────────────

type Field = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "date";
  required?: boolean;
  options?: string[];
  unit?: string;
  floor?: string;
  cap?: string;
  badge?: string;
  hint?: string;
  value?: string;       // ← pre-filled value from financial spreading
};

type Section =
  | { type: "fields";   title: string; visible: boolean; fields: Field[] }
  | { type: "overview"; title: string; visible: boolean; items: { label: string; value: string; type: string }[] }
  | { type: "table";    title: string; visible: boolean; columns: { key: string; label: string }[]; rows: Record<string, string>[] }
  | { type: "keyvalue"; title: string; visible: boolean; data: Record<string, string> };

// Full response shape
type FieldsResponse = {
  title: string;
  subtitle: string;
  pd_grade: number;      // ← API-computed starting grade
  pd_label: string;      // ← human-readable label for that grade
  sections: Section[];
};

const FIELDS: Record<string, FieldsResponse> = {

  // ── ENT-001 FY2024 Audited — quant visible + qual visible ────────────────
  "ent001-fy2024-audited": {
    title: "FY2024 Audited Annual — Quantitative & Qualitative",
    subtitle: "Apex Global Corporation · C&I Commercial Model",
    pd_grade: 3,
    pd_label: "Pass — Strong",
    sections: [
      {
        type: "overview",
        title: "Spreading Summary",
        visible: true,
        items: [
          { label: "Statement Type", value: "Audited Annual",  type: "good"    },
          { label: "Fiscal Year End",value: "2024-12-31",      type: "neutral" },
          { label: "Currency",       value: "USD",             type: "neutral" },
          { label: "Auditor",        value: "Deloitte & Co",   type: "good"    },
          { label: "DQ Score",       value: "96 / 100",        type: "good"    },
        ],
      },
      {
        type: "fields",
        title: "Quantitative Inputs",
        visible: true,
        fields: [
          { key: "dscr",          label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  floor: "0.50x", cap: "3.00x", badge: "REQ", value: "2.41" },
          { key: "leverage",      label: "Total Debt / EBITDA",         type: "number", required: true,  unit: "x",  floor: "0.0x",  cap: "10.0x", badge: "REQ", value: "1.59" },
          { key: "current_ratio", label: "Current Ratio",               type: "number", required: true,  unit: "x",  floor: "0.50x", cap: "5.00x", badge: "REQ", value: "2.10" },
          { key: "profit_margin", label: "Net Profit Margin",           type: "number", required: true,  unit: "%",  floor: "-50%",  cap: "50%",   badge: "REQ", value: "19.2" },
          { key: "rev_growth",    label: "Revenue Growth YoY",          type: "number", required: false, unit: "%",  floor: "-30%",  cap: "50%",   badge: "OPT", value: "14.2", hint: "Imputed from NAICS median" },
          { key: "tang_nw",       label: "Tangible Net Worth",          type: "number", required: true,  unit: "$M", badge: "REQ", value: "6.1" },
        ],
      },
      {
        type: "fields",
        title: "Qualitative Assessment",
        visible: true,
        fields: [
          { key: "mgmt_quality",  label: "Management Quality",   type: "select", required: true, options: ["Strong", "Adequate", "Weak", "Critical"],                       badge: "REQ", value: "Strong"      },
          { key: "industry_risk", label: "Industry Risk",        type: "select", required: true, options: ["Low", "Moderate", "Elevated", "High"],                          badge: "REQ", value: "Low"         },
          { key: "market_pos",    label: "Market Position",      type: "select", required: true, options: ["Dominant", "Established", "Competitive", "Marginal"],           badge: "REQ", value: "Established" },
          { key: "fin_reporting", label: "Financial Reporting",  type: "select", required: true, options: ["Audited", "Reviewed", "Compiled", "Internal Only"],             badge: "REQ", value: "Audited"     },
          { key: "borrower_size", label: "Borrower Size / Tier", type: "select", required: true, options: ["Large", "Mid-Market", "Small"],                                 badge: "REQ", value: "Mid-Market"  },
          { key: "biz_outlook",   label: "Business Outlook",     type: "select", required: true, options: ["Positive", "Stable", "Uncertain", "Deteriorating"],             badge: "REQ", value: "Positive"    },
        ],
      },
    ],
  },

  // ── ENT-001 FY2023 Audited ───────────────────────────────────────────────
  "ent001-fy2023-audited": {
    title: "FY2023 Audited Annual — Quantitative & Qualitative",
    subtitle: "Apex Global Corporation · C&I Commercial Model",
    pd_grade: 4,
    pd_label: "Pass — Satisfactory",
    sections: [
      {
        type: "overview",
        title: "Spreading Summary",
        visible: true,
        items: [
          { label: "Statement Type", value: "Audited Annual", type: "good"    },
          { label: "Fiscal Year End",value: "2023-12-31",     type: "neutral" },
          { label: "Currency",       value: "USD",            type: "neutral" },
          { label: "DQ Score",       value: "91 / 100",       type: "good"    },
        ],
      },
      {
        type: "fields",
        title: "Quantitative Inputs",
        visible: true,
        fields: [
          { key: "dscr",          label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  floor: "0.50x", cap: "3.00x", badge: "REQ", value: "1.98" },
          { key: "leverage",      label: "Total Debt / EBITDA",         type: "number", required: true,  unit: "x",  floor: "0.0x",  cap: "10.0x", badge: "REQ", value: "2.10" },
          { key: "profit_margin", label: "Net Profit Margin",           type: "number", required: true,  unit: "%",  floor: "-50%",  cap: "50%",   badge: "REQ", value: "17.8" },
          { key: "tang_nw",       label: "Tangible Net Worth",          type: "number", required: false, unit: "$M", badge: "OPT", hint: "Prior year — optional" },
        ],
      },
      {
        type: "fields",
        title: "Qualitative Assessment",
        visible: true,
        fields: [
          { key: "mgmt_quality",  label: "Management Quality",  type: "select", required: true, options: ["Strong", "Adequate", "Weak", "Critical"],           badge: "REQ", value: "Strong"   },
          { key: "industry_risk", label: "Industry Risk",       type: "select", required: true, options: ["Low", "Moderate", "Elevated", "High"],              badge: "REQ", value: "Low"      },
          { key: "biz_outlook",   label: "Business Outlook",    type: "select", required: true, options: ["Positive", "Stable", "Uncertain", "Deteriorating"], badge: "REQ", value: "Positive" },
        ],
      },
    ],
  },

  // ── ENT-001 TTM Reviewed — qual hidden ──────────────────────────────────
  "ent001-ttm-reviewed": {
    title: "TTM Sep 2024 Reviewed — Quantitative Only",
    subtitle: "Apex Global Corporation · C&I Commercial Model · TTM period",
    pd_grade: 5,
    pd_label: "Pass — Acceptable",
    sections: [
      {
        type: "overview",
        title: "Spreading Summary",
        visible: true,
        items: [
          { label: "Statement Type", value: "TTM Reviewed",                    type: "warn"    },
          { label: "Period End",     value: "2024-09-30",                      type: "neutral" },
          { label: "DQ Score",       value: "82 / 100",                        type: "warn"    },
          { label: "Note",           value: "TTM — qualitative not required",  type: "warn"    },
        ],
      },
      {
        type: "fields",
        title: "Quantitative Inputs",
        visible: true,
        fields: [
          { key: "dscr",          label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  badge: "REQ", value: "1.74" },
          { key: "profit_margin", label: "Net Profit Margin",           type: "number", required: true,  unit: "%",  badge: "REQ", value: "16.4" },
          { key: "rev_growth",    label: "Revenue Growth YoY",          type: "number", required: false, unit: "%",  badge: "OPT" },
        ],
      },
      { type: "fields", title: "Qualitative Assessment", visible: false, fields: [] },
    ],
  },

  // ── ENT-002 FY2024 Audited — FI model ───────────────────────────────────
  "ent002-fy2024-audited": {
    title: "FY2024 Audited Annual — FI Model Inputs",
    subtitle: "Meridian Capital Bank · Financial Institution Model",
    pd_grade: 5,
    pd_label: "Pass — Acceptable",
    sections: [
      {
        type: "overview",
        title: "Regulatory Summary",
        visible: true,
        items: [
          { label: "Regulatory Tier", value: "Tier 1",    type: "good"    },
          { label: "Reporting Std",   value: "IFRS",      type: "neutral" },
          { label: "Regulator",       value: "PRA / FCA", type: "neutral" },
          { label: "DQ Score",        value: "98 / 100",  type: "good"    },
        ],
      },
      {
        type: "fields",
        title: "Capital & Liquidity",
        visible: true,
        fields: [
          { key: "cet1_ratio",  label: "CET1 Capital Ratio",        type: "number", required: true,  unit: "%", floor: "4.5%", cap: "30%",  badge: "REQ", value: "18.2" },
          { key: "tier1_ratio", label: "Tier 1 Capital Ratio",      type: "number", required: true,  unit: "%", floor: "6.0%", cap: "30%",  badge: "REQ", value: "18.2" },
          { key: "lcr",         label: "Liquidity Coverage Ratio",  type: "number", required: true,  unit: "%", floor: "100%", cap: "300%", badge: "REQ", value: "142"  },
          { key: "nsfr",        label: "Net Stable Funding Ratio",  type: "number", required: false, unit: "%", badge: "OPT" },
        ],
      },
      {
        type: "fields",
        title: "Asset Quality",
        visible: true,
        fields: [
          { key: "npl_ratio", label: "Non-Performing Loan Ratio", type: "number", required: true, unit: "%", floor: "0%", cap: "30%",  badge: "REQ", value: "5.0" },
          { key: "coverage",  label: "NPL Coverage Ratio",        type: "number", required: true, unit: "%", floor: "0%", cap: "200%", badge: "REQ", value: "68"  },
          { key: "roe",       label: "Return on Equity",          type: "number", required: true, unit: "%", badge: "REQ", value: "7.4" },
          { key: "nim",       label: "Net Interest Margin",       type: "number", required: false, unit: "%", badge: "OPT" },
        ],
      },
      {
        type: "fields",
        title: "Qualitative",
        visible: true,
        fields: [
          { key: "governance",  label: "Governance Quality",        type: "select", required: true, options: ["Strong", "Adequate", "Weak", "Critical"],    badge: "REQ", value: "Adequate" },
          { key: "risk_mgmt",   label: "Risk Management Framework", type: "select", required: true, options: ["Advanced", "Standard", "Basic", "Deficient"],badge: "REQ", value: "Standard" },
          { key: "stress_test", label: "Stress Test Result",        type: "select", required: true, options: ["Pass", "Conditional Pass", "Fail"],           badge: "REQ", value: "Pass"     },
        ],
      },
    ],
  },

  // ── ENT-002 Management — qual hidden ────────────────────────────────────
  "ent002-mgmt-2024": {
    title: "2024 Management Accounts — Interim Assessment",
    subtitle: "Meridian Capital Bank · Financial Institution Model · Interim",
    pd_grade: 6,
    pd_label: "Pass — Acceptable",
    sections: [
      {
        type: "overview",
        title: "Statement Quality",
        visible: true,
        items: [
          { label: "Statement Type", value: "Management Accounts",        type: "warn" },
          { label: "DQ Score",       value: "74 / 100",                   type: "warn" },
          { label: "Note",           value: "Unaudited — limited weight", type: "warn" },
        ],
      },
      {
        type: "fields",
        title: "Key Ratios",
        visible: true,
        fields: [
          { key: "cet1_ratio", label: "CET1 Capital Ratio",        type: "number", required: true,  unit: "%", badge: "REQ", value: "17.8" },
          { key: "npl_ratio",  label: "Non-Performing Loan Ratio", type: "number", required: true,  unit: "%", badge: "REQ", value: "5.2"  },
          { key: "lcr",        label: "Liquidity Coverage Ratio",  type: "number", required: false, unit: "%", badge: "OPT" },
        ],
      },
      { type: "fields", title: "Qualitative", visible: false, fields: [] },
    ],
  },

  // ── ENT-003 FY2023 Compiled — SME ───────────────────────────────────────
  "ent003-fy2023-compiled": {
    title: "FY2023 Compiled Annual — Small Business Inputs",
    subtitle: "Redstone SME Ventures · Small Business Model",
    pd_grade: 8,
    pd_label: "Special Mention",
    sections: [
      {
        type: "overview",
        title: "Statement Quality",
        visible: true,
        items: [
          { label: "Statement Type", value: "Compiled Annual", type: "warn"    },
          { label: "Fiscal Year End",value: "2023-03-31",      type: "neutral" },
          { label: "DQ Score",       value: "68 / 100",        type: "warn"    },
          { label: "Currency",       value: "INR",             type: "neutral" },
        ],
      },
      {
        type: "fields",
        title: "SBA Quantitative Inputs",
        visible: true,
        fields: [
          { key: "dscr",           label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  floor: "1.00x", cap: "3.00x", badge: "REQ", value: "1.12" },
          { key: "equity_inject",  label: "Equity Injection %",          type: "number", required: true,  unit: "%",  floor: "5%",    cap: "50%",   badge: "REQ", value: "18"   },
          { key: "global_cashflow",label: "Global Cash Flow",            type: "number", required: true,  unit: "₹K", badge: "REQ", value: "83"   },
          { key: "collateral_cov", label: "Collateral Coverage",         type: "number", required: false, unit: "%",  badge: "OPT", hint: "Will impute from NAICS median if blank" },
        ],
      },
      {
        type: "fields",
        title: "Owner & Business Assessment",
        visible: true,
        fields: [
          { key: "owner_exp",       label: "Owner Experience",        type: "select", required: true, options: ["10+ yrs industry", "5–10 yrs", "1–5 yrs", "<1 yr"],                badge: "REQ", value: "5–10 yrs"     },
          { key: "biz_plan",        label: "Business Plan Quality",   type: "select", required: true, options: ["Comprehensive", "Adequate", "Basic", "Insufficient"],             badge: "REQ", value: "Adequate"      },
          { key: "credit_history",  label: "Personal Credit History", type: "select", required: true, options: ["Excellent 750+", "Good 680–749", "Fair 620–679", "Poor <620"],   badge: "REQ", value: "Good 680–749"  },
          { key: "industry_outlook",label: "Industry Outlook",        type: "select", required: true, options: ["Growing", "Stable", "Declining", "Distressed"],                  badge: "REQ", value: "Stable"        },
        ],
      },
    ],
  },

  // ── ENT-004 IMF 2024 — Sovereign, no qual ───────────────────────────────
  "ent004-2024-imf": {
    title: "2024 IMF Article IV — Sovereign Model Inputs",
    subtitle: "Republic of Aldoria · Sovereign Model",
    pd_grade: 4,
    pd_label: "Pass — Satisfactory",
    sections: [
      {
        type: "keyvalue",
        title: "IMF Assessment Context",
        visible: true,
        data: { articleIVYear: "2024", imfMissionDate: "October 2024", programStatus: "None — Article IV only", accessToCMF: "Yes" },
      },
      {
        type: "fields",
        title: "Fiscal & Macro Inputs",
        visible: true,
        fields: [
          { key: "gdp_growth",      label: "Real GDP Growth Rate",  type: "number", required: true,  unit: "%",  floor: "-10%", cap: "20%",  badge: "REQ", value: "3.8"  },
          { key: "inflation",       label: "CPI Inflation Rate",    type: "number", required: true,  unit: "%",  floor: "0%",   cap: "100%", badge: "REQ", value: "2.4"  },
          { key: "debt_gdp",        label: "Public Debt / GDP",     type: "number", required: true,  unit: "%",  floor: "0%",   cap: "200%", badge: "REQ", value: "52.4" },
          { key: "fiscal_balance",  label: "Fiscal Balance / GDP",  type: "number", required: true,  unit: "%",  floor: "-30%", cap: "20%",  badge: "REQ", value: "-2.1" },
          { key: "reserves_months", label: "Import Cover (months)", type: "number", required: true,  unit: "mo", floor: "0",    cap: "36",   badge: "REQ", value: "8.2"  },
          { key: "unemployment",    label: "Unemployment Rate",     type: "number", required: false, unit: "%",  badge: "OPT", value: "4.1" },
        ],
      },
      {
        type: "fields",
        title: "Institutional Assessment",
        visible: true,
        fields: [
          { key: "political_risk", label: "Political Stability",      type: "select", required: true, options: ["Stable", "Moderate Risk", "Elevated Risk", "High Risk"],  badge: "REQ", value: "Stable"    },
          { key: "rule_of_law",    label: "Rule of Law",              type: "select", required: true, options: ["Strong", "Adequate", "Weak", "Absent"],                   badge: "REQ", value: "Adequate"  },
          { key: "imf_compliance", label: "IMF Programme Compliance", type: "select", required: true, options: ["Full", "Substantial", "Partial", "Non-Compliant", "N/A"], badge: "REQ", value: "N/A"       },
        ],
      },
      { type: "fields", title: "Qualitative Assessment", visible: false, fields: [] },
    ],
  },

  // ── ENT-005 FY2024 CRE ───────────────────────────────────────────────────
  "ent005-fy2024-audited": {
    title: "FY2024 Audited Annual — CRE Model Inputs",
    subtitle: "Orion Real Estate Fund III · CRE Income Property Model",
    pd_grade: 3,
    pd_label: "Pass — Strong",
    sections: [
      {
        type: "overview",
        title: "Portfolio Snapshot",
        visible: true,
        items: [
          { label: "Total Portfolio Value", value: "S$920M",   type: "good" },
          { label: "Occupancy",             value: "91.2%",    type: "good" },
          { label: "WALE",                  value: "4.2 yrs",  type: "good" },
          { label: "DQ Score",              value: "95 / 100", type: "good" },
        ],
      },
      {
        type: "fields",
        title: "CRE Quantitative Inputs",
        visible: true,
        fields: [
          { key: "dscr",       label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",   floor: "1.00x", cap: "3.00x", badge: "REQ", value: "2.14" },
          { key: "ltv",        label: "Loan-to-Value Ratio",         type: "number", required: true,  unit: "%",   floor: "30%",   cap: "90%",   badge: "REQ", value: "58.3" },
          { key: "occupancy",  label: "Occupancy Rate",              type: "number", required: true,  unit: "%",   floor: "50%",   cap: "100%",  badge: "REQ", value: "91.2" },
          { key: "cap_rate",   label: "Capitalization Rate",         type: "number", required: true,  unit: "%",   floor: "3%",    cap: "12%",   badge: "REQ", value: "5.8"  },
          { key: "noi_growth", label: "NOI Growth YoY",              type: "number", required: false, unit: "%",   badge: "OPT", hint: "Will impute from sub-market avg if blank" },
          { key: "wale",       label: "Weighted Avg Lease Expiry",   type: "number", required: false, unit: "yrs", badge: "OPT", value: "4.2"  },
        ],
      },
      {
        type: "fields",
        title: "Property & Market Assessment",
        visible: true,
        fields: [
          { key: "property_quality", label: "Property Quality",   type: "select", required: true, options: ["Class A", "Class B", "Class C", "Distressed"],     badge: "REQ", value: "Class A"          },
          { key: "location",         label: "Location / Market",  type: "select", required: true, options: ["Primary CBD", "Secondary", "Tertiary", "Remote"],   badge: "REQ", value: "Primary CBD"      },
          { key: "tenant_quality",   label: "Tenant Quality",     type: "select", required: true, options: ["Investment Grade", "Strong", "Moderate", "Weak"],   badge: "REQ", value: "Investment Grade" },
          { key: "env_risk",         label: "Environmental Risk", type: "select", required: true, options: ["None", "Phase I Required", "Remediation Required"], badge: "REQ", value: "None"             },
        ],
      },
    ],
  },

  // ── ENT-009 FY2024 Management — startup ─────────────────────────────────
  "ent009-fy2024-mgmt": {
    title: "FY2024 Management Accounts — SBA Model Inputs",
    subtitle: "FinTech Nexus Ltd · Small Business Model · Series C",
    pd_grade: 7,
    pd_label: "Pass — Acceptable",
    sections: [
      {
        type: "overview",
        title: "Statement Quality",
        visible: true,
        items: [
          { label: "Statement Type", value: "Management Accounts",                type: "warn"    },
          { label: "Period",         value: "FY2024",                             type: "neutral" },
          { label: "DQ Score",       value: "71 / 100",                           type: "warn"    },
          { label: "Note",           value: "Unaudited — apply management overlay", type: "warn"  },
        ],
      },
      {
        type: "fields",
        title: "SBA Quantitative Inputs",
        visible: true,
        fields: [
          { key: "dscr",            label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  badge: "REQ", value: "1.31" },
          { key: "equity_inject",   label: "Equity Injection %",          type: "number", required: true,  unit: "%",  badge: "REQ", value: "22"   },
          { key: "global_cashflow", label: "Global Cash Flow",            type: "number", required: true,  unit: "$K", badge: "REQ", value: "1750" },
          { key: "burn_rate",       label: "Monthly Burn Rate",           type: "number", required: false, unit: "$K", badge: "OPT", value: "2100" },
          { key: "runway",          label: "Runway (months)",             type: "number", required: false, unit: "mo", badge: "OPT", value: "18"   },
        ],
      },
      {
        type: "fields",
        title: "Startup Assessment",
        visible: false,
        fields: [
          { key: "founder_exp",   label: "Founder / Team Experience", type: "select", required: true, options: ["Domain experts 10+ yrs", "Relevant 5–10 yrs", "Some relevant", "Limited"], badge: "REQ" },
          { key: "product_stage", label: "Product Stage",             type: "select", required: true, options: ["Revenue & scaling", "Early revenue", "Pre-revenue", "Concept"],            badge: "REQ" },
          { key: "investor_qual", label: "Investor Quality",          type: "select", required: true, options: ["Tier 1 VC", "Institutional", "Angel / Seed", "None"],                      badge: "REQ" },
          { key: "market_size",   label: "Total Addressable Market",  type: "select", required: true, options: [">$10B", "$1B–$10B", "$100M–$1B", "<$100M"],                               badge: "REQ" },
        ],
      },
    ],
  },

  // ── ENT-010 FY2024 Infrastructure — no qual ─────────────────────────────
  "ent010-fy2024-audited": {
    title: "FY2024 Project Audited — Project Finance Inputs",
    subtitle: "Thames Tideway Tunnel · Project Finance Model",
    pd_grade: 4,
    pd_label: "Pass — Satisfactory",
    sections: [
      {
        type: "keyvalue",
        title: "Project Details",
        visible: true,
        data: { sponsor: "Bazalgette Tunnel Ltd", constructionStatus: "98% Complete", expectedCompletion: "Q2 2025", projectDuration: "12 years", offtakeArrangement: "Regulated revenue — Ofwat" },
      },
      {
        type: "fields",
        title: "Project Finance Quantitative",
        visible: true,
        fields: [
          { key: "dscr",       label: "Debt Service Coverage Ratio",  type: "number", required: true,  unit: "x",  floor: "1.20x", cap: "3.00x", badge: "REQ", value: "1.92" },
          { key: "llcr",       label: "Loan Life Coverage Ratio",     type: "number", required: true,  unit: "x",  floor: "1.20x", cap: "3.00x", badge: "REQ", value: "2.14" },
          { key: "plcr",       label: "Project Life Coverage Ratio",  type: "number", required: true,  unit: "x",  badge: "REQ", value: "2.31" },
          { key: "equity_irr", label: "Projected Equity IRR",         type: "number", required: true,  unit: "%",  badge: "REQ", value: "9.8"  },
          { key: "debt_share", label: "Debt / Total Project Cost",    type: "number", required: true,  unit: "%",  floor: "0%", cap: "95%", badge: "REQ", value: "78"   },
          { key: "moic",       label: "Multiple on Invested Capital", type: "number", required: false, unit: "x",  badge: "OPT", value: "2.4"  },
        ],
      },
      {
        type: "fields",
        title: "Structural & Qualitative",
        visible: true,
        fields: [
          { key: "offtake",     label: "Offtake / Revenue Certainty", type: "select", required: true, options: ["Regulated / guaranteed", "Long-term contracted", "Merchant / spot", "None"], badge: "REQ", value: "Regulated / guaranteed" },
          { key: "constr_risk", label: "Construction Risk",           type: "select", required: true, options: ["Complete", "Near complete >90%", "In progress", "Early stage"],              badge: "REQ", value: "Near complete >90%"     },
          { key: "sponsor_str", label: "Sponsor Strength",            type: "select", required: true, options: ["Investment grade", "Strong", "Adequate", "Weak"],                            badge: "REQ", value: "Investment grade"       },
          { key: "country_risk",label: "Country / Regulatory Risk",   type: "select", required: true, options: ["Low", "Moderate", "Elevated", "High"],                                       badge: "REQ", value: "Low"                    },
        ],
      },
      { type: "fields", title: "Qualitative Assessment", visible: false, fields: [] },
    ],
  },
};

// Fallback for unmapped statement IDs
function buildFallback(statementId: string): FieldsResponse {
  return {
    title:    "Statement Analysis",
    subtitle: `Statement ID: ${statementId}`,
    pd_grade: 6,
    pd_label: "Pass — Acceptable",
    sections: [
      {
        type: "overview", title: "Statement Info", visible: true,
        items: [
          { label: "Statement ID", value: statementId,    type: "neutral" },
          { label: "Status",       value: "Data pending", type: "warn"    },
        ],
      },
      {
        type: "fields", title: "Core Inputs", visible: true,
        fields: [
          { key: "dscr",          label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  badge: "REQ" },
          { key: "profit_margin", label: "Net Profit Margin",           type: "number", required: true,  unit: "%",  badge: "REQ" },
          { key: "mgmt_quality",  label: "Management Quality",          type: "select", required: true,  options: ["Strong", "Adequate", "Weak", "Critical"], badge: "REQ" },
          { key: "notes",         label: "Underwriter Notes",           type: "textarea", required: false, badge: "OPT" },
        ],
      },
      { type: "fields", title: "Qualitative Assessment", visible: true, fields: [
        { key: "biz_outlook", label: "Business Outlook", type: "select", required: true, options: ["Positive", "Stable", "Uncertain", "Deteriorating"], badge: "REQ" },
      ]},
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { statementId } = await req.json();
    if (!statementId) {
      return NextResponse.json({ error: "statementId is required" }, { status: 400 });
    }
    const data = FIELDS[statementId] ?? buildFallback(statementId);
    await new Promise(r => setTimeout(r, 350));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to load fields" }, { status: 500 });
  }
}