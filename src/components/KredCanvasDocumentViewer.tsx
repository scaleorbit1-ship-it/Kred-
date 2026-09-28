import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  Play,
  RotateCw,
  Sparkles,
  Layers,
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  CreditCard,
  Receipt,
  BookOpen,
  Eye,
  CheckCircle2,
  CheckCircle,
  Building,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Shuffle,
  ListTodo,
  CheckSquare,
  Square,
  Clock,
  Target,
  Compass,
  Plus,
  Trash2,
  TrendingUp,
  Bookmark,
  HelpCircle,
} from 'lucide-react';
import { KredLogoMark } from './KredLogo';
import { dbService } from '../services/databaseService';

export interface TaskRoadmapSubtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskRoadmapStep {
  id: string;
  num: number;
  title: string;
  description: string;
  estimatedDuration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  subtasks: TaskRoadmapSubtask[];
  keyPoints?: string[];
  tips?: string;
  resources?: string[];
}

export interface TaskRoadmapData {
  title: string;
  topic: string;
  summary: string;
  estimatedTotalTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: TaskRoadmapStep[];
}

export interface SlideItem {
  id: string;
  num: number;
  total: number;
  label: string;
  type: 'title' | 'split' | 'chart' | 'features' | 'team' | 'quote' | 'ask' | 'standard';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  features?: Array<{ title: string; desc: string }>;
  quote?: { text: string; author: string };
  askItems?: Array<{ label: string; sub: string }>;
  team?: Array<{ name: string; role: string }>;
  presenterNotes?: string;
}

export interface FlashcardItem {
  id: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  question: string;
  answer: string;
  formulaOrKeyPoint?: string;
  vaultAttestation?: string;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: string;
  total: string;
}

export interface ReceiptData {
  merchantName: string;
  receiptNumber: string;
  date: string;
  time: string;
  customerName: string;
  customerContact?: string;
  items: ReceiptItem[];
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  paymentMethod: string;
  status: 'PAID' | 'VERIFIED' | 'ISSUED' | 'PENDING';
  notes?: string;
}

export interface CvExperience {
  role: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
}

export interface CvEducation {
  degree: string;
  school: string;
  year: string;
  details?: string;
}

export interface CvData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
}

export interface KredCanvasDocumentViewerProps {
  content: string;
  docType: string;
  title: string;
  userName?: string;
  onPrint?: () => void;
  onCopy?: () => void;
}

/**
 * Intelligent Markdown to Slides Parser
 */
function parseMarkdownToSlides(content: string, defaultTitle: string): SlideItem[] {
  // Try splitting by standard slide delimiters
  let rawBlocks = content.split(/---|\n## Slide \d+:|\n## /i).filter((s) => s.trim().length > 10);

  // If no standard delimiters found, try splitting by H2 headers or numbered sections
  if (rawBlocks.length < 2) {
    rawBlocks = content.split(/\n### |\n## /).filter((s) => s.trim().length > 10);
  }

  // If still single block, split by double newlines into logical slide chunks
  if (rawBlocks.length < 2) {
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 20);
    if (paragraphs.length >= 2) {
      rawBlocks = paragraphs;
    }
  }

  if (rawBlocks.length >= 2) {
    return rawBlocks.map((block, idx) => {
      const lines = block.trim().split('\n').filter((l) => l.trim().length > 0);
      let title = lines[0]
        ?.replace(/^#+\s*/, '')
        ?.replace(/^Slide \d+:\s*/i, '')
        ?.replace(/^\*\*/, '')
        ?.replace(/\*\*$/, '')
        ?.trim() || `Slide ${idx + 1}`;

      let eyebrow = idx === 0 ? 'PRESENTATION · DECK' : `SECTION ${String(idx + 1).padStart(2, '0')}`;
      const bullets: string[] = [];
      const features: Array<{ title: string; desc: string }> = [];
      let subtitle: string | undefined = undefined;
      let notes: string | undefined = undefined;

      lines.slice(1).forEach((line) => {
        const trimmed = line.trim();
        if (/^\*(Presenter )?Notes:/i.test(trimmed)) {
          notes = trimmed.replace(/^\*(Presenter )?Notes:\s*/i, '').replace(/\*$/, '');
        } else if (/^[-•*]\s+/.test(trimmed)) {
          const text = trimmed.replace(/^[-•*]\s+/, '');
          if (text.includes(':') && text.split(':')[0].length < 30) {
            const [fTitle, ...fDesc] = text.split(':');
            features.push({
              title: fTitle.replace(/\*\*/g, '').trim(),
              desc: fDesc.join(':').replace(/\*\*/g, '').trim(),
            });
          } else {
            bullets.push(text.replace(/\*\*/g, '').trim());
          }
        } else if (!subtitle && trimmed.length > 5 && !trimmed.startsWith('#')) {
          subtitle = trimmed.replace(/\*\*/g, '');
        }
      });

      let type: SlideItem['type'] = 'standard';
      if (idx === 0) type = 'title';
      else if (features.length >= 2) type = 'features';
      else if (bullets.length >= 2) type = 'split';

      return {
        id: `slide_${idx + 1}`,
        num: idx + 1,
        total: rawBlocks.length,
        label: `${String(idx + 1).padStart(2, '0')} — ${title.slice(0, 24)}`,
        type,
        eyebrow,
        title,
        subtitle,
        bullets: bullets.length > 0 ? bullets : undefined,
        features: features.length > 0 ? features : undefined,
        presenterNotes: notes,
      };
    });
  }

  // Fallback single well-formed slide from text
  const cleanTitle = defaultTitle || 'Presentation Overview';
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  const bullets = lines.filter((l) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*')).map((l) => l.replace(/^[-•*]\s*/, ''));

  return [
    {
      id: 'slide_1',
      num: 1,
      total: 2,
      label: '01 — Overview',
      type: 'title',
      eyebrow: 'PRESENTATION DECK',
      title: cleanTitle,
      subtitle: lines[0]?.replace(/^#+\s*/, '') || 'Executive Presentation & Overview',
    },
    {
      id: 'slide_2',
      num: 2,
      total: 2,
      label: '02 — Key Insights',
      type: 'split',
      eyebrow: 'CORE HIGHLIGHTS',
      title: 'Strategic Insights & Summary',
      bullets: bullets.length > 0 ? bullets : ['Key point analysis and synthesis', 'Verified findings and operational next steps'],
    },
  ];
}

/**
 * Intelligent Markdown to Flashcards Parser
 * Parses Front/Back, Question/Answer, Term/Definition, and Q&A lists
 */
function parseMarkdownToFlashcards(content: string, defaultTopic: string = 'General Science'): FlashcardItem[] {
  const cards: FlashcardItem[] = [];

  const cleanMd = (str: string) =>
    str
      .replace(/\*\*/g, '')
      .replace(/^\s*[-•*]\s*/, '')
      .trim();

  // Strategy 1: Match Card / Flashcard numbered blocks
  const cardBlocks = content.split(/(?=(?:^|\n)(?:###?\s*)?(?:\*\*|\*)?(?:Card|Flashcard)\s+\d+)/i);

  for (const block of cardBlocks) {
    const trimmed = block.trim();
    if (trimmed.length < 15) continue;

    // Extract question / front (flexible to "Front / Question", "Front:", "Question:", "Prompt:", etc.)
    const qMatch =
      trimmed.match(/(?:\*\*|\*)?(?:Front(?:\s*[\/|&]\s*Question)?|Question|Q|Prompt|Concept|Term)(?:\s*\([^)]*\))?(?:\*\*|\*)?:\s*([^\n]+(?:\n(?!(?:\*\*|\*)?(?:Back|Answer|Key|Takeaway|Card))[^\n]+)*)/i) ||
      trimmed.match(/(?:\*\*|\*)?(?:Front|Question|Q)(?:\*\*|\*)?:\s*([^\n]+)/i);

    // Extract answer / back (flexible to "Back / Answer", "Back:", "Answer:", "Explanation:", etc.)
    const aMatch =
      trimmed.match(/(?:\*\*|\*)?(?:Back(?:\s*[\/|&]\s*Answer)?|Answer|A|Explanation|Definition)(?:\s*\([^)]*\))?(?:\*\*|\*)?:\s*([^\n]+(?:\n(?!(?:\*\*|\*)?(?:Front|Question|Key|Takeaway|Card))[^\n]+)*)/i) ||
      trimmed.match(/(?:\*\*|\*)?(?:Back|Answer|A)(?:\*\*|\*)?:\s*([^\n]+)/i);

    // Extract key point / takeaway
    const keyMatch = trimmed.match(/(?:\*\*|\*)?(?:Key(?:\s*Point|\s*Takeaway)?|Formula|Note|Mechanism)(?:\*\*|\*)?:\s*([^\n]+)/i);

    // Extract title / topic
    const topicMatch =
      trimmed.match(/(?:\*\*|\*)?(?:Topic|Subject|Category)(?:\*\*|\*)?:\s*([^\n]+)/i) ||
      trimmed.match(/(?:###?\s*)?(?:Card|Flashcard)\s+\d+[:\s-]+([^\n]+)/i);

    if (qMatch && aMatch) {
      cards.push({
        id: `fc_${cards.length + 1}`,
        topic: topicMatch ? cleanMd(topicMatch[1]) : defaultTopic,
        question: cleanMd(qMatch[1]),
        answer: cleanMd(aMatch[1]),
        formulaOrKeyPoint: keyMatch ? cleanMd(keyMatch[1]) : undefined,
        vaultAttestation: 'AI Verified Flashcard',
      });
    }
  }

  // Strategy 2: Look for Front / Back or Q / A pairs in the text
  if (cards.length === 0) {
    const qaRegex = /(?:^|\n)(?:\*\*|\*)?(?:Front(?:\s*[\/|&]\s*Question)?|Question|Q)(?:\s*\([^)]*\))?(?:\*\*|\*)?:\s*([^\n]+)\s*\n+(?:\*\*|\*)?(?:Back(?:\s*[\/|&]\s*Answer)?|Answer|A)(?:\s*\([^)]*\))?(?:\*\*|\*)?:\s*([^\n]+(?:\n(?!(?:\*\*|\*)?(?:Front|Question|Card))[^\n]+)*)/gi;
    let match;
    while ((match = qaRegex.exec(content)) !== null) {
      cards.push({
        id: `fc_${cards.length + 1}`,
        topic: defaultTopic,
        question: cleanMd(match[1]),
        answer: cleanMd(match[2]),
        vaultAttestation: 'AI Verified Flashcard',
      });
    }
  }

  // Strategy 3: Bullet points formatted as **Term / Concept**: Definition
  if (cards.length === 0) {
    const lines = content.split('\n');
    lines.forEach((line) => {
      const termMatch = line.match(/^[-•*]?\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (termMatch && termMatch[2].length > 15 && !/^(topic|note|warning|key)/i.test(termMatch[1])) {
        cards.push({
          id: `fc_${cards.length + 1}`,
          topic: defaultTopic,
          question: `What is ${cleanMd(termMatch[1])}?`,
          answer: cleanMd(termMatch[2]),
          formulaOrKeyPoint: `Key Term: ${cleanMd(termMatch[1])}`,
          vaultAttestation: 'AI Verified Flashcard',
        });
      }
    });
  }

  // Strategy 4: Fallback single cohesive answer into prompt & explanation
  if (cards.length === 0) {
    const titleMatch = content.match(/#+\s*([^\n]+)/);
    const cleanLines = content.split('\n').filter((l) => l.trim().length > 0 && !l.startsWith('#'));
    const question = titleMatch ? cleanMd(titleMatch[1]) : `What are the core principles of ${defaultTopic}?`;
    const answer = cleanLines.slice(0, 4).join('\n').replace(/\*\*/g, '').trim() || content.slice(0, 300);

    cards.push({
      id: 'fc_1',
      topic: defaultTopic,
      question: question.replace(/^(biology\s+)?flashcards?[:\s-]*/i, '') || `Core ${defaultTopic} Concept`,
      answer,
      formulaOrKeyPoint: 'Core Concept Definition',
      vaultAttestation: 'Synthesized Flashcard',
    });
  }

  return cards;
}

/**
 * Intelligent Markdown to Receipt / Invoice Parser
 */
function parseMarkdownToReceipt(content: string, defaultTitle: string): ReceiptData {
  // Currency extraction ($, €, £, ₦, ¥)
  const currencyMatch = content.match(/[$€£₦¥]/);
  const currency = currencyMatch ? currencyMatch[0] : '$';

  // Receipt / Invoice Number
  const numMatch = content.match(/(?:Receipt|Invoice|Order|Ref)(?:\s*(?:#|No|Number))?[:\s]+([A-Z0-9_-]+)/i);
  const receiptNumber = numMatch ? numMatch[1].trim() : `#REC-${Math.floor(100000 + Math.random() * 900000)}`;

  // Merchant / Business Name
  const merchantMatch =
    content.match(/(?:Merchant|Vendor|Store|Company|Issuer|From):\s*([^\n]+)/i) ||
    content.match(/#+\s*([^\n]+(?:Store|Shop|Supply|Lab|Service|Corp|Inc|Company|Pharmacy|Studio|LLC)[^\n]*)/i);
  const merchantName = merchantMatch ? merchantMatch[1].replace(/\*\*/g, '').trim() : 'Kred Commerce & Services';

  // Customer Name
  const customerMatch = content.match(/(?:Customer|Client|Bill To|Billed To|Purchaser|Student|Name):\s*([^\n]+)/i);
  const customerName = customerMatch ? customerMatch[1].replace(/\*\*/g, '').trim() : 'Verified Client';

  // Date and Time
  const dateMatch = content.match(/(?:Date):\s*([^\n]+)/i);
  const date = dateMatch ? dateMatch[1].replace(/\*\*/g, '').trim() : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Items extraction
  const items: ReceiptItem[] = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    // Matches patterns like: - 2x Biology Textbook - $120.00 or | Microscope | 1 | $450 |
    const itemMatch =
      line.match(/[-•*]\s*(?:(\d+)x?\s+)?([^-:|$]+?)(?:\s*[-:]\s*|\s+)?([$€£₦¥]?\s*[\d,]+(?:\.\d{2})?)\s*$/i) ||
      line.match(/\|\s*([^|]+)\s*\|\s*(\d+)?\s*\|\s*([$€£₦¥]?\s*[\d,]+(?:\.\d{2})?)\s*\|/i);

    if (itemMatch) {
      const name = (itemMatch[2] || itemMatch[1]).replace(/\*\*/g, '').trim();
      const qtyStr = itemMatch[1] && !isNaN(Number(itemMatch[1])) ? itemMatch[1] : '1';
      const qty = parseInt(qtyStr, 10) || 1;
      const priceStr = (itemMatch[3] || '$0.00').replace(/[$€£₦¥\s]/g, '').trim();
      const priceNum = parseFloat(priceStr.replace(/,/g, '')) || 0;

      if (name.length > 2 && !/^(total|subtotal|tax|discount|amount)/i.test(name)) {
        items.push({
          name,
          qty,
          price: `${currency}${priceNum.toFixed(2)}`,
          total: `${currency}${(priceNum * qty).toFixed(2)}`,
        });
      }
    }
  });

  // If no items extracted, generate 2-3 logical items from context
  if (items.length === 0) {
    items.push(
      { name: 'Standard Academic Material / Deliverable', qty: 1, price: `${currency}85.00`, total: `${currency}85.00` },
      { name: 'Sovereign Verification Attestation', qty: 1, price: `${currency}35.00`, total: `${currency}35.00` }
    );
  }

  // Totals extraction
  const totalMatch = content.match(/(?:Total|Amount Paid|Grand Total)[:\s]+([$€£₦¥]?\s*[\d,]+(?:\.\d{2})?)/i);
  const subtotalMatch = content.match(/(?:Subtotal)[:\s]+([$€£₦¥]?\s*[\d,]+(?:\.\d{2})?)/i);
  const taxMatch = content.match(/(?:Tax|VAT)[:\s]+([$€£₦¥]?\s*[\d,]+(?:\.\d{2})?)/i);

  const calculatedSubtotal = items.reduce((acc, it) => acc + (parseFloat(it.total.replace(/[$€£₦¥,]/g, '')) || 0), 0);
  const subtotal = subtotalMatch ? subtotalMatch[1].trim() : `${currency}${calculatedSubtotal.toFixed(2)}`;
  const tax = taxMatch ? taxMatch[1].trim() : `${currency}${(calculatedSubtotal * 0.08).toFixed(2)}`;
  const total = totalMatch ? totalMatch[1].trim() : `${currency}${(calculatedSubtotal * 1.08).toFixed(2)}`;

  // Payment Method
  const payMatch = content.match(/(?:Payment Method|Paid via|Payment)[:\s]+([^\n]+)/i);
  const paymentMethod = payMatch ? payMatch[1].replace(/\*\*/g, '').trim() : 'Digital Payment · Sovereign Rail';

  return {
    merchantName,
    receiptNumber,
    date,
    time,
    customerName,
    items,
    subtotal,
    tax,
    total,
    currency,
    paymentMethod,
    status: 'PAID',
    notes: 'Thank you for your transaction. Valid proof of purchase & verification.',
  };
}

/**
 * Intelligent Markdown to CV / Resume Parser
 */
function parseMarkdownToCv(content: string, defaultName: string = 'Alex Johnson'): CvData {
  const lines = content.split('\n');

  // Name extraction (first H1 or top line)
  const nameMatch = content.match(/^#+\s*([^\n|•]+)/) || lines[0]?.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/);
  const name = nameMatch ? nameMatch[1].replace(/\*\*/g, '').trim() : defaultName;

  // Title / Subheading
  const titleMatch = content.match(/(?:Target Role|Position|Specialization|Title)[:\s]+([^\n]+)/i) || lines.find((l) => l.includes('Engineer') || l.includes('Developer') || l.includes('Scientist') || l.includes('Manager') || l.includes('Designer') || l.includes('Researcher'));
  const title = titleMatch ? (typeof titleMatch === 'string' ? titleMatch : titleMatch[1]).replace(/^#+\s*/, '').replace(/\*\*/g, '').trim() : 'Senior Professional & Researcher';

  // Contact info
  const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = content.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const locMatch = content.match(/(?:Location|Address)[:\s]+([^\n]+)/i) || content.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);

  const email = emailMatch ? emailMatch[0] : 'candidate.vault@example.com';
  const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 234-5678';
  const location = locMatch ? (typeof locMatch === 'string' ? locMatch : locMatch[1]).trim() : 'San Francisco, CA';

  // Summary
  const summaryMatch = content.match(/(?:Professional Summary|Executive Summary|Profile|About Me)[:\s\n]+([^\n#]+(?:\n[^\n#]+)*)/i);
  const summary = summaryMatch ? summaryMatch[1].replace(/\*\*/g, '').trim() : 'Accomplished professional with a verified background in quantitative methods, systems architecture, and cross-functional leadership. Proven track record of rigorous execution and milestone delivery.';

  // Experiences
  const experiences: CvExperience[] = [];
  const expSection = content.split(/(?:Experience|Employment|Work History)/i)[1] || '';
  const expBlocks = expSection.split(/\n### |\n## /).filter((b) => b.trim().length > 15);

  expBlocks.forEach((block) => {
    const bLines = block.trim().split('\n');
    const headerLine = bLines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    const bullets = bLines.filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*')).map((l) => l.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '').trim());

    if (headerLine && !/^(skills|education|projects|certifications)/i.test(headerLine)) {
      const parts = headerLine.split(/[-|–—·]/);
      const role = parts[0]?.trim() || headerLine;
      const company = parts[1]?.trim() || 'Enterprise Solutions';
      const period = parts[2]?.trim() || '2022 — Present';

      experiences.push({
        role,
        company,
        period,
        bullets: bullets.length > 0 ? bullets : ['Led technical initiatives and delivered scalable systems.', 'Collaborated cross-functionally to achieve key quarterly benchmarks.'],
      });
    }
  });

  if (experiences.length === 0) {
    experiences.push(
      {
        role: 'Senior Project Specialist',
        company: 'Apex Technologies',
        period: '2023 — Present',
        bullets: [
          'Directed multi-phase technical programs and streamlined data reconciliation pipelines.',
          'Formulated architectural standards and optimized resource utilization across core modules.',
        ],
      },
      {
        role: 'Associate Systems Specialist',
        company: 'Nexus Innovations',
        period: '2020 — 2023',
        bullets: [
          'Engineered resilient data pipelines and performed automated quality verification.',
          'Authored comprehensive technical documentation and mentored junior personnel.',
        ],
      }
    );
  }

  // Education
  const education: CvEducation[] = [];
  const eduSection = content.split(/(?:Education|Academic Background|Degrees)/i)[1] || '';
  const eduLines = eduSection.split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('###'));

  eduLines.forEach((l) => {
    const clean = l.replace(/^[-•*#]+\s*/, '').replace(/\*\*/g, '').trim();
    if (clean.length > 5 && !/^(skills|experience)/i.test(clean)) {
      education.push({
        degree: clean.split(/[,|–]/)[0]?.trim() || clean,
        school: clean.split(/[,|–]/)[1]?.trim() || 'Accredited University',
        year: clean.match(/\b(19|20)\d{2}\b/)?.[0] || 'Graduated with Distinction',
      });
    }
  });

  if (education.length === 0) {
    education.push({
      degree: 'Bachelor of Science / Degree of Distinction',
      school: 'Accredited Academic Faculty',
      year: 'First-Class Standing Equivalent',
    });
  }

  // Skills
  const skillsMatch = content.match(/(?:Skills|Competencies|Technical Skills)[:\s\n]+([^\n#]+)/i);
  let skills = ['Systems Architecture', 'Quantitative Analysis', 'TypeScript', 'Python', 'Cloud Infrastructure', 'Project Management'];
  if (skillsMatch) {
    const rawSkills = skillsMatch[1].split(/[,|•·;]/).map((s) => s.replace(/\*\*/g, '').trim()).filter((s) => s.length > 1);
    if (rawSkills.length >= 2) skills = rawSkills;
  }

  return {
    name,
    title,
    email,
    phone,
    location,
    summary,
    experiences,
    education,
    skills,
  };
}

/**
 * Intelligent Markdown to Task Roadmap Parser
 */
function parseMarkdownToTaskRoadmap(content: string, defaultTitle: string): TaskRoadmapData {
  const cleanMd = (s: string) => s.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();

  // Title extraction
  const titleMatch = content.match(/#+\s*(?:Task Roadmap|Study Plan|Learning Roadmap|Roadmap|Plan)?[:\s]*([^\n]+)/i);
  const title = titleMatch ? cleanMd(titleMatch[1]) : defaultTitle || 'Interactive Task Roadmap';

  // Summary extraction
  const summaryMatch = content.match(/(?:\*|_)?(?:Step-by-Step|Summary|Overview|Goal)(?:\*|_)?[:\s]*([^\n]+)/i);
  const summary = summaryMatch ? cleanMd(summaryMatch[1]) : 'A structured, step-by-step interactive to-do list and execution guide.';

  // Split steps
  let stepBlocks = content.split(/(?=(?:^|\n)(?:##?\s*)?(?:Step|Phase|Milestone|Part)\s+\d+)/i).filter((s) => s.trim().length > 10);

  if (stepBlocks.length < 2) {
    stepBlocks = content.split(/\n## |\n### /).filter((s) => s.trim().length > 10);
  }

  const steps: TaskRoadmapStep[] = [];

  stepBlocks.forEach((block, idx) => {
    const lines = block.trim().split('\n').filter((l) => l.trim().length > 0);
    const stepTitleLine = lines[0] || `Step ${idx + 1}`;
    const stepTitle = cleanMd(stepTitleLine).replace(/^(Step|Phase|Milestone|Part)\s+\d+[:\s-]*/i, '');

    let duration = '20 mins';
    let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    let overview = '';
    const subtasks: TaskRoadmapSubtask[] = [];
    const keyPoints: string[] = [];
    let tips = '';

    lines.slice(1).forEach((line) => {
      const trimmed = line.trim();
      const durMatch = trimmed.match(/(?:\*\*|\*)?(?:Duration|Estimated Time|Time)(?:\*\*|\*)?:\s*([^\n]+)/i);
      const diffMatch = trimmed.match(/(?:\*\*|\*)?(?:Difficulty|Level)(?:\*\*|\*)?:\s*([^\n]+)/i);
      const tipMatch = trimmed.match(/(?:\*\*|\*)?(?:Tip|Tips|Pro Tip)(?:\*\*|\*)?:\s*([^\n]+)/i);
      const keyMatch = trimmed.match(/(?:\*\*|\*)?(?:Key Point|Key Points|Takeaway)(?:\*\*|\*)?:\s*([^\n]+)/i);

      if (durMatch) {
        duration = cleanMd(durMatch[1]);
      } else if (diffMatch) {
        const dStr = diffMatch[1].toLowerCase();
        if (dStr.includes('advanced')) difficulty = 'Advanced';
        else if (dStr.includes('intermed')) difficulty = 'Intermediate';
        else difficulty = 'Beginner';
      } else if (tipMatch) {
        tips = cleanMd(tipMatch[1]);
      } else if (keyMatch) {
        keyPoints.push(cleanMd(keyMatch[1]));
      } else if (/^[-*+]\s*\[[\s xX]\]/.test(trimmed) || /^[-*+]\s+/.test(trimmed)) {
        const subtext = trimmed.replace(/^[-*+]\s*\[[\s xX]\]\s*/, '').replace(/^[-*+]\s*/, '').trim();
        if (subtext.length > 2 && !/^(duration|difficulty|tip|key point)/i.test(subtext)) {
          subtasks.push({
            id: `st_${idx + 1}_${subtasks.length + 1}`,
            text: cleanMd(subtext),
            completed: trimmed.includes('[x]') || trimmed.includes('[X]'),
          });
        }
      } else if (!overview && trimmed.length > 5 && !trimmed.startsWith('#')) {
        overview = cleanMd(trimmed);
      }
    });

    if (subtasks.length === 0) {
      subtasks.push(
        { id: `st_${idx + 1}_1`, text: `Understand core principles of ${stepTitle || 'this milestone'}`, completed: false },
        { id: `st_${idx + 1}_2`, text: `Execute hands-on practice & review key concepts`, completed: false }
      );
    }

    steps.push({
      id: `step_${idx + 1}`,
      num: idx + 1,
      title: stepTitle || `Step ${idx + 1}`,
      description: overview || `Complete milestones for ${stepTitle}`,
      estimatedDuration: duration,
      difficulty,
      subtasks,
      keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
      tips: tips || undefined,
    });
  });

  if (steps.length === 0) {
    steps.push({
      id: 'step_1',
      num: 1,
      title: 'Foundational Knowledge & Setup',
      description: 'Review core definitions, prerequisites, and foundational concepts.',
      estimatedDuration: '20 mins',
      difficulty: 'Beginner',
      subtasks: [
        { id: 'st_1_1', text: 'Read introductory concepts and definitions', completed: false },
        { id: 'st_1_2', text: 'Set up development / study environment', completed: false },
      ],
    });
  }

  return {
    title,
    topic: title.replace(/Task Roadmap|Teach Me|Study Plan/gi, '').trim() || 'General Learning',
    summary,
    steps,
  };
}

export const KredCanvasDocumentViewer: React.FC<KredCanvasDocumentViewerProps> = ({
  content,
  docType,
  title,
  userName = 'Alex Johnson',
  onPrint,
  onCopy,
}) => {
  // Navigation & Toggle States
  const [slideViewMode, setSlideViewMode] = useState<'grid' | 'present'>('present');
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const [flashcardViewMode, setFlashcardViewMode] = useState<'card' | 'grid'>('card');
  const [activeFlashcardIdx, setActiveFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCardIds, setMasteredCardIds] = useState<string[]>([]);
  const [shuffledFlashcards, setShuffledFlashcards] = useState<FlashcardItem[] | null>(null);

  const [receiptViewMode, setReceiptViewMode] = useState<'pos' | 'invoice'>('pos');
  const [cvVariant, setCvVariant] = useState<'ats' | 'designer'>('ats');

  // Detect exact document classification from docType, title, or content keywords
  const lowerContent = content.toLowerCase();
  const lowerTitle = title.toLowerCase();

  const isFlashcardDoc =
    docType === 'flashcards' ||
    docType === 'flashcard' ||
    lowerTitle.includes('flashcard') ||
    lowerTitle.includes('flash card') ||
    lowerTitle.includes('study card') ||
    lowerContent.includes('flashcard') ||
    lowerContent.includes('flash card') ||
    lowerContent.includes('### card 1') ||
    lowerContent.includes('card 1:') ||
    (lowerContent.includes('front') && lowerContent.includes('back'));

  const isSlideDeck =
    !isFlashcardDoc &&
    (docType === 'slides' ||
      lowerTitle.includes('slide') ||
      lowerTitle.includes('presentation') ||
      lowerTitle.includes('pitch deck') ||
      lowerContent.includes('presentation slides') ||
      lowerContent.includes('slide 1') ||
      lowerContent.includes('01 — title') ||
      lowerContent.includes('## slide'));

  const isReceiptDoc =
    docType === 'receipt' ||
    docType === 'invoice' ||
    lowerTitle.includes('receipt') ||
    lowerTitle.includes('invoice') ||
    lowerTitle.includes('bill') ||
    lowerContent.includes('official receipt') ||
    lowerContent.includes('sales receipt') ||
    lowerContent.includes('#rec-') ||
    lowerContent.includes('#inv-') ||
    (lowerContent.includes('receipt') && lowerContent.includes('subtotal'));

  const isCvDoc =
    !isFlashcardDoc &&
    !isSlideDeck &&
    !isReceiptDoc &&
    (docType === 'cv' ||
      docType === 'resume' ||
      lowerTitle.includes('cv') ||
      lowerTitle.includes('resume') ||
      lowerTitle.includes('curriculum vitae') ||
      lowerContent.includes('curriculum vitae') ||
      lowerContent.includes('executive summary') ||
      lowerContent.includes('professional summary') ||
      lowerContent.includes('work experience'));

  const isTaskRoadmapDoc =
    !isFlashcardDoc &&
    !isSlideDeck &&
    !isReceiptDoc &&
    !isCvDoc &&
    (docType === 'study_plan' ||
      docType === 'task_roadmap' ||
      docType === 'task' ||
      docType === 'roadmap' ||
      lowerTitle.includes('task roadmap') ||
      lowerTitle.includes('study plan') ||
      lowerTitle.includes('learning roadmap') ||
      lowerTitle.includes('teach me') ||
      lowerTitle.includes('task') ||
      lowerContent.includes('task roadmap') ||
      lowerContent.includes('step-by-step') ||
      lowerContent.includes('## step 1') ||
      lowerContent.includes('## step 2'));

  const [interactiveRoadmap, setInteractiveRoadmap] = useState<TaskRoadmapData | null>(null);
  const [addedCustomTaskInput, setAddedCustomTaskInput] = useState<Record<string, string>>({});
  const [isTaskSavedToQueue, setIsTaskSavedToQueue] = useState(false);

  useEffect(() => {
    if (isTaskRoadmapDoc) {
      setInteractiveRoadmap(parseMarkdownToTaskRoadmap(content, title));
    }
  }, [content, title, isTaskRoadmapDoc]);

  const toggleSubtask = (stepId: string, subtaskId: string) => {
    if (!interactiveRoadmap) return;
    setInteractiveRoadmap((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            subtasks: s.subtasks.map((st) => {
              if (st.id !== subtaskId) return st;
              return { ...st, completed: !st.completed };
            }),
          };
        }),
      };
    });
  };

  const handleAddCustomSubtask = (stepId: string) => {
    const text = (addedCustomTaskInput[stepId] || '').trim();
    if (!text || !interactiveRoadmap) return;

    setInteractiveRoadmap((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: prev.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            subtasks: [
              ...s.subtasks,
              { id: `st_custom_${Date.now()}`, text, completed: false },
            ],
          };
        }),
      };
    });

    setAddedCustomTaskInput((prev) => ({ ...prev, [stepId]: '' }));
  };

  const handleSaveRoadmapToAgentTasks = () => {
    if (!interactiveRoadmap) return;
    dbService.addTask({
      title: interactiveRoadmap.title,
      description: interactiveRoadmap.summary || 'Interactive Step-by-Step Task Roadmap created by AI',
      category: 'assignment',
      status: 'in_progress',
      prompt: `Task Roadmap: ${interactiveRoadmap.title}`,
    });
    setIsTaskSavedToQueue(true);
  };

  // Keyboard navigation for Flashcards & Slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFlashcardDoc && flashcardViewMode === 'card') {
        if (e.code === 'Space') {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          setIsFlipped(false);
          setActiveFlashcardIdx((prev) => prev + 1);
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          setIsFlipped(false);
          setActiveFlashcardIdx((prev) => Math.max(0, prev - 1));
        }
      } else if (isSlideDeck && slideViewMode === 'present') {
        if (e.code === 'ArrowRight' || e.code === 'Space') {
          e.preventDefault();
          setActiveSlideIdx((prev) => prev + 1);
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          setActiveSlideIdx((prev) => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlashcardDoc, isSlideDeck, flashcardViewMode, slideViewMode]);

  // =========================================================================
  // 1. FLASHCARD DECK PREVIEW (Looks like genuine study flashcards)
  // =========================================================================
  if (isFlashcardDoc) {
    const defaultTopic = title.replace(/flashcards?|deck|interactive|study/gi, '').trim() || 'Biology & Life Sciences';
    const parsedCards = parseMarkdownToFlashcards(content, defaultTopic);
    const flashcards = shuffledFlashcards || parsedCards;
    const card = flashcards[Math.min(activeFlashcardIdx, flashcards.length - 1)] || flashcards[0];
    const isCurrentMastered = card ? masteredCardIds.includes(card.id) : false;

    const handleShuffle = () => {
      const shuffled = [...parsedCards].sort(() => Math.random() - 0.5);
      setShuffledFlashcards(shuffled);
      setActiveFlashcardIdx(0);
      setIsFlipped(false);
    };

    const handleResetOrder = () => {
      setShuffledFlashcards(null);
      setActiveFlashcardIdx(0);
      setIsFlipped(false);
    };

    return (
      <div id="kred-canvas-print-area" className="w-full max-w-[700px] mx-auto space-y-4 select-none font-sans">
        {/* Flashcards Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E1DA]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[14px] text-[#0E8A54]">kred.</span>
            <span className="text-[13px] font-bold text-[#18181B]">Study Flashcard Deck</span>
            <span className="px-2 py-0.5 rounded-full bg-[#10C77A]/15 border border-[#10C77A]/30 text-[10.5px] font-semibold text-[#0E8A54]">
              Card {activeFlashcardIdx + 1} of {flashcards.length}
            </span>
            {masteredCardIds.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#0E8A54]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{masteredCardIds.length}/{flashcards.length} Mastered</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Shuffle Button */}
            <button
              type="button"
              onClick={shuffledFlashcards ? handleResetOrder : handleShuffle}
              className={`h-7 px-2 rounded-lg border text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer ${
                shuffledFlashcards
                  ? 'bg-[#10C77A]/15 border-[#10C77A] text-[#0E8A54] font-semibold'
                  : 'bg-white hover:bg-[#F3F2EE] border-[#E2E1DA] text-[#71717A] hover:text-[#18181B]'
              }`}
              title={shuffledFlashcards ? 'Reset to original order' : 'Shuffle card order'}
            >
              <Shuffle className="w-3 h-3" />
              <span className="hidden sm:inline">{shuffledFlashcards ? 'Shuffled' : 'Shuffle'}</span>
            </button>

            {/* View Mode Toggle: Card vs Grid */}
            <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA] text-[11px]">
              <button
                type="button"
                onClick={() => setFlashcardViewMode('card')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  flashcardViewMode === 'card' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setFlashcardViewMode('grid')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  flashcardViewMode === 'grid' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid ({flashcards.length})</span>
              </button>
            </div>

            {flashcardViewMode === 'card' && (
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-7 px-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[11.5px] font-medium inline-flex items-center gap-1.5 cursor-pointer text-[#18181B] shadow-2xs active:scale-95"
                title="Flip Card (Press Spacebar)"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#0E8A54]" />
                <span>Flip (Space)</span>
              </button>
            )}
          </div>
        </div>

        {/* Study Progress Indicator */}
        <div className="w-full bg-[#EAE7DC] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#10C77A] h-full transition-all duration-300"
            style={{ width: `${((activeFlashcardIdx + 1) / flashcards.length) * 100}%` }}
          />
        </div>

        {/* Single Card Mode (Physical Index Card with 3D Flip) */}
        {flashcardViewMode === 'card' ? (
          <div className="space-y-4">
            <div
              className="w-full relative [perspective:1200px]"
              style={{ minHeight: '380px' }}
            >
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[380px] rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] cursor-pointer relative shadow-[0_20px_45px_-12px_rgba(0,0,0,0.12)] border-2 border-[#E5E2D8] hover:border-[#10C77A] group select-none active:scale-[0.99]"
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRONT FACE (Question / Prompt) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl bg-[#FCFBF8] p-7 sm:p-10 flex flex-col justify-between [backface-visibility:hidden] overflow-hidden"
                >
                  {/* Top Index Card Ruled Line */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-[#10C77A]" />

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#0E8A54] bg-[#E8F8EE] px-2.5 py-1 rounded-lg border border-[#10C77A]/30">
                        {card?.topic || defaultTopic}
                      </span>
                      <span className="text-[11px] font-mono text-[#71717A]">
                        #{String(activeFlashcardIdx + 1).padStart(2, '0')}
                      </span>
                      {isCurrentMastered && (
                        <span className="text-[10.5px] font-semibold text-[#0E8A54] bg-[#10C77A]/15 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#10C77A]/30">
                          <Check className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#71717A] group-hover:text-[#18181B] transition-colors">
                      <RotateCw className="w-3.5 h-3.5 text-[#10C77A]" />
                      <span>Click or Space to Flip</span>
                    </div>
                  </div>

                  {/* Question Prompt Body */}
                  <div className="my-auto py-6">
                    <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-[#71717A] block mb-2">
                      PROMPT QUESTION
                    </span>
                    <h3 className="text-[21px] sm:text-[25px] font-bold text-[#18181B] leading-snug tracking-tight font-sans">
                      {card?.question}
                    </h3>
                  </div>

                  {/* Footer Row */}
                  <div className="pt-4 border-t border-[#EAE7DC] flex items-center justify-between text-[11px] text-[#71717A]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10C77A]" />
                      <span>{card?.vaultAttestation || 'Study Deck Verified'}</span>
                    </div>
                    <span className="text-[#0E8A54] font-semibold flex items-center gap-1">
                      <span>Reveal Answer</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>

                {/* BACK FACE (Verified Answer & Key Takeaway) */}
                <div
                  className="absolute inset-0 w-full h-full rounded-3xl bg-[#FCFBF8] p-7 sm:p-10 flex flex-col justify-between [backface-visibility:hidden] overflow-hidden"
                  style={{
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Top Index Card Line */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-[#0E8A54]" />

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#0E8A54] bg-[#E8F8EE] px-2.5 py-1 rounded-lg border border-[#10C77A]/30">
                        VERIFIED EXPLANATION
                      </span>
                      <span className="text-[11px] font-mono text-[#71717A]">
                        #{String(activeFlashcardIdx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#71717A] group-hover:text-[#18181B] transition-colors">
                      <RotateCw className="w-3.5 h-3.5 text-[#0E8A54]" />
                      <span>Click or Space to Flip</span>
                    </div>
                  </div>

                  {/* Answer Explanation Body */}
                  <div className="my-auto py-3 space-y-3.5 overflow-y-auto max-h-[220px] pr-1">
                    <div className="text-[15px] sm:text-[16px] text-[#18181B] leading-relaxed font-sans whitespace-pre-line">
                      {card?.answer}
                    </div>

                    {card?.formulaOrKeyPoint && (
                      <div className="p-3 rounded-xl bg-[#F4F3ED] border border-[#E2E1DA] text-[12px] font-mono text-[#4A4436] flex items-start gap-2">
                        <span className="text-[#0E8A54] font-bold text-[14px]">💡</span>
                        <div>
                          <b className="text-[#18181B]">Key Takeaway:</b> {card.formulaOrKeyPoint}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Self-Testing Mastery Buttons */}
                  <div
                    className="pt-3 border-t border-[#EAE7DC] flex items-center justify-between text-[11.5px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[#71717A] font-mono text-[11px]">Assess your recall:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (card) {
                            setMasteredCardIds((prev) => prev.filter((id) => id !== card.id));
                            setIsFlipped(false);
                            setActiveFlashcardIdx((prev) => Math.min(flashcards.length - 1, prev + 1));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg border border-[#E2E1DA] bg-white hover:bg-[#F3F2EE] text-[#71717A] hover:text-[#18181B] text-[11px] font-medium cursor-pointer transition-all shadow-2xs"
                      >
                        Needs Review ↻
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (card) {
                            if (!masteredCardIds.includes(card.id)) {
                              setMasteredCardIds((prev) => [...prev, card.id]);
                            }
                            setIsFlipped(false);
                            setActiveFlashcardIdx((prev) => Math.min(flashcards.length - 1, prev + 1));
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-[#0E8A54] hover:bg-[#0A6D42] text-white text-[11px] font-semibold cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mastered ✓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flashcard Bottom Navigation & Indicators */}
            <div className="flex items-center justify-between px-2 pt-1">
              <button
                type="button"
                disabled={activeFlashcardIdx === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setActiveFlashcardIdx((prev) => Math.max(0, prev - 1));
                }}
                className="h-8.5 px-3.5 rounded-xl border border-[#E2E1DA] bg-white hover:bg-[#F3F2EE] disabled:opacity-40 text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5">
                {flashcards.map((fc, i) => (
                  <button
                    key={fc.id || i}
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setActiveFlashcardIdx(i);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeFlashcardIdx === i
                        ? 'w-6 bg-[#10C77A]'
                        : masteredCardIds.includes(fc.id)
                        ? 'w-2 bg-[#0E8A54]'
                        : 'w-2 bg-[#D4D3CC] hover:bg-[#A9A3B5]'
                    }`}
                    title={`Card ${i + 1}${masteredCardIds.includes(fc.id) ? ' (Mastered)' : ''}`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={activeFlashcardIdx >= flashcards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setActiveFlashcardIdx((prev) => Math.min(flashcards.length - 1, prev + 1));
                }}
                className="h-8.5 px-3.5 rounded-xl border border-[#E2E1DA] bg-white hover:bg-[#F3F2EE] disabled:opacity-40 text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Grid View Mode: All Flashcards at a glance */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {flashcards.map((fc, idx) => (
              <div
                key={fc.id}
                onClick={() => {
                  setActiveFlashcardIdx(idx);
                  setIsFlipped(false);
                  setFlashcardViewMode('card');
                }}
                className="p-5 rounded-2xl bg-[#FCFBF8] border border-[#E5E2D8] hover:border-[#10C77A] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10.5px] font-mono mb-2">
                    <span className="font-bold text-[#0E8A54] bg-[#E8F8EE] px-2 py-0.5 rounded">
                      {fc.topic}
                    </span>
                    <span className="text-[#71717A]">#{idx + 1}</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-[#18181B] leading-snug group-hover:text-[#0E8A54] transition-colors">
                    {fc.question}
                  </h4>
                  <p className="text-[12px] text-[#52525B] mt-2 line-clamp-3 leading-relaxed">
                    {fc.answer}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EAE7DC] flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>{masteredCardIds.includes(fc.id) ? '✓ Mastered' : 'Click to practice'}</span>
                  <span className="font-semibold text-[#0E8A54]">Study Card →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. SLIDES PRESENTATION / PITCH DECK PREVIEW (Widescreen 16:9 Presentation)
  // =========================================================================
  if (isSlideDeck) {
    const slides = parseMarkdownToSlides(content, title);
    const currentSlide = slides[Math.min(activeSlideIdx, slides.length - 1)] || slides[0];

    return (
      <div id="kred-canvas-print-area" className="w-full max-w-[940px] mx-auto space-y-5 select-none font-sans">
        {/* Slides Control Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E1DA]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[14px] text-[#C9A24C]">kred.</span>
            <span className="text-[13px] font-bold text-[#18181B]">16:9 Presentation Deck</span>
            <span className="px-2 py-0.5 rounded-full bg-[#C9A24C]/15 border border-[#C9A24C]/30 text-[10.5px] font-semibold text-[#8C6B1B]">
              Slide {activeSlideIdx + 1} of {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA] text-[11px]">
            <button
              type="button"
              onClick={() => setSlideViewMode('present')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                slideViewMode === 'present' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Present Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setSlideViewMode('grid')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                slideViewMode === 'grid' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All Slides ({slides.length})</span>
            </button>
          </div>
        </div>

        {/* Single Presentation Slide View (16:9 Widescreen) */}
        {slideViewMode === 'present' ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video bg-[#FDFBF7] text-[#18181B] rounded-2xl border-2 border-[#E3DFD3] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.18)] p-8 sm:p-12 flex flex-col justify-center overflow-hidden">
              {/* Left Brass Ribbon Accent */}
              <div className="absolute top-0 left-0 w-2 h-full bg-[#C9A24C]" />

              {/* Eyebrow Header */}
              {currentSlide.eyebrow && (
                <div className="text-[11px] font-mono tracking-widest font-bold text-[#8C6B1B] uppercase mb-3">
                  {currentSlide.eyebrow}
                </div>
              )}

              {/* Title */}
              <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-[#18181B] leading-tight mb-3 font-sans">
                {currentSlide.title}
              </h2>

              {/* Subtitle */}
              {currentSlide.subtitle && (
                <p className="text-[13px] sm:text-[15px] text-[#52525B] max-w-[620px] leading-relaxed mb-4 font-sans">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* Bullets */}
              {currentSlide.bullets && (
                <ul className="space-y-2 mt-2 max-w-[640px]">
                  {currentSlide.bullets.map((b, i) => (
                    <li key={i} className="text-[13px] text-[#27272A] flex items-start gap-2.5 leading-relaxed">
                      <span className="text-[#C9A24C] font-bold mt-0.5 text-[16px]">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Features Grid */}
              {currentSlide.features && (
                <div className="grid grid-cols-2 gap-3.5 mt-3 max-w-[640px]">
                  {currentSlide.features.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#F4F1E8] border border-[#E3DFD3] text-[12px]">
                      <b className="block text-[#18181B] font-bold mb-0.5">{f.title}</b>
                      <span className="text-[#52525B]">{f.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Slide Footer */}
              <div className="absolute bottom-5 left-10 right-10 flex items-center justify-between text-[11px] text-[#71717A] font-mono">
                <span>Slide {currentSlide.num} of {slides.length}</span>
                <span className="font-bold text-[#C9A24C]">kred presentation</span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activeSlideIdx === 0}
                  onClick={() => setActiveSlideIdx((prev) => Math.max(0, prev - 1))}
                  className="h-8.5 px-3 rounded-xl border border-[#E2E1DA] bg-white hover:bg-[#F3F2EE] disabled:opacity-40 text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Slide
                </button>
                <button
                  type="button"
                  disabled={activeSlideIdx >= slides.length - 1}
                  onClick={() => setActiveSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))}
                  className="h-8.5 px-3 rounded-xl border border-[#E2E1DA] bg-white hover:bg-[#F3F2EE] disabled:opacity-40 text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                >
                  Next Slide <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {currentSlide.presenterNotes && (
                <div className="text-[11px] text-[#71717A] italic max-w-[420px] truncate">
                  Notes: {currentSlide.presenterNotes}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Grid View: All slides overview */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {slides.map((s, idx) => (
              <div key={s.id} className="space-y-1.5">
                <div className="text-[11px] font-mono text-[#71717A] font-semibold px-1">
                  {s.label}
                </div>
                <div
                  onClick={() => {
                    setActiveSlideIdx(idx);
                    setSlideViewMode('present');
                  }}
                  className="group relative w-full aspect-video bg-[#FDFBF7] text-[#18181B] rounded-xl border border-[#E3DFD3] hover:border-[#C9A24C] shadow-sm hover:shadow-md p-5 flex flex-col justify-center cursor-pointer transition-all overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C9A24C]" />
                  <h3 className="text-[15px] font-bold text-[#18181B] leading-tight mb-1 font-sans group-hover:text-[#8C6B1B] transition-colors">
                    {s.title}
                  </h3>
                  {s.subtitle && (
                    <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                      {s.subtitle}
                    </p>
                  )}
                  <div className="absolute bottom-2.5 right-3 text-[9.5px] font-mono text-[#71717A]">
                    {s.num} / {slides.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. RECEIPT & INVOICE PREVIEW (Looks like genuine store receipt or invoice)
  // =========================================================================
  if (isReceiptDoc) {
    const receiptData = parseMarkdownToReceipt(content, title);

    return (
      <div id="kred-canvas-print-area" className="w-full max-w-[620px] mx-auto space-y-4 select-none font-sans">
        {/* Receipt Header & Format Switcher */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E1DA]">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0E8A54]" />
            <span className="text-[13px] font-bold text-[#18181B]">Financial Transaction Document</span>
            <span className="px-2 py-0.5 rounded-full bg-[#10C77A]/15 border border-[#10C77A]/30 text-[10px] font-semibold text-[#0E8A54]">
              {receiptData.status}
            </span>
          </div>

          <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA] text-[11px]">
            <button
              type="button"
              onClick={() => setReceiptViewMode('pos')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                receiptViewMode === 'pos' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              Store Receipt
            </button>
            <button
              type="button"
              onClick={() => setReceiptViewMode('invoice')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                receiptViewMode === 'invoice' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              Formal Invoice
            </button>
          </div>
        </div>

        {receiptViewMode === 'pos' ? (
          /* POS Thermal Store Receipt View (Classic paper receipt with jagged edges & barcode) */
          <div className="relative mx-auto max-w-[420px] bg-[#FCFBF7] text-[#18181B] p-6 sm:p-8 rounded-t-xl border border-b-0 border-[#D8D4C8] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.12)] font-mono text-[12px]">
            {/* Top Store Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-[#B8B4A8] space-y-1">
              <div className="font-bold text-[18px] tracking-tight uppercase font-sans">
                {receiptData.merchantName}
              </div>
              <div className="text-[11px] text-[#71717A]">
                OFFICIAL SALES RECEIPT
              </div>
              <div className="text-[10px] text-[#71717A] pt-1">
                Ref: {receiptData.receiptNumber} · {receiptData.date} {receiptData.time}
              </div>
              <div className="text-[10.5px] text-[#52525B]">
                Customer: <b>{receiptData.customerName}</b>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-4 space-y-2.5 border-b-2 border-dashed border-[#B8B4A8]">
              <div className="flex justify-between text-[10.5px] font-bold text-[#71717A] uppercase pb-1">
                <span>Item & Description</span>
                <span>Amount</span>
              </div>

              {receiptData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2 text-[12px]">
                  <div className="flex-1">
                    <div className="font-semibold text-[#18181B]">{item.name}</div>
                    <div className="text-[10.5px] text-[#71717A]">
                      {item.qty} @ {item.price} each
                    </div>
                  </div>
                  <div className="font-bold text-[#18181B]">{item.total}</div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="py-3 space-y-1.5 border-b-2 border-dashed border-[#B8B4A8] text-[11.5px]">
              <div className="flex justify-between text-[#71717A]">
                <span>SUBTOTAL</span>
                <span className="font-semibold">{receiptData.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#71717A]">
                <span>TAX / VAT (8%)</span>
                <span>{receiptData.tax}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold text-[#18181B] pt-2 border-t border-[#D8D4C8]">
                <span>TOTAL PAID</span>
                <span>{receiptData.total}</span>
              </div>
            </div>

            {/* Payment Method & Attestation */}
            <div className="py-3 text-center text-[10.5px] text-[#71717A] space-y-1">
              <div>Paid via: <b>{receiptData.paymentMethod}</b></div>
              <div className="text-[#0E8A54] font-bold">STATUS: COMPLETED & VERIFIED</div>
            </div>

            {/* Barcode Graphic */}
            <div className="pt-2 text-center">
              <div className="inline-block tracking-widest text-[28px] font-mono select-none text-[#27272A] opacity-80">
                ||| | |||| | ||| |||| || | |||| |||
              </div>
              <div className="text-[9px] text-[#71717A] tracking-wider mt-0.5">
                {receiptData.receiptNumber}
              </div>
            </div>

            {/* Serrated Bottom Edge (CSS Sawtooth Receipt Edge) */}
            <div
              className="absolute -bottom-3 inset-x-0 h-3 bg-repeat-x"
              style={{
                backgroundImage:
                  'radial-gradient(circle, transparent, transparent 50%, #FCFBF7 50%, #FCFBF7 100%)',
                backgroundSize: '12px 12px',
              }}
            />
          </div>
        ) : (
          /* Formal Corporate Invoice View */
          <div className="bg-[#FCFBF8] text-[#18181B] p-8 sm:p-10 rounded-2xl border border-[#E3DFD3] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.12)]">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#E3DFD3]">
              <div>
                <h3 className="text-[20px] font-bold text-[#18181B]">{receiptData.merchantName}</h3>
                <div className="text-[12px] text-[#71717A]">Official Tax Invoice & Attestation</div>
              </div>
              <div className="text-right">
                <span className="text-[14px] font-mono font-bold text-[#18181B]">{receiptData.receiptNumber}</span>
                <div className="text-[11px] text-[#71717A]">{receiptData.date}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-[12px]">
              <div>
                <b className="text-[11px] uppercase tracking-wider text-[#71717A] block mb-1">Billed To:</b>
                <div className="font-semibold text-[#18181B]">{receiptData.customerName}</div>
                <div className="text-[#71717A]">Authorized Client Account</div>
              </div>
              <div className="text-right">
                <b className="text-[11px] uppercase tracking-wider text-[#71717A] block mb-1">Status:</b>
                <span className="px-2 py-0.5 rounded bg-[#E8F8EE] text-[#0E8A54] font-bold text-[11px] border border-[#10C77A]/30">
                  {receiptData.status}
                </span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left text-[12.5px] border-collapse mb-5">
              <thead>
                <tr className="border-b border-[#E3DFD3] text-[10.5px] font-mono uppercase text-[#71717A]">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBDF]">
                {receiptData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-medium">{item.name}</td>
                    <td className="py-2.5 text-center text-[#71717A]">{item.qty}</td>
                    <td className="py-2.5 text-right text-[#71717A]">{item.price}</td>
                    <td className="py-2.5 text-right font-bold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Box */}
            <div className="pt-3 border-t border-[#E3DFD3] flex justify-end">
              <div className="w-48 space-y-1.5 text-[12px]">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal:</span>
                  <span>{receiptData.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>Tax (8%):</span>
                  <span>{receiptData.tax}</span>
                </div>
                <div className="flex justify-between font-bold text-[14px] text-[#18181B] pt-1.5 border-t border-[#E3DFD3]">
                  <span>Total:</span>
                  <span>{receiptData.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. CV / RESUME PREVIEW (Looks like genuine ATS / Executive Resume)
  // =========================================================================
  if (isCvDoc) {
    const cv = parseMarkdownToCv(content, userName);

    return (
      <div id="kred-canvas-print-area" className="w-full max-w-[760px] mx-auto space-y-4 font-sans select-none">
        {/* Style Variant Switcher */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E1DA]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[14px] text-[#0E8A54]">kred.</span>
            <span className="text-[13px] font-bold text-[#18181B]">Curriculum Vitae / Resume</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E2E1DA] text-[10px] font-mono font-semibold text-[#71717A]">
              PDF Export Ready
            </span>
          </div>

          <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA] text-[11px]">
            <button
              type="button"
              onClick={() => setCvVariant('ats')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                cvVariant === 'ats' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              ATS-Optimized
            </button>
            <button
              type="button"
              onClick={() => setCvVariant('designer')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                cvVariant === 'designer' ? 'bg-white text-[#18181B] font-bold shadow-2xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              Modern Executive
            </button>
          </div>
        </div>

        {/* Paper Sheet Document */}
        <div className="bg-[#FCFBF8] text-[#18181B] p-8 sm:p-12 rounded-2xl border border-[#E3DFD3] shadow-[0_20px_45px_-15px_rgba(0,0,0,0.12)]">
          {cvVariant === 'ats' ? (
            /* ATS-Optimized Clean Linear Format */
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b border-[#E3DFD3] pb-4 space-y-1">
                <h1 className="text-[26px] font-bold tracking-tight text-[#18181B] font-serif">
                  {cv.name}
                </h1>
                <div className="text-[13px] font-medium text-[#0E8A54] tracking-wide">
                  {cv.title}
                </div>
                <div className="text-[11.5px] text-[#71717A] flex items-center justify-center flex-wrap gap-2 pt-1 font-mono">
                  <span>{cv.email}</span>
                  <span>•</span>
                  <span>{cv.phone}</span>
                  <span>•</span>
                  <span>{cv.location}</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#71717A] mb-2 pb-1 border-b border-[#E3DFD3]">
                  Professional Summary
                </h3>
                <p className="text-[13px] text-[#27272A] leading-relaxed">
                  {cv.summary}
                </p>
              </div>

              {/* Work Experience */}
              <div>
                <h3 className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#71717A] mb-3 pb-1 border-b border-[#E3DFD3]">
                  Work Experience
                </h3>
                <div className="space-y-4">
                  {cv.experiences.map((exp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-baseline text-[13.5px]">
                        <span className="font-bold text-[#18181B]">{exp.role}</span>
                        <span className="text-[11.5px] font-mono text-[#71717A]">{exp.period}</span>
                      </div>
                      <div className="text-[12px] font-semibold text-[#0E8A54]">
                        {exp.company}
                      </div>
                      <ul className="space-y-1 mt-1 text-[12.5px] text-[#3F3F46]">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <span className="text-[#71717A] mt-1 text-[10px]">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#71717A] mb-2 pb-1 border-b border-[#E3DFD3]">
                  Education & Verified Credentials
                </h3>
                <div className="space-y-2">
                  {cv.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between items-baseline text-[12.5px]">
                      <div>
                        <b className="text-[#18181B]">{edu.degree}</b> · <span className="text-[#71717A]">{edu.school}</span>
                      </div>
                      <span className="text-[11.5px] font-mono text-[#71717A]">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-[11px] font-mono tracking-widest uppercase font-bold text-[#71717A] mb-2 pb-1 border-b border-[#E3DFD3]">
                  Core Skills & Competencies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cv.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#F4F3ED] text-[#27272A] text-[11px] font-medium border border-[#E3DFD3]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Modern Executive / Designer Format */
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-[#E3DFD3] pb-5">
                <div>
                  <h1 className="text-[28px] font-bold text-[#18181B] tracking-tight">{cv.name}</h1>
                  <div className="text-[13px] font-bold text-[#0E8A54] uppercase tracking-wider font-mono mt-0.5">
                    {cv.title}
                  </div>
                </div>
                <div className="text-right text-[11.5px] text-[#71717A] space-y-0.5">
                  <div>{cv.email}</div>
                  <div>{cv.phone}</div>
                  <div>{cv.location}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-5">
                  <div>
                    <h3 className="text-[11px] font-mono font-bold text-[#0E8A54] uppercase tracking-wider mb-2">
                      Professional Background
                    </h3>
                    <p className="text-[13px] text-[#3F3F46] leading-relaxed">
                      {cv.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-mono font-bold text-[#0E8A54] uppercase tracking-wider mb-3">
                      Experience & Milestone Accomplishments
                    </h3>
                    <div className="space-y-4">
                      {cv.experiences.map((exp, idx) => (
                        <div key={idx} className="relative pl-3.5 border-l-2 border-[#10C77A]">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-[13.5px] text-[#18181B]">{exp.role}</span>
                            <span className="text-[11px] text-[#71717A] font-mono">{exp.period}</span>
                          </div>
                          <div className="text-[12px] font-semibold text-[#71717A] mb-1">{exp.company}</div>
                          <ul className="space-y-1 text-[12.5px] text-[#3F3F46]">
                            {exp.bullets.map((b, bIdx) => (
                              <li key={bIdx}>• {b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-[11px] font-mono font-bold text-[#0E8A54] uppercase tracking-wider mb-2">
                      Education
                    </h3>
                    <div className="space-y-2.5 text-[12px]">
                      {cv.education.map((edu, idx) => (
                        <div key={idx}>
                          <div className="font-bold text-[#18181B]">{edu.degree}</div>
                          <div className="text-[#71717A]">{edu.school}</div>
                          <div className="text-[10.5px] text-[#0E8A54] font-mono">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-mono font-bold text-[#0E8A54] uppercase tracking-wider mb-2">
                      Key Competencies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#E8F8EE] text-[#0E8A54] font-medium text-[11px] border border-[#10C77A]/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. TASK ROADMAP & STEP-BY-STEP TO-DO LIST PREVIEW
  // =========================================================================
  if (isTaskRoadmapDoc && interactiveRoadmap) {
    const totalSubtasks = interactiveRoadmap.steps.reduce((acc, s) => acc + s.subtasks.length, 0);
    const completedSubtasks = interactiveRoadmap.steps.reduce((acc, s) => acc + s.subtasks.filter((st) => st.completed).length, 0);
    const percent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
      <div id="kred-canvas-print-area" className="w-full max-w-[820px] mx-auto space-y-5 font-sans select-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E1DA]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[14px] text-[#3B82F6]">kred.</span>
            <span className="text-[13px] font-bold text-[#18181B]">Step-by-Step Task Roadmap</span>
            <span className="px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[10.5px] font-semibold text-[#1D4ED8]">
              {completedSubtasks}/{totalSubtasks} Items ({percent}%)
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveRoadmapToAgentTasks}
            className={`px-3 py-1.5 rounded-xl text-[11.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isTaskSavedToQueue
                ? 'bg-[#10C77A] text-white'
                : 'bg-[#18181B] hover:bg-[#27272A] text-white'
            }`}
          >
            {isTaskSavedToQueue ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved to Agent Tasks Queue</span>
              </>
            ) : (
              <>
                <ListTodo className="w-3.5 h-3.5" />
                <span>Save to My Tasks Queue</span>
              </>
            )}
          </button>
        </div>

        {/* Roadmap Overview & Progress Card */}
        <div className="p-6 rounded-2xl bg-[#FCFBF8] border border-[#E3DFD3] shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono tracking-wider uppercase font-bold text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-0.5 rounded border border-[#3B82F6]/20">
                {interactiveRoadmap.topic || 'Step-by-Step Learning'}
              </span>
              <h2 className="text-[20px] font-bold text-[#18181B] mt-1.5">
                {interactiveRoadmap.title}
              </h2>
              <p className="text-[13px] text-[#52525B] mt-1 leading-relaxed">
                {interactiveRoadmap.summary}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-[11px] font-mono text-[#71717A] mb-1">
              <span>Execution Progress</span>
              <span className="font-bold text-[#18181B]">{percent}% Complete</span>
            </div>
            <div className="w-full bg-[#EAE7DC] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#3B82F6] h-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {interactiveRoadmap.steps.map((step) => {
            const stepCompleted = step.subtasks.every((st) => st.completed);

            return (
              <div
                key={step.id}
                className={`p-5 rounded-2xl bg-[#FCFBF8] border transition-all ${
                  stepCompleted
                    ? 'border-[#10C77A] bg-[#F4FBF7]'
                    : 'border-[#E3DFD3] hover:border-[#3B82F6]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Step Number Circle */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-[13px] ${
                      stepCompleted
                        ? 'bg-[#10C77A] text-white'
                        : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#3B82F6]/30'
                    }`}
                  >
                    {stepCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[16px] font-bold text-[#18181B]">
                          {step.title}
                        </h3>
                        {step.description && (
                          <p className="text-[12.5px] text-[#52525B] mt-0.5 leading-relaxed">
                            {step.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {step.estimatedDuration && (
                          <span className="px-2 py-0.5 rounded bg-[#F4F3ED] text-[#71717A] text-[10.5px] font-mono border border-[#E2E1DA]">
                            ⏱ {step.estimatedDuration}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[10.5px] font-semibold border border-[#3B82F6]/20">
                          {step.difficulty || 'Beginner'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Subtask Checklist */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-mono uppercase font-bold text-[#71717A] tracking-wider">
                        Action Checklist:
                      </div>
                      <div className="space-y-1.5">
                        {step.subtasks.map((st) => (
                          <label
                            key={st.id}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer text-[12.5px] ${
                              st.completed
                                ? 'bg-[#E8F8EE] border-[#10C77A]/30 text-[#0E8A54] line-through'
                                : 'bg-white border-[#E2E1DA] hover:border-[#3B82F6] text-[#18181B]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => toggleSubtask(step.id, st.id)}
                              className="mt-0.5 rounded border-[#E2E1DA] text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
                            />
                            <span className="flex-1 font-medium select-text">{st.text}</span>
                          </label>
                        ))}
                      </div>

                      {/* Add Subtask Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add custom task or milestone..."
                          value={addedCustomTaskInput[step.id] || ''}
                          onChange={(e) =>
                            setAddedCustomTaskInput((prev) => ({ ...prev, [step.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSubtask(step.id);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[#E2E1DA] bg-white text-[12px] text-[#18181B] focus:outline-none focus:border-[#3B82F6]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSubtask(step.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#F4F3ED] hover:bg-[#E2E1DA] border border-[#E2E1DA] text-[11.5px] font-semibold text-[#18181B] cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    {/* Pro Tip or Key Points */}
                    {step.tips && (
                      <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#92400E] flex items-start gap-2">
                        <span className="text-[14px]">💡</span>
                        <div>
                          <b>Pro Tip:</b> {step.tips}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. DEFAULT DOCUMENT / ARTICLE / BLUEPRINT RENDERER
  // =========================================================================
  const htmlContent = marked.parse(content, { async: false, breaks: true }) as string;

  return (
    <div id="kred-canvas-print-area" className="p-6 sm:p-10 bg-[#FCFBF8] rounded-2xl border border-[#E2E1DA] shadow-sm text-[#18181B] max-w-[800px] mx-auto space-y-5 font-sans">
      <div className="pb-4 mb-4 border-b border-[#E2E1DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <KredLogoMark size="default" variant="dark" />
          <div>
            <div className="text-[15px] font-bold tracking-tight text-[#18181B]">
              {title || 'Generated Deliverable Dossier'}
            </div>
            <div className="text-[11px] text-[#71717A] font-mono">
              {userName} · {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div
        className="kred-markdown text-[14.5px] leading-relaxed text-[#18181B] space-y-3 font-sans"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default KredCanvasDocumentViewer;
