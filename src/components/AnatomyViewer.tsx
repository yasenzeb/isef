import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three-stdlib';
import { DRACOLoader } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { 
  RotateCcw, 
  Search, 
  Eye, 
  EyeOff, 
  Layers,
  Award,
  Activity,
  Heart,
  Brain,
  Bone,
  ShieldCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface AnatomyViewerProps {
  isPresentationMode?: boolean;
}

export type AnatomySystemId = 'skin' | 'skeletal' | 'muscular' | 'cardiovascular' | 'nervous' | 'visceral' | 'joints' | 'lymphatic';

interface SystemLayerConfig {
  id: AnatomySystemId;
  labelEn: string;
  labelAr: string;
  file?: string;
  color: number;
  icon: any;
  defaultVisible: boolean;
  opacity?: number;
}

const SYSTEM_LAYERS: SystemLayerConfig[] = [
  { id: 'skin', labelEn: 'Integumentary (Skin)', labelAr: 'الجلد والشكل الخارجي', color: 0xdfb89a, opacity: 0.28, icon: Layers, defaultVisible: false },
  { id: 'skeletal', labelEn: 'Skeletal System (Bones)', labelAr: 'الهيكل العظمي', file: 'skeletal.glb', color: 0xe2ded4, icon: Bone, defaultVisible: true },
  { id: 'muscular', labelEn: 'Muscular System', labelAr: 'الجهاز العضلي', file: 'muscular.glb', color: 0xc2410c, icon: Activity, defaultVisible: false },
  { id: 'cardiovascular', labelEn: 'Cardiovascular (Heart & Vessels)', labelAr: 'جهاز الدوران والقلب', file: 'cardiovascular.glb', color: 0xdc2626, icon: Heart, defaultVisible: false },
  { id: 'nervous', labelEn: 'Nervous System & Brain', labelAr: 'الجهاز العصبي والدماغ', file: 'nervous.glb', color: 0xeab308, icon: Brain, defaultVisible: false },
  { id: 'visceral', labelEn: 'Visceral Organs', labelAr: 'الأعضاء الحشوية', file: 'visceral.glb', color: 0xa855f7, icon: Layers, defaultVisible: false },
  { id: 'joints', labelEn: 'Articular Ligaments & Joints', labelAr: 'الأربطة والمفاصل', file: 'joints.glb', color: 0x94a3b8, icon: ShieldCheck, defaultVisible: false },
  { id: 'lymphatic', labelEn: 'Lymphatic & Immune Nodes', labelAr: 'الجهاز اللمفاوي', file: 'lymphatic.glb', color: 0x10b981, icon: Sparkles, defaultVisible: false },
];

// Curated authentic translation and clinical physiology dictionary
const ANATOMY_DICTIONARY: Record<string, { ar: string; descEn: string; descAr: string }> = {
  'Femur': {
    ar: 'عظم الفخذ',
    descEn: 'The longest, heaviest, and strongest bone in the human body. Transmits ground reaction forces across the hip and knee joints.',
    descAr: 'أطول وأثقل وأقوى عظم في جسم الإنسان، ينقل ثقل الجسم والأحمال الميكانيكية بين مفصلي الورك والركبة.',
  },
  'Humerus': {
    ar: 'عظم العضد',
    descEn: 'Major long bone of the upper arm, articulating with the glenoid cavity of the scapula and forearm radius/ulna.',
    descAr: 'عظم الذراع الطويل، يتمفصل علوياً مع التجويف الحقاني للوح الكتف، وسفلياً مع عظمي الساعد (الكعبرة والزند).',
  },
  'Tibia': {
    ar: 'عظم الظنبوب (قصبة الساق)',
    descEn: 'Primary weight-bearing bone of the lower leg articulating proximally with the femoral condyles and distally with the talus.',
    descAr: 'العظم الرئيسي الحامل للوزن في الساق، يتمفصل مع لقمات الفخذ علوياً وعظم الكاحل سفلياً.',
  },
  'Fibula': {
    ar: 'عظم الشظية',
    descEn: 'Slender lateral leg bone serving primarily as an attachment site for muscles and stabilizing the lateral ankle joint.',
    descAr: 'عظم الساق الجانبي الرفيع، يعمل كمرتكز هام للعضلات ويثبت الجانب الخارجي لمفصل الكاحل.',
  },
  'Heart': {
    ar: 'القلب',
    descEn: 'Four-chambered muscular organ pumping blood through systemic and pulmonary circulations via coordinated systolic and diastolic cycles.',
    descAr: 'عضو عضلي رباعي الحجرات يضخ الدم عبر الدورة الدموية الكبرى والصغرى عبر الانقباض والانبساط المنظم.',
  },
  'Left ventricle': {
    ar: 'البطين الأيسر',
    descEn: 'Thickest myocardium chamber generating systemic arterial pressure to perfuse oxygenated blood into the aorta.',
    descAr: 'الحجرة العضلية الأكثر سماكة بالقلب، تولد الضغط الشرياني لضخ الدم المؤكسج إلى الشريان الأورطي.',
  },
  'Right ventricle': {
    ar: 'البطين الأيمن',
    descEn: 'Pumps deoxygenated blood through the pulmonary trunk into pulmonary capillaries for alveolar gas exchange.',
    descAr: 'يضخ الدم غير المؤكسج عبر الجذع الرئوي إلى الشعيرات الدموية الرئوية لتبادل الغازات.',
  },
  'Aorta': {
    ar: 'الشريان الأبهر (الأورطي)',
    descEn: 'Largest systemic artery distributing oxygenated blood from the left ventricle throughout the body.',
    descAr: 'أكبر شريان في الجسم، يوزع الدم المؤكسج الصادر من البطين الأيسر إلى جميع أنحاء الجسم.',
  },
  'Brain': {
    ar: 'الدماغ (المخ)',
    descEn: 'Central organ of the nervous system, containing ~86 billion neurons orchestrating cognitive, motor, and autonomic homeostasis.',
    descAr: 'العضو المركزي للجهاز العصبي، يحتوي على ~86 مليار خلية عصبية تنظم العمليات المعرفية والحركية والاتزان الداخلي.',
  },
  'Liver': {
    ar: 'الكبد',
    descEn: 'Largest visceral metabolic organ responsible for glycogen storage, plasma protein synthesis, and detoxification of metabolites.',
    descAr: 'أكبر عضو حشوي استقلابي بالجسم، مسؤول عن تخزين الجليكوجين وتخليق بروتينات البلازما وتنقية السموم وإنتاج الصفراء.',
  },
  'Kidney': {
    ar: 'الكلية',
    descEn: 'Renal organ maintaining electrolyte balance, blood pressure (renin-angiotensin), and filtering nitrogenous wastes into urine.',
    descAr: 'عضو الإخراج والترشيح الكلوي، يحافظ على توازن الكهارل والضغط الاسموزي وضغط الدم ويطرح الفضلات النيتروجينية.',
  },
  'Lungs': {
    ar: 'الرئتان',
    descEn: 'Primary respiratory organs facilitating oxygen uptake into erythrocytes and carbon dioxide diffusion across alveolar-capillary membranes.',
    descAr: 'العضوان الرئيسيان للتنفس، يقومان بتبادل الأكسجين وثاني أكسيد الكربون عبر الأغشية السنخية الشعرية.',
  },
  'Stomach': {
    ar: 'المعدة',
    descEn: 'Muscular J-shaped digestive organ secreting gastric acid (HCl) and pepsinogen for initial protein breakdown.',
    descAr: 'عضو عضلي هضمي يفرز حمض الهيدروكلوريك وإنزيم الببسين لتفكيك البروتينات كيميائياً وتحويل الطعام إلى كيموس.',
  },
};

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({ isPresentationMode = false }) => {
  const { t, language } = useLanguage();
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Loading & Visibility states
  const [loadingSystems, setLoadingSystems] = useState<Record<string, boolean>>({ skeletal: true });
  const [loadedSystems, setLoadedSystems] = useState<Record<string, boolean>>({});
  const [visibleSystems, setVisibleSystems] = useState<Record<string, boolean>>({ skeletal: true, skin: false });
  const [skinOpacity, setSkinOpacity] = useState(0.28);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const systemGroups = useRef<Map<AnatomySystemId, THREE.Group>>(new Map());
  const skinMeshRef = useRef<THREE.Mesh | null>(null);
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material>>(new Map());
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);

  // Search & Inspection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStructure, setSelectedStructure] = useState<{
    nameEn: string;
    nameAr: string;
    system: string;
    descEn: string;
    descAr: string;
    region?: string;
  }>({
    nameEn: 'Femur (Thigh Bone)',
    nameAr: 'عظم الفخذ',
    system: 'Skeletal System (الهيكل العظمي)',
    descEn: 'The longest, heaviest, and strongest bone in the human skeleton. Supports high mechanical compressive loads.',
    descAr: 'أطول وأثقل وأقوى عظم في الهيكل العظمي البشري، ينقل ثقل الجسم من الحوض إلى عظم الساق.',
    region: 'Lower Extremity (الطرف السفلي)',
  });

  const [isIsolated, setIsIsolated] = useState(false);
  const vesalius = REAL_SCIENTISTS.find(s => s.id === 'vesalius');

  // Load a specific anatomical system layer
  const loadSystemLayer = (sysConfig: SystemLayerConfig, scene: THREE.Scene) => {
    if (sysConfig.id === 'skin') return; // Handled programmatically
    if (loadedSystems[sysConfig.id] || systemGroups.current.has(sysConfig.id)) return;

    setLoadingSystems(prev => ({ ...prev, [sysConfig.id]: true }));
    const loader = new GLTFLoader();
    if (dracoLoaderRef.current) loader.setDRACOLoader(dracoLoaderRef.current);

    loader.load(
      `/models/anatomy/${sysConfig.file}`,
      (gltf) => {
        const root = gltf.scene;
        root.name = sysConfig.id;

        const defaultMat = new THREE.MeshStandardMaterial({
          color: sysConfig.color,
          roughness: 0.45,
          metalness: 0.05,
        });

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            originalMaterials.current.set(mesh, defaultMat.clone());
            mesh.material = defaultMat.clone();
            mesh.userData = {
              systemId: sysConfig.id,
              systemName: sysConfig.labelEn,
              rawName: mesh.name || sysConfig.labelEn,
            };
          }
        });

        // Consistent reference alignment
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        root.position.x -= center.x;
        root.position.y -= center.y - (size.y / 2);
        root.position.z -= center.z;

        root.visible = !!visibleSystems[sysConfig.id];

        scene.add(root);
        systemGroups.current.set(sysConfig.id, root);
        setLoadedSystems(prev => ({ ...prev, [sysConfig.id]: true }));
        setLoadingSystems(prev => ({ ...prev, [sysConfig.id]: false }));
      },
      undefined,
      (err) => {
        console.error(`Failed to load ${sysConfig.file}:`, err);
        setLoadingSystems(prev => ({ ...prev, [sysConfig.id]: false }));
      }
    );
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 650;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controlsRef.current = controls;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // DRACO Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoaderRef.current = dracoLoader;

    // Create Semi-Transparent Outer Human Skin Geometry
    const skinGeo = new THREE.CapsuleGeometry(0.35, 1.2, 16, 32);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdfb89a,
      transparent: true,
      opacity: skinOpacity,
      roughness: 0.3,
      side: THREE.DoubleSide,
    });
    const skinMesh = new THREE.Mesh(skinGeo, skinMat);
    skinMesh.position.set(0, 1.0, 0);
    skinMesh.visible = !!visibleSystems['skin'];
    skinMeshRef.current = skinMesh;
    scene.add(skinMesh);

    // Initial load: Skeletal layer
    loadSystemLayer(SYSTEM_LAYERS[1], scene);

    // Click raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const visibleMeshes: THREE.Mesh[] = [];
      systemGroups.current.forEach((grp) => {
        if (grp.visible) {
          grp.traverse((c) => {
            if ((c as THREE.Mesh).isMesh && c.visible) visibleMeshes.push(c as THREE.Mesh);
          });
        }
      });

      const intersects = raycaster.intersectObjects(visibleMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;

        if (selectedMeshRef.current) {
          const prevMat = originalMaterials.current.get(selectedMeshRef.current);
          if (prevMat) selectedMeshRef.current.material = prevMat.clone();
        }

        selectedMeshRef.current = hit;
        hit.material = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
          roughness: 0.25,
        });

        const rawName = hit.name.replace(/^ZA:/, '').replace(/\.(l|r)$/i, (m, side) => ` (${side.toUpperCase() === 'L' ? 'Left' : 'Right'})`);
        const sysId = (hit.userData.systemId || 'skeletal') as AnatomySystemId;
        const sysConfig = SYSTEM_LAYERS.find(s => s.id === sysId) || SYSTEM_LAYERS[1];

        // Match against dictionary
        let matchedDict = Object.entries(ANATOMY_DICTIONARY).find(([k]) => rawName.toLowerCase().includes(k.toLowerCase()));
        const nameAr = matchedDict ? matchedDict[1].ar : sysConfig.labelAr;
        const descEn = matchedDict ? matchedDict[1].descEn : `Identified authentic anatomical specimen of the ${sysConfig.labelEn}.`;
        const descAr = matchedDict ? matchedDict[1].descAr : `بِنية تشريحية حقيقية وموثقة تتبع ${sysConfig.labelAr}.`;

        setSelectedStructure({
          nameEn: rawName || sysConfig.labelEn,
          nameAr: nameAr,
          system: `${sysConfig.labelEn} — ${sysConfig.labelAr}`,
          descEn: descEn,
          descAr: descAr,
          region: hit.position.y > 1.3 ? 'Cranial / Head & Neck (الرأس والعنق)' : hit.position.y > 0.7 ? 'Thorax & Trunk (الصدر والجذع)' : 'Lower Extremities (الأطراف السفلية)',
        });
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 650;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
      dracoLoader.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update skin opacity dynamically
  useEffect(() => {
    if (skinMeshRef.current) {
      (skinMeshRef.current.material as THREE.MeshStandardMaterial).opacity = skinOpacity;
    }
  }, [skinOpacity]);

  // Toggle visibility and lazy load system layers
  const toggleSystem = (sys: SystemLayerConfig) => {
    const isNowVisible = !visibleSystems[sys.id];
    setVisibleSystems(prev => ({ ...prev, [sys.id]: isNowVisible }));

    if (sys.id === 'skin') {
      if (skinMeshRef.current) skinMeshRef.current.visible = isNowVisible;
      return;
    }

    const grp = systemGroups.current.get(sys.id);
    if (grp) {
      grp.visible = isNowVisible;
    } else if (isNowVisible && sceneRef.current) {
      loadSystemLayer(sys, sceneRef.current);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.2, 2.5);
      controlsRef.current.target.set(0, 1.0, 0);
      controlsRef.current.update();
    }
  };

  const toggleIsolate = () => {
    if (!selectedMeshRef.current) return;
    const newIsolate = !isIsolated;
    setIsIsolated(newIsolate);

    systemGroups.current.forEach((grp) => {
      grp.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const mesh = c as THREE.Mesh;
          if (newIsolate) {
            mesh.visible = mesh === selectedMeshRef.current;
          } else {
            const sysId = mesh.userData.systemId as AnatomySystemId;
            mesh.visible = !!visibleSystems[sysId];
          }
        }
      });
    });
  };

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'p-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'}`}>
      
      {/* Header Bar */}
      {!isPresentationMode && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sky-500/15 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="sci-badge">
                {language === 'ar' ? 'مختبر التشريح البشري التفاعلي المتكامل' : 'Multi-System Human Anatomy Lab'}
              </span>
              <span className="text-xs text-slate-400">8 Layers: Skin, Skeleton, Muscles, Vessels, Nerves, Viscera</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {language === 'ar' ? 'التشريح البشري ثلاثي الأبعاد وعلم وظائف الأعضاء' : 'Interactive Human Anatomy & Physiology Laboratory'}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetCamera}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold sci-surface hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.anatomy.resetCamera}</span>
            </button>
            <button
              onClick={toggleIsolate}
              disabled={!selectedMeshRef.current}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isIsolated ? 'bg-sky-600 text-white' : 'sci-surface text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isIsolated ? t.anatomy.showAll : t.anatomy.isolate}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 3D Canvas Viewport (Takes 3 columns) */}
        <div className="lg:col-span-3 sci-card overflow-hidden relative flex flex-col h-[700px]">
          
          {/* Top Layer Toggles Toolbar */}
          <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-b border-sky-500/15 flex items-center overflow-x-auto gap-2 z-10 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center space-x-1 mr-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'ar' ? 'الطبقات التشريحية:' : 'Anatomical Systems:'}</span>
            </span>

            {SYSTEM_LAYERS.map((sys) => {
              const Icon = sys.icon;
              const isVis = !!visibleSystems[sys.id];
              const isLoad = !!loadingSystems[sys.id];
              return (
                <button
                  key={sys.id}
                  onClick={() => toggleSystem(sys)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isVis
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? sys.labelAr : sys.labelEn}</span>
                  {isLoad && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Skin Translucency Slider (Visible when skin is active) */}
          {visibleSystems['skin'] && (
            <div className="bg-slate-950/80 px-4 py-1.5 border-b border-sky-500/15 flex items-center justify-between text-xs text-slate-300 z-10">
              <span className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>{language === 'ar' ? 'شفافية الجلد الخارجي (Skin Translucency):' : 'Skin Translucency:'}</span>
              </span>
              <div className="flex items-center space-x-3 w-48">
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={skinOpacity}
                  onChange={(e) => setSkinOpacity(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <span className="font-mono text-sky-400 font-bold">{(skinOpacity * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* Canvas Mount */}
          <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

          {/* Callout Indicator HUD */}
          <div className="absolute top-16 right-4 z-10 sci-card p-3 max-w-xs border border-sky-500/30">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                {language === 'ar' ? 'المؤشر التشريحي النشط' : 'Active Specimen Pin'}
              </span>
            </div>
            <span className="text-xs font-bold text-white block">
              {language === 'ar' ? selectedStructure?.nameAr : selectedStructure?.nameEn}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {selectedStructure?.region}
            </span>
          </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-sky-500/15 text-xs text-slate-300 flex items-center space-x-3">
            <span>🖱️ {language === 'ar' ? 'انقر على أي عظم أو عضو للاختيار والفحص' : 'Click any bone/organ to inspect'}</span>
            <span className="text-slate-600">•</span>
            <span>{language === 'ar' ? 'اسحب للتدوير 360°' : 'Drag to rotate 360°'}</span>
          </div>
        </div>

        {/* Specimen Inspector & Scientific Pioneer (1 column) */}
        <div className="space-y-6">
          <div className="sci-card p-5 space-y-4">
            <div className="border-b border-sky-500/15 pb-3">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">
                {language === 'ar' ? 'فحص البنية التشريحية' : 'Specimen Inspection'}
              </span>
              <h3 className="text-lg font-black text-sky-400 mt-1">
                {language === 'ar' ? selectedStructure?.nameAr : selectedStructure?.nameEn}
              </h3>
              <span className="text-xs text-slate-300 font-serif italic block mt-0.5">
                {selectedStructure?.nameEn}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {language === 'ar' ? 'الوظيفة الحيوية والفسيولوجية' : 'Biological & Physiological Role'}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-sky-500/15">
                {language === 'ar' ? selectedStructure?.descAr : selectedStructure?.descEn}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-sky-500/10">
                <span className="text-slate-400">{language === 'ar' ? 'الجهاز الحيوي' : 'System'}</span>
                <span className="font-mono text-white text-[11px]">{selectedStructure?.system}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-sky-500/10">
                <span className="text-slate-400">{language === 'ar' ? 'الموقع التشريحي' : 'Region'}</span>
                <span className="font-mono text-white text-[11px]">{selectedStructure?.region}</span>
              </div>
            </div>
          </div>

          {/* Pioneer Card: Andreas Vesalius */}
          {vesalius && (
            <div className="sci-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Award className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'رائد علم التشريح الحديث' : 'Scientific Pioneer'}
                </h4>
              </div>
              <div>
                <span className="text-sm font-bold text-white block">{vesalius.name}</span>
                <span className="text-[11px] text-slate-400">{vesalius.dates} • {vesalius.field}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'ar' ? vesalius.contributionsAr : vesalius.contributionsEn}
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">
                {vesalius.citation}
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
