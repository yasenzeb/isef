import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { saveState, loadState } from '../utils/persistence';
import { 
  RotateCcw, 
  Zap, 
  Award, 
  Gauge, 
  Maximize2, 
  ExternalLink,
  Move,
  Target,
  Compass,
  Layers,
  Sparkles,
  Camera,
  Download,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  Columns,
  X,
  ShieldCheck
} from 'lucide-react';

function WaveSimulator({ language }: { language: string }) {
  const [frequency, setFrequency] = useState(1.5); // Hz
  const [amplitude, setAmplitude] = useState(30);  // px
  const [tension, setTension] = useState(0.7);     // 0-1 normalized
  const [isRunning, setIsRunning] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Wave speed: v = sqrt(T/mu), normalized to pixel space
  const waveSpeed = Math.sqrt(tension * 800 + 200); // px/s

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isRunning) timeRef.current += 0.016;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const cx = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = 'rgba(3,7,18,0.95)';
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(99,102,241,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(0, cx); ctx.lineTo(W, cx); ctx.stroke();
      ctx.setLineDash([]);

      // Wave — draw glowing sinusoid with single stroke pass & analytical crests
      const lambda = waveSpeed / frequency; // wavelength in px
      const k = (2 * Math.PI) / lambda;
      const omega = 2 * Math.PI * frequency;

      // Build path once
      ctx.beginPath();
      for (let px = 0; px <= W; px += 2) {
        const y = cx + amplitude * Math.sin(k * px - omega * t);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }

      // Glow pass
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = 'rgba(99,102,241,0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Main crisp wave pass
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Analytical Wave Crest Markers (direct mathematical solution, zero linear scanning)
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      const firstPeak = (((Math.PI / 2 + omega * t) / k) % lambda + lambda) % lambda;
      for (let px = firstPeak; px <= W; px += lambda) {
        ctx.beginPath();
        ctx.arc(px, cx - amplitude, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Labels
      ctx.fillStyle = 'rgba(99,102,241,0.7)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`\u03bb = ${lambda.toFixed(0)} px`, 12, 20);
      ctx.fillText(`v = ${waveSpeed.toFixed(0)} px/s`, 12, 36);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frequency, amplitude, tension, isRunning, waveSpeed]);

  const ar = language === 'ar';
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 sci-card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {ar ? 'محاكاة الموجة على وتر' : 'Wave on a String Simulator'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {ar ? 'اضبط التردد والسعة والتوتر لمشاهدة انتشار الموجة وسرعتها اللحظية' : 'Adjust frequency, amplitude, and tension to see wave propagation in real time'}
            </p>
          </div>
          <button
            onClick={() => setIsRunning(r => !r)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
            style={{ background: isRunning ? 'rgba(244,63,94,0.2)' : 'linear-gradient(135deg,#6366f1,#06b6d4)', border: isRunning ? '1px solid rgba(244,63,94,0.4)' : 'none', color: isRunning ? '#f87171' : 'white' }}
          >
            {isRunning ? (ar ? '⏸ إيقاف' : '⏸ Pause') : (ar ? '▶ تشغيل' : '▶ Play')}
          </button>
        </div>

        <div className="wave-canvas-container">
          <canvas ref={canvasRef} width={700} height={200} style={{ width: '100%', height: '200px', display: 'block' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: ar ? 'التردد (Hz)' : 'Frequency (Hz)',
              value: frequency, setValue: setFrequency,
              min: 0.2, max: 4, step: 0.1,
              display: `${frequency.toFixed(1)} Hz`,
              color: '#818cf8',
            },
            {
              label: ar ? 'السعة (px)' : 'Amplitude (px)',
              value: amplitude, setValue: setAmplitude,
              min: 5, max: 80, step: 1,
              display: `${amplitude} px`,
              color: '#22d3ee',
            },
            {
              label: ar ? 'التوتر (T)' : 'Tension (T)',
              value: tension, setValue: setTension,
              min: 0.1, max: 1, step: 0.05,
              display: `${(tension * 100).toFixed(0)}%`,
              color: '#34d399',
            },
          ].map((ctrl) => (
            <div key={ctrl.label}>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-400">{ctrl.label}</span>
                <span style={{ color: ctrl.color, fontFamily: 'var(--font-mono)' }}>{ctrl.display}</span>
              </div>
              <input
                type="range"
                min={ctrl.min} max={ctrl.max} step={ctrl.step}
                value={ctrl.value}
                onChange={e => ctrl.setValue(Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="sci-card p-5 space-y-3">
          <h4 className="text-sm font-bold text-white">{ar ? 'القوانين الفيزيائية' : 'Physics Equations'}</h4>
          <div className="space-y-2 text-xs font-mono" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.75rem', padding: '0.875rem', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>v = √(T / μ)</div>
            <div>λ = v / f</div>
            <div>y(x,t) = A · sin(kx − ωt)</div>
            <div style={{ color: '#6366f1', marginTop: '0.5rem' }}>k = 2π/λ&nbsp;&nbsp;ω = 2πf</div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { label: ar ? 'السرعة' : 'Wave Speed', val: `${waveSpeed.toFixed(0)} px/s`, color: '#818cf8' },
              { label: ar ? 'طول الموجة' : 'Wavelength', val: `${(waveSpeed / frequency).toFixed(0)} px`, color: '#22d3ee' },
              { label: ar ? 'التردد الزاوي' : 'Angular Freq.', val: `${(2 * Math.PI * frequency).toFixed(2)} rad/s`, color: '#34d399' },
              { label: ar ? 'عدد الموجة' : 'Wave Number', val: `${((2 * Math.PI * frequency) / waveSpeed).toFixed(3)} /px`, color: '#fbbf24' },
            ].map(m => (
              <div key={m.label} className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: m.color, fontFamily: 'var(--font-mono)' }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sci-card p-4 space-y-2">
          <span className="sci-badge sci-badge-cyan">{ar ? 'محاكاة ديناميكية' : 'Dynamic Simulation'}</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            {ar
              ? 'محاكاة رياضية دقيقة لانتشار الموجات الميكانيكية المستعرضة وحساب سرعة الموجة والطول الموجي والتردد الزاوي لحظياً.'
              : 'Rigorous mathematical modeling of transverse mechanical waves on a string with real-time speed, wavelength, and angular frequency telemetry.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export const PhysicsLab: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'circuits' | 'forces' | 'projectiles' | 'optics' | 'waves'>(() =>
    loadState<'circuits' | 'forces' | 'projectiles' | 'optics' | 'waves'>('physics_module', 'circuits')
  );

  // Sub-screens for multi-screen simulations
  const [forcesScreen, setForcesScreen] = useState<number>(() => loadState<number>('physics_forces_screen', 1));
  const [pmScreen, setPmScreen] = useState<number>(() => loadState<number>('physics_pm_screen', 3));
  const [opticsScreen, setOpticsScreen] = useState<number>(() => loadState<number>('physics_optics_screen', 1));

  // Auto-save physics lab state
  useEffect(() => {
    saveState('physics_module', activeModule);
  }, [activeModule]);

  // Listen to remote module switch orders from Darwin (Fish Audio)
  useEffect(() => {
    const handleSwitch = (e: any) => {
      const mod = e.detail?.module;
      if (mod && ['circuits', 'forces', 'projectiles', 'optics', 'waves'].includes(mod)) {
        setActiveModule(mod);
      }
    };
    window.addEventListener('scinexa:switch_physics_module', handleSwitch);
    return () => window.removeEventListener('scinexa:switch_physics_module', handleSwitch);
  }, []);

  useEffect(() => {
    saveState('physics_forces_screen', forcesScreen);
  }, [forcesScreen]);

  useEffect(() => {
    saveState('physics_pm_screen', pmScreen);
  }, [pmScreen]);

  useEffect(() => {
    saveState('physics_optics_screen', opticsScreen);
  }, [opticsScreen]);

  const circuitsIframeRef = useRef<HTMLIFrameElement>(null);
  const forcesIframeRef = useRef<HTMLIFrameElement>(null);
  const projectilesIframeRef = useRef<HTMLIFrameElement>(null);
  const opticsIframeRef = useRef<HTMLIFrameElement>(null);

  interface SavedCircuitData {
    count: number;
    wires: number;
    batteries: number;
    lightBulbs: number;
    resistors: number;
    switches: number;
    hasCurrent: boolean;
    screenshot: string | null;
    timestamp: number;
  }

  const [savedCircuit, setSavedCircuit] = useState<SavedCircuitData | null>(() =>
    loadState<SavedCircuitData | null>('saved_circuit', null)
  );
  const [isSidePinned, setIsSidePinned] = useState<boolean>(false);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<boolean>(false);

  // Listen to auto-save messages from the circuit iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'SCINEXA_CIRCUIT_AUTOSAVE' && e.data.payload) {
        const payload = e.data.payload;
        setSavedCircuit(payload);
        saveState('saved_circuit', payload);

        // Darwin Context Bridge: notify when circuit changes
        if (payload.count > 0) {
          const parts = [];
          if (payload.batteries > 0) parts.push(`${payload.batteries} بطارية`);
          if (payload.resistors > 0) parts.push(`${payload.resistors} مقاومة`);
          if (payload.lightBulbs > 0) parts.push(`${payload.lightBulbs} مصباح`);
          if (payload.wires > 0) parts.push(`${payload.wires} سلك`);
          if (payload.switches > 0) parts.push(`${payload.switches} مفتاح`);
          window.dispatchEvent(new CustomEvent('scinexa:context', {
            detail: {
              lab: 'physics',
              type: 'circuit_update',
              title: `دائرة كهربائية (${payload.count} عنصر)`,
              desc: parts.join('، ') + (payload.hasCurrent ? ' — التيار يجري ✓' : ' — لا يجري تيار بعد'),
            }
          }));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Prevent accidental exit if the user has an active circuit with elements
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (savedCircuit && savedCircuit.count > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [savedCircuit]);

  const triggerManualSave = () => {
    try {
      const win = circuitsIframeRef.current?.contentWindow as any;
      if (win?.phet?.joist?.sim) {
        const sim = win.phet.joist.sim;
        let screenshot: string | null = null;
        if (win.phet.joist.ScreenshotGenerator) {
          screenshot = win.phet.joist.ScreenshotGenerator.generateScreenshot(sim, 'image/jpeg');
        }
        const screens = sim.simScreens || sim.screens;
        const screen = (sim.selectedScreenProperty && sim.selectedScreenProperty.value) || screens?.[0];
        const circuit = screen?.model?.circuit;
        const elements = circuit?.circuitElements;
        const count = (elements?.length !== undefined) ? elements.length : (elements?.count || 0);
        let wires = 0, batteries = 0, lightBulbs = 0, resistors = 0, switches = 0;
        let hasCurrent = false;

        for (let i = 0; i < count; i++) {
          const el = elements.get ? elements.get(i) : elements[i];
          if (!el) continue;
          const t = el.type || '';
          if (t === 'wire') wires++;
          else if (t === 'battery') batteries++;
          else if (t === 'lightBulb') lightBulbs++;
          else if (t === 'resistor') resistors++;
          else if (t === 'switch') switches++;
          if (el.currentProperty && Math.abs(el.currentProperty.value || 0) > 0.001) {
            hasCurrent = true;
          }
        }

        const data: SavedCircuitData = {
          count: count || 1,
          wires,
          batteries,
          lightBulbs,
          resistors,
          switches,
          hasCurrent,
          screenshot,
          timestamp: Date.now()
        };
        setSavedCircuit(data);
        saveState('saved_circuit', data);
        setSaveSuccessNotification(true);
        setTimeout(() => setSaveSuccessNotification(false), 2500);
      }
    } catch (err) {}
  };

  const downloadSchematic = () => {
    if (!savedCircuit?.screenshot) return;
    const link = document.createElement('a');
    link.href = savedCircuit.screenshot;
    link.download = `scinexa-circuit-${new Date().toISOString().slice(0, 10)}.jpg`;
    link.click();
  };

  const clearCircuitBackup = () => {
    setSavedCircuit(null);
    saveState('saved_circuit', null);
    setIsSidePinned(false);
  };

  const simLocale = language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : language === 'de' ? 'de' : 'en';

  const getSimUrl = (base: string, params: string = '') => {
    const separator = base.includes('?') ? '&' : '?';
    const query = params ? `${params}&locale=${simLocale}` : `locale=${simLocale}`;
    return `${base}${separator}${query}`;
  };

  const handleReload = (ref: React.RefObject<HTMLIFrameElement | null>, defaultSrc: string) => {
    if (ref.current) {
      ref.current.src = defaultSrc + (defaultSrc.includes('?') ? '&' : '?') + 'r=' + Date.now();
    }
  };

  const handleFullscreen = (ref: React.RefObject<HTMLIFrameElement | null>) => {
    if (ref.current && ref.current.requestFullscreen) {
      ref.current.requestFullscreen();
    }
  };

  // Scientists
  const ohm = REAL_SCIENTISTS.find(s => s.id === 'ohm');
  const newton = REAL_SCIENTISTS.find(s => s.id === 'newton');
  const galileo = REAL_SCIENTISTS.find(s => s.id === 'galileo');
  const alhazen = REAL_SCIENTISTS.find(s => s.id === 'alhazen');

  const activeTabStyle = { background: '#ffffff', color: '#000000', fontWeight: 'bold' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <span className="sci-badge">
              {language === 'ar' ? 'المختبرات التفاعلية للفيزياء' : 'Interactive Physics Laboratories'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>{t.physics.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.physics.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex items-center flex-wrap gap-1.5 sci-surface p-1.5">
          <button
            onClick={() => setActiveModule('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'circuits' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'circuits' ? activeTabStyle : undefined}
          >
            {t.physics.circuits}
          </button>
          <button
            onClick={() => setActiveModule('forces')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'forces' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'forces' ? activeTabStyle : undefined}
          >
            {language === 'ar' ? 'القوى والحركة' : 'Forces & Motion'}
          </button>
          <button
            onClick={() => setActiveModule('projectiles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'projectiles' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'projectiles' ? activeTabStyle : undefined}
          >
            {language === 'ar' ? 'حركة المقذوفات' : 'Projectile Motion'}
          </button>
          <button
            onClick={() => setActiveModule('optics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'optics' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'optics' ? activeTabStyle : undefined}
          >
            {t.physics.optics}
          </button>
          <button
            onClick={() => setActiveModule('waves')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'waves' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'waves' ? activeTabStyle : undefined}
          >
            {language === 'ar' ? 'محاكاة الموجات' : 'Wave Simulator'}
          </button>
        </div>
      </div>

      {/* MODULE 1: INTERACTIVE CIRCUIT LAB (DC LAB ONLY, ZERO BOTTOM BAR) */}
      {activeModule === 'circuits' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl sci-surface">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: '#fbbf24' }} />
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? 'مختبر الدوائر التفاعلي (التيار المستمر DC)' : 'Interactive DC Circuit Lab'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                {language === 'ar' ? 'المختبر الكامل' : 'Full Workbench'}
              </span>
              {saveSuccessNotification && (
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  <CheckCircle2 className="w-3 h-3" />
                  {language === 'ar' ? 'تم حفظ مسودة الدائرة!' : 'Circuit Draft Saved!'}
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={triggerManualSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-100 transition-colors"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                title={language === 'ar' ? 'حفظ لقطة فورية من الدائرة الحالية' : 'Capture instant snapshot'}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'حفظ نقطة عمل' : 'Save Snapshot'}</span>
              </button>
              <button
                onClick={() => handleReload(circuitsIframeRef, getSimUrl('/simulations/circuit-construction-kit-dc_ar.html'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'إعادة ضبط المختبر' : 'Reset Simulation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
              <button
                onClick={() => handleFullscreen(circuitsIframeRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</span>
              </button>
              <button
                onClick={() => window.open(getSimUrl('/simulations/circuit-construction-kit-dc_ar.html'), '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'فتح في نافذة مستقلة' : 'Open in New Window'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Auto-Saved Circuit Workspace Banner */}
          {savedCircuit && savedCircuit.count > 0 && (
            <div className="sci-card p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-slate-900/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {savedCircuit.screenshot && (
                  <div 
                    onClick={() => setPreviewModalOpen(true)}
                    className="relative group w-20 h-14 rounded-lg overflow-hidden border border-white/20 cursor-pointer flex-shrink-0 bg-black/60 shadow hover:border-indigo-400 transition-all"
                    title={language === 'ar' ? 'انقر لتكبير المخطط' : 'Click to enlarge'}
                  >
                    <img src={savedCircuit.screenshot} alt="Saved Circuit" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      {language === 'ar' ? 'تم استعادة آخر دائرة قيد العمل تلقائياً' : 'Last active circuit auto-restored'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      {savedCircuit.hasCurrent 
                        ? (language === 'ar' ? '⚡ تيار متدفق' : '⚡ Current Flowing')
                        : (language === 'ar' ? '⚪ دائرة مفتوحة' : '⚪ Open Circuit')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-300">
                    <span>🔋 {savedCircuit.batteries} {language === 'ar' ? 'بطارية' : 'battery'}</span>
                    <span>•</span>
                    <span>💡 {savedCircuit.lightBulbs} {language === 'ar' ? 'مصباح' : 'bulb'}</span>
                    <span>•</span>
                    <span>⚡ {savedCircuit.wires} {language === 'ar' ? 'سلك' : 'wire'}</span>
                    {savedCircuit.resistors > 0 && <><span>•</span><span>🎛️ {savedCircuit.resistors} {language === 'ar' ? 'مقاومة' : 'resistor'}</span></>}
                    {savedCircuit.switches > 0 && <><span>•</span><span>🔌 {savedCircuit.switches} {language === 'ar' ? 'مفتاح' : 'switch'}</span></>}
                    <span>•</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(savedCircuit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  title={language === 'ar' ? 'معاينة المخطط' : 'Preview Schematic'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'معاينة المخطط' : 'Preview'}</span>
                </button>
                <button
                  onClick={downloadSchematic}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  title={language === 'ar' ? 'تحميل كصورة PNG' : 'Download PNG'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تصدير PNG' : 'Export PNG'}</span>
                </button>
                <button
                  onClick={() => setIsSidePinned(!isSidePinned)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSidePinned ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                  title={language === 'ar' ? 'تثبيت المخطط بجانب مساحة العمل أثناء التركيب' : 'Pin side-by-side reference'}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>{isSidePinned ? (language === 'ar' ? 'إغلاق المرجع' : 'Close Ref') : (language === 'ar' ? 'تثبيت كمرجع جانبي' : 'Pin Reference')}</span>
                </button>
                <button
                  onClick={clearCircuitBackup}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                  title={language === 'ar' ? 'بدء دائرة جديدة وتفريغ الحفظ' : 'Clear and new circuit'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'دائرة جديدة' : 'New'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Simulation Frame & Optional Side Reference */}
          <div className={`grid grid-cols-1 ${isSidePinned && savedCircuit?.screenshot ? 'lg:grid-cols-12' : ''} gap-4`}>
            <div className={`${isSidePinned && savedCircuit?.screenshot ? 'lg:col-span-8' : 'w-full'} sci-card p-2 sm:p-3 overflow-hidden shadow-2xl`}>
              <div className="relative w-full rounded-xl overflow-hidden bg-[#030712] border border-white/10" style={{ height: '720px' }}>
                <iframe
                  ref={circuitsIframeRef}
                  key={`circuits-${simLocale}`}
                  src={getSimUrl('/simulations/circuit-construction-kit-dc_ar.html')}
                  title={language === 'ar' ? 'مختبر الدوائر التفاعلي' : 'Interactive Circuit Lab'}
                  className="w-full h-full border-0 block"
                  allow="fullscreen; autoplay"
                />
              </div>
            </div>

            {/* Side-by-side Reference Workspace */}
            {isSidePinned && savedCircuit?.screenshot && (
              <div className="lg:col-span-4 sci-card p-4 flex flex-col justify-between space-y-4 shadow-2xl border border-indigo-500/30 bg-slate-950/80">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Columns className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {language === 'ar' ? 'مرجع الدائرة المحفوظة' : 'Saved Circuit Reference'}
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsSidePinned(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title={language === 'ar' ? 'إغلاق المرجع' : 'Close'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow group cursor-pointer" onClick={() => setPreviewModalOpen(true)}>
                    <img src={savedCircuit.screenshot} alt="Reference Circuit" className="w-full h-48 object-contain bg-black/40" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تكبير المخطط' : 'Enlarge'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'عدد العناصر' : 'Total Items'}</span>
                      <span className="font-bold text-white font-mono">{savedCircuit.count}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-slate-400 block text-[10px]">{language === 'ar' ? 'حالة التيار' : 'State'}</span>
                      <span className={`font-bold font-mono ${savedCircuit.hasCurrent ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {savedCircuit.hasCurrent ? (language === 'ar' ? 'مغلقة' : 'Closed') : (language === 'ar' ? 'مفتوحة' : 'Open')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5 font-mono">
                    <div className="text-[10px] text-indigo-400 font-bold uppercase">{language === 'ar' ? 'قوانين الدائرة' : 'Circuit Formulas'}</div>
                    <div>V = I × R (قانون أوم)</div>
                    <div>Rt = R1 + R2 (توالي)</div>
                    <div>1/Rt = 1/R1 + 1/R2 (توازي)</div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={downloadSchematic}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تحميل المخطط' : 'Download'}</span>
                  </button>
                  <button
                    onClick={clearCircuitBackup}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    title={language === 'ar' ? 'مسح المحفوظ' : 'Clear'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* High-Resolution Schematic Modal */}
          {previewModalOpen && savedCircuit?.screenshot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPreviewModalOpen(false)}>
              <div className="relative max-w-4xl w-full sci-card p-6 rounded-3xl border border-white/20 bg-[#090d16] shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      {language === 'ar' ? 'مخطط الدائرة الكهربائية المحفوظة' : 'Saved Circuit Schematic Diagram'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/80 flex items-center justify-center p-2">
                  <img src={savedCircuit.screenshot} alt="Enlarged Circuit" className="max-h-[60vh] w-auto object-contain rounded-xl" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono">{new Date(savedCircuit.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{savedCircuit.count} {language === 'ar' ? 'عنصر مركب' : 'components'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadSchematic}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تحميل كصورة عالية الدقة' : 'Download High-Res'}</span>
                    </button>
                    <button
                      onClick={() => setPreviewModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      {language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cards & Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#fbbf24' }}>
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'أدوات بناء وتجميع الدوائر' : 'Circuit Components'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'سحب وإفلات البطاريات والمصابيح والمقاومات والأسلاك والمفاتيح لتركيب دوائر حقيقية، مع تجربة التوصيل على التوالي والتوازي واختبار القصر الكهربائي.'
                  : 'Drag and drop batteries, lightbulbs, resistors, wires, and switches to construct series and parallel circuits with real-time short-circuit feedback.'}
              </p>
            </div>

            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#34d399' }}>
                <Gauge className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'أجهزة القياس الرقمية' : 'Digital Instrumentation'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'استخدم الفولتميتر الرقمي لقياس فرق الجهد بين نقطتين، والأميتر الموضعي أو غير التلامسي لقياس شدة التيار وتتبع تدفق الشحنات.'
                  : 'Measure potential difference with digital probes, branch currents with contact/clamp ammeters, and track real-time electron drift.'}
              </p>
            </div>

            {ohm && (
              <div className="sci-card p-4 space-y-2">
                <div className="flex items-center gap-2" style={{ color: '#818cf8' }}>
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? ohm.nameAr : ohm.name}
                  </h4>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div>V = I · R &nbsp;(قانون أوم)</div>
                  <div>∑ I_in = ∑ I_out &nbsp;(كيرشوف للتيار)</div>
                  <div>∑ V = 0 &nbsp;(كيرشوف للجهد)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: FORCES AND MOTION LAB */}
      {activeModule === 'forces' && (
        <div className="space-y-6">
          {/* Controls Bar with Screen Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl sci-surface">
            {/* Screen Selector Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {[
                { id: 1, ar: '⚖️ محصلة القوى', en: '⚖️ Net Force' },
                { id: 2, ar: '🏃 الحركة', en: '🏃 Motion' },
                { id: 3, ar: '🧱 الاحتكاك', en: '🧱 Friction' },
                { id: 4, ar: '⚡ التسارع', en: '⚡ Acceleration' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setForcesScreen(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    forcesScreen === s.id ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                  style={forcesScreen === s.id ? { background: 'linear-gradient(135deg, #10b981, #06b6d4)' } : undefined}
                >
                  {language === 'ar' ? s.ar : s.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReload(forcesIframeRef, getSimUrl('/simulations/forces-and-motion-basics_ar.html', `screens=${forcesScreen}`))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'إعادة ضبط المختبر' : 'Reset Simulation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
              <button
                onClick={() => handleFullscreen(forcesIframeRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</span>
              </button>
              <button
                onClick={() => window.open(getSimUrl('/simulations/forces-and-motion-basics_ar.html', `screens=${forcesScreen}`), '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'فتح في نافذة مستقلة' : 'Open in New Window'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Simulation Frame */}
          <div className="sci-card p-2 sm:p-3 overflow-hidden shadow-2xl">
            <div className="relative w-full rounded-xl overflow-hidden bg-[#030712] border border-white/10" style={{ height: '720px' }}>
              <iframe
                ref={forcesIframeRef}
                key={`forces-${forcesScreen}-${simLocale}`}
                src={getSimUrl('/simulations/forces-and-motion-basics_ar.html', `screens=${forcesScreen}`)}
                title={language === 'ar' ? 'محاكي القوى والحركة' : 'Forces and Motion Simulation'}
                className="w-full h-full border-0 block"
                allow="fullscreen; autoplay"
              />
            </div>
          </div>

          {/* Cards & Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#34d399' }}>
                <Move className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'محصلة القوى والتوازن' : 'Net Force Dynamics'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'اختبر شد الحبل وتوازن القوى الأفقية، مع ملاحظة كيف تؤدي محصلة القوى غير الصفرية إلى تسارع الجسم وتغير سرعته المتجهة.'
                  : 'Explore horizontal force balance and tug-of-war setups to observe how non-zero net forces accelerate masses in real time.'}
              </p>
            </div>

            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#fbbf24' }}>
                <Layers className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'قوى الاحتكاك والقصور' : 'Friction & Inertia'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'تحكم في معامل الاحتكاك السطحي وقوة الدفع المؤثرة على الأجسام، وحلل الفرق بين الاحتكاك السكوني والحركي والسرعة القصوى.'
                  : 'Control surface friction coefficients and applied forces to study transitions between static friction, kinetic friction, and terminal velocity.'}
              </p>
            </div>

            {newton && (
              <div className="sci-card p-4 space-y-2">
                <div className="flex items-center gap-2" style={{ color: '#818cf8' }}>
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? newton.nameAr : newton.name}
                  </h4>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div>F_net = m · a &nbsp;(قانون نيوتن الثاني)</div>
                  <div>f_k = μ_k · N &nbsp;(الاحتكاك الحركي)</div>
                  <div>F_action = -F_reaction &nbsp;(نيوتن الثالث)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: PROJECTILE MOTION & AIR RESISTANCE LAB */}
      {activeModule === 'projectiles' && (
        <div className="space-y-6">
          {/* Controls Bar with Screen Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl sci-surface">
            {/* Screen Selector Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {[
                { id: 3, ar: '🚀 مقاومة الهواء (Drag)', en: '🚀 Air Drag' },
                { id: 4, ar: '🎯 المختبر الشامل (Lab)', en: '🎯 Full Lab' },
                { id: 2, ar: '📐 متجهات السرعة والقوة', en: '📐 Vectors' },
                { id: 1, ar: '🔭 حركة المقذوفات البسيطة', en: '🔭 Intro' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setPmScreen(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pmScreen === s.id ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                  style={pmScreen === s.id ? { background: 'linear-gradient(135deg, #f43f5e, #f59e0b)' } : undefined}
                >
                  {language === 'ar' ? s.ar : s.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReload(projectilesIframeRef, getSimUrl('/simulations/projectile-motion_ar.html', `screens=${pmScreen}`))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'إعادة ضبط المختبر' : 'Reset Simulation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
              <button
                onClick={() => handleFullscreen(projectilesIframeRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #f59e0b)' }}
                title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</span>
              </button>
              <button
                onClick={() => window.open(getSimUrl('/simulations/projectile-motion_ar.html', `screens=${pmScreen}`), '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'فتح في نافذة مستقلة' : 'Open in New Window'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Simulation Frame */}
          <div className="sci-card p-2 sm:p-3 overflow-hidden shadow-2xl">
            <div className="relative w-full rounded-xl overflow-hidden bg-[#030712] border border-white/10" style={{ height: '720px' }}>
              <iframe
                ref={projectilesIframeRef}
                key={`pm-${pmScreen}-${simLocale}`}
                src={getSimUrl('/simulations/projectile-motion_ar.html', `screens=${pmScreen}`)}
                title={language === 'ar' ? 'محاكي حركة المقذوفات ومقاومة الهواء' : 'Projectile Motion Simulation'}
                className="w-full h-full border-0 block"
                allow="fullscreen; autoplay"
              />
            </div>
          </div>

          {/* Cards & Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#f43f5e' }}>
                <Target className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'الكينماتيكا في بعدين' : '2D Kinematics'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'أطلق كرات المدفع والأجسام بزوايا وسرعات ابتدائية مختلفة، ولاحظ مسار القطع المكافئ المستقل في المحورين الأفقي والرأسي.'
                  : 'Launch cannonballs, pumpkins, and baseballs with custom initial speeds and angles to observe independent horizontal and vertical motions.'}
              </p>
            </div>

            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#fbbf24' }}>
                <Gauge className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'ديناميكا مقاومة الهواء' : 'Air Resistance & Drag'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'فعل مقاومة الهواء لاختبار تأثير مساحة المقطع ومعامل الإعاقة والكتلة والقطر على السرعة الحدية ومدى المقذوف.'
                  : 'Enable aerodynamic drag to examine how cross-sectional area, drag coefficient, and mass alter trajectory curves and terminal velocity.'}
              </p>
            </div>

            {galileo && (
              <div className="sci-card p-4 space-y-2">
                <div className="flex items-center gap-2" style={{ color: '#818cf8' }}>
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? galileo.nameAr : galileo.name}
                  </h4>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div>R = (v₀² · sin(2θ)) / g &nbsp;(المدى الأفقي)</div>
                  <div>H = (v₀ · sinθ)² / (2g) &nbsp;(أقصى ارتفاع)</div>
                  <div>F_d = ½ · ρ · v² · C_d · A &nbsp;(قوة الإعاقة)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 4: OPTICS & LIGHT BENDING LAB */}
      {activeModule === 'optics' && (
        <div className="space-y-6">
          {/* Controls Bar with Screen Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl sci-surface">
            {/* Screen Selector Pills */}
            <div className="flex items-center flex-wrap gap-1.5">
              {[
                { id: 1, ar: '🔦 انكسار وانعكاس الضوء', en: '🔦 Refraction' },
                { id: 2, ar: '🌈 المناشير وتشتت الألوان', en: '🌈 Prisms' },
                { id: 3, ar: '📐 أدوات القياس والأمواج', en: '📐 More Tools' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setOpticsScreen(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    opticsScreen === s.id ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                  style={opticsScreen === s.id ? { background: 'linear-gradient(135deg, #a855f7, #6366f1)' } : undefined}
                >
                  {language === 'ar' ? s.ar : s.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReload(opticsIframeRef, getSimUrl('/simulations/bending-light_ar.html', `screens=${opticsScreen}`))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'إعادة ضبط المختبر' : 'Reset Simulation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset'}</span>
              </button>
              <button
                onClick={() => handleFullscreen(opticsIframeRef)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
                title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</span>
              </button>
              <button
                onClick={() => window.open(getSimUrl('/simulations/bending-light_ar.html', `screens=${opticsScreen}`), '_blank')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                title={language === 'ar' ? 'فتح في نافذة مستقلة' : 'Open in New Window'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Simulation Frame */}
          <div className="sci-card p-2 sm:p-3 overflow-hidden shadow-2xl">
            <div className="relative w-full rounded-xl overflow-hidden bg-[#030712] border border-white/10" style={{ height: '720px' }}>
              <iframe
                ref={opticsIframeRef}
                key={`optics-${opticsScreen}-${simLocale}`}
                src={getSimUrl('/simulations/bending-light_ar.html', `screens=${opticsScreen}`)}
                title={language === 'ar' ? 'محاكي انكسار الضوء والمناشير' : 'Bending Light Simulation'}
                className="w-full h-full border-0 block"
                allow="fullscreen; autoplay"
              />
            </div>
          </div>

          {/* Cards & Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#a855f7' }}>
                <Compass className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'قانون سنيل والانكسار' : 'Snell\'s Refraction'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'وجه شعاع الليزر عبر أوساط مختلفة (الهواء، الماء، الزجاج)، وقس زوايا السقوط والانكسار والانعكاس باستخدام المنقلة الرقمية.'
                  : 'Shoot laser rays across media boundaries (air, water, glass) and measure incident, refracted, and reflected angles with digital protractors.'}
              </p>
            </div>

            <div className="sci-card p-4 space-y-2">
              <div className="flex items-center gap-2" style={{ color: '#fbbf24' }}>
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'الانعكاس الكلي والمناشير' : 'Prisms & TIR'}
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar'
                  ? 'شاهد ظاهرة الانعكاس الكلي الداخلي عند تجاوز الزاوية الحرجة، وافصل الضوء الأبيض إلى ألوان الطيف السبعة عبر المناشير الزجاجية.'
                  : 'Observe Total Internal Reflection beyond critical angles and disperse multi-wavelength white light into rainbow spectra with glass prisms.'}
              </p>
            </div>

            {alhazen && (
              <div className="sci-card p-4 space-y-2">
                <div className="flex items-center gap-2" style={{ color: '#818cf8' }}>
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? alhazen.nameAr : alhazen.name}
                  </h4>
                </div>
                <div className="text-xs font-mono space-y-1 text-slate-300">
                  <div>n₁ · sin(θ₁) = n₂ · sin(θ₂) &nbsp;(قانون سنيل)</div>
                  <div>θ_c = arcsin(n₂ / n₁) &nbsp;(الزاوية الحرجة)</div>
                  <div>v = c / n &nbsp;(سرعة الطور في الوسط)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 5: WAVE SIMULATOR */}
      {activeModule === 'waves' && (
        <WaveSimulator language={language} />
      )}

    </div>
  );
};
