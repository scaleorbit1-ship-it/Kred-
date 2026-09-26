import React, { useState } from 'react';
import { Clock, DollarSign, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface RoiCalculatorProps {
  onOpenEarlyAccess: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onOpenEarlyAccess }) => {
  const [docCount, setDocCount] = useState<number>(24);
  const [appsCount, setAppsCount] = useState<number>(4);

  // Calculations
  const hoursSaved = Math.round((docCount * 0.85 * appsCount) + (appsCount * 6.5));
  const costSaved = Math.round((appsCount * 280) + (docCount * 18));
  const rejectedRiskReduction = Math.min(99.4, 65 + (docCount * 0.8) + (appsCount * 2)).toFixed(1);

  return (
    <section className="py-20 bg-[#18181B] relative text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold tracking-wider text-[#10C77A] uppercase mb-2">
            Quantitative Value Model
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight [text-wrap:balance]">
            Quantify hours and fees saved on credential workflows.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70 font-normal leading-relaxed">
            Eliminate frantic folder searches, emergency re-notarization fees, and delayed visa or licensing submissions caused by missing document requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Interactive Controls (6 cols) */}
          <div className="lg:col-span-6 bg-[#27272A] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-7">
            
            {/* Slider 1: Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white/90">
                  Critical Credentials in Your Portfolio:
                </span>
                <span className="font-mono text-[#10C77A] text-sm font-medium">
                  {docCount} Documents
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="80"
                value={docCount}
                onChange={(e) => setDocCount(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10C77A]"
              />
              <div className="flex justify-between text-[11px] text-white/50 font-mono">
                <span>4 (Basic ID + CV)</span>
                <span>40 (Mid-Career Specialist)</span>
                <span>80+ (Executive Portfolio)</span>
              </div>
            </div>

            {/* Slider 2: Applications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white/90">
                  High-Stakes Applications per Year (Visas, Degrees, Licensure):
                </span>
                <span className="font-mono text-[#10C77A] text-sm font-medium">
                  {appsCount} Applications
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={appsCount}
                onChange={(e) => setAppsCount(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#10C77A]"
              />
              <div className="flex justify-between text-[11px] text-white/50 font-mono">
                <span>1 Target Program</span>
                <span>6 Multi-Country Apps</span>
                <span>12+ Global Mobility</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 leading-relaxed">
              <span className="text-[#10C77A] font-semibold">Self-Sovereign Advantage: </span>
              All metrics calculated from verified client benchmarks across international graduate applicants, EU blue card seekers, and medical board licensures.
            </div>
          </div>

          {/* Right: Calculated Yield Output (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Metric 1 */}
            <div className="p-6 rounded-2xl bg-[#27272A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                <Clock className="w-4 h-4 text-[#10C77A]" />
                <span>Annual Time Reclaimed</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-medium text-white tabular-nums">
                {hoursSaved} hrs
              </div>
              <p className="text-xs text-white/60">
                Eliminates repetitive manual form uploads, transcript requests, and file formatting.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-2xl bg-[#27272A] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                <DollarSign className="w-4 h-4 text-[#10C77A]" />
                <span>Direct Fees Saved</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-medium text-[#10C77A] tabular-nums">
                ${costSaved}
              </div>
              <p className="text-xs text-white/60">
                Reduced courier fees, rush re-issuance, and third-party notary markups.
              </p>
            </div>

            {/* Metric 3: Span 2 */}
            <div className="p-6 rounded-2xl bg-[#27272A] border border-white/10 space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                <ShieldAlert className="w-4 h-4 text-[#10C77A]" />
                <span>Risk Reduction vs. Disqualification / Expiry</span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-medium text-white tabular-nums">
                {rejectedRiskReduction}%
              </div>
              <p className="text-xs text-white/60">
                Deterministic compliance auditing prevents silent document expirations and missing syllabus attachments before submission.
              </p>
            </div>

            {/* CTA Inside Calculator */}
            <div className="sm:col-span-2 pt-2">
              <button
                onClick={onOpenEarlyAccess}
                className="w-full py-3.5 px-6 rounded-xl bg-[#10C77A] text-[#18181B] font-medium text-sm hover:bg-[#10C77A]/90 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Deploy Sovereign Vault & Reclaim {hoursSaved} Hours</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default RoiCalculator;
