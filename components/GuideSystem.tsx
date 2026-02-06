
import React, { useState, useEffect, useRef } from 'react';
import { GuideData } from '../types';
import { X, Check, ArrowRight, ArrowLeft, Camera, Sparkles, Youtube, ExternalLink, Globe, Mic, Video, Zap, Volume2, StopCircle } from 'lucide-react';
import { verifyStepCompletion, translateContent } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { useToast } from './Toast';

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

// Helpers for Live API
const createBlob = (data: Float32Array): { data: string, mimeType: string } => {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return {
    data: b64,
    mimeType: 'audio/pcm;rate=16000',
  };
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const GuideSystem: React.FC<GuideSystemProps> = ({ data, originalImage, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { showToast } = useToast();

  // Multilingual State
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [translatedStep, setTranslatedStep] = useState<{title: string, instruction: string}>({ title: '', instruction: '' });
  const [isTranslating, setIsTranslating] = useState(false);

  // Verification State
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{success: boolean, feedback: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // Refs for Live API cleanup
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const frameIntervalRef = useRef<number | null>(null);

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

  // Cleanup Live API on unmount or step change
  useEffect(() => {
    return () => {
       stopLiveSession();
    };
  }, []);

  // Live API Functions
  const stopLiveSession = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (sessionRef.current) {
        sessionRef.current = null;
    }
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
    }
    setLiveStatus('disconnected');
    setIsLiveActive(false);
  };

  const startLiveSession = async () => {
    if (liveStatus === 'connected' || liveStatus === 'connecting') {
        stopLiveSession();
        return;
    }

    setLiveStatus('connecting');
    showToast('Connecting to Gemini Live...', 'info');

    try {
        // 1. Setup Media Stream (Audio + Video)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setVideoStream(stream);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        // 2. Setup Audio Contexts
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        inputAudioContextRef.current = inputAudioContext;
        outputAudioContextRef.current = outputAudioContext;

        const inputNode = inputAudioContext.createGain();
        const outputNode = outputAudioContext.createGain();
        const outputSourceNodeRef = { nextStartTime: 0 };
        outputNode.connect(outputAudioContext.destination);

        // 3. Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // System instruction to guide the AI
        const sysInstruction = `You are a helpful, kind building assistant.
        Current Project: "${data.projectName}".
        Current Step: "${step.title}".
        Instruction: "${step.instruction}".
        
        YOUR GOAL: Watch the video feed and help the user.
        RULES:
        1. Speak in SHORT, SIMPLE sentences. Easy English.
        2. Be encouraging (e.g. "That looks great!", "Try moving it to the left").
        3. Avoid complex words.
        4. If they finish the step, say "Good job" and wait.`;

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: sysInstruction,
            },
            callbacks: {
                onopen: () => {
                    setLiveStatus('connected');
                    showToast('Live Assistant Connected', 'success');
                    
                    // Start Audio Input Stream
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);

                    // Start Video Stream (Screenshots)
                    const canvas = canvasRef.current;
                    const video = videoRef.current;
                    if (canvas && video) {
                        frameIntervalRef.current = window.setInterval(async () => {
                             if (video.readyState === 4) {
                                 canvas.width = video.videoWidth * 0.5; // Scale down for performance
                                 canvas.height = video.videoHeight * 0.5;
                                 const ctx = canvas.getContext('2d');
                                 if (ctx) {
                                     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                     const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                                     sessionPromise.then(session => session.sendRealtimeInput({
                                         media: { mimeType: 'image/jpeg', data: base64 }
                                     }));
                                 }
                             }
                        }, 1000); // 1 FPS for vision is usually sufficient for guidance
                    }
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        outputSourceNodeRef.nextStartTime = Math.max(outputSourceNodeRef.nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            outputAudioContext,
                            24000,
                            1
                        );
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.start(outputSourceNodeRef.nextStartTime);
                        outputSourceNodeRef.nextStartTime += audioBuffer.duration;
                    }
                },
                onclose: () => {
                    setLiveStatus('disconnected');
                    setIsLiveActive(false);
                },
                onerror: (e) => {
                    console.error("Live API Error", e);
                    showToast('Connection interrupted', 'error');
                    stopLiveSession();
                }
            }
        });
        
        sessionRef.current = sessionPromise;
        setIsLiveActive(true);

    } catch (err) {
        console.error("Failed to start live session", err);
        showToast('Could not access camera/microphone', 'error');
        setLiveStatus('disconnected');
    }
  };

  const handleNext = () => {
    stopLiveSession(); // Disconnect when moving steps
    if (currentStepIndex === data.steps.length - 1) {
      setCompleted(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
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
          if (result.success) {
              showToast('Step Verified!', 'success');
              setTimeout(() => handleNext(), 2000);
          }
      } catch (err) {
          setVerificationResult({ success: false, feedback: "Error connecting to AI auditor." });
          showToast('Verification failed', 'error');
      } finally {
          setVerifying(false);
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
               {/* Live Assistant Toggle */}
               <button 
                 onClick={startLiveSession}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${isLiveActive ? 'bg-[#FCE8E6] text-[#C5221F] border border-[#C5221F]/20 animate-pulse' : 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC]'}`}
               >
                   {isLiveActive ? <Zap size={16} fill="currentColor"/> : <Video size={16} />}
                   {isLiveActive ? 'Live Active' : 'Live Help'}
               </button>

               <div className="h-6 w-px bg-[#E3E3E3] mx-2"></div>

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
                      
                  </div>
              </div>
          </div>

          {/* Right Panel: Verification / Live Feed */}
          <div className="flex-1 bg-[#F8F9FA] p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px] border-t lg:border-t-0 lg:border-l border-[#E3E3E3]">
             <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-[#E3E3E3] flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#BDC1C6] uppercase tracking-[0.5em]">{isLiveActive ? "Live Vision" : "Verify Work"}</span>
                    {isLiveActive && (
                        <div className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div> Live
                        </div>
                    )}
                </div>

                {isLiveActive ? (
                     <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-[#E3E3E3] shadow-inner">
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                         <canvas ref={canvasRef} className="hidden" />
                         <div className="absolute bottom-4 left-0 right-0 text-center">
                             <span className="px-4 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-medium">Listening... just speak</span>
                         </div>
                     </div>
                ) : (
                    !verificationImage ? (
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
                                        <div className="animate-spin text-[#1A73E8]"><Sparkles size={32} /></div>
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
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
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
