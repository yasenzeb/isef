import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { useLanguage } from '../context/LanguageContext';
import { REAL_SCIENTISTS } from '../data/scientistsData';
import { Dna, Award, Check, Eye, EyeOff, Layers, Scissors, ShieldAlert, Sparkles, Maximize2 } from 'lucide-react';
import { SKETCHFAB_ANATOMY_COLLECTION, AnatomyAtlasModel } from '../data/sketchfabAnatomyData';
import { SketchfabViewerModal } from './SketchfabViewerModal';

interface OrganelleData {
  id: string;
  nameEn: string;
  nameAr: string;
  color: number;
  position: [number, number, number];
  radius: number;
  roleEn: string;
  roleAr: string;
  foundIn: 'both' | 'plant' | 'animal';
  sizeNm: string;
}

const ORGANELLES_3D: OrganelleData[] = [
  {
    id: 'nucleus',
    nameEn: 'Nucleus & Nucleolus',
    nameAr: 'النواة والنوية',
    color: 0x8b5cf6,
    position: [0, 0, 0],
    radius: 0.9,
    roleEn: 'Repository of genomic DNA; coordinates transcription, mRNA splicing, and chromosome replication.',
    roleAr: 'مستودع المادة الوراثية (DNA)؛ تدير نسخ الجينات وانقسام الخلية وتخليق وتجميع الريبوسومات في النوية.',
    foundIn: 'both',
    sizeNm: '5,000 - 10,000 nm',
  },
  {
    id: 'mitochondria',
    nameEn: 'Mitochondria (Powerhouse)',
    nameAr: 'الميتوكوندريا (المتقدرات)',
    color: 0xf97316,
    position: [1.6, 0.7, 0.5],
    radius: 0.45,
    roleEn: 'ATP synthesis via oxidative phosphorylation, electron transport chain, and citric acid cycle.',
    roleAr: 'محطة توليد الطاقة للخلية؛ تنتج جزيئات ATP عبر الفسفرة التأكسدية وسلسلة نقل الإلكترونات ودورة كريبس.',
    foundIn: 'both',
    sizeNm: '500 - 1,000 nm',
  },
  {
    id: 'chloroplast',
    nameEn: 'Chloroplast (Thylakoids)',
    nameAr: 'البلاستيدة الخضراء',
    color: 0x10b981,
    position: [-1.5, 0.9, -0.6],
    radius: 0.5,
    roleEn: 'Photosynthesis site containing chlorophyll stacks; converts photon energy into glucose in the Calvin cycle.',
    roleAr: 'مقر البناء الضوئي؛ تحول طاقة الضوء وثاني أكسيد الكربون إلى سكريات ونشويات عبر دورة كالفن.',
    foundIn: 'plant',
    sizeNm: '2,000 - 5,000 nm',
  },
  {
    id: 'golgi',
    nameEn: 'Golgi Apparatus',
    nameAr: 'جهاز غولجي الإفرازي',
    color: 0xeab308,
    position: [-1.2, -0.8, 0.8],
    radius: 0.4,
    roleEn: 'Modifies, sorts, and packages glycoproteins and lipids for intra- and extracellular secretion.',
    roleAr: 'تعديل وطيّ وتغليف البروتينات والليبيدات الإفرازية في حويصلات متخصصة للنقل داخل الخلية أو خارجها.',
    foundIn: 'both',
    sizeNm: '1,000 - 2,000 nm',
  },
  {
    id: 'er',
    nameEn: 'Endoplasmic Reticulum (Rough & Smooth)',
    nameAr: 'الشبكة الإندوبلازمية (الخشنة والملساء)',
    color: 0xec4899,
    position: [0.9, -0.9, -0.5],
    radius: 0.55,
    roleEn: 'Rough ER synthesizes membrane proteins; smooth ER synthesizes lipids and handles calcium homeostasis.',
    roleAr: 'تخليق سلاسل البروتين بواسطة ريبوسومات الشبكة الخشنة، وتخليق الليبيدات وإزالة السموم في الشبكة الملساء.',
    foundIn: 'both',
    sizeNm: 'Variable membranous folds',
  },
  {
    id: 'vacuole',
    nameEn: 'Central / Cellular Vacuole',
    nameAr: 'الفجوة العصارية المركزية',
    color: 0x06b6d4,
    position: [0, 1.4, -0.8],
    radius: 0.7,
    roleEn: 'Maintains turgor pressure against the cell wall, stores amino acids, nutrients, and waste products.',
    roleAr: 'تحافظ على ضغط الامتلاء الإسموزي داخل الخلية، وتخزن المواد الغذائية والأيونات المائية والأصباغ.',
    foundIn: 'both',
    sizeNm: 'Large central compartment',
  },
  {
    id: 'cell_wall',
    nameEn: 'Cellulose Cell Wall',
    nameAr: 'الجدار الخلوي السليولوزي',
    color: 0x22c55e,
    position: [0, 0, 0],
    radius: 2.8,
    roleEn: 'Rigid outer matrix of cellulose microfibrils that resists osmotic lysis and provides mechanical structure.',
    roleAr: 'دعامة تركيبية صلبة تقاوم ضغط الامتلاء الإسموزي الداخلي وتحمي الخلية النباتية من التمزق.',
    foundIn: 'plant',
    sizeNm: '100 - 1,000 nm thick',
  },
];

export const BiologyLab: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'cell_3d' | 'dna' | 'sketchfab_cell'>('cell_3d');
  const [cellType, setCellType] = useState<'plant' | 'animal'>('plant');
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleData>(ORGANELLES_3D[0]);
  const [isCrossSection, setIsCrossSection] = useState(true);
  const [selectedSketchfabModel, setSelectedSketchfabModel] = useState<AnatomyAtlasModel | null>(null);

  // DNA Interactive Base-Pairing State
  const [selectedBase, setSelectedBase] = useState<'A' | 'T' | 'C' | 'G'>('A');
  const [userPair, setUserPair] = useState<string | null>(null);
  const [pairFeedback, setPairFeedback] = useState<string | null>(null);

  // 3D Canvas refs
  const cellMountRef = useRef<HTMLDivElement | null>(null);
  const dnaMountRef = useRef<HTMLDivElement | null>(null);
  const organelleMeshes = useRef<Map<string, THREE.Mesh>>(new Map());

  const franklin = REAL_SCIENTISTS.find(s => s.id === 'franklin');
  const activeOrganelles = ORGANELLES_3D.filter(o => o.foundIn === 'both' || o.foundIn === cellType);

  // Base pair matching quiz
  const handlePairCheck = (candidate: 'A' | 'T' | 'C' | 'G') => {
    setUserPair(candidate);
    const correctComplement: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
    if (correctComplement[selectedBase] === candidate) {
      setPairFeedback(
        language === 'ar' 
          ? `صحيح ومطابق علمياً! يرتبط ${selectedBase} بالقاعدة المكملة ${candidate} بواسطة روابط هيدروجينية نوعية.` 
          : `Correct! ${selectedBase} bonds with complementary ${candidate} via specific hydrogen bonding.`
      );
    } else {
      setPairFeedback(
        language === 'ar' 
          ? `غير صحيح. القاعدة النيتروجينية المكملة لـ ${selectedBase} هي ${correctComplement[selectedBase]}.` 
          : `Incorrect. The complementary nitrogenous base for ${selectedBase} is ${correctComplement[selectedBase]}.`
      );
    }
  };

  // 3D Interactive Cell Simulation
  useEffect(() => {
    if (activeTab !== 'cell_3d') return;
    const mount = cellMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b18);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const pointLight = new THREE.PointLight(0x38bdf8, 2, 20);
    pointLight.position.set(4, 5, 5);
    scene.add(pointLight);

    const cellGroup = new THREE.Group();
    organelleMeshes.current.clear();

    // Outer Membrane / Wall
    const membraneGeo = cellType === 'plant' 
      ? new THREE.BoxGeometry(4.8, 3.8, 3.8)
      : new THREE.SphereGeometry(2.4, 32, 32, 0, Math.PI * (isCrossSection ? 1.5 : 2));

    const membraneMat = new THREE.MeshStandardMaterial({
      color: cellType === 'plant' ? 0x15803d : 0x0284c7,
      transparent: true,
      opacity: 0.18,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });
    const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    cellGroup.add(membraneMesh);

    // Anatomically realistic organelles
    activeOrganelles.forEach(org => {
      if (org.id === 'cell_wall') return; // Rendered as container

      const orgSubgroup = new THREE.Group();
      orgSubgroup.position.set(...org.position);

      if (org.id === 'nucleus') {
        // Double-membrane nuclear envelope with nucleolus inside and chromatin texture
        const envelopeGeo = new THREE.SphereGeometry(org.radius, 32, 32, 0, Math.PI * 1.6);
        const envelopeMat = new THREE.MeshStandardMaterial({
          color: 0x7c3aed,
          roughness: 0.35,
          metalness: 0.1,
          side: THREE.DoubleSide,
        });
        const envelopeMesh = new THREE.Mesh(envelopeGeo, envelopeMat);
        envelopeMesh.userData = { id: org.id };
        organelleMeshes.current.set(org.id, envelopeMesh);
        orgSubgroup.add(envelopeMesh);

        // Dense inner Nucleolus
        const nucleolusGeo = new THREE.SphereGeometry(org.radius * 0.42, 24, 24);
        const nucleolusMat = new THREE.MeshStandardMaterial({
          color: 0xa855f7,
          emissive: 0x6b21a8,
          emissiveIntensity: 0.3,
          roughness: 0.5,
        });
        const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat);
        nucleolusMesh.userData = { id: org.id };
        orgSubgroup.add(nucleolusMesh);

      } else if (org.id === 'mitochondria') {
        // Outer mitochondrial membrane
        const outerGeo = new THREE.CapsuleGeometry(0.24, 0.55, 16, 24);
        const outerMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          transparent: true,
          opacity: 0.85,
          roughness: 0.35,
        });
        const mitoMesh = new THREE.Mesh(outerGeo, outerMat);
        mitoMesh.userData = { id: org.id };
        organelleMeshes.current.set(org.id, mitoMesh);
        mitoMesh.rotation.z = Math.PI / 3;
        orgSubgroup.add(mitoMesh);

        // Inner folding cristae (stacked internal discs)
        for (let c = -2; c <= 2; c++) {
          const cristaGeo = new THREE.TorusGeometry(0.14, 0.03, 8, 16);
          const cristaMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.3 });
          const cristaMesh = new THREE.Mesh(cristaGeo, cristaMat);
          cristaMesh.position.set(0, c * 0.1, 0);
          cristaMesh.rotation.x = Math.PI / 2;
          mitoMesh.add(cristaMesh);
        }

      } else if (org.id === 'chloroplast') {
        // Biconvex chloroplast stroma
        const stromaGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.22, 24);
        const stromaMat = new THREE.MeshStandardMaterial({
          color: 0x059669,
          roughness: 0.4,
          transparent: true,
          opacity: 0.9,
        });
        const chloroMesh = new THREE.Mesh(stromaGeo, stromaMat);
        chloroMesh.userData = { id: org.id };
        organelleMeshes.current.set(org.id, chloroMesh);
        orgSubgroup.add(chloroMesh);

        // Thylakoid grana stacks (green coin columns)
        [-0.18, 0.18].forEach(gx => {
          for (let gy = -0.06; gy <= 0.06; gy += 0.04) {
            const thylakoid = new THREE.Mesh(
              new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16),
              new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.2 })
            );
            thylakoid.position.set(gx, gy, 0);
            chloroMesh.add(thylakoid);
          }
        });

      } else if (org.id === 'golgi') {
        // Stack of curved cisternae membranes
        const golgiContainer = new THREE.Mesh(
          new THREE.SphereGeometry(0.01, 4, 4),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        golgiContainer.userData = { id: org.id };
        organelleMeshes.current.set(org.id, golgiContainer);
        orgSubgroup.add(golgiContainer);

        for (let i = 0; i < 4; i++) {
          const cisternaGeo = new THREE.TorusGeometry(0.35 + i * 0.06, 0.04, 12, 24, Math.PI * 0.85);
          const cisternaMat = new THREE.MeshStandardMaterial({
            color: 0xeab308,
            roughness: 0.35,
          });
          const cisterna = new THREE.Mesh(cisternaGeo, cisternaMat);
          cisterna.position.set(0, (i - 1.5) * 0.09, 0);
          cisterna.rotation.x = Math.PI / 4;
          cisterna.rotation.z = Math.PI * 0.1;
          orgSubgroup.add(cisterna);
        }

        // Secretory vesicles budding off
        for (let v = 0; v < 3; v++) {
          const vesicle = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xfde047 })
          );
          vesicle.position.set(0.35 + v * 0.1, 0.1 - v * 0.1, 0.1);
          orgSubgroup.add(vesicle);
        }

      } else if (org.id === 'er') {
        // Wavy folded tubule network wrapping outward from nucleus
        const erMeshAnchor = new THREE.Mesh(
          new THREE.SphereGeometry(0.01, 4, 4),
          new THREE.MeshBasicMaterial({ visible: false })
        );
        erMeshAnchor.userData = { id: org.id };
        organelleMeshes.current.set(org.id, erMeshAnchor);
        orgSubgroup.add(erMeshAnchor);

        for (let ring = 0; ring < 3; ring++) {
          const tubeGeo = new THREE.TorusGeometry(0.4 + ring * 0.15, 0.05, 12, 32, Math.PI * 1.2);
          const tubeMat = new THREE.MeshStandardMaterial({
            color: 0xdb2777,
            roughness: 0.4,
          });
          const tube = new THREE.Mesh(tubeGeo, tubeMat);
          tube.position.set((ring - 1) * 0.08, (ring - 1) * 0.06, 0);
          tube.rotation.y = (ring * Math.PI) / 6;
          tube.rotation.x = Math.PI / 3;
          orgSubgroup.add(tube);
        }

      } else if (org.id === 'vacuole') {
        // Turgid liquid reservoir
        const vacGeo = new THREE.SphereGeometry(org.radius, 28, 28);
        const vacMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          transparent: true,
          opacity: 0.65,
          roughness: 0.1,
          metalness: 0.1,
        });
        const vacMesh = new THREE.Mesh(vacGeo, vacMat);
        vacMesh.userData = { id: org.id };
        organelleMeshes.current.set(org.id, vacMesh);
        orgSubgroup.add(vacMesh);

      } else {
        const fallbackGeo = new THREE.DodecahedronGeometry(org.radius);
        const fallbackMat = new THREE.MeshStandardMaterial({
          color: org.color,
          roughness: 0.4,
        });
        const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
        fallbackMesh.userData = { id: org.id };
        organelleMeshes.current.set(org.id, fallbackMesh);
        orgSubgroup.add(fallbackMesh);
      }

      cellGroup.add(orgSubgroup);
    });

    scene.add(cellGroup);

    // Raycaster click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(organelleMeshes.current.values());
      const intersects = raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const orgId = hit.userData.id;
        const targetOrg = ORGANELLES_3D.find(o => o.id === orgId);
        if (targetOrg) setSelectedOrganelle(targetOrg);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow majestic rotation
      cellGroup.rotation.y += 0.0025;

      // Realistic cytoplasmic organelle drifting & respiration pulse
      const mito = organelleMeshes.current.get('mitochondria');
      if (mito) {
        mito.position.y = 0.7 + Math.sin(elapsedTime * 2.2) * 0.04;
        mito.rotation.z = Math.PI / 3 + Math.sin(elapsedTime * 1.5) * 0.05;
      }

      const nucleus = organelleMeshes.current.get('nucleus');
      if (nucleus) {
        const pulse = 1 + Math.sin(elapsedTime * 1.8) * 0.02;
        nucleus.scale.set(pulse, pulse, pulse);
      }

      const chloroplast = organelleMeshes.current.get('chloroplast');
      if (chloroplast) {
        chloroplast.position.y = 0.9 + Math.cos(elapsedTime * 2.0) * 0.03;
      }

      const golgi = organelleMeshes.current.get('golgi');
      if (golgi) {
        golgi.position.x = -1.2 + Math.sin(elapsedTime * 1.2) * 0.03;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [activeTab, cellType, isCrossSection]);

  // 3D DNA Helix Render
  useEffect(() => {
    if (activeTab !== 'dna') return;
    const mount = dnaMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b18);

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
    const pointsCount = 44;
    const radius = 1.25;
    const heightSpan = 5.2;

    for (let i = 0; i < pointsCount; i++) {
      const tNorm = i / pointsCount;
      const angle = tNorm * Math.PI * 2 * turns;
      const y = (tNorm - 0.5) * heightSpan;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      const bbGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const bbMat1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const bbMat2 = new THREE.MeshStandardMaterial({ color: 0x818cf8 });

      const s1 = new THREE.Mesh(bbGeo, bbMat1);
      s1.position.set(x1, y, z1);
      helixGroup.add(s1);

      const s2 = new THREE.Mesh(bbGeo, bbMat2);
      s2.position.set(x2, y, z2);
      helixGroup.add(s2);

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sky-500/15 pb-5">
        <div>
          <span className="sci-badge">
            {language === 'ar' ? 'المجسمات الخلوية ثلاثية الأبعاد والوراثة' : 'Interactive 3D Cytology & Molecular Genetics'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {language === 'ar' ? 'مختبر العلوم الحيوية والخلية والوراثة' : 'Biological Sciences & Genetics Laboratory'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.biology.subtitle}</p>
        </div>

        {/* Lab Switcher */}
        <div className="flex items-center space-x-2 sci-surface p-1.5">
          <button
            onClick={() => setActiveTab('cell_3d')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cell_3d' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'مجسم الخلية ثلاثي الأبعاد' : '3D Cell Ultrastructure'}
          </button>
          <button
            onClick={() => setActiveTab('sketchfab_cell')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'sketchfab_cell' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ar' ? 'مجسم الخلية الحقيقي الكامل (3D تفاعلي)' : 'Realistic 3D Animal Cell Specimen'}</span>
          </button>
          <button
            onClick={() => setActiveTab('dna')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'dna' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الحمض النووي DNA والوراثة الجزيئية' : '3D DNA & Molecular Genetics'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 3D INTERACTIVE CELL */}
      {activeTab === 'cell_3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card overflow-hidden flex flex-col h-[540px]">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-sky-500/15 flex flex-wrap items-center justify-between gap-2 z-10">
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
                    cellType === 'animal' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {t.biology.animalCell}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCrossSection(!isCrossSection)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    isCrossSection ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'الوضع المقطعي (Cross-Section)' : 'Cross-Section Mode'}</span>
                </button>
              </div>
            </div>

            <div ref={cellMountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

            <div className="bg-slate-950/90 px-4 py-2 border-t border-sky-500/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>{language === 'ar' ? 'انقر على أي عضية ثلاثية الأبعاد لفحصها' : 'Click on any 3D organelle to inspect biological role'}</span>
              <span className="text-sky-400 font-mono">Zoom / Orbit Enabled</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="sci-card p-6 space-y-4">
              <div className="border-b border-sky-500/15 pb-3">
                <span className="text-xs text-slate-400 block uppercase tracking-wider">
                  {language === 'ar' ? 'فحص العضية الخلوية' : 'Inspected Organelle'}
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {language === 'ar' ? selectedOrganelle.nameAr : selectedOrganelle.nameEn}
                </h3>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {language === 'ar' ? 'الوظيفة الحيوية والتخليق' : 'Biological Function'}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-sky-500/15">
                  {language === 'ar' ? selectedOrganelle.roleAr : selectedOrganelle.roleEn}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'الأبعاد المجهرية' : 'Scale'}</span>
                  <span className="font-mono text-sky-400">{selectedOrganelle.sizeNm}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-sky-500/10">
                  <span className="text-slate-400">{language === 'ar' ? 'التواجد' : 'Distribution'}</span>
                  <span className="text-white">
                    {selectedOrganelle.foundIn === 'both' 
                      ? (language === 'ar' ? 'مشتركة (نباتية وحيوانية)' : 'Plant & Animal') 
                      : (language === 'ar' ? 'نباتية فقط' : 'Plant specific')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 3D DNA DOUBLE HELIX & BASE PAIRING */}
      {activeTab === 'dna' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sci-card overflow-hidden relative flex flex-col h-[520px]">
            <div className="bg-slate-950/80 px-4 py-3 border-b border-sky-500/15 flex items-center justify-between z-10">
              <span className="text-xs font-bold text-white">
                {language === 'ar' ? 'النموذج الجزيئي للولب المزدوج (B-DNA Form)' : '3D Molecular Double Helix (B-DNA Form)'}
              </span>
              <span className="text-xs font-mono text-sky-400">10 Base Pairs / Turn • 3.4 nm Pitch</span>
            </div>
            <div ref={dnaMountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />
          </div>

          <div className="space-y-6">
            <div className="sci-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {language === 'ar' ? 'تحدي ازدواج القواعد النيتروجينية' : 'Base Pairing Verification'}
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'ar' ? 'اختر القاعدة المكملة المناسبة لتكوين الروابط الهيدروجينية:' : 'Select the matching complementary nucleotide:'}
              </p>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400">Target Base:</span>
                <span className="px-3 py-1 rounded bg-sky-600 text-white font-mono font-bold text-sm">
                  {selectedBase}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {(['A', 'T', 'C', 'G'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => handlePairCheck(b)}
                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-sky-600 text-white font-mono font-bold text-sm transition-all"
                  >
                    {b}
                  </button>
                ))}
              </div>

              {pairFeedback && (
                <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30 text-xs font-medium text-emerald-400">
                  {pairFeedback}
                </div>
              )}
            </div>

            {/* Rosalind Franklin Card */}
            {franklin && (
              <div className="sci-card p-5 space-y-3">
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

      {/* VIEW 3: FULL REALISTIC 3D ANIMAL & PLANT CELL SPECIMENS */}
      {activeTab === 'sketchfab_cell' && (
        <div className="space-y-6">
          <div className="sci-card overflow-hidden h-[620px] flex flex-col border border-sky-500/25">
            <div className="bg-slate-950/90 px-5 py-3 border-b border-sky-500/15 flex flex-wrap items-center justify-between gap-3 z-10">
              <div className="flex items-center space-x-2">
                <span className="sci-badge flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {cellType === 'plant' 
                      ? (language === 'ar' ? 'مجسم الخلية النباتية الحقيقي 3D' : 'Authentic 3D Plant Cell Specimen')
                      : (language === 'ar' ? 'مجسم الخلية الحيوانية الحقيقي 3D' : 'Authentic 3D Animal Cell Specimen')}
                  </span>
                </span>
                <span className="text-xs text-slate-400">
                  {cellType === 'plant'
                    ? (language === 'ar' ? 'جدار خلوي، فجوة عصارية، وبلاستيدات خضراء' : 'Cellulose wall, turgor vacuole & chloroplasts')
                    : (language === 'ar' ? 'نموذج كامل بتشريح وتفاصيل العضيات' : 'Interactive Cell Dissection & Organelles')}
                </span>
              </div>

              {/* Plant vs Animal Toggle */}
              <div className="flex items-center space-x-2 sci-surface p-1">
                <button
                  onClick={() => setCellType('plant')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    cellType === 'plant' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'الخلية النباتية' : 'Plant Cell'}
                </button>
                <button
                  onClick={() => setCellType('animal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    cellType === 'animal' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'الخلية الحيوانية' : 'Animal Cell'}
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black relative">
              <iframe
                key={cellType}
                title={cellType === 'plant' ? "Plant Cell 3D" : "Animal Cell 3D"}
                className="w-full h-full border-0"
                src={cellType === 'plant' 
                  ? "https://sketchfab.com/models/1c5ce80d03d149208d30cc5aeb6e42fb/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0"
                  : "https://sketchfab.com/models/3a90e22871004d92a020c54e8964938c/embed?autostart=1&ui_controls=1&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=1&ui_stop=0"}
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            </div>
          </div>

          {/* Cell & Molecular Specimens Grid */}
          <div className="sci-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{language === 'ar' ? 'نماذج خلوية وجزيئية إضافية عالية الدقة' : 'Additional High-Detail Cytology & Molecular 3D Models'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SKETCHFAB_ANATOMY_COLLECTION.filter(m => m.category === 'cell' || m.id === 'muscle-tissue').map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedSketchfabModel(item)}
                  className="group sci-surface p-3 rounded-xl border border-sky-500/15 hover:border-sky-400/50 hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-slate-950">
                    <img src={item.thumbnail} alt={item.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-sky-600/90 text-white text-xs font-bold px-2.5 py-1 rounded shadow flex items-center space-x-1">
                        <Maximize2 className="w-3 h-3" />
                        <span>{language === 'ar' ? 'عرض 3D' : 'Open 3D'}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {language === 'ar' ? item.titleAr : item.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {language === 'ar' ? item.descriptionAr : item.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sketchfab Modal */}
      {selectedSketchfabModel && (
        <SketchfabViewerModal
          model={selectedSketchfabModel}
          onClose={() => setSelectedSketchfabModel(null)}
          language={language}
        />
      )}

    </div>
  );
};
