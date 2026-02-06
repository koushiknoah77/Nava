
import React, { useState } from 'react';
import { UserProfile, SkillLevel } from '../types';
import { authService } from '../services/authService';
import { 
  Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, 
  CheckCircle, Briefcase, GraduationCap, 
  Wrench, Sparkles, ArrowLeft, Check, UserCircle
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
  
  // Forgot Password specific state
  const [resetSent, setResetSent] = useState(false);
  
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

  const handleGuestLogin = () => {
    const guestUser: UserProfile = {
      id: `guest-${Date.now()}`,
      name: 'Guest Builder',
      email: null,
      country: 'Global',
      skillLevel: SkillLevel.BEGINNER,
      joinedDate: new Date().toISOString(),
      color: 'bg-slate-500'
    };
    onComplete(guestUser);
    showToast("Welcome Guest!", "success");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
        setError("Please enter your email address.");
        return;
    }
    setLoading(true);
    setError('');
    try {
        await authService.resetPassword(email);
        setResetSent(true);
    } catch (err: any) {
        console.error("Reset Error", err);
        if (err.code === 'auth/user-not-found') {
             setResetSent(true); 
        } else if (err.code === 'auth/invalid-email') {
             setError("Please enter a valid email address.");
        } else {
             setError("Could not send reset link. Please try again.");
        }
    } finally {
        setLoading(false);
    }
  };

  // --- Core Logic: Check Profile & Trigger Onboarding ---
  const handlePostAuth = async (user: User) => {
    try {
      const profile = await authService.getUserProfile(user.uid);
      
      if (profile && profile.skillLevel) {
        showToast("Welcome back!", "success");
        onComplete(profile);
      } else {
        setTempUser(user);
        setView('onboarding');
        setLoading(false);
      }
    } catch (err) {
      console.error("Profile check failed", err);
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
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid credentials.");
    } else if (err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password. Please check your credentials or create an account.");
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

  const resetView = (newView: AuthView) => {
      setView(newView);
      setError('');
      setResetSent(false);
  };

  // --- Shared Nav Component ---
  const AuthHeader = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-full px-6 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <button onClick={onBack} className="flex items-center gap-3 group opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-9 h-9 bg-[#1F1F1F] rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles size={16} fill="currentColor" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-base font-display font-medium text-[#1F1F1F] leading-none tracking-tight">NAVA</span>
                    <span className="text-[10px] font-mono font-bold text-[#5E5E5E] leading-none mt-1 uppercase tracking-widest">
                        AI Assistant
                    </span>
                </div>
            </button>

            <button 
                onClick={() => {
                    if (view === 'onboarding') authService.logout();
                    onBack();
                }}
                className="w-9 h-9 rounded-full bg-gray-50 border border-black/5 flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100 hover:text-[#1F1F1F] transition-all group"
                aria-label="Back"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
        </div>
    </nav>
  );

  // --- UI Components ---

  // 1. Onboarding Screen
  if (view === 'onboarding') {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F9FA] relative font-sans">
           {/* Backgrounds */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[80vw] h-[80vw] bg-[#E8F0FE] rounded-full blur-[150px] mix-blend-multiply opacity-70"></div>
                <div className="absolute bottom-[-20%] right-[20%] w-[60vw] h-[60vw] bg-[#FCE8E6] rounded-full blur-[150px] mix-blend-multiply opacity-70"></div>
           </div>

           <AuthHeader />

           {/* Central Card - Now Wider and Rectangular */}
           <div className="w-full max-w-5xl relative z-10 animate-fade-up pt-24 pb-6">
              
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-premium border border-white/60 p-8 md:p-12 relative overflow-hidden">
                 
                 <div className="grid lg:grid-cols-12 gap-12 md:gap-16 items-start">
                     
                     {/* Left Column: Vision & Identity */}
                     <div className="lg:col-span-5 flex flex-col justify-center h-full pt-4">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-[10px] font-bold uppercase tracking-widest text-yellow-700 shadow-sm w-fit mb-6">
                            <Sparkles size={12} fill="currentColor" /> Profile Setup
                         </div>
                         
                         <h2 className="text-5xl md:text-6xl font-display font-medium text-[#1F1F1F] mb-6 tracking-tight leading-[0.95]">
                            Make it <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">yours.</span>
                         </h2>
                         
                         <p className="text-[#5E5E5E] text-lg font-light leading-relaxed mb-10">
                            Tell us about you. We'll tailor the AI analysis and guides to match your skill level perfectly.
                         </p>

                         {/* Color Selection Moved Here */}
                         <div className="space-y-4">
                            <div className="text-[10px] font-bold text-[#9AA0A6] uppercase tracking-[0.2em]">Choose your aura</div>
                            <div className="flex flex-wrap gap-3">
                                {['bg-blue-600', 'bg-emerald-500', 'bg-violet-600', 'bg-amber-500', 'bg-rose-500', 'bg-slate-700'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full ${color} transition-all duration-300 flex items-center justify-center relative ${
                                            selectedColor === color 
                                            ? 'scale-110 ring-4 ring-white ring-offset-2 ring-offset-gray-100 shadow-md' 
                                            : 'hover:scale-110 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        {selectedColor === color && <Check size={16} className="text-white" strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                         </div>
                     </div>

                     {/* Right Column: Form Inputs */}
                     <div className="lg:col-span-7 bg-[#F8F9FA]/50 rounded-[1.5rem] p-6 lg:p-8 border border-white/50">
                         {/* Archetype Selection */}
                         <div className="mb-8">
                             <div className="flex items-center justify-between mb-4">
                                <div className="text-[10px] font-bold text-[#9AA0A6] uppercase tracking-[0.2em]">Select Archetype</div>
                                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Required</div>
                             </div>
                             
                             <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: SkillLevel.STUDENT, label: 'Student', icon: <GraduationCap size={20}/>, desc: 'Learning & Exploring' },
                                    { id: SkillLevel.MAKER, label: 'Maker', icon: <Wrench size={20}/>, desc: 'Building for fun' },
                                    { id: 'Professional', label: 'Pro', icon: <Briefcase size={20}/>, desc: 'Work & Engineering' }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id as SkillLevel)}
                                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 w-full text-left group ${
                                            selectedRole === role.id 
                                            ? 'border-blue-500/30 bg-white shadow-md ring-1 ring-blue-500/20' 
                                            : 'border-transparent bg-white hover:border-[#E3E3E3] hover:shadow-sm'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                            selectedRole === role.id ? 'bg-blue-50 text-blue-600' : 'bg-[#F1F3F4] text-[#5E5E5E] group-hover:bg-[#E8F0FE] group-hover:text-[#1A73E8]'
                                        }`}>
                                            {role.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold text-sm ${selectedRole === role.id ? 'text-[#1F1F1F]' : 'text-[#5E5E5E]'}`}>{role.label}</div>
                                            <div className="text-xs text-[#5E5E5E]/70">{role.desc}</div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                            selectedRole === role.id ? 'bg-blue-600 text-white shadow-sm' : 'border-2 border-[#E3E3E3]'
                                        }`}>
                                            {selectedRole === role.id && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    </button>
                                ))}
                             </div>
                         </div>

                         {/* Action Button */}
                         <button 
                            onClick={completeOnboarding}
                            disabled={loading}
                            className="w-full h-14 bg-[#1F1F1F] text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 group"
                         >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Complete Setup 
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                                </>
                            )}
                         </button>
                     </div>

                 </div>
              </div>
           </div>
        </div>
    );
  }

  // 2. Main Auth Screen (Login/Register/Forgot)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F9FA] relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#E8F0FE] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#FCE8E6] rounded-full blur-[100px] pointer-events-none"></div>
      
      <AuthHeader />

      <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-premium border border-white/50 overflow-hidden relative z-10 animate-scale-in mt-12">
        
        {/* Navigation / Header inside Card */}
        <div className="p-8 pb-4 text-center">
            <h1 className="text-3xl font-display font-medium text-[#1F1F1F] mb-2 tracking-tight">
                {view === 'forgot-pass' ? 'Reset Password' : (view === 'register' ? 'Join NAVA' : 'Welcome Back')}
            </h1>
            <p className="text-[#5E5E5E] text-sm">
                {view === 'forgot-pass' ? (
                     resetSent ? 'Email sent! Check your inbox.' : 'Enter your email to receive instructions'
                ) : (
                    view === 'register' ? 'Build smarter with AI assistance' : 'Sign in to continue building'
                )}
            </p>
        </div>

        <div className="px-8 pb-8">
            
            {/* SUCCESS STATE FOR RESET */}
            {view === 'forgot-pass' && resetSent ? (
                 <div className="flex flex-col items-center gap-6 py-4 animate-fade-in">
                      <div className="w-16 h-16 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] mb-2">
                          <CheckCircle size={32} />
                      </div>
                      <div className="text-center text-sm text-[#444746] bg-[#F8F9FA] p-4 rounded-2xl border border-[#E3E3E3]">
                          <p className="mb-2 font-bold text-[#1F1F1F]">Link sent to {email}</p>
                          <p>If an account exists, you will receive a password reset link shortly.</p>
                          <p className="mt-2 text-xs opacity-70">Don't see it? Check your Spam folder.</p>
                      </div>
                      <button 
                         onClick={() => resetView('login')}
                         className="w-full h-12 bg-[#1A73E8] text-white rounded-xl font-bold hover:bg-[#1557B0] transition-colors"
                      >
                          Back to Login
                      </button>
                      <button 
                          onClick={() => setResetSent(false)} 
                          className="text-sm font-bold text-[#1A73E8] hover:underline"
                      >
                          Try different email
                      </button>
                 </div>
            ) : (
                <>
                    {/* Google Button - Always visible unless forgot password */}
                    {view !== 'forgot-pass' && (
                        <>
                            <button 
                                onClick={handleGoogleLogin}
                                className="w-full h-12 bg-white border border-[#E3E3E3] rounded-xl flex items-center justify-center gap-3 font-medium text-[#1F1F1F] hover:bg-[#F8F9FA] transition-colors mb-6 group relative overflow-hidden"
                            >
                                <div className="w-5 h-5 relative z-10">
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
                                    <button type="button" onClick={() => resetView('forgot-pass')} className="absolute right-4 top-4 text-xs font-bold text-[#1A73E8] hover:underline">
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

                    {/* Guest Login Option */}
                    {view !== 'forgot-pass' && (
                        <div className="mt-4 pt-4 border-t border-[#F1F3F4]">
                            <button 
                                onClick={handleGuestLogin}
                                className="w-full py-3 text-sm font-bold text-[#5E5E5E] hover:text-[#1F1F1F] hover:bg-[#F8F9FA] rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    )}

                    {/* Footer Links */}
                    <div className="mt-2 text-center">
                        {view === 'forgot-pass' ? (
                            <button onClick={() => resetView('login')} className="text-sm font-bold text-[#1A73E8] hover:underline">Back to Login</button>
                        ) : (
                            <p className="text-sm text-[#5E5E5E]">
                                {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                                <button 
                                    onClick={() => { resetView(view === 'login' ? 'register' : 'login'); }}
                                    className="ml-2 font-bold text-[#1A73E8] hover:underline"
                                >
                                    {view === 'login' ? 'Create one' : 'Log in'}
                                </button>
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
