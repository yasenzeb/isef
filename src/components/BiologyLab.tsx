import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Dna, Activity, Award, Check, RefreshCw, ZoomIn } from 'lucide-react';

interface Organelle {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  foundIn: 'both' | 'plant' | 'animal';
  sizeNm: string;
}

const ORGANELLES: Organelle[] = [
  {
    id: 'nucleus',
    nameEn: 'Nucleus (Cellular Karyon)',
    nameAr: 'النواة الخلوية',
    roleEn: 'Repository of genomic DNA; coordinates transcription, mRNA splicing, and chromosome replication.',
    roleAr: 'مستودع المادة الوراثية (DNA)؛ تدير نسخ الجينات وانقسام وتكاثر الخلية وتخليق الحمض النووي الريبوزي.',
    foundIn: 'both',
    sizeNm: '5,000 - 10,000 nm',
  },
  {
    id: 'mitochondria',
    nameEn: 'Mitochondrion (Chondriosome)',
    nameAr: 'الميتوكوندريا (المتقدرة)',
    roleEn: 'ATP synthesis via oxidative phosphorylation, electron transport chain, and citric acid cycle.',
    roleAr: 'محطة توليد الطاقة في الخلية؛ تنتج جزيئات ATP عبر الفسفرة التأكسدية وسلسلة نقل الإلكترونات ودورة كريبس.',
    foundIn: 'both',
    sizeNm: '500 - 1,000 nm',
  },
  {
    id: 'chloroplast',
    nameEn: 'Chloroplast (Plastid)',
    nameAr: 'البلاستيدة الخضراء',
    roleEn: 'Photosynthesis site; converts light energy into ATP and NADPH, synthesizing hexose sugars in the Calvin cycle.',
    roleAr: 'مقر عملية البناء الضوئي؛ تحول الطاقة الضوئية للكلوروفيل إلى طاقة كيميائية في الجلوكوز وسكر السداسي.',
    foundIn: 'plant',
    sizeNm: '2,000 - 5,000 nm',
  },
  {
    id: 'ribosome',
    nameEn: 'Ribosome (Ribonucleoprotein)',
    nameAr: 'الريبوسوم',
    roleEn: 'Translates mRNA transcripts into polypeptide chains using tRNA adapters (peptidyl transferase activity).',
    roleAr: 'المصنع الجزيئي الذي يترجم شفرة mRNA إلى سلاسل ببتيدية وبروتينات وظيفية باستخدام RNA الناقل.',
    foundIn: 'both',
    sizeNm: '20 - 30 nm',
  },
  {
    id: 'cell_wall',
    nameEn: 'Cellulose Cell Wall',
    nameAr: 'الجدار الخلوي السليولوزي',
    roleEn: 'Rigid outer matrix composed of cellulose microfibrils that resists internal turgor osmotic pressure.',
    roleAr: 'طبقة خارجية صلبة من ألياف السليولوز توفر دعامة ميكانيكية قوية وتقاوم ضغط الامتلاء الإسموزي الداخلي.',
    foundIn: 'plant',
    sizeNm: '100 - 1,000 nm thick',
  },
];

export const BiologyLab: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'cytology' | 'dna'>('cytology');
  const [cellType, setCellType] = useState<'plant' | 'animal'>('plant');
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle>(ORGANELLES[0]);

  // DNA Interactive Base-Pairing State
  const [selectedBase, setSelectedBase] = useState<'A' | 'T' | 'C' | 'G'>('A');
  const [userPair, setUserPair] = useState<string | null>(null);
  const [pairFeedback, setPairFeedback] = useState<string | null>(null);

  // 3D Canvas ref for DNA Double Helix
  const dnaMountRef = useRef<HTMLDivElement | null>(null);
  const franklin = REAL_SCIENTISTS.find(s => s.id === 'franklin');
  const availableOrganelles = ORGANELLES.filter(o => o.foundIn === 'both' || o.foundIn === cellType);

  // Handle base pair matching quiz
  const handlePairCheck = (candidate: 'A' | 'T' | 'C' | 'G') => {
    setUserPair(candidate);
    const correctComplement: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
    if (correctComplement[selectedBase] === candidate) {
      setPairFeedback(language === 'ar' ? `صحيح! يرتبط ${selectedBase} بـ ${candidate} بروابط هيدروجينية نوعية.` : `Correct! ${selectedBase} pairs with ${candidate} via specific hydrogen bonds.`);
    } else {
      setPairFeedback(language === 'ar' ? `غير صحيح. القاعدة المكملة لـ ${selectedBase} هي ${correctComplement[selectedBase]}.` : `Incorrect. The complementary base for ${selectedBase} is ${correctComplement[selectedBase]}.`);
    }
  };

  // 3D Double Helix Render
  useEffect(() => {
    if (activeTab !== 'dna') return;
    const mount = dnaMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(3, 4, 5);
    scene.add(dir);

    // Build DNA Double Helix Geometry
    const helixGroup = new THREE.Group();
    const turns = 2.5;
    const pointsCount = 40;
    const radius = 1.2;
    const heightSpan = 5.0;

    for (let i = 0; i < pointsCount; i++) {
      const tNorm = i / pointsCount;
      const angle = tNorm * Math.PI * 2 * turns;
      const y = (tNorm - 0.5) * heightSpan;

      // Strand 1 (Sugar-Phosphate Backbone)
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;

      // Strand 2 (Antiparallel 180 deg offset)
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // Backbone spheres
      const bbGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const bbMat1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const bbMat2 = new THREE.MeshStandardMaterial({ color: 0x818cf8 });

      const s1 = new THREE.Mesh(bbGeo, bbMat1);
      s1.position.set(x1, y, z1);
      helixGroup.add(s1);

      const s2 = new THREE.Mesh(bbGeo, bbMat2);
      s2.position.set(x2, y, z2);
      helixGroup.add(s2);

      // Base pair rungs (Cylinder connecting strands)
      if (i % 2 === 0) {
        const p1 = new THREE.Vector3(x1, y, z1);
        const p2 = new THREE.Vector3(x2, y, z2);
        const dist = p1.distanceTo(p2);

        const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, dist, 12);
        const rungMat = new THREE.MeshStandardMaterial({ color: i % 4 === 0 ? 0xef4444 : 0x10b981 });
        const rung = new THREE.Mesh(rungGeo, rungMat);

        rung.position.copy(new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5));
        rung.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        helixGroup.add(rung);
      }
    }

    scene.add(helixGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      helixGroup.rotation.y += 0.01;
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
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            Interactive Cytology & Molecular Genetics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {language === 'ar' ? 'مختبر العلوم الحيوية والخلية والوراثة' : 'Biological Sciences & Genetics Laboratory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.biology.subtitle}</p>
        </div>

        {/* Lab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('cytology')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cytology' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'البيولوجيا الخلوية (Cytology)' : 'Cellular Cytology'}
          </button>
          <button
            onClick={() => setActiveTab('dna')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'dna' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الحمض النووي DNA والوراثة الجزيئية' : '3D DNA & Molecular Genetics'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CELL CYTOLOGY */}
      {activeTab === 'cytology' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {cellType === 'plant' 
                    ? (language === 'ar' ? 'الخلية النباتية ذاتية التغذية' : 'Autotrophic Plant Cell') 
                    : (language === 'ar' ? 'الخلية الحيوانية غير ذاتية التغذية' : 'Heterotrophic Animal Cell')}
                </h3>
                <span className="text-xs text-slate-400">
                  {language === 'ar' ? 'انقر على أي عضية لفحص الأبعاد والمهمة الحيوية' : 'Select any organelle to examine biological function'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCellType('plant')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    cellType === 'plant' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.biology.plantCell}
                </button>
                <button
                  onClick={() => setCellType('animal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    cellType === 'animal' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.biology.animalCell}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableOrganelles.map((organelle) => {
                const isSelected = selectedOrganelle.id === organelle.id;
                return (
                  <button
                    key={organelle.id}
                    onClick={() => setSelectedOrganelle(organelle)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">
                        {language === 'ar' ? organelle.nameAr : organelle.nameEn}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{organelle.sizeNm}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>{language === 'ar' ? 'جهد الغشاء الخلوي: -70 ملي فولت' : 'Cell Membrane Resting Potential: -70 mV'}</span>
              <span className="text-emerald-400 font-mono">{language === 'ar' ? 'تركيز أدينوسين ثلاثي الفوسفات: ~5 ملي مولار' : 'Cytosolic ATP: ~5 mM'}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">
                  {language === 'ar' ? 'فحص العضية الخلوية' : 'Organelle Details'}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {language === 'ar' ? selectedOrganelle.nameAr : selectedOrganelle.nameEn}
                </h3>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {language === 'ar' ? 'الوظيفة الحيوية والتخليق' : 'Biological Function'}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {language === 'ar' ? selectedOrganelle.roleAr : selectedOrganelle.roleEn}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">{language === 'ar' ? 'المقاييس' : 'Scale'}</span>
                  <span className="font-mono text-white">{selectedOrganelle.sizeNm}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 3D DNA DOUBLE HELIX & BASE PAIRING */}
      {activeTab === 'dna' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[520px]">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? 'النموذج الجزيئي للولب المزدوج (B-DNA)' : '3D Molecular Double Helix (B-DNA Form)'}
              </span>
              <span className="text-xs font-mono text-indigo-400">10 Base Pairs / Turn • 3.4 nm Pitch</span>
            </div>
            <div ref={dnaMountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'تحدي ازدواج القواعد النيتروجينية' : 'Base Pairing Verification'}
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'ar' ? 'اختر القاعدة المكملة المناسبة لتكوين الروابط الهيدروجينية:' : 'Select the matching complementary nucleotide:'}
              </p>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400">Base:</span>
                <span className="px-3 py-1 rounded bg-indigo-600 text-white font-mono font-bold text-sm">
                  {selectedBase}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {(['A', 'T', 'C', 'G'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => handlePairCheck(b)}
                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-indigo-600 text-white font-mono font-bold text-sm transition-all"
                  >
                    {b}
                  </button>
                ))}
              </div>

              {pairFeedback && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-emerald-400">
                  {pairFeedback}
                </div>
              )}
            </div>

            {/* Rosalind Franklin Card */}
            {franklin && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center space-x-2 text-teal-400">
                  <Award className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'رائدة علم البلورات الجزيئي' : 'Scientific Pioneer'}
                  </h4>
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{franklin.name}</span>
                  <span className="text-[11px] text-slate-400">{franklin.dates} • {franklin.field}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar' ? franklin.contributionsAr : franklin.contributionsEn}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {franklin.citation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
