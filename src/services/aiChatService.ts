/**
 * Kred Credential AI Intelligence Service
 * Handles two response modes based strictly on user INTENT:
 * 1. CHAT MODE (default) — plain conversational reply, no canvas, no agent button.
 * 2. AGENT MODE — invokes the agent to produce a structured document/file and opens in the canvas.
 */
import dbService, { StoredCredential, InteractiveForm, FormField } from './databaseService';
import { searchDuckDuckGo, WebSearchResult } from './webSearchService';

export interface ClarificationOption {
  id: string;
  label: string;
}

export interface ClarificationQuestion {
  id: string;
  title: string;
  multiSelect?: boolean;
  options: ClarificationOption[];
}

export interface AiAuditResponse {
  answer: string;
  sources: string[];
  actionLabel?: string;
  actionPayload?: string;
  provider?: string;
  questions?: ClarificationQuestion[];
  form?: InteractiveForm;
  searchResults?: WebSearchResult[];
  mode?: 'chat' | 'agent';
  isDocument?: boolean;
}

export interface AiAuditOptions {
  mode?: 'chat' | 'agent';
  selectedCredentialIds?: string[];
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  webSearch?: boolean;
}

export interface TaskReasoningAnalysis {
  isTaskRequest: boolean;
  taskType: 'study_plan' | 'cv' | 'cover_letter' | 'assignment' | 'slides' | 'waiver' | 'general';
  taskLabel: string;
  hasSufficientInfo: boolean;
  missingParameters: string[];
  suggestedForm?: InteractiveForm;
  reasoningTrace: string;
}

/**
 * Evaluates a user task request through the Sovereign Reasoning Layer.
 * Analyzes whether the request is for a Student Plan, CV, Cover Letter, Assignment, or Slides,
 * audits missing parameters, and constructs the appropriate interactive intake form if needed.
 */
export const analyzeTaskRequest = (
  query: string,
  credentials: StoredCredential[] = []
): TaskReasoningAnalysis => {
  const q = query.toLowerCase().trim();
  const topCred = credentials[0]?.name || 'Computer Science & AI Systems';
  const topIssuer = credentials[0]?.issuer || 'Accredited Institution';

  // Check if query is already a structured form submission
  if (query.includes('[FORM_SUBMISSION]') || query.includes('Target:') || query.includes('Objective:')) {
    return {
      isTaskRequest: true,
      taskType: q.includes('study_plan') || q.includes('student') ? 'study_plan' : q.includes('cover_letter') ? 'cover_letter' : q.includes('assignment') ? 'assignment' : 'cv',
      taskLabel: 'Form Submission Processed',
      hasSufficientInfo: true,
      missingParameters: [],
      reasoningTrace: `### 🧠 Sovereign Agent Reasoning\n• **Direct Parameters Supplied**: User completed interactive intake.\n• **Execution Path**: Synthesizing tailored deliverable.`,
    };
  }

  // 1. Student Study Plan / Academic Roadmap
  const isStudyPlanRequest =
    q.includes('student plan') ||
    q.includes('study plan') ||
    q.includes('academic roadmap') ||
    q.includes('learning roadmap') ||
    q.includes('study schedule') ||
    q.includes('semester plan') ||
    (q.includes('plan') && (q.includes('student') || q.includes('study') || q.includes('course') || q.includes('exam') || q.includes('curriculum')));

  if (isStudyPlanRequest) {
    const hasTimeline = /week|month|semester|hour|sprint|term/i.test(q);
    const hasSubject = q.split(' ').length > 5 && !/^(make|create|generate|give me|build)\s+(a\s+)?(student\s+plan|study\s+plan|plan|roadmap)$/i.test(q);
    const hasSufficient = hasTimeline && hasSubject;

    const missing: string[] = [];
    if (!hasSubject) missing.push('Target Subject Area / Degree Focus');
    if (!hasTimeline) missing.push('Study Plan Duration & Milestone Pace');

    const suggestedForm: InteractiveForm = {
      id: `form_plan_${Date.now()}`,
      type: 'study_plan',
      title: 'Student Study Plan & Academic Roadmap Intake Form',
      description: 'Specify your study subject, primary milestone goal, and preferred timeline so I can reason over your curriculum structure.',
      fields: [
        { id: 'subjectArea', label: 'Study Subject / Degree Focus', placeholder: `e.g. ${topCred}`, required: true },
        { id: 'deliverableGoal', label: 'Target Milestone / Goal', placeholder: 'e.g. Master core architecture and complete coursework milestones', required: true },
        { id: 'weeklyHours', label: 'Weekly Study Commitment', placeholder: 'e.g. 10–15 hours / week' },
      ],
      questions: [
        {
          id: 'study_duration',
          title: 'Target Study Timeline',
          multiSelect: false,
          options: [
            { id: '4weeks', label: '4-Week Intensive Sprint' },
            { id: '8weeks', label: '8-Week Comprehensive Plan' },
            { id: 'semester', label: 'Full Semester (16 Weeks)' },
          ],
        },
      ],
    };

    return {
      isTaskRequest: true,
      taskType: 'study_plan',
      taskLabel: 'Student Study Plan & Academic Roadmap',
      hasSufficientInfo: hasSufficient,
      missingParameters: missing,
      suggestedForm: !hasSufficient ? suggestedForm : undefined,
      reasoningTrace: `### 🧠 Sovereign Agent Reasoning\n• **Task Classification**: **Student Study Plan & Academic Roadmap** (distinct from CV/Resume).\n• **Vault Context**: Referencing ${topCred} (${topIssuer}).\n• **Parameter Audit**: ${hasSufficient ? 'All required parameters present.' : `Missing: ${missing.join(', ')}. Prompting interactive intake form.`}`,
    };
  }

  // 2. Curriculum Vitae / Resume
  const isCvRequest =
    q.includes('cv') ||
    q.includes('resume') ||
    q.includes('curriculum vitae');

  if (isCvRequest) {
    const hasRole = /engineer|developer|manager|scientist|student|analyst|architect|consultant|designer|director/i.test(q);
    const hasSufficient = hasRole && q.split(' ').length > 4;

    const missing: string[] = [];
    if (!hasRole) missing.push('Target Role / Specialization');

    const suggestedForm: InteractiveForm = {
      id: `form_cv_${Date.now()}`,
      type: 'cv',
      title: 'Executive Curriculum Vitae (CV) Intake Form',
      description: 'Provide your target position and core competencies so I can synthesize a tailored executive CV from your vault qualifications.',
      fields: [
        { id: 'fullName', label: 'Candidate Name', placeholder: 'e.g. Alex Johnson', required: true },
        { id: 'targetRole', label: 'Target Position / Industry', placeholder: 'e.g. Senior Software Architect', required: true },
        { id: 'skills', label: 'Key Competencies & Technical Stack', placeholder: 'e.g. Distributed Systems, TypeScript, Python, Cloud Architecture', required: true },
      ],
      questions: [
        {
          id: 'cv_target',
          title: 'Primary CV Focus',
          multiSelect: false,
          options: [
            { id: 'industry', label: 'Tech & Industry Role' },
            { id: 'grad', label: 'Graduate School Admission' },
            { id: 'executive', label: 'Executive Leadership' },
          ],
        },
      ],
    };

    return {
      isTaskRequest: true,
      taskType: 'cv',
      taskLabel: 'Executive Curriculum Vitae',
      hasSufficientInfo: hasSufficient,
      missingParameters: missing,
      suggestedForm: !hasSufficient ? suggestedForm : undefined,
      reasoningTrace: `### 🧠 Sovereign Agent Reasoning\n• **Task Classification**: **Executive Curriculum Vitae (CV)**.\n• **Vault Context**: Incorporating ${credentials.length} verified credentials from ${topIssuer}.\n• **Parameter Audit**: ${hasSufficient ? 'All required parameters present.' : `Missing: ${missing.join(', ')}. Prompting interactive intake form.`}`,
    };
  }

  // 3. Application Cover Letter / Statement of Purpose
  const isCoverLetterRequest =
    q.includes('cover letter') ||
    q.includes('statement of purpose') ||
    q.includes('sop') ||
    q.includes('letter of intent') ||
    q.includes('application letter');

  if (isCoverLetterRequest) {
    const hasTarget = /for|at|to\s+[A-Z]/i.test(query) && q.split(' ').length > 5;
    const missing: string[] = [];
    if (!hasTarget) missing.push('Target Institution / Company & Position');

    const suggestedForm: InteractiveForm = {
      id: `form_cl_${Date.now()}`,
      type: 'cover_letter',
      title: 'Application Cover Letter & SOP Intake Form',
      description: 'Specify the target organization and position so I can reason over your qualifications and write a tailored letter.',
      fields: [
        { id: 'fullName', label: 'Candidate Name', placeholder: 'e.g. Alex Johnson', required: true },
        { id: 'targetCompany', label: 'Target Institution / Company Name', placeholder: 'e.g. Google / Oxford University', required: true },
        { id: 'targetRole', label: 'Target Position / Degree Program', placeholder: 'e.g. Senior Software Engineer / MSc AI', required: true },
        { id: 'keyHook', label: 'Key Motivation / Unique Strengths', placeholder: 'e.g. Background in scalable systems and research distinction...', type: 'textarea' },
      ],
      questions: [
        {
          id: 'tone',
          title: 'Desired Letter Tone',
          multiSelect: false,
          options: [
            { id: 'confident', label: 'Confident & Technical (Industry)' },
            { id: 'academic', label: 'Academic & Scholarly (University)' },
            { id: 'mission', label: 'Mission-Aligned & Purposeful' },
          ],
        },
      ],
    };

    return {
      isTaskRequest: true,
      taskType: 'cover_letter',
      taskLabel: 'Application Cover Letter / Statement of Purpose',
      hasSufficientInfo: hasTarget,
      missingParameters: missing,
      suggestedForm: !hasTarget ? suggestedForm : undefined,
      reasoningTrace: `### 🧠 Sovereign Agent Reasoning\n• **Task Classification**: **Application Cover Letter / Statement of Purpose**.\n• **Parameter Audit**: ${hasTarget ? 'Sufficient parameters present.' : `Missing: ${missing.join(', ')}. Prompting intake form.`}`,
    };
  }

  // 4. Academic Coursework & Assignment Blueprint
  const isAssignmentRequest =
    q.includes('assignment') ||
    q.includes('coursework') ||
    q.includes('homework') ||
    q.includes('rubric') ||
    q.includes('syllabus');

  if (isAssignmentRequest) {
    const hasDetail = q.split(' ').length > 6;
    const missing: string[] = [];
    if (!hasDetail) missing.push('Academic Level & Expected Deliverables');

    const suggestedForm: InteractiveForm = {
      id: `form_asg_${Date.now()}`,
      type: 'assignment',
      title: 'Academic Coursework Blueprint Intake Form',
      description: 'Specify the academic subject and milestone focus for your custom coursework blueprint.',
      fields: [
        { id: 'subjectArea', label: 'Course / Subject Area', placeholder: `e.g. ${topCred}`, required: true },
        { id: 'deliverableGoal', label: 'Target Learning Outcome', placeholder: 'e.g. 4-Week syllabus with lab milestones and assessment rubric', required: true },
      ],
      questions: [
        {
          id: 'academic_level',
          title: 'Academic Level',
          multiSelect: false,
          options: [
            { id: 'undergrad', label: 'Undergraduate Senior (B.Sc)' },
            { id: 'postgrad', label: 'Postgraduate Master (M.Sc)' },
            { id: 'doctoral', label: 'Doctoral Research (Ph.D)' },
          ],
        },
      ],
    };

    return {
      isTaskRequest: true,
      taskType: 'assignment',
      taskLabel: 'Academic Coursework & Assignment Blueprint',
      hasSufficientInfo: hasDetail,
      missingParameters: missing,
      suggestedForm: !hasDetail ? suggestedForm : undefined,
      reasoningTrace: `### 🧠 Sovereign Agent Reasoning\n• **Task Classification**: **Academic Coursework & Assignment Blueprint**.\n• **Parameter Audit**: ${hasDetail ? 'Parameters provided.' : `Missing: ${missing.join(', ')}. Prompting intake form.`}`,
    };
  }

  // Default: General query
  return {
    isTaskRequest: false,
    taskType: 'general',
    taskLabel: 'General Conversation',
    hasSufficientInfo: true,
    missingParameters: [],
    reasoningTrace: `### 🧠 Sovereign Agent Reasoning\n• **Task Classification**: Conversational response.`,
  };
};

/**
 * Autonomously prepares clarification questions for open-ended generation requests
 * such as Pitch Deck, Graphics, CV, etc.
 */
export const getAutonomousQuestionsForQuery = (query: string): ClarificationQuestion[] | undefined => {
  const q = query.toLowerCase().trim();
  if (
    q.includes('[preference_selected]') ||
    q.includes('target:') ||
    q.includes('i choose:') ||
    q.includes('selected specifications:') ||
    q.includes('seed round') ||
    q.includes('series a') ||
    q.includes('5-slide') ||
    q.includes('infographic on') ||
    q.includes('diagram of') ||
    q.includes('for my') ||
    q.includes('about biology') ||
    q.includes('for biology') ||
    q.includes('about quantum') ||
    q.includes('on javascript') ||
    q.includes('about javascript') ||
    q.includes('on python') ||
    q.includes('about python') ||
    q.includes('for chemistry') ||
    q.includes('about chemistry')
  ) {
    return undefined;
  }

  // 1. Flashcards / Study Cards requests
  if (
    /(flash\s*cards?|flshcards?|study\s*cards?|quiz\s*cards?|revision\s*cards?)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on') &&
    !q.includes('regarding')
  ) {
    return [
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
        id: 'flashcard_depth',
        title: "What deck format and depth do you prefer?",
        multiSelect: false,
        options: [
          { id: 'simple_review', label: 'Simple Quick-Review (5 Essential Core Concept Cards)' },
          { id: 'comprehensive_prep', label: 'Comprehensive Exam Prep (10 In-Depth Flashcards with Key Takeaways)' },
        ],
      },
    ];
  }

  // 2. CV / Resume requests
  if (
    /(cv|resume|curriculum\s+vitae|work\s+history|portfolio\s+resume)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on') &&
    !q.includes('attached') &&
    !q.includes('uploaded')
  ) {
    return [
      {
        id: 'cv_purpose',
        title: "What is the target role or focus for this CV / Resume?",
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
        id: 'cv_format',
        title: "What layout and structural format do you prefer?",
        multiSelect: false,
        options: [
          { id: 'simple_ats', label: 'Simple 1-Page Modern Industry Resume (ATS-Optimized)' },
          { id: 'comprehensive_cv', label: 'Multi-Page Comprehensive Executive & Academic CV' },
        ],
      },
    ];
  }

  // 3. Certificate & Award requests
  if (
    /(certificate|diploma|award\s+certificate|completion\s+certificate|attestation\s+certificate)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on')
  ) {
    return [
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
        id: 'cert_format',
        title: "What citation and layout style do you prefer?",
        multiSelect: false,
        options: [
          { id: 'formal_honor', label: 'Formal Award Layout with High-Honor Citation & Signatures' },
          { id: 'standard_verified', label: 'Standard Verified Certificate with Security ID & Attestation' },
        ],
      },
    ];
  }

  // 4. Invoice & Receipt requests
  if (
    /(invoice|receipt|tax\s+invoice|sales\s+receipt|billing\s+statement|payment\s+receipt)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on')
  ) {
    return [
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
        id: 'invoice_depth',
        title: "What level of itemization do you prefer?",
        multiSelect: false,
        options: [
          { id: 'itemized_table', label: 'Detailed Itemized Table (Line items, Unit Rate, Tax & Balance Due)' },
          { id: 'summary_statement', label: 'Summary Billing Statement (Flat fee & payment confirmation)' },
        ],
      },
    ];
  }

  // 5. Letterhead & Business Letters
  if (
    /(letterhead|business\s+letter|formal\s+letter|cover\s+letter|recommendation\s+letter|application\s+letter)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on')
  ) {
    return [
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
        id: 'letter_tone',
        title: "What tone and format do you prefer?",
        multiSelect: false,
        options: [
          { id: 'executive_formal', label: 'Executive Formal (Authoritative with letterhead header & signature blocks)' },
          { id: 'modern_persuasive', label: 'Modern Business Narrative (Concise & persuasive)' },
        ],
      },
    ];
  }

  // 6. Pitch deck requests without specified target
  if (
    /(pitch\s+deck|pitch\s+presentation|investor\s+deck)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on')
  ) {
    return [
      {
        id: 'pitch_deck_topic',
        title: "What topic would you like this pitch deck to be about?",
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
        id: 'pitch_deck_depth',
        title: "What presentation depth and format do you prefer?",
        multiSelect: false,
        options: [
          { id: 'simple', label: 'Simple 5-Slide Executive Pitch (Punchy bullet points, high-level vision)' },
          { id: 'comprehensive', label: 'Comprehensive Investor Deck (In-depth market data, traction & speaker notes)' },
        ],
      },
    ];
  }

  // 7. Graphics / Infographic / Visual Diagram requests
  if (
    /(graphics?|infographics?|diagrams?|visual\s+graphics?|visuals?|charts?)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on')
  ) {
    return [
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
        id: 'graphics_depth',
        title: 'What visual style and detail level do you prefer?',
        multiSelect: false,
        options: [
          { id: 'simple', label: 'Simple & Clean (Minimalist visual highlights & key statistics)' },
          { id: 'more_detailed', label: 'Comprehensive & Detailed (In-depth component specs & flowchart nodes)' },
        ],
      },
    ];
  }

  // 8. Open-ended slides / presentation requests
  if (
    /(slides?|presentations?|powerpoint|keynote)/i.test(q) &&
    !q.includes('about') &&
    !q.includes('for') &&
    !q.includes('on')
  ) {
    return [
      {
        id: 'presentation_focus',
        title: "What is the primary topic and focus for this presentation?",
        multiSelect: false,
        options: [
          { id: 'simple_overview', label: 'Simple Executive Briefing & Key Takeaways' },
          { id: 'deep_dive', label: 'More comprehensive Deep Dive & Research Presentation' },
          { id: 'keynote', label: 'Keynote & Conference Presentation' },
          { id: 'training', label: 'Educational Workshop & Training Module' },
        ],
      },
      {
        id: 'presentation_depth',
        title: "What level of detail would you prefer?",
        multiSelect: false,
        options: [
          { id: 'simple', label: 'Simple & concise (High-level talking points)' },
          { id: 'more_detailed', label: 'More in-depth & detailed (Full slide notes & background context)' },
        ],
      },
    ];
  }

  return undefined;
};

/**
 * Detects whether the user's intent requires AGENT MODE or CHAT MODE.
 */
export const detectIntentMode = (
  query: string,
  userSelectedMode: 'chat' | 'agent' = 'chat'
): { mode: 'chat' | 'agent'; isAmbiguous?: boolean; isExplicitDocGeneration?: boolean; taskAnalysis?: TaskReasoningAnalysis } => {
  const q = query.toLowerCase().trim();

  // 1. Ambiguous cases: "Can you look at my resume?", "Look at my cv", etc.
  const isAmbiguousLookAtDoc =
    /^(can you\s+)?(please\s+)?(look at|take a look at|check|review)\s+(my\s+)?(resume|cv|transcript|document|degree|diploma|certificate)\??$/i.test(q) ||
    q === 'can you look at my resume?' ||
    q === 'can you look at my resume' ||
    q === 'look at my resume' ||
    q === 'look at my cv' ||
    q === 'can you look at my cv?' ||
    q === 'can you look at my cv' ||
    q === 'check my resume';

  if (isAmbiguousLookAtDoc) {
    return { mode: 'chat', isAmbiguous: true };
  }

  // 2. Explicit Generation / Creation / Editing Intent (Triggers AGENT MODE)
  const isGenerationVerb = /(create|generate|write|draft|build|synthesize|produce|compose|make|show|give|design|formulate)/i.test(q);
  const isFlashcardIntent = /(flashcard|flashcards|flash\s+card|flash\s+cards|study\s+card|study\s+cards|quiz\s+card|quiz\s+cards)/i.test(q);
  const isSlideIntent = /(slide|slides|presentation|pitch\s+deck|slide\s+deck|deck|keynote|powerpoint)/i.test(q);
  const isReceiptIntent = /(receipt|invoice|bill|sales\s+receipt|order\s+receipt|billing)/i.test(q);
  const isCvIntent = /(cv|resume|curriculum\s+vitae|ats\s+cv|ats\s+resume)/i.test(q);
  const isCoverLetterIntent = /(cover\s+letter|statement\s+of\s+purpose|sop|letter\s+of\s+intent|application\s+letter)/i.test(q);
  const isStudyPlanIntent = /(study\s+plan|student\s+plan|academic\s+roadmap|learning\s+roadmap|study\s+schedule|coursework\s+plan)/i.test(q);

  const docCreationVerbs = /(create|generate|write|draft|build|synthesize|produce|compose|make)\s+(me\s+)?(a\s+|an\s+)?/i;
  const docEditingVerbs = /(edit|revise|update|rewrite|improve|modify|re-write)\s+(this|the|my)?\s*/i;
  const docConversionVerbs = /(turn|convert)\s+(this|my\s+[\w\s]+)\s+into\s+(a\s+|an\s+)?/i;
  const targetDocNouns = /(cv|resume|curriculum\s+vitae|cover\s+letter|sop|statement\s+of\s+purpose|slides?|presentation|pitch\s+deck|slide\s+deck|flashcards?|flash\s+cards?|study\s+cards?|receipt|invoice|bill|syllabus|assignment|coursework|study\s+plan|plan|roadmap|dossier|waiver\s+letter|recommendation\s+letter|application\s+dossier|executive\s+summary|rubric)/i;

  const hasExplicitDocGeneration =
    (isGenerationVerb && (isFlashcardIntent || isSlideIntent || isReceiptIntent || isCvIntent || isCoverLetterIntent || isStudyPlanIntent)) ||
    (docCreationVerbs.test(q) && targetDocNouns.test(q)) ||
    (docEditingVerbs.test(q) && targetDocNouns.test(q)) ||
    (docConversionVerbs.test(q) && targetDocNouns.test(q)) ||
    isFlashcardIntent ||
    q.includes('generate a flash card') ||
    q.includes('generate a flashcard') ||
    q.includes('generate flashcards') ||
    q.includes('generate flash card') ||
    q.includes('generate a cv') ||
    q.includes('generate cv') ||
    q.includes('generate a resume') ||
    q.includes('generate receipt') ||
    q.includes('generate an invoice') ||
    q.includes('create a receipt') ||
    q.includes('write a cover letter') ||
    q.includes('turn this into a resume') ||
    q.includes('turn this into a cv') ||
    q.includes('generate a plan') ||
    q.includes('generate study plan') ||
    q.includes('generate slides') ||
    q.includes('generate presentation') ||
    q.includes('create an assignment') ||
    q.includes('create coursework') ||
    q.startsWith('command: call agent') ||
    q === 'call agent' ||
    q === 'call the agent' ||
    q === 'call agent chat' ||
    q.includes('preview canvas') ||
    q.includes('open canvas') ||
    q.includes('in canvas');

  const taskAnalysis = analyzeTaskRequest(query);

  if (hasExplicitDocGeneration || taskAnalysis.isTaskRequest) {
    return { mode: 'agent', isExplicitDocGeneration: true, taskAnalysis };
  }

  // If user explicitly switched the toggle to 'agent' in the UI
  if (userSelectedMode === 'agent') {
    return { mode: 'agent', isExplicitDocGeneration: true, taskAnalysis };
  }

  // Default: CHAT MODE
  return { mode: 'chat', taskAnalysis };
};

export const getAiAuditResponse = async (
  query: string,
  options: AiAuditOptions = {}
): Promise<AiAuditResponse> => {
  const rawQuery = query.trim();
  const q = rawQuery.toLowerCase();
  const userMode = options.mode || 'chat';

  // Determine mode based on intent
  const intentAnalysis = detectIntentMode(query, userMode);
  const effectiveMode = intentAnalysis.mode;

  // Get all credentials or filter by selected ones
  const allCredentials = dbService.getCredentials();
  const credentials = options.selectedCredentialIds && options.selectedCredentialIds.length > 0
    ? allCredentials.filter((c) => options.selectedCredentialIds!.includes(c.id))
    : allCredentials;

  // Ambiguous Case: Ask one short clarifying question (no button, no guessing)
  if (intentAnalysis.isAmbiguous) {
    return {
      answer: "Want me to just review it, or generate an improved version?",
      sources: credentials.length > 0 ? credentials.slice(0, 2).map((c) => c.name) : ['Kred Intelligence'],
      mode: 'chat',
      isDocument: false,
    };
  }

  // If user uploaded a doc with no instructions
  if (!rawQuery && credentials.length > 0) {
    return {
      answer: "I've saved your document to your vault. What would you like me to do with it?",
      sources: [credentials[0].name],
      mode: 'chat',
      isDocument: false,
    };
  }

  // Real-time DuckDuckGo Web Search if enabled or requested
  let webSearchResults: WebSearchResult[] = [];
  const needsWebSearch =
    options.webSearch ||
    q.startsWith('search ') ||
    q.startsWith('search web') ||
    q.includes('search duckduckgo') ||
    q.includes('latest news') ||
    q.includes('current ranking') ||
    q.includes('who is') ||
    q.includes('what is the latest');

  if (needsWebSearch) {
    try {
      const cleanSearchQuery = rawQuery.replace(
        /^(search\s+(the\s+)?web\s+for|search\s+duckduckgo\s+for|search\s+for|search)\s+/i,
        ''
      );
      const searchData = await searchDuckDuckGo(cleanSearchQuery);
      webSearchResults = searchData.results || [];
    } catch (searchErr) {
      console.warn('DuckDuckGo search error:', searchErr);
    }
  }

  // 1. Call full-stack backend endpoint (/api/chat)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        mode: effectiveMode,
        history: options.history || [],
        webSearch: needsWebSearch,
        searchResults: webSearchResults,
        credentials: credentials.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          type: c.type,
          purpose: c.purpose,
          status: c.status,
          extractedDetails: c.extractedDetails,
        })),
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || data.error) {
      const errorMsg = data?.error || `Request failed with HTTP status ${response.status}.`;
      return {
        answer: `⚠️ Failed to respond: ${errorMsg}`,
        sources: [],
        provider: 'failed',
        mode: effectiveMode,
        isDocument: false,
      };
    }

    if (data && data.text) {
      const sources =
        data.sources ||
        (webSearchResults.length > 0
          ? webSearchResults.map((r) => r.title)
          : credentials.length > 0
          ? credentials.slice(0, 3).map((c) => c.name)
          : ['Kred AI']);

      const autoQuestions = getAutonomousQuestionsForQuery(query);
      const effectiveQuestions = (data.questions && data.questions.length > 0) ? data.questions : autoQuestions;

      const isDeliverableDoc =
        !effectiveQuestions &&
        (effectiveMode === 'agent' || intentAnalysis.isExplicitDocGeneration) &&
        (data.text.includes('# ') || data.text.includes('## ') || data.text.includes('### ') || data.text.includes('Card') || data.text.includes('Front') || data.text.includes('Slide') || data.text.includes('Receipt') || data.text.length > 150);

      return {
        answer: data.text,
        sources,
        actionLabel: isDeliverableDoc ? (data.actionLabel || 'Open in Preview Canvas') : undefined,
        provider: data.provider || 'gemini',
        questions: effectiveQuestions,
        form: data.form,
        searchResults: webSearchResults.length > 0 ? webSearchResults : undefined,
        mode: effectiveMode,
        isDocument: isDeliverableDoc,
      };
    }

    return {
      answer: '⚠️ Failed to respond. No output was returned by the AI model.',
      sources: [],
      provider: 'failed',
      mode: effectiveMode,
      isDocument: false,
    };
  } catch (err: any) {
    console.error('Backend /api/chat error:', err);
    return {
      answer: `⚠️ Failed to respond: ${err?.message || 'Unable to reach the AI model service. Please check your network connection.'}`,
      sources: [],
      provider: 'failed',
      mode: effectiveMode,
      isDocument: false,
    };
  }

};

export default getAiAuditResponse;
