# 🛡️ Remix KRED — AI-Powered Sovereign Credential Wallet & Intelligent Document Synthesis

---

## 📌 Project Title
**Remix KRED: Sovereign Credential Intelligence & Document Synthesis Platform**  
*(AI-Powered Sovereign Credential Wallet)*

---

## 🎯 Target Audience

Kred is engineered for individuals and teams who manage critical credentials, academic records, professional certifications, and high-stakes application packages, requiring verified, executive-grade document synthesis without compromising privacy:

1. **Students & University Applicants**
   - Preparing high-stakes university admissions, scholarship applications, and coursework blueprints.
   - Requiring degree equivalency audits (WES, UK ENIC, ECTS), transcript parsing, GPA conversions, and customized semester study plans.
   - Generating subject-specific interactive study flashcards with formula breakdowns and active recall.

2. **Job Seekers & Global Professionals (Engineers, Designers, Researchers)**
   - Crafting ATS-optimized technical CVs/Resumes and Product Design case-study portfolios tailored to specific job postings and seniority levels.
   - Assembling certified credential portfolios, proof of experience, and personalized cover letters/statements of purpose.

3. **Freelancers, Independent Consultants & Creative Studios**
   - Generating professional itemized invoices, payment receipts, attestation statements, and official business letterheads.
   - Managing verified service certificates and portfolio exhibits.

4. **Entrepreneurs & Startup Founders**
   - Generating 16:9 executive pitch decks (Problem, Solution, Market Opportunity, Architecture, Traction, Financials, and The Ask).
   - Exporting structured slide decks in Grid View or Presenter Mode.

5. **Educators, Certifiers & Academic Institutions**
   - Issuing verified completion certificates, achievement badges, and modular curriculum rubrics.

---

## 💻 Tech Stack Used

### 🎨 Frontend Architecture
- **Framework**: [React 19](https://react.dev/) (Single Page Application architecture with functional components and modern hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type checking and interface safety)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Utility-first CSS, custom design tokens, dark/light contrast, and responsive viewports)
- **Icons**: [Lucide React](https://lucide.dev/) (Lucide Iconography system for clean UI elements)
- **Animation & Visuals**:
  - [Motion (Framer Motion)](https://motion.dev/) for smooth interface transitions and modal overlays
  - [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti) for celebratory milestone completion effects
- **Markdown & Content Parsing**: [Marked](https://marked.js.org/) (High-performance Markdown parser for structured deliverables)

### ⚙️ Backend & Runtime
- **Server**: [Express.js 4](https://expressjs.com/) running on [Node.js](https://nodejs.org/) with [tsx](https://github.com/privatenumber/tsx) runtime execution
- **Build Tool & Bundler**: [Vite 8](https://vitejs.dev/) with `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Development Proxy**: Vite middlewares mounted in Express for unified full-stack server and API endpoints

### 🤖 AI & LLM Neural Intelligence
- **Google Gen AI SDK**: [`@google/genai`](https://www.npmjs.com/package/@google/genai) (`gemini-2.5-flash`, `gemini-2.5-pro`)
- **NVIDIA NIM Inference Engine**: Multi-tier model routing supporting:
  - `meta/llama-3.3-70b-instruct`
  - `nvidia/llama-3.1-nemotron-70b-instruct`
  - `qwen/qwen2.5-72b-instruct`
  - `deepseek-ai/deepseek-r1`
- **Autonomous Clarification Engine**: Multi-step sequential questionnaire logic prompting users for topics, seniority, design formats, and constraints prior to document generation.
- **Web Grounding**: Real-time DuckDuckGo search integration for up-to-date credential standards, admissions requirements, and industry benchmarks.

### 🔐 Storage & Sovereign Security
- **Local-First Client Enclave**: IndexedDB via Dexie / LocalStorage for local-first credential vault storage.
- **Client-Side Cryptography**: Web Crypto API (`AES-256-GCM`) for client-side encryption of user files and certificates.
- **Cloud & Auth Integration**: Firebase SDK 12 (`firebase/app`, `firebase/firestore`, `firebase/auth`) for cloud sync and secure authentication rules.

### 📄 Document Synthesis & Canvas Engine
- **Kred Canvas Document Viewer**: Custom interactive dual-mode canvas supporting:
  - 🗂️ **Interactive Flashcards** (3D CSS flip animations, formula renderers, mastery filters)
  - 📄 **ATS-Optimized & Executive CVs/Resumes** (Structured sections, timeline badges, skill tags)
  - 📊 **16:9 Presentation Slides & Pitch Decks** (Grid overview and Presenter Mode)
  - 📜 **Formal Completion Certificates** (Gold border seal, signature blocks, verification hashes)
  - 🧾 **Itemized Invoices & Billing Receipts** (Auto-calculated subtotals, tax rows, payment instructions)
  - ✉️ **Executive Business Letterheads & Cover Letters** (Corporate headers, reference lines, formal sign-offs)
- **Template Compatibility**: Direct formatting support for uploaded HTML, DOCX, and XLSX templates (`Flashcards Template.html`, `CV_Resume_Template.docx`, `Certificate_Template.docx`, `Invoice_and_Receipt_Template.xlsx`, `Business_Letterhead_Template.docx`).

---

## 🚀 Key Workflows

1. **Autonomous Guided Clarification**: Before generating deliverable documents, Kred asks relevant multi-step questions to collect exact user preferences and specifications.
2. **Context-Aware Synthesis**: Synthesizes structured markdown and interactive components only after all preferences have been finalized.
3. **Interactive Canvas Preview**: One-click opening into the Kred Canvas with real-time editing, live previewing, and export options.
4. **Sovereign Privacy**: Zero telemetry, zero server-side harvesting of personal document archives.
