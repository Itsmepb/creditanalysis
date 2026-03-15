"use client";

import React from "react";

type SidebarProps = {
  onEntitySearch?: () => void;
};

const navGroups = [
  {
    group: "MAIN",
    items: [
      { label: "Dashboard",     icon: "⬡", desc: "Overview"          },
      { label: "Entity Search", icon: "⊹", desc: "Find entities"     },
    ],
  },
  {
    group: "ANALYSIS",
    items: [
      { label: "Financial Statements", icon: "≋", desc: "P&L, Balance Sheet"  },
      { label: "Credit Analysis",      icon: "◈", desc: "Risk & ratings"      },
      { label: "Loan Spreads",         icon: "⟡", desc: "Spread analysis"     },
      { label: "Reports",              icon: "⊟", desc: "Export & share"      },
    ],
  },
  {
    group: "TOOLS",
    items: [
      { label: "Benchmarking", icon: "⊘", desc: "Peer comparison" },
      { label: "Settings",     icon: "⊛", desc: "Preferences"     },
    ],
  },
];

export default function Sidebar({ onEntitySearch }: SidebarProps) {
  const [active,  setActive]  = React.useState("Entity Search");
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <>
      <style>{`
        .sb { width:220px;min-height:100vh;display:flex;flex-direction:column;flex-shrink:0;position:relative;background:linear-gradient(180deg,#0f172a 0%,#1e293b 60%,#0f172a 100%);border-right:1px solid rgba(255,255,255,0.06);overflow:hidden; }
        .sb::before { content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 100%);pointer-events:none;z-index:0; }
        .sb::after  { content:'';position:absolute;top:80px;left:-60px;width:200px;height:200px;background:radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%);pointer-events:none;z-index:0; }
        .sb-inner { position:relative;z-index:1;display:flex;flex-direction:column;height:100%; }
        .sb-logo  { padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,0.06); }
        .sb-badge { width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#0284c7);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 0 0 1px rgba(56,189,248,0.3),0 4px 16px rgba(14,165,233,0.4),inset 0 1px 0 rgba(255,255,255,0.25);letter-spacing:0.02em; }
        .sb-nav   { flex:1;padding:12px 8px;overflow-y:auto; }
        .sb-nav::-webkit-scrollbar { width:0; }
        .sb-grp   { padding:8px 10px 4px;font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(100,116,139,0.8); }
        .sb-div   { height:1px;background:rgba(255,255,255,0.05);margin:4px 10px; }
        .sb-item  { display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;margin-bottom:1px;border:1px solid transparent;transition:all 0.18s ease;position:relative;overflow:hidden;background:transparent;width:100%;text-align:left; }
        .sb-item.on  { background:rgba(14,165,233,0.1);border-color:rgba(14,165,233,0.2);box-shadow:0 1px 8px rgba(14,165,233,0.15),inset 0 1px 0 rgba(255,255,255,0.05); }
        .sb-item.hov { background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.06); }
        .sb-icon  { width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;transition:all 0.18s ease; }
        .sb-icon.on  { background:linear-gradient(135deg,rgba(56,189,248,0.25),rgba(14,165,233,0.15));box-shadow:0 2px 8px rgba(14,165,233,0.2),inset 0 1px 0 rgba(255,255,255,0.1);color:#38bdf8; }
        .sb-icon.off { background:rgba(255,255,255,0.04);color:rgba(148,163,184,0.6); }
        .sb-bar  { position:absolute;right:0;top:50%;transform:translateY(-50%);width:2.5px;height:60%;border-radius:999px;background:linear-gradient(180deg,#38bdf8,#0ea5e9);box-shadow:0 0 8px rgba(14,165,233,0.6); }
        .sb-foot { padding:12px 14px;border-top:1px solid rgba(255,255,255,0.05);background:rgba(0,0,0,0.2); }
        .sb-avatar { width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#1e40af,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;box-shadow:0 0 0 2px rgba(59,130,246,0.3); }
        .sb-dot  { width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 6px rgba(16,185,129,0.7);margin-left:auto;flex-shrink:0; }
        .sb-ver  { padding:6px 14px;font-size:9px;color:rgba(71,85,105,0.7);letter-spacing:0.04em;text-align:center; }
      `}</style>

      <div className="sb">
        <div className="sb-inner">

          {/* Logo */}
          <div className="sb-logo">
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div className="sb-badge">CA</div>
              <div>
                <div style={{ fontSize:"12px", fontWeight:700, color:"#f1f5f9", letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1.2 }}>
                  Credit Analysis
                </div>
                <div style={{ fontSize:"9px", color:"rgba(148,163,184,0.7)", marginTop:"2px" }}>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="sb-nav">
            {navGroups.map((group, gi) => (
              <div key={group.group}>
                {gi > 0 && <div className="sb-div" />}
                <div className="sb-grp">{group.group}</div>
                {group.items.map((item) => {
                  const on  = active  === item.label;
                  const hov = hovered === item.label;
                  return (
                    <button
                      key={item.label}
                      className={`sb-item ${on ? "on" : hov ? "hov" : ""}`}
                      onClick={() => {
                        setActive(item.label);
                        if (item.label === "Entity Search" && onEntitySearch) {
                          onEntitySearch();
                        }
                      }}
                      onMouseEnter={() => setHovered(item.label)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className={`sb-icon ${on ? "on" : "off"}`}>{item.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"11px", fontWeight:600, color: on ? "#e0f2fe" : "rgba(148,163,184,0.75)", lineHeight:1.2 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize:"9px", marginTop:"1px", color: on ? "rgba(56,189,248,0.7)" : "rgba(100,116,139,0.6)" }}>
                          {item.desc}
                        </div>
                      </div>
                      {on && <div className="sb-bar" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="sb-foot">
            <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
              <div className="sb-avatar">AU</div>
              <div>
                <div style={{ fontSize:"11px", fontWeight:600, color:"#cbd5e1" }}>Analyst User</div>
                <div style={{ fontSize:"9px", color:"rgba(100,116,139,0.8)", marginTop:"1px" }}>Senior Analyst</div>
              </div>
              <div className="sb-dot" />
            </div>
          </div>

          <div className="sb-ver">v2.4.1 · Credit Analysis Platform</div>
        </div>
      </div>
    </>
  );
}