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

export type AnatomySystemId = 'skeletal' | 'muscular' | 'cardiovascular' | 'nervous' | 'visceral' | 'joints' | 'lymphatic';

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
  { id: 'muscular', labelEn: 'Full Muscular Anatomy', labelAr: 'التشريح العضلي الكامل', file: 'muscular.glb', color: 0xa33232, icon: Activity, defaultVisible: false },
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

// Spatial 3D anatomical resolver for male_full_body_ecorche.glb to match Excel Sheets 2, 3, and 4
// Real world-space bounds per SubTool (scale=0.0255, posY=1.140, posZ=0.015, GLB Y-up=Z-forward):
// SubTool-0/Object_29: Tendons/Fascia (full body)
// SubTool-1/Object_11: Tendons/Ligaments (full body)
// SubTool-2/Object_15: Head & Face    Y[1.54→1.78]
// SubTool-3/Object_19: Neck           Y[1.39→1.64]
// SubTool-4/Object_13: Shoulder       Y[0.98→1.63]
// SubTool-5/Object_5:  Anterior Thorax Y[1.28→1.47]
// SubTool-6/Object_23: Posterior Back  Y[0.90→1.47]
// SubTool-7/Object_33: Abdomen        Y[1.11→1.45]
// SubTool-8/Object_31: Anterior Arm   Y[0.68→1.21]
// SubTool-9/Object_21: Posterior Arm  Y[0.70→1.05]
// SubTool-10/Object_3: Gluteal/Pelvis Y[0.79→1.08]
// SubTool-11/Object_17: Anterior Thigh Y[0.44→1.02]
// SubTool-12/Object_9:  Medial Thigh  Y[0.46→0.91]
// SubTool-13/Object_27: Posterior Thigh Y[0.47→0.95]
// SubTool-14/Object_7:  Posterior Calf Y[0.05→0.57]
// SubTool-15/Object_25: Anterior Leg+Foot Y[0.04→0.52]
function resolveMuscleFromHit(hit: THREE.Mesh, hitPoint: THREE.Vector3): { en: string; ar: string } {
  const y = hitPoint.y;
  const x = hitPoint.x;
  const z = hitPoint.z;
  const absX = Math.abs(x);
  const side = x > 0 ? '_L' : '_R';
  const objName = hit.name || '';
  // Walk up the parent chain to find the SubTool node name
  let parentName = hit.parent?.name || '';
  let cursor: THREE.Object3D | null = hit.parent || null;
  while (cursor && !parentName.includes('SubTool')) {
    cursor = cursor.parent;
    parentName = cursor?.name || '';
  }

  // ─── SubTool-0/SubTool-1: Tendons, Ligaments, Fascia ───────────────────
  if (parentName.includes('SubTool-0') || parentName.includes('SubTool-1') ||
      objName === 'Object_29' || objName === 'Object_11') {
    if (y < 0.25 && z < -0.02) return { en: 'Achilles tendon', ar: 'وتر أخيل (العرقوب)' };
    if (y < 0.60 && z > 0.05) return { en: 'Patellar tendon', ar: 'الوتر الرضفي' };
    if (y > 0.90 && y < 1.30 && absX < 0.05) return { en: 'Linea alba', ar: 'الخط الأبيض للبطن' };
    if (y < 0.10) return { en: 'Plantar fascia', ar: 'السفاق الأخمصي (اللفافة الأخمصية)' };
    return { en: 'Achilles tendon', ar: 'وتر أخيل (العرقوب)' };
  }

  // ─── SubTool-2 (Object_15): Head & Face — Y: 1.54 → 1.78 ─────────────
  if (objName === 'Object_15' || parentName.includes('SubTool-2')) {
    if (y > 1.70) {
      if (absX < 0.03) return { en: 'Occipitofrontalis', ar: 'العضلة القذالية الجبهية' };
      return { en: `Frontalis ${side}`, ar: `العضلة الجبهية ${side}` };
    }
    if (y > 1.63) {
      if (absX > 0.06) return { en: `Temporalis ${side}`, ar: `العضلة الصدغية ${side}` };
      return { en: `Orbicularis oculi ${side}`, ar: `العضلة الحلقية للعين ${side}` };
    }
    if (y > 1.59) {
      if (absX > 0.055) return { en: `Zygomaticus major ${side}`, ar: `العضلة الضحكية ${side}` };
      if (absX < 0.02) return { en: 'Orbicularis oris', ar: 'العضلة الحلقية للفم' };
      return { en: `Buccinator ${side}`, ar: `العضلة البكية ${side}` };
    }
    if (absX > 0.05) return { en: `Masseter ${side}`, ar: `العضلة الماضغة ${side}` };
    if (absX < 0.02) return { en: 'Orbicularis oris', ar: 'العضلة الحلقية للفم' };
    return { en: `Buccinator ${side}`, ar: `العضلة البكية ${side}` };
  }

  // ─── SubTool-3 (Object_19): Neck — Y: 1.39 → 1.64 ──────────────────────
  if (objName === 'Object_19' || parentName.includes('SubTool-3')) {
    if (z > 0.02) {
      if (absX > 0.06) return { en: `Sternocleidomastoid ${side}`, ar: `العضلة القصية الترقوية الحلمية ${side}` };
      return { en: `Sternohyoid ${side}`, ar: `العضلة اللامية الغضروفية ${side}` };
    }
    if (absX > 0.07) {
      if (y > 1.55) return { en: `Scalenus anterior ${side}`, ar: `العضلة الأخمعية الأمامية ${side}` };
      return { en: `Scalenus medius ${side}`, ar: `العضلة الأخمعية المتوسطة ${side}` };
    }
    if (y < 1.48) return { en: `Platysma ${side}`, ar: `العضلة الجلدية الرقبية ${side}` };
    return { en: `Longus capitis ${side}`, ar: `العضلة الطويلة للرأس ${side}` };
  }

  // ─── SubTool-4 (Object_13): Shoulder & Scapula — Y: 0.98 → 1.63 ────────
  if (objName === 'Object_13' || parentName.includes('SubTool-4')) {
    if (absX > 0.14) return { en: `Deltoid ${side}`, ar: `العضلة الدالية ${side}` };
    if (z < -0.05) {
      if (y > 1.30) return { en: `Supraspinatus ${side}`, ar: `العضلة فوق الشوكة ${side}` };
      if (y > 1.18) return { en: `Infraspinatus ${side}`, ar: `العضلة تحت الشوكة ${side}` };
      if (absX > 0.08) return { en: `Teres minor ${side}`, ar: `العضلة المدورة الصغرى ${side}` };
      return { en: `Teres major ${side}`, ar: `العضلة المدورة الكبرى ${side}` };
    }
    return { en: `Subscapularis ${side}`, ar: `العضلة تحت الكتف ${side}` };
  }

  // ─── SubTool-5 (Object_5): Anterior Thorax — Y: 1.28 → 1.47 ────────────
  if (objName === 'Object_5' || parentName.includes('SubTool-5')) {
    if (absX > 0.14) {
      if (y > 1.38) return { en: `Pectoralis major ${side}`, ar: `العضلة الصدرية الكبرى ${side}` };
      return { en: `Serratus anterior ${side}`, ar: `العضلة المنشارية الأمامية ${side}` };
    }
    if (absX < 0.04 && y < 1.37) return { en: 'Diaphragm', ar: 'الحجاب الحاجز' };
    if (y > 1.37) return { en: `Pectoralis minor ${side}`, ar: `العضلة الصدرية الصغرى ${side}` };
    if (absX > 0.07) return { en: `External intercostals ${side}`, ar: `العضلة بين الضلعية الخارجية ${side}` };
    return { en: `Internal intercostals ${side}`, ar: `العضلة بين الضلعية الداخلية ${side}` };
  }

  // ─── SubTool-6 (Object_23): Posterior Back — Y: 0.90 → 1.47 ─────────────
  if (objName === 'Object_23' || parentName.includes('SubTool-6')) {
    if (y > 1.30) {
      if (absX > 0.12) return { en: `Trapezius lower ${side}`, ar: `العضلة شبه المنحرفة السفلية ${side}` };
      if (absX > 0.07) return { en: `Rhomboid major ${side}`, ar: `العضلة المعينية الكبرى ${side}` };
      return { en: `Spinalis ${side}`, ar: `العضلة الشوكية ${side}` };
    }
    if (y > 1.15) {
      if (absX > 0.13) return { en: `Latissimus dorsi ${side}`, ar: `العضلة الظهرية العريضة ${side}` };
      if (absX > 0.07) return { en: `Rhomboid minor ${side}`, ar: `العضلة المعينية الصغرى ${side}` };
      return { en: `Longissimus ${side}`, ar: `العضلة الطولية الطويلة ${side}` };
    }
    if (y > 1.00) {
      if (absX > 0.12) return { en: `Latissimus dorsi ${side}`, ar: `العضلة الظهرية العريضة ${side}` };
      if (absX > 0.06) return { en: `Iliocostalis ${side}`, ar: `العضلة الحرقفية الضلعية ${side}` };
      return { en: `Multifidus ${side}`, ar: `العضلة المتعددة الشعب ${side}` };
    }
    if (absX > 0.10) return { en: `Quadratus lumborum ${side}`, ar: `العضلة المربعة القطنية ${side}` };
    return { en: `Multifidus ${side}`, ar: `العضلة المتعددة الشعب ${side}` };
  }

  // ─── SubTool-7 (Object_33): Abdomen — Y: 1.11 → 1.45 ────────────────────
  if (objName === 'Object_33' || parentName.includes('SubTool-7')) {
    if (absX < 0.04) return { en: 'Rectus abdominis', ar: 'العضلة المستقيمة البطنية' };
    if (y > 1.28) return { en: `External oblique ${side}`, ar: `العضلة المائلة الخارجية ${side}` };
    if (y > 1.18) return { en: `Internal oblique ${side}`, ar: `العضلة المائلة الداخلية ${side}` };
    return { en: `Transversus abdominis ${side}`, ar: `العضلة المستعرضة البطنية ${side}` };
  }

  // ─── SubTool-8 (Object_31): Anterior Arm & Forearm — Y: 0.68 → 1.21 ─────
  if (objName === 'Object_31' || parentName.includes('SubTool-8')) {
    if (y > 1.05) {
      if (absX > 0.20) return { en: `Biceps brachii ${side}`, ar: `العضلة ذات الرأسين العضدية ${side}` };
      if (absX > 0.13) return { en: `Brachialis ${side}`, ar: `العضلة العضدية ${side}` };
      return { en: `Coracobrachialis ${side}`, ar: `العضلة الغرابية العضدية ${side}` };
    }
    if (y > 0.88) {
      if (absX > 0.22) return { en: `Brachioradialis ${side}`, ar: `العضلة العضدية الكعبرية ${side}` };
      if (z > 0) return { en: `Pronator teres ${side}`, ar: `العضلة الكابة المرفقية ${side}` };
      if (absX > 0.17) return { en: `Flexor carpi radialis ${side}`, ar: `العضلة القابضة للرسغ الكعبرية ${side}` };
      return { en: `Palmaris longus ${side}`, ar: `العضلة النخيلية الطويلة ${side}` };
    }
    if (y > 0.75) {
      if (absX > 0.22) {
        const radialSide = (side === '_L' && x > 0.10) || (side === '_R' && x < -0.10);
        if (radialSide) return { en: `Flexor carpi radialis ${side}`, ar: `العضلة القابضة للرسغ الكعبرية ${side}` };
        return { en: `Flexor carpi ulnaris ${side}`, ar: `العضلة القابضة للرسغ الزندية ${side}` };
      }
      if (absX > 0.15) return { en: `Flexor digitorum superficialis ${side}`, ar: `العضلة القابضة السطحية للأصابع ${side}` };
      return { en: `Flexor digitorum profundus ${side}`, ar: `العضلة القابضة العميقة للأصابع ${side}` };
    }
    if (y > 0.70) return { en: `Flexor pollicis longus ${side}`, ar: `العضلة القابضة الطويلة للإبهام ${side}` };
    if (absX > 0.10) return { en: `Thenar muscles ${side}`, ar: `عضلات الإبهام (ثينار) ${side}` };
    if (absX < 0.05) return { en: `Palmar interossei ${side}`, ar: `العضلة بين العظمية الراحية ${side}` };
    return { en: `Lumbricals ${side}`, ar: `العضلة الدودية ${side}` };
  }

  // ─── SubTool-9 (Object_21): Posterior Arm & Forearm — Y: 0.70 → 1.05 ────
  if (objName === 'Object_21' || parentName.includes('SubTool-9')) {
    if (y > 0.95) {
      if (absX > 0.18) return { en: `Triceps brachii ${side}`, ar: `العضلة ثلاثية الرؤوس العضدية ${side}` };
      if (absX > 0.12) return { en: `Anconeus ${side}`, ar: `العضلة المرفقية ${side}` };
      return { en: `Triceps brachii ${side}`, ar: `العضلة ثلاثية الرؤوس العضدية ${side}` };
    }
    if (y > 0.83) {
      if (absX > 0.20) {
        if (z > 0) return { en: `Extensor carpi radialis longus ${side}`, ar: `العضلة الباسطة للرسغ الكعبرية الطويلة ${side}` };
        return { en: `Extensor carpi ulnaris ${side}`, ar: `العضلة الباسطة للرسغ الزندية ${side}` };
      }
      if (absX > 0.13) return { en: `Extensor carpi radialis brevis ${side}`, ar: `العضلة الباسطة للرسغ الكعبرية القصيرة ${side}` };
      return { en: `Supinator ${side}`, ar: `العضلة الباسطة ${side}` };
    }
    if (y > 0.75) {
      if (absX > 0.20) return { en: `Extensor digitorum ${side}`, ar: `العضلة الباسطة للأصابع ${side}` };
      if (absX > 0.15) return { en: `Extensor digiti minimi ${side}`, ar: `العضلة الباسطة للخنصر ${side}` };
      return { en: `Extensor indicis ${side}`, ar: `العضلة الباسطة للسبابة ${side}` };
    }
    if (z > 0) return { en: `Abductor pollicis longus ${side}`, ar: `العضلة الباسطة للسبابة الطويلة ${side}` };
    if (absX > 0.15) return { en: `Extensor pollicis longus ${side}`, ar: `العضلة الباسطة الطويلة للإبهام ${side}` };
    return { en: `Extensor pollicis brevis ${side}`, ar: `العضلة الباسطة القصيرة للإبهام ${side}` };
  }

  // ─── SubTool-10 (Object_3): Gluteal & Pelvis — Y: 0.79 → 1.08 ───────────
  if (objName === 'Object_3' || parentName.includes('SubTool-10')) {
    if (z < -0.06) {
      if (absX > 0.10) return { en: `Gluteus medius ${side}`, ar: `العضلة الألوية المتوسطة ${side}` };
      return { en: `Gluteus maximus ${side}`, ar: `العضلة الألوية الكبرى ${side}` };
    }
    if (y > 0.97) {
      if (absX > 0.08) return { en: `Tensor fasciae latae ${side}`, ar: `العضلة موترة اللفافة العريضة ${side}` };
      if (z < -0.01) return { en: `Piriformis ${side}`, ar: `العضلة الكمثرية ${side}` };
      return { en: `Psoas major ${side}`, ar: `العضلة القطنية الكبرى ${side}` };
    }
    if (y > 0.87) {
      if (absX < 0.05) return { en: `Iliacus ${side}`, ar: `العضلة الحرقفية ${side}` };
      if (absX > 0.09) return { en: `Obturator externus ${side}`, ar: `العضلة السدادية الخارجية ${side}` };
      return { en: `Obturator internus ${side}`, ar: `العضلة السدادية الداخلية ${side}` };
    }
    if (absX > 0.06) return { en: `Quadratus femoris ${side}`, ar: `العضلة المربعة الفخذية ${side}` };
    if (z < 0) {
      if (y > 0.82) return { en: `Gemellus superior ${side}`, ar: `العضلة التوأمية العلوية ${side}` };
      return { en: `Gemellus inferior ${side}`, ar: `العضلة التوأمية السفلية ${side}` };
    }
    return { en: `Gluteus minimus ${side}`, ar: `العضلة الألوية الصغرى ${side}` };
  }

  // ─── SubTool-11 (Object_17): Anterior Thigh — Y: 0.44 → 1.02 ────────────
  if (objName === 'Object_17' || parentName.includes('SubTool-11')) {
    if (y > 0.80) {
      if (absX < 0.05) return { en: `Rectus femoris ${side}`, ar: `العضلة المستقيمة الفخذية ${side}` };
      if (absX > 0.12) return { en: `Vastus lateralis ${side}`, ar: `العضلة المتسعة الوحشية ${side}` };
      return { en: `Sartorius ${side}`, ar: `العضلة الخياطية ${side}` };
    }
    if (y > 0.62) {
      if (absX > 0.12) return { en: `Vastus lateralis ${side}`, ar: `العضلة المتسعة الوحشية ${side}` };
      if (absX < 0.05) return { en: `Vastus intermedius ${side}`, ar: `العضلة المتسعة الوسطية ${side}` };
      return { en: `Rectus femoris ${side}`, ar: `العضلة المستقيمة الفخذية ${side}` };
    }
    if (absX > 0.10) return { en: `Vastus lateralis ${side}`, ar: `العضلة المتسعة الوحشية ${side}` };
    return { en: `Vastus medialis ${side}`, ar: `العضلة المتسعة الإنسية ${side}` };
  }

  // ─── SubTool-12 (Object_9): Medial Thigh — Y: 0.46 → 0.91 ──────────────
  if (objName === 'Object_9' || parentName.includes('SubTool-12')) {
    if (y > 0.78) {
      if (absX < 0.04) return { en: `Pectineus ${side}`, ar: `العضلة المشطية ${side}` };
      return { en: `Adductor brevis ${side}`, ar: `العضلة المقربة القصيرة ${side}` };
    }
    if (y > 0.65) {
      if (absX > 0.09) return { en: `Adductor longus ${side}`, ar: `العضلة المقربة الطويلة ${side}` };
      return { en: `Adductor magnus ${side}`, ar: `العضلة المقربة الكبرى ${side}` };
    }
    if (absX < 0.04) return { en: `Gracilis ${side}`, ar: `العضلة الرشيقة ${side}` };
    return { en: `Adductor magnus ${side}`, ar: `العضلة المقربة الكبرى ${side}` };
  }

  // ─── SubTool-13 (Object_27): Posterior Thigh — Y: 0.47 → 0.95 ───────────
  if (objName === 'Object_27' || parentName.includes('SubTool-13')) {
    if (y > 0.78) {
      if (absX > 0.08) return { en: `Biceps femoris ${side}`, ar: `العضلة ذات الرأسين الفخذية ${side}` };
      return { en: `Semitendinosus ${side}`, ar: `العضلة نصف الوترية ${side}` };
    }
    if (y > 0.60) {
      if (absX > 0.07) return { en: `Biceps femoris ${side}`, ar: `العضلة ذات الرأسين الفخذية ${side}` };
      if (absX < 0.03) return { en: `Semimembranosus ${side}`, ar: `العضلة نصف الغشائية ${side}` };
      return { en: `Semitendinosus ${side}`, ar: `العضلة نصف الوترية ${side}` };
    }
    return { en: `Popliteus ${side}`, ar: `العضلة المأبضية ${side}` };
  }

  // ─── SubTool-14 (Object_7): Posterior Leg/Calf — Y: 0.05 → 0.57 ─────────
  if (objName === 'Object_7' || parentName.includes('SubTool-14')) {
    if (y > 0.38) {
      if (absX > 0.07) return { en: `Gastrocnemius ${side}`, ar: `العضلة التوأمية ${side}` };
      return { en: `Plantaris ${side}`, ar: `العضلة الأخمصية ${side}` };
    }
    if (y > 0.22) {
      if (absX < 0.05) return { en: `Soleus ${side}`, ar: `العضلة النعلية ${side}` };
      if (z < -0.06) return { en: `Tibialis posterior ${side}`, ar: `العضلة الظنبوبية الخلفية ${side}` };
      const isFibularSide = (side === '_L' && x < 0) || (side === '_R' && x > 0);
      if (isFibularSide) return { en: `Flexor hallucis longus ${side}`, ar: `العضلة القابضة الطويلة لإبهام القدم ${side}` };
      return { en: `Flexor digitorum longus ${side}`, ar: `العضلة القابضة الطويلة للأصابع ${side}` };
    }
    return { en: `Soleus ${side}`, ar: `العضلة النعلية ${side}` };
  }

  // ─── SubTool-15 (Object_25): Anterior & Lateral Leg + Foot — Y: 0.04 → 0.52 ──
  if (objName === 'Object_25' || parentName.includes('SubTool-15')) {
    if (y > 0.30) {
      if (absX > 0.08 && z > 0.05) return { en: `Fibularis longus ${side}`, ar: `العضلة الشظوية الطويلة ${side}` };
      if (absX > 0.07) return { en: `Fibularis brevis ${side}`, ar: `العضلة الشظوية القصيرة ${side}` };
      if (z > 0.06) return { en: `Extensor digitorum longus ${side}`, ar: `العضلة الباسطة الطويلة للأصابع ${side}` };
      return { en: `Tibialis anterior ${side}`, ar: `العضلة الظنبوبية الأمامية ${side}` };
    }
    if (y > 0.15) {
      if (absX > 0.07) return { en: `Fibularis brevis ${side}`, ar: `العضلة الشظوية القصيرة ${side}` };
      if (z > 0.05) return { en: `Extensor hallucis longus ${side}`, ar: `العضلة الباسطة الطويلة لإبهام القدم ${side}` };
      return { en: `Extensor digitorum longus ${side}`, ar: `العضلة الباسطة الطويلة للأصابع ${side}` };
    }
    if (y > 0.08) {
      if (absX > 0.06) return { en: `Abductor digiti minimi ${side}`, ar: `العضلة المبعدة للخنصر ${side}` };
      if (absX < 0.02) return { en: `Abductor hallucis ${side}`, ar: `العضلة المبعدة لإبهام القدم ${side}` };
      return { en: `Extensor digitorum brevis ${side}`, ar: `العضلة الباسطة القصيرة للأصابع ${side}` };
    }
    if (absX > 0.05) return { en: `Abductor digiti minimi ${side}`, ar: `العضلة المبعدة للخنصر ${side}` };
    if (z > 0.05) return { en: `Extensor hallucis brevis ${side}`, ar: `العضلة الباسطة القصيرة لإبهام القدم ${side}` };
    if (absX < 0.02) return { en: `Quadratus plantae ${side}`, ar: `العضلة المربعة الأخمصية ${side}` };
    return { en: `Flexor digitorum brevis ${side}`, ar: `العضلة القابضة القصيرة للأصابع ${side}` };
  }

  // ─── Fallback coordinate-based resolution ────────────────────────────────
  if (y > 1.54) {
    if (absX > 0.06 && y > 1.60) return { en: `Temporalis ${side}`, ar: `العضلة الصدغية ${side}` };
    if (absX < 0.03) return { en: 'Occipitofrontalis', ar: 'العضلة القذالية الجبهية' };
    return { en: `Masseter ${side}`, ar: `العضلة الماضغة ${side}` };
  }
  if (y >= 1.39) {
    if (z >= 0) return { en: `Sternocleidomastoid ${side}`, ar: `العضلة القصية الترقوية الحلمية ${side}` };
    return { en: `Trapezius ${side}`, ar: `العضلة الشبه المنحرفة ${side}` };
  }
  if (y >= 1.20) {
    if (absX >= 0.15) return { en: `Deltoid ${side}`, ar: `العضلة الدالية ${side}` };
    if (z >= 0) return { en: `Pectoralis major ${side}`, ar: `العضلة الصدرية الكبرى ${side}` };
    if (absX >= 0.09) return { en: `Trapezius lower ${side}`, ar: `العضلة شبه المنحرفة السفلية ${side}` };
    return { en: `Spinalis ${side}`, ar: `العضلة الشوكية ${side}` };
  }
  if (y >= 0.95) {
    if (absX >= 0.19) {
      if (z >= 0) return { en: `Biceps brachii ${side}`, ar: `العضلة ذات الرأسين العضدية ${side}` };
      return { en: `Triceps brachii ${side}`, ar: `العضلة ثلاثية الرؤوس العضدية ${side}` };
    }
    if (z >= 0 && absX < 0.08) return { en: 'Rectus abdominis', ar: 'العضلة المستقيمة البطنية' };
    if (z >= 0) return { en: `External oblique ${side}`, ar: `العضلة المائلة الخارجية ${side}` };
    return { en: `Latissimus dorsi ${side}`, ar: `العضلة الظهرية العريضة ${side}` };
  }
  if (y >= 0.75) {
    if (absX >= 0.18) return { en: `Brachioradialis ${side}`, ar: `العضلة العضدية الكعبرية ${side}` };
    if (z < -0.04) return { en: `Gluteus maximus ${side}`, ar: `العضلة الألوية الكبرى ${side}` };
    if (absX < 0.05) return { en: 'Rectus abdominis', ar: 'العضلة المستقيمة البطنية' };
    return { en: `External oblique ${side}`, ar: `العضلة المائلة الخارجية ${side}` };
  }
  if (y >= 0.42) {
    if (z < -0.02) {
      if (absX > 0.08) return { en: `Biceps femoris ${side}`, ar: `العضلة ذات الرأسين الفخذية ${side}` };
      return { en: `Semitendinosus ${side}`, ar: `العضلة نصف الوترية ${side}` };
    }
    if (absX > 0.11) return { en: `Vastus lateralis ${side}`, ar: `العضلة المتسعة الوحشية ${side}` };
    if (absX < 0.05) return { en: `Rectus femoris ${side}`, ar: `العضلة المستقيمة الفخذية ${side}` };
    return { en: `Adductor longus ${side}`, ar: `العضلة المقربة الطويلة ${side}` };
  }
  if (y >= 0.10) {
    if (z < -0.03) {
      if (y > 0.28) return { en: `Gastrocnemius ${side}`, ar: `العضلة التوأمية ${side}` };
      return { en: `Soleus ${side}`, ar: `العضلة النعلية ${side}` };
    }
    if (absX > 0.08) return { en: `Fibularis longus ${side}`, ar: `العضلة الشظوية الطويلة ${side}` };
    if (y < 0.22) return { en: `Extensor digitorum longus ${side}`, ar: `العضلة الباسطة الطويلة للأصابع ${side}` };
    return { en: `Tibialis anterior ${side}`, ar: `العضلة الظنبوبية الأمامية ${side}` };
  }
  if (z >= 0) return { en: `Extensor hallucis longus ${side}`, ar: `العضلة الباسطة الطويلة لإبهام القدم ${side}` };
  return { en: 'Plantar fascia', ar: 'السفاق الأخمصي (اللفافة الأخمصية)' };
}

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
  const highlightMaterialRef = useRef<THREE.MeshStandardMaterial>(new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.5,
    roughness: 0.25,
  }));
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);
  const targetPinpointRef = useRef<THREE.Group | null>(null);
  const lastHitPointRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.0, 0));

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

            // Completely hide pleura membrane covering lungs so lung lobes are directly visible & inspectable
            if (name.includes('pleura')) {
              mesh.visible = false;
              mesh.raycast = () => {};
              return;
            }

            // Completely hide obscuring fasciae wraps that encase and hide the true muscles underneath
            const isObscuringFascia = /fascia(?!e\s*latae)|intermuscular\s*septum|retinaculum|aponeurosis(?!.*bicipit)/i.test(name);
            if (isObscuringFascia) {
              mesh.visible = false;
              mesh.raycast = () => {};
              return;
            }

            // Move nasal cartilage from skeletal layer to joints and cartilage layer
            const isNasalCartilage = /nasal.*cartilage|cartilage.*nasal|septal.*cartilage|cartilago.*nasi|alar.*cartilage/i.test(name);
            if (isNasalCartilage) {
              if (sysConfig.id === 'skeletal') {
                mesh.visible = false;
                mesh.raycast = () => {};
                return;
              }
            }

            // Specialized authentic organ & muscle color shading
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
            } else if (sysConfig.id === 'muscular') {
              if (name.includes('tendon') || name.includes('sheath') || name.includes('ligament') || name.includes('linea alba')) {
                matColor = 0xe4dfd7; // Pearly tendon glistening ivory-white
                roughness = 0.28;
                metalness = 0.02;
              } else if (name.includes('cartilage') || name.includes('articular')) {
                matColor = 0xd5d1c8; // Chondral cartilage
                roughness = 0.35;
                metalness = 0.02;
              } else {
                matColor = 0xa33232; // Rich striated anatomical muscle crimson
                roughness = 0.44;
                metalness = 0.03;
              }
            }

            // For models with embedded textures, preserve their original texture map
            const origMat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
            if (origMat && origMat.map) {
              const texturedMat = origMat.clone();
              texturedMat.roughness = roughness;
              texturedMat.metalness = metalness;
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

        // Anatomical alignment - Unified 1.0 scale
        root.position.set(0, 0, 0);
        root.scale.set(1, 1, 1);

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
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // DRACO Loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoaderRef.current = dracoLoader;

    // Fetch definitions.json in background for enriched anatomy metadata
    fetch('/models/anatomy/definitions.json')
      .then(r => r.json())
      .then(d => { definitionsRef.current = d; })
      .catch(() => {});

    // 3D Pinpoint Holographic Target Reticle
    const targetGroup = new THREE.Group();
    targetGroup.name = 'targetPinpoint';
    targetGroup.visible = false;

    // Inner glowing ring
    const innerRingGeo = new THREE.RingGeometry(0.012, 0.018, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    targetGroup.add(innerRing);

    // Outer reticle ring
    const outerRingGeo = new THREE.RingGeometry(0.026, 0.029, 32);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      depthTest: false,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    targetGroup.add(outerRing);

    // Center focal dot
    const dotGeo = new THREE.SphereGeometry(0.004, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      depthTest: false,
    });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    targetGroup.add(dot);

    scene.add(targetGroup);
    targetPinpointRef.current = targetGroup;

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

      // Filter out pleura membrane so lung lobes and thoracic organs are directly clicked
      const intersects = raycaster.intersectObjects(visibleMeshes, false)
        .filter(i => !(i.object as THREE.Mesh).name.toLowerCase().includes('pleura'));

      if (intersects.length > 0) {
        const hitIntersection = intersects[0];
        const hit = hitIntersection.object as THREE.Mesh;
        const hitPoint = hitIntersection.point;
        lastHitPointRef.current.copy(hitPoint);

        // Position & orient 3D holographic pinpoint target ring on the exact surface hit
        if (targetPinpointRef.current) {
          targetPinpointRef.current.position.copy(hitPoint);
          if (hitIntersection.face) {
            const normal = hitIntersection.face.normal.clone();
            normal.transformDirection(hit.matrixWorld);
            targetPinpointRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
            targetPinpointRef.current.position.addScaledVector(normal, 0.003);
          }
          targetPinpointRef.current.visible = true;
        }

        if (selectedMeshRef.current && selectedMeshRef.current !== hit) {
          const prevMat = originalMaterials.current.get(selectedMeshRef.current);
          if (prevMat) selectedMeshRef.current.material = prevMat.clone();
        }

        selectedMeshRef.current = hit;

        const sysId = (hit.userData.systemId || 'skeletal') as AnatomySystemId;
        const sysConfig = SYSTEM_LAYERS.find(s => s.id === sysId) || SYSTEM_LAYERS[0];

        // Highlight the single clicked muscle or specimen in bright glowing cyan
        hit.material = highlightMaterialRef.current;

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
        let resolvedArabicName: string | null = null;

        // Explicit Override: Nasal Cartilage is strictly Cartilage (غضروف الأنف), NOT an organ or bone
        const lowerRaw = (cleanName + ' ' + (hit.name || '')).toLowerCase();
        if (lowerRaw.includes('nose') || lowerRaw.includes('nasal') || lowerRaw.includes('septum') || lowerRaw.includes('alar')) {
          if (lowerRaw.includes('cartilage') || lowerRaw.includes('sept') || lowerRaw.includes('alar') || lowerRaw.includes('nose') || sysId === 'joints') {
            cleanName = 'Nasal Cartilage (Cartilago nasi)';
            resolvedArabicName = 'غضروف الأنف (Nasal Cartilage)';
          }
        }

        // Comprehensive anatomical lookup
        const baseKey = cleanName.replace(/\s*\((Left|Right)\)/i, '').trim();
        const sideSuffix = cleanName.match(/\((Left|Right)\)/i)?.[1];

        const dictRecord = SKELETAL_BONE_DICTIONARY as Record<string, { ar: string; descEn: string; descAr: string }>;
        const directEntry = dictRecord[hit.name] || dictRecord[cleanName] || dictRecord[baseKey] || dictRecord[baseKey.toLowerCase()];

        let resolvedAr = resolvedArabicName;
        if (!resolvedAr && directEntry) {
          const alreadyHasSide = directEntry.ar.includes('الأيسر') || directEntry.ar.includes('الأيمن') || directEntry.ar.includes('اليسرى') || directEntry.ar.includes('اليمنى');
          if (alreadyHasSide || !sideSuffix) {
            resolvedAr = directEntry.ar;
          } else {
            const isFem = directEntry.ar.includes('العضلة') || directEntry.ar.includes('الرئة') || directEntry.ar.includes('الكلية') || directEntry.ar.endsWith('ة') || directEntry.ar.endsWith('ية');
            const sideStr = sideSuffix === 'Left' ? (isFem ? ' اليسرى' : ' الأيسر') : (isFem ? ' اليمنى' : ' الأيمن');
            resolvedAr = `${directEntry.ar}${sideStr}`;
          }
        }

        // Match against dictionary or definitions.json
        const matchedDict = directEntry 
          ? { ar: resolvedAr || directEntry.ar, descEn: directEntry.descEn, descAr: directEntry.descAr }
          : Object.entries(dictRecord).find(([k]) => baseKey.toLowerCase() === k.toLowerCase() || baseKey.toLowerCase().includes(k.toLowerCase()))?.[1]
          || Object.entries(ANATOMY_DICTIONARY).find(([k]) => cleanName.toLowerCase().includes(k.toLowerCase()))?.[1];
        
        let descEn = matchedDict ? matchedDict.descEn : '';
        let nameAr = resolvedAr || (matchedDict 
          ? matchedDict.ar 
          : (cleanName.includes('(') ? cleanName.split('(')[1]?.replace(')', '') : ''));
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

        // Domain-specific scientific intelligence for Brain, Eyes, Nervous System, Cardiovascular, and Joints
        if (!nameAr || nameAr === cleanName) {
          const lower = cleanName.toLowerCase();
          
          // 1. EYES & VISUAL ANATOMY (العينين والتشريح البصري)
          if (lower.includes('cornea')) {
            nameAr = `قرنية العين (Cornea)`;
            descAr = 'الطبقة الشفافة المقوسة في مقدمة العين المسؤولة عن ثلثي القوة الانكسارية البصرية للعين لتركيز الضوء على الشبكية.';
            descEn = 'Transparent anterior curved segment of the fibrous tunic providing two-thirds of the eye’s total refractive power.';
          } else if (lower.includes('retina')) {
            nameAr = `شبكية العين (Retina)`;
            descAr = 'الغشاء الحسي العصبي المبطن لقاع العين المحتوي على ملايين المستقبلات الضوئية (العصي والمخاريط) لتحويل الضوء لإشارات عصبية.';
            descEn = 'Neurosensory inner tunic containing rod and cone photoreceptors that convert photons into neurochemical impulses.';
          } else if (lower.includes('lens') && (lower.includes('eye') || lower.includes('crystal') || sysId === 'nervous' || sysId === 'visceral')) {
            nameAr = `عدسة العين البلورية (Crystalline Lens)`;
            descAr = 'عدسة مرنة شفافة ثنائية التحدب تغير تقوسها بفعل العضلة الهدبية لإجراء المطابقة البصرية وتعديل البعد البؤري.';
            descEn = 'Biconvex flexible transparent optical element capable of active accommodation driven by the ciliary muscle.';
          } else if (lower.includes('sclera')) {
            nameAr = `صلبة العين (بياض العين - Sclera)`;
            descAr = 'الغلاف الليفي الكولاجيني الأبيض المعتم الذي يحمي محتويات مقلة العين الداخلية ويوفر مرتكزاً للعضلات المحركة للعين.';
            descEn = 'Tough opaque fibrous outer tunic maintaining intraocular shape and providing insertion for extraocular muscles.';
          } else if (lower.includes('iris')) {
            nameAr = `قزحية العين (Iris)`;
            descAr = 'القرص الصبغي الملون المنظم لحجم حدقة العين عبر العضلة المضيقة والموسعة للتحكم بكمية الضوء الداخلة.';
            descEn = 'Pigmented contractile diaphragm regulating pupil aperture to control retinal illumination.';
          } else if (lower.includes('pupil')) {
            nameAr = `بؤبؤ / حدقة العين (Pupil)`;
            descAr = 'الفتحة المركزية المتغيرة القطر في منتصف القزحية يمر الضوء من خلالها إلى العدسة والشبكية.';
            descEn = 'Central variable aperture within the iris through which light enters the posterior ocular segment.';
          } else if (lower.includes('vitreous')) {
            nameAr = `الجسم الزجاجي للعين (Vitreous Body)`;
            descAr = 'هلام مائي شفاف يملأ الحجرة الخلفية بين العدسة والشبكية للحفاظ على كروية مقلة العين وثبات الشبكية.';
            descEn = 'Transparent gelatinous hydrogel filling the vitreous chamber to maintain intraocular retinal adherence.';
          } else if (lower.includes('choroid')) {
            nameAr = `مشيمية العين (Choroid)`;
            descAr = 'الطبقة الوعائية الغنية بالأوعية الدموية والشعيرات المغذية لطبقات الشبكية الخارجية والصباغ الممتص للضوء الزائد.';
            descEn = 'Vascular layer of the uveal tract supplying oxygen and nutrients to outer retinal layers.';
          } else if (lower.includes('eyeball') || lower.includes('bulbus oculi')) {
            nameAr = `مقلة العين (Eyeball)`;
            descAr = 'عضو الإبصار الحسي الكروي الواقع داخل حجاج الجمجمة، متصل بالعصب البصري والدماغ.';
            descEn = 'Specialized spherical sensory organ situated in the bony orbit, housing optics and neuroretinal tunic.';
          }
          
          // 2. BRAIN & NERVOUS SYSTEM (الدماغ والمخ والأعصاب)
          else if (sysId === 'nervous' || lower.includes('brain') || lower.includes('nerve') || lower.includes('cerebr')) {
            if (lower.includes('pons')) {
              nameAr = `جسر فارول / قنطرة الدماغ (Pons)`;
              descAr = 'جزء حيوي من جذع الدماغ يربط المخيخ بالنخاع المستطيل والقشرة، ويحتوي نوى الأعصاب القحفية ومراكز تنظيم التنفس.';
              descEn = 'Metencephalic brainstem structure bridging cerebral cortex and cerebellum, housing respiratory control pneumotaxic centers.';
            } else if (lower.includes('medulla') || lower.includes('oblongata')) {
              nameAr = `النخاع المستطيل (Medulla Oblongata)`;
              descAr = 'الجزء السفلي من جذع الدماغ المتحكم بالمراكز الذاتية الحيوية اللاإرادية كضربات القلب وضغط الدم وسرعة التنفس والبلع.';
              descEn = 'Myelencephalic brainstem center regulating autonomic autonomic cardiac rate, vasomotor tone, and respiration.';
            } else if (lower.includes('midbrain') || lower.includes('mesencephalon')) {
              nameAr = `الدماغ المتوسط (Midbrain)`;
              descAr = 'أعلى أجزاء جذع الدماغ، يحوي السقيفة والأكيمات العلوية والسفلية ومحطات معالجة المنعكسات السمعية والبصرية والمادة السوداء.';
              descEn = 'Rostral brainstem segment containing superior and inferior colliculi, substantia nigra, and motor conduits.';
            } else if (lower.includes('thalamus')) {
              nameAr = `المهاد الدماغي (Thalamus)`;
              descAr = 'محطة الترحيل والمعالجة المركزية لجميع الإشارات الحسية القادمة من الجسم إلى القشرة المخية (عدا حاسة الشم).';
              descEn = 'Primary sensory relay and gating station routing somatosensory, visual, and auditory streams to the cortex.';
            } else if (lower.includes('hypothalamus')) {
              nameAr = `تحت المهاد / الوطاء (Hypothalamus)`;
              descAr = 'المركز الرئيسي لضبط الاتزان الداخلي والتوازن الهرموني وحرارة الجسم والجوع والعطش وضبط الغدة النخامية.';
              descEn = 'Neuroendocrine control hub coordinating autonomic homeostasis, thermoregulation, and hypophyseal hormones.';
            } else if (lower.includes('cerebell')) {
              nameAr = `المخيخ (Cerebellum)`;
              descAr = 'المسؤول عن التوازن الحركي والتنسيق الدقيق بين العضلات ومعايرة توقيت الحركات الإرادية وتثبيت القامة.';
              descEn = 'Metencephalic center for motor learning, equilibrium, proprioceptive coordination, and fine kinetic timing.';
            } else if (lower.includes('cerebrum') || lower.includes('cerebral hemisphere')) {
              nameAr = `نصف الكرة المخية (Cerebral Hemisphere)`;
              descAr = 'أعلى مراكز التفكير الواعي والإدراك الحسي والتخطيط واللغة والذاكرة والتفكير المجرد.';
              descEn = 'Telencephalic hemisphere executing conscious sensory perception, executive planning, language, and cognition.';
            } else if (lower.includes('frontal lobe')) {
              nameAr = `الفص الجبهي للمخ (Frontal Lobe)`;
              descAr = 'مركز الوظائف التنفيذية العليا، التخطيط، اتخاذ القرار، الشخصية، والتحكم بالحركات الإرادية عبر الباحة الحركية الأولية.';
              descEn = 'Anterior cerebral lobe governing executive functions, working memory, reasoning, and primary voluntary motor commands.';
            } else if (lower.includes('parietal lobe')) {
              nameAr = `الفص الجداري للمخ (Parietal Lobe)`;
              descAr = 'مركز معالجة الإحساس الجسدي اللمسي، الإدراك المكاني ثلاثي الأبعاد، والتكامل الحسي للغة.';
              descEn = 'Cerebral region integrating somatosensory input, spatial orientation, temperature, and nociception.';
            } else if (lower.includes('temporal lobe')) {
              nameAr = `الفص الصدغي للمخ (Temporal Lobe)`;
              descAr = 'مركز معالجة السمع، إدراك وفهم الكلام واللغة (منطقة فيرنيكه)، وتثبيت الذكريات عبر الحصين.';
              descEn = 'Lateral cerebral cortex mediating auditory processing, language comprehension, and declarative memory formation.';
            } else if (lower.includes('occipital lobe')) {
              nameAr = `الفص القذالي للمخ (Occipital Lobe)`;
              descAr = 'المركز البصري الرئيسي في الدماغ المسؤول عن معالجة المشاهد المرئية، الألوان، الأشكال، والتعرف على الوجوه.';
              descEn = 'Posterior cerebral cortex housing primary visual area V1 for retinotopic map synthesis and visual perception.';
            } else if (lower.includes('insula') || lower.includes('insular')) {
              nameAr = `فص الجزيرة الدماغي (Insular Cortex)`;
              descAr = 'قشرة دماغية عميقة داخل الثلم الوحشي مسؤولة عن الإدراك الحشوي الذاتي، التذوق، والتعاطف الوجداني.';
              descEn = 'Deep cortical structure mediating interoceptive awareness, visceral sensation, taste, and emotional processing.';
            } else if (lower.includes('basal ganglia') || lower.includes('striatum') || lower.includes('putamen') || lower.includes('caudate')) {
              nameAr = `العقد القاعدية (Basal Ganglia)`;
              descAr = 'مجموعة نوى تحت قشرية تنظم سلاسة الحركة الإرادية، كبح الحركات غير المرغوبة، والتعلم الإجرائي.';
              descEn = 'Subcortical nuclei modulating initiation and smooth execution of motor programs and habitual learning.';
            } else if (lower.includes('internal capsule')) {
              nameAr = `المحفظة الداخلية (Internal Capsule)`;
              descAr = 'حزمة ضخمة من الألياف العصبية البيضاء الصاعدة والهابطة تربط القشرة المخية بجذع الدماغ والنخاع الشوكي.';
              descEn = 'Massive white-matter pathway carrying corticospinal motor and thalamocortical sensory projections.';
            } else if (lower.includes('pituitary') || lower.includes('hypophysis')) {
              nameAr = `الغدة النخامية (Pituitary Gland)`;
              descAr = 'سيدة الغدد الصماء الواقعة في قاع الجمجمة عند السرج التركي، تفرز هرمونات النمو وضبط باقي غدد الجسم.';
              descEn = 'Master endocrine gland situated in the sella turcica regulating systemic growth, metabolism, and reproduction.';
            } else if (lower.includes('corpus callosum')) {
              nameAr = `الجسم الثفني (Corpus Callosum)`;
              descAr = 'الجسر العصبي العريض من الألياف البيضاء الذي يربط نصفي الكرة المخية ويؤمن تبادل المعلومات بينهما.';
              descEn = 'Massive commissural white-matter tract interconnecting homologous cortical regions of both hemispheres.';
            } else if (lower.includes('hippocampus')) {
              nameAr = `قرن آمون / الحصين (Hippocampus)`;
              descAr = 'بنية عصبية عميقة بالجهاز الحوفي أساسية في ترسيخ الذكريات من قصيرة الأمد إلى طويلة الأمد والملاحة المكانية.';
              descEn = 'Limbic structure crucial for long-term memory consolidation and spatial navigational cognitive mapping.';
            } else if (lower.includes('amygdala')) {
              nameAr = `اللوزة الدماغية (Amygdala)`;
              descAr = 'النواة العصبية المركزية المسؤولة عن معالجة المشاعر والانفعالات وخاصة الخوف واستجابة الكر والفر.';
              descEn = 'Subcortical nuclear group coordinating emotional salience, threat detection, and fear-conditioned behavior.';
            } else if (lower.includes('optic chiasm') || lower.includes('optic chiasma')) {
              nameAr = `التصالب البصري (Optic Chiasm)`;
              descAr = 'نقطة تقاطع ألياف العصب البصري القادمة من نصفي الشبكية الأنفية لتأمين الرؤية المجسمة ثلاثية الأبعاد.';
              descEn = 'X-shaped anatomical junction where decussating nasal hemiretinal axons cross to the contralateral optic tract.';
            } else if (lower.includes('optic tract')) {
              nameAr = `السبيل البصري (Optic Tract)`;
              descAr = 'مسار الألياف العصبية الممتد من التصالب البصري نحو الجسم الركبي الجانبي لنقل المشاهد البصرية للقشرة القذالية.';
              descEn = 'Axonal tract relaying visual signals from the chiasm to the lateral geniculate nucleus of the metathalamus.';
            } else if (lower.includes('optic nerve') || lower.includes('cranial nerve ii')) {
              nameAr = `العصب البصري (Optic Nerve - CN II)`;
              descAr = 'العصب القحفي الثاني ينقل نبضات الضوء الكهروكيميائية من الشبكية مباشرة إلى مراكز الإبصار الدماغية.';
              descEn = 'Second cranial nerve carrying special sensory visual afferents from retinal ganglion cells directly to the brain.';
            } else if (lower.includes('vagus') || lower.includes('cranial nerve x')) {
              nameAr = `العصب الحائر / المبهم (Vagus Nerve - CN X)`;
              descAr = 'العصب القحفي العاشر الرئيسي في الجهاز الباراسمبثاوي، يغذي القلب والرئتين ومعظم أحشاء الجهاز الهضمي.';
              descEn = 'Tenth cranial nerve supplying parasympathetic innervation to thoracic viscera and gastrointestinal organs.';
            } else if (lower.includes('trigeminal') || lower.includes('cranial nerve v')) {
              nameAr = `العصب ثلاثي التوائم (Trigeminal Nerve - CN V)`;
              descAr = 'العصب القحفي الخامس المسؤول عن الإحساس في الوجه والقرنية والأسنان والتحكم الحركي بعضلات المضغ.';
              descEn = 'Fifth cranial nerve providing sensory supply to facial dermatomes and motor control to masticatory muscles.';
            } else if (lower.includes('facial nerve') || lower.includes('cranial nerve vii')) {
              nameAr = `العصب الوجهي (Facial Nerve - CN VII)`;
              descAr = 'العصب القحفي السابع المغذي لعضلات التعبير الوجهي والتذوق في الثلثين الأماميين من اللسان والغدد اللعابية.';
              descEn = 'Seventh cranial nerve governing muscles of facial expression and gustatory sensation of anterior tongue.';
            } else if (lower.includes('sciatic')) {
              nameAr = `العصب الوركي (عرق النسا - Sciatic Nerve)`;
              descAr = 'أكبر وأطول عصب في جسم الإنسان، يمتد من الضفيرة القطنية العجزية ليغذي عضلات الفخذ والساق والقدم.';
              descEn = 'Largest peripheral nerve in the body originating from the lumbosacral plexus to innervate the lower limb.';
            } else if (lower.includes('ventricle')) {
              nameAr = `بطين دماغي (${cleanName})`;
              descAr = 'تجويف دماغي مبطن بالضفيرة المشيمية مسؤول عن إفراز وتدوير السائل الدماغي الشوكي (CSF) لامتصاص الصدمات وحماية المراكز العصبية.';
              descEn = 'Cerebral ventricle producing and circulating cerebrospinal fluid (CSF) for mechanical cushioning and metabolic homeostasis.';
            } else if (lower.includes('nucleus') || lower.includes('nuclei')) {
              nameAr = `نواة عصبية (${cleanName})`;
              descAr = 'تجمع عصبي متخصص في الجهاز العصبي المركزي يعمل كمحطة معالجة وترحيل للإشارات الحسية والحركية الدقيقة.';
              descEn = 'Dedicated central nervous system neuronal cluster serving as a sensorimotor signal integration hub.';
            } else if (lower.includes('nerve')) {
              const cleanPart = cleanName.replace(/nerve/gi, '').replace(/\(Left\)/gi, '').replace(/\(Right\)/gi, '').trim();
              nameAr = `العصب ${cleanPart || cleanName}`;
              descAr = 'حزمة ألياف عصبية تنقل السيالات الكهروكيميائية بين الدماغ أو النخاع الشوكي وأعضاء الجسم.';
              descEn = 'Peripheral nerve bundle transmitting electrochemical impulses between the central nervous system and target organs.';
            }
          }
          
          // 3. JOINTS & CARTILAGE (المفاصل والغضاريف والأربطة)
          else if (sysId === 'joints' || lower.includes('joint') || lower.includes('ligament') || lower.includes('cartilage') || lower.includes('capsule')) {
            if (lower.includes('nasal') || lower.includes('cartilago nasi') || lower.includes('alar') || lower.includes('septum')) {
              nameAr = `غضروف الأنف (Nasal Cartilage)`;
              descAr = 'بنية غضروفية زجاجية ومرنة تشكل الطرف الأمامي وجناحي الأنف والحاجز الأنفي، تحافظ على مجرى التنفس مفتوحاً وتمنحه مرونته وشكله المميز.';
              descEn = 'Flexible hyaline cartilaginous framework forming the nasal septum, lateral walls, and alae to support the airway.';
            } else if (lower.includes('capsule') || lower.includes('articular capsule')) {
              nameAr = `المحفظة المفصلية الزلالية (Articular Capsule)`;
              descAr = 'غلاف ليفي يحيط بتجويف المفصل الزلالي مبطن بغشاء زلالي يفرز السائل المفصلي لتزييت الحركة ومنع تآكل الغضاريف.';
              descEn = 'Envelope enclosing synovial joint cavity composed of an outer fibrous layer and inner lubricating synovial membrane.';
            } else if (lower.includes('cartilage')) {
              nameAr = `غضروف مفصلي زجاجي (Articular Hyaline Cartilage)`;
              descAr = 'نسيج غضروفي أملس ومرن يغطي نهايات العظام المفصلية لامتصاص الصدمات وتقليل الاحتكاك لأدنى حد ممكن.';
              descEn = 'Smooth avascular hyaline connective tissue lining articulating bony ends to dissipate mechanical friction.';
            } else if (lower.includes('meniscus')) {
              nameAr = `الغضروف الهلالي المفصلي (Articular Meniscus)`;
              descAr = 'غضروف ليفي هلالي الشكل في مفصل الركبة يوزع ثقل الجسم على السطح المفصلي ويثبت المفصل أثناء الحركة.';
              descEn = 'Crescentic fibrocartilaginous structure deepening joint congruity and dispersing axial compressive forces.';
            } else if (lower.includes('disc') || lower.includes('intervertebral')) {
              nameAr = `القرص الغضروفي المفصلي (Intervertebral Disc)`;
              descAr = 'وسادة غضروفية ليفية ذات نواة لبية مرنة بين الفقرات تمتص الصدمات العمودية وتسمح بانثناء العمود الفقري.';
              descEn = 'Fibrocartilaginous cushion with an inner nucleus pulposus facilitating spinal flexibility and cushioning.';
            } else if (lower.includes('cruciate')) {
              nameAr = `الرباط الصليبي (Cruciate Ligament)`;
              descAr = 'رباط ليفي داخلي قوي في مفصل الركبة (أمامي وخلفي) يمنع انزلاق عظم القصبة بالنسبة لعظم الفخذ.';
              descEn = 'Intra-articular ligament regulating anteroposterior tibial glide and rotational knee joint stability.';
            } else if (lower.includes('ligament')) {
              const cleanPart = cleanName.replace(/ligament/gi, '').replace(/\(Left\)/gi, '').replace(/\(Right\)/gi, '').trim();
              nameAr = `رباط ${cleanPart || cleanName}`;
              descAr = 'شريط ليفي كولاجيني متين يربط العظام ببعضها ويثبت استقرار المفصل ويمنع فرط الحركة والانخلاع.';
              descEn = 'Dense regular collagenous band connecting bone to bone, maintaining joint kinematics and mechanical integrity.';
            }
          }
          
          // 4. CARDIOVASCULAR SYSTEM (الأوعية والشرايين والأوردة)
          else if (sysId === 'cardiovascular') {
            if (lower.includes('artery') || lower.includes('arterial')) {
              const cleanPart = cleanName.replace(/artery/gi, '').replace(/\(Left\)/gi, '').replace(/\(Right\)/gi, '').trim();
              nameAr = `شريان ${cleanPart || cleanName}`;
              descAr = 'وعاء دموي عضلي ينقل الدم المؤكسج تحت ضغط عالٍ من القلب إلى أنسجة وأعضاء الجسم.';
              descEn = 'Muscular arterial vessel transporting oxygenated blood under systemic pressure to peripheral tissues.';
            } else if (lower.includes('vein') || lower.includes('venous')) {
              const cleanPart = cleanName.replace(/vein/gi, '').replace(/\(Left\)/gi, '').replace(/\(Right\)/gi, '').trim();
              nameAr = `وريد ${cleanPart || cleanName}`;
              descAr = 'وعاء دموي وريدي مزود بصمامات يضمن عودة الدم غير المؤكسج بكفاءة إلى القلب.';
              descEn = 'Venous capacitance vessel ensuring efficient return of deoxygenated blood to the cardiac chambers.';
            }
          }
        }

        if (!nameAr) {
          nameAr = `${cleanName} (${sysConfig.labelAr})`;
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
      if (targetPinpointRef.current && targetPinpointRef.current.visible) {
        const t = performance.now() * 0.003;
        const s = 1.0 + Math.sin(t * 3.5) * 0.12;
        targetPinpointRef.current.scale.set(s, s, s);
      }
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

    const hit = selectedMeshRef.current;
    // When focusing/isolating, restore natural realistic material
    if (newIsolate) {
      const origMat = originalMaterials.current.get(hit);
      if (origMat) {
        hit.material = origMat.clone();
      }

      // Smoothly focus camera onto the selected individual specimen
      if (cameraRef.current && controlsRef.current) {
        const box = new THREE.Box3().setFromObject(hit);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 0.08);

        controlsRef.current.target.copy(center);
        cameraRef.current.position.set(center.x, center.y + maxDim * 0.3, center.z + maxDim * 2.2);
        controlsRef.current.update();
      }
    } else {
      // When exiting isolation, restore selection highlight on active mesh
      hit.material = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.25,
      });
    }

    systemGroups.current.forEach((grp) => {
      grp.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          const mesh = c as THREE.Mesh;
          if (newIsolate) {
            mesh.visible = mesh === hit;
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
          <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />

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
          <div className="sci-card p-5 space-y-4 relative" style={{ transform: 'translateZ(0)', isolation: 'isolate', backfaceVisibility: 'hidden' }}>
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

                        {/* Focus & Specimen Isolation Button (Zero network lag, 100% offline & lightweight) */}
            <button
              onClick={toggleIsolate}
              className={`w-full mt-2 py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg ${
                isIsolated
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-white'
                  : 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 border-cyan-400/40 text-white hover:opacity-95'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>
                {isIsolated 
                  ? (language === 'ar' ? 'إلغاء العزل وإظهار كامل الجسم' : 'Exit Focus / Show Full Body')
                  : (language === 'ar' ? 'فحص وتقريب الجزء بمفرده (عزل 3D)' : 'Focus & Isolate Specimen Only')}
              </span>
            </button>
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
