import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Globe2,
  Heart,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface AboutPageProps {
  onStartFree: () => void;
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onStartFree,
  onNavigate,
}) => {
  const principles = [
    {
      k: 'True User Ownership',
      v: 'Your encryption keys and data belong strictly to you. Export your complete archive anytime with zero dark patterns or lock-in.',
    },
    {
      k: 'Verifiable AI Clarity',
      v: 'Our AI never guesses or hallucinates credentials. It cites the exact paragraph and page of your documents whenever it checks requirements.',
    },
    {
      k: 'Universal Access Forever',
      v: 'Free tier for students and scholars forever. Nobody should have to pay a toll just to prove their academic or career identity.',
    },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      
      {/* Manifesto Hero */}
      <section className="bg-[#18181B] text-white pt-18 pb-18 md:pt-24 md:pb-24 relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,199,122,0.1),transparent_50%)] pointer-events-none" />

        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-zinc-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Our Manifesto</span>
          </div>

          <h1 className="text-[38px] sm:text-[52px] lg:text-[58px] font-bold tracking-tight leading-[1.08] text-white max-w-[760px]">
            We built KRED because personal credentials are fundamentally broken.
          </h1>

          <div className="mt-8 space-y-4 text-[16px] sm:text-[17px] leading-relaxed text-zinc-300 font-normal">
            <p>
              Your university degree lives in an email attachment from 2022. Your transcript is a blurry smartphone photo of a photocopy. Your passport scan is named <code className="bg-zinc-800 px-2 py-0.5 rounded text-white font-mono text-[13.5px]">IMG_4932.jpg</code>. And every scholarship, visa application, and background check forces you to hunt them all down again.
            </p>
            <p>
              We believe every person deserves a sovereign, private digital vault that they own for life. A vault that doesn't just store documents, but actively reasons over them to open doors to universities, jobs, and cross-border opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Principles */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-[620px] mb-12">
            <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
              <span>Core Values</span>
            </div>
            <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-[#18181B]">
              Our Guiding Principles
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#71717A]">
              How we build software, handle sensitive documents, and respect our community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {principles.map((pr, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-[#E4E4E7] p-7 sm:p-8 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-[12px] font-mono font-bold text-[#10C77A] mb-3">
                    0{idx + 1}
                  </div>
                  <h3 className="text-[18px] font-bold tracking-tight text-[#18181B]">
                    {pr.k}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#71717A]">
                    {pr.v}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4E4E7] flex items-center gap-2 text-[12px] font-semibold text-[#18181B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10C77A]" />
                  <span>Uncompromised Standard</span>
                </div>
              </div>
            ))}
          </div>

          {/* Join Callout */}
          <div className="mt-16 text-center">
            <button
              onClick={onStartFree}
              className="h-11 px-7 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-semibold text-[13.5px] inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Join the Movement — Free Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

export default AboutPage;
