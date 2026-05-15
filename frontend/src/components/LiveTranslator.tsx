//Already updated
import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Languages, Loader2, Sparkles, AlertTriangle, Cpu } from 'lucide-react';
import { localAiService } from '../services/localAiService';
import { cn } from '../lib/utils.ts';
import { motion, AnimatePresence } from 'motion/react';
import ErrorMessage from './ErrorMessage.tsx';

interface Detection {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  original_text: string;
  translated_text: string;
}

export default function LiveTranslator() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [frozenImage, setFrozenImage] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const processingIdRef = useRef(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const resetFrame = () => {
    processingIdRef.current += 1;
    setIsLocked(false);
    setFrozenImage(null);
    setEngineSource(null);
    setDetections([]);
    setError(null);
    setLoading(false);
    setIsProcessing(false);
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        if (settings.width && settings.height) {
          setAspectRatio(settings.width / settings.height);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("CAMERA_ACCESS_DENIED or NOT_FOUND. Ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const captureAndTranslate = async (manualLock = false) => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    
    setIsProcessing(true);
    setLoading(true);
    setError(null);
    setEngineSource(null);
    const currentId = processingIdRef.current;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth || 800; 
      canvas.height = video.videoHeight || 450;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]; 

      if (manualLock) {
        setFrozenImage(`data:image/jpeg;base64,${base64}`);
        setIsLocked(true);
      }

      // FIX: Yahan end mein 'as any' jod diya hai taaki TypeScript chill kare
      const data = await localAiService.translateAR(base64) as any;
      
      if (currentId !== processingIdRef.current) return;
      
      if (data && data.detections) {
        setDetections(data.detections as Detection[]);
        setEngineSource(data.engine_source || "Google AI Studio (OCR)");
      } else if (Array.isArray(data)) {
        setDetections(data as Detection[]);
      } else {
        throw new Error("INVALID_DETECTION_STREAM");
      }
    } catch (err: any) {
      console.error("Inference failure:", err);
      setError("TRANSLATION_FAILED: Ensure camera view is clear and text is visible.");
      if (manualLock) {
        setIsLocked(false);
        setFrozenImage(null);
      }
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">AR Live Translation</h2>
        <div className="flex gap-2">
           <button 
             onClick={resetFrame}
             className="px-4 py-2 flex items-center gap-2 hover:bg-dash-ink hover:text-dash-bg transition-colors technical-border mono-data text-xs"
           >
             <RefreshCw size={14} /> 
             RESET_FRAME
           </button>
        </div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto overflow-hidden technical-border bg-black group aspect-video" 
           style={{ aspectRatio: aspectRatio }}>
        {/* Video or Frozen Image */}
        {isLocked && frozenImage ? (
          <img src={frozenImage} className="w-full h-full object-cover" alt="Captured frame" />
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover grayscale-[0.2]"
          />
        )}

        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-dash-bg/20" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-black/60 text-dash-bg px-3 py-1.5 mono-data text-[10px] backdrop-blur-md">
            <div className={cn("w-2 h-2 rounded-full", isStreaming ? (isLocked ? "bg-blue-500" : "bg-green-500 animate-pulse") : "bg-red-500")} />
            MODE: {isLocked ? "FRAME_LOCKED" : (isStreaming ? "PROCESSING_READY" : "OFFLINE")}
          </div>
          {engineSource && (
            <div className="flex items-center gap-1.5 bg-dash-ink text-white px-3 py-1 mono-data text-[9px] font-bold tracking-wider rounded-sm shadow-md">
              <Cpu size={10} />
              CORE: {engineSource}
            </div>
          )}
          {loading && (
            <div className="bg-yellow-500 text-black px-3 py-1 mono-data text-[9px] font-bold animate-pulse">
              NEURAL_INFERENCE_IN_PROGRESS
            </div>
          )}
        </div>

        {/* Corner Brackets */}
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-dash-bg/40" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-dash-bg/40" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-dash-bg/40" />

        {/* Translation Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {detections.map((det, idx) => {
              const [ymin, xmin, ymax, xmax] = det.box_2d;
              const width = (xmax - xmin) / 10;
              const height = (ymax - ymin) / 10;
              
              const charCount = det.translated_text.length;
              const baseSize = Math.min(height * 0.8, width / (charCount * 0.4));
              const fontSize = Math.max(8, Math.min(24, baseSize));

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute border border-yellow-400 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-0.5 overflow-hidden shadow-2xl rounded-sm"
                  style={{
                    top: `${ymin / 10}%`,
                    left: `${xmin / 10}%`,
                    height: `${height}%`,
                    width: `${width}%`,
                    zIndex: 10 + idx
                  }}
                >
                  <span 
                    className="text-yellow-400 font-bold leading-tight text-center uppercase break-words w-full"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {det.translated_text}
                  </span>
                  {height > 15 && (
                    <span className="text-white/60 text-[8px] font-mono whitespace-nowrap mt-0.5 truncate max-w-full">
                      {det.original_text}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Scanning Line */}
        {loading && <div className="scanline" />}

        {/* Capture/Lock Button Overlay */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-auto">
          {!isLocked ? (
            <button
              disabled={!isStreaming || loading}
              onClick={() => captureAndTranslate(true)}
              className="group relative flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 bg-dash-bg/20 blur-xl group-hover:bg-dash-bg/40 transition-all rounded-full" />
              <div className="relative w-16 h-16 rounded-full border-4 border-dash-bg flex items-center justify-center transition-all group-active:scale-95 bg-black/20">
                <div className={cn(
                  "w-12 h-12 rounded-full border-2 border-dash-bg transition-all flex items-center justify-center",
                  loading ? "animate-pulse bg-yellow-500" : "bg-dash-bg/20"
                )}>
                  {loading ? <Loader2 className="animate-spin text-black" /> : <Languages size={24} className="text-dash-bg" />}
                </div>
              </div>
              <span className="mono-data text-[10px] mt-2 bg-black/60 px-2 py-0.5 text-dash-bg font-bold animate-pulse">
                LOCK FRAME & TRANSLATE
              </span>
            </button>
          ) : (
            <button
              onClick={resetFrame}
              className="group relative flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-all rounded-full" />
              <div className="relative w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center transition-all group-active:scale-95 bg-blue-500/10">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                  <RefreshCw className="text-white" size={24} />
                </div>
              </div>
              <span className="mono-data text-[10px] mt-2 bg-blue-500 text-white px-2 py-0.5 font-bold">
                UNLOCK & RESET
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {error && <ErrorMessage message={error} onRetry={startCamera} />}
        
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="technical-border p-4 bg-white/40">
             <div className="flex items-center gap-2 mb-2 opacity-50">
               <Camera size={14} />
               <span className="mono-data">CAPTURE_MODE</span>
             </div>
             <p className="text-xs font-medium leading-relaxed">Neural stream identifies Kannada glyphs and renders AR translation overlays in real-time space.</p>
          </div>

          <div className="technical-border p-4 bg-white/40">
             <div className="flex items-center gap-2 mb-2 opacity-50">
               <Sparkles size={14} />
               <span className="mono-data">MODEL_CONFIDENCE</span>
             </div>
             <p className="text-xs font-medium leading-relaxed">Multi-tier fallback layers secure continuous OCR updates even when primary API limits exhaust.</p>
          </div>

          <div className="technical-border p-4 bg-white/40">
             <div className="flex items-center gap-2 mb-2 opacity-50">
               <AlertTriangle size={14} />
               <span className="mono-data">LATENCY_NOTICE</span>
             </div>
             <p className="text-xs font-medium leading-relaxed">Processing takes ~1-3s via hyper-fast cloud providers. Dynamic tags indicate the operating node source.</p>
          </div>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}