import React, { useState, useEffect } from 'react';
import { KredLogo } from './KredLogo';
import { ChevronDown, ArrowRight, LogIn, Menu, X, Sparkles, Calendar, User, LogOut, KeyRound } from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentPage: string;
  onNavigatePage: (page: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenBrandModal: () => void;
  onOpenEarlyAccess: () => void;
  onOpenSignInModal?: () => void;
  onShowToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigatePage,
  onOpenSignInModal,
  onShowToast,
}) => {
  const { openSettings } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getCurrentUser());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    const unsubscribeAuth = authService.subscribe((user) => setCurrentUser(user));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
    };
  }, []);

  const handleNav = (page: string) => {
    onNavigatePage(page);
    setSolutionsDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignInClick = () => {
    setMobileMenuOpen(false);
    if (onOpenSignInModal) {
      onOpenSignInModal();
    } else {
      onShowToast('Opening Sign In...');
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none ${
        scrolled ? 'pt-2.5 sm:pt-4 px-3 sm:px-6' : 'pt-0 px-0'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 pointer-events-auto flex items-center justify-between ${
          scrolled
            ? 'max-w-[1040px] h-[58px] px-3.5 sm:px-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E4E4E7] shadow-[0_12px_36px_rgba(24,24,27,0.09)]'
            : 'max-w-[1240px] h-[66px] px-4 sm:px-6 lg:px-8 bg-[#FAF9F5]/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-b border-[#E4E4E7]/60 sm:border-transparent'
        }`}
      >
        
        {/* Brand Logo & Wordmark */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2.5 group cursor-pointer transition-transform active:scale-95"
            aria-label="KRED Home"
          >
            <KredLogo size="default" variant="dark" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-[#71717A]">
            <button
              onClick={() => {
                if (currentPage === 'home') {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNav('product');
                }
              }}
              className="py-1.5 transition-colors cursor-pointer hover:text-[#18181B]"
            >
              Features
            </button>

            <button
              onClick={() => {
                if (currentPage === 'home') {
                  document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNav('how');
                }
              }}
              className="py-1.5 transition-colors cursor-pointer hover:text-[#18181B]"
            >
              How It Works
            </button>

            <button
              onClick={() => {
                if (currentPage === 'home') {
                  document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNav('solutions');
                }
              }}
              className="py-1.5 transition-colors cursor-pointer hover:text-[#18181B]"
            >
              Success Stories
            </button>

            <button
              onClick={() => {
                if (currentPage === 'home') {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleNav('pricing');
                }
              }}
              className="py-1.5 transition-colors cursor-pointer hover:text-[#18181B]"
            >
              Pricing
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => handleNav('assistant')}
                className="h-9 px-2.5 sm:px-3 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#10C77A] text-[12px] sm:text-[12.5px] font-semibold text-[#18181B] inline-flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                title="View Sovereign Vault"
              >
                <span className="w-5 h-5 rounded-full bg-[#10C77A] text-[#18181B] text-[10.5px] font-bold grid place-items-center">
                  {currentUser.avatarLetter || 'K'}
                </span>
                <span className="max-w-[110px] truncate">{currentUser.name}</span>
              </button>
              <button
                onClick={async () => {
                  await authService.signOut();
                  onShowToast('Signed out of vault.');
                }}
                className="w-8.5 h-8.5 rounded-xl hover:bg-black/5 text-[#71717A] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="hidden sm:inline-flex h-9 px-3 sm:px-3.5 rounded-xl text-[12.5px] sm:text-[13px] font-medium text-[#18181B] bg-white border border-[#E4E4E7] hover:border-[#18181B] hover:bg-[#FAF9F5] transition-all cursor-pointer items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Desktop Only Get Started - Hidden on mobile nav bar */}
          <button
            type="button"
            onClick={() => handleNav('get-started')}
            className="hidden lg:inline-flex h-9 px-3.5 sm:px-4 rounded-xl bg-[#18181B] text-white text-[12.5px] sm:text-[13px] font-medium hover:bg-[#10C77A] hover:text-[#18181B] transition-all cursor-pointer shadow-xs items-center gap-1.5 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Navigation Toggle (Menu Icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center text-[#18181B] cursor-pointer shadow-2xs active:scale-95"
            aria-label="Toggle mobile navigation"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer Modal */}
      {mobileMenuOpen && (
        <div className="lg:hidden pointer-events-auto fixed inset-x-3 top-[72px] rounded-2xl border border-[#E4E4E7] bg-white/98 backdrop-blur-xl p-4 shadow-2xl space-y-3 animate-toast z-50 max-h-[85vh] overflow-y-auto">
          {currentUser && (
            <div className="p-3 rounded-xl bg-[#F4F4F5] flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#10C77A] text-[#18181B] text-[12px] font-bold grid place-items-center">
                  {currentUser.avatarLetter || 'K'}
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#18181B] leading-tight">{currentUser.name}</span>
                  <span className="text-[11px] text-[#71717A]">{currentUser.email}</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  await authService.signOut();
                  setMobileMenuOpen(false);
                  onShowToast('Signed out of vault.');
                }}
                className="p-1.5 text-[#71717A] hover:text-rose-600 rounded-lg"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-1">
            {[
              { id: 'how', label: 'How It Works' },
              { id: 'solutions', label: 'Solutions' },
              { id: 'product', label: 'Features' },
              { id: 'security', label: 'Privacy & Security' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'about', label: 'About' },
              { id: 'assistant', label: 'Credential Workspace & AI' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="w-full text-left py-2.5 px-3.5 rounded-xl text-[14px] font-medium text-[#18181B] hover:bg-[#F4F4F5] transition-colors flex items-center justify-between"
              >
                <span>{item.label}</span>
                <ChevronDown className="w-4 h-4 text-[#A1A1AA] -rotate-90" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E4E4E7] flex flex-col gap-2">
            {!currentUser && (
              <button
                onClick={handleSignInClick}
                className="w-full h-10 rounded-xl border border-[#E4E4E7] text-[13px] font-semibold text-[#18181B] hover:bg-[#F4F4F5] transition-colors flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
            <button
              onClick={() => handleNav('get-started')}
              className="w-full h-10 rounded-xl bg-[#18181B] text-white text-[13px] font-semibold hover:bg-[#10C77A] hover:text-[#18181B] transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
