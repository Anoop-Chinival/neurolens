# 🧠 NeuroLens: High-Availability Router OS (v3.0.0)

NeuroLens is a production-grade, enterprise-ready **Multi-Tier High-Availability AI Routing System**. Built with a zero-downtime philosophy, the platform intelligently handles complex linguistic metrics, multi-modal semantic mapping, and real-time Augmented Reality (AR) text transformations. 

When standard API configurations hit strict rate limits or undergo temporary infrastructure blackout, NeuroLens instantly executes dynamic routing algorithms across three separate failover layers, providing continuous data processing without a single drop in application state.

---

## 🛠️ System Architecture & 3-Tier Failover Matrix

The core backend functions as an autonomous proxy gateway, evaluating system latency and HTTP status distribution rules on every payload transaction:

* **Tier 1 (Primary Cloud Cluster):** Direct native infrastructure integration via **Groq Cloud (Llama 3.3 70B)** providing ultra-low-latency linguistic parsing, and **Google AI Studio (Gemini 1.5 Flash)** handling multimodal structural lookups.
* **Tier 2 (Secondary Resiliency Pool):** Automatic diversion pathing into the **OpenRouter Free Pool** providing redundant multi-model cross-evaluations.
* **Tier 3 (Tertiary Fault-Tolerant Layer):** Isolated, custom-built Docker microservices hosted natively on **Hugging Face Spaces Cloud Platforms** orchestrating serverless edge inference using **Llama-3.2-1B-Instruct** and **Qwen2-VL-7B-Instruct**.

---

## 📂 Complete File Structure Architecture

Below is the complete blueprint of the NeuroLens workspace directory mapping all software layers from the edge microservices to visual layouts:

```text
neurolens/
├── backend/
│   ├── venv/                        # Isolated Python execution binaries and dependencies
│   ├── .env                         # Production environment keys (Groq, Gemini, OpenRouter) [Git-Ignored]
│   ├── .gitignore                   # Spec file blocking systemic file caches & environmental variables
│   ├── main.py                      # Core FastAPI High-Availability AI Routing Engine
│   └── requirements.txt             # Backend system dependency configurations
├── frontend/
│   ├── node_modules/                # Local node package workspace dependencies
│   ├── src/
│   │   ├── components/
│   │   │   ├── ErrorMessage.tsx     # Graceful UI exception layout handling dynamic failover warnings
│   │   │   ├── LiveTranslator.tsx   # Multimodal viewport displaying translated real-time matrices
│   │   │   ├── MLExplorer.tsx      # Analytical diagnostic panel reporting infrastructure health
│   │   │   ├── SentimentAnalyzer.tsx# Complex multi-paragraph linguistic analysis text dashboard
│   │   │   └── VisionAnalyzer.tsx   # Multimodal interface executing comprehensive telemetry on graphics
│   │   ├── lib/
│   │   │   └── utils.ts             # Modular optimization utilities for dynamic UI processing
│   │   ├── services/
│   │   │   └── localAiService.ts    # Frontend API orchestration bridge handling async server calls
│   │   ├── App.tsx                  # Root component layout organizing visual workspace states
│   │   ├── index.css                # Global styling layer powered by design system primitives
│   │   └── main.tsx                 # DOM mounting execution script for client compilation
│   ├── .env                         # Client base runtime configuration pointing to api gateways
│   ├── .gitignore                   # Prevents distribution files and client secrets from tracking
│   ├── index.html                   # Single-Page Application core HTML entry framework
│   ├── package-lock.json            # Cryptographic lock file enforcing exact node module parity
│   ├── package.json                 # Core UI project dependency manifest
│   └── vite.config.ts               # Vite bundling engine configuration settings
├── node_modules/                    # Workspace root module dependencies 
├── Launching Neurolens on Mac.txt   # Development scratchpad containing macOS shell logs & setup tracks
├── README.md                        # Project technical operational manual and overview document
└── tsconfig.json                    # Strict TypeScript type-checking configuration workspace