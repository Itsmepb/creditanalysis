import { NextRequest, NextResponse } from "next/server";

type Line = { label: string; value: string; type: string };

// Parse a value string into a number
function parseValue(val: string): number | null {
  if (!val || val === "—") return null;
  const cleaned = val
    .replace(/[₹£€$,\s]/g, "")
    .replace(/B$/i, "000000000")
    .replace(/M$/i, "000000")
    .replace(/K$/i, "000")
    .replace(/x$/i, "")
    .replace(/%$/i, "")
    .replace(/\+/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Extract a metric value from overview lines
function getOverviewValue(overview: Line[], ...keys: string[]): number | null {
  for (const key of keys) {
    const line = overview.find((l) =>
      l.label.toLowerCase().includes(key.toLowerCase())
    );
    if (line) {
      const n = parseValue(line.value);
      if (n !== null) return n;
    }
  }
  return null;
}

// Extract a metric value from financial rows
function getRowValue(
  rows: Record<string, string>[],
  columns: { key: string; label: string }[],
  ...metricNames: string[]
): number | null {
  for (const metricName of metricNames) {
    const row = rows.find((r) => {
      const metricCol = columns.find((c) => c.key === "metric");
      if (!metricCol) return false;
      return String(r[metricCol.key] || "")
        .toLowerCase()
        .includes(metricName.toLowerCase());
    });
    if (row) {
      // Get the second column value (first non-metric column)
      const valueCol = columns.find((c) => c.key !== "metric");
      if (valueCol) {
        const n = parseValue(String(row[valueCol.key] || ""));
        if (n !== null) return n;
      }
    }
  }
  return null;
}

// Compute PD based on risk score, credit rating, entity type
function computePD(
  riskScore: number | null,
  creditRating: string | null,
  entityType: string,
  interestCoverage: number | null,
  debtRatio: number | null
): number {
  let pd = 5.0; // base

  // From risk score
  if (riskScore !== null) {
    if (riskScore <= 20)      pd = 0.5;
    else if (riskScore <= 30) pd = 1.2;
    else if (riskScore <= 40) pd = 2.5;
    else if (riskScore <= 50) pd = 4.0;
    else if (riskScore <= 60) pd = 7.5;
    else if (riskScore <= 70) pd = 12.0;
    else if (riskScore <= 80) pd = 18.0;
    else                      pd = 28.0;
  }

  // Adjust from credit rating
  if (creditRating) {
    const ratingMap: Record<string, number> = {
      "AAA": 0.1, "AA+": 0.3, "AA": 0.4, "AA-": 0.5,
      "A+": 0.7,  "A": 0.9,   "A-": 1.1,
      "BBB+": 1.8,"BBB": 2.2, "BBB-": 3.0,
      "BB+": 4.5, "BB": 5.5,  "BB-": 7.0,
      "B+": 9.0,  "B": 11.0,  "B-": 14.0,
      "CCC": 20.0,"CC": 28.0, "C": 35.0, "D": 50.0,
    };
    const ratingPD = ratingMap[creditRating.replace(/\s/g, "")];
    if (ratingPD !== undefined) pd = (pd + ratingPD) / 2;
  }

  // Adjust from interest coverage
  if (interestCoverage !== null) {
    if (interestCoverage < 1.5)  pd *= 1.4;
    else if (interestCoverage < 2.5) pd *= 1.15;
    else if (interestCoverage > 6)   pd *= 0.85;
    else if (interestCoverage > 10)  pd *= 0.7;
  }

  // Adjust from debt ratio
  if (debtRatio !== null) {
    if (debtRatio > 0.8)       pd *= 1.3;
    else if (debtRatio > 0.6)  pd *= 1.1;
    else if (debtRatio < 0.3)  pd *= 0.85;
  }

  // Entity type adjustment
  if (entityType === "Sovereign") pd *= 0.7;
  if (entityType === "SME")       pd *= 1.25;

  return Math.min(Math.max(pd, 0.1), 60);
}

// Compute LGD based on entity type and debt ratio
function computeLGD(
  entityType: string,
  debtRatio: number | null,
  industry: string
): number {
  let lgd = 45; // base

  if (entityType === "Financial Institution") lgd = 40;
  else if (entityType === "Sovereign")        lgd = 25;
  else if (entityType === "SME")              lgd = 55;
  else if (entityType === "Corporate")        lgd = 40;

  if (industry.toLowerCase().includes("real estate")) lgd = 35;
  if (industry.toLowerCase().includes("technology"))  lgd = 45;
  if (industry.toLowerCase().includes("manufactur"))  lgd = 50;
  if (industry.toLowerCase().includes("banking"))     lgd = 38;

  if (debtRatio !== null) {
    if (debtRatio > 0.75) lgd += 8;
    else if (debtRatio > 0.6) lgd += 4;
    else if (debtRatio < 0.35) lgd -= 6;
  }

  return Math.min(Math.max(lgd, 15), 75);
}

// Compute EAD from financial rows
function computeEAD(
  rows: Record<string, string>[],
  columns: { key: string; label: string }[],
  entityType: string
): number {
  const totalAssets   = getRowValue(rows, columns, "total assets", "assets");
  const totalLoans    = getRowValue(rows, columns, "total loans", "loans");
  const totalDebt     = getRowValue(rows, columns, "total debt", "debt");
  const revenue       = getRowValue(rows, columns, "revenue", "net interest income", "gdp");
  const portfolio     = getRowValue(rows, columns, "portfolio value", "nav", "net asset value");

  if (entityType === "Financial Institution" && totalLoans) return totalLoans;
  if (entityType === "Sovereign" && totalDebt)              return totalDebt;
  if (totalAssets)                                          return totalAssets * 0.7;
  if (portfolio)                                            return portfolio;
  if (revenue)                                              return revenue * 3;
  return 1000000;
}

// Format a number to readable string
function formatMoney(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000)     return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)         return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

// Map PD to internal risk rating
function pdToRating(pd: number): string {
  if (pd < 0.5)  return "AAA";
  if (pd < 1.0)  return "AA";
  if (pd < 1.5)  return "A+";
  if (pd < 2.5)  return "A";
  if (pd < 3.5)  return "A-";
  if (pd < 5.0)  return "BBB+";
  if (pd < 7.0)  return "BBB";
  if (pd < 10.0) return "BB+";
  if (pd < 14.0) return "BB";
  if (pd < 18.0) return "BB-";
  if (pd < 22.0) return "B+";
  if (pd < 28.0) return "B";
  if (pd < 35.0) return "B-";
  if (pd < 45.0) return "CCC";
  return "CC";
}

// Determine outlook
function computeOutlook(
  overview: Line[],
  pd: number
): string {
  const growth = overview.find((l) =>
    l.label.toLowerCase().includes("growth") ||
    l.label.toLowerCase().includes("gdp")
  );
  if (growth) {
    const val = growth.value;
    if (val.startsWith("+") && parseValue(val) !== null && parseValue(val)! > 5) return "Positive";
    if (val.startsWith("-")) return "Negative";
  }
  const badLines = overview.filter((l) => l.type === "bad").length;
  const goodLines = overview.filter((l) => l.type === "good").length;
  if (badLines > goodLines) return pd > 15 ? "Negative" : "Watch";
  if (pd < 3) return "Positive";
  if (pd < 8) return "Stable";
  return "Watch";
}

// Generate key risks based on data
function generateKeyRisks(
  overview: Line[],
  entityType: string,
  industry: string,
  pd: number,
  debtRatio: number | null,
  interestCoverage: number | null
): string[] {
  const risks: string[] = [];

  if (pd > 15)
    risks.push("Elevated probability of default indicates significant credit stress");
  if (debtRatio !== null && debtRatio > 0.7)
    risks.push(`High leverage ratio of ${debtRatio.toFixed(2)} limits financial flexibility`);
  if (interestCoverage !== null && interestCoverage < 2)
    risks.push(`Low interest coverage of ${interestCoverage.toFixed(1)}x raises debt serviceability concerns`);

  const badLines = overview.filter((l) => l.type === "bad");
  badLines.slice(0, 2).forEach((l) => {
    risks.push(`${l.label} of ${l.value} is below acceptable thresholds`);
  });

  if (entityType === "SME")
    risks.push("SME segment exposure to market volatility and limited liquidity buffers");
  if (industry.toLowerCase().includes("real estate"))
    risks.push("Real estate sector sensitivity to interest rate movements and valuation risk");
  if (industry.toLowerCase().includes("manufactur"))
    risks.push("Manufacturing sector exposure to commodity price and supply chain disruptions");

  return risks.slice(0, 4);
}

// Generate mitigants
function generateMitigants(
  overview: Line[],
  entityType: string,
  pd: number
): string[] {
  const mitigants: string[] = [];

  const goodLines = overview.filter((l) => l.type === "good");
  goodLines.slice(0, 2).forEach((l) => {
    mitigants.push(`Strong ${l.label} of ${l.value} provides a credit buffer`);
  });

  if (entityType === "Sovereign")
    mitigants.push("Sovereign status provides implicit government support and access to multilateral funding");
  if (entityType === "Financial Institution")
    mitigants.push("Regulatory oversight and capital adequacy requirements limit downside risk");
  if (pd < 5)
    mitigants.push("Conservative risk profile supports stable debt servicing capacity");

  return mitigants.slice(0, 3);
}

// Generate analyst narrative
function generateNarrative(
  entityName: string,
  entityType: string,
  industry: string,
  country: string,
  pd: number,
  lgd: number,
  riskRating: string,
  outlook: string,
  debtRatio: number | null,
  interestCoverage: number | null
): string {
  const riskLevel =
    pd < 3  ? "low-risk" :
    pd < 8  ? "moderate-risk" :
    pd < 18 ? "elevated-risk" : "high-risk";

  const debtComment = debtRatio !== null
    ? debtRatio > 0.7
      ? `with a high leverage ratio of ${debtRatio.toFixed(2)} that warrants monitoring`
      : debtRatio < 0.4
        ? `maintaining a conservative leverage ratio of ${debtRatio.toFixed(2)}`
        : `carrying a moderate leverage ratio of ${debtRatio.toFixed(2)}`
    : "";

  const coverageComment = interestCoverage !== null
    ? interestCoverage < 2
      ? `Interest coverage of ${interestCoverage.toFixed(1)}x is critically low and raises debt serviceability concerns.`
      : interestCoverage > 5
        ? `Strong interest coverage of ${interestCoverage.toFixed(1)}x demonstrates robust debt servicing capacity.`
        : `Interest coverage stands at ${interestCoverage.toFixed(1)}x, within acceptable range.`
    : "";

  return `${entityName} is assessed as a ${riskLevel} ${entityType.toLowerCase()} operating in the ${industry} sector in ${country}${debtComment ? ", " + debtComment : ""}. ${coverageComment} Based on quantitative analysis, the entity carries an internal risk rating of ${riskRating} with a ${outlook.toLowerCase()} outlook, reflecting a probability of default of ${pd.toFixed(2)}% and loss given default of ${lgd.toFixed(1)}%. ${pd > 15 ? "Recommend enhanced monitoring and additional security requirements before credit approval." : pd > 7 ? "Standard credit conditions apply with periodic covenant review recommended." : "Entity demonstrates sound fundamentals supporting credit approval under standard terms."}`;
}

// Recommendation
function computeRecommendation(pd: number, outlook: string): string {
  if (pd < 3 && outlook !== "Negative")       return "Approve";
  if (pd < 8 && outlook !== "Negative")       return "Approve with Conditions";
  if (pd < 18)                                return "Refer to Credit Committee";
  return "Decline";
}

export async function POST(req: NextRequest) {
  try {
    const { entityId, entityName, entityType, industry, country, overview, rows, columns } = await req.json();

    // Extract key metrics
    const riskScore       = getOverviewValue(overview, "risk score");
    const creditRating    = overview.find((l: Line) => l.label.toLowerCase().includes("credit rating"))?.value || null;
    const interestCoverage = getOverviewValue(overview, "interest coverage");
    const debtRatio       = getOverviewValue(overview, "debt ratio", "debt to gdp");

    // Core calculations
    const pd        = computePD(riskScore, creditRating, entityType, interestCoverage, debtRatio);
    const lgd       = computeLGD(entityType, debtRatio, industry);
    const eadRaw    = computeEAD(rows, columns, entityType);
    const elRaw     = (pd / 100) * (lgd / 100) * eadRaw;
    const riskRating = pdToRating(pd);
    const outlook   = computeOutlook(overview, pd);

    const result = {
      pd:             pd.toFixed(2) + "%",
      lgd:            lgd.toFixed(1) + "%",
      ead:            formatMoney(eadRaw),
      expectedLoss:   formatMoney(elRaw),
      riskRating,
      ratingOutlook:  outlook,
      keyRisks:       generateKeyRisks(overview, entityType, industry, pd, debtRatio, interestCoverage),
      mitigants:      generateMitigants(overview, entityType, pd),
      analystInsight: generateNarrative(entityName, entityType, industry, country, pd, lgd, riskRating, outlook, debtRatio, interestCoverage),
      recommendation: computeRecommendation(pd, outlook),
      entityId,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Insight error:", error);
    return NextResponse.json({ error: "Failed to generate credit insight" }, { status: 500 });
  }
}