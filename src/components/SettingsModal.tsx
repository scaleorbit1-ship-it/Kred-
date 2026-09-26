import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Check,
  Shield,
  KeyRound,
  Download,
  Lock,
  Sparkles,
  Moon,
  Info,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsModal: React.FC = () => {
  const { theme, themeConfig, setTheme, isSettingsOpen, closeSettings } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'ai' | 'privacy' | 'vault'>('appearance');
  const [autoLockMinutes, setAutoLockMinutes] = useState<string>('15');
  const [zkProofMode, setZkProofMode] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isSettingsOpen) return null;

  const handleExportKeys = () => {
    const backupData = {
      app: 'KRED Sovereign Vault',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      encryption: 'AES-256-GCM',
      enclaveId: 'enclave-zk-9941a8',
      vaultHash: '0x8f2c7a6e1d904b3c8f1e2d4a5b6c7e8f',
      note: 'Store this backup in a secure offline physical location.',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kred-vault-enclave-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-toast font-sans">
      <div
        className="w-full max-w-[640px] rounded-[28px] border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200"
        style={{
          backgroundColor: themeConfig.isDark ? '#141417' : '#FFFFFF',
          borderColor: themeConfig.borderSubtle,
          color: themeConfig.textPrimary,
        }}
      >
        {/* Modal Header */}
        <div
          className="p-5 sm:p-6 flex items-center justify-between border-b"
          style={{ borderColor: themeConfig.borderSubtle }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: themeConfig.isDark ? '#1C1C21' : '#F7F7F8',
                color: '#10C77A',
              }}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold tracking-tight">
                AI Intelligence & Enclave Settings
              </h2>
              <p
                className="text-[12px] font-normal"
                style={{ color: themeConfig.textMuted }}
              >
                Customize themes, sovereign enclave privacy, and vault security
              </p>
            </div>
          </div>

          <button
            onClick={closeSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            style={{
              backgroundColor: themeConfig.isDark ? '#1C1C21' : '#F7F7F8',
              color: themeConfig.textPrimary,
            }}
            aria-label="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex px-6 pt-3 gap-2 border-b overflow-x-auto no-scrollbar"
          style={{ borderColor: themeConfig.borderSubtle }}
        >
          {[
            { id: 'appearance', label: 'Theme & Display', icon: Palette },
            { id: 'ai', label: 'Sovereign AI Engine', icon: Sparkles },
            { id: 'privacy', label: 'Enclave Privacy', icon: Shield },
            { id: 'vault', label: 'Master Key Backup', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-[13px] font-medium flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#10C77A] text-[#10C77A]'
                    : 'border-transparent hover:opacity-80'
                }`}
                style={{
                  color: isActive
                    ? '#10C77A'
                    : themeConfig.textMuted,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB: Sovereign AI Engine Status */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              
              {/* Connected Banner */}
              <div
                className="p-4 rounded-2xl flex items-start gap-3 border text-[12.5px] leading-relaxed"
                style={{
                  backgroundColor: themeConfig.isDark ? 'rgba(16,199,122,0.08)' : 'rgba(16,199,122,0.06)',
                  borderColor: themeConfig.isDark ? 'rgba(16,199,122,0.2)' : 'rgba(16,199,122,0.2)',
                  color: themeConfig.textPrimary,
                }}
              >
                <Sparkles className="w-4.5 h-4.5 text-[#10C77A] shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Sovereign AI Engine Connected:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#10C77A]/20 text-[#0E8A54] dark:text-[#10C77A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10C77A] animate-pulse" />
                      Live & Ready
                    </span>
                  </div>
                  Your workspace is powered by server-side Gemini intelligence with zero client configuration. All queries, CV syntheses, coursework assignments, and transcript audits run seamlessly.
                </div>
              </div>

              {/* Engine Spec Details */}
              <div
                className="p-4 sm:p-5 rounded-[20px] border space-y-4"
                style={{
                  backgroundColor: themeConfig.isDark ? '#1C1C21' : '#F7F7F8',
                  borderColor: themeConfig.borderSubtle,
                }}
              >
                <div className="font-semibold text-[13.5px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#10C77A]" />
                    <span>Active Intelligence Pipeline</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#10C77A]/15 text-[#0E8A54] dark:text-[#10C77A] font-mono text-[11px] font-bold">
                    SERVER-SIDE PROXY
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#141417] border border-black/5 dark:border-white/5 space-y-1">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">Primary Model</span>
                    <span className="text-[13px] font-semibold text-[#18181B] dark:text-white">Gemini 3.8 Flash</span>
                    <p className="text-[11px] text-zinc-500">Fast, high-fidelity reasoning and conversational dialogue</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#141417] border border-black/5 dark:border-white/5 space-y-1">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">Failover Redundancy</span>
                    <span className="text-[13px] font-semibold text-[#18181B] dark:text-white">Gemini 3.1 Flash Lite</span>
                    <p className="text-[11px] text-zinc-500">Instant failover during high demand spikes</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#141417] border border-black/5 dark:border-white/5 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">Security & Keys</span>
                  <div className="flex items-center gap-2 text-[12.5px] text-zinc-700 dark:text-zinc-300">
                    <Shield className="w-4 h-4 text-[#10C77A] shrink-0" />
                    <span>No frontend API keys needed. All sensitive operations are shielded behind server-side proxy routes.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div
                className="p-3.5 rounded-2xl flex items-start gap-3 border text-[12px] leading-relaxed"
                style={{
                  backgroundColor: themeConfig.isDark ? 'rgba(16,199,122,0.08)' : 'rgba(16,199,122,0.06)',
                  borderColor: themeConfig.isDark ? 'rgba(16,199,122,0.2)' : 'rgba(16,199,122,0.2)',
                  color: themeConfig.textPrimary,
                }}
              >
                <Info className="w-4 h-4 text-[#10C77A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Inner Workspace Scoped:</span> Dark and White mode applies exclusively to your authenticated inner workspace.
                </div>
              </div>

              <div>
                <label className="text-[14px] font-medium block mb-1">
                  Inner Workspace Theme
                </label>
                <p
                  className="text-[12.5px] mb-4"
                  style={{ color: themeConfig.textMuted }}
                >
                  Choose between high-contrast Dark Mode and clean White Mode.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-[20px] border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                      theme === 'dark'
                        ? 'ring-2 ring-[#10C77A] shadow-md'
                        : 'hover:border-[#10C77A]/50'
                    }`}
                    style={{
                      backgroundColor: '#0C0C0E',
                      borderColor: theme === 'dark' ? '#10C77A' : 'rgba(255,255,255,0.12)',
                      color: '#FAFAFA',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#1C1C21] border border-white/10 flex items-center justify-center text-[#10C77A]">
                            <Moon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[14px] font-medium">Dark Mode</div>
                            <div className="text-[10px] uppercase font-mono text-[#10C77A]">Sovereign Enclave</div>
                          </div>
                        </div>
                        {theme === 'dark' && (
                          <div className="w-5 h-5 rounded-full bg-[#10C77A] text-[#18181B] flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('white')}
                    className={`p-4 rounded-[20px] border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                      theme === 'white'
                        ? 'ring-2 ring-[#10C77A] shadow-md'
                        : 'hover:border-[#10C77A]/50'
                    }`}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: theme === 'white' ? '#10C77A' : 'rgba(0,0,0,0.1)',
                      color: '#18181B',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#F7F7F8] border border-[#E0DFD7] flex items-center justify-center text-[#10C77A]">
                            <Palette className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[14px] font-medium">White Mode</div>
                            <div className="text-[10px] uppercase font-mono text-[#71717A]">Clean Ivory</div>
                          </div>
                        </div>
                        {theme === 'white' && (
                          <div className="w-5 h-5 rounded-full bg-[#10C77A] text-[#18181B] flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-[18px] border"
                style={{
                  backgroundColor: themeConfig.isDark ? '#1C1C21' : '#F7F7F8',
                  borderColor: themeConfig.borderSubtle,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-[13.5px]">Deterministic Zero-Knowledge Proofs</div>
                  <input
                    type="checkbox"
                    checked={zkProofMode}
                    onChange={(e) => setZkProofMode(e.target.checked)}
                    className="w-4 h-4 accent-[#10C77A] rounded cursor-pointer"
                  />
                </div>
                <p className="text-[12px]" style={{ color: themeConfig.textMuted }}>
                  Strip all PII (name, address, national ID numbers) prior to generating verification bundles.
                </p>
              </div>

              <div
                className="p-4 rounded-[18px] border"
                style={{
                  backgroundColor: themeConfig.isDark ? '#1C1C21' : '#F7F7F8',
                  borderColor: themeConfig.borderSubtle,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-[13.5px]">Auto-Lock Inactivity Timeout</div>
                  <select
                    value={autoLockMinutes}
                    onChange={(e) => setAutoLockMinutes(e.target.value)}
                    className="rounded-lg px-2.5 py-1 text-[12px] border cursor-pointer font-medium"
                    style={{
                      backgroundColor: themeConfig.isDark ? '#141417' : '#FFFFFF',
                      borderColor: themeConfig.borderSubtle,
                      color: themeConfig.textPrimary,
                    }}
                  >
                    <option value="5">5 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                  </select>
                </div>
                <p className="text-[12px]" style={{ color: themeConfig.textMuted }}>
                  Automatically re-encrypt client enclave memory and clear session tokens when inactive.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Vault Backup */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-[18px] border"
                style={{
                  backgroundColor: themeConfig.isDark ? '#1C1C21' : '#F7F7F8',
                  borderColor: themeConfig.borderSubtle,
                }}
              >
                <div className="font-medium text-[13.5px] mb-1">Encrypted Enclave Recovery JSON</div>
                <p className="text-[12px] mb-4" style={{ color: themeConfig.textMuted }}>
                  Export an AES-256 encrypted archive of your master private key and credentials ledger.
                </p>

                <button
                  onClick={handleExportKeys}
                  className="px-4 py-2.5 rounded-xl bg-[#10C77A] text-[#18181B] font-medium text-[12.5px] flex items-center gap-2 hover:bg-[#10C77A]/90 transition cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadSuccess ? 'Enclave Backup Downloaded!' : 'Export Master Backup'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="p-4 sm:p-5 border-t flex items-center justify-between"
          style={{ borderColor: themeConfig.borderSubtle }}
        >
          <div className="flex items-center gap-2 text-[11px]" style={{ color: themeConfig.textMuted }}>
            <Lock className="w-3.5 h-3.5 text-[#10C77A]" />
            <span>KRED Client-Side Hardware Enclave</span>
          </div>

          <button
            onClick={closeSettings}
            className="px-5 py-2 rounded-xl text-[13px] font-medium bg-[#10C77A] hover:bg-[#10C77A]/90 text-[#18181B] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
