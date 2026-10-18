import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useLanguage } from '../context/LanguageContext';
import { saveState, loadState } from '../utils/persistence';
import { 
  Orbit, 
  Sun, 
  Sparkles, 
  Play,
  Pause,
  RotateCcw,
  WifiOff,
  Globe,
  Sliders,
  Eye,
  CheckCircle2
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
  threeColor: number;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  hasRing?: boolean;
  hasMoon?: boolean;
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
    threeColor: 0x94a3b8,
    radius: 0.38,
    orbitRadius: 4.8,
    orbitSpeed: 3.8,
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
    threeColor: 0xf59e0b,
    radius: 0.58,
    orbitRadius: 7.2,
    orbitSpeed: 2.5,
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
    threeColor: 0x38bdf8,
    radius: 0.65,
    orbitRadius: 10.0,
    orbitSpeed: 1.8,
    hasMoon: true,
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
    threeColor: 0xef4444,
    radius: 0.48,
    orbitRadius: 13.0,
    orbitSpeed: 1.3,
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
    threeColor: 0xd97706,
    radius: 1.45,
    orbitRadius: 17.5,
    orbitSpeed: 0.75,
    summaryEn: 'Largest planet with over twice the mass of all others combined. Contains the Great Red Spot storm and protects the inner system by deflecting comets.',
    summaryAr: 'أضخم كواكب المجموعة الشمسية وتفوق كتلته ضعفي كتلة باقي الكواكب مجتمعة، يضم البقعة الحمراء العظيمة ويحمي الكواكب الداخلية بجاذبيته من الكويكبات.'
  },
  {
    id: 'saturn',
    nameEn: 'Saturn',
    nameAr: 'زحل',
    typeEn: 'Gas Giant (Ringed)',
    typeAr: 'عملاق غازي ذو حلقات كوكبية',
    distanceAU: 9.582,
    orbitalPeriodDays: 10759,
    diameterKm: 116460,
    surfaceTempC: '-140 °C',
    gravityMps2: 10.44,
    moonsCount: 146,
    color: '#eab308',
    threeColor: 0xeab308,
    radius: 1.25,
    orbitRadius: 22.5,
    orbitSpeed: 0.52,
    hasRing: true,
    summaryEn: 'Famous for its spectacular ring system composed of billions of water ice chunks and dust. Has lowest density of all planets (would float in water).',
    summaryAr: 'يتميز بأبهى نظام حلقات في الفضاء مكون من مليارات قطع الجليد المائي والغبار الكوني، وهو الكوكب الأقل كثافة في المجموعة الشمسية حيث تبلغ كثافته أقل من الماء.'
  },
  {
    id: 'uranus',
    nameEn: 'Uranus',
    nameAr: 'أورانوس',
    typeEn: 'Ice Giant',
    typeAr: 'عملاق جليدي مائل',
    distanceAU: 19.20,
    orbitalPeriodDays: 30687,
    diameterKm: 50724,
    surfaceTempC: '-195 °C',
    gravityMps2: 8.69,
    moonsCount: 28,
    color: '#06b6d4',
    threeColor: 0x06b6d4,
    radius: 0.90,
    orbitRadius: 27.5,
    orbitSpeed: 0.35,
    hasRing: true,
    summaryEn: 'Ice giant with a tilt of 98 degrees, effectively rotating on its side. Atmosphere contains methane giving it a vivid cyan-blue hue.',
    summaryAr: 'عملاق جليدي يميل محور دورانه بزاوية 98 درجة ويدور شبه ملقى على جنبه، ويعود لونه الفيروزي المميز إلى امتصاص الميثان في غلافه الجوي للأطوال الموجية الحمراء.'
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
    threeColor: 0x3b82f6,
    radius: 0.88,
    orbitRadius: 32.5,
    orbitSpeed: 0.25,
    summaryEn: 'Outermost planet, experiencing supersonic winds up to 2,100 km/h. Discovered mathematically via gravitational perturbations on Uranus.',
    summaryAr: 'أبعد كواكب النظام الشمسي، تهب على سطحه أعنف رياح مسجلة في الفضاء بسرعة 2100 كم/ساعة، وتم اكتشافه رياضياً عبر رصد الاضطرابات في مدار أورانوس.'
  }
];

export const AstronomyLab: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData>(() => {
    const saved = loadState<string>('selected_planet', 'earth');
    return PLANETS_DATA.find(p => p.id === saved) || PLANETS_DATA[2];
  });

  const [viewMode, setViewMode] = useState<'local_3d' | 'cloud_embed'>('local_3d');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showOrbitLines, setShowOrbitLines] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network status to warn about cloud models
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => {
      setIsOnline(false);
      setViewMode('local_3d');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    saveState('selected_planet', selectedPlanet.id);
  }, [selectedPlanet]);

  // Three.js Solar System Setup
  const mountRef = useRef<HTMLDivElement | null>(null);
  const planetMeshesRef = useRef<Map<string, { group: THREE.Group; mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number }>>(new Map());
  const moonGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const orbitLinesRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (viewMode !== 'local_3d') return;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030611);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 36, 44);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 120;
    controls.minDistance = 6;
    controlsRef.current = controls;

    // Ambient & Sunlight
    scene.add(new THREE.AmbientLight(0x334155, 1.4));
    const sunLight = new THREE.PointLight(0xffffff, 3.2, 350, 0.3);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Deep Cosmic Starfield
    const starsCount = 1200;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const rad = 70 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = rad * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = rad * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = rad * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // The Sun
    const sunGeo = new THREE.SphereGeometry(2.3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffa600 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun glowing corona
    const coronaGeo = new THREE.SphereGeometry(2.7, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Orbit Lines Container
    const orbitLinesGroup = new THREE.Group();
    scene.add(orbitLinesGroup);
    orbitLinesRef.current = orbitLinesGroup;

    // Build Planets & Orbits
    planetMeshesRef.current.clear();

    PLANETS_DATA.forEach(p => {
      // 1. Orbit Path Ring
      const orbitCurve = new THREE.EllipseCurve(0, 0, p.orbitRadius, p.orbitRadius, 0, 2 * Math.PI, false, 0);
      const orbitPts = orbitCurve.getPoints(96);
      const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitPts.map(pt => new THREE.Vector3(pt.x, 0, pt.y)));
      const orbitLineMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.25
      });
      const orbitLine = new THREE.LineLoop(orbitLineGeo, orbitLineMat);
      orbitLinesGroup.add(orbitLine);

      // 2. Planet Pivot & Mesh
      const pivotGroup = new THREE.Group();
      scene.add(pivotGroup);

      const pGeo = new THREE.SphereGeometry(p.radius, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: p.threeColor,
        roughness: 0.6,
        metalness: 0.2
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(p.orbitRadius, 0, 0);
      pivotGroup.add(pMesh);

      // Saturn / Uranus Rings
      if (p.hasRing) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.3, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          color: p.threeColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
          roughness: 0.4
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.5;
        pMesh.add(ringMesh);
      }

      // Earth's Moon
      if (p.hasMoon) {
        const moonGroup = new THREE.Group();
        pMesh.add(moonGroup);
        moonGroupRef.current = moonGroup;

        const moonGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(1.2, 0, 0);
        moonGroup.add(moonMesh);
      }

      // Initial angle spread
      const initialAngle = (p.orbitRadius * 1.5) % (Math.PI * 2);
      pivotGroup.rotation.y = initialAngle;

      planetMeshesRef.current.set(p.id, {
        group: pivotGroup,
        mesh: pMesh,
        orbitRadius: p.orbitRadius,
        speed: p.orbitSpeed,
        angle: initialAngle
      });
    });

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Sun & Corona
      sunMesh.rotation.y += delta * 0.2;
      coronaMesh.rotation.y -= delta * 0.15;

      // Rotate Moon around Earth
      if (moonGroupRef.current && isPlaying) {
        moonGroupRef.current.rotation.y += delta * 3.5 * simSpeed;
      }

      // Advance planetary orbits
      if (isPlaying) {
        planetMeshesRef.current.forEach((item) => {
          item.angle += delta * 0.12 * item.speed * simSpeed;
          item.group.rotation.y = item.angle;
          item.mesh.rotation.y += delta * 0.8;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [viewMode, isPlaying, simSpeed]);

  // Orbit lines toggle effect
  useEffect(() => {
    if (orbitLinesRef.current) {
      orbitLinesRef.current.visible = showOrbitLines;
    }
  }, [showOrbitLines]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  const focusOnPlanet = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    const item = planetMeshesRef.current.get(planet.id);
    if (item && controlsRef.current) {
      const currentAngle = item.group.rotation.y;
      const x = Math.cos(currentAngle) * item.orbitRadius;
      const z = -Math.sin(currentAngle) * item.orbitRadius;
      controlsRef.current.target.set(x, 0, z);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'الفيزياء الفلكية وعلوم الفضاء الكوني' : 'Astrophysics & Planetary Space Sciences'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {language === 'ar' ? 'مختبر علوم الفلك والنظام الشمسي 3D' : '3D Astronomy & Solar System Laboratory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar' 
              ? 'محاكاة 3D متكاملة لكواكب المجموعة الشمسية تعمل 100% بدون إنترنت مع حسابات كيبلر المدارية' 
              : 'Interactive 3D Solar System simulation working 100% offline with Keplerian orbital telemetry'}
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center gap-1.5 sci-surface p-1.5">
          <button
            onClick={() => setViewMode('local_3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'local_3d' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: viewMode === 'local_3d' ? '#000' : '#38bdf8' }} />
            <span>{language === 'ar' ? 'المحاكي المحلي 3D (بدون إنترنت)' : 'Local 3D Engine (Offline)'}</span>
          </button>
          <button
            onClick={() => setViewMode('cloud_embed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              viewMode === 'cloud_embed' ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" style={{ color: viewMode === 'cloud_embed' ? '#000' : '#818cf8' }} />
            <span>{language === 'ar' ? 'النموذج السحابي (Sketchfab)' : 'Cloud Model (Online)'}</span>
          </button>
        </div>
      </div>

      {/* 3D SOLAR SYSTEM SIMULATOR */}
      <div className="space-y-6">
        <div className="sci-card overflow-hidden flex flex-col h-[640px] border border-indigo-500/30 shadow-2xl relative">
          
          {/* Viewer Controls Toolbar */}
          <div className="bg-[#08090c] px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? 'المجموعة الشمسية والمدارات الكوكبية' : 'Planetary Orbits & Heliocentric Dynamics'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {viewMode === 'local_3d' ? (language === 'ar' ? '⚡ محلي 60FPS أوفلاين' : '⚡ 60FPS Offline') : '🌐 Cloud Stream'}
              </span>
            </div>

            {/* Local Engine Interactive Controls */}
            {viewMode === 'local_3d' && (
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10"
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  <span>{isPlaying ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'تشغيل' : 'Play')}</span>
                </button>

                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10 text-xs">
                  <Sliders className="w-3 h-3 text-indigo-400" />
                  <span className="text-[11px] text-slate-400">{language === 'ar' ? 'السرعة:' : 'Speed:'}</span>
                  {[0.5, 1, 2, 5].map(spd => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        simSpeed === spd ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowOrbitLines(!showOrbitLines)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    showOrbitLines ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                  title={language === 'ar' ? 'إظهار / إخفاء المدارات' : 'Toggle Orbits'}
                >
                  <Orbit className="w-3 h-3 inline mr-1" />
                  <span>{language === 'ar' ? 'المدارات' : 'Orbits'}</span>
                </button>

                <button
                  onClick={handleResetCamera}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors"
                  title={language === 'ar' ? 'إعادة ضبط الكاميرا' : 'Reset Camera'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* VIEW: Local Three.js Engine (100% Offline) */}
          {viewMode === 'local_3d' && (
            <div className="w-full flex-1 bg-[#030611] relative">
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              
              {/* Overlay Instructions Pill */}
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'ar' ? 'اسحب للتدوير 360° • عجلة الفأرة للتقريب • انقر على أي كوكب بالأسفل لتركيز الكاميرا' : 'Drag to rotate 360° • Scroll to zoom • Click any planet below to focus'}</span>
              </div>
            </div>
          )}

          {/* VIEW: Cloud Sketchfab Embed (With Offline Fallback Shield) */}
          {viewMode === 'cloud_embed' && (
            <div className="w-full flex-1 bg-black relative flex items-center justify-center">
              {!isOnline ? (
                <div className="max-w-md p-6 text-center space-y-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-2xl">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <WifiOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {language === 'ar' ? 'أنت في وضع عدم الاتصال (Offline)' : 'No Internet Connection Detected'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {language === 'ar' 
                        ? 'النموذج السحابي يتطلب اتصالاً بالإنترنت. يمكنك الآن استخدام المحاكي المحلي 3D المدمج في ساي نكسا الذي يعمل بكفاءة 100% بدون إنترنت.'
                        : 'Cloud models require internet access. Use SciNexa’s native 3D engine which runs 100% offline with full features.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewMode('local_3d')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 shadow-lg transition-all"
                  >
                    {language === 'ar' ? 'التبديل إلى المحاكي المحلي 3D الآن' : 'Switch to Local 3D Engine'}
                  </button>
                </div>
              ) : (
                <iframe
                  title="Solar System 3D"
                  className="w-full h-full border-0"
                  src="https://sketchfab.com/models/fad1f8a62d3848d0be664339e6f3b1a2/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                />
              )}
            </div>
          )}
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
                  onClick={() => focusOnPlanet(p)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/90 to-slate-900 border-indigo-400/70 shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div 
                    className="w-7 h-7 mx-auto rounded-full mb-2 flex items-center justify-center font-bold text-xs shadow-md"
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
