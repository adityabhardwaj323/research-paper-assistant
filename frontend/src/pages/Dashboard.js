import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import InsightsPanel from './InsightsPanel';

const STEP_LABELS = {
  uploading: 'Uploading file...',
  extracting: 'Extracting text...',
  embedding: 'Creating embeddings...',
  analyzing: 'Analyzing paper...',
  ready: 'Analysis complete!',
};

export default function Dashboard({ onBack }) {
  const [papers, setPapers] = useState([]);
  const [activePaperId, setActivePaperId] = useState(null);
  const [analyses, setAnalyses] = useState({});

  const activePaper = papers.find(p => p.id === activePaperId) || null;

  const handlePaperAdded = useCallback((paper) => {
    setPapers(prev => {
      const exists = prev.find(p => p.id === paper.id);
      if (exists) return prev.map(p => p.id === paper.id ? { ...p, ...paper } : p);
      return [...prev, paper];
    });
    setActivePaperId(paper.id);
  }, []);

  const handleAnalysisReady = useCallback((paperId, analysisData) => {
    setPapers(prev => prev.map(p => p.id === paperId ? { ...p, status: 'ready' } : p));
    setAnalyses(prev => ({ ...prev, [paperId]: analysisData }));
  }, []);

  const handlePaperStatusUpdate = useCallback((paperId, status) => {
    setPapers(prev => prev.map(p => p.id === paperId ? { ...p, status } : p));
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#04050a', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,0.4);}
        ::placeholder{color:rgba(232,234,240,0.3);}
        textarea{resize:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pp{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes msgIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes td{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .msg-in{animation:msgIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;}
        .tdot{animation:td 1.2s infinite;}
      `}</style>

      <Sidebar
        papers={papers}
        activePaperId={activePaperId}
        onSelectPaper={setActivePaperId}
        onNewChat={() => setActivePaperId(null)}
        onBack={onBack}
      />

      <ChatArea
        activePaper={activePaper}
        onPaperAdded={handlePaperAdded}
        onAnalysisReady={handleAnalysisReady}
        onPaperStatusUpdate={handlePaperStatusUpdate}
      />

      <InsightsPanel
        analysis={activePaperId ? analyses[activePaperId] : null}
        paper={activePaper}
      />
    </div>
  );
}

function ChatArea({ activePaper, onPaperAdded, onAnalysisReady, onPaperStatusUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const statusPollRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activePaper) { setMessages([]); setUploadProgress(null); return; }
    if (activePaper.status === 'ready') setUploadProgress(null);
  }, [activePaper?.id]);

  useEffect(() => () => { if (statusPollRef.current) clearInterval(statusPollRef.current); }, []);

  const startPolling = (paperId) => {
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    statusPollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/papers/${paperId}/status`);
        const status = data.status;
        setUploadProgress(status);
        onPaperStatusUpdate(paperId, status);
        if (status === 'ready') {
          clearInterval(statusPollRef.current);
          setUploadProgress(null);
          try {
            const res = await axios.get(`/api/papers/${paperId}/analysis`);
            onAnalysisReady(paperId, res.data);
          } catch {}
        } else if (status === 'error') {
          clearInterval(statusPollRef.current);
        }
      } catch {}
    }, 2000);
  };

  const handleUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') return;
    setUploadProgress('uploading');
    setMessages([]);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await axios.post('/api/papers/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const paperId = data.id || data.paper_id;
      onPaperAdded({ id: paperId, name: file.name.replace(/\.pdf$/i, ''), status: 'extracting' });
      setUploadProgress('extracting');
      startPolling(paperId);
    } catch {
      setUploadProgress(null);
      setMessages([{ role: 'error', content: 'Upload failed. Please try again.' }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activePaper || activePaper.status !== 'ready' || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/papers/${activePaper.id}/chat`, { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.message || 'No response received.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to get response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const isReady = activePaper?.status === 'ready';
  const isProcessing = !!uploadProgress && uploadProgress !== 'ready';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: '#04050a', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, minHeight: 64 }}>
        {activePaper ? (
          <>
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: '#e8eaf0', letterSpacing: '-0.01em' }}>{activePaper.name}</div>
              <div style={{ fontSize: 12, fontFamily: 'DM Sans', color: isReady ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: isReady ? '#10b981' : '#f59e0b' }} />
                {isReady ? 'Ready to chat' : STEP_LABELS[uploadProgress] || 'Processing...'}
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: 'rgba(232,234,240,0.35)' }}>New session</div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!activePaper && !isProcessing && messages.length === 0 && <WelcomeState onUpload={() => fileInputRef.current?.click()} />}
        {isProcessing && <ProcessingState status={uploadProgress} />}
        {messages.map((msg, i) => <MsgBubble key={i} msg={msg} delay={Math.min(i * 0.04, 0.3)} />)}
        {loading && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 60px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(4,5,10,0.95)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'flex-end', gap: 10, transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ''; }} />
          <button onClick={() => fileInputRef.current?.click()} title="Upload PDF" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', color: '#a5b4fc', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
          >📎</button>

          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={!isReady}
            placeholder={isReady ? 'Ask anything about this paper...' : isProcessing ? STEP_LABELS[uploadProgress] || 'Processing...' : 'Upload a PDF to start chatting...'}
            rows={1} style={{ flex: 1, background: 'none', border: 'none', fontFamily: 'DM Sans', fontSize: 15, color: '#e8eaf0', lineHeight: 1.6, maxHeight: 160, overflowY: 'auto', outline: 'none', opacity: isReady ? 1 : 0.4 }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; }}
          />

          <button onClick={handleSend} disabled={!isReady || !input.trim() || loading} style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', cursor: isReady && input.trim() && !loading ? 'pointer' : 'not-allowed', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s', opacity: isReady && input.trim() && !loading ? 1 : 0.4 }}>↑</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.18)' }}>InsightAI may make mistakes. Always verify with the source paper.</p>
      </div>
    </div>
  );
}

function MsgBubble({ msg, delay }) {
  return (
    <div className="msg-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${delay}s`, maxWidth: 780, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%', margin: '0 auto' }}>
      {msg.role !== 'user' && (
        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: msg.role === 'error' ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginRight: 10, alignSelf: 'flex-start', marginTop: 2, color: '#fff', fontFamily: 'Syne', fontWeight: 700 }}>
          {msg.role === 'error' ? '⚠' : 'I'}
        </div>
      )}
      <div style={{ maxWidth: '78%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : msg.role === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', border: msg.role === 'user' ? 'none' : msg.role === 'error' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.07)', fontFamily: 'DM Sans', fontSize: 15, color: msg.role === 'user' ? '#fff' : msg.role === 'error' ? '#fca5a5' : 'rgba(232,234,240,0.85)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', gap: 10, maxWidth: 780, margin: '0 auto', width: '100%' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontFamily: 'Syne', fontWeight: 700 }}>I</div>
      <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 0.2, 0.4].map((d, i) => <div key={i} className="tdot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', animationDelay: `${d}s` }} />)}
      </div>
    </div>
  );
}

function ProcessingState({ status }) {
  const steps = ['uploading', 'extracting', 'embedding', 'analyzing'];
  const idx = steps.indexOf(status);
  return (
    <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center', width: '100%' }}>
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: 36 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.15)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📄</div>
        </div>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#e8eaf0', marginBottom: 8 }}>{STEP_LABELS[status] || 'Processing...'}</div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.4)', marginBottom: 28 }}>Please wait while InsightAI processes your paper</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ height: 4, flex: 1, borderRadius: 100, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ height: '100%', borderRadius: 100, background: i < idx ? '#10b981' : i === idx ? '#6366f1' : 'transparent', width: i < idx ? '100%' : i === idx ? '65%' : '0%', transition: 'width 0.5s ease', animation: i === idx ? 'pp 1.5s ease infinite' : 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {steps.map((s, i) => <span key={s} style={{ fontSize: 10, fontFamily: 'DM Sans', textTransform: 'capitalize', color: i <= idx ? '#a5b4fc' : 'rgba(232,234,240,0.2)' }}>{s}</span>)}
        </div>
      </div>
    </div>
  );
}

function WelcomeState({ onUpload }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, margin: '0 auto 28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🔬</div>
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: '#e8eaf0', marginBottom: 12 }}>Welcome to InsightAI</h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'rgba(232,234,240,0.45)', maxWidth: 420, lineHeight: 1.7, marginBottom: 36 }}>Upload a research paper to get AI-powered analysis and start an intelligent conversation with your document.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 560, marginBottom: 40 }}>
        {[{ icon: '📤', title: 'Upload PDF', desc: 'Drag, drop or click to upload' }, { icon: '🧠', title: 'AI Analysis', desc: 'Auto-extracts key insights' }, { icon: '💬', title: 'Chat', desc: 'Ask anything, get answers' }].map(item => (
          <div key={item.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: '#e8eaf0', marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(232,234,240,0.4)', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <button onClick={onUpload} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', padding: '14px 36px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, boxShadow: '0 0 40px rgba(99,102,241,0.35)', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >Upload Your First Paper →</button>
    </div>
  );
}