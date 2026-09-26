import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  EyeOff,
  FileKey2,
  ServerOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface SecurityPageProps {
  onStartFree: () => void;
  onNavigate: (page: string) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({
  onStartFree,
  onNavigate,
}) => {
  const pillars = [
    {
      icon: KeyRound,
      title: 'Local Client-Side Keys',
      desc: 'Your private encryption keys are generated locally via the Web Crypto API and never leave your browser enclave. Even KRED platform engineers cannot decrypt your uploaded transcripts or passports.',
    },
    {
      icon: EyeOff,
      title: 'Zero AI Model Training Guarantee',
      desc: 'We never use your personal credentials, grades, or biometric scans to train foundational AI models. Inference runs in transient, zero-retention memory.',
    },
    {
      icon: Lock,
      title: 'AES-256 GCM Cryptography',
      desc: 'All documents at rest and in transit are protected by military-grade AES-256 authenticated encryption with unique per-document initialization vectors (IVs).',
    },
    {
      icon: FileKey2,
      title: 'Expiring, Revocable Links',
      desc: 'When sharing packages with admissions or employers, you control link lifespans and can instantly revoke access at any second with a single click.',
    },
    {
      icon: ServerOff,
      title: 'Decentralized Attestation (W3C)',
      desc: 'Compatible with W3C Verifiable Credentials and OpenID standards. You own your identity independent of any single platform.',
    },
    {
      icon: ShieldCheck,
      title: 'SOC 2 & GDPR Sovereignty',
      desc: 'Strict compliance with European GDPR Article 17 (Right to Erasure), California CCPA, and SOC 2 Type II audit certifications.',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      
      {/* Dark Security Hero */}
      <section className="bg-[#18181B] text-white pt-18 pb-18 md:pt-24 md:pb-24 relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,199,122,0.1),transparent_50%)] pointer-events-none" />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
              <span>Security & Trust Center</span>
            </div>

            <h1 className="text-[38px] sm:text-[54px] lg:text-[60px] font-bold tracking-tight leading-[1.08] text-white">
              You own your data. We mathematically prove it.
            </h1>

            <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-zinc-300 max-w-[620px]">
              Traditional cloud storage holds master keys to your files. KRED uses client-side enclaves: we cannot read, sell, or train AI on your documents.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onStartFree}
                className="h-11 px-6 rounded-xl bg-[#10C77A] text-[#18181B] text-[13.5px] font-bold hover:bg-[#10C77A]/90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <span>Deploy Encrypted Vault Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Security Pillars Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-[580px] mb-12">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
              <span>Core Architecture</span>
            </div>
            <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-[#18181B]">
              Cryptographic guarantees built into every layer
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#71717A]">
              Privacy is not a setting in our database. It is enforced through mathematical guarantees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#E4E4E7] p-7 sm:p-8 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center text-[#18181B] mb-5 shadow-2xs">
                      <Icon className="w-5 h-5 text-[#10C77A]" />
                    </div>
                    <h3 className="text-[17px] font-bold text-[#18181B]">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-[#71717A]">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E4E4E7] flex items-center gap-2 text-[12px] font-semibold text-[#18181B]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10C77A]" />
                    <span>Active Invariant</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};

export default SecurityPage;
