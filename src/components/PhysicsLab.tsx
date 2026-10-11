import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Zap, 
  Sliders, 
  Compass, 
  Info, 
  Waves 
} from 'lucide-react';

export const PhysicsLab: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [activeModule, setActiveModule] = useState<'mechanics' | 'circuits' | 'optics' | 'waves'>('mechanics');

  // Mechanics state (Projectile motion)
  const [velocity, setVelocity] = useState(25); // m/s
  const [angle, setAngle] = useState(45); // degrees
  const [gravity, setGravity] = useState(9.81); // m/s^2
  const [mass, setMass] = useState(2); // kg
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTime, setSimTime] = useState(0);

  // Circuits state (Ohm's Law)
  const [voltage, setVoltage] = useState(12); // V
  const [resistance, setResistance] = useState(4); // Ohms

  // Optics state (Snell's Law: n1 * sin(theta1) = n2 * sin(theta2))
  const [incidentAngle, setIncidentAngle] = useState(30); // deg
  const [n1] = useState(1.0); // air
  const [n2, setN2] = useState(1.5); // glass/acrylic

  // Canvas ref for 2D physical trajectory
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mechanics calculations
  const angleRad = (angle * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(angleRad)) / gravity;
  const maxRange = (Math.pow(velocity, 2) * Math.sin(2 * angleRad)) / gravity;
  const maxHeight = (Math.pow(velocity * Math.sin(angleRad), 2)) / (2 * gravity);

  // Current position at simTime
  const currentX = velocity * Math.cos(angleRad) * simTime;
  const currentY = Math.max(0, velocity * Math.sin(angleRad) * simTime - 0.5 * gravity * Math.pow(simTime, 2));

  // Simulation timer
  useEffect(() => {
    let anim: number;
    if (isSimulating) {
      const interval = setInterval(() => {
        setSimTime((prev) => {
          if (prev >= timeOfFlight) {
            setIsSimulating(false);
            return timeOfFlight;
          }
          return prev + 0.05;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isSimulating, timeOfFlight]);

  // Draw projectile trajectory canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Coordinate scaling
    const scaleX = (width - 60) / Math.max(10, maxRange * 1.1);
    const scaleY = (height - 60) / Math.max(5, maxHeight * 1.3);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
    }
    for (let y = height - 30; y > 0; y -= 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();

    // Theoretical curve
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (timeOfFlight * i) / steps;
      const x = velocity * Math.cos(angleRad) * t;
      const y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * Math.pow(t, 2);
      const px = 40 + x * scaleX;
      const py = height - 30 - y * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Path traversed so far
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const currentSteps = Math.floor((simTime / timeOfFlight) * steps);
    for (let i = 0; i <= currentSteps; i++) {
      const t = (timeOfFlight * i) / steps;
      const x = velocity * Math.cos(angleRad) * t;
      const y = velocity * Math.sin(angleRad) * t - 0.5 * gravity * Math.pow(t, 2);
      const px = 40 + x * scaleX;
      const py = height - 30 - y * scaleY;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current projectile head
    const projX = 40 + currentX * scaleX;
    const projY = height - 30 - currentY * scaleY;

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(projX, projY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Pulse ring around projectile
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(projX, projY, 12, 0, Math.PI * 2);
    ctx.stroke();
  }, [velocity, angle, gravity, maxRange, maxHeight, timeOfFlight, simTime, currentX, currentY, angleRad]);

  // Circuit calculations
  const circuitCurrent = resistance > 0 ? voltage / resistance : 0;
  const circuitPower = voltage * circuitCurrent;

  // Optics calculations
  const incRad = (incidentAngle * Math.PI) / 180;
  const sinRefract = (n1 * Math.sin(incRad)) / n2;
  const refractAngleDeg = Math.asin(Math.min(1, sinRefract)) * (180 / Math.PI);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Real Equation Solvers
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.physics.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.physics.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveModule('mechanics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'mechanics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.mechanics}
          </button>
          <button
            onClick={() => setActiveModule('circuits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'circuits' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.physics.circuits}
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

      {/* MODULE 1: MECHANICS / PROJECTILE */}
      {activeModule === 'mechanics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Canvas Viewport (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Projectile Trajectory Simulation</h3>
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
                  onClick={() => {
                    setIsSimulating(false);
                    setSimTime(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={t.physics.reset}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={700}
              height={380}
              className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800"
            />

            {/* Live Telemetry Bar */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Flight Time (t)</span>
                <span className="text-sm font-bold text-sky-400 font-mono">{simTime.toFixed(2)} s</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Horizontal Dist (x)</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{currentX.toFixed(2)} m</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Altitude (y)</span>
                <span className="text-sm font-bold text-purple-400 font-mono">{currentY.toFixed(2)} m</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Max Range (R)</span>
                <span className="text-sm font-bold text-white font-mono">{maxRange.toFixed(2)} m</span>
              </div>
            </div>
          </div>

          {/* Controls & Physical Formulas (1 col) */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-2">
                <Sliders className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Physical Parameters</h3>
              </div>

              {/* Velocity */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{t.physics.velocity}</span>
                  <span className="text-indigo-400 font-mono">{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={velocity}
                  onChange={(e) => {
                    setVelocity(Number(e.target.value));
                    setSimTime(0);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Angle */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{t.physics.angle}</span>
                  <span className="text-indigo-400 font-mono">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={angle}
                  onChange={(e) => {
                    setAngle(Number(e.target.value));
                    setSimTime(0);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Gravity */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{t.physics.gravity}</span>
                  <span className="text-indigo-400 font-mono">{gravity} m/s²</span>
                </div>
                <select
                  value={gravity}
                  onChange={(e) => {
                    setGravity(Number(e.target.value));
                    setSimTime(0);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value={9.81}>Earth (g = 9.81 m/s²)</option>
                  <option value={1.62}>Moon (g = 1.62 m/s²)</option>
                  <option value={3.72}>Mars (g = 3.72 m/s²)</option>
                  <option value={24.79}>Jupiter (g = 24.79 m/s²)</option>
                </select>
              </div>
            </div>

            {/* Scientific Formulation */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-sky-400">
                <Info className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.physics.lawExplanation}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Newton's 2nd law dictates that in the absence of air resistance, the horizontal velocity component remains constant (vₓ = v₀·cos θ), while the vertical component experiences constant gravitational acceleration (aᵧ = -g).
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-slate-200">
                <div>R = (v₀² · sin(2θ)) / g</div>
                <div>H_max = (v₀ · sin θ)² / (2g)</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODULE 2: CIRCUITS (OHM'S LAW) */}
      {activeModule === 'circuits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-3">
              <Zap className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">DC Circuit Parameter Simulator</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{t.physics.voltage}</span>
                  <span className="text-amber-400 font-mono">{voltage} V</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">{t.physics.resistance}</span>
                  <span className="text-amber-400 font-mono">{resistance} Ω</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Circuit Live Gauges */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">{t.physics.current}</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{circuitCurrent.toFixed(2)} A</span>
                <span className="text-[10px] text-slate-500 block mt-1">I = V / R</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">{t.physics.power}</span>
                <span className="text-2xl font-black text-rose-400 font-mono">{circuitPower.toFixed(2)} W</span>
                <span className="text-[10px] text-slate-500 block mt-1">P = V · I</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Governing Principles: Ohm's & Joule's Laws</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Ohm's Law states that the current flowing through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to the electrical resistance.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
                <div>• V = I · R (Voltage = Current × Resistance)</div>
                <div>• P = V · I = I² · R = V² / R (Joule Heating)</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              Note: Resistance is assumed constant (ohmic resistor) at uniform temperature.
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: OPTICS (SNELL'S LAW) */}
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
                <span className="text-slate-300">{t.physics.refractiveIndex}</span>
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
              <span className="text-xs text-slate-400 block mb-1">Refracted Angle (θ₂)</span>
              <span className="text-3xl font-black text-sky-400 font-mono">{refractAngleDeg.toFixed(2)}°</span>
              <span className="text-[10px] text-slate-500 block mt-1">sin(θ₂) = (n₁ / n₂) · sin(θ₁)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Optical Ray Dynamics</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                When light traverses a boundary between two isotropic media with different refractive indices, wave speed changes, causing the ray path to bend towards the normal in denser media.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>n₁ · sin(θ₁) = n₂ · sin(θ₂)</div>
                <div>Critical Angle θ_c = arcsin(n₂ / n₁) (when n₁ &gt; n₂)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
              Verified for visible spectrum monochromatic light (approx. 589 nm sodium D line).
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
