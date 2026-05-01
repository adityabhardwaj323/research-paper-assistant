// src/pages/Dashboard.js

import React, { useState, useEffect, useCallback, useRef } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "./Sidebar";
import ChatWindow from "../components/ChatWindow";
import InsightsPanel from "./InsightsPanel";
import ComparePanel from "../components/ComparePanel";
import Loader from "../components/Loader";

import {
  fetchAllPapers,
  uploadPaper,
  fetchAnalysis,
  fetchPaperStatus,
} from "../api";

const POLL_INTERVAL = 3000;

export default function Dashboard() {
  const [papers, setPapers] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState("chat");
  const [uploadState, setUploadState] = useState({
    loading: false,
    error: "",
    progress: 0,
  });
  const [initialLoad, setInitialLoad] = useState(true);

  const pollRef = useRef(null);
  const fileInputRef = useRef(null);

  // ─────────────────────────────────────────────
  // LOAD PAPERS
  // ─────────────────────────────────────────────
  const loadPapers = useCallback(async () => {
    try {
      const list = await fetchAllPapers();
      setPapers(list);
    } catch (err) {
      console.error("loadPapers error:", err);
    } finally {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  // ─────────────────────────────────────────────
  // DELETE REFRESH FIX 🔥
  // ─────────────────────────────────────────────
  const refreshAfterDelete = async (deletedId) => {
    const list = await fetchAllPapers();
    setPapers(list);

    if (deletedId === selectedId) {
      setSelectedId(null);
      setActiveView("chat");
    }
  };

  // ─────────────────────────────────────────────
  // POLLING STATUS
  // ─────────────────────────────────────────────
  useEffect(() => {
    const processing = papers.filter(
      (p) => p.status === "processing" || p.status === "pending"
    );

    if (processing.length === 0) {
      clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      for (const p of processing) {
        try {
          const { status } = await fetchPaperStatus(p.id);

          if (status !== p.status) {
            setPapers((prev) =>
              prev.map((x) =>
                x.id === p.id ? { ...x, status } : x
              )
            );

            if (status === "completed" || status === "fallback") {
              loadAnalysis(p.id);
            }
          }
        } catch {}
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [papers]);

  // ─────────────────────────────────────────────
  // LOAD ANALYSIS
  // ─────────────────────────────────────────────
  const loadAnalysis = useCallback(async (id) => {
    try {
      const { analysis } = await fetchAnalysis(id);
      if (analysis) {
        setAnalyses((prev) => ({
          ...prev,
          [id]: analysis,
        }));
      }
    } catch (err) {
      console.error("analysis error:", err);
    }
  }, []);

  // ─────────────────────────────────────────────
  // UPLOAD
  // ─────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return;

    setUploadState({ loading: true, error: "", progress: 0 });

    try {
      const res = await uploadPaper(file);

      const newPaper = {
        id: res.paper_id,
        filename: res.filename,
        status: res.status,
      };

      setPapers((prev) => [newPaper, ...prev]);

      setSelectedId(res.paper_id);
      setActiveView("chat");

    } catch (err) {
      setUploadState({
        loading: false,
        error: "Upload failed",
        progress: 0,
      });
    } finally {
      setUploadState({ loading: false, error: "", progress: 0 });
    }
  };

  // ─────────────────────────────────────────────
  // SELECT PAPER
  // ─────────────────────────────────────────────
  const handleSelect = (id) => {
    setSelectedId(id);
    setActiveView("chat");

    const p = papers.find((x) => x.id === id);

    if (
      p &&
      (p.status === "completed" || p.status === "fallback")
    ) {
      loadAnalysis(id);
    }
  };

  const selectedPaper = papers.find((p) => p.id === selectedId);
  const selectedAnalysis = analyses[selectedId];

  // ─────────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────────
  if (initialLoad) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Loader />
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar
  papers={papers}
  selectedId={selectedId}
  onSelect={handleSelect}
  onRefresh={refreshAfterDelete}
  onUpload={handleUpload}   // 🔥 THIS FIXES YOUR ISSUE
/>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        <Topbar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPaper={selectedPaper}
          papersCount={papers.length}
        />

        <div style={{ flex: 1, overflow: "auto" }}>
          
          {activeView === "compare" ? (
            <ComparePanel papers={papers} />
          ) : !selectedPaper ? (
            <div style={{ padding: 40 }}>Upload a paper to start</div>
          ) : activeView === "insights" ? (
            <InsightsPanel analysis={selectedAnalysis} />
          ) : (
            <ChatWindow paper={selectedPaper} />
          )}

        </div>
      </div>
    </div>
  );
}