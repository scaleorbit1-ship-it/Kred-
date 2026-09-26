import React, { useState } from 'react';
import { 
  Home, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  DollarSign, 
  BookOpen, 
  LayoutDashboard, 
  Bot, 
  ChevronRight, 
  LogIn, 
  UserPlus, 
  Lock,
  Compass,
  FileCheck2,
  ExternalLink,
  ChevronLeft,
  Settings,
  Palette,
  CheckSquare
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { KredLogoMark } from './KredLogo';

interface SideNavProps {
  currentPage: string;
  onNavigatePage: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenSignInModal?: () => void;
  onOpenSettings?: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({
  currentPage,
  onNavigatePage,
  isOpen,
  onToggle,
  onOpenSignInModal,
  onOpenSettings,
}) => {
  const { themeConfig, openSettings } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mainNavItems = [
    { id: 'home', label: 'Overview', icon: Home, badge: 'Home' },
    { id: 'product', label: 'Product & Vault', icon: Layers, badge: 'Platform' },
    { id: 'solutions', label: 'Solutions', icon: Compass, badge: 'Roles' },
    { id: 'how', label: 'How It Works', icon: Cpu, badge: 'Protocol' },
    { id: 'security', label: 'Zero-Knowledge', icon: ShieldCheck, badge: 'AES-256' },
    { id: 'pricing', label: 'Pricing & Tiers', icon: DollarSign, badge: 'Plans' },
    { id: 'about', label: 'Manifesto', icon: BookOpen, badge: 'Mission' },
  ];

  const appNavItems = [
    { id: 'assistant', label: 'Credential Vault & AI', icon: Bot, badge: 'Unified' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: 'Agent' },
  ];

  const handleItemClick = (pageId: string) => {
    onNavigatePage(pageId);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) onOpenSettings();
    else openSettings();
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay when open */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* SideNav Dock / Drawer - Styled in the Website Canvas Theme */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-45 flex flex-col justify-between transition-all duration-300 ease-out shadow-lg border-r ${
          isOpen ? 'w-[280px]' : 'w-[72px] -translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: themeConfig.bgCanvas,
          borderColor: themeConfig.borderSubtle,
          color: themeConfig.textPrimary,
        }}
        aria-label="Website Navigation Sidebar"
      >
        {/* Top Header & Fancy Hamburger Toggle */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ borderColor: themeConfig.borderSubtle }}
        >
          {isOpen ? (
            <div
              onClick={() => handleItemClick('home')}
              className="flex items-center gap-3 cursor-pointer overflow-hidden group"
            >
              <KredLogoMark size="small" variant={themeConfig.isDark ? 'light' : 'dark'} />
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold tracking-tight leading-none" style={{ color: themeConfig.textPrimary }}>
                  KRED
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase mt-0.5" style={{ color: themeConfig.textMuted }}>
                  Sovereign Wallet
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleItemClick('home')}
              className="w-full flex justify-center cursor-pointer"
            >
              <KredLogoMark size="small" variant={themeConfig.isDark ? 'light' : 'dark'} />
            </div>
          )}

          {/* Fancy Hamburger Toggle Inside Sidebar */}
          <button
            onClick={onToggle}
            className="group relative w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs"
            style={{
              backgroundColor: themeConfig.isDark ? '#27272A' : '#FFFFFF',
              borderColor: themeConfig.borderSubtle,
            }}
            title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            aria-label={isOpen ? 'Collapse Navigation' : 'Expand Navigation'}
          >
            <div className="w-4 h-3.5 flex flex-col justify-between items-center">
              <span
                className={`h-[1.5px] rounded-full transition-all duration-300 ${
                  isOpen ? 'w-4 rotate-45 translate-y-[5px]' : 'w-4 group-hover:w-3.5'
                }`}
                style={{ backgroundColor: themeConfig.textPrimary }}
              />
              <span
                className={`h-[1.5px] bg-[#10C77A] rounded-full transition-all duration-200 ${
                  isOpen ? 'opacity-0 scale-x-0' : 'w-3 group-hover:w-4'
                }`}
              />
              <span
                className={`h-[1.5px] rounded-full transition-all duration-300 ${
                  isOpen ? 'w-4 -rotate-45 -translate-y-[5px]' : 'w-3.5 group-hover:w-4'
                }`}
                style={{ backgroundColor: themeConfig.textPrimary }}
              />
            </div>
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {/* Main Website Sections */}
          <div className="space-y-1">
            {isOpen && (
              <div
                className="px-3 pb-1.5 text-[10.5px] font-medium uppercase tracking-wider"
                style={{ color: themeConfig.textMuted }}
              >
                Navigation
              </div>
            )}

            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer relative group ${
                    isActive
                      ? 'shadow-xs font-semibold'
                      : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? themeConfig.isDark
                        ? '#27272A'
                        : '#FFFFFF'
                      : 'transparent',
                    color: isActive ? themeConfig.textPrimary : themeConfig.textMuted,
                    borderWidth: isActive ? 1 : 0,
                    borderColor: isActive ? themeConfig.borderSubtle : 'transparent',
                  }}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-[#10C77A]' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  />
                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between truncate text-left">
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A] shrink-0" />
                      )}
                    </div>
                  )}

                  {/* Tooltip on collapsed desktop */}
                  {!isOpen && hoveredItem === item.id && (
                    <div
                      className="hidden lg:block absolute left-[78px] z-50 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium whitespace-nowrap shadow-xl border"
                      style={{
                        backgroundColor: themeConfig.isDark ? '#27272A' : '#18181B',
                        color: '#FFFFFF',
                        borderColor: themeConfig.borderSubtle,
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Workspace Apps */}
          <div
            className="space-y-1 pt-3 border-t"
            style={{ borderColor: themeConfig.borderSubtle }}
          >
            {isOpen && (
              <div
                className="px-3 pb-1.5 text-[10.5px] font-medium uppercase tracking-wider"
                style={{ color: themeConfig.textMuted }}
              >
                Workspace
              </div>
            )}

            {appNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer relative group ${
                    isActive ? 'shadow-xs font-semibold' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? themeConfig.isDark
                        ? '#27272A'
                        : '#FFFFFF'
                      : 'transparent',
                    color: isActive ? themeConfig.textPrimary : themeConfig.textMuted,
                    borderWidth: isActive ? 1 : 0,
                    borderColor: isActive ? themeConfig.borderSubtle : 'transparent',
                  }}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#10C77A]' : 'opacity-70 group-hover:opacity-100'
                    }`}
                  />
                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between truncate text-left">
                      <span className="truncate">{item.label}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{
                          backgroundColor: themeConfig.isDark ? '#27272A' : '#EDEFE8',
                          color: themeConfig.textPrimary,
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {!isOpen && hoveredItem === item.id && (
                    <div
                      className="hidden lg:block absolute left-[78px] z-50 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium whitespace-nowrap shadow-xl border"
                      style={{
                        backgroundColor: themeConfig.isDark ? '#27272A' : '#18181B',
                        color: '#FFFFFF',
                        borderColor: themeConfig.borderSubtle,
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions & Settings at Bottom of SideNav */}
        <div
          className="p-3 border-t space-y-2"
          style={{ borderColor: themeConfig.borderSubtle }}
        >
          {/* Settings Button to Change Theme */}
          <button
            onClick={handleSettingsClick}
            className={`w-full h-9.5 rounded-xl border flex items-center gap-2.5 px-3 text-[12.5px] font-medium transition-all cursor-pointer shadow-2xs ${
              !isOpen ? 'justify-center px-0' : 'justify-between'
            }`}
            style={{
              backgroundColor: themeConfig.isDark ? '#27272A' : '#FFFFFF',
              borderColor: themeConfig.borderSubtle,
              color: themeConfig.textPrimary,
            }}
            title="Settings & Themes"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Palette className="w-4 h-4 text-[#10C77A] shrink-0" />
              {isOpen && <span className="truncate">Theme & Settings</span>}
            </div>
            {isOpen && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-bold"
                style={{
                  backgroundColor: themeConfig.isDark ? '#18181B' : '#F8F7F2',
                  color: '#10C77A',
                }}
              >
                {themeConfig.id}
              </span>
            )}
          </button>

          {isOpen ? (
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={() => {
                  if (onOpenSignInModal) onOpenSignInModal();
                }}
                className="w-full h-9 rounded-xl border text-[12.5px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: themeConfig.isDark ? '#27272A' : '#FFFFFF',
                  borderColor: themeConfig.borderSubtle,
                  color: themeConfig.textPrimary,
                }}
              >
                <LogIn className="w-3.5 h-3.5 opacity-70" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => handleItemClick('get-started')}
                className="w-full h-9.5 rounded-xl bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] text-[12.5px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Vault</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <button
                onClick={() => {
                  if (onOpenSignInModal) onOpenSignInModal();
                }}
                className="w-10 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                style={{
                  backgroundColor: themeConfig.isDark ? '#27272A' : '#FFFFFF',
                  borderColor: themeConfig.borderSubtle,
                  color: themeConfig.textPrimary,
                }}
                title="Sign In"
              >
                <LogIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleItemClick('get-started')}
                className="w-10 h-9 rounded-xl bg-[#10C77A] text-[#18181B] flex items-center justify-center cursor-pointer transition-all shadow-xs"
                title="Create Vault"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideNav;
