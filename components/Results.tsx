
import React from 'react';
import { AnalysisResult, AppState } from '../types';

interface ResultsProps {
  result: AnalysisResult;
  onReset: () => void;
  imageSrc: string;
}

const Results: React.FC<ResultsProps> = ({ result, onReset, imageSrc }) => {
  return (
    <div className="min-h-screen bg-lumora-950 text-white pb-12">
      {/* Top Image Banner */}
      <div className="relative h-64 w-full overflow-hidden">
        <img 
          src={imageSrc} 
          alt="Analyzed Object" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lumora-950 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
           <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-1 bg-lumora-500/20 text-lumora-400 text-xs font-mono uppercase tracking-wider border border-lumora-500/30 rounded">
               Object Detected
             </span>
             {result.safetyRating === 'DANGER' && (
               <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-mono uppercase tracking-wider border border-red-500/30 rounded animate-pulse">
                 CAUTION
               </span>
             )}
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
             {result.detectedObject}
           </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Context Card */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-gray-400 text-sm uppercase tracking-widest font-mono mb-3">Situation Analysis</h3>
              <p className="text-lg leading-relaxed text-gray-200">
                {result.context}
              </p>
            </div>

            {/* Advice Card */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-lumora-500">
              <h3 className="text-lumora-400 text-sm uppercase tracking-widest font-mono mb-4">AI Guidance</h3>
              <p className="text-xl leading-relaxed text-white font-light">
                {result.advice}
              </p>
            </div>

             {/* Steps (if any) */}
             {result.steps && result.steps.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl">
                 <h3 className="text-gray-400 text-sm uppercase tracking-widest font-mono mb-4">Action Plan</h3>
                 <ul className="space-y-4">
                   {result.steps.map((step, idx) => (
                     <li key={idx} className="flex gap-4 items-start">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lumora-800 border border-white/20 flex items-center justify-center text-xs font-mono text-lumora-400">
                         {idx + 1}
                       </span>
                       <span className="text-gray-300">{step}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            )}

          </div>

          {/* Sidebar / Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-mono mb-4">System Actions</h3>
              <button 
                onClick={onReset}
                className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <span>New Scan</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
              <button 
                className="w-full py-3 bg-transparent border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors text-sm font-mono"
                onClick={() => alert("Saved to Vault (Demo)")}
              >
                Save to Vault
              </button>
            </div>

            {/* Stats / Metadata */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500 text-xs font-mono">CONFIDENCE</span>
                <span className="text-green-400 text-xs font-mono">98.4%</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-500 text-xs font-mono">MODEL</span>
                <span className="text-lumora-400 text-xs font-mono">GEMINI-3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs font-mono">LATENCY</span>
                <span className="text-gray-400 text-xs font-mono">1.2s</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;
