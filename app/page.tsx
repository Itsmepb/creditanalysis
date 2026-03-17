"use client";
import React from "react";

// ── Types ──────────────────────────────────────────────
type OvLine  = { label: string; value: string; type: "good" | "warn" | "bad" };
type Col     = { key: string; label: string };
type Row     = Record<string, string>;
type Dropdown= { label: string; options: string[]; filterField?: string };
type JsonData= Record<string, unknown>;
type Table   = { columns: Col[]; rows: Row[] };

// ── Shape Detectors ────────────────────────────────────
function isOverview(val: unknown): val is OvLine[] {
  return (
    Array.isArray(val) &&
    val.length > 0 &&
    typeof val[0] === "object" &&
    val[0] !== null &&
    "label" in val[0] &&
    "value" in val[0]
  );
}

function isTable(val: unknown): val is Table {
  return (
    typeof val === "object" &&
    val !== null &&
    "columns" in val &&
    "rows"    in val &&
    Array.isArray((val as Record<string, unknown>).columns) &&
    Array.isArray((val as Record<string, unknown>).rows)
  );
}

function isDropdown(val: unknown): val is Dropdown {
  return (
    typeof val === "object" &&
    val !== null &&
    "label"   in val &&
    "options" in val &&
    Array.isArray((val as Record<string, unknown>).options)
  );
}

function shouldSkip(key: string, val: unknown): boolean {
  const id = new Set(["entityId","entityName","entityType","industry","country"]);
  return id.has(key) || isOverview(val) || isTable(val) || isDropdown(val);
}

// ── Helpers ────────────────────────────────────────────
function fmtKey(k: string) {
  return k
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const DOT: Record<string, string> = {
  good: "#16a34a",
  warn: "#d97706",
  bad:  "#dc2626",
};

// ── Overview Panel ─────────────────────────────────────
function OverviewPanel({ lines }: { lines: OvLine[] }) {
  if (!lines?.length) return null;
  return (
    <div style={{
      background:   "#fff",
      border:       "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow:     "hidden",
    }}>
      <div style={{
        padding:       "8px 14px",
        background:    "#f8fafc",
        borderBottom:  "1px solid #e2e8f0",
        fontSize:      "10px",
        fontWeight:    700,
        color:         "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        Overview
      </div>
      <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:"5px" }}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "5px 8px",
              background:     "#f8fafc",
              borderRadius:   "6px",
              border:         "1px solid #f1f5f9",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
              <div style={{
                width:        "6px",
                height:       "6px",
                borderRadius: "50%",
                background:   DOT[l.type] ?? "#d97706",
                flexShrink:   0,
              }} />
              <span style={{ fontSize:"12px", color:"#64748b" }}>{l.label}</span>
            </div>
            <span style={{ fontSize:"12px", fontWeight:700, color:"#0f172a" }}>{l.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Financial Table ────────────────────────────────────
function FinancialTable({ columns, rows }: { columns: Col[]; rows: Row[] }) {
  if (!columns?.length || !rows?.length) return null;
  return (
    <div style={{
      background:   "#fff",
      border:       "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow:     "hidden",
    }}>
      <div style={{
        padding:        "8px 14px",
        background:     "#f8fafc",
        borderBottom:   "1px solid #e2e8f0",
        display:        "flex",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontSize:      "10px",
          fontWeight:    700,
          color:         "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Financial Statement
        </span>
        <span style={{ fontSize:"10px", color:"#cbd5e1" }}>
          {rows.length} rows · {columns.length} cols
        </span>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f1f5f9" }}>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    padding:       "9px 14px",
                    textAlign:     "left",
                    fontSize:      "11px",
                    fontWeight:    700,
                    color:         "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace:    "nowrap",
                    borderBottom:  "2px solid #e2e8f0",
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background:   ri % 2 === 0 ? "#fff" : "#fafafa",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {columns.map((c, ci) => {
                  const v     = row[c.key] ?? "—";
                  const isPos = ci > 0 && v.startsWith("+");
                  const isNeg = ci > 0 && v.startsWith("-");
                  return (
                    <td
                      key={c.key}
                      style={{ padding:"9px 14px", fontSize:"12px", whiteSpace:"nowrap" }}
                    >
                      <span style={{
                        fontWeight: ci === 0 ? 600 : isPos || isNeg ? 700 : 400,
                        color:      ci === 0
                          ? "#0f172a"
                          : isPos ? "#16a34a"
                          : isNeg ? "#dc2626"
                          : "#334155",
                      }}>
                        {v}
                      </span>
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

// ── Extra Fields Panel ─────────────────────────────────
function ExtraFields({ data }: { data: JsonData }) {
  const fields = Object.entries(data).filter(([k, v]) => !shouldSkip(k, v));
  if (!fields.length) return null;
  return (
    <div style={{
      background:   "#fff",
      border:       "1px solid #e2e8f0",
      borderRadius: "10px",
      overflow:     "hidden",
    }}>
      <div style={{
        padding:       "8px 14px",
        background:    "#f8fafc",
        borderBottom:  "1px solid #e2e8f0",
        fontSize:      "10px",
        fontWeight:    700,
        color:         "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        Entity Details
      </div>
      <div style={{
        padding:             "10px 14px",
        display:             "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap:                 "6px",
      }}>
        {fields.map(([k, v]) => (
          <div
            key={k}
            style={{
              padding:      "6px 10px",
              background:   "#f8fafc",
              borderRadius: "6px",
              border:       "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontSize:"10px", color:"#94a3b8", fontWeight:500, marginBottom:"2px" }}>
              {fmtKey(k)}
            </div>
            <div style={{ fontSize:"12px", color:"#0f172a", fontWeight:600 }}>
              {String(v ?? "—")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────
function EditModal({
  entityId,
  data,
  onSave,
  onClose,
}: {
  entityId: string;
  data:     JsonData;
  onSave:   (d: JsonData) => void;
  onClose:  () => void;
}) {
  const [edited, setEdited] = React.useState<JsonData>({ ...data });
  const [saving, setSaving] = React.useState(false);
  const [tab,    setTab]    = React.useState<"overview"|"details"|"dropdown"|"table">("overview");

  const inp: React.CSSProperties = {
    fontSize:     "12px",
    padding:      "5px 8px",
    border:       "1px solid #e2e8f0",
    borderRadius: "5px",
    outline:      "none",
    background:   "#f8fafc",
    color:        "#0f172a",
    width:        "100%",
    fontFamily:   "inherit",
  };

  const btn = (bg: string, color: string): React.CSSProperties => ({
    padding:      "5px 12px",
    borderRadius: "6px",
    border:       "none",
    fontSize:     "11px",
    fontWeight:   700,
    cursor:       "pointer",
    background:   bg,
    color,
  });

  const tb = (t: typeof tab): React.CSSProperties => ({
    padding:      "6px 14px",
    fontSize:     "11px",
    fontWeight:   700,
    cursor:       "pointer",
    border:       "none",
    background:   "transparent",
    borderBottom: tab === t ? "2px solid #0ea5e9" : "2px solid transparent",
    color:        tab === t ? "#0284c7" : "#94a3b8",
    letterSpacing:"0.04em",
  });

  let ov:  OvLine[]  | undefined;
  let tbl: Table     | undefined;
  let dd:  Dropdown  | undefined;

  Object.values(edited).forEach((val) => {
    if      (!ov  && isOverview(val))  ov  = val as OvLine[];
    else if (!tbl && isTable(val))     tbl = val as Table;
    else if (!dd  && isDropdown(val))  dd  = val as Dropdown;
  });

  const ovKey  = Object.keys(edited).find((k) => isOverview(edited[k]));
  const tblKey = Object.keys(edited).find((k) => isTable(edited[k]));
  const ddKey  = Object.keys(edited).find((k) => isDropdown(edited[k]));

  const primitiveFields = Object.entries(edited).filter(
    ([k, v]) => !shouldSkip(k, v) && typeof v !== "object"
  );

  const setOv = (i: number, field: keyof OvLine, v: string) => {
    if (!ovKey || !ov) return;
    const next = ov.map((l, idx) => idx === i ? { ...l, [field]: v } : l);
    setEdited((p) => ({ ...p, [ovKey]: next }));
  };
  const addOv = () => {
    if (!ovKey || !ov) return;
    setEdited((p) => ({ ...p, [ovKey]: [...ov!, { label:"New Field", value:"—", type:"warn" as const }] }));
  };
  const delOv = (i: number) => {
    if (!ovKey || !ov) return;
    setEdited((p) => ({ ...p, [ovKey]: ov!.filter((_, idx) => idx !== i) }));
  };

  const setCell = (ri: number, key: string, v: string) => {
    if (!tblKey || !tbl) return;
    const rows = tbl.rows.map((r, idx) => idx === ri ? { ...r, [key]: v } : r);
    setEdited((p) => ({ ...p, [tblKey]: { columns: tbl!.columns, rows } }));
  };
  const setColLabel = (ci: number, v: string) => {
    if (!tblKey || !tbl) return;
    const columns = tbl.columns.map((c, idx) => idx === ci ? { ...c, label: v } : c);
    setEdited((p) => ({ ...p, [tblKey]: { columns, rows: tbl!.rows } }));
  };
  const addRow = () => {
    if (!tblKey || !tbl) return;
    const empty: Row = {};
    tbl.columns.forEach((c) => { empty[c.key] = ""; });
    setEdited((p) => ({ ...p, [tblKey]: { columns: tbl!.columns, rows: [...tbl!.rows, empty] } }));
  };
  const delRow = (i: number) => {
    if (!tblKey || !tbl) return;
    setEdited((p) => ({ ...p, [tblKey]: { columns: tbl!.columns, rows: tbl!.rows.filter((_, idx) => idx !== i) } }));
  };

  const setDDOpt = (i: number, v: string) => {
    if (!ddKey || !dd) return;
    const options = dd.options.map((o, idx) => idx === i ? v : o);
    setEdited((p) => ({ ...p, [ddKey]: { ...dd!, options } }));
  };
  const addDDOpt = () => {
    if (!ddKey || !dd) return;
    setEdited((p) => ({ ...p, [ddKey]: { ...dd!, options: [...dd!.options, "New Option"] } }));
  };
  const delDDOpt = (i: number) => {
    if (!ddKey || !dd) return;
    setEdited((p) => ({ ...p, [ddKey]: { ...dd!, options: dd!.options.filter((_, idx) => idx !== i) } }));
  };

  const setField = (k: string, v: string) => setEdited((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/datastore", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ entityId, data: edited }),
      });
      onSave(edited);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(15,23,42,0.55)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:"16px",
      }}
    >
      <div style={{
        background:"#fff", borderRadius:"14px",
        width:"100%", maxWidth:"800px", maxHeight:"90vh",
        display:"flex", flexDirection:"column",
        boxShadow:"0 32px 80px rgba(0,0,0,0.28)", border:"1px solid #e2e8f0",
      }}>

        <div style={{
          padding:"14px 20px",
          background:"linear-gradient(135deg,#1e3a5f,#1e40af)",
          borderRadius:"14px 14px 0 0",
          display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0,
        }}>
          <div style={{ fontSize:"13px", fontWeight:700, color:"#fff" }}>✏ Edit — {entityId}</div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"6px", color:"#fff", width:"28px", height:"28px", cursor:"pointer", fontSize:"14px" }}>✕</button>
        </div>

        <div style={{ borderBottom:"1px solid #e2e8f0", display:"flex", padding:"0 16px", flexShrink:0 }}>
          {ov                          && <button style={tb("overview")}  onClick={() => setTab("overview")}>OVERVIEW</button>}
          {primitiveFields.length > 0   && <button style={tb("details")}  onClick={() => setTab("details")}>DETAILS</button>}
          {dd                          && <button style={tb("dropdown")}  onClick={() => setTab("dropdown")}>DROPDOWN</button>}
          {tbl                         && <button style={tb("table")}     onClick={() => setTab("table")}>TABLE</button>}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:"8px" }}>

          {tab === "overview" && ov && (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Overview Lines ({ov.length})</span>
                <button style={btn("#e0f2fe","#0284c7")} onClick={addOv}>+ Add Line</button>
              </div>
              {ov.map((l, i) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 110px 30px", gap:"8px", alignItems:"center", padding:"8px 10px", background:"#f8fafc", borderRadius:"8px", border:"1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontSize:"9px", color:"#94a3b8", marginBottom:"2px" }}>LABEL</div>
                    <input style={inp} value={l.label} onChange={(e) => setOv(i,"label",e.target.value)} />
                  </div>
                  <div>
                    <div style={{ fontSize:"9px", color:"#94a3b8", marginBottom:"2px" }}>VALUE</div>
                    <input style={inp} value={l.value} onChange={(e) => setOv(i,"value",e.target.value)} />
                  </div>
                  <div>
                    <div style={{ fontSize:"9px", color:"#94a3b8", marginBottom:"2px" }}>COLOR</div>
                    <select style={inp} value={l.type} onChange={(e) => setOv(i,"type",e.target.value as OvLine["type"])}>
                      <option value="good">🟢 Good</option>
                      <option value="warn">🟡 Warn</option>
                      <option value="bad">🔴 Bad</option>
                    </select>
                  </div>
                  <button onClick={() => delOv(i)} style={{ ...btn("#fef2f2","#dc2626"), padding:"5px 7px", marginTop:"12px" }}>✕</button>
                </div>
              ))}
            </>
          )}

          {tab === "details" && (
            <>
              <span style={{ fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Primitive Fields ({primitiveFields.length})</span>
              {primitiveFields.map(([k, v]) => (
                <div key={k} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", padding:"8px 10px", background:"#f8fafc", borderRadius:"8px", border:"1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontSize:"9px", color:"#94a3b8", marginBottom:"2px" }}>FIELD</div>
                    <div style={{ fontSize:"12px", fontWeight:600, color:"#334155" }}>{fmtKey(k)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:"9px", color:"#94a3b8", marginBottom:"2px" }}>VALUE</div>
                    <input style={inp} value={String(v ?? "")} onChange={(e) => setField(k, e.target.value)} />
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "dropdown" && dd && (
            <>
              <span style={{ fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Dropdown: {dd.label}</span>
              {dd.options.map((opt, i) => (
                <div key={i} style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                  <input style={inp} value={opt} onChange={(e) => setDDOpt(i, e.target.value)} />
                  <button onClick={() => delDDOpt(i)} style={{ ...btn("#fef2f2","#dc2626"), whiteSpace:"nowrap" }}>✕</button>
                </div>
              ))}
              <button style={{ ...btn("#e0f2fe","#0284c7"), alignSelf:"flex-start", marginTop:"4px" }} onClick={addDDOpt}>+ Add Option</button>
            </>
          )}

          {tab === "table" && tbl && (() => {
            const t = tbl;
            return (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>{t.rows.length} rows · {t.columns.length} cols</span>
                  <button style={btn("#e0f2fe","#0284c7")} onClick={addRow}>+ Add Row</button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ borderCollapse:"collapse", fontSize:"12px", width:"100%" }}>
                    <thead>
                      <tr style={{ background:"#f1f5f9" }}>
                        {t.columns.map((c, ci) => (
                          <th key={c.key} style={{ padding:"6px 8px", borderBottom:"2px solid #e2e8f0", whiteSpace:"nowrap" }}>
                            <input style={{ ...inp, fontWeight:700, minWidth:"90px" }} value={c.label} onChange={(e) => setColLabel(ci, e.target.value)} />
                          </th>
                        ))}
                        <th style={{ padding:"6px", borderBottom:"2px solid #e2e8f0" }} />
                      </tr>
                    </thead>
                    <tbody>
                      {t.rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#fafafa" }}>
                          {t.columns.map((c) => (
                            <td key={c.key} style={{ padding:"4px 6px" }}>
                              <input style={{ ...inp, minWidth:"80px" }} value={row[c.key] ?? ""} onChange={(e) => setCell(ri, c.key, e.target.value)} />
                            </td>
                          ))}
                          <td style={{ padding:"4px 6px" }}>
                            <button onClick={() => delRow(ri)} style={{ ...btn("#fef2f2","#dc2626"), padding:"4px 7px" }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}

        </div>

        <div style={{ padding:"12px 20px", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"flex-end", gap:"10px", flexShrink:0 }}>
          <button onClick={onClose} style={btn("#f1f5f9","#475569")}>Cancel</button>
          <button onClick={save} disabled={saving} style={btn(saving?"#e2e8f0":"linear-gradient(135deg,#0f172a,#1e293b)", saving?"#94a3b8":"#fff")}>
            {saving ? "Saving..." : "✓ Save to Store"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function Home() {
  const [entityId, setEntityId] = React.useState("");
  const [loading,  setLoading]  = React.useState(false);
  const [data,     setData]     = React.useState<JsonData | null>(null);
  const [error,    setError]    = React.useState("");
  const [selected, setSelected] = React.useState("");
  const [showEdit, setShowEdit] = React.useState(false);

  // Stores original unfiltered data so filtering never loses rows
  const originalData = React.useRef<JsonData | null>(null);

  // ── Filter table from original JSON ──
  // No API call — filters rows already in the JSON
  // Auto-detects which field to filter on by scanning row values
  const filterTable = (filterValue: string) => {
    if (!originalData.current) return;

    const orig   = originalData.current;
    const tblKey = Object.keys(orig).find((k) => isTable(orig[k]));
    const ddVal  = Object.values(orig).find((v) => isDropdown(v)) as Dropdown | undefined;

    if (!tblKey) return;

    const allRows = (orig[tblKey] as Table).rows;
    const columns = (orig[tblKey] as Table).columns;

    if (!filterValue) {
      // No filter selected — show all rows
      setData((prev) =>
        prev ? { ...prev, [tblKey]: { columns, rows: allRows } } : prev
      );
      return;
    }

    // Auto-detect which field to filter on
    // Find the row key whose value matches one of the dropdown options
    const options       = ddVal?.options ?? [];
    const firstRow      = allRows[0] ?? {};
    const detectedField = Object.keys(firstRow).find((key) =>
      options.includes(firstRow[key])
    );

    if (!detectedField) return;

    const filtered = allRows.filter((row) => row[detectedField] === filterValue);

    setData((prev) =>
      prev
        ? { ...prev, [tblKey]: { columns, rows: filtered } }
        : prev
    );
  };

  // ── Detect shapes from JSON ──
  let overview: OvLine[]  | undefined;
  let table:    Table     | undefined;
  let dropdown: Dropdown  | undefined;

  if (data) {
    Object.values(data).forEach((val) => {
      if      (!overview  && isOverview(val))  overview  = val as OvLine[];
      else if (!table     && isTable(val))     table     = val as Table;
      else if (!dropdown  && isDropdown(val))  dropdown  = val as Dropdown;
    });
  }

  // ── Entity display name ──
  const entityName = data
    ? String(
        data.entityName    ??
        data.fundName      ??
        data.sovereignName ??
        data.projectName   ??
        data.startupName   ??
        data.hospitalName  ??
        data.companyName   ??
        entityId
      )
    : entityId;

  const currentId = String(data?.entityId ?? entityId).toUpperCase();

  // ── Reset ──
  const reset = () => {
    setEntityId("");
    setData(null);
    setError("");
    setSelected("");
    setShowEdit(false);
    setLoading(false);
    originalData.current = null;
  };

  // ── Search ──
  const search = async (id?: string) => {
  const eid = (id ?? entityId).trim();
  if (!eid) return;
  setLoading(true);
  setError("");
  setData(null);
  setSelected("");
  setShowEdit(false);
  originalData.current = null;
  try {
    const res  = await fetch(`/api/search?entityId=${encodeURIComponent(eid)}`);
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Not found"); return; }

    // Always use fresh data from API
    // Deep clone to prevent shared reference mutations
    const resolved = JSON.parse(JSON.stringify(json));
    originalData.current = JSON.parse(JSON.stringify(resolved));
    setData(resolved);
  } catch {
    setError("Failed to connect to API");
  } finally {
    setLoading(false);
  }
};

  // ── Save edits ──
  const handleSave = (saved: JsonData) => {
    originalData.current = JSON.parse(JSON.stringify(saved));
    setData(saved);
    setShowEdit(false);
  };

  return (
    <div style={{
      display:    "flex",
      height:     "100vh",
      overflow:   "hidden",
      background: "#f1f5f9",
      fontFamily: "Inter,system-ui,sans-serif",
    }}>

      {/* Sidebar */}
      <div style={{
        width:"52px", background:"linear-gradient(180deg,#0f172a,#1e293b)",
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"14px 0", gap:"16px", flexShrink:0,
      }}>
        <div style={{
          width:"28px", height:"28px",
          background:"linear-gradient(135deg,#0ea5e9,#6366f1)",
          borderRadius:"8px", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:"13px", fontWeight:700, color:"#fff",
        }}>C</div>
        <button
          onClick={reset}
          title="Entity Search"
          style={{
            width:"32px", height:"32px",
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:"8px", color:"#94a3b8", cursor:"pointer", fontSize:"14px",
          }}
        >⌕</button>
      </div>

      {/* Main */}
      <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{
          padding:"10px 20px", background:"#fff",
          borderBottom:"1px solid #e2e8f0",
          display:"flex", alignItems:"center", gap:"10px",
        }}>
          <input
            value={entityId}
            onChange={(e) => setEntityId(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
            placeholder="Search entity ID  e.g. ENT-001"
            style={{
              flex:1, maxWidth:"320px", padding:"7px 12px",
              border:"1px solid #e2e8f0", borderRadius:"8px",
              fontSize:"12px", outline:"none", fontFamily:"inherit", color:"#0f172a",
            }}
          />
          <button
            onClick={() => search()}
            disabled={loading}
            style={{
              padding:"7px 18px",
              background: loading ? "#e2e8f0" : "#0f172a",
              color:      loading ? "#94a3b8" : "#fff",
              border:"none", borderRadius:"8px",
              fontSize:"12px", fontWeight:700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        {/* Content */}
        <main style={{ flex:1, overflowY:"auto", padding:"20px" }}>

          {/* Empty state */}
          {!data && !error && !loading && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"11px", fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                  Search an Entity
                </div>
                <div style={{ fontSize:"11px", color:"#94a3b8", marginBottom:"16px" }}>
                  
                </div>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center" }}>
                  {[].map((id) => (
                    <button
                      key={id}
                      onClick={() => { setEntityId(id); search(id); }}
                      style={{
                        background:"#fff", border:"1px solid #e2e8f0",
                        borderRadius:"8px", padding:"7px 14px",
                        cursor:"pointer", fontSize:"12px", fontWeight:700, color:"#0f172a",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>
              <div style={{ width:"24px", height:"24px", borderRadius:"50%", border:"2.5px solid #e2e8f0", borderTopColor:"#0ea5e9", animation:"spin 0.7s linear infinite" }} />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding:"12px 16px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"8px", color:"#dc2626", fontSize:"13px" }}>
              ⚠ {error}
            </div>
          )}

          {/* Dashboard */}
          {data && !loading && (
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {/* Header */}
              <div style={{
                padding:"12px 18px", background:"#fff", borderRadius:"10px",
                border:"1px solid #e2e8f0", display:"flex",
                justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:"8px",
              }}>
                <div>
                  <div style={{ fontSize:"15px", fontWeight:700, color:"#0f172a" }}>{entityName}</div>
                  <div style={{ fontSize:"11px", color:"#94a3b8", marginTop:"2px" }}>
                    {currentId}
                    {data.entityType ? ` · ${String(data.entityType)}` : ""}
                    {data.industry   ? ` · ${String(data.industry)}`   : ""}
                    {data.country    ? ` · ${String(data.country)}`    : ""}
                  </div>
                </div>
                <button
                  onClick={() => setShowEdit(true)}
                  style={{
                    padding:"7px 14px", background:"#f1f5f9",
                    border:"1px solid #e2e8f0", borderRadius:"8px",
                    fontSize:"12px", fontWeight:700, color:"#475569", cursor:"pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                >✏ Edit</button>
              </div>

              {/* Overview — detected by shape */}
              {overview && <OverviewPanel lines={overview} />}

              {/* Extra fields — all remaining primitive values */}
              <ExtraFields data={data} />

              {/* Dropdown — detected by shape */}
              {dropdown && (
                <div style={{
                  padding:"10px 14px", background:"#fff",
                  border:"1px solid #e2e8f0", borderRadius:"10px",
                  display:"flex", alignItems:"center", gap:"10px",
                }}>
                  <span style={{ fontSize:"11px", fontWeight:600, color:"#64748b", whiteSpace:"nowrap" }}>
                    {dropdown.label}:
                  </span>
                  <select
                    value={selected}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelected(val);
                      filterTable(val);
                    }}
                    style={{
                      fontSize:"12px", padding:"5px 10px",
                      border:"1px solid #e2e8f0", borderRadius:"6px",
                      background:"#f8fafc", color:"#0f172a",
                      outline:"none", cursor:"pointer",
                    }}
                  >
                    <option value="">— All —</option>
                    {dropdown.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Table — detected by shape */}
              {table && (
                <FinancialTable
                  columns={table.columns}
                  rows={table.rows}
                />
              )}

            </div>
          )}

        </main>
      </div>

      {/* Edit Modal */}
      {showEdit && data && (
        <EditModal
          entityId={currentId}
          data={data}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}