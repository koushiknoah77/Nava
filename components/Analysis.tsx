import React, { useEffect, useState } from 'react';

const Analysis: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  
  const messages = [
    "Establishing neural link...",
    "Uploading visual data...",
    "Gemini Core V3.0 online...",
    "Segmenting objects...",
    "Running safety heuristics...",
    "Compiling insights...",
  ];

  useEffect(() => {
    let delay = 0;
    messages.forEach((msg, index) => {
      delay += Math.random() * 500 + 400;
      setTimeout(() => {
        setLog(prev => [...prev, msg]);
      }, delay);
    });
  }, []);

  return (
    <div className="min-h-screen bg-lumora-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lumora-900 via-lumora-950 to-black"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Loading Spinner / Graphic */}
        <div className="flex justify-center mb-12">
          <div className="relative w-24 h-24">
             <div className="absolute inset-0 border-t-2 border-lumora-500 rounded-full animate-spin"></div>
             <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">
          Processing Reality
        </h2>
        <p className="text-center text-gray-500 mb-8 font-light">
          The AI is reasoning about the structure and context.
        </p>

        {/* Terminal Log */}
        <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 border border-white/10 h-48 overflow-hidden flex flex-col justify-end shadow-2xl">
          {log.map((line, i) => (
             <div key={i} className="mb-1">
               <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
               {line}
             </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;