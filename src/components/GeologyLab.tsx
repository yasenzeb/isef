import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { calculateTsunamiSpeed, calculateSeismicTravelTimes, calculateEarthquakeEnergyJoules } from '../simulators/geophysicsSolver';
import { Globe2, AlertTriangle, Waves, Award, Building2, Play, Pause, Layers } from 'lucide-react';
import { GeologyModelViewer, getBuildingThreshold } from './GeologyModelViewer';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { saveState, loadState } from '../utils/persistence';

// Procedural Earth surface texture generator with continents, oceans, and polar ice (zero external photo download)
function generateProceduralEarthCrustTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Oceanic Blue gradient base
  const oceanGrd = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrd.addColorStop(0, '#0c4a6e');
  oceanGrd.addColorStop(0.5, '#0284c7');
  oceanGrd.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = oceanGrd;
  ctx.fillRect(0, 0, width, height);

  // 2. Continents: Eurasia, Africa, Americas, Australia
  // Eurasia
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(width * 0.58, height * 0.38, 130, 75, 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Africa & Arabia (Sahara/Savanna tones)
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(width * 0.52, height * 0.55, 60, 80, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // North America
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.ellipse(width * 0.25, height * 0.34, 75, 60, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // South America
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(width * 0.31, height * 0.65, 50, 75, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.fillStyle = '#c2410c';
  ctx.beginPath();
  ctx.ellipse(width * 0.82, height * 0.70, 45, 35, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Polar Ice Caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height * 0.08);
  ctx.fillRect(0, height * 0.92, width, height * 0.08);

  // Atmospheric cloud swirls
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  for (let s = 0; s < 12; s++) {
    ctx.beginPath();
    ctx.ellipse(
      (s * 90 + 30) % width,
      height * (0.2 + (s % 5) * 0.15),
      40 + (s * 7) % 30,
      12 + (s * 3) % 10,
      0.3 * (s % 2 === 0 ? 1 : -1),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}


// Available 3D Building models with realistic structural engineering ratings
const GEOLOGY_MODELS = [
  { 
    id: 'abandoned',
    label: 'Abandoned Masonry Building', 
    labelAr: 'مبنى قديم غير مسلح', 
    url: '/models/geology/abandoned_building.glb', 
    type: 'unreinforced',
    threshold: 3.8,
    waveThresholdM: 3.2,
    descAr: 'هيكل حجري متآكل بدون تسليح - ينهار عند أدنى هزات أرضية أو اندفاع مائي مباشر (3.8+ ريختر)',
    descEn: 'Unreinforced deteriorating masonry. Collapses at low seismic intensity or water surge (3.8+).'
  },
  { 
    id: 'construction',
    label: 'Reinforced Construction Site', 
    labelAr: 'هيكل خرساني تحت الإنشاء', 
    url: '/models/geology/construction_site.glb', 
    type: 'construction',
    threshold: 6.2,
    waveThresholdM: 5.8,
    descAr: 'أعمدة وسقالات خرسانية مسلحة بدون جدران قص داعمة - تفشل عند زلازل متوسطة الشدة (6.2+ ريختر)',
    descEn: 'Reinforced concrete frame under construction. Fails at moderate ground tremor (6.2+).'
  },
  { 
    id: 'highrise',
    label: 'Engineered Tower with Base Isolators', 
    labelAr: 'برج هندسي ممتص للزلازل', 
    url: '/models/geology/tall_building.glb', 
    type: 'highrise',
    threshold: 8.8,
    waveThresholdM: 9.0,
    descAr: 'برج متطور بأوتاد عميقة ومخمدات كتلة وعوازل زلزالية - يقاوم أعتى الزلازل وأمواج التسونامي العاتية (8.8+ ريختر)',
    descEn: 'Engineered highrise with deep piles & tuned mass dampers. Withstands up to 8.8 Richter.'
  },
];

interface EarthLayer {
  id: string;
  nameEn: string;
  nameAr: string;
  radiusKm: number;
  depthKm: string;
  tempC: string;
  pressureGPa: string;
  densityGcm3: string;
  compositionEn: string;
  compositionAr: string;
  stateEn: string;
  stateAr: string;
  colorHex: number;
}

const EARTH_LAYERS_3D: EarthLayer[] = [
  {
    id: 'inner_core',
    nameEn: 'Inner Core (Solid Iron-Nickel)',
    nameAr: 'اللب الداخلي (حديد ونيكل صلب متبلور)',
    radiusKm: 1220,
    depthKm: '5,150 - 6,371 km',
    tempC: '5,400 - 6,000 °C',
    pressureGPa: '330 - 360 GPa',
    densityGcm3: '12.8 - 13.1 g/cm³',
    compositionEn: 'Crystalline nickel-iron alloy under immense pressure.',
    compositionAr: 'سبيكة صلبة من الحديد والنيكل متبلورة تحت ضغط يعادل 3.5 مليون ضغط جوي.',
    stateEn: 'Solid crystal (Discovered by Inge Lehmann, 1936)',
    stateAr: 'صلب متبلور نتيجة الضغط الهائل (اكتشفته إنجي ليمان 1936)',
    colorHex: 0xfef08a,
  },
  {
    id: 'outer_core',
    nameEn: 'Outer Core (Liquid Magma Dynamo)',
    nameAr: 'اللب الخارجي (مصهور سائل يولد المغناطيسية)',
    radiusKm: 3480,
    depthKm: '2,890 - 5,150 km',
    tempC: '4,000 - 5,000 °C',
    pressureGPa: '135 - 330 GPa',
    densityGcm3: '9.9 - 12.2 g/cm³',
    compositionEn: 'Molten iron (85%), nickel (10%), and light elements (S, O).',
    compositionAr: 'حديد مصهور ونيكل في حالة سائلة يتدفق حرارياً لتوليد المجال المغناطيسي للأرض.',
    stateEn: 'Vigorously convecting liquid metal (Geodynamo)',
    stateAr: 'سائل معدني متحرك بالحث الحراري (الدينامو الجيولوجي)',
    colorHex: 0xf97316,
  },
  {
    id: 'mantle',
    nameEn: 'Mantle (Viscous Convective Silicates)',
    nameAr: 'الوشاح (سيليكات لدنة وحمل حراري)',
    radiusKm: 6300,
    depthKm: '35 - 2,890 km',
    tempC: '1,000 - 3,700 °C',
    pressureGPa: '1.4 - 135 GPa',
    densityGcm3: '3.4 - 5.6 g/cm³',
    compositionEn: 'Peridotite, magnesium-iron silicates, and bridgmanite.',
    compositionAr: 'صخور البيريدوتيت وسيليكات الماغنسيوم والحديد التي تدفع حركة الصفائح التكتونية.',
    stateEn: 'Viscous solid undergoing slow mantle convection',
    stateAr: 'صلب لدن يتحرك ببطء عبر تيارات الحمل الحراري ليدير الصفائح',
    colorHex: 0xd97706,
  },
  {
    id: 'crust',
    nameEn: 'Crust & Lithosphere',
    nameAr: 'القشرة الأرضية والغلاف الصخري',
    radiusKm: 6371,
    depthKm: '0 - 70 km',
    tempC: '0 - 400 °C',
    pressureGPa: '0 - 1.4 GPa',
    densityGcm3: '2.7 - 3.0 g/cm³',
    compositionEn: 'Granite (continental) and basalt (oceanic), alumino-silicates.',
    compositionAr: 'صخور الجرانيت القارية والبازلت المحيطي الغنية بالسيليكا والألومنيوم.',
    stateEn: 'Brittle solid segmented into tectonic plates',
    stateAr: 'غلاف صخري صلب مقسم لصفائح تكتونية تطفو فوق الأثينوسفير',
    colorHex: 0x38bdf8,
  },
];

export const GeologyLab: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'disaster3d' | 'earthCutaway3d' | 'tsunamiShoal3d'>(() => 
    loadState<'disaster3d' | 'earthCutaway3d' | 'tsunamiShoal3d'>('geology_module', 'disaster3d')
  );
  
  // 3D Disaster Simulator State
  const [selectedModelUrl, setSelectedModelUrl] = useState<string>(() =>
    loadState<string>('geology_model_url', GEOLOGY_MODELS[0].url)
  );
  const [disasterType, setDisasterType] = useState<'earthquake' | 'tsunami'>(() =>
    loadState<'earthquake' | 'tsunami'>('geology_disaster_type', 'earthquake')
  );
  const [simIntensity, setSimIntensity] = useState<number>(() =>
    loadState<number>('geology_sim_intensity', 5.5)
  );
  const [isSimRunning, setIsSimRunning] = useState<boolean>(true);
  const [structuralIntegrity, setStructuralIntegrity] = useState<number>(100);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Auto-save state
  useEffect(() => {
    saveState('geology_module', activeModule);
  }, [activeModule]);

  useEffect(() => {
    saveState('geology_model_url', selectedModelUrl);
  }, [selectedModelUrl]);

  useEffect(() => {
    saveState('geology_disaster_type', disasterType);
  }, [disasterType]);

  useEffect(() => {
    saveState('geology_sim_intensity', simIntensity);
  }, [simIntensity]);

  // Selected building configuration
  const currentBuilding = GEOLOGY_MODELS.find(m => m.url === selectedModelUrl) || GEOLOGY_MODELS[0];

  // Viewer intensity (0 when paused)
  const viewerIntensity = isSimRunning ? (simIntensity / 10) : 0;

  // Selected Earth Layer for 3D Cutaway
  const [selectedLayer, setSelectedLayer] = useState<EarthLayer>(EARTH_LAYERS_3D[0]);
  const cutawayCanvasRef = useRef<HTMLDivElement | null>(null);

  // 3D Interactive Earth Cutaway Scene
  useEffect(() => {
    if (activeModule !== 'earthCutaway3d') return;
    const container = cutawayCanvasRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a1a);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 2.5, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.5;
    controls.maxDistance = 15;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sun = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sun.position.set(10, 15, 10);
    scene.add(sun);

    // Earth Layers Group with a 90° Cutaway opening
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Procedural Earth Crust Texture (continents & oceans without external image requests)
    const earthCrustTex = generateProceduralEarthCrustTexture();

    // 1. Inner Core (Solid glowing incandescent sphere of crystalline Fe-Ni)
    const icGeo = new THREE.SphereGeometry(0.7, 48, 48, 0, Math.PI * 1.5);
    const icMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.8,
      side: THREE.DoubleSide
    });
    const icMesh = new THREE.Mesh(icGeo, icMat);
    globeGroup.add(icMesh);

    // 2. Outer Core (Turbulent liquid magma dynamo)
    const ocGeo = new THREE.SphereGeometry(1.25, 48, 48, 0, Math.PI * 1.5);
    const ocMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xc2410c,
      emissiveIntensity: 0.6,
      roughness: 0.35,
      metalness: 0.4,
      side: THREE.DoubleSide
    });
    const ocMesh = new THREE.Mesh(ocGeo, ocMat);
    globeGroup.add(ocMesh);

    // 3. Mantle (Viscous convective silicates with natural striations)
    const mGeo = new THREE.SphereGeometry(1.85, 48, 48, 0, Math.PI * 1.5);
    const mMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      emissiveIntensity: 0.25,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const mMesh = new THREE.Mesh(mGeo, mMat);
    globeGroup.add(mMesh);

    // 4. Crust & Oceanic surface (Procedural continents and oceanic crust)
    const cGeo = new THREE.SphereGeometry(2.1, 64, 64, 0, Math.PI * 1.5);
    const cMat = new THREE.MeshStandardMaterial({
      map: earthCrustTex,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const cMesh = new THREE.Mesh(cGeo, cMat);
    globeGroup.add(cMesh);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.002;
      controls.update();
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
      icGeo.dispose();
      icMat.dispose();
      ocGeo.dispose();
      ocMat.dispose();
      mGeo.dispose();
      mMat.dispose();
      cGeo.dispose();
      cMat.dispose();
      earthCrustTex.dispose();
    };
  }, [activeModule]);

  const lehmann = REAL_SCIENTISTS.find(s => s.id === 'lehmann');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'الجيولوجيا الفيزيائية وهندسة مقاومة الزلازل والتسونامي' : 'Physical Geology & Structural Disaster Engineering'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {language === 'ar' ? 'مختبر علوم الأرض والزلازل والمنشآت ثلاثي الأبعاد' : '3D Geology, Seismology & Structural Dynamics Lab'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar' 
              ? 'محاكاة 3D حية لانهيار المباني تحت الزلازل والتسونامي، ومقطع باطن الأرض التفاعلي' 
              : 'Interactive 3D building structural collapse under seismic & tsunami forces, and planetary cutaway'}
          </p>
        </div>

        {/* Module Switcher: ONLY 3D Interactive Simulations */}
        <div className="flex items-center space-x-2 sci-surface p-1.5">
          <button
            onClick={() => setActiveModule('disaster3d')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeModule === 'disaster3d' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" style={{ color: activeModule === 'disaster3d' ? 'black' : '#f43f5e' }} />
            <span>{language === 'ar' ? 'محاكاة انهيار المباني (الزلازل والتسونامي)' : '3D Building Disaster Simulation'}</span>
          </button>
          <button
            onClick={() => setActiveModule('earthCutaway3d')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeModule === 'earthCutaway3d' ? 'bg-white text-black font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" style={{ color: activeModule === 'earthCutaway3d' ? 'black' : '#818cf8' }} />
            <span>{language === 'ar' ? 'مقطع طبقات الأرض 3D' : '3D Earth Interior Cutaway'}</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: 3D STRUCTURAL COLLAPSE & DISASTER SIMULATOR */}
      {activeModule === 'disaster3d' && (
        <div className="space-y-6">
          
          {/* Top Building Selection Carousel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'ar' ? 'اختر نوع المبنى لاختبار قوة تحمله ومقاومته للانهيار:' : 'Select Structure to Test Seismic & Tsunami Failure Threshold:'}</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-400">
                {language === 'ar' ? 'حد الانهيار موضح لكل مبنى' : 'Collapse threshold calibrated'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {GEOLOGY_MODELS.map((b) => {
                const isSelected = b.url === selectedModelUrl;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedModelUrl(b.url)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-indigo-950/90 to-slate-900 border-indigo-400/80 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">
                        {language === 'ar' ? b.labelAr : b.label}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        b.threshold < 5 ? 'bg-rose-500/20 text-rose-300' : b.threshold < 7 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {b.threshold} R
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {language === 'ar' ? b.descAr : b.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulation Controls Bar */}
          <div className="sci-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              {/* Disaster Mode Switcher */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">
                  {language === 'ar' ? 'نوع الكارثة الطبيعية:' : 'Disaster Phenomenon:'}
                </span>
                <div className="flex items-center space-x-2 sci-surface p-1">
                  <button
                    onClick={() => setDisasterType('earthquake')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      disasterType === 'earthquake' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'زلزال وهزات قص' : 'Earthquake (Shear)'}</span>
                  </button>
                  <button
                    onClick={() => setDisasterType('tsunami')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      disasterType === 'tsunami' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Waves className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'موجة تسونامي هادرة' : 'Tsunami Surge Wave'}</span>
                  </button>
                </div>
              </div>

              {/* Force Intensity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">
                    {disasterType === 'earthquake' 
                      ? (language === 'ar' ? 'قوة الزلزال (مقياس ريختر):' : 'Earthquake Magnitude (Richter):')
                      : (language === 'ar' ? 'ارتفاع وقوة موجة تسونامي:' : 'Tsunami Wave Height & Force:')}
                  </span>
                  <span className={`font-mono font-bold text-sm ${
                    simIntensity > currentBuilding.threshold ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                  }`}>
                    {disasterType === 'earthquake' 
                      ? `${simIntensity.toFixed(1)} Richter` 
                      : `${(simIntensity * 3).toFixed(1)} m wave (${simIntensity.toFixed(1)}/10)`}
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={10.0}
                  step={0.1}
                  value={simIntensity}
                  onChange={(e) => setSimIntensity(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.0 (طفيف)</span>
                  <span className="text-rose-400 font-bold">حد انهيار هذا المبنى: {currentBuilding.threshold}</span>
                  <span>10.0 (كارثي)</span>
                </div>
              </div>

              {/* Play/Pause & Disaster Status */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSimRunning(!isSimRunning)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isSimRunning
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/25'
                  }`}
                >
                  {isSimRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isSimRunning ? (language === 'ar' ? 'إيقاف مؤقت' : 'Pause Simulation') : (language === 'ar' ? 'بدء المحاكاة' : 'Start Simulation')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN 3D DISASTER VIEWER WITH REAL COLLAPSE PHYSICS */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <GeologyModelViewer
                key={selectedModelUrl}
                modelUrl={selectedModelUrl}
                intensity={viewerIntensity}
                disasterType={disasterType}
                onIntegrityChange={(integrity, collapsed) => {
                  setStructuralIntegrity(integrity);
                  setIsCollapsed(collapsed);
                }}
              />
            </div>

            {/* Live Disaster Damage Telemetry Column */}
            <div className="space-y-4">
              <div className="sci-card p-5 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'ar' ? 'التحليل الإنشائي اللحظي' : 'Live Structural Telemetry'}
                </span>

                <h4 className="text-base font-bold text-white">
                  {language === 'ar' ? currentBuilding.labelAr : currentBuilding.label}
                </h4>

                {/* Collapse Failure Explanation Card */}
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  simIntensity > currentBuilding.threshold
                    ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                    : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                }`}>
                  {simIntensity > currentBuilding.threshold ? (
                    <div>
                      <span className="font-bold block mb-1">
                        ⚠️ {language === 'ar' ? 'القوة تجاوزت حد المقاومة:' : 'Threshold Exceeded - Failure Mode:'}
                      </span>
                      <span>
                        {disasterType === 'earthquake'
                          ? (language === 'ar' 
                              ? `قوة الزلزال (${simIntensity.toFixed(1)}) تجاوزت قدرة تحمل هذا المبنى (${currentBuilding.threshold}). تنهار القواعد الخرسانية وتتصدع الأعمدة وينهار المبنى بالكامل!`
                              : `Seismic intensity (${simIntensity.toFixed(1)}) exceeded resistance limit (${currentBuilding.threshold}). Foundation buckles causing total structural collapse!`)
                          : (language === 'ar'
                              ? `موجة التسونامي (${(simIntensity * 3).toFixed(1)} م) اجتاحت المبنى بقوة هيدروديناميكية جارفة تخطت قدرة تحمله (${currentBuilding.threshold}). يتم جرف المبنى وسقوطه في مياه الفيضان!`
                              : `Tsunami surge wave (${(simIntensity * 3).toFixed(1)}m) produced hydrodynamic drag exceeding threshold (${currentBuilding.threshold}). Building collapses and washes away!`)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold block mb-1">
                        ✓ {language === 'ar' ? 'المبنى متماسك وقائم:' : 'Structure Resilient & Standing:'}
                      </span>
                      <span>
                        {language === 'ar'
                          ? `القوة المؤثرة (${simIntensity.toFixed(1)}) ما زالت أقل من حد الانهيار (${currentBuilding.threshold}). المبنى يهتز ولكنه متماسك ولم يسقط.`
                          : `Applied force (${simIntensity.toFixed(1)}) is within tolerance limit (${currentBuilding.threshold}). Building vibrates but remains standing.`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Energy & Physics Numbers */}
                <div className="space-y-2 pt-1 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">{language === 'ar' ? 'حد الانهيار الحرج' : 'Failure Threshold'}</span>
                    <span className="text-rose-400 font-bold">{currentBuilding.threshold} Richter</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">{language === 'ar' ? 'طاقة الزلزال التقديرية' : 'Earthquake Energy'}</span>
                    <span className="text-indigo-300 font-bold">
                      {(calculateEarthquakeEnergyJoules(simIntensity)).toExponential(2)} J
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">{language === 'ar' ? 'سرعة موجة تسونامي' : 'Wave Velocity'}</span>
                    <span className="text-cyan-300 font-bold">
                      {(calculateTsunamiSpeed(4000).speedKmh * (simIntensity / 10)).toFixed(0)} km/h
                    </span>
                  </div>
                </div>
              </div>

              {/* Educational Comparison Guide */}
              <div className="sci-card p-4 space-y-2.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {language === 'ar' ? '📊 جدول مقارنة مقاومة المباني' : '📊 Comparative Failure Matrix'}
                </span>
                <div className="space-y-1.5 text-[11px]">
                  {GEOLOGY_MODELS.map(m => (
                    <div key={m.id} className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-300 truncate max-w-[130px]">
                        {language === 'ar' ? m.labelAr : m.label}
                      </span>
                      <span className="font-mono font-bold text-rose-400">{m.threshold} R</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: 3D EARTH PLANETARY CUTAWAY */}
      {activeModule === 'earthCutaway3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card overflow-hidden flex flex-col h-[560px] border border-indigo-500/30">
            <div className="bg-[#08090c] px-5 py-3 border-b border-white/10 flex items-center justify-between z-10">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>{language === 'ar' ? 'المجسم التفاعلي ثلاثي الأبعاد لمقطع طبقات الأرض' : 'Interactive 3D Earth Interior Cutaway'}</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Inge Lehmann 1936 Geophysics Model
              </span>
            </div>

            <div 
              ref={cutawayCanvasRef} 
              className="w-full flex-1 bg-[#050a1a] cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            />

            {/* Procedural Geological Discontinuity Profile (Zero external photo download) */}
            <div className="bg-[#040714] p-3.5 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'مخطط الانقطاعات الزلزالية والطبقية (Geophysical Discontinuities)' : 'Geophysical Discontinuity Stratigraphy Profile'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">PREM / LEHMANN GEOPHYSICS</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div 
                  onClick={() => setSelectedLayer(EARTH_LAYERS_3D[3])}
                  className="p-1.5 rounded-lg bg-sky-950/60 border border-sky-400/30 cursor-pointer hover:border-sky-400 transition-colors"
                >
                  <span className="text-sky-300 font-bold block">{language === 'ar' ? 'القشرة' : 'Crust'}</span>
                  <span className="text-slate-400 block text-[9px]">0 - 70 km</span>
                  <span className="text-amber-400/80 text-[8px] block mt-0.5">Moho: 35 km</span>
                </div>
                <div 
                  onClick={() => setSelectedLayer(EARTH_LAYERS_3D[2])}
                  className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-400/30 cursor-pointer hover:border-amber-400 transition-colors"
                >
                  <span className="text-amber-300 font-bold block">{language === 'ar' ? 'الوشاح' : 'Mantle'}</span>
                  <span className="text-slate-400 block text-[9px]">70 - 2,890 km</span>
                  <span className="text-amber-400/80 text-[8px] block mt-0.5">Convection</span>
                </div>
                <div 
                  onClick={() => setSelectedLayer(EARTH_LAYERS_3D[1])}
                  className="p-1.5 rounded-lg bg-orange-950/60 border border-orange-400/30 cursor-pointer hover:border-orange-400 transition-colors"
                >
                  <span className="text-orange-300 font-bold block">{language === 'ar' ? 'اللب الخارجي' : 'Outer Core'}</span>
                  <span className="text-slate-400 block text-[9px]">2,890 - 5,150 km</span>
                  <span className="text-rose-400/80 text-[8px] block mt-0.5">Gutenberg Disc.</span>
                </div>
                <div 
                  onClick={() => setSelectedLayer(EARTH_LAYERS_3D[0])}
                  className="p-1.5 rounded-lg bg-yellow-950/60 border border-yellow-300/30 cursor-pointer hover:border-yellow-300 transition-colors"
                >
                  <span className="text-yellow-200 font-bold block">{language === 'ar' ? 'اللب الداخلي' : 'Inner Core'}</span>
                  <span className="text-slate-400 block text-[9px]">5,150 - 6,371 km</span>
                  <span className="text-yellow-400/80 text-[8px] block mt-0.5">Lehmann: 5150 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Layer Selection & Telemetry */}
          <div className="space-y-4">
            <div className="sci-card p-5 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'اختر طبقة لفحص خواصها الفيزيائية' : 'Select Layer to Inspect Geophysics'}
              </span>

              <div className="space-y-2">
                {EARTH_LAYERS_3D.map((layer) => {
                  const isSelected = selectedLayer.id === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-400 text-white shadow'
                          : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {language === 'ar' ? layer.nameAr : layer.nameEn}
                      </span>
                      <span className="text-[10px] font-mono opacity-75">{layer.depthKm}</span>
                    </button>
                  );
                })}
              </div>

              {/* Layer Telemetry Readout */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{language === 'ar' ? 'درجة الحرارة' : 'Temperature'}</span>
                  <span className="font-mono text-rose-400 font-bold">{selectedLayer.tempC}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{language === 'ar' ? 'الضغط الصخري' : 'Lithostatic Pressure'}</span>
                  <span className="font-mono text-indigo-300 font-bold">{selectedLayer.pressureGPa}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">{language === 'ar' ? 'الكثافة النوعية' : 'Density'}</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedLayer.densityGcm3}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-white/5 mt-2">
                  {language === 'ar' ? selectedLayer.compositionAr : selectedLayer.compositionEn}
                </p>
              </div>
            </div>

            {/* Inge Lehmann Card */}
            {lehmann && (
              <div className="sci-card p-4 space-y-2 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'رائدة علم الزلازل الكوكبي' : 'Geophysics Pioneer'}</span>
                </div>
                <span className="text-xs font-bold text-white block">{lehmann.name}</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {language === 'ar' ? lehmann.contributionsAr : lehmann.contributionsEn}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
export default GeologyLab;
