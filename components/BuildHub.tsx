import React from 'react';
import { BuildOption, Difficulty } from '../types';
import { Clock, ArrowLeft, ArrowUpRight } from 'lucide-react';

interface BuildHubProps {
  objectName: string;
  imageSrc: string;
  options: BuildOption[];
  onSelectOption: (option: BuildOption) => void;
  onBack: () => void;
}

export const BuildHub: React.FC<BuildHubProps> = ({ objectName, options, onSelectOption, onBack }) => {
  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans pb-20">
      
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-24 animate-fade-up border-b border-white/5 pb-8">
           <div>
              <button onClick={onBack} className="mb-8 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <ArrowLeft size={20} />
              </button>
              <h1 className="text-[10vw] md:text-[6rem] font-display font-bold leading-none tracking-tighter text-white">
                BLUEPRINTS
              </h1>
           </div>
           <div className="hidden md:block text-right mb-4">
              <div className="text-sm text-slate-500 font-mono">GENERATED_AT_{new Date().toLocaleTimeString()}</div>
              <div className="text-sm text-slate-500 font-mono">TOTAL_PATHS: 0{options.length}</div>
           </div>
        </div>

        {/* List */}
        <div className="space-y-4">
           {options.map((option, idx) => (
              <button 
                key={option.id}
                onClick={() => onSelectOption(option)}
                className="w-full group relative glass-card rounded-[2rem] p-8 md:p-12 text-left flex flex-col md:flex-row gap-8 md:items-center animate-fade-up transition-all hover:-translate-y-1"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                 <div className="font-mono text-4xl text-slate-700 group-hover:text-primary transition-colors">
                    0{idx + 1}
                 </div>

                 <div className="md:w-2/3">
                    <h3 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-white group-hover:text-primary-glow transition-colors duration-300">{option.title}</h3>
                    <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-slate-500">
                       <span className="flex items-center gap-2">
                          <Clock size={12} /> {option.estimatedTime}
                       </span>
                       <span className={`${
                         option.difficulty === Difficulty.EASY ? 'text-emerald-400' : 
                         option.difficulty === Difficulty.MEDIUM ? 'text-amber-400' : 'text-rose-400'
                       }`}>
                         [{option.difficulty}]
                       </span>
                    </div>
                 </div>
                 
                 <div className="md:w-1/3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300">
                    <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <ArrowUpRight size={24} />
                    </div>
                 </div>
              </button>
           ))}
        </div>
      </div>
    </div>
  );
};