import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Send,
  UploadCloud,
  FileCheck2,
  Lock,
  ArrowRight,
  ChevronDown,
  Mic,
  AudioWaveform,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from 'lucide-react';

interface HeroProps {
  onStartFree: () => void;
  onSeeHowItWorks: () => void;
  onDocClick?: (docName: string) => void;
  onNavigatePage?: (page: string) => void;
}

const SAMPLE_PROMPTS = [
  'Do my MIT credits transfer to Oxford ECTS?',
  'Does my IELTS 8.0 qualify for Schwarzman?',
  'Can I transfer my DHA license to the UK or Saudi Arabia?',
  'Audit my credentials for UK Global Talent visa',
];

const AUDIT_RESPONSES: Record<string, { headline: string; points: string[]; action: string }> = {
  'Do my MIT credits transfer to Oxford ECTS?': {
    headline: 'Academic Credit Transfer Audit (MIT to Oxford / European ECTS)',
    points: [
      'Equivalent Level: MIT Master of Science (GPA 4.80/5.00) equals European Bologna Level 7 (ECTS 120 credit equivalent).',
      'Grade Benchmark: Exceeds Oxford first-class minimum standard (US 3.7+ equivalent).',
      'Status: Direct academic recognition confirmed via UK ENIC NARIC standards.',
    ],
    action: 'Generate Credit Equivalency Certificate',
  },
  'Does my IELTS 8.0 qualify for Schwarzman?': {
    headline: 'Schwarzman Scholars Language & Academic Prerequisite Check',
    points: [
      'English Test: IELTS Band 8.0 comfortably exceeds the Schwarzman minimum cutoff (Band 7.5).',
      'Degree Status: Bachelor/Master conferral verified with good standing.',
      'Missing Document: 1 institutional recommendation letter remains pending.',
    ],
    action: 'Assemble Schwarzman Application Dossier',
  },
  'Can I transfer my DHA license to the UK or Saudi Arabia?': {
    headline: 'Clinical Practice License Cross-Border Mobility Audit',
    points: [
      'Saudi Arabia (SCFHS): Eligible for Mumaris+ fast-track endorsement via Primary Source Verification (PSV).',
      'United Kingdom (GMC): Meets international medical graduate (IMG) foundation criteria.',
      'Validity: Current DHA specialist license active through Dec 2026.',
    ],
    action: 'Export Primary Source Verification Pack',
  },
  'Audit my credentials for UK Global Talent visa': {
    headline: 'UK Global Talent (Tech Nation / Academic Endorsement) Readiness',
    points: [
      'Educational Attestation: Master’s in Computer Science & AI fulfills exceptional promise baseline.',
      'Language Requirement: Exempted/Satisfied via verified degree from majority English-speaking institution.',
      'Recommended Action: Bundle verified publications, degrees, and awards into a single tamper-proof dossier.',
    ],
    action: 'Prepare Global Talent Evidence Dossier',
  },
};

export const Hero: React.FC<HeroProps> = ({
  onNavigatePage,
}) => {
  const [inputText, setInputText] = useState('');
  const [chatMode, setChatMode] = useState<'chat' | 'cowork'>('chat');
  const [modelName, setModelName] = useState('KRED AI 3.0');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [activeAudit, setActiveAudit] = useState<{
    query: string;
    headline: string;
    points: string[];
    action: string;
  } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRunAudit = (promptText: string) => {
    setInputText(promptText);
    setIsAuditing(true);
    setActiveAudit(null);

    setTimeout(() => {
      setIsAuditing(false);
      const matched = AUDIT_RESPONSES[promptText] || {
        headline: `Audit for: "${promptText}"`,
        points: [
          'Scanned verified records against official university and immigration databases.',
          'Prerequisites and grade conversions satisfied based on credentials on file.',
          'Ready to package into a certified, tamper-proof application dossier.',
        ],
        action: 'Open Complete Audit in Workspace',
      };
      setActiveAudit({ query: promptText, ...matched });
    }, 450);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleRunAudit(inputText.trim());
  };

  return (
    <section className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-28 bg-[#FAFAFA]">
      
      {/* Dynamic Mesh Gradient Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Mesh Orb 1: Warm Amber / Terracotta glow (Top Left) */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[680px] max-h-[680px] rounded-full blur-[110px] opacity-45"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, rgba(253, 230, 138, 0.25) 50%, transparent 70%)',
          }}
        />

        {/* Mesh Orb 2: Emerald / Mint glow (Top Right / Center) */}
        <div
          className="absolute -top-[18%] -right-[8%] w-[60vw] h-[60vw] max-w-[720px] max-h-[720px] rounded-full blur-[120px] opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(16, 199, 122, 0.35) 0%, rgba(110, 231, 183, 0.2) 55%, transparent 70%)',
          }}
        />

        {/* Mesh Orb 3: Soft Sky / Cyan Aura (Center Backdrop) */}
        <div
          className="absolute top-[35%] left-[20%] w-[50vw] h-[45vw] max-w-[580px] max-h-[520px] rounded-full blur-[130px] opacity-35"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(199, 210, 254, 0.15) 50%, transparent 70%)',
          }}
        />

        {/* Mesh Orb 4: Rose / Warm Peach Accent (Bottom Center) */}
        <div
          className="absolute -bottom-[20%] right-[25%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(251, 113, 133, 0.3) 0%, rgba(254, 215, 170, 0.15) 60%, transparent 75%)',
          }}
        />

        {/* Subtle Micro-Grid Overlay for Depth */}
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: `radial-gradient(#18181B 0.75px, transparent 0.75px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =========================================================================
            HEADER & EDITORIAL COPY (No Buttons, No Kicker)
        ========================================================================= */}
        <div className="max-w-[840px] mx-auto text-center flex flex-col items-center">
          
          {/* Primary Headline */}
          <h1 className="text-[40px] sm:text-[56px] lg:text-[66px] font-bold tracking-tight leading-[1.06] text-[#18181B]">
            Upload your credentials.
            <br />
            Let AI verify your goals.
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-[16px] sm:text-[18.5px] leading-relaxed text-[#52525B] max-w-[640px]">
            Keep your degrees, certificates, and licenses safe on your device. Tell our AI what you want to achieve — whether applying for foreign universities, scholarships, or work visas.
          </p>

        </div>

        {/* =========================================================================
            AI PROMPT INPUT SECTION (Directly in Hero)
        ========================================================================= */}
        <div className="mt-10 sm:mt-12 max-w-[760px] mx-auto">
          
          {/* Floating AI Prompt Box (Claude-Style Light Card with Glass Blur) */}
          <div className="w-full rounded-2xl bg-white/95 backdrop-blur-md border border-[#E0DFD7] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-3.5 sm:p-4.5 focus-within:border-[#18181B]/40 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.09)] transition-all">
            
            {/* Textarea */}
            <form onSubmit={handleFormSubmit}>
              <textarea
                ref={textareaRef}
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputText.trim()) handleRunAudit(inputText.trim());
                  }
                }}
                placeholder="How can I help you today? Ask about degrees, scholarships, visas, or upload..."
                className="w-full bg-transparent text-[15px] sm:text-[16px] text-[#18181B] placeholder:text-[#9CA3AF] focus:outline-none resize-none leading-relaxed"
              />

              {/* Bottom Toolbar inside the Box */}
              <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-[#F0EFEB] text-[12.5px]">
                
                {/* Left Controls: + Upload & Mode Toggle (Chat / Cowork) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigatePage?.('assistant')}
                    className="w-7 h-7 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] flex items-center justify-center transition-colors cursor-pointer"
                    title="Upload or attach credential"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
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
                      onClick={() => setChatMode('cowork')}
                      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                        chatMode === 'cowork'
                          ? 'bg-white text-[#18181B] shadow-2xs font-semibold'
                          : 'text-[#71717A] hover:text-[#18181B]'
                      }`}
                    >
                      Cowork
                    </button>
                  </div>
                </div>

                {/* Right Controls: Model Selector, Mic, Audio, Send */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  
                  {/* Model Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="text-[12px] text-[#5A5957] hover:text-[#18181B] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-[#18181B]">{modelName}</span>
                      <span className="text-[#9CA3AF] hidden sm:inline">Medium</span>
                      <ChevronDown className="w-3 h-3 text-[#71717A]" />
                    </button>

                    {showModelDropdown && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-white border border-[#E0DFD7] shadow-xl p-1.5 z-40 animate-toast text-[12px]">
                        {['KRED AI 3.0', 'KRED AI 3.0 Fast', 'Claude Sonnet 3.5'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setModelName(m);
                              setShowModelDropdown(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#F3F2EE] transition-colors cursor-pointer text-[#18181B]"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mic Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Audio Waveform */}
                  <button
                    type="button"
                    onClick={() => onNavigatePage?.('assistant')}
                    className="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F3F2EE] transition-colors cursor-pointer"
                    title="Audio mode"
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

          {/* Sample Suggestion Chips Below Box */}
          <div className="mt-4.5 flex flex-wrap justify-center gap-2">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunAudit(prompt)}
                className="px-3.5 py-1.5 rounded-full border border-[#E2E1DA] bg-white hover:bg-[#F4F3ED] text-[12px] text-[#5A5957] hover:text-[#18181B] transition-colors cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* =========================================================================
              LIVE AUDIT RESULT CARD (Shown when user queries)
          ========================================================================= */}
          {isAuditing && (
            <div className="mt-6 rounded-2xl bg-white border border-[#E0DFD7] p-5 shadow-xs flex items-center justify-center gap-2 text-[#71717A] text-[13px] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#10C77A] animate-ping" />
              <span>Auditing vault records against international criteria...</span>
            </div>
          )}

          {activeAudit && !isAuditing && (
            <div className="mt-6 rounded-2xl bg-white border border-[#E0DFD7] p-5 sm:p-6 shadow-sm animate-toast text-[13px]">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEB]">
                <div className="flex items-center gap-2">
                  <div className="text-[#D9663B] text-[18px] leading-none">✻</div>
                  <span className="font-bold text-[#18181B] text-[14px]">
                    {activeAudit.headline}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#0E8A54] bg-[#10C77A]/15 px-2 py-0.5 rounded-md font-semibold">
                  Verified Invariant
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-[#18181B]">
                {activeAudit.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#10C77A] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#F0EFEB] flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11.5px] text-[#71717A]">
                  Audited across MIT Degree, IELTS 8.0, and DHA License
                </span>

                <button
                  type="button"
                  onClick={() => onNavigatePage?.('assistant')}
                  className="h-9 px-4 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-semibold text-[12.5px] inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Open Full Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* Privacy & Encryption Reassurance Tagline */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[#71717A]">
            <Lock className="w-3.5 h-3.5 text-[#10C77A]" />
            <span>Client-side AES-256 GCM encryption · Zero raw documents shared</span>
          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;
