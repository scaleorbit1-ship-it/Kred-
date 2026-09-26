import React, { useState } from 'react';
import { KredLogoMark } from './KredLogo';
import { X, Lock, CheckCircle2, ArrowRight, Copy, Check, UploadCloud } from 'lucide-react';

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'professional' | 'institution'>('student');
  const [submitted, setSubmitted] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');

    const generatedKey = `KRED-VAULT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setAccessKey(generatedKey);
    setSubmitted(true);
    onShowToast?.('Vault priority seat reserved!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accessKey);
    setCopiedKey(true);
    onShowToast?.('Copied vault reservation token');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121214]/80 backdrop-blur-md animate-toast">
      <div className="bg-white border border-[#EDEEF0] rounded-[24px] max-w-lg w-full shadow-2xl overflow-hidden text-[#18181B]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EDEEF0] flex items-center justify-between bg-[#F8F7F2]">
          <div className="flex items-center gap-3">
            <KredLogoMark size="small" variant="dark" />
            <div>
              <h3 className="text-[16px] font-[800] tracking-[-0.02em] text-[#18181B]">
                Get Started with KRED
              </h3>
              <p className="text-[11px] font-medium text-[#18181B]/50">
                Free Instant Credential Wallet Provisioning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#EDEEF0] hover:bg-[#F5F6F7] text-[#18181B] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[13px] text-[#18181B]/70 leading-relaxed">
                Upload your diplomas, licenses, IDs, and CVs. KRED indexes your records on-device and builds ready-to-share application packages in seconds.
              </p>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-[12px] text-[12px] text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-[700] tracking-[-0.01em] text-[#18181B]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-10 px-3.5 bg-[#F8F7F2] border border-[#EDEEF0] rounded-[12px] text-[13px] text-[#18181B] placeholder:text-black/35 focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-[700] tracking-[-0.01em] text-[#18181B]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full h-10 px-3.5 bg-[#F8F7F2] border border-[#EDEEF0] rounded-[12px] text-[13px] text-[#18181B] placeholder:text-black/35 focus:outline-none focus:border-[#18181B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-[700] tracking-[-0.01em] text-[#18181B]">
                  Primary Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student', label: 'Scholar 🎓' },
                    { id: 'professional', label: 'Professional 💼' },
                    { id: 'institution', label: 'Registrar 🏛️' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as any)}
                      className={`h-9 rounded-[10px] text-[12px] font-[600] border transition-all cursor-pointer ${
                        role === item.id
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-[#F8F7F2] text-[#18181B] border-[#EDEEF0] hover:bg-[#F5F6F7]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#18181B] hover:bg-[#27272A] text-white rounded-xl text-[13px] font-[700] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-[#10C77A]" />
                  <span>Provision Sovereign Vault & Get Access</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-[#18181B]/50">
                🔒 Zero spam. Instant access token generated client-side.
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2 animate-toast">
              <div className="w-12 h-12 rounded-full bg-[#10C77A] text-[#18181B] flex items-center justify-center font-[800] text-[20px] mx-auto shadow-sm">
                ✓
              </div>

              <div>
                <h4 className="text-[20px] font-[800] tracking-[-0.02em] text-[#18181B]">
                  Enclave Initialized!
                </h4>
                <p className="text-[13px] text-[#18181B]/70 mt-1">
                  Welcome to KRED, <strong className="text-[#18181B]">{fullName}</strong>. Your sovereign credential enclave has been initialized.
                </p>
              </div>

              <div className="p-4 bg-[#F8F7F2] border border-[#EDEEF0] rounded-[16px] text-left space-y-2">
                <div className="text-[10px] font-mono font-[700] uppercase text-[#18181B]/50">
                  Your Vault Passkey
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[16px] font-[800] text-[#18181B] tracking-wider">
                    {accessKey}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 bg-white border border-[#EDEEF0] hover:bg-[#F5F6F7] text-[#18181B] rounded-md cursor-pointer shadow-sm"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#10C77A]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-[#18181B]/60">
                  Ready to receive credentials at: <strong className="text-[#18181B]">{email}</strong>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full h-10 bg-[#18181B] text-white rounded-xl text-[13px] font-[600] transition-colors cursor-pointer"
              >
                Close & Enter Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessModal;
