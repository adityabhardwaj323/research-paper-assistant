// src/api.js
import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 120000,
});

// Upload
export async function uploadPaper(file) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await client.post("/api/papers/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

// Get all papers
export async function fetchAllPapers() {
  const { data } = await client.get("/api/papers");
  return data;
}

// Status
export async function fetchPaperStatus(paperId) {
  const { data } = await client.get(`/api/papers/${paperId}/status`);
  return data;
}

// Analysis
export async function fetchAnalysis(paperId) {
  const { data } = await client.get(`/api/papers/${paperId}/analysis`);
  return data.analysis; // 🔥 IMPORTANT
}

// Chat
export async function chatWithPaper(paperId, question) {
  const { data } = await client.post(
    `/api/papers/${paperId}/chat`,
    { question }
  );
  return data;
}

// Compare
export async function comparePapers(p1, p2) {
  const { data } = await client.post("/api/papers/compare", {
    paper_id_1: p1,
    paper_id_2: p2,
  });
  return data;
}
export async function deletePaper(paperId) {
  const { data } = await client.delete(`/api/papers/${paperId}`);
  return data;
}