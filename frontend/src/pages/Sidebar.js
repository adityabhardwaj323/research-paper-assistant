import React, { useRef } from "react";
import { deletePaper } from "../api";

export default function Sidebar({
  papers = [],
  selectedId,
  onSelect,
  onRefresh,
  onUpload,          // ✅ IMPORTANT
}) {
  const fileRef = useRef();

  return (
    <div style={styles.sidebar}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>📚 Papers</h2>
        <span style={styles.count}>{papers.length}</span>
      </div>

      {/* 🔥 UPLOAD BUTTON (RESTORED) */}
      <button
        style={styles.uploadBtn}
        onClick={() => fileRef.current.click()}
      >
        ⬆ Upload PDF
      </button>

      <input
        type="file"
        accept="application/pdf"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file && onUpload) {
            onUpload(file);
          }
        }}
      />

      {/* EMPTY STATE */}
      {papers.length === 0 && (
        <p style={styles.empty}>No papers uploaded yet</p>
      )}

      {/* PAPER LIST */}
      {papers.map((p) => (
        <div
          key={p.id}
          style={{
            ...styles.paperItem,
            ...(selectedId === p.id ? styles.active : {}),
          }}
          onClick={() => onSelect(p.id)}
        >
          <div style={styles.paperInfo}>
            <div style={styles.filename}>{p.filename}</div>

            <div style={styles.status}>
              {p.status}
            </div>
          </div>

          {/* DELETE */}
          <button
            style={styles.deleteBtn}
            onClick={async (e) => {
              e.stopPropagation();

              const confirmDelete = window.confirm("Delete this paper?");
              if (!confirmDelete) return;

              try {
                await deletePaper(p.id);
                onRefresh && onRefresh(p.id);
              } catch (err) {
                console.error(err);
                alert("Delete failed");
              }
            }}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg,#07090f,#0b0f1a)",
    padding: "16px",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    overflowY: "auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  title: {
    color: "white",
    fontSize: "18px",
  },

  count: {
    color: "#aaa",
    fontSize: "12px",
  },

  uploadBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white",
    cursor: "pointer",
    marginBottom: "16px",
  },

  empty: {
    color: "#666",
    fontSize: "13px",
  },

  paperItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "8px",
    cursor: "pointer",
    background: "rgba(255,255,255,0.03)",
  },

  active: {
    background: "rgba(99,102,241,0.25)",
  },

  paperInfo: {
    display: "flex",
    flexDirection: "column",
  },

  filename: {
    color: "white",
    fontSize: "13px",
  },

  status: {
    fontSize: "11px",
    color: "#aaa",
  },

  deleteBtn: {
    background: "transparent",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
  },
};