"use client";

import React from "react";

type InsightData = {
  pd:             string;
  lgd:            string;
  ead:            string;
  expectedLoss:   string;
  riskRating:     string;
  ratingOutlook:  string;
  keyRisks:       string[];
  mitigants:      string[];
  analystInsight: string;
  recommendation: string;
};

type Props = {
  entityId:   string;
  entityName: string;
  entityType: string;
  industry:   string;
  country:    string;
  overview:   { label: string; value: string; type: string }[];
  rows:       Record<string, string>[];
  columns:    { key: string; label: string }[];
};

const recStyle: Record<string, React.CSSProperties> = {
  "Approve":                   { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  "Approve with Conditions":   { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
  "Refer to Credit Committee": { background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" },
  "Decline":                   { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
};

const outlookColor: Record<string, string> = {
  Positive: "#16a34a",
  Stable:   "#0284c7",
  Negative: "#dc2626",
  Watch:    "#d97706",
};

export default function CreditInsight({
  entityId, entityName, entityType, industry, country, overview, rows, columns,
}: Props) {
  const [open, setOpen]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [data, setData]       = React.useState<InsightData | null>(null);
  const [error, setError]     = React.useState("");

  const fetchInsight = async () => {
    setLoading(true); setError(""); setData(null); setOpen(true);
    try {
      const res  = await fetch("/api/insight", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ entityId, entityName, entityType, industry, country, overview, rows, columns }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed");
      else setData(json as InsightData);
    } catch {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  const s = (size: number, weight: number, color: string): React.CSSProperties =>
    ({ fontSize: `${size}px`, fontWeight: weight, color });

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={fetchInsight}
        style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "8px 16px",
          background: "linear-gradient(135deg,#1e3a5f,#1e40af)",
          color: "#fff", border: "none", borderRadius: "8px",
          fontSize: "12px", fontWeight: 700, cursor: "pointer",
          boxShadow: "0 2px 10px rgba(29,78,216,0.3)",
          letterSpacing: "0.03em", whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <span>◈</span> Credit Insight
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
        >
          <div style={{
            background: "#ffffff", borderRadius: "14px",
            width: "100%", maxWidth: "660px",
            maxHeight: "88vh", overflowY: "auto",
            boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
            border: "1px solid #e2e8f0",
          }}>

            {/* Modal header */}
            <div style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg,#1e3a5f,#1e40af)",
              borderRadius: "14px 14px 0 0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={s(13, 700, "#fff")}>◈ Credit Intelligence Report</div>
                <div style={{ ...s(11, 400, "rgba(255,255,255,0.55)"), marginTop: "2px" }}>
                  {entityName} · {entityId} · {entityType}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "6px", color: "#fff",
                  width: "28px", height: "28px", cursor: "pointer",
                  fontSize: "13px", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: "center", padding: "44px 0" }}>
                  <div style={{
                    width: "36px", height: "36px",
                    border: "3px solid #e2e8f0", borderTopColor: "#1d4ed8",
                    borderRadius: "50%", animation: "spin 0.7s linear infinite",
                    margin: "0 auto 14px",
                  }} />
                  <div style={s(12, 600, "#475569")}>Analysing financial data...</div>
                  <div style={{ ...s(11, 400, "#94a3b8"), marginTop: "4px" }}>
                    Computing PD · LGD · EAD · Risk Rating
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  padding: "12px 16px", background: "#fef2f2",
                  border: "1px solid #fecaca", borderRadius: "8px",
                  color: "#dc2626", fontSize: "13px",
                }}>⚠ {error}</div>
              )}

              {/* Results */}
              {data && !loading && (
                <>
                  {/* Risk metrics — 4 boxes */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                    {[
                      { label: "PD",            value: data.pd,           sub: "Prob. of Default"    },
                      { label: "LGD",           value: data.lgd,          sub: "Loss Given Default"  },
                      { label: "EAD",           value: data.ead,          sub: "Exposure at Default" },
                      { label: "Expected Loss", value: data.expectedLoss, sub: "PD × LGD × EAD"      },
                    ].map((m) => (
                      <div key={m.label} style={{
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: "10px", padding: "12px", textAlign: "center",
                      }}>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                          {m.label}
                        </div>
                        <div style={s(20, 800, "#0f172a")}>{m.value}</div>
                        <div style={{ ...s(9, 400, "#94a3b8"), marginTop: "4px" }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Rating + Outlook */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {/* Risk Rating */}
                    <div style={{
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: "10px", padding: "14px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>
                          Risk Rating
                        </div>
                        <div style={s(30, 800, "#0f172a")}>{data.riskRating}</div>
                      </div>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "18px", color: "#fff",
                        boxShadow: "0 4px 12px rgba(29,78,216,0.25)",
                      }}>◈</div>
                    </div>

                    {/* Outlook */}
                    <div style={{
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      borderRadius: "10px", padding: "14px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>
                          Outlook
                        </div>
                        <div style={s(20, 800, outlookColor[data.ratingOutlook] || "#334155")}>
                          {data.ratingOutlook}
                        </div>
                      </div>
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%",
                        background: outlookColor[data.ratingOutlook] || "#94a3b8",
                        boxShadow: `0 0 10px ${outlookColor[data.ratingOutlook] || "#94a3b8"}88`,
                      }} />
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{
                    ...(recStyle[data.recommendation] || recStyle["Refer to Credit Committee"]),
                    borderRadius: "10px", padding: "12px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      Recommendation
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 800 }}>{data.recommendation}</div>
                  </div>

                  {/* Key Risks */}
                  <div style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{
                      padding: "9px 14px", background: "#f1f5f9",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "10px", fontWeight: 700, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      Key Risks
                    </div>
                    {data.keyRisks.map((r, i) => (
                      <div key={i} style={{
                        padding: "9px 14px",
                        borderBottom: i < data.keyRisks.length - 1 ? "1px solid #f1f5f9" : "none",
                        display: "flex", alignItems: "flex-start", gap: "8px",
                      }}>
                        <span style={{ color: "#dc2626", marginTop: "1px", flexShrink: 0, fontSize: "10px" }}>▲</span>
                        <span style={s(12, 400, "#334155")}>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mitigants */}
                  <div style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{
                      padding: "9px 14px", background: "#f0fdf4",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "10px", fontWeight: 700, color: "#166534",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      Mitigating Factors
                    </div>
                    {data.mitigants.map((m, i) => (
                      <div key={i} style={{
                        padding: "9px 14px",
                        borderBottom: i < data.mitigants.length - 1 ? "1px solid #f1f5f9" : "none",
                        display: "flex", alignItems: "flex-start", gap: "8px",
                      }}>
                        <span style={{ color: "#16a34a", marginTop: "1px", flexShrink: 0, fontSize: "10px" }}>✓</span>
                        <span style={s(12, 400, "#334155")}>{m}</span>
                      </div>
                    ))}
                  </div>

                  {/* Analyst Narrative */}
                  <div style={{
                    background: "#f0f9ff", border: "1px solid #bae6fd",
                    borderRadius: "10px", padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                      Analyst Narrative
                    </div>
                    <p style={{ ...s(12, 400, "#334155"), lineHeight: 1.7, margin: 0 }}>
                      {data.analystInsight}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                      Generated by Credit Analysis Engine · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}