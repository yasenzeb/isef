import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { 
  Orbit, 
  Moon, 
  Sun, 
  Sparkles, 
  Compass, 
  Layers, 
  Maximize2, 
  ChevronRight, 
  Info,
  Calendar,
  Activity
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

interface LunarPhase {
  id: string;
  nameEn: string;
  nameAr: string;
  dayStart: number;
  illuminationPct: number;
  angleDeg: number;
  tideEffectEn: string;
  tideEffectAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

const LUNAR_PHASES: LunarPhase[] = [
  {
    id: 'new_moon',
    nameEn: 'New Moon',
    nameAr: 'المحاق (ولادة الهلال)',
    dayStart: 0,
    illuminationPct: 0,
    angleDeg: 0,
    tideEffectEn: 'Spring Tide (Maximum amplitude tidal forces aligned with Sun)',
    tideEffectAr: 'المد العالي (Spring Tide): تتحد جاذبية الشمس والقمر على خط واحد فيحدث أعلى مد',
    descriptionEn: 'The Moon is positioned directly between the Earth and the Sun. Its illuminated hemisphere faces away from Earth, rendering it invisible in the sky.',
    descriptionAr: 'يقع القمر مباشرة بين الأرض والشمس، فيكون وجهه المضيء متجهاً بالكامل نحو الشمس ووجهه المظلم متجهاً للأرض فلا يُرى في السماء.'
  },
  {
    id: 'waxing_crescent',
    nameEn: 'Waxing Crescent',
    nameAr: 'الهلال المتزايد',
    dayStart: 3.7,
    illuminationPct: 25,
    angleDeg: 45,
    tideEffectEn: 'Moderate intermediate tides transitioning toward quadrature',
    tideEffectAr: 'مد متوسط تدريجي مع تحرك زاوية القمر نحو التربيع',
    descriptionEn: 'A slim curved silver sliver appears in the western evening sky right after sunset as the Moon moves eastward in its orbit away from the solar line.',
    descriptionAr: 'يظهر قوس فضي رفيع في الأفق الغربي بعد غروب الشمس مباشرة، مع تحرك القمر شرقاً في مداره مبتعداً عن خط الشمس.'
  },
  {
    id: 'first_quarter',
    nameEn: 'First Quarter',
    nameAr: 'التربيع الأول',
    dayStart: 7.4,
    illuminationPct: 50,
    angleDeg: 90,
    tideEffectEn: 'Neap Tide (Solar and lunar gravitational pulls cancel perpendicularly)',
    tideEffectAr: 'المد الخفيف / الجزر الأكبر (Neap Tide): تتعامد قوى جذب الشمس والقمر فيقل منسوب المد',
    descriptionEn: 'The Moon is at a 90° right angle to the Sun-Earth line. Exactly half of the visible lunar disc is illuminated, rising around noon and setting at midnight.',
    descriptionAr: 'يصنع القمر زاوية قائمة 90 درجة مع الخط الواصل بين الأرض والشمس، فيظهر نصف القرص الأيمن مضيئاً تماماً.'
  },
  {
    id: 'waxing_gibbous',
    nameEn: 'Waxing Gibbous',
    nameAr: 'الأحدب المتزايد',
    dayStart: 11.1,
    illuminationPct: 75,
    angleDeg: 135,
    tideEffectEn: 'Progressive intensification toward syzygy spring tides',
    tideEffectAr: 'تزايد مستمر في قوة الجاذبية المشتركة مع اقتراب القمر من وضع الاستقبال (البدر)',
    descriptionEn: 'More than half of the visible face shines as the Moon approaches opposition to the Sun, dominating the sky throughout most of the night.',
    descriptionAr: 'يزداد الجزء المضيء ليتجاوز نصف القرص متجهاً نحو الاكتمال، ويسطع في السماء من فترة ما بعد الظهر حتى مشارف الفجر.'
  },
  {
    id: 'full_moon',
    nameEn: 'Full Moon',
    nameAr: 'البدر المكتمل',
    dayStart: 14.8,
    illuminationPct: 100,
    angleDeg: 180,
    tideEffectEn: 'Spring Tide (Syzygy alignment produces maximum tidal bulges)',
    tideEffectAr: 'المد العالي العظمى (Spring Tide): اصطفاف الأرض بين الشمس والقمر يحدث أعلى موجة مد قمري',
    descriptionEn: 'The Moon is in opposition (180° opposite the Sun). The entire Earth-facing hemisphere is fully bathed in direct sunlight, rising at sunset and setting at dawn.',
    descriptionAr: 'يقع القمر في وضع الاستقبال التام (180 درجة في مواجهة الشمس)، فيضاء كامل وجهه المقابل للأرض، ويشرق مع غروب الشمس ويغرب مع شروقها.'
  },
  {
    id: 'waning_gibbous',
    nameEn: 'Waning Gibbous',
    nameAr: 'الأحدب المتناقص',
    dayStart: 18.5,
    illuminationPct: 75,
    angleDeg: 225,
    tideEffectEn: 'Declining tidal range returning toward quadrature',
    tideEffectAr: 'تناقص تدريجي في شدة المد مع ابتعاد القمر عن خط الاستقبال',
    descriptionEn: 'The illuminated portion begins to shrink from the western lunar limb as the Moon continues its eastward orbital journey back toward the Sun.',
    descriptionAr: 'يبدأ الجزء المضيء بالتناقص من الحافة الغربية مع استمرار دوران القمر في مداره عائداً للاقتراب من الشمس.'
  },
  {
    id: 'third_quarter',
    nameEn: 'Third Quarter (Last Quarter)',
    nameAr: 'التربيع الثاني (الأخير)',
    dayStart: 22.1,
    illuminationPct: 50,
    angleDeg: 270,
    tideEffectEn: 'Neap Tide (Perpendicular solar-lunar gravitational forces)',
    tideEffectAr: 'المد الخفيف (Neap Tide): تعامد قوى الجاذبية الشمسية والقمرية للمرة الثانية في الشهر',
    descriptionEn: 'The opposite eastern half of the lunar disc is illuminated. The Moon rises around midnight and is visible high in the morning sky.',
    descriptionAr: 'يضيء النصف الأيسر من قرص القمر المقابل للأرض، ويشرق القمر في منتصف الليل ويبقى مرئياً في سماء الصباح.'
  },
  {
    id: 'waning_crescent',
    nameEn: 'Waning Crescent',
    nameAr: 'الهلال المتناقص (العرجون القديم)',
    dayStart: 25.8,
    illuminationPct: 25,
    angleDeg: 315,
    tideEffectEn: 'Approaching new moon syzygy transition',
    tideEffectAr: 'الاستعداد لدورة اقتران شمسي جديدة وولادة الشهر القمري القادم',
    descriptionEn: 'A slender sliver visible low in the eastern dawn sky just before sunrise, shrinking day by day until it vanishes into the next New Moon.',
    descriptionAr: 'قوس فضي رفيع يظهر في الأفق الشرقي فجراً قبل شروق الشمس مباشرة، ويتناقص يومياً حتى يختفي تماماً إيذاناً بنهاية الشهر القمري.'
  }
];

export const AstronomyLab: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'solar' | 'moon'>('solar');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData>(PLANETS_DATA[2]); // Default Earth
  
  // Moon phases simulation state
  const [lunarDay, setLunarDay] = useState<number>(14.8); // Default Full Moon
  const [moonViewMode, setMoonViewMode] = useState<'interactive3d' | 'sketchfab'>('interactive3d');

  // Compute active phase
  const currentPhase = LUNAR_PHASES.reduce((prev, curr) => {
    return Math.abs(curr.dayStart - lunarDay) < Math.abs(prev.dayStart - lunarDay) ? curr : prev;
  }, LUNAR_PHASES[0]);

  // 3D Canvas ref for Moon Simulation
  const moonCanvasRef = useRef<HTMLDivElement | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const earthCamRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (activeModule !== 'moon' || moonViewMode !== 'interactive3d') return;
    const container = moonCanvasRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020510);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);
    earthCamRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 15.0;

    // Ambient space glow
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.25);
    scene.add(ambientLight);

    // Directional Sunlight
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.5);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Stars background particles
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 400;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = (Math.random() - 0.5) * 50;
      starPositions[i + 2] = -10 - Math.random() * 20;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Procedural Moon Sphere with craters and highlands
    const moonGeo = new THREE.SphereGeometry(1.35, 64, 64);
    
    // Load authentic high-resolution photographic lunar texture uploaded by user
    const textureLoader = new THREE.TextureLoader();
    const realMoonTexture = textureLoader.load(
      '/textures/moon/moon_real_highres.webp',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(2, 1);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
      }
    );

    const moonMat = new THREE.MeshStandardMaterial({
      map: realMoonTexture,
      bumpMap: realMoonTexture,
      bumpScale: 0.04,
      roughness: 0.95,
      metalness: 0.02,
    });

    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();

      // Slowly rotate moon slightly for aesthetic
      if (moonMeshRef.current) {
        moonMeshRef.current.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      realMoonTexture.dispose();
    };
  }, [activeModule, moonViewMode]);

  // Update dynamic sunlight position based on lunar day / phase angle
  useEffect(() => {
    if (!sunLightRef.current) return;
    // Map lunarDay (0 to 29.53) to orbital angle theta:
    // At Day 0 (New Moon): Sun is behind the Moon relative to Earth (z = -10, x = 0)
    // At Day 7.4 (First Quarter): Sun is to the right (x = 10, z = 0)
    // At Day 14.8 (Full Moon): Sun is behind the camera (z = 10, x = 0)
    // At Day 22.1 (Third Quarter): Sun is to the left (x = -10, z = 0)
    const synodicMonth = 29.53059;
    const phaseFraction = (lunarDay % synodicMonth) / synodicMonth;
    const angleRad = phaseFraction * Math.PI * 2;

    const sunDist = 12;
    const sunX = Math.sin(angleRad) * sunDist;
    const sunZ = Math.cos(angleRad) * sunDist;

    sunLightRef.current.position.set(sunX, 1.5, sunZ);
  }, [lunarDay]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'الفيزياء الفلكية وعلوم الفضاء الكوني' : 'Astrophysics & Planetary Space Sciences'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {language === 'ar' ? 'مختبر علوم الفلك والنظام الشمسي' : 'Astronomy & Planetary Space Laboratory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar' 
              ? 'محاكاة 3D تفاعلية لكواكب المجموعة الشمسية وأطوار القمر السنوية وإضاءته المدارية وقوانين كيبلر' 
              : 'Interactive 3D simulation of Solar System planetary celestial dynamics and annual lunar phases'}
          </p>
        </div>

        {/* Module Switcher */}
        <div className="flex items-center space-x-2 sci-surface p-1.5">
          <button
            onClick={() => setActiveModule('solar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeModule === 'solar' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" style={{ color: activeModule === 'solar' ? 'black' : '#818cf8' }} />
            <span>{language === 'ar' ? 'المجموعة الشمسية والمدارات' : '3D Solar System'}</span>
          </button>
          <button
            onClick={() => setActiveModule('moon')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeModule === 'moon' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" style={{ color: activeModule === 'moon' ? 'black' : '#38bdf8' }} />
            <span>{language === 'ar' ? 'محاكاة أطوار القمر ثلاثية الأبعاد' : '3D Moon Phases'}</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: 3D SOLAR SYSTEM */}
      {activeModule === 'solar' && (
        <div className="space-y-6">
          {/* Main 3D Solar System Viewer */}
          <div className="sci-card overflow-hidden flex flex-col h-[600px] border border-indigo-500/30">
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
      )}

      {/* MODULE 2: 3D MOON PHASES & LUNAR CYCLE */}
      {activeModule === 'moon' && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="sci-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'ar' ? 'محاكاة أطوار القمر السنوية والشهرية التفاعلية 3D' : 'Real-Time 3D Synodic Lunar Phases Simulator'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar' 
                    ? 'حرك المؤشر عبر الشهر القمري لملاحظة تغير خط الغسق والظل الشمسي وأثر المد والجزر' 
                    : 'Slide across the 29.53-day synodic lunar month to watch dynamic solar terminator shadow shifting and tidal dynamics'}
                </p>
              </div>

              {/* View Mode Toggle: Interactive Three.js vs High-Detail Sketchfab */}
              <div className="flex items-center space-x-1.5 sci-surface p-1">
                <button
                  onClick={() => setMoonViewMode('interactive3d')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    moonViewMode === 'interactive3d' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'محاكاة الإضاءة الشمسية 3D' : 'Solar Light Sim'}
                </button>
                <button
                  onClick={() => setMoonViewMode('sketchfab')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    moonViewMode === 'sketchfab' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'مجسم التضاريس والفوهات 3D' : 'Craters & Topography'}
                </button>
              </div>
            </div>

            {/* Lunar Day Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'ar' ? 'اليوم في الدورة القمرية:' : 'Day in Synodic Lunar Cycle:'}</span>
                  <span className="font-mono text-cyan-400 font-bold">{lunarDay.toFixed(1)} / 29.5 {language === 'ar' ? 'يوم' : 'days'}</span>
                </span>
                <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {language === 'ar' ? currentPhase.nameAr : currentPhase.nameEn} ({currentPhase.illuminationPct}%)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={29.53}
                step={0.1}
                value={lunarDay}
                onChange={(e) => setLunarDay(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 8 Phase Quick Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
              {LUNAR_PHASES.map((phase) => {
                const isActive = currentPhase.id === phase.id;
                return (
                  <button
                    key={phase.id}
                    onClick={() => setLunarDay(phase.dayStart)}
                    className={`py-2 px-2 rounded-xl text-center border transition-all text-xs ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow'
                        : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="font-mono text-[10px] opacity-75">{phase.dayStart.toFixed(0)}d</div>
                    <div className="text-[11px] font-semibold truncate">
                      {language === 'ar' ? phase.nameAr.split(' ')[0] : phase.nameEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Moon Canvas & Live Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Viewer Panel */}
            <div className="lg:col-span-2 sci-card overflow-hidden flex flex-col h-[520px] border border-cyan-500/20">
              <div className="bg-[#08090c] px-4 py-2.5 border-b border-white/10 flex items-center justify-between z-10">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span>
                    {language === 'ar' ? currentPhase.nameAr : currentPhase.nameEn} • {currentPhase.illuminationPct}% {language === 'ar' ? 'إضاءة قرص القمر' : 'Illuminated'}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {language === 'ar' ? 'اسحب لتدوير زاوية الرؤية' : 'Drag to rotate perspective'}
                </span>
              </div>

              {moonViewMode === 'interactive3d' ? (
                <div 
                  ref={moonCanvasRef} 
                  className="w-full flex-1 bg-[#020510] cursor-grab active:cursor-grabbing" 
                  style={{ touchAction: 'none' }}
                />
              ) : (
                <div className="w-full flex-1 bg-black relative">
                  <iframe
                    title="Moon Phases 3D Topography"
                    className="w-full h-full border-0"
                    src="https://sketchfab.com/models/b27c3d9a184e4f71a9db9405d63f0d23/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Real Moon Phases Photographic Strip */}
              <div className="sci-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{language === 'ar' ? 'أطلس رصد أطوار القمر الواقعية' : 'Real Astrophotography Lunar Strip'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">NASA & OBSERVATORY SPECTRA</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src="/textures/moon/moon_phases_strip.jpg"
                    alt="Real Lunar Phases Astrophotography"
                    className="w-full h-28 object-contain object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Scientific Details & Tidal Dynamics */}
            <div className="space-y-4">
              <div className="sci-card p-5 space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'الوصف الفلكي للطور الحالي' : 'Astronomical Phase Profile'}
                </span>
                <h4 className="text-lg font-bold text-white">
                  {language === 'ar' ? currentPhase.nameAr : currentPhase.nameEn}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-white/5">
                  {language === 'ar' ? currentPhase.descriptionAr : currentPhase.descriptionEn}
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">{language === 'ar' ? 'زاوية الاستطالة الشمسية' : 'Solar Elongation'}</span>
                    <span className="font-mono text-cyan-300 font-bold">{currentPhase.angleDeg}°</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">{language === 'ar' ? 'نسبة الإضاءة الظاهرية' : 'Fraction Illuminated'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{currentPhase.illuminationPct}%</span>
                  </div>
                </div>
              </div>

              {/* Tidal Impact Card */}
              <div className="sci-card p-5 space-y-2 border-l-4 border-l-indigo-500">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  {language === 'ar' ? '🌊 أثر الجاذبية على المد والجزر البحري' : '🌊 Ocean Tidal Dynamics'}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' ? currentPhase.tideEffectAr : currentPhase.tideEffectEn}
                </p>
              </div>

              {/* Synchronous Rotation Principle */}
              <div className="sci-card p-5 space-y-2 border-l-4 border-l-amber-500">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {language === 'ar' ? '🔒 سر الوجه الواحد للقمر (التقييد المدي)' : '🔒 Synchronous Rotation (Tidal Locking)'}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' 
                    ? 'يدور القمر حول محوره في نفس المدة التي يستغرقها للدوران حول الأرض (27.3 يوماً)، مما يجعل نفس الوجه مقابلاً للأرض دائماً، بينما ظل الوجه البعيد مجهولاً للبشرية حتى تصويره عام 1959.'
                    : 'The Moon rotates on its axis at exactly the same rate it orbits Earth (27.3 days), keeping the same hemisphere locked facing Earth at all times.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default AstronomyLab;
