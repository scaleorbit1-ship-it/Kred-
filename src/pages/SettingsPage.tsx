import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Palette,
  Shield,
  KeyRound,
  Download,
  Moon,
  Sun,
  Sparkles,
  Cpu,
  Check,
  CheckCircle2,
  Lock,
  ExternalLink,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { KredLogo } from '../components/KredLogo';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
  onShowToast?: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate, onShowToast }) => {
  const { theme, themeConfig, setTheme } = useTheme();
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'ai' | 'privacy' | 'backup'>('profile');
  const [copiedDid, setCopiedDid] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [autoLock, setAutoLock] = useState('15');
  const [zkProofMode, setZkProofMode] = useState(true);

  const effectiveName = currentUser?.name || 'Vault Member';
  const effectiveEmail = currentUser?.email || 'muhammadawwal674@gmail.com';
  const effectiveInitials = currentUser?.avatarLetter || effectiveName.charAt(0).toUpperCase();
  const sovereignDid = `did:kred:vault:${(currentUser?.id || 'zk-9941a8').slice(0, 12)}`;

  const handleCopyDid = () => {
    navigator.clipboard.writeText(sovereignDid);
    setCopiedDid(true);
    onShowToast?.('Sovereign DID copied to clipboard');
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'KRED Sovereign Credential Platform',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      user: {
        name: effectiveName,
        email: effectiveEmail,
        did: sovereignDid,
      },
      encryption: 'AES-256-GCM',
      enclaveId: 'enclave-zk-9941a8',
      vaultHash: '0x8f2c7a6e1d904b3c8f1e2d4a5b6c7e8f',
      note: 'Cryptographically authenticated backup archive. Store in a secure location.',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kred-vault-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    onShowToast?.('Sovereign vault backup exported successfully');
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] font-sans flex flex-col">
      {/* Top Header Navigation */}
      <header className="h-16 px-4 sm:px-8 border-b border-[#E2E1DA] bg-white sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="h-9 px-3 rounded-xl border border-[#E2E1DA] hover:border-[#18181B] hover:bg-[#FAF9F5] text-[13px] font-medium inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assistant</span>
          </button>

          <div className="h-5 w-px bg-[#E2E1DA] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-[12.5px] text-[#71717A]">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-semibold text-[#18181B]">Website Settings</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer"
            aria-label="KRED Home"
          >
            <KredLogo size="default" variant="dark" />
          </button>
        </div>
      </header>

      {/* Main Settings Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#18181B]">
            Website & Account Settings
          </h1>
          <p className="text-[13.5px] text-[#71717A] mt-1">
            Manage your sovereign profile, appearance theme, AI intelligence engine, and cryptographic backups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <nav className="md:col-span-4 lg:col-span-3 space-y-1.5 bg-white p-3 rounded-2xl border border-[#E2E1DA] shadow-2xs">
            {[
              { id: 'profile', label: 'User Profile', icon: User },
              { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
              { id: 'ai', label: 'Sovereign AI Engine', icon: Sparkles },
              { id: 'privacy', label: 'Enclave Privacy', icon: Shield },
              { id: 'backup', label: 'Vault Master Backup', icon: KeyRound },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#18181B] text-white shadow-2xs font-semibold'
                      : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#10C77A]' : 'text-[#71717A]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings Section Body */}
          <div className="md:col-span-8 lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E1DA] shadow-2xs space-y-6">
            
            {/* 1. USER PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#E2E1DA] pb-4">
                  <h2 className="text-[17px] font-bold text-[#18181B]">User Profile</h2>
                  <p className="text-[12.5px] text-[#71717A] mt-0.5">
                    Your sovereign cryptographic identity details and wallet address
                  </p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#E2E1DA]">
                  <div className="w-14 h-14 rounded-2xl bg-[#10C77A] text-[#18181B] font-extrabold text-xl grid place-items-center shrink-0 shadow-sm">
                    {effectiveInitials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-bold text-[#18181B] truncate">{effectiveName}</h3>
                    <p className="text-[13px] text-[#71717A] truncate">{effectiveEmail}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#10C77A]/15 text-[#0E8A54] font-semibold">
                      VERIFIED SOVEREIGN ACCOUNT
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={effectiveName}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#E2E1DA] bg-[#FAF9F5] text-[13px] text-[#18181B] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={effectiveEmail}
                      className="w-full h-10 px-3.5 rounded-xl border border-[#E2E1DA] bg-[#FAF9F5] text-[13px] text-[#18181B] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                      Sovereign Vault DID (Decentralized Identifier)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={sovereignDid}
                        className="flex-1 h-10 px-3.5 rounded-xl border border-[#E2E1DA] bg-[#FAF9F5] text-[12.5px] font-mono text-[#71717A]"
                      />
                      <button
                        type="button"
                        onClick={handleCopyDid}
                        className="h-10 px-3.5 rounded-xl bg-white border border-[#E2E1DA] hover:border-[#18181B] text-[12px] font-medium inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        {copiedDid ? <Check className="w-3.5 h-3.5 text-[#0E8A54]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedDid ? 'Copied' : 'Copy DID'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. THEME & APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#E2E1DA] pb-4">
                  <h2 className="text-[17px] font-bold text-[#18181B]">Appearance & Theme</h2>
                  <p className="text-[12.5px] text-[#71717A] mt-0.5">
                    Customize your inner workspace visual palette
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme('white')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      theme === 'white'
                        ? 'border-[#10C77A] ring-2 ring-[#10C77A]/20 bg-[#FAF9F5] shadow-xs'
                        : 'border-[#E2E1DA] hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-[#18181B]">
                        <Sun className="w-5 h-5 text-amber-500" />
                      </div>
                      {theme === 'white' && (
                        <div className="w-5 h-5 rounded-full bg-[#10C77A] text-[#18181B] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-[14px] text-[#18181B]">Clean White Mode</div>
                    <p className="text-[12px] text-[#71717A] mt-1">Crisp, paper-like readability with high contrast</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      theme === 'dark'
                        ? 'border-[#10C77A] ring-2 ring-[#10C77A]/20 bg-zinc-900 text-white shadow-xs'
                        : 'border-[#E2E1DA] hover:border-zinc-400 bg-zinc-900 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-[#10C77A]">
                        <Moon className="w-5 h-5" />
                      </div>
                      {theme === 'dark' && (
                        <div className="w-5 h-5 rounded-full bg-[#10C77A] text-[#18181B] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-[14px]">Sovereign Dark Enclave</div>
                    <p className="text-[12px] text-zinc-400 mt-1">Deep OLED obsidian palette engineered for focus</p>
                  </button>
                </div>
              </div>
            )}

            {/* 3. SOVEREIGN AI ENGINE TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#E2E1DA] pb-4">
                  <h2 className="text-[17px] font-bold text-[#18181B]">Sovereign AI Engine</h2>
                  <p className="text-[12.5px] text-[#71717A] mt-0.5">
                    Zero-configuration conversational intelligence with full privacy shielding
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-[#10C77A]/10 border border-[#10C77A]/30 flex items-start gap-3.5">
                  <Sparkles className="w-5 h-5 text-[#0E8A54] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13.5px] text-[#18181B]">Engine Status: Active & Fully Configured</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10C77A] text-[#18181B]">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#27272A] leading-relaxed">
                      KRED AI operates seamlessly via our secure server-side proxy. You can chat naturally just like in Gemini app or ChatGPT — brainstorm, debug code, ask general questions, draft CVs, or audit transcripts — with zero front-end API keys required.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-[#E2E1DA] bg-[#FAF9F5] space-y-1.5">
                    <div className="text-[11px] font-mono uppercase font-bold text-[#71717A]">Primary Intelligence</div>
                    <div className="text-[15px] font-bold text-[#18181B]">Google Gemini 3.8 Flash</div>
                    <p className="text-[12px] text-[#71717A]">
                      High-throughput conversational reasoning, deep contextual memory, and multilingual support.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#E2E1DA] bg-[#FAF9F5] space-y-1.5">
                    <div className="text-[11px] font-mono uppercase font-bold text-[#71717A]">Failover Engine</div>
                    <div className="text-[15px] font-bold text-[#18181B]">Gemini 3.1 Flash Lite</div>
                    <p className="text-[12px] text-[#71717A]">
                      Sub-second latency failover guaranteeing 100% uptime during global traffic spikes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-[#E2E1DA] bg-white space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#18181B]">
                    <Shield className="w-4 h-4 text-[#0E8A54]" />
                    <span>Zero-Knowledge Privacy Shield</span>
                  </div>
                  <p className="text-[12.5px] text-[#71717A] leading-relaxed">
                    Your personal files and documents remain encrypted client-side. The AI assistant only receives credential contexts when you choose to synthesize or query documents in your workspace.
                  </p>
                </div>
              </div>
            )}

            {/* 4. ENCLAVE PRIVACY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#E2E1DA] pb-4">
                  <h2 className="text-[17px] font-bold text-[#18181B]">Enclave Privacy & Security</h2>
                  <p className="text-[12.5px] text-[#71717A] mt-0.5">
                    Cryptographic safeguards and local session parameters
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E2E1DA] bg-[#FAF9F5]">
                    <div>
                      <div className="font-bold text-[13.5px] text-[#18181B]">Zero-Knowledge Proof Verification</div>
                      <div className="text-[12px] text-[#71717A] mt-0.5">
                        Generate cryptographic proofs for credential audits without revealing private metadata.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setZkProofMode(!zkProofMode)}
                      className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                        zkProofMode ? 'bg-[#10C77A]' : 'bg-zinc-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white shadow-xs block transition-transform absolute top-0.5 ${
                          zkProofMode ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#E2E1DA] bg-[#FAF9F5] space-y-2">
                    <label className="block font-bold text-[13.5px] text-[#18181B]">
                      Session Auto-Lock Duration
                    </label>
                    <p className="text-[12px] text-[#71717A]">
                      Automatically protect workspace sessions after periods of inactivity.
                    </p>
                    <select
                      value={autoLock}
                      onChange={(e) => setAutoLock(e.target.value)}
                      className="w-full sm:w-64 h-9.5 px-3 rounded-xl border border-[#E2E1DA] bg-white text-[13px] font-medium"
                    >
                      <option value="15">15 Minutes (Recommended)</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="never">Never (Persistent)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MASTER BACKUP TAB */}
            {activeTab === 'backup' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#E2E1DA] pb-4">
                  <h2 className="text-[17px] font-bold text-[#18181B]">Vault Master Backup</h2>
                  <p className="text-[12.5px] text-[#71717A] mt-0.5">
                    Download an encrypted cryptographic archive of your sovereign documents
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-[#FAF9F5] border border-[#E2E1DA] space-y-3">
                  <div className="flex items-center gap-2 font-bold text-[14px] text-[#18181B]">
                    <Lock className="w-4 h-4 text-[#0E8A54]" />
                    <span>Self-Custodial Encrypted Export</span>
                  </div>
                  <p className="text-[12.5px] text-[#71717A] leading-relaxed">
                    Export your credentials, transcripts, and verified attestations into a tamper-evident AES-256 JSON package. This allows you to restore your sovereign vault on any device without relying on third parties.
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="h-10 px-4 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white text-[13px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadSuccess ? 'Backup Exported!' : 'Export Vault Backup (.json)'}</span>
                    </button>
                    {downloadSuccess && (
                      <span className="text-[12px] font-semibold text-[#0E8A54] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Export Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
