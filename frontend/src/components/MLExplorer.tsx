// Alredy Updated
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, ShieldCheck, Layers, Award } from 'lucide-react';
import { cn } from '../lib/utils.ts'; // FIX: Missing import jodd diya hai!

// Upgraded to track NeuroLens Telemetry Load over evaluation cycles
const routerLatencyData = [
  { cycle: 'Cycle 1', GroqCloud: 180, GeminiFlash: 240, HFBackup: 1200 },
  { cycle: 'Cycle 2', GroqCloud: 195, GeminiFlash: 220, HFBackup: 1450 },
  { cycle: 'Cycle 3', GroqCloud: 170, GeminiFlash: 260, HFBackup: 1100 },
  { cycle: 'Cycle 4', GroqCloud: 210, GeminiFlash: 210, HFBackup: 1350 },
  { cycle: 'Cycle 5', GroqCloud: 160, GeminiFlash: 230, HFBackup: 1250 },
];

// Upgraded to show the processing load handled by actual NeuroLens modules
const moduleLoadDistribution = [
  { name: 'Linguistic Engine', requests: 740, efficiency: 0.99 },
  { name: 'Vision Diagnostics', requests: 520, efficiency: 0.96 },
  { name: 'AR Kannada OCR', requests: 310, efficiency: 0.92 },
  { name: 'Failover Routers', requests: 140, efficiency: 1.00 },
];

export default function MLExplorer() {
  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: ACTUAL METRIC CLUSTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Pipeline Range', value: '1B - 70B', icon: Layers },
          { label: 'Network Failover Tiers', value: '3 Active', icon: ShieldCheck },
          { label: 'Avg Cloud Latency', value: '240ms', icon: Activity },
          { label: 'API Resource Cost', value: '₹0.00 (Free)', icon: Award },
        ].map((stat, i) => (
          <div key={i} className="technical-border p-4 bg-white/40 flex items-start justify-between">
            <div>
              <p className="mono-data opacity-50 uppercase text-[11px]">{stat.label}</p>
              <h3 className="text-2xl font-mono mt-1 font-bold text-dash-ink">{stat.value}</h3>
            </div>
            <stat.icon size={18} className="opacity-40 text-dash-ink" />
          </div>
        ))}
      </div>

      {/* SECTION 2: GRAPHICAL PIPELINE ANALYSIS */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* CHART A: NETWORK LATENCY STREAM */}
        <div className="technical-border p-6 bg-white/40">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-8 border-b border-dash-line/10 pb-4">
            <h3 className="font-medium flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-dash-ink rounded-full shrink-0 animate-pulse" />
              CLOUD_ROUTER_LATENCY_LOG (ms)
            </h3>
            <span className="mono-data bg-dash-ink text-white px-2 py-0.5 text-[10px]">REALTIME POOL</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={routerLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14141410" />
                <XAxis dataKey="cycle" stroke="#141414" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#141414" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#141414', border: 'none', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '11px' }} 
                  itemStyle={{ color: '#E4E3E0' }}
                />
                <Area type="monotone" dataKey="GroqCloud" stackId="1" stroke="#141414" fill="#14141430" strokeWidth={2} name="Groq Core" />
                <Area type="monotone" dataKey="GeminiFlash" stackId="2" stroke="#5d5d5d" fill="#14141410" strokeWidth={1.5} name="Gemini Node" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 mono-data opacity-40 text-[10px]">FIG A.1: Cloud server telemetry response latencies across execution pipelines.</p>
        </div>

        {/* CHART B: MODULE METADATA MAP */}
        <div className="technical-border p-6 bg-white/40">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-8 border-b border-dash-line/10 pb-4">
            <h3 className="font-medium flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-dash-ink rounded-full shrink-0" />
              MODULE_LOAD_BALANCER_MAP
            </h3>
            <span className="mono-data bg-dash-ink text-white px-2 py-0.5 text-[10px]">SYSTEM TOTAL LOAD</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleLoadDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#14141410" vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#141414" fontSize={10} tickLine={false} axisLine={false} width={130} />
                <Tooltip 
                   contentStyle={{ background: '#141414', border: 'none', color: '#E4E3E0', fontFamily: 'monospace', fontSize: '11px' }} 
                   itemStyle={{ color: '#E4E3E0' }}
                />
                <Bar dataKey="requests" fill="#141414" radius={[0, 4, 4, 0]} name="Inference Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 mono-data opacity-40 text-[10px]">FIG B.4: Metric resource load handled by distinct NeuroLens engine components.</p>
        </div>
      </div>
      
      {/* SECTION 3: MULTI-TIER ROUTER REAL-TIME STATUS TICKER */}
      <div className="technical-border p-6 bg-dash-ink text-white">
        <h3 className="mono-data mb-4 opacity-60 text-xs tracking-wider">NEUROLENS_FAILOVER_STATUS_TICKER</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-2 opacity-90">
          {[
            'GROQ_CORE_70B: ACTIVE', 
            'GEMINI_FLASH_NODE: STANDBY', 
            'OPENROUTER_POOL: READY', 
            'HF_SPACE_MIRROR: STANDBY',
            'ROUTER_CORS: COMPLIANT', 
            'ZERO_COST_TIERS: TRUE', 
            'FAILOVER_REDUNDANCY: MAX', 
            'PORT_TUNNELING: CONFIGURED'
          ].map((log, i) => (
             <div key={i} className="flex items-center gap-2 font-mono text-[10px] tracking-wide">
               <span className={cn(
                 "w-1.5 h-1.5 rounded-full animate-pulse",
                 log.includes('ACTIVE') || log.includes('TRUE') || log.includes('MAX') || log.includes('READY') || log.includes('COMPLIANT') || log.includes('CONFIGURED') ? "bg-green-400" : "bg-blue-400"
               )} />
               {log}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}