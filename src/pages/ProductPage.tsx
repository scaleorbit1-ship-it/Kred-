import React from 'react';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Share2,
  FileCheck,
} from 'lucide-react';

interface ProductPageProps {
  onStartFree: () => void;
  onNavigate: (page: string) => void;
  onShowToast: (msg: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  onStartFree,
  onNavigate,
  onShowToast,
}) => {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      
      {/* Product Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Product Capabilities</span>
          </div>

          <h1 className="text-[38px] sm:text-[54px] lg:text-[60px] font-bold tracking-tight leading-[1.08] text-[#18181B] max-w-[800px]">
            The sovereign wallet that understands your documents
          </h1>

          <p className="mt-4 text-[16px] sm:text-[18px] leading-relaxed text-[#71717A] max-w-[640px]">
            More than storage. KRED builds a private knowledge graph of your credentials, then uses it to help you get admitted, hired, and approved.
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5 justify-center">
            <button
              onClick={onStartFree}
              className="h-11 px-6 rounded-xl bg-[#18181B] text-white text-[13.5px] font-semibold hover:bg-zinc-800 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Start Free Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="h-11 px-5 rounded-xl bg-white border border-[#E4E4E7] text-[#18181B] text-[13.5px] font-semibold hover:border-[#18181B] transition-colors cursor-pointer shadow-2xs"
            >
              <span>Launch Live Workspace</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature 1: Ingest Anything */}
      <section className="py-8 md:py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-[#E4E4E7] overflow-hidden grid lg:grid-cols-2 shadow-2xs">
            
            <div className="p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center text-[#10C77A] shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <h3 className="mt-5 text-[24px] sm:text-[28px] font-bold tracking-tight text-[#18181B]">
                  Upload any format, anytime
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#71717A]">
                  Upload from your phone, laptop, or cloud drive. KRED reads conferral dates, registrar stamps, GPA scales, and credential numbers in seconds.
                </p>

                {/* Dropzone Simulation */}
                <div
                  onClick={() => onNavigate('assistant')}
                  className="mt-6 rounded-xl bg-[#FAFAFA] border-2 border-dashed border-[#E4E4E7] p-6 text-center cursor-pointer hover:border-[#10C77A] transition-colors"
                >
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center text-[#18181B] shadow-2xs">
                    <UploadCloud className="w-5 h-5 text-[#10C77A]" />
                  </div>
                  <div className="mt-3 text-[13px] font-semibold text-[#18181B]">
                    Drop certificates, transcripts, or IDs
                  </div>
                  <div className="mt-1 text-[11.5px] text-[#71717A]">
                    PDF, JPG, PNG, DOCX · Encrypted client-side
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[#E4E4E7] text-[12px] font-semibold text-[#18181B]">
                <span className="flex items-center gap-1.5 text-[#10C77A]">
                  <Check className="w-4 h-4" /> Degree Diplomas
                </span>
                <span className="text-[#A1A1AA]">·</span>
                <span className="flex items-center gap-1.5 text-[#10C77A]">
                  <Check className="w-4 h-4" /> GPA Transcripts
                </span>
                <span className="text-[#A1A1AA]">·</span>
                <span className="flex items-center gap-1.5 text-[#10C77A]">
                  <Check className="w-4 h-4" /> Council Licenses
                </span>
              </div>
            </div>

            {/* Visual Panel */}
            <div className="bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-[#E4E4E7] p-8 sm:p-12 flex items-center justify-center">
              <div className="w-full max-w-[420px] rounded-2xl bg-white border border-[#E4E4E7] p-6 shadow-sm text-[#18181B]">
                <div className="flex items-center justify-between text-[12px] font-semibold pb-3 border-b border-[#E4E4E7]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10C77A]" />
                    <span>Schema Extraction</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#71717A]">Instant</span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] font-mono text-[11.5px] leading-relaxed text-[#18181B] space-y-1">
                  <div>DEGREE: M.S. COMPUTER SCIENCE</div>
                  <div className="text-[#10C77A] font-bold">GPA: 4.80 / 5.00</div>
                  <div>ISSUER: MIT REGISTRAR</div>
                  <div className="text-[#71717A] text-[10.5px]">STATUS: CRYPTOGRAPHICALLY VERIFIED</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <div className="flex-1 h-9 rounded-lg bg-[#18181B] text-white text-[12px] font-semibold flex items-center justify-center">
                    AES-256 Sealed
                  </div>
                  <div className="flex-1 h-9 rounded-lg bg-[#10C77A] text-[#18181B] text-[12px] font-bold flex items-center justify-center">
                    Ready to Audit
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature 2: AI Document Reasoning */}
      <section className="py-8 md:py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#18181B] text-white overflow-hidden grid lg:grid-cols-2 shadow-2xs border border-zinc-800">
            
            <div className="p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-[#10C77A]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="mt-5 text-[24px] sm:text-[28px] font-bold tracking-tight text-white">
                  Deterministic AI cross-referencing
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-zinc-300">
                  Ask questions across all your files. KRED’s private AI doesn't hallucinate — it inspects exact document grades, dates, and prerequisites.
                </p>

                <div className="mt-7 space-y-2.5">
                  {[
                    'Does my GPA meet Oxford’s graduate admissions requirement?',
                    'Which documents do I need to renew before applying for a US visa?',
                    'Convert my university marks to US 4.0 GPA scale',
                  ].map((query, idx) => (
                    <div
                      key={idx}
                      onClick={() => onNavigate('assistant')}
                      className="p-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors text-[13px] text-zinc-200 flex items-center justify-between cursor-pointer"
                    >
                      <span>{query}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#10C77A]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 text-[12px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
                <span>Zero-knowledge inference · 100% private</span>
              </div>
            </div>

            {/* Right Side Terminal Visual */}
            <div className="bg-zinc-900/60 p-8 sm:p-12 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-zinc-800">
              <div className="w-full max-w-[420px] rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-zinc-200 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-[12px] font-mono text-zinc-400">
                  <span>Prerequisite Auditor</span>
                  <span className="text-[#10C77A] font-bold">100% Match</span>
                </div>
                <div className="mt-4 space-y-3 text-[12.5px] font-mono leading-relaxed">
                  <div className="text-zinc-400">[Target] Oxford MSc Advanced Computing</div>
                  <div className="text-emerald-400">✓ GPA 4.80 / 5.0 (Exceeds 3.7 minimum)</div>
                  <div className="text-emerald-400">✓ IELTS 8.0 (Exceeds 7.5 minimum)</div>
                  <div className="text-amber-400">! 2 Academic Reference Letters (Pending)</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature 3: Verified Sharing */}
      <section className="py-8 md:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white border border-[#E4E4E7] p-8 sm:p-12 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-[600px]">
              <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#10C77A] mb-2">
                <Share2 className="w-4 h-4" />
                <span>Expiring Share Links</span>
              </div>
              <h3 className="text-[24px] sm:text-[30px] font-bold tracking-tight text-[#18181B]">
                Share verified packages in 1 click
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#71717A]">
                Create custom expiring links for employers, admissions officers, and embassies. Track view access and revoke whenever you choose.
              </p>
            </div>

            <div className="shrink-0 flex flex-wrap gap-3">
              <button
                onClick={onStartFree}
                className="h-11 px-6 rounded-xl bg-[#18181B] hover:bg-zinc-800 text-white font-semibold text-[13.5px] inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Create Free Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductPage;
