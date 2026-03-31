import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// NEXT STEP API
//
// POST { entityId, currentStep, statementId?, quantRequired?, qualRequired? }
// Returns { nextStep: { id, label } | null }
//
// quantRequired and qualRequired come from the Model Config Service.
// When false, those steps are skipped entirely from the workflow.
// The UI never hardcodes step sequences — it follows what this API returns.
// ─────────────────────────────────────────────────────────────────────────────

type StepDef = { id: string; label: string };

export async function POST(req: NextRequest) {
  try {
    const {
      currentStep,
      statementId,
      quantRequired = true,
      qualRequired  = true,
    } = await req.json();

    if (!currentStep) {
      return NextResponse.json({ error: "currentStep is required" }, { status: 400 });
    }

    // Guarantor substitution always skips quant + qual
    const isGuarantor = statementId === "__guarantor__";
    const showQuant   = !isGuarantor && quantRequired;
    const showQual    = !isGuarantor && qualRequired;

    // Build the workflow dynamically from the flags
    // Each step returns only the immediate next step
    const nextStep = resolveNext(currentStep, showQuant, showQual);

    return NextResponse.json({ nextStep });
  } catch {
    return NextResponse.json({ error: "Failed to resolve next step" }, { status: 500 });
  }
}

function resolveNext(current: string, showQuant: boolean, showQual: boolean): StepDef | null {
  switch (current) {
    case "entity":
      return { id: "model", label: "Model Routing" };

    case "model":
      return { id: "statement", label: "Statement" };

    case "statement":
      if (showQuant) return { id: "quantitative", label: "Quantitative" };
      if (showQual)  return { id: "qualitative",  label: "Qualitative"  };
      return           { id: "adjustments",  label: "Adjustments"  };

    case "quantitative":
      if (showQual) return { id: "qualitative", label: "Qualitative" };
      return          { id: "adjustments",  label: "Adjustments"  };

    case "qualitative":
      return { id: "adjustments", label: "Adjustments" };

    case "adjustments":
      return { id: "summary", label: "PD Summary" };

    case "summary":
      return null;

    default:
      return null;
  }
}