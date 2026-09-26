import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, Zap, Lock } from 'lucide-react';

interface PricingProps {
  onOpenEarlyAccess: (plan?: string) => void;
}

export const PricingSection: React.FC<PricingProps> = ({ onOpenEarlyAccess }) => {
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);

  const plans = [
    {
      id: 'starter',
      name: 'Sovereign Individual',
      kicker: 'Essential Personal Vault',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Zero-knowledge encrypted storage for personal IDs, diplomas, and fundamental travel records.',
      features: [
        'Up to 15 verified credentials stored',
        'Full Client-Side AES-256-GCM encryption',
        'Basic Q&A search across documents',
        'Standard PDF export with watermarks',
        'Self-hosted browser encryption key'
      ],
      cta: 'Start Free Sovereign Vault',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional & Specialist',
      kicker: 'Recommended for Global Mobility & Healthcare',
      monthlyPrice: 19,
      annualPrice: 15,
      description: 'Advanced gap analysis, expiration alerts, and one-click application dossier builder.',
      features: [
        'Unlimited verified credentials & portfolios',
        '40+ Statutory Application Gap Checklists',
        'Predictive expiration and renewal radar',
        'Multi-modal OCR with notary seal verification',
        'Encrypted share links with self-destruct timers',
        'W3C Verifiable Credentials (DID:Key signatures)'
      ],
      cta: 'Claim Professional Early Access',
      popular: true
    },
    {
      id: 'family_office',
      name: 'Executive & Family Office',
      kicker: 'Multi-Identity & Legal Counsel',
      monthlyPrice: 49,
      annualPrice: 39,
      description: 'Manage complex multi-jurisdiction portfolios, trusts, board directorships, and dependents.',
      features: [
        'Everything in Professional tier',
        'Up to 5 sovereign family/executive vaults',
        'Automated accredited investor KYC dossiers',
        'Selective PII redaction profiles by recipient',
        'Hardware Security Key (FIDO2/WebAuthn) enforcement',
        'Dedicated cryptographic backup enclave'
      ],
      cta: 'Reserve Executive Vault',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-[#090A0F] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
            Transparent Sovereign Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight [text-wrap:balance]">
            Invest in peace of mind for your most critical assets.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            No hidden fees. No data monetization. Zero vendor lock-in with one-click full plaintext or encrypted archive export.
          </p>

          {/* Billing Switcher (Interactive Segmented Control) */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!annualBilling ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 bg-slate-800 rounded-full p-0.5 transition-colors cursor-pointer border border-slate-700 relative"
              aria-label="Toggle annual billing discount"
            >
              <div 
                className={`w-5 h-5 bg-emerald-500 rounded-full transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${annualBilling ? 'text-white' : 'text-slate-400'}`}>
              <span>Annual Billing</span>
              <span className="text-emerald-400 text-[11px] font-semibold font-mono">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = annualBilling ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-[#0E121E] border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/20 relative'
                    : 'bg-[#0D101A] border border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    Most Selected by Specialists
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 pb-4 border-b border-slate-800 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-white tabular-nums">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400">
                      / month {annualBilling && price > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Included Capabilities:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-8">
                  <button
                    onClick={() => onOpenEarlyAccess(plan.name)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Enterprise Institutional Banner */}
        <div className="mt-10 p-6 sm:p-8 bg-[#0D101A] border border-slate-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Institutional Verification Gateway & Law Firms
            </div>
            <h4 className="text-lg font-bold text-white">
              Are you an immigration law firm, hospital network, or academic registrar?
            </h4>
            <p className="text-xs text-slate-400">
              Deploy KRED Verification Gateway to automatically ingest, validate, and verify applicant credential packages with automated W3C DID attestation.
            </p>
          </div>

          <button
            onClick={() => onOpenEarlyAccess('Enterprise Gateway')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            Contact Institutional Sales
          </button>
        </div>

      </div>
    </section>
  );
};
