import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { calculateTsunamiSpeed, calculateSeismicTravelTimes, calculateEarthquakeEnergyJoules } from '../simulators/geophysicsSolver';
import { calculateStructuralResponse } from '../simulators/structuralSolver';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Globe2, AlertTriangle, Waves, Award, Building2 } from 'lucide-react';

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
    nameAr: 'اللب الخارجي السائل',
    depthKm: '2,890 - 5,150 km',
    tempC: '4,000 - 5,000 °C',
    compositionEn: 'Molten iron (80%) and nickel.',
    compositionAr: 'حديد مصهور (80%) ونيكل يولد المجال المغناطيسي.',
    stateEn: 'Liquid fluid generating Earth’s magnetic field',
    color: 'bg-rose-600',
  },
  {
    id: 'inner_core',
    nameEn: 'Inner Core',
    nameAr: 'اللب الداخلي الصلب',
    depthKm: '5,150 - 6,371 km',
    tempC: '5,200 - 6,000 °C',
    compositionEn: 'Solid crystalline nickel-iron alloy.',
    compositionAr: 'سبيكة صلبة متبلورة من الحديد والنيكل تحت ضغط هائل.',
    stateEn: 'Solid due to 330+ GPa pressure (Lehmann 1936)',
    color: 'bg-yellow-500',
  },
];

export const GeologyLab: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'layers' | 'tsunami' | 'earthquake' | 'structural'>('layers');
  const [selectedLayer, setSelectedLayer] = useState<EarthLayer>(EARTH_LAYERS[0]);

  // Tsunami simulator parameters
  const [oceanDepth, setOceanDepth] = useState(4000);
  const tsunamiSpeed = calculateTsunamiSpeed(oceanDepth);

  // Earthquake simulator parameters
  const [quakeMagnitude, setQuakeMagnitude] = useState(7.2);
  const [epicenterDistKm, setEpicenterDistKm] = useState(150);
  const seismicTimes = calculateSeismicTravelTimes(epicenterDistKm, 15);
  const quakeEnergyJoules = calculateEarthquakeEnergyJoules(quakeMagnitude);

  // Structural base isolation parameters
  const [floors, setFloors] = useState(10);
  const [groundFrequency, setGroundFrequency] = useState(1.2); // Hz
  const [isIsolated, setIsIsolated] = useState(false);
  const structuralMetrics = calculateStructuralResponse(floors, groundFrequency, 0.35, isIsolated);

  const lehmann = REAL_SCIENTISTS.find(s => s.id === 'lehmann');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sky-500/15 pb-5">
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'الجيوديناميكا وعلم الزلازل وهندسة المنشآت' : 'Geodynamics, Seismology & Earthquake Engineering'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.geology.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.geology.subtitle}</p>
        </div>

        {/* Sub-module switcher */}
        <div className="flex flex-wrap items-center gap-1.5 sci-surface p-1.5">
          <button
            onClick={() => setActiveModule('layers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeModule === 'layers' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.geology.earthLayers}
          </button>
          <button
            onClick={() => setActiveModule('tsunami')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeModule === 'tsunami' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'موجات تسونامي' : 'Tsunami Simulator'}</span>
          </button>
          <button
            onClick={() => setActiveModule('earthquake')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeModule === 'earthquake' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الموجات الزلزالية' : 'Seismic Waves'}</span>
          </button>
          <button
            onClick={() => setActiveModule('structural')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeModule === 'structural' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مقاومة الزلازل للمنشآت' : 'Seismic Base Isolation'}</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: EARTH STRATA */}
      {activeModule === 'layers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card p-6 flex flex-col justify-between space-y-4">
            <div className="border-b border-sky-500/15 pb-3">
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'مقطع طبقات الأرض الداخلية الجيوفيزيائي' : 'Planetary Earth Interior Layers'}
              </h3>
              <span className="text-xs text-slate-400">
                {language === 'ar' ? 'اختر أي طبقة لفحص الأعماق والخواص الحرارية' : 'Select any layer to inspect geophysics metrics'}
              </span>
            </div>

            <div className="space-y-3">
              {EARTH_LAYERS.map((layer) => {
                const isSelected = selectedLayer.id === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'bg-slate-800 border-sky-400 shadow-xl' : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/40'
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

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>{language === 'ar' ? 'متوسط نصف قطر الأرض: 6,371 كم' : 'Mean Earth Radius: 6,371 km'}</span>
              <span className="text-sky-400 font-mono">{language === 'ar' ? 'حرارة اللب المركزي: ~6,000 °م' : 'Core Temp: ~6,000 °C'}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="sci-card p-6 space-y-4">
              <div className="border-b border-sky-500/15 pb-3">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">
                  {language === 'ar' ? 'بيانات الطبقة' : 'Layer Telemetry'}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {language === 'ar' ? selectedLayer.nameAr : selectedLayer.nameEn}
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'العمق' : 'Depth Boundary'}</span>
                  <span className="font-mono text-white">{selectedLayer.depthKm}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'درجة الحرارة' : 'Temperature'}</span>
                  <span className="font-mono text-sky-400">{selectedLayer.tempC}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {language === 'ar' ? 'التركيب الكيميائي' : 'Composition'}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-sky-500/15">
                  {language === 'ar' ? selectedLayer.compositionAr : selectedLayer.compositionEn}
                </p>
              </div>
            </div>

            {/* Inge Lehmann Card */}
            {lehmann && (
              <div className="sci-card p-5 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'رائدة علم الزلازل والجيوفيزياء' : 'Scientific Pioneer'}
                  </h4>
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

      {/* MODULE 2: TSUNAMI PROPAGATION */}
      {activeModule === 'tsunami' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="sci-card p-6 space-y-5">
            <h3 className="text-base font-bold text-white border-b border-sky-500/15 pb-2">
              {language === 'ar' ? 'محرك انتشار موجات تسونامي في المياه الضحلة' : 'Shallow-Water Tsunami Propagation Engine'}
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'عمق عمود الماء بالمحيط (h):' : 'Ocean Column Bathymetric Depth (h):'}
                </span>
                <span className="text-sky-400 font-mono">{oceanDepth} m</span>
              </div>
              <input
                type="range"
                min="50"
                max="8000"
                step="50"
                value={oceanDepth}
                onChange={(e) => setOceanDepth(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'سرعة الطور المحسوبة (c)' : 'Calculated Phase Speed (c)'}
                </span>
                <span className="text-2xl font-black text-sky-400 font-mono">{tsunamiSpeed.speedMs.toFixed(1)} m/s</span>
                <span className="text-[10px] text-slate-500 block mt-1">c = &radic;(g &times; h)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">
                  {language === 'ar' ? 'السرعة بالكم / ساعة' : 'Speed (km/h)'}
                </span>
                <span className="text-2xl font-black text-sky-300 font-mono">{tsunamiSpeed.speedKmh.toFixed(0)} km/h</span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {language === 'ar' ? 'سرعة طائرة ركاب نفاثة' : 'Jet Airliner Velocity'}
                </span>
              </div>
            </div>
          </div>

          <div className="sci-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                {language === 'ar' ? 'النموذج الهيدروديناميكي وقانون جرين للتضخم' : "Hydrodynamic Model & Green's Law"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'ar' 
                  ? 'نظراً لأن الطول الموجي لتسونامي يتجاوز مئات الكيلومترات، فإنه يسلك سلوك أمواج المياه الضحلة حتى في أعماق المحيط. وعند الاقتراب من السواحل، يؤدي انخفاض العمق لتباطؤ السرعة وتضخم ارتفاع الموجة عمودياً للحفاظ على تدفق الطاقة (Green\'s Law).'
                  : "Because tsunami wavelengths exceed hundreds of kilometers, they behave as shallow-water waves. As waves approach coastline shallows, depth decreases, wave speed slows, and conservation of energy flux dramatically increases wave height (shoaling)."}
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>• c = &radic;(g &times; h) (Phase velocity)</div>
                <div>• H&#8322; / H&#8321; = (h&#8321; / h&#8322;)&#188; (Green's Law of Shoaling)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: SEISMIC TRAVEL TIMES */}
      {activeModule === 'earthquake' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="sci-card p-6 space-y-5">
            <h3 className="text-base font-bold text-white border-b border-sky-500/15 pb-2">
              {language === 'ar' ? 'حساب أزمنة وصول الموجات الزلزالية P و S' : 'Seismic P-Wave & S-Wave Arrival Times'}
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'المسافة إلى المركز السطحي (Δ):' : 'Epicentral Distance (Δ):'}
                </span>
                <span className="text-sky-400 font-mono">{epicenterDistKm} km</span>
              </div>
              <input
                type="range"
                min="20"
                max="800"
                value={epicenterDistKm}
                onChange={(e) => setEpicenterDistKm(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'مقدار الزلزال (Moment Magnitude Mw):' : 'Moment Magnitude (M_w):'}
                </span>
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
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'وصول موجة P' : 'P-Wave Arrival'}
                </span>
                <span className="text-base font-bold text-emerald-400 font-mono">{seismicTimes.pArrivalTimeSec} s</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'وصول موجة S' : 'S-Wave Arrival'}
                </span>
                <span className="text-base font-bold text-amber-400 font-mono">{seismicTimes.sArrivalTimeSec} s</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'فارق S - P' : 'S - P Interval'}
                </span>
                <span className="text-base font-bold text-rose-400 font-mono">{seismicTimes.sMinusPDurationSec} s</span>
              </div>
            </div>
          </div>

          <div className="sci-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                {language === 'ar' ? 'طاقة الزلزال وتحديد البؤرة' : 'Earthquake Energy & Triangulation'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'ar'
                  ? 'الموجات الأولية P (تضاغطية طولية) تنتقل بسرعة أكبر (~6.5 كم/ث)، بينما الموجات الثانوية S (قصّية مستعرضة) أبطأ (~3.75 كم/ث) ولا تمر عبر السوائل. يتيح فارق توقيت وصول S-P تحديد المسافة الدقيقة إلى بؤرة الزلزال.'
                  : 'P-waves (compressional) travel fastest through crustal rock (~6.5 km/s). S-waves (shear) are slower (~3.75 km/s) and cannot traverse liquids. The S-P arrival time difference determines the precise hypocenter distance via Wadati diagrams.'}
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>• Energy Released: {quakeEnergyJoules.toExponential(2)} Joules</div>
                <div>• log₁₀(E) = 4.8 + 1.5 &middot; M (Gutenberg-Richter)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: EARTHQUAKE-RESISTANT STRUCTURES & BASE ISOLATION */}
      {activeModule === 'structural' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="sci-card p-6 space-y-5">
            <h3 className="text-base font-bold text-white border-b border-sky-500/15 pb-2">
              {language === 'ar' ? 'محاكي الاهتزاز وعزل القواعد الزلزالي للمباني' : 'Structural Vibration & Base Isolation Simulator'}
            </h3>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'عدد طوابق المبنى:' : 'Building Floor Count:'}
                </span>
                <span className="text-sky-400 font-mono">{floors} floors</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={floors}
                onChange={(e) => setFloors(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">
                  {language === 'ar' ? 'تردد الهزة الأرضية (Hz):' : 'Ground Motion Frequency (Hz):'}
                </span>
                <span className="text-sky-400 font-mono">{groundFrequency} Hz</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={groundFrequency}
                onChange={(e) => setGroundFrequency(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? 'تفعيل نظام عزل القواعد الزلزالي (Base Isolation):' : 'Activate Base Isolation Bearings:'}
              </span>
              <button
                onClick={() => setIsIsolated(!isIsolated)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isIsolated ? 'bg-sky-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isIsolated ? (language === 'ar' ? 'مفعل (محمي)' : 'Active (Protected)') : (language === 'ar' ? 'غير مفعل (قواعد ثابتة)' : 'Fixed Base')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'إزاحة القمة المتذبذبة' : 'Peak Relative Drift'}
                </span>
                <span className={`text-base font-bold font-mono ${isIsolated ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {structuralMetrics.peakRelativeDispMm} mm
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'قوة القص القاعدي' : 'Peak Base Shear'}
                </span>
                <span className={`text-base font-bold font-mono ${isIsolated ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {structuralMetrics.peakBaseShearKn} kN
                </span>
              </div>
            </div>
          </div>

          <div className="sci-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                {language === 'ar' ? 'المبادئ الهندسية لتخميد الزلازل' : 'Earthquake Engineering Principles'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {language === 'ar'
                  ? 'يعمل عزل القواعد على إطالة زمن الدورة الطبيعية للمبنى (T > 2.0s)، مما يزحزح استجابة المنشأ بعيداً عن حيز التردد الرنيني للهزة الأرضية العنيفة ويزيد التخميد اللزوجي (&zeta; &asymp; 18%)، مما يقلل قوى القص القاعدي والتسارع بنسبة تصل إلى 70%.'
                  : 'Base isolation decouples the superstructure from ground shaking by lengthening the natural structural period (T > 2.0s) and increasing viscous damping. This shifts building resonance away from predominant earthquake frequencies, reducing seismic base shear by up to 70%.'}
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                <div>• Natural Frequency (f_n): {structuralMetrics.naturalFrequencyHz} Hz</div>
                <div>• Damping Ratio (&zeta;): {structuralMetrics.dampingRatio}</div>
                <div>• Dynamic Amplification (DAF): {structuralMetrics.displacementAmplification}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
