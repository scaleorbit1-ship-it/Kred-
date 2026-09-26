import React, { useState } from 'react';
import { 
  Stethoscope, 
  Plane, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

interface ApplicationWorkflowsProps {
  onScrollToSandbox: (tab?: string) => void;
}

export const ApplicationWorkflows: React.FC<ApplicationWorkflowsProps> = ({ onScrollToSandbox }) => {
  const [activeWorkflow, setActiveWorkflow] = useState<number>(0);

  const workflows = [
    {
      id: 'immigration',
      title: 'Global Mobility & High-Skilled Visas',
      subtitle: 'EB-1A, O-1, EU Blue Card & Permanent Residency',
      description: 'Navigating international relocation requires harmonizing diplomas, apostilles, reference letters, and police certificates across multiple embassies and legal jurisdictions.',
      icon: Plane,
      checklist: [
        'Automatic 6-month validity audit for travel passports',
        'Peer-reviewed citation and Google Scholar metric verification',
        'Expiring criminal background check detection (>180 days)',
        'One-click compilation with indexed exhibit tabs for USCIS/consulates'
      ],
      stat: '72% faster visa package compilation for immigration attorneys and applicants.'
    },
    {
      id: 'healthcare',
      title: 'Healthcare & Board-Certified Specialists',
      subtitle: 'State Medical Licensure, DEA, CME & Hospital Credentialing',
      description: 'Physicians, surgeons, and nurses manage dozens of overlapping state licenses, DEA registrations, malpractice certificates, and biennial CME credits.',
      icon: Stethoscope,
      checklist: [
        'Automated expiration alerts 90, 60, and 30 days before licensing deadlines',
        'Cumulative CME category 1 unit tracking against state requirements',
        'DEA Schedule II-V authorized practice verification',
        'Secure watermarked hospital privileges dossier export'
      ],
      stat: '0 missed renewal deadlines across all active board-certified practitioner vaults.'
    },
    {
      id: 'executive',
      title: 'Enterprise Executives & Board Directors',
      subtitle: 'KYC Background Checks, Directorships & Accredited Status',
      description: 'Executives frequently provide sensitive personal identity records, tax certifications, and proof of wealth to financial institutions and board nomination committees.',
      icon: Briefcase,
      checklist: [
        'Zero-knowledge selective disclosure (mask SSN & personal tax records)',
        'Argon2id password-protected shareable links with 24-hour self-destruct',
        'W3C cryptographic proof of board appointments and corporate authorizations',
        'Tamper-evident audit trail for every shared document view'
      ],
      stat: '100% client-side privacy with zero server-side exposure of executive PII.'
    },
    {
      id: 'academic',
      title: 'Academic Researchers & Scholars',
      subtitle: 'Faculty Appointments, Fellowship Grants & Degree Recognition',
      description: 'Postdocs, professors, and researchers manage diplomas, international credential evaluations (WES/Anabin), patents, and fellowship citations.',
      icon: GraduationCap,
      checklist: [
        'Official transcript parsing with cumulative GPA and conferral verification',
        'IEEE / ACM fellowship certificate notarization hashes',
        'Patent portfolio aggregation with USPTO link verification',
        'Instant multi-institution grant credential dossier generation'
      ],
      stat: 'Instant translation and verification matching for global academic credentials.'
    }
  ];

  return (
    <section id="gap-engine" className="py-20 lg:py-28 bg-[#07080C] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase mb-2">
            Tailored Domain Workflows
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
            Built for high-stakes credential environments.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Whether securing an international visa, renewing a surgical license, or clearing enterprise KYC, KRED adapts to strict regulatory schemas.
          </p>
        </div>

        {/* Workflow Tabs / Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10">
          {workflows.map((wf, idx) => {
            const Icon = wf.icon;
            const isSelected = activeWorkflow === idx;
            return (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflow(idx)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#0D101A] border-emerald-500/50 shadow-md shadow-black/40'
                    : 'bg-[#090A0F] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-900 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">0{idx + 1}</span>
                </div>
                <div>
                  <h3 className={`text-xs font-bold leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}>
                    {wf.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Workflow Showcase Card */}
        <div className="bg-[#0D101A] border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {workflows[activeWorkflow].subtitle}
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                  {workflows[activeWorkflow].title}
                </h3>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  {workflows[activeWorkflow].description}
                </p>
              </div>

              {/* Checklist items */}
              <div className="space-y-3 pt-2">
                {workflows[activeWorkflow].checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Stat callout */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{workflows[activeWorkflow].stat}</span>
              </div>
            </div>

            {/* Right Interactive CTA Box (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 space-y-5">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Simulated Dossier Blueprint
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Target Standard:</span>
                  <span className="text-emerald-400">Official Regulatory Form</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Pre-Flight Audit:</span>
                  <span className="text-emerald-400">Active Verification Engine</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Verification Hash:</span>
                  <span className="text-slate-300 text-[11px] truncate max-w-[140px]">sha256:7d79...892d</span>
                </div>
              </div>

              <button
                onClick={() => onScrollToSandbox('builder')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/40"
              >
                <span>Test This Workflow in Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
