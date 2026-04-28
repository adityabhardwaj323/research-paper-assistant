import React, { useEffect, useRef, useState } from 'react';

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

const AnimSection = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0px)' : 'translateY(48px)',
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`
    }}>
      {children}
    </div>
  );
};

export default function LandingPage({ onEnterApp }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('mousemove', handleMouse); window.removeEventListener('scroll', handleScroll); };
  }, []);

  return (
    <div style={{ background: '#04050a', minHeight: '100vh', color: '#e8eaf0', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #04050a; }
        ::-webkit-scrollbar-thumb { background: #2a2d4a; border-radius: 4px; }
        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4)); opacity: 0; transition: opacity 0.3s; }
        .glow-btn:hover::before { opacity: 1; }
        .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(20px); }
        .gradient-text { background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 40%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .feature-card { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s; }
        .feature-card:hover { transform: translateY(-6px); border-color: rgba(99,102,241,0.4) !important; }
        .chat-bubble { animation: floatUp 0.5s ease forwards; opacity: 0; }
        @keyframes floatUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .orb { animation: orbFloat 8s ease-in-out infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        .progress-fill { animation: fillBar 2s ease forwards 0.5s; width: 0; }
        @keyframes fillBar { to { width: var(--target-width); } }
        .nav-link { color: rgba(232,234,240,0.6); text-decoration: none; font-size: 14px; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
        .nav-link:hover { color: #a5b4fc; }
      `}</style>

      {/* Ambient Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb" style={{
          position: 'absolute', top: '10%', left: '15%', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)'
        }} />
        <div className="orb" style={{
          position: 'absolute', top: '30%', right: '10%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)', animationDelay: '3s'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '30%', width: 800, height: 400,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }} />
        {/* Mouse glow */}
        <div style={{
          position: 'fixed', width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          left: mousePos.x - 200, top: mousePos.y - 200, transition: 'left 0.15s, top 0.15s',
          filter: 'blur(20px)'
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrollY > 50 ? 'rgba(4,5,10,0.85)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'all 0.4s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, fontFamily: 'Syne'
          }}>I</div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>InsightAI</span>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How it works</a>
          <a href="#demo" className="nav-link">Demo</a>
          <button onClick={onEnterApp} className="glow-btn" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
            color: '#fff', padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Syne', fontWeight: 600, fontSize: 14, letterSpacing: '0.01em'
          }}>Launch App</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '120px 60px 80px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
          padding: '6px 16px', borderRadius: 100
        }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
          <span style={{ fontSize: 13, color: '#a5b4fc', fontFamily: 'DM Sans', letterSpacing: '0.05em' }}>NOW IN BETA — AI-POWERED RESEARCH</span>
        </div>

        <h1 style={{
          fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(52px, 8vw, 108px)',
          lineHeight: 1.0, letterSpacing: '-0.04em', marginBottom: 28, maxWidth: 900
        }}>
          Research.<br />
          <span className="gradient-text">Understood.</span>
        </h1>

        <p style={{
          fontFamily: 'DM Sans', fontWeight: 300, fontSize: 'clamp(16px, 2vw, 22px)',
          color: 'rgba(232,234,240,0.6)', maxWidth: 540, lineHeight: 1.7, marginBottom: 52
        }}>
          Upload papers, get AI-powered insights, and have intelligent conversations with any research document instantly.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onEnterApp} className="glow-btn" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: '#fff', padding: '16px 40px',
            borderRadius: 12, cursor: 'pointer', fontFamily: 'Syne',
            fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em',
            boxShadow: '0 0 60px rgba(99,102,241,0.4)'
          }}>Try InsightAI →</button>
          <button style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(232,234,240,0.8)', padding: '16px 40px',
            borderRadius: 12, cursor: 'pointer', fontFamily: 'Syne',
            fontWeight: 600, fontSize: 16, transition: 'border-color 0.3s',
          }}>▶ Watch Demo</button>
        </div>

        {/* Hero visual */}
        <div style={{ marginTop: 80, position: 'relative', maxWidth: 900, width: '100%' }}>
          <div className="glass" style={{
            borderRadius: 20, padding: 3, border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 80px rgba(99,102,241,0.15)'
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #0d0f1e 0%, #080a14 100%)',
              borderRadius: 18, padding: 32, textAlign: 'left'
            }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['#ff5f56','#ffbd2e','#27c93f'].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Problem Statement', val: 'Identifying gaps in transformer...', color: '#f59e0b' },
                    { label: 'Methodology', val: 'Attention mechanism with 12-layer...', color: '#6366f1' },
                    { label: 'Key Results', val: '94.2% accuracy on ImageNet', color: '#10b981' },
                  ].map((item, i) => (
                    <div key={i} className="glass" style={{ borderRadius: 10, padding: '14px 18px' }}>
                      <div style={{ fontSize: 11, color: item.color, fontFamily: 'DM Sans', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                      <div style={{ fontSize: 13, color: 'rgba(232,234,240,0.75)', fontFamily: 'DM Sans', lineHeight: 1.5 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { role: 'user', msg: 'What problem does this paper solve?' },
                    { role: 'ai', msg: 'The paper addresses the computational bottleneck in vision transformers by introducing a novel sparse attention pattern...' },
                    { role: 'user', msg: 'How does it compare to BERT?' },
                  ].map((b, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: b.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        background: b.role === 'user'
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : 'rgba(255,255,255,0.05)',
                        padding: '10px 14px', borderRadius: 10, maxWidth: '85%',
                        fontSize: 12, fontFamily: 'DM Sans', color: b.role === 'user' ? '#fff' : 'rgba(232,234,240,0.8)',
                        lineHeight: 1.5
                      }}>{b.msg}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(232,234,240,0.3)', fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(99,102,241,0.6), transparent)' }} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '120px 60px', position: 'relative', zIndex: 1 }}>
        <AnimSection>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 12, color: '#818cf8', fontFamily: 'DM Sans', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>CAPABILITIES</div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Everything you need to<br /><span className="gradient-text">master research</span>
            </h2>
          </div>
        </AnimSection>

        {/* Feature A: Upload */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 120, maxWidth: 1100, margin: '0 auto 120px' }}>
          <AnimSection delay={0}>
            <div style={{ paddingRight: 40 }}>
              <div style={{ fontSize: 11, color: '#6366f1', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>01 / UPLOAD</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>Drop your paper.<br />We handle the rest.</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: 17, color: 'rgba(232,234,240,0.55)', lineHeight: 1.75 }}>Drag and drop any PDF research paper. InsightAI extracts, processes, and embeds the full content in seconds, ready for analysis.</p>
            </div>
          </AnimSection>
          <AnimSection delay={0.2}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))',
              border: '2px dashed rgba(99,102,241,0.3)', borderRadius: 20,
              padding: 60, textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))'; }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Drop PDF here</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'rgba(232,234,240,0.4)' }}>or click to browse</div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {['Extracting', 'Embedding', 'Analyzing'].map((s, i) => (
                  <div key={i} style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontFamily: 'DM Sans',
                    background: i === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                    color: i === 0 ? '#a5b4fc' : 'rgba(232,234,240,0.3)',
                    border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`
                  }}>{s}</div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>

        {/* Feature B: Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 120, maxWidth: 1100, margin: '0 auto 120px' }}>
          <AnimSection delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🎯', label: 'Problem Statement', color: '#f59e0b', text: 'Addresses computational inefficiency in large-scale vision transformers' },
                { icon: '⚙️', label: 'Methodology', color: '#6366f1', text: '12-layer sparse attention with novel positional encoding' },
                { icon: '📊', label: 'Results', color: '#10b981', text: '94.2% accuracy, 3.2× speedup over baseline BERT' },
              ].map((card, i) => (
                <div key={i} className="glass feature-card" style={{ borderRadius: 14, padding: '18px 22px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 22, flexShrink: 0 }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: card.color, fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontSize: 14, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.7)', lineHeight: 1.6 }}>{card.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimSection>
          <AnimSection delay={0.3}>
            <div style={{ paddingLeft: 40 }}>
              <div style={{ fontSize: 11, color: '#10b981', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>02 / ANALYZE</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>Deep AI analysis<br />in seconds.</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: 17, color: 'rgba(232,234,240,0.55)', lineHeight: 1.75 }}>Automatically extracts problem statements, methodology, results, and keywords. Get structured research intelligence instantly.</p>
            </div>
          </AnimSection>
        </div>

        {/* Feature C: Chat */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 120, maxWidth: 1100, margin: '0 auto 120px' }}>
          <AnimSection delay={0}>
            <div style={{ paddingRight: 40 }}>
              <div style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>03 / CHAT</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20 }}>Have a conversation<br />with your paper.</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: 17, color: 'rgba(232,234,240,0.55)', lineHeight: 1.75 }}>Ask anything. Get grounded answers with citations from the paper itself. No hallucinations, no guesswork.</p>
            </div>
          </AnimSection>
          <AnimSection delay={0.2}>
            <div className="glass" style={{ borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {[
                  { role: 'user', msg: 'What are the main contributions of this paper?' },
                  { role: 'ai', msg: 'The paper introduces three key contributions: (1) a sparse attention mechanism that reduces complexity from O(n²) to O(n log n), (2) a novel positional encoding scheme, and (3) state-of-the-art results on 5 benchmarks.' },
                  { role: 'user', msg: 'What datasets were used?' },
                  { role: 'ai', msg: 'The authors evaluated on ImageNet-1K, COCO 2017, and ADE20K. See Section 4.2 for detailed experimental setup.' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: b.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      background: b.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                      padding: '10px 14px', borderRadius: b.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      maxWidth: '80%', fontSize: 13, fontFamily: 'DM Sans',
                      color: b.role === 'user' ? '#fff' : 'rgba(232,234,240,0.8)', lineHeight: 1.6
                    }}>{b.msg}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px', alignItems: 'center' }}>
                <div style={{ flex: 1, fontSize: 13, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.3)' }}>Ask about this paper...</div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>↑</div>
              </div>
            </div>
          </AnimSection>
        </div>

        {/* Feature D: Compare */}
        <div style={{ maxWidth: 1100, margin: '0 auto 120px' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, color: '#f59e0b', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>04 / COMPARE</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.15 }}>Side-by-side paper comparison</h3>
            </div>
          </AnimSection>
          <AnimSection delay={0.2}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { title: 'Attention Is All You Need', year: '2017', acc: '91.2%', speed: '1.0×', params: '65M' },
                { title: 'Sparse Vision Transformer', year: '2023', acc: '94.2%', speed: '3.2×', params: '48M' },
              ].map((p, i) => (
                <div key={i} className="glass feature-card" style={{ borderRadius: 16, padding: 28, border: `1px solid ${i === 1 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}` }}>
                  {i === 1 && <div style={{ fontSize: 11, color: '#10b981', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>★ WINNER</div>}
                  <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 16, marginBottom: 20 }}>{p.title}</div>
                  {[['Accuracy', p.acc, i === 1], ['Speed', p.speed, i === 1], ['Parameters', p.params, i !== 1]].map(([k, v, win]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.5)' }}>{k}</span>
                      <span style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 600, color: win ? '#10b981' : 'rgba(232,234,240,0.8)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </AnimSection>
        </div>

        {/* Feature E: Scores */}
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <AnimSection>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, color: '#ec4899', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>05 / SCORE</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em' }}>Smart paper scoring</h3>
            </div>
          </AnimSection>
          <AnimSection delay={0.2}>
            <div className="glass" style={{ borderRadius: 20, padding: 40, border: '1px solid rgba(255,255,255,0.06)', maxWidth: 600, margin: '0 auto' }}>
              {[
                { label: 'Novelty', score: 87, color: '#6366f1' },
                { label: 'Clarity', score: 92, color: '#10b981' },
                { label: 'Rigor', score: 78, color: '#f59e0b' },
                { label: 'Impact', score: 95, color: '#ec4899' },
                { label: 'Reproducibility', score: 71, color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'rgba(232,234,240,0.7)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: item.color }}>{item.score}/100</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                    <div className="progress-fill" style={{
                      '--target-width': `${item.score}%`,
                      height: '100%', borderRadius: 100, animationDelay: `${0.3 + i * 0.1}s`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '160px 60px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <AnimSection>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(40px, 6vw, 80px)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24 }}>
            Start using<br /><span className="gradient-text">InsightAI</span> today.
          </h2>
          <p style={{ fontFamily: 'DM Sans', fontSize: 18, color: 'rgba(232,234,240,0.5)', marginBottom: 48, fontWeight: 300 }}>
            Join researchers who understand their papers in minutes, not hours.
          </p>
          <button onClick={onEnterApp} className="glow-btn" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
            color: '#fff', padding: '20px 56px', borderRadius: 14, cursor: 'pointer',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em',
            boxShadow: '0 0 80px rgba(99,102,241,0.5)'
          }}>Get Started — It's Free →</button>
        </AnimSection>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 60px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'Syne' }}>I</div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>InsightAI</span>
        </div>
        <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.25)' }}>© 2025 InsightAI. Built for researchers.</span>
      </footer>
    </div>
  );
}