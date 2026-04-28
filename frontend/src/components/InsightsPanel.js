import React, { useState } from 'react';

export default function InsightsPanel({ analysis, paper }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!paper && !analysis) return null;

  return (
    <div style={{
      width: collapsed ? 48 : 320, minWidth: collapsed ? 48 : 320,
      height: '100vh', background: '#060810',
      borderLeft: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), min-width 0.3s',
      overflow: 'hidden', flexShrink: 0, position: 'relative'
    }}>
      {/* Toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position: 'absolute', top: 20, left: collapsed ? 8 : 16,
        width: 28, height: 28, background: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7,
        cursor: 'pointer', color: '#a5b4fc', fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5, transition: 'left 0.3s'
      }}>{collapsed ? '‹' : '›'}</button>

      {!collapsed && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 20px 56px' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#e8eaf0', marginBottom: 20, letterSpacing: '-0.02em' }}>
            Research Insights
          </div>

          {!analysis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[120, 80, 140, 60, 100].map((w, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 10, width: 70, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
                  <div style={{ height: 14, width: `${w}px`, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
                </div>
              ))}
              <div style={{ marginTop: 12, padding: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.4)', lineHeight: 1.6 }}>
                  Upload and analyze a paper to see insights here
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              {analysis.title && (
                <InsightCard label="📰 Title" color="#a5b4fc">
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.8)', lineHeight: 1.6 }}>{analysis.title}</p>
                </InsightCard>
              )}

              {/* Problem */}
              {analysis.problem_statement && (
                <InsightCard label="🎯 Problem Statement" color="#f59e0b">
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.75)', lineHeight: 1.6 }}>{analysis.problem_statement}</p>
                </InsightCard>
              )}

              {/* Methodology */}
              {analysis.methodology && (
                <InsightCard label="⚙️ Methodology" color="#6366f1">
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.75)', lineHeight: 1.6 }}>{analysis.methodology}</p>
                </InsightCard>
              )}

              {/* Results */}
              {analysis.results && (
                <InsightCard label="📊 Results" color="#10b981">
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.75)', lineHeight: 1.6 }}>{analysis.results}</p>
                </InsightCard>
              )}

              {/* Keywords */}
              {analysis.keywords && analysis.keywords.length > 0 && (
                <InsightCard label="🏷️ Keywords" color="#ec4899">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysis.keywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: '3px 10px', background: 'rgba(236,72,153,0.1)',
                        border: '1px solid rgba(236,72,153,0.2)', borderRadius: 100,
                        fontSize: 11, fontFamily: 'DM Sans', color: '#f9a8d4'
                      }}>{kw}</span>
                    ))}
                  </div>
                </InsightCard>
              )}

              {/* Scores */}
              {analysis.scores && (
                <InsightCard label="⭐ Paper Scores" color="#8b5cf6">
                  {Object.entries(analysis.scores).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.5)', textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ fontSize: 12, fontFamily: 'Syne', fontWeight: 600, color: '#a5b4fc' }}>{val}/10</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${val * 10}%`, borderRadius: 100,
                          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          transition: 'width 1s cubic-bezier(0.16,1,0.3,1)'
                        }} />
                      </div>
                    </div>
                  ))}
                </InsightCard>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InsightCard({ label, color, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 12, padding: 16, transition: 'border-color 0.2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}33`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
    >
      <div style={{
        fontSize: 11, color, fontFamily: 'DM Sans', fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10
      }}>{label}</div>
      {children}
    </div>
  );
}