import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Tv, 
  Settings, 
  Share2, 
  Download, 
  Trash2, 
  BookOpen, 
  Paintbrush, 
  Circle, 
  Square, 
  Undo, 
  Redo, 
  Save, 
  Plus, 
  ArrowRight,
  FileText,
  Move
} from 'lucide-react';
import { MatchPack, Player } from '../types';

interface DrawElement {
  id: string;
  type: 'freehand' | 'shape-circle' | 'shape-rectangle' | 'shape-arrow' | 'marker-x' | 'marker-o' | 'marker-play';
  color: string;
  size: number;
  // For freehand
  points?: { x: number; y: number }[];
  // For shapes / arrows / markers
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  // For play markers
  playType?: 'ruck' | 'scrum' | 'lineout' | 'tackle' | 'linebreak';
}

interface SavedBlueprint {
  id: string;
  name: string;
  timestamp: string;
  elements: DrawElement[];
}

export default function MediaStudio({ 
  pack, 
  allPlayers 
}: { 
  pack: MatchPack; 
  allPlayers: Player[] 
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMode, setActiveMode] = useState<'telestrator' | 'statcard'>('telestrator');
  
  // Tactical Board States
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [redoQueue, setRedoQueue] = useState<DrawElement[]>([]);
  const [brushColor, setBrushColor] = useState('#ff003c');
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<'freehand' | 'circle' | 'rectangle' | 'arrow' | 'x-marker' | 'o-marker' | 'ruck' | 'scrum' | 'lineout' | 'tackle' | 'linebreak' | 'move'>('freehand');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState<{ x: number; y: number } | null>(null);
  
  // Playlist Storage state
  const [blueprintName, setBlueprintName] = useState('First Phase Set Play');
  const [savedPlaylist, setSavedPlaylist] = useState<SavedBlueprint[]>([]);
  
  // Stat Card state
  const [cardPlayer, setCardPlayer] = useState<string>(allPlayers[0]?.name || '');
  const [cardTitle, setCardTitle] = useState('PLAYER OF THE WEEK');
  const [cardSubtitle, setCardSubtitle] = useState('Rugby Premier League Season 1');
  const [cardTheme, setCardTheme] = useState<'crimson' | 'gold' | 'monochrome'>('crimson');
  const [exportLoading, setExportLoading] = useState(false);

  const activePlayerObj = allPlayers.find(p => p.name === cardPlayer) || allPlayers[0];

  // Load Playlist from Local Storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kadamba-saved-blueprints');
      if (stored) {
        setSavedPlaylist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load blueprints playlist', e);
    }
  }, []);

  // Save Playlist to Local Storage helper
  const savePlaylistToStorage = (playlist: SavedBlueprint[]) => {
    try {
      localStorage.setItem('kadamba-saved-blueprints', JSON.stringify(playlist));
      setSavedPlaylist(playlist);
    } catch (e) {
      console.error('Failed to save blueprints playlist', e);
    }
  };

  // Base Rugby Field Background Redraw Block
  const drawRugbyField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Premium Turf Field Background Color
    ctx.fillStyle = '#0f2015'; // Dark tactical grass
    ctx.fillRect(0, 0, width, height);

    // Grid details for aesthetic high contrast broadcast vibe
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Play Boundaries
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(30, 25, width - 60, height - 50);

    // Halfway line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeRect(width / 2, 25, 0.5, height - 50);

    // 10-meter Dash lines (simulated offsets from middle line)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(width / 2 - 80, 25, 0.5, height - 50);
    ctx.strokeRect(width / 2 + 80, 25, 0.5, height - 50);

    // 22-meter solid line indicators
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    const line22Left = 110;
    const line22Right = width - 110;
    ctx.strokeRect(line22Left, 25, 0.5, height - 50);
    ctx.strokeRect(line22Right, 25, 0.5, height - 50);

    // Try areas/Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeRect(55, 25, 0.5, height - 50);
    ctx.strokeRect(width - 55, 25, 0.5, height - 50);

    // Add field indicators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TRY ZONE', 42, height / 2 - 40);
    ctx.fillText('TRY ZONE', width - 42, height / 2 - 40);
    
    ctx.fillText('22m', line22Left, 18);
    ctx.fillText('10m', width / 2 - 80, 18);
    ctx.fillText('50m', width / 2, 18);
    ctx.fillText('10m', width / 2 + 80, 18);
    ctx.fillText('22m', line22Right, 18);
  };

  // Safe round rect helper for play markers to avoid canvas crashes on old browsers
  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Render both pitch background and active markings
  const redrawAll = (drawElements: DrawElement[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Field Turf Background
    drawRugbyField(ctx, canvas.width, canvas.height);

    // 2. Render all draw actions / symbols
    drawElements.forEach(el => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'freehand' && el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } 
      else if (el.type === 'shape-circle') {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        const eX = el.endX ?? sX;
        const eY = el.endY ?? sY;
        const r = Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2));
        
        ctx.beginPath();
        ctx.arc(sX, sY, r || 12, 0, 2 * Math.PI);
        ctx.stroke();
      } 
      else if (el.type === 'shape-rectangle') {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        const w = (el.endX ?? sX) - sX;
        const h = (el.endY ?? sY) - sY;
        
        ctx.beginPath();
        ctx.rect(sX, sY, w || 15, h || 15);
        ctx.stroke();
      } 
      else if (el.type === 'shape-arrow') {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        const eX = el.endX ?? sX;
        const eY = el.endY ?? sY;
        
        // Main line
        ctx.beginPath();
        ctx.moveTo(sX, sY);
        ctx.lineTo(eX, eY);
        ctx.stroke();

        // Arrow tip head
        const angle = Math.atan2(eY - sY, eX - sX);
        ctx.beginPath();
        ctx.moveTo(eX, eY);
        ctx.lineTo(eX - 12 * Math.cos(angle - Math.PI / 6), eY - 12 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(eX - 12 * Math.cos(angle + Math.PI / 6), eY - 12 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } 
      else if (el.type === 'marker-x') {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        
        // Transparent Red X
        ctx.fillStyle = '#ff003c';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('X', sX, sY);
      } 
      else if (el.type === 'marker-o') {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        
        // Transparent Blue O
        ctx.fillStyle = '#0088ff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('O', sX, sY);
      }
      else if (el.type === 'marker-play' && el.playType) {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        const pt = el.playType;

        let badgeHex = '#eab308'; // ruck
        if (pt === 'scrum') badgeHex = '#a855f7';
        if (pt === 'lineout') badgeHex = '#06b6d4';
        if (pt === 'tackle') badgeHex = '#cf2a53';
        if (pt === 'linebreak') badgeHex = '#10b981';

        // Draw pill Badge
        ctx.fillStyle = badgeHex;
        drawRoundRect(ctx, sX - 35, sY - 11, 70, 22, 5);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Add Play text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pt.toUpperCase(), sX, sY);
      }
    });
  };

  // Canvas interaction side effect
  useEffect(() => {
    if (activeMode === 'telestrator') {
      redrawAll(elements);
    }
  }, [elements, activeMode]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height
      };
    } else {
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height
      };
    }
  };

  // Selector test to determine which placed item clicked
  const getElementAt = (x: number, y: number): string | null => {
    // Traverse backwards so newest is dragged first
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'freehand' && el.points) {
        const hit = el.points.some(p => {
          const dist = Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2));
          return dist < 20; 
        });
        if (hit) return el.id;
      } else {
        const sX = el.startX ?? 0;
        const sY = el.startY ?? 0;
        const midX = el.endX !== undefined ? (sX + el.endX) / 2 : sX;
        const midY = el.endY !== undefined ? (sY + el.endY) / 2 : sY;
        
        const distStart = Math.sqrt(Math.pow(sX - x, 2) + Math.pow(sY - y, 2));
        const distMid = Math.sqrt(Math.pow(midX - x, 2) + Math.pow(midY - y, 2));
        
        if (distStart < 25 || distMid < 25) {
          return el.id;
        }
      }
    }
    return null;
  };

  // Begin Action
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    setRedoQueue([]); // Reset redo queue on new action

    if (activeTool === 'move') {
      const targetId = getElementAt(coords.x, coords.y);
      if (targetId) {
        setSelectedElementId(targetId);
        setDragStartOffset({ x: coords.x, y: coords.y });
        setIsDrawing(true);
      }
      return;
    }

    setIsDrawing(true);

    let elType: DrawElement['type'] = 'freehand';
    let playMarker: DrawElement['playType'] | undefined = undefined;

    if (activeTool === 'circle') elType = 'shape-circle';
    else if (activeTool === 'rectangle') elType = 'shape-rectangle';
    else if (activeTool === 'arrow') elType = 'shape-arrow';
    else if (activeTool === 'x-marker') elType = 'marker-x';
    else if (activeTool === 'o-marker') elType = 'marker-o';
    else if (['ruck', 'scrum', 'lineout', 'tackle', 'linebreak'].includes(activeTool)) {
      elType = 'marker-play';
      playMarker = activeTool as any;
    }

    const newElement: DrawElement = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      type: elType,
      color: brushColor,
      size: brushSize,
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y,
      points: elType === 'freehand' ? [coords] : undefined,
      playType: playMarker
    };

    setElements(prev => [...prev, newElement]);
  };

  // Dragging gesture update
  const drawGesture = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    
    if (activeTool === 'move' && selectedElementId && dragStartOffset) {
      const dx = coords.x - dragStartOffset.x;
      const dy = coords.y - dragStartOffset.y;
      setDragStartOffset({ x: coords.x, y: coords.y });

      setElements(prev => prev.map(el => {
        if (el.id !== selectedElementId) return el;
        if (el.type === 'freehand' && el.points) {
          return {
            ...el,
            points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
          };
        } else {
          return {
            ...el,
            startX: (el.startX ?? 0) + dx,
            startY: (el.startY ?? 0) + dy,
            endX: el.endX !== undefined ? el.endX + dx : undefined,
            endY: el.endY !== undefined ? el.endY + dy : undefined,
          };
        }
      }));
      return;
    }

    if (elements.length === 0) return;

    setElements(prev => {
      const copy = [...prev];
      const last = { ...copy[copy.length - 1] };
      
      if (last.type === 'freehand' && last.points) {
        last.points = [...last.points, coords];
      } else {
        last.endX = coords.x;
        last.endY = coords.y;
      }
      
      copy[copy.length - 1] = last;
      return copy;
    });
  };

  // Release Drawing Action
  const stopDraw = () => {
    setIsDrawing(false);
    setSelectedElementId(null);
    setDragStartOffset(null);
  };

  // Undo Drawing step
  const handleUndo = () => {
    if (elements.length === 0) return;
    const copy = [...elements];
    const undon = copy.pop();
    if (undon) {
      setRedoQueue(prev => [undon, ...prev]);
    }
    setElements(copy);
  };

  // Redo Drawing step
  const handleRedo = () => {
    if (redoQueue.length === 0) return;
    const copyRedo = [...redoQueue];
    const redone = copyRedo.shift();
    if (redone) {
      setElements(prev => [...prev, redone]);
    }
    setRedoQueue(copyRedo);
  };

  // Clear Canvas Elements
  const resetCanvas = () => {
    setElements([]);
    setRedoQueue([]);
  };

  // Local Save Drawing to Playlist helper
  const saveBlueprintToPlaylist = () => {
    const newSave: SavedBlueprint = {
      id: Date.now().toString(),
      name: blueprintName || `Tactical Phase #${savedPlaylist.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elements: [...elements]
    };

    const updated = [newSave, ...savedPlaylist];
    savePlaylistToStorage(updated);
  };

  // Load blueprint elements back onto canvas
  const loadBlueprint = (blueprint: SavedBlueprint) => {
    setElements(blueprint.elements);
    setBlueprintName(blueprint.name);
    setRedoQueue([]);
  };

  // Delete item from saved list
  const deleteBlueprint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPlaylist.filter(bp => bp.id !== id);
    savePlaylistToStorage(updated);
  };

  // Export current canvas drawings to high quality PNG
  const downloadMediaCard = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      const canvas = canvasRef.current;
      if (canvas && activeMode === 'telestrator') {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${blueprintName.replace(/\s+/g, '_')}_Tactics.png`;
        link.href = url;
        link.click();
      } else {
        alert('Creating and downloading high-contrast broadcaster card...');
      }
    }, 800);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Controller Switch */}
      <div className="flex bg-card-bg p-1.5 rounded-xl border border-secondary max-w-sm mx-auto items-center">
        <button
          onClick={() => setActiveMode('telestrator')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeMode === 'telestrator' ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}
        >
          <Tv size={14} />
          Telestrator Board
        </button>
        <button
          onClick={() => setActiveMode('statcard')}
          className={`flex-1 py-2.5 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${activeMode === 'statcard' ? 'bg-primary text-white' : 'text-muted hover:text-white'}`}
        >
          <Share2 size={14} />
          Broadcast Graphic
        </button>
      </div>

      {activeMode === 'telestrator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Telestrator Settings Bar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-6 text-left">
              
              <div className="border-b border-border pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  <Settings className="text-primary" size={16} /> Draw Panel
                </h3>
                {/* Undo/Redo Deck */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleUndo} 
                    disabled={elements.length === 0}
                    className="p-1 px-2 rounded bg-secondary hover:bg-zinc-800 text-zinc-300 disabled:opacity-20 text-[10px] flex items-center gap-1 transition-all"
                    title="Undo line"
                  >
                    <Undo size={12} />
                  </button>
                  <button 
                    onClick={handleRedo} 
                    disabled={redoQueue.length === 0}
                    className="p-1 px-2 rounded bg-secondary hover:bg-zinc-800 text-zinc-300 disabled:opacity-20 text-[10px] flex items-center gap-1 transition-all"
                    title="Redo state"
                  >
                    <Redo size={12} />
                  </button>
                </div>
              </div>

              {/* Telestrator Vector Shape Tools */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Drawing Tool / Vector Shape</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'move', label: 'Move & Drag', icon: Move },
                    { id: 'freehand', label: 'Freehand Draw', icon: Paintbrush },
                    { id: 'circle', label: 'Draw Circle', icon: Circle },
                    { id: 'rectangle', label: 'Draw Square', icon: Square },
                    { id: 'arrow', label: 'Draw Arrow', icon: ArrowRight },
                  ].map(tool => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id as any)}
                        className={`p-2 rounded-lg border text-[10px] font-bold text-left flex items-center gap-2 transition-all ${activeTool === tool.id ? 'border-primary bg-primary/10 text-primary animate-pulse font-extrabold' : 'border-border text-muted hover:text-white'}`}
                      >
                        <Icon size={13} />
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Player Pins */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Place Athlete Markers</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveTool('x-marker')}
                    className={`p-2.5 rounded-lg border text-[10px] font-bold text-left flex items-center gap-2.5 transition-all ${activeTool === 'x-marker' ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 'border-border text-muted hover:text-white'}`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-red-500 text-lg font-black bg-transparent border border-red-500/20 rounded">X</span>
                    <span>Home Athlete (X)</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('o-marker')}
                    className={`p-2.5 rounded-lg border text-[10px] font-bold text-left flex items-center gap-2.5 transition-all ${activeTool === 'o-marker' ? 'border-blue-500 bg-blue-500/10 text-blue-500 animate-pulse' : 'border-border text-muted hover:text-white'}`}
                  >
                    <span className="w-5 h-5 flex items-center justify-center text-blue-500 text-lg font-black bg-transparent border border-blue-500/20 rounded">O</span>
                    <span>Away Athlete (O)</span>
                  </button>
                </div>
              </div>

              {/* Play indicators */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Place Play Event Markers</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ruck', label: 'Ruck', color: 'bg-yellow-500 border-yellow-500' },
                    { id: 'scrum', label: 'Scrum', color: 'bg-purple-500 border-purple-500' },
                    { id: 'lineout', label: 'Lineout', color: 'bg-cyan-500 border-cyan-500' },
                    { id: 'tackle', label: 'Tackle', color: 'bg-rose-500 border-rose-500' },
                    { id: 'linebreak', label: 'L-Break', color: 'bg-emerald-500 border-emerald-500' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActiveTool(p.id as any)}
                      className={`px-2.5 py-1.5 rounded-md border text-[9px] font-black uppercase tracking-tight transition-all ${activeTool === p.id ? `${p.color} text-white` : 'border-border text-muted hover:text-white bg-zinc-900/30'}`}
                    >
                      {p.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2 pt-1">
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Drawing Color</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { hex: '#ff003c', label: 'Crimson' },
                    { hex: '#ffbb00', label: 'Gold' },
                    { hex: '#00cc88', label: 'Mint' },
                    { hex: '#0088ff', label: 'Navy' },
                    { hex: '#ffffff', label: 'White' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setBrushColor(c.hex)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${brushColor === c.hex ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Brush Thickness */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] font-bold text-muted uppercase">
                  <span>Line Weight</span>
                  <span>{brushSize}px</span>
                </div>
                <input 
                  type="range" 
                  min={2} 
                  max={12} 
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Blueprint Playlist Storage Input */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted">Blueprint Name</label>
                  <input
                    type="text"
                    value={blueprintName}
                    onChange={(e) => setBlueprintName(e.target.value)}
                    placeholder="Enter play name..."
                    className="w-full bg-secondary/80 border border-zinc-800 hover:border-zinc-700 text-xs rounded-lg px-2.5 py-2 font-bold text-white outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={saveBlueprintToPlaylist}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 border border-zinc-700 font-bold uppercase text-[9px] tracking-wide text-zinc-200 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <Save size={11} /> Save Play
                  </button>
                  <button
                    onClick={resetCanvas}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 border border-zinc-700 font-bold uppercase text-[9px] tracking-wide text-zinc-300 hover:border-red-500/30 hover:text-red-500 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
              </div>

              {/* Export Blueprint button */}
              <button
                onClick={downloadMediaCard}
                className="w-full py-3 bg-primary hover:bg-red-700 rounded-xl font-bold uppercase tracking-widest text-xs text-white flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Download size={13} /> Export Draw Board PNG
              </button>

            </div>
          </div>

          {/* Canvas Draw Board */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card-bg border border-border rounded-3xl overflow-hidden p-4 shadow-2xl relative">
              <div className="absolute top-8 left-8 z-30 pointer-events-none flex items-center gap-2">
                <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-[9px] font-mono font-bold uppercase text-zinc-300 bg-black/80 backdrop-blur border border-border rounded px-2 py-0.5">
                  {blueprintName.toUpperCase()} · CH 1
                </span>
              </div>

              {/* 16:9 Canvas Container */}
              <div className="aspect-[16/9] w-full bg-[#141d18] rounded-2xl relative overflow-hidden flex items-center justify-center border border-border/30">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={450}
                  onMouseDown={startDraw}
                  onMouseMove={drawGesture}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={drawGesture}
                  onTouchEnd={stopDraw}
                  className="cursor-crosshair w-full h-full object-contain relative z-20"
                />
              </div>
            </div>

            <div className="bg-card-bg border border-border rounded-2xl p-4 text-center">
              <p className="text-[10px] text-muted font-medium inline-flex items-center gap-1.5 justify-center">
                <BookOpen size={12} className="text-primary" />
                Select any custom vector tool, pin Home (X)/Away (O) team players, place tactical play event banners, or draw freehand.
              </p>
            </div>
          </div>

          {/* Local saved blueprint list (Tactical Playlist) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card-bg border border-border rounded-2xl p-5 shadow-xl text-left space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <FileText size={16} className="text-primary" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-white">Tactical Playlist</h4>
                  <p className="text-[9px] text-muted">Stored strategies on current machine</p>
                </div>
              </div>

              {savedPlaylist.length > 0 ? (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {savedPlaylist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadBlueprint(item)}
                      className="p-3 bg-secondary/30 hover:bg-primary/5 hover:border-primary/40 border border-border/60 rounded-xl transition-all cursor-pointer flex justify-between items-center group/item"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="text-xs font-bold text-zinc-100 truncate group-hover/item:text-primary transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[9px] text-muted font-medium">
                          Saved at {item.timestamp} ({item.elements.length} markings)
                        </p>
                      </div>

                      <button
                        onClick={(e) => deleteBlueprint(item.id, e)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted hover:text-red-500 transition-colors shrink-0"
                        title="Remove from playlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted border border-dashed border-zinc-800 rounded-xl space-y-2">
                  <FileText size={24} className="mx-auto text-zinc-700 opacity-40 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold text-zinc-400">No saved plays</p>
                    <p className="text-[9px] text-zinc-600 leading-normal">Enter a play name and tap "Save Play" to record elements securely in your playlist browser.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Stat Card Generator Layout */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Settings options */}
          <div className="lg:col-span-1 bg-card-bg border border-border rounded-2xl p-6 shadow-xl space-y-5 text-left">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Settings className="text-primary" size={18} /> Customize Card
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Template Theme</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'crimson', label: 'RPL Red' },
                  { id: 'gold', label: 'Championship' },
                  { id: 'monochrome', label: 'Stealth' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setCardTheme(t.id as any)}
                    className={`py-2 rounded border text-[9px] font-bold uppercase tracking-tighter ${cardTheme === t.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Card Heading</label>
              <input 
                type="text" 
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                className="w-full bg-card-bg-light border border-border text-xs rounded-lg px-3 py-2 outline-none font-semibold focus:border-primary text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Card Subtitle</label>
              <input 
                type="text" 
                value={cardSubtitle}
                onChange={(e) => setCardSubtitle(e.target.value)}
                className="w-full bg-card-bg-light border border-border text-xs rounded-lg px-3 py-2 outline-none font-semibold focus:border-primary text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Select Player</label>
              <select 
                value={cardPlayer}
                onChange={(e) => setCardPlayer(e.target.value)}
                className="w-full bg-zinc-900 text-white text-xs rounded-lg px-3 py-2 outline-none font-semibold focus:border-primary border border-zinc-700/50 cursor-pointer"
              >
                {allPlayers.filter(p => (p.tries || 0) > 2).map(p => (
                  <option key={p.name} value={p.name} className="bg-zinc-900 text-white font-semibold">
                    {p.name} ({p.team})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={downloadMediaCard}
              disabled={exportLoading}
              className="w-full py-4 bg-primary text-white hover:bg-red-700 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {exportLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download size={15} />
                  Download Stat Graphic
                </>
              )}
            </button>
          </div>

          {/* Social Card Graphic Preview Sheet */}
          <div className="lg:col-span-3">
            <div className="bg-card-bg border border-border rounded-3xl p-8 max-w-lg mx-auto shadow-2xl relative overflow-hidden">
              
              {/* Backdrop effects */}
              <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-60 z-0" />
              
              <div className={`relative z-10 border-4 rounded-2xl p-6 md:p-8 flex flex-col justify-between aspect-[4/5] overflow-hidden transition-all ${cardTheme === 'gold' ? 'border-amber-500 bg-amber-500/5' : cardTheme === 'monochrome' ? 'border-zinc-500 bg-zinc-900' : 'border-primary bg-primary/5'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-dashed border-zinc-700 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase text-rose-500 tracking-[3px]">
                      {cardTitle}
                    </span>
                    <h4 className="text-xl font-bold font-mono text-zinc-100 italic leading-none">
                      {activePlayerObj?.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted block">TEAM</span>
                    <span className="text-xs font-black text-rose-500 font-mono tracking-wide">
                      {activePlayerObj?.team}
                    </span>
                  </div>
                </div>

                {/* Center visual layout */}
                <div className="my-6 grid grid-cols-5 gap-4 items-center">
                  <div className="col-span-2 space-y-1 bg-black/40 border border-border p-3 rounded-xl text-center self-stretch flex flex-col justify-center">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 block">NATIONALITY</span>
                    <span className="text-xl font-black font-mono text-rose-500 italic block">{activePlayerObj?.nat}</span>
                  </div>

                  <div className="col-span-3 text-right space-y-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 font-medium font-mono uppercase block">Total League Points</span>
                      <span className="text-5xl font-black italic tracking-tight text-white leading-none">
                        {activePlayerObj?.pts}
                      </span>
                    </div>

                    <div className="flex justify-end gap-6 border-t border-zinc-800 pt-3">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block">TRIES</span>
                        <span className="font-bold text-lg text-rose-500 font-mono">{activePlayerObj?.tries}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block">TACKLES</span>
                        <span className="font-bold text-lg text-rose-500 font-mono">{activePlayerObj?.tackles || '12'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 block">OFFLOADS</span>
                        <span className="font-bold text-lg text-rose-500 font-mono">{activePlayerObj?.offloads || '8'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and dynamic metadata */}
                <div className="border-t-2 border-primary/20 pt-4 flex justify-between items-center text-[9px] font-mono text-zinc-400">
                  <span>{cardSubtitle}</span>
                  <span className="bg-black/40 border border-border/80 rounded px-2 py-0.5">
                     RPL PRO BROADCAST
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
