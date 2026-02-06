import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Sparkles, ArrowRight, ScanLine, Layers, Command, ShieldCheck, Cpu, Target, Check, X, Box, Zap, Lightbulb, Wrench } from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onUpload: (imageSrc: string) => void;
  user?: UserProfile | null;
  onProfileClick?: () => void;
}

// --- Abstract Background Components (Colorful Gradients) ---

const AbstractReuse = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#F0FDF4]" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(#86EFAC_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
    <div className="absolute -right-12 -bottom-12 opacity-10 text-emerald-500 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
        <Box size={320} strokeWidth={0.5} />
    </div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 blur-[100px] rounded-full mix-blend-multiply"></div>
  </div>
);

const AbstractUpgrade = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#EFF6FF]" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(#93C5FD_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
    <div className="absolute -right-12 -bottom-12 opacity-10 text-blue-500 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
        <Zap size={320} strokeWidth={0.5} />
    </div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full mix-blend-multiply"></div>
  </div>
);

const AbstractIdeas = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#FEFCE8]" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(#FDE047_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
    <div className="absolute -right-12 -bottom-12 opacity-10 text-yellow-500 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
        <Lightbulb size={320} strokeWidth={0.5} />
    </div>
    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 blur-[100px] rounded-full mix-blend-multiply"></div>
  </div>
);

const AbstractFixBuild = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#18181B]" aria-hidden="true">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:32px_32px]"></div>
    <div className="absolute -right-20 -bottom-20 opacity-10 text-white transition-transform duration-1000 group-hover:scale-105 group-hover:rotate-3">
        <Wrench size={400} strokeWidth={0.5} />
    </div>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#18181B] via-[#18181B]/80 to-transparent"></div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onUpload, user, onProfileClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => e.target?.result && onUpload(e.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  const containerClass = "max-w-[1440px] mx-auto px-6 md:px-12";
  const cardRadius = "rounded-[2.5rem]";
  const sectionRadius = "rounded-[3.5rem]";

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#4285F4] selection:text-white overflow-x-hidden relative text-[#1F1F1F]">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
          <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#E8F0FE]/40 to-transparent blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-tl from-[#FCE8E6]/40 to-transparent blur-[100px] opacity-60"></div>
      </div>

      {/* Floating Pill Navigation */}
      <nav 
        aria-label="Main Navigation" 
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className={`pointer-events-auto flex items-center justify-between w-full max-w-[1000px] bg-white/70 backdrop-blur-xl border border-[#E3E3E3] rounded-full px-5 py-3 shadow-sm transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-md scale-[0.99]' : ''}`}>
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 pl-1">
               <div className="w-9 h-9 bg-[#1F1F1F] rounded-full flex items-center justify-center text-white shadow-md shrink-0" aria-hidden="true">
                   <Sparkles size={16} fill="currentColor" />
               </div>
               <div className="flex flex-col">
                   <span className="text-lg font-display font-medium text-[#1F1F1F] tracking-tight leading-none">NAVA</span>
                   <span className="text-[9px] font-mono font-medium uppercase tracking-widest text-[#5E5E5E] leading-none mt-1">
                       AI Assistant
                   </span>
               </div>
            </div>
            
            {/* Actions Section */}
            <div className="flex items-center gap-2 pr-1">
                {user && (
                    <button 
                        onClick={onProfileClick}
                        className={`w-9 h-9 rounded-full ${user.color} flex items-center justify-center text-white font-bold shadow-sm hover:scale-105 transition-transform ring-2 ring-white border border-gray-100`}
                        aria-label="View Profile"
                        title={user.name}
                    >
                        {user.name.charAt(0)}
                    </button>
                )}
                <button 
                    onClick={onStart}
                    aria-label="Start App"
                    className={`group relative overflow-hidden bg-[#1A73E8] text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 active:scale-95 whitespace-nowrap`}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {user ? 'New Project' : 'Join / Start'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4] via-[#1A73E8] to-[#0B57D0] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative min-h-[90vh] flex flex-col justify-center pt-32 pb-24`} aria-label="Hero Section">
          <div className={`${containerClass} w-full relative z-10 flex flex-col items-center text-center`}>
              
              <div className="mb-10 animate-fade-up opacity-0" style={{ animationDelay: '0.1s' }} aria-hidden="true">
                  <div className="px-5 py-2 rounded-full bg-[#F0F4F9] border border-[#E3E3E3] flex items-center gap-3 mx-auto">
                     <span className="relative flex h-2.5 w-2.5">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34A853]"></span>
                     </span>
                     <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#444746]">
                         System Online
                     </span>
                  </div>
              </div>

              <h1 className="text-[13vw] lg:text-[160px] leading-[0.9] font-display font-medium text-[#1F1F1F] tracking-tighter mb-12 animate-fade-up opacity-0" style={{ animationDelay: '0.2s' }}>
                  Build together<br />
                  <span className="bg-[linear-gradient(90deg,#4285F4,#EA4335,#FBBC04,#34A853,#4285F4)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">with NAVA.</span>
              </h1>
              
              <div className="flex flex-col items-center gap-12 animate-fade-up opacity-0 max-w-4xl mx-auto" style={{ animationDelay: '0.4s' }}>
                  <p className="text-2xl md:text-3xl text-[#444746] font-normal leading-relaxed tracking-tight">
                      From idea to execution. Upload ideas or references. Choose how to build. NAVA guides you.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                     <button 
                       onClick={onStart}
                       className="w-full sm:w-auto h-16 px-10 bg-[#1A73E8] text-white rounded-full font-medium text-lg hover:bg-[#1557B0] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                     >
                        <Camera size={22} aria-hidden="true" />
                        <span>Get Started</span>
                     </button>
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-full sm:w-auto h-16 px-10 bg-white text-[#1F1F1F] border border-[#E3E3E3] rounded-full font-medium text-lg hover:bg-[#F8F9FA] hover:border-[#D3E3FD] transition-all flex items-center justify-center gap-3"
                     >
                        <Upload size={22} className="text-[#5E5E5E]" aria-hidden="true" /> 
                        <span>Use a Photo</span>
                     </button>
                  </div>
              </div>
          </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 md:py-32" aria-labelledby="how-it-works-title">
          <div className={containerClass}>
              <div className={`border border-[#E3E3E3] ${sectionRadius} p-8 md:p-16`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                      <div className="max-w-xl">
                          <h2 id="how-it-works-title" className="text-5xl md:text-7xl font-display font-medium text-[#1F1F1F] mb-10 leading-[1.05] tracking-tight">
                              A simpler way<br/>to create.
                          </h2>
                          <p className="text-xl md:text-2xl text-[#444746] leading-relaxed font-light">
                              NAVA helps you build real things with materials you have. The AI scans your items and gives you a clear plan to finish.
                          </p>
                      </div>
                      <div className="grid gap-6">
                          {[
                              { title: "Scan your items", icon: <ScanLine size={28} />, color: "text-[#1A73E8]", bg: "bg-[#E8F0FE]" },
                              { title: "Share an idea", icon: <Layers size={28} />, color: "text-[#9333EA]", bg: "bg-[#F3E8FD]" },
                              { title: "Get your guide", icon: <Command size={28} />, color: "text-[#EA4335]", bg: "bg-[#FCE8E6]" }
                          ].map((item, i) => (
                              <div key={i} className={`group flex items-center gap-8 p-8 ${cardRadius} bg-white border border-[#E3E3E3] shadow-sm hover:shadow-lg hover:border-[#D3E3FD] transition-all duration-300 cursor-default`} role="listitem">
                                  <div className={`w-16 h-16 rounded-3xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-500 shrink-0`} aria-hidden="true">
                                      {item.icon}
                                  </div>
                                  <span className="text-xl md:text-2xl font-medium text-[#1F1F1F] tracking-tight">{item.title}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </section>
      
      {/* Decorative Animation */}
      <section className="pb-24 md:pb-32" aria-hidden="true">
           <div className={containerClass}>
              <div className={`w-full relative aspect-[16/9] bg-[#F0F4F9] ${sectionRadius} overflow-hidden shadow-2xl border-[1px] border-[#E3E3E3] group isolate`}>
                <style>{`
                  .anim-cycle {
                    animation-duration: 13s;
                    animation-iteration-count: infinite;
                    animation-fill-mode: forwards;
                    animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
                  }
                  @keyframes blueScan {
                    0% { top: -20%; opacity: 0; box-shadow: 0 0 10px #4285F4; }
                    5% { opacity: 1; }
                    25% { top: 120%; opacity: 1; box-shadow: 0 0 60px #4285F4; }
                    30%, 100% { top: 120%; opacity: 0; }
                  }
                  @keyframes meshShow {
                    0%, 5% { opacity: 0; clip-path: inset(0 100% 0 0); }
                    25% { opacity: 1; clip-path: inset(0 0 0 0); }
                    30% { opacity: 0; }
                    100% { opacity: 0; }
                  }
                  @keyframes paperBase {
                    0%, 30% { opacity: 1; transform: scale(1); }
                    35% { opacity: 0; transform: scale(0.95); }
                    95% { opacity: 0; }
                    100% { opacity: 1; transform: scale(1); }
                  }
                  @keyframes detectLabel {
                    0%, 25% { opacity: 0; transform: translateY(15px); }
                    28% { opacity: 1; transform: translateY(0); }
                    35% { opacity: 1; transform: translateY(0); }
                    38% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 0; }
                  }
                  @keyframes step1 {
                    0%, 38% { opacity: 0; transform: scale(0.95); }
                    40% { opacity: 1; transform: scale(1); }
                    58% { opacity: 1; transform: scale(1); }
                    60% { opacity: 0; }
                    100% { opacity: 0; }
                  }
                  @keyframes step2 {
                    0%, 58% { opacity: 0; transform: scale(0.95); }
                    60% { opacity: 1; transform: scale(1); }
                    78% { opacity: 1; transform: scale(1); }
                    80% { opacity: 0; }
                    100% { opacity: 0; }
                  }
                  @keyframes flyStraight {
                    0%, 78% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.9); }
                    80% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
                    82% { transform: translate3d(0, -40px, 0) rotateX(-5deg) scale(1.05); }
                    100% { opacity: 1; transform: translate3d(0, -300px, -100px) scale(0.2); }
                  }
                  @keyframes speedLines {
                    0%, 80% { opacity: 0; transform: translateY(0); }
                    82% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(200px); }
                  }
                `}</style>

                <div className="absolute inset-0 bg-[#F8F9FA] overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(66,133,244,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(66,133,244,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 anim-cycle pointer-events-none" style={{ animationName: 'speedLines' }}>
                       <div className="absolute top-0 left-[20%] w-[1px] h-32 bg-gradient-to-b from-transparent via-[#4285F4]/30 to-transparent"></div>
                       <div className="absolute top-10 right-[20%] w-[1px] h-48 bg-gradient-to-b from-transparent via-[#4285F4]/30 to-transparent"></div>
                       <div className="absolute -top-10 left-[50%] w-[1px] h-64 bg-gradient-to-b from-transparent via-[#4285F4]/20 to-transparent"></div>
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center perspective-[1200px]">

                    <div className="relative w-64 h-80">
                        <div className="absolute inset-0 bg-white shadow-xl rounded-[1px] anim-cycle origin-bottom" style={{ animationName: 'paperBase' }}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white"></div>
                        </div>
                        <div className="absolute inset-0 bg-[#4285F4]/5 border border-[#4285F4]/30 rounded-[1px] anim-cycle z-10" style={{ animationName: 'meshShow' }}>
                            <div className="w-full h-full bg-[linear-gradient(#4285F4_1px,transparent_1px),linear-gradient(90deg,#4285F4_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                        </div>
                    </div>

                    <div className="absolute top-[35%] z-50 anim-cycle" style={{ animationName: 'detectLabel' }}>
                        <div className="bg-white/90 backdrop-blur-md border border-[#E3E3E3] shadow-lg rounded-xl px-5 py-2.5 flex items-center gap-3 transform -translate-x-1/2 left-1/2">
                            <div className="w-2.5 h-2.5 bg-[#34A853] rounded-full animate-pulse"></div>
                            <div>
                                <div className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider leading-none mb-0.5">Found</div>
                                <div className="text-sm font-bold text-[#1F1F1F] leading-none">Paper Sheet</div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute anim-cycle z-20" style={{ animationName: 'step1' }}>
                        <div className="relative drop-shadow-2xl">
                            <svg width="260" height="340" viewBox="0 0 260 340">
                                <path d="M0 100 L130 0 L260 100 L260 340 L0 340 Z" fill="white" stroke="#E3E3E3" strokeWidth="1"/>
                                <path d="M0 100 L130 100 L130 0 Z" fill="#E8F0FE" stroke="#4285F4" strokeWidth="1"/>
                                <path d="M260 100 L130 100 L130 0 Z" fill="#E8F0FE" stroke="#4285F4" strokeWidth="1"/>
                                <line x1="130" y1="0" x2="130" y2="340" stroke="#4285F4" strokeWidth="2" strokeDasharray="4 4" />
                            </svg>
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1F1F1F] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap uppercase">
                                Step 1: Fold corners
                            </div>
                        </div>
                    </div>

                    <div className="absolute anim-cycle z-20" style={{ animationName: 'step2' }}>
                        <div className="relative drop-shadow-2xl">
                            <svg width="260" height="340" viewBox="0 0 260 340">
                                <path d="M130 0 L30 340 L130 300 L230 340 Z" fill="white" stroke="#E3E3E3" strokeWidth="1"/>
                                <line x1="130" y1="0" x2="130" y2="300" stroke="#4285F4" strokeWidth="1.5" />
                            </svg>
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1F1F1F] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap uppercase">
                                Step 2: Fold center
                            </div>
                        </div>
                    </div>

                    <div className="absolute anim-cycle z-30" style={{ animationName: 'flyStraight' }}>
                         <div className="relative filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
                             <svg width="200" height="260" viewBox="0 0 200 260" className="overflow-visible">
                                 <defs>
                                     <linearGradient id="planeBody" x1="0.5" y1="1" x2="0.5" y2="0">
                                         <stop offset="0%" stopColor="#FFFFFF"/>
                                         <stop offset="100%" stopColor="#F1F3F4"/>
                                     </linearGradient>
                                 </defs>
                                 <path d="M100 0 L20 200 L100 160 L180 200 Z" fill="url(#planeBody)" stroke="#BDC1C6" strokeWidth="1" />
                                 <line x1="100" y1="0" x2="100" y2="160" stroke="#E3E3E3" strokeWidth="1" />
                             </svg>
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-20 bg-blue-400/20 blur-xl rounded-full"></div>
                         </div>
                    </div>

                </div>

                <div className="absolute left-0 right-0 h-48 z-40 anim-cycle pointer-events-none mix-blend-screen" style={{ animationName: 'blueScan' }}>
                    <div className="absolute bottom-0 w-full h-[3px] bg-[#4285F4] shadow-[0_0_20px_#4285F4,0_0_40px_#4285F4,0_0_80px_#4285F4]"></div>
                    <div className="absolute bottom-[3px] w-full h-full bg-gradient-to-t from-[#4285F4]/40 to-transparent"></div>
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/40 flex items-center gap-4">
                        <div className="flex gap-1 h-3 items-end">
                            <div className="w-1 bg-[#4285F4] rounded-full animate-[pulse_1s_infinite] h-full"></div>
                            <div className="w-1 bg-[#EA4335] rounded-full animate-[pulse_1s_0.2s_infinite] h-2/3"></div>
                            <div className="w-1 bg-[#FBBC04] rounded-full animate-[pulse_1s_0.4s_infinite] h-full"></div>
                            <div className="w-1 bg-[#34A853] rounded-full animate-[pulse_1s_0.6s_infinite] h-1/2"></div>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#1F1F1F] tracking-wider uppercase">
                            AI is ready...
                        </span>
                    </div>
                </div>

              </div>
           </div>
      </section>

      {/* Build Options Section */}
      <section className="px-4 md:px-6 py-12" aria-labelledby="start-section-title">
          <div className={`bg-[#F0F4F9] ${sectionRadius} py-24 md:py-32 overflow-hidden relative`}>
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }} aria-hidden="true"></div>
            
            <div className={containerClass + " relative z-10"}>
                <h2 id="start-section-title" className="text-5xl md:text-8xl font-display font-medium mb-20 text-center tracking-tighter text-[#1F1F1F]">
                    From Idea<br/>to Execution
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { 
                            title: 'Remake things', 
                            desc: 'Turn old items into something new.', 
                            bg: AbstractReuse, 
                            color: 'text-emerald-600', 
                            button: 'bg-emerald-600',
                            buttonText: 'Build Now' 
                        },
                        { 
                            title: 'Better items', 
                            desc: 'Upgrade what you own with AI tips.', 
                            bg: AbstractUpgrade, 
                            color: 'text-blue-600', 
                            button: 'bg-blue-600',
                            buttonText: 'Try Upgrade' 
                        },
                        { 
                            title: 'New ideas', 
                            desc: 'Get matches for your materials.', 
                            bg: AbstractIdeas, 
                            color: 'text-yellow-600', 
                            button: 'bg-yellow-600',
                            buttonText: 'Get Inspired' 
                        }
                    ].map((item, i) => (
                        <button 
                            key={i}
                            onClick={onStart}
                            className={`group relative h-[560px] ${cardRadius} bg-white overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-left w-full border border-[#E3E3E3]`}
                            aria-label={`${item.title}: ${item.desc}`}
                        >
                            <item.bg />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                            
                            <div className="absolute top-10 left-10 right-10 z-10">
                                <h3 className="text-4xl font-display font-medium text-[#1F1F1F] mb-3 leading-tight">{item.title}</h3>
                                <p className="text-[#5E5E5E] font-normal text-xl leading-snug">{item.desc}</p>
                            </div>
                            
                            <div className="absolute bottom-10 left-10 right-10 z-10">
                               <div className={`w-14 h-14 rounded-full ${item.button} text-white flex items-center justify-center shadow-lg group-hover:w-full transition-all duration-500 group-hover:justify-between group-hover:px-6`}>
                                  <ArrowRight size={24} className="group-hover:hidden" aria-hidden="true" />
                                  <span className="hidden group-hover:block font-bold">{item.buttonText}</span>
                                  <ArrowRight size={24} className="hidden group-hover:block" aria-hidden="true" />
                               </div>
                            </div>
                        </button>
                    ))}
                    
                    <button 
                        onClick={onStart}
                        className={`lg:col-span-3 group relative h-[420px] ${cardRadius} bg-[#18181B] overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row hover:-translate-y-2 text-left w-full`}
                        aria-label="Repair & Build: Fix broken items or start new projects"
                    >
                          <AbstractFixBuild />
                          
                          <div className="relative z-10 p-12 md:p-16 flex flex-col justify-between h-full md:w-1/2">
                              <div>
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest w-fit mb-6">
                                      <Sparkles size={12} aria-hidden="true" /> Expert Mode
                                  </div>
                                  <h3 className="text-5xl font-display font-medium text-white mb-6">Repair & Build</h3>
                                  <p className="text-white/80 text-xl font-light max-w-sm leading-relaxed">
                                      Fix broken items or start new projects with easy, step-by-step help.
                                  </p>
                              </div>
                              <div>
                                   <div className="flex items-center gap-4 text-white font-bold group-hover:translate-x-4 transition-transform">
                                      Start Now <ArrowRight size={20} aria-hidden="true" />
                                   </div>
                              </div>
                          </div>
                    </button>

                </div>
            </div>
          </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-24 bg-white" aria-labelledby="trust-section-title">
          <div className={containerClass}>
              <div className={`border border-[#E3E3E3] ${sectionRadius} p-8 md:p-12`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
                      
                      <div className={`lg:col-span-4 group relative bg-[#F0F4F9] ${cardRadius} p-10 overflow-hidden hover:shadow-xl transition-all duration-500 cursor-default flex flex-col h-full min-h-[400px]`}>
                           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity duration-500 text-[#EA4335] transform translate-x-1/4 -translate-y-1/4">
                              <ShieldCheck size={180} strokeWidth={1} />
                           </div>
                           <div className="relative z-10 flex flex-col h-full justify-between">
                               <div>
                                   <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#EA4335] mb-8 shadow-sm">
                                       <ShieldCheck size={28} />
                                   </div>
                                   <h3 className="text-xs font-bold text-[#5E5E5E] tracking-widest uppercase mb-3">Safety</h3>
                                   <p className="text-4xl lg:text-5xl font-display font-medium text-[#1F1F1F] mb-6 tracking-tight">Trust.</p>
                                   <p className="text-[#444746] text-xl leading-relaxed max-w-[90%] font-light">
                                      NAVA warns you about unsafe builds early. No guessing.
                                    </p>
                               </div>
                               <div className="w-full h-1.5 bg-[#E3E3E3] rounded-full mt-10 overflow-hidden">
                                   <div className="h-full bg-[#EA4335] w-1/3 group-hover:w-full transition-all duration-1000 ease-out"></div>
                               </div>
                           </div>
                      </div>

                      <div className={`lg:col-span-4 group relative bg-[#F0F4F9] ${cardRadius} p-10 overflow-hidden hover:shadow-xl transition-all duration-500 cursor-default flex flex-col h-full min-h-[400px]`}>
                           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] rounded-full blur-[80px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>
                           
                           <div className="relative z-10 flex flex-col h-full justify-between">
                               <div>
                                   <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#0B57D0] mb-8 shadow-sm">
                                       <Cpu size={28} />
                                   </div>
                                   <h3 className="text-xs font-bold text-[#5E5E5E] tracking-widest uppercase mb-3">Powered by AI</h3>
                                   <p className="text-4xl lg:text-5xl font-display font-medium text-[#1F1F1F] mb-6 tracking-tight">Expert<br/><span className="bg-gradient-to-r from-[#4285F4] to-[#9B72CB] bg-clip-text text-transparent">Gemini.</span></p>
                                   <p className="text-[#444746] text-xl leading-relaxed font-light">
                                      Built on Gemini AI to provide clear steps for any material.
                                    </p>
                               </div>
                               <div className="flex gap-2 items-center mt-10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#EA4335] animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC04] animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-bounce" style={{animationDelay: '0.3s'}}></div>
                               </div>
                           </div>
                      </div>

                      <div className={`lg:col-span-4 group relative bg-[#1F1F1F] ${cardRadius} p-10 overflow-hidden hover:shadow-xl transition-all duration-500 text-white cursor-default flex flex-col h-full min-h-[400px]`}>
                           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#34A853] to-[#34A853] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                           
                           <div className="relative z-10 flex flex-col h-full">
                               <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-[#34A853] mb-8 backdrop-blur-sm">
                                   <Target size={28} />
                               </div>
                               <h3 className="text-xs font-bold text-white/60 tracking-widest uppercase mb-3">Clear Goals</h3>
                               <p className="text-4xl lg:text-5xl font-display font-medium text-white mb-8 tracking-tight">Simple results.</p>
                               
                               <div className="space-y-8 mt-auto">
                                   <div className="flex gap-4">
                                       <div className="mt-1 min-w-[24px]"><Check size={24} className="text-[#34A853]" strokeWidth={3} /></div>
                                       <div>
                                           <div className="text-xs font-bold uppercase tracking-wider text-[#34A853] mb-1">We are</div>
                                           <div className="text-xl font-light text-white leading-tight">Your helpful building assistant.</div>
                                       </div>
                                   </div>
                                   <div className="w-full h-px bg-white/10"></div>
                                   <div className="flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                                       <div className="mt-1 min-w-[24px]"><X size={24} className="text-[#EA4335]" strokeWidth={3} /></div>
                                       <div>
                                           <div className="text-xs font-bold uppercase tracking-wider text-[#EA4335] mb-1">We are not</div>
                                           <div className="text-xl font-light text-white leading-tight">A chatbot or photo filter.</div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                      </div>

                  </div>
              </div>
          </div>
      </section>

      <footer className="pb-16 bg-white" role="contentinfo">
          <div className={containerClass}>
              <div className="flex flex-col md:flex-row justify-between items-center text-[#5E5E5E] text-sm font-medium pt-8 border-t border-[#E3E3E3]">
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                      <span className="font-display font-bold text-lg tracking-tight text-[#1F1F1F]">NAVA</span>
                      <div className="h-4 w-px bg-[#E3E3E3]"></div>
                      <span className="tracking-wide font-mono text-xs text-[#5E5E5E]">AI for Builders</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-8">
                      <a href="#" className="hover:text-[#1A73E8] transition-colors">Privacy</a>
                      <a href="#" className="hover:text-[#1A73E8] transition-colors">Safety</a>
                      <a href="#" className="hover:text-[#1A73E8] transition-colors">Terms</a>
                      <div className="flex items-center gap-2 opacity-50 font-mono text-xs">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></div>
                         <span>Systems Normal</span>
                      </div>
                  </div>
              </div>
          </div>
      </footer>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
