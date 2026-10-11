export interface RealScientist {
  id: string;
  name: string;
  nameAr: string;
  dates: string;
  field: string;
  fieldAr: string;
  contributionsEn: string;
  contributionsAr: string;
  associatedModules: string[];
  citation: string;
}

export const REAL_SCIENTISTS: RealScientist[] = [
  {
    id: 'newton',
    name: 'Sir Isaac Newton',
    nameAr: 'السير إسحاق نيوتن',
    dates: '1643 – 1727',
    field: 'Classical Mechanics & Calculus',
    fieldAr: 'الميكانيكا الكلاسيكية وحساب التفاضل والتكامل',
    contributionsEn: 'Formulated the Three Laws of Motion and Universal Gravitation (Philosophiae Naturalis Principia Mathematica, 1687), laying the foundations for classical physics.',
    contributionsAr: 'صاغ قوانين الحركة الثلاثة والجاذبية الكونية، مؤسساً لعلم الميكانيكا الكلاسيكية وعلم التفاضل والتكامل.',
    associatedModules: ['physics'],
    citation: 'Newton, I. (1687). Philosophiae Naturalis Principia Mathematica.',
  },
  {
    id: 'ohm',
    name: 'Georg Simon Ohm',
    nameAr: 'جورج سيمون أوم',
    dates: '1789 – 1854',
    field: 'Electromagnetism & Circuits',
    fieldAr: 'الكهرومغناطيسية والدوائر الكهربائية',
    contributionsEn: 'Discovered Ohm\'s Law (1827), determining that electric current through a conductor is directly proportional to voltage and inversely proportional to resistance.',
    contributionsAr: 'اكتشف قانون أوم الشهير، محدداً العلاقة المباشرة بين فرق الجهد وشدة التيار والمقاومة الكهربائية.',
    associatedModules: ['physics'],
    citation: 'Ohm, G. S. (1827). Die galvanische Kette, mathematisch bearbeitet.',
  },
  {
    id: 'mendeleev',
    name: 'Dmitri Mendeleev',
    nameAr: 'دميتري مندلييف',
    dates: '1834 – 1907',
    field: 'Inorganic Chemistry & Periodicity',
    fieldAr: 'الكيمياء غير العضوية والجدول الدوري',
    contributionsEn: 'Formulated the Periodic Law and created the first Periodic Table of Elements (1869), successfully predicting properties of then-undiscovered elements.',
    contributionsAr: 'نظم الجدول الدوري الدوري للعناصر وتوقع الخواص الكيميائية والفيزيائية لعناصر لم تكن قد اكتشفت بعد بدقة مذهلة.',
    associatedModules: ['chemistry'],
    citation: 'Mendeleev, D. (1869). Correlation of Properties with the Atomic Weights of Elements.',
  },
  {
    id: 'franklin',
    name: 'Rosalind Franklin',
    nameAr: 'روزاليند فرانكلين',
    dates: '1920 – 1958',
    field: 'X-ray Crystallography & Molecular Biophysics',
    fieldAr: 'علم البلورات بالأشعة السينية والفيزياء الحيوية',
    contributionsEn: 'Obtained Photo 51 (1952), the critical X-ray diffraction image demonstrating the helical structure of B-DNA, fundamental to solving the DNA double helix.',
    contributionsAr: 'التقطت الصورة الشهيرة Photo 51 عبر حيود الأشعة السينية التي كشفت البنية الحلزونية المزدوجة للحمض النووي DNA.',
    associatedModules: ['biology'],
    citation: 'Franklin, R. E., & Gosling, R. G. (1953). Molecular Configuration in Sodium Thymonucleate. Nature, 171(4356), 740-741.',
  },
  {
    id: 'lehmann',
    name: 'Inge Lehmann',
    nameAr: 'إنجي ليمان',
    dates: '1888 – 1993',
    field: 'Seismology & Planetary Geophysics',
    fieldAr: 'علم الزلازل والجيوفيزياء الكوكبية',
    contributionsEn: 'Discovered the solid inner core of the Earth (1936) by analyzing P-wave seismic shadow-zone reflections (Lehmann discontinuity).',
    contributionsAr: 'اكتشفت وجود اللب الداخلي الصلب للأرض بتحليل انعكاسات الموجات الزلزالية P في منطقة الظل الزلزالي.',
    associatedModules: ['geology'],
    citation: 'Lehmann, I. (1936). P\'. Publications du Bureau Central Séismologique International, Série A, Travaux Scientifiques, 14, 87-115.',
  },
  {
    id: 'vesalius',
    name: 'Andreas Vesalius',
    nameAr: 'أندرياس فيزاليوس',
    dates: '1514 – 1564',
    field: 'Human Anatomy & Modern Medicine',
    fieldAr: 'علم التشريح البشري والطب الحديث',
    contributionsEn: 'Authored De humani corporis fabrica (1543), revolutionizing the study of human anatomy based on direct empirical human dissection.',
    contributionsAr: 'مؤسس علم التشريح البشري الحديث ومؤلف كتاب بنيان جسم الإنسان المبني على الملاحظة التجريبية المباشرة.',
    associatedModules: ['anatomy'],
    citation: 'Vesalius, A. (1543). De humani corporis fabrica libri septem.',
  },
];
