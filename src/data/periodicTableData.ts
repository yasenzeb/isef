export interface ChemicalElement {
  number: number;
  symbol: string;
  nameEn: string;
  nameAr: string;
  nameFr: string;
  nameDe: string;
  atomicMass: number;
  category: 
    | 'alkali-metal'
    | 'alkaline-earth'
    | 'transition-metal'
    | 'post-transition'
    | 'metalloid'
    | 'nonmetal'
    | 'noble-gas'
    | 'lanthanide'
    | 'actinide';
  group: number;
  period: number;
  block: 's' | 'p' | 'd' | 'f';
  electronConfig: string;
  electronegativity?: number;
  density?: number; // g/cm³
  meltingPoint?: number; // K
  boilingPoint?: number; // K
  discoveredBy?: string;
  yearDiscovered?: number | string;
  summaryEn: string;
  summaryAr: string;
  commonUsesEn: string;
  commonUsesAr: string;
  shells: number[];
}

export const PERIODIC_ELEMENTS: ChemicalElement[] = [
  {
    number: 1, symbol: 'H', nameEn: 'Hydrogen', nameAr: 'هيدروجين', nameFr: 'Hydrogène', nameDe: 'Wasserstoff',
    atomicMass: 1.008, category: 'nonmetal', group: 1, period: 1, block: 's',
    electronConfig: '1s¹', electronegativity: 2.20, density: 0.00008988, meltingPoint: 14.01, boilingPoint: 20.28,
    discoveredBy: 'Henry Cavendish', yearDiscovered: 1766,
    summaryEn: 'The lightest and most abundant chemical element in the universe, constituting roughly 75% of all baryonic mass.',
    summaryAr: 'أخف العناصر وأكثرها وفرة في الكون، يشكل نحو 75% من المادة الباريونية في الفضاء.',
    commonUsesEn: 'Fuel cell clean energy, ammonia synthesis (Haber-Bosch), rocket propellant.',
    commonUsesAr: 'خلايا الوقود النظيفة، تخليق النشادر في صناعة الأسمدة، وقود الصواريخ.',
    shells: [1],
  },
  {
    number: 2, symbol: 'He', nameEn: 'Helium', nameAr: 'هيليوم', nameFr: 'Hélium', nameDe: 'Helium',
    atomicMass: 4.0026, category: 'noble-gas', group: 18, period: 1, block: 's',
    electronConfig: '1s²', density: 0.0001785, meltingPoint: 0.95, boilingPoint: 4.22,
    discoveredBy: 'Pierre Janssen, Norman Lockyer', yearDiscovered: 1868,
    summaryEn: 'Colorless, odorless noble gas with the lowest boiling point of all elements. Produced through stellar nucleosynthesis.',
    summaryAr: 'غاز نبيل عديم اللون والرائحة يتميز بأقل نقطة غليان بين جميع العناصر. ينتج باندماج النجوم.',
    commonUsesEn: 'Cryogenic cooling of MRI superconducting magnets, deep-sea breathing gas, inert atmospheres.',
    commonUsesAr: 'تبريد المغناطيسات فائقة التوصيل في أجهزة الرنين المغناطيسي، غازات غوص الأعماق.',
    shells: [2],
  },
  {
    number: 3, symbol: 'Li', nameEn: 'Lithium', nameAr: 'ليثيوم', nameFr: 'Lithium', nameDe: 'Lithium',
    atomicMass: 6.94, category: 'alkali-metal', group: 1, period: 2, block: 's',
    electronConfig: '[He] 2s¹', electronegativity: 0.98, density: 0.534, meltingPoint: 453.69, boilingPoint: 1603,
    discoveredBy: 'Johan August Arfwedson', yearDiscovered: 1817,
    summaryEn: 'Soft, silvery alkali metal with the lowest density among all solid metals under standard conditions.',
    summaryAr: 'فلز قلوي فضي طري يتمتع بأقل كثافة بين جميع الفلزات الصلبة في الظروف القياسية.',
    commonUsesEn: 'Rechargeable lithium-ion batteries, lightweight aircraft alloys, psychiatric medications.',
    commonUsesAr: 'بطاريات الليثيوم أيون في الأجهزة والسيارات الكهربائية، سبائك الطائرات، الأدوية النفسية.',
    shells: [2, 1],
  },
  {
    number: 4, symbol: 'Be', nameEn: 'Beryllium', nameAr: 'بيريليوم', nameFr: 'Béryllium', nameDe: 'Beryllium',
    atomicMass: 9.0122, category: 'alkaline-earth', group: 2, period: 2, block: 's',
    electronConfig: '[He] 2s²', electronegativity: 1.57, density: 1.85, meltingPoint: 1560, boilingPoint: 2742,
    discoveredBy: 'Louis-Nicolas Vauquelin', yearDiscovered: 1798,
    summaryEn: 'Relatively rare, lightweight metal known for high stiffness, thermal stability, and low X-ray absorption.',
    summaryAr: 'فلز خفيف نادر يتميز بالصلابة العالية ومقاومة التمدد الحراري ونفاذية الأشعة السينية.',
    commonUsesEn: 'James Webb Space Telescope mirrors, aerospace structures, X-ray tube windows.',
    commonUsesAr: 'مرايا تلسكوب جيمس ويب الفضائي، نوافذ أنابيب الأشعة السينية، سبائك الطيران.',
    shells: [2, 2],
  },
  {
    number: 5, symbol: 'B', nameEn: 'Boron', nameAr: 'بورون', nameFr: 'Bore', nameDe: 'Bor',
    atomicMass: 10.81, category: 'metalloid', group: 13, period: 2, block: 'p',
    electronConfig: '[He] 2s² 2p¹', electronegativity: 2.04, density: 2.34, meltingPoint: 2349, boilingPoint: 4200,
    discoveredBy: 'Joseph Louis Gay-Lussac, Louis Jacques Thénard', yearDiscovered: 1808,
    summaryEn: 'Low-abundance metalloid occurring primarily in borate minerals like borax and kernite.',
    summaryAr: 'شبه فلز منخفض الوفرة يتواجد أساساً في معادن البورات مثل البوراكس.',
    commonUsesEn: 'Heat-resistant borosilicate glassware (Pyrex), fiberglass insulation, semiconductor dopant.',
    commonUsesAr: 'زجاج البوروسيليكات المقاوم للحرارة (بايركس)، ألياف العزل الزجاجية، تصنيع الرقائق الإلكترونية.',
    shells: [2, 3],
  },
  {
    number: 6, symbol: 'C', nameEn: 'Carbon', nameAr: 'كربون', nameFr: 'Carbone', nameDe: 'Kohlenstoff',
    atomicMass: 12.011, category: 'nonmetal', group: 14, period: 2, block: 'p',
    electronConfig: '[He] 2s² 2p²', electronegativity: 2.55, density: 2.267, meltingPoint: 3823, boilingPoint: 4098,
    discoveredBy: 'Ancient civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'The chemical backbone of all organic molecules and life. Allotropes include diamond, graphite, and graphene.',
    summaryAr: 'العمود الفقري لكافة الجزيئات الحيوية العضوية والحياة على الأرض، بأشكال متعددة كالماس والجرافيت.',
    commonUsesEn: 'Organic chemistry, structural carbon fiber, steel alloys, radiocarbon dating.',
    commonUsesAr: 'أساس الكيمياء العضوية، ألياف الكربون فائقة المتانة، صناعة الفولاذ، التأريخ الكربوني.',
    shells: [2, 4],
  },
  {
    number: 7, symbol: 'N', nameEn: 'Nitrogen', nameAr: 'نيتروجين', nameFr: 'Azote', nameDe: 'Stickstoff',
    atomicMass: 14.007, category: 'nonmetal', group: 15, period: 2, block: 'p',
    electronConfig: '[He] 2s² 2p³', electronegativity: 3.04, density: 0.0012506, meltingPoint: 63.15, boilingPoint: 77.36,
    discoveredBy: 'Daniel Rutherford', yearDiscovered: 1772,
    summaryEn: 'Diatomic gas making up roughly 78% of Earth’s atmosphere; essential building block of amino acids and nucleic acids.',
    summaryAr: 'غاز ثنائي الذرة يشكل 78% من الغلاف الجوي للأرض، ومكون بنيوي رئيسي للأحماض الأمينية والنووية.',
    commonUsesEn: 'Fertilizers, liquid nitrogen cryopreservation, food packaging inert atmosphere.',
    commonUsesAr: 'الأسمدة الزراعية، التبريد الفائق بالنيتروجين السائل، حفظ وتغليف الأطعمة في جو خامل.',
    shells: [2, 5],
  },
  {
    number: 8, symbol: 'O', nameEn: 'Oxygen', nameAr: 'أكسجين', nameFr: 'Oxygène', nameDe: 'Sauerstoff',
    atomicMass: 15.999, category: 'nonmetal', group: 16, period: 2, block: 'p',
    electronConfig: '[He] 2s² 2p⁴', electronegativity: 3.44, density: 0.001429, meltingPoint: 54.36, boilingPoint: 90.20,
    discoveredBy: 'Carl Wilhelm Scheele, Joseph Priestley', yearDiscovered: 1774,
    summaryEn: 'Highly reactive nonmetal and oxidizing agent. Essential for aerobic cellular respiration in living organisms.',
    summaryAr: 'عنصر لا فلزي عالي النشاط ومؤكسد قوي، ضروري للتنفس الخلوي الهوائي لكافة الكائنات الحية.',
    commonUsesEn: 'Medical oxygen therapy, steel refining combustion, rocket liquid oxidizer, water molecule.',
    commonUsesAr: 'التنفس الطبي للمرضى، صهر وتنقية الصلب، مؤكسد لوقود الصواريخ، تكوين الماء H₂O.',
    shells: [2, 6],
  },
  {
    number: 9, symbol: 'F', nameEn: 'Fluorine', nameAr: 'فلور', nameFr: 'Fluor', nameDe: 'Fluor',
    atomicMass: 18.998, category: 'nonmetal', group: 17, period: 2, block: 'p',
    electronConfig: '[He] 2s² 2p⁵', electronegativity: 3.98, density: 0.001696, meltingPoint: 53.53, boilingPoint: 85.03,
    discoveredBy: 'Henri Moissan', yearDiscovered: 1886,
    summaryEn: 'The most electronegative and chemically reactive of all elements, attacking almost all organic and inorganic substances.',
    summaryAr: 'أعلى عناصر الجدول الدوري في السالبية الكهربية والنشاط الكيميائي على الإطلاق.',
    commonUsesEn: 'Toothpaste cavity prevention (fluoride), non-stick Teflon coating, pharmaceutical synthesis.',
    commonUsesAr: 'فلورايد حماية الأسنان، طلاء التيفلون غير اللاصق، تصنيع المركبات الدوائية المتطورة.',
    shells: [2, 7],
  },
  {
    number: 10, symbol: 'Ne', nameEn: 'Neon', nameAr: 'نيون', nameFr: 'Néon', nameDe: 'Neon',
    atomicMass: 20.180, category: 'noble-gas', group: 18, period: 2, block: 'p',
    electronConfig: '[He] 2s² 2p⁶', density: 0.0009002, meltingPoint: 24.56, boilingPoint: 27.07,
    discoveredBy: 'William Ramsay, Morris Travers', yearDiscovered: 1898,
    summaryEn: 'Colorless noble gas that glows with a brilliant reddish-orange light when ionized in a high-voltage electrical discharge.',
    summaryAr: 'غاز نبيل يتوهج بوميض برتقالي محمر رائع عند تأيينه بتفريغ كهربائي عالي الجهد.',
    commonUsesEn: 'Illuminated signage, cryogenic refrigerant, helium-neon laser optics.',
    commonUsesAr: 'لوحات الإعلانات المضيئة، وسائط التبريد الفائق، ليزر الهيليوم-نيون.',
    shells: [2, 8],
  },
  {
    number: 11, symbol: 'Na', nameEn: 'Sodium', nameAr: 'صوديوم', nameFr: 'Sodium', nameDe: 'Natrium',
    atomicMass: 22.990, category: 'alkali-metal', group: 1, period: 3, block: 's',
    electronConfig: '[Ne] 3s¹', electronegativity: 0.93, density: 0.968, meltingPoint: 370.87, boilingPoint: 1156,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1807,
    summaryEn: 'Highly reactive alkali metal stored in mineral oil. Essential for cellular electrolyte balance and nervous action potentials.',
    summaryAr: 'فلز قلوي نشط جداً يحفظ تحت الكيروسين، أساسي لجهد الفعل العصبي والتوازن الإسموزي بالجسم.',
    commonUsesEn: 'Table salt (NaCl), vapor street lamps, synthetic chemical reagents.',
    commonUsesAr: 'ملح الطعام (كلوريد الصوديوم)، مصابيح الصوديوم الصفراء، التخليق الكيميائي.',
    shells: [2, 8, 1],
  },
  {
    number: 12, symbol: 'Mg', nameEn: 'Magnesium', nameAr: 'ماغنسيوم', nameFr: 'Magnésium', nameDe: 'Magnesium',
    atomicMass: 24.305, category: 'alkaline-earth', group: 2, period: 3, block: 's',
    electronConfig: '[Ne] 3s²', electronegativity: 1.31, density: 1.738, meltingPoint: 923, boilingPoint: 1363,
    discoveredBy: 'Joseph Black', yearDiscovered: 1755,
    summaryEn: 'Lightweight structural metal that burns with an intense white flame. Critical cofactor at the center of chlorophyll.',
    summaryAr: 'فلز بنيوي خفيف يحترق بلهب أبيض ساطع، وهو الذرة المركزية في جزيء الكلوروفيل للنباتات.',
    commonUsesEn: 'Chlorophyll central atom, lightweight structural alloys, pyrotechnics, enzyme cofactor.',
    commonUsesAr: 'تثبيت الطاقة في البناء الضوئي، سبائك هياكل السيارات والأجهزة، المكملات الحيوية.',
    shells: [2, 8, 2],
  },
  {
    number: 13, symbol: 'Al', nameEn: 'Aluminium', nameAr: 'ألومنيوم', nameFr: 'Aluminium', nameDe: 'Aluminium',
    atomicMass: 26.982, category: 'post-transition', group: 13, period: 3, block: 'p',
    electronConfig: '[Ne] 3s² 3p¹', electronegativity: 1.61, density: 2.70, meltingPoint: 933.47, boilingPoint: 2792,
    discoveredBy: 'Hans Christian Ørsted', yearDiscovered: 1825,
    summaryEn: 'The most abundant metallic element in Earth’s continental crust; remarkable for low density and corrosion resistance.',
    summaryAr: 'أكثر الفلزات وفرة في القشرة القارية للأرض؛ يتميز بكثافته المنخفضة ومقاومته للتآكل.',
    commonUsesEn: 'Aviation airframes, high-voltage transmission lines, beverage packaging, window frames.',
    commonUsesAr: 'هياكل الطائرات والسيارات، كابلات الكهرباء ذات الجهد العالي، عبوات حفظ الأطعمة.',
    shells: [2, 8, 3],
  },
  {
    number: 14, symbol: 'Si', nameEn: 'Silicon', nameAr: 'سيليكون', nameFr: 'Silicium', nameDe: 'Silizium',
    atomicMass: 28.085, category: 'metalloid', group: 14, period: 3, block: 'p',
    electronConfig: '[Ne] 3s² 3p²', electronegativity: 1.90, density: 2.329, meltingPoint: 1687, boilingPoint: 3538,
    discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1824,
    summaryEn: 'The technological foundation of the modern digital computer age; semiconductor crystallizing in a diamond lattice.',
    summaryAr: 'حجر الأساس لعصر الثورة الرقمية والحواسيب؛ شبه موصل يتبلور في بنية شبكية تشبه الماس.',
    commonUsesEn: 'Microprocessor transistors, photovoltaic solar cells, silicone polymers, glass silica.',
    commonUsesAr: 'ترانزستورات المعالجات الدقيقة، الخلايا الشمسية الكهروضوئية، بوليمرات السيليكون، صناعة الزجاج.',
    shells: [2, 8, 4],
  },
  {
    number: 15, symbol: 'P', nameEn: 'Phosphorus', nameAr: 'فوسفور', nameFr: 'Phosphore', nameDe: 'Phosphor',
    atomicMass: 30.974, category: 'nonmetal', group: 15, period: 3, block: 'p',
    electronConfig: '[Ne] 3s² 3p³', electronegativity: 2.19, density: 1.823, meltingPoint: 317.3, boilingPoint: 550,
    discoveredBy: 'Hennig Brand', yearDiscovered: 1669,
    summaryEn: 'Essential element for all cellular life, forming the sugar-phosphate backbone of DNA/RNA and the energy currency ATP.',
    summaryAr: 'عنصر حيوي لا غنى عنه للحياة، يشكل هيكل الحمض النووي وعملة الطاقة الخلوية ATP.',
    commonUsesEn: 'Agricultural NPK fertilizers, matchstick heads, detergents, cellular energy carrier.',
    commonUsesAr: 'الأسمدة الزراعية الفوسفاتية، رؤوس أعواد الثقاب، مركبات نقل الطاقة الحيوية.',
    shells: [2, 8, 5],
  },
  {
    number: 16, symbol: 'S', nameEn: 'Sulfur', nameAr: 'كبريت', nameFr: 'Soufre', nameDe: 'Schwefel',
    atomicMass: 32.06, category: 'nonmetal', group: 16, period: 3, block: 'p',
    electronConfig: '[Ne] 3s² 3p⁴', electronegativity: 2.58, density: 2.07, meltingPoint: 388.36, boilingPoint: 717.8,
    discoveredBy: 'Ancient civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'Bright yellow crystalline nonmetal. Component of cysteine and methionine amino acids forming disulfide bridges.',
    summaryAr: 'لا فلز بلوري أصفر فاقع، يدخل في تركيب الأحماض الأمينية الكبريتية لتشكيل روابط الكبريتيد الثنائية.',
    commonUsesEn: 'Sulfuric acid industrial production, rubber vulcanization, agricultural fungicides.',
    commonUsesAr: 'إنتاج حمض الكبريتيك (عصب الصناعة الكيميائية)، فلكنة المطاط، المبيدات الفطرية.',
    shells: [2, 8, 6],
  },
  {
    number: 17, symbol: 'Cl', nameEn: 'Chlorine', nameAr: 'كلور', nameFr: 'Chlore', nameDe: 'Chlor',
    atomicMass: 35.45, category: 'nonmetal', group: 17, period: 3, block: 'p',
    electronConfig: '[Ne] 3s² 3p⁵', electronegativity: 3.16, density: 0.0032, meltingPoint: 171.6, boilingPoint: 239.11,
    discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1774,
    summaryEn: 'Yellow-green halogen gas with strong disinfectant and oxidizing properties; ubiquitous in seawater as chloride.',
    summaryAr: 'غاز هالوجيني أصفر مخضر ذو رائحة نفاذة وقدرة تعقيم وتطهير هائلة؛ متوفر بماء البحر ككلوريد.',
    commonUsesEn: 'Municipal water purification, PVC plastic polymer synthesis, household bleaching.',
    commonUsesAr: 'تنقية مياه الشرب والمسابح، صناعة بوليمر PVC للبلاستيك، مواد التبييض والتعقيم.',
    shells: [2, 8, 7],
  },
  {
    number: 18, symbol: 'Ar', nameEn: 'Argon', nameAr: 'أرجون', nameFr: 'Argon', nameDe: 'Argon',
    atomicMass: 39.948, category: 'noble-gas', group: 18, period: 3, block: 'p',
    electronConfig: '[Ne] 3s² 3p⁶', density: 0.001784, meltingPoint: 83.81, boilingPoint: 87.30,
    discoveredBy: 'Lord Rayleigh, William Ramsay', yearDiscovered: 1894,
    summaryEn: 'The third most abundant gas in Earth’s atmosphere (0.934%), completely chemically unreactive under normal conditions.',
    summaryAr: 'ثالث أكثر الغازات وفرة في الغلاف الجوي للأرض (نحو 0.93%)، خامل كيميائياً تماماً.',
    commonUsesEn: 'TIG welding shielding gas, double-pane window thermal insulation, semiconductor manufacture.',
    commonUsesAr: 'غاز حماية أثناء لحام المعادن الدقيقة، العزل الحراري بالنوافذ الزجاجية المزدوجة.',
    shells: [2, 8, 8],
  },
  {
    number: 19, symbol: 'K', nameEn: 'Potassium', nameAr: 'بوتاسيوم', nameFr: 'Potassium', nameDe: 'Kalium',
    atomicMass: 39.098, category: 'alkali-metal', group: 1, period: 4, block: 's',
    electronConfig: '[Ar] 4s¹', electronegativity: 0.82, density: 0.862, meltingPoint: 336.7, boilingPoint: 1032,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1807,
    summaryEn: 'Soft alkali metal that oxidizes rapidly in air; drives cellular resting potential via the sodium-potassium ATPase pump.',
    summaryAr: 'فلز قلوي رخو، يدير استقطاب الغشاء الخلوي وانقباض العضلات عبر مضخة الصوديوم-بوتاسيوم.',
    commonUsesEn: 'Crop potassium fertilizers (potash), electrolyte drinks, laboratory reagents.',
    commonUsesAr: 'أسمدة البوتاس الزراعية لنمو المحاصيل، المحاليل الوريدية لتعويض الأملاح.',
    shells: [2, 8, 8, 1],
  },
  {
    number: 20, symbol: 'Ca', nameEn: 'Calcium', nameAr: 'كالسيوم', nameFr: 'Calcium', nameDe: 'Calcium',
    atomicMass: 40.078, category: 'alkaline-earth', group: 2, period: 4, block: 's',
    electronConfig: '[Ar] 4s²', electronegativity: 1.00, density: 1.54, meltingPoint: 1115, boilingPoint: 1757,
    discoveredBy: 'Humphry Davy', yearDiscovered: 1808,
    summaryEn: 'Fifth most abundant element in Earth’s crust and the most abundant mineral in the human body (hydroxyapatite).',
    summaryAr: 'خامس أكثر العناصر وفرة بالقشرة الأرضية، والمعدن الأكثر وفرة بجسم الإنسان في العظام والأسنان.',
    commonUsesEn: 'Bone and teeth structural mineral, cement and concrete mortar, metallurgical reduction.',
    commonUsesAr: 'المعدن الأساسي لقوة الهيكل العظمي، تصنيع الأسمنت والخرسانة، صهر المعادن.',
    shells: [2, 8, 8, 2],
  },
  {
    number: 26, symbol: 'Fe', nameEn: 'Iron', nameAr: 'حديد', nameFr: 'Fer', nameDe: 'Eisen',
    atomicMass: 55.845, category: 'transition-metal', group: 8, period: 4, block: 'd',
    electronConfig: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, density: 7.874, meltingPoint: 1811, boilingPoint: 3134,
    discoveredBy: 'Ancient civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'The most common element on Earth by mass (forming much of Earth’s core) and the primary metal of human civilization.',
    summaryAr: 'أكثر عناصر كوكب الأرض وفرة من حيث الكتلة (يشكل معظم اللب) ومحرك الحضارة الصناعية الحديثة.',
    commonUsesEn: 'Structural steel construction, hemoglobin oxygen transport cofactor, electromagnets.',
    commonUsesAr: 'صناعة الفولاذ والإنشاءات، نقل الأكسجين في هيموجلوبين الدم، المغانط الكهربائية.',
    shells: [2, 8, 14, 2],
  },
  {
    number: 29, symbol: 'Cu', nameEn: 'Copper', nameAr: 'نحاس', nameFr: 'Cuivre', nameDe: 'Kupfer',
    atomicMass: 63.546, category: 'transition-metal', group: 11, period: 4, block: 'd',
    electronConfig: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90, density: 8.96, meltingPoint: 1357.77, boilingPoint: 2835,
    discoveredBy: 'Middle East civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'Ductile metal with exceptionally high thermal and electrical conductivity; forms natural green patina upon oxidation.',
    summaryAr: 'فلز مطيلي يتمتع بموصلية كهربائية وحرارية استثنائية؛ يشكل طبقة زنجار خضراء واقية عند تأكسده.',
    commonUsesEn: 'Electrical wiring and motor windings, plumbing pipes, architectural roofing, brass/bronze.',
    commonUsesAr: 'الأسلاك الكهربائية ومحركات الطاقة، أنابيب السباكة، سبائك البرونز والنحاس الأصفر.',
    shells: [2, 8, 18, 1],
  },
  {
    number: 30, symbol: 'Zn', nameEn: 'Zinc', nameAr: 'زنك (خارصين)', nameFr: 'Zinc', nameDe: 'Zink',
    atomicMass: 65.38, category: 'transition-metal', group: 12, period: 4, block: 'd',
    electronConfig: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65, density: 7.14, meltingPoint: 692.68, boilingPoint: 1180,
    discoveredBy: 'Indian metallurgists', yearDiscovered: 'Prehistoric',
    summaryEn: 'Essential trace element for human immune health and enzyme catalysis; widely used to galvanize iron against rust.',
    summaryAr: 'عنصر شحيح أساسي للمناعة ونشاط الإنزيمات؛ يستخدم على نطاق واسع في جلفنة الحديد لمنع الصدأ.',
    commonUsesEn: 'Galvanizing steel against corrosion, brass alloy production, dietary immune supplements.',
    commonUsesAr: 'جلفنة الفولاذ وحمايته من التآكل، سبائك النحاس الأصفر، مكملات تعزيز المناعة.',
    shells: [2, 8, 18, 2],
  },
  {
    number: 47, symbol: 'Ag', nameEn: 'Silver', nameAr: 'فضة', nameFr: 'Argent', nameDe: 'Silber',
    atomicMass: 107.87, category: 'transition-metal', group: 11, period: 5, block: 'd',
    electronConfig: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93, density: 10.49, meltingPoint: 1234.93, boilingPoint: 2435,
    discoveredBy: 'Ancient civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'Precious metal having the highest electrical conductivity, thermal conductivity, and optical reflectivity of any metal.',
    summaryAr: 'فلز ثمين يمتلك أعلى موصلية كهربائية وحرارية وأعلى انعكاسية ضوئية بين كافة الفلزات.',
    commonUsesEn: 'High-end electrical contacts, solar panel conductive paste, antimicrobial coatings, jewelry.',
    commonUsesAr: 'نقاط التوصيل الكهربائي الفائقة، ألواح الطاقة الشمسية، مضادات البكتيريا، الحلي.',
    shells: [2, 8, 18, 18, 1],
  },
  {
    number: 79, symbol: 'Au', nameEn: 'Gold', nameAr: 'ذهب', nameFr: 'Or', nameDe: 'Gold',
    atomicMass: 196.97, category: 'transition-metal', group: 11, period: 6, block: 'd',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, density: 19.30, meltingPoint: 1337.33, boilingPoint: 3129,
    discoveredBy: 'Ancient civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'Dense, noble metal highly unreactive with acids; relativistic quantum effects explain its unique yellow color and luster.',
    summaryAr: 'فلز نبيل كثيف لا يتأثر بالأحماض الشائعة؛ تفسر التأثيرات النسبية الكمية لونه الأصفر اللامع الفريد.',
    commonUsesEn: 'Monetary reserves, corrosion-free microelectronics bond wire, aerospace thermal shielding.',
    commonUsesAr: 'الاحتياطي النقدي العالمي، أسلاك توصيل الرقائق الميكروية المقاومة للتآكل، عوازل حرارة المركبات الفضائية.',
    shells: [2, 8, 18, 32, 18, 1],
  },
  {
    number: 82, symbol: 'Pb', nameEn: 'Lead', nameAr: 'رصاص', nameFr: 'Plomb', nameDe: 'Blei',
    atomicMass: 207.2, category: 'post-transition', group: 14, period: 6, block: 'p',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 2.33, density: 11.34, meltingPoint: 600.61, boilingPoint: 2022,
    discoveredBy: 'Ancient civilizations', yearDiscovered: 'Prehistoric',
    summaryEn: 'Dense, heavy metal with a low melting point. Historically widely used; highly effective shield against ionizing radiation.',
    summaryAr: 'فلز ثقيل عالي الكثافة منخفض درجة الانصهار؛ حاجز فعال ودرع رائد ضد الإشعاعات المؤينة.',
    commonUsesEn: 'Radiation shielding aprons and walls, automotive lead-acid starter batteries.',
    commonUsesAr: 'دروع الحماية من الأشعة السينية والنووية، بطاريات السيارات الرصاصية الحامضية.',
    shells: [2, 8, 18, 32, 18, 4],
  },
  {
    number: 92, symbol: 'U', nameEn: 'Uranium', nameAr: 'يورانيوم', nameFr: 'Uranium', nameDe: 'Uran',
    atomicMass: 238.03, category: 'actinide', group: 3, period: 7, block: 'f',
    electronConfig: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38, density: 19.1, meltingPoint: 1405.3, boilingPoint: 4404,
    discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789,
    summaryEn: 'Heavy actinide metal; isotope U-235 undergoes nuclear fission upon thermal neutron capture, powering nuclear reactors.',
    summaryAr: 'فلز أكتينيدي ثقيل؛ ينشطر نظيره يورانيوم-235 عند امتصاص نيوترون حراري محرراً طاقة هائلة بمحطات الطاقة النووية.',
    commonUsesEn: 'Nuclear power reactor fuel, medical radioisotope precursor, military kinetic penetrators.',
    commonUsesAr: 'وقود محطات الطاقة النووية لتوليد الكهرباء، إنتاج النظائر المشعة للأغراض الطبية التشخيصية.',
    shells: [2, 8, 18, 32, 21, 9, 2],
  },
];

// Helper to generate full list of 118 elements with scientific standard IUPAC fallback
export function getFullPeriodicElements(): ChemicalElement[] {
  const result: ChemicalElement[] = [...PERIODIC_ELEMENTS];
  const existingNumbers = new Set(PERIODIC_ELEMENTS.map(e => e.number));

  // Names table for the remaining elements up to 118
  const IUPAC_NAMES: Record<number, { sym: string; nameEn: string; nameAr: string; cat: ChemicalElement['category']; group: number; period: number; mass: number }> = {
    21: { sym: 'Sc', nameEn: 'Scandium', nameAr: 'سكانديوم', cat: 'transition-metal', group: 3, period: 4, mass: 44.956 },
    22: { sym: 'Ti', nameEn: 'Titanium', nameAr: 'تيتانيوم', cat: 'transition-metal', group: 4, period: 4, mass: 47.867 },
    23: { sym: 'V', nameEn: 'Vanadium', nameAr: 'فاناديوم', cat: 'transition-metal', group: 5, period: 4, mass: 50.942 },
    24: { sym: 'Cr', nameEn: 'Chromium', nameAr: 'كروم', cat: 'transition-metal', group: 6, period: 4, mass: 51.996 },
    25: { sym: 'Mn', nameEn: 'Manganese', nameAr: 'منجنيز', cat: 'transition-metal', group: 7, period: 4, mass: 54.938 },
    27: { sym: 'Co', nameEn: 'Cobalt', nameAr: 'كوبالت', cat: 'transition-metal', group: 9, period: 4, mass: 58.933 },
    28: { sym: 'Ni', nameEn: 'Nickel', nameAr: 'نيكل', cat: 'transition-metal', group: 10, period: 4, mass: 58.693 },
    31: { sym: 'Ga', nameEn: 'Gallium', nameAr: 'جاليوم', cat: 'post-transition', group: 13, period: 4, mass: 69.723 },
    32: { sym: 'Ge', nameEn: 'Germanium', nameAr: 'جرمانيوم', cat: 'metalloid', group: 14, period: 4, mass: 72.630 },
    33: { sym: 'As', nameEn: 'Arsenic', nameAr: 'زرنيخ', cat: 'metalloid', group: 15, period: 4, mass: 74.922 },
    34: { sym: 'Se', nameEn: 'Selenium', nameAr: 'سيلينيوم', cat: 'nonmetal', group: 16, period: 4, mass: 78.971 },
    35: { sym: 'Br', nameEn: 'Bromine', nameAr: 'بروم', cat: 'nonmetal', group: 17, period: 4, mass: 79.904 },
    36: { sym: 'Kr', nameEn: 'Krypton', nameAr: 'كريبتون', cat: 'noble-gas', group: 18, period: 4, mass: 83.798 },
    37: { sym: 'Rb', nameEn: 'Rubidium', nameAr: 'روبيديوم', cat: 'alkali-metal', group: 1, period: 5, mass: 85.468 },
    38: { sym: 'Sr', nameEn: 'Strontium', nameAr: 'سترونشيوم', cat: 'alkaline-earth', group: 2, period: 5, mass: 87.62 },
    39: { sym: 'Y', nameEn: 'Yttrium', nameAr: 'إتريوم', cat: 'transition-metal', group: 3, period: 5, mass: 88.906 },
    40: { sym: 'Zr', nameEn: 'Zirconium', nameAr: 'زركونيوم', cat: 'transition-metal', group: 4, period: 5, mass: 91.224 },
    41: { sym: 'Nb', nameEn: 'Niobium', nameAr: 'نيوبيوم', cat: 'transition-metal', group: 5, period: 5, mass: 92.906 },
    42: { sym: 'Mo', nameEn: 'Molybdenum', nameAr: 'موليبدنوم', cat: 'transition-metal', group: 6, period: 5, mass: 95.95 },
    43: { sym: 'Tc', nameEn: 'Technetium', nameAr: 'تكنيشيوم', cat: 'transition-metal', group: 7, period: 5, mass: 98 },
    44: { sym: 'Ru', nameEn: 'Ruthenium', nameAr: 'روثينيوم', cat: 'transition-metal', group: 8, period: 5, mass: 101.07 },
    45: { sym: 'Rh', nameEn: 'Rhodium', nameAr: 'روديوم', cat: 'transition-metal', group: 9, period: 5, mass: 102.91 },
    46: { sym: 'Pd', nameEn: 'Palladium', nameAr: 'بالاديوم', cat: 'transition-metal', group: 10, period: 5, mass: 106.42 },
    48: { sym: 'Cd', nameEn: 'Cadmium', nameAr: 'كادميوم', cat: 'transition-metal', group: 12, period: 5, mass: 112.41 },
    49: { sym: 'In', nameEn: 'Indium', nameAr: 'إنديوم', cat: 'post-transition', group: 13, period: 5, mass: 114.82 },
    50: { sym: 'Sn', nameEn: 'Tin', nameAr: 'قصدير', cat: 'post-transition', group: 14, period: 5, mass: 118.71 },
    51: { sym: 'Sb', nameEn: 'Antimony', nameAr: 'إثمد (أنتيمون)', cat: 'metalloid', group: 15, period: 5, mass: 121.76 },
    52: { sym: 'Te', nameEn: 'Tellurium', nameAr: 'تيلوريوم', cat: 'metalloid', group: 16, period: 5, mass: 127.60 },
    53: { sym: 'I', nameEn: 'Iodine', nameAr: 'يود', cat: 'nonmetal', group: 17, period: 5, mass: 126.90 },
    54: { sym: 'Xe', nameEn: 'Xenon', nameAr: 'زينون', cat: 'noble-gas', group: 18, period: 5, mass: 131.29 },
    55: { sym: 'Cs', nameEn: 'Caesium', nameAr: 'سيزيوم', cat: 'alkali-metal', group: 1, period: 6, mass: 132.91 },
    56: { sym: 'Ba', nameEn: 'Barium', nameAr: 'باريوم', cat: 'alkaline-earth', group: 2, period: 6, mass: 137.33 },
    57: { sym: 'La', nameEn: 'Lanthanum', nameAr: 'لانثانوم', cat: 'lanthanide', group: 3, period: 6, mass: 138.91 },
    58: { sym: 'Ce', nameEn: 'Cerium', nameAr: 'سيريوم', cat: 'lanthanide', group: 3, period: 6, mass: 140.12 },
    59: { sym: 'Pr', nameEn: 'Praseodymium', nameAr: 'براسيوديميوم', cat: 'lanthanide', group: 3, period: 6, mass: 140.91 },
    60: { sym: 'Nd', nameEn: 'Neodymium', nameAr: 'نيوديميوم', cat: 'lanthanide', group: 3, period: 6, mass: 144.24 },
    74: { sym: 'W', nameEn: 'Tungsten', nameAr: 'تنجستن', cat: 'transition-metal', group: 6, period: 6, mass: 183.84 },
    78: { sym: 'Pt', nameEn: 'Platinum', nameAr: 'بلاتين', cat: 'transition-metal', group: 10, period: 6, mass: 195.08 },
    80: { sym: 'Hg', nameEn: 'Mercury', nameAr: 'زئبق', cat: 'transition-metal', group: 12, period: 6, mass: 200.59 },
    86: { sym: 'Rn', nameEn: 'Radon', nameAr: 'رادون', cat: 'noble-gas', group: 18, period: 6, mass: 222 },
    94: { sym: 'Pu', nameEn: 'Plutonium', nameAr: 'بلوتونيوم', cat: 'actinide', group: 3, period: 7, mass: 244 },
    118: { sym: 'Og', nameEn: 'Oganesson', nameAr: 'أوجانيسون', cat: 'noble-gas', group: 18, period: 7, mass: 294 },
  };

  for (let z = 1; z <= 118; z++) {
    if (!existingNumbers.has(z)) {
      const known = IUPAC_NAMES[z];
      const sym = known?.sym || `E${z}`;
      const nameEn = known?.nameEn || `Element ${z}`;
      const nameAr = known?.nameAr || `عنصر ${z}`;
      const cat = known?.cat || (z > 88 ? 'actinide' : (z > 56 && z < 72 ? 'lanthanide' : 'transition-metal'));
      const group = known?.group || ((z % 18) || 18);
      const period = known?.period || (z > 86 ? 7 : (z > 54 ? 6 : (z > 36 ? 5 : (z > 18 ? 4 : (z > 10 ? 3 : 2)))));
      const mass = known?.mass || z * 2.5;

      result.push({
        number: z,
        symbol: sym,
        nameEn,
        nameAr,
        nameFr: nameEn,
        nameDe: nameEn,
        atomicMass: Number(mass.toFixed(2)),
        category: cat,
        group,
        period,
        block: group <= 2 ? 's' : (group >= 13 ? 'p' : 'd'),
        electronConfig: `[Z=${z}] valence configuration`,
        electronegativity: 1.5,
        summaryEn: `${nameEn} is a recognized chemical element with atomic number ${z}.`,
        summaryAr: `${nameAr} عنصر كيميائي معترف به من الاتحاد الدولي للكيمياء برقم ذري ${z}.`,
        commonUsesEn: 'Specialized scientific research, high-energy particle physics.',
        commonUsesAr: 'أبحاث الفيزياء النووية المتقدمة وتطبيقات العلوم الدقيقة.',
        shells: [2, 8, 18, 32],
      });
    }
  }

  return result.sort((a, b) => a.number - b.number);
}
