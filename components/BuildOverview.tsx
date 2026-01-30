
import React from 'react';
import { PlanData } from '../types';
import { 
  ArrowLeft, 
  Share2, 
  ShieldCheck, 
  ArrowUpRight, 
  SearchCheck, 
  Check, 
  Image as ImageIcon,
  Clock,
  Zap,
  MoreVertical,
  Layers,
  Sparkles,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

interface BuildOverviewProps {
  plan: PlanData;
  imageSrc: string;
  onBack: () => void;
  onStartGuide: () => void;
}

export const BuildOverview: React.FC<BuildOverviewProps> = ({ plan, imageSrc, onBack, onStartGuide }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F9] text-[#1F1F1F] font-sans selection:bg-[#D3E3FD] overflow-x-hidden">
      
      {/* 1. Glass Navigation */}
      <nav aria-label="Plan Details Navigation" className="sticky top-0 h-20 px-6 md:px-12 flex items-center justify-between bg-[#F0F4F9]/80 backdrop-blur-xl border-b border-[#E3E3E3] z-[60] transition-all">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            aria-label="Back to intent selection"
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#E3E3E3] hover:border-[#BDC1C6] text-[#5E5E5E] hover:text-[#1F1F1F] transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-[#1A73E8] uppercase tracking-[0.25em]">Generated Plan</span>
             <h1 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wider truncate max-w-[200px]">
                {plan.title}
             </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Share Plan" className="w-12 h-12 rounded-full hover:bg-white hover:shadow-sm transition-all flex items-center justify-center text-[#5E5E5E]">
            <Share2 size={20} />
          </button>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-10 pb-48">
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          
          {/* Primary Info Card (7/12) */}
          <section aria-label="Plan Summary" className="lg:col-span-7 bg-white rounded-[3rem] p-10 md:p-12 shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[500px] group border border-white/60">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#E8F0FE] to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F1F1F] text-white mb-8 shadow-lg">
                <ShieldCheck size={14} aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-[#1F1F1F] leading-[1.1] tracking-tighter mb-8">
                {plan.title}
              </h2>
              
              <p className="text-[#5E5E5E] text-xl leading-relaxed font-light max-w-2xl">
                {plan.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 relative z-10">
              <div className="bg-[#F8F9FA] border border-[#E3E3E3] p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E3E3E3] flex items-center justify-center text-[#1A73E8] shadow-sm" aria-hidden="true">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-widest opacity-60 mb-1">Est. Time</div>
                  <div className="text-lg font-bold text-[#1F1F1F]">{plan.estimatedTime}</div>
                </div>
              </div>
              <div className="bg-[#F8F9FA] border border-[#E3E3E3] p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E3E3E3] flex items-center justify-center text-[#EA4335] shadow-sm" aria-hidden="true">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-widest opacity-60 mb-1">Difficulty</div>
                  <div className="text-lg font-bold text-[#1F1F1F]">{plan.difficulty}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar Insights (5/12) */}
          <aside aria-label="AI Insights and Source" className="lg:col-span-5 flex flex-col gap-6">
            
            {/* AI Analysis Card */}
            <div className="bg-[#18181B] rounded-[3rem] p-10 relative overflow-hidden shadow-2xl flex flex-col gap-8 border border-white/5 group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(66,133,244,0.15),transparent_50%)]"></div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md" aria-hidden="true">
                        <BrainCircuit size={20} className="text-[#4285F4]" />
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">Gemini Insight</span>
                  </div>
                  
                  <p className="text-xl md:text-2xl font-display font-light text-white leading-relaxed opacity-90">
                    "{plan.analysis}"
                  </p>
               </div>
            </div>

            {/* Source Image */}
            <div className="relative h-64 rounded-[3rem] overflow-hidden border border-[#E3E3E3] shadow-md group">
               <img src={imageSrc} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Source scan" />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
               <div className="absolute bottom-6 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#1F1F1F] shadow-lg">
                  Original Scan
               </div>
            </div>

          </aside>
        </div>

        {/* 3. Steps Timeline */}
        <section aria-labelledby="execution-plan-title" className="bg-white rounded-[3rem] border border-[#E3E3E3] shadow-sm overflow-hidden p-8 md:p-12">
            <header className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F1F3F4] rounded-2xl flex items-center justify-center text-[#1F1F1F]" aria-hidden="true">
                     <Layers size={24} />
                  </div>
                  <h3 id="execution-plan-title" className="text-3xl font-display font-medium text-[#1F1F1F]">Execution Plan</h3>
               </div>
               <div className="px-5 py-2 rounded-full bg-[#F1F3F4] text-[#5E5E5E] text-xs font-bold uppercase tracking-widest border border-[#E3E3E3]">
                   {plan.steps.length} Steps
               </div>
            </header>

            <ol className="relative space-y-12 pl-8 md:pl-12 border-l-2 border-[#F1F3F4]">
                {plan.steps.map((step, i) => (
                    <li key={i} className="relative group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[43px] md:-left-[59px] top-0 w-5 h-5 md:w-7 md:h-7 rounded-full bg-white border-4 border-[#1A73E8] shadow-[0_0_0_4px_rgba(232,240,254,1)] group-hover:scale-110 transition-transform z-10" aria-hidden="true"></div>
                        
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                           <div className="flex-1 space-y-3">
                               <div className="text-[10px] font-bold text-[#1A73E8] uppercase tracking-widest mb-1">Step {String(i + 1).padStart(2, '0')}</div>
                               <h4 className="text-2xl font-bold text-[#1F1F1F]">{step.title}</h4>
                               <p className="text-[#5E5E5E] text-lg leading-relaxed font-light">{step.description}</p>
                           </div>
                           
                           <div className="w-full md:w-auto p-4 bg-[#F8F9FA] rounded-[1.5rem] border border-[#E3E3E3] flex items-start gap-4 max-w-sm">
                               <div className="mt-1 w-6 h-6 rounded-full bg-[#E6F4EA] flex items-center justify-center text-[#137333] shrink-0" aria-hidden="true">
                                   <Check size={14} strokeWidth={3} />
                               </div>
                               <div className="text-sm text-[#444746] leading-relaxed">
                                   <strong className="block text-[#137333] text-xs uppercase tracking-wider mb-1">Verify</strong>
                                   {step.verificationCriteria}
                               </div>
                           </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>

      </main>

      {/* 4. Floating Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 z-[100] pointer-events-none flex justify-center">
        <div className="max-w-xl w-full pointer-events-auto">
          <button 
            onClick={onStartGuide}
            aria-label="Start Step-by-Step Guide"
            className="w-full group bg-[#1F1F1F] text-white p-3 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:bg-black transition-all duration-300 active:scale-95 flex items-center justify-between"
          >
             <div className="flex items-center gap-4 ml-6">
                 <div className="relative">
                    <div className="w-3 h-3 bg-[#34A853] rounded-full animate-pulse"></div>
                 </div>
                 <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Ready to start</span>
                    <span className="text-lg font-bold">Launch Guide</span>
                 </div>
             </div>
             
             <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black group-hover:rotate-45 transition-transform duration-500" aria-hidden="true">
                <ArrowUpRight size={24} strokeWidth={2.5} />
             </div>
          </button>
        </div>
      </footer>
    </div>
  );
};
