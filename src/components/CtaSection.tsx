import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface CtaSectionProps {
  onStartFree: () => void;
  onOpenBrandModal?: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onStartFree }) => {
  return (
    <section id="final" className="bg-[#18181B] text-white py-20 md:py-28 relative overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,199,122,0.12),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Subtle Kicker */}
        <div className="flex items-center justify-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
          <span>Get Started Today</span>
          <span aria-hidden="true">·</span>
          <span>No Credit Card Required</span>
        </div>

        {/* Heading */}
        <h2 className="text-[34px] sm:text-[46px] lg:text-[54px] font-bold tracking-tight leading-[1.08] max-w-[680px] mx-auto text-white">
          Ready to get your credentials organized & understood?
        </h2>

        {/* Subheading */}
        <p className="mt-4 text-[16px] sm:text-[17.5px] leading-relaxed text-zinc-300 max-w-[520px] mx-auto font-normal">
          Join thousands of students and professionals who stopped hunting through disorganized folders and expired documents.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3.5">
          <button
            onClick={onStartFree}
            className="h-12 px-7 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[14px] font-bold tracking-tight transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Start Free — Setup in 20 seconds</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Security Reassurance */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[12.5px] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
          <span>100% client-side privacy. Your files are never stored or sold.</span>
        </div>

      </div>
    </section>
  );
};

export default CtaSection;
