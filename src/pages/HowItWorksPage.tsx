import React from 'react';
import {
  UploadCloud,
  Cpu,
  Sparkles,
  Share2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartFree: () => void;
  onNavigate: (page: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onStartFree,
  onNavigate,
}) => {
  const steps = [
    {
      num: '01',
      icon: UploadCloud,
      title: 'Upload and Encrypt Locally',
      desc: 'Upload PDFs or clear photos of degrees, transcripts, government IDs, and test certificates. Everything is encrypted using AES-256 GCM directly inside your browser enclave before reaching persistent storage.',
      badge: 'Zero Knowledge',
    },
    {
      num: '02',
      icon: Cpu,
      title: 'Automated Field & Grade Parsing',
      desc: 'Our neural document parser detects issuing institutions, registrar stamps, GPA scales, and conferral dates in seconds. It transforms raw files into clean, verifiable digital records.',
      badge: 'Private Extraction',
    },
    {
      num: '03',
      icon: Sparkles,
      title: 'AI Goal Audit & Prerequisite Check',
      desc: 'Tell AI your exact goal — from foreign scholarship criteria to work visa requirements. KRED audits your papers against official prerequisites and identifies any missing documents.',
      badge: 'Reasoning Engine',
    },
    {
      num: '04',
      icon: Share2,
      title: '1-Click Dossiers & Expiring Links',
      desc: 'Bundle your credentials with an AI-generated cover summary and issue tamper-proof access links with custom expiry windows. Revoke access whenever you wish.',
      badge: 'Tamper Proof',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Architecture & Workflow</span>
          </div>

          <h1 className="text-[38px] sm:text-[54px] lg:text-[60px] font-bold tracking-tight leading-[1.08] text-[#18181B] max-w-[800px]">
            From scattered PDFs to an intelligent personal vault
          </h1>

          <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-[#71717A] max-w-[620px]">
            Explore the four-step cryptographic and neural workflow that gives you full sovereignty over your credentials.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onStartFree}
              className="h-11 px-6 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="h-11 px-5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#18181B] text-[#18181B] text-[13.5px] font-semibold inline-flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#10C77A]" />
              <span>Open Workspace Demo</span>
            </button>
          </div>

        </div>
      </section>

      {/* 4 Steps Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-2xl bg-white border border-[#E4E4E7] p-7 sm:p-9 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center text-[#18181B] shadow-2xs">
                        <Icon className="w-6 h-6 text-[#10C77A]" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                          {step.badge}
                        </span>
                        <span className="font-mono text-[16px] font-bold text-[#A1A1AA]">
                          {step.num}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-6 text-[20px] sm:text-[22px] font-bold tracking-tight text-[#18181B]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-[#71717A]">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#E4E4E7] flex items-center gap-2 text-[12.5px] font-semibold text-[#18181B]">
                    <CheckCircle2 className="w-4 h-4 text-[#10C77A]" />
                    <span>Client-side hardware enclave accelerated</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Banner Card */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#18181B] text-white p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-[640px]">
              <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
                <span>Zero Knowledge Guarantees</span>
              </div>
              <h2 className="text-[26px] sm:text-[34px] font-bold tracking-tight text-white leading-tight">
                Your data is cryptographically sealed from everyone, including us.
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-zinc-300">
                KRED operates on client-side key generation. We never sell, index, or train AI models on your personal achievements.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => onNavigate('security')}
                  className="h-10 px-5 rounded-xl bg-white text-[#18181B] hover:bg-zinc-100 font-semibold text-[13px] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Read our Security Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;
