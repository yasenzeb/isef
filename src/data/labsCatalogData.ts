/**
 * labsCatalogData.ts
 * SciNexa Science Observatory — Official 6 Laboratories Catalog
 */

export interface LabCatalogItem {
  id: 'anatomy' | 'physics' | 'chemistry' | 'biology' | 'geology' | 'astronomy';
  index: string;
  accent: 'anatomy' | 'physics' | 'chemistry' | 'biology' | 'geology' | 'astronomy';
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  taglineEn: string;
  taglineAr: string;
  descriptionEn: string;
  descriptionAr: string;
  featuresEn: string[];
  featuresAr: string[];
  statValue: string;
  statLabelEn: string;
  statLabelAr: string;
}

export const LABS_CATALOG: LabCatalogItem[] = [
  {
    id: 'anatomy',
    index: '01',
    accent: 'anatomy',
    nameEn: 'Human Anatomy Atlas',
    nameAr: 'أطلس التشريح البشري',
    categoryEn: 'Medical science',
    categoryAr: 'العلوم الطبية',
    taglineEn: '2,821 anatomical structures, isolated in 3D.',
    taglineAr: '٢٬٨٢١ بنية تشريحية قابلة للعزل في 3D.',
    descriptionEn: 'Inspect skeletal, muscular, cardiovascular, nervous and visceral systems with organ isolation and clinical notes.',
    descriptionAr: 'استكشف الأجهزة الهيكلية والعضلية والقلبية والعصبية والحشوية مع عزل الأعضاء وشرح سريري فوري.',
    featuresEn: ['7 systems', 'Organ isolation', 'Clinical notes'],
    featuresAr: ['٧ أجهزة', 'عزل الأعضاء', 'شرح سريري'],
    statValue: '2,821',
    statLabelEn: 'structures',
    statLabelAr: 'بنية تشريحية'
  },
  {
    id: 'physics',
    index: '02',
    accent: 'physics',
    nameEn: 'Physics & Circuits',
    nameAr: 'الفيزياء والدوائر والميكانيكا',
    categoryEn: 'Physical science',
    categoryAr: 'العلوم الفيزيائية',
    taglineEn: 'Wire a circuit. Launch a projectile. See the law.',
    taglineAr: 'وصّل دائرة، أطلق مقذوفًا، وشاهد القانون يعمل.',
    descriptionEn: 'Live DC circuits, Ohm and Kirchhoff solvers, projectile dynamics, wave harmonics and ray optics.',
    descriptionAr: 'دوائر تيار مستمر حية، حل أوم وكيرشوف، حركة المقذوفات، الموجات والبصريات الهندسية.',
    featuresEn: ['DC circuit bench', 'Dynamics engine', 'Wave & optics'],
    featuresAr: ['منصة دوائر DC', 'محرك الحركة', 'موجات وبصريات'],
    statValue: '24',
    statLabelEn: 'experiments',
    statLabelAr: 'تجربة حية'
  },
  {
    id: 'chemistry',
    index: '03',
    accent: 'chemistry',
    nameEn: 'Periodic Table & Reactions',
    nameAr: 'الجدول الدوري والتفاعلات الكيميائية',
    categoryEn: 'Chemical science',
    categoryAr: 'العلوم الكيميائية',
    taglineEn: 'All 118 elements, with live gas synthesis & reactions.',
    taglineAr: '١١٨ عنصرًا، مدارات 3D، وتفاعلات تحضير الغازات والمواد غير العضوية.',
    descriptionEn: 'Explore every IUPAC element, Bohr orbitals, polyatomic radicals and real-time gas synthesis with drag & drop mixing.',
    descriptionAr: 'استكشف عناصر IUPAC كاملة، مدارات بوهر، وتفاعلات تحضير الغازات بالسحب والإفلات والتسخين المباشر.',
    featuresEn: ['118 elements', 'Gas synthesis', 'Drag & Drop vessel'],
    featuresAr: ['١١٨ عنصرًا', 'تحضير الغازات', 'سحب وإفلات للتفاعل'],
    statValue: '118',
    statLabelEn: 'elements',
    statLabelAr: 'عنصرًا وتفاعلاً'
  },
  {
    id: 'biology',
    index: '04',
    accent: 'biology',
    nameEn: 'Biology & Living Cells',
    nameAr: 'الأحياء والخلية وسلاسل DNA',
    categoryEn: 'Life science',
    categoryAr: 'علوم الحياة',
    taglineEn: 'A cell you can walk through, not memorise.',
    taglineAr: 'خلية حية تتجول بداخلها وتفحص عضياتها ثلاثية الأبعاد.',
    descriptionEn: 'High-detail animal and plant cell cutaways, organelle functional deep-dives, DNA double helix zoom.',
    descriptionAr: 'قطاعات تفاعلية للخلية الحيوانية والنباتية، فحص دقيق للعضيات، واستكشاف اللولب المزدوج لـ DNA.',
    featuresEn: ['Plant & animal cells', 'DNA double helix', 'Organelle scanner'],
    featuresAr: ['خلية نباتية وحيوانية', 'لولب DNA', 'ماسح العضيات'],
    statValue: '32',
    statLabelEn: 'organelles',
    statLabelAr: 'عضية وبنية'
  },
  {
    id: 'geology',
    index: '05',
    accent: 'geology',
    nameEn: 'Earth Science & Geophysics',
    nameAr: 'علوم الأرض والزلازل والطبقات',
    categoryEn: 'Earth science',
    categoryAr: 'علوم الأرض',
    taglineEn: 'Trigger an earthquake. Watch structural resonance.',
    taglineAr: 'أحدث زلزالًا وراقب استجابة المباني والرنين الزلزالي وتسونامي.',
    descriptionEn: 'Real-time seismic wave generation, structural deformation physics, tsunami wave simulation, and 3D Earth mantle layers.',
    descriptionAr: 'محاكاة الأمواج الزلزالية، انهيار وتشوه الهياكل، وموجات تسونامي، وطبقات الأرض ثلاثية الأبعاد.',
    featuresEn: ['Seismic physics', 'Tsunami wave', 'Earth layers 3D'],
    featuresAr: ['فيزياء الزلازل', 'أمواج تسونامي', 'باطن الأرض 3D'],
    statValue: 'Richter 9.5',
    statLabelEn: 'max scale',
    statLabelAr: 'مقياس ريختر'
  },
  {
    id: 'astronomy',
    index: '06',
    accent: 'astronomy',
    nameEn: 'Astronomy & Solar System',
    nameAr: 'علم الفلك والنظام الشمسي',
    categoryEn: 'Space science',
    categoryAr: 'علوم الفضاء',
    taglineEn: 'The celestial clockwork of Kepler, accurately rendered.',
    taglineAr: 'ساعة الفضاء الكونية وقوانين كبلر بدقة مدارية حقيقية.',
    descriptionEn: 'Accurate orbital mechanics, real-time planetary orbits, moon phases, solar eclipses, and scale planetary inspections.',
    descriptionAr: 'ميكانيكا مدارية دقيقة، حركة الكواكب والمدارات، أطوار القمر، والكسوف والخسوف بدقة فيزيائية.',
    featuresEn: ['8 planets + Moon', 'Kepler orbits', 'Orbital clock'],
    featuresAr: ['٨ كواكب والقمر', 'مدارات كبلر', 'الساعة المدارية'],
    statValue: '8',
    statLabelEn: 'planets',
    statLabelAr: 'كواكب ومدارات'
  }
];
