"use client";

type Filter = { key: string; label: string; options: string[] };

type Props = {
  filters:  Filter[];
  selected: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export default function Filters({ filters, selected, onChange }: Props) {
  if (!filters?.length) return null;
  return (
    <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"16px" }}>
      <span style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>
        Filter
      </span>
      {filters.map((f) => (
        <div key={f.key} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <label style={{ fontSize:"11px", fontWeight:600, color:"#475569" }}>{f.label}</label>
          <select
            value={selected[f.key] || f.options[0]}
            onChange={(e) => onChange(f.key, e.target.value)}
            style={{ fontSize:"11px", fontWeight:600, color:"#0f172a", background:"#f8fafc", border:"1px solid #cbd5e1", borderRadius:"6px", padding:"5px 10px", cursor:"pointer", outline:"none" }}
          >
            {f.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}