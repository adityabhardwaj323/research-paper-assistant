from google import genai
import hashlib
import json
from typing import List, Dict

# 🔥 Toggle this
DEMO_MODE = True   # 👉 Set False later when Gemini works

GEMINI_API_KEY = "YOUR_API_KEY_HERE"

client = genai.Client(api_key=GEMINI_API_KEY)


class LLMService:

    def __init__(self):
        self.cache = {}
        print("LLM Service initialized (Demo Mode)" if DEMO_MODE else "LLM Service initialized (Gemini)")

    def _cache_key(self, prompt: str) -> str:
        return hashlib.sha256(prompt.encode()).hexdigest()

    def _call(self, prompt: str) -> str:
        # ✅ DEMO MODE
        if DEMO_MODE:
            return self._mock_response(prompt)

        # ✅ CACHE
        key = self._cache_key(prompt)
        if key in self.cache:
            print("Cache hit")
            return self.cache[key]

        # ✅ GEMINI CALL
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        result = response.text
        self.cache[key] = result
        return result

    def _parse_json(self, text: str) -> Dict:
        text = text.strip()

        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])

        return json.loads(text)

    # 🔥 MOCK RESPONSES (FOR DEMO)
    def _mock_response(self, prompt: str) -> str:

        if "Score this research paper" in prompt:
            return json.dumps({
                "scores": {
                    "novelty": {"score": 7, "reasoning": "The idea shows moderate originality."},
                    "technical_depth": {"score": 7, "reasoning": "The methodology is technically sound."},
                    "clarity": {"score": 8, "reasoning": "The paper is well-structured and easy to understand."},
                    "practical_impact": {"score": 6, "reasoning": "The real-world applicability is moderate."}
                },
                "overall_score": 7.0,
                "verdict": "This paper presents a solid contribution with reasonable novelty and clarity.",
                "strengths": ["Clear methodology", "Structured explanation"],
                "weaknesses": ["Limited experimental validation", "Scope can be expanded"]
            })

        elif "Analyze this research paper" in prompt:
            return json.dumps({
                "title": "AI-Based Research Paper Analysis System",
                "problem_statement": {
                    "core_problem": "Manual analysis of research papers is time-consuming.",
                    "motivation": "Automate understanding of complex research papers.",
                    "gap_addressed": "Lack of efficient automated summarization tools."
                },
                "methodology": {
                    "approach": "Uses NLP, embeddings, and retrieval-based methods.",
                    "key_components": ["PDF extraction", "FAISS indexing", "LLM analysis"],
                    "novelty": "Integration of retrieval and structured AI analysis."
                },
                "results": {
                    "key_findings": ["Faster analysis", "Improved understanding"],
                    "metrics": ["Efficiency", "Accuracy"],
                    "comparisons": "Performs better than manual reading in speed."
                },
                "limitations": ["Limited dataset", "Depends on input quality"],
                "future_scope": ["Improve model accuracy", "Expand dataset"],
                "key_contributions": ["Automation of research understanding", "Structured insights"],
                "keywords": ["AI", "NLP", "RAG", "Research", "Automation"]
            })

        else:
            return "This is a demo response based on the research paper context."

    # 🔥 ANALYSIS
    def analyze_paper(self, paper_text: str) -> Dict:
        truncated = paper_text[:10000]

        prompt = f"""You are an expert research paper analyst.
Analyze this research paper and return ONLY a JSON object:

{{
  "title": "paper title here",
  "problem_statement": {{
    "core_problem": "",
    "motivation": "",
    "gap_addressed": ""
  }},
  "methodology": {{
    "approach": "",
    "key_components": [],
    "novelty": ""
  }},
  "results": {{
    "key_findings": [],
    "metrics": [],
    "comparisons": ""
  }},
  "limitations": [],
  "future_scope": [],
  "key_contributions": [],
  "keywords": []
}}

PAPER TEXT:
{truncated}

Return valid JSON only.
"""

        response = self._call(prompt)
        return self._parse_json(response)

    # 🔥 SCORING
    def score_paper(self, analysis: Dict) -> Dict:
        prompt = f"""You are a senior academic reviewer.
Score this research paper analysis and return ONLY JSON:

{{
  "scores": {{
    "novelty": {{"score": 7, "reasoning": ""}},
    "technical_depth": {{"score": 7, "reasoning": ""}},
    "clarity": {{"score": 7, "reasoning": ""}},
    "practical_impact": {{"score": 7, "reasoning": ""}}
  }},
  "overall_score": 7.0,
  "verdict": "",
  "strengths": [],
  "weaknesses": []
}}

ANALYSIS:
{json.dumps(analysis, indent=2)}

Return valid JSON only.
"""

        response = self._call(prompt)
        return self._parse_json(response)

    # 🔥 CHAT WITH PAPER
    def chat_with_paper(
        self,
        question: str,
        context_chunks: List[Dict],
        conversation_history: List[Dict]
    ) -> Dict:

        context = "\n\n".join([chunk["text"] for chunk in context_chunks])

        prompt = f"""Answer based only on the given research paper context.

CONTEXT:
{context}

QUESTION:
{question}
"""

        response = self._call(prompt)

        return {
            "answer": response,
            "sources": context_chunks,
            "confidence": "high" if context_chunks else "low"
        }


llm_service = LLMService()