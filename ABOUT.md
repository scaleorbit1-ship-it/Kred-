# 🛡️ Kred — Sovereign Credential Intelligence & Document Synthesis Platform

> **Decentralized, Client-Side Encrypted Academic & Professional Credential Management, Autonomous AI Verification, and Production Document Synthesis.**

---

## 🌟 What is Kred?

**Kred** is a next-generation Sovereign Credential Intelligence platform designed for students, researchers, engineers, academics, and global professionals. It bridges the gap between verified real-world achievements and high-stakes opportunities (university admissions, scholarship applications, global engineering hiring, and enterprise contracting).

Instead of relying on insecure cloud file uploads or static mock templates, Kred provides:
1. **Sovereign Client-Side Encryption (AES-256-GCM / Web Crypto API)**: Your diplomas, transcripts, licenses, IDs, and recommendation letters are encrypted directly on your local device before being stored in your browser's private indexed storage (Dexie/IndexedDB).
2. **Autonomous Multi-Tier AI Intelligence**: Powered by high-parameter **NVIDIA NIM** neural models (`meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`, `qwen/qwen2.5-72b-instruct`) alongside Google Gemini models (`gemini-3.8-flash`, `gemini-3.1-pro-preview`), grounded by real-time DuckDuckGo web verification.
3. **Claude-Style Interactive Preview Canvas**: Live document synthesis that renders production-ready, executive-grade deliverables (ATS-optimized CVs, 16:9 Pitch Decks, Interactive Study Flashcards, Academic Study Plans, Coursework Blueprints, Invoices, and Cover Letters) formatted according to the official `kred.` design system.
4. **Zero-Knowledge Proof Attestation Engine**: Cryptographically audits prerequisites, GPA conversions (WES, UK ENIC, ECTS), module credit hours, and language waivers without leaking private personal data.

---

## 🚀 Key Features & Capabilities

### 1. 🗄️ Sovereign Document Vault & Verification Enclave
- **Local-First Security**: Credentials remain under user sovereignty. Zero telemetry or server-side document harvesting.
- **Automated Metadata Extraction**: Instantly parses institution names, degree classifications, CGPA/marks, credit hours, and issuance dates.
- **Document Tagging in Chat (`@` Mention)**: Type `@` anywhere in the assistant chat to tag specific credentials from your vault for targeted reasoning.

### 2. 🧠 Sovereign Reasoning Layer & Interactive Intake Forms
- **Task Intent Classification**: Automatically distinguishes between:
  - 🗺️ **Student Study Plans & Academic Roadmaps** (multi-phase sprints, literature reviews, lab milestones, examination defense).
  - 💼 **Executive Curriculum Vitae (CV)** (ATS-optimized engineering layout vs. Product Designer case-study layout).
  - 📊 **16:9 Presentation Slides & Pitch Decks** (Title, Problem, Market Size, Product Architecture, Team, Quote, and The Ask).
  - 🗂️ **Interactive Study Flashcards** (Tappable flip cards with prompts, verified explanations, key formulas, and difficulty filters).
  - ✍️ **Application Statements of Purpose & Cover Letters** (Targeted to university admissions committees or hiring managers).
  - 🧾 **Client Invoices & Attestation Statements** (Itemized tables, net terms, and verification badges).
- **Missing Information Detection**: If critical parameters (timeline, subject area, target position, or academic level) are omitted, the AI displays a clean interactive form directly in the chat to gather missing details before synthesis.

### 3. 🎨 Production Canvas Document Viewer
- **Dual View Modes for Slides**:
  - **Grid View**: Clean 16:9 responsive overview of all deck slides with left brass accent bars (`#C9A24C`), dark ink typography (`#221F2B`), and warm paper cards (`#FBF9F4`).
  - **Present Mode**: Interactive single-slide deck viewer with keyboard shortcuts, slide-by-slide progress, and presenter notes.
- **Interactive Flashcards**: Flip animation on click, formula highlights, topic badges, and progress counters.
- **ATS-Optimized & Product Designer CVs**: Real typographic hierarchy (Space Grotesk + Source Serif 4 + Inter) with company timeline entries and pill skill tags.
- **One-Click Export**: Download as pristine Markdown (`.md`) or export straight to PDF with print-optimized styling.

### 4. 🌐 Real-Time Web Grounding (DuckDuckGo Engine)
- Integrated DuckDuckGo search pipeline to verify live 2026 university admissions deadlines, visa regulations, salary benchmarks, and academic equivalency standards.

---

## 🏗️ Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Marked Parser |
| **Local Database & Storage** | Dexie.js (IndexedDB), LocalStorage, Web Crypto API (AES-256-GCM) |
| **Backend & Dev Server** | Express.js, TypeScript (`tsx`), Vite Server Middlewares |
| **AI Neural Engine (Exclusive)** | NVIDIA NIM API (`meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`, `meta/llama-3.1-70b-instruct`, `qwen/qwen2.5-72b-instruct`, `deepseek-ai/deepseek-r1`) |
| **Search Engine** | DuckDuckGo Instant Answer & HTML Scraping API |

---

## 📋 Example User Commands

- *"Create a 16:9 pitch deck for my software startup"* ➔ Generates the 7-slide presentation deck and opens in the Canvas.
- *"Generate study flashcards for distributed systems and CAP theorem"* ➔ Launches interactive flip cards.
- *"Help me make a student study plan"* ➔ Displays the intake form, reasons over parameters, and synthesizes the week-by-week roadmap.
- *"Build an ATS-optimized CV from my Paystack & Flutterwave credentials"* ➔ Synthesizes executive CV with experience timeline.
- *"Write an invoice for Kameleon Studio design services"* ➔ Generates `#INV-0091` invoice table.
- *"Audit my degree for UK ENIC / WES equivalence"* ➔ Compares coursework credits against international standards.

---

## 🔒 Privacy & Sovereignty Guarantee

All user documents and private attestations are stored locally in the client browser enclave. AI requests transmit only the user's prompt and optional tagged credential context over TLS to the intelligence engine, ensuring zero data retention and complete cryptographic sovereignty.

© 2026 Kred Technologies. All rights reserved.
