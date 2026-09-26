import React from 'react';
import { UploadCloud, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { IconHandId, IconHardwareEnclave, IconDocStack } from './VectorIcons';

interface HowItWorksProps {
  onStartFree: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartFree }) => {
  const steps = [
    {
      num: '01',
      icon: IconHandId,
      title: 'Upload your credentials',
      desc: 'Drag and drop your degrees, academic transcripts, language scores, or licenses. Your files stay encrypted on your device.',
      visual: (
        <div className="rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-3.5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E4E4E7] flex items-center justify-center text-[#18181B] shadow-2xs">
              <UploadCloud className="w-4 h-4 text-[#10C77A]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-[#18181B] truncate">degree_transcript.pdf</div>
              <div className="text-[10.5px] text-[#71717A]">MIT Registrar · 1.8 MB</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10.5px] font-mono text-[#71717A] mb-1">
              <span>Local Encryption</span>
              <span className="text-[#10C77A] font-semibold">100% Encrypted</span>
            </div>
            <div className="h-1.5 w-full bg-[#E4E4E7] rounded-full overflow-hidden">
              <div className="h-full bg-[#10C77A] w-full" />
            </div>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      icon: IconHardwareEnclave,
      title: 'Tell AI what it is for',
      desc: 'Let KRED know your intended goal: applying for foreign graduate school, checking scholarship eligibility, or transferring a medical license.',
      visual: (
        <div className="rounded-xl bg-[#18181B] text-white p-3.5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-medium">Goal Prompt</span>
            <span className="text-[#10C77A] font-mono text-[10px] uppercase font-semibold">
              Indexed
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/10 text-[11px] leading-snug text-zinc-200">
            "Applying for UK Global Talent visa & Oxford Master's scholarship."
          </div>
        </div>
      ),
    },
    {
      num: '03',
      icon: IconDocStack,
      title: 'Get instant audits & share',
      desc: 'KRED analyzes your credentials against official criteria, tells you if anything is missing, and generates 1-click verified dossiers.',
      visual: (
        <div className="rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-3 flex flex-col justify-between h-[120px]">
          <div className="space-y-1.5">
            {[
              { label: 'GPA 4.80 / 5.0 (Oxford min 3.7)', ok: true },
              { label: 'IELTS Band 8.0 (Pass)', ok: true },
              { label: 'Letters of Reference (Missing 1)', ok: false },
            ].map((row, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-1.5 text-[#18181B] truncate">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold ${
                      row.ok
                        ? 'bg-[#10C77A] text-[#18181B]'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {row.ok ? '✓' : '!'}
                  </span>
                  <span className="truncate">{row.label}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold shrink-0 ml-2 ${
                    row.ok ? 'text-[#10C77A]' : 'text-amber-600'
                  }`}
                >
                  {row.ok ? 'Ready' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how" className="bg-white py-20 md:py-28 border-t border-[#E4E4E7]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-[620px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Simple Workflow</span>
          </div>
          <h2 className="text-[30px] sm:text-[38px] font-bold tracking-tight text-[#18181B] leading-tight">
            Three simple steps to verified success
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#71717A]">
            Save countless hours on every scholarship, foreign university, visa, and professional license application.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center p-1 shadow-2xs">
                      <Icon size={34} />
                    </div>
                    <span className="font-mono text-[13px] font-bold text-[#A1A1AA]">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[17px] font-bold text-[#18181B]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#71717A]">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#E4E4E7]">
                  {step.visual}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-12 text-center">
          <button
            onClick={onStartFree}
            className="h-11 px-6 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Start with your first document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
