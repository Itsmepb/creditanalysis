"use client";

import React from "react";

type TopBarProps = {
  entityId:    string;
  setEntityId: (val: string) => void;
  onSearch:    () => void;
  loading:     boolean;
};

const SAMPLES = ["ENT-001", "ENT-002", "ENT-003", "ENT-004", "ENT-005"];

export default function TopBar({ entityId, setEntityId, onSearch, loading }: TopBarProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <>
      <style>{`
        .tb-root {
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
          flex-shrink: 0;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 8px rgba(0,0,0,0.05);
          position: relative;
          z-index: 10;
        }

        /* Breadcrumb */
        .tb-bread {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }
        .tb-bread-base {
          font-size: 11px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }
        .tb-bread-sep {
          font-size: 10px;
          color: #cbd5e1;
        }
        .tb-bread-id {
          font-size: 11px;
          font-weight: 700;
          color: #0284c7;
          background: rgba(14,165,233,0.08);
          padding: 2px 8px;
          border-radius: 5px;
          letter-spacing: 0.04em;
          transition: all 0.2s ease;
        }

        /* Live badge */
        .tb-live {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          background: rgba(16,185,129,0.07);
          border: 1px solid rgba(16,185,129,0.18);
          color: #059669;
          flex-shrink: 0;
          letter-spacing: 0.06em;
        }
        .tb-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: tb-pulse 2s ease-in-out infinite;
        }
        @keyframes tb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }

        /* Search wrapper */
        .tb-search-wrap {
          position: relative;
          flex-shrink: 0;
        }

        /* Input shell */
        .tb-shell {
          display: flex;
          align-items: center;
          border-radius: 10px;
          overflow: visible;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          transition: all 0.2s ease;
          position: relative;
        }
        .tb-shell.focused {
          border-color: #0ea5e9;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.1), 0 2px 12px rgba(14,165,233,0.08);
        }

        /* Icon */
        .tb-icon {
          padding: 0 10px 0 14px;
          font-size: 13px;
          color: #94a3b8;
          flex-shrink: 0;
          transition: color 0.2s ease;
          pointer-events: none;
        }
        .tb-shell.focused .tb-icon { color: #0ea5e9; }

        /* Input */
        .tb-input {
          font-size: 12px;
          padding: 9px 4px 9px 0;
          width: 220px;
          background: transparent;
          color: #0f172a;
          border: none;
          outline: none;
          font-weight: 500;
          letter-spacing: 0.01em;
        }
        .tb-input::placeholder { color: #94a3b8; font-weight: 400; }

        /* Kbd hint */
        .tb-kbd {
          margin: 0 8px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 600;
          color: #94a3b8;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          transition: opacity 0.2s;
          letter-spacing: 0.03em;
        }
        .tb-shell.focused .tb-kbd { opacity: 0; }

        /* Search button */
        .tb-btn {
          height: 100%;
          padding: 0 16px;
          border: none;
          border-left: 1.5px solid #e2e8f0;
          border-radius: 0 8px 8px 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          min-width: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .tb-btn.idle {
          background: #0f172a;
          color: #ffffff;
        }
        .tb-btn.idle:hover {
          background: #1e293b;
        }
        .tb-btn.busy {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
        .tb-shell.focused .tb-btn.idle {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          border-left-color: #0ea5e9;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }

        /* Spinner */
        .tb-spinner {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: 2px solid rgba(148,163,184,0.3);
          border-top-color: #94a3b8;
          animation: tb-spin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes tb-spin { to { transform: rotate(360deg); } }

        /* Dropdown */
        .tb-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          z-index: 100;
          animation: tb-drop 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes tb-drop {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tb-drop-label {
          padding: 8px 12px 4px;
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .tb-drop-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          cursor: pointer;
          transition: background 0.1s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .tb-drop-item:hover { background: #f0f9ff; }
        .tb-drop-item:last-child { border-radius: 0 0 10px 10px; }
        .tb-drop-id {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }
        .tb-drop-sub {
          font-size: 10px;
          color: #94a3b8;
        }
        .tb-drop-arrow {
          font-size: 10px;
          color: #cbd5e1;
        }
      `}</style>

      <div className="tb-root">

        {/* Breadcrumb */}
        <div className="tb-bread">
          <span className="tb-bread-base">Entity Search</span>
          {entityId && (
            <>
              <span className="tb-bread-sep">›</span>
              <span className="tb-bread-id">{entityId.toUpperCase()}</span>
            </>
          )}
        </div>

        {/* Live badge */}
        <div className="tb-live">
          <span className="tb-live-dot" />
          LIVE
        </div>

        {/* Search */}
        <div className="tb-search-wrap">
          <div className={`tb-shell ${focused ? "focused" : ""}`}>

            {/* Search icon */}
            <span className="tb-icon">⊹</span>

            {/* Input */}
            <input
              className="tb-input"
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search entity ID..."
              autoComplete="off"
              spellCheck={false}
            />

            {/* Keyboard hint */}
            <span className="tb-kbd">↵ Enter</span>

            {/* Search button */}
            <button
              className={`tb-btn ${loading ? "busy" : "idle"}`}
              onClick={onSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="tb-spinner" />
                  <span>···</span>
                </>
              ) : (
                "SEARCH"
              )}
            </button>
          </div>

          {/* Sample ID dropdown — shown on focus */}
          {focused && !loading && (
            <div className="tb-dropdown">
              <div className="tb-drop-label">Sample Entities</div>
              {[
                { id: "ENT-001", sub: "Corporate · Technology"        },
                { id: "ENT-002", sub: "Bank · Date + Currency filters"},
                { id: "ENT-003", sub: "SME · High Risk"               },
                { id: "ENT-004", sub: "Sovereign · Government"        },
                { id: "ENT-005", sub: "Real Estate · Loan Spreads"    },
              ].map(({ id, sub }) => (
                <button
                  key={id}
                  className="tb-drop-item"
                  onMouseDown={() => {
                    setEntityId(id);
                    setFocused(false);
                  }}
                >
                  <div>
                    <div className="tb-drop-id">{id}</div>
                    <div className="tb-drop-sub">{sub}</div>
                  </div>
                  <span className="tb-drop-arrow">›</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}