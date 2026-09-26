import React from 'react';
import { KredLogo } from './KredLogo';

interface FooterProps {
  onNavigatePage: (page: string) => void;
  onOpenBrandModal: () => void;
  onShowToast: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePage,
  onOpenBrandModal,
  onShowToast,
}) => {
  const handleNav = (page: string) => {
    onNavigatePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#18181B] text-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8 py-16">
        <div className="flex flex-wrap gap-10 justify-between">
          {/* Brand Column */}
          <div className="max-w-[320px]">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <KredLogo size="default" variant="light" />
            </button>
            <p className="mt-4 text-[13px] leading-[1.6] text-white/60 font-normal">
              AI-powered credential wallet for students, professionals, and issuers.
              Securely store, organize, understand, and share verified records.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-[12.5px]">
            <div>
              <div className="font-medium tracking-tight mb-3.5 text-white">
                Product
              </div>
              <div className="space-y-2 text-white/60 font-normal">
                <button
                  onClick={() => handleNav('product')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Architecture
                </button>
                <button
                  onClick={() => handleNav('assistant')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Credential Workspace
                </button>
                <button
                  onClick={() => handleNav('assistant')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  AI Intelligence
                </button>
                <button
                  onClick={() => handleNav('how')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  How it Works
                </button>
              </div>
            </div>

            <div>
              <div className="font-medium tracking-tight mb-3.5 text-white">
                Solutions
              </div>
              <div className="space-y-2 text-white/60 font-normal">
                <button
                  onClick={() => handleNav('solutions')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  For Students
                </button>
                <button
                  onClick={() => handleNav('solutions')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  For Professionals
                </button>
                <button
                  onClick={() => handleNav('solutions')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  For Universities
                </button>
                <button
                  onClick={() => handleNav('pricing')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pricing
                </button>
              </div>
            </div>

            <div>
              <div className="font-medium tracking-tight mb-3.5 text-white">
                Trust & Security
              </div>
              <div className="space-y-2 text-white/60 font-normal">
                <button
                  onClick={() => handleNav('security')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Security Center
                </button>
                <button
                  onClick={() => onShowToast('AES-256 GCM client-side encryption active.')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Client Enclave
                </button>
                <button
                  onClick={() => onShowToast('Zero-knowledge retention guarantee enabled.')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Zero AI Training
                </button>
                <button
                  onClick={() => onShowToast('SOC 2 Type II compliance report available under NDA.')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  SOC 2 Type II
                </button>
              </div>
            </div>

            <div>
              <div className="font-medium tracking-tight mb-3.5 text-white">
                Company
              </div>
              <div className="space-y-2 text-white/60 font-normal">
                <button
                  onClick={() => handleNav('about')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Manifesto
                </button>
                <button
                  onClick={onOpenBrandModal}
                  className="block hover:text-white transition-colors cursor-pointer text-left text-[#10C77A]"
                >
                  Design System
                </button>
                <button
                  onClick={() => onShowToast('Documentation portal coming soon.')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Documentation
                </button>
                <button
                  onClick={() => onShowToast('Support team: support@kredvault.org')}
                  className="block hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-white/45">
          <div>
            © {new Date().getFullYear()} KRED Inc. All rights reserved. Self-sovereign credential wallet.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onShowToast('Privacy Policy: Zero tracking, client-encrypted data.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onShowToast('Terms of Service: User retains 100% intellectual property.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onShowToast('Cryptographic audit log verified: All systems green.')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-[#10C77A]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A] animate-pulse" />
              <span>Enclave Operational</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
