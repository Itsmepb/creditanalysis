type Line = { label: string; value: string; type: "good" | "warn" | "bad" };

const dot: Record<string, string> = {
  good: "#16a34a",
  warn: "#d97706",
  bad:  "#dc2626",
};

const val: Record<string, string> = {
  good: "#166534",
  warn: "#92400e",
  bad:  "#991b1b",
};

export default function OverviewPanel({ lines }: { lines: Line[] }) {
  if (!lines?.length) return null;

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "16px",
    }}>
      {/* Header */}
      <div style={{
        padding: "9px 16px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "10px",
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        Entity Overview
      </div>

      {/* Lines — exactly as many as API returns */}
      <div>
        {lines.map((line, i) => (
          <div
            key={line.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 16px",
              borderBottom: i < lines.length - 1 ? "1px solid #f1f5f9" : "none",
              background: i % 2 === 0 ? "#ffffff" : "#fafafa",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#ffffff" : "#fafafa")}
          >
            {/* Label */}
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
              {line.label}
            </span>

            {/* Value with dot */}
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: dot[line.type],
                display: "inline-block", flexShrink: 0,
              }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: val[line.type] }}>
                {line.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}