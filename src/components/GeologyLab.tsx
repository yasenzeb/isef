import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe2, Layers, AlertTriangle, Flame, ShieldAlert, Info } from 'lucide-react';

interface EarthLayer {
  id: string;
  nameEn: string;
  nameAr: string;
  depthKm: string;
  tempC: string;
  compositionEn: string;
  compositionAr: string;
  stateEn: string;
  stateAr: string;
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
    stateEn: 'Solid, brittle rigid lithosphere',
    stateAr: 'صلبة، صخور قاسية في الغلاف الصخري',
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
    stateEn: 'Solid rock behaving plastically over geological epochs',
    stateAr: 'صلب يتدفق ببطء شديد عبر التيارات الحرارية',
    color: 'bg-orange-600',
  },
  {
    id: 'outer_core',
    nameEn: 'Outer Core',
    nameAr: 'اللب الخارجي',
    depthKm: '2,890 - 5,150 km',
    tempC: '4,000 - 5,000 °C',
    compositionEn: 'Molten iron (80%) and nickel with sulfur/oxygen traces.',
    compositionAr: 'حديد مصهور (80%) ونيكل مع آثار كبريت وأكسجين.',
    stateEn: 'Liquid fluid driving Earth’s geodynamo magnetic field',
    stateAr: 'سائل يولد المجال المغناطيسي للأرض (الدينامو الأرضي)',
    color: 'bg-rose-600',
  },
  {
    id: 'inner_core',
    nameEn: 'Inner Core',
    nameAr: 'اللب الداخلي',
    depthKm: '5,150 - 6,371 km',
    tempC: '5,200 - 6,000 °C',
    compositionEn: 'Crystalline solid iron-nickel alloy.',
    compositionAr: 'سبيكة بلورية صلبة من الحديد والنيكل تحت ضغط هائل.',
    stateEn: 'Solid due to immense pressure (>330 GPa)',
    stateAr: 'صلب نتيجة الضغط الهائل الذي يتجاوز 330 جيجاباسكال',
    color: 'bg-yellow-500',
  },
];

export const GeologyLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [selectedLayer, setSelectedLayer] = useState<EarthLayer>(EARTH_LAYERS[0]);
  const [seismicEventActive, setSeismicEventActive] = useState(false);

  const triggerSeismicPulse = () => {
    setSeismicEventActive(true);
    setTimeout(() => setSeismicEventActive(false), 2000);
  };

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

        <button
          onClick={triggerSeismicPulse}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>{t.geology.simulateEvent}</span>
        </button>
      </div>

      {/* Earth Layers Visual Cross Section & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Cross Section (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Earth Cross-Section Stratification</h3>
              <span className="text-xs text-slate-400">Select any layer to inspect geophysical metrics</span>
            </div>
            {seismicEventActive && (
              <span className="text-xs font-mono font-bold text-rose-400 animate-pulse">
                P-Wave Propagation Active (8 km/s)
              </span>
            )}
          </div>

          {/* Interactive Concentric Layer Blocks */}
          <div className="space-y-3 my-4">
            {EARTH_LAYERS.map((layer) => {
              const isSelected = selectedLayer.id === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-slate-800 border-cyan-400 shadow-xl' 
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${layer.color}`} />
                    <span className="text-sm font-bold text-white">
                      {language === 'ar' ? layer.nameAr : layer.nameEn}
                    </span>
                  </div>

                  <div className="text-right text-xs font-mono text-slate-400">
                    <span>{layer.depthKm}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>Mean Earth Radius: 6,371 km</span>
            <span className="text-cyan-400 font-mono">Geothermal Core Temp: ~6,000 °C</span>
          </div>
        </div>

        {/* Layer Inspector (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">{t.geology.earthLayers}</span>
              <h3 className="text-xl font-black text-white mt-1">
                {language === 'ar' ? selectedLayer.nameAr : selectedLayer.nameEn}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{t.geology.depth}</span>
                <span className="font-mono text-white">{selectedLayer.depthKm}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">{t.geology.temperature}</span>
                <span className="font-mono text-cyan-400">{selectedLayer.tempC}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">{t.geology.composition}</span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {language === 'ar' ? selectedLayer.compositionAr : selectedLayer.compositionEn}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Physical Phase & Dynamics</span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {language === 'ar' ? selectedLayer.stateAr : selectedLayer.stateEn}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
