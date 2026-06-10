import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Settings, 
  Image, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Layout, 
  Palette,
  AlertCircle
} from 'lucide-react';
import { MatchPack, Player } from '../types';
import { exportToPDF, exportToWord, exportToExcel } from '../lib/export';

interface ReportModule {
  id: string;
  name: string;
  category: 'Overview' | 'Team' | 'Player' | 'Discipline';
  enabled: boolean;
  notes: string;
}

const Badge = ({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'success' | 'warning' | 'secondary' | 'outline' }) => {
  const variants = {
    primary: 'bg-primary text-white',
    success: 'bg-green-500/20 text-green-500 border border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
    secondary: 'bg-white/10 text-white border border-white/20',
    outline: 'bg-transparent text-muted border border-white/10'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function ReportBuilder({ 
  pack, 
  allPlayers,
  onPdfExport
}: { 
  pack: MatchPack; 
  allPlayers: Player[];
  onPdfExport?: (enabledTabIds: string[]) => Promise<void>;
}) {
  const [branding, setBranding] = useState<'rpl' | 'opta' | 'cricviz' | 'clean'>('opta');
  const [layout, setLayout] = useState<'portrait' | 'landscape'>('portrait');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [analystName, setAnalystName] = useState('Senior Rugby Analyst');
  const [executiveSummary, setExecutiveSummary] = useState(
    'Season 1 showcased a high-octane offensive environment where the Hyderabad Heroes dominated standard scoring while the Chennai Bulls leveraged elite wings and offload play. Turnovers and yellow cards highlighted disciplinary margins.'
  );
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [modules, setModules] = useState<ReportModule[]>([
    { id: 'overview', name: 'Season Overview (KPI Summary & Standings)', category: 'Overview', enabled: true, notes: 'Central indicators and overall points standings.' },
    { id: 'trends', name: 'Trends & Insights (Squad Strategy Radars)', category: 'Overview', enabled: true, notes: 'Dynamic squad capabilities and historical radar comparisons.' },
    { id: 'teams', name: 'Team Performance Statistics', category: 'Team', enabled: true, notes: 'Detailed scrum, lineout, and conversion details.' },
    { id: 'players', name: 'Player Profiles & Statistical Leaderboards', category: 'Player', enabled: true, notes: 'Leading point scorers and top tries comparison.' },
    { id: 'matches', name: 'Interactive Match Momentum Timeline', category: 'Overview', enabled: true, notes: 'Critical matches and team momentum swing stats.' },
    { id: 'milestones', name: 'Upcoming Milestones & Projections', category: 'Overview', enabled: true, notes: 'Target markers and future metric predictions.' },
    { id: 'comparison', name: 'Player Battle & Discipline Section', category: 'Discipline', enabled: true, notes: 'Match-up comparisons and legal yellow/red card lists.' },
    { id: 'media', name: 'Media Studio Visualizations', category: 'Overview', enabled: false, notes: 'Broadcast social layouts and preview templates.' },
    { id: 'admin', name: 'Central Admin Panel Settings', category: 'Overview', enabled: false, notes: 'Match pack metadata controls.' }
  ]);

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= modules.length) return;
    const newModules = [...modules];
    const temp = newModules[index];
    newModules[index] = newModules[nextIndex];
    newModules[nextIndex] = temp;
    setModules(newModules);
  };

  const updateNotes = (id: string, text: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, notes: text } : m));
  };

  const loadPreset = (type: 'broadcast' | 'coaching' | 'discipline') => {
    if (type === 'broadcast') {
      setModules(prev => prev.map(m => ({
        ...m,
        enabled: ['overview', 'trends', 'players', 'media'].includes(m.id)
      })));
      setBranding('cricviz');
    } else if (type === 'coaching') {
      setModules(prev => prev.map(m => ({
        ...m,
        enabled: ['trends', 'teams', 'players', 'comparison'].includes(m.id)
      })));
      setBranding('opta');
    } else if (type === 'discipline') {
      setModules(prev => prev.map(m => ({
        ...m,
        enabled: ['overview', 'comparison'].includes(m.id)
      })));
      setBranding('rpl');
    }
  };

  const handleCustomLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runBuild = async (format: 'pdf' | 'docx' | 'xlsx') => {
    setIsExporting(format);
    setSuccessMsg(null);

    try {
      const activeTabs = modules.filter(m => m.enabled).map(m => m.id);
      
      if (format === 'xlsx') {
        await new Promise(r => setTimeout(r, 1000));
        await exportToExcel(pack, allPlayers);
      } else if (format === 'docx') {
        await new Promise(r => setTimeout(r, 1000));
        await exportToWord(pack, allPlayers);
      } else {
        if (onPdfExport) {
          await onPdfExport(activeTabs);
        } else {
          await new Promise(r => setTimeout(r, 1200));
          const captured: Record<string, string> = {};
          await exportToPDF(pack, captured);
        }
      }
      setSuccessMsg(`Report generated successfully in ${format.toUpperCase()} format.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Column - Report Preferences */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Settings className="text-primary" size={20} />
            <div>
              <h3 className="font-bold text-base">Report Settings</h3>
              <p className="text-xs text-muted">Branding and output presets</p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Operational Presets</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => loadPreset('broadcast')}
                className="px-2 py-2 rounded-lg bg-card-bg-light border border-border hover:border-primary text-[10px] font-bold tracking-tight uppercase"
              >
                Media Pack
              </button>
              <button 
                onClick={() => loadPreset('coaching')}
                className="px-2 py-2 rounded-lg bg-card-bg-light border border-border hover:border-primary text-[10px] font-bold tracking-tight uppercase"
              >
                Coaches Brief
              </button>
              <button 
                onClick={() => loadPreset('discipline')}
                className="px-2 py-2 rounded-lg bg-card-bg-light border border-border hover:border-primary text-[10px] font-bold tracking-tight uppercase"
              >
                Discipline Summary
              </button>
            </div>
          </div>

          {/* Theme & Branding */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Visual Branding Profile</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'opta', label: 'KADAMBA (Dark)', desc: 'Slate-black focus' },
                { id: 'cricviz', label: 'Analytics Report', desc: 'Saffron accents' },
                { id: 'rpl', label: 'Official RPL', desc: 'Crimson-red motif' },
                { id: 'clean', label: 'Clean Print', desc: 'Eco-conscious minimal' }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setBranding(b.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${branding === b.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border-hover'}`}
                >
                  <p className="text-[11px] font-bold">{b.label}</p>
                  <p className="text-[9px] text-muted">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Page Layout Settings */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted font-bold uppercase text-[10px] tracking-wider">Orientation</span>
              <div className="flex bg-card-bg-light p-0.5 rounded-lg border border-border">
                <button 
                  onClick={() => setLayout('portrait')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${layout === 'portrait' ? 'bg-primary text-white' : 'text-muted'}`}
                >
                  Portrait
                </button>
                <button 
                  onClick={() => setLayout('landscape')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${layout === 'landscape' ? 'bg-primary text-white' : 'text-muted'}`}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted font-bold uppercase text-[10px] tracking-wider">Include Page Numbers</span>
              <input 
                type="checkbox" 
                checked={includePageNumbers}
                onChange={() => setIncludePageNumbers(!includePageNumbers)}
                className="w-4 h-4 rounded border-border text-primary accent-primary" 
              />
            </div>
          </div>
        </div>

        {/* Global Metadata Inputs */}
        <div className="bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Analyst Attribution</label>
            <input 
              type="text" 
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              className="w-full bg-card-bg-light border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Executive Summary Narrative</label>
            <textarea 
              rows={4}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              className="w-full bg-card-bg-light border border-border rounded-lg p-3 text-xs focus:border-primary outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Center/Right Dynamic Modules Order & Details */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Module checklist and reordering */}
        <div className="bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Layout className="text-primary" size={20} />
              <div>
                <h3 className="font-bold text-base">Select & Order Report Modules</h3>
                <p className="text-xs text-muted">Drag & drop or use controls to sort the final document output structure</p>
              </div>
            </div>
          </div>

          {/* Module List */}
          <div className="space-y-3">
            {modules.map((m, idx) => (
              <motion.div 
                key={m.id}
                layoutId={m.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all ${m.enabled ? 'bg-card-bg-light border-border' : 'opacity-40 bg-secondary/20 border-transparent'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => toggleModule(m.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${m.enabled ? 'bg-primary border-primary text-white' : 'border-muted'}`}
                  >
                    {m.enabled && <Check size={12} />}
                  </button>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{m.name}</span>
                      <span className="text-[9px] uppercase font-bold bg-muted/10 border border-border/20 text-muted px-1.5 py-0.5 rounded">
                        {m.category}
                      </span>
                    </div>
                    {m.enabled ? (
                      <input 
                        type="text"
                        value={m.notes}
                        onChange={(e) => updateNotes(m.id, e.target.value)}
                        placeholder="Add professional analyst footnote..."
                        className="w-full bg-transparent border-b border-border/40 focus:border-primary placeholder:text-muted/50 text-[11px] pb-1 font-medium outline-none text-muted"
                      />
                    ) : (
                      <p className="text-[10px] text-muted">Disabled — excluded from final build</p>
                    )}
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-1 self-end md:self-auto border-t md:border-t-0 p-2 md:p-0 border-border">
                  <button 
                    onClick={() => moveModule(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 hover:bg-white/5 disabled:opacity-20 rounded text-muted transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveModule(idx, 'down')}
                    disabled={idx === modules.length - 1}
                    className="p-1.5 hover:bg-white/5 disabled:opacity-20 rounded text-muted transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Compile and Download buttons */}
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary">
              <AlertCircle size={16} className="shrink-0" />
              <span>Universal report compiles with high-DPI canvas charts and embedded analytical vector sheets.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button 
                onClick={() => runBuild('pdf')}
                disabled={!!isExporting || modules.every(m => !m.enabled)}
                className="w-full bg-primary hover:bg-red-700 disabled:bg-dim py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs text-white flex items-center justify-center gap-2"
              >
                {isExporting === 'pdf' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText size={15} />
                    Export PDF Manual
                  </>
                )}
              </button>

              <button 
                onClick={() => runBuild('docx')}
                disabled={!!isExporting}
                className="w-full bg-card-bg-light border border-border hover:border-primary hover:text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs text-muted flex items-center justify-center gap-2 transition-all"
              >
                {isExporting === 'docx' ? (
                  <div className="w-5 h-5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText size={15} />
                    Download MS Word (.docx)
                  </>
                )}
              </button>

              <button 
                onClick={() => runBuild('xlsx')}
                disabled={!!isExporting}
                className="w-full bg-card-bg-light border border-border hover:border-primary hover:text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs text-muted flex items-center justify-center gap-2 transition-all"
              >
                {isExporting === 'xlsx' ? (
                  <div className="w-5 h-5 border-2 border-muted/30 border-t-muted rounded-full animate-spin" />
                ) : (
                  <>
                    <Download size={15} />
                    Download MS Excel (.xlsx)
                  </>
                )}
              </button>
            </div>

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-500 text-center font-bold"
              >
                {successMsg}
              </motion.div>
            )}
          </div>
        </div>

        {/* Live Interactive Report Preview Sheet */}
        <div className="bg-card-bg border border-border rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="p-4 bg-muted/5 border-b border-border flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Live Document Simulator (A4 Preview)</span>
            <Badge variant="success">Standard Print Scale Ready</Badge>
          </div>

          <div className="p-8 md:p-12 space-y-8 bg-black/40 text-left min-h-[440px] text-zinc-100 font-sans">
            {/* Report Header Mock */}
            <div className="border-b-2 border-primary pb-6 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl md:text-2xl font-black italic tracking-wide">RUGBY PREMIER LEAGUE</h1>
                  <p className="text-[9px] uppercase tracking-[3px] text-muted">CENTRAL INTELLIGENCE PLATFORM</p>
                </div>
                {branding !== 'clean' && (
                  <div className="w-20 h-10 border border-border/40 rounded flex items-center justify-center text-[10px] font-black uppercase text-muted">
                    {branding === 'opta' ? 'KADAMBA' : branding === 'cricviz' ? 'ANALYTICS REPORT' : 'RPL-LOGO'}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-medium text-muted pt-2 justify-between">
                <div>COMPETITION: <span className="text-white font-bold">{pack.competition}</span></div>
                <div>CLASSIFICATION: <span className="text-primary font-bold">CONFIDENTIAL BRIEF</span></div>
              </div>
            </div>

            {/* Title Page Brief */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-[2px]">I. Executive Narrative Summary</h2>
              <div className="bg-card-bg-light/40 border border-border/50 rounded-xl p-4 space-y-2 text-xs leading-relaxed text-zinc-300">
                <p>{executiveSummary}</p>
                <div className="pt-2 text-[9px] text-muted font-bold uppercase flex justify-between items-center">
                  <span>Compiled By: {analystName}</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Selected Modules Simulator List */}
            <div className="space-y-4 pt-4 border-t border-border/30">
              <h2 className="text-sm font-bold text-primary uppercase tracking-[2px]">II. Compiled Analysis Outline</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {modules.filter(m => m.enabled).map((m, index) => (
                  <div key={m.id} className="p-3 bg-secondary/20 border border-border/40 rounded-lg flex items-start gap-2.5">
                    <span className="text-[10px] font-black bg-primary/20 text-primary w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-200">{m.name}</div>
                      <div className="text-[9px] text-muted italic mt-0.5">Note: "{m.notes}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
