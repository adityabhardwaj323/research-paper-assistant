// src/pages/InsightsPanel.js
import React from "react";
import Loader from "../components/Loader";

export default function InsightsPanel({ paper, analysis, onRefresh }) {
  if (!paper) return null;

  const isReady    = paper.status === "completed" || paper.status === "fallback";
  const isLoading  = paper.status === "processing" || paper.status === "pending";

  if (isLoading) {
    return (
      <div style={s.centered}>
        <Loader size={32} />
        <p style={s.info}>Analysing <strong>{paper.filename}</strong>…</p>
        <p style={s.sub}>This takes 10–30 seconds.</p>
      </div>
    );
  }

  if (paper.status === "failed") {
    return (
      <div style={s.centered}>
        <div style={s.errorIcon}>⚠️</div>
        <p style={s.info}>Analysis failed for this paper.</p>
        <button style={s.retryBtn} onClick={onRefresh}>Retry</button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={s.centered}>
        <Loader size={28} />
        <p style={s.info}>Loading analysis…</p>
      </div>
    );
  }

  return (
    <div style={s.root} className="fade-in">
      {/* Fallback banner */}
      {analysis.fallback && (
        <div style={s.fallbackBanner}>
          ⚠️ AI service was temporarily over quota — this is a partial analysis.
          <button style={s.retryInline} onClick={onRefresh}>Retry full analysis</button>
        </div>
      )}

      <div style={s.grid}>
        <Card label="Title"       content={analysis.title} span />
        {analysis.authors?.length > 0 && (
          <Card label="Authors"   content={analysis.authors.join(", ")} />
        )}
        {analysis.year && (
          <Card label="Year"      content={String(analysis.year)} />
        )}
        <Card label="Summary"     content={analysis.abstract_summary} span />
        <Card label="Methodology" content={analysis.methodology} />
        <Card label="Results"     content={analysis.results} />
        {analysis.key_contributions?.length > 0 && (
          <ListCard label="Key Contributions" items={analysis.key_contributions} span />
        )}
        {analysis.limitations?.length > 0 && (
          <ListCard label="Limitations" items={analysis.limitations} />
        )}
        {analysis.future_work?.length > 0 && (
          <ListCard label="Future Work" items={analysis.future_work} />
        )}
        {analysis.datasets?.length > 0 && (
          <ListCard label="Datasets" items={analysis.datasets} />
        )}
        {analysis.topics?.length > 0 && (
          <TagCard label="Topics" tags={analysis.topics} span />
        )}
      </div>
    </div>
  );
}

function Card({ label, content, span }) {
  if (!content) return null;
  return (
    <div style={{ ...s.card, gridColumn: span ? "1 / -1" : undefined }}>
      <div style={s.cardLabel}>{label}</div>
      <div style={s.cardBody}>{content}</div>
    </div>
  );
}

function ListCard({ label, items, span }) {
  if (!items?.length) return null;
  return (
    <div style={{ ...s.card, gridColumn: span ? "1 / -1" : undefined }}>
      <div style={s.cardLabel}>{label}</div>
      <ul style={s.ul}>
        {items.map((item, i) => (
          <li key={i} style={s.li}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TagCard({ label, tags, span }) {
  if (!tags?.length) return null;
  return (
    <div style={{ ...s.card, gridColumn: span ? "1 / -1" : undefined }}>
      <div style={s.cardLabel}>{label}</div>
      <div style={s.tags}>
        {tags.map((t, i) => (
          <span key={i} style={s.tag}>{t}</span>
        ))}
      </div>
    </div>
  );
}

const s = {
  root: {
    flex: 1, overflowY: "auto",
    padding: "24px 28px",
  },
  centered: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 12, padding: 40, textAlign: "center",
  },
  errorIcon: { fontSize: "2.5rem" },
  info: { color: "var(--text-secondary)", fontSize: "0.95rem" },
  sub:  { color: "var(--text-muted)", fontSize: "0.82rem" },
  fallbackBanner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 14, flexWrap: "wrap",
    background: "rgba(251,191,36,0.08)",
    border: "1px solid rgba(251,191,36,0.2)",
    color: "var(--warning)", borderRadius: "var(--radius-md)",
    padding: "10px 16px", fontSize: "0.83rem",
    marginBottom: 20,
  },
  retryInline: {
    background: "transparent", border: "1px solid var(--warning)",
    color: "var(--warning)", borderRadius: "var(--radius-sm)",
    padding: "4px 12px", cursor: "pointer", fontSize: "0.8rem",
    fontFamily: "var(--font-body)", whiteSpace: "nowrap",
  },
  retryBtn: {
    background: "var(--accent)", color: "#fff",
    border: "none", borderRadius: "var(--radius-md)",
    padding: "10px 24px", cursor: "pointer",
    fontWeight: 700, fontSize: "0.88rem", fontFamily: "var(--font-body)",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  card: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "14px 16px",
  },
  cardLabel: {
    fontSize: "0.68rem", fontWeight: 700,
    color: "var(--accent)", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: 8,
  },
  cardBody: {
    fontSize: "0.87rem", color: "var(--text-secondary)", lineHeight: 1.65,
  },
  ul: { margin: 0, paddingLeft: "1.1rem" },
  li: {
    fontSize: "0.87rem", color: "var(--text-secondary)",
    lineHeight: 1.65, marginBottom: 4,
  },
  tags: { display: "flex", flexWrap: "wrap", gap: 7 },
  tag: {
    background: "rgba(91,127,255,0.1)", color: "var(--accent)",
    border: "1px solid rgba(91,127,255,0.25)", borderRadius: 999,
    padding: "3px 11px", fontSize: "0.78rem", fontWeight: 500,
  },
};