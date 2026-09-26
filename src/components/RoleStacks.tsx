import React, { useState } from 'react';
import { Copy, Check, Share2, ArrowRight } from 'lucide-react';
import {
  IconHandId,
  IconProfessionalLicense,
  IconHardwareEnclave,
} from './VectorIcons';

interface RoleStacksProps {
  onStartFree: () => void;
  onShowToast: (msg: string) => void;
}

export const RoleStacks: React.FC<RoleStacksProps> = ({
  onStartFree,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'professionals' | 'institutions'>('students');
  const [copiedLink, setCopiedLink] = useState(false);

  const stacks = {
    students: {
      role: 'Students & Applicants',
      badge: 'Academic & Admissions',
      icon: IconHandId,
      headline: 'From university admissions to your first scholarship abroad.',
      desc: 'Keep high school records, university transcripts, scholarship applications, and recommendation letters organized and ready.',
      docs: [
        { name: 'Curriculum Vitae (CV)', meta: 'Updated 2 days ago · AI indexed' },
        { name: 'IELTS Academic Certificate', meta: 'Band 8.0 · Valid through Dec 2026' },
        { name: 'Letters of Recommendation', meta: '2 reference letters verified' },
        { name: 'Official Degree Transcript', meta: 'MIT · 256-bit encrypted' },
      ],
      packageTitle: 'Master Scholarship Application Dossier',
      filesCount: '4 files ready',
      link: 'kred.link/s/oxford-scholarship-9x',
    },
    professionals: {
      role: 'Working Professionals',
      badge: 'Licensing & Careers',
      icon: IconProfessionalLicense,
      headline: 'Professional licenses and board certifications that never expire unnoticed.',
      desc: 'Manage medical and engineering council licenses, background checks, and state credentials with automatic renewal alerts.',
      docs: [
        { name: 'Clinical Specialist Practice License', meta: 'Active · Valid through Dec 2026' },
        { name: 'AWS Solutions Architect Professional', meta: 'Verified · Good standing' },
        { name: 'Background Check Verification', meta: 'Ready to share · Valid 30 days' },
        { name: 'Government ID & Passport', meta: 'Encrypted · Sovereign vault' },
      ],
      packageTitle: 'Senior Clinical Practice Dossier',
      filesCount: '4 files ready',
      link: 'kred.link/s/dha-license-uk-88',
    },
    institutions: {
      role: 'Universities & Issuers',
      badge: 'Issuance & Verification',
      icon: IconHardwareEnclave,
      headline: 'Issue verifiable credentials directly into your students’ personal vaults.',
      desc: 'Eliminate transcript verification delays and protect your institution with tamper-proof digital attestations.',
      docs: [
        { name: 'Batch Degree Issuance (W3C)', meta: 'Cryptographic registrar seal' },
        { name: 'Employer Verification Link', meta: 'Instant checker · QR + Hash' },
        { name: 'Student Direct Delivery', meta: 'Sent to personal wallet' },
        { name: 'Verification Audit Log', meta: 'Complete compliance record' },
      ],
      packageTitle: 'Graduation Class 2026 Ledger',
      filesCount: '1,200 records',
      link: 'kred.link/v/univ-verif-portal',
    },
  };

  const currentStack = stacks[activeTab];
  const CurrentIcon = currentStack.icon;

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(`https://${link}`);
    setCopiedLink(true);
    onShowToast(`Copied secure link: https://${link}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="stacks" className="bg-white py-20 md:py-28 border-t border-[#E4E4E7]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
              <span>Tailored Solutions</span>
            </div>
            <h2 className="text-[30px] sm:text-[38px] font-bold tracking-tight text-[#18181B] leading-tight">
              Built for students, professionals, and issuers
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#F4F4F5] p-1 rounded-xl self-start border border-[#E4E4E7]">
            {(['students', 'professionals', 'institutions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-9 px-4 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-[#18181B] shadow-2xs'
                    : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                {tab === 'students'
                  ? 'For Students'
                  : tab === 'professionals'
                  ? 'For Professionals'
                  : 'For Universities'}
              </button>
            ))}
          </div>
        </div>

        {/* Stack Content Grid */}
        <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          
          {/* Left Narrative Card */}
          <div className="rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] p-7 sm:p-9 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center p-1 shadow-2xs">
                  <CurrentIcon size={34} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[#71717A]">
                    {currentStack.badge}
                  </span>
                  <div className="text-[16px] font-bold text-[#18181B]">
                    {currentStack.role}
                  </div>
                </div>
              </div>

              <h3 className="mt-6 text-[22px] sm:text-[26px] font-bold tracking-tight leading-snug text-[#18181B]">
                {currentStack.headline}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#71717A]">
                {currentStack.desc}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E4E4E7] flex items-center justify-between">
              <button
                onClick={onStartFree}
                className="h-10 px-5 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white text-[13px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[12px] font-medium text-[#71717A]">
                Setup takes under 1 minute
              </span>
            </div>
          </div>

          {/* Right Preview Card */}
          <div className="rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] p-7 sm:p-9 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
                <div className="text-[13px] font-bold text-[#18181B]">
                  {currentStack.packageTitle}
                </div>
                <span className="text-[11px] font-mono text-[#10C77A] bg-[#10C77A]/15 px-2 py-0.5 rounded font-semibold">
                  {currentStack.filesCount}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {currentStack.docs.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-between gap-3 text-[12.5px]"
                  >
                    <div className="font-semibold text-[#18181B] truncate">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-[#71717A] shrink-0 font-medium">
                      {d.meta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E4E7]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E4E4E7] text-[12px]">
                <span className="font-mono text-[#71717A] truncate">
                  https://{currentStack.link}
                </span>
                <button
                  onClick={() => handleCopy(currentStack.link)}
                  className="px-3 py-1 rounded-lg bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[11.5px] inline-flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default RoleStacks;
