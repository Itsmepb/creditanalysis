import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { entityId } = await req.json();

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a financial data API. Generate realistic financial data for entity "${entityId}".

Return ONLY a valid JSON object with NO explanation, NO markdown, NO code fences.

The JSON must follow this exact structure:
{
  "entityId": "${entityId}",
  "entityName": "A realistic company name",
  "entityType": "One of: Corporate, SME, Financial Institution, Sovereign",
  "industry": "Industry sector",
  "country": "Country name",
  "filters": {
    "year": ["array of 1-3 years like 2024, 2023, 2022"],
    "statementDate": ["array of statement dates in YYYY-MM-DD"],
    "financialStatement": ["array of statement types like Audited, Management Accounts"],
    "currency": ["array of currencies like USD, EUR"]
  },
  "summary": {
    "Risk Score": "number between 1-100",
    "Credit Rating": "rating like AAA, AA+, BB, CCC",
    "Debt Ratio": "decimal like 0.42",
    "Revenue Growth": "percentage like +12.4%",
    "EBITDA Margin": "percentage like 28.3%",
    "Interest Coverage": "number like 4.2x"
  },
  "columns": [
    { "name": "metric", "label": "Metric" },
    { "name": "value_2024", "label": "FY 2024" },
    { "name": "value_2023", "label": "FY 2023" },
    { "name": "value_2022", "label": "FY 2022" }
  ],
  "rows": [
    { "metric": "Revenue", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "EBITDA", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "Net Income", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "Total Assets", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "Total Liabilities", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "Total Equity", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "Interest Expense", "value_2024": "number", "value_2023": "number", "value_2022": "number" },
    { "metric": "Operating Cash Flow", "value_2024": "number", "value_2023": "number", "value_2022": "number" }
  ],
  "aiInsight": "2-3 sentence professional credit analysis summary of this entity"
}

Rules:
- Make each entity ID return DIFFERENT data with different risk profiles
- ENT-001 should be a large stable corporate (low risk)
- ENT-002 should be a mid-size company with moderate risk
- ENT-003 should be a high-risk SME
- Any other entity ID should be randomly generated
- All numbers must be realistic integers (no quotes around numbers)
- If year array has only 1 value, still return it as an array with 1 item
- Return ONLY the JSON, nothing else
    `;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleaned);

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", JSON.stringify(error, null, 2));
if (error instanceof Error) {
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
}
    return NextResponse.json(
      { error: "Failed to fetch financial data" },
      { status: 500 }
    );
  }
}