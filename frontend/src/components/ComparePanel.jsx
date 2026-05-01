import React, { useState } from "react";
import { comparePapers } from "../api";

export default function ComparePanel({ papers = [] }) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🚨 Handle less than 2 papers
  if (!papers || papers.length < 2) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>⚖️ Compare Papers</h2>
        <p style={styles.message}>
          Upload at least <b>2 papers</b> to use comparison.
        </p>
      </div>
    );
  }

  const handleCompare = async () => {
    if (!p1 || !p2) return alert("Select two papers");
    if (p1 === p2) return alert("Select different papers");

    try {
      setLoading(true);

      const res = await comparePapers(p1, p2);

      // ✅ important: use comparison field
      setResult(res.comparison);

    } catch (err) {
      console.error(err);
      alert("Compare failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚖️ Compare Papers</h2>

      {/* Selectors */}
      <div style={styles.selectRow}>
        <select style={styles.select} onChange={(e) => setP1(e.target.value)}>
          <option value="">Select Paper 1</option>
          {papers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.filename}
            </option>
          ))}
        </select>

        <select style={styles.select} onChange={(e) => setP2(e.target.value)}>
          <option value="">Select Paper 2</option>
          {papers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.filename}
            </option>
          ))}
        </select>
      </div>

      <button style={styles.button} onClick={handleCompare}>
        {loading ? "Comparing..." : "Compare"}
      </button>

      {/* Result */}
      {result && (
        <div style={styles.resultBox}>
          <h3 style={styles.resultTitle}>📊 Comparison Result</h3>

          {/* If backend returns structured fields */}
          {typeof result === "object" ? (
            <div style={styles.resultContent}>
              {Object.entries(result).map(([key, value]) => (
                <div key={key} style={styles.resultItem}>
                  <strong>{key.replace(/_/g, " ")}</strong>
                  <p>{Array.isArray(value) ? value.join(", ") : String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>{result}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* 🔥 STYLES (MATCH YOUR UI) */
const styles = {
  container: {
    padding: "30px",
    color: "var(--text-1)",
  },
  title: {
    marginBottom: "20px",
  },
  message: {
    color: "var(--text-3)",
  },
  selectRow: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg-elevated)",
    color: "var(--text-1)",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "12px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
  },
  resultTitle: {
    marginBottom: "10px",
  },
  resultContent: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  resultItem: {
    padding: "10px",
    borderRadius: "8px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
  },
};