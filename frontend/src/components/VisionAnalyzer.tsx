// Already updated
import React, { useState, useRef } from 'react';
import { Upload, Scan, X, Loader2, Sparkles, Cpu } from 'lucide-react';
import { localAiService } from '../services/localAiService';
import { fileToBase64, cn } from '../lib/utils.ts';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import ErrorMessage from './ErrorMessage.tsx';

export default function VisionAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        setError("FILE_SIZE_EXCEEDS_LIMIT (MAX 20MB)");
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setEngineSource(null);
    setError(null);

    try {
      const base64Full = await fileToBase64(file);
      
      if (!base64Full || !base64Full.includes(',')) {
        throw new Error("IMAGE_CONVERSION_FAILED");
      }

      // Backend expects the full data URI string or raw base64 handled gracefully by proxy
      console.log("Routing payload to backend framework...");
      const data = await localAiService.analyzeVision(base64Full);
      
      if (data.error) {
        throw new Error(data.details || data.error);
      }

      if (data.description) {
        setResult(data.description);
        setEngineSource(data.engine_source || "Google AI Studio (Gemini Flash)");
      } else {
        throw new Error("EMPTY_RESPONSE_STREAM");
      }
    } catch (err: any) {
      console.error("Frontend Debug:", err);
      let userMsg = err.message || "Failed to synchronize with neural API.";
      
      if (err?.message?.includes('API_KEY_INVALID')) {
        userMsg = "Neural authentication failure. Check system credentials.";
      } else if (err?.message?.includes('SAFETY')) {
        userMsg = "Content rejected by safety screening filters.";
      } else if (err?.message?.includes('quota')) {
        userMsg = "Compute quota exceeded. Try again later.";
      } else if (err?.message?.includes('network')) {
        userMsg = "Network link unstable. Check uplink connectivity.";
      }
      
      setError(userMsg);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setEngineSource(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">Vision Intelligence</h2>
        <div className="flex gap-2">
          {(file || result || error) && (
            <button 
              onClick={clear}
              className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors technical-border text-xs"
            >
              <X size={14} /> RESET
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            onClick={() => !file && fileInputRef.current?.click()}
            className={cn(
              "relative aspect-video flex flex-col items-center justify-center technical-border transition-all group overflow-hidden cursor-pointer",
              !file ? "bg-white/30 border-dashed hover:bg-white/50" : "bg-black"
            )}
          >
            {preview ? (
              <>
                <img src={preview} alt="Upload preview" className="w-full h-full object-contain" />
                {loading && <div className="scanline" />}
              </>
            ) : (
              <div className="text-center space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Upload className="mx-auto" size={32} />
                <p className="mono-data">UPLOAD_RASTER_DATA (PNG/JPG)</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {error && <ErrorMessage message={error} onRetry={analyzeImage} />}

          <button
            disabled={!file || loading}
            onClick={analyzeImage}
            className="w-full py-4 flex items-center justify-center gap-2 bg-dash-ink text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Scan size={20} />}
            <span className="font-medium tracking-widest text-sm">INITIATE_ANALYSIS</span>
          </button>
        </div>

        <div className="technical-border bg-white/40 p-4 sm:p-6 min-h-[300px] lg:min-h-[400px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-dash-line pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span className="mono-data">VISION_MATRIX_LOG</span>
            </div>
            {engineSource && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-dash-ink/5 border border-dash-line rounded text-[10px] uppercase font-bold text-dash-ink/70">
                <Cpu size={10} />
                <span>Core: {engineSource}</span>
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed pr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="result"
                >
                  <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key="loading"
                  className="flex flex-col items-center justify-center h-full space-y-4 py-20"
                >
                  <Loader2 className="animate-spin h-8 w-8 opacity-20" />
                  <p className="animate-pulse tracking-[0.2em] text-[10px] uppercase font-bold opacity-40">
                    Routing Multi-Tier Matrix...
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                  <Scan size={48} />
                  <p className="mt-4 uppercase text-[10px] tracking-widest font-bold">Waiting for stream</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}