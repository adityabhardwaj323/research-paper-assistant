// src/components/Loader.js
import React from "react";

export default function Loader({ size = 22, color = "var(--accent)" }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid rgba(255,255,255,0.08)`,
        borderTopColor: color,
        animation: "spin 0.65s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}