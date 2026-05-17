import os
import io
import json
import re
import base64
import httpx
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
# CRITICAL FIX: dotenv ko import kiya
from dotenv import load_dotenv

# CRITICAL FIX: Isko call karte hi Python .env file se saari keys system environment mein load kar dega
load_dotenv()

app = FastAPI(title="NeuroLens High-Availability Router OS", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API KEYS & HF SPACES CONFIGURATION ---
# Agar .env mein key nahi mili, toh defaults empty string rahenge taaki error handling check ho sake
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Hugging Face Spaces endpoints (Production configuration)
HF_SENTIMENT_SPACE_URL = os.getenv("HF_SENTIMENT_SPACE_URL", "")
HF_VISION_SPACE_URL = os.getenv("HF_VISION_SPACE_URL", "")

# --- SCHEMAS ---
class VisionRequest(BaseModel):
    image_base64: str

class SentimentRequest(BaseModel):
    text: str

class ARTranslateRequest(BaseModel):
    image_base64: str

# --- UTILS ---
def clean_base64(b64: str) -> str:
    if "base64," in b64:
        return b64.split("base64,")[1]
    return b64

# --- ENDPOINTS WITH MULTI-TIER FALLBACKS ---

@app.post("/sentiment")
async def analyze_sentiment(request: SentimentRequest):
    print("\n>>> [SENTIMENT ROUTER] Decoding Request...")
    
    system_prompt = (
        "You are the NeuroLens Linguistic Engine. Perform a highly detailed, sophisticated semantic "
        "and emotional analysis of the provided text. Do NOT use JSON. Write a multi-paragraph technical "
        "report (approx 600 words/tokens) covering nuances, intent, and hidden emotional trajectories. "
        "Total response must be less than 5000 tokens."
    )

    async with httpx.AsyncClient() as client:
        # TIER 1: Direct Groq Console (Llama 3.3 70B)
        try:
            print("Hitting Tier 1: Groq Cloud...")
            groq_res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.text}
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.8
                },
                timeout=10.0
            )
            if groq_res.status_code == 200:
                return {"analysis": groq_res.json()["choices"][0]["message"]["content"], "engine_source": "Groq Cloud (Llama-70B)"}
        except Exception:
            print("Groq Tier 1 failed or rate limited. Switching to Tier 2 OpenRouter Free Pool...")

        # TIER 2: OpenRouter Auto-Router Pool (openrouter/free)
        try:
            print("Hitting Tier 2: OpenRouter Free Pool...")
            or_res = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "openrouter/free",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.text}
                    ]
                },
                timeout=12.0
            )
            if or_res.status_code == 200:
                return {"analysis": or_res.json()["choices"][0]["message"]["content"], "engine_source": "OpenRouter Auto-Free Balance"}
        except Exception:
            print("Tier 2 Free Pool Exhausted. Route switching to Tier 3 Hugging Face Space...")

        # TIER 3: Hugging Face Spaces (Your Hosted Llama-3.2-1B)
        try:
            print("Hitting Tier 3 Fallback: Hugging Face Cloud Storage...")
            hf_res = await client.post(
                f"{HF_SENTIMENT_SPACE_URL}/analyze",
                json={"text": request.text},
                timeout=30.0
            )
            if hf_res.status_code == 200:
                return {"analysis": hf_res.json().get("analysis", hf_res.text), "engine_source": "Hugging Face Space (Llama-1B Backup)"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"All systems clusters exhausted: {str(e)}")


@app.post("/vision")
async def analyze_vision(request: VisionRequest):
    print("\n>>> [VISION ROUTER] Processing Image...")
    system_prompt = "Analyze this image in deep technical detail. Describe main subjects, composition, and anomalies. Response must be less than 5000 tokens."
    raw_b64 = clean_base64(request.image_base64)

    async with httpx.AsyncClient() as client:
        # TIER 1: Google AI Studio Direct (Gemini 1.5 Flash Free Tier)
        try:
            print("Hitting Tier 1: Google AI Studio...")
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            gemini_res = await client.post(
                gemini_url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [
                            {"text": system_prompt},
                            {"inline_data": {"mime_type": "image/jpeg", "data": raw_b64}}
                        ]
                    }]
                },
                timeout=15.0
            )
            if gemini_res.status_code == 200:
                return {"description": gemini_res.json()["candidates"][0]["content"]["parts"][0]["text"], "engine_source": "Google AI Studio (Gemini Flash)"}
        except Exception:
            print("Gemini Flash Tier 1 failed. Switching to OpenRouter Multimodal Pool...")

        # TIER 2: OpenRouter Dynamic Free Multimodal Pool
        try:
            print("Hitting Tier 2: OpenRouter Vision...")
            or_res = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "openrouter/free",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": system_prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{raw_b64}"}}
                        ]
                    }]
                },
                timeout=20.0
            )
            if or_res.status_code == 200:
                return {"description": or_res.json()["choices"][0]["message"]["content"], "engine_source": "OpenRouter Vision Pool"}
        except Exception:
            print("OpenRouter Vision failed. Redirecting to Tier 3 Hugging Face Qwen-VL Matrix...")

        # TIER 3: Hugging Face Spaces (Your Hosted Qwen2-VL-2B)
        try:
            print("Hitting Tier 3 Fallback: Hugging Face Vision Space...")
            hf_res = await client.post(
                f"{HF_VISION_SPACE_URL}/analyze",
                json={"image_base64": raw_b64},
                timeout=45.0
            )
            if hf_res.status_code == 200:
                return {"description": hf_res.json().get("description", hf_res.text), "engine_source": "Hugging Face Space (Qwen2-VL Backup)"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"All vision matrices collapsed: {str(e)}")


@app.post("/translate-ar")
async def translate_ar(request: ARTranslateRequest):
    print("\n>>> [AR TRANSLATOR] Scanning Matrix Data...")
    prompt = "Detect text and translate to English. Use <|box_2d|> tags. Output boundaries clearly."
    raw_b64 = clean_base64(request.image_base64)

    async with httpx.AsyncClient() as client:
        # TIER 1: Google AI Studio Direct (Gemini Flash Free Tier)
        try:
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            gemini_res = await client.post(
                gemini_url,
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}, {"inline_data": {"mime_type": "image/jpeg", "data": raw_b64}}]}]},
                timeout=15.0
            )
            if gemini_res.status_code == 200:
                return {"raw": gemini_res.json()["candidates"][0]["content"]["parts"][0]["text"], "engine_source": "Google AI Studio (OCR)"}
        except Exception:
            print("AR Tier 1 Failed. Swapping to OpenRouter free pool...")

        # TIER 2: OpenRouter Dynamic Free Pool
        try:
            or_res = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}", "Content-Type": "application/json"},
                json={"model": "openrouter/free", "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{raw_b64}"}}]}]},
                timeout=20.0
            )
            if or_res.status_code == 200:
                return {"raw": or_res.json()["choices"][0]["message"]["content"], "engine_source": "OpenRouter OCR Pool"}
        except Exception:
            print("AR Tier 2 Failed. Falling back to Hugging Face Qwen Space...")

        # TIER 3: Hugging Face Spaces (Your Hosted Qwen2-VL-2B OCR Logic)
        try:
            hf_res = await client.post(
                f"{HF_VISION_SPACE_URL}/translate",
                json={"image_base64": raw_b64},
                timeout=45.0
            )
            if hf_res.status_code == 200:
                return {"raw": hf_res.json().get("raw", hf_res.text), "engine_source": "Hugging Face Space (Qwen2-VL Backup)"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"All translation frameworks exhausted: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Env dynamic port loading for cloud deployment platforms like Render
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)