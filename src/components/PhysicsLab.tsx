import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { solveCircuit, CircuitComponent } from '../simulators/circuitSolver';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Sliders, 
  Info, 
  Waves,
  Plus,
  Trash2,
  Award,
  CheckCircle2
} from 'lucide-react';

export const PhysicsLab: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'circuits' | 'mechanics' | 'optics'>('circuits');

  // CIRCUIT LAB STATE (MNA Solver)
  const [circuitComponents, setCircuitComponents] = useState<CircuitComponent[]>([
    { id: 'v1', type: 'dc_source', node1: 1, node2: 0, value: 12, label: 'DC Supply (12V)' },
    { id: 'r1', type: 'resistor', node1: 1, node2: 2, value: 100, label: 'Resistor R1 (100Ω)' },
    { id: 'r2', type: 'resistor', node1: 2, node2: 0, value: 200, label: 'Resistor R2 (200Ω)' },
  ]);

  // Mechanics state (Projectile motion)
  const [velocity, setVelocity] = useState(25); // m/s
  const [angle, setAngle] = useState(45); // deg
  const [gravity, setGravity] = useState(9.81); // m/s^2
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTime, setSimTime] = useState(0);

  // Optics state (Snell's Law)
  const [incidentAngle, setIncidentAngle] = useState(30); // deg
  const [n1] = useState(1.0); // air
  const [n2, setN2] = useState(1.52); // crown glass

  // Solve the circuit using MNA
  const circuitSolution = solveCircuit(circuitComponents, 0);

  // Associated Scientists
  const ohm = REAL_SCIENTISTS.find(s => s.id === 'ohm');
  const newton = REAL_SCIENTISTS.find(s => s.id === 'newton');

  // Mechanics metrics
  const angleRad = (angle * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(angleRad)) / gravity;
  const maxRange = (Math.pow(velocity, 2) * Math.sin(2 * angleRad)) / gravity;
  const maxHeight = (Math.pow(velocity * Math.sin(angleRad), 2)) / (2 * gravity);
  const currentX = velocity * Math.cos(angleRad) * simTime;
  const currentY = Math.max(0, velocity * Math.sin(angleRad) * simTime - 0.5 * gravity * Math.pow(simTime, 2));

  // Optics metrics
  const incRad = (incidentAngle * Math.PI) / 180;
  const sinRefract = (n1 * Math.sin(incRad)) / n2;
  const refractAngleDeg = Math.asin(Math.min(1, sinRefract)) * (180 / Math.PI);

  const updateComponentValue = (id: string, newVal: number) => {
    setCircuitComponents(prev => prev.map(c => c.id === id ? { ...c, value: Math.max(0.1, newVal) } : c));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Nodal Analysis & Physical Solvers
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.physics.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.physics.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveModule('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'circuits' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.circuits} (MNA Engine)
          </button>
          <button
            onClick={() => setActiveModule('mechanics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'mechanics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.mechanics}
          </button>
          <button
            onClick={() => setActiveModule('optics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'optics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.optics}
          </button>
        </div>
      </div>

      {/* MODULE 1: REAL CIRCUIT LAB WITH MODIFIED NODAL ANALYSIS */}
      {activeModule === 'circuits' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Schematic & Component Workspace (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Nodal Circuit Canvas & Multi-Branch Solver</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Solves Kirchhoff's Current Law (KCL) & Ohm's matrix at every electrical junction
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                    circuitSolution.converged ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {circuitSolution.converged ? 'KCL Matrix Converged' : 'Circuit Open'}
                  </span>
                </div>
              </div>

              {/* Interactive Component Nodes Table */}
              <div className="space-y-3">
                {circuitComponents.map((comp) => {
                  const current = circuitSolution.branchCurrents[comp.id] ?? 0;
                  const power = circuitSolution.componentPowers[comp.id] ?? 0;
                  return (
                    <div
                      key={comp.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{comp.label || comp.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            Node {comp.node1} → Node {comp.node2}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs font-mono">
                          <span className="text-amber-400">I: {(current * 1000).toFixed(2)} mA</span>
                          <span className="text-rose-400">P: {(power * 1000).toFixed(2)} mW</span>
                        </div>
                      </div>

                      {/* Parameter Slider */}
                      <div className="flex items-center space-x-3 w-full sm:w-64">
                        <input
                          type="range"
                          min="1"
                          max={comp.type === 'dc_source' ? 48 : 500}
                          value={comp.value}
                          onChange={(e) => updateComponentValue(comp.id, Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                        <span className="text-xs font-mono font-bold text-white w-16 text-right">
                          {comp.value} {comp.type === 'dc_source' ? 'V' : 'Ω'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Junction Voltages Readout */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Calculated Junction Potentials (Rel. to Ground Node 0):
              </span>
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                {Object.entries(circuitSolution.nodeVoltages).map(([node, v]) => (
                  <div key={node} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Node {node}: </span>
                    <span className="text-emerald-400 font-bold">{v.toFixed(3)} V</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scientist & Formulation Info (1 col) */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-2">
                <Info className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Governing Circuit Formulation</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Modified Nodal Analysis (MNA) constructs a system of linear equations [A][x] = [z] from Kirchhoff's Current Law: the algebraic sum of currents entering each node must equal zero (\(\sum I = 0\)).
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                <div>• V = I &middot; R</div>
                <div>• P = V &middot; I = I&sup2; &middot; R</div>
                <div>• &Sigma; I = 0 (Kirchhoff Node Sum)</div>
              </div>
            </div>

            {/* Georg Simon Ohm Card */}
            {ohm && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Scientific Pioneer</h4>
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

      {/* MODULE 2: MECHANICS / PROJECTILE */}
      {activeModule === 'mechanics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">2D Ballistic Kinematics Simulation</h3>
                <span className="text-xs text-slate-400 font-mono">y(t) = v₀·sin(θ)·t - ½·g·t²</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors"
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? t.physics.pause : t.physics.play}</span>
                </button>
                <button
                  onClick={() => { setIsSimulating(false); setSimTime(0); }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Telemetry Display */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Time of Flight</span>
                <span className="text-sm font-bold text-sky-400 font-mono">{timeOfFlight.toFixed(2)} s</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Range (R)</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{maxRange.toFixed(2)} m</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Max Height (H)</span>
                <span className="text-sm font-bold text-purple-400 font-mono">{maxHeight.toFixed(2)} m</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gravity (g)</span>
                <span className="text-sm font-bold text-white font-mono">{gravity} m/s²</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Initial Velocity (v₀)</span>
                  <span className="text-indigo-400 font-mono">{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Launch Angle (θ)</span>
                  <span className="text-indigo-400 font-mono">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Isaac Newton Card */}
          <div className="space-y-6">
            {newton && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Scientific Pioneer</h4>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">Snell-Descartes Law of Refraction</h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Angle of Incidence (θ₁)</span>
                <span className="text-indigo-400 font-mono">{incidentAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Refractive Index (n₂)</span>
                <span className="text-indigo-400 font-mono">{n2}</span>
              </div>
              <select
                value={n2}
                onChange={(e) => setN2(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value={1.33}>Water (n = 1.33)</option>
                <option value={1.52}>Crown Glass (n = 1.52)</option>
                <option value={2.42}>Diamond (n = 2.42)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Calculated Refracted Angle (θ₂)</span>
              <span className="text-3xl font-black text-sky-400 font-mono">{refractAngleDeg.toFixed(2)}°</span>
              <span className="text-[10px] text-slate-500 block mt-1">sin(θ₂) = (n₁ / n₂) · sin(θ₁)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Geometric Wavefront Principles</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                When light passes between transparent media of different optical densities, its phase velocity changes according to \(v = c / n\), bending the ray toward the surface normal in higher refractive index media.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>n₁ · sin(θ₁) = n₂ · sin(θ₂)</div>
                <div>Critical Angle θ_c = arcsin(n₂ / n₁) (when n₁ &gt; n₂)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
              Verified for visible monochromatic light (589 nm sodium line).
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
