import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// MODEL CONFIG SERVICE
//
// GET /api/model-config?modelId=CI
//
// Returns a typed JSON schema that drives the entire UI for that model.
// The UI reads this config and renders fields dynamically — no hardcoding.
//
// Each modelId returns a completely different config shape.
// New model IDs can be added here without any UI code changes.
//
// Config shape the UI understands:
//   model_id         — identifier
//   label            — display name
//   quant_required   — boolean: show/gate Quantitative step
//   qual_required    — boolean: show/gate Qualitative step
//   max_grade        — PD grade ceiling
//   quant_fields[]   — field definitions for Quantitative step
//   qual_fields[]    — dropdown definitions for Qualitative step
//   adj_enabled[]    — which adjustment panels to show
//   imputation_note  — shown in DQ agent banner
//   methodology_note — shown on step header
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_CONFIGS: Record<string, unknown> = {

  // ── C&I Commercial ────────────────────────────────────────────────────────
  "CI": {
    model_id:         "CI",
    label:            "C&I Commercial",
    quant_required:   true,
    qual_required:    true,
    max_grade:        14,
    methodology_note: "Cash flow-based underwriting. DSCR and leverage are primary drivers.",
    imputation_note:  "Missing optional fields will be imputed from NAICS peer median (RMA Annual Statement Studies).",
    quant_fields: [
      { key: "dscr",          label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  floor: "0.50", cap: "3.00", weight: 25, badge: "REQ", impute_source: "NAICS median" },
      { key: "leverage",      label: "Total Debt / EBITDA",         type: "number", required: true,  unit: "x",  floor: "0.0",  cap: "10.0", weight: 20, badge: "REQ" },
      { key: "current_ratio", label: "Current Ratio",               type: "number", required: true,  unit: "x",  floor: "0.50", cap: "5.00", weight: 15, badge: "REQ" },
      { key: "profit_margin", label: "Net Profit Margin",           type: "number", required: true,  unit: "%",  floor: "-50",  cap: "50",   weight: 20, badge: "REQ" },
      { key: "rev_growth",    label: "Revenue Growth YoY",          type: "number", required: false, unit: "%",  floor: "-30",  cap: "50",   weight: 10, badge: "OPT", impute_source: "NAICS median" },
      { key: "tang_nw",       label: "Tangible Net Worth",          type: "number", required: true,  unit: "$M",                             weight: 10, badge: "REQ" },
    ],
    qual_fields: [
      { key: "mgmt_quality",  label: "Management Quality",   option_count: 4, weight: 20, options: ["Strong", "Adequate", "Weak", "Critical"]                        },
      { key: "industry_risk", label: "Industry Risk",        option_count: 4, weight: 20, options: ["Low", "Moderate", "Elevated", "High"]                           },
      { key: "market_pos",    label: "Market Position",      option_count: 4, weight: 15, options: ["Dominant", "Established", "Competitive", "Marginal"]            },
      { key: "fin_reporting", label: "Financial Reporting",  option_count: 4, weight: 15, options: ["Audited", "Reviewed", "Compiled", "Internal Only"]              },
      { key: "borrower_size", label: "Borrower Size / Tier", option_count: 3, weight: 15, options: ["Large", "Mid-Market", "Small"]                                  },
      { key: "biz_outlook",   label: "Business Outlook",     option_count: 4, weight: 15, options: ["Positive", "Stable", "Uncertain", "Deteriorating"]              },
    ],
    adj_enabled: ["related_party", "reg_class", "expert_judgment", "full_guarantee"],
  },

  // ── CRE Income Property ───────────────────────────────────────────────────
  "CRE": {
    model_id:         "CRE",
    label:            "CRE Income Property",
    quant_required:   true,
    qual_required:    true,
    max_grade:        12,
    methodology_note: "NOI-based underwriting. DSCR and LTV are primary drivers. Sub-market benchmarks applied.",
    imputation_note:  "Missing optional fields imputed from sub-market averages (CoStar / CBRE benchmarks).",
    quant_fields: [
      { key: "dscr",       label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",   floor: "1.00", cap: "3.00",  weight: 30, badge: "REQ", impute_source: "sub-market avg" },
      { key: "ltv",        label: "Loan-to-Value Ratio",         type: "number", required: true,  unit: "%",   floor: "30",   cap: "90",    weight: 25, badge: "REQ" },
      { key: "occupancy",  label: "Occupancy Rate",              type: "number", required: true,  unit: "%",   floor: "50",   cap: "100",   weight: 20, badge: "REQ", impute_source: "sub-market avg" },
      { key: "cap_rate",   label: "Capitalization Rate",         type: "number", required: true,  unit: "%",   floor: "3",    cap: "12",    weight: 10, badge: "REQ" },
      { key: "noi_growth", label: "NOI Growth YoY",              type: "number", required: false, unit: "%",   floor: "-20",  cap: "30",    weight: 10, badge: "OPT", impute_source: "sub-market avg" },
      { key: "wale",       label: "Weighted Avg Lease Expiry",   type: "number", required: false, unit: "yrs", floor: "0.5",  cap: "15",    weight: 5,  badge: "OPT" },
    ],
    qual_fields: [
      { key: "property_quality", label: "Property Quality",   option_count: 4, weight: 25, options: ["Class A", "Class B", "Class C", "Distressed"]                 },
      { key: "location",         label: "Location / Market",  option_count: 4, weight: 25, options: ["Primary CBD", "Secondary", "Tertiary", "Remote"]              },
      { key: "tenant_quality",   label: "Tenant Quality",     option_count: 4, weight: 20, options: ["Investment Grade", "Strong", "Moderate", "Weak"]              },
      { key: "sponsor_exp",      label: "Sponsor Experience", option_count: 4, weight: 15, options: ["20+ yrs", "10–20 yrs", "5–10 yrs", "<5 yrs"]                 },
      { key: "env_risk",         label: "Environmental Risk", option_count: 3, weight: 15, options: ["None", "Phase I Required", "Remediation Required"]            },
    ],
    adj_enabled: ["related_party", "reg_class", "expert_judgment", "full_guarantee"],
  },

  // ── Small Business (SBA) ──────────────────────────────────────────────────
  "SBA": {
    model_id:         "SBA",
    label:            "Small Business",
    quant_required:   true,
    qual_required:    true,
    max_grade:        8,
    methodology_note: "Simplified scorecard. Global cash flow and owner credit are primary drivers.",
    imputation_note:  "Missing fields imputed from SBA industry peer medians.",
    quant_fields: [
      { key: "dscr",            label: "Debt Service Coverage Ratio", type: "number", required: true,  unit: "x",  floor: "1.00", cap: "3.00",  weight: 35, badge: "REQ", impute_source: "NAICS median" },
      { key: "equity_inject",   label: "Equity Injection %",          type: "number", required: true,  unit: "%",  floor: "5",    cap: "50",    weight: 25, badge: "REQ" },
      { key: "global_cashflow", label: "Global Cash Flow",            type: "number", required: true,  unit: "$K",                               weight: 25, badge: "REQ" },
      { key: "collateral_cov",  label: "Collateral Coverage",         type: "number", required: false, unit: "%",  floor: "0",    cap: "200",   weight: 15, badge: "OPT", impute_source: "NAICS median" },
    ],
    qual_fields: [
      { key: "owner_exp",       label: "Owner Experience",        option_count: 4, weight: 30, options: ["10+ yrs industry", "5–10 yrs", "1–5 yrs", "<1 yr"]       },
      { key: "biz_plan",        label: "Business Plan Quality",   option_count: 4, weight: 25, options: ["Comprehensive", "Adequate", "Basic", "Insufficient"]      },
      { key: "industry_outlook",label: "Industry Outlook",        option_count: 4, weight: 25, options: ["Growing", "Stable", "Declining", "Distressed"]            },
      { key: "credit_history",  label: "Personal Credit History", option_count: 4, weight: 20, options: ["Excellent 750+", "Good 680–749", "Fair 620–679", "Poor <620"] },
    ],
    adj_enabled: ["related_party", "expert_judgment", "full_guarantee"],
  },

  // ── Financial Institution ─────────────────────────────────────────────────
  "FI": {
    model_id:         "FI",
    label:            "Financial Institution",
    quant_required:   true,
    qual_required:    true,
    max_grade:        12,
    methodology_note: "Regulatory capital-based underwriting. CET1 and NPL ratio are primary drivers.",
    imputation_note:  "Regulatory filings used as primary source. Management accounts accepted for interim periods only.",
    quant_fields: [
      { key: "cet1_ratio",  label: "CET1 Capital Ratio",         type: "number", required: true,  unit: "%", floor: "4.5",  cap: "30",  weight: 30, badge: "REQ" },
      { key: "tier1_ratio", label: "Tier 1 Capital Ratio",       type: "number", required: true,  unit: "%", floor: "6.0",  cap: "30",  weight: 20, badge: "REQ" },
      { key: "lcr",         label: "Liquidity Coverage Ratio",   type: "number", required: true,  unit: "%", floor: "100",  cap: "300", weight: 20, badge: "REQ" },
      { key: "npl_ratio",   label: "Non-Performing Loan Ratio",  type: "number", required: true,  unit: "%", floor: "0",    cap: "30",  weight: 20, badge: "REQ" },
      { key: "roe",         label: "Return on Equity",           type: "number", required: true,  unit: "%",                            weight: 5,  badge: "REQ" },
      { key: "nsfr",        label: "Net Stable Funding Ratio",   type: "number", required: false, unit: "%", floor: "100",  cap: "200", weight: 5,  badge: "OPT" },
    ],
    qual_fields: [
      { key: "governance",  label: "Governance Quality",         option_count: 4, weight: 35, options: ["Strong", "Adequate", "Weak", "Critical"]                   },
      { key: "risk_mgmt",   label: "Risk Management Framework",  option_count: 4, weight: 35, options: ["Advanced", "Standard", "Basic", "Deficient"]               },
      { key: "stress_test", label: "Stress Test Result",         option_count: 3, weight: 30, options: ["Pass", "Conditional Pass", "Fail"]                         },
    ],
    adj_enabled: ["related_party", "reg_class", "expert_judgment"],
  },

  // ── Sovereign ─────────────────────────────────────────────────────────────
  "SOV": {
    model_id:         "SOV",
    label:            "Sovereign",
    quant_required:   true,
    qual_required:    false,           // ← no qual step for sovereign
    max_grade:        12,
    methodology_note: "Macro-fiscal underwriting. GDP growth and debt/GDP are primary drivers. IMF Article IV is preferred source.",
    imputation_note:  "World Bank and IMF WEO datasets used for imputation where country data is unavailable.",
    quant_fields: [
      { key: "gdp_growth",      label: "Real GDP Growth Rate",  type: "number", required: true,  unit: "%", floor: "-10", cap: "20",  weight: 25, badge: "REQ" },
      { key: "debt_gdp",        label: "Public Debt / GDP",     type: "number", required: true,  unit: "%", floor: "0",   cap: "200", weight: 25, badge: "REQ" },
      { key: "fiscal_balance",  label: "Fiscal Balance / GDP",  type: "number", required: true,  unit: "%", floor: "-30", cap: "20",  weight: 20, badge: "REQ" },
      { key: "inflation",       label: "CPI Inflation Rate",    type: "number", required: true,  unit: "%", floor: "0",   cap: "100", weight: 15, badge: "REQ" },
      { key: "reserves_months", label: "Import Cover (months)", type: "number", required: true,  unit: "mo",floor: "0",   cap: "36",  weight: 10, badge: "REQ" },
      { key: "unemployment",    label: "Unemployment Rate",     type: "number", required: false, unit: "%",                           weight: 5,  badge: "OPT" },
    ],
    qual_fields: [],                   // ← sovereign has no qual fields
    adj_enabled: ["expert_judgment"],
  },

  // ── Project Finance ───────────────────────────────────────────────────────
  "PF": {
    model_id:         "PF",
    label:            "Project Finance",
    quant_required:   true,
    qual_required:    false,           // ← structural assessment replaces qual
    max_grade:        12,
    methodology_note: "DSCR and LLCR-based underwriting. Construction completion and offtake certainty are key structural factors.",
    imputation_note:  "Sponsor-provided financial model used as primary source. Independent engineer report required.",
    quant_fields: [
      { key: "dscr",       label: "Debt Service Coverage Ratio",  type: "number", required: true,  unit: "x",  floor: "1.20", cap: "3.00", weight: 30, badge: "REQ" },
      { key: "llcr",       label: "Loan Life Coverage Ratio",     type: "number", required: true,  unit: "x",  floor: "1.20", cap: "3.00", weight: 25, badge: "REQ" },
      { key: "plcr",       label: "Project Life Coverage Ratio",  type: "number", required: true,  unit: "x",                              weight: 20, badge: "REQ" },
      { key: "equity_irr", label: "Projected Equity IRR",         type: "number", required: true,  unit: "%",                              weight: 15, badge: "REQ" },
      { key: "debt_share", label: "Debt / Total Project Cost",    type: "number", required: true,  unit: "%",  floor: "0",    cap: "95",   weight: 5,  badge: "REQ" },
      { key: "moic",       label: "Multiple on Invested Capital", type: "number", required: false, unit: "x",                              weight: 5,  badge: "OPT" },
    ],
    qual_fields: [
      // PF uses structural factors not traditional qual — but still rendered dynamically
      { key: "offtake",     label: "Offtake / Revenue Certainty", option_count: 4, weight: 40, options: ["Regulated / guaranteed", "Long-term contracted", "Merchant / spot", "None"] },
      { key: "constr_risk", label: "Construction Risk",           option_count: 4, weight: 35, options: ["Complete", "Near complete >90%", "In progress", "Early stage"]              },
      { key: "sponsor_str", label: "Sponsor Strength",            option_count: 4, weight: 25, options: ["Investment grade", "Strong", "Adequate", "Weak"]                            },
    ],
    adj_enabled: ["related_party", "expert_judgment", "full_guarantee"],
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelId = (searchParams.get("modelId") ?? "").trim().toUpperCase();

  if (!modelId) {
    return NextResponse.json({ error: "modelId is required" }, { status: 400 });
  }

  const config = MODEL_CONFIGS[modelId];

  if (!config) {
    return NextResponse.json(
      { error: `No config found for model "${modelId}". Known models: ${Object.keys(MODEL_CONFIGS).join(", ")}` },
      { status: 404 }
    );
  }

  // Small simulated delay — represents config service lookup
  await new Promise(r => setTimeout(r, 200));

  return NextResponse.json(config);
}