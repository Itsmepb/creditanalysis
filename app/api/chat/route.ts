import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Simulated credit policy knowledge base (in production: pgvector RAG retrieval)
const POLICY_CONTEXT = `
CREDIT POLICY — COMMERCIAL LENDING v2.4

PD GRADE SCALE:
- PD 1–2: Pass — Strong. Minimal credit risk. Approve under standard terms.
- PD 3–4: Pass — Satisfactory. Low credit risk. Standard approval.
- PD 5–6: Pass — Acceptable. Moderate risk. Standard conditions apply.
- PD 7–8: Special Mention. Elevated risk. Enhanced monitoring required. Periodic covenant review recommended.
- PD 9–10: Substandard. High risk. Refer to Credit Committee. Additional security required.
- PD 11–12: Doubtful / Loss. Decline or workout. Immediate escalation.

MODEL ROUTING RULES:
- C&I Commercial: NAICS manufacturing/industrial/services, revenue ≥ $10M, C&I ≥ 40% of exposure
- CRE Income Property: CRE exposure ≥ 70% of total, income-producing real estate, NOI-based underwriting
- Small Business (SBA): Revenue < $10M, SBA guarantee programs eligible

REGULATORY CLASSIFICATION (RC):
Regulatory classification automatically floors the PD grade at 9–12. This reflects OCC/FDIC substandard classification criteria including: inadequate protection, well-defined weaknesses, jeopardized repayment.

EXPERT JUDGMENT (EJ):
Underwriter may override model output if quantitative data is incomplete, unusual accounting treatments apply, or qualitative factors are not fully captured by the model. Must be documented with written justification. Floors result above PD 8. Requires credit officer co-signature.

DSCR POLICY:
- DSCR < 1.0x: Policy violation. Requires credit committee approval and specific mitigants.
- DSCR 1.0x–1.15x: Below policy minimum. Significant compensating factors required.
- DSCR 1.15x–1.25x: Watch. Enhanced monitoring. Covenant at 1.10x.
- DSCR > 1.25x: Acceptable. Standard terms apply.
- DSCR > 2.0x: Strong. May support less frequent reporting.

LEVERAGE POLICY (C&I):
- Total Debt/EBITDA > 6.0x: Policy exception required.
- Total Debt/EBITDA 4.0x–6.0x: Elevated. Scrutinize repayment sources.
- Total Debt/EBITDA < 3.0x: Conservative. Supports approval.

IMPUTATION:
Optional fields with missing values are imputed from NAICS peer median (Federal Reserve / RMA Annual Statement Studies). Imputed values carry ⚠ flag and reduce DQ Score. PD Scoring Engine handles imputation as internal sub-step before computing final PD.

APPROVAL ROUTING:
- PD 1–6: Underwriter → Credit Officer. SLA: 2 business days.
- PD 7–9: Underwriter → Credit Officer → Senior Credit Review. SLA: 1 business day.
- PD 10–12: Full Credit Committee. Same-day escalation required.

AUDIT LOG:
Immutable append-only log. 7-year regulatory retention. Captures all agent actions, underwriter inputs, field-level changes, override justifications, and approval chain. Required for MRM reporting and regulatory examination.
`;

export async function POST(req: NextRequest) {
  try {
    const { question, entity, modelId, grade } = await req.json();

    const systemPrompt = `You are an AI Credit Chat Assistant embedded in a commercial lending PD Risk Rating System. 
You have access to credit policy documentation and model methodology docs via RAG (vector search).
You are contextual to the active rating event.

Active context:
- Entity: ${entity || "Not yet entered"}
- Model: ${modelId || "Not yet selected"} 
- Current PD Grade: ${grade || "Not yet computed"}

Retrieved policy context (top-k chunks via cosine similarity):
${POLICY_CONTEXT}

Answer the underwriter's question based on policy context. Be concise, specific, and reference policy sections where relevant. 
If the question is about the current rating event, use the active context. 
Always cite the policy basis for your answer.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    const answer = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to retrieve policy context" }, { status: 500 });
  }
}
