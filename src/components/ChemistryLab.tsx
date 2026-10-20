import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { getFullPeriodicElements, ChemicalElement } from '../data/periodicTableData';
import { POLYATOMIC_GROUPS, PolyatomicGroup } from '../data/polyatomicGroupsData';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Search, Award, Layers, Sparkles, RotateCcw, Play, Pause, Atom, ShieldCheck, ChevronRight, FlaskConical } from 'lucide-react';
import { PraxiReactionSimulator } from './PraxiReactionSimulator';

interface Atom3DViewerProps {
  element: ChemicalElement;
  language: string;
}

const Atom3DViewer: React.FC<Atom3DViewerProps> = ({ element, language }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(true);
  isRotatingRef.current = isRotating;

  const Z = element.number;
  const A = Math.round(element.atomicMass);
  const N = Math.max(0, A - Z);
  const shells = element.shells && element.shells.length > 0 ? element.shells : [Z];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const maxRadius = 1.1 + shells.length * 0.65;
    camera.position.set(0, maxRadius * 0.65, maxRadius * 2.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 30;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.7);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 1.8, 6);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // --- 1. Nucleus Cluster (Protons + Neutrons) ---
    const nucleusGroup = new THREE.Group();
    const protonGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const neutronGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.45,
    });
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Slate / Cyan-gray
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x1e293b,
      emissiveIntensity: 0.35,
    });

    const totalParticles = Z + N;
    const displayCount = Math.min(totalParticles, 40);
    const protonRatio = Z / (totalParticles || 1);
    const nucRadius = 0.2 + Math.min(0.4, Math.cbrt(displayCount) * 0.12);

    for (let p = 0; p < displayCount; p++) {
      const isProton = Math.random() < protonRatio;
      const mesh = new THREE.Mesh(isProton ? protonGeo : neutronGeo, isProton ? protonMat : neutronMat);

      const phi = Math.acos(1 - (2 * (p + 0.5)) / displayCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * p;
      const r = nucRadius * Math.cbrt((p + 1) / displayCount);

      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      nucleusGroup.add(mesh);
    }

    if (totalParticles > 6) {
      const glowGeo = new THREE.SphereGeometry(nucRadius * 1.25, 24, 24);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.12,
      });
      nucleusGroup.add(new THREE.Mesh(glowGeo, glowMat));
    }
    scene.add(nucleusGroup);

    // --- 2. Concentric Electron Shells & Orbiting Electrons ---
    const electronGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee, // Bright glowing Cyan
      roughness: 0.15,
      metalness: 0.4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
    });

    interface OrbitingElectron {
      mesh: THREE.Mesh;
      shellRadius: number;
      baseAngle: number;
      speed: number;
    }

    const electronList: OrbitingElectron[] = [];

    shells.forEach((electronCount, shellIdx) => {
      const shellRadius = 1.0 + (shellIdx + 1) * 0.65;
      const shellGroup = new THREE.Group();

      // Realistic 3D orbital tilt for each shell plane
      shellGroup.rotation.x = ((shellIdx * 0.45) % Math.PI) - 0.2;
      shellGroup.rotation.z = ((shellIdx * 0.35) % Math.PI) - 0.15;
      shellGroup.rotation.y = (shellIdx * 0.25) % Math.PI;

      // Concentric glowing orbital path
      const ringPoints: THREE.Vector3[] = [];
      const segments = 72;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * shellRadius, 0, Math.sin(theta) * shellRadius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.35,
      });
      const ringLine = new THREE.LineLoop(ringGeo, ringMat);
      shellGroup.add(ringLine);

      // Distribute electrons along the ring
      for (let e = 0; e < electronCount; e++) {
        const eMesh = new THREE.Mesh(electronGeo, electronMat);
        const baseAngle = (e / electronCount) * Math.PI * 2;
        eMesh.position.set(Math.cos(baseAngle) * shellRadius, 0, Math.sin(baseAngle) * shellRadius);
        shellGroup.add(eMesh);

        const speed = 1.8 / Math.sqrt(shellIdx + 1);
        electronList.push({
          mesh: eMesh,
          shellRadius,
          baseAngle,
          speed,
        });
      }

      scene.add(shellGroup);
    });

    // --- 3. Animation Loop ---
    let animId: number;
    let clockTime = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isRotatingRef.current) {
        clockTime += 0.016;
        nucleusGroup.rotation.y += 0.005;
        nucleusGroup.rotation.x += 0.002;

        electronList.forEach(e => {
          const currentAngle = e.baseAngle + clockTime * e.speed;
          e.mesh.position.set(
            Math.cos(currentAngle) * e.shellRadius,
            0,
            Math.sin(currentAngle) * e.shellRadius
          );
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 350;
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
  }, [element, shells]);

  const ar = language === 'ar';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#040814] shadow-2xl flex flex-col">
      {/* Top Overlay Bar */}
      <div className="absolute top-2.5 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#030712]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
          <Atom className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono">
            {element.symbol} · {ar ? `ذرة ${element.nameAr}` : `${element.nameEn} Atom 3D`}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Z={Z}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsRotating(prev => !prev)}
            className="p-1.5 rounded-lg bg-[#030712]/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
            title={isRotating ? (ar ? 'إيقاف دوران الإلكترونات' : 'Pause Orbit') : (ar ? 'تشغيل دوران الإلكترونات' : 'Resume Orbit')}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-[330px] cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />

      {/* Bottom Particle Telemetry HUD */}
      <div className="bg-[#030712]/90 backdrop-blur-md border-t border-white/10 p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-1.5">
          <span className="text-[10px] text-red-400 block font-bold">{ar ? 'البروتونات (p⁺)' : 'Protons (p⁺)'}</span>
          <span className="text-sm font-black font-mono text-red-300">{Z}</span>
        </div>

        <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-1.5">
          <span className="text-[10px] text-slate-400 block font-bold">{ar ? 'النيوترونات (n⁰)' : 'Neutrons (n⁰)'}</span>
          <span className="text-sm font-black font-mono text-slate-300">{N}</span>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-1.5">
          <span className="text-[10px] text-cyan-400 block font-bold">{ar ? 'الإلكترونات (e⁻)' : 'Electrons (e⁻)'}</span>
          <span className="text-sm font-black font-mono text-cyan-300">{Z}</span>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-1.5">
          <span className="text-[10px] text-indigo-400 block font-bold">{ar ? 'مستويات الطاقة' : 'Energy Shells'}</span>
          <span className="text-xs font-black font-mono text-indigo-300 truncate block mt-0.5">
            {shells.join(' · ')}
          </span>
        </div>
      </div>
    </div>
  );
};

interface PolyatomicGroup3DViewerProps {
  group: PolyatomicGroup;
  language: string;
}

const PolyatomicGroup3DViewer: React.FC<PolyatomicGroup3DViewerProps> = ({ group, language }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(3, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.5);
    dirLight2.position.set(-3, -4, -3);
    scene.add(dirLight2);

    // Build 3D Molecular Graph
    const molGroup = new THREE.Group();

    // Atoms (Spheres)
    group.atoms.forEach((atom) => {
      const geo = new THREE.SphereGeometry(atom.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: atom.color,
        roughness: 0.3,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.x, atom.y, atom.z);
      molGroup.add(mesh);
    });

    // Bonds (Cylinders)
    group.bonds.forEach(([idxA, idxB]) => {
      if (!group.atoms[idxA] || !group.atoms[idxB]) return;
      const posA = new THREE.Vector3(group.atoms[idxA].x, group.atoms[idxA].y, group.atoms[idxA].z);
      const posB = new THREE.Vector3(group.atoms[idxB].x, group.atoms[idxB].y, group.atoms[idxB].z);

      const distance = posA.distanceTo(posB);
      const bondGeo = new THREE.CylinderGeometry(0.065, 0.065, distance, 16);
      const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
      const bondMesh = new THREE.Mesh(bondGeo, bondMat);

      const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      bondMesh.position.copy(mid);
      bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), posB.clone().sub(posA).normalize());
      molGroup.add(bondMesh);
    });

    scene.add(molGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      molGroup.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 500;
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
  }, [group]);

  const ar = language === 'ar';

  return (
    <div className="sci-card overflow-hidden relative flex flex-col h-[560px]">
      <div className="bg-[#030712]/90 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between z-10">
        <div>
          <span className="text-sm font-bold text-white block">
            {ar ? group.nameAr : group.nameEn}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {ar ? group.geometryAr : group.geometryEn}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-black font-mono px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {group.formula}
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {group.valencyAr}
          </span>
        </div>
      </div>
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />
    </div>
  );
};

export const ChemistryLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'periodic' | 'reactions' | 'atomic-groups'>('periodic');
  const [elements] = useState<ChemicalElement[]>(() => getFullPeriodicElements());
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(elements[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Polyatomic groups state
  const [selectedGroup, setSelectedGroup] = useState<PolyatomicGroup>(POLYATOMIC_GROUPS[0]);
  const [valencyFilter, setValencyFilter] = useState<string>('all');

  // Scientist card
  const mendeleev = REAL_SCIENTISTS.find(s => s.id === 'mendeleev');

  // Filtering for Periodic Table
  const filteredElements = elements.filter(el => {
    const matchesCategory = selectedCategory === 'all' || el.category === selectedCategory;
    const matchesSearch = 
      el.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.nameAr.includes(searchQuery) ||
      el.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.number.toString() === searchQuery.trim();
    return matchesCategory && matchesSearch;
  });

  // Filtering for Polyatomic Groups
  const filteredGroups = POLYATOMIC_GROUPS.filter(g => {
    if (valencyFilter === 'all') return true;
    return g.valencyType === valencyFilter;
  });

  const ar = language === 'ar';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <span className="sci-badge">
            {ar ? 'الكيمياء الجزيئية والذرية ومعايير IUPAC' : 'Atomic & Molecular Chemistry Lab (IUPAC)'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            {ar ? 'مختبر الكيمياء والجدول الدوري والمجموعات الذرية' : 'Chemistry, Periodic Table & Polyatomic Groups'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.chemistry.subtitle}</p>
        </div>

        {/* Tab switcher: 3 tabs */}
        <div className="flex items-center space-x-2 sci-surface p-1.5">
          <button
            onClick={() => setActiveTab('periodic')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'periodic' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeTab === 'periodic' ? { background: 'linear-gradient(135deg, #6366f1, #06b6d4)' } : undefined}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>{ar ? 'الجدول الدوري وبنية الذرة 3D' : 'Periodic Table & 3D Atom'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'reactions' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeTab === 'reactions' ? { background: 'linear-gradient(135deg, #06b6d4, #10b981)' } : undefined}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{ar ? 'معمل التفاعلات الكيميائية (PraxiLabs)' : 'Reaction Lab (PraxiLabs)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('atomic-groups')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'atomic-groups' ? 'text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            style={activeTab === 'atomic-groups' ? { background: 'linear-gradient(135deg, #6366f1, #06b6d4)' } : undefined}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{ar ? 'المجموعات الذرية 3D' : 'Polyatomic Groups 3D'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PERIODIC TABLE & 3D ATOM MODEL */}
      {/* VIEW 1: PERIODIC TABLE & 3D ATOM MODEL */}
      {activeTab === 'periodic' && (
        <div className="space-y-6">
          {/* Top: 3D Selected Element Showcase & Bohr Model */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Atom3DViewer element={selectedElement} language={language} />
            </div>

            <div className="lg:col-span-2 sci-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-white font-mono px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
                      {selectedElement.symbol}
                    </span>
                    <div>
                      <h3 className="text-2xl font-bold text-cyan-400">
                        {ar ? selectedElement.nameAr : selectedElement.nameEn}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedElement.nameEn} • {selectedElement.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">{t.chemistry.atomicNumber}</span>
                    <span className="text-3xl font-mono font-black text-white">#{selectedElement.number}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                  <div className="metric-card">
                    <span className="text-slate-400 block text-[10px]">{ar ? 'الكتلة الذرية' : 'Atomic Mass'}</span>
                    <span className="font-mono text-white font-bold">{selectedElement.atomicMass} u</span>
                  </div>
                  <div className="metric-card">
                    <span className="text-slate-400 block text-[10px]">{ar ? 'الدورة / المجموعة' : 'Period / Group'}</span>
                    <span className="font-mono text-cyan-300 font-bold">P{selectedElement.period} · G{selectedElement.group}</span>
                  </div>
                  <div className="metric-card">
                    <span className="text-slate-400 block text-[10px]">{ar ? 'التوزيع الإلكتروني' : 'Config'}</span>
                    <span className="font-mono text-amber-300 font-bold text-[11px] truncate">{selectedElement.electronConfig}</span>
                  </div>
                  <div className="metric-card">
                    <span className="text-slate-400 block text-[10px]">{ar ? 'السالبية الكهربية' : 'Electronegativity'}</span>
                    <span className="font-mono text-emerald-300 font-bold">{selectedElement.electronegativity || '—'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-white/5 mt-4">
                  {ar ? selectedElement.summaryAr : selectedElement.summaryEn}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>{ar ? 'الاستخدامات الشائعة:' : 'Common Applications:'}</span>
                <span className="text-slate-200 font-medium">{ar ? selectedElement.commonUsesAr : selectedElement.commonUsesEn}</span>
              </div>
            </div>
          </div>

          {/* Bottom: Full-Width Authentic 18-Column Interactive Periodic Table */}
          <div className="sci-card p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white font-mono">
                  {ar ? 'الجدول الدوري الحديث للعناصر (معايير IUPAC العالمية)' : 'Official IUPAC Periodic Table of Elements (1-118)'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.chemistry.searchPlaceholder}
                    className={`w-full bg-slate-950/80 border border-slate-700 rounded-xl py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 ${
                      isRTL ? "pr-8 text-right" : "pl-9"
                    }`}
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">{t.chemistry.allCategories}</option>
                  <option value="alkali-metal">{t.chemistry.alkaliMetal}</option>
                  <option value="alkaline-earth">{t.chemistry.alkalineEarth}</option>
                  <option value="transition-metal">{t.chemistry.transitionMetal}</option>
                  <option value="post-transition">{t.chemistry.postTransition}</option>
                  <option value="metalloid">{t.chemistry.metalloid}</option>
                  <option value="nonmetal">{t.chemistry.nonmetal}</option>
                  <option value="noble-gas">{t.chemistry.nobleGas}</option>
                  <option value="lanthanide">{t.chemistry.lanthanide}</option>
                  <option value="actinide">{t.chemistry.actinide}</option>
                </select>
              </div>
            </div>

            {/* Real 18-Column Grid */}
            <div className="overflow-x-auto pb-4">
              <div 
                className="grid gap-1 min-w-[960px] p-2 bg-[#02040a] rounded-2xl border border-white/10"
                style={{
                  gridTemplateColumns: 'repeat(18, minmax(48px, 1fr))',
                  gridTemplateRows: 'repeat(10, minmax(52px, auto))',
                }}
              >
                {/* 18 Group Numbers Header */}
                {Array.from({ length: 18 }, (_, i) => (
                  <div key={`grp-${i + 1}`} className="text-center font-mono text-[10px] text-slate-500 font-bold py-0.5" style={{ gridColumn: i + 1, gridRow: 1 }}>
                    {i + 1}
                  </div>
                ))}

                {/* Main Table Elements (Periods 1 to 7) */}
                {elements.map((el) => {
                  const isSelected = selectedElement.number === el.number;
                  const isVisible = filteredElements.some(f => f.number === el.number);
                  const isLanthanide = el.category === 'lanthanide';
                  const isActinide = el.category === 'actinide';

                  // Lanthanides & Actinides are placed below in row 9 and 10
                  let gridRow = el.period + 1; // +1 for group headers
                  let gridCol = el.group;

                  if (isLanthanide) {
                    gridRow = 9;
                    gridCol = (el.number - 57) + 3; // 57 (La) starts at col 3
                  } else if (isActinide) {
                    gridRow = 10;
                    gridCol = (el.number - 89) + 3; // 89 (Ac) starts at col 3
                  }

                  // Category styling colors
                  let catColor = 'border-slate-800 bg-[#090d1a]';
                  if (el.category === 'noble-gas') catColor = 'border-purple-500/40 bg-purple-950/20 text-purple-300';
                  else if (el.category === 'alkali-metal') catColor = 'border-red-500/40 bg-red-950/20 text-red-300';
                  else if (el.category === 'alkaline-earth') catColor = 'border-orange-500/40 bg-orange-950/20 text-orange-300';
                  else if (el.category === 'transition-metal') catColor = 'border-blue-500/40 bg-blue-950/20 text-blue-300';
                  else if (el.category === 'metalloid') catColor = 'border-teal-500/40 bg-teal-950/20 text-teal-300';
                  else if (el.category === 'nonmetal') catColor = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300';
                  else if (el.category === 'post-transition') catColor = 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300';
                  else if (el.category === 'lanthanide') catColor = 'border-pink-500/40 bg-pink-950/20 text-pink-300';
                  else if (el.category === 'actinide') catColor = 'border-amber-500/40 bg-amber-950/20 text-amber-300';

                  return (
                    <button
                      key={el.number}
                      onClick={() => {
                        setSelectedElement(el);
                        // Darwin Context Bridge
                        window.dispatchEvent(new CustomEvent('scinexa:context', {
                          detail: {
                            lab: 'chemistry',
                            type: 'element_selected',
                            title: ar ? el.nameAr : el.nameEn,
                            desc: `${el.symbol} — العدد الذري: ${el.number} — ${el.category}`,
                          }
                        }));
                      }}
                      style={{
                        gridColumn: gridCol,
                        gridRow: gridRow,
                      }}
                      className={`flex flex-col items-center justify-center p-1 rounded-lg border transition-all text-center relative ${catColor} ${
                        !isVisible ? 'opacity-25 grayscale' : 'opacity-100'
                      } ${
                        isSelected 
                          ? 'ring-2 ring-cyan-400 scale-105 z-20 shadow-lg shadow-cyan-500/30' 
                          : 'hover:scale-105 hover:z-10'
                      }`}
                    >
                      <span className="text-[8px] font-mono text-slate-400 absolute top-0.5 left-1 leading-none">{el.number}</span>
                      <span className="text-sm font-black text-white mt-1.5 leading-none">{el.symbol}</span>
                      <span className="text-[9px] text-slate-300 truncate max-w-full font-medium leading-tight">
                        {ar ? el.nameAr : el.nameEn}
                      </span>
                    </button>
                  );
                })}

                {/* Lanthanide & Actinide placeholders in main body (Period 6 & 7, Group 3) */}
                <div 
                  style={{ gridColumn: 3, gridRow: 7 }} 
                  className="flex flex-col items-center justify-center p-1 rounded-lg border border-pink-500/30 bg-pink-950/20 text-[9px] font-mono text-pink-300 text-center"
                >
                  <span className="font-bold">57-71</span>
                  <span className="text-[7px]">La-Lu</span>
                </div>
                <div 
                  style={{ gridColumn: 3, gridRow: 8 }} 
                  className="flex flex-col items-center justify-center p-1 rounded-lg border border-amber-500/30 bg-amber-950/20 text-[9px] font-mono text-amber-300 text-center"
                >
                  <span className="font-bold">89-103</span>
                  <span className="text-[7px]">Ac-Lr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mendeleev Card */}
          {mendeleev && (
            <div className="sci-card p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Award className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {ar ? 'مؤسس الجدول الدوري' : 'Scientific Pioneer'}
                </h4>
              </div>
              <div>
                <span className="text-sm font-bold text-white block">{mendeleev.name}</span>
                <span className="text-[11px] text-slate-400">{mendeleev.dates} • {mendeleev.field}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ar ? mendeleev.contributionsAr : mendeleev.contributionsEn}
              </p>
              <span className="text-[10px] text-slate-500 font-mono block">
                {mendeleev.citation}
              </span>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PRAXILABS REACTION SIMULATOR (معمل التفاعلات الكيميائية) */}
      {activeTab === 'reactions' && (
        <PraxiReactionSimulator />
      )}

      {/* VIEW 3: 3D POLYATOMIC GROUPS (المجموعات الذرية) */}
      {activeTab === 'atomic-groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: 3D Polyatomic Group Model */}
          <div className="lg:col-span-2 space-y-4">
            <PolyatomicGroup3DViewer group={selectedGroup} language={language} />

            {/* Deep Chemistry Explainer Card */}
            <div className="sci-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {ar ? 'مفهوم وسلوك المجموعة الذرية في التفاعلات الكيميائية' : 'Behavior of Polyatomic Radicals in Chemical Reactions'}
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ar
                  ? 'المجموعة الذرية (Radical / Polyatomic Ion) هي مجموعة من الذرات لعناصر مختلفة مرتبطة ببعضها بروابط تساهمية قوية، تسلك مسلك الذرة الواحدة في التفاعل الكيميائي، ولها تكافؤ خاص بها ولا توجد في حالة انفراد بل تشكل أملاحاً ومركبات مستقرة.'
                  : 'A polyatomic ion is a covalently bonded set of two or more atoms that acts as a single charged unit in chemical reactions with its own distinct valence state.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-bold">{ar ? 'أمثلة على المركبات والأملاح:' : 'Common Compounds & Salts:'}</span>
                  <span className="text-xs font-mono text-cyan-300 block">{ar ? selectedGroup.examplesAr : selectedGroup.examplesEn}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 block font-bold">{ar ? 'حالات التأكسد داخل المجموعة:' : 'Oxidation States:'}</span>
                  <span className="text-xs font-mono text-indigo-300 block">{selectedGroup.oxidationState}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Polyatomic Groups Selector & Details */}
          <div className="space-y-4">
            
            {/* Valency Filters */}
            <div className="sci-card p-4 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {ar ? 'تصفية حسب التكافؤ والشحنة' : 'Filter by Valency & Charge'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', ar: 'الكل (16)', en: 'All (16)' },
                  { id: 'monovalent_neg', ar: 'أحادية سالبة (-1)', en: 'Monovalent (-1)' },
                  { id: 'divalent_neg', ar: 'ثنائية سالبة (-2)', en: 'Divalent (-2)' },
                  { id: 'trivalent_neg', ar: 'ثلاثية سالبة (-3)', en: 'Trivalent (-3)' },
                  { id: 'monovalent_pos', ar: 'أحادية موجبة (+1)', en: 'Cation (+1)' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setValencyFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      valencyFilter === f.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-950/70 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {ar ? f.ar : f.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups List */}
            <div className="sci-card p-4 space-y-2 max-h-[460px] overflow-y-auto">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                {ar ? 'قائمة المجموعات الذرية الشهيرة' : 'Famous Polyatomic Groups'}
              </span>

              <div className="space-y-1.5">
                {filteredGroups.map((g) => {
                  const isSelected = selectedGroup.id === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-500/25 border-cyan-400 ring-1 ring-cyan-400/80 text-white shadow'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={ar ? 'text-right' : ''}>
                        <span className="text-xs font-bold block">{ar ? g.nameAr : g.nameEn}</span>
                        <span className="text-[10px] text-slate-400">{ar ? g.valencyAr : g.valencyEn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          {g.formula}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Group Details Card */}
            <div className="sci-card p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-base font-black font-mono text-cyan-400">{selectedGroup.formula}</span>
                <span className="text-xs font-bold text-white">{ar ? selectedGroup.nameAr : selectedGroup.nameEn}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {ar ? selectedGroup.descAr : selectedGroup.descEn}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
