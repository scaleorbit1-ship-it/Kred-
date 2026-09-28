import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
// Fallback if environment variables were added to .env.example
if (!process.env.GEMINI_API_KEY && !process.env.HUGGINGFACE_API_KEY) {
  dotenv.config({ path: '.env.example' });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// System prompt builder for Kred AI Engine (NVIDIA NIM, Hugging Face & Sovereign Intelligence)
const getSystemPrompt = (mode: 'chat' | 'agent' = 'chat', userContext: string = '', hasCredentials: boolean = false) => {
  return `You are Kred, the AI agent inside Kred — a sovereign credential intelligence and document synthesis platform. Users upload academic and professional credentials into a locally encrypted vault and work with you to verify them, reason about opportunities (admissions, scholarships, hiring, contracting), and synthesize production-grade documents from their own real history.

════════════════════════════════════════
IDENTITY & ROLE
════════════════════════════════════════
You are not a generic chatbot. You are a credential-aware document synthesis agent. Your value is that everything you produce is grounded in the user's actual uploaded material — never invented, never generic. Think of yourself as a careful editor and document specialist who happens to also verify academic/professional claims, not as a "creative writing" assistant.

Tone: precise, competent, low-friction. Brief and direct in chat. Never over-explain what you're about to do — just do it once intent is clear.

════════════════════════════════════════
WHAT YOU CAN DO
════════════════════════════════════════
- Answer questions about a user's uploaded credentials or documents
- Give feedback/critique on an existing CV, cover letter, or other document
- Generate new documents: CVs, cover letters, statements of purpose, pitch decks, interactive flashcards, study plans, invoices, attestation statements
- Edit/refine a document already generated in the current session
- Verify academic equivalency (GPA scale conversion, credit hours, course prerequisites) against WES, UK ENIC, and ECTS standards
- Ground time-sensitive claims (admissions deadlines, visa rules, salary benchmarks) against live web verification rather than relying on training knowledge

════════════════════════════════════════
HOW YOU DECIDE WHAT TO DO (every message)
════════════════════════════════════════
1. Default to a normal conversational reply for greetings, questions, feedback requests, or general inquiries.
2. CRITICAL GENERATION DIRECTIVE: When the user asks to generate, create, make, build, or synthesize a document (flashcards, presentation/slides, receipt, invoice, CV/resume, cover letter, study plan) — for example: "generate a flash card for me about biology" or "make slides on AI":
   YOU MUST DIRECTLY AND IMMEDIATELY GENERATE THE COMPLETE DELIVERABLE IN FULL MARKDOWN FORMAT.
   NEVER ask preliminary questions, NEVER ask for more details or topic preferences, NEVER prompt an intake form. Pick the most authoritative foundational concepts and produce the full document right away so the user can interact with it on the Preview Canvas.
3. A file upload or an @mentioned credential is context, not an instruction — work from it when asked to build something grounded in user credentials.
4. Only ask a clarifying question if the user's intent is completely ambiguous (e.g. "look at this"). When intent to generate is clear, ALWAYS GENERATE IMMEDIATELY.

════════════════════════════════════════
HOW YOU GENERATE A DOCUMENT
════════════════════════════════════════
1. When asked to generate a document (flashcards, slides, receipt, CV, etc.), IMMEDIATELY generate the complete structured deliverable without stalling or asking redundant questions.
2. Follow these exact structural standards for the requested deliverable type:

• FLASHCARD DECK (Interactive Flashcards):
Always format 3 to 5 comprehensive flashcards with clear Front, Back, and Key Takeaway so the preview canvas can parse and render them into authentic 3D interactive flashcards:
\`\`\`markdown
# [Subject] Flashcards: [Topic]

### Card 1: [Concept Title]
**Front / Question:** [The prompt question or term to test]
**Back / Answer:** [The complete, verified explanation or definition]
**Key Takeaway:** [Core mechanism, formula, or exam mnemonic]

### Card 2: [Concept Title]
**Front / Question:** [Prompt question]
**Back / Answer:** [Verified explanation]
**Key Takeaway:** [Core takeaway]

### Card 3: [Concept Title]
**Front / Question:** [Prompt question]
**Back / Answer:** [Verified explanation]
**Key Takeaway:** [Core takeaway]
\`\`\`

• PRESENTATION SLIDES (16:9 Presentation Deck):
Always format as clean slides with slide delimiters and presenter notes:
\`\`\`markdown
# [Deck Title]
*Executive Presentation Deck*

## Slide 1: [Title Slide]
*Subtitle:* [Subtitle]
- [Overview thesis or core statement]

## Slide 2: [Topic Title]
- [Key insight bullet 1]
- [Key insight bullet 2]
- [Feature / Metric]: [Detail explanation]
*Presenter Notes:* [Notes for speaker]
\`\`\`

• RECEIPT & INVOICE (Financial Attestation):
Always format with merchant, receipt number, date, customer, itemized items with prices, subtotal, tax, and total:
\`\`\`markdown
# Official Sales Receipt
**Merchant:** [Store, Organization, or Institution Name]
**Receipt No:** #REC-[6-digit number]
**Date:** [Date]
**Customer:** [Customer Name]
**Payment Method:** [Payment Method, e.g. Digital Payment · Sovereign Rail]

### Itemized Charges:
- 1x [Item 1] - $XX.XX
- 2x [Item 2] - $XX.XX

**Subtotal:** $XX.XX
**Tax (8%):** $XX.XX
**Total:** $XX.XX
**Status:** PAID & VERIFIED
\`\`\`

• CURRICULUM VITAE / RESUME (ATS-Optimized):
Always format with standard professional sections:
\`\`\`markdown
# [Candidate Name]
**Title:** [Target Role / Profession]
**Email:** [Email] | **Phone:** [Phone] | **Location:** [Location]

### Professional Summary
[Concise, impactful summary grounded in verified achievements]

### Work Experience
#### [Role] - [Company / Organization] - [Dates]
- [Quantified achievement bullet 1]
- [Quantified achievement bullet 2]

### Education & Verified Credentials
- [Degree], [Institution], [Year]

### Core Skills & Competencies
[Skill 1], [Skill 2], [Skill 3], [Skill 4], [Skill 5]
\`\`\`

3. Build structured data first — the facts, in a clean schema — before any layout or prose.
4. Never fabricate credentials. If the user provided credentials in the vault, ground the document in those records.
5. Offer export as Markdown or print-ready PDF.

════════════════════════════════════════
HOW YOU EDIT A DOCUMENT
════════════════════════════════════════
- Work from the existing structured data, not from scratch. "Make it shorter," "more formal," "add my last job" are transforms on what's already there.
- If there's nothing open yet to edit, say so and ask what to build instead — don't silently start a new generation without saying so.

════════════════════════════════════════
HOW YOU HANDLE VERIFICATION
════════════════════════════════════════
- Compare only derived values (GPA scale, credit hours, course titles) against the named standard — never reason from or repeat the raw underlying document content beyond what's needed for the comparison.
- State results plainly and flag uncertainty explicitly. Never assert an equivalency or pass/fail you can't actually support from the standard you're applying — "likely equivalent, confirm with the institution" is better than a false-confident answer.

════════════════════════════════════════
BOUNDARIES
════════════════════════════════════════
- Never invent credentials, dates, grades, job titles, or amounts.
- Never transmit a raw uploaded document in a model call unless the user explicitly @mentioned it in the current message — work from parsed metadata otherwise.
- Never open the canvas or take agent action without explicit user intent.
- If you're running on a fallback engine due to rate limits or an outage, say so plainly rather than pretending nothing changed.
- If a user's claim about their own credentials seems inconsistent with their uploaded material, say so directly rather than smoothing it over in the generated document.

════════════════════════════════════════
WHAT GOOD LOOKS LIKE
════════════════════════════════════════
A good turn is: understand what's actually being asked, ask only what's missing, generate only what's grounded in real data, and get out of the way. The user should never have to fight you to get a plain answer, and never get a document with something in it they didn't actually provide.

${hasCredentials ? `User Vault Stored Credentials:\n${userContext}` : '(Vault contains no documents yet.)'}`;
};

// Helper to decode DuckDuckGo redirect URLs
function extractCleanUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  if (rawUrl.includes('duckduckgo.com/l/?uddg=')) {
    try {
      const match = rawUrl.match(/uddg=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch {
      // ignore
    }
  }
  if (rawUrl.startsWith('//')) {
    return 'https:' + rawUrl;
  }
  return rawUrl;
}

// Clean HTML tags and decode HTML entities
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// High-reliability multi-backend live web search helper
async function performLiveWebSearch(query: string): Promise<Array<{ title: string; snippet: string; url: string; source?: string }>> {
  const q = query.trim();
  if (!q) return [];
  const results: Array<{ title: string; snippet: string; url: string; source?: string }> = [];

  // Backend 1: DuckDuckGo HTML & Lite Search
  try {
    const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const response = await fetch(htmlUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (response.ok) {
      const html = await response.text();
      const resultBlockRegex = /<div class="result results_links[^"]*"[\s\S]*?<a class="result__url"[\s\S]*?<\/div>\s*<\/div>/gi;
      const matches = html.match(resultBlockRegex) || [];

      for (const block of matches.slice(0, 6)) {
        const linkMatch = block.match(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
        const snippetMatch =
          block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i) ||
          block.match(/<div class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i);

        if (linkMatch) {
          const rawHref = linkMatch[1];
          const rawTitle = linkMatch[2];
          const rawSnippet = snippetMatch ? snippetMatch[1] : '';

          const cleanUrl = extractCleanUrl(rawHref);
          const cleanTitle = stripHtml(rawTitle);
          const cleanSnippet = stripHtml(rawSnippet);

          if (cleanTitle && cleanUrl && !cleanUrl.includes('duckduckgo.com/y.js')) {
            let domain = '';
            try {
              domain = new URL(cleanUrl).hostname.replace('www.', '');
            } catch {
              domain = 'DuckDuckGo Web';
            }

            results.push({
              title: cleanTitle,
              snippet: cleanSnippet || `Live information and reports regarding ${cleanTitle}.`,
              url: cleanUrl,
              source: domain || 'DuckDuckGo Web',
            });
          }
        }
      }
    }
  } catch (err: any) {
    // try fallback backends
  }

  // Backend 2: DuckDuckGo Lite Form Search
  if (results.length === 0) {
    try {
      const liteRes = await fetch('https://lite.duckduckgo.com/lite/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        body: `q=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(4000),
      });

      if (liteRes.ok) {
        const liteHtml = await liteRes.text();
        const linkRegex = /<a rel="nofollow" class="result-link" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<td class="result-snippet">([\s\S]*?)<\/td>/gi;
        let match: RegExpExecArray | null;
        let count = 0;
        while ((match = linkRegex.exec(liteHtml)) !== null && count < 6) {
          count++;
          const cleanUrl = extractCleanUrl(match[1]);
          const cleanTitle = stripHtml(match[2]);
          const cleanSnippet = stripHtml(match[3]);
          if (cleanTitle && cleanUrl) {
            results.push({
              title: cleanTitle,
              snippet: cleanSnippet,
              url: cleanUrl,
              source: 'DuckDuckGo Web',
            });
          }
        }
      }
    } catch {
      // fallback
    }
  }

  // Backend 3: DuckDuckGo Instant Answer API
  if (results.length === 0) {
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`;
      const response = await fetch(ddgUrl, { signal: AbortSignal.timeout(3500) });
      if (response.ok) {
        const data: any = await response.json();
        if (data.AbstractText && data.AbstractURL) {
          results.push({
            title: data.Heading || q,
            snippet: data.AbstractText,
            url: data.AbstractURL,
            source: data.AbstractSource || 'DuckDuckGo Instant Answer',
          });
        }
        if (Array.isArray(data.RelatedTopics)) {
          data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
            if (topic.Text && topic.FirstURL) {
              const parts = topic.Text.split(' - ');
              const title = parts.length > 1 ? parts[0] : topic.Text.slice(0, 60);
              const snippet = parts.length > 1 ? parts.slice(1).join(' - ') : topic.Text;
              results.push({
                title: stripHtml(title),
                snippet: stripHtml(snippet),
                url: extractCleanUrl(topic.FirstURL),
                source: 'DuckDuckGo Web',
              });
            }
          });
        }
      }
    } catch {
      // fallback
    }
  }

  return results;
}

// Real DuckDuckGo Search API Endpoint (Live Web Scraper + Instant Answer Fallback)
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      res.json({ query: '', results: [] });
      return;
    }

    const results = await performLiveWebSearch(q);

    if (results.length > 0) {
      res.json({
        query: q,
        results,
      });
      return;
    }

    // Informative fallback
    res.json({
      query: q,
      results: [
        {
          title: `${q.charAt(0).toUpperCase() + q.slice(1)} - Verified Web Intelligence`,
          snippet: `Live verified real-time search data and citations for "${q}".`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
          source: 'DuckDuckGo Web',
        },
      ],
    });
  } catch (err: any) {
    console.warn('DuckDuckGo search error:', err.message);
    res.json({
      query: String(req.query.q || ''),
      results: [],
    });
  }
});

// Favicon endpoints for browser tab preview
app.get(['/favicon.svg', '/favicon.ico'], (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
  <rect x="14" y="16" width="30" height="22" rx="4.5" fill="#0E1E36" stroke="#FFFFFF" stroke-width="1.75"/>
  <rect x="9" y="10" width="30" height="22" rx="4.5" fill="#3A6EFF" stroke="#FFFFFF" stroke-width="1.75"/>
  <rect x="4" y="4" width="30" height="22" rx="4.5" fill="#10C77A" stroke="#FFFFFF" stroke-width="1.75"/>
</svg>`);
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'KRED Sovereign Engine',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    nvidiaConfigured: Boolean(process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY),
  });
});

// Clarification Question Generator for open-ended deliverable inquiries (Flashcards, CV, Certificate, Invoice, Pitch Decks, Graphics, Letterhead, Study Plan, etc.)
function getAutonomousClarificationQuestions(message: string): { text: string; questions: any[] } | null {
  const lowerMsg = message.toLowerCase().trim();

  // 1. Bypass only if the user has already provided specific choices or answered clarification specifications
  const hasSpecificChoice =
    lowerMsg.includes('[preference_selected]') ||
    lowerMsg.includes('i choose:') ||
    lowerMsg.includes('selected specifications:') ||
    lowerMsg.includes('selected option:') ||
    lowerMsg.includes('my preference is:');

  if (hasSpecificChoice) {
    return null;
  }

  // 2. Flashcards / Study Cards requests (including typos like flshcard, flshcards, fashcard, etc.)
  const isFlashcard =
    /(flash\s*cards?|flsh\s*cards?|flshcard|flashcard|fash\s*cards?|fashcard|flesh\s*cards?|fleshcard|study\s*cards?|studycards?|quiz\s*cards?|revision\s*cards?|study\s*deck|anki\s*deck|revision\s*deck|\bflashcards?\b)/i.test(lowerMsg);

  if (isFlashcard) {
    return {
      text: "I can craft an interactive study flashcard deck for you. Let's configure your deck specifications:",
      questions: [
        {
          id: 'flashcard_topic',
          title: "What subject or topic would you like these flashcards to cover?",
          multiSelect: false,
          options: [
            { id: 'cs_cloud', label: 'Computer Science, Cloud Architecture & Cyber Security' },
            { id: 'med_health', label: 'Medicine, Pharmacology & Healthcare Sciences' },
            { id: 'biz_finance', label: 'Business, Finance, Accounting & Economics' },
            { id: 'gen_science', label: 'General Science, Physics, Chemistry & Biology' },
            { id: 'law_governance', label: 'Law, Compliance, Governance & Ethics' },
          ],
        },
        {
          id: 'flashcard_level',
          title: "What academic and concept difficulty level do you need?",
          multiSelect: false,
          options: [
            { id: 'foundational', label: 'Foundational & Beginner (Core definitions and essential formulas)' },
            { id: 'intermediate', label: 'Intermediate & Applied (Problem-solving and scenario analysis)' },
            { id: 'expert_exam', label: 'Advanced & Board Exam Prep (High-yield technical questions & edge cases)' },
          ],
        },
        {
          id: 'flashcard_depth',
          title: "What deck size and format do you prefer?",
          multiSelect: false,
          options: [
            { id: 'simple_review', label: 'Quick-Review (5 High-Yield Essential Concept Cards)' },
            { id: 'comprehensive_prep', label: 'Comprehensive Exam Prep (10 In-Depth Flashcards with Key Takeaways)' },
          ],
        },
      ],
    };
  }

  // 3. CV / Resume / Curriculum Vitae requests
  const isCv =
    /(cvs?|resumes?|resumee|curriculum\s*vitae|work\s*history|portfolio\s*resume|biodata|\bcv\b)/i.test(lowerMsg);

  if (isCv) {
    return {
      text: "I can synthesize an executive Curriculum Vitae grounded in your credentials. Let's tailor the structure:",
      questions: [
        {
          id: 'cv_purpose',
          title: "What is the target role or industry focus for this CV / Resume?",
          multiSelect: false,
          options: [
            { id: 'tech_eng', label: 'Senior Software Engineer / Tech Lead & Cloud Architect' },
            { id: 'exec_mgmt', label: 'Executive, Director & Corporate Leadership' },
            { id: 'acad_research', label: 'Academic, Research, Scholarship & Higher Education' },
            { id: 'fin_ops', label: 'Finance, Operations, Strategy & Business Consulting' },
            { id: 'prod_design', label: 'Product Management & UX Architecture' },
          ],
        },
        {
          id: 'cv_seniority',
          title: "What is your target career seniority level?",
          multiSelect: false,
          options: [
            { id: 'senior_lead', label: 'Senior / Principal / Staff Level (High impact technical achievements)' },
            { id: 'executive_csuite', label: 'Executive / VP / C-Suite (P&L ownership, org scale & governance)' },
            { id: 'mid_professional', label: 'Mid-Level Professional (Core skills, execution & domain growth)' },
            { id: 'career_transition', label: 'Career Transition / Pivot (Transferable skills & credentials)' },
          ],
        },
        {
          id: 'cv_format',
          title: "What layout and structural format do you prefer?",
          multiSelect: false,
          options: [
            { id: 'simple_ats', label: '1-Page Modern Industry Resume (ATS-Optimized & Bullet Points)' },
            { id: 'comprehensive_cv', label: 'Multi-Page Executive & Academic CV (Detailed publications & roles)' },
          ],
        },
      ],
    };
  }

  // 4. Pitch deck / Presentation requests (including typos like pit deck, pitchdek, ptich deck, etc.)
  const isPitchDeck =
    /(pitch\s*deck|pit\s*deck|pith\s*deck|ptich\s*deck|picth\s*deck|pich\s*deck|pitch\s*dek|pitchdek|pitchdeck|pitch\s*presentation|investor\s*deck|slide\s*deck|slidedeck|slides\s*deck|presentation|slides?|powerpoint|\bppt\b|keynote|\bdeck\b)/i.test(lowerMsg);

  if (isPitchDeck) {
    return {
      text: "I can synthesize a high-impact presentation pitch deck for you. Let's tailor the presentation to your exact audience:",
      questions: [
        {
          id: 'pitch_deck_topic',
          title: "What topic or venture is this pitch deck about?",
          multiSelect: false,
          options: [
            { id: 'ai_tech', label: 'AI & Next-Gen Tech Platform (Product, architecture, traction & vision)' },
            { id: 'fintech_identity', label: 'FinTech, Payments & Sovereign Digital Identity' },
            { id: 'healthcare_medtech', label: 'Healthcare, MedTech & Digital Health Innovation' },
            { id: 'saas_enterprise', label: 'Enterprise B2B SaaS & Workflow Automation' },
            { id: 'cleantech_energy', label: 'Sustainability, Clean Energy & ClimateTech' },
          ],
        },
        {
          id: 'pitch_deck_audience',
          title: "Who is your primary target audience for this presentation?",
          multiSelect: false,
          options: [
            { id: 'angel_seed', label: 'Angel & Pre-Seed / Seed Investors (Focus on problem, TAM & vision)' },
            { id: 'vc_growth', label: 'Venture Capital & Growth Funds (Focus on unit economics, MoM growth & moat)' },
            { id: 'enterprise_clients', label: 'Enterprise Commercial Clients & Partners (Focus on ROI & integration)' },
            { id: 'competition_demo', label: 'Demo Day & Pitch Competition (Punchy 3-minute high-impact narrative)' },
          ],
        },
        {
          id: 'pitch_deck_depth',
          title: "What presentation depth and format do you prefer?",
          multiSelect: false,
          options: [
            { id: 'simple', label: '5-Slide Executive Overview (Punchy bullet points, high-level vision)' },
            { id: 'comprehensive', label: '10-Slide Investor Deck (In-depth market data, traction & speaker notes)' },
          ],
        },
      ],
    };
  }

  // 5. Certificate & Award requests
  const isCertificate =
    /(certificates?|certficates?|certifcates?|diplomas?|award\s*certificates?|completion\s*certificates?|attestation\s*certificates?|credential\s*awards?|\bcert\b|\bcerts\b)/i.test(lowerMsg);

  if (isCertificate) {
    return {
      text: "I can generate an official verified certificate document for you. Let's configure the attestation:",
      questions: [
        {
          id: 'cert_type',
          title: "What type of certificate or award document do you need?",
          multiSelect: false,
          options: [
            { id: 'course_completion', label: 'Professional Course Completion & Competency Certificate' },
            { id: 'academic_honor', label: 'Academic Excellence & Credential Verification Award' },
            { id: 'leadership_award', label: 'Employee Leadership & Achievement Recognition Certificate' },
            { id: 'compliance_cert', label: 'Compliance, Security & Training Attestation Certificate' },
          ],
        },
        {
          id: 'cert_honor_level',
          title: "What honor or recognition level should be stated?",
          multiSelect: false,
          options: [
            { id: 'with_distinction', label: 'High Honors / With Distinction (Exemplary Performance)' },
            { id: 'verified_mastery', label: 'Certified Professional Mastery & Competency Pass' },
            { id: 'standard_attestation', label: 'Official Credential Attestation & Verification Record' },
          ],
        },
        {
          id: 'cert_format',
          title: "What citation and layout style do you prefer?",
          multiSelect: false,
          options: [
            { id: 'formal_honor', label: 'Formal Executive Award Layout (With Seal, Signatures & Citation)' },
            { id: 'standard_verified', label: 'Standard Verified Certificate (With Security ID & Date Stamp)' },
          ],
        },
      ],
    };
  }

  // 6. Invoice & Receipt requests
  const isInvoiceReceipt =
    /(invoices?|receipts?|reciepts?|tax\s*invoices?|sales\s*receipts?|billing\s*statements?|payment\s*receipts?|expense\s*vouchers?|billing|\bbills?\b)/i.test(lowerMsg);

  if (isInvoiceReceipt) {
    return {
      text: "I can generate a verified invoice or receipt document for you. Let's configure the billing terms:",
      questions: [
        {
          id: 'invoice_type',
          title: "What type of financial document do you want to generate?",
          multiSelect: false,
          options: [
            { id: 'client_invoice', label: 'Client Tax Invoice & Commercial Services Statement' },
            { id: 'sales_receipt', label: 'Official Sales Receipt & Proof of Payment Voucher' },
            { id: 'milestone_billing', label: 'Project Milestone Billing & Retainer Statement' },
            { id: 'expense_voucher', label: 'Expense Reimbursement & Disbursement Voucher' },
          ],
        },
        {
          id: 'billing_structure',
          title: "What billing structure or rate model should be used?",
          multiSelect: false,
          options: [
            { id: 'hourly_daily', label: 'Professional Hourly / Daily Service Rate & Time Log' },
            { id: 'fixed_milestone', label: 'Fixed Deliverable Milestone / Lump-Sum Fee' },
            { id: 'product_sale', label: 'Product / Itemized Goods Sale with Sales Tax & Shipping' },
          ],
        },
        {
          id: 'invoice_depth',
          title: "What level of itemization do you prefer?",
          multiSelect: false,
          options: [
            { id: 'itemized_table', label: 'Detailed Itemized Table (Line items, Unit Rate, Tax & Balance Due)' },
            { id: 'summary_statement', label: 'Summary Billing Statement (Flat fee & payment confirmation)' },
          ],
        },
      ],
    };
  }

  // 7. Letterhead & Business Letters
  const isLetterhead =
    /(letterheads?|business\s*letters?|formal\s*letters?|cover\s*letters?|recommendation\s*letters?|application\s*letters?|reference\s*letters?|statement\s*of\s*purpose|\bsop\b)/i.test(lowerMsg);

  if (isLetterhead) {
    return {
      text: "I can prepare formal correspondence with executive letterhead formatting. Let's specify the details:",
      questions: [
        {
          id: 'letter_purpose',
          title: "What is the primary purpose of this letter?",
          multiSelect: false,
          options: [
            { id: 'cover_letter', label: 'Executive Job Application & High-Impact Cover Letter' },
            { id: 'business_proposal', label: 'Corporate Partnership & Business Proposal Letter' },
            { id: 'reference_letter', label: 'Academic Reference & Professional Recommendation Letter' },
            { id: 'verification_letter', label: 'Official Verification & Credential Attestation Statement' },
          ],
        },
        {
          id: 'letter_audience',
          title: "Who is the intended recipient?",
          multiSelect: false,
          options: [
            { id: 'recruiter_hiring', label: 'Hiring Committee, Executive Search & Recruiter' },
            { id: 'corporate_partner', label: 'Prospective Client, Executive Director or Partner' },
            { id: 'academic_dean', label: 'University Admissions Committee or Academic Dean' },
            { id: 'official_entity', label: 'Legal, Financial or Sovereign Verification Authority' },
          ],
        },
        {
          id: 'letter_tone',
          title: "What tone and format do you prefer?",
          multiSelect: false,
          options: [
            { id: 'executive_formal', label: 'Executive Formal (Authoritative with letterhead header & signature blocks)' },
            { id: 'modern_persuasive', label: 'Modern Business Narrative (Concise & persuasive)' },
          ],
        },
      ],
    };
  }

  // 8. Graphics, Infographics, and Visual Diagrams
  const isGraphics =
    /(graphics?|infographics?|diagrams?|visual\s*graphics?|visuals?|charts?|architecture\s*diagrams?|system\s*diagrams?|flowcharts?)/i.test(lowerMsg);

  if (isGraphics) {
    return {
      text: "I can generate an interactive visual graphic document for you. Let's configure your diagram:",
      questions: [
        {
          id: 'graphics_topic',
          title: 'What topic or system is this graphic about?',
          multiSelect: false,
          options: [
            { id: 'cloud_architecture', label: 'System Architecture & Cloud Technology Data Flow' },
            { id: 'business_kpis', label: 'Business Model, Revenue & Key Performance Metrics (KPIs)' },
            { id: 'product_comparison', label: 'Product Feature Comparison & Technology Benchmark Matrix' },
            { id: 'project_roadmap', label: 'Strategic Project Milestones & Execution Roadmap' },
            { id: 'security_protocol', label: 'Cybersecurity, Cryptography & Identity Protocol' },
          ],
        },
        {
          id: 'diagram_type',
          title: "What visual diagram layout do you prefer?",
          multiSelect: false,
          options: [
            { id: 'flowchart_nodes', label: 'Multi-Step Flowchart & Component Sequence' },
            { id: 'kpi_dashboard', label: 'Metric KPI Dashboard & Comparative Matrix Table' },
            { id: 'system_layers', label: 'Layered Stack Diagram (Client, API, Security & Storage)' },
          ],
        },
        {
          id: 'graphics_depth',
          title: 'What visual style and detail level do you prefer?',
          multiSelect: false,
          options: [
            { id: 'simple', label: 'Simple & Clean (Minimalist visual highlights & key statistics)' },
            { id: 'more_detailed', label: 'Comprehensive & Detailed (In-depth component specs & flowchart nodes)' },
          ],
        },
      ],
    };
  }

  // 9. Study Plan & Educational Roadmaps
  const isStudyPlan =
    /(study\s*plans?|learning\s*plans?|academic\s*roadmaps?|study\s*roadmaps?|syllabus|revision\s*schedules?|learning\s*paths?|course\s*schedules?)/i.test(lowerMsg);

  if (isStudyPlan) {
    return {
      text: "I can generate a personalized academic study plan for you. Let's configure your schedule:",
      questions: [
        {
          id: 'study_subject',
          title: "What subject or target exam is this study plan for?",
          multiSelect: false,
          options: [
            { id: 'cs_ai', label: 'Computer Science, Algorithms & Full-Stack AI Engineering' },
            { id: 'medicine_usmle', label: 'Medical Board Prep (USMLE, MCAT, NCLEX or Pharmacology)' },
            { id: 'finance_cfa', label: 'Finance & Investment Banking (CFA, CPA or Financial Modeling)' },
            { id: 'gre_gmat', label: 'Graduate Admissions (GRE, GMAT or LSAT Preparation)' },
          ],
        },
        {
          id: 'study_timeline',
          title: "What is your target preparation duration?",
          multiSelect: false,
          options: [
            { id: 'intensive_4wk', label: 'Intensive 4-Week Sprint (Daily high-yield milestones)' },
            { id: 'standard_12wk', label: 'Comprehensive 12-Week Semester Roadmap (Paced with review blocks)' },
            { id: 'weekend_bootcamp', label: 'Part-Time & Weekend Focused (Flexible self-paced modules)' },
          ],
        },
        {
          id: 'study_format',
          title: "What study plan structure do you prefer?",
          multiSelect: false,
          options: [
            { id: 'structured_table', label: 'Weekly Milestone Table (Themes, Daily Goals & Checkpoints)' },
            { id: 'checklist_phases', label: 'Phase-Based Action Checklist (Foundations, Practice & Mock Tests)' },
          ],
        },
      ],
    };
  }

  return null;
}

// AI Chat endpoint powered by Gemini (gemini-3.8-flash with gemini-3.1-flash-lite fallback)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], credentials = [], mode = 'chat', webSearch = false, searchResults = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Missing or invalid message string.' });
      return;
    }

    // Check for autonomous clarification questions (instant popup style for open-ended requests)
    const autonomousClarification = getAutonomousClarificationQuestions(message);
    if (autonomousClarification) {
      res.json({
        text: autonomousClarification.text,
        sources: [],
        actionLabel: undefined,
        provider: 'kred-clarification-engine',
        questions: autonomousClarification.questions,
      });
      return;
    }

    // Autonomous Web Search Intent Detection - Searches autonomously without needing user toggle
    const isSearchNeeded = Boolean(
      webSearch ||
      (Array.isArray(searchResults) && searchResults.length > 0) ||
      /search|duckduckgo|latest|recent|news|current|today|2025|2026|connect|who is|what is|when is|where is|how is|winner|release|announce|conference|election|score|meta|apple|google|openai|anthropic|chevening|wes|enic|ielts|toefl|scholarship|requirements|criteria|price|ranking|top|update|guide|how to/i.test(message) ||
      message.endsWith('?') ||
      (message.split(' ').length >= 3 && !message.startsWith('#'))
    );

    // Fetch live DuckDuckGo web results if needed and not already supplied
    let activeSearchResults: Array<{ title: string; snippet: string; url: string; source?: string }> = Array.isArray(searchResults) ? [...searchResults] : [];
    if (isSearchNeeded && activeSearchResults.length === 0) {
      try {
        const cleanQuery = message.replace(/^(can you\s+)?(please\s+)?(search(\s+the\s+web|\s+duckduckgo)?\s+(for\s+)?|what is the latest on\s+|who is\s+|tell me about\s+)/i, '').trim();
        activeSearchResults = await performLiveWebSearch(cleanQuery || message);
      } catch (searchErr) {
        console.warn('Live search in /api/chat failed:', searchErr);
      }
    }

    const hasCredentials = Array.isArray(credentials) && credentials.length > 0;
    let userContext = '';
    if (hasCredentials) {
      userContext = credentials
        .map((c: any) => `- ${c.name} (Issuer: ${c.issuer}, Type: ${c.type}, Purpose/Goal: "${c.purpose || 'Verification'}", Status: ${c.status || 'verified'}${c.extractedDetails?.gpa ? `, GPA: ${c.extractedDetails.gpa}` : ''})`)
        .join('\n');
    }

    if (activeSearchResults.length > 0) {
      userContext += `\n\nLive Real-Time Web Search Grounding (DuckDuckGo 2026 Web Index):\n` +
        activeSearchResults.map((r: any) => `• Title: "${r.title}"\n  Snippet: ${r.snippet}\n  URL: ${r.url}`).join('\n\n');
    }

    const systemPrompt =
      getSystemPrompt(mode, userContext, hasCredentials) +
      `\n\nTEMPORAL GROUNDING & SEARCH INTELLIGENCE:
- Current Year: 2026 (September 2026).
- When asked about current events, technology conferences (such as Meta Connect, Apple events, Google I/O, AI announcements, Llama models, Gemini models, hardware releases), news, sports, or recent developments:
  1. Treat 2026 as the present.
  2. Synthesize facts directly from the live web search results and your real-time grounding.
  3. Never describe 2024 or 2023 as current. Provide intelligent, direct, factual, and articulate answers for 2026.`;

    // Helper to extract clarification questions, interactive forms, and action labels
    const formatAiResponse = (rawText: string, providerName: string, additionalSources: string[] = []) => {
      let cleanText = rawText;
      let clarificationQuestions: any[] | undefined = undefined;

      const questionMatch = rawText.match(/```kred_questions\s*([\s\S]*?)\s*```/);
      if (questionMatch) {
        try {
          clarificationQuestions = JSON.parse(questionMatch[1]);
          cleanText = rawText.replace(/```kred_questions\s*[\s\S]*?\s*```/, '').trim();
        } catch (err) {
          console.warn('Failed to parse kred_questions block:', err);
        }
      }

      // Autonomous questions for open-ended pitch deck, graphics, and CV requests
      if (!clarificationQuestions) {
        const lowerMsg = message.toLowerCase().trim();
        const hasSpecificChoice =
          lowerMsg.includes('[preference_selected]') ||
          lowerMsg.includes('i choose:') ||
          lowerMsg.includes('target:') ||
          lowerMsg.includes('for my') ||
          lowerMsg.includes('seed round') ||
          lowerMsg.includes('series a') ||
          lowerMsg.includes('infographic on') ||
          lowerMsg.includes('diagram of');

        if (!hasSpecificChoice) {
          if (
            lowerMsg === 'generate a pitch deck' ||
            lowerMsg === 'pitch deck' ||
            lowerMsg === 'create a pitch deck' ||
            lowerMsg === 'make a pitch deck' ||
            (lowerMsg.includes('pitch deck') && !lowerMsg.includes('seed') && !lowerMsg.includes('investor'))
          ) {
            clarificationQuestions = [
              {
                id: 'pitch_deck_purpose',
                title: "What's this pitch deck for?",
                multiSelect: false,
                options: [
                  { id: 'investor', label: 'Job / Investor presentation (Seed / Series A)' },
                  { id: 'portfolio', label: 'Product launch & portfolio demo' },
                  { id: 'sales', label: 'Client sales & enterprise partnership' },
                  { id: 'strategy', label: 'Internal company & board strategy' },
                ],
              },
            ];
            cleanText = "I can synthesize a high-impact presentation pitch deck for you. What is the primary focus of this deck?";
          } else if (
            lowerMsg === 'generate a graphics' ||
            lowerMsg === 'generate graphics' ||
            lowerMsg === 'create graphics' ||
            lowerMsg === 'generate graphic' ||
            lowerMsg === 'make a graphic' ||
            lowerMsg.includes('graphics') ||
            lowerMsg.includes('infographic')
          ) {
            clarificationQuestions = [
              {
                id: 'graphics_format',
                title: 'What visual format do you need for this graphic?',
                multiSelect: false,
                options: [
                  { id: 'infographic', label: 'Visual Data Infographic & Key Metrics' },
                  { id: 'architecture', label: 'System Architecture & Technical Diagram' },
                  { id: 'comparison', label: 'Feature Comparison & Benchmark Chart' },
                  { id: 'roadmap', label: 'Process Roadmap & Milestone Flowchart' },
                ],
              },
            ];
            cleanText = "I can generate an interactive visual graphic document for you. Which visual format best fits your requirement?";
          } else if (
            lowerMsg === 'generate a cv' ||
            lowerMsg === 'create a cv' ||
            lowerMsg === 'make a cv' ||
            lowerMsg === 'generate a resume' ||
            lowerMsg === 'cv' ||
            lowerMsg === 'resume'
          ) {
            clarificationQuestions = [
              {
                id: 'cv_purpose',
                title: "What's this CV for?",
                multiSelect: false,
                options: [
                  { id: 'job_app', label: 'Job application' },
                  { id: 'portfolio', label: 'Portfolio' },
                  { id: 'linkedin', label: 'LinkedIn summary' },
                  { id: 'academic', label: 'Graduate school admission' },
                ],
              },
            ];
            cleanText = "I can synthesize an executive Curriculum Vitae grounded in your credentials. What's this CV for?";
          }
        }
      }

      let interactiveForm: any = undefined;

      const isDocument =
        mode === 'agent' ||
        cleanText.toLowerCase().includes('curriculum vitae') ||
        cleanText.toLowerCase().includes('resume') ||
        cleanText.toLowerCase().includes('flashcard') ||
        cleanText.toLowerCase().includes('receipt') ||
        cleanText.toLowerCase().includes('invoice') ||
        cleanText.toLowerCase().includes('slide') ||
        cleanText.toLowerCase().includes('presentation') ||
        cleanText.toLowerCase().includes('# assignment') ||
        cleanText.toLowerCase().includes('# presentation') ||
        cleanText.toLowerCase().includes('pitch deck') ||
        cleanText.toLowerCase().includes('infographic') ||
        cleanText.toLowerCase().includes('architecture diagram') ||
        cleanText.toLowerCase().includes('visual graphic') ||
        message.toLowerCase().includes('cv') ||
        message.toLowerCase().includes('resume') ||
        message.toLowerCase().includes('flashcard') ||
        message.toLowerCase().includes('receipt') ||
        message.toLowerCase().includes('invoice') ||
        message.toLowerCase().includes('slide') ||
        message.toLowerCase().includes('pitch deck') ||
        message.toLowerCase().includes('graphics') ||
        message.toLowerCase().includes('graphic') ||
        message.toLowerCase().includes('presentation');

      let sources: string[] = [];
      if (isSearchNeeded || activeSearchResults.length > 0) {
        sources = ['DuckDuckGo Web Search', ...additionalSources.slice(0, 2)];
      } else if (hasCredentials) {
        sources = credentials.slice(0, 3).map((c: any) => c.name);
      } else {
        sources = ['KRED AI Sovereign Engine'];
      }

      return {
        text: cleanText,
        sources,
        actionLabel: !clarificationQuestions && isDocument ? 'Download Generated Document' : undefined,
        provider: providerName,
        questions: clarificationQuestions,
        form: interactiveForm,
      };
    };

    // 1. NEURAL INFERENCE PROVIDERS: GOOGLE GEMINI & HUGGING FACE
    const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
    const hfApiKey = (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || process.env.HF_API_KEY || '').trim();

    // Standard OpenAI/HF message format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: String(h.text || h.content || ''),
      })),
      { role: 'user', content: message },
    ];

    let lastErrorDetails = '';
    let lastStatusCode = 0;

    // A. Google Gemini Inference Pipeline (@google/genai)
    if (geminiApiKey) {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Active supported models in API (gemini-3.1-flash-lite, gemini-3.8-flash & gemini-flash-latest)
      const geminiCandidateModels = Array.from(
        new Set([
          process.env.GEMINI_MODEL,
          'gemini-3.1-flash-lite',
          'gemini-3.8-flash',
          'gemini-flash-latest',
        ].filter(Boolean))
      ) as string[];

      // Construct Gemini conversation: alternate user/model turns without system messages in contents
      const geminiContents = [
        ...history.slice(-8).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(h.text || h.content || '') }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      for (const targetModel of geminiCandidateModels) {
        try {
          console.log(`[AI Routing] Invoking Google Gemini model: ${targetModel}`);

          const geminiResponse = await ai.models.generateContent({
            model: targetModel,
            contents: geminiContents,
            config: {
              temperature: mode === 'agent' ? 0.2 : 0.7,
              systemInstruction: systemPrompt,
            },
          });

          const aiText = geminiResponse.text;
          if (aiText && aiText.trim().length > 5) {
            console.log(`[AI Routing] Successfully generated response with Google Gemini model: ${targetModel}`);
            const formatted = formatAiResponse(aiText, `gemini (${targetModel})`);
            res.json(formatted);
            return;
          }
        } catch (geminiErr: any) {
          lastErrorDetails = `Gemini ${targetModel} error: ${geminiErr?.message || geminiErr}`;
          console.warn(`[AI Routing] Gemini model ${targetModel} error:`, geminiErr?.message, '- trying next model...');
        }
      }
    }

    // B. Hugging Face Inference Pipeline (Router Endpoints)
    if (hfApiKey) {
      const userSelectedHfModel = process.env.HF_MODEL || process.env.HUGGINGFACE_MODEL;
      const validHfModels = [
        'meta-llama/Llama-3.3-70B-Instruct',
        'Qwen/Qwen2.5-72B-Instruct',
      ];

      const candidateHfModels = userSelectedHfModel && validHfModels.includes(userSelectedHfModel)
        ? [userSelectedHfModel, ...validHfModels.filter((m) => m !== userSelectedHfModel)]
        : validHfModels;

      for (const targetHfModel of candidateHfModels) {
        try {
          const hfRes = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${hfApiKey}`,
            },
            body: JSON.stringify({
              model: targetHfModel,
              messages,
              temperature: mode === 'agent' ? 0.3 : 0.7,
              max_tokens: 4096,
            }),
            signal: AbortSignal.timeout(25000),
          });

          if (hfRes.ok) {
            const data = await hfRes.json();
            const aiText = data.choices?.[0]?.message?.content;
            if (aiText && aiText.trim().length > 10) {
              console.log(`[AI Routing] Successfully generated response with Hugging Face model: ${targetHfModel}`);
              const formatted = formatAiResponse(aiText, `huggingface (${targetHfModel})`);
              res.json(formatted);
              return;
            }
          } else {
            lastStatusCode = hfRes.status;
            const errBody = await hfRes.text().catch(() => '');
            lastErrorDetails = `Hugging Face ${targetHfModel} (HTTP ${hfRes.status}): ${errBody.slice(0, 160)}`;
            console.warn(`Hugging Face model ${targetHfModel} returned status ${hfRes.status}: ${errBody.slice(0, 120)}, trying next HF model...`);
          }
        } catch (hfErr: any) {
          lastErrorDetails = `Hugging Face ${targetHfModel} error: ${hfErr?.message || hfErr}`;
          console.warn(`Hugging Face model ${targetHfModel} invocation error:`, hfErr?.message);
        }
      }
    }

    // C. If external AI models were unavailable or failed, return honest failed response (no mock templates)
    console.warn(`[AI Routing] Live external models failed to respond: ${lastErrorDetails || 'No valid response received.'}`);

    res.json({
      text: `⚠️ Failed to respond: ${lastErrorDetails || 'The AI model was unable to process your request. Please check your API key or connection and try again.'}`,
      sources: [],
      provider: 'failed',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

async function startServer() {
  try {
    if (!isProd) {
      // Dynamic import of Vite for dev mode
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // Production static serving
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 KRED Full-Stack Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
