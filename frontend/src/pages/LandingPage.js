// src/pages/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={s.root}>
      {/* Background grid */}
      <div style={s.grid} aria-hidden="true" />
      {/* Glow orb */}
      <div style={s.orb} aria-hidden="true" />

      <nav style={s.nav}>
        <span style={s.navLogo}>PaperMind</span>
        <button style={s.navBtn} onClick={() => navigate("/dashboard")}>
          Open App →
        </button>
      </nav>

      <section style={s.hero}>
        <div style={s.badge}>AI Research Assistant</div>
        <h1 style={s.h1}>
          Understand any paper<br />
          <span style={s.accent}>in minutes.</span>
        </h1>
        <p style={s.sub}>
          Upload PDFs, get instant structured analysis, chat with your papers,
          and compare research side-by-side — powered by Gemini AI.
        </p>
        <div style={s.ctas}>
          <button style={s.ctaPrimary} onClick={() => navigate("/dashboard")}>
            Get Started — it's free
          </button>
        </div>

        <div style={s.features}>
          {FEATURES.map((f) => (
            <div key={f.title} style={s.featureCard}>
              <span style={s.featureIcon}>{f.icon}</span>
              <div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureSub}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  { icon: "📄", title: "Instant Analysis", desc: "Title, authors, methodology, results extracted automatically." },
  { icon: "💬", title: "Chat with Papers", desc: "Ask questions in plain English, get precise answers." },
  { icon: "⚖️", title: "Side-by-Side Compare", desc: "Similarities, differences, and a winner — at a glance." },
  { icon: "🛡️", title: "Resilient by Design", desc: "Fallback mode keeps you working even if the API is down." },
];

const s = {
  root: {
    minHeight: "100vh",
    background: "var(--bg-base)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: `
      linear-gradient(rgba(91,127,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,127,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute", top: "-200px", left: "50%",
    transform: "translateX(-50%)",
    width: 700, height: 700,
    background: "radial-gradient(circle, rgba(91,127,255,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  nav: {
    position: "relative", zIndex: 10,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "24px 48px",
    borderBottom: "1px solid var(--border)",
    backdropFilter: "blur(8px)",
  },
  navLogo: {
    fontFamily: "var(--font-display)", fontWeight: 800,
    fontSize: "1.3rem", color: "var(--text-primary)", letterSpacing: "-0.03em",
  },
  navBtn: {
    background: "transparent", border: "1px solid var(--border)",
    color: "var(--text-secondary)", borderRadius: "var(--radius-sm)",
    padding: "8px 18px", cursor: "pointer", fontSize: "0.88rem",
    fontFamily: "var(--font-body)", transition: "all 0.15s",
  },
  hero: {
    position: "relative", zIndex: 10,
    display: "flex", flexDirection: "column",
    alignItems: "center", textAlign: "center",
    padding: "100px 24px 80px",
    maxWidth: 800, margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    background: "rgba(91,127,255,0.12)", color: "var(--accent)",
    border: "1px solid rgba(91,127,255,0.3)", borderRadius: 999,
    padding: "4px 14px", fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 28,
  },
  h1: {
    fontFamily: "var(--font-display)", fontWeight: 800,
    fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 1.1,
    color: "var(--text-primary)", marginBottom: 24, letterSpacing: "-0.04em",
  },
  accent: { color: "var(--accent)" },
  sub: {
    color: "var(--text-secondary)", fontSize: "1.05rem",
    lineHeight: 1.7, maxWidth: 560, marginBottom: 40,
  },
  ctas: { display: "flex", gap: 14, marginBottom: 72 },
  ctaPrimary: {
    background: "var(--accent)", color: "#fff",
    border: "none", borderRadius: "var(--radius-md)",
    padding: "14px 32px", fontSize: "0.95rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "var(--font-body)",
    boxShadow: "0 0 32px rgba(91,127,255,0.4)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  features: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 14, width: "100%", maxWidth: 680, textAlign: "left",
  },
  featureCard: {
    display: "flex", gap: 14, alignItems: "flex-start",
    background: "var(--bg-elevated)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "18px 20px",
  },
  featureIcon: { fontSize: "1.4rem", lineHeight: 1 },
  featureTitle: {
    fontWeight: 700, fontSize: "0.92rem",
    color: "var(--text-primary)", marginBottom: 4,
  },
  featureSub: { color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5 },
};