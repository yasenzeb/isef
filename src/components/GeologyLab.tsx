import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { calculateTsunamiSpeed, calculateSeismicTravelTimes, calculateEarthquakeEnergyJoules } from '../simulators/geophysicsSolver';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Globe2, AlertTriangle, Waves, Flame, Award, Info, Sliders } from 'lucide-react';

interface EarthLayer {
  id: string;
  nameEn: string;
  nameAr: string;
  depthKm: string;
  tempC: string;
  compositionEn: string;
  compositionAr: string;
  stateEn: string;
  color: string;
}

const EARTH_LAYERS: EarthLayer[] = [
  {
    id: 'crust',
    nameEn: 'Crust (Continental & Oceanic)',
    nameAr: 'القشرة الأرضية (القارية والمحيطية)',
    depthKm: '0 - 70 km',
    tempC: '0 - 400 °C',
    compositionEn: 'Silicates, granite, basalt, aluminium minerals.',
    compositionAr: 'سيليكات، جرانيت، بازلت، ومعادن الألومنيوم.',
    stateEn: 'Solid brittle lithosphere',
    color: 'bg-amber-600',
  },
  {
    id: 'mantle',
    nameEn: 'Mantle (Upper & Lower)',
    nameAr: 'الوشاح (العلوي والسفلي)',
    depthKm: '70 - 2,890 km',
    tempC: '1,000 - 3,700 °C',
    compositionEn: 'Peridotite, magnesium-iron silicates, bridgmanite.',
    compositionAr: 'بيريدوتيت، سيليكات الحديد والماغنسيوم، وبريدجمانيت.',
    stateEn: 'Viscous solid undergoing mantle convection',
    color: 'bg-orange-600',
  },
  {
    id: 'outer_core',
    nameEn: 'Outer Core',
    nameAr: 'اللب الخارجي',
    depthKm: '2,890 - 5,150 km',
    tempC: '4,000 - 5,000 °C',
    compositionEn: 'Molten iron (80%) and nickel.',
    compositionAr: 'حديد مصهور (80%) ونيكل.',
    stateEn: 'Liquid fluid generating Earth’s magnetic field',
    color: 'bg-rose-600',
  },
  {
    id: 'inner_core',
    nameEn: 'Inner Core',
    nameAr: 'اللب الداخلي',
    depthKm: '5,150 - 6,371 km',
    tempC: '5,200 - 6,000 °C',
    compositionEn: 'Solid crystalline nickel-iron alloy.',
    compositionAr: 'سبيكة صلبة متبلورة من الحديد والنيكل.',
    stateEn: 'Solid due to 330+ GPa pressure (Lehmann 1936)',
    color: 'bg-yellow-500',
  },
];

export const GeologyLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [activeModule, setActiveModule] = useState<'layers' | 'tsunami' | 'earthquake'>('layers');
  const [selectedLayer, setSelectedLayer] = useState<EarthLayer>(EARTH_LAYERS[0]);

  // Tsunami simulator parameters
  const [oceanDepth, setOceanDepth] = useState(4000); // meters
  const tsunamiSpeed = calculateTsunamiSpeed(oceanDepth);

  // Earthquake simulator parameters
  const [quakeMagnitude, setQuakeMagnitude] = useState(7.0);
  const [epicenterDistKm, setEpicenterDistKm] = useState(150);
  const seismicTimes = calculateSeismicTravelTimes(epicenterDistKm, 15);
  const quakeEnergyJoules = calculateEarthquakeEnergyJoules(quakeMagnitude);

  // Inge Lehmann scientist
  const lehmann = REAL_SCIENTISTS.find(s => s.id === 'lehmann');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Geodynamics & Seismology
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.geology.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.geology.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveModule('layers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'layers' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.geology.earthLayers}
          </button>
          <button
            onClick={() => setActiveModule('tsunami')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeModule === 'tsunami' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Tsunami Long-Wave Simulator</span>
          </button>
          <button
            onClick={() => setActiveModule('earthquake')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeModule === 'earthquake' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Seismic Waves Simulator</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: EARTH STRATA */}
      {activeModule === 'layers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Planetary Earth Interior Layers</h3>
              <span className="text-xs text-slate-400">Select any layer to inspect geophysics metrics</span>
            </div>

            <div className="space-y-3">
              {EARTH_LAYERS.map((layer) => {
                const isSelected = selectedLayer.id === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'bg-slate-800 border-cyan-400 shadow-xl' : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${layer.color}`} />
                      <span className="text-sm font-bold text-white">
                        {language === 'ar' ? layer.nameAr : layer.nameEn}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{layer.depthKm}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Mean Earth Radius: 6,371 km</span>
              <span className="text-cyan-400 font-mono">Geothermal Core Temp: ~6,000 °C</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">Layer Telemetry</span>
                <h3 className="text-xl font-black text-white mt-1">
                  {language === 'ar' ? selectedLayer.nameAr : selectedLayer.nameEn}
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Depth Boundary</span>
                  <span className="font-mono text-white">{selectedLayer.depthKm}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Temperature</span>
                  <span className="font-mono text-cyan-400">{selectedLayer.tempC}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Composition</span>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {language === 'ar' ? selectedLayer.compositionAr : selectedLayer.compositionEn}
                </p>
              </div>
            </div>

            {/* Inge Lehmann Card */}
            {lehmann && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-cyan-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Scientific Pioneer</h4>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{lehmann.name}</span>
                  <span className="text-[11px] text-slate-400">{lehmann.dates} • {lehmann.field}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' ? lehmann.contributionsAr : lehmann.contributionsEn}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {lehmann.citation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: TSUNAMI SHALLOW-WATER SPEED SIMULATOR */}
      {activeModule === 'tsunami' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Shallow-Water Tsunami Propagation Engine
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Ocean Column Bathymetric Depth (h)</span>
                <span className="text-cyan-400 font-mono">{oceanDepth} m</span>
              </div>
              <input
                type="range"
                min="50"
                max="8000"
                step="50"
                value={oceanDepth}
                onChange={(e) => setOceanDepth(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Calculated Phase Speed (c)</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">{tsunamiSpeed.speedMs.toFixed(1)} m/s</span>
                <span className="text-[10px] text-slate-500 block mt-1">c = √(g · h)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Speed (km/h)</span>
                <span className="text-2xl font-black text-sky-400 font-mono">{tsunamiSpeed.speedKmh.toFixed(0)} km/h</span>
                <span className="text-[10px] text-slate-500 block mt-1">Jet Airliner Velocity</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Hydrodynamic Model & Green's Law</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Because tsunami wavelengths exceed hundreds of kilometers (&lambda; &gt; 100 km), they behave as shallow-water waves throughout deep oceanic basins (h/&lambda; &lt;&lt; 0.05). As waves approach the coastline, depth decreases, wave speed slows, and conservation of energy flux dramatically increases wave height (shoaling).
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>• c = &radic;(g &times; h) (Phase velocity)</div>
                <div>• H&#8322; / H&#8321; = (h&#8321; / h&#8322;)&#188; (Green's Law of Shoaling)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
              Valid for linear non-dispersive shallow-water gravity waves.
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: SEISMIC TRAVEL TIMES */}
      {activeModule === 'earthquake' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Seismic P-Wave & S-Wave Arrival Times
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Epicentral Distance (Δ)</span>
                <span className="text-cyan-400 font-mono">{epicenterDistKm} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="800"
                value={epicenterDistKm}
                onChange={(e) => setEpicenterDistKm(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Moment Magnitude (M_w)</span>
                <span className="text-rose-400 font-mono">{quakeMagnitude} M_w</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="9.0"
                step="0.1"
                value={quakeMagnitude}
                onChange={(e) => setQuakeMagnitude(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">P-Wave Arrival</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{seismicTimes.pArrivalTimeSec} s</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">S-Wave Arrival</span>
                <span className="text-base font-bold text-amber-400 font-mono">{seismicTimes.sArrivalTimeSec} s</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">S - P Interval</span>
                <span className="text-base font-bold text-rose-400 font-mono">{seismicTimes.sMinusPDurationSec} s</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Earthquake Energy & Wave Triangulation</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                P-waves (compressional) travel fastest through rock (~6.5 km/s). S-waves (shear) travel slower (~3.75 km/s) and cannot pass through liquids. The S-P time interval allows seismologists to calculate the distance to the hypocenter using Wadati diagrams.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>• Energy Released: {quakeEnergyJoules.toExponential(2)} Joules</div>
                <div>• log₁₀(E) = 4.8 + 1.5 · M (Gutenberg-Richter)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              Each 1.0 unit increase in magnitude releases ~31.6 times more seismic energy.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
