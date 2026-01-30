
import React, { useRef, useEffect, useState } from 'react';
import { X, Zap, ZapOff, Image as ImageIcon, Camera, Target, Aperture, Cpu, Layers, Activity, Scan, Grid } from 'lucide-react';

interface CameraScanProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

export const CameraScan: React.FC<CameraScanProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            if (mounted) setError("NO_MEDIA_DEVICES");
            return;
        }
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
            });
            if (mounted) {
                setStream(localStream);
                if (videoRef.current) videoRef.current.srcObject = localStream;
                setError('');
            }
        } catch (err) {
            if (mounted) setError("ACCESS_DENIED");
        }
    };
    initCamera();
    return () => {
        mounted = false;
        if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0) return;
      
      const MAX_SIZE = 1440;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          onCapture(canvas.toDataURL('image/jpeg', 0.9));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => e.target?.result && onCapture(e.target.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans select-none overflow-hidden text-white">
      
      {/* Invisible Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite">
          {error ? "Camera access denied." : "Camera ready. Point at an object and press Capture."}
          {flash ? "Flash enabled." : "Flash disabled."}
      </div>

      {/* Video Feed */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {!error ? (
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transition-all duration-1000 scale-105" />
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-white/40 gap-6">
              <div className="w-20 h-20 rounded-3xl border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl">
                <Camera size={32} strokeWidth={1} />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Camera Unavailable</span>
           </div>
        )}
      </div>
      
      {/* AR Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" aria-hidden="true">
         <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
      </div>
      
      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-10">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start pointer-events-auto">
             <button 
                onClick={onCancel} 
                aria-label="Close Camera"
                className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group"
             >
                <X size={24} className="group-hover:scale-90 transition-transform" />
             </button>
             
             <div className="flex gap-3">
                {!error && (
                    <button 
                        onClick={() => setFlash(!flash)} 
                        aria-label={flash ? "Turn Flash Off" : "Turn Flash On"}
                        className={`w-14 h-14 rounded-full backdrop-blur-3xl border border-white/10 flex items-center justify-center transition-all ${flash ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-white/10'}`}
                    >
                        {flash ? <Zap size={22} fill="currentColor"/> : <ZapOff size={22}/>}
                    </button>
                )}
                <div className="px-6 h-14 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center gap-4" role="status" aria-label="System Ready">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-white tracking-[0.2em] leading-none">SYSTEM.READY</span>
                        <div className="flex items-center gap-1 mt-1">
                             <div className="w-1 h-1 bg-[#34A853] rounded-full animate-pulse"></div>
                             <span className="text-[8px] font-mono text-white/60 uppercase">Live Feed</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Central Reticle */}
          <div className="relative flex items-center justify-center h-full" aria-hidden="true">
            {!error && (
                <div className="relative w-72 h-72 md:w-96 md:h-96 border border-white/20 rounded-[2rem] flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white"></div>
                    
                    {/* Scanning Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-white/50 animate-scan"></div>
                </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-center gap-8 md:gap-16 pointer-events-auto pb-8">
             
             <button 
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload existing photo"
                className="group flex flex-col items-center gap-3"
             >
                <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-3xl border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    <ImageIcon size={22} />
                </div>
             </button>

             <div className="relative flex items-center justify-center">
                <button 
                    onClick={handleCapture}
                    aria-label="Capture Photo"
                    className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center group active:scale-95 transition-all duration-300 relative"
                >
                    <div className="absolute inset-0 rounded-full border border-white/60 animate-[pulse_2s_infinite]" aria-hidden="true"></div>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-90 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                        <div className="w-16 h-16 rounded-full border-[2px] border-[#1A73E8]/10"></div>
                    </div>
                </button>
             </div>

             <div className="flex flex-col items-center gap-3 opacity-60 group hover:opacity-100 transition-all cursor-pointer">
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white bg-black/20" aria-hidden="true">
                    <Grid size={22} />
                </div>
             </div>

          </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
