import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  REACTIVE_ELEMENTS,
  CHEMICAL_REACTIONS_DB,
  ChemicalReaction,
  WorkbenchElement,
  findReaction
} from '../data/chemicalReactionsData';
import {
  Flame,
  Sparkles,
  RotateCcw,
  Play,
  Thermometer,
  ShieldAlert,
  Info,
  CheckCircle,
  FlaskConical,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PraxiReactionSimulator: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  const [selectedElementA, setSelectedElementA] = useState<WorkbenchElement>(REACTIVE_ELEMENTS.find(e => e.symbol === 'Na') || REACTIVE_ELEMENTS[6]);
  const [selectedElementB, setSelectedElementB] = useState<WorkbenchElement>(REACTIVE_ELEMENTS.find(e => e.symbol === 'Cl') || REACTIVE_ELEMENTS[11]);
  
  const [reaction, setReaction] = useState<ChemicalReaction | null>(() => findReaction('Na', 'Cl'));
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [reactionProgress, setReactionProgress] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(25); // Celsius
  const [reactionCompleted, setReactionCompleted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Update reaction when elements change
  useEffect(() => {
    const rx = findReaction(selectedElementA.symbol, selectedElementB.symbol);
    setReaction(rx);
    setIsReacting(false);
    setReactionProgress(0);
    setTemperature(25);
    setReactionCompleted(false);
  }, [selectedElementA, selectedElementB]);

  // Handle mixing / reaction ignition
  const handleIgnite = () => {
    if (!reaction || isReacting) return;
    setIsReacting(true);
    setReactionProgress(0);
    setReactionCompleted(false);
  };

  const handleReset = () => {
    setIsReacting(false);
    setReactionProgress(0);
    setTemperature(25);
    setReactionCompleted(false);
  };

  // Quick preset selector
  const loadPreset = (symA: string, symB: string) => {
    const elA = REACTIVE_ELEMENTS.find(e => e.symbol === symA);
    const elB = REACTIVE_ELEMENTS.find(e => e.symbol === symB);
    if (elA && elB) {
      setSelectedElementA(elA);
      setSelectedElementB(elB);
    }
  };

  // Reaction Animation & Canvas Particle Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 360);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
      type: 'smoke' | 'spark' | 'bubble' | 'glow' | 'reactantA' | 'reactantB';
    }

    const particles: Particle[] = [];

    // Pre-populate reactant particles inside beaker
    const beakerLeft = width * 0.3;
    const beakerRight = width * 0.7;
    const beakerBottom = height - 50;
    const liquidTop = height - 160;

    const spawnSparks = (count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * 60,
          y: liquidTop + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.5,
          radius: Math.random() * 3 + 1.5,
          color,
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 40,
          type: 'spark'
        });
      }
    };

    const spawnSmoke = (count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * 80,
          y: liquidTop - 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2.5 - 1.2,
          radius: Math.random() * 12 + 6,
          color,
          alpha: 0.7,
          life: 0,
          maxLife: 70 + Math.random() * 50,
          type: 'smoke'
        });
      }
    };

    const spawnBubbles = (count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: beakerLeft + 20 + Math.random() * (beakerRight - beakerLeft - 40),
          y: beakerBottom - 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 2 - 1,
          radius: Math.random() * 4 + 2,
          color: 'rgba(255,255,255,0.7)',
          alpha: 0.8,
          life: 0,
          maxLife: 80,
          type: 'bubble'
        });
      }
    };

    let animationTime = 0;

    const render = () => {
      animationTime++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Lab Background Bench & Grid
      const benchY = beakerBottom + 5;
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, width, height);

      // Perspective table top
      const benchGrad = ctx.createLinearGradient(0, benchY, 0, height);
      benchGrad.addColorStop(0, '#131b2e');
      benchGrad.addColorStop(1, '#05070d');
      ctx.fillStyle = benchGrad;
      ctx.fillRect(0, benchY, width, height - benchY);

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, benchY);
      ctx.lineTo(width, benchY);
      ctx.stroke();

      // Lab stand & clamp on the right
      const standX = beakerRight + 35;
      ctx.fillStyle = '#334155';
      ctx.fillRect(standX - 3, 40, 6, benchY - 40);
      ctx.fillRect(standX - 25, benchY - 6, 50, 6);
      // Clamp arm
      ctx.fillRect(beakerRight - 15, 120, standX - beakerRight + 15, 6);

      // 2. Beaker Body (Glassware)
      const bWidth = beakerRight - beakerLeft;
      const cornerR = 12;

      // Current liquid appearance based on progress
      let currentLiquidColor = 'rgba(30, 41, 59, 0.4)';
      if (reaction && isReacting) {
        if (reactionProgress > 70) {
          currentLiquidColor = reaction.liquidColor + '99'; // with opacity
        } else if (reactionProgress > 20) {
          currentLiquidColor = 'rgba(234, 88, 12, 0.5)';
        }
      } else if (reactionCompleted && reaction) {
        currentLiquidColor = reaction.liquidColor + 'bb';
      }

      // Draw Beaker Liquid
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(beakerLeft + 8, liquidTop);
      // Liquid wavy surface
      for (let x = beakerLeft + 8; x <= beakerRight - 8; x += 10) {
        const wave = Math.sin((x / 20) + (animationTime * 0.08)) * (isReacting ? 4 : 1.5);
        ctx.lineTo(x, liquidTop + wave);
      }
      ctx.lineTo(beakerRight - 8, beakerBottom - cornerR);
      ctx.quadraticCurveTo(beakerRight - 8, beakerBottom - 4, beakerRight - cornerR - 8, beakerBottom - 4);
      ctx.lineTo(beakerLeft + cornerR + 8, beakerBottom - 4);
      ctx.quadraticCurveTo(beakerLeft + 8, beakerBottom - 4, beakerLeft + 8, beakerBottom - cornerR);
      ctx.closePath();
      ctx.fillStyle = currentLiquidColor;
      ctx.fill();

      // Liquid shine gradient
      const liquidShine = ctx.createLinearGradient(beakerLeft, 0, beakerRight, 0);
      liquidShine.addColorStop(0, 'rgba(255,255,255,0.15)');
      liquidShine.addColorStop(0.2, 'transparent');
      liquidShine.addColorStop(0.8, 'transparent');
      liquidShine.addColorStop(1, 'rgba(255,255,255,0.08)');
      ctx.fillStyle = liquidShine;
      ctx.fill();
      ctx.restore();

      // Draw Solid Product if formed
      if ((isReacting || reactionCompleted) && reaction?.solidProduct) {
        const solidHeight = Math.min(28, (reactionProgress / 100) * 28);
        ctx.fillStyle = reaction.visualEffect === 'precipitate_yellow' ? '#fde047' : '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(width / 2, beakerBottom - 12, bWidth * 0.35, solidHeight * 0.4 + 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Beaker Glass Outline & Measurement Ticks
      ctx.save();
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Lip spout
      ctx.moveTo(beakerLeft - 8, 85);
      ctx.lineTo(beakerLeft, 95);
      ctx.lineTo(beakerLeft, beakerBottom - cornerR);
      ctx.quadraticCurveTo(beakerLeft, beakerBottom, beakerLeft + cornerR, beakerBottom);
      ctx.lineTo(beakerRight - cornerR, beakerBottom);
      ctx.quadraticCurveTo(beakerRight, beakerBottom, beakerRight, beakerBottom - cornerR);
      ctx.lineTo(beakerRight, 95);
      ctx.lineTo(beakerRight + 5, 88);
      ctx.stroke();

      // Glass highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(beakerLeft + 6, 110);
      ctx.lineTo(beakerLeft + 6, beakerBottom - 20);
      ctx.stroke();

      // Graduated Measurement Lines (e.g., 100ml, 200ml, 300ml)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '9px monospace';
      const tickStep = (beakerBottom - 110) / 4;
      for (let t = 1; t <= 4; t++) {
        const tickY = beakerBottom - t * tickStep;
        ctx.beginPath();
        ctx.moveTo(beakerLeft + 4, tickY);
        ctx.lineTo(beakerLeft + 16, tickY);
        ctx.stroke();
        ctx.fillText(`${t * 100}ml`, beakerLeft + 20, tickY + 3);
      }
      ctx.restore();

      // 4. In-flight drops / Reactants pouring if reacting
      if (isReacting && reactionProgress < 40) {
        // Element A dropping from left
        ctx.fillStyle = selectedElementA.colorHex;
        ctx.beginPath();
        ctx.arc(beakerLeft + 40, 95 + ((animationTime * 4) % 80), 5, 0, Math.PI * 2);
        ctx.fill();

        // Element B dropping from right
        ctx.fillStyle = selectedElementB.colorHex;
        ctx.beginPath();
        ctx.arc(beakerRight - 40, 95 + (((animationTime + 10) * 4) % 80), 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Spawn Effects during reaction
      if (isReacting && reaction) {
        if (reaction.visualEffect === 'bright_flash') {
          // Flash flare in center
          const flareGrad = ctx.createRadialGradient(width / 2, liquidTop + 20, 5, width / 2, liquidTop + 20, 120);
          flareGrad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
          flareGrad.addColorStop(0.3, 'rgba(253, 224, 71, 0.5)');
          flareGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = flareGrad;
          ctx.beginPath();
          ctx.arc(width / 2, liquidTop + 20, 120, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.6) spawnSparks(3, '#fef08a');
          if (Math.random() < 0.3) spawnSmoke(1, '#e2e8f0');
        } else if (reaction.visualEffect === 'orange_fire') {
          // Fire flare
          const fireGrad = ctx.createRadialGradient(width / 2, liquidTop + 10, 5, width / 2, liquidTop + 10, 90);
          fireGrad.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
          fireGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
          fireGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = fireGrad;
          ctx.beginPath();
          ctx.arc(width / 2, liquidTop + 10, 90, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.7) spawnSparks(3, '#fb923c');
          if (Math.random() < 0.4) spawnSmoke(1, '#64748b');
        } else if (reaction.visualEffect === 'blue_flame') {
          const blueGrad = ctx.createRadialGradient(width / 2, liquidTop + 10, 5, width / 2, liquidTop + 10, 80);
          blueGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
          blueGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)');
          blueGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = blueGrad;
          ctx.beginPath();
          ctx.arc(width / 2, liquidTop + 10, 80, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.5) spawnSparks(2, '#38bdf8');
          if (Math.random() < 0.5) spawnBubbles(2);
        } else if (reaction.visualEffect === 'purple_vapor') {
          if (Math.random() < 0.8) spawnSmoke(2, '#c084fc');
          if (Math.random() < 0.4) spawnSparks(2, '#e879f9');
        } else if (reaction.visualEffect === 'smoke_effervescence') {
          if (Math.random() < 0.9) spawnSmoke(3, '#f1f5f9');
          spawnBubbles(1);
        } else if (reaction.visualEffect === 'glow_green') {
          const greenGrad = ctx.createRadialGradient(width / 2, liquidTop + 15, 5, width / 2, liquidTop + 15, 80);
          greenGrad.addColorStop(0, 'rgba(74, 222, 128, 0.85)');
          greenGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.3)');
          greenGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = greenGrad;
          ctx.beginPath();
          ctx.arc(width / 2, liquidTop + 15, 80, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.5) spawnSparks(2, '#86efac');
          if (Math.random() < 0.4) spawnSmoke(1, '#ecfdf5');
        } else {
          spawnBubbles(1);
        }
      }

      // 6. Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

        if (p.type === 'smoke') {
          p.radius += 0.2;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'spark') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'bubble') {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.6;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isReacting, reaction, reactionProgress, reactionCompleted, selectedElementA, selectedElementB]);

  // Handle reaction progress interval
  useEffect(() => {
    if (!isReacting || !reaction) return;

    const interval = setInterval(() => {
      setReactionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReacting(false);
          setReactionCompleted(true);
          return 100;
        }
        const next = prev + 2.5;
        // Increase temperature according to progress
        const targetTemp = 25 + reaction.temperatureChange;
        setTemperature(Math.round(25 + (targetTemp - 25) * (next / 100)));
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isReacting, reaction]);

  return (
    <div className="space-y-6">
      {/* Top Banner: PraxiLabs-style Workbench Description */}
      <div className="sci-card p-5 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-cyan-950/30 border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                {ar ? 'مختبر الكيمياء التفاعلي المتقدم (نظام PraxiLabs)' : 'PraxiLabs-Style Chemistry Simulation Workbench'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {ar ? 'معمل خلط العناصر ومحاكاة التفاعلات الكيميائية اللحظية' : 'Interactive Element Mixer & Real-time Reaction Engine'}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {ar
                ? 'اختر أي عنصرين من الرف المخبري وادمجهم داخل كأس التفاعل لمشاهدة المعادلة الموزونة، وتغير درجات الحرارة، ونوع الطاقة المنبعثة (طارد/ماص)، واللون، ونوع الرابطة وفق معايير IUPAC العالمية.'
                : 'Select any two reactive elements from the chemical shelf, drop them into the reaction vessel, and observe the real-time balanced equation, thermodynamic state, color change, and precipitate/gas formation.'}
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 block w-full md:w-auto font-mono">
              {ar ? 'تجارب شهيرة سريعة:' : 'Quick Presets:'}
            </span>
            <button
              onClick={() => loadPreset('Na', 'Cl')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
            >
              Na + Cl (ملح الطعام)
            </button>
            <button
              onClick={() => loadPreset('H', 'O')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              H + O (الماء)
            </button>
            <button
              onClick={() => loadPreset('Mg', 'O')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              Mg + O (الوميض)
            </button>
            <button
              onClick={() => loadPreset('Fe', 'S')}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500/30 transition-all"
            >
              Fe + S (كبريتيد الحديد)
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Shelf + Simulation Vessel + Reaction Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (5 Cols): Element Selectors & Shelf */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Reactants Selection Card */}
          <div className="sci-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                {ar ? 'العناصر المختارة للتفاعل' : 'Selected Reactants'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {ar ? '2 متفاعلات نشطة' : '2 Active Slots'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Element A Slot */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400">{ar ? 'المتفاعل الأول (A)' : 'Reactant A'}</span>
                  <span className="text-[10px] font-mono text-slate-400">#{selectedElementA.number}</span>
                </div>
                <div className="flex items-center gap-3 my-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg text-white shadow-lg"
                    style={{ backgroundColor: selectedElementA.colorHex + '40', border: `1.5px solid ${selectedElementA.colorHex}` }}
                  >
                    {selectedElementA.symbol}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {ar ? selectedElementA.nameAr : selectedElementA.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ar ? `تكافؤ: ${selectedElementA.valence}` : `Valence: ${selectedElementA.valence}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Element B Slot */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/40 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400">{ar ? 'المتفاعل الثاني (B)' : 'Reactant B'}</span>
                  <span className="text-[10px] font-mono text-slate-400">#{selectedElementB.number}</span>
                </div>
                <div className="flex items-center gap-3 my-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg text-white shadow-lg"
                    style={{ backgroundColor: selectedElementB.colorHex + '40', border: `1.5px solid ${selectedElementB.colorHex}` }}
                  >
                    {selectedElementB.symbol}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      {ar ? selectedElementB.nameAr : selectedElementB.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ar ? `تكافؤ: ${selectedElementB.valence}` : `Valence: ${selectedElementB.valence}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ignite / Reset Controls */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleIgnite}
                disabled={!reaction || isReacting}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  !reaction
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : isReacting
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>
                  {isReacting
                    ? (ar ? 'جاري التفاعل...' : 'Reacting...')
                    : !reaction
                    ? (ar ? 'لا يحدث تفاعل مباشر' : 'No Direct Reaction')
                    : (ar ? 'بدء التفاعل الكيميائي' : 'Ignite / Mix Reaction')}
                </span>
              </button>

              <button
                onClick={handleReset}
                className="py-2.5 px-3 rounded-xl bg-slate-950/70 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title={ar ? 'إعادة ضبط الكأس' : 'Reset Vessel'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reagent Shelf: Click to choose Element A or B */}
          <div className="sci-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {ar ? 'رف المواد الكيميائية (20 عنصراً نشطاً)' : 'Reagent Shelf (20 Active Elements)'}
              </span>
              <span className="text-[10px] text-slate-400">
                {ar ? 'انقر لتعيين العنصر' : 'Click to assign'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {REACTIVE_ELEMENTS.map(el => {
                const isSelectedA = selectedElementA.symbol === el.symbol;
                const isSelectedB = selectedElementB.symbol === el.symbol;
                return (
                  <div
                    key={el.symbol}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelectedA
                        ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400/60'
                        : isSelectedB
                        ? 'border-indigo-400 bg-indigo-950/30 ring-1 ring-indigo-400/60'
                        : 'border-white/10 bg-slate-950/70 hover:border-white/30 hover:bg-slate-900'
                    }`}
                    onClick={() => {
                      // Alternate between setting A and B
                      if (isSelectedA) {
                        setSelectedElementB(el);
                      } else {
                        setSelectedElementA(el);
                      }
                    }}
                  >
                    <span className="text-[8px] font-mono text-slate-500 absolute top-1 left-1.5">{el.number}</span>
                    {isSelectedA && (
                      <span className="text-[8px] font-mono font-bold text-cyan-300 absolute top-1 right-1.5 bg-cyan-950 px-1 rounded">A</span>
                    )}
                    {isSelectedB && (
                      <span className="text-[8px] font-mono font-bold text-indigo-300 absolute top-1 right-1.5 bg-indigo-950 px-1 rounded">B</span>
                    )}
                    <span className="text-base font-black font-mono text-white mt-2 leading-none">{el.symbol}</span>
                    <span className="text-[9px] text-slate-300 truncate max-w-full font-medium mt-1">
                      {ar ? el.nameAr : el.nameEn}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              {ar
                ? '💡 تلميح: انقر على أي عنصر لتعيينه كمتفاعل أول (A) أو متفاعل ثانٍ (B).'
                : '💡 Tip: Click any element to swap it into Slot A or Slot B.'}
            </p>
          </div>

        </div>

        {/* Right Column (7 Cols): Canvas Beaker Visualizer + Reaction Output */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Reaction Vessel Canvas (PraxiLabs Bench) */}
          <div className="sci-card p-4 space-y-3 relative overflow-hidden bg-[#030611]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {ar ? 'كأس التفاعل والمراقبة البصرية اللحظية' : 'Reaction Vessel & Real-time Visual Monitor'}
                </span>
              </div>

              {/* Live Temperature & Thermometer HUD */}
              <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 px-3 py-1 rounded-xl">
                <Thermometer className={`w-3.5 h-3.5 ${temperature > 80 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
                <span className="text-xs font-mono font-black text-white">
                  {temperature} °C
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({Math.round((temperature * 9/5) + 32)} °F)
                </span>
              </div>
            </div>

            {/* Canvas */}
            <div className="w-full relative rounded-xl overflow-hidden border border-white/10 bg-[#070b16]">
              <canvas ref={canvasRef} className="w-full block" />

              {/* Progress Overlay bar */}
              {isReacting && (
                <div className="absolute top-3 left-4 right-4 bg-slate-950/90 border border-white/10 p-2 rounded-xl backdrop-blur-md">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-white font-mono">{ar ? 'تقدم التفاعل المخبري:' : 'Reaction Progress:'}</span>
                    <span className="text-cyan-300 font-mono font-bold">{Math.round(reactionProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-75"
                      style={{ width: `${reactionProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reaction Scientific Output Card */}
          {reaction ? (
            <div className="sci-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    {ar ? 'معادلة التفاعل الكيميائي الموزونة (IUPAC Standard)' : 'Balanced Chemical Equation'}
                  </span>
                  <span className="text-lg font-black font-mono text-white mt-0.5 block tracking-wide">
                    {ar ? reaction.equationAr : reaction.equation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">{ar ? 'نوع التفاعل' : 'Reaction Type'}</span>
                  <span className="text-xs font-bold text-amber-300">{ar ? reaction.typeAr : reaction.typeEn}</span>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'الديناميكا الحرارية:' : 'Thermodynamics:'}</span>
                  <span className="text-xs font-mono font-bold text-red-300 block">{ar ? reaction.energyAr : reaction.energyEn}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'النواتج المتكونة:' : 'Formed Products:'}</span>
                  <span className="text-xs font-mono font-bold text-cyan-300 block">{ar ? reaction.productsAr : reaction.productsEn}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'المظهر وتغير اللون:' : 'Visual & Color:'}</span>
                  <span className="text-xs font-mono font-bold text-emerald-300 block">{ar ? reaction.colorChangeAr : reaction.colorChangeEn}</span>
                </div>
              </div>

              {/* Scientific Explanation */}
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{ar ? 'التفسير العلمي المجهري للتفاعل' : 'Microscopic Scientific Mechanism'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ar ? reaction.scientificExplanationAr : reaction.scientificExplanationEn}
                </p>
              </div>

              {/* Safety Hazard Warning */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{ar ? reaction.safetyHazardAr : reaction.safetyHazardEn}</span>
              </div>
            </div>
          ) : (
            <div className="sci-card p-8 text-center space-y-2 border-dashed border-white/20">
              <FlaskConical className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">
                {ar ? 'لا يوجد تفاعل كيميائي مباشر معروف بين هذين العنصرين في الظروف العادية' : 'No Spontaneous Reaction Under Standard Conditions'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {ar
                  ? `العنصران (${selectedElementA.symbol}) و (${selectedElementB.symbol}) لا يتفاعلان مباشرة بدون عوامل حفازة أو درجات حرارة وضغوط غير قياسية. جرب اختيار الصوديوم مع الكلور، أو الهيدروجين مع الأكسجين.`
                  : `Elements (${selectedElementA.symbol}) and (${selectedElementB.symbol}) do not react spontaneously without catalysts or extreme conditions. Try mixing Sodium + Chlorine or Hydrogen + Oxygen.`}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
