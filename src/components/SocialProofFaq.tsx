import React, { useState } from 'react';
import { ChevronDown, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'How does KRED prevent my credentials from being forged?',
    a: 'Every document uploaded or ingested into KRED is signed via cryptographic enclaves and sealed with W3C Verifiable Credential standard proofs. Anyone verifying your share link directly checks the issuer’s public cryptographic root without relying on centralized middlemen.'
  },
  {
    q: 'Do you train AI models on my passports or transcripts?',
    a: 'Strictly zero. All contextual reasoning and gap analysis execute in client-side secure browser sandboxes. Your documents are never exported into training batches or third-party datasets.'
  },
  {
    q: 'What happens when a sharing link expires?',
    a: 'Once an expiring package reaches its preset duration (e.g., 24 hours or 7 days), access is automatically revoked in real-time. You can also revoke access instantly at any moment with 1 click from your Dashboard.'
  },
  {
    q: 'Can institutions verify my credentials without paying fees?',
    a: 'Yes. Verification endpoints are fully zero-knowledge and open for verifiers. Employers, admissions committees, and embassies can instantly validate your cryptographic credentials.'
  }
];

export const SocialProofFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#18181B] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold tracking-wider text-[#10C77A] uppercase mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight [text-wrap:balance]">
            Deterministic Trust & Sovereign Verification
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70 font-normal leading-relaxed">
            Everything you need to know about zero-knowledge encryption, verifiable credentials, and sovereign privacy.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#27272A] border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-medium text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/60 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#10C77A]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm sm:text-base text-white/70 font-normal leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SocialProofFaq;
