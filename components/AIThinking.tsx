
import React, { useState, useEffect, useMemo } from 'react';

interface AIThinkingProps {
  message: string;
  imageSrc?: string;
}

export const AIThinking: React.FC<AIThinkingProps> = ({ message, imageSrc }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let requestRef: number;
    const animate = (time: number) => {
      setFrame(time);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, []);

  const scanLinePos = ((frame * 0.015) % 100);

  return (
    <div 
      className="fixed inset-0 z-[200] flex flex-col bg-white font-sans overflow-hidden select-none animate-fade-in"
      role="status"
      aria-live="polite"
    >
      
      <div className="relative h-[65vh] w-full flex items-center justify-center" aria-hidden="true">
        
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
          
          <div className="absolute inset-0 bg-black/[0.01] blur-3xl rounded-full scale-110"></div>
          
          <div className="relative w-full h-full bg-white rounded-[3.5rem] border border-gray-100 shadow-[0_12px_48px_rgba(0,0,0,0.02)] overflow-hidden flex items-center justify-center">
            
            {imageSrc ? (
              <img 
                src={imageSrc} 
                className="w-full h-full object-cover opacity-30 grayscale brightness-110 contrast-[0.85] transition-opacity duration-1000"
                alt=""
              />
            ) : (
              <div className="w-1/2 h-1/2 bg-gray-50 rounded-3xl animate-pulse"></div>
            )}

            <div className="absolute inset-0 opacity-[0.03]" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle, #000 1.2px, transparent 1.2px)', 
                   backgroundSize: '32px 32px' 
                 }}>
            </div>

            <div 
              className="absolute left-0 right-0 h-[1.5px] z-20 pointer-events-none transition-opacity duration-700"
              style={{ 
                top: `${scanLinePos}%`,
                opacity: scanLinePos > 98 || scanLinePos < 2 ? 0 : 1 
              }}
            >
              <div className="w-full h-full bg-[#4285F4]/40"></div>
              <div className="absolute top-0 left-0 right-0 h-12 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#4285F4]/05 to-transparent"></div>
              
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#4285F4]/60 rounded-full blur-[0.5px]"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#4285F4]/60 rounded-full blur-[0.5px]"></div>
            </div>

            <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-gray-100/50 rounded-tl-lg"></div>
            <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-gray-100/50 rounded-tr-lg"></div>
            <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-gray-100/50 rounded-bl-lg"></div>
            <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-gray-100/50 rounded-br-lg"></div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-start pt-4 px-12 text-center">
        
        <div className="mb-12">
          <h2 className="text-4xl md:text-[2.5rem] font-display font-medium text-[#1F1F1F] tracking-tight leading-tight opacity-90">
            {message}
          </h2>
        </div>

        <div className="flex gap-5 items-center" aria-hidden="true">
          {[
            { hex: '#4285F4' },
            { hex: '#EA4335' },
            { hex: '#FBBC04' },
            { hex: '#34A853' }
          ].map((color, i) => (
            <div 
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: color.hex,
                animation: `googleStep 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                animationDelay: `${i * 0.12}s`
              }}
            ></div>
          ))}
        </div>

        <div className="mt-auto pb-16 flex flex-col items-center gap-4" aria-hidden="true">
           <div className="h-px w-12 bg-gray-100"></div>
           <span className="text-[9px] font-mono font-bold tracking-[0.5em] text-[#C4C7C5] uppercase">
              Building your plan
           </span>
        </div>
      </div>

      <style>{`
        @keyframes googleStep {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-10px); opacity: 1; }
          60% { transform: translateY(-7px); opacity: 1; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>

    </div>
  );
};
