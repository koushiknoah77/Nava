
import React from 'react';
import { AnalysisType, Directive } from '../types';

interface DirectivesProps {
  onSelect: (type: AnalysisType) => void;
  imageSrc: string; // Base64 raw or DataURL
}

const DIRECTIVES: Directive[] = [
  {
    id: AnalysisType.DIAGNOSE,
    title: 'DIAGNOSE',
    subtitle: 'Identify Failure',
    question: "Why is this not working?",
    icon: '⚡',
    color: 'border-yellow-500/50 hover:border-yellow-400 text-yellow-400',
  },
  {
    id: AnalysisType.SAFETY,
    title: 'SAFETY',
    subtitle: 'Risk Assessment',
    question: "Is this safe?",
    icon: '🛡️',
    color: 'border-red-500/50 hover:border-red-400 text-red-400',
  },
  {
    id: AnalysisType.AUDIT,
    title: 'AUDIT',
    subtitle: 'Check Integrity',
    question: "What is missing or wrong?",
    icon: '🔍',
    color: 'border-blue-500/50 hover:border-blue-400 text-blue-400',
  },
  {
    id: AnalysisType.REPAIR,
    title: 'RESTORE',
    subtitle: 'Repair Guide',
    question: "How can I fix it?",
    icon: '🔧',
    color: 'border-green-500/50 hover:border-green-400 text-green-400',
  },
  {
    id: AnalysisType.AUGMENT,
    title: 'AUGMENT',
    subtitle: 'Smart Upgrade',
    question: "What can I build or improve?",
    icon: '✨',
    color: 'border-purple-500/50 hover:border-purple-400 text-purple-400',
  },
];

const Directives: React.FC<DirectivesProps> = ({ onSelect, imageSrc }) => {
  return (
    <div className="min-h-screen bg-lumora-950 p-6 flex flex-col relative overflow-hidden">
       {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      <header className="mb-8 flex items-center justify-between relative z-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Directives
        </h1>
        <div className="text-xs font-mono text-gray-500">
          AWAITING INPUT
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Image Preview Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 relative group overflow-hidden rounded-2xl border border-white/10 bg-lumora-900">
           <img 
            src={imageSrc} 
            alt="Captured" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-lumora-950 via-transparent to-transparent"></div>
           <div className="absolute bottom-6 left-6">
             <div className="text-xs font-mono text-lumora-500 mb-1">DATA_SOURCE</div>
             <div className="text-xl font-bold text-white">Captured Reality</div>
           </div>
        </div>

        {/* Option Cards */}
        {DIRECTIVES.map((dir) => (
          <button
            key={dir.id}
            onClick={() => onSelect(dir.id)}
            className={`
              relative p-6 rounded-2xl border bg-lumora-800/50 backdrop-blur-sm 
              transition-all duration-300 hover:scale-[1.02] hover:bg-lumora-800
              flex flex-col items-start justify-between min-h-[160px] text-left group
              ${dir.color}
            `}
          >
            <div className="flex justify-between w-full mb-4">
               <span className="text-2xl">{dir.icon}</span>
               <span className="text-xs font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                 CMD_ID: {dir.id}
               </span>
            </div>
            
            <div>
              <div className="text-xs font-bold tracking-wider uppercase opacity-70 mb-1">
                {dir.subtitle}
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {dir.title}
              </div>
              <div className="text-sm text-gray-400 font-light">
                "{dir.question}"
              </div>
            </div>

            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-white">
              →
            </div>
          </button>
        ))}

      </div>
    </div>
  );
};

export default Directives;
