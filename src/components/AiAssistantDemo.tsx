import React, { useState } from 'react';
import { KredLogoMark } from './KredLogo';
import { Send, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface AiAssistantDemoProps {
  onGeneratePackage?: (packageName: string) => void;
  onShowToast: (msg: string) => void;
}

export const AiAssistantDemo: React.FC<AiAssistantDemoProps> = ({
  onGeneratePackage,
  onShowToast,
}) => {
  const presets = [
    {
      id: 'schwarzman',
      title: 'Scholarship Eligibility',
      query: 'Am I eligible for the Schwarzman scholarship with my current documents?',
      response: {
        headline: 'Audit based on your degrees, transcripts, and English test:',
        criteria: [
          { text: 'Leadership Experience: 2 verified roles listed in CV', status: 'pass' },
          { text: 'Academic Honors: MIT GPA 4.80 / 5.00 verified', status: 'pass' },
          { text: 'Language Requirement: IELTS Band 8.0 (Exceeds 7.5 minimum)', status: 'pass' },
          { text: 'Missing: 1 academic and 1 professional reference letter', status: 'missing' },
        ],
        actionPrompt: 'Assemble pre-flight scholarship dossier?',
        packageType: 'Schwarzman Scholarship Dossier',
      },
    },
    {
      id: 'visa',
      title: 'Immigration & Visa Rules',
      query: 'What documents do I have ready for Canada Express Entry or UK Global Talent?',
      response: {
        headline: 'Audit for Skilled Worker and Global Talent categories:',
        criteria: [
          { text: 'Valid Passport: Valid through Jan 2029 (4 years remaining)', status: 'pass' },
          { text: 'Educational Assessment (ECA): Master’s degree equivalent', status: 'pass' },
          { text: 'Language Benchmark: Band 8.0 (CLB 10 equivalent on file)', status: 'pass' },
          { text: 'Proof of Funds: Need bank statement within last 30 days', status: 'missing' },
        ],
        actionPrompt: 'Assemble pre-flight Express Entry application bundle?',
        packageType: 'Global Talent Visa Bundle',
      },
    },
    {
      id: 'license',
      title: 'License Transfer & Deadlines',
      query: 'Check my credentials for upcoming expirations or renewal deadlines',
      response: {
        headline: 'Credential Health Audit across 3 active credentials:',
        criteria: [
          { text: 'Clinical Specialist License: Valid through Dec 2026', status: 'pass' },
          { text: 'National Passport: 4 years remaining until renewal', status: 'pass' },
          { text: 'IELTS English Test: Valid through Dec 2026', status: 'pass' },
        ],
        actionPrompt: 'Export clean audit report?',
        packageType: 'Credential Renewal Schedule',
      },
    },
  ];

  const [activePreset, setActivePreset] = useState(presets[0]);
  const [customInput, setCustomInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setIsTyping(true);
    setActivePreset(preset);
    setTimeout(() => setIsTyping(false), 250);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setIsTyping(true);
    onShowToast(`Analyzing records for: "${customInput}"`);
    setTimeout(() => {
      setIsTyping(false);
      setCustomInput('');
    }, 450);
  };

  return (
    <section className="bg-[#18181B] text-white py-20 md:py-28 overflow-hidden relative border-t border-zinc-800">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,199,122,0.08),transparent_50%)] pointer-events-none" />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
          
          {/* Left Column */}
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
              <span>AI Document Reasoning</span>
            </div>

            <h2 className="text-[32px] sm:text-[42px] font-bold tracking-tight leading-[1.08]">
              Ask your vault anything in plain, simple English
            </h2>

            <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 max-w-[460px]">
              KRED checks your uploaded documents against official university, visa, and licensing rules. Get answers in seconds with 100% private, on-device AI.
            </p>

            {/* Presets Segmented Controls */}
            <div className="mt-8 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer ${
                    activePreset.id === p.id
                      ? 'bg-[#10C77A] text-[#18181B] font-semibold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>

            {/* Privacy Promise */}
            <div className="mt-8 flex items-center gap-2 text-[12px] text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
              <span>Private indexing · Your documents never train public AI models</span>
            </div>
          </div>

          {/* Right Column: Clean Chat Reasoning Box */}
          <div className="rounded-2xl bg-white text-[#18181B] border border-zinc-200 shadow-xl overflow-hidden">
            
            {/* Topbar */}
            <div className="h-11 px-5 flex items-center justify-between bg-[#FAFAFA] border-b border-[#E4E4E7] text-[12px]">
              <div className="flex items-center gap-2 font-medium text-[#18181B]">
                <KredLogoMark size="small" variant="dark" />
                <span className="font-semibold">Live Reasoning Simulation</span>
              </div>
              <span className="text-[11px] font-mono text-[#10C77A] bg-[#10C77A]/15 px-2 py-0.5 rounded font-medium">
                Encrypted Sandboxed
              </span>
            </div>

            {/* Chat Body */}
            <div className="p-5 sm:p-6 space-y-4 text-[13px]">
              {/* User Query Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[#18181B] text-white px-4 py-3 leading-relaxed">
                  {activePreset.query}
                </div>
              </div>

              {/* AI Response Card */}
              <div className="rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 font-bold text-[13px] text-[#18181B]">
                  <Sparkles className="w-4 h-4 text-[#10C77A]" />
                  <span>{activePreset.response.headline}</span>
                </div>

                {/* Criteria Rows */}
                <div className="space-y-2 pt-1">
                  {activePreset.response.criteria.map((crit, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-[12.5px] leading-snug"
                    >
                      {crit.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10C77A] shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          !
                        </span>
                      )}
                      <span
                        className={
                          crit.status === 'missing'
                            ? 'text-rose-600 font-medium'
                            : 'text-[#18181B]'
                        }
                      >
                        {crit.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Prompt */}
                <div className="mt-4 pt-3 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11.5px] text-[#71717A]">
                    {activePreset.response.actionPrompt}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onGeneratePackage) onGeneratePackage(activePreset.response.packageType);
                      onShowToast(`Opening workspace with ${activePreset.response.packageType}`);
                    }}
                    className="h-8 px-3 rounded-lg bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[11.5px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Try in Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleCustomSubmit} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ask a question about your documents..."
                  className="flex-1 h-10 px-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] text-[12.5px] text-[#18181B] focus:outline-none focus:border-[#18181B] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className="h-10 px-4 rounded-xl bg-[#18181B] text-white hover:bg-zinc-800 text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AiAssistantDemo;
