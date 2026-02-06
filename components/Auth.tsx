
import React, { useState } from 'react';
import { UserProfile, SkillLevel } from '../types';
import { authService } from '../services/authService';
import { 
  Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, 
  CheckCircle, Briefcase, GraduationCap, 
  Wrench, Sparkles, ArrowLeft
} from 'lucide-react';
import { useToast } from './Toast';
import { User } from 'firebase/auth';

interface AuthProps {
  onComplete: (user: UserProfile) => void;
  onBack: () => void;
}

type AuthView = 'login' | 'register' | 'forgot-pass' | 'onboarding';

export const Auth: React.FC<AuthProps> = ({ onComplete, onBack }) => {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  // Temporary User storage for Onboarding
  const [tempUser, setTempUser] = useState<User | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Onboarding States
  const [selectedRole, setSelectedRole] = useState<SkillLevel>(SkillLevel.BEGINNER);
  const [selectedColor, setSelectedColor] = useState('bg-blue-600');

  // --- Handlers ---

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.signInWithGoogle();
      await handlePostAuth(user);
    } catch (err: any) {
      handleAuthErrors(err);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (view === 'register') {
        if (!name.trim()) throw new Error("Name is required");
        const user = await authService.signUp(email, password, name);
        setView('login'); // Ask them to verify email first
        showToast("Verification email sent! Please verify to log in.", "success");
        setLoading(false);
      } else {
        const user = await authService.signIn(email, password);
        if (!user.emailVerified) {
          await authService.logout();
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        await handlePostAuth(user);
      }
    } catch (err: any) {
      console.error(err);
      handleAuthErrors(err);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await authService.resetPassword(email);
        showToast("Password reset link sent!", "success");
        setView('login');
    } catch (err) {
        setError("Failed to reset. check email.");
    } finally {
        setLoading(false);
    }
  };

  // --- Core Logic: Check Profile & Trigger Onboarding ---
  const handlePostAuth = async (user: User) => {
    try {
      // Check if profile exists in Firestore
      const profile = await authService.getUserProfile(user.uid);
      
      if (profile && profile.skillLevel) {
        // User exists and has completed onboarding
        showToast("Welcome back!", "success");
        onComplete(profile);
      } else {
        // New user OR incomplete profile -> Go to Onboarding
        setTempUser(user);
        setView('onboarding');
        setLoading(false); // Stop loading to show UI
      }
    } catch (err) {
      console.error("Profile check failed", err);
      // Fallback
      setTempUser(user);
      setView('onboarding');
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!tempUser) return;
    setLoading(true);
    try {
        const updatedProfile = await authService.saveUserProfile(tempUser, {
            skillLevel: selectedRole,
            color: selectedColor,
            name: tempUser.displayName || name || 'Builder' 
        });
        onComplete(updatedProfile);
    } catch (err) {
        setError("Failed to save profile.");
        setLoading(false);
    }
  };

  const handleAuthErrors = (err: any) => {
    if (err.message === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email address to log in.");
    } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid credentials.");
    } else if (err.code === 'auth/email-already-in-use') {
        setError("Email already registered.");
    } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain ${window.location.hostname} is not authorized in Firebase Console.`);
    } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
    } else {
        setError("Authentication failed.");
    }
  };

  // --- Shared Nav Component ---
  const AuthHeader = () => (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#1F1F1F] rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sparkles size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-xl font-display font-medium text-[#1F1F1F] tracking-tight leading-none">NAVA</span>
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[#5E5E5E] leading-none mt-1">
                    AI Assistant
                </span>
            </div>
        </button>

        <button 
            onClick={() => {
                if (view === 'onboarding') authService.logout();
                onBack();
            }}
            className="pointer-events-auto w-12 h-12 rounded-full bg-white/50 backdrop-blur-xl border border-white/50 flex items-center justify-center text-[#5E5E5E] hover:bg-white hover:text-[#1F1F1F] hover:shadow-md transition-all group"
            aria-label="Back"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
    </nav>
  );

  // --- UI Components ---

  // 1. Onboarding Screen
  if (view === 'onboarding') {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0F4F9]">
           <AuthHeader />

           <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in flex flex-col md:flex-row relative z-10 mt-16">
              
              {/* Left: Decor */}
              <div className="md:w-1/3 bg-[#1F1F1F] text-white p-8 flex flex-col justify-between relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#1A73E8]/30 to-transparent"></div>
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                        <UserIcon size={24} />
                    </div>
                    <h2 className="text-2xl font-display font-medium mb-2">Almost there</h2>
                    <p className="text-white/60 text-sm">Tell us a bit about yourself to personalize your experience.</p>
                 </div>
              </div>

              {/* Right: Form */}
              <div className="md:w-2/3 p-8 md:p-12">
                 
                 <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-4">I am a...</label>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { id: SkillLevel.STUDENT, label: 'Student', icon: <GraduationCap size={20}/>, desc: 'Learning & Exploring' },
                            { id: SkillLevel.MAKER, label: 'Maker / Hobbyist', icon: <Wrench size={20}/>, desc: 'Building for fun' },
                            { id: 'Professional', label: 'Professional', icon: <Briefcase size={20}/>, desc: 'Work & Engineering' }
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id as SkillLevel)}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${
                                    selectedRole === role.id 
                                    ? 'border-[#1A73E8] bg-[#E8F0FE] ring-1 ring-[#1A73E8]' 
                                    : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedRole === role.id ? 'bg-[#1A73E8] text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                                    {role.icon}
                                </div>
                                <div>
                                    <div className={`font-bold ${selectedRole === role.id ? 'text-[#1A73E8]' : 'text-[#1F1F1F]'}`}>{role.label}</div>
                                    <div className="text-xs text-gray-500">{role.desc}</div>
                                </div>
                                <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === role.id ? 'border-[#1A73E8] bg-[#1A73E8]' : 'border-gray-300'}`}>
                                    {selectedRole === role.id && <CheckCircle size={12} className="text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="mb-10">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-4">Profile Color</label>
                    <div className="flex gap-3">
                        {['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-600', 'bg-slate-800'].map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-10 h-10 rounded-full ${color} transition-transform hover:scale-110 flex items-center justify-center ring-offset-2 ${selectedColor === color ? 'ring-2 ring-black scale-110' : ''}`}
                            >
                                {selectedColor === color && <CheckCircle size={16} className="text-white" />}
                            </button>
                        ))}
                    </div>
                 </div>

                 <button 
                    onClick={completeOnboarding}
                    disabled={loading}
                    className="w-full h-14 bg-[#1A73E8] text-white rounded-xl font-bold text-lg hover:bg-[#1557B0] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : <>Finish Setup <ArrowRight size={20}/></>}
                 </button>
              </div>
           </div>
        </div>
    );
  }

  // 2. Main Auth Screen (Login/Register/Forgot)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0F4F9] relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#E8F0FE] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#FCE8E6] rounded-full blur-[100px] pointer-events-none"></div>
      
      <AuthHeader />

      <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-premium border border-white/50 overflow-hidden relative z-10 animate-scale-in mt-16">
        
        {/* Navigation / Header inside Card */}
        <div className="p-8 pb-4 text-center">
            <h1 className="text-3xl font-display font-medium text-[#1F1F1F] mb-2 tracking-tight">
                {view === 'forgot-pass' ? 'Reset Password' : (view === 'register' ? 'Join NAVA' : 'Welcome Back')}
            </h1>
            <p className="text-[#5E5E5E] text-sm">
                {view === 'forgot-pass' ? 'Enter your email to receive instructions' : (view === 'register' ? 'Build smarter with AI assistance' : 'Sign in to continue building')}
            </p>
        </div>

        <div className="px-8 pb-8">
            
            {/* Google Button - Always visible unless forgot password */}
            {view !== 'forgot-pass' && (
                <>
                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full h-12 bg-white border border-[#E3E3E3] rounded-xl flex items-center justify-center gap-3 font-medium text-[#1F1F1F] hover:bg-[#F8F9FA] transition-colors mb-6 group relative overflow-hidden"
                    >
                         <div className="w-5 h-5 relative z-10">
                             {/* Simple Google G Icon Representation */}
                             <svg viewBox="0 0 24 24" className="w-full h-full"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                         </div>
                         <span className="relative z-10">Continue with Google</span>
                    </button>
                    <div className="relative mb-6 text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3E3E3]"></div></div>
                        <span className="relative bg-[#FCFDFF] px-3 text-xs text-[#5E5E5E] font-medium uppercase tracking-wider">Or</span>
                    </div>
                </>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-pulse">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* FORMS */}
            <form onSubmit={view === 'forgot-pass' ? handleForgotPassword : handleEmailAuth} className="flex flex-col gap-4">
                {view === 'register' && (
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Full Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent focus:bg-white focus:border-[#1A73E8] rounded-xl outline-none transition-all placeholder:text-gray-400"
                            required
                        />
                    </div>
                )}
                
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent focus:bg-white focus:border-[#1A73E8] rounded-xl outline-none transition-all placeholder:text-gray-400"
                        required
                    />
                </div>

                {view !== 'forgot-pass' && (
                        <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent focus:bg-white focus:border-[#1A73E8] rounded-xl outline-none transition-all placeholder:text-gray-400"
                            required
                            minLength={6}
                        />
                        {view === 'login' && (
                            <button type="button" onClick={() => setView('forgot-pass')} className="absolute right-4 top-4 text-xs font-bold text-[#1A73E8] hover:underline">
                                Forgot?
                            </button>
                        )}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-2 w-full h-12 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        view === 'forgot-pass' ? 'Send Reset Link' : (view === 'register' ? 'Create Account' : 'Sign In')
                    )}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center">
                {view === 'forgot-pass' ? (
                     <button onClick={() => setView('login')} className="text-sm font-bold text-[#1A73E8] hover:underline">Back to Login</button>
                ) : (
                    <p className="text-sm text-[#5E5E5E]">
                        {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }}
                            className="ml-2 font-bold text-[#1A73E8] hover:underline"
                        >
                            {view === 'login' ? 'Create one' : 'Log in'}
                        </button>
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
