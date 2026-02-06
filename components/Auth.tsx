
import React, { useState } from 'react';
import { UserProfile, SkillLevel } from '../types';
import { authService } from '../services/authService';
import { 
  Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, 
  CheckCircle, Briefcase, GraduationCap, 
  Wrench, Sparkles, ArrowLeft, Check
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
             // We still show success to prevent enumeration, but maybe warn in console
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

  const resetView = (newView: AuthView) => {
      setView(newView);
      setError('');
      setResetSent(false);
  };

  // --- Shared Nav Component ---
  const AuthHeader = () => (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[1000px] bg-white/70 backdrop-blur-xl border border-[#E3E3E3] rounded-full px-5 py-3 flex items-center justify-between shadow-sm transition-all duration-300">
            <button onClick={onBack} className="flex items-center gap-3 group">
                <div className="w-9 h-9 bg-[#1F1F1F] rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Sparkles size={16} fill="currentColor" />
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-lg font-display font-medium text-[#1F1F1F] tracking-tight leading-none">NAVA</span>
                    <span className="text-[9px] font-mono font-medium uppercase tracking-widest text-[#5E5E5E] leading-none mt-1">
                        AI Assistant
                    </span>
                </div>
            </button>

            <button 
                onClick={() => {
                    if (view === 'onboarding') authService.logout();
                    onBack();
                }}
                className="w-9 h-9 rounded-full bg-white/50 border border-black/5 flex items-center justify-center text-[#5E5E5E] hover:bg-white hover:text-[#1F1F1F] hover:shadow-md transition-all group"
                aria-label="Back"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
        </div>
    </nav>
  );

  // --- UI Components ---

  // 1. Onboarding Screen
  if (view === 'onboarding') {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0F4F9] relative overflow-hidden font-sans">
           {/* Background Ambience matches Profile/Landing */}
           <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#E8F0FE] rounded-full blur-[100px] pointer-events-none opacity-60"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#FCE8E6] rounded-full blur-[100px] pointer-events-none opacity-60"></div>

           <AuthHeader />

           <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-premium border border-white/50 overflow-hidden animate-scale-in flex flex-col md:flex-row relative z-10 mt-16 min-h-[600px]">
              
              {/* Left: Decor Panel */}
              <div className="md:w-[35%] bg-[#18181B] text-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
                 {/* Abstract Background */}
                 <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#4285F4]/20 to-transparent rounded-full blur-[80px] transform translate-x-1/3 -translate-y-1/3"></div>
                 <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#EA4335]/20 to-transparent rounded-full blur-[80px] transform -translate-x-1/3 translate-y-1/3"></div>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-10 backdrop-blur-md shadow-inner border border-white/10">
                        <UserIcon size={28} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-display font-medium mb-6 tracking-tight">Almost there</h2>
                    <p className="text-white/70 text-lg leading-relaxed font-light">
                        Tell us a bit about yourself to personalize your experience.
                    </p>
                 </div>

                 <div className="relative z-10 mt-12 flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-white opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                 </div>
              </div>

              {/* Right: Form Panel */}
              <div className="md:w-[65%] p-8 md:p-14 bg-white flex flex-col justify-center">
                 
                 <div className="mb-10">
                    <label className="text-xs font-bold text-[#5E5E5E] uppercase tracking-[0.2em] block mb-6">I am a...</label>
                    <div className="flex flex-col gap-4">
                        {[
                            { id: SkillLevel.STUDENT, label: 'Student', icon: <GraduationCap size={24}/>, desc: 'Learning & Exploring' },
                            { id: SkillLevel.MAKER, label: 'Maker / Hobbyist', icon: <Wrench size={24}/>, desc: 'Building for fun' },
                            { id: 'Professional', label: 'Professional', icon: <Briefcase size={24}/>, desc: 'Work & Engineering' }
                        ].map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id as SkillLevel)}
                                className={`relative flex items-center gap-6 p-5 rounded-[1.5rem] border-2 text-left transition-all duration-300 group ${
                                    selectedRole === role.id 
                                    ? 'border-[#1A73E8] bg-[#F8F9FA]' 
                                    : 'border-transparent bg-white hover:bg-[#F8F9FA] hover:scale-[1.01] shadow-sm hover:shadow-md'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                                    selectedRole === role.id ? 'bg-[#1A73E8] text-white shadow-md' : 'bg-[#F1F3F4] text-[#5E5E5E]'
                                }`}>
                                    {role.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-lg mb-1 ${selectedRole === role.id ? 'text-[#1A73E8]' : 'text-[#1F1F1F]'}`}>{role.label}</div>
                                    <div className="text-sm text-[#5E5E5E] font-medium opacity-80">{role.desc}</div>
                                </div>
                                
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                    selectedRole === role.id ? 'border-[#1A73E8] bg-[#1A73E8]' : 'border-[#E3E3E3]'
                                }`}>
                                    {selectedRole === role.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="mb-12">
                    <label className="text-xs font-bold text-[#5E5E5E] uppercase tracking-[0.2em] block mb-6">Profile Color</label>
                    <div className="flex flex-wrap gap-4">
                        {['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-500', 'bg-rose-600', 'bg-slate-800'].map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-14 h-14 rounded-full ${color} transition-all duration-300 flex items-center justify-center relative ${
                                    selectedColor === color ? 'scale-110 shadow-lg ring-4 ring-offset-2 ring-[#F1F3F4]' : 'hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                            >
                                {selectedColor === color && <Check size={24} className="text-white" strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                 </div>

                 <button 
                    onClick={completeOnboarding}
                    disabled={loading}
                    className="w-full h-16 bg-[#1A73E8] text-white rounded-full font-bold text-lg hover:bg-[#1557B0] transition-all shadow-[0_8px_20px_rgba(26,115,232,0.3)] hover:shadow-[0_12px_24px_rgba(26,115,232,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-3 group"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>
                            Finish Setup 
                            <div className="bg-white/20 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={18}/>
                            </div>
                        </>
                    )}
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

                    {/* Footer Links */}
                    <div className="mt-8 text-center">
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
