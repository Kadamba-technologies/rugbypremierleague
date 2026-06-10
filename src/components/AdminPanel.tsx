import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  PlusCircle, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { MatchPack } from '../types';

export default function AdminPanel({ 
  pack, 
  onSaveConfig 
}: { 
  pack: MatchPack; 
  onSaveConfig?: (theme: string) => void 
}) {
  const [yellowCardThres, setYellowCardThres] = useState(3);
  const [clutchThreshold, setClutchThreshold] = useState(70);
  const [draftMatchesNum, setDraftMatchesNum] = useState(12);
  const [simulatedMatchesList, setSimulatedMatchesList] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const addNewSimulatedMatch = () => {
    const homeTeams = ['Hyderabad Heroes', 'Chennai Bulls', 'Delhi Redz', 'Mumbai Dreamers'];
    const awayTeams = ['Kalinga Black Tigers', 'Bengaluru Bravehearts', 'Kolkata Banga Tigers'];
    
    const h = homeTeams[Math.floor(Math.random() * homeTeams.length)];
    const a = awayTeams[Math.floor(Math.random() * awayTeams.length)];
    const hPts = Math.floor(Math.random() * 35) + 10;
    const aPts = Math.floor(Math.random() * 35) + 10;
    
    const outcome = `${h} ${hPts} - ${aPts} ${a} (Drafted Simulate Round ${simulatedMatchesList.length + 1})`;
    setSimulatedMatchesList(prev => [...prev, outcome]);
  };

  const handleSave = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
      
      {/* Left Column Settings sliders */}
      <div className="lg:col-span-1 bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Sliders className="text-primary" size={18} /> Criteria Thresholds
        </h3>

        {/* Card disciplinary trigger value */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
            <span>Inquiry Yellow Cards Trigger</span>
            <span>{yellowCardThres} Cards</span>
          </div>
          <input 
            type="range" 
            min={1} 
            max={6} 
            value={yellowCardThres}
            onChange={(e) => setYellowCardThres(Number(e.target.value))}
            className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[9px] text-muted">Players exceeding this value generate automated disciplinary flag indicators.</p>
        </div>

        {/* Clutch Performance slider value */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
            <span>Clutch Performance Rating Bias</span>
            <span>{clutchThreshold}%</span>
          </div>
          <input 
            type="range" 
            min={50} 
            max={95} 
            value={clutchThreshold}
            onChange={(e) => setClutchThreshold(Number(e.target.value))}
            className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[9px] text-muted font-medium">Clutch performance indexes score actions executed inside the final 10 minutes of plays.</p>
        </div>

        {/* Rounds scheduler count */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex justify-between text-[10px] font-bold text-muted uppercase">
            <span>Forecast S2 Round Matches</span>
            <span>{draftMatchesNum} Rounds</span>
          </div>
          <input 
            type="range" 
            min={8} 
            max={24} 
            value={draftMatchesNum}
            onChange={(e) => setDraftMatchesNum(Number(e.target.value))}
            className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-primary text-white hover:bg-red-700 font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          {isSuccess ? <Check size={15} /> : <Wrench size={15} />}
          Apply Admin Variables
        </button>
      </div>

      {/* Center - Simulated Game Queue Generator */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="text-yellow-500 animate-spin" size={18} /> Simulated Game Engine
              </h3>
              <p className="text-xs text-muted">Generate simulated matches dynamically in the active tournament pack</p>
            </div>
            
            <button
              onClick={addNewSimulatedMatch}
              className="py-2 px-4 rounded-xl border border-dashed border-primary text-[10px] font-bold uppercase hover:bg-primary/5 text-primary flex items-center gap-1.5 transition-all"
            >
              <PlusCircle size={14} /> Draft Match
            </button>
          </div>

          {/* List of Simulated Games */}
          {simulatedMatchesList.length > 0 ? (
            <div className="space-y-3">
              {simulatedMatchesList.map((sim, index) => (
                <div key={index} className="p-3.5 bg-secondary/20 border border-primary/20 rounded-xl flex justify-between items-center text-xs">
                  <div className="font-semibold text-zinc-300">
                     {sim}
                  </div>
                  <button 
                    onClick={() => setSimulatedMatchesList(prev => prev.filter((_, idx) => idx !== index))}
                    className="p-1 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-muted text-xs space-y-3">
              <ShieldCheck className="mx-auto text-zinc-600" size={32} />
              <div>
                <p className="font-bold text-zinc-400">Queue is empty</p>
                <p className="text-[10px] text-zinc-500">No simulated draft matches are currently active. Click "Draft Match" above to start testing.</p>
              </div>
            </div>
          )}

          {simulatedMatchesList.length > 0 && (
            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button 
                onClick={() => setSimulatedMatchesList([])}
                className="py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-muted hover:text-white transition-colors"
              >
                Clear Queue
              </button>
              <button 
                onClick={handleSave}
                className="py-2.5 px-6 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
              >
                Launch Simulation Updates
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
