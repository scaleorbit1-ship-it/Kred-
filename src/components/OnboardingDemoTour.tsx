import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Wallet,
  Bot,
  RefreshCw,
  Check,
  ChevronRight,
} from 'lucide-react';

interface OnboardingDemoTourProps {
  userEmail: string;
  userName?: string;
  onCompleteTour: () => void;
  onLaunchVault: () => void;
  onLaunchAssistant: () => void;
  onSkipTour?: () => void;
}

export const OnboardingDemoTour: React.FC<OnboardingDemoTourProps> = ({
  userEmail,
  userName = 'Alex Morgan',
  onCompleteTour,
  onLaunchVault,
  onLaunchAssistant,
  onSkipTour,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [enclaveProgress, setEnclaveProgress] = useState<number>(0);
  const [selectedCredential, setSelectedCredential] = useState<'degree' | 'cert' | 'passport'>('degree');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isSeeded, setIsSeeded] = useState<boolean>(false);

  // Step 1: Automatic simulated enclave provisioning
  useEffect(() => {
    if (currentStep === 1) {
      const interval = setInterval(() => {
        setEnclaveProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleSeedCredential = () => {
    setIsSeeding(true);
    setTimeout(() => {
      setIsSeeding(false);
      setIsSeeded(true);
      setTimeout(() => {
        setCurrentStep(3);
      }, 600);
    }, 900);
  };

  const handleRunAiReasoning = () => {
    setCurrentStep(4);
  };

  return (
    <div className="min-h-[620px] max-w-[860px] mx-auto rounded-[28px] bg-white border border-[#EDEEF0] shadow-xl overflow-hidden flex flex-col my-8 animate-toast">
      {/* Top Bar Progress */}
      <div className="bg-[#18181B] text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#10C77A] text-[#18181B] grid place-items-center font-medium text-xs">
            {userName ? userName.slice(0, 2).toUpperCase() : 'AM'}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white flex items-center gap-2">
              <span>Interactive Vault Setup & Live Demo</span>
              <span className="text-[10px] bg-[#10C77A]/20 text-[#10C77A] px-2 py-0.5 rounded-full font-mono">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-white/55 font-mono truncate max-w-[280px] sm:max-w-none">
              {userEmail} • Sovereign Enclave
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === step
                  ? 'w-7 bg-[#10C77A]'
                  : currentStep > step
                  ? 'w-3 bg-[#10C77A]/60'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
          {onSkipTour && currentStep < 4 && (
            <button
              onClick={onSkipTour}
              className="ml-3 text-[11px] text-white/50 hover:text-white underline cursor-pointer"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>

      {/* Main Tour Interactive Content */}
      <div className="p-6 sm:p-10 flex-1 flex flex-col justify-between">
        {/* Step 1: Zero-Knowledge Key Generation */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-toast">
            <div className="flex items-center gap-3 text-[#10C77A] text-[12.5px] font-semibold uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>Step 1 of 3: Cryptographic Enclave Provisioning</span>
            </div>

            <div>
              <h2 className="text-[24px] sm:text-[30px] font-medium tracking-[-0.03em] text-[#18181B]">
                Initializing Your Client-Side Enclave
              </h2>
              <p className="mt-2 text-[14.5px] text-[#18181B]/70 leading-relaxed max-w-[620px]">
                KRED creates a private cryptographic keypair directly in your browser. No master copies are stored on central servers — only your key can decrypt your diplomas and certificates.
              </p>
            </div>

            <div className="p-6 rounded-[20px] bg-[#F8F7F2] border border-[#EDEEF0] space-y-4">
              <div className="flex items-center justify-between text-[13px] font-medium text-[#18181B]">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10C77A]" />
                  Generating 256-bit AES Master Key
                </span>
                <span className="font-mono text-[12px] text-[#10C77A] font-medium">
                  {enclaveProgress}%
                </span>
              </div>

              <div className="h-2 w-full bg-[#EDEEF0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10C77A] transition-all duration-500 rounded-full"
                  style={{ width: `${enclaveProgress}%` }}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3 pt-2 text-[11.5px] text-[#18181B]/65">
                <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#EDEEF0]">
                  <Check className="w-3.5 h-3.5 text-[#10C77A]" />
                  <span>SHA-256 Signature Ring</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#EDEEF0]">
                  <Check className="w-3.5 h-3.5 text-[#10C77A]" />
                  <span>Local WebAuthn Hook</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-lg border border-[#EDEEF0]">
                  <Check className="w-3.5 h-3.5 text-[#10C77A]" />
                  <span>Zero Server Training</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={enclaveProgress < 100}
                className="h-11 px-6 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-[13.5px] font-medium transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Continue: Ingest First Credential</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Seed / Ingest First Credential */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-toast">
            <div className="flex items-center gap-3 text-[#10C77A] text-[12.5px] font-semibold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Step 2 of 3: Credential Verification Sandbox</span>
            </div>

            <div>
              <h2 className="text-[24px] sm:text-[30px] font-medium tracking-[-0.03em] text-[#18181B]">
                Select a Sample Credential to Seed Your Vault
              </h2>
              <p className="mt-2 text-[14.5px] text-[#18181B]/70 leading-relaxed max-w-[620px]">
                Choose an initial document template to test automated OCR parsing, registrar signature validation, and schema packaging.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'degree',
                  title: 'MIT Official Degree & Transcript',
                  type: 'Academic Record',
                  issuer: 'MIT Registrar',
                  badge: 'GPA 4.80 • Verified',
                },
                {
                  id: 'cert',
                  title: 'AWS Solutions Architect Pro',
                  type: 'Cloud Certification',
                  issuer: 'Amazon Web Services',
                  badge: 'Valid till Nov 2025',
                },
                {
                  id: 'passport',
                  title: 'National Biometric Passport',
                  type: 'Government ID',
                  issuer: 'Dept. of State',
                  badge: 'Chip Verified 2029',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCredential(item.id as any)}
                  className={`p-4 rounded-[16px] border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedCredential === item.id
                      ? 'bg-[#F8F7F2] border-[#18181B] ring-2 ring-[#18181B]/10 shadow-xs'
                      : 'bg-white border-[#EDEEF0] hover:border-[#18181B]/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-medium tracking-wider text-[#18181B]">
                        {item.type}
                      </span>
                      {selectedCredential === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#10C77A]" />
                      )}
                    </div>
                    <h4 className="text-[14px] font-semibold text-[#18181B] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11.5px] text-[#18181B]/60 mt-1">{item.issuer}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EDEEF0] text-[11px] font-mono text-[#10C77A] font-medium">
                    {item.badge}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#EDEEF0]">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-[13px] font-medium text-[#18181B]/60 hover:text-[#18181B] cursor-pointer"
              >
                &larr; Back
              </button>

              <button
                onClick={handleSeedCredential}
                disabled={isSeeding}
                className="h-11 px-6 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white text-[13.5px] font-medium transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSeeding ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing & Indexing Credential...</span>
                  </span>
                ) : isSeeded ? (
                  <span className="inline-flex items-center gap-2 text-[#10C77A]">
                    <Check className="w-4 h-4" />
                    <span>Verified! Moving to AI Analysis...</span>
                  </span>
                ) : (
                  <>
                    <span>Ingest & Verify Credential</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Assistant Reasoning Simulation */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-toast">
            <div className="flex items-center gap-3 text-[#10C77A] text-[12.5px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Step 3 of 3: AI Application Gap Analysis</span>
            </div>

            <div>
              <h2 className="text-[24px] sm:text-[30px] font-medium tracking-[-0.03em] text-[#18181B]">
                Simulate AI Query on Your Seeded Records
              </h2>
              <p className="mt-2 text-[14.5px] text-[#18181B]/70 leading-relaxed max-w-[620px]">
                Ask KRED to evaluate your portfolio against top scholarship and job benchmarks in real-time.
              </p>
            </div>

            {/* AI Simulated Chat Box */}
            <div className="rounded-[20px] bg-[#18181B] text-white p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[12px]">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#10C77A] animate-pulse" />
                  <span>KRED Reasoning Enclave</span>
                </div>
                <span className="text-white/50 font-mono text-[11px]">Prompt: Schwarzman 2026 Audit</span>
              </div>

              <div className="space-y-3 text-[13px]">
                <div className="bg-white/10 p-3 rounded-xl text-white/90">
                  <span className="text-[#10C77A] font-medium block text-[11px] uppercase tracking-wider mb-1">
                    User Prompt
                  </span>
                  "Do my seeded MIT credentials and IELTS score qualify for the Schwarzman Global Scholars cohort?"
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl space-y-2">
                  <span className="text-[#10C77A] font-medium block text-[11px] uppercase tracking-wider">
                    KRED AI Verified Answer
                  </span>
                  <p className="text-white/85 leading-relaxed">
                    ✅ <strong>Academic Match:</strong> Your MIT degree (GPA 4.80) satisfies the top 5% academic requirement.
                    <br />
                    ✅ <strong>Language Verification:</strong> IELTS 8.0 exceeds the 7.5 minimum threshold.
                    <br />
                    ⚠️ <strong>Application Gap:</strong> Schwarzman requires 3 recommendation letters; you have 1 uploaded. 1-click invitation ready to send to your registrar.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#EDEEF0]">
              <button
                onClick={() => setCurrentStep(2)}
                className="text-[13px] font-medium text-[#18181B]/60 hover:text-[#18181B] cursor-pointer"
              >
                &larr; Back
              </button>

              <button
                onClick={handleRunAiReasoning}
                className="h-11 px-6 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[13.5px] font-medium transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Complete Demo & Enter Workspaces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready to Enter Workspaces (Vault App & AI Assistant) */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center py-4 animate-toast">
            <div className="w-16 h-16 rounded-full bg-[#10C77A]/20 text-[#10C77A] flex items-center justify-center font-medium text-3xl mx-auto ring-8 ring-[#10C77A]/10">
              ✓
            </div>

            <div>
              <h2 className="text-[26px] sm:text-[34px] font-medium tracking-[-0.03em] text-[#18181B]">
                Your Sovereign Vault is Ready!
              </h2>
              <p className="mt-2 text-[15px] text-[#18181B]/70 max-w-[540px] mx-auto leading-relaxed">
                Your credentials are secured in zero-knowledge storage. Choose where you'd like to dive in first:
              </p>
            </div>

            {/* Launch Cards */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-[620px] mx-auto text-left pt-2">
              <div
                onClick={onLaunchVault}
                className="p-5 rounded-[20px] bg-[#18181B] text-white hover:ring-2 hover:ring-[#10C77A] transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#10C77A] mb-3 group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-medium text-white flex items-center justify-between">
                    <span>Main Vault App</span>
                    <ArrowRight className="w-4 h-4 text-[#10C77A] group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="mt-1.5 text-[12px] text-white/70 leading-normal">
                    Manage records, generate expiring share links, and inspect cryptographic signatures.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-white/10 text-[11px] font-mono text-[#10C77A]">
                  Open Vault Dashboard &rarr;
                </div>
              </div>

              <div
                onClick={onLaunchAssistant}
                className="p-5 rounded-[20px] bg-white border-2 border-[#EDEEF0] hover:border-[#18181B] transition-all cursor-pointer group flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#18181B]/10 flex items-center justify-center text-[#18181B] mb-3 group-hover:scale-110 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-medium text-[#18181B] flex items-center justify-between">
                    <span>AI Reasoning Assistant</span>
                    <ArrowRight className="w-4 h-4 text-[#18181B] group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="mt-1.5 text-[12px] text-[#18181B]/70 leading-normal">
                    Chat with your wallet, check scholarship eligibility, and draft application packages.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#EDEEF0] text-[11px] font-mono text-[#18181B]">
                  Launch AI Assistant &rarr;
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingDemoTour;
