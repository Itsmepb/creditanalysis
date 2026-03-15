"use client";

import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import OverviewPanel from "../components/OverviewPanel";
import Filters from "../components/Filters";
import FinancialTable from "../components/FinancialTable";
import CreditInsight from "../components/CreditInsight";

type Column = { key: string; label: string };
type Row    = Record<string, string>;
type Line   = { label: string; value: string; type: "good" | "warn" | "bad" };
type Filter = { key: string; label: string; options: string[] };

type EntityData = {
  entityId:   string;
  entityName: string;
  entityType: string;
  industry:   string;
  country:    string;
  overview:   Line[];
  filters:    Filter[];
};

type Statement = { columns: Column[]; rows: Row[] };

export default function Home() {
  const [entityId,    setEntityId]    = React.useState<string>("");
  const [loading,     setLoading]     = React.useState<boolean>(false);
  const [data,        setData]        = React.useState<EntityData | null>(null);
  const [error,       setError]       = React.useState<string>("");
  const [selected,    setSelected]    = React.useState<Record<string, string>>({});
  const [statement,   setStatement]   = React.useState<Statement | null>(null);
  const [stmtLoading, setStmtLoading] = React.useState<boolean>(false);
  const [stmtError,   setStmtError]   = React.useState<string>("");
  const [stmtFetched, setStmtFetched] = React.useState<boolean>(false);

  // ── Reset everything back to empty state ──
  const handleReset = () => {
    setEntityId("");
    setData(null);
    setError("");
    setSelected({});
    setStatement(null);
    setStmtFetched(false);
    setStmtError("");
    setLoading(false);
    setStmtLoading(false);
  };

  // ── Search entity via GET ──
  const handleSearch = async () => {
    if (!entityId.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    setSelected({});
    setStatement(null);
    setStmtFetched(false);
    setStmtError("");
    try {
      const res = await fetch(
        `/api/search?entityId=${encodeURIComponent(entityId.trim())}`,
        { method: "GET" }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong");
      } else {
        setData(json as EntityData);
        const defs: Record<string, string> = {};
        (json.filters as Filter[]).forEach((f: Filter) => {
          defs[f.key] = f.options[0];
        });
        setSelected(defs);
      }
    } catch {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch financial statement via POST ──
  const fetchStatement = async (filters: Record<string, string>) => {
    if (!data) return;
    setStmtLoading(true);
    setStmtError("");
    setStatement(null);
    try {
      const res = await fetch("/api/statement", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ entityId: data.entityId, filters }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStmtError(json.error || "Failed to load statement");
      } else {
        setStatement(json as Statement);
        setStmtFetched(true);
      }
    } catch {
      setStmtError("Failed to connect to API");
    } finally {
      setStmtLoading(false);
    }
  };

  // ── Button click ──
  const handleFetchStatement = () => fetchStatement(selected);

  // ── Dropdown change → auto re-fetch if statement already loaded ──
  const handleFilterChange = (key: string, val: string) => {
    const updated = { ...selected, [key]: val };
    setSelected(updated);
    if (stmtFetched) fetchStatement(updated);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f1f5f9" }}>

      {/* Sidebar — passes reset callback */}
      <Sidebar onEntitySearch={handleReset} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <TopBar
          entityId={entityId}
          setEntityId={setEntityId}
          onSearch={handleSearch}
          loading={loading}
        />

        <main style={{ flex: 1, overflowY: "auto" }}>

          {/* ── Empty State ── */}
          {!data && !error && !loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px", color: "#cbd5e1" }}>◎</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  No Entity Selected
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Search an Entity ID in the bar above to begin
                </div>
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "2.5px solid #e2e8f0", borderTopColor: "#0ea5e9",
                  animation: "spin 0.7s linear infinite", margin: "0 auto 10px",
                }} />
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>Loading entity...</div>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div style={{
              margin: "20px", padding: "12px 16px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "8px", color: "#dc2626", fontSize: "13px",
            }}>
              ⚠ {error}
            </div>
          )}

          {/* ── Dashboard ── */}
          {data && !loading && (
            <div>

              {/* Entity header */}
              <div style={{
                padding: "14px 24px",
                background: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    {data.entityName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    {data.entityId} · {data.entityType} · {data.industry} · {data.country}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </div>
                  {/* Credit Insight — only shown after statement is loaded */}
                  {stmtFetched && statement && (
                    <CreditInsight
                      entityId={data.entityId}
                      entityName={data.entityName}
                      entityType={data.entityType}
                      industry={data.industry}
                      country={data.country}
                      overview={data.overview}
                      rows={statement.rows}
                      columns={statement.columns}
                    />
                  )}
                </div>
              </div>

              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* 1. Overview panel */}
                <OverviewPanel lines={data.overview} />

                {/* 2. Filter bar + Fetch button */}
                <div style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}>
                  {/* Dropdowns — only if entity has filters */}
                  {data.filters.length > 0 && (
                    <>
                      <Filters
                        filters={data.filters}
                        selected={selected}
                        onChange={handleFilterChange}
                      />
                      <div style={{
                        width: "1px", height: "24px",
                        background: "#e2e8f0", flexShrink: 0,
                      }} />
                    </>
                  )}

                  {/* Fetch Financial Statement button */}
                  <button
                    onClick={handleFetchStatement}
                    disabled={stmtLoading}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      padding: "8px 18px",
                      background: stmtLoading
                        ? "#e2e8f0"
                        : "linear-gradient(135deg,#0f172a,#1e293b)",
                      color: stmtLoading ? "#94a3b8" : "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: stmtLoading ? "not-allowed" : "pointer",
                      letterSpacing: "0.03em",
                      whiteSpace: "nowrap",
                      boxShadow: stmtLoading ? "none" : "0 2px 8px rgba(15,23,42,0.25)",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!stmtLoading) e.currentTarget.style.opacity = "0.85";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {stmtLoading ? (
                      <>
                        <div style={{
                          width: "12px", height: "12px",
                          borderRadius: "50%",
                          border: "2px solid #cbd5e1",
                          borderTopColor: "#64748b",
                          animation: "spin 0.7s linear infinite",
                          flexShrink: 0,
                        }} />
                        Fetching...
                      </>
                    ) : (
                      <>≋ {stmtFetched ? "Refresh Statement" : "Fetch Financial Statement"}</>
                    )}
                  </button>
                </div>

                {/* 3. Statement error */}
                {stmtError && (
                  <div style={{
                    padding: "10px 14px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "12px",
                  }}>
                    ⚠ {stmtError}
                  </div>
                )}

                {/* 4. Financial table — only shown after fetch */}
                {statement && !stmtLoading && (
                  <FinancialTable
                    columns={statement.columns}
                    rows={statement.rows}
                  />
                )}

              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}