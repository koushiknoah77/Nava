
import React, { useState, useEffect, useRef } from 'react';
import { GuideData } from '../types';
import { X, Check, ArrowRight, ArrowLeft, Camera, Sparkles, Loader2, Volume2, StopCircle, Youtube, ExternalLink, Mic, ArrowUp, Globe } from 'lucide-react';
import { verifyStepCompletion, askStepQuestion, translateContent } from '../services/geminiService';

interface GuideSystemProps {
  data: GuideData;
  originalImage: string;
  onClose: () => void;
  onImprove: () => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English', voiceCode: 'en-US' },
    { code: 'es', name: 'Español', voiceCode: 'es-ES' },
    { code: 'fr', name: 'Français', voiceCode: 'fr-FR' },
    { code: 'de', name: 'Deutsch', voiceCode: 'de-DE' },
    { code: 'zh', name: '中文', voiceCode: 'zh-CN' },
    { code: 'ja', name: '日本語', voiceCode: 'ja-JP' },
];

export const GuideSystem: React.FC<GuideSystemProps> = ({ data, originalImage, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Multilingual State
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [translatedStep, setTranslatedStep] = useState<{title: string, instruction: string}>({ title: '', instruction: '' });
  const [isTranslating, setIsTranslating] = useState(false);

  // Verification State
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{success: boolean, feedback: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assistant State
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const step = data.steps[currentStepIndex];

  // Translation Effect
  useEffect(() => {
    const updateContent = async () => {
        if (language.code === 'en') {
            setTranslatedStep({ title: step.title, instruction: step.instruction });
            return;
        }

        setIsTranslating(true);
        try {
            const [tTitle, tDesc] = await Promise.all([
                translateContent(step.title, language.name),
                translateContent(step.instruction, language.name)
            ]);
            setTranslatedStep({ title: tTitle, instruction: tDesc });
        } catch (e) {
            console.error("Translation failed", e);
            setTranslatedStep({ title: step.title, instruction: step.instruction });
        } finally {
            setIsTranslating(false);
        }
    };
    updateContent();
  }, [currentStepIndex, language, step]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Stop speaking when step changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    resetState();
  }, [currentStepIndex]);

  // Auto-advance on successful verification
  useEffect(() => {
    let timer: number;
    if (verificationResult?.success) {
        timer = window.setTimeout(() => {
            handleNext();
        }, 2000); // 2 second delay to read feedback
    }
    return () => {
        if (timer) clearTimeout(timer);
    };
  }, [verificationResult]);

  const toggleSpeech = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = `${translatedStep.title}. ${translatedStep.instruction}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = language.voiceCode;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleNext = () => {
    window.speechSynthesis.cancel();
    if (currentStepIndex === data.steps.length - 1) {
      setCompleted(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const resetState = () => {
      setVerificationImage(null);
      setVerificationResult(null);
      setUserQuery('');
      setAiResponse('');
  };

  const handleVerificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
            setVerificationImage(e.target.result as string);
            runVerification(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runVerification = async (img: string) => {
      setVerifying(true);
      try {
          const result = await verifyStepCompletion(step.title, step.instruction, img);
          setVerificationResult(result);
      } catch (err) {
          setVerificationResult({ success: false, feedback: "Error connecting to AI auditor." });
      } finally {
          setVerifying(false);
      }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language.voiceCode;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserQuery(transcript);
        };
        recognition.start();
    } else {
        alert("Voice input is not supported in this browser.");
    }
  };

  const handleAskAI = async () => {
      if (!userQuery.trim()) return;
      setIsProcessingQuery(true);
      try {
          const questionWithLangContext = `${userQuery} (Please answer in ${language.name})`;
          const response = await askStepQuestion(data.projectName, step.title, step.instruction, questionWithLangContext);
          setAiResponse(response);
      } catch (err) {
          setAiResponse("I couldn't get an answer right now. Please try again.");
      } finally {
          setIsProcessingQuery(false);
      }
  };

  const openVideo = () => {
     const query = encodeURIComponent(`${step.youtubeQuery}`);
     window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  if (completed) {
      return (
          <div className="fixed inset-0 bg-white flex flex-col items-center justify-center text-center p-8 animate-fade-in font-sans z-[200]" role="alert" aria-live="assertive">
              <div className="w-24 h-24 bg-[#E6F4EA] rounded-full flex items-center justify-center text-[#34A853] mb-8 animate-slide-up shadow-sm">
                  <Check size={48} strokeWidth={4} aria-hidden="true" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-medium text-[#1F1F1F] mb-6 tracking-tight">Well done!</h1>
              <p className="text-[#444746] mb-12 text-xl max-w-md">You have finished the guide for "{data.projectName}".</p>
              <button 
                onClick={onClose} 
                className="bg-[#0B57D0] text-white px-10 py-4 rounded-full font-medium hover:bg-[#0842A0] shadow-md transition-all text-lg active:scale-95"
                autoFocus
              >
                  Finish session
              </button>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-[#F0F4F9] text-[#1F1F1F] flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <div className="h-16 px-6 bg-white border-b border-[#E3E3E3] z-20 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
              <button 
                onClick={onClose} 
                aria-label="Close Guide"
                className="p-2 -ml-2 text-[#444746] hover:bg-[#F0F4F9] rounded-full transition-colors"
              >
                  <X size={24} />
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#5E5E5E] uppercase tracking-wider">Project</span>
                <span className="text-sm font-bold text-[#1F1F1F] tracking-tight line-clamp-1 max-w-[150px] md:max-w-xs">{data.projectName}</span>
              </div>
          </div>

          <div className="flex items-center gap-2">
               {/* Progress Indicator */}
               <div className="hidden md:flex items-center gap-1 mr-4" aria-hidden="true">
                   {data.steps.map((_, idx) => (
                      <div key={idx} className={`h-1.5 w-8 rounded-full transition-all ${idx <= currentStepIndex ? 'bg-[#1A73E8]' : 'bg-[#E3E3E3]'}`}></div>
                   ))}
               </div>

               {/* Language Selector */}
               <div className="relative group">
                   <button aria-haspopup="true" aria-label="Select Language" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F4F9] hover:bg-[#E3E3E3] text-sm font-medium transition-colors">
                       <Globe size={16} aria-hidden="true" />
                       <span className="uppercase">{language.code}</span>
                   </button>
                   <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-[#E3E3E3] p-1 hidden group-hover:block animate-fade-in z-50">
                       {LANGUAGES.map(lang => (
                           <button 
                             key={lang.code}
                             onClick={() => setLanguage(lang)}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm ${language.code === lang.code ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'hover:bg-[#F0F4F9]'}`}
                           >
                               {lang.name}
                           </button>
                       ))}
                   </div>
               </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Left Panel: Instructions */}
          <div className="flex-1 relative bg-white lg:border-r border-[#E3E3E3] overflow-hidden flex flex-col">
              
              <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 scroll-smooth">
                  <div className="max-w-xl mx-auto w-full animate-fade-in">
                      <div className="flex items-center justify-between mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E8F0FE] text-[#0B57D0] text-[10px] font-bold uppercase tracking-[0.2em]">
                            <Sparkles size={12} aria-hidden="true" /> Step {currentStepIndex + 1}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {speechSupported && (
                              <button 
                                onClick={toggleSpeech}
                                aria-label={isSpeaking ? "Stop speaking" : "Read step instructions aloud"}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${isSpeaking ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]' : 'bg-white text-[#5E5E5E] border-[#E3E3E3] hover:bg-[#F8F9FA]'}`}
                              >
                                  {isSpeaking ? <StopCircle size={16} className="animate-pulse" /> : <Volume2 size={16} />}
                                  {isSpeaking ? 'Stop' : 'Listen'}
                              </button>
                          )}
                        </div>
                      </div>

                      <div className="min-h-[200px]" aria-live="assertive">
                        {isTranslating ? (
                            <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
                                <div className="h-12 bg-gray-100 rounded-lg w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-3xl md:text-5xl font-display font-medium mb-8 text-[#1F1F1F] leading-[1.1] tracking-tighter">
                                    {translatedStep.title}
                                </h2>
                                <p className="text-xl md:text-2xl text-[#444746] leading-relaxed font-light mb-10">
                                    {translatedStep.instruction}
                                </p>
                            </>
                        )}
                      </div>

                      <button 
                          onClick={openVideo}
                          className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-[#FF0000]/5 border border-[#FF0000]/10 text-[#CC0000] hover:bg-[#FF0000]/10 transition-colors group mb-8"
                      >
                          <div className="flex items-center gap-3">
                            <Youtube size={24} aria-hidden="true" />
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-bold">Watch Video Tutorial</span>
                                <span className="text-[10px] opacity-70 uppercase tracking-wider">Opens YouTube Search</span>
                            </div>
                          </div>
                          <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      </button>
                      
                      {/* Chat History Area (Inline) */}
                      {aiResponse && (
                          <div aria-live="polite" className="mb-6 bg-[#F0F4F9] p-5 rounded-2xl rounded-tl-none text-base text-[#1F1F1F] leading-relaxed animate-fade-in border border-[#E3E3E3] shadow-sm">
                               <div className="flex items-center gap-2 mb-2 text-[#1A73E8] text-xs font-bold uppercase tracking-widest">
                                  <Sparkles size={12} aria-hidden="true" /> Assistant
                               </div>
                               {aiResponse}
                          </div>
                      )}
                  </div>
              </div>

              {/* Floating AI Input (Centered Bottom of Left Panel) */}
              <div className="absolute bottom-6 left-6 right-6 md:left-12 md:right-12 z-10 flex justify-center pointer-events-none">
                  <div className="w-full max-w-xl pointer-events-auto shadow-2xl rounded-full">
                       <div className="relative group">
                          <input 
                              aria-label="Ask a question about this step"
                              className="w-full bg-white/90 backdrop-blur-xl border border-[#E3E3E3] rounded-full pl-6 pr-28 py-4 text-base focus:outline-none focus:border-[#1A73E8] focus:ring-4 focus:ring-[#1A73E8]/10 transition-all shadow-lg placeholder:text-[#BDC1C6] group-hover:bg-white"
                              placeholder={language.code === 'en' ? "Ask about this step..." : "Ask a question..."}
                              value={userQuery}
                              onChange={(e) => setUserQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                          />
                          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                              <button 
                                  onClick={handleVoiceInput}
                                  aria-label={isListening ? "Listening..." : "Use Voice Input"}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-[#EA4335] text-white animate-pulse' : 'hover:bg-[#F1F3F4] text-[#5E5E5E]'}`}
                                  title="Voice Input"
                              >
                                  <Mic size={20} />
                              </button>
                              <button 
                                  onClick={handleAskAI}
                                  disabled={!userQuery.trim() || isProcessingQuery}
                                  aria-label="Send Question"
                                  className="w-10 h-10 bg-[#1A73E8] text-white rounded-full flex items-center justify-center hover:bg-[#1557B0] disabled:opacity-50 disabled:hover:bg-[#1A73E8] transition-colors"
                              >
                                  {isProcessingQuery ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={22} />}
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Panel: Verification */}
          <div className="flex-1 bg-[#F8F9FA] p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px] border-t lg:border-t-0 lg:border-l border-[#E3E3E3]">
             <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-[#E3E3E3] flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#BDC1C6] uppercase tracking-[0.5em]">Verify Work</span>
                    {verificationResult && (
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                          verificationResult.success ? 'bg-[#E6F4EA] text-[#137333] border-[#137333]/10' : 'bg-[#FCE8E6] text-[#C5221F] border-[#C5221F]/10'
                        }`}>
                            {verificationResult.success ? 'Verified' : 'Notice'}
                        </div>
                    )}
                </div>

                {!verificationImage ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-video rounded-[2rem] border-2 border-dashed border-[#E3E3E3] flex flex-col items-center justify-center gap-4 group hover:border-[#1A73E8] hover:bg-[#E8F0FE]/30 transition-all cursor-pointer"
                      aria-label="Take verification photo"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#F8F9FA] border border-[#E3E3E3] flex items-center justify-center group-hover:scale-110 transition-all shadow-sm" aria-hidden="true">
                          <Camera size={28} className="text-[#1A73E8]" />
                        </div>
                        <div className="text-center px-4">
                            <span className="block text-base font-bold text-[#1F1F1F]">Take photo check</span>
                            <span className="block text-[10px] text-[#5E5E5E] uppercase tracking-widest opacity-60 mt-1">AI confirms you did it right</span>
                        </div>
                    </button>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-[#E3E3E3] shadow-inner bg-[#F1F3F4]">
                            <img src={verificationImage} className="w-full h-full object-cover" alt="Verification proof" />
                            {verifying && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center flex-col gap-3" role="status" aria-label="Analyzing photo">
                                    <Loader2 className="animate-spin text-[#1A73E8]" size={32}/> 
                                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#1A73E8]">Analyzing...</span>
                                </div>
                            )}
                            <button 
                              onClick={() => { setVerificationImage(null); setVerificationResult(null); }}
                              aria-label="Clear photo"
                              className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70"
                            >
                               <X size={14} />
                            </button>
                        </div>
                        
                        {verificationResult && !verifying && (
                            <div role="status" className={`p-6 rounded-2xl border animate-fade-in ${verificationResult.success ? 'bg-[#E6F4EA] border-[#137333]/10' : 'bg-[#FCE8E6] border-[#C5221F]/10'}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${verificationResult.success ? 'bg-[#137333]/10 text-[#137333]' : 'bg-[#C5221F]/10 text-[#C5221F]'}`} aria-hidden="true">
                                      {verificationResult.success ? <Check size={16} strokeWidth={3}/> : <X size={16} strokeWidth={3}/>}
                                    </div>
                                    <div>
                                        <p className="text-base font-medium leading-relaxed text-[#1F1F1F] py-0.5">
                                            "{verificationResult.feedback}"
                                        </p>
                                        {verificationResult.success && (
                                            <p className="text-xs font-bold uppercase tracking-wider text-[#137333] mt-2 animate-pulse">
                                                Moving to next step...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
             
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8F0FE]/40 rounded-full blur-[100px] -z-0 pointer-events-none" aria-hidden="true"></div>
          </div>
      </div>

      {/* Floating Navigation Buttons */}
      <div className="fixed bottom-8 right-8 z-[100] flex gap-4">
          <button 
            onClick={() => setCurrentStepIndex(prev => prev - 1)}
            disabled={currentStepIndex === 0}
            aria-label="Previous Step"
            className="w-14 h-14 bg-white rounded-full shadow-lg border border-[#E3E3E3] flex items-center justify-center text-[#444746] hover:bg-[#F0F4F9] disabled:opacity-0 disabled:pointer-events-none transition-all active:scale-90"
          >
              <ArrowLeft size={24} />
          </button>

          <button 
             onClick={handleNext}
             aria-label={currentStepIndex === data.steps.length - 1 ? "Finish Guide" : "Next Step"}
             className={`h-14 pl-8 pr-6 rounded-full font-bold text-lg flex items-center gap-4 transition-all active:scale-95 shadow-2xl ${
                 verificationResult?.success || verificationImage
                 ? 'bg-[#1A73E8] text-white shadow-[#1A73E8]/30'
                 : 'bg-[#1F1F1F] text-white' 
             }`}
          >
              {currentStepIndex === data.steps.length - 1 ? 'Finish' : 'Next Step'} 
              <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
                <ArrowRight size={20} aria-hidden="true" />
              </div>
          </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleVerificationUpload} />
    </div>
  );
};
