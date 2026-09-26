import React, { useState } from 'react';
import { KredLogoMark } from './KredLogo';
import { X, Copy, Check, Sparkles, Shield, Layers, FileText } from 'lucide-react';

interface BrandSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const BrandSystemModal: React.FC<BrandSystemModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (hex: string, label: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onShowToast(`Copied ${label} (${hex}) to clipboard`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const palette = [
    {
      name: 'Dark Gray',
      role: 'Primary Surface / Action Anchor',
      hex: '#18181B',
      rgb: 'rgb(24, 24, 27)',
      usage: 'Headers, solid action buttons, structural grounding, dark mode enclaves',
      textDark: false,
    },
    {
      name: 'Elevated Slate',
      role: 'Elevated Surfaces / SideNav',
      hex: '#27272A',
      rgb: 'rgb(39, 39, 42)',
      usage: 'SideNav dock, secondary elevated panels, modal backgrounds',
      textDark: false,
    },
    {
      name: 'Vault Emerald',
      role: 'Action / Verification',
      hex: '#10C77A',
      rgb: 'rgb(16, 199, 122)',
      usage: 'Verified badges, success highlights, main CTA section, security seals',
      textDark: true,
    },
    {
      name: 'Porcelain Canvas',
      role: 'Background Canvas',
      hex: '#F8F7F2',
      rgb: 'rgb(248, 247, 242)',
      usage: 'Page background, warm tactile container cards, document backdrops',
      textDark: true,
    },
    {
      name: 'Surface Soft',
      role: 'Subtle Surfaces',
      hex: '#FFFFFF',
      rgb: 'rgb(255, 255, 255)',
      usage: 'Elevated cards, white containers, input focus backgrounds',
      textDark: true,
    },
    {
      name: 'Border Gray',
      role: 'Crisp Separators',
      hex: '#EDEEF0',
      rgb: 'rgb(237, 238, 240)',
      usage: 'Card borders, hairline dividers, subtle table rules',
      textDark: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#121214]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#18181B] text-white rounded-[24px] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[88vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#18181B] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center">
              <KredLogoMark size="small" variant="light" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-medium text-white">
                  KRED Design System Specification
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#10C77A]/20 text-[#10C77A] text-[10px] font-medium">
                  Dark Gray Standard
                </span>
              </div>
              <p className="text-[11.5px] font-normal text-white/50">
                Geometry, color specifications, font-medium standard, and zero-line aesthetic
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-[13.5px]">
          {/* Section 1: Color Palette Tokens */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold uppercase tracking-wider text-white/90">
                1. Sovereign Color Palette Tokens
              </h3>
              <span className="text-[11.5px] text-white/40">Click any swatch to copy HEX code</span>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {palette.map((c) => {
                const isCopied = copiedHex === c.hex;
                return (
                  <div
                    key={c.hex}
                    onClick={() => handleCopy(c.hex, c.name)}
                    className="group relative rounded-xl bg-white/5 border border-white/10 p-3 hover:border-[#10C77A]/50 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div
                        className="w-full h-14 rounded-lg flex items-end justify-between p-2 mb-2.5 shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      >
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                            c.textDark ? 'text-[#18181B] bg-black/10' : 'text-white bg-white/20'
                          }`}
                        >
                          {c.hex}
                        </span>
                        {isCopied && (
                          <span className="text-[10px] bg-[#10C77A] text-[#18181B] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Copied
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-white text-[13px]">{c.name}</span>
                        <span className="text-[10.5px] text-white/40 font-mono">{c.rgb}</span>
                      </div>
                      <div className="text-[11px] text-[#10C77A] font-medium mt-0.5">{c.role}</div>
                    </div>

                    <p className="mt-2 pt-2 border-t border-white/5 text-[11px] text-white/60 leading-normal">
                      {c.usage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Zero Dividing Lines & Minimalist Spatial Model */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-white/90">
              2. Zero Dividing Lines & Minimalist Spatial Architecture
            </h3>
            <p className="text-[12.5px] text-white/70 leading-relaxed">
              In accordance with KRED design guidelines, harsh dividing lines between sections are eliminated in favor of generous whitespace (`py-20`/`py-28`), soft container elevation, and rounded cards (`rounded-[24px]` / `rounded-[28px]`).
            </p>
          </div>

          {/* Section 3: Typography Standard */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-white/90">
              3. Typography & Font-Medium Standard
            </h3>
            <p className="text-[12.5px] text-white/70 leading-relaxed">
              Default text font uses <strong>font-medium (500 weight)</strong> across all body paragraphs, labels, nav links, and interactive buttons for enhanced contrast, legibility, and geometric modernism.
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-white/10 bg-[#18181B] flex items-center justify-between text-[12px] text-white/60">
          <span className="font-mono">Press Esc or click close to dismiss</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[12px] font-medium transition-colors cursor-pointer"
          >
            Close Spec
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandSystemModal;
