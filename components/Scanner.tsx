
import React, { useRef, useEffect, useState } from 'react';
import { X, Zap, ZapOff, Image as ImageIcon, Scan, Target } from 'lucide-react';

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
  
  // Minimal HUD State
  const [isScanning, setIsScanning] = useState(true);

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
      
      const MAX_SIZE = 1024;
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
          onCapture(canvas.toDataURL('image/jpeg', 0.8));
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans text-white overflow-hidden select-none">
      
      {/* Video Layer */}
      <div className="absolute inset-0 z-0 bg-black">
        {!error ? (
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
              <span className="text-xs uppercase tracking-widest">Camera Signal Lost</span>
              <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider">
                 Manual Upload
              </button>
           </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Clean Overlay */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start pointer-events-auto">
              <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md hover:bg-white hover:text-black transition-colors">
                  <X size={20} />
              </button>
              <div className="flex gap-4">
                  {!error && (
                      <button onClick={() => setFlash(!flash)} className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md transition-colors ${flash ? 'bg-white text-black' : 'bg-black/20 text-white'}`}>
                          {flash ? <Zap size={16} fill="currentColor"/> : <ZapOff size={16}/>}
                      </button>
                  )}
              </div>
          </div>

          {/* Center Focus */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/20 rounded-lg flex items-center justify-center opacity-50">
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              {isScanning && (
                  <div className="absolute inset-0 border-t border-white/50 animate-[scanFast_2s_linear_infinite] opacity-50"></div>
              )}
          </div>

          {/* Bottom Bar */}
          <div className="flex justify-center items-center gap-12 pointer-events-auto pb-12">
               <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                   Upload
               </button>

               <button 
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/10 transition-colors"
               >
                   <div className="w-16 h-16 bg-white rounded-full"></div>
               </button>

               <div className="text-xs font-bold uppercase tracking-widest text-white/50">
                   Auto
               </div>
          </div>
      </div>
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
