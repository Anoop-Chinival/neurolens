// Alredy Updated
import { useState } from 'react';
import { MessageSquare, Loader2, BarChart3, Binary, X, Cpu } from 'lucide-react';
import { localAiService } from '../services/localAiService';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ErrorMessage from './ErrorMessage.tsx';

export default function SentimentAnalyzer() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setEngineSource(null);
    setError(null);

    try {
      const data = await localAiService.analyzeSentiment(text);
      console.log("ROUTER_RESPONSE:", data);
      
      if (data.analysis) {
        setResult(data.analysis);
        setEngineSource(data.engine_source || "External Cluster Node");
      } else if (data.raw) {
        setResult(data.raw);
        setEngineSource("Raw Fallback Stream");
      } else {
        setResult("Error: Unreadable telemetry streaming from network node.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Inference route handshake failed. Check local router server.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setText('');
    setResult(null);
    setEngineSource(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium tracking-tight">NeuroLens Deep Semantic Analysis</h2>
        {(text || result || error) && (
          <button 
            onClick={clear} 
            className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors technical-border text-xs"
          >
            <X size={14} /> RESET
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="technical-border bg-white/40 p-4">
            <div className="flex items-center gap-2 mb-2 opacity-50">
              <Binary size={14} />
              <span className="mono-data">INPUT_BUFFER</span>
            </div>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Paste long-form text here for deep linguistic processing..." 
              className="w-full h-80 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed" 
            />
          </div>
          {error && <ErrorMessage message={error} onRetry={analyzeSentiment} />}
          <button 
            disabled={!text.trim() || loading} 
            onClick={analyzeSentiment} 
            className="w-full py-4 flex items-center justify-center gap-2 bg-dash-ink text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 className="animate-spin" /> : <BarChart3 size={20} />}
            <span className="font-medium tracking-widest text-sm">PROCESS_SEMANTICS</span>
          </button>
        </div>

        <div className="technical-border bg-white/40 p-4 sm:p-6 min-h-[400px] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-dash-line pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span className="mono-data">SEMANTIC_DECODER_RES</span>
            </div>
            {engineSource && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-dash-ink/5 border border-dash-line rounded text-[10px] uppercase font-bold text-dash-ink/70">
                <Cpu size={10} />
                <span>Active Core: {engineSource}</span>
              </div>
            )}
          </div>
          <div className="prose prose-sm max-w-none flex-1 overflow-y-auto font-mono text-[13px] leading-relaxed pr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="result">
                  <Markdown remarkPlugins={[remarkGfm]}>{result}</Markdown>
                </motion.div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <Loader2 className="animate-spin h-8 w-8 opacity-20" />
                  <p className="animate-pulse text-[10px] uppercase font-bold opacity-40 tracking-widest">Compiling Deep Text Matrix...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-20 py-20">
                  <Binary size={48} />
                  <p className="mt-4 uppercase text-[10px] tracking-widest font-bold">Awaiting Stream Tensors</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}