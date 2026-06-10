import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  BarChart3, 
  Table as TableIcon, 
  Users, 
  ShieldAlert, 
  Zap, 
  ChevronDown,
  ChevronUp,
  Trophy,
  LayoutDashboard,
  Search,
  X,
  Plus,
  Menu,
  Sun,
  Moon,
  FileText,
  Tv,
  Settings,
  ArrowLeftRight,
  Filter,
  Check,
  MapPin,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Cell
} from 'recharts';
import {
  SEASON_1_PACK,
  SEASON_2026_PACK_PLACEHOLDER,
  MOCK_TEAMS,
  ALL_PLAYERS,
  SEASON_STATS_HISTORY,
  SEASON_1_MATCHES
} from './mockData';
import { MatchPack, Player, MatchRecord } from './types';
import { exportToPDF, exportToWord, exportToExcel } from './lib/export';
import { buildLiveMatchPack } from './lib/rugbyApi';
import { toPng } from 'html-to-image';

// --- MODULAR SECTIONS ---
import ReportBuilder from './components/ReportBuilder';
import MediaStudio from './components/MediaStudio';
import MomentumTimeline from './components/MomentumTimeline';
import AdminPanel from './components/AdminPanel';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- SHARED UI COMPONENTS ---

const Card = ({ children, className, id }: { children: React.ReactNode; className?: string; id?: string; key?: any }) => (
  <div id={id} className={cn("bg-card-bg border border-border rounded-xl p-4 shadow-xl relative", className)}>
    {children}
  </div>
);

const DownloadButton = ({ onClick, isDownloading = false }: { onClick: () => void; isDownloading?: boolean }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={isDownloading}
      className="no-export absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 active:bg-primary/20 text-white rounded-lg border border-white/10 transition-all flex items-center justify-center cursor-pointer shadow-lg hover:border-primary/40 disabled:opacity-50"
      title="Download Chart as PNG"
    >
      {isDownloading ? (
        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      ) : (
        <Download size={13} className="text-primary hover:scale-115 transition-transform" />
      )}
    </button>
  );
};

const Badge = ({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'success' | 'warning' | 'secondary' | 'outline' }) => {
  const variants = {
    primary: 'bg-primary text-white',
    success: 'bg-green-500/20 text-green-500 border border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
    secondary: 'bg-white/10 text-white border border-white/20',
    outline: 'bg-transparent text-muted border border-white/10'
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", variants[variant])}>
      {children}
    </span>
  );
};

// --- SCREENS ---

export default function App() {
  const [currentPack, setCurrentPack] = useState<MatchPack | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [matchupPairs, setMatchupPairs] = useState<{ p1: Player; p2: Player }[]>([]);
  const [matchupP1Idx, setMatchupP1Idx] = useState(0);
  const [matchupP2Idx, setMatchupP2Idx] = useState(1);
  
  const [perfSelectedTeams, setPerfSelectedTeams] = useState<string[]>([]);
  const [profileSelectedNames, setProfileSelectedNames] = useState<string[]>([]);
  const [profileFilters, setProfileFilters] = useState({ type: 'all', season: 'both', team: 'all' });
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [profileViewMode, setProfileViewMode] = useState<'card' | 'list'>('card');
  
  const [trendsViewType, setTrendsViewType] = useState<'team' | 'player'>('team');
  const [trendsSelectedTeam, setTrendsSelectedTeam] = useState<string>('HH');
  const [trendsCompareTeam, setTrendsCompareTeam] = useState<string>('CB');
  const [trendsSelectedPlayer, setTrendsSelectedPlayer] = useState<string>('Terio Tamani');
  const [trendsCompetition, setTrendsCompetition] = useState<string>('rpl2025');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('kadamba-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Global sticky filters
  const [selectedGlobalTeam, setSelectedGlobalTeam] = useState('all');
  const [selectedGlobalPlayer, setSelectedGlobalPlayer] = useState('all');
  const [selectedGlobalVenue, setSelectedGlobalVenue] = useState('all');
  const [selectedGlobalMatch, setSelectedGlobalMatch] = useState('all');
  const [selectedGlobalOpponent, setSelectedGlobalOpponent] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('full');

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf' as 'pdf' | 'word' | 'excel',
    pages: ['overview', 'teams', 'players', 'matches', 'trends', 'milestones', 'comparison', 'report', 'media']
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingChart, setIsDownloadingChart] = useState<string | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  React.useEffect(() => {
    let lastScrollY = window.pageYOffset;
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      if (currentScrollY <= 25) {
        // Fully scrolled to top
        setIsNavCollapsed(false);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down -> hide the sticky bar
        setIsNavCollapsed(true);
      } else if (currentScrollY < lastScrollY - 8) {
        // Scrolling up -> show the sticky bar (with tiny threshold to prevent jitter)
        setIsNavCollapsed(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const downloadChartAsPng = async (elementId: string, chartName: string) => {
    setIsDownloadingChart(elementId);
    try {
      await new Promise(r => setTimeout(r, 100));
      const el = document.getElementById(elementId);
      if (el) {
        const dataUrl = await toPng(el, {
          quality: 0.98,
          backgroundColor: theme === 'dark' ? '#0e1218' : '#ffffff',
          pixelRatio: 2.5,
          filter: (node) => {
            if (node instanceof HTMLElement) {
              return !node.classList.contains('no-export');
            }
            return true;
          }
        });
        const link = document.createElement('a');
        link.download = `${chartName.replace(/[^a-zA-Z0-9_\-]+/g, '_')}.png`;
        link.style.display = 'none';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn(`Could not find printable container with id: ${elementId}`);
      }
    } catch (e) {
      console.error('PNG download failure', e);
    } finally {
      setIsDownloadingChart(null);
    }
  };

  const handleExport = async () => {
    if (!currentPack) return;
    setIsExporting(true);
    
    try {
      const capturedPages: Record<string, string> = {};
      const originalTab = activeTab;

      // Only need to capture for PDF
      if (exportOptions.format === 'pdf') {
        for (const tabId of exportOptions.pages) {
          setActiveTab(tabId);
          // Wait for render/animations - increased for high quality
          await new Promise(r => setTimeout(r, 800)); 
          
          const mainElement = document.querySelector('main > div') as HTMLElement;
          if (mainElement) {
             const dataUrl = await toPng(mainElement, {
               quality: 0.95,
               backgroundColor: theme === 'dark' ? '#0e1218' : '#ffffff',
               pixelRatio: 2,
               // Skip some problematic elements if any
               filter: (node) => {
                 return !(node instanceof HTMLElement && node.classList.contains('no-export'));
               }
             });
             capturedPages[tabId] = dataUrl;
          }
        }
      }

      // Restore original tab
      setActiveTab(originalTab);

      if (exportOptions.format === 'pdf') {
        await exportToPDF(currentPack, capturedPages);
      } else if (exportOptions.format === 'word') {
        await exportToWord(currentPack, ALL_PLAYERS);
      } else if (exportOptions.format === 'excel') {
        await exportToExcel(currentPack, ALL_PLAYERS);
      }
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed', error);
      alert('Export failed. Please check the console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePdfExportFromReportBuilder = async (enabledTabIds: string[]) => {
    if (!currentPack) return;
    try {
      const capturedPages: Record<string, string> = {};
      const originalTab = activeTab;

      for (const tabId of enabledTabIds) {
        setActiveTab(tabId);
        // Wait for render/animations
        await new Promise(r => setTimeout(r, 800)); 
        
        const mainElement = document.querySelector('main > div') as HTMLElement;
        if (mainElement) {
           const dataUrl = await toPng(mainElement, {
             quality: 0.95,
             backgroundColor: theme === 'dark' ? '#0e1218' : '#ffffff',
             pixelRatio: 2,
             filter: (node) => {
               return !(node instanceof HTMLElement && node.classList.contains('no-export'));
             }
           });
           capturedPages[tabId] = dataUrl;
        }
      }

      // Restore original tab
      setActiveTab(originalTab);

      // Generate the PDF using the captured pages
      await exportToPDF(currentPack, capturedPages);
    } catch (error) {
      console.error('Report Builder PDF export failed', error);
      alert('PDF export failed. Please check the console for details.');
      throw error;
    }
  };

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('kadamba-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const TABS = [
    { id: 'overview', label: 'Season Overview', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Trophy },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Zap },
    { id: 'trends', label: 'Trends & Insights', icon: BarChart3 },
    { id: 'milestones', label: 'Milestones', icon: Trophy },
    { id: 'comparison', label: 'Comparison Center', icon: ArrowLeftRight },
    { id: 'report', label: 'Report Builder', icon: FileText },
    { id: 'media', label: 'Media Studio', icon: Tv },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  const [selectedSeason, setSelectedSeason] = useState('s1');
  const [selectedPackType, setSelectedPackType] = useState('full');
  const [livePlayerList, setLivePlayerList] = useState<Player[]>(ALL_PLAYERS);

  const loadPack = async () => {
    setIsLoading(true);
    try {
      if (selectedSeason === 's1') {
        const { pack, players } = await buildLiveMatchPack(4, 'RPL Season 1 — Men 2025', 'Rugby Premier League Season 1 (Mens) 2025');
        setCurrentPack(pack);
        setLivePlayerList(players.length > 0 ? players : ALL_PLAYERS);
        setPerfSelectedTeams(pack.standings.slice(0, 3).map(s => s.teamId));
      } else if (selectedSeason === 's2m') {
        const { pack, players } = await buildLiveMatchPack(6, 'RPL Season 2 — Men 2026', 'Rugby Premier League Season 2 (Mens) 2026');
        setCurrentPack(pack);
        setLivePlayerList(players.length > 0 ? players : ALL_PLAYERS);
        setPerfSelectedTeams(pack.standings.slice(0, 3).map(s => s.teamId));
      } else if (selectedSeason === 's2w') {
        const { pack, players } = await buildLiveMatchPack(7, 'RPL Season 1 — Women 2026', 'Rugby Premier League Season 1 (Womens) 2026');
        setCurrentPack(pack);
        setLivePlayerList(players.length > 0 ? players : []);
        setPerfSelectedTeams(pack.standings.slice(0, 3).map(s => s.teamId));
      } else if (selectedSeason === 's2026') {
        setCurrentPack(SEASON_2026_PACK_PLACEHOLDER);
        setLivePlayerList([]);
        setPerfSelectedTeams([]);
      }
    } catch (e) {
      console.error('Failed to load pack:', e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadPack();
  }, [selectedSeason]);

  const goHome = () => {
    setCurrentPack(null);
    setActiveTab('overview');
  };

  if (!currentPack) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-secondary">
        {/* Background Gradients - Replaced blurs with radial gradients to fix pixelation */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 25% 25%, var(--primary) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 75% 75%, var(--secondary) 0%, transparent 60%)' }} />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-[11px] font-bold tracking-[4px] uppercase text-primary mb-2 block">Kadamba Analytics</span>
          <h1 className="text-5xl md:text-6xl font-bold leading-[0.95] mb-4">
            RUGBY PREMIER<br />
            <span className="text-primary italic">LEAGUE</span>
          </h1>
          <p className="text-muted tracking-[2px] uppercase text-xs">Official Statistics & Broadcast Pack</p>
        </motion.div>

        {/* Team Logos Strip */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 opacity-80 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500 max-w-4xl px-4">
          {Object.values(MOCK_TEAMS).map(t => (
            <div key={t.id} className="w-14 h-14 bg-card-bg border border-border rounded-xl flex items-center justify-center overflow-hidden shadow-lg p-2" title={t.name}>
               <TeamLogo teamIdOrName={t.id} />
            </div>
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-[480px]"
        >
          <Card className="p-8 space-y-6">
            <h2 className="text-[10px] font-bold tracking-[3px] uppercase text-primary">Select & Load Match Pack</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Competition / Season</label>
                <select 
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full bg-card-bg-light border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors appearance-none text-zinc-100"
                >
                  <option value="s1" className="bg-zinc-900 text-white font-semibold">RPL Season 1 — Men 2025 ⚡ Live</option>
                  <option value="s2m" className="bg-zinc-900 text-white font-semibold">RPL Season 2 — Men 2026 ⚡ Live</option>
                  <option value="s2w" className="bg-zinc-900 text-white font-semibold">RPL Season 1 — Women 2026 ⚡ Live</option>
                  <option value="s2026" className="bg-zinc-900 text-white font-semibold">RPL Season 2026 (Upcoming)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Select Pack Type</label>
                <select 
                  value={selectedPackType}
                  onChange={(e) => setSelectedPackType(e.target.value)}
                  className="w-full bg-card-bg-light border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors text-zinc-300"
                >
                  <option value="full" className="bg-zinc-900 text-white font-semibold">Full Season Analytics</option>
                  <option value="match" disabled className="bg-zinc-900 text-zinc-500 font-semibold">Single Match (WIP)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={loadPack}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-red-700 disabled:bg-dim text-white font-bold py-3.5 rounded-lg transition-all duration-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group overflow-hidden relative"
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={14} className="group-hover:scale-125 transition-transform" />
                  Load Analytics Pack
                </>
              )}
            </button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Professional Toolbar */}
      <header className="sticky top-0 z-50 bg-secondary border-b-2 border-primary h-14 flex items-center px-6 justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={goHome} className="flex items-center gap-2 text-muted hover:text-white text-[10px] font-bold uppercase tracking-wider group">
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="h-6 w-px bg-white/10" />
          <p className="text-sm font-bold tracking-widest uppercase">
            Kadamba <span className="text-primary italic">Analytics</span>
          </p>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted/5 border border-border rounded">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-[10px] text-muted font-bold uppercase tracking-wider outline-none cursor-pointer hover:text-white transition-colors appearance-none"
            >
              <option value="s1" className="bg-zinc-900 text-white font-semibold">S1 Men 2025 ⚡</option>
              <option value="s2m" className="bg-zinc-900 text-white font-semibold">S2 Men 2026 ⚡</option>
              <option value="s2w" className="bg-zinc-900 text-white font-semibold">S1 Women 2026 ⚡</option>
              <option value="s2026" className="bg-zinc-900 text-white font-semibold">2026 Upcoming</option>
            </select>
            <ChevronDown size={10} className="text-muted" />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors duration-200"
          >
             <Download size={14} /> Export Options
          </button>
        </div>
      </header>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !isExporting && setShowExportModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-card-bg border border-border shadow-2xl rounded-2xl overflow-hidden"
             >
                <div className="p-6 border-b border-border flex justify-between items-center">
                   <div>
                      <h3 className="text-lg font-bold">Export Analytics Report</h3>
                      <p className="text-xs text-muted">Generate professional documents for broadcast & print</p>
                   </div>
                   {!isExporting && (
                     <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-white/5 rounded-lg text-muted">
                        <X size={20} />
                     </button>
                   )}
                </div>

                <div className="p-6 space-y-8">
                   {/* Format Selection */}
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-[2px] text-primary">1. Choose Format</label>
                      <div className="grid grid-cols-3 gap-3">
                         {[
                           { id: 'pdf', label: 'PDF Report', desc: 'Standard Print' },
                           { id: 'word', label: 'Word Doc', desc: 'Editable text' },
                           { id: 'excel', label: 'Excel Data', desc: 'Raw stats' }
                         ].map(f => (
                           <button
                             key={f.id}
                             onClick={() => setExportOptions(prev => ({ ...prev, format: f.id as any }))}
                             className={cn(
                               "p-4 rounded-xl border-2 text-left transition-all",
                               exportOptions.format === f.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                             )}
                           >
                              <div className={cn("text-xs font-bold mb-1", exportOptions.format === f.id ? "text-primary" : "text-white")}>{f.label}</div>
                              <div className="text-[9px] text-muted leading-tight">{f.desc}</div>
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Page Selection */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold uppercase tracking-[2px] text-primary">2. Select Pages to Include</label>
                        <button 
                          onClick={() => setExportOptions(prev => ({ ...prev, pages: prev.pages.length === TABS.length ? [] : TABS.map(t => t.id) }))}
                          className="text-[9px] font-bold uppercase text-muted hover:text-primary"
                        >
                           {exportOptions.pages.length === TABS.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         {TABS.map(tab => (
                           <button
                             key={tab.id}
                             onClick={() => {
                               setExportOptions(prev => ({
                                 ...prev,
                                 pages: prev.pages.includes(tab.id) 
                                   ? prev.pages.filter(p => p !== tab.id)
                                   : [...prev.pages, tab.id]
                               }));
                             }}
                             className={cn(
                               "flex items-center gap-3 px-4 py-3 rounded-lg border text-[11px] transition-all",
                               exportOptions.pages.includes(tab.id) ? "border-primary/50 bg-primary/5 text-white" : "border-border text-muted hover:border-primary/30"
                             )}
                           >
                              <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all", exportOptions.pages.includes(tab.id) ? "bg-primary border-primary" : "border-muted")}>
                                 {exportOptions.pages.includes(tab.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                              {tab.label}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-muted/5 border-t border-border">
                   <button 
                     onClick={handleExport}
                     disabled={isExporting || exportOptions.pages.length === 0}
                     className="w-full bg-primary hover:bg-red-700 disabled:bg-dim text-white font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                   >
                     {isExporting ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         <span>Capturing & Rendering...</span>
                       </>
                     ) : (
                       <>
                         <Download size={14} />
                         <span>Start Export ({exportOptions.pages.length} Pages)</span>
                       </>
                     )}
                   </button>
                   {isExporting && (
                     <p className="text-[9px] text-center text-muted mt-3 animate-pulse">
                        Capturing live UI elements. Please wait for the process to complete.
                     </p>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Broadcast Header */}
      <section className="bg-secondary border-b border-border p-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <Badge variant="primary">Broadcast Pack</Badge>
           <h2 className="text-3xl font-bold mt-2">{currentPack.label}</h2>
           <p className="text-muted text-xs uppercase tracking-[1px] mt-1">Match Preview · League Stats · Player Profiles</p>
        </div>
        <div className="flex items-center gap-4 text-right">
           {isNavCollapsed && (
             <button
               onClick={() => setIsNavCollapsed(false)}
               className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-text-main rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer shrink-0"
             >
               <Menu size={14} /> Show Navigation & Filters
             </button>
           )}
           <div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">Status</div>
              <Badge variant="success">Completed</Badge>
           </div>
        </div>
      </section>

      {/* Global Sticky Filter & Nav Wrapper */}
      <div className={cn(
        "sticky top-[56px] z-40 bg-secondary no-export self-stretch flex flex-col shadow-lg transition-all duration-300 origin-top transform",
        isNavCollapsed 
          ? "-translate-y-full opacity-0 pointer-events-none h-0 overflow-hidden" 
          : "translate-y-0 opacity-100"
      )}>
        {/* Global Sticky Filter Bar */}
        <div className="bg-secondary/95 backdrop-blur-md border-b border-border py-3 px-6 md:px-12 flex flex-wrap items-center justify-between gap-4 self-stretch">
        <div className="flex items-center gap-2.5 text-[10px] font-bold text-primary uppercase tracking-[2px]">
          <Filter size={14} className="animate-pulse" />
          <span>Sticky Intelligence Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Season Selector */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Season:</span>
            <select 
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0"
            >
              <option value="s1" className="bg-zinc-900 text-white font-semibold">S1 Men 2025 ⚡</option>
              <option value="s2m" className="bg-zinc-900 text-white font-semibold">S2 Men ⚡ Live</option>
              <option value="s2w" className="bg-zinc-900 text-white font-semibold">S1 Women ⚡ Live</option>
              <option value="s2026" className="bg-zinc-900 text-white font-semibold">2026 Draft</option>
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Franchise:</span>
            <select 
              value={selectedGlobalTeam} 
              onChange={(e) => setSelectedGlobalTeam(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0"
            >
              <option value="all" className="bg-zinc-900 text-white font-semibold">All Teams</option>
              {Object.values(MOCK_TEAMS).map(t => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white font-semibold">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Player Filter */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Athlete:</span>
            <select 
              value={selectedGlobalPlayer} 
              onChange={(e) => setSelectedGlobalPlayer(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0 max-w-[120px]"
            >
              <option value="all" className="bg-zinc-900 text-white font-semibold">All Players</option>
              {livePlayerList.slice(0, 25).map(p => (
                <option key={p.name} value={p.name} className="bg-zinc-900 text-white font-semibold">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Venue Selector */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Arena:</span>
            <select 
              value={selectedGlobalVenue} 
              onChange={(e) => setSelectedGlobalVenue(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0"
            >
              <option value="all" className="bg-zinc-900 text-white font-semibold">All Arenas</option>
              <option value="gachibowli" className="bg-zinc-900 text-white font-semibold">Gachibowli Stadium</option>
              <option value="nehru" className="bg-zinc-900 text-white font-semibold">Jawaharlal Stadium</option>
              <option value="kanteerava" className="bg-zinc-900 text-white font-semibold">Kanteerava Arena</option>
            </select>
          </div>

          {/* Match Round Selector */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Round:</span>
            <select 
              value={selectedGlobalMatch} 
              onChange={(e) => setSelectedGlobalMatch(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0"
            >
              <option value="all" className="bg-zinc-900 text-white font-semibold">All Weeks</option>
              {Array.from({ length: 15 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)} className="bg-zinc-900 text-white font-semibold">Round {i + 1}</option>
              ))}
            </select>
          </div>

          {/* Opposition Filter */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Opponent:</span>
            <select 
              value={selectedGlobalOpponent} 
              onChange={(e) => setSelectedGlobalOpponent(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0"
            >
              <option value="all" className="bg-zinc-900 text-white font-semibold">All Opponents</option>
              {Object.values(MOCK_TEAMS).map(t => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white font-semibold">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-card-bg border border-border px-3 py-1 rounded-lg text-xs font-semibold">
            <span className="text-muted uppercase text-[9px] font-bold">Duration:</span>
            <select 
              value={selectedDateRange} 
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-bold text-white text-xs border-none p-0 focus:ring-0"
            >
              <option value="full" className="bg-zinc-900 text-white font-semibold">Full Season</option>
              <option value="june1" className="bg-zinc-900 text-white font-semibold">June 1 - Jun 15</option>
              <option value="june2" className="bg-zinc-900 text-white font-semibold">June 16 - Jun 30</option>
            </select>
          </div>
        </div>
      </div>

        {/* Navigation Tabs */}
        <nav className="bg-secondary px-6 md:px-12 border-b-2 border-primary relative overflow-x-auto scrollbar-none">
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center">
          <button 
            onClick={() => setIsNavCollapsed(true)}
            className="flex items-center justify-center px-4 py-4 text-muted hover:text-white transition-colors cursor-pointer group shrink-0"
            title="Collapse Navigation & Filters"
          >
            <Menu size={16} className="text-primary group-hover:scale-110 transition-transform" />
          </button>
          <div className="h-6 w-px bg-white/10 mr-2 shrink-0" />
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-4 shrink-0",
                activeTab === tab.id ? "text-text-main border-primary" : "text-muted border-transparent hover:text-text-main"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center justify-between py-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 text-white p-1"
          >
            <Menu size={20} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {TABS.find(t => t.id === activeTab)?.label}
            </span>
          </button>
          <ChevronDown size={14} className={cn("text-muted transition-transform", isMobileMenuOpen && "rotate-180")} />
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-secondary border-b border-primary z-[60] overflow-hidden"
            >
              <div className="flex flex-col py-2">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left transition-colors",
                      activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted hover:bg-white/5"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      </div>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="overflow-visible"
          >
             {activeTab === 'overview' && (
               <div className="space-y-12">
                 <FactsSection pack={currentPack} />
                 <div className="pt-6 border-t border-border">
                   <TableSection pack={currentPack} />
                 </div>
               </div>
             )}

             {activeTab === 'trends' && (
               <SeasonTrendsSection
                 pack={currentPack}
                 players={livePlayerList}
                 viewType={trendsViewType}
                 setViewType={setTrendsViewType}
                 selectedTeam={trendsSelectedTeam}
                 setSelectedTeam={setTrendsSelectedTeam}
                 compareTeam={trendsCompareTeam}
                 setCompareTeam={setTrendsCompareTeam}
                 selectedPlayer={trendsSelectedPlayer}
                 setSelectedPlayer={setTrendsSelectedPlayer}
                 selectedCompetition={trendsCompetition}
                 setSelectedCompetition={setTrendsCompetition}
               />
             )}

             {activeTab === 'teams' && (
               <TeamPerformanceSection 
                 pack={currentPack} 
                 selectedTeams={perfSelectedTeams}
                 setSelectedTeams={setPerfSelectedTeams}
               />
             )}

             {activeTab === 'players' && (
               <div className="space-y-12">
                 <PlayerProfilesSection
                   players={livePlayerList}
                   selectedNames={profileSelectedNames}
                   setSelectedNames={setProfileSelectedNames}
                   searchQuery={profileSearchQuery}
                   setSearchQuery={setProfileSearchQuery}
                   viewMode={profileViewMode}
                   setViewMode={setProfileViewMode}
                   filters={profileFilters}
                   setFilters={setProfileFilters}
                 />
                 <div className="pt-6 border-t border-border">
                   <LeaderboardsSection pack={currentPack} />
                 </div>
               </div>
             )}

             {activeTab === 'matches' && (
               <MomentumTimeline pack={currentPack} />
             )}

             {activeTab === 'milestones' && (
               <div className="space-y-6 text-left">
                 <div className="space-y-1 mb-8">
                   <Badge variant="primary">Targets Hub</Badge>
                   <h3 className="text-2xl font-black uppercase italic tracking-tight">Upcoming Milestones & Projections</h3>
                   <p className="text-muted text-xs">Dynamic performance alerts and critical milestone projections for leagues and clubs</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {currentPack.milestones && currentPack.milestones.map((m, i) => (
                     <Card key={i} className="relative overflow-hidden group hover:border-primary/50 transition-all">
                       <div className="absolute top-0 right-0 p-4 opacity-5">
                          <Zap size={64} className="text-primary" />
                       </div>
                       <div className="relative z-10">
                          <div className="text-[10px] font-bold uppercase text-muted tracking-widest mb-2">{m.text}</div>
                          <div className="flex items-end justify-between mb-4">
                             <div className="text-2xl font-black text-white">{m.target}</div>
                             <div className="text-right">
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Remaining</div>
                                <div className="text-lg font-bold text-primary">{m.need}</div>
                             </div>
                          </div>
                          
                          <div className="space-y-1.5">
                             <div className="flex justify-between text-[10px] font-bold uppercase text-muted">
                                <span>Completed</span>
                                <span>{m.current} / {parseInt(m.target)}</span>
                             </div>
                             <div className="h-2 bg-muted/10 rounded-full overflow-hidden">
                                <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${(m.current / parseInt(m.target)) * 100}%` }}
                                   className="h-full bg-primary"
                                />
                             </div>
                          </div>
                       </div>
                     </Card>
                   ))}
                 </div>
               </div>
             )}

             {activeTab === 'comparison' && (
               <div className="space-y-8">
                 <div className="flex bg-card-bg-light p-1 rounded-xl border border-border w-fit mx-auto">
                   <span className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-primary">
                     Player Battle center
                   </span>
                 </div>
                 <MatchupSection
                   players={livePlayerList}
                   matchupPairs={matchupPairs}
                   setMatchupPairs={setMatchupPairs}
                   p1Idx={matchupP1Idx}
                   setP1Idx={setMatchupP1Idx}
                   p2Idx={matchupP2Idx}
                   setP2Idx={setMatchupP2Idx}
                 />
                 <div className="pt-6 border-t border-border">
                   <DisciplineSection pack={currentPack} />
                 </div>
               </div>
             )}

             {activeTab === 'report' && (
               <ReportBuilder
                 pack={currentPack}
                 allPlayers={livePlayerList}
                 onPdfExport={handlePdfExportFromReportBuilder}
               />
             )}

             {activeTab === 'media' && (
               <MediaStudio pack={currentPack} allPlayers={livePlayerList} />
             )}

             {activeTab === 'admin' && (
               <AdminPanel pack={currentPack} />
             )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-secondary border-t border-border p-4 px-8 flex justify-between items-center text-[10px] text-muted">
        <p>RPL 2025 SEASON 1 · <span className="text-primary font-bold">KADAMBA</span> ANALYTICS</p>
        <p>POWERED BY LIVE BROADCAST DATA ENGINE</p>
      </footer>
    </div>
  );
}

function TeamLogo({ teamIdOrName, className }: { teamIdOrName: string; className?: string }) {
  const team = Object.values(MOCK_TEAMS).find(t => 
    t.id === teamIdOrName || 
    t.shortName === teamIdOrName || 
    t.name === teamIdOrName
  );
  const [imgError, setImgError] = useState(false);

  // If no team found, just show initials from the string
  if (!team) {
    const displayChar = teamIdOrName.substring(0, 2).toUpperCase();
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs uppercase", className)}>
        {displayChar}
      </div>
    );
  }

  const initialsUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${team.shortName}&backgroundColor=A12806,0f172a&fontSize=40&fontWeight=700`;

  return (
    <div className={cn("w-full h-full flex items-center justify-center overflow-hidden bg-card-bg-light", className)}>
      {!imgError ? (
        <img 
          src={team.logo} 
          alt={team.name} 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <img 
          src={initialsUrl} 
          alt={team.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

// --- SUB-SECTIONS ---

function FactsSection({ pack }: { pack: MatchPack }) {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h3 className="section-title">Key Insights & Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pack.facts.map((fact, i) => (
            <Card key={i} className="border-l-[3px] border-primary flex flex-col justify-center min-h-[140px]">
              <span className="text-4xl font-bold text-primary mb-2 leading-none">{fact.value}</span>
              <p className="text-xs leading-relaxed opacity-90">{fact.text}</p>
            </Card>
          ))}
        </div>
      </div>

      {pack.milestones && pack.milestones.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <Trophy size={18} className="text-primary" />
             <h3 className="section-title mb-0">Upcoming Milestones</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pack.milestones.map((m, i) => (
              <Card key={i} className="relative overflow-hidden group hover:border-primary/50 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Zap size={64} className="text-primary" />
                </div>
                <div className="relative z-10">
                   <div className="text-[10px] font-bold uppercase text-muted tracking-widest mb-2">{m.text}</div>
                   <div className="flex items-end justify-between mb-4">
                      <div className="text-2xl font-black text-text-main">{m.target}</div>
                      <div className="text-right">
                         <div className="text-[10px] font-bold text-primary uppercase">Needs</div>
                         <div className="text-lg font-bold text-primary">{m.need}</div>
                      </div>
                   </div>
                   
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-muted">
                         <span>Progress</span>
                         <span>{m.current} / {parseInt(m.target)}</span>
                      </div>
                      <div className="h-2 bg-muted/10 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(m.current / parseInt(m.target)) * 100}%` }}
                            className="h-full bg-primary"
                         />
                      </div>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TableSection({ pack }: { pack: MatchPack }) {
  return (
    <div className="space-y-6">
      <h3 className="section-title">Official Standings</h3>
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-secondary text-[10px] font-bold uppercase tracking-widest text-muted">
              <th className="px-4 py-4">POS</th>
              <th className="px-4 py-4">TEAM</th>
              <th className="px-4 py-4 text-center">MP</th>
              <th className="px-4 py-4 text-center">W-D-L</th>
              <th className="px-4 py-4 text-center">SD</th>
              <th className="px-4 py-4 text-center">BP</th>
              <th className="px-4 py-4 text-center text-primary">PT</th>
              <th className="px-4 py-4 text-center">PTS</th>
              <th className="px-4 py-4 text-center">T</th>
              <th className="px-4 py-4 text-center">CONV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {pack.standings.map((row) => (
              <tr key={row.teamId} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-4 font-bold text-primary">{row.rank}</td>
                <td className="px-4 py-4 font-bold flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-card-bg-light flex items-center justify-center border border-border overflow-hidden shrink-0 p-1">
                     <TeamLogo teamIdOrName={row.teamId} />
                   </div>
                   {row.teamName}
                </td>
                <td className="px-4 py-4 text-center">{row.played}</td>
                <td className="px-4 py-4 text-center whitespace-nowrap">{row.wins}-{row.draws}-{row.losses}</td>
                <td className="px-4 py-4 text-center">{row.scoreDiff > 0 ? `+${row.scoreDiff}` : row.scoreDiff}</td>
                <td className="px-4 py-4 text-center">{row.bonusPoints}</td>
                <td className="px-4 py-4 text-center font-bold text-lg text-primary">{row.leaguePoints}</td>
                <td className="px-4 py-4 text-center opacity-80">{row.pointsScored}</td>
                <td className="px-4 py-4 text-center opacity-80">{row.tries}</td>
                <td className="px-4 py-4 text-center opacity-80">{row.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function LeaderboardsSection({ pack }: { pack: MatchPack }) {
  const categories = [
    { title: 'Top 10 — Points Scored', data: pack.leaderboards.points, primaryLabel: 'Pts', key: 'pts' },
    { title: 'Top 10 — Tries Scored', data: pack.leaderboards.tries, primaryLabel: 'Tries', key: 'tries' },
    { title: 'Top 10 — Conversions Made', data: pack.leaderboards.conversions, primaryLabel: 'Conv', key: 'conv' },
    { title: 'Top 10 — Turnovers Won', data: pack.leaderboards.turnovers, primaryLabel: 'TOs', key: 'turnovers' },
    { title: 'Top 10 — Line Breaks', data: pack.leaderboards.linebreaks, primaryLabel: 'LBs', key: 'linebreaks' },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.slice(0, 2).map((cat, i) => (
          <div key={i} className="space-y-4">
            <h3 className="section-title">{cat.title}</h3>
            <Card className="p-2">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border/50">
                  {cat.data.map((player, idx) => (
                    <tr key={idx} className={cn("group transition-colors", idx === 0 ? "bg-primary/10" : "hover:bg-muted/5")}>
                      <td className="p-3 w-8 font-bold text-primary">{idx + 1}</td>
                      <td className="p-3">
                          <div className="flex items-center gap-3">
                             <div className="w-6 h-6 rounded bg-card-bg-light flex items-center justify-center border border-border overflow-hidden shrink-0 p-0.5">
                                <TeamLogo teamIdOrName={player.team} />
                             </div>
                             <div>
                                <div className="font-bold">{player.name}</div>
                                <div className="text-[10px] text-muted flex items-center gap-2">
                                  <span>{player.nat}</span>
                                  <span className="w-1 h-1 rounded-full bg-muted/20" />
                                  <span>{player.team}</span>
                                </div>
                             </div>
                          </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-xl font-bold">{(player as any)[cat.key]}</span>
                        <span className="ml-1 text-[10px] text-muted uppercase">{cat.primaryLabel}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {categories.slice(2).map((cat, i) => (
          <div key={i} className="space-y-4">
            <h3 className="section-title">{cat.title}</h3>
            <Card className="p-2">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border/50">
                  {cat.data.map((player, idx) => (
                    <tr key={idx} className="group hover:bg-muted/5 transition-colors">
                      <td className="p-3 w-8 font-bold text-primary">{idx + 1}</td>
                      <td className="p-3">
                         <div className="font-bold">{player.name}</div>
                         <div className="text-[10px] text-muted">{player.team}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-lg">
                        {(player as any)[cat.key]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisciplineSection({ pack }: { pack: MatchPack }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h3 className="section-title">Yellow Cards by Team</h3>
        <Card className="space-y-4">
          {pack.discipline.yellowCards.map((team, idx) => (
            <div key={team.team} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold px-1">
                <span>{team.team}</span>
                <span className="text-primary">{team.count} Cards</span>
              </div>
              <div className="h-3 bg-muted/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(team.count / 8) * 100}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          ))}
        </Card>
      </div>
      
      <div className="space-y-6">
        <h3 className="section-title">Inquiry Required</h3>
        {pack.discipline.topCarded.map((player, i) => (
          <Card key={i} className="flex gap-4 p-4 border-l-2 border-red-500">
             <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-red-500 text-xl font-bold">
               {player.name.charAt(0)}
             </div>
             <div>
               <h4 className="font-bold text-sm tracking-tight">{player.name}</h4>
               <p className="text-[10px] text-muted mb-2">{player.team}</p>
               <div className="flex gap-2">
                 <Badge variant="warning">{player.yc} YC</Badge>
                 <Badge variant="warning">{player.rc} RC</Badge>
               </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- NEW SECTIONS ---

const STAT_LABELS: Record<string, string> = {
  pts: 'Points',
  tries: 'Tries',
  conv: 'Conversions',
  assists: 'Assists',
  tackles: 'Tackles',
  offloads: 'Offloads',
  linebreaks: 'Line Breaks',
  defbeaten: 'Defenders Beaten',
  turnovers: 'Turnovers Won',
};

function SeasonTrendsSection({
  pack,
  players,
  viewType,
  setViewType,
  selectedTeam,
  setSelectedTeam,
  compareTeam,
  setCompareTeam,
  selectedPlayer,
  setSelectedPlayer,
  selectedCompetition,
  setSelectedCompetition
}: {
  pack: MatchPack;
  players: Player[];
  viewType: 'team' | 'player';
  setViewType: (v: 'team' | 'player') => void;
  selectedTeam: string;
  setSelectedTeam: (t: string) => void;
  compareTeam: string;
  setCompareTeam: (t: string) => void;
  selectedPlayer: string;
  setSelectedPlayer: (p: string) => void;
  selectedCompetition: string;
  setSelectedCompetition: (c: string) => void;
}) {
  const teams = pack.standings;
  
  const [isDownloadingChart, setIsDownloadingChart] = useState<string | null>(null);

  const downloadChartAsPng = async (elementId: string, chartName: string) => {
    setIsDownloadingChart(elementId);
    try {
      await new Promise(r => setTimeout(r, 100));
      const el = document.getElementById(elementId);
      if (el) {
        const dataUrl = await toPng(el, {
          quality: 0.98,
          backgroundColor: '#0e1218',
          pixelRatio: 2.5,
          filter: (node) => {
            if (node instanceof HTMLElement) {
              return !node.classList.contains('no-export');
            }
            return true;
          }
        });
        const link = document.createElement('a');
        link.download = `${chartName.replace(/[^a-zA-Z0-9_\-]+/g, '_')}.png`;
        link.style.display = 'none';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingChart(null);
    }
  };
  
  const currentTeam = teams.find(t => t.teamId === selectedTeam);
  const comparisonTeamData = teams.find(t => t.teamId === compareTeam);
  const currentPlayer = players.find(p => p.name === selectedPlayer);

  // League averages for Season 1
  const leagueAvg = {
    points: teams.reduce((acc, t) => acc + t.pointsScored, 0) / teams.length,
    tries: teams.reduce((acc, t) => acc + t.tries, 0) / teams.length,
    tackles: teams.reduce((acc, t) => acc + (t.tackles || 0), 0) / teams.length,
    offloads: teams.reduce((acc, t) => acc + (t.offloads || 0), 0) / teams.length,
    turnovers: teams.reduce((acc, t) => acc + (t.turnoversWon || 0), 0) / teams.length,
    handling: teams.reduce((acc, t) => acc + (t.handlingErrors || 0), 0) / teams.length,
  };

  const getTeamRadarData = (team: any) => {
    if (!team) return [];
    return [
      { subject: 'Attack', A: (team.pointsScored / 314) * 100, fullMark: 100 },
      { subject: 'Defense', A: ((team.tackles || 0) / 212) * 100, fullMark: 100 },
      { subject: 'Movement', A: ((team.offloads || 0) / 102) * 100, fullMark: 100 },
      { subject: 'Set Piece', A: (((team.scrumWon || 0) + (team.lineoutWon || 0)) / (53 + 13)) * 100, fullMark: 100 },
      { subject: 'Discipline', A: (1 - ((team.yellowCards || 0) / 10)) * 100, fullMark: 100 },
      { subject: 'Turnovers', A: ((team.turnoversWon || 0) / 31) * 100, fullMark: 100 },
    ];
  };

  const radarData1 = getTeamRadarData(currentTeam);
  const radarData2 = getTeamRadarData(comparisonTeamData);

  const combinedRadarData = radarData1.map((d, i) => ({
    ...d,
    B: radarData2[i]?.A || 0
  }));

  // Match by match momentum (cumulative scoring, built from current season's matches)
  const seasonMatches: MatchRecord[] = pack.matches ?? SEASON_1_MATCHES;
  const teamIds = teams.map(t => t.teamId);
  const momentumInitial = teamIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), { match: 0 } as Record<string, number>);
  const momentumData = seasonMatches.reduce((acc: any[], match) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : momentumInitial;
    const current = { ...last, match: match.no };
    if (match.home in current) (current as any)[match.home] += match.hPts;
    if (match.away in current) (current as any)[match.away] += match.aPts;
    acc.push(current);
    return acc;
  }, []);

  const StatCard = ({ label, value, sub, trend, icon: Icon, color }: any) => (
    <Card className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity", color)}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-muted mb-4">{label}</p>
        <div className="flex items-end gap-3">
          <h4 className="text-4xl font-black">{value}</h4>
          {trend !== undefined && (
            <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 mb-1.5", trend >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
              {trend >= 0 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted font-medium mt-2">{sub}</p>
        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            className={cn("h-full", color.replace('text-', 'bg-'))}
          />
        </div>
      </div>
    </Card>
  );

  if (selectedCompetition === 'rpl2026') {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-center space-y-4 bg-primary/5 rounded-2xl border border-primary/20">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
           <Zap size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-text-main">Season begins from 16-28 June 2026</h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Rugby Premier League 2026 is currently in the pre-season planning phase. 
            Draft details and full schedule will be released soon.
          </p>
        </div>
        <Card className="bg-primary/10 border-primary/30 p-6 max-w-sm">
           <p className="text-[11px] font-black text-primary uppercase tracking-[3px] mb-2">Key Dates</p>
           <p className="text-lg font-bold">June 2026</p>
           <p className="text-xs text-muted mt-1">Opening Ceremony & Initial Round</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <section className="relative h-[300px] rounded-3xl overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center group-hover:scale-105 transition-transform duration-[10s]" />
        
        <div className="relative z-20 h-full flex flex-col justify-center px-12 space-y-4">
          <div className="space-y-1">
             <Badge variant="primary">Broadcast Intelligence</Badge>
             <h2 className="text-6xl font-black italic tracking-tight leading-none">
               SEASON <span className="text-primary italic">TRENDS</span>
             </h2>
             <p className="text-muted text-sm uppercase tracking-[4px] font-bold">RPL League Analytics Center</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 pt-2">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-muted tracking-widest px-1">Competition</label>
                <select 
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="bg-secondary/50 backdrop-blur-xl border border-white/20 rounded-xl px-4 h-12 text-xs font-bold outline-none focus:border-primary transition-colors appearance-none min-w-[200px]"
                >
                  <option value="rpl2025">Rugby Premier League 2025</option>
                  <option value="rpl2026">Rugby Premier League 2026</option>
                </select>
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-muted tracking-widest px-1">Selection Mode</label>
                <div className="flex bg-secondary/50 backdrop-blur-xl p-1 rounded-xl border border-white/20 h-12 items-center">
                  <button
                    onClick={() => setViewType('team')}
                    className={cn(
                      "px-6 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      viewType === 'team' ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white"
                    )}
                  >
                    Team
                  </button>
                  <button
                    onClick={() => setViewType('player')}
                    className={cn(
                      "px-6 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      viewType === 'player' ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white"
                    )}
                  >
                    Player
                  </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {viewType === 'team' ? (
        <>
          <div className="flex flex-wrap items-center gap-6">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-muted tracking-widest px-1">Primary Team</label>
                <div className="flex flex-wrap items-center bg-card-bg-light border border-white/10 rounded-xl p-1.5 min-h-[48px] h-auto">
                   {teams.map(t => (
                     <button
                       key={t.teamId}
                       onClick={() => setSelectedTeam(t.teamId)}
                       className={cn(
                         "h-9 px-4 rounded-lg flex items-center justify-center transition-all",
                         selectedTeam === t.teamId ? "bg-primary text-white shadow-lg" : "text-muted hover:text-white"
                       )}
                     >
                       <span className="text-xs font-black uppercase tracking-tighter">{t.teamId}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="h-12 w-px bg-white/10 hidden md:block" />

             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-muted tracking-widest px-1">Comparison Team</label>
                <div className="flex flex-wrap items-center bg-card-bg-light border border-white/10 rounded-xl p-1.5 min-h-[48px] h-auto">
                   {teams.map(t => (
                     <button
                       key={t.teamId}
                       onClick={() => setCompareTeam(t.teamId)}
                       className={cn(
                         "h-9 px-4 rounded-lg flex items-center justify-center transition-all",
                         compareTeam === t.teamId ? "bg-blue-600 text-white shadow-lg" : "text-muted hover:text-white"
                       )}
                     >
                       <span className="text-xs font-black uppercase tracking-tighter">{t.teamId}</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Attack Efficiency" 
              value={`${((currentTeam?.pointsScored || 0) / 12).toFixed(1)}`}
              sub="Points per Match Avg"
              trend={12}
              icon={Zap}
              color="text-primary"
            />
            <StatCard 
              label="Defensive Impact" 
              value={`${((currentTeam?.tackles || 0) / 12).toFixed(1)}`}
              sub="Tackles per Match Avg"
              trend={-5}
              icon={ShieldAlert}
              color="text-blue-500"
            />
            <StatCard 
              label="Conversion Success" 
              value={`${currentTeam?.conversionSuccess}%`}
              sub="Success rate from Tee"
              icon={Trophy}
              color="text-orange-500"
            />
            <StatCard 
              label="Turnover Dominance" 
              value={currentTeam?.turnoversWon || 0}
              sub="Possession swings won"
              trend={8}
              icon={Zap}
              color="text-green-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card id="trends-momentum-line" className="lg:col-span-2 p-8 relative">
                <DownloadButton 
                  onClick={() => downloadChartAsPng('trends-momentum-line', 'Team_Scoring_Momentum_Line')} 
                  isDownloading={isDownloadingChart === 'trends-momentum-line'}
                />
               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                 <div>
                   <h4 className="text-xl font-bold italic tracking-tight">MOMENTUM <span className="text-primary">LINE</span></h4>
                   <p className="text-xs text-muted">Cumulative scoring progression match-by-match</p>
                 </div>
                 <div className="flex gap-4 pr-8">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-primary" />
                     <span className="text-[10px] font-black uppercase text-muted tracking-widest">{selectedTeam}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-blue-600" />
                     <span className="text-[10px] font-black uppercase text-muted tracking-widest">{compareTeam}</span>
                   </div>
                 </div>
               </div>
               <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={momentumData}>
                      <defs>
                        <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A12806" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#A12806" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis 
                        dataKey="match" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--secondary)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey={selectedTeam} stroke="#A12806" strokeWidth={4} fillOpacity={1} fill="url(#colorA)" />
                      <Area type="monotone" dataKey={compareTeam} stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorB)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
             </Card>
 
             <Card id="trends-profile-radar" className="p-8 flex flex-col items-center justify-center bg-card-bg-light relative">
                <DownloadButton 
                  onClick={() => downloadChartAsPng('trends-profile-radar', 'Team_DNA_Radar_Comparison')} 
                  isDownloading={isDownloadingChart === 'trends-profile-radar'}
                />
               <div className="text-center mb-8">
                 <h4 className="text-xl font-bold italic tracking-tight">PROFILE <span className="text-primary">RADAR</span></h4>
                 <p className="text-xs text-muted">Multi-dimensional team DNA comparison</p>
               </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={combinedRadarData}>
                    <PolarGrid stroke="var(--chart-grid)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                       name={selectedTeam}
                       dataKey="A"
                       stroke="#A12806"
                       fill="#A12806"
                       fillOpacity={0.6}
                    />
                    <Radar
                       name={compareTeam}
                       dataKey="B"
                       stroke="#2563eb"
                       fill="#2563eb"
                       fillOpacity={0.4}
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--secondary)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-col gap-3 w-full">
                 <div className="flex justify-between items-center p-3 bg-secondary rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                       <span className="text-[10px] font-black uppercase">{currentTeam?.teamName}</span>
                    </div>
                    <span className="text-xs font-bold">{(combinedRadarData.reduce((acc, d) => acc + d.A, 0) / 6).toFixed(1)} Pwr</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-secondary rounded-xl border border-border">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-600" />
                       <span className="text-[10px] font-black uppercase">{comparisonTeamData?.teamName}</span>
                    </div>
                    <span className="text-xs font-bold">{(combinedRadarData.reduce((acc, d) => acc + (d.B as number), 0) / 6).toFixed(1)} Pwr</span>
                 </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
               <div className="flex items-center gap-3 mb-8">
                  <BarChart3 className="text-primary" />
                  <div>
                    <h4 className="text-xl font-bold italic tracking-tight uppercase">Set Piece <span className="text-primary italic">Efficiency</span></h4>
                    <p className="text-xs text-muted">Scrum & Lineout win ratios across the season</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  {[
                    { label: 'Scrum Success', val1: currentTeam?.scrumWon, val2: currentTeam?.scrumLost, color: 'bg-primary' },
                    { label: 'Lineout Success', val1: currentTeam?.lineoutWon, val2: currentTeam?.lineoutLost, color: 'bg-blue-500' },
                  ].map(stat => {
                    const total = (stat.val1 || 0) + (stat.val2 || 0);
                    const pct = total > 0 ? ((stat.val1 || 0) / total) * 100 : 0;
                    return (
                      <div key={stat.label} className="space-y-2">
                         <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                           <span>{stat.label}</span>
                           <span className="text-primary">{pct.toFixed(1)}%</span>
                         </div>
                         <div className="h-6 bg-white/5 rounded-lg overflow-hidden border border-white/5 flex">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              className={cn("h-full flex items-center justify-end px-3 text-[10px] font-black", stat.color)}
                            >
                              WON {stat.val1}
                            </motion.div>
                            <div className="flex-1 bg-red-500/20 flex items-center px-3 text-[10px] font-black text-red-500">
                              LOST {stat.val2}
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>

               <div className="mt-8 pt-8 border-t border-border flex justify-between items-center text-center sm:text-left flex-col sm:flex-row gap-4">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-muted tracking-widest">League Standing</p>
                     <p className="text-lg font-bold">#{currentTeam?.rank} Ranked Attack</p>
                  </div>
                  <div className="sm:text-right">
                     <p className="text-[10px] font-black uppercase text-muted tracking-widest">Total Handling Errors</p>
                     <p className="text-lg font-bold text-red-500">{currentTeam?.handlingErrors}</p>
                  </div>
               </div>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Users size={120} />
               </div>
               <div className="relative z-10 h-full flex flex-col">
                  <h4 className="text-xl font-bold italic tracking-tight uppercase mb-8">AI <span className="text-primary italic">INSIGHTS</span></h4>
                  <div className="space-y-4 flex-1">
                     <div className="p-4 bg-secondary/80 rounded-2xl border border-primary/20 backdrop-blur-sm">
                        <p className="text-xs leading-relaxed italic">
                           <span className="text-primary font-black uppercase not-italic mr-2">Top Performer Found:</span>
                           {currentTeam?.teamName} average <span className="font-bold underline underline-offset-4">{((currentTeam?.pointsScored || 0) / 12).toFixed(1)}</span> points per game — 
                           {currentTeam?.pointsScored! > leagueAvg.points ? ' significantly above' : ' below'} league median.
                        </p>
                     </div>
                     <div className="p-4 bg-secondary/80 rounded-2xl border border-primary/20 backdrop-blur-sm">
                        <p className="text-xs leading-relaxed italic">
                           <span className="text-primary font-black uppercase not-italic mr-2">Defense Analysis:</span>
                           The team has completed <span className="font-bold">{currentTeam?.tackles}</span> tackles with a physical index of <span className="font-bold">{( (currentTeam?.tackles || 0) / 212).toFixed(2)}</span>.
                        </p>
                     </div>
                     <div className="p-4 bg-secondary/80 rounded-2xl border border-primary/20 backdrop-blur-sm">
                        <p className="text-xs leading-relaxed italic">
                           <span className="text-primary font-black uppercase not-italic mr-2">Momentum Spike:</span>
                           Season high recorded in <span className="font-bold">Match 27</span> (61 agg pts), indicating an aggressive offensive progression as the league entered the knockout phase.
                        </p>
                     </div>
                  </div>
                  <button className="mt-8 w-full py-4 bg-primary text-white font-black uppercase text-[10px] tracking-[4px] rounded-xl hover:bg-red-700 transition-colors shadow-xl">
                     Generate Custom Report
                  </button>
               </div>
            </Card>
          </div>

          <h3 className="text-2xl font-black italic tracking-widest uppercase border-l-4 border-primary pl-6 py-2">Match <span className="text-primary italic">Highlights & Records</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-card-bg-light">
               <div className="flex items-center gap-3 mb-6">
                  <Zap className="text-primary" />
                  <h4 className="text-lg font-bold italic uppercase">Performance Benchmarks</h4>
               </div>
               <div className="space-y-4">
                  {[
                    { label: 'Highest Team Score', val: '43 Points', team: 'Hyderabad Heroes', sub: 'vs BB (Match 7) & KBT (Match 11)' },
                    { label: 'Highest Points Aggregate', val: '61 Points', team: 'KBT vs CB', sub: 'Match 27 (21-40)' },
                    { label: 'Most Tries in a Match', val: '10 Tries', team: 'BB vs KBT', sub: 'Match 25' },
                    { label: 'Lowest Score (Finals)', val: '0 Points', team: 'Delhi Redz', sub: 'vs Chennai Bulls (Final Match)' },
                  ].map((rec, i) => (
                    <div key={i} className="p-4 bg-secondary rounded-xl border border-border group hover:border-primary transition-colors">
                       <p className="text-[9px] font-black uppercase text-muted tracking-widest mb-1">{rec.label}</p>
                       <div className="flex justify-between items-end">
                          <span className="text-2xl font-black italic text-primary">{rec.val}</span>
                          <span className="text-[10px] font-bold uppercase">{rec.team}</span>
                       </div>
                       <p className="text-[9px] text-muted mt-1">{rec.sub}</p>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-8 lg:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                  <Trophy className="text-primary" />
                  <h4 className="text-lg font-bold italic uppercase">Key Moments</h4>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {seasonMatches.filter(m => m.notes).map((m, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                       <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {m.no}
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{m.home} vs {m.away}</p>
                          <p className="text-sm font-bold tracking-tight mb-2 leading-tight">{m.notes}</p>
                          <div className="inline-flex px-2 py-1 bg-secondary rounded text-[9px] font-bold uppercase tracking-tighter">
                             Score: {m.hPts} - {m.aPts}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <button
                key={p.name}
                onClick={() => setSelectedPlayer(p.name)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-2",
                  selectedPlayer === p.name
                    ? "bg-primary border-primary text-white"
                    : "bg-white/5 border-white/10 text-muted hover:text-white"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card id="player-performance-distribution" className="p-8 relative">
                <DownloadButton 
                  onClick={() => downloadChartAsPng('player-performance-distribution', `${currentPlayer?.name || 'Player'}_Performance_Distribution`)} 
                  isDownloading={isDownloadingChart === 'player-performance-distribution'}
                />
                <h4 className="text-xl font-bold italic tracking-tight uppercase mb-8">Performance <span className="text-primary italic">Distribution</span></h4>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Points', val: currentPlayer?.pts || 0 },
                      { name: 'Tries', val: (currentPlayer?.tries || 0) * 5 },
                      { name: 'Tackles', val: currentPlayer?.tackles || 0 },
                      { name: 'Offloads', val: currentPlayer?.offloads || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: 'var(--muted)', opacity: 0.1 }} contentStyle={{ backgroundColor: 'var(--secondary)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                      <Bar dataKey="val" fill="#A12806" radius={[6, 6, 0, 0]} barSize={50}>
                         { [0,1,2,3].map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#A12806' : '#2563eb'} />
                         )) }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-muted text-center mt-4 font-bold uppercase tracking-widest leading-loose">
                   * Tries value is scaled (x5) for volume comparison against total points.
                </p>
             </Card>

             <Card className="p-8 bg-card-bg-light flex flex-col justify-between">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-24 h-24 rounded-2xl bg-secondary border-2 border-primary flex items-center justify-center text-4xl font-black italic shadow-2xl">
                     {selectedPlayer.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-4xl font-black italic tracking-tighter uppercase">{selectedPlayer}</h3>
                     <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{currentPlayer?.team}</Badge>
                        <Badge variant="outline">{currentPlayer?.nat}</Badge>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-secondary p-6 rounded-2xl border border-border">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Total Points</p>
                      <h4 className="text-4xl font-black text-primary italic">{currentPlayer?.pts}</h4>
                   </div>
                   <div className="bg-secondary p-6 rounded-2xl border border-border">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Total Tries</p>
                      <h4 className="text-4xl font-black text-primary italic">{currentPlayer?.tries}</h4>
                   </div>
                </div>

                <div className="mt-8 space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted tracking-[3px]">
                      <span>Technical Index</span>
                      <span className="text-primary italic">Live Analysis</span>
                   </div>
                   <div className="space-y-3">
                      {[
                        { label: 'Impact Efficiency', val: ((currentPlayer?.pts || 0) / 100) * 100 },
                        { label: 'Defensive Value', val: ((currentPlayer?.tackles || 0) / 40) * 100 },
                      ].map(stat => (
                        <div key={stat.label} className="h-4 bg-secondary rounded-full overflow-hidden border border-border">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${Math.min(stat.val, 100)}%` }}
                             className="h-full bg-primary"
                           />
                        </div>
                      ))}
                   </div>
                </div>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamPerformanceSection({ 
  pack,
  selectedTeams,
  setSelectedTeams
}: { 
  pack: MatchPack;
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
}) {

  const [isDownloadingChart, setIsDownloadingChart] = useState<string | null>(null);

  const downloadChartAsPng = async (elementId: string, chartName: string) => {
    setIsDownloadingChart(elementId);
    try {
      await new Promise(r => setTimeout(r, 100));
      const el = document.getElementById(elementId);
      if (el) {
        const dataUrl = await toPng(el, {
          quality: 0.98,
          backgroundColor: '#0e1218',
          pixelRatio: 2.5,
          filter: (node) => {
            if (node instanceof HTMLElement) {
              return !node.classList.contains('no-export');
            }
            return true;
          }
        });
        const link = document.createElement('a');
        link.download = `${chartName.replace(/[^a-zA-Z0-9_\-]+/g, '_')}.png`;
        link.style.display = 'none';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingChart(null);
    }
  };

  const toggleTeam = (id: string) => {
    if (selectedTeams.includes(id)) {
      if (selectedTeams.length > 1) setSelectedTeams(selectedTeams.filter(t => t !== id));
    } else {
      setSelectedTeams([...selectedTeams, id]);
    }
  };

  const chartData = pack.standings
    .filter(s => selectedTeams.includes(s.teamId))
    .map(s => ({
      name: s.teamId,
      Points: s.pointsScored,
      Tries: s.tries,
      TriesScaled: s.tries * 5,
    }));

  const activeTeamsData = pack.standings.filter(s => selectedTeams.includes(s.teamId));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="section-title mb-0">Team Performance Profile</h3>
        <div className="flex flex-wrap gap-2">
          {pack.standings.map(team => (
            <button 
              key={team.teamId}
              onClick={() => toggleTeam(team.teamId)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                selectedTeams.includes(team.teamId) 
                  ? "bg-primary border-primary text-white" 
                  : "bg-white/5 border-white/10 text-muted hover:text-white"
              )}
            >
              {team.teamId}
            </button>
          ))}
        </div>
      </div>

      <Card id="team-performance-chart" className="h-[400px] py-10 px-4 relative">
        <div className="absolute top-4 right-14 flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest select-none">
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /> Points</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-chart-bar-bg" /> Tries (Relative)</div>
        </div>
        <DownloadButton 
          onClick={() => downloadChartAsPng('team-performance-chart', 'Team_Performance_Profile')} 
          isDownloading={isDownloadingChart === 'team-performance-chart'}
        />
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--muted)', fontSize: 13, fontWeight: 'bold' }} 
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip 
              cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-secondary border border-border p-3 rounded-lg shadow-2xl">
                      <p className="text-xs font-bold text-text-main mb-2">{payload[0].payload.name}</p>
                      <p className="text-sm font-bold text-primary">Points: {payload[0].value}</p>
                      <p className="text-sm font-bold text-muted">Tries: {payload[0].payload.Tries}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="Points" fill="#A12806" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="TriesScaled" fill="var(--chart-bar-bg)" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTeamsData.map(team => (
          <Card key={team.teamId} className="space-y-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-3">
               <div>
                 <div className="font-bold text-lg">{team.teamName}</div>
                 <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Team Metrics</div>
               </div>
               <div className="w-10 h-10 rounded bg-card-bg-light flex items-center justify-center font-bold border border-white/10">
                 {team.teamId}
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold">Played</div>
                  <div className="text-xl font-bold">{team.played}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold text-right">League PT</div>
                  <div className="text-xl font-bold text-right">{team.leaguePoints}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold">PTS Scored</div>
                  <div className="text-lg font-bold">{team.pointsScored}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-bold text-right">Tries</div>
                  <div className="text-lg font-bold text-right">{team.tries}</div>
                </div>
                <div>
                   <div className="text-[10px] text-muted uppercase font-bold">Conv.</div>
                   <div className="text-lg font-bold">{team.conversions}</div>
                </div>
                <div>
                   <div className="text-[10px] text-muted uppercase font-bold text-right">SD</div>
                   <div className="text-lg font-bold text-right">{team.scoreDiff}</div>
                </div>
                <div className="col-span-2 pt-2">
                   <div className="text-[10px] text-muted uppercase font-bold mb-1">Score Difference</div>
                   <div className="flex items-center gap-3">
                     <div className="h-1.5 flex-1 bg-muted/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${Math.max(0, (team.scoreDiff + 100) / 300) * 100}%` }} />
                     </div>
                     <span className="text-sm font-bold">{team.scoreDiff}</span>
                   </div>
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MatchupSection({
  matchupPairs,
  setMatchupPairs,
  p1Idx,
  setP1Idx,
  p2Idx,
  setP2Idx,
  players
}: {
  matchupPairs: { p1: Player; p2: Player }[];
  setMatchupPairs: React.Dispatch<React.SetStateAction<{ p1: Player; p2: Player }[]>>;
  p1Idx: number;
  setP1Idx: (idx: number) => void;
  p2Idx: number;
  setP2Idx: (idx: number) => void;
  players: Player[];
}) {
  const allPlayers = players;

  const addMatchup = () => {
    const p1 = allPlayers[p1Idx];
    const p2 = allPlayers[p2Idx];
    if (p1 && p2) setMatchupPairs([...matchupPairs, { p1, p2 }]);
  };

  const suggestedBattles = [
    { n1: 'Terio Tamani', n2: 'Selvyn Davids', label: 'Top Playmakers' },
    { n1: 'Vaafauese Apelu Maliko', n2: 'Jordan Sepho', label: 'Power Finishers' },
    { n1: 'Prince Khatri', n2: 'Naveen Kumar', label: 'Indian Rising Stars' },
  ];

  const addSuggested = (n1: string, n2: string) => {
    const p1 = allPlayers.find(p => p.name === n1);
    const p2 = allPlayers.find(p => p.name === n2);
    if (p1 && p2) {
      setMatchupPairs([...matchupPairs, { p1, p2 }]);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="section-title mb-1">Player Battle Center</h3>
          <p className="text-xs text-muted font-medium uppercase tracking-widest">Scientific side-by-side performance audit</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest self-center mr-2">Featured:</span>
          {suggestedBattles.map(b => (
            <button 
              key={b.label}
              onClick={() => addSuggested(b.n1, b.n2)}
              className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      
      <Card className="flex flex-col md:flex-row items-end gap-6 p-8 bg-card-bg-light border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Zap size={140} />
        </div>
        <div className="flex-1 space-y-2 w-full">
          <label className="text-[10px] font-bold uppercase text-muted tracking-widest">Player A</label>
          <select 
            value={p1Idx} 
            onChange={e => setP1Idx(Number(e.target.value))}
            className="w-full bg-secondary border border-border p-3 rounded-lg text-sm appearance-none outline-none focus:border-primary"
          >
            {allPlayers.map((p, i) => <option key={i} value={i}>{p.name} ({p.team})</option>)}
          </select>
        </div>
        <div className="p-3 font-bold text-primary italic opacity-50 hidden md:block">VS</div>
        <div className="flex-1 space-y-2 w-full">
           <label className="text-[10px] font-bold uppercase text-muted tracking-widest">Player B</label>
           <select 
             value={p2Idx}
             onChange={e => setP2Idx(Number(e.target.value))}
             className="w-full bg-secondary border border-border p-3 rounded-lg text-sm appearance-none outline-none focus:border-primary"
           >
             {allPlayers.map((p, i) => <option key={i} value={i}>{p.name} ({p.team})</option>)}
           </select>
        </div>
        <button 
          onClick={addMatchup}
          className="bg-primary hover:bg-red-700 text-white font-bold h-[48px] px-6 rounded-lg uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Add Match-up
        </button>
      </Card>

      {matchupPairs.length === 0 ? (
        <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
           <Zap size={48} />
           <p className="font-bold tracking-widest uppercase">Select players to compare performance</p>
        </div>
      ) : (
        <div className="space-y-12">
          {matchupPairs.map((pair, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex justify-between items-center mb-4 px-2">
                 <div className="text-left w-1/3">
                   <div className="text-xl font-bold text-text-main/90">{pair.p1.name}</div>
                   <div className="flex items-center gap-2 mt-1">
                     <div className="w-5 h-5 rounded border border-border overflow-hidden bg-card-bg-light p-0.5">
                       <TeamLogo teamIdOrName={pair.p1.team} />
                     </div>
                     <Badge variant="primary">{pair.p1.team}</Badge>
                   </div>
                 </div>
                 <div className="font-bold text-primary italic text-center w-1/3">VS</div>
                 <div className="text-right w-1/3">
                   <div className="text-xl font-bold text-text-main/90">{pair.p2.name}</div>
                   <div className="flex items-center justify-end gap-2 mt-1">
                     <Badge variant="primary">{pair.p2.team}</Badge>
                     <div className="w-5 h-5 rounded border border-border overflow-hidden bg-card-bg-light p-0.5">
                       <TeamLogo teamIdOrName={pair.p2.team} />
                     </div>
                   </div>
                 </div>
               </div>
               
               <Card className="p-0 overflow-hidden border-primary/20">
                 <table className="w-full">
                   <tbody className="divide-y divide-border/50">
                     {Object.entries(STAT_LABELS).map(([key, label]) => {
                       const v1 = (pair.p1 as any)[key] || 0;
                       const v2 = (pair.p2 as any)[key] || 0;
                       return (
                         <tr key={key} className="hover:bg-white/5 transition-colors">
                           <td className={cn("p-3 w-1/3 text-right font-bold text-lg", v1 > v2 && "text-primary")}>{v1}</td>
                           <td className="p-3 w-1/3 text-center text-[10px] uppercase font-bold text-muted tracking-widest bg-white/5">{label}</td>
                           <td className={cn("p-3 w-1/3 text-left font-bold text-lg", v2 > v1 && "text-primary")}>{v2}</td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerProfilesSection({
  selectedNames,
  setSelectedNames,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  filters,
  setFilters,
  players
}: {
  selectedNames: string[];
  setSelectedNames: (names: string[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'card' | 'list';
  setViewMode: (v: 'card' | 'list') => void;
  filters: any;
  setFilters: (f: any) => void;
  players: Player[];
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'pts', 
    direction: 'desc' 
  });

  const ALL_TEAMS = Array.from(new Set(players.map(p => p.team))).sort();

  const getFilteredPlayers = () => {
    return players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.nat.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filters.type === 'all' || 
                         (filters.type === 'indian' && p.isIndian) || 
                         (filters.type === 'overseas' && !p.isIndian);
      
      const matchesSeason = filters.season === 'both' || 
                           (filters.season === 's1' && p.seasons?.includes(1)) || 
                           (filters.season === 's2' && p.seasons?.includes(2));

      const matchesTeam = filters.team === 'all' || p.team === filters.team;

      return matchesSearch && matchesType && matchesSeason && matchesTeam;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      const isSameKey = prev.key === key;
      const numericKeys = ['pts', 'tries', 'conv', 'tackles', 'offloads', 'linebreaks', 'turnovers', 'defbeaten'];
      
      if (!isSameKey) {
        // Default direction for new sort
        return { key, direction: numericKeys.includes(key) ? 'desc' : 'asc' };
      }
      
      return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
    });
  };

  const sortPlayers = (players: Player[]) => {
    return [...players].sort((a, b) => {
      let aVal: any = (a as any)[sortConfig.key];
      let bVal: any = (b as any)[sortConfig.key];

      if (sortConfig.key === 'player') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortConfig.key === 'team') {
        aVal = a.team;
        bVal = b.team;
      }

      if (aVal === undefined || aVal === null) aVal = 0;
      if (bVal === undefined || bVal === null) bVal = 0;

      if (typeof aVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const filteredPlayers = getFilteredPlayers();
  const sortedSelectedPlayers = sortPlayers(players.filter(p => selectedNames.includes(p.name)));

  const handleGo = () => {
    const matchedNames = filteredPlayers.map(p => p.name);
    setSelectedNames(Array.from(new Set([...selectedNames, ...matchedNames])));
    setShowDropdown(false);
  };

  const togglePlayer = (name: string) => {
    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter(n => n !== name));
    } else {
      setSelectedNames([...selectedNames, name]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const selectedPlayers = players.filter(p => selectedNames.includes(p.name));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <h3 className="section-title mb-0">Player Analytics & Profiles</h3>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Player Selection Dropdown */}
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Direct Player Select</label>
              <div className="relative">
                <select
                  onChange={(e) => {
                    const name = e.target.value;
                    if (name && !selectedNames.includes(name)) {
                      togglePlayer(name);
                    }
                  }}
                  className="w-full bg-secondary border border-white/10 rounded-lg py-2 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary appearance-none pr-10"
                >
                  <option value="">Select a player...</option>
                  {players.map(p => (
                    <option key={p.name} value={p.name}>{p.name} ({p.team})</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              {['all', 'indian', 'overseas'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilters({ ...filters, type: t })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                    filters.type === t ? "bg-primary text-white" : "text-muted hover:text-text-main"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Season Filter */}
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              {['s1', 's2', 'both'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilters({ ...filters, season: s })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                    filters.season === s ? "bg-primary text-white" : "text-muted hover:text-text-main"
                  )}
                >
                  {s === 'both' ? 'Cumulative' : s.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Team Filter Dropdown + Go */}
            <div className="flex gap-2 items-center">
              <div className="relative group">
                <select
                  value={filters.team}
                  onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                  className="bg-secondary border border-white/10 rounded-lg py-2 px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary appearance-none pr-10 min-w-[140px]"
                >
                  <option value="all">All Teams</option>
                  {ALL_TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <ChevronDown size={14} />
                </div>
              </div>
              
              <button 
                onClick={handleGo}
                className="bg-primary hover:bg-red-700 text-white font-bold h-[32px] px-4 rounded-lg uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Go <Zap size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4 border-t border-border pt-4">
           <span className="text-[10px] font-bold uppercase text-muted tracking-widest">Layout:</span>
           <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button
                onClick={() => setViewMode('card')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  viewMode === 'card' ? "bg-card-bg-light text-text-main shadow-lg" : "text-muted hover:text-text-main"
                )}
              >
                <LayoutDashboard size={12} /> Card View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  viewMode === 'list' ? "bg-card-bg-light text-text-main shadow-lg" : "text-muted hover:text-text-main"
                )}
              >
                <TableIcon size={12} /> List View
              </button>
           </div>
           {selectedNames.length > 0 && (
             <button 
               onClick={() => setSelectedNames([])}
               className="text-[9px] font-bold uppercase text-primary hover:text-red-400 transition-colors tracking-widest ml-auto"
             >
               Clear All ({selectedNames.length})
             </button>
           )}
        </div>

        <div className="space-y-4">
          {/* Selected Chips */}
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            <AnimatePresence>
              {selectedPlayers.map(p => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-full text-xs font-bold"
                >
                  <span>{p.name}</span>
                  <button onClick={() => togglePlayer(p.name)} className="hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text"
                placeholder="Search players by name, team or nationality..."
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-card-bg-light border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all shadow-lg"
              />
            </div>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-[60]" 
                  onClick={() => setShowDropdown(false)} 
                />
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[100] bg-card-bg border border-border rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden max-h-[400px] flex flex-col ring-1 ring-primary/20">
                  <div className="p-3 border-b border-border bg-muted/5 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Results for "{searchQuery}"</span>
                    <button onClick={() => setShowDropdown(false)} className="text-muted hover:text-white transition-colors p-1">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="overflow-y-auto scrollbar-hide flex-1">
                    {filteredPlayers.length > 0 ? (
                      <div className="divide-y divide-border/20">
                        {filteredPlayers.map(p => (
                          <button
                            key={p.name}
                            onClick={() => togglePlayer(p.name)}
                            className={cn(
                              "w-full text-left p-3 hover:bg-muted/10 transition-all flex justify-between items-center group",
                              selectedNames.includes(p.name) ? "opacity-30 pointer-events-none" : "hover:pl-4"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-card-bg-light border border-border flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-inner">
                                <TeamLogo teamIdOrName={p.team} />
                              </div>
                              <div>
                                 <div className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
                                   {p.name}
                                   <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/10 text-muted font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">{p.team}</span>
                                 </div>
                                 <div className="text-[10px] text-muted uppercase tracking-wide font-semibold flex items-center gap-2 mt-0.5">
                                   <span>{p.nat}</span>
                                   <span className="w-1 h-1 rounded-full bg-muted/30" />
                                   <span>{p.isIndian ? 'Indian' : 'Overseas'}</span>
                                 </div>
                              </div>
                            </div>
                            <div className="shrink-0 text-muted group-hover:text-primary transition-all pr-2">
                              {selectedNames.includes(p.name) ? (
                                <div className="text-primary/50 text-[10px] font-bold uppercase tracking-widest">Added</div>
                              ) : (
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center flex flex-col items-center gap-4 opacity-40">
                        <Search size={32} />
                        <div className="text-sm font-bold uppercase tracking-widest">No matching players found</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'card' ? (
          <motion.div
            key="card-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-8"
          >
            {selectedPlayers.map(p => (
              <motion.div
                key={p.name}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-0 overflow-hidden flex flex-col md:flex-row h-full">
                  {/* Image Section */}
                  <div className="w-full md:w-48 bg-muted/5 flex flex-col items-center justify-center p-6 border-r border-border relative overflow-hidden">
                    {/* Fixed pixelation: replaced blur-3xl with subtle radial gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10" />
                    <div className="w-32 h-32 rounded-full bg-card-bg-light border-4 border-primary/20 flex items-center justify-center relative z-10 p-6 mb-4 overflow-hidden">
                       <TeamLogo teamIdOrName={p.team} />
                    </div>
                    <div className="relative z-10 text-center">
                      <div className="text-lg font-bold truncate w-full">{p.name}</div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                         <div className="w-4 h-4 rounded-sm bg-card-bg-light flex items-center justify-center border border-border overflow-hidden p-0.5">
                           <TeamLogo teamIdOrName={p.team} />
                         </div>
                         <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{p.team} · {p.nat}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Table */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-[3px] text-muted">Player Metrics</h4>
                      <button onClick={() => togglePlayer(p.name)} className="text-muted hover:text-primary transition-colors">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                      {[
                        { label: 'Points', value: p.pts },
                        { label: 'Tries', value: p.tries },
                        { label: 'Conv', value: p.conv || '—' },
                        { label: 'Tackles', value: p.tackles || '—' },
                        { label: 'Offloads', value: p.offloads || '—' },
                        { label: 'L-Breaks', value: p.linebreaks || '—' },
                        { label: 'TO Won', value: p.turnovers || '—' },
                        { label: 'Def Beaten', value: p.defbeaten || '—' },
                      ].map(stat => (
                        <div key={stat.label} className="space-y-1">
                          <div className="text-[9px] font-bold text-muted uppercase tracking-widest">{stat.label}</div>
                          <div className="text-xl font-medium tracking-tight whitespace-nowrap">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border flex gap-4">
                      <div>
                        <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Discipline</div>
                        <div className="flex gap-2">
                          <div className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-500/20">{p.yc || 0} YC</div>
                          <div className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/20">{p.rc || 0} RC</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Participation</div>
                        <div className="flex gap-2">
                          {p.seasons?.map(s => (
                            <div key={s} className="bg-muted/10 text-text-main px-2 py-0.5 rounded text-[10px] font-bold border border-border">S{s}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-0 overflow-visible">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="z-30 shadow-lg">
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      {[
                        { key: 'player', label: 'Player', align: 'left', minW: '200px' },
                        { key: 'team', label: 'Team', align: 'left' },
                        { key: 'pts', label: 'PTS', align: 'center' },
                        { key: 'tries', label: 'T', align: 'center' },
                        { key: 'conv', label: 'CONV', align: 'center' },
                        { key: 'tackles', label: 'TKL', align: 'center' },
                        { key: 'offloads', label: 'OFF', align: 'center' },
                        { key: 'linebreaks', label: 'LB', align: 'center' },
                        { key: 'turnovers', label: 'TO', align: 'center' },
                        { key: 'defbeaten', label: 'DB', align: 'center' },
                      ].map((header) => (
                        <th 
                          key={header.key}
                          onClick={() => handleSort(header.key)}
                          className={cn(
                            "sticky top-14 bg-secondary px-4 py-4 z-40 cursor-pointer hover:bg-muted/20 transition-colors group/th",
                            header.align === 'center' ? "text-center" : "text-left",
                            header.minW && `min-w-[${header.minW}]`,
                            sortConfig.key === header.key && "text-primary shadow-[inset_0_-2px_0_0_currentColor]"
                          )}
                        >
                          <div className={cn("flex items-center gap-2", header.align === 'center' ? "justify-center" : "justify-start")}>
                            <span className="truncate">{header.label}</span>
                            <div className="flex flex-col shrink-0">
                               <ChevronUp size={8} className={cn("-mb-0.5 transition-colors", sortConfig.key === header.key && sortConfig.direction === 'asc' ? "text-primary" : "text-muted/40 group-hover/th:text-muted")} />
                               <ChevronDown size={8} className={cn("-mt-0.5 transition-colors", sortConfig.key === header.key && sortConfig.direction === 'desc' ? "text-primary" : "text-muted/40 group-hover/th:text-muted")} />
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="sticky top-14 bg-secondary px-4 py-4 text-right z-40">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {sortedSelectedPlayers.map((p) => (
                      <tr key={p.name} className="hover:bg-muted/5 transition-colors group">
                        <td className="px-4 py-4 font-bold border-r border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                               {p.nat}
                            </div>
                            <span className="truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded bg-card-bg-light border border-border p-1">
                               <TeamLogo teamIdOrName={p.team} />
                             </div>
                             <Badge variant="primary">{p.team}</Badge>
                           </div>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-primary">{p.pts}</td>
                        <td className="px-4 py-4 text-center">{p.tries}</td>
                        <td className="px-4 py-4 text-center opacity-60">{p.conv || '0'}</td>
                        <td className="px-4 py-4 text-center opacity-60">{p.tackles || '0'}</td>
                        <td className="px-4 py-4 text-center opacity-60">{p.offloads || '0'}</td>
                        <td className="px-4 py-4 text-center opacity-60">{p.linebreaks || '0'}</td>
                        <td className="px-4 py-4 text-center opacity-60">{p.turnovers || '0'}</td>
                        <td className="px-4 py-4 text-center opacity-60">{p.defbeaten || '0'}</td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => togglePlayer(p.name)}
                            className="bg-red-500/10 text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedNames.length === 0 && (
         <div className="border border-dashed border-white/10 rounded-2xl p-20 text-center opacity-30">
           <p className="text-sm font-bold uppercase tracking-widest mb-4">No profiles selected</p>
           <p className="text-xs max-w-xs mx-auto leading-relaxed">Search for players or use the "Go" button to select multiple profiles for comparison.</p>
         </div>
      )}
    </div>
  );
}
