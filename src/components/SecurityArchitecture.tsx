import React from 'react';
import { EyeOff, KeyRound, Clock, ShieldCheck, Check } from 'lucide-react';
import { IconHardwareEnclave } from './VectorIcons';

export const SecurityArchitecture: React.FC = () => {
  const specs = [
    { label: 'Encryption', val: 'AES-256 GCM' },
    { label: 'Storage', val: '100% Client-Side' },
    { label: 'Data Rights', val: 'Zero AI Training' },
  ];

  const pillars = [
    {
      title: 'Zero AI Training on Your Records',
      desc: 'Your degrees, transcripts, and passports are never used to train public AI models or stored on public servers.',
      icon: <EyeOff className="w-4 h-4 text-[#10C77A]" />,
    },
    {
      title: 'Local Client-Side Keys',
      desc: 'Encryption keys are generated and stored right in your browser. Even KRED platform engineers cannot view your documents.',
      icon: <KeyRound className="w-4 h-4 text-[#10C77A]" />,
    },
    {
      title: 'Expiring & Revocable Share Links',
      desc: 'Set custom link expiry windows (24h, 7 days, 30 days) and instantly revoke access with a single click.',
      icon: <Clock className="w-4 h-4 text-[#10C77A]" />,
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 bg-[#FAFAFA] border-t border-[#E4E4E7]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        
        {/* Left Column (Security Visual) */}
        <div className="order-2 lg:order-1">
          <div className="rounded-2xl bg-white border border-[#E4E4E7] p-8 sm:p-10 relative overflow-hidden shadow-2xs">
            <div className="relative z-10">
              
              {/* Vault Centerpiece */}
              <div className="mx-auto w-[220px] sm:w-[240px] h-[220px] sm:h-[240px] rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col items-center justify-center p-4 relative shadow-2xs">
                <IconHardwareEnclave size={105} />
                <div className="mt-3 text-[11px] font-mono font-bold text-[#18181B] tracking-wider uppercase">
                  AES-256 GCM Enclave
                </div>
                {/* Verified Seal */}
                <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-[#10C77A] text-[#18181B] grid place-items-center font-bold text-[14px] shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              {/* 3 Metric Chips */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {specs.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] p-3 text-center"
                  >
                    <div className="text-[10px] font-semibold tracking-wider uppercase text-[#71717A]">
                      {item.label}
                    </div>
                    <div className="mt-1 text-[12px] font-bold text-[#18181B]">
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (Pillars) */}
        <div className="order-1 lg:order-2">
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wider uppercase text-[#71717A] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A]" />
            <span>Security & Privacy</span>
          </div>

          <h2 className="text-[30px] sm:text-[38px] font-bold tracking-tight text-[#18181B] leading-tight">
            Bank-grade privacy, owned and controlled by you
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-[#71717A]">
            Most cloud drives store your documents unencrypted on corporate servers. KRED treats academic and professional credentials with extreme cryptographic privacy.
          </p>

          <div className="mt-8 space-y-5">
            {pillars.map((p, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {p.icon}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#18181B]">
                    {p.title}
                  </h4>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#71717A]">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SecurityArchitecture;
