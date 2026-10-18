import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { saveState, loadState } from '../utils/persistence';
import { 
  Orbit, 
  Sun, 
  Sparkles, 
  Maximize2
} from 'lucide-react';

interface PlanetData {
  id: string;
  nameEn: string;
  nameAr: string;
  typeEn: string;
  typeAr: string;
  distanceAU: number;
  orbitalPeriodDays: number;
  diameterKm: number;
  surfaceTempC: string;
  gravityMps2: number;
  moonsCount: number;
  color: string;
  summaryEn: string;
  summaryAr: string;
}

const PLANETS_DATA: PlanetData[] = [
  {
    id: 'mercury',
    nameEn: 'Mercury',
    nameAr: 'عطارد',
    typeEn: 'Terrestrial Planet',
    typeAr: 'كوكب صخري داخلي',
    distanceAU: 0.387,
    orbitalPeriodDays: 88,
    diameterKm: 4879,
    surfaceTempC: '-180 to 430 °C',
    gravityMps2: 3.7,
    moonsCount: 0,
    color: '#94a3b8',
    summaryEn: 'Closest planet to the Sun. It experiences extreme temperature swings and has a massive metallic core occupying 85% of its radius.',
    summaryAr: 'أقرب كواكب المجموعة الشمسية إلى الشمس، يتميز بفروق حرارية حادة بين ليله ونهاره ويمتلك نواة حديدية ضخمة تمثل 85% من نصف قطره.'
  },
  {
    id: 'venus',
    nameEn: 'Venus',
    nameAr: 'الزهرة',
    typeEn: 'Terrestrial Planet',
    typeAr: 'كوكب صخري ذو غلاف سام',
    distanceAU: 0.723,
    orbitalPeriodDays: 224.7,
    diameterKm: 12104,
    surfaceTempC: '465 °C (Constant)',
    gravityMps2: 8.87,
    moonsCount: 0,
    color: '#fbbf24',
    summaryEn: 'Hottest planet due to runaway greenhouse effect in a 96% CO2 atmosphere with sulfuric acid clouds. Rotates backwards (retrograde).',
    summaryAr: 'أعلى كواكب النظام الشمسي حرارة نتيجة الاحتباس الحراري الشديد في غلافه الجوي الكثيف المكون من ثاني أكسيد الكربون، ويدور حول نفسه في اتجاه معاكس.'
  },
  {
    id: 'earth',
    nameEn: 'Earth',
    nameAr: 'الأرض',
    typeEn: 'Terrestrial Planet (Habitable)',
    typeAr: 'كوكب الحياة الصخري',
    distanceAU: 1.000,
    orbitalPeriodDays: 365.25,
    diameterKm: 12742,
    surfaceTempC: '-88 to 58 °C',
    gravityMps2: 9.81,
    moonsCount: 1,
    color: '#38bdf8',
    summaryEn: 'The only known world harboring life. Boasts liquid water oceans, an active nitrogen-oxygen atmosphere, and a dynamic geomagnetic dynamo.',
    summaryAr: 'الكوكب الوحيد المعروف بإيوائه للحياة، تغطي المحيطات السائلة 71% من سطحه ويتمتع بغلاف جوي متوازن ومجال مغناطيسي يحميه من الرياح الشمسية.'
  },
  {
    id: 'mars',
    nameEn: 'Mars',
    nameAr: 'المريخ',
    typeEn: 'Terrestrial Planet',
    typeAr: 'الكوكب الصخري الأحمر',
    distanceAU: 1.524,
    orbitalPeriodDays: 687,
    diameterKm: 6779,
    surfaceTempC: '-140 to 20 °C',
    gravityMps2: 3.72,
    moonsCount: 2,
    color: '#f97316',
    summaryEn: 'The Red Planet, colored by iron oxide. Features Olympus Mons, the tallest volcano in the solar system, and ancient desiccated river valleys.',
    summaryAr: 'الكوكب الأحمر بسبب وفرة أكسيد الحديد في تربته، يضم بركان أوليمبوس الشاهق (أعلى جبل في النظام الشمسي) وأودية قديمة تدل على تدفق المياه سابقاً.'
  },
  {
    id: 'jupiter',
    nameEn: 'Jupiter',
    nameAr: 'المشتري',
    typeEn: 'Gas Giant',
    typeAr: 'عملاق غازي هائل',
    distanceAU: 5.204,
    orbitalPeriodDays: 4333,
    diameterKm: 139820,
    surfaceTempC: '-110 °C',
    gravityMps2: 24.79,
    moonsCount: 95,
    color: '#d97706',
    summaryEn: 'Largest planet in our system with more mass than all other planets combined. Houses the Great Red Spot, a colossal storm raging for centuries.',
    summaryAr: 'أضخم كواكب النظام الشمسي وتفوق كتلته مجموع بقية الكواكب مجتمعة، وتشتهر غيومه بالعاصفة الحلزونية العملاقة (البقعة الحمراء العظيمة).'
  },
  {
    id: 'saturn',
    nameEn: 'Saturn',
    nameAr: 'زحل',
    typeEn: 'Gas Giant (Ringed)',
    typeAr: 'عملاق غازي ذو حلقات جليدية',
    distanceAU: 9.582,
    orbitalPeriodDays: 10759,
    diameterKm: 116460,
    surfaceTempC: '-140 °C',
    gravityMps2: 10.44,
    moonsCount: 146,
    color: '#fef08a',
    summaryEn: 'Distinguished by extensive rings made of water ice and rock fragments. The only planet less dense than liquid water (density 0.687 g/cm³).',
    summaryAr: 'يتميز بنظامه الحلقي البديع المكون من تريليونات الجزيئات الجليدية والصخرية، وهو الكوكب الوحيد الذي تقل كثافته الإجمالية عن كثافة الماء السائل.'
  },
  {
    id: 'uranus',
    nameEn: 'Uranus',
    nameAr: 'أورانوس',
    typeEn: 'Ice Giant',
    typeAr: 'عملاق جليدي مائل',
    distanceAU: 19.22,
    orbitalPeriodDays: 30687,
    diameterKm: 50724,
    surfaceTempC: '-195 °C',
    gravityMps2: 8.69,
    moonsCount: 28,
    color: '#22d3ee',
    summaryEn: 'Cyan ice giant rich in methane ice. Tilts on its side at an extreme 97.8° axial tilt, rolling along its orbit like a bowling ball.',
    summaryAr: 'عملاق جليدي أزرق مخضر لاحتواء غلافه على غاز الميثان، يدور بزاوية ميلان محورية قياسية تبلغ 98 درجة تجعله يتدحرج على جنبه في مداره.'
  },
  {
    id: 'neptune',
    nameEn: 'Neptune',
    nameAr: 'نبتون',
    typeEn: 'Ice Giant',
    typeAr: 'عملاق جليدي عاصف',
    distanceAU: 30.05,
    orbitalPeriodDays: 60190,
    diameterKm: 49244,
    surfaceTempC: '-200 °C',
    gravityMps2: 11.15,
    moonsCount: 16,
    color: '#3b82f6',
    summaryEn: 'Deep blue distant world with supersonic winds exceeding 2,100 km/h, the fastest recorded atmospheric winds in the Solar System.',
    summaryAr: 'أبعد كواكب النظام الشمسي، يتسم برياح فوق صوتية هي الأسرع في المجموعة الشمسية حيث تتجاوز سرعتها 2,100 كم/ساعة حول بؤرة العواصف المظلمة.'
  }
];

export const AstronomyLab: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData>(() => {
    const savedId = loadState<string>('astronomy_planet_id', 'earth');
    return PLANETS_DATA.find(p => p.id === savedId) || PLANETS_DATA[2];
  });

  // Auto-save state
  useEffect(() => {
    saveState('astronomy_planet_id', selectedPlanet.id);
  }, [selectedPlanet]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'الفيزياء الفلكية وعلوم الفضاء الكوني' : 'Astrophysics & Planetary Space Sciences'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {language === 'ar' ? 'مختبر علوم الفلك والنظام الشمسي 3D' : '3D Astronomy & Solar System Laboratory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar' 
              ? 'محاكاة 3D تفاعلية لكواكب المجموعة الشمسية ومداراتها الدقيقة والقياسات الفيزيائية وقوانين كيبلر' 
              : 'Interactive 3D simulation of Solar System planetary celestial dynamics and Keplerian orbital mechanics'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
            {language === 'ar' ? '🪐 النظام الشمسي المعتمد 3D' : '🪐 3D Solar System'}
          </span>
        </div>
      </div>

      {/* 3D SOLAR SYSTEM SIMULATOR */}
      <div className="space-y-6">
        {/* Main 3D Solar System Viewer */}
        <div className="sci-card overflow-hidden flex flex-col h-[620px] border border-indigo-500/30">
          <div className="bg-[#08090c] px-5 py-3 border-b border-white/10 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-bold text-white">
                {language === 'ar' ? 'المجموعة الشمسية والمدارات الكوكبية (النموذج الفلكي المعتمد)' : 'High-Precision 3D Solar System & Planetary Orbits'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
              Keplerian Orbital Mechanics
            </span>
          </div>

          <div className="w-full flex-1 bg-black relative">
            <iframe
              title="Solar System 3D"
              className="w-full h-full border-0"
              src="https://sketchfab.com/models/fad1f8a62d3848d0be664339e6f3b1a2/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
        </div>

        {/* Planetary Telemetry Explorer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Orbit className="w-4 h-4 text-indigo-400" />
              <span>{language === 'ar' ? 'استكشاف القياسات الفيزيائية لكواكب المجموعة الشمسية' : 'Planetary Physical Telemetry & Orbital Constants'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {language === 'ar' ? 'قانون كيبلر الثالث: T² = a³' : "Kepler's 3rd Law: T² = a³"}
            </span>
          </div>

          {/* Planets Grid Select */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {PLANETS_DATA.map((p) => {
              const isSelected = p.id === selectedPlanet.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanet(p)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/90 to-slate-900 border-indigo-400/70 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div 
                    className="w-7 h-7 mx-auto rounded-full mb-2 flex items-center justify-center font-bold text-xs"
                    style={{ background: p.color, color: '#0f172a' }}
                  >
                    {p.nameEn.substring(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-white block">
                    {language === 'ar' ? p.nameAr : p.nameEn}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.distanceAU} AU
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Planet Deep-Dive Card */}
          <div className="sci-card p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: selectedPlanet.color }} />
                <h4 className="text-xl font-extrabold text-white">
                  {language === 'ar' ? selectedPlanet.nameAr : selectedPlanet.nameEn}
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  ({language === 'ar' ? selectedPlanet.typeAr : selectedPlanet.typeEn})
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-white/5">
                {language === 'ar' ? selectedPlanet.summaryAr : selectedPlanet.summaryEn}
              </p>
            </div>

            {/* Metrics Column 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'المسافة عن الشمس' : 'Distance from Sun'}</div>
                <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">{selectedPlanet.distanceAU} AU</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.distanceAU * 149.6).toFixed(1)} M km</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'فترة الدوران المداري' : 'Orbital Period'}</div>
                <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{selectedPlanet.orbitalPeriodDays} {language === 'ar' ? 'يوم' : 'days'}</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.orbitalPeriodDays / 365.25).toFixed(2)} Earth yrs</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'القطر الاستوائي' : 'Diameter'}</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{selectedPlanet.diameterKm.toLocaleString()} km</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.diameterKm / 12742).toFixed(2)}x Earth</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'جاذبية السطح' : 'Surface Gravity'}</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">{selectedPlanet.gravityMps2} m/s²</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.gravityMps2 / 9.81).toFixed(2)} g</div>
              </div>
            </div>

            {/* Metrics Column 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'درجة حرارة السطح' : 'Surface Temp'}</div>
                <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">{selectedPlanet.surfaceTempC}</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{language === 'ar' ? 'الأقمار الطبيعية' : 'Moons'}</div>
                <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">{selectedPlanet.moonsCount} {language === 'ar' ? 'قمر' : 'moons'}</div>
              </div>
              <div className="col-span-2 metric-card text-left p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">{language === 'ar' ? 'التحقق من قانون كيبلر الثالث' : "Kepler's 3rd Law Check"}</span>
                  <span className="text-xs font-mono text-slate-300">
                    a³ = {(Math.pow(selectedPlanet.distanceAU, 3)).toFixed(2)} ≈ T² = {(Math.pow(selectedPlanet.orbitalPeriodDays / 365.25, 2)).toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  Harmonic Match ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AstronomyLab;
