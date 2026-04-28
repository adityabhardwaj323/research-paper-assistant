import React, { useState } from 'react';

export default function Sidebar({ papers, activePaperId, onSelectPaper, onNewChat, onBack }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      width: collapsed ? 64 : 260, minWidth: collapsed ? 64 : 260,
      height: '100vh', background: '#080a14',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1), min-width 0.3s cubic-bezier(0.16,1,0.3,1)',
      overflow: 'hidden', position: 'relative', zIndex: 10, flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, fontFamily: 'Syne', color: '#fff', cursor: 'pointer'
        }} onClick={onBack}>I</div>
        {!collapsed && (
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#e8eaf0', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>InsightAI</span>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(232,234,240,0.3)', fontSize: 16, padding: 4,
            borderRadius: 6, transition: 'color 0.2s'
          }}>‹</button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{
          margin: '8px auto', width: 36, height: 36, background: 'none',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, cursor: 'pointer',
          color: 'rgba(232,234,240,0.4)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}>›</button>
      )}

      {/* New Chat */}
      <div style={{ padding: collapsed ? '12px 14px' : '12px 16px' }}>
        <button onClick={onNewChat} style={{
          width: '100%', padding: collapsed ? '10px' : '10px 14px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 10, cursor: 'pointer', color: '#a5b4fc',
          fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Papers list */}
      {!collapsed && (
        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px' }}>
          <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.25)', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 12px' }}>Uploaded Papers</div>
          {papers.length === 0 && (
            <div style={{ padding: '12px 8px', fontSize: 13, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.25)', fontStyle: 'italic' }}>No papers yet</div>
          )}
          {papers.map((paper) => (
            <button key={paper.id} onClick={() => onSelectPaper(paper.id)} style={{
              width: '100%', textAlign: 'left', padding: '10px 10px',
              background: activePaperId === paper.id ? 'rgba(99,102,241,0.12)' : 'transparent',
              border: activePaperId === paper.id ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
              borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: 10
            }}
            onMouseEnter={e => { if (activePaperId !== paper.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (activePaperId !== paper.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>📄</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontFamily: 'DM Sans', fontSize: 13, color: activePaperId === paper.id ? '#a5b4fc' : 'rgba(232,234,240,0.7)',
                  fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3
                }}>{paper.name}</div>
                <StatusBadge status={paper.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bottom nav */}
      <div style={{
        padding: collapsed ? '12px 14px' : '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', gap: 4
      }}>
        {[
          { icon: '🕐', label: 'History' },
          { icon: '⚙️', label: 'Settings' },
        ].map((item) => (
          <button key={item.label} style={{
            width: '100%', padding: collapsed ? '10px' : '9px 12px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(232,234,240,0.4)', fontFamily: 'DM Sans', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 8, transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(232,234,240,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(232,234,240,0.4)'; }}
          >
            <span>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    uploading: { color: '#f59e0b', label: 'Uploading...' },
    extracting: { color: '#6366f1', label: 'Extracting...' },
    embedding: { color: '#8b5cf6', label: 'Embedding...' },
    analyzing: { color: '#3b82f6', label: 'Analyzing...' },
    ready: { color: '#10b981', label: 'Ready' },
    error: { color: '#ef4444', label: 'Error' },
  };
  const s = config[status] || config.ready;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: s.color, fontFamily: 'DM Sans' }}>{s.label}</span>
    </div>
  );
}