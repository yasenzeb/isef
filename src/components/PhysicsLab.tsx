import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { solveCircuit, CircuitComponent } from '../simulators/circuitSolver';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Plus, 
  Trash2, 
  Award, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Battery,
  Gauge,
  Activity,
  Layers
} from 'lucide-react';

// ============================================================
// PhET-Style Wave on a String Simulator Component
// ============================================================
function WaveSimulator({ language }: { language: string }) {
  const [frequency, setFrequency] = React.useState(1.5); // Hz
  const [amplitude, setAmplitude] = React.useState(30);  // px
  const [tension, setTension] = React.useState(0.7);     // 0-1 normalized
  const [isRunning, setIsRunning] = React.useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const timeRef = React.useRef(0);
  const rafRef = React.useRef<number>(0);

  // Wave speed: v = sqrt(T/mu), normalized to pixel space
  const waveSpeed = Math.sqrt(tension * 800 + 200); // px/s

  React.useEffect(() => {
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

      // Wave — draw glowing sinusoid
      const λ = waveSpeed / frequency; // wavelength in px
      const k = (2 * Math.PI) / λ;
      const ω = 2 * Math.PI * frequency;

      // Glow pass
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 16;
      ctx.strokeStyle = 'rgba(99,102,241,0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let px = 0; px <= W; px += 1) {
        const y = cx + amplitude * Math.sin(k * px - ω * t);
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();

      // Main wave
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let px = 0; px <= W; px += 1) {
        const y = cx + amplitude * Math.sin(k * px - ω * t);
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke();

      // Wave crest markers
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      const phaseOffset = (ω * t) % (2 * Math.PI);
      for (let px = 0; px <= W; px += 2) {
        const phaseVal = k * px - phaseOffset;
        if (Math.abs((phaseVal % (2 * Math.PI)) - Math.PI / 2) < 0.05 * k) {
          const y = cx + amplitude * Math.sin(k * px - ω * t);
          ctx.beginPath();
          ctx.arc(px, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // Labels
      ctx.fillStyle = 'rgba(99,102,241,0.7)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`λ = ${(λ).toFixed(0)} px`, 12, 20);
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
              {ar ? 'محاكاة الموجة على وتر (PhET-Style)' : 'Wave on a String — PhET-Style Simulator'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {ar ? 'اضبط التردد والسعة والتوتر لمشاهدة الموجة تتغير في الوقت الحقيقي' : 'Adjust frequency, amplitude, and tension to see the wave change in real time'}
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
        {/* Physics Info Card */}
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

        {/* PhET Attribution */}
        <div className="sci-card p-4 space-y-2">
          <span className="sci-badge sci-badge-cyan">{ar ? 'إلهام PhET' : 'PhET Inspired'}</span>
          <p className="text-xs text-slate-500 leading-relaxed">
            {ar
              ? 'مستلهم من محاكاة PhET للموجة على وتر (جامعة كولورادو). مبني بالكامل داخل المنصة بدون إطارات خارجية.'
              : 'Inspired by PhET\'s "Wave on a String" (Univ. of Colorado). Built entirely within SciNexa using canvas API.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PhysicsLab Main Component
// ============================================================
export const PhysicsLab: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'circuits' | 'mechanics' | 'optics' | 'waves'>('circuits');

  // CIRCUIT LAB STATE (Dynamic Interactive MNA Breadboard)
  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([
    { id: 'v1', type: 'dc_source', node1: 1, node2: 0, value: 12, label: 'DC Battery (12V)' },
    { id: 'sw1', type: 'switch', node1: 1, node2: 2, value: 0, label: 'Main Switch (S1)', state: true },
    { id: 'r1', type: 'resistor', node1: 2, node2: 3, value: 100, label: 'Resistor R1 (100Ω)' },
    { id: 'r2', type: 'resistor', node1: 3, node2: 0, value: 200, label: 'Resistor R2 (200Ω)' },
  ]);

  // Circuit Challenge Quiz
  const [circuitQuizAnswer, setCircuitQuizAnswer] = useState<number | null>(null);
  const [circuitQuizFeedback, setCircuitQuizFeedback] = useState<string | null>(null);

  // Mechanics state (Projectile motion & forces)
  const [velocity, setVelocity] = useState(25);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [mass, setMass] = useState(2.0); // kg
  const [frictionCoeff, setFrictionCoeff] = useState(0.1);
  const [isSimulating, setIsSimulating] = useState(false);

  // Optics state (Snell's Law & critical angle)
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [n1] = useState(1.0);
  const [n2, setN2] = useState(1.52);

  // Solve circuit using Modified Nodal Analysis
  const circuitSolution = solveCircuit(circuitComponents, 0);

  // Pioneers
  const ohm = REAL_SCIENTISTS.find(s => s.id === 'ohm');
  const newton = REAL_SCIENTISTS.find(s => s.id === 'newton');

  // Mechanics metrics
  const angleRad = (angle * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(angleRad)) / gravity;
  const maxRange = (Math.pow(velocity, 2) * Math.sin(2 * angleRad)) / gravity;
  const maxHeight = (Math.pow(velocity * Math.sin(angleRad), 2)) / (2 * gravity);
  const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2);

  // Optics metrics
  const incRad = (incidentAngle * Math.PI) / 180;
  const sinRefract = (n1 * Math.sin(incRad)) / n2;
  const refractAngleDeg = Math.asin(Math.min(1, sinRefract)) * (180 / Math.PI);
  const criticalAngleDeg = (180 / Math.PI) * Math.asin(1 / n2);

  // Component Management
  const updateComponentValue = (id: string, newVal: number) => {
    setCircuitComponents(prev => prev.map(c => c.id === id ? { ...c, value: Math.max(0.1, newVal) } : c));
  };

  const toggleSwitch = (id: string) => {
    setCircuitComponents(prev => prev.map(c => c.id === id ? { ...c, state: !c.state } : c));
  };

  const deleteComponent = (id: string) => {
    setCircuitComponents(prev => prev.filter(c => c.id !== id));
  };

  const addComponent = (type: 'resistor' | 'switch' | 'meter' | 'dc_source') => {
    const nextId = `${type[0]}${circuitComponents.length + 1}`;
    const nextNode = Math.max(...circuitComponents.map(c => Math.max(c.node1, c.node2))) + 1;

    let newComp: CircuitComponent;
    if (type === 'resistor') {
      newComp = { id: nextId, type: 'resistor', node1: 3, node2: 0, value: 150, label: `Resistor (${nextId})` };
    } else if (type === 'switch') {
      newComp = { id: nextId, type: 'switch', node1: 2, node2: nextNode, value: 0, label: `Branch Switch (${nextId})`, state: true };
    } else if (type === 'meter') {
      newComp = { id: nextId, type: 'meter', node1: 3, node2: 0, value: 0, label: `Voltmeter (${nextId})` };
    } else {
      newComp = { id: nextId, type: 'dc_source', node1: nextNode, node2: 0, value: 9, label: `Battery (${nextId})` };
    }

    setCircuitComponents(prev => [...prev, newComp]);
  };

  const handleCircuitQuiz = (choice: number) => {
    setCircuitQuizAnswer(choice);
    if (choice === 8) {
      setCircuitQuizFeedback(
        language === 'ar' 
          ? 'إجابة صحيحة وممتازة! V_R2 = V_total × [R2 / (R1 + R2)] = 12 × (200 / 300) = 8.0 فولت.' 
          : 'Correct! Voltage divider rule: V_R2 = 12V × (200 / 300) = 8.0 V.'
      );
    } else {
      setCircuitQuizFeedback(
        language === 'ar' 
          ? 'غير صحيح. طبق قاعدة مجزئ الجهد: V_R2 = V_total × [R2 / (R1 + R2)].' 
          : 'Incorrect. Use the voltage divider formula: V_R2 = V_total × (R2 / (R1 + R2)).'
      );
    }
  };

  const activeTabStyle = { background: 'linear-gradient(135deg, #6366f1, #06b6d4)' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div className="flex items-center space-x-2">
            <span className="sci-badge">
              {language === 'ar' ? 'محاكيات الفيزياء الحسابية والديناميكية' : 'Dynamic Computational Physics Lab'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>{t.physics.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.physics.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex items-center space-x-1.5 sci-surface p-1.5">
          <button
            onClick={() => setActiveModule('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'circuits' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'circuits' ? activeTabStyle : undefined}
          >
            {t.physics.circuits} (MNA Engine)
          </button>
          <button
            onClick={() => setActiveModule('mechanics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'mechanics' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeModule === 'mechanics' ? activeTabStyle : undefined}
          >
            {t.physics.mechanics}
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

      {/* MODULE 1: REAL CIRCUIT LAB WITH MODIFIED NODAL ANALYSIS */}
      {activeModule === 'circuits' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5" style={{ color: '#fbbf24' }} />
                    <span>
                      {language === 'ar' ? 'محرر ومحلل الدوائر الكهربائية (التحليل العقدي MNA)' : 'MNA Circuit Schematic & Dynamic Nodal Solver'}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {language === 'ar' ? 'إضافة بطاريات ومقاومات ومفاتيح وفولتميتر وحساب تيارات الفروع وجهود العقد' : 'Simulates Ohm & Kirchhoff laws via Gaussian matrix elimination'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => addComponent('resistor')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow transition-colors"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? '+ مقاومة' : '+ Resistor'}</span>
                  </button>
                  <button
                    onClick={() => addComponent('switch')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    style={{ background: 'rgba(17,24,39,0.8)' }}
                  >
                    <ToggleRight className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
                    <span>{language === 'ar' ? '+ مفتاح' : '+ Switch'}</span>
                  </button>
                  <button
                    onClick={() => addComponent('meter')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    style={{ background: 'rgba(17,24,39,0.8)' }}
                  >
                    <Gauge className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
                    <span>{language === 'ar' ? '+ مقياس جهد' : '+ Voltmeter'}</span>
                  </button>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                    circuitSolution.converged ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {circuitSolution.converged ? 'KCL Matrix Solved' : 'Circuit Open / Inactive'}
                  </span>
                </div>
              </div>

              {/* Dynamic Interactive Component List */}
              <div className="space-y-3">
                {circuitComponents.map((comp) => {
                  const current = circuitSolution.branchCurrents[comp.id] ?? 0;
                  const power = circuitSolution.componentPowers[comp.id] ?? 0;
                  return (
                    <div
                      key={comp.id}
                      className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {comp.type === 'dc_source' && <Battery className="w-4 h-4" style={{ color: '#818cf8' }} />}
                          {comp.type === 'switch' && <ToggleRight className="w-4 h-4" style={{ color: '#fbbf24' }} />}
                          {comp.type === 'meter' && <Gauge className="w-4 h-4" style={{ color: '#34d399' }} />}
                          {comp.type === 'resistor' && <Activity className="w-4 h-4" style={{ color: '#818cf8' }} />}

                          <span className="text-sm font-bold text-white">{comp.label || comp.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                            Node {comp.node1} &rarr; Node {comp.node2}
                          </span>
                        </div>

                        {comp.type !== 'switch' && (
                          <div className="flex items-center space-x-4 text-xs font-mono">
                            <span style={{ color: '#fbbf24' }}>
                              {language === 'ar' ? 'التيار I:' : 'Current I:'} {(current * 1000).toFixed(2)} mA
                            </span>
                            <span style={{ color: '#f87171' }}>
                              {language === 'ar' ? 'القدرة P:' : 'Power P:'} {(power * 1000).toFixed(2)} mW
                            </span>
                          </div>
                        )}
                        {comp.type === 'switch' && (
                          <div className="text-xs font-mono text-slate-400">
                            {language === 'ar' ? 'حالة المفتاح:' : 'Switch State:'}{' '}
                            <span style={{ color: comp.state ? '#34d399' : '#f87171', fontWeight: 700 }}>
                              {comp.state ? (language === 'ar' ? 'مغلق (يمر تيار)' : 'CLOSED (Conducting)') : (language === 'ar' ? 'مفتوح (قاطع)' : 'OPEN (Isolated)')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 w-full sm:w-72">
                        {comp.type === 'switch' ? (
                          <button
                            onClick={() => toggleSwitch(comp.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              comp.state ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
                            }`}
                          >
                            {comp.state ? (language === 'ar' ? 'فتح الدائرة' : 'Open Switch') : (language === 'ar' ? 'إغلاق الدائرة' : 'Close Switch')}
                          </button>
                        ) : comp.type !== 'meter' ? (
                          <>
                            <input
                              type="range"
                              min="1"
                              max={comp.type === 'dc_source' ? 48 : 500}
                              value={comp.value}
                              onChange={(e) => updateComponentValue(comp.id, Number(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs font-mono font-bold text-white w-16 text-right">
                              {comp.value} {comp.type === 'dc_source' ? 'V' : 'Ω'}
                            </span>
                          </>
                        ) : (
                          <div className="text-xs font-mono font-bold" style={{ color: '#34d399' }}>
                            {(Math.abs((circuitSolution.nodeVoltages[comp.node1] || 0) - (circuitSolution.nodeVoltages[comp.node2] || 0))).toFixed(2)} V
                          </div>
                        )}

                        {circuitComponents.length > 2 && (
                          <button
                            onClick={() => deleteComponent(comp.id)}
                            className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
                            style={{ background: 'rgba(244,63,94,0.05)' }}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Junction Potentials Table */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {language === 'ar' ? 'جهود العقد الكهربائية (مقارنة بالعقدة المرجعية 0V):' : 'Junction Node Voltages (Relative to Ground 0V):'}
              </span>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                {Object.entries(circuitSolution.nodeVoltages).map(([node, v]) => (
                  <div key={node} className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <span className="text-slate-400">Node {node}: </span>
                    <span className="font-bold" style={{ color: '#818cf8' }}>{v.toFixed(3)} V</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Interactive Voltage Divider Challenge */}
            <div className="sci-card p-5 space-y-4">
              <div className="flex items-center space-x-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <HelpCircle className="w-4 h-4" style={{ color: '#818cf8' }} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {language === 'ar' ? 'تحدي مجزئ الجهد (Voltage Divider)' : 'Voltage Divider Challenge'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar' 
                  ? 'إذا كان مصدر الجهد V1 = 12V، والمقاومة R1 = 100Ω، والمقاومة R2 = 200Ω على التوالي، فما هو فرق الجهد عند العقدة 2 (عبر المقاومة R2)؟'
                  : 'For a 12V supply with series resistors R1=100Ω and R2=200Ω, what is the voltage at Node 2 across R2?'}
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[4, 6, 8].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleCircuitQuiz(val)}
                    className="p-2 rounded-xl text-white font-mono font-bold text-xs transition-all hover:scale-105"
                    style={{ background: 'rgba(17,24,39,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    {val}.0 V
                  </button>
                ))}
              </div>

              {circuitQuizFeedback && (
                <div className="p-3 rounded-xl text-xs font-medium" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                  {circuitQuizFeedback}
                </div>
              )}
            </div>

            {/* Georg Simon Ohm Card */}
            {ohm && (
              <div className="sci-card p-5 space-y-3">
                <div className="flex items-center space-x-2" style={{ color: '#fbbf24' }}>
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'رائد الكهرومغناطيسية' : 'Scientific Pioneer'}
                  </h4>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{ohm.name}</span>
                  <span className="text-[11px] text-slate-400">{ohm.dates} • {ohm.field}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' ? ohm.contributionsAr : ohm.contributionsEn}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {ohm.citation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: MECHANICS & FORCES */}
      {activeModule === 'mechanics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ar' ? 'محاكاة حركة المقذوفات والقوى في بعدين' : '2D Ballistic Kinematics & Force Dynamics'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">y(t) = v₀·sin(θ)·t - ½·g·t² | E_k = ½·m·v²</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-colors"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? t.physics.pause : t.physics.play}</span>
                </button>
                <button
                  onClick={() => setIsSimulating(false)}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="metric-card">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'زمن التحليق الكلي' : 'Time of Flight'}
                </span>
                <span className="text-sm font-bold font-mono" style={{ color: '#818cf8' }}>{timeOfFlight.toFixed(2)} s</span>
              </div>
              <div className="metric-card">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'أقصى مدى أفقي (R)' : 'Total Range (R)'}
                </span>
                <span className="text-sm font-bold font-mono" style={{ color: '#34d399' }}>{maxRange.toFixed(2)} m</span>
              </div>
              <div className="metric-card">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'أقصى ارتفاع (H)' : 'Max Height (H)'}
                </span>
                <span className="text-sm font-bold font-mono" style={{ color: '#a855f7' }}>{maxHeight.toFixed(2)} m</span>
              </div>
              <div className="metric-card">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'طاقة الحركة (E_k)' : 'Kinetic Energy'}
                </span>
                <span className="text-sm font-bold font-mono" style={{ color: '#fbbf24' }}>{kineticEnergy.toFixed(1)} J</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{language === 'ar' ? 'السرعة الابتدائية المتجهة (v₀):' : 'Initial Velocity (v₀):'}</span>
                  <span className="font-mono" style={{ color: '#818cf8' }}>{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{language === 'ar' ? 'زاوية الإطلاق (θ):' : 'Launch Angle (θ):'}</span>
                  <span className="font-mono" style={{ color: '#818cf8' }}>{angle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">{language === 'ar' ? 'الكتلة (m):' : 'Mass (m):'}</span>
                    <span className="font-mono" style={{ color: '#818cf8' }}>{mass} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={mass}
                    onChange={(e) => setMass(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">{language === 'ar' ? 'تسارع الجاذبية (g):' : 'Gravity (g):'}</span>
                    <span className="font-mono" style={{ color: '#818cf8' }}>{gravity} m/s²</span>
                  </div>
                  <select
                    value={gravity}
                    onChange={(e) => setGravity(Number(e.target.value))}
                    className="w-full text-xs"
                  >
                    <option value={9.81}>Earth (الأرض - 9.81 m/s²)</option>
                    <option value={1.62}>Moon (القمر - 1.62 m/s²)</option>
                    <option value={3.71}>Mars (المريخ - 3.71 m/s²)</option>
                    <option value={24.79}>Jupiter (المشتري - 24.79 m/s²)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {newton && (
              <div className="sci-card p-5 space-y-3">
                <div className="flex items-center space-x-2" style={{ color: '#818cf8' }}>
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'رائد الميكانيكا الكلاسيكية' : 'Scientific Pioneer'}
                  </h4>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{newton.name}</span>
                  <span className="text-[11px] text-slate-400">{newton.dates} • {newton.field}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' ? newton.contributionsAr : newton.contributionsEn}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {newton.citation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 3: OPTICS */}
      {activeModule === 'optics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="sci-card p-6 space-y-5">
            <h3 className="text-base font-bold text-white pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', fontFamily: 'var(--font-display)' }}>
              {language === 'ar' ? 'قانون سنيل للانكسار والزاوية الحرجة' : 'Snell-Descartes Law of Refraction & Critical Angle'}
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'زاوية السقوط (θ₁):' : 'Angle of Incidence (θ₁):'}
                </span>
                <span className="font-mono" style={{ color: '#818cf8' }}>{incidentAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{language === 'ar' ? 'معامل الانكسار للوسط الثاني (n₂):' : 'Refractive Index (n₂):'}</span>
                <span className="font-mono" style={{ color: '#818cf8' }}>{n2}</span>
              </div>
              <select
                value={n2}
                onChange={(e) => setN2(Number(e.target.value))}
                className="w-full text-xs"
              >
                <option value={1.33}>Water (الماء - n = 1.33)</option>
                <option value={1.52}>Crown Glass (زجاج كراون - n = 1.52)</option>
                <option value={2.42}>Diamond (الماس - n = 2.42)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'زاوية الانكسار (θ₂)' : 'Refracted Angle (θ₂)'}
                </span>
                <span className="text-2xl font-black font-mono" style={{ color: '#818cf8' }}>{refractAngleDeg.toFixed(2)}°</span>
                <span className="text-[10px] text-slate-500 block mt-1">sin(θ₂) = (n₁ / n₂) · sin(θ₁)</span>
              </div>
              <div className="metric-card">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'الزاوية الحرجة (θ_c)' : 'Critical Angle (θ_c)'}
                </span>
                <span className="text-2xl font-black font-mono" style={{ color: '#fbbf24' }}>{criticalAngleDeg.toFixed(2)}°</span>
                <span className="text-[10px] text-slate-500 block mt-1">Total Internal Reflection</span>
              </div>
            </div>
          </div>

          <div className="sci-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {language === 'ar' ? 'مبادئ البصريات الهندسية وانكسار الضوء' : 'Geometric Optics Principles'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'ar'
                  ? 'عندما ينتقل شعاع الضوء بين وسطين شفافين مختلفين في الكثافة الضوئية، تتغير سرعة انتشار الطور، فينحرف مسار الشعاع مقترباً من العمود المقام في الوسط الأكثر كثافة ضوئية. وعند تجاوز الزاوية الحرجة في الاتجاه العكسي، يحدث الانعكاس الكلي الداخلي.'
                  : 'When light passes between transparent media of different optical densities, its phase velocity changes according to v = c / n, bending the ray toward the surface normal in higher refractive index media.'}
              </p>
              <div className="p-4 rounded-xl text-xs font-mono text-slate-200 space-y-1" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>• n₁ &middot; sin(θ₁) = n₂ &middot; sin(θ₂) (قانون سنيل)</div>
                <div>• θ_c = arcsin(1 / n₂) (الانعكاس الكلي الداخلي)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: PHET-STYLE WAVE ON A STRING SIMULATOR */}
      {activeModule === 'waves' && (
        <WaveSimulator language={language} />
      )}

    </div>
  );
};
