export interface ChemicalReaction {
  id: string;
  reactants: [string, string]; // e.g. ['Na', 'Cl']
  equation: string;
  equationAr: string;
  typeEn: string;
  typeAr: string;
  energyEn: string;
  energyAr: string;
  productsEn: string;
  productsAr: string;
  colorChangeEn: string;
  colorChangeAr: string;
  temperatureChange: number; // in Celsius change relative to room temp 25C (e.g. +45 means becomes 70C)
  visualEffect: 'bright_flash' | 'orange_fire' | 'blue_flame' | 'smoke_effervescence' | 'purple_vapor' | 'precipitate_yellow' | 'precipitate_white' | 'fizz_bubbles' | 'glow_green' | 'none';
  liquidColor: string; // hex color of final liquid/product
  solidProduct?: string;
  gasReleased?: string;
  safetyHazardAr: string;
  safetyHazardEn: string;
  scientificExplanationAr: string;
  scientificExplanationEn: string;
}

export interface WorkbenchElement {
  symbol: string;
  nameEn: string;
  nameAr: string;
  number: number;
  category: string;
  stateAtRoomTemp: 'solid' | 'liquid' | 'gas';
  colorHex: string;
  valence: number;
}

// Available elements for reactive mixing
export const REACTIVE_ELEMENTS: WorkbenchElement[] = [
  { symbol: 'H', nameEn: 'Hydrogen', nameAr: 'هيدروجين', number: 1, category: 'nonmetal', stateAtRoomTemp: 'gas', colorHex: '#e0f2fe', valence: 1 },
  { symbol: 'Li', nameEn: 'Lithium', nameAr: 'ليثيوم', number: 3, category: 'alkali-metal', stateAtRoomTemp: 'solid', colorHex: '#fda4af', valence: 1 },
  { symbol: 'C', nameEn: 'Carbon', nameAr: 'كربون', number: 6, category: 'nonmetal', stateAtRoomTemp: 'solid', colorHex: '#475569', valence: 4 },
  { symbol: 'N', nameEn: 'Nitrogen', nameAr: 'نيتروجين', number: 7, category: 'nonmetal', stateAtRoomTemp: 'gas', colorHex: '#93c5fd', valence: 3 },
  { symbol: 'O', nameEn: 'Oxygen', nameAr: 'أكسجين', number: 8, category: 'nonmetal', stateAtRoomTemp: 'gas', colorHex: '#38bdf8', valence: 2 },
  { symbol: 'F', nameEn: 'Fluorine', nameAr: 'فلور', number: 9, category: 'halogen', stateAtRoomTemp: 'gas', colorHex: '#a7f3d0', valence: 1 },
  { symbol: 'Na', nameEn: 'Sodium', nameAr: 'صوديوم', number: 11, category: 'alkali-metal', stateAtRoomTemp: 'solid', colorHex: '#fcd34d', valence: 1 },
  { symbol: 'Mg', nameEn: 'Magnesium', nameAr: 'ماغنسيوم', number: 12, category: 'alkaline-earth', stateAtRoomTemp: 'solid', colorHex: '#cbd5e1', valence: 2 },
  { symbol: 'Al', nameEn: 'Aluminum', nameAr: 'ألومنيوم', number: 13, category: 'post-transition', stateAtRoomTemp: 'solid', colorHex: '#94a3b8', valence: 3 },
  { symbol: 'P', nameEn: 'Phosphorus', nameAr: 'فوسفور', number: 15, category: 'nonmetal', stateAtRoomTemp: 'solid', colorHex: '#f97316', valence: 3 },
  { symbol: 'S', nameEn: 'Sulfur', nameAr: 'كبريت', number: 16, category: 'nonmetal', stateAtRoomTemp: 'solid', colorHex: '#fde047', valence: 2 },
  { symbol: 'Cl', nameEn: 'Chlorine', nameAr: 'كلور', number: 17, category: 'halogen', stateAtRoomTemp: 'gas', colorHex: '#86efac', valence: 1 },
  { symbol: 'K', nameEn: 'Potassium', nameAr: 'بوتاسيوم', number: 19, category: 'alkali-metal', stateAtRoomTemp: 'solid', colorHex: '#c084fc', valence: 1 },
  { symbol: 'Ca', nameEn: 'Calcium', nameAr: 'كالسيوم', number: 20, category: 'alkaline-earth', stateAtRoomTemp: 'solid', colorHex: '#e2e8f0', valence: 2 },
  { symbol: 'Fe', nameEn: 'Iron', nameAr: 'حديد', number: 26, category: 'transition-metal', stateAtRoomTemp: 'solid', colorHex: '#b45309', valence: 2 },
  { symbol: 'Cu', nameEn: 'Copper', nameAr: 'نحاس', number: 29, category: 'transition-metal', stateAtRoomTemp: 'solid', colorHex: '#ea580c', valence: 2 },
  { symbol: 'Zn', nameEn: 'Zinc', nameAr: 'زنك / خارصين', number: 30, category: 'transition-metal', stateAtRoomTemp: 'solid', colorHex: '#64748b', valence: 2 },
  { symbol: 'Br', nameEn: 'Bromine', nameAr: 'بروم', number: 35, category: 'halogen', stateAtRoomTemp: 'liquid', colorHex: '#991b1b', valence: 1 },
  { symbol: 'Ag', nameEn: 'Silver', nameAr: 'فضة', number: 47, category: 'transition-metal', stateAtRoomTemp: 'solid', colorHex: '#e2e8f0', valence: 1 },
  { symbol: 'I', nameEn: 'Iodine', nameAr: 'يود', number: 53, category: 'halogen', stateAtRoomTemp: 'solid', colorHex: '#7e22ce', valence: 1 },
];

export const CHEMICAL_REACTIONS_DB: ChemicalReaction[] = [
  // 1. Sodium + Chlorine -> NaCl
  {
    id: 'na-cl',
    reactants: ['Na', 'Cl'],
    equation: '2Na(s) + Cl₂(g) → 2NaCl(s)',
    equationAr: '2Na(صلب) + Cl₂(غاز) → 2NaCl(صلب)',
    typeEn: 'Combination / Synthesis (Redox)',
    typeAr: 'اتحاد مباشر / أكسدة واختزال عنيف',
    energyEn: 'Exothermic (ΔH = -822 kJ/mol)',
    energyAr: 'طارد شديد للحرارة (ΔH = -822 ك.جول/مول)',
    productsEn: 'Sodium Chloride (Table Salt)',
    productsAr: 'كلوريد الصوديوم (ملح الطعام النقي)',
    colorChangeEn: 'Intense bright yellow flame, white dense smoke forming crystalline salt',
    colorChangeAr: 'لهب أصفر ساطع متوهج، يتصاعد دخان أبيض كثيف يترسب كبلورات ملح طعام',
    temperatureChange: 140,
    visualEffect: 'bright_flash',
    liquidColor: '#ffffff',
    solidProduct: 'NaCl (Crystalline Powder)',
    gasReleased: 'Cl₂ consumed',
    safetyHazardAr: 'خطر: تفاعل طارد للحرارة مع وميض شديد وإطلاق طاقة ضوئية وحرارية عالية',
    safetyHazardEn: 'Hazard: Highly exothermic with intense yellow incandescent light',
    scientificExplanationAr: 'يفقد الصوديوم إلكترون التكافؤ بسهولة (جهد تأين منخفض) ليكتسبه الكلور ذو السالبية العالية، مكوناً رابطة أيونية فائقة الاستقرار وشبكة بلورية مكعبة.',
    scientificExplanationEn: 'Sodium donates its valence electron to chlorine forming an octet in both ions, releasing massive lattice energy as crystalline NaCl.'
  },
  // 2. Hydrogen + Oxygen -> H2O
  {
    id: 'h-o',
    reactants: ['H', 'O'],
    equation: '2H₂(g) + O₂(g) → 2H₂O(l) + Energy',
    equationAr: '2H₂(غاز) + O₂(غاز) → 2H₂O(سائل) + طاقة',
    typeEn: 'Combustion / Synthesis',
    typeAr: 'احتراق هيدروجيني / تكوين الماء',
    energyEn: 'Highly Exothermic (ΔH = -572 kJ/mol)',
    energyAr: 'طارد شديد جداً للحرارة والفرقعة',
    productsEn: 'Pure Water Vapor / Liquid Water',
    productsAr: 'بخار ماء متكثف إلى ماء نقي',
    colorChangeEn: 'Pale blue explosive flash with vapor condensation droplets',
    colorChangeAr: 'وميض انفجاري أزرق خافت مصحوب بفرقعة وتكثف قطرات الماء على الجدار',
    temperatureChange: 110,
    visualEffect: 'blue_flame',
    liquidColor: '#38bdf8',
    solidProduct: 'None (Liquid/Vapor)',
    gasReleased: 'H₂O (Superheated Steam)',
    safetyHazardAr: 'تفاعل فرقعة تفجيري مع إطلاق طاقة احتراق نقية ونظيفة (أساس خلايا الوقود)',
    safetyHazardEn: 'Explosive pop sound with clean combustion release',
    scientificExplanationAr: 'تتكسر الروابط التساهمية بين جزيئات الهيدروجين والأكسجين ليعاد ترتيبها في روابط قطبية قوية ومستقرة، مفرزة طاقة كيميائية هائلة.',
    scientificExplanationEn: 'Covalent bonds in H2 and O2 break and reform into lower potential energy polar O-H bonds, releasing explosive energy.'
  },
  // 3. Magnesium + Oxygen -> MgO
  {
    id: 'mg-o',
    reactants: ['Mg', 'O'],
    equation: '2Mg(s) + O₂(g) → 2MgO(s)',
    equationAr: '2Mg(صلب) + O₂(غاز) → 2MgO(صلب)',
    typeEn: 'Combustion / Bright Oxidation',
    typeAr: 'احتراق وتأكسد فوسفوري مبهر',
    energyEn: 'Exothermic (ΔH = -1204 kJ/mol)',
    energyAr: 'طارد شديد للحرارة (ضوء أبيض مبهر)',
    productsEn: 'Magnesium Oxide (White Ash)',
    productsAr: 'أكسيد الماغنسيوم (مسحوق رماد أبيض)',
    colorChangeEn: 'Blinding brilliant white light leaving fine white powder',
    colorChangeAr: 'توهج أبيض شديد اللمعان يعمي البصر، يترك رماداً أبيض نقياً من أكسيد الماغنسيوم',
    temperatureChange: 180,
    visualEffect: 'bright_flash',
    liquidColor: '#f8fafc',
    solidProduct: 'MgO (White Powder)',
    gasReleased: 'None',
    safetyHazardAr: 'تحذير: تجنب النظر المباشر للضوء الأبيض الصادر لمنع إجهاد شبكية العين',
    safetyHazardEn: 'Caution: Intense UV emission - do not look directly at the white flare',
    scientificExplanationAr: 'يحترق شريط الماغنسيوم في جو الأكسجين بانبعاث فوتونات في النطاق فوق البنفسجي والمرئي، مكوناً شبكة أيونية متراصة من أكسيد الماغنسيوم.',
    scientificExplanationEn: 'Rapid oxidation generates extreme temperatures, emitting broad spectrum visible and UV light as MgO forms.'
  },
  // 4. Iron + Sulfur -> FeS
  {
    id: 'fe-s',
    reactants: ['Fe', 'S'],
    equation: 'Fe(s) + S(s) + Heat → FeS(s)',
    equationAr: 'Fe(برادة حديد) + S(مسحوق كبريت) → FeS(كبريتيد حديد)',
    typeEn: 'Direct Synthesis / Combination',
    typeAr: 'اتحاد مباشر لتكوين كبريتيد الفلز',
    energyEn: 'Exothermic once ignited (ΔH = -100 kJ/mol)',
    energyAr: 'طارد ذاتي بعد بدء التسخين التنشيطي',
    productsEn: 'Iron(II) Sulfide (Black Non-magnetic Solid)',
    productsAr: 'كبريتيد الحديد الثنائي (مادة سوداء غير مغناطيسية)',
    colorChangeEn: 'Yellow sulfur and grey iron melt into a glowing red mass that cools black',
    colorChangeAr: 'ينصهر الكبريت الأصفر مع برادة الحديد الرمادية مع توهج جمر أحمر يتحول لكتلة سوداء',
    temperatureChange: 95,
    visualEffect: 'orange_fire',
    liquidColor: '#1e293b',
    solidProduct: 'FeS (Black Insoluble Mass)',
    gasReleased: 'Traces of SO₂',
    safetyHazardAr: 'انبعاث روائح كبريتية مع توهج مستمر دون الحاجة لمصدر لهب خارجي بعد البدء',
    safetyHazardEn: 'Self-sustaining glow with sulfurous fumes',
    scientificExplanationAr: 'يفقد الحديد إلكترونين ليتحول لأيون Fe²⁺ ويتحد مع أيون الكبريتيد S²⁻ ليفقد الحديد خواصه المغناطيسية السابقة كعنصر حر.',
    scientificExplanationEn: 'Iron loses its ferromagnetic properties as it forms a chemical bond with sulfur, creating non-magnetic FeS.'
  },
  // 5. Copper + Sulfur -> Cu2S / CuS
  {
    id: 'cu-s',
    reactants: ['Cu', 'S'],
    equation: '2Cu(s) + S(s) → Cu₂S(s)',
    equationAr: '2Cu(نحاس أحمر) + S(كبريت أصفر) → Cu₂S(صلب أسود)',
    typeEn: 'Synthesis / Sulfidation',
    typeAr: 'اتحاد مباشر لتكوين كبريتيد النحاس',
    energyEn: 'Exothermic (ΔH = -79.5 kJ/mol)',
    energyAr: 'طارد للحرارة مع توهج أحمر داكن',
    productsEn: 'Copper(I) Sulfide (Chalcocite)',
    productsAr: 'كبريتيد النحاس الأحادي الأسود',
    colorChangeEn: 'Reddish metal turns deep blue-black brittle compound',
    colorChangeAr: 'يتحول النحاس الأحمر اللامع إلى مركب هش أسود مزرق داكن',
    temperatureChange: 65,
    visualEffect: 'orange_fire',
    liquidColor: '#0f172a',
    solidProduct: 'Cu₂S (Black Powder)',
    gasReleased: 'None',
    safetyHazardAr: 'تغير تدريجي للون وتصلب المعدن إلى قشور سوداء',
    safetyHazardEn: 'Gradual darkening and formation of brittle black layers',
    scientificExplanationAr: 'يتحد النحاس ساخناً مع أبخرة الكبريت مكوناً مركباً ثنائي التكافؤ يغير التوصيل الكهربي للمعدن.',
    scientificExplanationEn: 'Hot copper reacts with sulfur vapor to produce copper sulfide with completely modified electrical properties.'
  },
  // 6. Zinc + Sulfur -> ZnS
  {
    id: 'zn-s',
    reactants: ['Zn', 'S'],
    equation: 'Zn(s) + S(s) → ZnS(s)',
    equationAr: 'Zn(مسحوق زنك) + S(مسحوق كبريت) → ZnS(كبريتيد زنك)',
    typeEn: 'Vigorous Synthesis / Micro-Rocket Fuel',
    typeAr: 'اتحاد مباشر انفجاري عالي الدفع',
    energyEn: 'Highly Exothermic (ΔH = -206 kJ/mol)',
    energyAr: 'طارد شديد للحرارة مع وميض أخضر أبيض',
    productsEn: 'Zinc Sulfide (White/Pale Yellow Luminescent Solid)',
    productsAr: 'كبريتيد الزنك (مادة فسفورية مبيضة)',
    colorChangeEn: 'Greenish-white flash with intense smoke rocket-like reaction',
    colorChangeAr: 'وميض ساطع أخضر وأبيض مصحوب بدخان نفاث يشبه وقود الصواريخ التجريبية',
    temperatureChange: 160,
    visualEffect: 'glow_green',
    liquidColor: '#fef08a',
    solidProduct: 'ZnS (Phosphorescent Residue)',
    gasReleased: 'Dense White Aerosol',
    safetyHazardAr: 'تفاعل سريع جداً ومفاجئ يطلق غازات دافعة سريعة ووميض فسفوري',
    safetyHazardEn: 'Rapid micro-deflagration with thick white smoke',
    scientificExplanationAr: 'يعتبر هذا الخليط نموذجاً كلاسيكياً لوقود الصواريخ الدقيقة في المدارس؛ ينتج ZnS المستخدم في شاشات الأشعة السينية والفسفرة.',
    scientificExplanationEn: 'A classic amateur rocket fuel blend yielding ZnS, used historically in radioluminescent dials and phosphor screens.'
  },
  // 7. Potassium + Chlorine -> KCl
  {
    id: 'k-cl',
    reactants: ['K', 'Cl'],
    equation: '2K(s) + Cl₂(g) → 2KCl(s)',
    equationAr: '2K(صلب) + Cl₂(غاز) → 2KCl(صلب)',
    typeEn: 'Violent Redox Synthesis',
    typeAr: 'أكسدة واختزال فائق العنف واللهب البنفسجي',
    energyEn: 'Extremely Exothermic (ΔH = -874 kJ/mol)',
    energyAr: 'طارد فائق للحرارة (أقوى من الصوديوم)',
    productsEn: 'Potassium Chloride (Sylvite)',
    productsAr: 'كلوريد البوتاسيوم النقي',
    colorChangeEn: 'Stunning violet/lilac flame with white salt vapor',
    colorChangeAr: 'لهب بنفسجي (ليلكي) ساحر مع سحب بيضاء من ملح البوتاسيوم',
    temperatureChange: 170,
    visualEffect: 'purple_vapor',
    liquidColor: '#e9d5ff',
    solidProduct: 'KCl (Sylvite Crystals)',
    gasReleased: 'Cl₂ Consumed',
    safetyHazardAr: 'تفاعل شديد الخطورة في المعامل الحقيقية؛ البوتاسيوم أكثر نشاطاً بكثير من الصوديوم',
    safetyHazardEn: 'Extremely reactive - Potassium undergoes violent oxidation',
    scientificExplanationAr: 'نظراً لكبر نصف القطر الذري للبوتاسيوم، يتحرر إلكترون التكافؤ بجهد ضئيل جداً مما يجعل التفاعل فورياً وطارداً للطاقة بلهب ليلكي مميز.',
    scientificExplanationEn: 'Larger atomic radius makes potassium yield its electron with minimal activation energy, producing iconic lilac emissions.'
  },
  // 8. Calcium + Oxygen -> CaO (Quicklime)
  {
    id: 'ca-o',
    reactants: ['Ca', 'O'],
    equation: '2Ca(s) + O₂(g) → 2CaO(s)',
    equationAr: '2Ca(صلب) + O₂(غاز) → 2CaO(الجير الحي)',
    typeEn: 'Combination / Calcination Oxide',
    typeAr: 'اتحاد وتكوين الجير الحي',
    energyEn: 'Exothermic (ΔH = -1270 kJ/mol)',
    energyAr: 'طارد شديد للحرارة بلهب أحمر قرميدي',
    productsEn: 'Calcium Oxide (Quicklime)',
    productsAr: 'أكسيد الكالسيوم (الجير الحي الأبيض)',
    colorChangeEn: 'Brick-red flame turning to intense white-hot incandescence',
    colorChangeAr: 'لهب أحمر قرميدي يتحول لتوهج أبيض شديد يترك كتلاً كلسية بيضاء',
    temperatureChange: 135,
    visualEffect: 'orange_fire',
    liquidColor: '#f1f5f9',
    solidProduct: 'CaO (Quicklime Solid)',
    gasReleased: 'None',
    safetyHazardAr: 'تكوين مادة حارقة (الجير الحي) تتفاعل بشدة لاحقاً مع الماء لإنتاج هيدروكسيد الكالسيوم',
    safetyHazardEn: 'Produces caustic quicklime which reacts violently with moisture',
    scientificExplanationAr: 'يمنح الكالسيوم إلكترونين للأكسجين مشكلاً رابطة أيونية ثنائية الشحنة (Ca²⁺ O²⁻) فائقة الثبات الحراري.',
    scientificExplanationEn: 'Calcium transfers two electrons to oxygen forming a highly stable ionic crystal lattice with vast melting point.'
  },
  // 9. Carbon + Oxygen -> CO2
  {
    id: 'c-o',
    reactants: ['C', 'O'],
    equation: 'C(s) + O₂(g) → CO₂(g)',
    equationAr: 'C(فحم نقي) + O₂(غاز) → CO₂(غاز ثاني أكسيد الكربون)',
    typeEn: 'Complete Combustion',
    typeAr: 'احتراق كامل وتأكسد كربوني',
    energyEn: 'Exothermic (ΔH = -393.5 kJ/mol)',
    energyAr: 'طارد للحرارة (أساس الطاقة الصناعية)',
    productsEn: 'Carbon Dioxide Gas',
    productsAr: 'غاز ثاني أكسيد الكربون عديم اللون',
    colorChangeEn: 'Charcoal glows bright orange-red without heavy smoke in pure O2',
    colorChangeAr: 'يتوهج الفحم بلون برتقالي أحمر ساطع في الأكسجين النقي وينتج غازاً يعكر ماء الجير',
    temperatureChange: 85,
    visualEffect: 'orange_fire',
    liquidColor: '#334155',
    solidProduct: 'Ash Traces',
    gasReleased: 'CO₂ (Carbon Dioxide)',
    safetyHazardAr: 'تصاعد غازات خانقة مدفئة للجو ويستهلك الأكسجين سريعاً',
    safetyHazardEn: 'Asphyxiant gas generation in closed containers',
    scientificExplanationAr: 'تتكون رابطتان ثنائيتان تساهميتان O=C=O متوازيتان خطياً مع طاقة ترابط عالية جداً تطلق حرارة الاحتراق.',
    scientificExplanationEn: 'Formation of two double covalent bonds in a linear O=C=O geometry releases constant thermal flux.'
  },
  // 10. Hydrogen + Chlorine -> HCl
  {
    id: 'h-cl',
    reactants: ['H', 'Cl'],
    equation: 'H₂(g) + Cl₂(g) + Light → 2HCl(g)',
    equationAr: 'H₂(غاز) + Cl₂(غاز) + ضوء → 2HCl(حمض الهيدروكلوريك غاز)',
    typeEn: 'Photochemical Free-Radical Chain Reaction',
    typeAr: 'تفاعل متسلسل ضوئي كيميائي فوري',
    energyEn: 'Exothermic (ΔH = -184 kJ/mol)',
    energyAr: 'طارد للحرارة مع انفجار ضوئي عند التعرض للضوء',
    productsEn: 'Hydrogen Chloride Gas (Forms Muriatic Acid in water)',
    productsAr: 'غاز كلوريد الهيدروجين (حمض الهيدروكلوريك)',
    colorChangeEn: 'Greenish-yellow gas turns clear with sharp acid mist',
    colorChangeAr: 'يختفي لون غاز الكلور الأخضر المصفر فجأة وتتصاعد أبخرة حمضية بيضاء نفاذة',
    temperatureChange: 75,
    visualEffect: 'smoke_effervescence',
    liquidColor: '#e2e8f0',
    solidProduct: 'None',
    gasReleased: 'HCl (Choking Acid Gas)',
    safetyHazardAr: 'أبخرة خانقة كاوية للجهاز التنفسي تتكثف مع رطوبة الجو كقطرات حمض مركز',
    safetyHazardEn: 'Corrosive and suffocating acid vapors',
    scientificExplanationAr: 'تتفكك جزيئات الكلور بفعل الفوتونات إلى جذور حرة نشطة (Cl•) تهاجم الهيدروجين في سلسلة تفاعلات انشطارية سريعة جداً.',
    scientificExplanationEn: 'Photons initiate radical homolytic cleavage of Cl-Cl, initiating an explosive chain propagating HCl synthesis.'
  },
  // 11. Sodium + Bromine -> NaBr
  {
    id: 'na-br',
    reactants: ['Na', 'Br'],
    equation: '2Na(s) + Br₂(l) → 2NaBr(s)',
    equationAr: '2Na(صلب) + Br₂(سائل بني) → 2NaBr(ملح بروميد صوديوم)',
    typeEn: 'Synthesis / Halide Formation',
    typeAr: 'اتحاد وتكوين هاليد الصوديوم',
    energyEn: 'Exothermic (ΔH = -722 kJ/mol)',
    energyAr: 'طارد شديد للحرارة مع وميض أصفر وأبخرة برتقالية',
    productsEn: 'Sodium Bromide Solid',
    productsAr: 'بروميد الصوديوم الأبيض',
    colorChangeEn: 'Reddish-brown liquid bursts into flame, yielding white powder',
    colorChangeAr: 'يشتعل البروم السائل البني المحمر بلهب أصفر متطاير تاركاً مسحوقاً أبيض',
    temperatureChange: 125,
    visualEffect: 'bright_flash',
    liquidColor: '#fdba74',
    solidProduct: 'NaBr (White Solid)',
    gasReleased: 'Br₂ Vapors',
    safetyHazardAr: 'تطاير أبخرة البروم البنية الكاوية مع لهب الصوديوم',
    safetyHazardEn: 'Noxious brown bromine vapors combined with metal combustion',
    scientificExplanationAr: 'تنتقل الإلكترونات من الصوديوم إلى ذرات البروم السائل الساخن، مكونة شبكة أيونية ملحية متماسكة.',
    scientificExplanationEn: 'Exothermic electron transfer generates ionic NaBr crystals with sudden thermal eruption.'
  },
  // 12. Aluminum + Bromine -> Al2Br6 (Extreme reaction)
  {
    id: 'al-br',
    reactants: ['Al', 'Br'],
    equation: '2Al(s) + 3Br₂(l) → 2AlBr₃(s)',
    equationAr: '2Al(رقائق ألومنيوم) + 3Br₂(سائل بروم) → 2AlBr₃(بروميد الألومنيوم)',
    typeEn: 'Delayed Violent Exothermic Synthesis',
    typeAr: 'تفاعل متأخر ثم انفجار ناري عارم',
    energyEn: 'Extremely Exothermic (ΔH = -1054 kJ/mol)',
    energyAr: 'طارد عاصف للحرارة بلهب برتقالي وسحب دخان بروم كثيفة',
    productsEn: 'Aluminum Bromide (Catalyst)',
    productsAr: 'بروميد الألومنيوم المستخدم كعامل حفاز في كيمياء البترول',
    colorChangeEn: 'Delay of seconds, then explosive eruption of white-orange fire and purple-red fumes',
    colorChangeAr: 'هدوء لثوانٍ ثم ثوران بركاني مفاجئ لنار بيضاء وبرتقالية وسحب حمراء داكنة',
    temperatureChange: 210,
    visualEffect: 'orange_fire',
    liquidColor: '#c2410c',
    solidProduct: 'AlBr₃ Residue',
    gasReleased: 'Boiling Br₂ & AlBr₃ fumes',
    safetyHazardAr: 'أحد أشهر العروض المخبرية إثارة وخطورة؛ يتطلب غطاء سحب أدخنة معزول في المعامل',
    safetyHazardEn: 'Extreme violent deflagration following oxide-layer induction latency',
    scientificExplanationAr: 'يتأخر التفاعل ريثما تذيب أبخرة البروم طبقة أكسيد الألومنيوم السطحية (Al₂O₃)، وبمجرد وصول البروم لمعدن الألومنيوم النقي يندلع التفاعل بعنف مدمر.',
    scientificExplanationEn: 'The induction period represents dissolution of the passivating oxide layer, after which pure aluminum erupts into spontaneous combustion.'
  },
  // 13. Silver + Chlorine -> AgCl (Precipitation)
  {
    id: 'ag-cl',
    reactants: ['Ag', 'Cl'],
    equation: '2Ag(s) + Cl₂(g) → 2AgCl(s)',
    equationAr: '2Ag(فضة نقية) + Cl₂(غاز) → 2AgCl(راسب كلوريد الفضة الأبيض)',
    typeEn: 'Direct Halogenation / Photosensitive Salt',
    typeAr: 'تكوين ملح الفضة الحساس للضوء',
    energyEn: 'Exothermic (ΔH = -254 kJ/mol)',
    energyAr: 'طارد للحرارة مع ترسب أبيض',
    productsEn: 'Silver Chloride (Curdy White Solid)',
    productsAr: 'كلوريد الفضة (راسب أبيض حليبي يتأثر بالضوء)',
    colorChangeEn: 'Shiny silver tarnishes instantly into a milky white layer that purples under light',
    colorChangeAr: 'يتحول بريق الفضة اللامع لطبقة بيضاء حليبية تتحول للرمادي البنفسجي عند تعرضها لضوء الشمس',
    temperatureChange: 40,
    visualEffect: 'precipitate_white',
    liquidColor: '#f8fafc',
    solidProduct: 'AgCl (Curdy Precipitate)',
    gasReleased: 'None',
    safetyHazardAr: 'تكون مركب حساس للضوء (أساس أفلام التصوير الضوئي الكلاسيكية بالأبيض والأسود)',
    safetyHazardEn: 'Formation of photosensitive salt that photoreduces in ambient light',
    scientificExplanationAr: 'يتكون راسب كلوريد الفضة قليل الذوبان جداً في الماء؛ وتتفكك بلوراته لاحقاً عند سقوط الفوتونات لترسب الفضة المعدنية الدقيقة.',
    scientificExplanationEn: 'Insoluble AgCl crystals form, featuring photolytic sensitivity foundational to historical photographic chemistry.'
  },
  // 14. Silver + Iodine -> AgI
  {
    id: 'ag-i',
    reactants: ['Ag', 'I'],
    equation: '2Ag(s) + I₂(s) → 2AgI(s)',
    equationAr: '2Ag(فضة) + I₂(يود بنفسجي) → 2AgI(يوديد الفضة الأصفر)',
    typeEn: 'Synthesis / Cloud Seeding Agent',
    typeAr: 'تكوين مادة استمطار السحب الاصطناعي',
    energyEn: 'Exothermic (ΔH = -124 kJ/mol)',
    energyAr: 'طارد معتدل للحرارة مع ترسب أصفر',
    productsEn: 'Silver Iodide (Bright Yellow Precipitate)',
    productsAr: 'يوديد الفضة (المركب الشهير لتلقيح واستمطار السحب)',
    colorChangeEn: 'Purple iodine crystals interact to deposit bright canary yellow compound',
    colorChangeAr: 'تتحول بلورات اليود البنفسجية إلى مسحوق أصفر كناري مميز وثقيل',
    temperatureChange: 35,
    visualEffect: 'precipitate_yellow',
    liquidColor: '#fef08a',
    solidProduct: 'AgI (Yellow Micro-crystals)',
    gasReleased: 'Sublimed I₂ (Violet haze)',
    safetyHazardAr: 'مادة ذات هيكل بلوري مطابق لبلورات الجليد الطبيعي، تستخدم لإسقاط المطر في السحب المحملة بالبخار',
    safetyHazardEn: 'Hexagonal lattice isomorphic to natural ice crystals, used in meteorological cloud seeding',
    scientificExplanationAr: 'يمتلك يوديد الفضة شبكة سداسية تشبه بلورات الثلج، مما يجعل جزيئات بخار الماء تتجمع وتتكاثف حوله فورياً.',
    scientificExplanationEn: 'The crystallographic symmetry matches that of natural hexagonal ice, facilitating condensation nuclei.'
  },
  // 15. Phosphorus + Oxygen -> P4O10
  {
    id: 'p-o',
    reactants: ['P', 'O'],
    equation: '4P(s) + 5O₂(g) → P₄O₁₀(s)',
    equationAr: '4P(فوسفور) + 5O₂(أكسجين) → P₄O₁₀(خامس أكسيد الفوسفور)',
    typeEn: 'Vigorous Oxidation / Dense Smoke Screen',
    typeAr: 'احتراق فوسفوري وتوليد ستائر الدخان الكثيفة',
    energyEn: 'Exothermic (ΔH = -3000 kJ/mol)',
    energyAr: 'طارد هائل للحرارة ومولد لسحب بيضاء عملاقة',
    productsEn: 'Phosphorus Pentoxide (Ultra Desiccant)',
    productsAr: 'خامس أكسيد الفوسفور (المجفف الفائق للرطوبة)',
    colorChangeEn: 'Yellow-orange flare producing towering clouds of impenetrable white fog',
    colorChangeAr: 'شعلة صفراء برتقالية مع انفجار سحب بيضاء ضخمة تحجب الرؤية تماماً (ستار دخاني)',
    temperatureChange: 155,
    visualEffect: 'smoke_effervescence',
    liquidColor: '#ffffff',
    solidProduct: 'P₄O₁₀ (Snow-white Powder)',
    gasReleased: 'Ultra-dense Acid Mist',
    safetyHazardAr: 'شديد التفاعل مع الرطوبة الجوية مكوناً حمض الفوسفوريك؛ يستخدم عسكرياً ومدنياً كستار دخاني',
    safetyHazardEn: 'Forms aggressive phosphoric acid aerosol upon air contact',
    scientificExplanationAr: 'يمتلك الفوسفور ألفة شديدة للارتباط بالأكسجين، حيث يرتبط كل جزيء P4 بعشر ذرات أكسجين مفرزاً طاقة هائلة تمتص رطوبة الوسط.',
    scientificExplanationEn: 'Phosphorus exhibits tremendous oxyphilicity, constructing cage-like P4O10 structures with immense affinity for water.'
  },
  // 16. Iron + Oxygen -> Fe2O3 (Rusting / Thermite Component)
  {
    id: 'fe-o',
    reactants: ['Fe', 'O'],
    equation: '4Fe(s) + 3O₂(g) → 2Fe₂O₃(s)',
    equationAr: '4Fe(حديد صلب) + 3O₂(غاز) → 2Fe₂O₃(صدأ الحديد / الهيماتيت)',
    typeEn: 'Oxidation / Incandescent Sparkler',
    typeAr: 'أكسدة حديدية وشرر ألعاب نارية',
    energyEn: 'Exothermic (ΔH = -1648 kJ/mol)',
    energyAr: 'طارد للحرارة مع تطاير شرر برتقالي مبهج',
    productsEn: 'Iron(III) Oxide (Hematite / Rust)',
    productsAr: 'أكسيد الحديد الثلاثي (مسحوق صدأ بني محمر)',
    colorChangeEn: 'Steel wool burns in pure O2 with shower of orange-golden sparks',
    colorChangeAr: 'يحترق سلك تنظيف الأواني الحديدي في الأكسجين النقي كشلال من الشرر الذهبي المتطاير',
    temperatureChange: 120,
    visualEffect: 'orange_fire',
    liquidColor: '#78350f',
    solidProduct: 'Fe₂O₃ (Red-Brown Oxide)',
    gasReleased: 'None',
    safetyHazardAr: 'تطاير حبيبات منصهرة من أكسيد الحديد بدرجة حرارة تتجاوز 1000 درجة مئوية',
    safetyHazardEn: 'Shower of hot incandescent metal droplets',
    scientificExplanationAr: 'عند توفر مساحة سطحية عالية (سلك الحديد)، تصبح سرعة الأكسدة أسرع بكثير من معدل فقد الحرارة فيشتعل الحديد كالألعاب النارية.',
    scientificExplanationEn: 'High surface-area-to-volume ratio allows rapid oxidation to outpace thermal dissipation, sustaining fiery sparks.'
  },
  // 17. Sodium + Hydrogen -> NaH
  {
    id: 'na-h',
    reactants: ['Na', 'H'],
    equation: '2Na(s) + H₂(g) + Heat → 2NaH(s)',
    equationAr: '2Na(صوديوم) + H₂(هيدروجين) → 2NaH(هيدريد الصوديوم)',
    typeEn: 'Synthesis / Salt-like Hydride',
    typeAr: 'تكوين هيدريد فلزي ملحي',
    energyEn: 'Exothermic (ΔH = -113 kJ/mol)',
    energyAr: 'طارد معتدل يولد قاعدة قوية جداً',
    productsEn: 'Sodium Hydride (Strong Base & Reducing Agent)',
    productsAr: 'هيدريد الصوديوم (قاعدة عضوية خارقة وعامل اختزال)',
    colorChangeEn: 'Silver metal absorbs gas, crystallizing into silvery-grey ionic powder',
    colorChangeAr: 'يمتص الصوديوم المنصهر غاز الهيدروجين ويتصلب كمسحوق رمادي فضي ناعم',
    temperatureChange: 50,
    visualEffect: 'fizz_bubbles',
    liquidColor: '#94a3b8',
    solidProduct: 'NaH Powder',
    gasReleased: 'H₂ Absorbed',
    safetyHazardAr: 'يتفاعل هيدريد الصوديوم بعنف مع أدنى رطوبة مفرزاً غاز الهيدروجين القابل للاشتعال',
    safetyHazardEn: 'Pyrophoric when exposed to humid air; liberates flammable H2',
    scientificExplanationAr: 'حالة نادرة يحمل فيها الهيدروجين شحنة سالبة (أيون الهيدريد H⁻) نظراً لأن الصوديوم أقل سالبية كهربية منه بكثير.',
    scientificExplanationEn: 'Rare scenario where hydrogen acts as an anion (hydride H-) bonded to electropositive Na+.'
  },
  // 18. Calcium + Chlorine -> CaCl2
  {
    id: 'ca-cl',
    reactants: ['Ca', 'Cl'],
    equation: 'Ca(s) + Cl₂(g) → CaCl₂(s)',
    equationAr: 'Ca(صلب) + Cl₂(غاز) → CaCl₂(كلوريد الكالسيوم الممتص للرطوبة)',
    typeEn: 'Exothermic Synthesis',
    typeAr: 'اتحاد مباشر وهاليد أرضي قلوي',
    energyEn: 'Exothermic (ΔH = -795 kJ/mol)',
    energyAr: 'طارد قوي للحرارة بوميض برتقالي أحمر',
    productsEn: 'Calcium Chloride (Desiccant / Road De-icer)',
    productsAr: 'كلوريد الكالسيوم (الملح المانع لتجمد الطرق وممتص الرطوبة)',
    colorChangeEn: 'Calcium turns rapidly white, giving off heat and brick-red sparks',
    colorChangeAr: 'يتحول الكالسيوم إلى ملح أبيض محبب مع تطاير شرر أحمر قرميدي',
    temperatureChange: 115,
    visualEffect: 'bright_flash',
    liquidColor: '#ffffff',
    solidProduct: 'CaCl₂ Pellets',
    gasReleased: 'Cl₂ Consumed',
    safetyHazardAr: 'حرارة تفاعل عالية؛ الملح الناتج يذيب الجليد على الطرق السريعة بتوليد حرارة ذاتية',
    safetyHazardEn: 'Intense exothermic formation of highly hygroscopic salt',
    scientificExplanationAr: 'تكوين رابطة أيونية قوية بتبادل إلكترونين، حيث يحيط أيون الكالسيوم بأيونين من الكلوريد في شبكة بلورية روتيلية.',
    scientificExplanationEn: 'Ca2+ stabilizes two Cl- counterions yielding an exothermically dissolving crystalline solid.'
  },
  // 19. Zinc + Chlorine -> ZnCl2
  {
    id: 'zn-cl',
    reactants: ['Zn', 'Cl'],
    equation: 'Zn(s) + Cl₂(g) → ZnCl₂(s)',
    equationAr: 'Zn(مسحوق زنك) + Cl₂(غاز كلور) → ZnCl₂(كلوريد الزنك)',
    typeEn: 'Direct Halogenation',
    typeAr: 'كلورة مباشرة للمعدن الانتقالي',
    energyEn: 'Exothermic (ΔH = -415 kJ/mol)',
    energyAr: 'طارد للحرارة مع لهب أبيض مزرق',
    productsEn: 'Zinc Chloride (Lewis Acid / Flux)',
    productsAr: 'كلوريد الزنك (حمض لويس ومساعد لحام المعادن)',
    colorChangeEn: 'Zinc burns with faint bluish flame, producing molten salt that solidifies white',
    colorChangeAr: 'يحترق مسحوق الخارصين بلهب أزرق خافت منتجاً ملحاً مائعاً يتصلب كقشور بيضاء',
    temperatureChange: 90,
    visualEffect: 'blue_flame',
    liquidColor: '#f8fafc',
    solidProduct: 'ZnCl₂ Solid',
    gasReleased: 'None',
    safetyHazardAr: 'مادة أكالة كاوية للجلد عند ملامسة رطوبة الهواء',
    safetyHazardEn: 'Hygroscopic and caustic Lewis acid product',
    scientificExplanationAr: 'يستقر الزنك في حالة التأكسد +2 بتفريغ مدار 4s وبقاء مدار 3d مكتملاً بـ 10 إلكترونات مستقرة.',
    scientificExplanationEn: 'Zinc attains pseudo-noble gas electron configuration ([Ar] 3d10) upon divalent bonding.'
  },
  // 20. Lithium + Nitrogen -> Li3N (Unique reaction at room temperature)
  {
    id: 'li-n',
    reactants: ['Li', 'N'],
    equation: '6Li(s) + N₂(g) → 2Li₃N(s)',
    equationAr: '6Li(ليثيوم) + N₂(نيتروجين) → 2Li₃N(نيتريد الليثيوم)',
    typeEn: 'Nitride Synthesis (Unique Room Temp)',
    typeAr: 'تكوين نيتريد الفلز القلوي الفريد',
    energyEn: 'Exothermic (ΔH = -198 kJ/mol)',
    energyAr: 'طارد مستمر (الفلز الوحيد الذي يكسر رابطة N≡N ثلاثية)',
    productsEn: 'Lithium Nitride (Ruby Red Solid Electrolyte)',
    productsAr: 'نيتريد الليثيوم (مادة حمراء ياقوتية فائقة التوصيل الأيوني للبطاريات)',
    colorChangeEn: 'Shiny lithium tarnishes to reddish-brown/black ruby crystal',
    colorChangeAr: 'يتعكر الليثيوم الفضي ويتحول لبلورات حمراء ياقوتية داكنة تنمو على السطح',
    temperatureChange: 45,
    visualEffect: 'none',
    liquidColor: '#881337',
    solidProduct: 'Li₃N (Ruby-Red / Black)',
    gasReleased: 'N₂ Consumed',
    safetyHazardAr: 'الليثيوم هو العنصر الوحيد القادر على التفاعل مع النيتروجين الخامل في الهواء العادي',
    safetyHazardEn: 'Lithium is uniquely able to fix atmospheric nitrogen without catalysts',
    scientificExplanationAr: 'نظراً لصغر حجم أيون الليثيوم Li⁺ وكثافة شحنته العالية، توفر طاقة الشبكة البلورية لـ Li3N الطاقة الكافية لكسر الرابطة التساهمية الثلاثية الفولاذية في جزيء N2.',
    scientificExplanationEn: 'High lattice energy of the compact Li+ ion uniquely overcomes the tremendous 945 kJ/mol bond enthalpy of the N≡N triple bond.'
  }
];

// Helper to look up reaction between two elements
export function findReaction(el1Symbol: string, el2Symbol: string): ChemicalReaction | null {
  const s1 = el1Symbol.trim();
  const s2 = el2Symbol.trim();
  return CHEMICAL_REACTIONS_DB.find(r => 
    (r.reactants[0] === s1 && r.reactants[1] === s2) ||
    (r.reactants[0] === s2 && r.reactants[1] === s1)
  ) || null;
}
