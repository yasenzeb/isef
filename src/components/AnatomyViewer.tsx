import React, { useEffect, useRef, useState } from 'react';
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
  Info, 
  Maximize2, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  Award
} from 'lucide-react';

interface AnatomyViewerProps {
  isPresentationMode?: boolean;
}

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({ isPresentationMode = false }) => {
  const { t, isRTL, language } = useLanguage();
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Loading and error state
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const skeletonMeshGroup = useRef<THREE.Group | null>(null);
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material>>(new Map());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBone, setSelectedBone] = useState<{
    name: string;
    latin?: string;
    desc: string;
    region?: string;
  } | null>({
    name: 'Femur (Thigh Bone)',
    latin: 'Os femoris',
    desc: 'The longest, heaviest, and strongest tubular bone in the human body. Transmits force from the pelvic girdle to the tibia.',
    region: 'Lower Extremity / Appendicular Skeleton',
  });

  const [isIsolated, setIsIsolated] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'axial' | 'appendicular'>('all');

  // Scientist note for Anatomy
  const vesalius = REAL_SCIENTISTS.find(s => s.id === 'vesalius');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer Setup
    const width = mount.clientWidth;
    const height = mount.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.0, 0);
    controlsRef.current = controls;

    // 2. Anatomical Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fillLight.position.set(-2, 2, -2);
    scene.add(fillLight);

    // 3. Setup DRACO & GLTF Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    setIsLoading(true);
    setLoadProgress(10);

    // 4. Load the Real Skeletal GLB Model
    gltfLoader.load(
      '/models/anatomy/skeletal.glb',
      (gltf) => {
        const root = gltf.scene;
        skeletonMeshGroup.current = root;

        // Traverse and prepare selectable bone meshes
        const boneMaterial = new THREE.MeshStandardMaterial({
          color: 0xe2ded4, // Realistic osteological bone ivory
          roughness: 0.45,
          metalness: 0.05,
        });

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            originalMaterials.current.set(mesh, boneMaterial.clone());
            mesh.material = boneMaterial.clone();
            mesh.userData = {
              name: mesh.name || 'Anatomical Bone',
            };
          }
        });

        // Center and normalize scale
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        root.position.x -= center.x;
        root.position.y -= center.y - (size.y / 2);
        root.position.z -= center.z;

        scene.add(root);
        setIsLoading(false);
        setLoadProgress(100);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.error('Failed to load skeletal.glb:', error);
        setLoadError('Failed to load full 3D skeletal mesh from public/models/anatomy/skeletal.glb');
        setIsLoading(false);
      }
    );

    // 5. Raycasting for Clickable Bone Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      if (!skeletonMeshGroup.current) return;

      const intersects = raycaster.intersectObjects(skeletonMeshGroup.current.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;

        // Reset previous highlight
        if (selectedMeshRef.current) {
          const prevMat = originalMaterials.current.get(selectedMeshRef.current);
          if (prevMat) selectedMeshRef.current.material = prevMat.clone();
        }

        // Apply new vibrant highlight
        selectedMeshRef.current = hit;
        hit.material = new THREE.MeshStandardMaterial({
          color: 0x38bdf8, // Sky-blue selection highlight
          emissive: 0x0284c7,
          emissiveIntensity: 0.35,
          roughness: 0.3,
        });

        // Update inspector information
        const boneName = hit.name.replace(/^ZA:/, '').replace(/\.(l|r)$/i, (m, side) => ` (${side.toUpperCase() === 'L' ? 'Left' : 'Right'})`);
        setSelectedBone({
          name: boneName || 'Selectable Bone Structure',
          latin: 'Os skeleti',
          desc: `Identified structural osseous tissue in the ${activeLayer} anatomical compartment.`,
          region: hit.position.y > 1.2 ? 'Cranial / Cervical Region' : hit.position.y > 0.7 ? 'Thoracic / Pelvic Girdle' : 'Lower Extremity',
        });
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 6. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 600;
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

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.2, 2.5);
      controlsRef.current.target.set(0, 1.0, 0);
      controlsRef.current.update();
    }
  };

  const toggleIsolate = () => {
    if (!skeletonMeshGroup.current || !selectedMeshRef.current) return;
    const newIsolate = !isIsolated;
    setIsIsolated(newIsolate);

    skeletonMeshGroup.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (newIsolate) {
          mesh.visible = mesh === selectedMeshRef.current;
        } else {
          mesh.visible = true;
        }
      }
    });
  };

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'p-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'}`}>
      
      {/* Top Banner */}
      {!isPresentationMode && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                True 3D Osteological Skeleton
              </span>
              <span className="text-xs text-slate-400">Z-Anatomy & BodyParts3D Real Model • 1.86 MB Draco GLB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Human Skeletal Laboratory
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetCamera}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.anatomy.resetCamera}</span>
            </button>
            <button
              onClick={toggleIsolate}
              disabled={!selectedMeshRef.current}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isIsolated ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isIsolated ? t.anatomy.showAll : t.anatomy.isolate}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 3D Canvas + Scientific Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 3D Canvas Viewport (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[650px]">
          
          {/* Real-time Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h4 className="text-base font-bold text-white">Loading Anatomical Osteology Mesh...</h4>
                <p className="text-xs text-slate-400 mt-1">Streaming real skeletal geometry with Draco compression ({loadProgress}%)</p>
              </div>
            </div>
          )}

          {/* Error fallback */}
          {loadError && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-rose-400 space-y-2">
              <Info className="w-8 h-8" />
              <p className="text-sm font-semibold">{loadError}</p>
            </div>
          )}

          {/* Canvas Mount Container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Quick HUD controls overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-3">
            <span>🖱️ Click to select any bone</span>
            <span className="text-slate-600">•</span>
            <span>Drag to rotate</span>
            <span className="text-slate-600">•</span>
            <span>Scroll to zoom</span>
          </div>
        </div>

        {/* Selected Bone Inspector (1 col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 block uppercase tracking-wider">Specimen Inspection</span>
              <h3 className="text-lg font-black text-sky-400 mt-1">
                {selectedBone?.name}
              </h3>
              {selectedBone?.latin && (
                <span className="text-xs text-slate-300 font-serif italic block mt-0.5">
                  {selectedBone.latin}
                </span>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Functional Anatomy & Mechanics</span>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {selectedBone?.desc}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Anatomical Division</span>
                <span className="font-mono text-white text-[11px]">{selectedBone?.region}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Tissue Composition</span>
                <span className="font-mono text-white text-[11px]">Cortical & Trabecular Osseous</span>
              </div>
            </div>
          </div>

          {/* Real Scientist Card: Andreas Vesalius */}
          {vesalius && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Award className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Scientific Pioneer</h4>
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
