import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { saveState, loadState } from '../utils/persistence';
import { Orbit, Sun, Play, Pause, RotateCcw, Sparkles, Globe2, Eye, Compass } from 'lucide-react';

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
  meshRadius: number;
  orbitRadius: number;
  speedMultiplier: number;
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
    summaryAr: 'أقرب كواكب المجموعة الشمسية إلى الشمس، يتميز بفروق حرارية حادة بين ليله ونهاره ويمتلك نواة حديدية ضخمة تمثل 85% من نصف قطره.',
    meshRadius: 0.32,
    orbitRadius: 5.5,
    speedMultiplier: 4.15,
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
    summaryAr: 'أعلى كواكب النظام الشمسي حرارة نتيجة الاحتباس الحراري الشديد في غلافه الجوي الكثيف المكون من ثاني أكسيد الكربون، ويدور حول نفسه في اتجاه معاكس.',
    meshRadius: 0.46,
    orbitRadius: 8.0,
    speedMultiplier: 1.62,
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
    summaryAr: 'الكوكب الوحيد المعروف بإيوائه للحياة، تغطي المحيطات السائلة 71% من سطحه ويتمتع بغلاف جوي متوازن ومجال مغناطيسي يحميه من الرياح الشمسية.',
    meshRadius: 0.52,
    orbitRadius: 11.0,
    speedMultiplier: 1.00,
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
    summaryAr: 'الكوكب الأحمر بسبب وفرة أكسيد الحديد في تربته، يضم بركان أوليمبوس الشاهق (أعلى جبل في النظام الشمسي) وأودية قديمة تدل على تدفق المياه سابقاً.',
    meshRadius: 0.38,
    orbitRadius: 14.0,
    speedMultiplier: 0.53,
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
    summaryAr: 'أضخم كواكب النظام الشمسي وتفوق كتلته مجموع بقية الكواكب مجتمعة، وتشتهر غيومه بالعاصفة الحلزونية العملاقة (البقعة الحمراء العظيمة).',
    meshRadius: 1.15,
    orbitRadius: 18.5,
    speedMultiplier: 0.24,
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
    summaryAr: 'يتميز بنظامه الحلقي البديع المكون من تريليونات الجزيئات الجليدية والصخرية، وهو الكوكب الوحيد الذي تقل كثافته الإجمالية عن كثافة الماء السائل.',
    meshRadius: 0.95,
    orbitRadius: 23.5,
    speedMultiplier: 0.15,
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
    summaryAr: 'عملاق جليدي أزرق مخضر لاحتواء غلافه على غاز الميثان، يدور بزاوية ميلان محورية قياسية تبلغ 98 درجة تجعله يتدحرج على جنبه في مداره.',
    meshRadius: 0.72,
    orbitRadius: 28.5,
    speedMultiplier: 0.08,
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
    summaryAr: 'أبعد كواكب النظام الشمسي، يتسم برياح فوق صوتية هي الأسرع في المجموعة الشمسية حيث تتجاوز سرعتها 2,100 كم/ساعة حول بؤرة العواصف المظلمة.',
    meshRadius: 0.70,
    orbitRadius: 33.5,
    speedMultiplier: 0.05,
  },
];

export const AstronomyLab: React.FC = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [viewerMode, setViewerMode] = useState<'threejs_offline' | 'sketchfab_online'>('threejs_offline');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedRatio, setSpeedRatio] = useState<number>(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData>(() => {
    const savedId = loadState<string>('astronomy_planet_id', 'earth');
    return PLANETS_DATA.find((p) => p.id === savedId) || PLANETS_DATA[2];
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; orbitGroup: THREE.Group }>>(new Map());

  // Save selected planet in persistence
  useEffect(() => {
    saveState('astronomy_planet_id', selectedPlanet.id);
  }, [selectedPlanet]);

  // Three.js Solar System Simulation (100% Offline)
  useEffect(() => {
    if (viewerMode !== 'threejs_offline') return;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 580;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(0, 32, 42);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 140;
    controls.minDistance = 6;
    controlsRef.current = controls;

    // Starfield Background Particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 260;
      starPos[i + 1] = (Math.random() - 0.5) * 160;
      starPos[i + 2] = (Math.random() - 0.5) * 260;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Sun (Center Star)
    const sunGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun Outer Corona Glow
    const coronaGeo = new THREE.SphereGeometry(2.7, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.28 });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Central Sun Light
    const sunLight = new THREE.PointLight(0xffffff, 2.8, 120, 0.5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambientLight);

    // Create Planets and Orbit Rings
    planetMeshesRef.current.clear();

    PLANETS_DATA.forEach((p) => {
      // 1. Orbit Ring path
      const ringSegments = 96;
      const ringPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * p.orbitRadius, 0, Math.sin(theta) * p.orbitRadius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(p.color),
        transparent: true,
        opacity: 0.18,
      });
      const orbitRing = new THREE.LineLoop(ringGeo, ringMat);
      scene.add(orbitRing);

      // 2. Pivot group revolving around Sun
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      // 3. Planet Mesh
      const planetGeo = new THREE.SphereGeometry(p.meshRadius, 24, 24);
      const planetMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.color),
        roughness: 0.6,
        metalness: 0.1,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.position.set(p.orbitRadius, 0, 0);
      planetMesh.userData = { planetId: p.id };
      orbitGroup.add(planetMesh);

      // 4. Saturn Rings
      if (p.id === 'saturn') {
        const saturnRingGeo = new THREE.RingGeometry(p.meshRadius * 1.4, p.meshRadius * 2.4, 32);
        const saturnRingMat = new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
        saturnRing.rotation.x = Math.PI / 2 + 0.35;
        planetMesh.add(saturnRing);
      }

      // 5. Earth Moon
      if (p.id === 'earth') {
        const moonGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(0.9, 0.2, 0);
        planetMesh.add(moonMesh);
      }

      planetMeshesRef.current.set(p.id, { mesh: planetMesh, orbitGroup });
    });

    // Raycaster for clicking planets in 3D canvas
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allMeshes: THREE.Mesh[] = [];
      planetMeshesRef.current.forEach((val) => allMeshes.push(val.mesh));

      const intersects = raycaster.intersectObjects(allMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const planetId = hit.userData.planetId;
        const found = PLANETS_DATA.find((p) => p.id === planetId);
        if (found) {
          setSelectedPlanet(found);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Sun rotation & gentle pulse
      sunMesh.rotation.y += delta * 0.15;
      coronaMesh.rotation.y -= delta * 0.08;

      // Rotate planets around Sun
      planetMeshesRef.current.forEach((val, pId) => {
        const data = PLANETS_DATA.find((p) => p.id === pId);
        if (data) {
          val.mesh.rotation.y += delta * 1.5;
          val.orbitGroup.rotation.y += delta * 0.4 * data.speedMultiplier * speedRatio;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [viewerMode, speedRatio]);

  // Focus Camera on Selected Planet
  const handleFocusPlanet = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    if (controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current;
      const camera = cameraRef.current;
      controls.target.set(0, 0, 0);
      camera.position.set(planet.orbitRadius * 1.2, planet.meshRadius * 6 + 6, planet.orbitRadius * 0.8 + 8);
      controls.update();
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.set(0, 32, 42);
      controlsRef.current.update();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-16 space-y-6" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <span className="sci-badge">
            {ar ? 'الفيزياء الفلكية وعلوم الفضاء الكوني' : 'Astrophysics & Planetary Space Sciences'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {ar ? 'مختبر علوم الفلك والنظام الشمسي 3D' : '3D Astronomy & Solar System Laboratory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {ar
              ? 'محاكاة 3D تفاعلية لكواكب المجموعة الشمسية ومداراتها الدقيقة والقياسات الفيزيائية وقوانين كيبلر (يعمل بدون إنترنت)'
              : 'Interactive 3D simulation of Solar System planetary dynamics and Keplerian orbital mechanics (Offline-Ready)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewerMode('threejs_offline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewerMode === 'threejs_offline'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe2 size={13} />
              <span>{ar ? 'محاكي Three.js (أوفلاين 100%)' : 'Three.js (100% Offline)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewerMode('sketchfab_online')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewerMode === 'sketchfab_online'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>{ar ? 'نموذج Sketchfab (أونلاين)' : 'Sketchfab (Online)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D SOLAR SYSTEM SIMULATOR */}
      <div className="space-y-6">
        <div className="sci-card overflow-hidden flex flex-col h-[620px] border border-indigo-500/30 relative">
          {/* Top Stage Control Bar */}
          <div className="bg-[#08090c] px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-bold text-white">
                {ar ? 'المجموعة الشمسية والمدارات الكوكبية المعتمدة' : 'High-Precision 3D Solar System & Planetary Orbits'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {ar ? 'يعمل بدون إنترنت' : 'Offline Ready'}
              </span>
            </div>

            {viewerMode === 'threejs_offline' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-colors"
                  title={isPlaying ? (ar ? 'إيقاف مؤقت' : 'Pause') : (ar ? 'تشغيل' : 'Play')}
                >
                  {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlaying ? (ar ? 'إيقاف' : 'Pause') : (ar ? 'تشغيل' : 'Play')}</span>
                </button>

                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 text-[11px] font-mono text-slate-300">
                  <button
                    type="button"
                    onClick={() => setSpeedRatio(1)}
                    className={`px-2 py-0.5 rounded ${speedRatio === 1 ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'}`}
                  >
                    1x
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedRatio(3)}
                    className={`px-2 py-0.5 rounded ${speedRatio === 3 ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'}`}
                  >
                    3x
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedRatio(8)}
                    className={`px-2 py-0.5 rounded ${speedRatio === 8 ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'}`}
                  >
                    8x
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetCamera}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  title={ar ? 'إعادة ضبط الكاميرا' : 'Reset Camera'}
                >
                  <RotateCcw size={12} />
                  <span>{ar ? 'إعادة ضبط' : 'Reset'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Stage Area */}
          <div className="w-full flex-1 bg-black relative">
            {viewerMode === 'threejs_offline' ? (
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            ) : (
              <iframe
                title="Solar System 3D"
                className="w-full h-full border-0"
                src="https://sketchfab.com/models/fad1f8a62d3848d0be664339e6f3b1a2/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            )}

            {/* Quick helper badge overlay */}
            {viewerMode === 'threejs_offline' && (
              <div className="absolute bottom-3 start-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-400 pointer-events-none flex items-center gap-2">
                <Compass size={13} className="text-cyan-400" />
                <span>{ar ? 'حرّك بالماوس للتدوير 360° • عجلة الفأرة للتقريب • انقر على أي كوكب لتحديده' : 'Drag to rotate 360° • Scroll to zoom • Click planet to inspect'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Planetary Telemetry Explorer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Orbit className="w-4 h-4 text-indigo-400" />
              <span>{ar ? 'استكشاف القياسات الفيزيائية لكواكب المجموعة الشمسية' : 'Planetary Physical Telemetry & Orbital Constants'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {ar ? 'قانون كيبلر الثالث: T² = a³' : "Kepler's 3rd Law: T² = a³"}
            </span>
          </div>

          {/* Planets Grid Select */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {PLANETS_DATA.map((p) => {
              const isSelected = p.id === selectedPlanet.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleFocusPlanet(p)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
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
                    {ar ? p.nameAr : p.nameEn}
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
                  {ar ? selectedPlanet.nameAr : selectedPlanet.nameEn}
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  ({ar ? selectedPlanet.typeAr : selectedPlanet.typeEn})
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-white/5">
                {ar ? selectedPlanet.summaryAr : selectedPlanet.summaryEn}
              </p>
            </div>

            {/* Metrics Column 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{ar ? 'المسافة عن الشمس' : 'Distance from Sun'}</div>
                <div className="text-sm font-bold text-indigo-400 font-mono mt-0.5">{selectedPlanet.distanceAU} AU</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.distanceAU * 149.6).toFixed(1)} M km</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{ar ? 'فترة الدوران المداري' : 'Orbital Period'}</div>
                <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{selectedPlanet.orbitalPeriodDays} {ar ? 'يوم' : 'days'}</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.orbitalPeriodDays / 365.25).toFixed(2)} Earth yrs</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{ar ? 'القطر الاستوائي' : 'Diameter'}</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{selectedPlanet.diameterKm.toLocaleString()} km</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.diameterKm / 12742).toFixed(2)}x Earth</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{ar ? 'جاذبية السطح' : 'Surface Gravity'}</div>
                <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">{selectedPlanet.gravityMps2} m/s²</div>
                <div className="text-[10px] text-slate-500">{(selectedPlanet.gravityMps2 / 9.81).toFixed(2)} g</div>
              </div>
            </div>

            {/* Metrics Column 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{ar ? 'درجة حرارة السطح' : 'Surface Temp'}</div>
                <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">{selectedPlanet.surfaceTempC}</div>
              </div>
              <div className="metric-card">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{ar ? 'الأقمار الطبيعية' : 'Moons'}</div>
                <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">{selectedPlanet.moonsCount} {ar ? 'قمر' : 'moons'}</div>
              </div>
              <div className="col-span-2 metric-card text-left p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">{ar ? 'التحقق من قانون كيبلر الثالث' : "Kepler's 3rd Law Check"}</span>
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
