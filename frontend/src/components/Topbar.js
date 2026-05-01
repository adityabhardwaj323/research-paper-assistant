// src/components/Topbar.js
import React from "react";

export default function Topbar({ activeView, setActiveView, selectedPaper, papersCount }) {

  // ✅ FIXED: Compare always visible
  const tabs = [
    { id: "chat",     icon: "💬", label: "Chat" },
    { id: "insights", icon: "🔬", label: "Insights" },
    { id: "compare",  icon: "⚖️", label: "Compare" }, // 🔥 FIX
  ];

  return (
    <header style={s.bar}>
      <div style={s.left}>
        <span style={s.brand}>PaperMind</span>
        <div style={s.divider} />

        <nav style={s.tabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              style={{
                ...s.tab,
                ...(activeView === t.id ? s.tabOn : {}),
              }}
              onClick={() => setActiveView(t.id)}
            >
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {selectedPaper && (
        <div style={s.paperChip}>
          <span style={s.chipDot} />
          <span style={s.chipName} title={selectedPaper.filename}>
            {selectedPaper.filename.length > 28
              ? selectedPaper.filename.slice(0, 25) + "…"
              : selectedPaper.filename}
          </span>
        </div>
      )}
    </header>
  );
}

const s = {
  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    padding: "0 20px",
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
    gap: 16,
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 0,
  },

  brand: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1rem",
    color: "var(--text-1)",
    letterSpacing: "-0.03em",
    marginRight: 16,
  },

  divider: {
    width: 1,
    height: 20,
    background: "var(--border)",
    marginRight: 12,
  },

  tabs: {
    display: "flex",
    gap: 2,
  },

  tab: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-3)",
    padding: "5px 12px",
    cursor: "pointer",
    fontSize: "0.84rem",
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    transition: "all 0.12s",
  },

  tabOn: {
    background: "var(--accent-dim)",
    border: "1px solid rgba(91,127,255,0.3)",
    color: "var(--accent)",
  },

  paperChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "4px 12px",
  },

  chipDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--success)",
    display: "inline-block",
    flexShrink: 0,
  },

  chipName: {
    fontSize: "0.78rem",
    color: "var(--text-2)",
    whiteSpace: "nowrap",
  },
};