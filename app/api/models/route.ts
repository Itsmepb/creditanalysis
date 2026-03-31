import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// MOCK MODELS DATABASE
//
// Each entity gets a different set of models.
// One model has recommended: true — the UI uses this to highlight it.
// The UI does not know what models exist — it renders whatever this returns.
//
// Fields the UI reads:
//   id          — unique identifier, sent back to the server on selection
//   label       — display name shown to the user
//   description — one-line explanation of what this model covers
//   recommended — true on the model the system suggests
//   reason      — why this model is recommended (shown only when recommended: true)
// ─────────────────────────────────────────────────────────────────────────────

const ENTITY_MODELS: Record<string, Array<{
  id: string;
  label: string;
  description: string;
  recommended: boolean;
  reason?: string;
}>> = {

  // ENT-001: Corporate / Technology → C&I recommended
  "ENT-001": [
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: true,
      reason: "Technology corporate with revenue ≥ $10M and C&I exposure ≥ 40% — C&I model applies.",
    },
    {
      id: "CRE",
      label: "CRE Income Property",
      description: "For income-producing real estate. NOI, occupancy, and cap rate are primary drivers.",
      recommended: false,
    },
    {
      id: "SBA",
      label: "Small Business",
      description: "For businesses with revenue under $10M. Simplified scorecard with owner credit history.",
      recommended: false,
    },
  ],

  // ENT-002: Bank → Financial Institution model recommended
  "ENT-002": [
    {
      id: "FI",
      label: "Financial Institution",
      description: "For banks and regulated financial entities. Capital adequacy, NPL ratio, and liquidity coverage are primary drivers.",
      recommended: true,
      reason: "Tier 1 bank — Financial Institution model applies.",
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
  ],

  // ENT-003: SME Manufacturing → SBA recommended
  "ENT-003": [
    {
      id: "SBA",
      label: "Small Business",
      description: "For businesses with revenue under $10M. Simplified scorecard with owner credit history.",
      recommended: true,
      reason: "Entity revenue is below $10M and classified as SME — Small Business model applies.",
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
  ],

  // ENT-004: Sovereign → Sovereign model recommended
  "ENT-004": [
    {
      id: "SOV",
      label: "Sovereign",
      description: "For sovereign and sub-sovereign entities. GDP growth, fiscal balance, debt-to-GDP, and reserve coverage are primary drivers.",
      recommended: true,
      reason: "Entity is a sovereign nation — Sovereign model applies.",
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
  ],

  // ENT-005: Real Estate Fund → CRE recommended
  "ENT-005": [
    {
      id: "CRE",
      label: "CRE Income Property",
      description: "For income-producing real estate. NOI, occupancy, cap rate, and WALE are primary drivers.",
      recommended: true,
      reason: "Commercial real estate fund — CRE Income Property model applies.",
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
    {
      id: "FI",
      label: "Financial Institution",
      description: "For banks and regulated financial entities.",
      recommended: false,
    },
  ],

  // ENT-006: Healthcare → C&I recommended (healthcare is treated as C&I)
  "ENT-006": [
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: true,
      reason: "Healthcare provider with DSCR-driven underwriting — C&I model applies.",
    },
    {
      id: "SBA",
      label: "Small Business",
      description: "For businesses with revenue under $10M. Simplified scorecard with owner credit history.",
      recommended: false,
    },
  ],

  // ENT-007: Logistics / Corporate → C&I recommended
  "ENT-007": [
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: true,
      reason: "Large logistics corporate with revenue ≥ $10M — C&I model applies.",
    },
    {
      id: "CRE",
      label: "CRE Income Property",
      description: "For income-producing real estate. NOI, occupancy, and cap rate are primary drivers.",
      recommended: false,
    },
  ],

  // ENT-008: Pension Fund → FI recommended
  "ENT-008": [
    {
      id: "FI",
      label: "Financial Institution",
      description: "For banks and regulated financial entities. Capital adequacy, funding ratio, and liquidity are primary drivers.",
      recommended: true,
      reason: "Regulated pension fund — Financial Institution model applies.",
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
  ],

  // ENT-009: Fintech Startup → SBA recommended (early stage, sub $10M ARR threshold)
  "ENT-009": [
    {
      id: "SBA",
      label: "Small Business",
      description: "For businesses with revenue under $10M. Simplified scorecard with owner credit history.",
      recommended: true,
      reason: "Series C startup with ARR under $25M — Small Business model applies.",
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
    {
      id: "FI",
      label: "Financial Institution",
      description: "For banks and regulated financial entities. Applicable if entity holds a banking or e-money license.",
      recommended: false,
    },
  ],

  // ENT-010: Infrastructure Project → Project Finance model recommended
  "ENT-010": [
    {
      id: "PF",
      label: "Project Finance",
      description: "For infrastructure and project finance exposures. DSCR, IRR, equity stake, and construction completion are primary drivers.",
      recommended: true,
      reason: "Infrastructure project with DSCR-based repayment — Project Finance model applies.",
    },
    {
      id: "CRE",
      label: "CRE Income Property",
      description: "For income-producing real estate. NOI, occupancy, and cap rate are primary drivers.",
      recommended: false,
    },
    {
      id: "CI",
      label: "C&I Commercial",
      description: "For commercial and industrial borrowers. Cash flow, leverage, and coverage ratios are primary drivers.",
      recommended: false,
    },
  ],

};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = (searchParams.get("entityId") ?? "").toUpperCase().trim();

  if (!entityId) {
    return NextResponse.json({ error: "entityId is required" }, { status: 400 });
  }

  const models = ENTITY_MODELS[entityId];

  if (!models) {
    return NextResponse.json(
      { error: `No models found for entity "${entityId}". Try ENT-001 through ENT-010.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ models });
}