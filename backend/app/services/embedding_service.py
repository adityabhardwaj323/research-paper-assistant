import numpy as np
import faiss
import os
import pickle
from typing import List, Dict
from sentence_transformers import SentenceTransformer

FAISS_INDEX_DIR = "./faiss_store"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K = 8

class EmbeddingService:

    def __init__(self):
        print("Loading embedding model... please wait")
        self.model = SentenceTransformer(EMBED_MODEL)
        self.dimension = self.model.get_sentence_embedding_dimension()
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
        print("Embedding model loaded!")

    def embed_chunks(self, chunks: List[Dict]) -> np.ndarray:
        texts = [chunk["text"] for chunk in chunks]
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=False,
            normalize_embeddings=True
        )
        return embeddings.astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        embedding = self.model.encode(
            [query],
            normalize_embeddings=True
        )
        return embedding.astype(np.float32)

    def build_index(self, paper_id: str, chunks: List[Dict]) -> str:
        embeddings = self.embed_chunks(chunks)
        index = faiss.IndexFlatIP(self.dimension)
        index.add(embeddings)

        index_dir = os.path.join(FAISS_INDEX_DIR, paper_id)
        os.makedirs(index_dir, exist_ok=True)

        index_path = os.path.join(index_dir, "index.faiss")
        faiss.write_index(index, index_path)

        meta_path = os.path.join(index_dir, "chunks.pkl")
        with open(meta_path, "wb") as f:
            pickle.dump(chunks, f)

        print(f"Index built for paper {paper_id}: {index.ntotal} vectors")
        return index_path

    def search(self, paper_id: str, query: str, top_k: int = TOP_K) -> List[Dict]:
        index_dir = os.path.join(FAISS_INDEX_DIR, paper_id)
        index_path = os.path.join(index_dir, "index.faiss")
        meta_path = os.path.join(index_dir, "chunks.pkl")

        if not os.path.exists(index_path):
            raise FileNotFoundError(f"No index found for paper {paper_id}")

        index = faiss.read_index(index_path)
        with open(meta_path, "rb") as f:
            chunks = pickle.load(f)

        query_vector = self.embed_query(query)
        scores, indices = index.search(query_vector, min(top_k, index.ntotal))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0:
                chunk = chunks[idx].copy()
                chunk["similarity_score"] = float(score)
                results.append(chunk)

        return results

embedding_service = EmbeddingService()