import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface PricingPageProps {
  onStartFree: () => void;
  onNavigate: (page: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  onStartFree,
  onNavigate,
}) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tiers = [
    {
      name: 'Starter Vault',
      badge: 'Free Forever',
      price: '$0',
      period: 'forever',
      desc: 'Everything you need to store, organize, and inspect your core credentials.',
      buttonText: 'Get Started Free',
      highlighted: false,
      features: [
        'Up to 15 encrypted documents in vault',
        'Automatic field and grade extraction',
        '3 Active expiring share links at a time',
        'Basic AI requirement audits',
        'Client-side AES-256 GCM encryption',
      ],
    },
    {
      name: 'Pro Scholar',
      badge: 'Most Popular',
      price: isAnnual ? '$6' : '$8',
      period: 'per month',
      desc: 'For active applicants, researchers, and professionals managing multiple global dossiers.',
      buttonText: 'Start 14-Day Free Trial',
      highlighted: true,
      features: [
        'Unlimited encrypted documents & files',
        'Unlimited AI reasoning queries & gap audits',
        'Automated expiration & renewal alert triggers',
        'AI-tailored cover letter and package dossiers',
        'Custom domain branding on shared links',
        'Priority document parsing queue',
      ],
    },
    {
      name: 'Universities & Issuers',
      badge: 'For Institutions',
      price: 'Custom',
      period: 'tailored plans',
      desc: 'For registrars, licensing boards, and certifying agencies issuing tamper-proof credentials.',
      buttonText: 'Contact Registrar Team',
      highlighted: false,
      features: [
        'Direct batch issuance to student wallets',
        'Instant public employer verification portal',
        'Zero-knowledge compliance & audit trails',
        'Custom SIS / Canvas / Banner integrations',
        'Dedicated SLA & migration engineering',
      ],
    },
  ];

  const faqs = [
    {
      q: 'Why is the Starter tier free forever?',
      a: 'We believe proving your identity and educational achievements should never be locked behind a paywall. Our free plan gives every student enough room to store core degrees, transcripts, and passport scans permanently.',
    },
    {
      q: 'Can KRED employees see my uploaded transcripts or passports?',
      a: 'Never. All documents are encrypted on your device using AES-256-GCM before upload. The cryptographic keys reside in your browser enclave, so our engineers only see ciphertext blobs.',
    },
    {
      q: 'How do expiring share links work for university admissions?',
      a: 'When you create an application package, you set an expiration timeframe (e.g. 7 days or 30 days) and optional password. Reviewers access a clean, verifiable page without needing an account. You can revoke access at any second.',
    },
    {
      q: 'Can I cancel or switch plans anytime?',
      a: 'Yes. There are no lock-ins or contracts. If you downgrade from Pro to Starter, you keep all your existing uploaded files in read-only mode without losing anything.',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Transparent Pricing</span>
          </div>

          <h1 className="text-[38px] sm:text-[54px] lg:text-[60px] font-bold tracking-tight leading-[1.08] text-[#18181B] max-w-[760px]">
            Sovereign credentials for everyone
          </h1>

          <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-[#71717A] max-w-[560px]">
            Free for students forever. Upgrade for unlimited AI audits and automated application bundles.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white p-1 rounded-xl border border-[#E4E4E7] shadow-2xs">
            <button
              onClick={() => setIsAnnual(false)}
              className={`h-9 px-4 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                !isAnnual ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`h-9 px-4 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <span>Annual billing</span>
              <span className="text-[11px] font-bold text-[#10C77A]">Save 25%</span>
            </button>
          </div>

        </div>
      </section>

      {/* Cards Grid */}
      <section className="pb-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all ${
                  tier.highlighted
                    ? 'bg-white border-2 border-[#18181B] shadow-lg relative'
                    : 'bg-white border border-[#E4E4E7] shadow-2xs hover:shadow-xs'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#18181B] text-white text-[11px] font-bold tracking-wider uppercase">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-bold text-[#18181B]">
                      {tier.name}
                    </h3>
                    {!tier.highlighted && (
                      <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-[40px] font-bold tracking-tight text-[#18181B]">
                      {tier.price}
                    </span>
                    <span className="text-[13px] text-[#71717A] font-medium">
                      / {tier.period}
                    </span>
                  </div>

                  <p className="mt-3 text-[13.5px] leading-relaxed text-[#71717A]">
                    {tier.desc}
                  </p>

                  <div className="mt-6 pt-6 border-t border-[#E4E4E7] space-y-3">
                    {tier.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[13px] text-[#18181B]">
                        <Check className="w-4 h-4 text-[#10C77A] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => {
                      if (tier.name.includes('Institutions')) {
                        onNavigate('about');
                      } else {
                        onStartFree();
                      }
                    }}
                    className={`w-full h-11 rounded-xl font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 ${
                      tier.highlighted
                        ? 'bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B]'
                        : 'bg-[#18181B] hover:bg-zinc-800 text-white'
                    }`}
                  >
                    <span>{tier.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* FAQs Accordion */}
          <div className="mt-24 max-w-[800px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-[#18181B]">
                Frequently Asked Questions
              </h2>
              <p className="text-[14px] text-[#71717A] mt-2">
                Have questions about pricing or data security? We have answers.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#E4E4E7] bg-white overflow-hidden shadow-2xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-[14.5px] text-[#18181B] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#71717A] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#18181B]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-[13.5px] leading-relaxed text-[#71717A] border-t border-[#E4E4E7] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PricingPage;
