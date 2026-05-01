// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import Loader from "./Loader";
import { chatWithPaper } from "../api";

const SUGGESTIONS = [
  "What is the main contribution of this paper?",
  "What methodology did the authors use?",
  "What were the key results and findings?",
  "What are the limitations of this work?",
];

export default function ChatWindow({ paper, analysis }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const prevPaperId = useRef(null);

  // 🔥 Reset chat when paper changes
  useEffect(() => {
    if (paper?.id !== prevPaperId.current) {
      setMessages([]);
      setInput("");
      setError("");
      prevPaperId.current = paper?.id;
    }
  }, [paper?.id]);

  // 🔥 Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔥 Chat allowed only when ready
  const canChat =
    paper?.status === "completed" || paper?.status === "fallback";

  // 🔥 Send message
  const send = async (question) => {
    if (!question?.trim() || loading || !canChat || !paper?.id) return;

    setInput("");
    setError("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);

    setLoading(true);

    try {
      const data = await chatWithPaper(paper.id, question);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.answer || "No response received.",
          confidence: data?.confidence,
        },
      ]);
    } catch (e) {
      console.error("Chat error:", e);

      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Something went wrong.";

      setError(msg);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't answer that right now. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input.trim());
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.trim());
    }
  };

  if (!paper) return null;

  return (
    <div style={s.root}>
      {/* Messages */}
      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={s.welcome}>
            <p style={s.welcomeText}>
              Ask anything about{" "}
              <strong style={{ color: "var(--text-1)" }}>
                {paper.filename}
              </strong>
            </p>

            {!canChat ? (
              <div style={s.waitRow}>
                <Loader size={14} color="var(--warning)" />
                <span style={{ fontSize: "0.84rem", color: "var(--text-3)" }}>
                  Waiting for analysis to finish…
                </span>
              </div>
            ) : (
              <div style={s.suggestions}>
                {SUGGESTIONS.map((q, i) => (
                  <button
                    key={i}
                    style={s.suggBtn}
                    onClick={() => send(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...s.row,
              justifyContent:
                m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {m.role === "assistant" && <div style={s.avatar}>AI</div>}

            <div
              style={{
                ...s.bubble,
                ...(m.role === "user" ? s.userBubble : s.aiBubble),
                ...(m.isError ? s.errBubble : {}),
              }}
            >
              {m.content}

              {m.confidence && m.confidence !== "high" && (
                <div style={s.conf}>
                  Confidence: {m.confidence}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...s.row, justifyContent: "flex-start" }}>
            <div style={s.avatar}>AI</div>
            <div style={{ ...s.bubble, ...s.aiBubble }}>
              <Loader size={14} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form style={s.form} onSubmit={handleSubmit}>
        {error && <div style={s.errBar}>{error}</div>}

        <div style={s.inputRow}>
          <textarea
            ref={inputRef}
            rows={1}
            style={s.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              canChat
                ? "Ask a question… (Enter to send)"
                : "Analysis in progress — please wait…"
            }
            disabled={!canChat || loading}
          />

          <button
            type="submit"
            style={{
              ...s.sendBtn,
              opacity:
                !canChat || loading || !input.trim() ? 0.4 : 1,
              cursor:
                !canChat || loading || !input.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={!canChat || loading || !input.trim()}
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}

/* 🔥 STYLES (UNCHANGED) */
const s = {
  root: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  welcome: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: "48px 20px",
    textAlign: "center",
  },
  welcomeText: { fontSize: "1rem", color: "var(--text-2)" },
  waitRow: { display: "flex", alignItems: "center", gap: 8 },
  suggestions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    maxWidth: 480,
  },
  suggBtn: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-2)",
    padding: "10px 16px",
    cursor: "pointer",
  },
  row: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "var(--bg-overlay)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.6rem",
    fontWeight: 700,
    color: "var(--accent)",
  },
  bubble: {
    maxWidth: "72%",
    padding: "10px 15px",
    borderRadius: "var(--radius-md)",
  },
  userBubble: { background: "var(--accent-dim)" },
  aiBubble: { background: "var(--bg-elevated)" },
  errBubble: { background: "rgba(248,113,113,0.08)" },
  conf: { fontSize: "0.7rem", marginTop: 6 },
  form: {
    padding: "12px 20px",
    borderTop: "1px solid var(--border)",
  },
  errBar: {
    background: "rgba(248,113,113,0.08)",
    padding: 6,
    marginBottom: 8,
  },
  inputRow: { display: "flex", gap: 8 },
  textarea: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 8,
  },
};