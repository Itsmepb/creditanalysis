"use client";
import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type StepDef      = { id: string; label: string };
type Statement    = { id: string; label: string; period: string; date: string; badge: string; detail?: Record<string, string> };
type OverviewItem = { label: string; value: string; type: string };
type TableShape   = { columns: { key: string; label: string }[]; rows: Record<string, string>[] };
type Screen       = "search" | "model" | "statement" | "quantitative" | "qualitative" | "adjustments" | "summary";
type Model        = { id: string; label: string; description?: string; recommended?: boolean; reason?: string };

// Model config — returned by /api/model-config, drives all field rendering
type QuantField = {
  key: string; label: string; type: string; required: boolean;
  unit?: string; floor?: string; cap?: string; weight: number;
  badge: string; impute_source?: string;
};
type QualField = {
  key: string; label: string; option_count: number; weight: number; options: string[];
};
type ModelConfig = {
  model_id: string; label: string;
  quant_required: boolean; qual_required: boolean;
  max_grade: number;
  methodology_note: string; imputation_note: string;
  quant_fields: QuantField[];
  qual_fields:  QualField[];
  adj_enabled:  string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// SHAPE DETECTORS
// ─────────────────────────────────────────────────────────────────────────────

function isOverviewArray(v: unknown): v is OverviewItem[] {
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "label" in v[0] && "value" in v[0] && "type" in v[0];
}
function isTableShape(v: unknown): v is TableShape {
  return typeof v === "object" && v !== null && "columns" in v && "rows" in v && Array.isArray((v as TableShape).columns) && Array.isArray((v as TableShape).rows);
}
function isKeyValueMap(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && Object.values(v as object).every(x => typeof x === "string" || typeof x === "number");
}
function isModelArray(v: unknown): v is Model[] {
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "id" in v[0] && "label" in v[0];
}
function isStatementsArray(v: unknown): v is Statement[] {
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0] !== null && "id" in v[0] && "badge" in v[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function humanize(k: string) {
  return k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
}

const BADGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Audited:     { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Reviewed:    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Compiled:    { bg: "#fefce8", color: "#854d0e", border: "#fde68a" },
  Management:  { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  Interim:     { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  IMF:         { bg: "#f5f3ff", color: "#5b21b6", border: "#ddd6fe" },
  Official:    { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Tax Return":{ bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};
const DOT: Record<string, { dot: string; bg: string; text: string }> = {
  good:    { dot: "#16a34a", bg: "#f0fdf4", text: "#15803d" },
  warn:    { dot: "#d97706", bg: "#fffbeb", text: "#92400e" },
  bad:     { dot: "#dc2626", bg: "#fef2f2", text: "#991b1b" },
  neutral: { dot: "#94a3b8", bg: "#f8fafc", text: "#475569" },
};
const STEP_TO_SCREEN: Record<string, Screen> = {
  entity: "search", model: "model", statement: "statement",
  quantitative: "quantitative", qualitative: "qualitative",
  adjustments: "adjustments", summary: "summary",
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

function Sidebar({ onReset }: { onReset: () => void }) {
  const groups = [
    { section: "RATING", items: [{ icon: "⚡", label: "Active Event", active: true }, { icon: "☰", label: "My Queue", active: false }, { icon: "🕐", label: "History", active: false }] },
    { section: "ADMIN",  items: [{ icon: "🔧", label: "Model Config", active: false }, { icon: "📊", label: "Reporting", active: false }, { icon: "👥", label: "Workflow", active: false }] },
  ];
  return (
    <div style={{ width: 220, flexShrink: 0, background: "#1e3a5f", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div onClick={onReset} style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0, cursor: "pointer" }} title="Go to Home">PD</div>
        <div onClick={onReset} style={{ flex: 1, cursor: "pointer" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>RiskRater AI</div>
          <div style={{ fontSize: 10, color: "#93c5fd" }}>v4.0.0</div>
        </div>
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>‹</span>
      </div>
      <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {groups.map(g => (
          <div key={g.section} style={{ marginBottom: 8 }}>
            <div style={{ padding: "8px 18px 4px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{g.section}</div>
            {g.items.map(item => (
              <div key={item.label} style={{ margin: "1px 8px", padding: "9px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: item.active ? "rgba(59,130,246,0.25)" : "transparent", border: item.active ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent" }}>
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: item.active ? 700 : 400, color: item.active ? "#93c5fd" : "rgba(255,255,255,0.6)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ margin: "0 8px 12px", padding: "12px 14px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: 8 }}>AI AGENTS ACTIVE</div>
        <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: `pulse ${1 + i * 0.3}s ease-in-out infinite alternate` }} />)}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>3 agents running</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP NAV — progressive reveal
// ─────────────────────────────────────────────────────────────────────────────

function TopNav({ visibleSteps, currentScreen, completedStepIds, onStepClick }: {
  visibleSteps: StepDef[]; currentScreen: Screen; completedStepIds: Set<string>;
  onStepClick: (stepId: string, screen: Screen) => void;
}) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e8edf2", padding: "0 24px", overflowX: "auto", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: "fit-content" }}>
        {visibleSteps.map((step, i) => {
          const screen      = STEP_TO_SCREEN[step.id] ?? "search";
          const isDone      = completedStepIds.has(step.id);
          const isActive    = !isDone && screen === currentScreen;
          const isLookahead = i === visibleSteps.length - 1 && !isDone && !isActive;
          const isClickable = isDone || isActive;
          return (
            <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => isClickable && onStepClick(step.id, screen)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "14px 12px", borderBottom: isActive ? "2px solid #2563eb" : "2px solid transparent", opacity: isLookahead ? 0.4 : 1, cursor: isClickable ? "pointer" : "default" }}
              >
                <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isDone ? "#2563eb" : isActive ? "#fff" : "#f1f5f9", border: isActive ? "2px solid #2563eb" : isDone ? "none" : "2px solid #e2e8f0" }}>
                  {isDone
                    ? <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                    : <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? "#2563eb" : "#94a3b8" }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isDone ? "#2563eb" : isActive ? "#0f172a" : "#94a3b8", whiteSpace: "nowrap" }}>{step.label}</span>
              </div>
              {i < visibleSteps.length - 1 && <div style={{ width: 20, height: 1, background: "#e2e8f0", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTITY DISPLAY RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

function OverviewRenderer({ items }: { items: OverviewItem[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
      {items.map((item, i) => {
        const c = DOT[item.type] ?? DOT.neutral;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", background: c.bg, borderRadius: 9, border: `1px solid ${c.dot}22` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{item.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function TableRenderer({ data }: { data: TableShape }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{data.columns.map(col => <th key={col.key} style={{ padding: "9px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #f1f5f9" }} onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {data.columns.map((col, ci) => {
                const val = row[col.key] ?? "—"; const isPos = ci > 0 && String(val).startsWith("+"); const isNeg = ci > 0 && String(val).startsWith("-");
                return <td key={col.key} style={{ padding: "10px 16px", whiteSpace: "nowrap", fontWeight: ci === 0 ? 600 : isPos || isNeg ? 700 : 400, color: isPos ? "#16a34a" : isNeg ? "#dc2626" : ci === 0 ? "#0f172a" : "#475569" }}>{val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyValueRenderer({ data }: { data: Record<string, string> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ padding: "10px 13px", background: "#f8fafc", borderRadius: 9, border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{humanize(k)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{String(v)}</div>
        </div>
      ))}
    </div>
  );
}

function EntityDisplay({ data }: { data: Record<string, unknown> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(data).map(([key, value]) => {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return null;
        if (isStatementsArray(value) || isModelArray(value)) return null;
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null && "id" in value[0]) return null;
        if (isOverviewArray(value)) return <Card key={key} title={humanize(key)}><OverviewRenderer items={value} /></Card>;
        if (isTableShape(value))   return <Card key={key} title={humanize(key)} noPad><TableRenderer data={value} /></Card>;
        if (isKeyValueMap(value))  return <Card key={key} title={humanize(key)}><KeyValueRenderer data={value as Record<string, string>} /></Card>;
        return null;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL CONFIG RENDERERS — driven entirely by config from API
// ─────────────────────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", color: "#0f172a", background: "#f8fafc", boxSizing: "border-box" };

function QuantSection({ config, values, onChange }: { config: ModelConfig; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <Card title={`Quantitative Inputs — ${config.label}`}>
      {/* Methodology note from config */}
      <div style={{ marginBottom: 14, padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 12, color: "#1e40af" }}>
        ◈ {config.methodology_note}
      </div>
      {/* Imputation note */}
      {config.imputation_note && (
        <div style={{ marginBottom: 16, padding: "7px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 11, color: "#92400e" }}>
          ⚠ {config.imputation_note}
        </div>
      )}
      {/* Fields — rendered from config, not hardcoded */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {config.quant_fields.map(f => (
          <div key={f.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: f.floor ? 2 : 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{f.label}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: f.badge === "REQ" ? "#dc2626" : "#d97706", padding: "1px 6px", borderRadius: 4 }}>{f.badge}</span>
              <span style={{ fontSize: 9, color: "#94a3b8", marginLeft: "auto" }}>wt: {f.weight}</span>
            </div>
            {(f.floor || f.cap) && <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 5 }}>Floor: {f.floor} · Cap: {f.cap}</div>}
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={values[f.key] ?? ""}
                onChange={e => onChange(f.key, e.target.value)}
                placeholder={f.floor && f.cap ? `${f.floor} → ${f.cap}` : undefined}
                style={{ ...INPUT, paddingRight: f.unit ? 40 : undefined }}
                onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                onBlur={e =>  (e.target.style.borderColor = "#e2e8f0")}
              />
              {f.unit && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8" }}>{f.unit}</span>}
            </div>
            {!values[f.key] && f.impute_source && (
              <div style={{ fontSize: 10, color: "#d97706", marginTop: 4 }}>⚠ Will impute from {f.impute_source}</div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function QualSection({ config, values, onChange }: { config: ModelConfig; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  if (!config.qual_required || config.qual_fields.length === 0) return null;
  return (
    <Card title={`Qualitative Assessment — ${config.label}`}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {config.qual_fields.map(f => (
          <div key={f.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{f.label}</span>
              <span style={{ fontSize: 9, color: "#94a3b8", marginLeft: "auto" }}>wt: {f.weight}</span>
            </div>
            <select value={values[f.key] ?? ""} onChange={e => onChange(f.key, e.target.value)} style={INPUT}>
              <option value="">— Select ({f.option_count}-pt scale) —</option>
              {f.options.map((o, i) => (
                <option key={o} value={o}>{o}{i === 0 ? " (Best)" : i === f.options.length - 1 ? " (Worst)" : ""}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD + CONTINUE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function Card({ title, children, noPad }: { title?: string; children: React.ReactNode; noPad?: boolean }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {title && <div style={{ padding: "11px 18px", borderBottom: "1px solid #f1f5f9" }}><span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span></div>}
      <div style={{ padding: noPad ? 0 : 18 }}>{children}</div>
    </div>
  );
}

function ContinueBtn({ label, onClick, disabled, show }: { label: string; onClick: () => void; disabled?: boolean; show: boolean }) {
  if (!show) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
      <button onClick={onClick} disabled={!!disabled} style={{ padding: "11px 28px", background: disabled ? "#e2e8f0" : "#0f172a", color: disabled ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        {label} <span style={{ fontSize: 16 }}>→</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATEMENT CARD
// ─────────────────────────────────────────────────────────────────────────────

function StatementCard({ stmt, selected, expanded, onSelect, onToggleDetail }: { stmt: Statement; selected: boolean; expanded: boolean; onSelect: () => void; onToggleDetail: () => void }) {
  const bc = BADGE_COLORS[stmt.badge] ?? { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
  return (
    <div style={{ borderRadius: 12, border: selected ? "2px solid #2563eb" : "1px solid #e2e8f0", background: selected ? "#eff6ff" : "#fff", overflow: "hidden", boxShadow: selected ? "0 0 0 4px #dbeafe" : "none", transition: "all 0.15s" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={onSelect}>
        <div style={{ width: 18, height: 18, borderRadius: "50%", border: selected ? "2px solid #2563eb" : "2px solid #d1d5db", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb" }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: selected ? "#1e40af" : "#0f172a" }}>{stmt.label}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{stmt.period} · {stmt.date}</div>
        </div>
        <div style={{ padding: "4px 11px", borderRadius: 20, background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{stmt.badge}</div>
        {stmt.detail && (
          <button onClick={e => { e.stopPropagation(); onToggleDetail(); }} style={{ padding: "4px 10px", background: expanded ? "#e0f2fe" : "#f1f5f9", border: `1px solid ${expanded ? "#bae6fd" : "#e2e8f0"}`, borderRadius: 7, fontSize: 11, fontWeight: 600, color: expanded ? "#0284c7" : "#64748b", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            {expanded ? "Hide ▲" : "Details ▼"}
          </button>
        )}
      </div>
      {expanded && stmt.detail && (
        <div style={{ borderTop: "1px solid #e8edf2", padding: "14px 18px", background: "#f8fafc" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: stmt.detail.notes ? 12 : 0 }}>
            {Object.entries(stmt.detail).filter(([k]) => k !== "notes").map(([k, v]) => (
              <div key={k} style={{ padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{humanize(k)}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>
          {stmt.detail.notes && <div style={{ padding: "9px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>📋 {stmt.detail.notes}</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

function ModelSelector({ models, selectedId, onSelect }: { models: Model[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const recId = models.find(m => m.recommended)?.id ?? null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {selectedId && selectedId !== recId && <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, fontSize: 12, color: "#92400e" }}>⚠ You have selected a different model than the system recommendation. This override will be noted.</div>}
      {models.map(m => {
        const isSel = selectedId === m.id;
        return (
          <button key={m.id} onClick={() => onSelect(m.id)} style={{ padding: "16px 20px", borderRadius: 12, border: isSel ? "2px solid #2563eb" : m.recommended ? "2px solid #16a34a" : "1px solid #e2e8f0", background: isSel ? "#eff6ff" : "#fff", cursor: "pointer", textAlign: "left", position: "relative", boxShadow: isSel ? "0 0 0 4px #dbeafe" : "none", transition: "all 0.15s" }}>
            <div style={{ position: "absolute", top: 14, right: 16, display: "flex", gap: 6 }}>
              {m.recommended && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#16a34a", padding: "3px 8px", borderRadius: 20 }}>RECOMMENDED</span>}
              {isSel && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#2563eb", padding: "3px 8px", borderRadius: 20 }}>SELECTED</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isSel ? "#1e40af" : "#0f172a", marginBottom: 5, paddingRight: 150 }}>{m.label}</div>
            {m.description && <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{m.description}</div>}
            {m.recommended && m.reason && <div style={{ marginTop: 10, fontSize: 12, color: "#15803d", background: "#f0fdf4", borderRadius: 8, padding: "8px 12px" }}>✓ {m.reason}</div>}
          </button>
        );
      })}
    </div>
  );
}

function SpecialCard({ icon, title, subtitle, badge, selected, onClick }: { icon: string; title: string; subtitle: string; badge?: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: "15px 18px", borderRadius: 12, border: selected ? "2px solid #2563eb" : "1px solid #e2e8f0", background: selected ? "#eff6ff" : "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, boxShadow: selected ? "0 0 0 4px #dbeafe" : "none", transition: "all 0.15s" }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: selected ? "#1e40af" : "#0f172a" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, fontFamily: "monospace" }}>{subtitle}</div>
      </div>
      {badge && <div style={{ padding: "4px 10px", borderRadius: 20, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{badge}</div>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE PD GRADE PANEL
// Computes grade in real time from quant field values × weights from config.
// Only appears on quantitative screen and after.
// ─────────────────────────────────────────────────────────────────────────────

function computePDGrade(config: ModelConfig, values: Record<string, string>): number {
  let weightedScore = 0;
  let totalWeight   = 0;

  config.quant_fields.forEach(f => {
    const raw = parseFloat(values[f.key] ?? "");
    if (isNaN(raw)) return;

    // Normalise the value between 0 and 1 using floor/cap from config
    const floor = parseFloat(f.floor ?? "0");
    const cap   = parseFloat(f.cap   ?? "100");
    const range = cap - floor;
    const norm  = range > 0 ? Math.min(Math.max((raw - floor) / range, 0), 1) : 0.5;

    weightedScore += norm * f.weight;
    totalWeight   += f.weight;
  });

  if (totalWeight === 0) return 0; // no data yet

  const score = weightedScore / totalWeight; // 0 = worst, 1 = best
  // Map to PD 1 (best) → max_grade (worst)
  const grade = Math.round(config.max_grade - score * (config.max_grade - 1));
  return Math.min(Math.max(grade, 1), config.max_grade);
}

function gradeColor(g: number, max: number): string {
  const ratio = g / max;
  if (ratio <= 0.25) return "#16a34a";
  if (ratio <= 0.45) return "#0284c7";
  if (ratio <= 0.65) return "#d97706";
  if (ratio <= 0.80) return "#ea580c";
  return "#dc2626";
}

function gradeLabel(g: number, max: number): string {
  const ratio = g / max;
  if (ratio <= 0.25) return "Pass — Strong";
  if (ratio <= 0.45) return "Pass — Satisfactory";
  if (ratio <= 0.58) return "Pass — Acceptable";
  if (ratio <= 0.70) return "Special Mention";
  if (ratio <= 0.83) return "Substandard";
  return "Doubtful / Loss";
}

function LivePDPanel({ config, values, seededValues, apiPdGrade, apiPdLabel }: {
  config: ModelConfig;
  values: Record<string, string>;
  seededValues: Record<string, string>;  // original values from API — the baseline
  apiPdGrade: number | null;
  apiPdLabel: string;
}) {
  // Compute grade from current values (user edits)
  const currentGrade = computePDGrade(config, values);
  // Compute grade from original seeded values (API baseline)
  const seededGrade  = computePDGrade(config, seededValues);

  // Final displayed grade:
  // - If API gave us a starting grade, use it as anchor
  // - Add the delta between current user values and the original seeded values
  // - This means: editing a value better than seeded → grade improves; worse → grade worsens
  const grade: number | null = (() => {
    if (currentGrade === 0) return apiPdGrade; // no numeric fields filled yet
    if (apiPdGrade !== null && seededGrade > 0) {
      // delta in model-score space → convert to grade steps
      const delta = currentGrade - seededGrade; // positive = worse grade, negative = better
      return Math.min(Math.max(apiPdGrade + delta, 1), config.max_grade);
    }
    // No API grade — use raw client computation
    return currentGrade > 0 ? currentGrade : null;
  })();

  const hasData      = grade !== null;
  const displayGrade = hasData ? grade : "—";
  const color        = hasData ? gradeColor(grade as number, config.max_grade) : "#cbd5e1";
  const label        = hasData
    ? (grade === apiPdGrade ? apiPdLabel || gradeLabel(grade as number, config.max_grade) : gradeLabel(grade as number, config.max_grade))
    : "Enter fields to compute";

  // Count filled fields
  const filled   = config.quant_fields.filter(f => values[f.key] !== undefined && values[f.key] !== "").length;
  const total    = config.quant_fields.length;
  const required = config.quant_fields.filter(f => f.required).length;
  const filledReq = config.quant_fields.filter(f => f.required && values[f.key] !== undefined && values[f.key] !== "").length;

  // Per-field contribution bars
  const contributions = config.quant_fields.map(f => {
    const raw  = parseFloat(values[f.key] ?? "");
    const hasVal = !isNaN(raw);
    const floor = parseFloat(f.floor ?? "0");
    const cap   = parseFloat(f.cap   ?? "100");
    const range = cap - floor;
    const norm  = hasVal && range > 0 ? Math.min(Math.max((raw - floor) / range, 0), 1) : null;
    return { label: f.label, weight: f.weight, norm, hasVal, badge: f.badge };
  });

  return (
    <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Grade card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "16px 16px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "sticky", top: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Live PD Grade <span style={{ float: "right", color: "#cbd5e1", fontWeight: 400, letterSpacing: 0 }}>Rules Engine</span>
        </div>

        {/* Big grade number */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color, lineHeight: 1, transition: "color 0.4s" }}>{displayGrade}</div>
          <div style={{ paddingBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1.3 }}>{label}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>max PD {config.max_grade}</div>
          </div>
        </div>

        {/* Grade bar */}
        <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
          {Array.from({ length: config.max_grade }, (_, i) => i + 1).map(g => (
            <div key={g} style={{ flex: 1, height: 5, borderRadius: 2, background: hasData && g === (grade as number) ? gradeColor(g, config.max_grade) : "#f1f5f9", border: `1px solid ${hasData && g === (grade as number) ? gradeColor(g, config.max_grade) : "#e2e8f0"}`, transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#cbd5e1", marginBottom: 12 }}>
          <span>PD 1</span><span>PD {config.max_grade}</span>
        </div>

        {/* Completion */}
        <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 8, marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 5 }}>
            <span>Fields complete</span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{filled} / {total}</span>
          </div>
          <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${total > 0 ? (filled / total) * 100 : 0}%`, background: "#2563eb", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={{ fontSize: 10, color: filledReq === required ? "#16a34a" : "#d97706" }}>
          {filledReq === required ? "✓ All required fields complete" : `⚠ ${required - filledReq} required field${required - filledReq !== 1 ? "s" : ""} remaining`}
        </div>
      </div>

      {/* Factor contribution card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "14px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Factor Contributions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contributions.map((c, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "#475569", fontWeight: 500 }} title={c.label}>
                  {c.label.length > 20 ? c.label.slice(0, 19) + "…" : c.label}
                </span>
                <span style={{ fontSize: 9, color: "#94a3b8" }}>wt:{c.weight}</span>
              </div>
              <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: c.norm !== null ? `${c.norm * 100}%` : "0%", background: c.norm !== null ? (c.norm > 0.6 ? "#16a34a" : c.norm > 0.3 ? "#d97706" : "#dc2626") : "#e2e8f0", borderRadius: 2, transition: "width 0.3s, background 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model info */}
      <div style={{ padding: "10px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 10, color: "#1e40af", lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700, marginBottom: 3 }}>{config.label}</div>
        {config.methodology_note}
      </div>

    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// ADJ LIVE PD PANEL — right sidebar on quant, qual, and adjustments screens
// ─────────────────────────────────────────────────────────────────────────────

function AdjLivePDPanel({ config, basePdGrade, finalPdGrade, pdRange, isPass, adjSelections, apiPdLabel }: {
  config: ModelConfig; basePdGrade: number; finalPdGrade: number;
  pdRange: string; isPass: boolean; adjSelections: Record<string, boolean>; apiPdLabel: string;
}) {
  const hasAdj = Object.values(adjSelections).some(Boolean);
  const color  = gradeColor(finalPdGrade, config.max_grade);
  return (
    <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "16px 16px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "sticky", top: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>📊 Live PD Grade</div>
        <div style={{ fontSize: 9, color: "#cbd5e1", marginBottom: 12 }}>Calculated PD Grade</div>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color, letterSpacing: 2, lineHeight: 1 }}>PD {finalPdGrade}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color, margin: "6px 0 8px" }}>{pdRange}</div>
          <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: isPass ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isPass ? "#bbf7d0" : "#fecaca"}`, fontSize: 11, fontWeight: 700, color: isPass ? "#15803d" : "#dc2626" }}>
            {isPass ? "✓ PASS" : "✗ FAIL"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
          {Array.from({ length: config.max_grade }, (_, i) => i + 1).map(g => (
            <div key={g} style={{ flex: 1, height: 5, borderRadius: 2, background: g === finalPdGrade ? gradeColor(g, config.max_grade) : g < finalPdGrade ? `${gradeColor(g, config.max_grade)}30` : "#f1f5f9", transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#cbd5e1", marginBottom: 12 }}>
          <span>PD 1</span><span style={{ color, fontWeight: 700 }}>PD {finalPdGrade} {isPass ? "↑Pass" : "↓Fail"}</span><span>PD {config.max_grade}</span>
        </div>
        <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Grade Build-Up</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
              <span>From Fields</span><span style={{ fontWeight: 700, color: "#0f172a" }}>PD {basePdGrade}</span>
            </div>
            {hasAdj && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                <span>Adjustments</span><span style={{ fontWeight: 700, color: finalPdGrade < basePdGrade ? "#16a34a" : finalPdGrade > basePdGrade ? "#dc2626" : "#94a3b8" }}>{finalPdGrade < basePdGrade ? "▲" : finalPdGrade > basePdGrade ? "▼" : "—"} {Math.abs(finalPdGrade - basePdGrade)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: 4 }}>
              <span style={{ fontWeight: 700 }}>Final Grade</span><span style={{ fontWeight: 800, color }}>PD {finalPdGrade}{finalPdGrade === basePdGrade && !hasAdj ? "" : ""}</span>
            </div>
          </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>User Activity</div>
        {[
          { time: null, agent: null, msg: `${config.label}. Confidence 94.2%.`, border: "#2563eb" },
          { time: "14:02:13", agent: "DataQuality", msg: "DQ: 87/100.", border: "#d97706" },
          { time: "14:02:14", agent: "PDEngine",    msg: `Base PD Grade: ${basePdGrade} (pass).`, border: "#16a34a" },
          { time: "now", agent: "Orchestrator", msg: "Monitoring…", border: "#94a3b8" },
        ].map((e, i) => (
          <div key={i} style={{ padding: "6px 10px", borderLeft: `3px solid ${e.border}`, marginBottom: 5, background: "#f8fafc", borderRadius: "0 6px 6px 0" }}>
            {e.time && <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 1 }}>{e.time} · <strong>{e.agent}</strong></div>}
            <div style={{ fontSize: 11, color: "#374151" }}>{e.msg}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>💬 AI Credit Assistant</div>
          <span style={{ fontSize: 8, fontWeight: 700, color: "#fff", background: "#6366f1", padding: "1px 6px", borderRadius: 10 }}>RAG</span>
        </div>
        <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.5, marginBottom: 10 }}>Hi! I'm your AI credit assistant. Ask me anything about this rating event.</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input placeholder="Ask about this rating…" style={{ flex: 1, padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 11, outline: "none", fontFamily: "inherit", background: "#f8fafc" }} onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
          <button style={{ padding: "6px 10px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen]               = React.useState<Screen>("search");
  const [entityId, setEntityId]           = React.useState("");
  const [entityData, setEntityData]       = React.useState<Record<string, unknown> | null>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError]     = React.useState("");

  // Progressive nav
  const [visibleSteps, setVisibleSteps]         = React.useState<StepDef[]>([{ id: "entity", label: "Entity" }]);
  const [completedStepIds, setCompletedStepIds] = React.useState<Set<string>>(new Set());

  // Model selection
  const [models, setModels]             = React.useState<Model[] | null>(null);
  const [modelsLoading, setModelsLoading] = React.useState(false);
  const [modelsError, setModelsError]     = React.useState("");
  const [selectedModelId, setSelectedModelId] = React.useState<string | null>(null);

  // Model config — fetched after model selection, drives field rendering
  const [modelConfig, setModelConfig]       = React.useState<ModelConfig | null>(null);
  const [configLoading, setConfigLoading]   = React.useState(false);
  const [configError, setConfigError]       = React.useState("");

  // Statement selection
  const [statements, setStatements]         = React.useState<Statement[]>([]);
  const [selectedStmtId, setSelectedStmtId] = React.useState<string | null>(null);
  const [expandedStmtId, setExpandedStmtId] = React.useState<string | null>(null);

  // Field values — seeded from API, user-editable
  const [fieldValues, setFieldValues]   = React.useState<Record<string, string>>({});
  // Seeded values — original API values kept as immutable baseline for grade delta
  const [seededValues, setSeededValues] = React.useState<Record<string, string>>({});
  // API-returned starting PD grade — live panel adjusts from this baseline
  const [apiPdGrade, setApiPdGrade]     = React.useState<number | null>(null);
  const [apiPdLabel, setApiPdLabel]     = React.useState<string>("");
  const [fieldsLoading, setFieldsLoading] = React.useState(false);
  const [fieldsError, setFieldsError]   = React.useState("");

  // Adjustment selections — key → boolean (checked)
  const [adjSelections, setAdjSelections] = React.useState<Record<string, boolean>>({});
  // Guarantor substitute grade (when full guarantee selected)
  const [guarantorSubGrade, setGuarantorSubGrade] = React.useState<number | null>(null);
  // Rating commentary
  const [commentary, setCommentary]     = React.useState("");

  // ── Derived (needed by handlers below) ────────────────────────────────────
  const isGuarantor = selectedStmtId === "__guarantor__";
  const isManual    = selectedStmtId === "__manual__";
  const showQuant   = !isGuarantor && (modelConfig?.quant_required ?? true);
  const showQual    = !isGuarantor && (modelConfig?.qual_required  ?? true);

  // ── Reveal next step via API ───────────────────────────────────────────────
  const revealNextStep = async (currentStep: string, opts?: { statementId?: string }) => {
    try {
      const res = await fetch("/api/next-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId:      entityId.trim(),
          currentStep,
          statementId:   opts?.statementId,
          quantRequired: modelConfig?.quant_required ?? true,
          qualRequired:  modelConfig?.qual_required  ?? true,
        }),
      });
      const json = await res.json();
      if (json.nextStep) {
        setVisibleSteps(prev => prev.some(s => s.id === json.nextStep.id) ? prev : [...prev, json.nextStep]);
      }
    } catch { /* non-critical */ }
  };

  const completeStep = async (stepId: string, opts?: { statementId?: string }) => {
    setCompletedStepIds(prev => new Set([...prev, stepId]));
    await revealNextStep(stepId, opts);
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const id = entityId.trim(); if (!id) return;
    setSearchLoading(true); setSearchError(""); setEntityData(null);
    setVisibleSteps([{ id: "entity", label: "Entity" }]);
    setCompletedStepIds(new Set()); setModelConfig(null);
    try {
      const res = await fetch(`/api/search?entityId=${encodeURIComponent(id)}`);
      const json = await res.json();
      if (!res.ok) { setSearchError(json.error ?? "Entity not found"); return; }
      setEntityData(json);
      if (isStatementsArray(json.statements)) setStatements(json.statements);
      await revealNextStep("entity");
    } catch { setSearchError("Could not connect to API"); }
    finally { setSearchLoading(false); }
  };

  // ── Entity → Model ─────────────────────────────────────────────────────────
  const handleToModel = async () => {
    setModelsLoading(true); setModelsError(""); setModels(null); setSelectedModelId(null);
    await completeStep("entity");
    setScreen("model");
    try {
      const res = await fetch(`/api/models?entityId=${encodeURIComponent(entityId.trim())}`);
      const json = await res.json();
      if (!res.ok) { setModelsError(json.error ?? "Could not load models"); return; }
      if (isModelArray(json.models)) {
        setModels(json.models);
        const rec = json.models.find((m: Model) => m.recommended);
        if (rec) setSelectedModelId(rec.id);
      }
    } catch { setModelsError("Could not connect to API"); }
    finally { setModelsLoading(false); }
  };

  // ── Model selected → fetch config, then go to Statement ───────────────────
  const handleToStatement = async () => {
    if (!selectedModelId) return;
    setConfigLoading(true); setConfigError(""); setModelConfig(null);
    await completeStep("model");

    try {
      const res = await fetch(`/api/model-config?modelId=${encodeURIComponent(selectedModelId)}`);
      const json = await res.json();
      if (!res.ok) { setConfigError(json.error ?? "Could not load model config"); setScreen("statement"); return; }
      setModelConfig(json as ModelConfig);
    } catch { setConfigError("Could not connect to config service"); }
    finally { setConfigLoading(false); }

    setSelectedStmtId(null); setExpandedStmtId(null); setFieldValues({});
    setScreen("statement");
  };

  // ── Statement → Quantitative (or Qualitative if quant skipped) ────────────
  const handleToFields = async () => {
    if (!selectedStmtId) return;
    await completeStep("statement", { statementId: selectedStmtId });

    // Special paths — no fields API call needed
    if (isGuarantor || isManual) {
      setFieldValues({}); setApiPdGrade(null); setApiPdLabel("");
      setScreen("qualitative");
      return;
    }

    // Call /api/fields — returns pre-filled values + starting pd_grade
    setFieldsLoading(true); setFieldsError(""); setFieldValues({}); setApiPdGrade(null);
    const targetScreen = modelConfig?.quant_required ? "quantitative" : modelConfig?.qual_required ? "qualitative" : "qualitative";
    setScreen(targetScreen);

    try {
      const res  = await fetch("/api/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statementId: selectedStmtId, entityId: entityId.trim(), modelId: selectedModelId }),
      });
      const json = await res.json();
      if (!res.ok) { setFieldsError(json.error ?? "Could not load fields"); return; }

      // Seed apiPdGrade from the response
      if (typeof json.pd_grade === "number") {
        setApiPdGrade(json.pd_grade);
        setApiPdLabel(json.pd_label ?? "");
      }

      // Seed fieldValues from each field's `value` property
      const seeded: Record<string, string> = {};
      (json.sections ?? []).forEach((section: { type: string; fields?: { key: string; value?: string }[] }) => {
        if (section.type === "fields" && Array.isArray(section.fields)) {
          section.fields.forEach(f => {
            if (f.value !== undefined && f.value !== "") seeded[f.key] = f.value;
          });
        }
      });
      setFieldValues(seeded);
      setSeededValues(seeded); // keep original as immutable baseline for grade delta
    } catch { setFieldsError("Could not connect to API"); }
    finally { setFieldsLoading(false); }
  };

  // ── Quantitative → Qualitative (or Adjustments if qual skipped) ────────────
  const handleQuantContinue = async () => {
    await completeStep("quantitative");
    if (modelConfig?.qual_required) {
      setScreen("qualitative");
    } else {
      setScreen("adjustments");
    }
  };

  // ── Qualitative → Adjustments ──────────────────────────────────────────────
  const handleQualContinue = async () => {
    await completeStep("qualitative");
    setScreen("adjustments");
  };

  // ── Adjustments → Summary ──────────────────────────────────────────────────
  const handleAdjContinue = async () => {
    await completeStep("adjustments");
    setScreen("summary");
  };

  const handleReset = () => {
    setScreen("search"); setEntityId(""); setEntityData(null); setSearchError("");
    setVisibleSteps([{ id: "entity", label: "Entity" }]); setCompletedStepIds(new Set());
    setModels(null); setSelectedModelId(null); setModelConfig(null);
    setStatements([]); setSelectedStmtId(null); setExpandedStmtId(null);
    setFieldValues({}); setSeededValues({}); setApiPdGrade(null); setApiPdLabel(""); setFieldsError("");
    setAdjSelections({}); setGuarantorSubGrade(null); setCommentary("");
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const headerFields  = entityData ? Object.entries(entityData).filter(([, v]) => typeof v === "string" || typeof v === "number") : [];
  const entityName    = String(headerFields.find(([k]) => k.toLowerCase().includes("name"))?.[1] ?? entityId);
  const selectedModel = models?.find(m => m.id === selectedModelId);
  const recId         = models?.find(m => m.recommended)?.id ?? null;
  const isOverride    = selectedModelId !== null && selectedModelId !== recId;

  // Adjustment definitions — from model config adj_enabled, drives the adjustment screen
  const REGULATORY_ADJS = [
    { key: "reg_current_del",   label: "Current Delinquency (30+ DPD)",          delta: -2, info: "Borrower 30+ days past due on any obligation" },
    { key: "reg_prior_del",     label: "Prior 12-Month Delinquency",              delta: -1, info: "Any delinquency in trailing 12 months" },
    { key: "reg_maturity",      label: "Maturity Default / Extension",            delta: -2, info: "Maturity extended or defaulted in last 24 months" },
    { key: "reg_covenant",      label: "Financial Covenant Breach",               delta: -1, info: "Active covenant waiver or breach in last 12 months" },
    { key: "reg_industry",      label: "Significant Industry Downturn",           delta: -1, info: "Regulator-flagged sector stress" },
    { key: "reg_key_man",       label: "Loss of Key Management",                  delta: -1, info: "CEO / CFO departure without named successor" },
  ];
  const RELATED_PARTY_ADJS = [
    { key: "rp_corp_partial_50", label: "Corporate Partial Guarantee (≥50%)",     delta: +1,   info: "Investment-grade guarantor covering ≥50% of exposure" },
    { key: "rp_corp_partial_lt", label: "Corporate Partial Guarantee (<50%)",     delta: +0.5, info: "Investment-grade guarantor covering <50% of exposure" },
    { key: "rp_related_party",  label: "Related Party Support Letter",            delta: +0.5, info: "Confirmed support from parent / affiliate" },
  ];

  // Compute total adjustment delta from checked boxes
  const totalAdjDelta = (() => {
    if (adjSelections["full_guarantee"] && guarantorSubGrade !== null) return null; // full substitute
    let d = 0;
    [...REGULATORY_ADJS, ...RELATED_PARTY_ADJS].forEach(a => { if (adjSelections[a.key]) d += a.delta; });
    return Math.round(d * 2) / 2; // round to nearest 0.5
  })();

  // Live grade from field edits — delta from seeded baseline applied to API grade
  const liveFieldGrade = (() => {
    if (!modelConfig) return apiPdGrade ?? 6;
    const currentGrade = computePDGrade(modelConfig, fieldValues);
    const seededGrade  = computePDGrade(modelConfig, seededValues);
    if (currentGrade === 0) return apiPdGrade ?? 6;
    if (apiPdGrade !== null && seededGrade > 0) {
      const delta = currentGrade - seededGrade;
      return Math.min(Math.max(apiPdGrade + delta, 1), modelConfig.max_grade);
    }
    return currentGrade > 0 ? currentGrade : (apiPdGrade ?? 6);
  })();

  // basePdGrade = live field grade (updates as user edits quant/qual)
  // finalPdGrade = basePdGrade after applying adjustment deltas
  const basePdGrade = liveFieldGrade;
  const finalPdGrade = (() => {
    if (adjSelections["full_guarantee"] && guarantorSubGrade !== null) return guarantorSubGrade;
    if (totalAdjDelta === null) return basePdGrade;
    return Math.min(Math.max(Math.round(basePdGrade - totalAdjDelta), 1), modelConfig?.max_grade ?? 12);
  })();

  // PD range table (approximate annualised PD % ranges by grade)
  const PD_RANGES: Record<number, string> = {
    1: "< 0.10%", 2: "0.10% – 0.25%", 3: "0.25% – 0.50%", 4: "0.50% – 1.00%",
    5: "1.00% – 1.50%", 6: "1.50% – 2.00%", 7: "2.00% – 3.00%", 8: "2.00% – 3.50%",
    9: "3.50% – 5.00%", 10: "5.00% – 8.00%", 11: "8.00% – 15.00%", 12: "> 15.00%",
  };
  const isPassGrade = (g: number) => g <= (modelConfig ? Math.floor(modelConfig.max_grade * 0.67) : 8);

  const renderScreenContent = () => (<>
            {/* ── SCREEN 1: Entity Search ── */}
            {screen === "search" && (
              <>
                <Card title="Entity Search">
                  <div style={{ display: "flex", gap: 10 }}>
                    <input value={entityId} onChange={e => setEntityId(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="Enter entity ID — e.g. ENT-001" style={{ ...INPUT, flex: 1, fontSize: 14 }} onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                    <button onClick={handleSearch} disabled={searchLoading || !entityId.trim()} style={{ padding: "10px 24px", background: searchLoading || !entityId.trim() ? "#e2e8f0" : "#0f172a", color: searchLoading || !entityId.trim() ? "#94a3b8" : "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: searchLoading || !entityId.trim() ? "not-allowed" : "pointer" }}>{searchLoading ? "Searching…" : "Search"}</button>
                  </div>
                  {searchError && <div style={{ marginTop: 12, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12 }}>⚠ {searchError}</div>}
                  {!entityData && !searchLoading && (
                    <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Try:</span>
                      {["ENT-001","ENT-002","ENT-003","ENT-004","ENT-005","ENT-006","ENT-007","ENT-008","ENT-009","ENT-010"].map(id => (
                        <button key={id} onClick={() => { setEntityId(id); setTimeout(handleSearch, 50); }} style={{ padding: "3px 10px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.borderColor = "#94a3b8")} onMouseLeave={e => (e.currentTarget.style.borderColor = "#e2e8f0")}>{id}</button>
                      ))}
                    </div>
                  )}
                </Card>
                {entityData && (<>
                  {headerFields.length > 0 && (
                    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8edf2", padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      {headerFields.map(([k, v]) => (<div key={k}><div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{humanize(k)}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginTop: 3 }}>{String(v)}</div></div>))}
                    </div>
                  )}
                  <EntityDisplay data={entityData} />
                  <ContinueBtn label="Continue to Model Selection" onClick={handleToModel} show={!!entityData} />
                </>)}
              </>
            )}

            {/* ── SCREEN 2: Model Selection ── */}
            {screen === "model" && (
              <>
                <button onClick={() => setScreen("search")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← Back</button>
                <Card title="Select Rating Model">
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px", lineHeight: 1.6 }}>The system has evaluated this entity and recommends a model. You may select a different model if needed.</p>
                  {modelsLoading && <div style={{ padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>Loading models…</div>}
                  {modelsError  && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12 }}>⚠ {modelsError}</div>}
                  {models && <ModelSelector models={models} selectedId={selectedModelId} onSelect={setSelectedModelId} />}
                </Card>
                {configLoading && <Card><div style={{ padding: "12px 0", color: "#94a3b8", fontSize: 13 }}>◈ Fetching model config from Model Config Service…</div></Card>}
                {configError   && <Card><div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12 }}>⚠ {configError}</div></Card>}
                {models && (
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14 }}>
                    {selectedModelId && <span style={{ fontSize: 12, color: isOverride ? "#d97706" : "#16a34a", fontWeight: 600 }}>{isOverride ? `⚠ Override: ${selectedModel?.label}` : `✓ ${selectedModel?.label}`}</span>}
                    <ContinueBtn label={`Continue with ${selectedModel?.label ?? "—"}`} onClick={handleToStatement} disabled={!selectedModelId || configLoading} show={true} />
                  </div>
                )}
              </>
            )}

            {/* ── SCREEN 3: Statement Selection ── */}
            {screen === "statement" && (
              <>
                <button onClick={() => setScreen("model")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← Back</button>
                {modelConfig && (
                  <div style={{ padding: "10px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>◈ Model Config Loaded: {modelConfig.label}</span>
                    <span style={{ fontSize: 11, color: "#16a34a" }}>Quant: {modelConfig.quant_required ? "✓ Required" : "— Skipped"}</span>
                    <span style={{ fontSize: 11, color: "#16a34a" }}>Qual: {modelConfig.qual_required ? "✓ Required" : "— Skipped"}</span>
                    <span style={{ fontSize: 11, color: "#16a34a" }}>{modelConfig.quant_fields.length} quant fields · {modelConfig.qual_fields.length} qual fields · Max PD {modelConfig.max_grade}</span>
                  </div>
                )}
                <Card title="Financial Statement Selection">
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px", lineHeight: 1.6 }}>Select the financial statement. Guarantor PD Substitution skips Quantitative and Qualitative steps.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {statements.map(stmt => (
                      <StatementCard key={stmt.id} stmt={stmt} selected={selectedStmtId === stmt.id} expanded={expandedStmtId === stmt.id} onSelect={() => setSelectedStmtId(stmt.id)} onToggleDetail={() => setExpandedStmtId(expandedStmtId === stmt.id ? null : stmt.id)} />
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                      <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} /><span style={{ fontSize: 11, color: "#cbd5e1" }}>or choose an alternative</span><div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
                    </div>
                    <SpecialCard icon="✏️" title="Manual Ratio Entry" subtitle="Underwriter inputs ratios directly" selected={selectedStmtId === "__manual__"} onClick={() => setSelectedStmtId("__manual__")} />
                    <SpecialCard icon="🔗" title="No Statement — Guarantor PD Substitution" subtitle="PD fully substituted by guarantor's approved grade." badge="SKIPS QUANT+QUAL" selected={selectedStmtId === "__guarantor__"} onClick={() => setSelectedStmtId("__guarantor__")} />
                  </div>
                </Card>
                <ContinueBtn label="Continue" onClick={handleToFields} disabled={!selectedStmtId} show={!!selectedStmtId} />
              </>
            )}

            {/* ── SCREEN 4: Quantitative ── */}
            {screen === "quantitative" && modelConfig && (
              <>
                <button onClick={() => setScreen("statement")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← Back</button>
                {fieldsLoading && <div style={{ padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>◈ Loading pre-filled values from financial spreading…</div>}
                {fieldsError   && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12 }}>⚠ {fieldsError}</div>}
                {!fieldsLoading && <QuantSection config={modelConfig} values={fieldValues} onChange={(k, v) => setFieldValues(p => ({ ...p, [k]: v }))} />}
                {!fieldsLoading && <ContinueBtn label={showQual ? "Continue to Qualitative →" : "Continue to Adjustments →"} onClick={handleQuantContinue} show={true} />}
              </>
            )}

            {/* ── SCREEN 5: Qualitative ── */}
            {screen === "qualitative" && (
              <>
                <button onClick={() => setScreen(showQuant ? "quantitative" : "statement")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← Back</button>
                {isGuarantor && modelConfig && (
                  <Card title="Guarantor PD Substitution">
                    <div style={{ marginBottom: 14, padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 12, color: "#92400e" }}>⚠ PD fully substituted by guarantor's approved grade — Quant and Qual steps skipped.</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {([{ key: "guarantor_name", label: "Guarantor Name", type: "text" as const }, { key: "guarantor_grade", label: "Guarantor Approved Grade", type: "select" as const, options: ["PD 1","PD 2","PD 3","PD 4","PD 5","PD 6","PD 7","PD 8"] }, { key: "guarantee_type", label: "Guarantee Type", type: "select" as const, options: ["Full Guarantee","Partial Guarantee","Keep-well Agreement"] }]).map(f => (
                        <div key={f.key}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</div>
                          {f.type === "select" ? <select value={fieldValues[f.key] ?? ""} onChange={e => setFieldValues(p => ({ ...p, [f.key]: e.target.value }))} style={INPUT}><option value="">— Select —</option>{f.options?.map(o => <option key={o} value={o}>{o}</option>)}</select> : <input value={fieldValues[f.key] ?? ""} onChange={e => setFieldValues(p => ({ ...p, [f.key]: e.target.value }))} style={INPUT} />}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                {isManual && (
                  <Card title="Manual Ratio Entry">
                    <div style={{ marginBottom: 14, padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, fontSize: 12, color: "#92400e" }}>⚠ Manual entry — underwriter inputs ratios directly. Written rationale required.</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {[{ key: "dscr", label: "DSCR", unit: "x" }, { key: "leverage", label: "Total Debt / EBITDA", unit: "x" }, { key: "profit_margin", label: "Net Profit Margin", unit: "%" }].map(f => (
                        <div key={f.key} style={{ position: "relative" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</div>
                          <input type="number" value={fieldValues[f.key] ?? ""} onChange={e => setFieldValues(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...INPUT, paddingRight: 36 }} onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                          <span style={{ position: "absolute", right: 10, bottom: 9, fontSize: 11, color: "#94a3b8" }}>{f.unit}</span>
                        </div>
                      ))}
                      <div style={{ gridColumn: "span 2" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Rationale <span style={{ fontSize: 9, color: "#fff", background: "#dc2626", padding: "1px 6px", borderRadius: 4 }}>REQ</span></div>
                        <textarea value={fieldValues.rationale ?? ""} onChange={e => setFieldValues(p => ({ ...p, rationale: e.target.value }))} rows={3} style={{ ...INPUT, resize: "vertical" }} />
                      </div>
                    </div>
                  </Card>
                )}
                {!isGuarantor && !isManual && modelConfig && showQual && (
                  <QualSection config={modelConfig} values={fieldValues} onChange={(k, v) => setFieldValues(p => ({ ...p, [k]: v }))} />
                )}
                <ContinueBtn label="Continue to Adjustments →" onClick={handleQualContinue} show={true} />
              </>
            )}

            {/* ── SCREEN 6: Adjustments ── */}
            {screen === "adjustments" && (
              <>
                <button onClick={() => setScreen(showQual ? "qualitative" : "quantitative")} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← Back</button>

                {/* Full Guarantee */}
                <Card title="⚖️ Adjustments & Overrides">
                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: "0 0 16px" }}>
                    Three adjustment layers — <strong>Related Party</strong> (improves grade), <strong>Regulatory Class</strong> (forces grade down), and <strong>Expert Judgment</strong> (constrained override). Max grade: PD {modelConfig?.max_grade ?? 12}.
                  </p>

                  {/* Full Guarantee */}
                  <div style={{ padding: "14px 16px", borderRadius: 10, border: adjSelections["full_guarantee"] ? "2px solid #2563eb" : "1px solid #e2e8f0", background: adjSelections["full_guarantee"] ? "#eff6ff" : "#f8fafc", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <input type="checkbox" checked={!!adjSelections["full_guarantee"]} onChange={e => setAdjSelections(p => ({ ...p, full_guarantee: e.target.checked }))} style={{ marginTop: 3, width: 15, height: 15, cursor: "pointer" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>🔗 Full Guarantee — PD Substitution</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#7c3aed", padding: "2px 8px", borderRadius: 20 }}>FULL SUBSTITUTE</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px" }}>Replaces base PD with guarantor's approved grade.</p>
                        {adjSelections["full_guarantee"] && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Guarantor Grade:</span>
                            <select value={guarantorSubGrade ?? ""} onChange={e => setGuarantorSubGrade(Number(e.target.value))} style={{ ...INPUT, width: 120, fontSize: 13 }}>
                              <option value="">— Select —</option>
                              {Array.from({ length: modelConfig?.max_grade ?? 12 }, (_, i) => i + 1).map(g => (
                                <option key={g} value={g}>PD {g}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Regulatory Class */}
                <Card title="🏛 Regulatory Class Adjustment">
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 12px" }}>Each selected factor worsens the base grade. Cumulative — multiple factors stack.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {REGULATORY_ADJS.map(a => (
                      <div key={a.key} onClick={() => setAdjSelections(p => ({ ...p, [a.key]: !p[a.key] }))}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: adjSelections[a.key] ? "1px solid #fecaca" : "1px solid #f1f5f9", background: adjSelections[a.key] ? "#fff5f5" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                        <input type="checkbox" checked={!!adjSelections[a.key]} onChange={() => {}} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#dc2626" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>ⓘ {a.info}</div>
                        </div>
                        <div style={{ width: 36, height: 28, borderRadius: 6, background: adjSelections[a.key] ? "#fef2f2" : "#f8fafc", border: `1px solid ${adjSelections[a.key] ? "#fecaca" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#dc2626" }}>
                          {a.delta}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Related Party */}
                <Card title="🤝 Related Party / Partial Guarantee">
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 12px" }}>Each selected item improves the base grade. Cumulative.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RELATED_PARTY_ADJS.map(a => (
                      <div key={a.key} onClick={() => setAdjSelections(p => ({ ...p, [a.key]: !p[a.key] }))}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: adjSelections[a.key] ? "1px solid #bbf7d0" : "1px solid #f1f5f9", background: adjSelections[a.key] ? "#f0fdf4" : "#fff", cursor: "pointer", transition: "all 0.15s" }}>
                        <input type="checkbox" checked={!!adjSelections[a.key]} onChange={() => {}} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#16a34a" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>ⓘ {a.info}</div>
                        </div>
                        <div style={{ width: 36, height: 28, borderRadius: 6, background: adjSelections[a.key] ? "#f0fdf4" : "#f8fafc", border: `1px solid ${adjSelections[a.key] ? "#bbf7d0" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#16a34a" }}>
                          +{a.delta}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Step indicator + continue */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Step 6 / {visibleSteps.length} — Adjustments</span>
                  <ContinueBtn label="Calculate Final PD →" onClick={handleAdjContinue} show={true} />
                </div>
              </>
            )}

            {/* ── SCREEN 7: PD Summary ── */}
            {screen === "summary" && (
              <>
                {/* Two-column grid layout matching PDF */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

                  {/* ── Left col: Final PD + Commentary + Approval ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Final PD Summary card */}
                    <Card title="🏁 Final PD Summary">
                      <div style={{ display: "flex", gap: 0 }}>
                        {/* Big grade */}
                        <div style={{ flex: "0 0 160px", padding: "16px 20px 16px 0", borderRight: "1px solid #f1f5f9", marginRight: 20 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Final PD Grade</div>
                          <div style={{ fontSize: 64, fontWeight: 900, color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12), lineHeight: 1 }}>PD</div>
                          <div style={{ fontSize: 72, fontWeight: 900, color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12), lineHeight: 1, marginBottom: 8 }}>{finalPdGrade}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12), marginBottom: 8 }}>{PD_RANGES[finalPdGrade] ?? "—"}</div>
                          <div style={{ padding: "3px 10px", background: isPassGrade(finalPdGrade) ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isPassGrade(finalPdGrade) ? "#bbf7d0" : "#fecaca"}`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: isPassGrade(finalPdGrade) ? "#15803d" : "#dc2626", display: "inline-block" }}>
                            {isPassGrade(finalPdGrade) ? "✓ PASS" : "✗ FAIL"}
                          </div>
                        </div>
                        {/* Grade build-up */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Grade Build-Up</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: "#f8fafc", borderRadius: 7 }}>
                              <span style={{ fontSize: 12, color: "#64748b" }}>Base Model PD</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>PD {basePdGrade}</span>
                            </div>
                            {Object.entries(adjSelections).filter(([, v]) => v).map(([k]) => {
                              const adj = [...REGULATORY_ADJS, ...RELATED_PARTY_ADJS].find(a => a.key === k);
                              if (!adj) return null;
                              const isNeg = adj.delta < 0;
                              return (
                                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: isNeg ? "#fff5f5" : "#f0fdf4", borderRadius: 7 }}>
                                  <span style={{ fontSize: 11, color: "#64748b" }}>{adj.label}</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: isNeg ? "#dc2626" : "#16a34a" }}>{adj.delta > 0 ? "+" : ""}{adj.delta}</span>
                                </div>
                              );
                            })}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#eff6ff", borderRadius: 7, border: "1px solid #bfdbfe", marginTop: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>Final Grade</span>
                              <span style={{ fontSize: 14, fontWeight: 800, color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12) }}>PD {finalPdGrade}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Commentary */}
                      <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Rating Summary / Commentary</div>
                        <textarea value={commentary} onChange={e => setCommentary(e.target.value)} placeholder="Enter credit narrative or click AI Draft…" rows={4} style={{ ...INPUT, resize: "vertical", width: "100%" }} />
                        <button style={{ marginTop: 8, padding: "8px 16px", background: "linear-gradient(135deg,#7c3aed,#2563eb)", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          ✨ Draft Summary
                        </button>
                      </div>
                    </Card>

                    {/* Approval Workflow */}
                    <Card title="🔄 Approval Workflow">
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { icon: "✅", label: "Underwriter Completes Rating", sub: `${entityName.split(" ")[0]} · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, done: true,    active: false },
                          { icon: "⏳", label: "Pending Credit Approval",       sub: "Routed to M. Johnson",                                                                                                                           done: false,   active: true  },
                          { icon: "📝", label: "Final Approval",                sub: "Pending",                                                                                                                                        done: false,   active: false },
                        ].map((step, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, border: step.active ? "1px solid #bfdbfe" : "1px solid #f1f5f9", background: step.active ? "#eff6ff" : "#fff" }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: step.active ? 700 : 600, color: step.done ? "#16a34a" : step.active ? "#1e40af" : "#94a3b8" }}>{step.label}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{step.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* ── Right col: Live PD Grade + Agent Activity + AI Chat ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Live PD Grade */}
                    <Card title="📊 Live PD Grade">
                      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Calculated PD Grade</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12), letterSpacing: 2 }}>PD {finalPdGrade}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12), margin: "6px 0 10px" }}>{PD_RANGES[finalPdGrade] ?? "—"}</div>
                        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: isPassGrade(finalPdGrade) ? "#f0fdf4" : "#fef2f2", border: `1px solid ${isPassGrade(finalPdGrade) ? "#bbf7d0" : "#fecaca"}`, fontSize: 12, fontWeight: 700, color: isPassGrade(finalPdGrade) ? "#15803d" : "#dc2626" }}>
                          {isPassGrade(finalPdGrade) ? "✓ PASS" : "✗ FAIL"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 4px", fontSize: 11, color: "#94a3b8" }}>
                          <span>PD 1</span>
                          <span style={{ color: gradeColor(finalPdGrade, modelConfig?.max_grade ?? 12), fontWeight: 700 }}>PD {finalPdGrade} {isPassGrade(finalPdGrade) ? "↑Pass" : "↓Fail"}</span>
                          <span>PD {modelConfig?.max_grade ?? 12}</span>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {Array.from({ length: modelConfig?.max_grade ?? 12 }, (_, i) => i + 1).map(g => (
                            <div key={g} style={{ flex: 1, height: 6, borderRadius: 2, background: g === finalPdGrade ? gradeColor(g, modelConfig?.max_grade ?? 12) : g < finalPdGrade ? `${gradeColor(g, modelConfig?.max_grade ?? 12)}40` : "#f1f5f9", transition: "all 0.3s" }} />
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Agent Activity */}
                    <Card title="🤖 Agent Activity">
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {[
                          { time: null,       agent: null,          msg: `${modelConfig?.label ?? "C&I"} model. Confidence 94.2%.`,                                 border: "#2563eb" },
                          { time: "14:02:13", agent: "DataQuality", msg: "Rev growth missing — imputed via model logic. DQ: 87/100.",                               border: "#d97706" },
                          { time: "14:02:14", agent: "PDEngine",    msg: `Base PD Grade: ${basePdGrade} (${isPassGrade(basePdGrade) ? "pass" : "fail"}).`,         border: "#16a34a" },
                          { time: "now",      agent: "Orchestrator",msg: "Monitoring…",                                                                             border: "#94a3b8" },
                        ].map((entry, i) => (
                          <div key={i} style={{ padding: "8px 12px", borderLeft: `3px solid ${entry.border}`, marginBottom: 6, background: "#f8fafc", borderRadius: "0 6px 6px 0" }}>
                            {entry.time && <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{entry.time} · <span style={{ fontWeight: 700 }}>{entry.agent}</span></div>}
                            <div style={{ fontSize: 12, color: "#374151" }}>{entry.msg}</div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* AI Credit Assistant */}
                  {/*  <Card title="💬 AI Credit Assistant">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#6366f1", padding: "2px 8px", borderRadius: 20 }}>RAG</span>
                      </div>
                      <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 10, fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 12 }}>
                        Hi! I'm your AI credit assistant. Ask me anything about this rating event.
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input placeholder="Ask about this rating…" style={{ ...INPUT, flex: 1, fontSize: 12 }} onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e2e8f0")} />
                        <button style={{ padding: "8px 12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>↑</button>
                      </div>
                    </Card>*/}
                  </div>
                </div>

                {/* Bottom nav */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => setScreen("adjustments")} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>← Back</button>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Step {visibleSteps.length} / {visibleSteps.length} — PD Summary</span>
                </div>
              </>
            )}
  </>);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", background: "#f0f4f8" }}>
      {/* Sidebar — logo click goes home */}
      <div style={{ width: 220, flexShrink: 0, background: "#1e3a5f", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
        <div onClick={handleReset} style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>PD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>RiskRater AI</div>
            <div style={{ fontSize: 10, color: "#93c5fd" }}>v4.0.0</div>
          </div>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>‹</span>
        </div>
        <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {[
            { section: "RATING", items: [{ icon: "⚡", label: "Active Event", active: true }, { icon: "☰", label: "My Queue", active: false }, { icon: "🕐", label: "History", active: false }] },
            { section: "ADMIN",  items: [{ icon: "🔧", label: "Model Config", active: false }, { icon: "📊", label: "Reporting", active: false }, { icon: "👥", label: "Workflow", active: false }] },
          ].map(g => (
            <div key={g.section} style={{ marginBottom: 8 }}>
              <div style={{ padding: "8px 18px 4px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{g.section}</div>
              {g.items.map(item => (
                <div key={item.label} style={{ margin: "1px 8px", padding: "9px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: item.active ? "rgba(59,130,246,0.25)" : "transparent", border: item.active ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent" }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: item.active ? 700 : 400, color: item.active ? "#93c5fd" : "rgba(255,255,255,0.6)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ margin: "0 8px 12px", padding: "12px 14px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", marginBottom: 8 }}>AI AGENTS ACTIVE</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: `pulse ${1 + i * 0.3}s ease-in-out infinite alternate` }} />)}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>3 agents running</div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* App bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e8edf2", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Risk Rating Event{entityData ? ` — RE-${new Date().getFullYear()}-${entityId.replace("ENT-","0")}847` : ""}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {entityData ? `${entityName} · PD Task` : "No entity selected · PD Task"} · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          {entityData && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ padding: "4px 12px", borderRadius: 20, background: "#fef3c7", border: "1px solid #fde68a", fontSize: 11, fontWeight: 700, color: "#92400e" }}>IN PROGRESS</div>
              <button style={{ padding: "6px 14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Save Draft</button>
              <button onClick={() => setScreen("summary")} style={{ padding: "6px 14px", background: screen === "summary" ? "#16a34a" : "#0f172a", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
                {screen === "summary" ? "✓ Submitted" : "Submit for Approval →"}
              </button>
            </div>
          )}
          {!entityData && <button onClick={handleReset} style={{ fontSize: 11, color: "#64748b", background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}>New Search</button>}
        </div>

        {/* Progressive top nav */}
        {entityData && visibleSteps.length > 0 && (
          <TopNav
            visibleSteps={visibleSteps}
            currentScreen={screen}
            completedStepIds={completedStepIds}
            onStepClick={(_stepId, targetScreen) => setScreen(targetScreen)}
          />
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {(screen === "quantitative" || screen === "qualitative" || screen === "adjustments") && modelConfig ? (
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>{renderScreenContent()}</div>
              <AdjLivePDPanel
                config={modelConfig}
                basePdGrade={basePdGrade}
                finalPdGrade={finalPdGrade}
                pdRange={PD_RANGES[finalPdGrade] ?? "—"}
                isPass={isPassGrade(finalPdGrade)}
                adjSelections={adjSelections}
                apiPdLabel={apiPdLabel}
              />
            </div>
          ) : (
            <div style={{ maxWidth: screen === "summary" ? 1100 : 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>{renderScreenContent()}</div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{from{opacity:1}to{opacity:0.4}} *{box-sizing:border-box}`}</style>
    </div>
  );
}