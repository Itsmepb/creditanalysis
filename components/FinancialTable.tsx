import React from "react";

type Column = { key: string; label: string };
type Row    = Record<string, string>;

const statusStyle: Record<string, React.CSSProperties> = {
  "Critical":         { color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca"  },
  "Above Benchmark":  { color: "#ea580c", background: "#fff7ed", border: "1px solid #fed7aa"  },
  "Below Benchmark":  { color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe"  },
  "Watch":            { color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a"  },
  "Refinance Due":    { color: "#ea580c", background: "#fff7ed", border: "1px solid #fed7aa"  },
  "Active":           { color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0"  },
  "Stable":           { color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0"  },
  "Strong":           { color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0"  },
  "Positive":         { color: "#0284c7", background: "#f0f9ff", border: "1px solid #bae6fd"  },
  "Refinance":        { color: "#ea580c", background: "#fff7ed", border: "1px solid #fed7aa"  },
  "Review Rate":      { color: "#d97706", background: "#fffbeb", border: "1px solid #fde68a"  },
  "Schedule Payment": { color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe"  },
  "Monitor":          { color: "#0284c7", background: "#f0f9ff", border: "1px solid #bae6fd"  },
};

export default function FinancialTable({ columns, rows }: { columns: Column[]; rows: Row[] }) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow: "hidden",
    }}>
      {/* Label row */}
      <div style={{
        padding: "9px 16px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Financial Statement
        </span>
        <span style={{ fontSize: "10px", color: "#cbd5e1" }}>
          {rows.length} rows · {columns.length} columns
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>

          {/* Column headers — 100% dynamic from API / filter selection */}
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  style={{
                    padding: "9px 16px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                    borderBottom: "2px solid #e2e8f0",
                    minWidth: i === 0 ? "160px" : "110px",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{ background: ri % 2 === 0 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = ri % 2 === 0 ? "#ffffff" : "#fafafa")}
              >
                {columns.map((col, ci) => {
                  const raw = row[col.key];
                  const val = raw !== undefined && raw !== null && String(raw).trim() !== "" ? String(raw) : "—";
                  const isFirst = ci === 0;
                  const badge   = statusStyle[val];
                  const isPos   = !isFirst && val.startsWith("+");
                  const isNeg   = !isFirst && val.startsWith("-");

                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: "9px 16px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isFirst ? (
                        <span style={{ color: "#0f172a", fontWeight: 600 }}>{val}</span>
                      ) : badge ? (
                        <span style={{ ...badge, padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600, display: "inline-block" }}>
                          {val}
                        </span>
                      ) : isPos ? (
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>{val}</span>
                      ) : isNeg ? (
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>{val}</span>
                      ) : (
                        <span style={{ color: "#334155" }}>{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}