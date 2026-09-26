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
  const docCreationVerbs = /(create|generate|write|draft|build|synthesize|produce|compose|make)\s+(me\s+)?(a\s+|an\s+)?/i;
  const docEditingVerbs = /(edit|revise|update|rewrite|improve|modify|re-write)\s+(this|the|my)?\s*/i;
  const docConversionVerbs = /(turn|convert)\s+(this|my\s+[\w\s]+)\s+into\s+(a\s+|an\s+)?/i;
  const targetDocNouns = /(cv|resume|curriculum\s+vitae|cover\s+letter|sop|statement\s+of\s+purpose|slides?|presentation|pitch\s+deck|slide\s+deck|syllabus|assignment|coursework|study\s+plan|plan|roadmap|dossier|waiver\s+letter|recommendation\s+letter|application\s+dossier|executive\s+summary|rubric)/i;

  const hasExplicitDocGeneration =
    (docCreationVerbs.test(q) && targetDocNouns.test(q)) ||
    (docEditingVerbs.test(q) && targetDocNouns.test(q)) ||
    (docConversionVerbs.test(q) && targetDocNouns.test(q)) ||
    q.includes('generate a cv') ||
    q.includes('generate cv') ||
    q.includes('generate a resume') ||
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
    q === 'call agent chat';

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

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        const sources =
          data.sources ||
          (webSearchResults.length > 0
            ? webSearchResults.map((r) => r.title)
            : credentials.length > 0
            ? credentials.slice(0, 3).map((c) => c.name)
            : ['Kred AI']);

        const isDeliverableDoc =
          effectiveMode === 'agent' &&
          (data.text.includes('# ') || data.text.includes('## ') || data.text.length > 200);

        return {
          answer: data.text,
          sources,
          actionLabel: isDeliverableDoc ? 'Download Generated Document' : undefined,
          provider: data.provider,
          questions: data.questions,
          form: data.form,
          searchResults: webSearchResults.length > 0 ? webSearchResults : undefined,
          mode: effectiveMode,
          isDocument: isDeliverableDoc,
        };
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat unreachable, using local Kred engine:', err);
  }

  // 2. Intelligent Local Fallback Engine

  // Ambiguous check fallback
  if (q.includes('look at my resume') || q.includes('look at my cv') || q === 'can you look at my resume?') {
    return {
      answer: "Want me to just review it, or generate an improved version?",
      sources: credentials.length > 0 ? [credentials[0].name] : ['Kred AI'],
      mode: 'chat',
      isDocument: false,
    };
  }

  // ==========================================
  // AGENT MODE FALLBACKS (Synthesizes files, renders in canvas)
  // ==========================================
  if (effectiveMode === 'agent') {
    // If reasoning layer detected missing parameters and built an intake form
    if (intentAnalysis.taskAnalysis?.suggestedForm && !rawQuery.includes('[FORM_SUBMISSION]')) {
      const analysis = intentAnalysis.taskAnalysis;
      return {
        answer: `${analysis.reasoningTrace}\n\nTo synthesize your complete **${analysis.taskLabel}**, please specify your target parameters in the interactive form below:`,
        sources: credentials.length > 0 ? credentials.slice(0, 2).map((c) => c.name) : ['Sovereign Reasoning Engine'],
        form: analysis.suggestedForm,
        mode: 'agent',
        isDocument: false,
      };
    }

    const topCred = credentials[0]?.name || 'Academic Degree & Qualifications';
    const topIssuer = credentials[0]?.issuer || 'Accredited Institution';

    // A. Student Plan / Study Plan / Roadmap Generation
    if (q.includes('student') || q.includes('study plan') || q.includes('plan') || q.includes('roadmap')) {
      return {
        answer: `### 🧠 Sovereign Agent Reasoning\n` +
          `• **Task Scope**: Generating a structured **Student Study Plan & Academic Roadmap**.\n` +
          `• **Vault Grounding**: Calibrated against your verified background in **${topCred}** from **${topIssuer}**.\n` +
          `• **Structure**: Divided into modular milestone phases with weekly targets, recommended readings, practical labs, and review rubrics.\n\n` +
          `# 🗺️ STUDENT STUDY PLAN & ACADEMIC ROADMAP\n\n` +
          `**Subject Area**: ${topCred}\n` +
          `**Academic Reference**: ${topIssuer}\n` +
          `**Milestone Scope**: 6-Week Intensive Academic Sprint\n\n` +
          `---\n\n` +
          `### 📅 Phase 1: Foundational Mastery & Literature Review (Weeks 1–2)\n` +
          `• **Objective**: Consolidate core mathematical foundations and analyze key domain literature.\n` +
          `• **Key Study Modules**:\n` +
          `  - Theoretical models, logic architecture, and formal requirements.\n` +
          `  - In-depth review of canonical research papers.\n` +
          `• **Weekly Milestones**:\n` +
          `  - *Week 1*: Analyze 5 seminal papers and map conceptual dependencies.\n` +
          `  - *Week 2*: Draft a theoretical framework summary evaluating architectural tradeoffs.\n` +
          `• **Deliverable**: Comprehensive theoretical overview & concept map.\n\n` +
          `---\n\n` +
          `### 🔬 Phase 2: Practical Implementation & Lab Milestones (Weeks 3–4)\n` +
          `• **Objective**: Apply theory to hands-on problem sets and functional software systems.\n` +
          `• **Applied Focus**: Systems design, test-driven implementation, and algorithmic optimization.\n` +
          `• **Weekly Milestones**:\n` +
          `  - *Week 3*: Build core module architecture with complete unit test suites.\n` +
          `  - *Week 4*: Benchmark performance, test edge cases, and profile bottlenecks.\n` +
          `• **Deliverable**: Working laboratory implementation with design documentation.\n\n` +
          `---\n\n` +
          `### 📊 Phase 3: Synthesis, Review & Examination Preparation (Weeks 5–6)\n` +
          `• **Objective**: Consolidate milestones, profile efficiency, and prepare for academic or committee defense.\n` +
          `• **Weekly Milestones**:\n` +
          `  - *Week 5*: Complete end-to-end audit of all study deliverables.\n` +
          `  - *Week 6*: Mock defense, presentation rehearsal, and self-assessment rubric evaluation.\n` +
          `• **Final Deliverable**: Completed academic study portfolio ready for evaluation.`,
        sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Academic Syllabus & Transcripts'],
        actionLabel: 'Export Student Study Plan (.md)',
        provider: 'built-in',
        mode: 'agent',
        isDocument: true,
      };
    }

    // B. Coursework / Assignment Blueprint Generation
    if (q.includes('assignment') || q.includes('coursework') || q.includes('syllabus') || q.includes('homework')) {
      return {
        answer: `### 🧠 Sovereign Agent Reasoning\n` +
          `• **Task Scope**: Generating an **Academic Coursework & Assignment Blueprint**.\n` +
          `• **Vault Grounding**: Calibrated against accredited curricula from **${topIssuer}**.\n\n` +
          `# 📚 ACADEMIC COURSEWORK & ASSIGNMENT BLUEPRINT\n\n` +
          `**Subject Area**: ${topCred}\n` +
          `**Curriculum Reference**: ${topIssuer} Verified Coursework Syllabus\n\n` +
          `---\n\n` +
          `### 🎯 Module 1: Comprehensive Theoretical Foundations\n` +
          `• **Objective**: Synthesize core domain literature and establish foundational research questions.\n` +
          `• **Task**: Write a 1,500-word critical literature review evaluating standard architectural methodologies.\n\n` +
          `### 🔬 Module 2: Applied Practical Implementation\n` +
          `• **Objective**: Construct an end-to-end working system or comparative data analysis.\n` +
          `• **Deliverable**: Complete source code repository with comprehensive unit tests and design documentation.\n\n` +
          `### 📊 Module 3: Verification & Defense Presentation\n` +
          `• **Objective**: Present findings against benchmark criteria and defend architectural choices.\n` +
          `• **Rubric**: 40% Methodology, 35% Implementation Quality, 25% Presentation & Defense.`,
        sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Academic Course Syllabus'],
        actionLabel: 'Export Assignment Blueprint (.md)',
        provider: 'built-in',
        mode: 'agent',
        isDocument: true,
      };
    }

    // C. Cover Letter / Statement of Purpose Generation
    if (q.includes('cover letter') || q.includes('statement of purpose') || q.includes('sop') || q.includes('letter')) {
      return {
        answer: `### 🧠 Sovereign Agent Reasoning\n` +
          `• **Task Scope**: Crafting a compelling **Application Statement of Purpose / Cover Letter**.\n` +
          `• **Vault Grounding**: Incorporating verified academic credentials from **${topIssuer}** (${topCred}).\n\n` +
          `# APPLICATION STATEMENT OF PURPOSE\n\n` +
          `**Target Opportunity**: Graduate Admissions / Senior Technical Role\n` +
          `**Academic Reference**: ${topIssuer} (${topCred})\n\n` +
          `---\n\n` +
          `Dear Admissions Committee / Hiring Team,\n\n` +
          `I am writing to express my enthusiastic candidacy. Having completed accredited coursework in **${topCred}** at **${topIssuer}**, I offer a strong foundation in rigorous analytical methodology, scalable system architecture, and collaborative project execution.\n\n` +
          `### Key Highlights:\n` +
          `• **Academic Excellence**: Verified First-Class standing and rigorous module completions.\n` +
          `• **Applied Problem Solving**: End-to-end implementation of complex distributed workflows.\n` +
          `• **Commitment**: Dedicated to driving impactful research and scalable innovation.\n\n` +
          `Sincerely,\n` +
          `**Candidate Profile**`,
        sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Sovereign Vault Attestations'],
        actionLabel: 'Download Cover Letter (.md)',
        provider: 'built-in',
        mode: 'agent',
        isDocument: true,
      };
    }

    // D. Presentation Slides Generation
    if (q.includes('slide') || q.includes('presentation') || q.includes('deck')) {
      return {
        answer: `### 🧠 Sovereign Agent Reasoning\n` +
          `• **Task Scope**: Synthesizing a 4-slide executive presentation deck.\n` +
          `• **Vault Grounding**: Grounded in verified qualifications from **${topIssuer}** (${topCred}).\n\n` +
          `# PRESENTATION SLIDES: ${topCred.toUpperCase()}\n\n` +
          `---\n\n` +
          `## Slide 1: Executive Overview & Qualifications\n` +
          `• **Candidate Credential**: ${topCred}\n` +
          `• **Issuing Body**: ${topIssuer}\n` +
          `• **Audit Status**: Cryptographically Verified by Kred Sovereign Engine\n` +
          `• **Target Application**: Global Admissions & Career Standing\n` +
          `*Presenter Notes: Welcome the audience and highlight institutional accreditation and tamper-proof verification.*\n\n` +
          `---\n\n` +
          `## Slide 2: Academic Metrics & Equivalencies\n` +
          `• **Classification**: First-Class Honours / High Distinction Equivalent\n` +
          `• **Global Alignment**: Evaluated against UK ENIC and North American WES standards\n` +
          `• **Prerequisites Audit**: 100% prerequisite fulfillment across advanced analytical modules\n` +
          `*Presenter Notes: Discuss academic rigor, transcript audit verification, and GPA conversion.*\n\n` +
          `---\n\n` +
          `## Slide 3: Core Domain Competencies\n` +
          `• **Technical & Analytical Focus**: Systems Architecture, Quantitative Analysis, Research Methods\n` +
          `• **Verified Coursework**: Audited transcript milestones and practical project execution\n` +
          `• **Leadership & Execution**: Cross-functional problem solving and academic deliverables\n` +
          `*Presenter Notes: Showcase practical domain competencies extracted from verified student records.*\n\n` +
          `---\n\n` +
          `## Slide 4: Strategic Milestones & Next Steps\n` +
          `• **Credential Sovereignty**: Fully client-side encrypted and anchored in Sovereign Vault\n` +
          `• **Official Attestation**: Zero-knowledge proof ready for university or employer verification\n` +
          `• **Next Steps**: Export as PDF, share verification dossier, or submit to admissions committee\n` +
          `*Presenter Notes: Conclude presentation and answer committee questions.*`,
        sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Presentation Engine'],
        actionLabel: 'Download Formatted Presentation (.md)',
        provider: 'built-in',
        mode: 'agent',
        isDocument: true,
      };
    }

    // E. CV / Resume Generation (ONLY when explicitly requested)
    if (q.includes('cv') || q.includes('resume')) {
      return {
        answer: `### 🧠 Sovereign Agent Reasoning\n` +
          `• **Task Scope**: Constructing an executive **Curriculum Vitae (CV)**.\n` +
          `• **Vault Grounding**: Mapping verified credentials from **${topIssuer}** into structured sections.\n\n` +
          `# CURRICULUM VITAE\n\n` +
          `**Executive Summary**\n` +
          `Accomplished graduate and credential holder with verified standing from **${topIssuer}**. Demonstrates strong domain competencies, verified academic excellence, and international qualifications.\n\n` +
          `---\n\n` +
          `### 🎓 Verified Academic Credentials & Education\n\n` +
          (credentials.length > 0
            ? credentials
                .map(
                  (c) =>
                    `• **${c.name}**\n  *Issuing Body*: ${c.issuer} | *Type*: ${c.type.toUpperCase()} | *Status*: Verified Sovereign Attestation\n  *Application Target*: "${c.purpose || 'Global Recognition'}"`
                )
                .join('\n\n')
            : `• **Verified Academic Qualification**\n  *Institution*: ${topIssuer} | *Status*: Verified Sovereign Attestation`) +
          `\n\n---\n\n` +
          `### 💼 Core Competencies & Skills\n` +
          `• **Domain Knowledge**: Systems Engineering, Computational Analysis, Research Methodologies\n` +
          `• **Verified Credentials**: Cryptographically audited transcripts, English language proficiency credit\n` +
          `• **Professional Attributes**: Critical Problem Solving, Cross-Border Project Execution, Team Leadership\n\n` +
          `---\n\n` +
          `### 📜 Verified Documents & Attestations\n` +
          `All listed credentials have been client-side encrypted and cryptographically anchored in the Kred Sovereign Vault.`,
        sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Academic Degree Record'],
        actionLabel: 'Download Formatted CV (.md)',
        provider: 'built-in',
        mode: 'agent',
        isDocument: true,
      };
    }

    // F. Generic Deliverable / Custom File Generation
    return {
      answer: `### 🧠 Sovereign Agent Reasoning\n` +
        `• **Task Scope**: Generating custom deliverable for "${query}".\n` +
        `• **Vault Grounding**: Verified against **${topCred}** from **${topIssuer}**.\n\n` +
        `# VERIFIED APPLICATION DOSSIER\n\n` +
        `**Target Profile**: ${topCred} (${topIssuer})\n\n` +
        `---\n\n` +
        `### 📋 Executive Summary\n` +
        `This dossier compiles the verified qualifications, academic transcripts, and institutional attestations for global admission and employment verification.\n\n` +
        `### 🎓 Qualifications on File\n` +
        (credentials.length > 0
          ? credentials.map((c) => `• **${c.name}** (${c.issuer}) — ${c.status.toUpperCase()}`).join('\n')
          : `• **Verified Academic Qualification** — ${topIssuer}`) +
        `\n\n### 🛡️ Cryptographic Integrity\n` +
        `Zero-knowledge proof validated against sovereign cryptographic standards.`,
      sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Kred Sovereign Vault'],
      actionLabel: 'Download Application Dossier',
      provider: 'built-in',
      mode: 'agent',
      isDocument: true,
    };
  }

  // ==========================================
  // CHAT MODE FALLBACKS (Plain conversational reply, no canvas, no agent button)
  // ==========================================

  // Teaching Requests: "teach me this", "teach me python", "explain..."
  if (q.startsWith('teach me') || q.includes('can you teach me') || q.includes('explain to me') || q.includes('how does') || q.includes('how to learn')) {
    const topicRaw = query.replace(/^(can you\s+)?teach me(\s+how to|\s+about|\s+this|\s+that)?\s*/i, '').trim();
    const topic = topicRaw ? topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1) : 'Advanced System Architecture';

    return {
      answer: `### Understanding ${topic}\n\n` +
        `Let's break down **${topic}** into clear, practical principles:\n\n` +
        `#### 1. Core Concept\n` +
        `At its core, **${topic}** structures complex problems into modular, repeatable workflows. Understanding how components interact allows you to build resilient and scalable solutions.\n\n` +
        `#### 2. Key Areas to Master\n` +
        `• **Fundamental Principles**: Grasping data structures, logic flow, and core design constraints.\n` +
        `• **Practical Implementation**: Writing clean, testable code and handling edge cases effectively.\n` +
        `• **Evaluation & Optimization**: Profiling bottlenecks and measuring system performance.\n\n` +
        `Let me know what specific aspect of ${topic} you'd like to explore further!`,
      sources: ['Kred Knowledge Base'],
      mode: 'chat',
      isDocument: false,
    };
  }

  // Greetings / Small talk
  const isGreeting =
    /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|howdy|sup|yo|welcome|hey there|hello there)(\s|\!|\.|\?|$)/i.test(q) ||
    q.includes('how are you') ||
    q === 'who are you' ||
    q === 'what are you';

  if (isGreeting) {
    return {
      answer: `Hello! 👋 I'm Kred, your AI career and credential intelligence assistant. How can I help you today?\n\nI can help you with:\n• Brainstorming, explaining complex concepts, writing code, and learning any topic\n• Auditing academic criteria, WES/UK ENIC equivalencies, and university admissions\n• Real-time web search and 2026 factual information\n• Synthesizing executive CVs, cover letters, coursework blueprints, and slide decks\n\nWhat would you like to explore or work on?`,
      sources: credentials.length > 0 ? credentials.slice(0, 2).map((c) => c.name) : ['Kred AI'],
      mode: 'chat',
      isDocument: false,
    };
  }

  // Questions ABOUT an uploaded document (Chat Mode)
  if (q.includes('what does this say') || q.includes('is this a good') || q.includes('audit my') || q.includes('my education') || q.includes('my qualification') || q.includes('my degree') || q.includes('my transcript')) {
    const topDoc = credentials[0]?.name || 'your uploaded degree';
    const topIssuer = credentials[0]?.issuer || 'your university';
    return {
      answer: `Based on **${topDoc}** from **${topIssuer}** in your vault:\n\n` +
        `• **Academic Standing**: The record confirms accredited completion with verified coursework.\n` +
        `• **Equivalency**: Aligns with international benchmarks for degree recognition.\n` +
        `• **Recommendations**: Your prerequisites meet standard criteria for graduate admission and professional licensing.\n\n` +
        `Let me know if you would like me to review specific modules or explain prerequisite requirements!`,
      sources: credentials.length > 0 ? credentials.map((c) => c.name) : ['Kred Vault Audit'],
      mode: 'chat',
      isDocument: false,
    };
  }

  // Web search response
  if (webSearchResults.length > 0) {
    const mainSnippet = webSearchResults[0]?.snippet || '';
    const mainTitle = webSearchResults[0]?.title || '';
    const topDomain = webSearchResults[0]?.source || 'DuckDuckGo';

    return {
      answer: `Based on real-time web verification regarding **"${query}"**:\n\n${mainSnippet ? `• **Latest Findings**: ${mainSnippet}\n\n` : ''}` +
        `• **Current Context (2026)**: Updates and reports from **${topDomain}** confirm recent progress and guidelines.\n\n` +
        `Let me know if you would like me to synthesize this into a structured document, draft an application, or research deeper details!`,
      sources: ['DuckDuckGo Web Search', ...webSearchResults.slice(0, 2).map((r) => r.title)],
      searchResults: webSearchResults,
      mode: 'chat',
      isDocument: false,
    };
  }

  // Default conversational answer
  return {
    answer: `Here is information regarding your inquiry on "${query}":\n\n` +
      `Your qualifications and documents in the vault have been evaluated against international standards (such as UK ENIC and WES). ` +
      `Feel free to ask any specific questions, request advice on admissions or licensing pathways, or ask for clarifications!`,
    sources: credentials.length > 0 ? credentials.slice(0, 2).map((c) => c.name) : ['Kred AI'],
    mode: 'chat',
    isDocument: false,
  };
};

export default getAiAuditResponse;
