import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Check,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Globe,
  Share2,
  Sparkles,
  Search,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { KredLogo } from '../components/KredLogo';

interface OnboardingPageProps {
  onComplete: () => void;
  onNavigate: (page: string) => void;
  onShowToast?: (msg: string) => void;
  userEmail?: string;
  userName?: string;
}

const REFERRAL_OPTIONS = [
  { id: 'social', label: 'Social Media (Twitter / X, TikTok, Instagram)', icon: Share2 },
  { id: 'friends', label: 'Friends or Family', icon: MessageSquare },
  { id: 'school', label: 'University, School, or Teacher', icon: GraduationCap },
  { id: 'linkedin', label: 'LinkedIn or Work Colleague', icon: Briefcase },
  { id: 'google', label: 'Google Search or News', icon: Search },
  { id: 'other', label: 'Other', icon: Globe },
];

const PURPOSE_OPTIONS = [
  {
    id: 'store',
    title: 'Keep my certificates and degrees safe',
    desc: 'Store digital copies of your diplomas, transcripts, and school results securely.',
    icon: GraduationCap,
  },
  {
    id: 'apply',
    title: 'Apply for visas, scholarships, or jobs abroad',
    desc: 'Share verified papers with schools and employers around the world with one click.',
    icon: Globe,
  },
  {
    id: 'ai',
    title: 'Ask AI questions about requirements',
    desc: 'Find out if your grades qualify for scholarships, visas, or foreign universities.',
    icon: Sparkles,
  },
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
  onNavigate,
  onShowToast,
  userEmail = 'alex.morgan@mit.edu',
  userName = 'Alex Morgan',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [name, setName] = useState(userName);
  const [roleType, setRoleType] = useState<string>('student');
  const [referralSource, setReferralSource] = useState<string>('social');
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>(['store', 'apply']);

  const steps = [
    {
      id: 1,
      title: 'Your Profile',
      desc: 'Your username and role',
      icon: User,
    },
    {
      id: 2,
      title: 'How You Found Us',
      desc: 'Where you heard about KRED',
      icon: MessageSquare,
    },
    {
      id: 3,
      title: 'What You Need',
      desc: 'How you plan to use KRED',
      icon: Sparkles,
    },
    {
      id: 4,
      title: 'All Set',
      desc: 'Ready to get started',
      icon: ShieldCheck,
    },
  ];

  const togglePurpose = (purposeId: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(purposeId)
        ? prev.filter((id) => id !== purposeId)
        : [...prev, purposeId]
    );
  };

  const fireCelebrationConfetti = () => {
    try {
      const count = 180;
      const defaults = {
        origin: { y: 0.65 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#10C77A', '#18181B', '#FFFFFF'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#10C77A', '#34D399', '#FBBF24'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#10C77A', '#60A5FA', '#F43F5E'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#10C77A', '#18181B'],
      });
    } catch {
      // Fallback safe
    }
  };

  useEffect(() => {
    if (currentStep === 4) {
      fireCelebrationConfetti();
    }
  }, [currentStep]);

  const handleFinishUp = () => {
    onShowToast?.('Account ready! Welcome to KRED.');
    onComplete();
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8F7F2] text-[#18181B] flex relative select-none">
      
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(#18181B 0.75px, transparent 0.75px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* 100vh Full Screen Split Layout */}
      <div className="w-full h-full grid lg:grid-cols-[360px_1fr] relative z-10">
        
        {/* ============================================================ */}
        {/* LEFT SIDEBAR: STEPPER & BRAND NAVIGATION */}
        {/* ============================================================ */}
        <div className="hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-[#FAFAFA] border-r border-[#EDEEF0] relative">
          
          {/* Top Logo */}
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group text-left mb-12"
              title="Return to website"
            >
              <KredLogo size="default" variant="dark" />
            </button>

            {/* Vertical Stepper */}
            <div className="space-y-7 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="relative flex items-start gap-4">
                    
                    {/* Connecting Vertical Line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-4.5 top-9 w-[1.5px] h-10 -ml-[0.75px] transition-colors duration-300 ${
                          isPassed ? 'bg-[#10C77A]' : 'bg-[#E4E4E7]'
                        }`}
                      />
                    )}

                    {/* Step Icon Badge */}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer shadow-2xs z-10 ${
                        isPassed
                          ? 'bg-[#10C77A] border-[#10C77A] text-[#18181B]'
                          : isCurrent
                          ? 'bg-white border-[#18181B] text-[#18181B] ring-2 ring-[#10C77A]/40'
                          : 'bg-white border-[#E4E4E7] text-[#A1A1AA]'
                      }`}
                      title={`Go to ${step.title}`}
                    >
                      {isPassed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </button>

                    {/* Step Details */}
                    <div
                      onClick={() => setCurrentStep(step.id)}
                      className="cursor-pointer min-w-0"
                    >
                      <h4
                        className={`text-[13.5px] font-semibold leading-tight transition-colors ${
                          isCurrent
                            ? 'text-[#18181B]'
                            : isPassed
                            ? 'text-[#18181B]'
                            : 'text-[#A1A1AA]'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`text-[11.5px] mt-0.5 leading-snug truncate transition-colors ${
                          isCurrent
                            ? 'text-[#71717A]'
                            : isPassed
                            ? 'text-[#71717A]'
                            : 'text-[#D4D4D8]'
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Left Navigation */}
          <div className="pt-6 border-t border-[#EDEEF0] flex items-center justify-between text-[12.5px] font-medium">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('get-started')}
              className="text-[#18181B] hover:text-[#10C77A] underline transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT CANVAS: 100VH STEP WORKSPACE */}
        {/* ============================================================ */}
        <div className="h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white relative overflow-y-auto">
          
          {/* Top Status Bar */}
          <div className="flex items-center justify-between shrink-0 mb-2">
            <div className="flex items-center gap-2">
              <div className="lg:hidden">
                <KredLogo size="default" variant="dark" />
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[12px] font-medium text-[#71717A]">
                <span className="w-2 h-2 rounded-full bg-[#10C77A]" />
                <span>Step {currentStep} of 4 • Setting up your account</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishUp}
              className="text-[12.5px] font-medium text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Skip →
            </button>
          </div>

          {/* Center Main Step Canvas */}
          <div className="my-auto max-w-[500px] w-full mx-auto flex flex-col justify-center py-4">
            
            {/* ------------------------------------------------------------ */}
            {/* STEP 1: USERNAME & ROLE */}
            {/* ------------------------------------------------------------ */}
            {currentStep === 1 && (
              <div className="animate-toast space-y-5">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] border border-[#EDEEF0] grid place-items-center mx-auto mb-3 shadow-2xs">
                    <User className="w-5 h-5 text-[#10C77A]" />
                  </div>
                  <h2 className="text-[24px] sm:text-[26px] font-bold text-[#18181B] tracking-tight">
                    Create your profile
                  </h2>
                  <p className="text-[13px] text-[#71717A] mt-1 font-normal">
                    Enter your username and pick what best describes you
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[#18181B] mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. alexmorgan"
                      className="w-full h-11 px-3.5 rounded-xl border border-[#EDEEF0] bg-[#FAFAFA] text-[13.5px] text-[#18181B] focus:outline-none focus:border-[#18181B] focus:bg-white transition-all shadow-2xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#18181B] mb-1.5">
                      What best describes you?
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'student', label: 'Student / Scholar', icon: GraduationCap },
                        { id: 'worker', label: 'Working Professional', icon: Briefcase },
                        { id: 'traveler', label: 'Job or Visa Seeker', icon: Globe },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = roleType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setRoleType(item.id)}
                            className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#10C77A] bg-[#10C77A]/10 text-[#18181B] font-semibold ring-1 ring-[#10C77A]'
                                : 'border-[#EDEEF0] bg-[#FAFAFA] text-[#71717A] hover:border-[#18181B]/40'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-[#10C77A]" />
                            <span className="text-[11.5px] leading-tight font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full h-11 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] mt-4"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* STEP 2: WHERE DID YOU HEAR ABOUT US? */}
            {/* ------------------------------------------------------------ */}
            {currentStep === 2 && (
              <div className="animate-toast space-y-5">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] border border-[#EDEEF0] grid place-items-center mx-auto mb-3 shadow-2xs">
                    <MessageSquare className="w-5 h-5 text-[#10C77A]" />
                  </div>
                  <h2 className="text-[24px] sm:text-[26px] font-bold text-[#18181B] tracking-tight">
                    Where did you hear about us?
                  </h2>
                  <p className="text-[13px] text-[#71717A] mt-1 font-normal">
                    Let us know how you found KRED
                  </p>
                </div>

                <div className="space-y-2.5">
                  {REFERRAL_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = referralSource === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setReferralSource(item.id)}
                        className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'border-[#10C77A] bg-[#10C77A]/10 text-[#18181B] font-semibold'
                            : 'border-[#EDEEF0] bg-white text-[#71717A] hover:border-[#18181B]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#10C77A]' : 'text-[#71717A]'}`} />
                          <span className="text-[13px] text-[#18181B] font-medium">{item.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#10C77A] bg-[#10C77A]' : 'border-[#D4D4D8]'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full h-11 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] mt-4"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* STEP 3: WHAT DO YOU WANT TO DO WITH KRED? */}
            {/* ------------------------------------------------------------ */}
            {currentStep === 3 && (
              <div className="animate-toast space-y-5">
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] border border-[#EDEEF0] grid place-items-center mx-auto mb-3 shadow-2xs">
                    <Sparkles className="w-5 h-5 text-[#10C77A]" />
                  </div>
                  <h2 className="text-[24px] sm:text-[26px] font-bold text-[#18181B] tracking-tight">
                    What do you want to use KRED for?
                  </h2>
                  <p className="text-[13px] text-[#71717A] mt-1 font-normal">
                    Choose what matters to you. You can pick more than one.
                  </p>
                </div>

                <div className="space-y-3 mb-5">
                  {PURPOSE_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isChecked = selectedPurposes.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => togglePurpose(item.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
                          isChecked
                            ? 'border-[#10C77A] bg-[#10C77A]/5'
                            : 'border-[#EDEEF0] bg-white hover:border-[#18181B]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-[#10C77A] text-[#18181B]' : 'bg-[#F8F7F2] text-[#71717A]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[13.5px] font-semibold text-[#18181B]">
                              {item.title}
                            </div>
                            <div className="text-[11.5px] text-[#71717A]">
                              {item.desc}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-[#10C77A] border-[#10C77A] text-[#18181B]'
                              : 'border-[#EDEEF0] bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="w-full h-11 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[13.5px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* STEP 4: ALL SET */}
            {/* ------------------------------------------------------------ */}
            {currentStep === 4 && (
              <div className="animate-toast space-y-6 text-center max-w-[440px] mx-auto my-auto">
                <button
                  type="button"
                  onClick={fireCelebrationConfetti}
                  className="w-16 h-16 rounded-3xl bg-[#10C77A]/15 border border-[#10C77A]/30 flex items-center justify-center mx-auto text-[#10C77A] shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Click to celebrate!"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </button>

                <div>
                  <h1 className="text-[24px] sm:text-[26px] font-bold text-[#18181B] tracking-tight">
                    You're all set!
                  </h1>
                  <p className="text-[13.5px] text-[#71717A] mt-1.5 font-normal leading-relaxed">
                    Your secure certificate vault is ready. You can now save your documents safely and ask our AI assistant any questions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#EDEEF0] flex items-center justify-between text-[12.5px] text-[#71717A]">
                  <span className="flex items-center gap-2 text-[#18181B] font-medium">
                    <User className="w-4 h-4 text-[#10C77A]" />
                    <span>@{name.toLowerCase().replace(/\s+/g, '') || 'user'}</span>
                  </span>
                  <span className="text-[#10C77A] text-[11px] font-semibold bg-[#10C77A]/15 px-2 py-0.5 rounded">
                    Ready to use
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFinishUp}
                  className="w-full h-11.5 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] font-semibold text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* Bottom Bar: 4 Pill Step Progress Indicators */}
          <div className="pt-4 border-t border-[#EDEEF0] flex flex-col items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setCurrentStep(step)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentStep === step
                      ? 'w-10 bg-[#10C77A]'
                      : currentStep > step
                      ? 'w-8 bg-[#10C77A]/60'
                      : 'w-8 bg-[#E4E4E7]'
                  }`}
                  aria-label={`Jump to step ${step}`}
                />
              ))}
            </div>
            <span className="text-[11.5px] text-[#A1A1AA]">
              Your documents stay private and secure on your device
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OnboardingPage;
