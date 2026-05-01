// src/components/UploadButton.js
import React from "react";
import Loader from "./Loader";

export default function UploadButton({ onUpload, loading, progress, fileInputRef }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <label style={s.wrap}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={handleChange}
        disabled={loading}
      />
      {loading ? (
        <div style={s.loadingInner}>
          <div style={s.barTrack}>
            <div style={{ ...s.barFill, width: `${progress}%` }} />
          </div>
          <div style={s.loadingRow}>
            <Loader size={12} color="#fff" />
            <span style={s.loadingText}>
              {progress < 100 ? `Uploading ${progress}%` : "Processing…"}
            </span>
          </div>
        </div>
      ) : (
        <span style={s.idle}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7 1v8M3.5 4.5L7 1l3.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 10.5v1a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 13 11.5v-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Upload PDF
        </span>
      )}
    </label>
  );
}

const s = {
  wrap: {
    display: "block",
    background: "var(--accent)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    userSelect: "none",
    overflow: "hidden",
  },
  idle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 0",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.88rem",
    fontFamily: "var(--font-body)",
  },
  loadingInner: {
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  barTrack: {
    height: 3,
    background: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "#fff",
    borderRadius: 2,
    transition: "width 0.2s ease",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  loadingText: {
    color: "#fff",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
};