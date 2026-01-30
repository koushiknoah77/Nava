
import React, { useRef, useState, useEffect } from 'react';
import { X, Plus, Monitor, Zap, Database, Cpu, Activity, ArrowRight, Edit3, Sparkles } from 'lucide-react';
import { generateSuggestions } from '../services/geminiService';

interface IntentSelectionProps {
  objectName: string;
  imageSrc: string; 
  onAnalyze: (command: string, referenceImg?: string) => void;
  onBack: () => void;
}

export const IntentSelection: React.FC<IntentSelectionProps> = ({ objectName: initialName, imageSrc, onAnalyze, onBack }) => {
  const [command, setCommand] = useState('');
  const [objectName, setObjectName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
            const suggestions = await generateSuggestions(objectName, imageSrc, referenceImg || undefined);
            if (mounted) setAiSuggestions(suggestions.slice(0, 4));
        } catch (e) {
            console.error("Suggestions error", e);
        } finally {
            if (mounted) setLoadingSuggestions(false);
        }
    };
    fetchSuggestions();
    return () => { mounted = false; };
  }, [objectName, referenceImg, imageSrc]);

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
            setReferenceImg(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isCommandValid = command.trim().length > 3;

  return (
    <div className="flex flex-col h-screen bg-[#F0F4F9] text-[#1F1F1F] font-sans overflow-hidden selection:bg-[#D3E3FD]">
       
       {/* Glass Header */}
       <header className="h-16 px-6 shrink-0 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-[#E3E3E3] z-50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#1F1F1F] rounded-full flex items-center justify-center text-white shadow-sm" aria-hidden="true">
                <Cpu size={16} strokeWidth={2.5} />
             </div>
             <span className="text-[10px] font-bold text-[#5E5E5E] tracking-[0.2em] leading-none uppercase">Context Analysis</span>
          </div>

          <button 
             onClick={onBack} 
             aria-label="Back to Camera"
             className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full text-[#5E5E5E] transition-all active:scale-90 border border-transparent hover:border-[#E3E3E3]"
          >
             <X size={20} />
          </button>
       </header>

       <main className="flex-1 overflow-y-auto pb-48 scroll-smooth relative">
          <div className="fixed inset-0 bg-noise opacity-30 pointer-events-none" aria-hidden="true"></div>
          
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-col gap-12 relative z-10">
              
              <div className="flex flex-col gap-4 animate-fade-up">
                 <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-[#1F1F1F]">What are we building?</h1>
                 <div className="flex items-center gap-3 text-[#5E5E5E]">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Detected Object:</span>
                    {isEditingName ? (
                        <input 
                            aria-label="Edit Object Name"
                            value={objectName} 
                            onChange={e => setObjectName(e.target.value)}
                            className="bg-transparent border-b-2 border-[#1A73E8] px-1 py-0 text-sm font-bold text-[#1A73E8] outline-none uppercase tracking-widest"
                            onBlur={() => setIsEditingName(false)}
                            onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                            autoFocus
                        />
                    ) : (
                        <button 
                            onClick={() => setIsEditingName(true)} 
                            aria-label={`Edit detected name: ${objectName}`}
                            className="flex items-center gap-2 group"
                        >
                            <span className="text-sm font-bold text-[#1A73E8] uppercase tracking-widest border-b border-dashed border-[#1A73E8]/40 group-hover:border-[#1A73E8] transition-colors">{objectName}</span>
                            <Edit3 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1A73E8]" />
                        </button>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Context Card */}
                  <div className="bg-white rounded-[2.5rem] p-3 shadow-lg border border-[#E3E3E3] hover:shadow-xl transition-all duration-500 group animate-fade-up" style={{ animationDelay: '0.1s' }}>
                      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-[#F8F9FA]">
                          <img src={imageSrc} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Captured context" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0" aria-hidden="true">
                             <div className="glass-dark px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                Source
                             </div>
                          </div>
                      </div>
                  </div>

                  {/* Reference Card */}
                  <div className="bg-white rounded-[2.5rem] p-3 shadow-lg border border-[#E3E3E3] hover:shadow-xl transition-all duration-500 group animate-fade-up" style={{ animationDelay: '0.2s' }}>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        aria-label={referenceImg ? "Remove Reference Image" : "Add Reference Goal Image"}
                        className={`w-full h-full relative aspect-[4/3] rounded-[2rem] overflow-hidden transition-all cursor-pointer flex flex-col items-center justify-center ${
                            referenceImg ? 'bg-white' : 'bg-[#F8F9FA] hover:bg-[#F1F3F4] border-2 border-dashed border-[#E3E3E3] hover:border-[#1A73E8]'
                        }`}
                      >
                         {!referenceImg ? (
                            <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 mx-auto text-[#BDC1C6] group-hover:text-[#1A73E8] transition-colors" aria-hidden="true">
                                   <Plus size={28} />
                                </div>
                                <span className="text-sm font-bold text-[#5E5E5E] uppercase tracking-widest">Add Reference Goal</span>
                            </div>
                         ) : (
                            <>
                                <img src={referenceImg} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Reference goal" />
                                <div 
                                     onClick={(e) => { e.stopPropagation(); setReferenceImg(null); }}
                                     className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                                     aria-label="Remove image"
                                >
                                      <X size={18} />
                                </div>
                            </>
                         )}
                      </button>
                  </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3">
                     <Sparkles size={16} className="text-[#FBBC04]" aria-hidden="true" />
                     <span className="text-xs font-bold text-[#5E5E5E] uppercase tracking-widest">AI Suggestions</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-live="polite">
                      {loadingSuggestions ? (
                          [1,2,3,4].map(i => <div key={i} className="h-24 bg-white/50 border border-[#E3E3E3] rounded-3xl animate-pulse" aria-hidden="true"></div>)
                      ) : (
                          aiSuggestions.map((s, i) => (
                              <button 
                                key={i}
                                role="listitem"
                                onClick={() => setCommand(s)}
                                className={`p-6 rounded-[2rem] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                                    command === s 
                                    ? 'bg-[#1F1F1F] text-white shadow-xl' 
                                    : 'bg-white border border-[#E3E3E3] text-[#5E5E5E] hover:border-[#1A73E8]/30'
                                }`}
                              >
                                 <span className="text-sm font-bold leading-relaxed">{s}</span>
                              </button>
                          ))
                      )}
                  </div>
              </div>

          </div>
       </main>

       {/* Floating Command Bar */}
       <div className="fixed bottom-10 left-0 right-0 z-[100] px-6 pointer-events-none flex justify-center">
          <div className="max-w-3xl w-full pointer-events-auto">
              <div className="bg-white/80 backdrop-blur-2xl border border-white/60 p-2.5 rounded-full shadow-premium flex items-center gap-4 transition-all duration-300 focus-within:scale-[1.02] focus-within:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                 <div className="w-12 h-12 bg-[#F1F3F4] rounded-full flex items-center justify-center shrink-0 text-[#1F1F1F]" aria-hidden="true">
                    <Monitor size={20} />
                 </div>
                 <input 
                    aria-label="Describe your goal"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Describe your goal..."
                    className="bg-transparent border-none focus:ring-0 text-lg font-medium w-full placeholder:text-[#BDC1C6] outline-none text-[#1F1F1F] px-2"
                    onKeyDown={(e) => e.key === 'Enter' && isCommandValid && onAnalyze(command, referenceImg || undefined)}
                 />
                 <button 
                    onClick={() => isCommandValid && onAnalyze(command, referenceImg || undefined)}
                    disabled={!isCommandValid}
                    aria-label="Generate Plan"
                    className={`h-12 px-8 rounded-full font-bold text-sm transition-all duration-300 shrink-0 ${
                      isCommandValid 
                      ? 'bg-[#1F1F1F] text-white shadow-lg hover:bg-black hover:scale-105' 
                      : 'bg-[#F1F3F4] text-[#BDC1C6] cursor-not-allowed'
                    }`}
                 >
                    Generate Plan
                 </button>
              </div>
          </div>
       </div>

       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleReferenceUpload} />
    </div>
  );
};
