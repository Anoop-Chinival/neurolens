//Already Updated
import { AlertCircle, RefreshCcw, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-red-500/5 border border-red-500/30 flex flex-col gap-4 font-mono shadow-sm"
    >
      <div className="flex items-start gap-3 text-red-500">
        <AlertCircle size={18} className="shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between gap-2 border-b border-red-500/20 pb-1.5">
            <p className="text-[11px] font-bold tracking-widest uppercase">PIPELINE_ROUTING_CRASH</p>
            <div className="flex items-center gap-1 opacity-40 text-[9px]">
              <Terminal size={10} />
              <span>STATUS: 500</span>
            </div>
          </div>
          <p className="text-[12px] font-medium leading-relaxed uppercase tracking-wide text-red-400/90 break-words">
            {message || "ALL ROUTING CORES EXHAUSTED. HANDSHAKE TIMEOUT."}
          </p>
        </div>
      </div>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white transition-all px-3 py-2 w-fit rounded-sm active:scale-95"
        >
          <RefreshCcw size={11} className="animate-spin-slow" />
          RE_ENGAGE_CLUSTER_PIPELINE
        </button>
      )}
    </motion.div>
  );
}