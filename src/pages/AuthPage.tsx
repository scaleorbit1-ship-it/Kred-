import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { KredLogo, KredLogoMark } from '../components/KredLogo';
import { BoltHorizon } from '../components/BoltHorizon';

interface AuthPageProps {
  onSuccess: (user: AuthUser) => void;
  onNavigate: (page: string) => void;
  onShowToast: (msg: string) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onNavigate,
  onShowToast,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Email & Password Submit
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
        onShowToast(`Vault created successfully! Welcome, ${user.name}.`);
      } else {
        user = await authService.signIn(email.trim(), password);
        onShowToast(`Welcome back, ${user.name}!`);
      }
      setIsLoading(false);
      onSuccess(user);
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
      onShowToast(`Signed in with Google as ${user.name}`);
      onSuccess(user);
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

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setError('Please provide a valid email address for password reset.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(resetEmail);
      setIsLoading(false);
      setResetSent(true);
      onShowToast('Password reset link sent to your email.');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans selection:bg-[#10C77A]/25 bg-white">
      
      {/* =========================================================================
          LEFT PANEL: Full-Screen WebGL BoltHorizon Hero Background (Edge-to-Edge)
      ========================================================================= */}
      <div className="lg:w-1/2 min-h-[460px] lg:min-h-screen relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#010308] text-white shrink-0">
        
        {/* Interactive WebGL BoltHorizon Shader as Full-Screen Left Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <BoltHorizon
            className="w-full h-full"
            curveSize={9.5}
            curveHeight={-0.10}
            glowIntensity={1.15}
            colorDeep="#032b69"
            colorMid="#0284c7"
            colorCore="#e0f2fe"
            bgTop="#010308"
            bgBot="#010308"
            ground="#080c10"
          />
        </div>

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#010308]/90 via-transparent to-black/30 pointer-events-none z-1" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="cursor-pointer focus:outline-none"
          >
            <KredLogo variant="light" size="default" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="lg:hidden inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/70 hover:text-white bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Bottom Hero Content */}
        <div className="relative z-10 mt-auto pt-16 max-w-[520px]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#10C77A] text-[12px] font-semibold mb-3 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Sovereign Vault</span>
          </div>
          
          <h1 className="text-[28px] sm:text-[34px] lg:text-[38px] font-[600] tracking-[-0.03em] leading-[1.15] text-white">
            Keep your credentials verified and ready for global mobility
          </h1>
          
          <p className="mt-3.5 text-[14px] sm:text-[15px] text-zinc-300 leading-relaxed max-w-[460px]">
            Store university degrees, WAEC certificates, and professional licenses encrypted on your phone. Let AI audit your scholarship eligibility and foreign visa criteria in seconds.
          </p>

          <div className="mt-6 flex items-center gap-4 text-[12px] text-white/60">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#10C77A]" />
              Client-side AES-256
            </span>
            <span>•</span>
            <span>WES & UK ENIC Ready</span>
            <span>•</span>
            <span>No Third-Party Brokers</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Full-Height Clean Authentication Form (No External Borders)
      ========================================================================= */}
      <div className="lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white overflow-y-auto">
        
        {/* Top Header Controls */}
        <div className="w-full flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="hidden lg:inline-flex items-center gap-2 text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="text-[12.5px] text-[#71717A] ml-auto">
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
                  Sign In
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

        {/* Center Main Form */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-6">
          
          {/* Logo Mark */}
          <div className="mb-4">
            <KredLogoMark size="default" />
          </div>

          {/* Form Titles */}
          <h2 className="text-[26px] sm:text-[30px] font-[700] tracking-[-0.03em] text-[#18181B] leading-tight">
            {mode === 'signup' ? 'Create your KRED Vault' : 'Welcome back to KRED'}
          </h2>
          <p className="mt-1.5 text-[13.5px] text-[#71717A] leading-relaxed">
            {mode === 'signup'
              ? 'Access your encrypted credential vault, convert GPAs, and prepare visa application packs.'
              : 'Sign in to unlock your sovereign academic dossiers and global mobility audits.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-11 px-4 rounded-xl bg-white hover:bg-[#F9F8F5] border border-[#E0DFD7] hover:border-[#18181B] flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-60 text-[13.5px] font-medium text-[#18181B]"
              title="Sign in with Google"
            >
              {isGoogleLoading ? (
                <span className="w-4 h-4 border-2 border-[#18181B]/30 border-t-[#18181B] rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
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

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE7DC]" />
            </div>
            <span className="relative bg-white px-3 text-[11.5px] text-[#A1A1AA] font-medium">
              or use your email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-[12.5px] font-[600] text-[#18181B] mb-1.5">
                Your email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@university.edu or email@gmail.com"
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E0DFD7] text-[13.5px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] focus:ring-2 focus:ring-[#10C77A]/15 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12.5px] font-[600] text-[#18181B]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11.5px] font-medium text-[#71717A] hover:text-[#18181B] hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-white border border-[#E0DFD7] text-[13.5px] text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] focus:ring-2 focus:ring-[#10C77A]/15 transition-all"
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

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 rounded-xl bg-[#18181B] hover:bg-[#10C77A] hover:text-[#18181B] text-white font-[600] text-[14px] transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{mode === 'signup' ? 'Create Sovereign Vault' : 'Sign In to Vault'}</span>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Footer Note */}
        <div className="w-full text-center text-[11.5px] text-[#A1A1AA] pt-4 border-t border-[#F0EFEB]">
          Protected by client-side zero-knowledge encryption. Your transcripts remain on your device.
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-toast">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 text-left shadow-2xl border border-[#E2E1DA]">
            <h3 className="text-[17px] font-bold text-[#18181B] mb-1">
              Reset Password
            </h3>
            <p className="text-[13px] text-[#71717A] mb-4">
              Enter your email address and we will send you a link to reset your password.
            </p>

            {resetSent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Reset email sent</span>
                </div>
                <p className="text-[12px] text-emerald-700">
                  Please check your inbox at <span className="font-semibold">{resetEmail}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="w-full py-2 bg-[#18181B] text-white rounded-lg text-[12px] font-medium cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-10 px-3 rounded-xl bg-[#FAF8F3] border border-[#E0DFD7] text-[13px] text-[#18181B] focus:outline-none focus:border-[#18181B]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-[#71717A] hover:bg-[#F1F5F9] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg bg-[#18181B] text-white text-[12px] font-medium hover:bg-[#10C77A] hover:text-[#18181B] cursor-pointer"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthPage;
