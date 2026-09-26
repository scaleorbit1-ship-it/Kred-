import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import {
  IconVaultStore,
  IconReasoningEngine,
  IconVerifiedDossier,
} from './VectorIcons';

interface CapabilitiesBentoProps {
  onSelectFeature?: (feature: string) => void;
  onNavigateToHow?: () => void;
}

export const CapabilitiesBento: React.FC<CapabilitiesBentoProps> = ({
  onSelectFeature,
}) => {
  const features = [
    {
      id: 'store',
      title: 'Store & Protect',
      desc: 'Keep diplomas, licenses, IDs, and transcripts safe on your personal device. KRED reads the key fields without uploading raw files to cloud servers.',
      badge: 'Client-Side Vault',
      icon: IconVaultStore,
      bullets: [
        'Secure on-device storage with zero cloud tracking',
        'Automatic indexing of dates, scores, and issuing authorities',
        'Built-in expiration tracking for licenses and passports',
      ],
    },
    {
      id: 'understand',
      title: 'Audit & Understand',
      desc: 'Ask questions across your entire document history. Check whether your GPA and certificates qualify you for scholarships, jobs, or visas.',
      badge: 'AI Prerequisite Auditor',
      icon: IconReasoningEngine,
      bullets: [
        'Clear answers to questions in plain, everyday English',
        'Automatic checks for missing requirements or expired papers',
        'Instant grade and equivalency conversions (US GPA, ECTS)',
      ],
    },
    {
      id: 'share',
      title: 'Assemble & Share',
      desc: 'Create verified application dossiers in seconds. Share expiring, tamper-proof links with universities and employers instead of messy email attachments.',
      badge: '1-Click Dossiers',
      icon: IconVerifiedDossier,
      bullets: [
        'Ready-to-send application packages for visas and schools',
        'Set custom link expiry (24 hours to 30 days)',
        'Track recipient views and revoke access at any time',
      ],
    },
  ];

  return (
    <section id="product" className="py-20 md:py-28 bg-[#FAFAFA] border-t border-[#E4E4E7]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-[620px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Core Capabilities</span>
          </div>
          <h2 className="text-[30px] sm:text-[38px] font-bold tracking-tight text-[#18181B] leading-tight">
            How KRED makes your documents work for you
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#71717A]">
            Turn scattered PDF folders and certificate photos into an intelligent, actionable personal vault.
          </p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectFeature?.(item.title)}
                className="group rounded-2xl bg-white border border-[#E4E4E7] p-6 sm:p-7 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center p-1 group-hover:scale-105 transition-transform shadow-2xs">
                      <Icon size={34} />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-[#71717A]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[18px] font-bold text-[#18181B]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#71717A]">
                    {item.desc}
                  </p>

                  {/* Bullets */}
                  <div className="mt-5 pt-4 border-t border-[#E4E4E7] space-y-2.5">
                    {item.bullets.map((b, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-[12.5px] text-[#18181B] leading-snug"
                      >
                        <Check className="w-4 h-4 text-[#10C77A] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#18181B] group-hover:text-[#10C77A] transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CapabilitiesBento;
