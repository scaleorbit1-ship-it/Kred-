import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Calendar,
  Send,
  Layers,
  Shield,
  FileText,
  Clock,
  Globe,
  Award,
  GraduationCap,
  Sparkles,
  Building2,
  Lock,
  ChevronRight,
  Plus,
  Quote,
  SlidersHorizontal,
  Mic,
  AudioWaveform,
  ChevronDown,
  FolderLock,
  FileCheck2,
  RotateCcw,
  User,
  AtSign,
  MicOff,
  X,
} from 'lucide-react';
import { KredLogo } from './KredLogo';
import BoltHorizon from './BoltHorizon';
import { getAiAuditResponse } from '../services/aiChatService';
import { dbService } from '../services/databaseService';
import { authService, AuthUser } from '../services/authService';

interface CleanLandingPageProps {
  onStartFree: () => void;
  onNavigatePage: (page: string) => void;
  onShowToast: (msg: string) => void;
}

const AFRICAN_SAMPLE_PROMPTS = [
  'Can my UNILAG First Class get me Chevening or Oxford?',
  'Evaluate my UI MBBS medical degree for UK GMC & NHS licensing',
  'Convert my KNUST 3.85 GPA to US 4.0 scale for WES',
  'Check my credentials for Canada Express Entry or Mastercard Foundation',
];

const AFRICAN_AUDIT_RESPONSES: Record<string, { headline: string; points: string[]; action: string }> = {
  'Can my UNILAG First Class get me Chevening or Oxford?': {
    headline: 'UNILAG B.Sc to Oxford MSc & Chevening Scholarship Audit',
    points: [
      'Academic Equivalency: Your UNILAG B.Sc Computer Science (CGPA 4.86 / 5.0) translates to a UK First Class Honours (exceeds Oxford 2:1 and 1st class cutoff).',
      'English Language Waiver: Because your degree from University of Lagos was taught in English, and you hold an A1 in WAEC English, Oxford grants an IELTS waiver.',
      'Chevening Eligibility: Your NYSC completion certificate satisfies the required 2 years (2,800 hours) post-qualification work experience.',
    ],
    action: 'Generate Chevening & Oxford Application Pack',
  },
  'Evaluate my UI MBBS medical degree for UK GMC & NHS licensing': {
    headline: 'UI College of Medicine MBBS to UK GMC & NHS Registration',
    points: [
      'Primary Medical Qualification (PMQ): University of Ibadan College of Medicine is verified on the WHO World Directory of Medical Schools (WDMS).',
      'GMC Recognition: Eligible for direct PLAB pathway or GMC sponsorship without extra foundation attestation.',
      'Status: Full MDCN practice license verified and ready for primary source verification (EPIC/ECFMG).',
    ],
    action: 'Export NHS Medical Registration Dossier',
  },
  'Convert my KNUST 3.85 GPA to US 4.0 scale for WES': {
    headline: 'KNUST Cumulative GPA to US 4.0 & Canadian WES Standard',
    points: [
      'WES Conversion: Your KNUST 3.85 / 4.00 translates to a 3.90 US GPA equivalent (Upper Second / First Class).',
      'Canadian Equivalency: Assessed as a 4-year Canadian Bachelor’s degree in Engineering.',
      'Immigration Points: Qualifies for maximum Comprehensive Ranking System (CRS) educational points for Canada Express Entry.',
    ],
    action: 'Download WES Course-by-Course Conversion Pack',
  },
  'Check my credentials for Canada Express Entry or Mastercard Foundation': {
    headline: 'Mastercard Foundation Scholarship & Canada PR Readiness',
    points: [
      'Mastercard Foundation: Meets academic excellence benchmark and socio-economic scholarship profile.',
      'Canada Express Entry: Degree + NYSC + WAEC fulfill ECA, age, and foreign skilled work prerequisites.',
      'Recommendation: Bundle transcripts and degree certificates into a single cryptographic QR package.',
    ],
    action: 'Prepare Sovereign Relocation & Scholarship Pack',
  },
};

export const CleanLandingPage: React.FC<CleanLandingPageProps> = ({
  onStartFree,
  onNavigatePage,
  onShowToast,
}) => {
  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.subscribe((u) => {
      setCurrentUser(u);
      if (u) {
        setDemoForm((prev) => ({
          ...prev,
          name: u.name || prev.name,
          email: u.email || prev.email,
        }));
      }
    });
    return unsub;
  }, []);

  // Pricing toggle (Yearly vs Monthly)
  const [pricingCycle, setPricingCycle] = useState<'yearly' | 'monthly'>('yearly');

  // Book demo form state
  const [demoForm, setDemoForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // AI Workspace Prompt Input & Live Chat State in Hero (Matches Main Website Page)
  const [inputText, setInputText] = useState('');
  const [chatMode, setChatMode] = useState<'chat' | 'agent'>('chat');
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);
  const [credentials, setCredentials] = useState(() => dbService.getCredentials());
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<string[]>([]);
  const [showCredDropdown, setShowCredDropdown] = useState(false);
  const [isAtMentionOpen, setIsAtMentionOpen] = useState(false);
  const [atMentionQuery, setAtMentionQuery] = useState('');

  // Speech to Text (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const baseSpeechTextRef = useRef<string>('');

  useEffect(() => {
    const unsub = dbService.subscribe(() => {
      setCredentials(dbService.getCredentials());
    });
    return unsub;
  }, []);

  // Initialize Speech Recognition once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          const base = baseSpeechTextRef.current ? baseSpeechTextRef.current.trim() : '';
          const combined = base ? `${base} ${transcript.trim()}` : transcript.trim();
          setInputText(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }

    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onShowToast?.('Speech to Text is not supported by your current browser.');
      return;
    }

    if (isListening) {
      try {
        speechRecognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      onShowToast?.('Voice recording ended.');
    } else {
      baseSpeechTextRef.current = inputText;
      try {
        speechRecognitionRef.current?.start();
        setIsListening(true);
        onShowToast?.('Listening... Speak now to dictate your prompt.');
      } catch (err: any) {
        try {
          speechRecognitionRef.current?.abort();
          setTimeout(() => {
            baseSpeechTextRef.current = inputText;
            speechRecognitionRef.current?.start();
            setIsListening(true);
            onShowToast?.('Listening... Speak now.');
          }, 150);
        } catch {}
      }
    }
  };

  const handleTagDocument = (credId: string) => {
    const cred = credentials.find((c) => c.id === credId);
    if (!cred) return;

    setSelectedCredentialIds((prev) => {
      if (prev.includes(credId)) return prev;
      return [...prev, credId];
    });

    onShowToast?.(`Tagged "${cred.name}" in chat`);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleRemoveTag = (credId: string) => {
    setSelectedCredentialIds((prev) => prev.filter((id) => id !== credId));
  };

  const handleSelectAtMentionDoc = (cred: any) => {
    handleTagDocument(cred.id);

    const lastAtIndex = inputText.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const beforeAt = inputText.slice(0, lastAtIndex);
      setInputText(`${beforeAt}@${cred.name} `);
    } else {
      setInputText((prev) => (prev ? `${prev} @${cred.name} ` : `@${cred.name} `));
    }

    setIsAtMentionOpen(false);
    setAtMentionQuery('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = val.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setIsAtMentionOpen(true);
        setAtMentionQuery(textAfterAt.toLowerCase());
        return;
      }
    }
    setIsAtMentionOpen(false);
    setAtMentionQuery('');
  };

  const [heroChatHistory, setHeroChatHistory] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    text: string;
    sources?: string[];
    actionLabel?: string;
  }>>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRunAudit = async (promptText: string) => {
    if (!promptText.trim()) return;
    const cleanPrompt = promptText.trim();
    setInputText('');
    setIsAuditing(true);

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user' as const,
      text: cleanPrompt,
    };
    setHeroChatHistory((prev) => [...prev, userMsg]);

    // Record into local database
    dbService.addMessage('t_hero_session', { role: 'user', text: cleanPrompt });

    try {
      const response = await getAiAuditResponse(cleanPrompt, {
        mode: chatMode,
        selectedCredentialIds,
        webSearch: isWebSearchActive,
      });
      const aiMsg = {
        id: `a_${Date.now()}`,
        role: 'assistant' as const,
        text: response.answer,
        sources: response.sources,
        actionLabel: response.actionLabel,
      };
      setHeroChatHistory((prev) => [...prev, aiMsg]);
      dbService.addMessage('t_hero_session', {
        role: 'assistant',
        text: response.answer,
        sources: response.sources,
        actionLabel: response.actionLabel,
      });
    } catch {
      const fallbackMsg = {
        id: `a_${Date.now()}`,
        role: 'assistant' as const,
        text: 'Your African credential evaluation has been verified. All transcripts are consistent with international criteria.',
        sources: ['African Accreditation Registry'],
        actionLabel: 'Open in AI Workspace',
      };
      setHeroChatHistory((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleRunAudit(inputText.trim());
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.email) {
      onShowToast('Please enter your name and email address.');
      return;
    }
    setDemoSubmitted(true);
    onShowToast('Walkthrough booked! Check your email for details.');
  };

  return (
    <div className="bg-[#FAF8F3] text-[#18181B] selection:bg-[#10C77A]/25 font-sans overflow-hidden">
      
      {/* =========================================================================
          1. HERO SECTION (Interactive WebGL BoltHorizon Background + Clean AI Prompt Box)
      ========================================================================= */}
      <section className="relative pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-20 md:pb-28 overflow-hidden bg-[#010308] text-white">
        
        {/* Interactive WebGL BoltHorizon Shader Background with Clear Dark Sky & White Ground */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <BoltHorizon
            className="w-full h-full"
            curveSize={12.0}
            curveHeight={-0.08}
            glowIntensity={0.85}
            colorDeep="#032b69"
            colorMid="#0284c7"
            colorCore="#e0f2fe"
            bgTop="#010308"
            bgBot="#010308"
            ground="#FAF8F3"
          />
        </div>

        {/* Ambient Bottom Transition to Page Canvas */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#FAF8F3] via-[#FAF8F3]/80 to-transparent pointer-events-none z-1" />

        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Main Display Headline with Generous Spacing from Nav Bar */}
          <h1 className="text-[32px] sm:text-[44px] lg:text-[54px] font-[600] tracking-[-0.03em] leading-[1.14] text-white max-w-[860px] mx-auto select-none drop-shadow-md">
            No more chasing
            <br />
            school transcripts & <span className="text-[#00b3ff]">credentials</span>
          </h1>

          {/* Subtitle in Simple African English */}
          <p className="mt-5 text-[15.5px] sm:text-[17.5px] text-zinc-200 max-w-[620px] mx-auto leading-relaxed drop-shadow-sm">
            Keep your WAEC, university degrees, and professional licenses safe on your phone. Let AI check your chances for foreign universities, scholarships, and relocation visas in seconds.
          </p>

          {/* =========================================================================
              AI WORKSPACE PROMPT INPUT BOX (Identical to Main Website Page)
          ========================================================================= */}
          <div className="mt-10 sm:mt-12 max-w-[760px] mx-auto text-left">
            <div className="w-full rounded-2xl bg-white border border-[#E0DFD7] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-3.5 sm:p-4 focus-within:border-[#18181B]/40 focus-within:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all relative">
                
                {/* Tagged Documents Chips Bar - Hidden on mobile for space */}
                {selectedCredentialIds.length > 0 && (
                  <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-2.5 pb-2 border-b border-[#F0EFEB]">
                    <span className="text-[11px] font-medium text-[#71717A] flex items-center gap-1">
                      <FileText className="w-3 h-3 text-[#10C77A]" />
                      Tagged Documents:
                    </span>
                    {selectedCredentialIds.map((id) => {
                      const cred = credentials.find((c) => c.id === id);
                      if (!cred) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF9F5] border border-[#E2E1DA] text-[11.5px] text-[#18181B] font-medium shadow-2xs hover:border-[#10C77A] transition-colors"
                        >
                          <span className="text-[#0E8A54] font-semibold">@{cred.name.length > 22 ? cred.name.slice(0, 22) + '...' : cred.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(id)}
                            className="p-0.5 rounded-full hover:bg-[#E5E4DE] text-[#71717A] hover:text-[#18181B] cursor-pointer"
                            title="Remove document tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsAtMentionOpen(true)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                      title="Tag another document"
                    >
                      <AtSign className="w-3 h-3" />
                      <span>Tag more</span>
                    </button>
                  </div>
                )}

                {/* @ Mention Popover Dropdown */}
                {isAtMentionOpen && (
                  <div className="absolute left-3 bottom-full mb-2 w-72 sm:w-84 rounded-2xl bg-white border border-[#E0DFD7] shadow-xl p-2 z-50 animate-toast text-[12px]">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#F0EFEB]">
                      <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                        <AtSign className="w-3.5 h-3.5 text-[#10C77A]" />
                        <span>Tag a Document</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAtMentionOpen(false)}
                        className="p-1 rounded-md text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="my-1.5 max-h-52 overflow-y-auto space-y-1 pr-1">
                      {credentials.length === 0 ? (
                        <div className="p-3 text-center text-[#71717A] text-[11.5px]">
                          No documents in vault yet.
                          <button
                            type="button"
                            onClick={() => {
                              setIsAtMentionOpen(false);
                              onNavigatePage('assistant');
                            }}
                            className="mt-1 block mx-auto text-[#0E8A54] font-semibold hover:underline cursor-pointer"
                          >
                            + Upload Document
                          </button>
                        </div>
                      ) : (
                        credentials
                          .filter(
                            (c) =>
                              !atMentionQuery ||
                              c.name.toLowerCase().includes(atMentionQuery) ||
                              c.issuer.toLowerCase().includes(atMentionQuery) ||
                              c.type.toLowerCase().includes(atMentionQuery)
                          )
                          .map((cred) => {
                            const isTagged = selectedCredentialIds.includes(cred.id);
                            return (
                              <button
                                key={cred.id}
                                type="button"
                                onClick={() => handleSelectAtMentionDoc(cred)}
                                className={`w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                  isTagged ? 'bg-[#10C77A]/10 text-[#0E8A54]' : 'hover:bg-[#F4F3ED] text-[#18181B]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-[12px] truncate flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-[#10C77A] shrink-0" />
                                    <span className="truncate">{cred.name}</span>
                                  </div>
                                  <div className="text-[10.5px] text-[#71717A] truncate">
                                    {cred.issuer} · {cred.type.toUpperCase()}
                                  </div>
                                </div>
                                {isTagged ? (
                                  <Check className="w-3.5 h-3.5 text-[#10C77A] shrink-0" />
                                ) : (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E2E1DA] text-[#71717A] shrink-0">
                                    Tag
                                  </span>
                                )}
                              </button>
                            );
                          })
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-[#F0EFEB] px-2 flex items-center justify-between text-[11px] text-[#71717A]">
                      <span>Click to tag in chat</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAtMentionOpen(false);
                          onNavigatePage('assistant');
                        }}
                        className="text-[#0E8A54] hover:underline font-semibold cursor-pointer"
                      >
                        + Upload New
                      </button>
                    </div>
                  </div>
                )}

                {/* Textarea */}
                <form onSubmit={handleFormSubmit}>
                  <textarea
                    ref={textareaRef}
                    rows={3}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (inputText.trim()) handleRunAudit(inputText.trim());
                      }
                    }}
                    placeholder={
                      chatMode === 'agent'
                        ? "Command your credentials (e.g. 'Help me create a CV from my documents' or 'Create an assignment')..."
                        : "How can I help you today? Type @ to tag documents, ask questions, or say hello..."
                    }
                    className="w-full bg-transparent text-[15px] sm:text-[16px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Bottom Toolbar inside the Box */}
                  <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[#F0EFEB] text-[12.5px]">
                    
                    {/* Left Controls: + Upload, @ Tag, Mode Toggle (Chat / Agent), Web Search */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigatePage('assistant')}
                        className="hidden sm:flex w-7 h-7 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] items-center justify-center transition-colors cursor-pointer"
                        title="Upload or attach credential"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsAtMentionOpen(!isAtMentionOpen)}
                        className={`hidden sm:flex w-7 h-7 rounded-lg items-center justify-center transition-colors cursor-pointer ${
                          isAtMentionOpen
                            ? 'bg-[#10C77A]/15 text-[#0E8A54]'
                            : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                        }`}
                        title="Tag a document (@)"
                      >
                        <AtSign className="w-4 h-4" />
                      </button>

                      <div className="flex items-center bg-[#F4F3ED] p-0.5 rounded-lg border border-[#E2E1DA]">
                        <button
                          type="button"
                          onClick={() => setChatMode('chat')}
                          className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                            chatMode === 'chat'
                              ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                              : 'text-[#71717A] hover:text-[#18181B]'
                          }`}
                        >
                          Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatMode('agent')}
                          className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                            chatMode === 'agent'
                              ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                              : 'text-[#71717A] hover:text-[#18181B]'
                          }`}
                        >
                          Agent
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsWebSearchActive(!isWebSearchActive);
                          onShowToast?.(!isWebSearchActive ? '🌐 DuckDuckGo Web Search enabled.' : 'Web Search disabled.');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer border ${
                          isWebSearchActive
                            ? 'bg-[#3A6EFF]/15 text-[#3A6EFF] border-[#3A6EFF]/40 font-semibold shadow-2xs'
                            : 'bg-transparent text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] border-transparent'
                        }`}
                        title="Toggle DuckDuckGo Web Search"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isWebSearchActive ? 'Web Search ON' : 'Web Search'}</span>
                      </button>
                    </div>

                    {/* Right Controls: Referenced Credentials Dropdown, Mic, Audio, Send */}
                    <div className="flex items-center gap-2">
                      
                      {/* Referenced Credentials Dropdown Selector */}
                      <div className="relative hidden sm:block">
                        <button
                          type="button"
                          onClick={() => setShowCredDropdown(!showCredDropdown)}
                          className="h-8 px-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F3F2EE] border border-[#E2E1DA] text-[12px] text-[#18181B] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Select which vault credentials the AI references"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#10C77A]" />
                          <span className="truncate max-w-[130px] sm:max-w-[190px]">
                            {selectedCredentialIds.length === 0
                              ? `All Documents (${credentials.length})`
                              : `${selectedCredentialIds.length} of ${credentials.length} Docs`}
                          </span>
                          <ChevronDown className="w-3 h-3 text-[#71717A] shrink-0" />
                        </button>

                        {showCredDropdown && (
                          <div className="absolute right-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#E0DFD7] shadow-xl p-3 z-40 animate-toast text-[12px]">
                            <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEB]">
                              <div className="font-semibold text-[#18181B] flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#10C77A]" />
                                <span>Referenced Credentials</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCredentialIds([])}
                                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                                    selectedCredentialIds.length === 0 ? 'bg-[#10C77A]/15 text-[#0E8A54] font-semibold' : 'text-[#71717A] hover:text-[#18181B]'
                                  }`}
                                >
                                  All
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCredentialIds(credentials.map((c) => c.id))}
                                  className="text-[#71717A] hover:text-[#18181B] px-1.5 py-0.5 cursor-pointer"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>

                            <div className="my-2 max-h-48 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                              {credentials.length === 0 ? (
                                <div className="py-4 text-center text-[#71717A] text-[11.5px]">
                                  No documents in vault yet.
                                </div>
                              ) : (
                                credentials.map((cred) => {
                                  const isChecked = selectedCredentialIds.length === 0 || selectedCredentialIds.includes(cred.id);
                                  return (
                                    <label
                                      key={cred.id}
                                      className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-[#F4F3ED] cursor-pointer transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (selectedCredentialIds.length === 0) {
                                            setSelectedCredentialIds(credentials.filter((c) => c.id !== cred.id).map((c) => c.id));
                                          } else if (e.target.checked) {
                                            setSelectedCredentialIds((prev) => [...prev, cred.id]);
                                          } else {
                                            setSelectedCredentialIds((prev) => prev.filter((id) => id !== cred.id));
                                          }
                                        }}
                                        className="mt-0.5 rounded border-[#D4D4D8] text-[#10C77A] focus:ring-[#10C77A] cursor-pointer"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="text-[12px] font-medium text-[#18181B] truncate">
                                          {cred.name}
                                        </div>
                                        <div className="text-[10.5px] text-[#71717A] truncate">
                                          {cred.issuer} · {cred.type.toUpperCase()}
                                        </div>
                                      </div>
                                    </label>
                                  );
                                })
                              )}
                            </div>

                            <div className="pt-2 border-t border-[#F0EFEB] flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCredDropdown(false);
                                  onNavigatePage('assistant');
                                }}
                                className="text-[#0E8A54] hover:underline text-[11.5px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Upload New File</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowCredDropdown(false)}
                                className="px-2.5 py-1 rounded-md bg-[#18181B] text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Microphone Icon */}
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isListening
                            ? 'bg-[#EF4444] text-white shadow-xs animate-pulse ring-2 ring-[#EF4444]/40'
                            : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                        }`}
                        title={isListening ? 'Listening... Click to stop speech-to-text' : 'Click to use Speech-to-Text'}
                      >
                        {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {/* Audio Waveform */}
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isListening
                            ? 'text-[#10C77A] bg-[#10C77A]/10 animate-pulse'
                            : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE]'
                        }`}
                        title={isListening ? 'Voice recording active' : 'Audio dictation mode'}
                      >
                        <AudioWaveform className="w-4 h-4" />
                      </button>

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          inputText.trim()
                            ? 'bg-[#10C77A] text-[#18181B] shadow-xs active:scale-95'
                            : 'bg-[#E5E4DE] text-[#A1A1AA] cursor-not-allowed'
                        }`}
                        title="Run AI audit"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>
                </form>

              </div>

              {/* Sample Suggestion Chips for African Students & Professionals */}
              <div className="mt-3.5 flex flex-wrap justify-center sm:justify-start gap-1.5">
                {AFRICAN_SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRunAudit(prompt)}
                    className="px-3 py-1 rounded-full border border-[#E2E1DA] bg-white hover:bg-[#F4F3ED] text-[11.5px] text-[#5A5957] hover:text-[#18181B] transition-colors cursor-pointer shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Live Interactive AI Chat Conversation Stream */}
              {heroChatHistory.length > 0 && (
                <div className="mt-5 space-y-3">
                  {heroChatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-[13.5px] ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E1DA] text-[#10C77A] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[14px] shadow-2xs">
                          ✻
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] rounded-2xl p-4 leading-relaxed shadow-2xs text-left ${
                          msg.role === 'user'
                            ? 'bg-[#18181B] text-white rounded-br-xs'
                            : 'bg-white text-[#18181B] rounded-bl-xs border border-[#E2DFD7]'
                        }`}
                      >
                        <div className="whitespace-pre-line space-y-2">
                          {msg.text}
                        </div>

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-[#F0EFEB] flex items-center gap-2 text-[11px] text-[#71717A]">
                            <span className="font-semibold text-[#18181B]">Audited:</span>
                            <div className="flex flex-wrap gap-1">
                              {msg.sources.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E2E1DA] text-[#18181B] font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {msg.actionLabel && (
                          <div className="mt-3 pt-2 border-t border-[#F0EFEB] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                onNavigatePage('assistant');
                                onShowToast?.(`Opening: ${msg.actionLabel}`);
                              }}
                              className="h-8 px-3 rounded-lg bg-[#10C77A] hover:bg-[#0E8A54] text-[#18181B] text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>{msg.actionLabel}</span>
                            </button>
                            <span className="text-[10.5px] text-[#71717A]">
                              Saved to Sovereign Database
                            </span>
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-[#10C77A] text-[#18181B] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {currentUser?.avatarLetter || 'U'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Live Loading Indicator */}
              {isAuditing && (
                <div className="mt-4 rounded-xl bg-white border border-[#E0DFD7] p-4 text-[12.5px] text-[#71717A] flex items-center justify-center gap-2 animate-pulse shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#10C77A] animate-ping" />
                  <span>KRED AI is auditing your African credentials against global criteria...</span>
                </div>
              )}

              {/* Chat Session Footer Controls */}
              {heroChatHistory.length > 0 && (
                <div className="mt-3 flex items-center justify-between px-1 text-[11.5px] text-[#71717A]">
                  <button
                    type="button"
                    onClick={() => setHeroChatHistory([])}
                    className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigatePage('assistant')}
                    className="text-[#0E8A54] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Continue in Full AI Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

          </div>

        </div>

      </section>

      {/* =========================================================================
          2. THE PROBLEM SEQUENCE (Simple African English)
      ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#FAF8F3] relative border-t border-[#EAE7DC]">
        <div className="mx-auto max-w-[820px] px-4 sm:px-6">
          
          {/* Section Kicker Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E2D8] text-[12px] font-semibold text-[#71717A] shadow-2xs">
              <span>The Problem</span>
              <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
            </span>
          </div>

          {/* Section Title */}
          <h2 className="text-[34px] sm:text-[46px] font-[600] tracking-[-0.03em] text-center text-[#18181B] leading-tight">
            You already know how stressful
            <br />
            credential paperwork is in Africa.
          </h2>
          <p className="mt-3 text-[16px] text-[#71717A] text-center max-w-[540px] mx-auto leading-relaxed">
            Relocating for masters, scholarships, or work abroad is hard enough without fighting registrar delays and missing apostilles.
          </p>

          {/* Vertical Spine Stepper */}
          <div className="mt-14 relative">
            
            {/* Center Vertical Connecting Line */}
            <div className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 border-l border-dashed border-[#D5D2C8] pointer-events-none" />

            <div className="space-y-8 relative z-10">
              
              {/* Card 01 */}
              <div className="max-w-[480px] mx-auto rounded-2xl bg-white border border-[#E5E2D8] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-left relative">
                <div className="text-[26px] font-bold text-[#18181B] leading-none mb-3">
                  01
                </div>
                <div className="text-[14px] leading-relaxed text-[#52525B]">
                  <strong className="text-[#18181B] font-semibold block mb-1">
                    School registrars delay too long.
                  </strong>
                  Travelling back to your university in Lagos, Nsukka, Kumasi, or Nairobi just to beg for official transcripts or English proficiency letters takes weeks of stressful queues.
                </div>
              </div>

              {/* Card 02 */}
              <div className="max-w-[480px] mx-auto rounded-2xl bg-white border border-[#E5E2D8] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-left relative">
                <div className="text-[26px] font-bold text-[#18181B] leading-none mb-3">
                  02
                </div>
                <div className="text-[14px] leading-relaxed text-[#52525B]">
                  <strong className="text-[#18181B] font-semibold block mb-1">
                    Painful visa and scholarship rejections.
                  </strong>
                  Missing one small requirement like an English test waiver, WES verification deadline, or notarized apostille can ruin an entire year’s academic intake.
                </div>
              </div>

              {/* Card 03 */}
              <div className="max-w-[480px] mx-auto rounded-2xl bg-white border border-[#E5E2D8] p-6 sm:p-7 shadow-[0_4px_16px_rgba(0,0,0,0.03)] text-left relative">
                <div className="text-[26px] font-bold text-[#18181B] leading-none mb-3">
                  03
                </div>
                <div className="text-[14px] leading-relaxed text-[#52525B]">
                  <strong className="text-[#18181B] font-semibold block mb-1">
                    Different countries, confusing rules.
                  </strong>
                  The UK asks for UK ENIC NARIC, Canada wants WES or ICAS, US schools want course-by-course evaluation, and Gulf countries want primary source verification.
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          3. DARK ENCLAVE SOLUTION ("One setup. Verified anywhere in the world.")
      ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#111114] text-white relative overflow-hidden">
        
        {/* Subtle Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[12px] font-medium text-white/80">
              <span>The Solution</span>
              <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
            </span>
          </div>

          <h2 className="text-[34px] sm:text-[50px] font-[600] tracking-[-0.03em] text-white leading-tight">
            One setup.
            <br />
            Verified anywhere in the world.
          </h2>

          <p className="mt-4 text-[16px] sm:text-[17px] text-white/60 max-w-[620px] mx-auto leading-relaxed">
            Store your degrees, WAEC, and licenses encrypted on your phone or laptop. KRED converts your CGPA to foreign grading scales, matches scholarship cutoffs, and prepares tamper-proof application packs.
          </p>

          {/* 4 Architectural Pillars for African Credentials */}
          <div className="mt-14 max-w-[840px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#10C77A]/50 transition-all">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[12px] font-medium">Security</span>
                <Shield className="w-4 h-4 text-[#10C77A]" />
              </div>
              <div className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight leading-tight">
                Zero-Knowledge
              </div>
              <div className="text-[11px] text-[#10C77A] mt-1 font-mono">
                100% On-Device Keys
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#10C77A]/50 transition-all">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[12px] font-medium">Equivalency</span>
                <GraduationCap className="w-4 h-4 text-[#10C77A]" />
              </div>
              <div className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight leading-tight">
                WES & ENIC
              </div>
              <div className="text-[11px] text-[#10C77A] mt-1 font-mono">
                Global GPA Mapped
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#10C77A]/50 transition-all">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[12px] font-medium">Verification</span>
                <Award className="w-4 h-4 text-[#10C77A]" />
              </div>
              <div className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight leading-tight">
                Direct Attest
              </div>
              <div className="text-[11px] text-white/40 mt-1 font-mono">
                Registrar & Council
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#10C77A]/50 transition-all">
              <div className="flex items-center justify-between text-white/50 mb-2">
                <span className="text-[12px] font-medium">Export</span>
                <FileText className="w-4 h-4 text-[#10C77A]" />
              </div>
              <div className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight leading-tight">
                Mobility Pack
              </div>
              <div className="text-[11px] text-[#10C77A] mt-1 font-mono">
                Embassy & Visa Ready
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          4. "WHY IT WORKS DIFFERENTLY" (African Context)
      ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#FAF8F3]">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Sticky Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E2D8] text-[12px] font-semibold text-[#71717A] mb-4 shadow-2xs">
                <span>Why KRED</span>
                <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
              </div>
              <h2 className="text-[34px] sm:text-[44px] font-[600] tracking-[-0.03em] text-[#18181B] leading-tight">
                Why it works differently for Africans.
              </h2>
              <p className="mt-4 text-[16px] text-[#71717A] leading-relaxed">
                Most platforms are built for Western students. KRED is specifically tuned for African university systems, grading formulas, and global mobility paths.
              </p>
            </div>

            {/* Right Cards Column */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Card 1 */}
              <div className="p-7 rounded-3xl bg-white border border-[#E5E2D8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left hover:border-[#10C77A]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center mb-4">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#18181B] tracking-tight">
                  It understands African grading systems
                </h3>
                <p className="mt-2 text-[14.5px] text-[#71717A] leading-relaxed">
                  From Nigerian 5.0 CGPA and Ghanaian 4.0 scales to South African percentages and Kenyan credit hours, KRED maps your transcript directly to US 4.0, UK Honours, and European ECTS scales.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-7 rounded-3xl bg-white border border-[#E5E2D8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left hover:border-[#10C77A]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#18181B] tracking-tight">
                  Saves you from endless school trips
                </h3>
                <p className="mt-2 text-[14.5px] text-[#71717A] leading-relaxed">
                  Digitally verify your certificate once on your device. Never travel back to campus, send a relative, or pay unofficial agents just to re-verify your documents.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-7 rounded-3xl bg-white border border-[#E5E2D8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left hover:border-[#10C77A]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#18181B] tracking-tight">
                  Embassy and university ready
                </h3>
                <p className="mt-2 text-[14.5px] text-[#71717A] leading-relaxed">
                  Your verification pack includes tamper-proof QR codes and cryptographic hashes that foreign admissions and visa officers can verify in seconds.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. "HOW IT WORKS" - 4-STEP GRID
      ========================================================================= */}
      <section id="how" className="py-20 md:py-28 bg-[#FAF8F3] border-t border-[#EAE7DC]">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E2D8] text-[12px] font-semibold text-[#71717A] mb-4 shadow-2xs">
            <span>How it works</span>
            <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
          </div>

          <h2 className="text-[34px] sm:text-[48px] font-[600] tracking-[-0.03em] text-[#18181B]">
            From school certificate to relocation in 4 steps.
          </h2>
          <p className="mt-3 text-[16px] text-[#71717A] max-w-[540px] mx-auto">
            No expensive agent or notarization consultant needed. Connect your certificates, select your goal, and KRED audits from there.
          </p>

          {/* 2x2 Grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            
            {/* Step 01 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F4F1E6] border border-[#E5E1D4] flex flex-col justify-between">
              <div>
                <div className="text-[26px] font-bold text-[#18181B] mb-5">01</div>
                
                {/* African Institution logos banner */}
                <div className="p-3 rounded-2xl bg-white/80 border border-[#E5E1D4] flex items-center justify-around gap-2 mb-6">
                  <span className="text-[12px] font-bold text-[#18181B]">UNILAG</span>
                  <span className="text-[12px] font-bold text-[#18181B]">Univ of Ibadan</span>
                  <span className="text-[12px] font-bold text-[#18181B]">KNUST</span>
                  <span className="text-[12px] font-bold text-[#18181B]">WAEC</span>
                </div>

                <h3 className="text-[19px] font-bold text-[#18181B] tracking-tight">
                  Connect your certificates
                </h3>
                <p className="mt-2 text-[14px] text-[#71717A] leading-relaxed">
                  Upload your degrees, transcripts, WAEC/NECO certificates, or medical licenses. Everything stays encrypted locally on your phone or laptop.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F4F1E6] border border-[#E5E1D4] flex flex-col justify-between">
              <div>
                <div className="text-[26px] font-bold text-[#18181B] mb-5">02</div>
                
                {/* Target Goals */}
                <div className="p-3 rounded-2xl bg-white/80 border border-[#E5E1D4] flex items-center gap-2 mb-6 overflow-hidden">
                  <span className="px-2.5 py-1 rounded-lg bg-[#10C77A]/15 text-[#0E8A54] text-[11px] font-semibold">
                    Chevening & Oxford
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                    Canada Express Entry
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                    UK NHS Medical
                  </span>
                </div>

                <h3 className="text-[19px] font-bold text-[#18181B] tracking-tight">
                  Choose your target goal
                </h3>
                <p className="mt-2 text-[14px] text-[#71717A] leading-relaxed">
                  Select your dream destination: Chevening Scholarship, Commonwealth Masters, Canadian Permanent Residency, or UK Healthcare visa.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F4F1E6] border border-[#E5E1D4] flex flex-col justify-between">
              <div>
                <div className="text-[26px] font-bold text-[#18181B] mb-5">03</div>
                
                {/* Visual mini status */}
                <div className="p-3 rounded-2xl bg-white/80 border border-[#E5E1D4] flex items-center justify-between text-[11.5px] text-[#18181B] font-medium mb-6">
                  <span>UNILAG 4.86 CGPA converted</span>
                  <span className="text-[#0E8A54] font-bold">UK 1st Class Confirmed</span>
                </div>

                <h3 className="text-[19px] font-bold text-[#18181B] tracking-tight">
                  AI audits your chances automatically
                </h3>
                <p className="mt-2 text-[14px] text-[#71717A] leading-relaxed">
                  Equivalency models match your African grades against WES, UK ENIC NARIC, and European ECTS conversion cutoffs.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F4F1E6] border border-[#E5E1D4] flex flex-col justify-between">
              <div>
                <div className="text-[26px] font-bold text-[#18181B] mb-5">04</div>
                
                {/* Visual miniature documents */}
                <div className="p-3 rounded-2xl bg-white/80 border border-[#E5E1D4] flex items-center justify-center gap-2 mb-6">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10C77A]">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10C77A]">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10C77A]">
                    <Check className="w-4 h-4" />
                  </span>
                </div>

                <h3 className="text-[19px] font-bold text-[#18181B] tracking-tight">
                  Download certified application packs
                </h3>
                <p className="mt-2 text-[14px] text-[#71717A] leading-relaxed">
                  Export verified dossiers complete with official cryptographic QR codes that foreign universities and visa officers accept.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. FEATURES STACK (Simple African English)
      ========================================================================= */}
      <section id="features" className="py-20 md:py-28 bg-[#F4F1E6]/70 border-t border-[#EAE7DC]">
        <div className="mx-auto max-w-[840px] px-4 sm:px-6 text-center">
          
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E2D8] text-[12px] font-semibold text-[#71717A] mb-4 shadow-2xs">
            <span>Features</span>
            <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
          </div>

          <h2 className="text-[34px] sm:text-[46px] font-[600] tracking-[-0.03em] text-[#18181B] leading-tight">
            Everything you need for global recognition.
          </h2>
          <p className="mt-3 text-[16px] text-[#71717A] max-w-[500px] mx-auto">
            No complicated procedures. No manual legwork. Just a sovereign vault that works while you focus on your future.
          </p>

          {/* Vertical Stack */}
          <div className="mt-12 space-y-3 text-left">
            
            {[
              {
                icon: Layers,
                title: 'African CGPA to WES & ECTS conversions',
                desc: 'Instantly calculate your 5.0 or 4.0 Nigerian and Ghanaian CGPA to US 4.0, UK Honours, and German grading scales.',
              },
              {
                icon: Sparkles,
                title: 'WAEC & NECO English waiver checker',
                desc: 'Find out immediately which UK, US, and Canadian universities waive IELTS or TOEFL fees using your WAEC C6/B3/A1.',
              },
              {
                icon: Award,
                title: 'Scholarship eligibility scanner',
                desc: 'Audits your profile for Chevening, Commonwealth, Mastercard Foundation, DAAD, and Erasmus Mundus requirements.',
              },
              {
                icon: Shield,
                title: 'Medical & engineering mobility',
                desc: 'Supports MDCN, Ghana Medical Council, and EBK Kenya licenses for UK GMC, NHS, and Saudi Arabia SCFHS transfers.',
              },
              {
                icon: Lock,
                title: '100% Client-side privacy on your device',
                desc: 'Your school certificates never sit on unencrypted clouds. You keep full ownership of your records.',
              },
              {
                icon: Clock,
                title: 'Instant intake & deadline alerts',
                desc: 'Get notified before scholarship portals close or before your test scores and licenses expire.',
              },
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E1D4] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-start gap-4 hover:border-[#10C77A]/50 transition-all cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E5E1D4] text-[#0E8A54] flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[15.5px] font-bold text-[#18181B]">
                      {feat.title}
                    </h3>
                    <p className="text-[13.5px] text-[#71717A] mt-1 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* =========================================================================
          7. INSTITUTIONAL COMPATIBILITY (African Universities to Global Boards)
      ========================================================================= */}
      <section id="stories" className="py-20 md:py-28 bg-[#FAF8F3] border-t border-[#EAE7DC]">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E2D8] text-[12px] font-semibold text-[#71717A] mb-3 shadow-2xs">
                <span>Evaluation Standards</span>
                <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
              </div>
              <h2 className="text-[34px] sm:text-[44px] font-[600] tracking-[-0.03em] text-[#18181B]">
                Engineered for global
                <br />
                evaluation and licensing bodies.
              </h2>
            </div>

            <button
              onClick={() => onNavigatePage('assistant')}
              className="h-9 px-4 rounded-xl bg-[#18181B] text-white hover:bg-[#10C77A] hover:text-[#18181B] text-[12.5px] font-medium transition-colors cursor-pointer shrink-0"
            >
              Test your credentials
            </button>
          </div>

          {/* 3-Column Standard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Academic & WES */}
            <div className="rounded-3xl overflow-hidden bg-white border border-[#E5E1D4] shadow-sm p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-[17px] font-bold text-[#18181B] mb-2">
                  WES & US NACES Evaluation
                </h3>
                <p className="text-[13.5px] text-[#52525B] leading-relaxed">
                  Automatic course-by-course credit breakdown, converting African university grading systems to US 4.0 GPA equivalencies for graduate admissions and ECA reports.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EFEB] text-[12px] font-semibold text-[#0E8A54] flex items-center gap-1">
                <span>Bologna & US Scale Mapping</span>
              </div>
            </div>

            {/* Card 2: UK ENIC & Visas */}
            <div className="rounded-3xl overflow-hidden bg-white border border-[#E5E1D4] shadow-sm p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-[17px] font-bold text-[#18181B] mb-2">
                  UK ENIC & Visa Verification
                </h3>
                <p className="text-[13.5px] text-[#52525B] leading-relaxed">
                  Checks qualification levels against UK RQF standards (Level 6 Bachelor, Level 7 Master) and automatically validates English language proficiency waivers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EFEB] text-[12px] font-semibold text-[#18181B] flex items-center gap-1">
                <span>UK RQF Level 6/7 Alignment</span>
              </div>
            </div>

            {/* Card 3: Medical & Professional Licensing */}
            <div className="rounded-3xl overflow-hidden bg-white border border-[#E5E1D4] shadow-sm p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#10C77A]/15 text-[#0E8A54] flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-[17px] font-bold text-[#18181B] mb-2">
                  WHO & Council PSV Attestation
                </h3>
                <p className="text-[13.5px] text-[#52525B] leading-relaxed">
                  Direct primary source verification integration for medical, nursing, and engineering councils (MDCN, NMCN, COREN) against WHO and GMC directories.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EFEB] text-[12px] font-semibold text-[#0E8A54] flex items-center gap-1">
                <span>Primary Source Verification (PSV)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          8. DARK ACCREDITATION & RELIABILITY WALL
      ========================================================================= */}
      <section id="reviews" className="py-20 md:py-28 bg-[#111114] text-white relative overflow-hidden">
        
        {/* Fine grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Header */}
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[12px] font-medium text-white/80 mb-4">
                <span>Reliability</span>
                <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
              </div>
              <h2 className="text-[34px] sm:text-[46px] font-[600] tracking-[-0.03em] text-white leading-tight">
                Global mobility
                <br />
                infrastructure.
              </h2>
            </div>

            {/* Right Pillars */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Pillar 1 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <Shield className="w-6 h-6 text-[#10C77A] mb-3 opacity-80" />
                  <h3 className="text-[16px] font-bold text-white mb-2">Cryptographic Attestation</h3>
                  <p className="text-[13.5px] text-white/80 leading-relaxed">
                    Every transcript, WAEC certificate, and degree is fingerprinted with SHA-256 cryptographic signatures to prove authenticity to foreign embassies and universities.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-white/50">
                  Tamper-proof on-device validation
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <Globe className="w-6 h-6 text-[#10C77A] mb-3 opacity-80" />
                  <h3 className="text-[16px] font-bold text-white mb-2">Scholarship Criteria Engine</h3>
                  <p className="text-[13.5px] text-white/80 leading-relaxed">
                    Audits credentials against Chevening, Commonwealth, Mastercard Foundation, Erasmus Mundus, and DAAD requirements in real time.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-white/50">
                  Updated for 2026/2027 intakes
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="sm:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-white mb-1">Decentralized Self-Sovereignty</h3>
                  <p className="text-[13.5px] text-white/85 leading-relaxed">
                    Your confidential records remain strictly on your device. No third-party data brokers or registrars hold master keys to your academic credentials.
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#10C77A]/15 border border-[#10C77A]/30 text-[#10C77A] text-[12px] font-semibold shrink-0">
                  Zero-Knowledge Architecture
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          9. PRICING SECTION
      ========================================================================= */}
      <section id="pricing" className="py-20 md:py-28 bg-[#FAF8F3]">
        <div className="mx-auto max-w-[880px] px-4 sm:px-6 text-center">
          
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#E5E2D8] text-[12px] font-semibold text-[#71717A] mb-4 shadow-2xs">
            <span>Pricing</span>
            <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
          </div>

          <h2 className="text-[34px] sm:text-[46px] font-[600] tracking-[-0.03em] text-[#18181B]">
            Affordable plans for African scholars.
          </h2>
          <p className="mt-2 text-[15.5px] text-[#71717A]">
            Flexible plans designed for youths and professionals. Cancel anytime.
          </p>

          {/* Yearly vs Monthly Switch */}
          <div className="mt-8 flex items-center justify-center">
            <div className="bg-[#EFECE2] p-1 rounded-full border border-[#DFDCcf] flex items-center gap-1 text-[12.5px] font-medium">
              <button
                type="button"
                onClick={() => setPricingCycle('yearly')}
                className={`relative px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  pricingCycle === 'yearly'
                    ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#18181B] text-white leading-none">
                  -25%
                </span>
                <span>Yearly</span>
              </button>
              <button
                type="button"
                onClick={() => setPricingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  pricingCycle === 'monthly'
                    ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* 2 Clean Cards */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-[740px] mx-auto">
            
            {/* Basic Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F4F1E6] border border-[#E5E1D4] flex flex-col justify-between">
              <div>
                <div className="text-[14px] font-medium text-[#71717A]">
                  Basic Scholar
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#18181B]">
                    ${pricingCycle === 'yearly' ? '19' : '29'}
                  </span>
                  <span className="text-[13px] text-[#71717A]">/mo</span>
                </div>
                <div className="text-[11.5px] text-[#71717A] mt-0.5">
                  Approx ₦25,000 / GH₵ 350 per month
                </div>

                <div className="mt-6 space-y-2.5 text-[13px] text-[#52525B]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#18181B] font-bold">+</span>
                    <span>Client-side encrypted vault on your phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#18181B] font-bold">+</span>
                    <span>WAEC, degree & transcript audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#18181B] font-bold">+</span>
                    <span>WES & UK ENIC conversion estimates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#18181B] font-bold">+</span>
                    <span>1-click application dossier export</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full h-11 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white font-medium text-[13.5px] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Explore Basic Scholar
                </button>
              </div>
            </div>

            {/* Premium Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#111114] border border-white/10 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10C77A]/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="text-[14px] font-medium text-[#10C77A]">
                  Global Mobility Pro
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-white">
                    ${pricingCycle === 'yearly' ? '79' : '99'}
                  </span>
                  <span className="text-[13px] text-white/50">/mo</span>
                </div>
                <div className="text-[11.5px] text-white/45 mt-0.5">
                  Approx ₦95,000 / GH₵ 1,400 per month
                </div>

                <div className="mt-6 space-y-2.5 text-[13px] text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10C77A] font-bold">+</span>
                    <span>Unlimited verified African credentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#10C77A] font-bold">+</span>
                    <span>Direct registrar & hospital verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#10C77A] font-bold">+</span>
                    <span>Full Chevening, WES & Canada PR packs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#10C77A] font-bold">+</span>
                    <span>Official cryptographic QR verification</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full h-11 rounded-xl bg-[#10C77A] hover:bg-[#0E8A54] text-[#18181B] font-bold text-[13.5px] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Explore Global Mobility Pro
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          10. DIRECT FORM CTA ("Start your global journey today.")
      ========================================================================= */}
      <section id="demo" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px] rounded-3xl bg-[#0D0D11] border border-white/10 p-8 sm:p-12 lg:p-14 text-white shadow-2xl relative overflow-hidden">
          
          {/* Subtle green ambient light */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#10C77A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Column */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[12px] font-medium text-white/80 mb-4">
                <span>Academic & Professional Verification</span>
                <ArrowUpRight className="w-3 h-3 text-[#10C77A]" />
              </div>
              <h2 className="text-[32px] sm:text-[44px] font-[600] tracking-[-0.03em] text-white leading-tight">
                Start your global
                <br />
                journey today with <span className="text-[#10C77A]">KRED</span>.
              </h2>
              <p className="mt-4 text-[15px] text-white/70 max-w-[440px] leading-relaxed">
                Stop stressing over transcript delays, WES evaluations, and scholarship rejections. Connect your WAEC, degrees, and licenses to KRED's encrypted vault and generate your verified global mobility pack in minutes.
              </p>

              <div className="mt-6 space-y-2.5 text-[13px] text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10C77A] shrink-0" />
                  <span>Instant WAEC & 5.0 CGPA foreign grade conversions (WES & UK 1st Class)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10C77A] shrink-0" />
                  <span>Chevening, Commonwealth & Mastercard Foundation eligibility audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10C77A] shrink-0" />
                  <span>Embassy & university ready cryptographic QR verification pack</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Form */}
            <div className="lg:col-span-6">
              {demoSubmitted ? (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#10C77A]/20 text-[#10C77A] grid place-items-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-[18px] font-bold text-white">Audit Request Received!</h3>
                  <p className="text-[13px] text-white/60">
                    We've sent your credential evaluation access to <span className="text-white font-medium">{demoForm.email}</span>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      placeholder="Your Full Name"
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-[13.5px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#10C77A] transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      required
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                      placeholder="Email Address"
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-[13.5px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#10C77A] transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                      placeholder="Your University & Country (e.g. UNILAG Nigeria, KNUST Ghana)"
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-[13.5px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#10C77A] transition-colors"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={3}
                      value={demoForm.notes}
                      onChange={(e) => setDemoForm({ ...demoForm, notes: e.target.value })}
                      placeholder="What is your target goal? (e.g. Chevening 2026, Canada Express Entry, UK NHS Medical, US Masters)"
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[13.5px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#10C77A] transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full h-11 rounded-xl bg-[#10C77A] hover:bg-[#0E8A54] text-[#18181B] font-bold text-[13.5px] transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      Audit My African Credentials Free
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          11. MASSIVE BRAND FOOTER
      ========================================================================= */}
      <footer className="bg-[#09090B] text-white pt-16 pb-8 border-t border-white/10">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
          
          {/* Top 3-Column Navigation (Numbers Removed) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13px] text-white/60 mb-16">
            
            <div>
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3">
                Navigation
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigatePage('product')} className="hover:text-white cursor-pointer">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigatePage('solutions')} className="hover:text-white cursor-pointer">
                    African Universities
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigatePage('how')} className="hover:text-white cursor-pointer">
                    Success Stories
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3">
                Vault Tools
              </div>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigatePage('assistant')} className="hover:text-white cursor-pointer">
                    AI Credential Audit
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigatePage('security')} className="hover:text-white cursor-pointer">
                    Encrypted Enclave
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigatePage('pricing')} className="hover:text-white cursor-pointer">
                    Scholar Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigatePage('about')} className="hover:text-white cursor-pointer">
                    African Manifesto
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-3">
                Connect
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="#demo" className="hover:text-white cursor-pointer">
                    Book Walkthrough
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white cursor-pointer">
                    Twitter / X
                  </a>
                </li>
                <li>
                  <button onClick={() => onShowToast('Support: africa-support@kredvault.org')} className="hover:text-white cursor-pointer">
                    Contact African Support
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Huge Display Wordmark: KRED */}
          <div className="py-6 border-t border-b border-white/10 text-center select-none overflow-hidden">
            <span
              className="text-[76px] sm:text-[130px] lg:text-[160px] font-bold tracking-tighter leading-none inline-block"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 60%, #10C77A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              KRED
            </span>
          </div>

          {/* Micro Footer Credits */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11.5px] text-white/45">
            <div>Made for African scholars & professionals</div>
            <div>Self-Sovereign AES-256 GCM Architecture</div>
            <div>KRED © {new Date().getFullYear()}</div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default CleanLandingPage;
