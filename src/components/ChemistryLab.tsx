import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { getFullPeriodicElements, ChemicalElement } from '../data/periodicTableData';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Search, Award, Box, Flame, Sparkles } from 'lucide-react';

interface MoleculePreset {
  id: string;
  nameEn: string;
  nameAr: string;
  formula: string;
  geometryEn: string;
  geometryAr: string;
  atoms: { symbol: string; x: number; y: number; z: number; color: number; radius: number }[];
  bonds: [number, number][];
}

const PRESET_MOLECULES: MoleculePreset[] = [
  {
    id: 'water',
    nameEn: 'Water',
    nameAr: 'الماء (أكسيد الهيدروجين)',
    formula: 'H₂O',
    geometryEn: 'Bent (V-shaped), 104.5° angle',
    geometryAr: 'زاوي منحني، زاوية 104.5°',
    atoms: [
      { symbol: 'O', x: 0, y: 0.1, z: 0, color: 0xef4444, radius: 0.35 },
      { symbol: 'H', x: -0.75, y: -0.45, z: 0, color: 0xf8fafc, radius: 0.22 },
      { symbol: 'H', x: 0.75, y: -0.45, z: 0, color: 0xf8fafc, radius: 0.22 },
    ],
    bonds: [[0, 1], [0, 2]],
  },
  {
    id: 'methane',
    nameEn: 'Methane',
    nameAr: 'الميثان (رباعي الأوجه)',
    formula: 'CH₄',
    geometryEn: 'Tetrahedral, 109.5° angle',
    geometryAr: 'رباعي أوجه منتظم، زاوية 109.5°',
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
    nameEn: 'Carbon Dioxide',
    nameAr: 'ثاني أكسيد الكربون',
    formula: 'CO₂',
    geometryEn: 'Linear, 180° angle',
    geometryAr: 'خطي مستقيم، زاوية 180°',
    atoms: [
      { symbol: 'C', x: 0, y: 0, z: 0, color: 0x334155, radius: 0.38 },
      { symbol: 'O', x: -1.16, y: 0, z: 0, color: 0xef4444, radius: 0.35 },
      { symbol: 'O', x: 1.16, y: 0, z: 0, color: 0xef4444, radius: 0.35 },
    ],
    bonds: [[0, 1], [0, 2]],
  },
  {
    id: 'ethanol',
    nameEn: 'Ethanol',
    nameAr: 'الإيثانول (كحول إيثيلي)',
    formula: 'C₂H₅OH',
    geometryEn: 'Aliphatic alcohol backbone',
    geometryAr: 'سلسلة كحولية أليفاتية',
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

interface ChemicalReaction {
  id: string;
  nameEn: string;
  nameAr: string;
  reactants: string;
  products: string;
  equation: string;
  enthalpy: string;
  descEn: string;
  descAr: string;
}

const CHEMICAL_REACTIONS: ChemicalReaction[] = [
  {
    id: 'methane_combustion',
    nameEn: 'Methane Combustion',
    nameAr: 'احتراق غاز الميثان التام',
    reactants: 'CH₄ + 2 O₂',
    products: 'CO₂ + 2 H₂O',
    equation: 'CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(l)',
    enthalpy: 'ΔH° = -890.3 kJ/mol (Exothermic / طارد للحرارة)',
    descEn: 'Complete exothermic hydrocarbon oxidation releasing thermal energy, carbon dioxide, and water vapor.',
    descAr: 'تفاعل أكسدة هيدروكربوني تام وطارد للحرارة، ينتج طاقة حرارية وثاني أكسيد الكربون وبخار الماء.',
  },
  {
    id: 'water_electrolysis',
    nameEn: 'Water Electrolysis',
    nameAr: 'التحليل الكهربائي للماء',
    reactants: '2 H₂O',
    products: '2 H₂ + O₂',
    equation: '2 H₂O(l) → 2 H₂(g) + O₂(g)',
    enthalpy: 'ΔH° = +571.6 kJ/mol (Endothermic / ماص للحرارة)',
    descEn: 'Decomposition of water into hydrogen and oxygen diatomic gases using electric potential difference.',
    descAr: 'تفكك جزيئات الماء إلى غازي الهيدروجين والأكسجين باستخدام فرق جهد كهربائي مستمر.',
  },
  {
    id: 'haber_bosch',
    nameEn: 'Haber-Bosch Ammonia Synthesis',
    nameAr: 'تخليق الأمونيا (طريقة هابر-بوش)',
    reactants: 'N₂ + 3 H₂',
    products: '2 NH₃',
    equation: 'N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)',
    enthalpy: 'ΔH° = -92.4 kJ/mol (Exothermic equilibrium / اتزان طارد)',
    descEn: 'Heterogeneous catalytic fixation of atmospheric nitrogen and hydrogen gas under high pressure and iron catalyst.',
    descAr: 'التثبيت الصناعي لغاز النيتروجين مع الهيدروجين تحت ضغط وحرارة عالية باستخدام عامل حفاز من الحديد.',
  },
];

export const ChemistryLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'periodic' | 'molecular' | 'reactions'>('periodic');
  const [elements] = useState<ChemicalElement[]>(() => getFullPeriodicElements());
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(elements[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3D Molecular Conformer state
  const [selectedMolecule, setSelectedMolecule] = useState<MoleculePreset>(PRESET_MOLECULES[0]);
  const [selectedReaction, setSelectedReaction] = useState<ChemicalReaction>(CHEMICAL_REACTIONS[0]);
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
    const height = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040814);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    // Build molecular Ball-and-Stick graph
    const molGroup = new THREE.Group();

    // Atoms
    selectedMolecule.atoms.forEach((atom: { symbol: string; x: number; y: number; z: number; color: number; radius: number }) => {
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

    // Bonds
    selectedMolecule.bonds.forEach(([idxA, idxB]: [number, number]) => {
      const posA = new THREE.Vector3(selectedMolecule.atoms[idxA].x, selectedMolecule.atoms[idxA].y, selectedMolecule.atoms[idxA].z);
      const posB = new THREE.Vector3(selectedMolecule.atoms[idxB].x, selectedMolecule.atoms[idxB].y, selectedMolecule.atoms[idxB].z);

      
      const distance = posA.distanceTo(posB);
      const bondGeo = new THREE.CylinderGeometry(0.07, 0.07, distance, 16);
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

    return () => {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sky-500/15 pb-5">
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'الكيمياء الجزيئية ومعايير IUPAC' : 'IUPAC Standard & 3D Molecular Chemistry'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {language === 'ar' ? 'مختبر الكيمياء والجدول الدوري والجزيئات' : 'Chemistry & Molecular Visualization Lab'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.chemistry.subtitle}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 sci-surface p-1.5">
          <button
            onClick={() => setActiveTab('periodic')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'periodic' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'الجدول الدوري (118 عنصراً)' : '118 Periodic Elements'}
          </button>
          <button
            onClick={() => setActiveTab('molecular')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'molecular' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المتطابقات الجزيئية 3D' : '3D Molecular Viewer'}</span>
          </button>
          <button
            onClick={() => setActiveTab('reactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'reactions' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المعادلات والتفاعلات' : 'Reaction Dynamics'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PERIODIC TABLE */}
      {activeTab === 'periodic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card p-4 overflow-x-auto space-y-4">
            
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-sky-500/15">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.chemistry.searchPlaceholder}
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl py-2 text-xs text-white focus:outline-none focus:border-sky-400 ${
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

            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-1.5 min-w-[500px]">
              {filteredElements.map((el) => {
                const isSelected = selectedElement.number === el.number;
                return (
                  <button
                    key={el.number}
                    onClick={() => setSelectedElement(el)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center relative ${
                      isSelected 
                        ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400 scale-105 z-10' 
                        : 'bg-slate-950/80 border-slate-800 hover:border-sky-500/30 hover:scale-102'
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

          <div className="space-y-6">
            <div className="sci-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-sky-500/15 pb-3">
                <div>
                  <span className="text-3xl font-black text-white">{selectedElement.symbol}</span>
                  <h3 className="text-lg font-bold text-sky-400">
                    {language === 'ar' ? selectedElement.nameAr : selectedElement.nameEn}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{t.chemistry.atomicNumber}</span>
                  <span className="text-2xl font-mono font-bold text-white">#{selectedElement.number}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'الكتلة الذرية القياسية' : 'Atomic Mass'}</span>
                  <span className="font-mono text-white">{selectedElement.atomicMass} u</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'التوزيع الإلكتروني' : 'Electron Configuration'}</span>
                  <span className="font-mono text-sky-400">{selectedElement.electronConfig}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'السالبية الكهربائية' : 'Electronegativity'}</span>
                  <span className="font-mono text-white">{selectedElement.electronegativity ?? 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  {language === 'ar' ? 'نبذة علمية وتطبيقات' : 'Overview & Occurrence'}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-sky-500/15">
                  {language === 'ar' ? selectedElement.summaryAr : selectedElement.summaryEn}
                </p>
              </div>
            </div>

            {/* Mendeleev Card */}
            {mendeleev && (
              <div className="sci-card p-5 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'مؤسس الجدول الدوري' : 'Scientific Pioneer'}
                  </h4>
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
          <div className="lg:col-span-2 sci-card overflow-hidden relative flex flex-col h-[550px]">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-sky-500/15 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? `المتطابق الجزيئي ثلاثي الأبعاد: ${selectedMolecule.nameAr}` : `Ball-and-Stick 3D Conformer: ${selectedMolecule.nameEn}`}
              </span>
              <span className="text-xs font-mono text-sky-400">{selectedMolecule.formula}</span>
            </div>
            <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
          </div>

          <div className="space-y-4">
            <div className="sci-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'اختر الجزيء الكيميائي' : 'Select Molecular Structure'}
              </h3>
              <div className="space-y-2">
                {PRESET_MOLECULES.map((mol) => (
                  <button
                    key={mol.id}
                    onClick={() => setSelectedMolecule(mol)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedMolecule.id === mol.id
                        ? 'bg-sky-600 border-sky-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{language === 'ar' ? mol.nameAr : mol.nameEn}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? mol.geometryAr : mol.geometryEn}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{mol.formula}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sci-card p-5 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white block">PubChem Conformer Reference</span>
              <p className="leading-relaxed text-slate-400">
                {language === 'ar'
                  ? 'تم بناء الإحداثيات الجزيئية ثلاثية الأبعاد استناداً إلى أطوال الروابط المقاسة ونظرية VSEPR للتنافر بين أزواج إلكترونات التكافؤ.'
                  : 'Constructed using experimentally verified bond lengths and VSEPR spatial geometries (e.g., 104.5° bent angle for water).'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CHEMICAL REACTION DYNAMICS */}
      {activeTab === 'reactions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card p-6 flex flex-col justify-between space-y-6">
            <div className="border-b border-sky-500/15 pb-3">
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'معادلات التفاعل وقانون بقاء الكتلة والتغير في المحتوى الحراري' : 'Balanced Reaction Dynamics & Enthalpy Changes'}
              </h3>
              <span className="text-xs text-slate-400">
                {language === 'ar' ? 'حساب الحصيلة وتكافؤ الذرات قبل وبعد التفاعل الكيميائي' : 'Stoichiometric conservation of mass and reaction enthalpy'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <span className="text-xs text-sky-400 font-bold uppercase tracking-wider block">
                {language === 'ar' ? selectedReaction.nameAr : selectedReaction.nameEn}
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide">
                {selectedReaction.equation}
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">
                {selectedReaction.enthalpy}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'المتفاعلات (Reactants):' : 'Reactants:'}</span>
                <span className="text-sm font-bold font-mono text-sky-400">{selectedReaction.reactants}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'النواتج (Products):' : 'Products:'}</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{selectedReaction.products}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-sky-500/15">
              {language === 'ar' ? selectedReaction.descAr : selectedReaction.descEn}
            </p>
          </div>

          <div className="space-y-4">
            <div className="sci-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'اختر التفاعل الكيميائي' : 'Select Chemical Reaction'}
              </h3>
              <div className="space-y-2">
                {CHEMICAL_REACTIONS.map((rxn) => (
                  <button
                    key={rxn.id}
                    onClick={() => setSelectedReaction(rxn)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedReaction.id === rxn.id
                        ? 'bg-sky-600 border-sky-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{language === 'ar' ? rxn.nameAr : rxn.nameEn}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{rxn.reactants} &rarr; {rxn.products}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
