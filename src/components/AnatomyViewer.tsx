import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, GLTFLoader, DRACOLoader, FBXLoader } from 'three-stdlib';
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
  RefreshCw,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SKETCHFAB_ANATOMY_COLLECTION, AnatomyAtlasModel } from '../data/sketchfabAnatomyData';
import { SketchfabViewerModal } from './SketchfabViewerModal';
import SKELETAL_BONE_DICTIONARY from '../data/skeletalBoneDictionary.json';

interface AnatomyViewerProps {
  isPresentationMode?: boolean;
}

export type AnatomySystemId = 'skeletal' | 'ecorche' | 'muscular' | 'cardiovascular' | 'nervous' | 'visceral' | 'joints' | 'lymphatic';

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
  { id: 'skeletal', labelEn: 'Skeletal System (Bones)', labelAr: 'الهيكل العظمي', file: 'skeletal.glb', color: 0xe2ded4, icon: Bone, defaultVisible: true },
  { id: 'ecorche', labelEn: 'Muscular Anatomy System', labelAr: 'التشريح العضلي الكامل', file: 'male_full_body_ecorche.glb', color: 0xa82020, icon: Activity, defaultVisible: false },
  { id: 'muscular', labelEn: 'Deep Muscular Fibers', labelAr: 'الجهاز العضلي التفصيلي', file: 'muscular.glb', color: 0xb91c1c, icon: Activity, defaultVisible: false },
  { id: 'cardiovascular', labelEn: 'Cardiovascular & Heart', labelAr: 'الجهاز الدوري والقلب', file: 'cardiovascular.glb', color: 0xdc2626, icon: Heart, defaultVisible: false },
  { id: 'nervous', labelEn: 'Nervous System & Brain', labelAr: 'الجهاز العصبي والدماغ', file: 'nervous.glb', color: 0xeab308, icon: Brain, defaultVisible: false },
  { id: 'visceral', labelEn: 'Visceral Organs', labelAr: 'الأعضاء الحشوية', file: 'visceral.glb', color: 0xbf6b59, icon: Layers, defaultVisible: false },
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
  'Patella': {
    ar: 'عظم الرضفة (صابونة الركبة)',
    descEn: 'Sesamoid bone embedded within the quadriceps tendon that increases mechanical leverage of the extensor apparatus.',
    descAr: 'عظم سمسماني يقع داخل وتر العضلة رباعية الرؤوس، يزيد من العزم الميكانيكي لبسط مفصل الركبة.',
  },
  'Clavicle': {
    ar: 'عظم الترقوة',
    descEn: 'S-shaped strut bone connecting the axial skeleton (sternum) to the shoulder girdle (acromion of scapula).',
    descAr: 'عظم منحني على شكل حرف S يربط الهيكل المحوري (عظم القص) بحزام الكتف (اللوح).',
  },
  'Scapula': {
    ar: 'عظم لوح الكتف',
    descEn: 'Flat triangular bone connecting the humerus with the clavicle, anchoring numerous rotator cuff and back muscles.',
    descAr: 'عظم مثلث مسطح يربط العضد بالترقوة ويوفر ارتكازاً لمجموعة عضلات الكفة المدورة وعضلات الظهر.',
  },
  'Sternum': {
    ar: 'عظم القص',
    descEn: 'Flat T-shaped bone in the anterior midline of the thorax, protecting thoracic viscera and articulating with costal cartilages.',
    descAr: 'عظم مسطح في منتصف القفص الصدري يحمي القلب والرئتين وتتمفصل معه الغضاريف الضلعية.',
  },
  'Rib': {
    ar: 'الضلع (القفص الصدري)',
    descEn: 'Curved elastic bone forming the thoracic cage, protecting thoracic organs (heart and lungs) and participating actively in respiration.',
    descAr: 'عظم قوسي مرن يشكل القفص الصدري، يحمي الأحشاء الصدرية الحيوية (القلب والرئتين) ويتمدد مع عضلات الورب أثناء الشهيق والزفير.',
  },
  'Eighth rib': {
    ar: 'الضلع الثامن (ضلع كاذب)',
    descEn: 'Eighth rib, a false rib whose costal cartilage articulates with the cartilage of the rib above rather than directly with the sternum.',
    descAr: 'الضلع الثامن، يصنف كضلع كاذب يتصل غضروفه الضلعي بغضروف الضلع السابع أعلاه بدلاً من التمفصل المباشر مع القص.',
  },
  'Ninth rib': {
    ar: 'الضلع التاسع (ضلع كاذب)',
    descEn: 'Ninth rib, contributing to the costal margin and protecting the upper abdominal viscera including liver and spleen.',
    descAr: 'الضلع التاسع، يسهم في تشكيل الحافة الضلعية السفلية ويحمي الأحشاء العلوية للبطن مثل الكبد والطحال.',
  },
  'Tenth rib': {
    ar: 'الضلع العاشر (ضلع كاذب)',
    descEn: 'Tenth rib, articulates with the costal margin and bounds the inferior aperture of the thorax.',
    descAr: 'الضلع العاشر، يتمفصل مع الحافة الغضروفية الضلعية ويحدد الفتحة الصدرية السفلية.',
  },
  'Eleventh rib': {
    ar: 'الضلع الحادي عشر (ضلع طافٍ)',
    descEn: 'Eleventh rib, a floating rib with no anterior costal cartilage attachment, providing lateral protection to kidneys.',
    descAr: 'الضلع الحادي عشر، ضلع طافٍ غير متصل من الأمام بالقص أو الحافة الضلعية، ويوفر حماية جانبية هامة للكلية.',
  },
  'Twelfth rib': {
    ar: 'الضلع الثاني عشر (ضلع طافٍ)',
    descEn: 'Twelfth rib, the most inferior floating rib anchoring the quadratus lumborum muscle and protecting retroperitoneal organs.',
    descAr: 'الضلع الثاني عشر، الضلع الطافي السفلي، يرتكز عليه العضلة المربعة القطنية ويحمي الكلية والأعضاء خلف الصفاق.',
  },
  'First rib': {
    ar: 'الضلع الأول',
    descEn: 'Broadest, flattest, and most curved rib, forming the superior boundary of the thoracic inlet under the clavicle.',
    descAr: 'أعرض وأقصر وأشد الأضلاع انحناءً، يشكل الحد العلوي لمدخل الصدر ويمر فوقه الشريان والوريد تحت الترقوة.',
  },
  'Second rib': {
    ar: 'الضلع الثاني',
    descEn: 'Twice the length of the first rib, featuring a prominent tuberosity for the serratus anterior muscle.',
    descAr: 'الضلع الثاني، يبلغ ضعف طول الضلع الأول ويحتوي على أحدوبة لارتكاز العضلة المنشارية الأمامية.',
  },
  'Vertebra': {
    ar: 'الفقرة العظمية (العمود الفقري)',
    descEn: 'Individual segment of the vertebral column with body, arch, and processes that encases and shields the spinal cord.',
    descAr: 'عظم متمفصل يشكل لبنة العمود الفقري، يتكون من جسم وقوس وشوكة عظمية تحيط بالحبل الشوكي وتحميه وتنقل وزن الجذع.',
  },
  'Thoracic vertebra': {
    ar: 'فقرة صدرية',
    descEn: 'One of twelve vertebrae featuring costal facets for articulation with the ribs of the thoracic cage.',
    descAr: 'إحدى الفقرات الصدرية الاثنتي عشرة التي تتميز بوجيهات مفصلية غضروفية للتمفصل مع رؤوس وحديبات الأضلاع.',
  },
  'Lumbar vertebra': {
    ar: 'فقرة قطنية',
    descEn: 'Massive weight-bearing vertebra of the lower back designed to support trunk load and facilitate flexion/extension.',
    descAr: 'فقرة عريضة ضخمة في أسفل الظهر مهيأة لتحمل الثقل الميكانيكي الأكبر للجذع وتسهيل الانحناء والبسط.',
  },
  'Cervical vertebra': {
    ar: 'فقرة عنقية',
    descEn: 'One of seven neck vertebrae featuring transverse foramina for vertebral artery passage; includes atlas and axis.',
    descAr: 'إحدى فقرات العنق السبع، تحتوي نواتئها المستعرضة على ثقوب للشريان الفقري وتسمح بمرونة حركة الرأس في كافة الاتجاهات.',
  },
  'Pelvis': {
    ar: 'عظم الحوض (الحزام الحوضي)',
    descEn: 'Bony ring connecting the axial skeleton to the lower limbs, transferring mechanical weight to the femurs.',
    descAr: 'الحلقة العظمية الحوضية التي تربط الهيكل المحوري بالطرفين السفليين وتنقل وزن الجسم إلى عظام الفخذين.',
  },
  'Ilium': {
    ar: 'عظم الحرقفة',
    descEn: 'Superior and largest part of the hip bone forming the iliac crest and the superior part of the acetabulum.',
    descAr: 'الجزء الأكبر والعلوي من عظم الحوض، يشكل العرف الحرقفي وأعلى التجويف الحُقي لمفصل الورك.',
  },
  'Mandible': {
    ar: 'عظم الفك السفلي',
    descEn: 'Strongest and only movable bone of the skull, housing the lower dental arch and enabling mastication.',
    descAr: 'أقوى وعظم الجمجمة الوحيد المتحرك، يحمل الأسنان السفلية ويسهل عمليات المضغ والنطق.',
  },
  'Frontal bone': {
    ar: 'العظم الجبهي',
    descEn: 'Anterior cranial bone forming the forehead, upper orbital rims, and anterior cranial fossa floor.',
    descAr: 'عظم الجمجمة الأمامي الذي يشكل الجبهة وأسقف تجاويف العينين وقاع الحفرة القحفية الأمامية.',
  },
  'Radius': {
    ar: 'عظم الكعبرة',
    descEn: 'Lateral bone of the forearm that rotates around the ulna to allow pronation and supination of the hand.',
    descAr: 'العظم الجانبي للساعد القابل للدوران حول الزند لتمكين حركة الكب والبطح لليد.',
  },
  'Ulna': {
    ar: 'عظم الزند',
    descEn: 'Medial forearm bone forming the primary hinge joint at the elbow via the olecranon process.',
    descAr: 'عظم الساعد الإنسي الذي يشكل المفصل المفصلي الأساسي في المرفق عبر الناتئ الزجي.',
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
  'Left atrium': {
    ar: 'الأذين الأيسر',
    descEn: 'Receives oxygen-rich blood returning from the lungs via four pulmonary veins and delivers it to the left ventricle.',
    descAr: 'يستقبل الدم المؤكسج القادم من الرئتين عبر الأوردة الرئوية الأربعة ويدفعه إلى البطين الأيسر.',
  },
  'Right atrium': {
    ar: 'الأذين الأيمن',
    descEn: 'Receives deoxygenated systemic venous return from the superior and inferior vena cava and coronary sinus.',
    descAr: 'يستقبل الدم غير المؤكسج من أنحاء الجسم عبر الوريدين الأجوفين العلوي والسفلي.',
  },
  'Aorta': {
    ar: 'الشريان الأبهر (الأورطي)',
    descEn: 'Largest systemic artery distributing oxygenated blood from the left ventricle throughout the entire body.',
    descAr: 'أكبر شريان في الجسم، ينطلق من البطين الأيسر ليوزع الدم المؤكسج إلى الرأس والأطراف والأحشاء.',
  },
  'Coronary': {
    ar: 'الشريان التاجي',
    descEn: 'Arterial vessels branching directly off the aortic root to supply oxygenated blood and nutrients to the myocardium.',
    descAr: 'أوعية شريانية تتفرع من قاعدة الأورطي لتغذية عضلة القلب ذاتها بالأكسجين والمواد الغذائية.',
  },
  'Brain': {
    ar: 'الدماغ (المخ)',
    descEn: 'Central organ of the nervous system, containing ~86 billion neurons orchestrating cognitive, motor, and autonomic homeostasis.',
    descAr: 'العضو المركزي للجهاز العصبي، يحتوي على ~86 مليار خلية عصبية تنظم العمليات المعرفية والحركية والاتزان الداخلي.',
  },
  'Spinal cord': {
    ar: 'الحبل الشوكي',
    descEn: 'Cylindrical bundle of nerve fibers continuous with the brainstem, transmitting motor impulses and sensory information.',
    descAr: 'حزمة عصبية أسطوانية تمتد داخل العمود الفقري تنقل الإشارات الحركية والحسية وتتحكم بالأفعال المنعكسة.',
  },
  'Sciatic nerve': {
    ar: 'العصب الوركي (عِرق النَّسا)',
    descEn: 'Largest single nerve in the human body, arising from the sacral plexus (L4-S3) and innervating the lower extremity.',
    descAr: 'أعرض وأطول عصب في جسم الإنسان، يمتد من أسفل الظهر عبر الحوض ليعصب الطرف السفلي بأكمله.',
  },
  'Vagus nerve': {
    ar: 'العصب المبهم (العاشر)',
    descEn: 'Tenth cranial nerve providing extensive parasympathetic innervation to heart, lungs, and digestive tract.',
    descAr: 'العصب القحفي العاشر، العصب السمبتاوي الرئيسي المنظم لضربات القلب وحركة الأمعاء والتنفس.',
  },
  'Liver': {
    ar: 'الكبد',
    descEn: 'Largest visceral metabolic organ responsible for glycogen storage, plasma protein synthesis, bile production, and detoxification.',
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
  'Pancreas': {
    ar: 'البنكرياس',
    descEn: 'Dual-function gland producing endocrine hormones (insulin, glucagon) and exocrine digestive enzymes (amylase, lipase, proteases).',
    descAr: 'غدة مختلطة تفرز هرمونات الإنسولين والجلوكاجون لضبط السكر، والإنزيمات الهاضمة في الإثني عشر.',
  },
  'Spleen': {
    ar: 'الطحال',
    descEn: 'Lymphoid organ filtering blood, removing senescent erythrocytes, storing platelets, and orchestrating immune defenses.',
    descAr: 'عضو لمفاوي هام ينقي الدم من كريات الدم الحمراء الهرمة، ويخزن الصفائح الدموية ويدعم المناعة.',
  },
  'Gallbladder': {
    ar: 'المرارة (الحويصلة الصفراوية)',
    descEn: 'Reservoir beneath the liver storing and concentrating bile before releasing it into the duodenum for lipid emulsification.',
    descAr: 'كيس كمثري يقع أسفل الكبد يخزن العصارة الصفراوية ويركزها قبل إفرازها لهضم واستحلاب الدهون.',
  },
  'Colon': {
    ar: 'القولون (الأمعاء الغليظة)',
    descEn: 'Terminal tract of the digestive system that absorbs water and salts from remaining indigestible food matter.',
    descAr: 'الجزء الأخير من الجهاز الهضمي، يمتص الماء والأملاح من الفضلات ويحتوي على الميكروبيوم النافع.',
  },
  'Biceps': {
    ar: 'العضلة ذات الرأسين العضدية',
    descEn: 'Two-headed anterior arm muscle serving as a powerful supinator of the forearm and flexor of the elbow.',
    descAr: 'عضلة ثنائية الرؤوس في مقدمة الذراع، مسؤولة عن ثني مفصل المرفق وبطح الساعد.',
  },
  'Triceps': {
    ar: 'العضلة ثلاثية الرؤوس العضدية',
    descEn: 'Three-headed posterior arm muscle acting as the primary extensor of the elbow joint.',
    descAr: 'عضلة ثلاثية الرؤوس خلف الذراع، تمثل العضلة الرئيسية المسؤولة عن بسط وفرد مفصل المرفق.',
  },
  'Deltoid': {
    ar: 'العضلة الدالية (عضلة الكتف)',
    descEn: 'Triangular shoulder muscle responsible for arm abduction, flexion, and extension at the glenohumeral joint.',
    descAr: 'عضلة الكتف المثلثة الكبيرة المسؤولة عن تبعيد الذراع ورفعه وتدويره.',
  },
  'Gluteus': {
    ar: 'العضلة الألوية',
    descEn: 'Largest pelvic muscle group providing hip extension, abduction, and stabilization during bipedal locomotion.',
    descAr: 'أكبر مجموعة عضلية في الحوض مسؤولة عن بسط مفصل الورك وتثبيت الحوض أثناء المشي والوقوف.',
  },
};

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({ isPresentationMode = false }) => {
  const { t, language } = useLanguage();
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Loading & Visibility states
  const [loadingSystems, setLoadingSystems] = useState<Record<string, boolean>>({ skeletal: true });
  const [loadedSystems, setLoadedSystems] = useState<Record<string, boolean>>({});
  const [visibleSystems, setVisibleSystems] = useState<Record<string, boolean>>({ skeletal: true });
  const visibleSystemsRef = useRef<Record<string, boolean>>({ skeletal: true });
  const definitionsRef = useRef<Record<string, string>>({});
  const toolbarScrollRef = useRef<HTMLDivElement | null>(null);

  // Background Model Preloading Strategy: Pre-fetch layers so switching is instantaneous
  useEffect(() => {
    // Priority preloading on idle/background
    const preloadLayers = () => {
      SYSTEM_LAYERS.forEach((layer) => {
        if (layer.file) {
          fetch(`/models/anatomy/${layer.file}`, { cache: 'force-cache' }).catch(() => {});
        }
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadLayers);
    } else {
      setTimeout(preloadLayers, 1200);
    }
  }, []);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const systemGroups = useRef<Map<AnatomySystemId, THREE.Group>>(new Map());
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
  const [activeSketchfabModel, setActiveSketchfabModel] = useState<AnatomyAtlasModel | null>(null);
  const vesalius = REAL_SCIENTISTS.find(s => s.id === 'vesalius');

  // Load a specific anatomical system layer
  const loadSystemLayer = (sysConfig: SystemLayerConfig, scene: THREE.Scene) => {
    if (loadedSystems[sysConfig.id] || systemGroups.current.has(sysConfig.id)) return;

    setLoadingSystems(prev => ({ ...prev, [sysConfig.id]: true }));
    const loader = new GLTFLoader();
    if (dracoLoaderRef.current) loader.setDRACOLoader(dracoLoaderRef.current);

    loader.load(
      `/models/anatomy/${sysConfig.file}`,
      (gltf) => {
        const root = gltf.scene;
        root.name = sysConfig.id;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = (mesh.name || '').toLowerCase();
            let matColor = sysConfig.color;
            let roughness = 0.38;
            let metalness = 0.04;

            // Specialized authentic organ color shading (No weird purple defaults)
            if (name.includes('liver')) {
              matColor = 0x78281f; // Deep rich hepatic reddish-brown
              roughness = 0.35;
            } else if (name.includes('stomach') || name.includes('oesophagus') || name.includes('esophagus')) {
              matColor = 0xc97a6e; // Natural gastric mucosa pinkish-tan
              roughness = 0.38;
            } else if (name.includes('lung') || name.includes('bronch') || name.includes('trachea')) {
              matColor = 0xdd8890; // Healthy aerated lung tissue pink
              roughness = 0.55;
            } else if (name.includes('heart') || name.includes('myocardium')) {
              matColor = 0x991b1b; // Cardiac muscle crimson
              roughness = 0.3;
            } else if (name.includes('kidney')) {
              matColor = 0x8a3324; // Renal cortex rich mahogany brown
              roughness = 0.35;
            } else if (name.includes('spleen')) {
              matColor = 0x6b2140; // Natural dark burgundy red
              roughness = 0.35;
            } else if (name.includes('colon') || name.includes('intestine') || name.includes('cecum') || name.includes('appendix') || name.includes('duodenum') || name.includes('jejunum') || name.includes('ileum')) {
              matColor = 0xd4967d; // Intestinal pale mucosal peach/ochre
              roughness = 0.42;
            } else if (name.includes('gallbladder') || name.includes('bile')) {
              matColor = 0x2e6b3e; // Natural bile dark olive green
              roughness = 0.25;
            } else if (name.includes('pancreas')) {
              matColor = 0xdbb078; // Pancreatic glandular pale amber
              roughness = 0.5;
            } else if (name.includes('omentum') || name.includes('meso')) {
              matColor = 0xebd394; // Peritoneal fatty yellow
              roughness = 0.55;
            } else if (name.includes('aorta') || name.includes('artery')) {
              matColor = 0xdc2626; // Oxygenated arterial scarlet
              roughness = 0.3;
            } else if (name.includes('vein') || name.includes('cava')) {
              matColor = 0x2563eb; // Deoxygenated venous royal blue
              roughness = 0.3;
            } else if (sysConfig.id === 'visceral') {
              matColor = 0xbf6b59; // Natural visceral warm organ tone instead of purple
              roughness = 0.4;
            } else if (sysConfig.id === 'skeletal') {
              matColor = 0xf5f2eb; // Cortical bone ivory
              roughness = 0.45;
              metalness = 0.02;
            }

            // For models with embedded textured materials (e.g. ecorche), preserve textures
            const isTexturedLayer = sysConfig.id === 'ecorche';
            if (isTexturedLayer && mesh.material) {
              const origMat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
              const texturedMat = origMat.clone();
              texturedMat.roughness = 0.45;
              texturedMat.metalness = 0.05;
              if (!texturedMat.map) {
                // Vibrant anatomical muscle crimson tone
                texturedMat.color = new THREE.Color(0xa82020);
              }
              mesh.material = texturedMat;
              originalMaterials.current.set(mesh, texturedMat.clone());
            } else {
              const realisticMat = new THREE.MeshStandardMaterial({
                color: matColor,
                roughness,
                metalness,
              });

              originalMaterials.current.set(mesh, realisticMat.clone());
              mesh.material = realisticMat.clone();
            }

            mesh.userData = {
              systemId: sysConfig.id,
              systemName: sysConfig.labelEn,
              rawName: mesh.name || sysConfig.labelEn,
            };
          }
        });

        // Accurate anatomical scale and alignment for user models vs standard meters coordinates
        if (sysConfig.id === 'ecorche') {
          // male_full_body_ecorche.glb: raw height is 68.08 units with center at origin.
          // Scale to exact 1.74m anatomical human height matching skeletal.glb
          const ecorcheScale = 0.02555;
          root.scale.set(ecorcheScale, ecorcheScale, ecorcheScale);
          // Precise Z-offset and Y-offset to sync cervical vertebrae, rib cage, and femoral heads
          root.position.set(0, 1.102, -0.015);
        } else {
          // Authentic Z-Anatomy systems (skeletal, muscular, cardiovascular, nervous, visceral, joints, lymphatic)
          // share origin (0,0,0) in anatomical space
          root.position.set(0, 0, 0);
        }

        root.visible = visibleSystemsRef.current[sysConfig.id] ?? !!sysConfig.defaultVisible;

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

    // Fetch definitions.json in background for enriched anatomy metadata
    fetch('/models/anatomy/definitions.json')
      .then(r => r.json())
      .then(d => { definitionsRef.current = d; })
      .catch(() => {});

    // Initial load: Skeletal layer (first item in SYSTEM_LAYERS)
    loadSystemLayer(SYSTEM_LAYERS[0], scene);

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

        // Clean raw mesh name and remove glTF artifacts like Frontal_bone_1, Mesh_002, etc.
        let rawClean = hit.name
          .replace(/^ZA:/, '')
          .replace(/\.(l|r)$/i, (m, side) => ` (${side.toUpperCase() === 'L' ? 'Left' : 'Right'})`)
          .replace(/_([LR])$/i, (m, side) => ` (${side.toUpperCase() === 'L' ? 'Left' : 'Right'})`)
          .replace(/_(\d+)$/, '') // Removes _1, _2
          .replace(/\.\d+$/, '') // Removes .001, .002
          .replace(/_/g, ' ')
          .trim();

        let cleanName = rawClean;
        const sysId = (hit.userData.systemId || 'skeletal') as AnatomySystemId;
        const sysConfig = SYSTEM_LAYERS.find(s => s.id === sysId) || SYSTEM_LAYERS[0];

        // Specific anatomical resolution for full body ecorche when clicking generic mesh objects
        if (sysId === 'ecorche' || cleanName.includes('Object') || cleanName.includes('Decimation') || cleanName.includes('mesh')) {
          const worldPos = new THREE.Vector3();
          hit.getWorldPosition(worldPos);
          const y = worldPos.y;

          if (y > 1.55) {
            cleanName = 'Facial & Cranial Musculature (عضلات الوجه والجمجمة)';
          } else if (y > 1.40) {
            cleanName = 'Sternocleidomastoid & Neck Musculature (عضلات الرقبة والعضلة القصية الترقوية)';
          } else if (y > 1.20) {
            cleanName = 'Pectoralis Major & Deltoid (عضلات الصدر والكتف)';
          } else if (y > 0.95) {
            cleanName = 'Rectus Abdominis & External Obliques (عضلات البطن المستقيمة والمائلة)';
          } else if (y > 0.75) {
            cleanName = 'Gluteal & Pelvic Girdle Musculature (عضلات الحوض والأليوية)';
          } else if (y > 0.45) {
            cleanName = 'Quadriceps Femoris & Hamstrings (عضلات الفخذ الأمامية والخلفية)';
          } else {
            cleanName = 'Gastrocnemius & Tibialis Anterior (عضلات الساق والربلة)';
          }
        }

        // Comprehensive anatomical lookup
        const baseKey = cleanName.replace(/\s*\((Left|Right)\)/i, '').trim();
        const sideSuffix = cleanName.match(/\((Left|Right)\)/i)?.[1];
        const sideAr = sideSuffix === 'Left' ? ' الأيسر' : sideSuffix === 'Right' ? ' الأيمن' : '';

        const dictRecord = SKELETAL_BONE_DICTIONARY as Record<string, { ar: string; descEn: string; descAr: string }>;
        const directEntry = dictRecord[cleanName] || dictRecord[baseKey] || dictRecord[baseKey.toLowerCase()];

        // Match against dictionary or definitions.json
        const matchedDict = directEntry 
          ? { ar: directEntry.ar + (directEntry.ar.includes('الأيسر') || directEntry.ar.includes('الأيمن') ? '' : sideAr), descEn: directEntry.descEn, descAr: directEntry.descAr }
          : Object.entries(dictRecord).find(([k]) => baseKey.toLowerCase() === k.toLowerCase() || baseKey.toLowerCase().includes(k.toLowerCase()))?.[1]
          || Object.entries(ANATOMY_DICTIONARY).find(([k]) => cleanName.toLowerCase().includes(k.toLowerCase()))?.[1];
        
        let descEn = matchedDict ? matchedDict.descEn : '';
        const nameAr = matchedDict 
          ? matchedDict.ar 
          : (cleanName.includes('(') ? cleanName.split('(')[1]?.replace(')', '') : `${cleanName} (${sysConfig.labelAr})`);
        let descAr = matchedDict ? matchedDict.descAr : '';

        // If not in curated dictionary, check definitions.json
        if (!descEn && definitionsRef.current) {
          const searchKey = cleanName.replace(/\s*\((Left|Right)\)/i, '').trim();
          const defKey = Object.keys(definitionsRef.current).find(k => 
            k.toLowerCase() === searchKey.toLowerCase() || 
            k.toLowerCase().includes(searchKey.toLowerCase()) || 
            searchKey.toLowerCase().includes(k.toLowerCase())
          );
          if (defKey) {
            const defText = definitionsRef.current[defKey];
            descEn = defText.split(/==|\n/)[0].replace(/https?:\/\/\S+/g, '').trim();
          }
        }

        if (!descEn) {
          descEn = `Detailed clinical anatomy specimen belonging to the ${sysConfig.labelEn}.`;
        }
        if (!descAr) {
          descAr = `بِنية تشريحية حقيقية وموثقة تتبع ${sysConfig.labelAr}.`;
        }

        const worldHitPos = new THREE.Vector3();
        hit.getWorldPosition(worldHitPos);

        setSelectedStructure({
          nameEn: cleanName || sysConfig.labelEn,
          nameAr: nameAr,
          system: `${sysConfig.labelEn} — ${sysConfig.labelAr}`,
          descEn: descEn,
          descAr: descAr,
          region: worldHitPos.y > 1.3 ? 'Cranial / Head & Neck (الرأس والعنق)' : worldHitPos.y > 0.7 ? 'Thorax & Trunk (الصدر والجذع)' : 'Lower Extremities (الأطراف السفلية)',
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

  // Toggle visibility and lazy load system layers - Synchronous ref update fixes double-click bug!
  const toggleSystem = (sys: SystemLayerConfig) => {
    const isCurrentlyVisible = visibleSystemsRef.current[sys.id] ?? false;
    const nextVisible = !isCurrentlyVisible;

    // Update synchronous ref immediately
    visibleSystemsRef.current = { ...visibleSystemsRef.current, [sys.id]: nextVisible };

    // Update React state for re-render
    setVisibleSystems(prev => ({ ...prev, [sys.id]: nextVisible }));

    const grp = systemGroups.current.get(sys.id);
    if (grp) {
      grp.visible = nextVisible;
    } else if (nextVisible && sceneRef.current) {
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
              <span className="text-xs text-slate-400">7 Deep Anatomical Systems: Skeleton, Muscles, Vessels, Nerves, Visceral Organs, Joints, Lymphatics</span>
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
          
          {/* Top Layer Toggles Toolbar with responsive chevron scroll navigation */}
          <div className="bg-slate-950/85 backdrop-blur-md px-2 sm:px-4 py-2 border-b border-sky-500/15 flex items-center z-10 relative">
            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider hidden sm:flex items-center space-x-1 mr-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'ar' ? 'الطبقات:' : 'Systems:'}</span>
            </span>

            {/* Scroll Left Button */}
            <button
              onClick={() => {
                if (toolbarScrollRef.current) {
                  toolbarScrollRef.current.scrollBy({ left: language === 'ar' ? 180 : -180, behavior: 'smooth' });
                }
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 mr-1"
              title={language === 'ar' ? 'السابق' : 'Scroll left'}
              aria-label="Scroll layers left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable Layers Container */}
            <div 
              ref={toolbarScrollRef}
              className="flex items-center overflow-x-auto gap-2 scrollbar-none py-1 flex-1 scroll-smooth"
            >
              {SYSTEM_LAYERS.map((sys) => {
                const Icon = sys.icon;
                const isVis = !!visibleSystems[sys.id];
                const isLoad = !!loadingSystems[sys.id];
                return (
                  <button
                    key={sys.id}
                    onClick={() => toggleSystem(sys)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      isVis
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? sys.labelAr : sys.labelEn}</span>
                    {isLoad && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => {
                if (toolbarScrollRef.current) {
                  toolbarScrollRef.current.scrollBy({ left: language === 'ar' ? -180 : 180, behavior: 'smooth' });
                }
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-1"
              title={language === 'ar' ? 'التالي' : 'Scroll right'}
              aria-label="Scroll layers right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

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

            {/* Launch Detailed 3D Organ Dissection Button */}
            {(() => {
              const queryEn = (selectedStructure?.nameEn || '').toLowerCase();
              const queryAr = selectedStructure?.nameAr || '';
              const querySys = (selectedStructure?.system || '').toLowerCase();

              // Only match non-cell anatomical models (organs, bones, systems, tissues)
              const anatomySpecimens = SKETCHFAB_ANATOMY_COLLECTION.filter(m => m.category !== 'cell');

              // Strict direct keyword match
              let matchedModel = anatomySpecimens.find(m => 
                m.keywords.some(k => {
                  const kLow = k.toLowerCase();
                  return queryEn.includes(kLow) || queryAr.includes(k);
                })
              );

              // Context-specific intelligent matching (Eye, Skull, Brain, Femur, Ribs, Heart, Lung, Liver, Stomach, Kidney, Pelvis, Spine)
              if (!matchedModel) {
                if (queryEn.includes('eye') || queryAr.includes('عين') || queryEn.includes('orbit') || queryAr.includes('بصر')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-eye');
                } else if (queryEn.includes('skull') || queryEn.includes('frontal') || queryEn.includes('mandible') || queryEn.includes('maxilla') || queryEn.includes('parietal') || queryEn.includes('temporal') || queryEn.includes('occipital') || queryEn.includes('sphenoid') || queryAr.includes('جمجمة') || queryAr.includes('جبهي') || queryAr.includes('فك') || queryAr.includes('قحف')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-skull-dissection');
                } else if (queryEn.includes('femur') || queryAr.includes('فخذ')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-femur-dissection');
                } else if (queryEn.includes('rib') || queryEn.includes('sternum') || queryAr.includes('ضلع') || queryAr.includes('قص') || queryAr.includes('قفص صدري')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'rib-cage-dissection');
                } else if (queryEn.includes('vertebra') || queryEn.includes('spine') || queryAr.includes('فقرة') || queryAr.includes('عمود فقري') || queryAr.includes('عجز') || queryAr.includes('عصعص')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-spine-dissection');
                } else if (queryEn.includes('pelvis') || queryEn.includes('ilium') || queryEn.includes('pubis') || queryEn.includes('ischium') || queryAr.includes('حوض') || queryAr.includes('حرقف')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-pelvis-dissection');
                } else if (queryEn.includes('heart') || queryEn.includes('myocard') || queryAr.includes('قلب')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-heart-animated');
                } else if (queryEn.includes('lung') || queryEn.includes('bronch') || queryEn.includes('trachea') || queryAr.includes('رئة') || queryAr.includes('قصبة')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-lungs-dissection');
                } else if (queryEn.includes('liver') || queryEn.includes('gallbladder') || queryAr.includes('كبد') || queryAr.includes('مرارة')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-liver-dissection');
                } else if (queryEn.includes('kidney') || queryEn.includes('renal') || queryAr.includes('كلية') || queryAr.includes('كلو')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'human-kidney-dissection');
                } else if (queryEn.includes('stomach') || queryAr.includes('معدة')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'stomach-cross-section');
                } else if (queryEn.includes('brain') || queryAr.includes('دماغ') || queryAr.includes('مخ')) {
                  matchedModel = anatomySpecimens.find(m => m.id === 'brain-and-nuclei');
                }
              }

              if (matchedModel) {
                return (
                  <button
                    onClick={() => setActiveSketchfabModel(matchedModel)}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white text-black hover:bg-slate-200 font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'ar' 
                        ? `فتح تشريح ${selectedStructure?.nameAr || 'البنية'} مجسماً 3D` 
                        : `Open ${selectedStructure?.nameEn || 'Specimen'} Detailed 3D`}
                    </span>
                  </button>
                );
              }

              // If no specific 3D dissection exists, provide the isolation & focus inspection button
              return (
                <button
                  onClick={toggleIsolate}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-white/[0.05] border border-white/20 hover:border-white/50 text-white font-mono font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isIsolated 
                      ? (language === 'ar' ? 'إلغاء العزل وإظهار الكل' : 'Exit Focus / Show All')
                      : (language === 'ar' ? 'فحص وتقريب الجزء بمفرده (عزل 3D)' : 'Focus & Isolate Specimen Only')}
                  </span>
                </button>
              );
            })()}
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

      {/* Active Modal 3D Viewer */}
      {activeSketchfabModel && (
        <SketchfabViewerModal
          model={activeSketchfabModel}
          onClose={() => setActiveSketchfabModel(null)}
          language={language}
        />
      )}

    </div>
  );
};
