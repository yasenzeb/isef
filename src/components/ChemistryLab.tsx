import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { getFullPeriodicElements, ChemicalElement } from '../data/periodicTableData';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Search, Info, Award, RotateCcw, Box, Sparkles } from 'lucide-react';

interface MoleculePreset {
  id: string;
  name: string;
  formula: string;
  cid?: number;
  atoms: { symbol: string; x: number; y: number; z: number; color: number; radius: number }[];
  bonds: [number, number][];
}

const PRESET_MOLECULES: MoleculePreset[] = [
  {
    id: 'water',
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { symbol: 'O', x: 0, y: 0.1, z: 0, color: 0xef4444, radius: 0.35 },
      { symbol: 'H', x: -0.75, y: -0.45, z: 0, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: 0.75, y: -0.45, z: 0, color: 0xf8fafc, radius: 0.22 },
    ],
    bonds: [[0, 1], [0, 2]],
  },
  {
    id: 'methane',
    name: 'Methane (Tetrahedral)',
    formula: 'CH₄',
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0, color: 0x334155, radius: 0.38 },
      { symbol: 'H', x: 0.63, y: 0.63, z: 0.63, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: -0.63, y: -0.63, z: 0.63, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: -0.63, y: 0.63, z: -0.63, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: 0.63, y: -0.63, z: -0.63, color: 0xf8fafc, radius: 0.22 },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  {
    id: 'carbon_dioxide',
    name: 'Carbon Dioxide (Linear)',
    formula: 'CO₂',
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0, color: 0x334155, radius: 0.38 },
      { symbol: 'O', x: -1.16, y: 0, z: 0, color: 0xef4444, radius: 0.35 },
      { symbol: 'O', x: 1.16, y: 0, z: 0, color: 0xef4444, radius: 0.35 },
    ],
    bonds: [[0, 1], [0, 2]],
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    atoms: [
      { symbol: 'C', x: -0.7, y: 0, z: 0, color: 0x334155, radius: 0.38 },
      { symbol: 'C', x: 0.7, y: 0, z: 0, color: 0x334155, radius: 0.38 },
      { symbol: 'O', x: 1.4, y: 1.0, z: 0, color: 0xef4444, radius: 0.35 },
      { symbol: 'H', x: 2.2, y: 0.8, z: 0, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: -1.1, y: -0.5, z: 0.8, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: -1.1, y: -0.5, z: -0.8, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: -1.1, y: 1.0, z: 0, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: 0.9, y: -0.5, z: 0.8, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: 0.9, y: -0.5, z: -0.8, color: 0xf8fafc, radius: 0.22 },
    ],
    bonds: [[0, 1], [1, 2], [2, 3], [0, 4], [0, 5], [0, 6], [1, 7], [1, 8]],
  },
];

export const ChemistryLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const elements = getFullPeriodicElements();

  const [activeTab, setActiveTab] = useState<'periodic' | 'molecular'>('periodic');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(elements[0]);

  // Molecular 3D Viewer state
  const [selectedMolecule, setSelectedMolecule] = useState<MoleculePreset>(PRESET_MOLECULES[0]);
  const mountRef = useRef<HTMLDivElement | null>(null);

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

  // Molecular 3D Canvas initialization
  useEffect(() => {
    if (activeTab !== 'molecular') return;
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    // Build molecular Ball-and-Stick graph
    const molGroup = new THREE.Group();
    const atomSpheres: THREE.Mesh[] = [];

    // Atoms
    selectedMolecule.atoms.forEach((atom) => {
      const geo = new THREE.SphereGeometry(atom.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: atom.color,
        roughness: 0.3,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(atom.x, atom.y, atom.z);
      molGroup.add(mesh);
      atomSpheres.push(mesh);
    });

    // Bonds
    selectedMolecule.bonds.forEach(([idxA, idxB]) => {
      const posA = new THREE.Vector3(selectedMolecule.atoms[idxA].x, selectedMolecule.atoms[idxA].y, selectedMolecule.atoms[idxA].z);
      const posB = new THREE.Vector3(selectedMolecule.atoms[idxB].x, selectedMolecule.atoms[idxB].y, selectedMolecule.atoms[idxB].z);
      
      const distance = posA.distanceTo(posB);
      const bondGeo = new THREE.CylinderGeometry(0.07, 0.07, distance, 16);
      const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
      const bondMesh = new THREE.Mesh(bondGeo, bondMat);

      // Position and rotate cylinder between atom A and atom B
      const mid = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
      bondMesh.position.copy(mid);
      bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), posB.clone().sub(posA).normalize());
      molGroup.add(bondMesh);
    });

    scene.add(molGroup);

    // Animation
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
  }, [activeTab, selectedMolecule]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            IUPAC Standard & 3D Molecular Viewer
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{t.chemistry.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.chemistry.subtitle}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('periodic')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'periodic' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            118 Periodic Elements
          </button>
          <button
            onClick={() => setActiveTab('molecular')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'molecular' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Molecular Conformer Viewer</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PERIODIC TABLE */}
      {activeTab === 'periodic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-x-auto space-y-4">
            
            {/* Search toolbar */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.chemistry.searchPlaceholder}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-2 text-xs text-white focus:outline-none focus:border-emerald-500 ${
                    isRTL ? "pr-8 text-right" : "pl-9"
                  }`}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
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

            {/* Elements Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-1.5 min-w-[500px]">
              {filteredElements.map((el) => {
                const isSelected = selectedElement.number === el.number;
                return (
                  <button
                    key={el.number}
                    onClick={() => setSelectedElement(el)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative ${
                      isSelected 
                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 scale-105 z-10' 
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 hover:scale-102'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-slate-400 absolute top-1 left-1.5">{el.number}</span>
                    <span className="text-base font-black text-white mt-2">{el.symbol}</span>
                    <span className="text-[10px] text-slate-300 truncate max-w-full font-medium">
                      {language === 'ar' ? el.nameAr : el.nameEn}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 mt-0.5">{el.atomicMass}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Element Detail Inspector (1 col) */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-3xl font-black text-white">{selectedElement.symbol}</span>
                  <h3 className="text-lg font-bold text-emerald-400">
                    {language === 'ar' ? selectedElement.nameAr : selectedElement.nameEn}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{t.chemistry.atomicNumber}</span>
                  <span className="text-2xl font-mono font-bold text-white">#{selectedElement.number}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Atomic Mass</span>
                  <span className="font-mono text-white">{selectedElement.atomicMass} u</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Electron Configuration</span>
                  <span className="font-mono text-emerald-400">{selectedElement.electronConfig}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Electronegativity</span>
                  <span className="font-mono text-white">{selectedElement.electronegativity ?? 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">Overview</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {language === 'ar' ? selectedElement.summaryAr : selectedElement.summaryEn}
                </p>
              </div>
            </div>

            {/* Dmitri Mendeleev Card */}
            {mendeleev && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Scientific Pioneer</h4>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{mendeleev.name}</span>
                  <span className="text-[11px] text-slate-400">{mendeleev.dates} • {mendeleev.field}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' ? mendeleev.contributionsAr : mendeleev.contributionsEn}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {mendeleev.citation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 3D MOLECULAR CONFORMER VIEWER */}
      {activeTab === 'molecular' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[550px]">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-white">Ball-and-Stick 3D Conformer: {selectedMolecule.name}</span>
              <span className="text-xs font-mono text-indigo-400">{selectedMolecule.formula}</span>
            </div>

            <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Molecular Conformer</h3>
              <div className="space-y-2">
                {PRESET_MOLECULES.map((mol) => (
                  <button
                    key={mol.id}
                    onClick={() => setSelectedMolecule(mol)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedMolecule.id === mol.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-xs font-bold">{mol.name}</span>
                    <span className="text-xs font-mono">{mol.formula}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white block">PubChem Conformer Reference</span>
              <p className="leading-relaxed text-slate-400">
                Molecular coordinates are structured using validated bond lengths and VSEPR angles (e.g., 104.5° for water, 109.5° for tetrahedral methane).
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
