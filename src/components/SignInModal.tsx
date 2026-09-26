import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { KredLogo, KredLogoMark } from './KredLogo';
import { BoltHorizon } from './BoltHorizon';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string, isDemo?: boolean) => void;
  onGoToSignUp?: () => void;
  onShowToast?: (msg: string) => void;
  initialMode?: 'signin' | 'signup';
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle email submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      let user: AuthUser;
      if (mode === 'signup') {
        user = await authService.signUp({
          name: email.split('@')[0],
          email: email.trim(),
          password,
          schoolOrOrg: 'African University',
        });
        onShowToast?.(`Vault created successfully! Welcome, ${user.name}.`);
      } else {
        user = await authService.signIn(email.trim(), password);
        onShowToast?.(`Welcome back, ${user.name}!`);
      }
      setIsLoading(false);
      onSuccess(user.email);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please verify or reset your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Switch to Create Account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email. Please sign in instead.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    }
  };

  // Real Google Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const user = await authService.signInWithGoogle();
      setIsGoogleLoading(false);
      onShowToast?.(`Signed in with Google as ${user.name}`);
      onSuccess(user.email);
      onClose();
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups.');
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-toast font-sans">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-[880px] bg-white rounded-[28px] sm:rounded-[32px] p-3 sm:p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-[#E5E2D8] overflow-hidden text-[#18181B]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* =========================================================================
              LEFT PANEL: KRED Hero WebGL Shader Visual Panel
          ========================================================================= */}
          <div className="hidden md:flex md:col-span-5 rounded-[22px] p-7 flex-col justify-between text-white relative overflow-hidden min-h-[440px] bg-[#010308]">
            
            {/* Interactive WebGL BoltHorizon Shader */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
              <BoltHorizon
                className="w-full h-full"
                curveSize={8.0}
                curveHeight={-0.12}
                glowIntensity={1.05}
                colorDeep="#032b69"
                colorMid="#0284c7"
                colorCore="#e0f2fe"
                bgTop="#010308"
                bgBot="#010308"
                ground="#080c10"
              />
            </div>

            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#010308]/90 via-transparent to-black/30 pointer-events-none z-1" />

            {/* Top Logo */}
            <div className="relative z-10 flex items-center gap-2">
              <KredLogo variant="light" size="small" />
            </div>

            {/* Bottom KRED Information */}
            <div className="relative z-10 mt-auto pt-10">
              <p className="text-[11.5px] text-[#10C77A] font-semibold tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Sovereign Vault</span>
              </p>
              <h2 className="text-[19px] font-[600] tracking-[-0.02em] leading-[1.25] text-white">
                Your sovereign hub for academic and professional mobility
              </h2>
              <p className="mt-2 text-[11.5px] text-zinc-300 leading-relaxed">
                Degrees, WAEC, and transcripts cryptographically attested for foreign universities and visas.
              </p>
            </div>
          </div>

          {/* =========================================================================
              RIGHT PANEL: Sign In / Create Account Form
          ========================================================================= */}
          <div className="md:col-span-7 py-3 sm:py-5 px-3 sm:px-6 flex flex-col justify-center text-left">
            
            {/* Official Kred Logo Mark */}
            <div className="mb-3">
              <KredLogoMark size="default" />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-[23px] sm:text-[25px] font-[700] tracking-[-0.03em] text-[#18181B] leading-tight">
              {mode === 'signin' ? 'Welcome back to KRED' : 'Create your KRED Vault'}
            </h1>
            <p className="mt-1 text-[13px] text-[#71717A] leading-relaxed max-w-[380px]">
              {mode === 'signin'
                ? 'Sign in to access your sovereign credential vault and AI mobility dossiers.'
                : 'Keep your academic transcripts and degrees securely on your device.'}
            </p>

            {/* Error banner */}
            {error && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-In */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-10 px-4 rounded-xl bg-white hover:bg-[#F9F8F5] border border-[#E0DFD7] hover:border-[#18181B] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-60 text-[13px] font-medium text-[#18181B]"
                title="Sign in with Google"
              >
                {isGoogleLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-[#18181B]/30 border-t-[#18181B] rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Divider */}
            <div className="relative my-3.5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E2D8]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-[#A1A1AA] font-medium">
                or use your email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div>
                <label className="block text-[12px] font-[600] text-[#18181B] mb-1">
                  Your email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@university.edu or email@gmail.com"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#E0DFD7] text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-[600] text-[#18181B] mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-[#FAF8F3] border border-[#E0DFD7] text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-10.5 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white font-[600] text-[13.5px] transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{mode === 'signin' ? 'Sign In to Vault' : 'Create Vault'}</span>
                  )}
                </button>
              </div>

            </form>

            {/* Mode Switch Footer */}
            <div className="mt-3.5 text-center text-[12.5px] text-[#71717A]">
              {mode === 'signup' ? (
                <span>
                  Already have a vault?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                    className="font-[600] text-[#18181B] hover:text-[#10C77A] hover:underline cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don't have a vault yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                    className="font-[600] text-[#18181B] hover:text-[#10C77A] hover:underline cursor-pointer ml-1"
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default SignInModal;
