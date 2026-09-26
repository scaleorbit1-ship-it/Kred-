import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

interface SolutionsPageProps {
  onStartFree: () => void;
  onNavigate: (page: string) => void;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  onStartFree,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'professionals' | 'institutions'>('students');

  const solutions = {
    students: {
      badge: 'For Students & Scholars',
      icon: GraduationCap,
      title: 'Never lose a scholarship or visa opportunity to missing paperwork',
      desc: 'Store your transcripts, test scores, recommendation letters, and financial statements in one private vault. KRED automatically cross-references foreign embassy checklists and university application rules.',
      points: [
        'Automated document checklists for DAAD, Fulbright, Chevening, and Schwarzman',
        'Direct translation and apostille tracking for international study permits',
        'One-click application packages with verifiable registrar signatures',
        'Automatic grade conversion (ECTS, US 4.0, UK Honors, West African 5.0)',
      ],
      stats: [
        { label: 'Time Saved per Application', val: '11+ Hours' },
        { label: 'Checklist Accuracy', val: '99.8%' },
        { label: 'Global Embassies Supported', val: '42 Countries' },
      ],
      quote:
        '"KRED saved my DAAD scholarship application. It caught that my transcript lacked a secondary apostille stamp 2 weeks before the cutoff." — Amara K., MSc Data Science',
    },
    professionals: {
      badge: 'For Working Professionals',
      icon: Briefcase,
      title: 'Your career credentials, verified and ready for global opportunities',
      desc: 'Keep your state board licenses, AWS/Cisco certifications, medical boards, and continuous education units up to date with automated expiry reminders and client-ready credential portfolios.',
      points: [
        'Automated renewal calendar with notification triggers before license expiration',
        'One-click verifiable portfolio generation for clients, recruiters, and contracts',
        'Instant multi-jurisdiction license transfer audits (State Board, GMC, DHA, SCFHS)',
        'Zero-knowledge verification links that expire whenever you choose',
      ],
      stats: [
        { label: 'License Transfer Speed', val: '4x Faster' },
        { label: 'Missed Renewals', val: '0% Recorded' },
        { label: 'Recruiter Trust Score', val: '100% Cryptographic' },
      ],
      quote:
        '"Transferring my clinical specialist license between countries was an administrative nightmare until KRED organized and verified my credentials in one afternoon." — Dr. Tariq N., MD',
    },
    institutions: {
      badge: 'For Universities & Issuers',
      icon: Building2,
      title: 'Issue tamper-proof credentials directly to your graduates in seconds',
      desc: 'Modernize graduation diplomas and transcripts with W3C Verifiable Credentials. Reduce verification backlogs by 90% while giving your alumni lifelong ownership of their academic achievements.',
      points: [
        'Batch issuance through standard SIS/ERP connectors (Canvas, Ellucian, Banner)',
        'Public verification portal for employers with instant cryptographic proof',
        'Complete protection against fraudulent degree mills and altered transcripts',
        'Full compliance with global student privacy regulations (FERPA, GDPR)',
      ],
      stats: [
        { label: 'Verification Backlog Reduction', val: '90%' },
        { label: 'Issuance Latency per Batch', val: '< 15 Seconds' },
        { label: 'Degree Forgery Prevention', val: '100% Guaranteed' },
      ],
      quote:
        '"Issuing graduation packages as verifiable credentials directly to student wallets reduced our registrar phone queries by 85% in year one." — Dean of Admissions & Records',
    },
  };

  const curr = solutions[activeTab];
  const Icon = curr.icon;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      
      {/* Solutions Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Targeted Solutions</span>
          </div>

          <h1 className="text-[38px] sm:text-[54px] lg:text-[60px] font-bold tracking-tight leading-[1.08] text-[#18181B] max-w-[800px]">
            Tailored for applicants, professionals, and issuers
          </h1>

          <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-[#71717A] max-w-[640px]">
            Whether preparing for graduate admissions abroad, keeping licenses active, or issuing diplomas, KRED streamlines your journey.
          </p>

          {/* Tab Navigation */}
          <div className="mt-10 flex bg-white p-1 rounded-xl border border-[#E4E4E7] shadow-2xs">
            {(['students', 'professionals', 'institutions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-10 px-5 rounded-lg text-[13.5px] font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                {tab === 'students'
                  ? 'For Students'
                  : tab === 'professionals'
                  ? 'For Professionals'
                  : 'For Institutions'}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Main Solution Feature Card */}
      <section className="py-8 md:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-[#E4E4E7] p-8 sm:p-12 shadow-2xs">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-center">
              
              <div>
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#10C77A]">
                  <Icon className="w-4 h-4" />
                  <span>{curr.badge}</span>
                </div>

                <h2 className="mt-3 text-[28px] sm:text-[34px] font-bold tracking-tight leading-tight text-[#18181B]">
                  {curr.title}
                </h2>

                <p className="mt-4 text-[15px] leading-relaxed text-[#71717A]">
                  {curr.desc}
                </p>

                <div className="mt-8 space-y-3.5">
                  {curr.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-[13.5px] text-[#18181B]">
                      <CheckCircle2 className="w-4 h-4 text-[#10C77A] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    onClick={onStartFree}
                    className="h-11 px-6 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-semibold text-[13.5px] inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('assistant')}
                    className="h-11 px-5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] hover:border-[#18181B] text-[#18181B] font-semibold text-[13.5px] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 text-[#10C77A]" />
                    <span>Try Workspace Demo</span>
                  </button>
                </div>
              </div>

              {/* Right Side Stats & Quote */}
              <div className="space-y-6">
                <div className="rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-6 space-y-5">
                  <div className="text-[12px] font-semibold text-[#71717A] uppercase tracking-wider">
                    Demonstrated Impact
                  </div>
                  <div className="space-y-4">
                    {curr.stats.map((s, idx) => (
                      <div key={idx} className="flex items-baseline justify-between border-b border-[#E4E4E7] pb-3 last:border-none last:pb-0">
                        <span className="text-[13px] text-[#71717A]">{s.label}</span>
                        <span className="text-[18px] font-bold text-[#18181B]">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-6 italic text-[13.5px] text-[#71717A] leading-relaxed">
                  {curr.quote}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SolutionsPage;
