import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const PROCESSING_STEPS = ['uploading', 'extracting', 'embedding', 'analyzing'];

const STEP_LABELS = {
  uploading: 'Uploading file...',
  extracting: 'Extracting text...',
  embedding: 'Creating embeddings...',
  analyzing: 'Analyzing paper...',
  ready: 'Analysis complete!',
};

export default function ChatWindow({ activePaper, onAnalysisReady }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const statusPollRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (activePaper) {
      setMessages([]);
      if (activePaper.status === 'ready') {
        setUploadProgress(null);
      } else if (PROCESSING_STEPS.includes(activePaper.status)) {
        setUploadProgress(activePaper.status);
        startPolling(activePaper.id);
      }
    }
  }, [activePaper?.id]);

  const startPolling = (paperId) => {
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    statusPollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`/api/papers/${paperId}/status`);
        const status = res.data.status;
        setUploadProgress(status);
        if (status === 'ready') {
          clearInterval(statusPollRef.current);
          setUploadProgress(null);
          try {
            const analysisRes = await axios.get(`/api/papers/${paperId}/analysis`);
            onAnalysisReady(paperId, analysisRes.data);
          } catch {}
        } else if (status === 'error') {
          clearInterval(statusPollRef.current);
        }
      } catch {}
    }, 2000);
  };

  useEffect(() => () => { if (statusPollRef.current) clearInterval(statusPollRef.current); }, []);

  const handleUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') return;
    setUploadProgress('uploading');
    setMessages([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const paperId = res.data.id || res.data.paper_id;
      setUploadProgress('extracting');
      startPolling(paperId);
    } catch (err) {
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
      const res = await axios.post(`/api/papers/${activePaper.id}/chat`, { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response || res.data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: 'Failed to get response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const isReady = activePaper?.status === 'ready';
  const isProcessing = uploadProgress && uploadProgress !== 'ready';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: '#04050a', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .msg-appear { animation: msgIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        @keyframes msgIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        .typing-dot { animation: typingBounce 1.2s infinite; }
        @keyframes typingBounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
        textarea:focus { outline: none; }
        textarea { resize: none; }
        .send-btn:hover { background: linear-gradient(135deg, #818cf8, #a78bfa) !important; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed !important; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
      }}>
        {activePaper ? (
          <>
            <span style={{ fontSize: 18 }}>📄</span>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: '#e8eaf0', letterSpacing: '-0.01em' }}>
                {activePaper.name}
              </div>
              <div style={{ fontSize: 12, fontFamily: 'DM Sans', color: isReady ? '#10b981' : '#f59e0b' }}>
                {isReady ? '● Ready to chat' : `● ${STEP_LABELS[uploadProgress] || 'Processing...'}`}
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: 'rgba(232,234,240,0.4)' }}>
            No paper selected
          </div>
        )}
      </div>

      {/* Messages / Welcome */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 60px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!activePaper && <WelcomeState onUpload={() => fileInputRef.current?.click()} />}

        {isProcessing && (
          <ProcessingState status={uploadProgress} />
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} delay={i * 0.05} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '20px 60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(4,5,10,0.95)', backdropFilter: 'blur(20px)', flexShrink: 0
      }}>
        <div style={{
          maxWidth: 780, margin: '0 auto',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: 10,
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)'; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {/* Upload button */}
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); e.target.value = ''; }} />
          <button onClick={() => fileInputRef.current?.click()} title="Upload PDF" style={{
            width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer',
            color: '#a5b4fc', fontSize: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
          >📎</button>

          {/* Text input */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={!isReady}
            placeholder={isReady ? 'Ask anything about this paper...' : isProcessing ? STEP_LABELS[uploadProgress] : 'Upload a PDF to start chatting...'}
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', fontFamily: 'DM Sans',
              fontSize: 15, color: '#e8eaf0', lineHeight: 1.6,
              maxHeight: 160, overflowY: 'auto',
              opacity: isReady ? 1 : 0.4
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
            }}
          />

          {/* Send */}
          <button className="send-btn" onClick={handleSend} disabled={!isReady || !input.trim() || loading} style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s'
          }}>↑</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, fontFamily: 'DM Sans', color: 'rgba(232,234,240,0.2)' }}>
          InsightAI may make mistakes. Always verify with the source paper.
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, delay }) {
  return (
    <div className="msg-appear" style={{
      display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
      animationDelay: `${delay}s`, maxWidth: 780, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
      width: '100%', margin: '0 auto'
    }}>
      {msg.role !== 'user' && (
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: msg.role === 'error' ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          marginRight: 10, alignSelf: 'flex-start', marginTop: 2
        }}>{msg.role === 'error' ? '⚠' : 'I'}</div>
      )}
      <div style={{
        maxWidth: '78%', padding: msg.role === 'user' ? '12px 18px' : '14px 18px',
        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
        background: msg.role === 'user'
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          : msg.role === 'error'
          ? 'rgba(239,68,68,0.1)'
          : 'rgba(255,255,255,0.05)',
        border: msg.role === 'user'
          ? 'none'
          : msg.role === 'error'
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
        fontFamily: 'DM Sans', fontSize: 15,
        color: msg.role === 'user' ? '#fff' : msg.role === 'error' ? '#fca5a5' : 'rgba(232,234,240,0.85)',
        lineHeight: 1.7, whiteSpace: 'pre-wrap'
      }}>{msg.content}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, maxWidth: 780, margin: '0 auto', width: '100%' }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
      }}>I</div>
      <div style={{
        padding: '14px 18px', borderRadius: '4px 16px 16px 16px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', gap: 5, alignItems: 'center'
      }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <div key={i} className="typing-dot" style={{
            width: 7, height: 7, borderRadius: '50%', background: '#818cf8',
            animationDelay: `${d}s`
          }} />
        ))}
      </div>
    </div>
  );
}

function ProcessingState({ status }) {
  const steps = ['uploading', 'extracting', 'embedding', 'analyzing'];
  const currentIdx = steps.indexOf(status);

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', textAlign: 'center' }}>
      <div style={{
        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 20, padding: 36
      }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 24px', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(99,102,241,0.2)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#6366f1',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
        </div>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, color: '#e8eaf0', marginBottom: 8 }}>
          {STEP_LABELS[status]}
        </div>
        <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(232,234,240,0.4)', marginBottom: 28 }}>
          Please wait while InsightAI processes your paper
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {steps.map((step, i) => (
            <div key={step} style={{
              height: 4, flex: 1, borderRadius: 100, overflow: 'hidden',
              background: 'rgba(255,255,255,0.06)'
            }}>
              <div style={{
                height: '100%', borderRadius: 100,
                background: i < currentIdx ? '#10b981' : i === currentIdx ? '#6366f1' : 'transparent',
                width: i < currentIdx ? '100%' : i === currentIdx ? '60%' : '0%',
                transition: 'width 0.5s, background 0.3s',
                animation: i === currentIdx ? 'progressPulse 1.5s ease infinite' : 'none'
              }} />
            </div>
          ))}
        </div>
        <style>{`@keyframes progressPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {steps.map((step, i) => (
            <span key={step} style={{
              fontSize: 10, fontFamily: 'DM Sans', textTransform: 'capitalize',
              color: i <= currentIdx ? '#a5b4fc' : 'rgba(232,234,240,0.2)'
            }}>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeState({ onUpload }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20, margin: '0 auto 28px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
        border: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
      }}>🔬</div>
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', color: '#e8eaf0', marginBottom: 12 }}>
        Welcome to InsightAI
      </h2>
      <p style={{ fontFamily: 'DM Sans', fontSize: 16, color: 'rgba(232,234,240,0.45)', maxWidth: 420, lineHeight: 1.7, marginBottom: 36 }}>
        Upload a research paper to get AI-powered analysis and start an intelligent conversation with your document.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 560, marginBottom: 40 }}>
        {[
          { icon: '📤', title: 'Upload PDF', desc: 'Drag, drop or click to upload' },
          { icon: '🧠', title: 'AI Analysis', desc: 'Auto-extracts key insights' },
          { icon: '💬', title: 'Chat', desc: 'Ask anything, get answers' },
        ].map((item) => (
          <div key={item.title} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: '20px 16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, color: '#e8eaf0', marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(232,234,240,0.4)', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <button onClick={onUpload} style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
        color: '#fff', padding: '14px 36px', borderRadius: 12, cursor: 'pointer',
        fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em',
        boxShadow: '0 0 40px rgba(99,102,241,0.35)', transition: 'transform 0.2s'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >Upload Your First Paper →</button>
    </div>
  );
}