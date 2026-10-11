import React, { useState } from 'react';
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

export const PhysicsLab: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'circuits' | 'mechanics' | 'optics'>('circuits');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sky-500/15 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="sci-badge">
              {language === 'ar' ? 'محاكيات الفيزياء الحسابية والديناميكية' : 'Dynamic Computational Physics Lab'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.physics.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.physics.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex items-center space-x-1.5 sci-surface p-1.5">
          <button
            onClick={() => setActiveModule('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'circuits' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.circuits} (MNA Engine)
          </button>
          <button
            onClick={() => setActiveModule('mechanics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'mechanics' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.mechanics}
          </button>
          <button
            onClick={() => setActiveModule('optics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'optics' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.optics}
          </button>
        </div>
      </div>

      {/* MODULE 1: REAL CIRCUIT LAB WITH MODIFIED NODAL ANALYSIS */}
      {activeModule === 'circuits' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sky-500/15 pb-4 mb-5 gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-amber-400" />
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
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? '+ مقاومة' : '+ Resistor'}</span>
                  </button>
                  <button
                    onClick={() => addComponent('switch')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <ToggleRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? '+ مفتاح' : '+ Switch'}</span>
                  </button>
                  <button
                    onClick={() => addComponent('meter')}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
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
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {comp.type === 'dc_source' && <Battery className="w-4 h-4 text-sky-400" />}
                          {comp.type === 'switch' && <ToggleRight className="w-4 h-4 text-amber-400" />}
                          {comp.type === 'meter' && <Gauge className="w-4 h-4 text-emerald-400" />}
                          {comp.type === 'resistor' && <Activity className="w-4 h-4 text-indigo-400" />}

                          <span className="text-sm font-bold text-white">{comp.label || comp.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            Node {comp.node1} &rarr; Node {comp.node2}
                          </span>
                        </div>

                        {comp.type !== 'switch' && (
                          <div className="flex items-center space-x-4 text-xs font-mono">
                            <span className="text-amber-400">
                              {language === 'ar' ? 'التيار I:' : 'Current I:'} {(current * 1000).toFixed(2)} mA
                            </span>
                            <span className="text-rose-400">
                              {language === 'ar' ? 'القدرة P:' : 'Power P:'} {(power * 1000).toFixed(2)} mW
                            </span>
                          </div>
                        )}
                        {comp.type === 'switch' && (
                          <div className="text-xs font-mono text-slate-400">
                            {language === 'ar' ? 'حالة المفتاح:' : 'Switch State:'}{' '}
                            <span className={comp.state ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
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
                              className="w-full accent-sky-500"
                            />
                            <span className="text-xs font-mono font-bold text-white w-16 text-right">
                              {comp.value} {comp.type === 'dc_source' ? 'V' : 'Ω'}
                            </span>
                          </>
                        ) : (
                          <div className="text-xs font-mono text-emerald-400 font-bold">
                            {(Math.abs((circuitSolution.nodeVoltages[comp.node1] || 0) - (circuitSolution.nodeVoltages[comp.node2] || 0))).toFixed(2)} V
                          </div>
                        )}

                        {circuitComponents.length > 2 && (
                          <button
                            onClick={() => deleteComponent(comp.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
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
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {language === 'ar' ? 'جهود العقد الكهربائية (مقارنة بالعقدة المرجعية 0V):' : 'Junction Node Voltages (Relative to Ground 0V):'}
              </span>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                {Object.entries(circuitSolution.nodeVoltages).map(([node, v]) => (
                  <div key={node} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Node {node}: </span>
                    <span className="text-sky-400 font-bold">{v.toFixed(3)} V</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Interactive Voltage Divider Challenge */}
            <div className="sci-card p-5 space-y-4">
              <div className="flex items-center space-x-2 text-sky-400 border-b border-sky-500/15 pb-2">
                <HelpCircle className="w-4 h-4" />
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
                    className="p-2 rounded-xl bg-slate-950 border border-slate-700 hover:bg-sky-600 text-white font-mono font-bold text-xs transition-all"
                  >
                    {val}.0 V
                  </button>
                ))}
              </div>

              {circuitQuizFeedback && (
                <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30 text-xs font-medium text-sky-300">
                  {circuitQuizFeedback}
                </div>
              )}
            </div>

            {/* Georg Simon Ohm Card */}
            {ohm && (
              <div className="sci-card p-5 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
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
            <div className="flex items-center justify-between border-b border-sky-500/15 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'ar' ? 'محاكاة حركة المقذوفات والقوى في بعدين' : '2D Ballistic Kinematics & Force Dynamics'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">y(t) = v₀·sin(θ)·t - ½·g·t² | E_k = ½·m·v²</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg transition-colors"
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? t.physics.pause : t.physics.play}</span>
                </button>
                <button
                  onClick={() => setIsSimulating(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'زمن التحليق الكلي' : 'Time of Flight'}
                </span>
                <span className="text-sm font-bold text-sky-400 font-mono">{timeOfFlight.toFixed(2)} s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'أقصى مدى أفقي (R)' : 'Total Range (R)'}
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{maxRange.toFixed(2)} m</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'أقصى ارتفاع (H)' : 'Max Height (H)'}
                </span>
                <span className="text-sm font-bold text-purple-400 font-mono">{maxHeight.toFixed(2)} m</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'طاقة الحركة (E_k)' : 'Kinetic Energy'}
                </span>
                <span className="text-sm font-bold text-amber-400 font-mono">{kineticEnergy.toFixed(1)} J</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{language === 'ar' ? 'السرعة الابتدائية المتجهة (v₀):' : 'Initial Velocity (v₀):'}</span>
                  <span className="text-sky-400 font-mono">{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{language === 'ar' ? 'زاوية الإطلاق (θ):' : 'Launch Angle (θ):'}</span>
                  <span className="text-sky-400 font-mono">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">{language === 'ar' ? 'الكتلة (m):' : 'Mass (m):'}</span>
                    <span className="text-sky-400 font-mono">{mass} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={mass}
                    onChange={(e) => setMass(Number(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">{language === 'ar' ? 'تسارع الجاذبية (g):' : 'Gravity (g):'}</span>
                    <span className="text-sky-400 font-mono">{gravity} m/s²</span>
                  </div>
                  <select
                    value={gravity}
                    onChange={(e) => setGravity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
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
                <div className="flex items-center space-x-2 text-sky-400">
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
            <h3 className="text-base font-bold text-white border-b border-sky-500/15 pb-2">
              {language === 'ar' ? 'قانون سنيل للانكسار والزاوية الحرجة' : 'Snell-Descartes Law of Refraction & Critical Angle'}
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'زاوية السقوط (θ₁):' : 'Angle of Incidence (θ₁):'}
                </span>
                <span className="text-sky-400 font-mono">{incidentAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">{language === 'ar' ? 'معامل الانكسار للوسط الثاني (n₂):' : 'Refractive Index (n₂):'}</span>
                <span className="text-sky-400 font-mono">{n2}</span>
              </div>
              <select
                value={n2}
                onChange={(e) => setN2(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={1.33}>Water (الماء - n = 1.33)</option>
                <option value={1.52}>Crown Glass (زجاج كراون - n = 1.52)</option>
                <option value={2.42}>Diamond (الماس - n = 2.42)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'زاوية الانكسار (θ₂)' : 'Refracted Angle (θ₂)'}
                </span>
                <span className="text-2xl font-black text-sky-400 font-mono">{refractAngleDeg.toFixed(2)}°</span>
                <span className="text-[10px] text-slate-500 block mt-1">sin(θ₂) = (n₁ / n₂) · sin(θ₁)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'الزاوية الحرجة (θ_c)' : 'Critical Angle (θ_c)'}
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">{criticalAngleDeg.toFixed(2)}°</span>
                <span className="text-[10px] text-slate-500 block mt-1">Total Internal Reflection</span>
              </div>
            </div>
          </div>

          <div className="sci-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                {language === 'ar' ? 'مبادئ البصريات الهندسية وانكسار الضوء' : 'Geometric Optics Principles'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'ar'
                  ? 'عندما ينتقل شعاع الضوء بين وسطين شفافين مختلفين في الكثافة الضوئية، تتغير سرعة انتشار الطور، فينحرف مسار الشعاع مقترباً من العمود المقام في الوسط الأكثر كثافة ضوئية. وعند تجاوز الزاوية الحرجة في الاتجاه العكسي، يحدث الانعكاس الكلي الداخلي.'
                  : 'When light passes between transparent media of different optical densities, its phase velocity changes according to v = c / n, bending the ray toward the surface normal in higher refractive index media.'}
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>• n₁ &middot; sin(θ₁) = n₂ &middot; sin(θ₂) (قانون سنيل)</div>
                <div>• θ_c = arcsin(1 / n₂) (الانعكاس الكلي الداخلي)</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
