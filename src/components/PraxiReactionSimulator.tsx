import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { updateChemistryState } from '../lib/scinexaLiveContext';
import {
  WORKBENCH_REAGENTS,
  WorkbenchReagent,
  ChemicalReaction,
  CHEMICAL_REACTIONS_DB,
  findMatchingReaction,
  ReactionCategory
} from '../data/chemicalReactionsData';
import {
  REACTION_TYPE_INFO,
  REACTION_TYPE_KEYS,
  REACTION_SOURCES,
  typeKeyOfCategory,
  type ReactionTypeFilter
} from '../data/reactionTypesExtra';
import {
  Flame,
  RotateCcw,
  Thermometer,
  ShieldAlert,
  Info,
  FlaskConical,
  Zap,
  Sparkles,
  Trash2
} from 'lucide-react';

export const PraxiReactionSimulator: React.FC = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';

  // Active Reactants in Beaker (up to 2)
  const [selectedReagentIds, setSelectedReagentIds] = useState<string[]>(['Zn', 'HCl']);
  const [bunsenBurnerActive, setBunsenBurnerActive] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [reactionType, setReactionType] = useState<ReactionTypeFilter>('all');
  const [reagentCategoryFilter, setReagentCategoryFilter] = useState<string>('all');
  const [isDraggingOverVessel, setIsDraggingOverVessel] = useState<boolean>(false);
  const [draggedReagentId, setDraggedReagentId] = useState<string | null>(null);

  // Simulation State
  const [reaction, setReaction] = useState<ChemicalReaction | null>(null);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [reactionProgress, setReactionProgress] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(25);
  const [reactionCompleted, setReactionCompleted] = useState<boolean>(false);
  const [activeTabPrompt, setActiveTabPrompt] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check for pending preset loaded from QUREO Curriculum Pathway
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('scinexa_pending_preset');
      if (pending) {
        const parsed = JSON.parse(pending);
        if (Array.isArray(parsed.reagents)) {
          setSelectedReagentIds(parsed.reagents);
          setBunsenBurnerActive(!!parsed.heat);
        }
        sessionStorage.removeItem('scinexa_pending_preset');
      }
    } catch {}
  }, []);

  // Sync reaction whenever selected reagents or Bunsen heat changes
  useEffect(() => {
    const matched = findMatchingReaction(selectedReagentIds, bunsenBurnerActive, reactionType);
    setReaction(matched);
    setIsReacting(false);
    setReactionProgress(0);
    setReactionCompleted(false);
    const temp = bunsenBurnerActive ? 120 : 25;
    setTemperature(temp);

    // Update global live context for Darwin AI inspection
    const names = selectedReagentIds.map(id => {
      const r = WORKBENCH_REAGENTS.find(item => item.id === id);
      return r ? `${r.nameAr} (${r.formula})` : id;
    });
    updateChemistryState({
      selectedReagents: selectedReagentIds,
      reagentNamesAr: names,
      reactionEquation: matched?.equation,
      reactionNameAr: matched?.typeAr || matched?.categoryAr,
      flameActive: bunsenBurnerActive,
      temperature: temp,
    });
  }, [selectedReagentIds, bunsenBurnerActive, reactionType]);

  // Handle mixing / ignition
  const handleStartReaction = () => {
    if (!reaction || isReacting) return;
    setIsReacting(true);
    setReactionProgress(0);
    setReactionCompleted(false);
  };

  const handleResetVessel = () => {
    setIsReacting(false);
    setReactionProgress(0);
    setReactionCompleted(false);
    setTemperature(bunsenBurnerActive ? 120 : 25);
  };

  const handleClearAll = () => {
    setSelectedReagentIds([]);
    setIsReacting(false);
    setReactionProgress(0);
    setReactionCompleted(false);
    setTemperature(bunsenBurnerActive ? 120 : 25);
  };

  // Add reagent to vessel (max 2)
  const handleAddReagent = (reagentId: string) => {
    if (selectedReagentIds.includes(reagentId)) return;
    if (selectedReagentIds.length >= 2) {
      // Replace the second one
      setSelectedReagentIds([selectedReagentIds[0], reagentId]);
    } else {
      setSelectedReagentIds([...selectedReagentIds, reagentId]);
    }
  };

  const handleRemoveReagent = (reagentId: string) => {
    setSelectedReagentIds(selectedReagentIds.filter(id => id !== reagentId));
  };

  // ── تجارب تحضير الغازات والمواد غير العضوية ──
  const BAC2_LESSON_PRESETS = [
    {
      id: 'bac2-1',
      titleAr: '1. اختزال أكسيد النحاس بالهيدروجين (CuO + H₂)',
      titleEn: '1. Reduction of CuO by H2',
      reagents: ['CuO', 'H2'],
      heat: true,
      badgeAr: 'حرارة مرتفعة',
      color: 'from-orange-500/20 to-amber-600/30 border-orange-500/40 text-orange-200'
    },
    {
      id: 'bac2-2',
      titleAr: '2. تحضير غاز الهيدروجين (Fe + H₂SO₄)',
      titleEn: '2. Preparation of H2 (Fe + H2SO4)',
      reagents: ['Fe', 'H2SO4'],
      heat: false,
      badgeAr: 'إحلال بسيط',
      color: 'from-emerald-500/20 to-teal-600/30 border-emerald-500/40 text-emerald-200'
    },
    {
      id: 'bac2-3',
      titleAr: '3. تحضير غاز الكلور (MnO₂ + HCl)',
      titleEn: '3. Chlorine Gas Prep (MnO2 + HCl)',
      reagents: ['MnO2', 'HCl'],
      heat: true,
      badgeAr: 'تسخين + مؤكسد',
      color: 'from-lime-500/20 to-green-600/30 border-lime-500/40 text-lime-200'
    },
    {
      id: 'bac2-4',
      titleAr: '4. تحضير غاز الأكسجين (H₂O₂ + MnO₂)',
      titleEn: '4. Oxygen Prep (H2O2 + MnO2)',
      reagents: ['H2O2', 'MnO2'],
      heat: false,
      badgeAr: 'حفاز MnO2',
      color: 'from-sky-500/20 to-cyan-600/30 border-sky-500/40 text-sky-200'
    },
    {
      id: 'bac2-5',
      titleAr: '5. تحضير النشادر بهابر-بوش (N₂ + 3H₂ ⇌ 2NH₃)',
      titleEn: '5. Haber-Bosch NH3 (N2 + 3H2)',
      reagents: ['N2', 'H2'],
      heat: true,
      badgeAr: 'اتزان ⇌ Fe₃O₄',
      color: 'from-blue-500/20 to-indigo-600/30 border-blue-500/40 text-blue-200'
    },
    {
      id: 'bac2-6',
      titleAr: '6. تحضير حمض النيتريك بأوستفالد (NH₃ + O₂)',
      titleEn: '6. Ostwald Nitric Acid (NH3 + O2)',
      reagents: ['NH3', 'O2'],
      heat: true,
      badgeAr: 'بلاتين Pt + حرارة',
      color: 'from-amber-500/20 to-red-600/30 border-amber-500/40 text-amber-200'
    },
    {
      id: 'bac2-7',
      titleAr: '7. تحضير أول أكسيد الكربون (HCOOH + H₂SO₄)',
      titleEn: '7. Carbon Monoxide Prep (HCOOH + H2SO4)',
      reagents: ['HCOOH', 'H2SO4'],
      heat: true,
      badgeAr: 'نزع ماء + لهب أزرق',
      color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-200'
    },
    {
      id: 'bac2-8',
      titleAr: '8. تحضير ثاني أكسيد الكربون (CaCO₃ + HCl)',
      titleEn: '8. CO2 Prep (CaCO3 + HCl)',
      reagents: ['CaCO3', 'HCl'],
      heat: false,
      badgeAr: 'فوران الحجر الجيري',
      color: 'from-slate-500/20 to-zinc-600/30 border-slate-500/40 text-slate-200'
    },
    {
      id: 'bac2-9',
      titleAr: 'الكشف التأكيدي: ماء الجير الرائق (CO₂ + Ca(OH)₂)',
      titleEn: 'Limewater Test: CO2 + Ca(OH)2',
      reagents: ['CO2', 'Ca_OH_2'],
      heat: false,
      badgeAr: 'تعكر أبيض حليبي',
      color: 'from-purple-500/20 to-pink-600/30 border-purple-500/40 text-purple-200'
    }
  ];

  // Fast preset loader
  const loadPreset = (reagentIds: string[], heat: boolean = false) => {
    setSelectedReagentIds(reagentIds);
    setBunsenBurnerActive(heat);
  };

  // Reagents list based on filter
  const bac2ReagentIds = [
    'CuO', 'H2', 'Fe', 'H2SO4', 'MnO2', 'HCl', 'H2O2', 
    'N2', 'Fe3O4', 'NH3', 'Pt', 'NO', 'NO2', 'HNO3', 
    'HCOOH', 'CO', 'CaCO3', 'Ca_OH_2', 'CO2'
  ];

  const filteredReagents = WORKBENCH_REAGENTS.filter(r => {
    if (reagentCategoryFilter === 'all') return true;
    if (reagentCategoryFilter === 'bac2') return bac2ReagentIds.includes(r.id);
    if (reagentCategoryFilter === 'metals') return r.category === 'metal' || r.category === 'nonmetal';
    if (reagentCategoryFilter === 'acids_bases') return r.category === 'acid' || r.category === 'base' || r.category === 'water';
    if (reagentCategoryFilter === 'salts') return r.category === 'salt';
    if (reagentCategoryFilter === 'thermal') return r.category === 'compound';
    return true;
  });

  // Reaction progress ticker
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
        const next = prev + 1;
        const targetTemp = 25 + reaction.temperatureChange + (bunsenBurnerActive ? 95 : 0);
        setTemperature(Math.round(25 + (targetTemp - 25) * (next / 100)));
        return next;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [isReacting, reaction, bunsenBurnerActive]);

  // -------------------------------------------------------------
  // HTML5 High-Fidelity Physics & Particle Canvas Renderer
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = (canvas.width = (canvas.parentElement?.clientWidth || 700) * dpr);
    const height = (canvas.height = 380 * dpr);
    ctx.scale(dpr, dpr);

    const logicalW = width / dpr;
    const logicalH = height / dpr;

    interface LabParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
      type: 'spark' | 'smoke' | 'bubble' | 'precipitate' | 'flame_tongue';
    }

    const particles: LabParticle[] = [];

    const beakerLeft = logicalW * 0.32;
    const beakerRight = logicalW * 0.68;
    const beakerBottom = logicalH - 65;
    const liquidTop = logicalH - 180;
    const bWidth = beakerRight - beakerLeft;

    const spawnSparks = (count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.5;
        particles.push({
          x: logicalW / 2 + (Math.random() - 0.5) * 50,
          y: liquidTop + 10 + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2.8,
          radius: Math.random() * 2.5 + 1.5,
          color,
          alpha: 1,
          life: 0,
          maxLife: 35 + Math.random() * 35,
          type: 'spark'
        });
      }
    };

    const spawnSmoke = (count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: logicalW / 2 + (Math.random() - 0.5) * 60,
          y: liquidTop - 15,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -Math.random() * 2.2 - 1.2,
          radius: Math.random() * 10 + 6,
          color,
          alpha: 0.65,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          type: 'smoke'
        });
      }
    };

    const spawnBubbles = (count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: beakerLeft + 15 + Math.random() * (bWidth - 30),
          y: beakerBottom - 10,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -Math.random() * 3.0 - 1.5,
          radius: Math.random() * 3.5 + 1.8,
          color: 'rgba(255,255,255,0.85)',
          alpha: 0.9,
          life: 0,
          maxLife: 55,
          type: 'bubble'
        });
      }
    };

    let animTime = 0;

    const render = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }
      animTime++;
      ctx.clearRect(0, 0, logicalW, logicalH);

      // --- 1. Laboratory Bench Surface ---
      const benchY = beakerBottom + 12;
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, logicalW, logicalH);

      // Gradient perspective tabletop
      const benchGrad = ctx.createLinearGradient(0, benchY, 0, logicalH);
      benchGrad.addColorStop(0, '#0f172a');
      benchGrad.addColorStop(1, '#020408');
      ctx.fillStyle = benchGrad;
      ctx.fillRect(0, benchY, logicalW, logicalH - benchY);

      // Metallic edge line
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, benchY);
      ctx.lineTo(logicalW, benchY);
      ctx.stroke();

      // Lab Retort Stand & Clamp
      const standX = beakerRight + 45;
      ctx.fillStyle = '#334155';
      ctx.fillRect(standX - 3, 30, 6, benchY - 30);
      ctx.fillRect(standX - 30, benchY - 6, 60, 6);
      // Horizontal arm & clamp holding beaker neck
      ctx.fillRect(beakerRight - 10, 105, standX - beakerRight + 10, 5);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(beakerRight - 12, 100, 6, 15);

      // --- 2. Bunsen Burner Under Beaker ---
      const burnerX = logicalW / 2;
      const burnerY = benchY;
      const burnerTop = beakerBottom + 8;

      // Burner metal base & pipe
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(burnerX - 22, burnerY - 5, 44, 5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(burnerX - 5, burnerTop + 8, 10, burnerY - burnerTop - 13);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(burnerX - 8, burnerTop + 4, 16, 5);

      // Animated Bunsen Flame if active
      if (bunsenBurnerActive) {
        const flameHeight = 24 + Math.sin(animTime * 0.3) * 3;
        // Inner hot blue cone
        const blueFlameGrad = ctx.createRadialGradient(burnerX, burnerTop + 4, 2, burnerX, burnerTop - flameHeight, 18);
        blueFlameGrad.addColorStop(0, '#38bdf8');
        blueFlameGrad.addColorStop(0.5, '#6366f1');
        blueFlameGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = blueFlameGrad;
        ctx.beginPath();
        ctx.moveTo(burnerX - 6, burnerTop + 4);
        ctx.quadraticCurveTo(burnerX, burnerTop - flameHeight, burnerX + 6, burnerTop + 4);
        ctx.closePath();
        ctx.fill();

        // Outer heat glow
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(burnerX, burnerTop - 10, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 3. Beaker Liquid & Dynamic Color Blending ---
      const cornerR = 14;
      let targetLiquidColor = 'rgba(30, 41, 59, 0.45)';

      if (selectedReagentIds.length > 0) {
        const r1 = WORKBENCH_REAGENTS.find(r => r.id === selectedReagentIds[0]);
        targetLiquidColor = (r1?.colorHex || '#38bdf8') + '55';
      }

      if (reaction) {
        if (isReacting) {
          if (reactionProgress > 60) {
            targetLiquidColor = reaction.liquidColor + 'dd';
          } else if (reactionProgress > 20) {
            targetLiquidColor = reaction.liquidColor + '88';
          }
        } else if (reactionCompleted) {
          targetLiquidColor = reaction.liquidColor + 'ee';
        }
      }

      // Draw Beaker Liquid Fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(beakerLeft + 8, liquidTop);
      // Fluid wave simulation
      const waveAmp = isReacting ? 4.5 : bunsenBurnerActive ? 2.5 : 1.2;
      for (let x = beakerLeft + 8; x <= beakerRight - 8; x += 10) {
        const w = Math.sin((x / 18) + (animTime * 0.09)) * waveAmp;
        ctx.lineTo(x, liquidTop + w);
      }
      ctx.lineTo(beakerRight - 8, beakerBottom - cornerR);
      ctx.quadraticCurveTo(beakerRight - 8, beakerBottom - 4, beakerRight - cornerR - 8, beakerBottom - 4);
      ctx.lineTo(beakerLeft + cornerR + 8, beakerBottom - 4);
      ctx.quadraticCurveTo(beakerLeft + 8, beakerBottom - 4, beakerLeft + 8, beakerBottom - cornerR);
      ctx.closePath();

      ctx.fillStyle = targetLiquidColor;
      ctx.fill();

      // Liquid gloss shine reflection
      const liquidGloss = ctx.createLinearGradient(beakerLeft, 0, beakerRight, 0);
      liquidGloss.addColorStop(0, 'rgba(255,255,255,0.25)');
      liquidGloss.addColorStop(0.15, 'transparent');
      liquidGloss.addColorStop(0.85, 'transparent');
      liquidGloss.addColorStop(1, 'rgba(255,255,255,0.12)');
      ctx.fillStyle = liquidGloss;
      ctx.fill();
      ctx.restore();

      // --- 4. Precipitate / Solid Formation at Bottom ---
      if ((isReacting && reactionProgress > 30) || reactionCompleted) {
        if (reaction?.solidProduct) {
          const precipHeight = Math.min(22, (reactionProgress / 100) * 22);
          ctx.save();
          let pColor = '#f8fafc';
          if (reaction.visualEffect === 'precipitate_yellow') pColor = '#facc15';
          if (reaction.visualEffect === 'precipitate_blue') pColor = '#0284c7';
          if (reaction.visualEffect === 'precipitate_brown') pColor = '#b45309';

          ctx.fillStyle = pColor;
          ctx.beginPath();
          ctx.ellipse(logicalW / 2, beakerBottom - 10, bWidth * 0.38, precipHeight * 0.45 + 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Granular texture on precipitate
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          for (let g = 0; g < 12; g++) {
            const gx = logicalW / 2 + (Math.random() - 0.5) * (bWidth * 0.6);
            const gy = beakerBottom - 10 + (Math.random() - 0.5) * 6;
            ctx.beginPath();
            ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // --- 5. Beaker Glassware Outline & Ticks ---
      ctx.save();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Lip spout left
      ctx.moveTo(beakerLeft - 9, 82);
      ctx.lineTo(beakerLeft, 92);
      ctx.lineTo(beakerLeft, beakerBottom - cornerR);
      ctx.quadraticCurveTo(beakerLeft, beakerBottom, beakerLeft + cornerR, beakerBottom);
      ctx.lineTo(beakerRight - cornerR, beakerBottom);
      ctx.quadraticCurveTo(beakerRight, beakerBottom, beakerRight, beakerBottom - cornerR);
      ctx.lineTo(beakerRight, 92);
      ctx.lineTo(beakerRight + 6, 85);
      ctx.stroke();

      // Glass highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(beakerLeft + 6, 105);
      ctx.lineTo(beakerLeft + 6, beakerBottom - 18);
      ctx.stroke();

      // Measurement Graduations
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px monospace';
      const tickSpacing = (beakerBottom - 105) / 4;
      for (let t = 1; t <= 4; t++) {
        const y = beakerBottom - t * tickSpacing;
        ctx.beginPath();
        ctx.moveTo(beakerLeft + 4, y);
        ctx.lineTo(beakerLeft + 16, y);
        ctx.stroke();
        ctx.fillText(`${t * 100}ml`, beakerLeft + 20, y + 3);
      }
      ctx.restore();

      // --- 6. Active Reaction Special Effects (Flames, Sparks, Gas Clouds) ---
      if (isReacting && reaction) {
        if (reaction.visualEffect === 'bright_flash') {
          // Blinding incandescent flare
          const flare = ctx.createRadialGradient(logicalW / 2, liquidTop + 15, 5, logicalW / 2, liquidTop + 15, 140);
          flare.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
          flare.addColorStop(0.35, 'rgba(250, 204, 21, 0.7)');
          flare.addColorStop(1, 'transparent');
          ctx.fillStyle = flare;
          ctx.beginPath();
          ctx.arc(logicalW / 2, liquidTop + 15, 140, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.7) spawnSparks(3, '#fef08a');
          if (Math.random() < 0.3) spawnSmoke(1, '#ffffff');
        } else if (reaction.visualEffect === 'orange_fire') {
          const fireG = ctx.createRadialGradient(logicalW / 2, liquidTop + 10, 5, logicalW / 2, liquidTop + 10, 95);
          fireG.addColorStop(0, 'rgba(249, 115, 22, 0.9)');
          fireG.addColorStop(0.45, 'rgba(239, 68, 68, 0.5)');
          fireG.addColorStop(1, 'transparent');
          ctx.fillStyle = fireG;
          ctx.beginPath();
          ctx.arc(logicalW / 2, liquidTop + 10, 95, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.7) spawnSparks(3, '#fb923c');
          if (Math.random() < 0.4) spawnSmoke(1, '#64748b');
        } else if (reaction.visualEffect === 'blue_flame') {
          const blueG = ctx.createRadialGradient(logicalW / 2, liquidTop + 10, 5, logicalW / 2, liquidTop + 10, 85);
          blueG.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
          blueG.addColorStop(0.5, 'rgba(99, 102, 241, 0.5)');
          blueG.addColorStop(1, 'transparent');
          ctx.fillStyle = blueG;
          ctx.beginPath();
          ctx.arc(logicalW / 2, liquidTop + 10, 85, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.5) spawnSparks(2, '#38bdf8');
          if (Math.random() < 0.6) spawnBubbles(2);
        } else if (reaction.visualEffect === 'purple_flame') {
          const pG = ctx.createRadialGradient(logicalW / 2, liquidTop + 10, 5, logicalW / 2, liquidTop + 10, 90);
          pG.addColorStop(0, 'rgba(192, 132, 252, 0.95)');
          pG.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
          pG.addColorStop(1, 'transparent');
          ctx.fillStyle = pG;
          ctx.beginPath();
          ctx.arc(logicalW / 2, liquidTop + 10, 90, 0, Math.PI * 2);
          ctx.fill();

          if (Math.random() < 0.8) spawnSparks(3, '#e879f9');
          if (Math.random() < 0.4) spawnSmoke(2, '#c084fc');
        } else if (reaction.visualEffect === 'effervescence_bubbles') {
          spawnBubbles(3);
          if (Math.random() < 0.4) spawnSmoke(1, '#f8fafc');
        } else if (reaction.visualEffect === 'smoke_effervescence') {
          spawnBubbles(2);
          spawnSmoke(2, '#f1f5f9');
        } else if (reaction.visualEffect === 'precipitate_yellow') {
          if (Math.random() < 0.4) spawnSmoke(1, '#facc15');
        }
      }

      // --- 7. Particle Physics & Drawing ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

        if (p.type === 'smoke') {
          p.radius += 0.22;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.45;
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
          ctx.globalAlpha = p.alpha * 0.75;
          ctx.lineWidth = 1.2;
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
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedReagentIds, reaction, isReacting, reactionProgress, reactionCompleted, bunsenBurnerActive]);

  // When the chosen reaction type gives no result, check whether the pair reacts by another type.
  const otherTypeMatch = (() => {
    if (reactionType === 'all' || selectedReagentIds.length === 0) return null;
    for (const k of REACTION_TYPE_KEYS) {
      if (k === reactionType) continue;
      const m = findMatchingReaction(selectedReagentIds, true, k);
      if (m) return { key: k, reaction: m };
    }
    return null;
  })();
  const reactionTypeKey = reaction ? typeKeyOfCategory(reaction.category) : null;

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & CURRICULUM PRESET BAR */}
      <div className="sci-card p-5 relative overflow-hidden bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-cyan-950/30 border border-indigo-500/20">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                {ar ? 'المختبر الافتراضي التفاعلي للتفاعلات الكيميائية' : 'Interactive Chemical Reactions & Workbench Studio'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {ar ? 'معمل التفاعلات والاستقصاء المخبري الشامل' : 'Full Virtual Chemical Reactions Workbench'}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {ar
                ? 'اسحب أو انقر لإضافة المواد الكيميائية إلى كأس التفاعل، وتحكم في موقد بنزن للتسخين المباشر، وشاهد التغير اللوني اللحظي، الفوران الغازي، الرواسب، والمعادلة الكيميائية الموزونة.'
                : 'Drag or click chemical reagents into the reaction beaker, toggle the Bunsen burner for thermal reactions, and observe real-time bubbling, precipitates, and balanced stoichiometry.'}
            </p>
          </div>

          {/* Inorganic Gas Synthesis Laboratory Presets */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-bold font-mono text-cyan-300">
                  {ar ? '🧪 تجارب تحضير الغازات والمواد غير العضوية' : '🧪 Inorganic Chemistry & Gas Synthesis Laboratory'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                {ar ? 'محاكاة تفاعلية ثلاثية الأبعاد 3D ⚡' : 'Interactive 3D Simulation ⚡'}
              </span>
            </div>

            {/* Horizontal Scrollable Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
              {BAC2_LESSON_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.reagents, preset.heat)}
                  className={`p-2.5 rounded-xl border text-right flex flex-col justify-between transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-b ${preset.color} hover:shadow-lg`}
                >
                  <span className="text-[11px] font-bold text-white line-clamp-2 leading-snug">
                    {ar ? preset.titleAr : preset.titleEn}
                  </span>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[9px] font-mono">
                    <span className="text-white/80 font-bold">{preset.badgeAr}</span>
                    <span className="text-cyan-300 font-mono">تحميل للتجربة ←</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Curriculum Jump Pills (Other Famous Experiments) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-400 block w-full lg:w-auto">
              {ar ? 'تجارب كلاسيكية عامة:' : 'Classic Presets:'}
            </span>
            <button
              onClick={() => loadPreset(['Zn', 'HCl'])}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all"
            >
              Zn + HCl (إحلال بسيط)
            </button>
            <button
              onClick={() => loadPreset(['Fe', 'CuSO4'])}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              Fe + CuSO₄ (ترسيب النحاس)
            </button>
            <button
              onClick={() => loadPreset(['Pb_NO3_2', 'KI'])}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
            >
              Pb(NO₃)₂ + KI (المطر الذهبي)
            </button>
            <button
              onClick={() => loadPreset(['HgO'], true)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
            >
              HgO + تسخين (انحلال حراري)
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKBENCH GRID: REAGENT RACK (LEFT) + EXPERIMENT BENCH (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Categorized Reagent Rack (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">

          {/* Active Vessels & Bunsen Controls Card */}
          <div className="sci-card p-4 space-y-3 bg-[#0a0e1c] border-indigo-500/30">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                {ar ? 'محتويات كأس التفاعل النشطة' : 'Active Reagents in Vessel'}
              </span>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                title={ar ? 'تفريغ الكأس بالكامل' : 'Empty Vessel'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{ar ? 'تفريغ الكأس' : 'Clear Vessel'}</span>
              </button>
            </div>

            {/* Active Reagent Slots (1 & 2) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                setIsDraggingOverVessel(true);
              }}
              onDragLeave={() => setIsDraggingOverVessel(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOverVessel(false);
                const rId = e.dataTransfer.getData('text/plain');
                if (rId) handleAddReagent(rId);
                setDraggedReagentId(null);
              }}
              className="grid grid-cols-2 gap-3"
            >
              {[0, 1].map(slotIdx => {
                const rId = selectedReagentIds[slotIdx];
                const reagent = WORKBENCH_REAGENTS.find(r => r.id === rId);

                return (
                  <div
                    key={slotIdx}
                    className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] transition-all relative ${
                      reagent
                        ? 'bg-slate-950/90 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-dashed border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {ar ? `المتفاعل (${slotIdx + 1})` : `Slot ${slotIdx + 1}`}
                      </span>
                      {reagent && (
                        <button
                          onClick={() => handleRemoveReagent(reagent.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          title={ar ? 'إزالة هذا المتفاعل' : 'Remove'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {reagent ? (
                      <div className="flex items-center gap-2.5 my-1">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-sm text-white shadow"
                          style={{ backgroundColor: reagent.colorHex + '40', border: `1.5px solid ${reagent.colorHex}` }}
                        >
                          {reagent.symbol}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-white block truncate">
                            {ar ? reagent.nameAr : reagent.nameEn}
                          </span>
                          <span className="text-[10px] text-cyan-300 font-mono block">
                            {reagent.formula}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {ar ? '+ انقر على مادة لإضافتها' : '+ Click reagent to add'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bunsen Burner & Reaction Trigger Controls */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Bunsen Burner Flame Switch */}
              <button
                onClick={() => setBunsenBurnerActive(!bunsenBurnerActive)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                  bunsenBurnerActive
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 border-amber-400 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:border-amber-400/50'
                }`}
              >
                <Flame className={`w-4 h-4 ${bunsenBurnerActive ? 'text-amber-200 animate-bounce' : 'text-slate-400'}`} />
                <span>{bunsenBurnerActive ? (ar ? 'موقد بنزن: مشتعل (حرارة)' : 'Bunsen: ON') : (ar ? 'إشعال موقد بنزن' : 'Ignite Bunsen')}</span>
              </button>

              {/* Start Mixing / Reaction Button */}
              <button
                onClick={handleStartReaction}
                disabled={!reaction || isReacting}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  !reaction
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : isReacting
                    ? 'bg-cyan-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isReacting
                    ? (ar ? 'جاري التفاعل...' : 'Reacting...')
                    : !reaction
                    ? (ar ? 'لا يوجد تفاعل مباشر' : 'No Direct Reaction')
                    : (ar ? 'بدء التفاعل الكيميائي' : 'Trigger Reaction')}
                </span>
              </button>

              {/* Reset Vessel Button */}
              <button
                onClick={handleResetVessel}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all"
                title={ar ? 'إعادة ضبط التجربة' : 'Reset Experiment'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reaction Type Selector */}
          <div className="sci-card p-4 space-y-2">
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {([{ id: 'all' as ReactionTypeFilter, ar: 'كل الأنواع', en: 'All types' }, ...REACTION_TYPE_KEYS.map(k => ({ id: k as ReactionTypeFilter, ar: REACTION_TYPE_INFO[k].ar, en: REACTION_TYPE_INFO[k].en }))]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setReactionType(t.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    reactionType === t.id ? 'bg-emerald-400 text-black' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {ar ? t.ar : t.en}
                </button>
              ))}
            </div>
            {reactionType !== 'all' && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <span>{ar ? REACTION_TYPE_INFO[reactionType].descAr : REACTION_TYPE_INFO[reactionType].descEn}</span>
                <span dir="ltr" className="font-mono font-black text-emerald-300">{REACTION_TYPE_INFO[reactionType].form}</span>
              </div>
            )}
          </div>

          {/* Reagent Rack Shelf */}
          <div className="sci-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {ar ? 'رف المواد الكيميائية والأملاح' : 'Reagent Chemical Shelf'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredReagents.length} {ar ? 'مادة متوفرة' : 'Reagents'}
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1 text-[11px] font-mono">
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'bac2', labelAr: 'تحضير الغازات والمركبات', labelEn: 'Gas Synthesis & Inorganic' },
                { id: 'metals', labelAr: 'فلزات ولا فلزات', labelEn: 'Metals & Gases' },
                { id: 'acids_bases', labelAr: 'أحماض وقواعد', labelEn: 'Acids & Bases' },
                { id: 'salts', labelAr: 'أملاح ومحاليل', labelEn: 'Salts' },
                { id: 'thermal', labelAr: 'مركبات الانحلال', labelEn: 'Thermal' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setReagentCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    reagentCategoryFilter === cat.id
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {ar ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Reagents Grid (Click to Add / Drag) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredReagents.map(reagent => {
                const isSelected = selectedReagentIds.includes(reagent.id);
                return (
                  <div
                    key={reagent.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', reagent.id);
                      e.dataTransfer.effectAllowed = 'copy';
                      setDraggedReagentId(reagent.id);
                    }}
                    onDragEnd={() => setDraggedReagentId(null)}
                    onClick={() => {
                      if (isSelected) {
                        handleRemoveReagent(reagent.id);
                      } else {
                        handleAddReagent(reagent.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-grab active:cursor-grabbing relative group ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/80 shadow-md shadow-cyan-500/20'
                        : 'border-white/10 bg-slate-950/70 hover:border-white/30 hover:bg-slate-900'
                    } ${draggedReagentId === reagent.id ? 'opacity-40 scale-95 border-cyan-400' : ''}`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 shadow-[0_0_8px_#22d3ee]" />
                    )}
                    <span
                      className="text-base font-black font-mono mt-1 text-white group-hover:scale-105 transition-transform"
                      style={{ color: reagent.colorHex }}
                    >
                      {reagent.symbol}
                    </span>
                    <span className="text-[10px] text-slate-200 font-bold truncate max-w-full text-center mt-1">
                      {ar ? reagent.nameAr : reagent.nameEn}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {reagent.categoryAr}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <p className="text-[11px] text-cyan-300 font-bold font-mono flex items-center gap-1.5">
                <span>✋</span>
                <span>{ar ? 'طريقة السحب والإفلات التفاعلية:' : 'Interactive Drag & Drop:'}</span>
              </p>
              <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
                {ar
                  ? 'اسحب أي عنصر بالماوس وأفلته مباشرة داخل كأس التفاعل، ثم اسحب العنصر الثاني وأفلته فوقه لمزجهما وبدء التفاعل الكيميائي!'
                  : 'Drag any chemical card and drop it directly onto the beaker, then drag the second reagent on top to combine and react!'}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Realistic Canvas Visualizer + Scientific Data (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Live Vessel Canvas */}
          <div className="sci-card p-4 space-y-3 relative overflow-hidden bg-[#040714] border-cyan-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {ar ? 'المراقبة البصرية اللحظية لكأس التفاعل' : 'Real-time Reaction Vessel Telemetry'}
                </span>
              </div>

              {/* Dynamic Thermometer HUD */}
              <div className="flex items-center gap-2 bg-slate-950/90 border border-white/10 px-3 py-1 rounded-xl">
                <Thermometer className={`w-4 h-4 ${temperature > 85 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
                <span className="text-xs font-mono font-black text-white">
                  {temperature} °C
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({Math.round((temperature * 9/5) + 32)} °F)
                </span>
              </div>
            </div>

            {/* Canvas Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                if (!isDraggingOverVessel) setIsDraggingOverVessel(true);
              }}
              onDragLeave={(e) => {
                // Only leave if not hovering child
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsDraggingOverVessel(false);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOverVessel(false);
                const rId = e.dataTransfer.getData('text/plain');
                if (rId) handleAddReagent(rId);
                setDraggedReagentId(null);
              }}
              className={`w-full relative rounded-xl overflow-hidden border transition-all duration-300 bg-[#060a18] ${
                isDraggingOverVessel
                  ? 'border-cyan-400 ring-4 ring-cyan-500/30 shadow-2xl shadow-cyan-500/40'
                  : 'border-white/10'
              }`}
            >
              <canvas ref={canvasRef} className="w-full block" />

              {/* Drag & Drop Visual Target Overlay */}
              {isDraggingOverVessel && (
                <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-sm border-2 border-dashed border-cyan-400 rounded-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150 z-30 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mb-3 animate-bounce shadow-lg shadow-cyan-500/40">
                    <FlaskConical className="w-7 h-7 text-cyan-300" />
                  </div>
                  <span className="text-base sm:text-lg font-black font-mono text-white tracking-wide">
                    {selectedReagentIds.length === 0
                      ? (ar ? '🎯 أسقط المتفاعل الأول في كأس التفاعل' : '🎯 Drop 1st Reagent into Vessel')
                      : selectedReagentIds.length === 1
                      ? (ar ? '🧪 أسقط المتفاعل الثاني فوق الأول لبدء التفاعل الكيميائي!' : '🧪 Drop 2nd Reagent on top to react!')
                      : (ar ? '🔄 أسقط لاستبدال المتفاعل' : '🔄 Drop to replace reagent')}
                  </span>
                  <span className="text-xs font-mono text-cyan-300 mt-1">
                    {ar ? 'اترك الماوس للإسقاط والخلط الفوري' : 'Release mouse to drop & combine instantly'}
                  </span>
                </div>
              )}

              {/* Reaction Progress Overlay Bar */}
              {isReacting && (
                <div className="absolute top-3 left-4 right-4 bg-slate-950/90 border border-cyan-400/40 p-2.5 rounded-xl backdrop-blur-md shadow-lg shadow-cyan-500/10">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-white font-mono font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      <span>{ar ? 'تقدم التفاعل المخبري:' : 'Reaction Progress:'}</span>
                    </span>
                    <span className="text-cyan-300 font-mono font-bold">{Math.round(reactionProgress)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-500 h-full rounded-full transition-all duration-75"
                      style={{ width: `${reactionProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scientific Output / Chemical Equation Card */}
          {reaction ? (
            <div className="sci-card p-5 space-y-4 bg-[#0a0f20]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                    {ar ? 'معادلة التفاعل الكيميائي الموزونة' : 'Balanced Chemical Equation'}
                  </span>
                  <span className="text-lg sm:text-xl font-black font-mono text-white mt-1 block tracking-wide">
                    {ar ? reaction.equationAr : reaction.equation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">{ar ? 'تصنيف التفاعل العلمي:' : 'Category:'}</span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {ar ? reaction.categoryAr : reaction.categoryEn}
                  </span>
                </div>
              </div>

              {/* Reaction Metrics Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'الديناميكا الحرارية:' : 'Thermodynamics:'}</span>
                  <span className="text-xs font-mono font-bold text-rose-300 block">{ar ? reaction.energyAr : reaction.energyEn}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'النواتج المتكونة:' : 'Formed Products:'}</span>
                  <span className="text-xs font-mono font-bold text-cyan-300 block">{ar ? reaction.productsAr : reaction.productsEn}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'المظهر وتغير اللون والراسب:' : 'Visual & Precipitate:'}</span>
                  <span className="text-xs font-mono font-bold text-emerald-300 block">{ar ? reaction.colorChangeAr : reaction.colorChangeEn}</span>
                </div>
              </div>

              {/* Gas Released Banner if any */}
              {reaction.gasReleased && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200 text-xs">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong className="text-white font-mono">{ar ? 'الغاز المتصاعد:' : 'Gas Released:'}</strong> {reaction.gasReleased}
                  </span>
                </div>
              )}

              {/* Scientific Mechanism */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-300">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{ar ? 'التفسير العلمي المجهري للتفاعل' : 'Scientific Mechanism'}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {ar ? reaction.scientificExplanationAr : reaction.scientificExplanationEn}
                </p>
              </div>

              {/* Sources (shown for the four basic reaction types) */}
              {reactionTypeKey && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 block">{ar ? 'المصادر العلمية:' : 'Sources:'}</span>
                  <ul className="space-y-0.5 list-disc ps-4">
                    {REACTION_TYPE_INFO[reactionTypeKey].sources.map(i => (
                      <li key={i} className="text-[11px] text-slate-400 break-words">
                        <a href={REACTION_SOURCES[i].url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                          {REACTION_SOURCES[i].title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Precautions */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-200 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{ar ? reaction.safetyHazardAr : reaction.safetyHazardEn}</span>
              </div>
            </div>
          ) : (
            <div className="sci-card p-8 text-center space-y-3 border-dashed border-white/20 bg-[#070b16]">
              <FlaskConical className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-200">
                {selectedReagentIds.length === 0
                  ? (ar ? 'الكأس فارغ — اختر المواد من الرف على اليسار لبدء التجربة' : 'Empty Vessel — Select reagents from the shelf on the left')
                  : selectedReagentIds.length === 1 && !bunsenBurnerActive
                  ? (ar ? 'أضف متفاعلاً ثانياً أو أشعل موقد بنزن لتجارب الانحلال الحراري' : 'Add a second reagent or turn on the Bunsen burner for thermal decomposition')
                  : reactionType !== 'all' && selectedReagentIds.length >= 2
                  ? (ar ? `لا يحدث تفاعل من نوع «${REACTION_TYPE_INFO[reactionType].ar}» بين هاتين المادتين` : `No ${REACTION_TYPE_INFO[reactionType].en.toLowerCase()} reaction between these two substances`)
                  : (ar ? 'لا يوجد تفاعل كيميائي مباشر معروف بين هذه المواد في هذه الظروف' : 'No Spontaneous Reaction Under Current Conditions')}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {ar
                  ? 'جرب اختيار تجربة من الأزرار الجاهزة بالأعلى (مثل: Zn + HCl للإحلال البسيط، أو Pb(NO₃)₂ + KI لترسيب المطر الذهبي، أو HgO مع إشعال موقد بنزن للانحلال الحراري).'
                  : 'Try one of the quick curriculum presets above (e.g. Zn + HCl for single displacement, Pb(NO₃)₂ + KI for golden rain, or HgO with Bunsen heat for thermal decomposition).'}
              </p>
              {otherTypeMatch && (
                <p className="text-xs text-emerald-300 max-w-md mx-auto leading-relaxed">
                  {ar ? 'لكنهما يتفاعلان بنوع: ' : 'But they do react by: '}
                  <strong>{ar ? REACTION_TYPE_INFO[otherTypeMatch.key].ar : REACTION_TYPE_INFO[otherTypeMatch.key].en}</strong>
                  {' — '}<span dir="ltr" className="font-mono">{otherTypeMatch.reaction.equation}</span>
                </p>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default PraxiReactionSimulator;
