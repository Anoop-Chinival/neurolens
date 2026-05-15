//Already Updated
import { useState } from 'react';
import { LayoutDashboard, Target, MessageSquare, Menu, X, BrainCircuit } from 'lucide-react';
import { cn } from './lib/utils.ts';
import MLExplorer from './components/MLExplorer.tsx';
import VisionAnalyzer from './components/VisionAnalyzer.tsx';
import SentimentAnalyzer from './components/SentimentAnalyzer.tsx';
import LiveTranslator from './components/LiveTranslator.tsx';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'vision' | 'sentiment' | 'translate';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'vision', label: 'VISION_API', icon: Target },
    { id: 'sentiment', label: 'SENTIMENT_AI', icon: MessageSquare },
    { id: 'translate', label: 'AR_TRANSLATE', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-dash-bg selection:bg-dash-ink selection:text-dash-bg overflow-x-hidden">
      {/* Mobile Nav */}
      <div className="lg:hidden p-4 flex items-center justify-between border-b border-dash-line bg-dash-bg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrainCircuit size={24} />
          <div>
            <h1 className="font-bold tracking-[0.2em] leading-none">NEUROLENS</h1>
            <p className="text-[8px] tracking-[0.1em] opacity-40 font-bold mt-0.5">BY ANOOP CHINIVAL</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-dash-ink/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <nav className={cn(
        "fixed inset-y-0 left-0 z-40 lg:relative lg:block bg-dash-bg border-r border-dash-line transition-transform duration-300 w-72 p-6 flex flex-col shrink-0 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden lg:flex items-center gap-2 mb-12">
          <BrainCircuit size={28} />
          <div>
            <h1 className="font-bold tracking-[0.2em] text-lg leading-none">NEUROLENS</h1>
            <p className="text-[9px] tracking-[0.1em] opacity-40 font-bold mt-1">BY ANOOP CHINIVAL</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="mono-data opacity-30 text-[10px] mb-4 font-bold tracking-widest">MODULE_SELECT</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 font-medium transition-all group",
                activeTab === item.id 
                  ? "bg-dash-ink text-dash-bg" 
                  : "hover:bg-dash-ink/5"
              )}
            >
              <item.icon size={18} />
              <span className="text-xs tracking-[0.15em]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Updated Architecture Metadata Info */}
        <div className="mt-auto pt-6 border-t border-dash-line opacity-40 space-y-0.5">
          <p className="mono-data text-[10px]">BUILD_ID: 2605.16.OS</p>
          <p className="mono-data text-[10px]">ENGINE: HYBRID_CLOUD_ROUTER</p>
        </div>
      </nav>

      {/* Content Main Panel */}
      <main className="flex-1 p-4 sm:p-6 lg:p-12 overflow-y-auto w-full max-w-full">
        <header className="mb-8 lg:mb-12 border-b border-dash-line pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="mono-data opacity-50 uppercase tracking-widest text-[10px] mb-1">SYSTEM_STATUS: CLUSTER_NOMINAL</p>
            <h2 className="text-3xl sm:text-4xl font-serif italic tracking-tight text-dash-ink">
              {activeTab === 'dashboard' && "Inference Metrics"}
              {activeTab === 'vision' && "Computer Vision"}
              {activeTab === 'sentiment' && "Natural Language"}
              {activeTab === 'translate' && "Augmented Reality"} {/* FIXED: Title was blank on selection */}
            </h2>
          </div>
          <div className="text-left sm:text-right">
             <p className="mono-data text-[10px] opacity-40">LOC: BGLR-MATRIX-01</p>
             <p className="mono-data text-[10px] opacity-40">TIME: {new Date().toLocaleTimeString()}</p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <MLExplorer />}
            {activeTab === 'vision' && <VisionAnalyzer />}
            {activeTab === 'sentiment' && <SentimentAnalyzer />}
            {activeTab === 'translate' && <LiveTranslator />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}