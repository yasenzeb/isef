export type ReactionCategory = 
  | 'synthesis' 
  | 'single_replacement' 
  | 'double_replacement' 
  | 'thermal_decomposition' 
  | 'redox';

export interface ChemicalReaction {
  id: string;
  category: ReactionCategory;
  categoryAr: string;
  categoryEn: string;
  reactants: string[]; // Reagent IDs
  requiresHeat?: boolean; // Requires Bunsen burner ON
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
  temperatureChange: number; // Celsius change
  visualEffect: 
    | 'bright_flash' 
    | 'orange_fire' 
    | 'blue_flame' 
    | 'purple_flame'
    | 'smoke_effervescence' 
    | 'purple_vapor' 
    | 'precipitate_yellow' 
    | 'precipitate_white' 
    | 'precipitate_blue'
    | 'precipitate_brown'
    | 'effervescence_bubbles' 
    | 'glow_green' 
    | 'none';
  liquidColor: string; // Final hex liquid color
  precipitateColor?: string; // Hex color of precipitate
  solidProduct?: string;
  gasReleased?: string;
  safetyHazardAr: string;
  safetyHazardEn: string;
  scientificExplanationAr: string;
  scientificExplanationEn: string;
}

export interface WorkbenchReagent {
  id: string;
  symbol: string;
  nameEn: string;
  nameAr: string;
  formula: string;
  category: 'metal' | 'nonmetal' | 'acid' | 'base' | 'salt' | 'compound' | 'water';
  categoryAr: string;
  stateAtRoomTemp: 'solid' | 'liquid' | 'gas' | 'aqueous';
  colorHex: string;
  descriptionAr: string;
  descriptionEn: string;
}

// -------------------------------------------------------------
// Comprehensive Workbench Reagents (Elements, Acids, Bases, Salts)
// -------------------------------------------------------------
export const WORKBENCH_REAGENTS: WorkbenchReagent[] = [
  // --- Active Metals (فلزات نشطة) ---
  { id: 'Na', symbol: 'Na', nameEn: 'Sodium', nameAr: 'صوديوم', formula: 'Na(s)', category: 'metal', categoryAr: 'فلز قلوي نشط', stateAtRoomTemp: 'solid', colorHex: '#facc15', descriptionAr: 'فلز قلوي لين فضي شديد النشاط يحفظ تحت الكيروسين', descriptionEn: 'Soft, highly reactive alkali metal' },
  { id: 'K', symbol: 'K', nameEn: 'Potassium', nameAr: 'بوتاسيوم', formula: 'K(s)', category: 'metal', categoryAr: 'فلز قلوي فائق النشاط', stateAtRoomTemp: 'solid', colorHex: '#c084fc', descriptionAr: 'فلز شديد الفعالية يشتعل في الماء بلهب ليلكي', descriptionEn: 'Extremely reactive alkali metal burning with lilac flame' },
  { id: 'Mg', symbol: 'Mg', nameEn: 'Magnesium', nameAr: 'ماغنسيوم', formula: 'Mg(s)', category: 'metal', categoryAr: 'فلز أرضي قلوي', stateAtRoomTemp: 'solid', colorHex: '#e2e8f0', descriptionAr: 'شريط فلزي يشتعل في الأكسجين بضوء أبيض مبهر', descriptionEn: 'Silvery metal ribbon burning with brilliant white flame' },
  { id: 'Al', symbol: 'Al', nameEn: 'Aluminum', nameAr: 'ألومنيوم', formula: 'Al(s)', category: 'metal', categoryAr: 'فلز خفيف', stateAtRoomTemp: 'solid', colorHex: '#94a3b8', descriptionAr: 'فلز خفيف مقاوم للتآكل بفضل طبقة أكسيده السطحية', descriptionEn: 'Lightweight metal with passivating oxide coating' },
  { id: 'Zn', symbol: 'Zn', nameEn: 'Zinc', nameAr: 'خارصين (زنك)', formula: 'Zn(s)', category: 'metal', categoryAr: 'فلز انتقالي نشط', stateAtRoomTemp: 'solid', colorHex: '#64748b', descriptionAr: 'حبيبات أو مسحوق رمادي يحل محل هيدروجين الأحماض بقوة', descriptionEn: 'Bluish-grey metal widely used for hydrogen generation' },
  { id: 'Fe', symbol: 'Fe', nameEn: 'Iron', nameAr: 'حديد', formula: 'Fe(s)', category: 'metal', categoryAr: 'فلز انتقالي مغناطيسي', stateAtRoomTemp: 'solid', colorHex: '#b45309', descriptionAr: 'برادة حديد رمادية ممغنطة تتأكسد في الهواء الرطب', descriptionEn: 'Ferromagnetic filings reacting with sulfur and acids' },
  { id: 'Cu', symbol: 'Cu', nameEn: 'Copper', nameAr: 'نحاس', formula: 'Cu(s)', category: 'metal', categoryAr: 'فلز موصل أحمر', stateAtRoomTemp: 'solid', colorHex: '#ea580c', descriptionAr: 'معدن أحمر لامع ممتاز التوصيل يترسب في تفاعلات الإحلال', descriptionEn: 'Reddish metal precipitated in displacement reactions' },
  { id: 'Ag', symbol: 'Ag', nameEn: 'Silver', nameAr: 'فضة', formula: 'Ag(s)', category: 'metal', categoryAr: 'فلز نبيل لامع', stateAtRoomTemp: 'solid', colorHex: '#f1f5f9', descriptionAr: 'فلز فضي نفيس قليل النشاط يترسب كبلورات إبرية لامعة', descriptionEn: 'Precious shiny metal forming dazzling crystals' },

  // --- Non-Metals & Gases (لافلزات وغازات) ---
  { id: 'H2', symbol: 'H₂', nameEn: 'Hydrogen Gas', nameAr: 'غاز الهيدروجين', formula: 'H₂(g)', category: 'nonmetal', categoryAr: 'غاز قابل للاشتعال', stateAtRoomTemp: 'gas', colorHex: '#e0f2fe', descriptionAr: 'أخف الغازات يشتعل بفرقعة ولهب أزرق نظيف', descriptionEn: 'Lightest gas burning cleanly with explosive pop' },
  { id: 'O2', symbol: 'O₂', nameEn: 'Oxygen Gas', nameAr: 'غاز الأكسجين', formula: 'O₂(g)', category: 'nonmetal', categoryAr: 'غاز مؤكسد وداعم للاشتعال', stateAtRoomTemp: 'gas', colorHex: '#38bdf8', descriptionAr: 'غاز ضروري للاحتراق والتنفس يعيد إشعال الشظية المتوهجة', descriptionEn: 'Essential oxidizing gas relighting glowing splints' },
  { id: 'Cl2', symbol: 'Cl₂', nameEn: 'Chlorine Gas', nameAr: 'غاز الكلور', formula: 'Cl₂(g)', category: 'nonmetal', categoryAr: 'هالوجين مؤكسد قوي', stateAtRoomTemp: 'gas', colorHex: '#86efac', descriptionAr: 'غاز أخضر مصفر خانق ذو رائحة نفاذة ومؤكسد عنيف', descriptionEn: 'Yellow-green toxic gas with sharp suffocating odor' },
  { id: 'S', symbol: 'S', nameEn: 'Sulfur Powder', nameAr: 'مسحوق الكبريت', formula: 'S(s)', category: 'nonmetal', categoryAr: 'لافلز كبريتي أصفر', stateAtRoomTemp: 'solid', colorHex: '#fde047', descriptionAr: 'مسحوق أصفر يتحد مع الفلزات بالتسخين لإنتاج الكبريتيدات', descriptionEn: 'Bright yellow solid forming sulfides under heat' },
  { id: 'C', symbol: 'C', nameEn: 'Carbon (Charcoal)', nameAr: 'كربون (فحم نقي)', formula: 'C(s)', category: 'nonmetal', categoryAr: 'لافلز كربوني صلب', stateAtRoomTemp: 'solid', colorHex: '#334155', descriptionAr: 'فحم أسود نقي يحترق في الأكسجين منتجاً ثاني أكسيد الكربون', descriptionEn: 'Pure black carbon combusting into carbon dioxide' },

  // --- Liquids & Water (سوائل ومذيبات) ---
  { id: 'H2O', symbol: 'H₂O', nameEn: 'Distilled Water', nameAr: 'ماء مقطر', formula: 'H₂O(l)', category: 'water', categoryAr: 'مذيب مائي نقي', stateAtRoomTemp: 'liquid', colorHex: '#67e8f9', descriptionAr: 'الوسط المائي الأساسي للمحاليل والتفاعلات', descriptionEn: 'Universal solvent medium for chemical reactions' },

  // --- Acids (أحماض قوية ومخففة) ---
  { id: 'HCl', symbol: 'HCl', nameEn: 'Hydrochloric Acid', nameAr: 'حمض الهيدروكلوريك', formula: 'HCl(aq)', category: 'acid', categoryAr: 'حمض قوي نفاذ', stateAtRoomTemp: 'aqueous', colorHex: '#fdba74', descriptionAr: 'حمض معدني قوي عديم اللون يذيب الفلزات ويحرر الهيدروجين', descriptionEn: 'Strong mineral acid reacting vigorously with metals' },
  { id: 'H2SO4', symbol: 'H₂SO₄', nameEn: 'Sulfuric Acid', nameAr: 'حمض الكبريتيك', formula: 'H₂SO₄(aq)', category: 'acid', categoryAr: 'حمض كبريتي مركز', stateAtRoomTemp: 'aqueous', colorHex: '#fb923c', descriptionAr: 'حمض كبريتي ثنائي البروتون حارق ومجفف شديد', descriptionEn: 'Dense, highly exothermic diprotic mineral acid' },

  // --- Bases & Alkalis (قلويات وقواعد) ---
  { id: 'NaOH', symbol: 'NaOH', nameEn: 'Sodium Hydroxide', nameAr: 'هيدروكسيد الصوديوم (صودا كاوية)', formula: 'NaOH(aq)', category: 'base', categoryAr: 'قلوي قوي كاوي', stateAtRoomTemp: 'aqueous', colorHex: '#a855f7', descriptionAr: 'محلول قلوي قوي صابوني الملمس يرسّب هيدروكسيدات الفلزات', descriptionEn: 'Strong caustic alkali precipitating metal hydroxides' },

  // --- Salts & Solutions (أملاح ومحاليل كيميائية) ---
  { id: 'CuSO4', symbol: 'CuSO₄', nameEn: 'Copper(II) Sulfate', nameAr: 'محلول كبريتات النحاس الزرقاء', formula: 'CuSO₄(aq)', category: 'salt', categoryAr: 'محلول ملحي أزرق ساطع', stateAtRoomTemp: 'aqueous', colorHex: '#0284c7', descriptionAr: 'محلول أزرق سماوي ساطع يستخدم في تجارب الإحلال والترسيب', descriptionEn: 'Striking royal blue solution of copper ions' },
  { id: 'AgNO3', symbol: 'AgNO₃', nameEn: 'Silver Nitrate', nameAr: 'محلول نترات الفضة', formula: 'AgNO₃(aq)', category: 'salt', categoryAr: 'كاشف هاليدات نتراتي', stateAtRoomTemp: 'aqueous', colorHex: '#e0e7ff', descriptionAr: 'كاشف شهير للكلوريدات يكوّن راسباً أبيض مميزاً', descriptionEn: 'Colorless reagent precipitating insoluble halides' },
  { id: 'KI', symbol: 'KI', nameEn: 'Potassium Iodide', nameAr: 'محلول يوديد البوتاسيوم', formula: 'KI(aq)', category: 'salt', categoryAr: 'محلول هاليد البوتاسيوم', stateAtRoomTemp: 'aqueous', colorHex: '#fef08a', descriptionAr: 'محلول نقي يتفاعل مع أملاح الرصاص لترسيب يوديد الرصاص الأصفر', descriptionEn: 'Clear solution producing vivid yellow lead iodide' },
  { id: 'Pb_NO3_2', symbol: 'Pb(NO₃)₂', nameEn: 'Lead(II) Nitrate', nameAr: 'محلول نترات الرصاص', formula: 'Pb(NO₃)₂(aq)', category: 'salt', categoryAr: 'محلول أملاح الرصاص', stateAtRoomTemp: 'aqueous', colorHex: '#f8fafc', descriptionAr: 'محلول عديم اللون يستخدم لتجربة "المطر الذهبي" المدهشة', descriptionEn: 'Clear solution used in iconic Golden Rain demonstration' },
  { id: 'BaCl2', symbol: 'BaCl₂', nameEn: 'Barium Chloride', nameAr: 'محلول كلوريد الباريوم', formula: 'BaCl₂(aq)', category: 'salt', categoryAr: 'كاشف الكبريتات', stateAtRoomTemp: 'aqueous', colorHex: '#f1f5f9', descriptionAr: 'كاشف نوعي لأيون الكبريتات يرسّب كبريتات الباريوم البيضاء', descriptionEn: 'Specific analytical reagent detecting sulfate ions' },
  { id: 'Na2SO4', symbol: 'Na₂SO₄', nameEn: 'Sodium Sulfate', nameAr: 'محلول كبريتات الصوديوم', formula: 'Na₂SO₄(aq)', category: 'salt', categoryAr: 'ملح كبريتات قابل للذوبان', stateAtRoomTemp: 'aqueous', colorHex: '#ecfeff', descriptionAr: 'محلول ملحي متعادل يستخدم في تفاعلات الترسيب المزدوج', descriptionEn: 'Soluble neutral sulfate salt for precipitation reactions' },
  { id: 'Na2CO3', symbol: 'Na₂CO₃', nameEn: 'Sodium Carbonate', nameAr: 'كربونات الصوديوم (صودا الغسيل)', formula: 'Na₂CO₃(s)', category: 'salt', categoryAr: 'ملح كربونات قاعدي', stateAtRoomTemp: 'solid', colorHex: '#f8fafc', descriptionAr: 'مسحوق أبيض يفور بشدة مع الأحماض مطلقاً غاز CO₂', descriptionEn: 'White powder effervescing violently with acids' },
  { id: 'FeCl3', symbol: 'FeCl₃', nameEn: 'Iron(III) Chloride', nameAr: 'كلوريد الحديد الثلاثي', formula: 'FeCl₃(aq)', category: 'salt', categoryAr: 'محلول ملح حديدي أصفر بني', stateAtRoomTemp: 'aqueous', colorHex: '#ca8a04', descriptionAr: 'محلول أصفر بني ينتج راسباً بنياً محمرّاً مع القلويات', descriptionEn: 'Yellow-brown solution yielding red-brown precipitate' },

  // --- Oxides & Thermal Decomposition Precursors (أكاسيد ومركبات انحلال) ---
  { id: 'CaO', symbol: 'CaO', nameEn: 'Calcium Oxide (Quicklime)', nameAr: 'أكسيد الكالسيوم (الجير الحي)', formula: 'CaO(s)', category: 'compound', categoryAr: 'أكسيد قاعدي صلب', stateAtRoomTemp: 'solid', colorHex: '#f1f5f9', descriptionAr: 'جير حي يطلق حرارة غليان هائلة عند إضافة الماء (إطفاء الجير)', descriptionEn: 'Quicklime reacting exothermically with water' },
  { id: 'HgO', symbol: 'HgO', nameEn: 'Red Mercury(II) Oxide', nameAr: 'أكسيد الزئبق الأحمر', formula: 'HgO(s)', category: 'compound', categoryAr: 'أكسيد فلزي حراري', stateAtRoomTemp: 'solid', colorHex: '#dc2626', descriptionAr: 'مسحوق أحمر ينحل بالحرارة إلى زئبق فضي وأكسجين', descriptionEn: 'Red powder decomposing thermally to liquid mercury' },
  { id: 'CuCO3', symbol: 'CuCO₃', nameEn: 'Basic Copper Carbonate', nameAr: 'كربونات النحاس الخضراء', formula: 'CuCO₃(s)', category: 'compound', categoryAr: 'كربونات فلزية ملونة', stateAtRoomTemp: 'solid', colorHex: '#10b981', descriptionAr: 'مسحوق أخضر يتحول بالتسخين إلى أكسيد النحاس الأسود', descriptionEn: 'Green solid turning black on heating with CO2 release' },
  { id: 'Cu_OH_2', symbol: 'Cu(OH)₂', nameEn: 'Copper(II) Hydroxide', nameAr: 'هيدروكسيد النحاس الأزرق', formula: 'Cu(OH)₂(s)', category: 'compound', categoryAr: 'هيدروكسيد أزرق راسب', stateAtRoomTemp: 'solid', colorHex: '#38bdf8', descriptionAr: 'راسب أزرق ينحل بالتسخين إلى أكسيد نحاس أسود وبخار ماء', descriptionEn: 'Blue jelly precipitate decomposing to black copper oxide' },
  { id: 'NaNO3', symbol: 'NaNO₃', nameEn: 'Sodium Nitrate', nameAr: 'نترات الصوديوم (بارود تشيلي)', formula: 'NaNO₃(s)', category: 'salt', categoryAr: 'ملح نترات قابل للانحلال', stateAtRoomTemp: 'solid', colorHex: '#f8fafc', descriptionAr: 'بلورات بيضاء تنحل بالحرارة إلى نيتريت أبيض مصفر وأكسجين', descriptionEn: 'White salt decomposing on heating to nitrite and oxygen' },
];

// -------------------------------------------------------------
// Comprehensive Chemical Reactions Master Database (35+ Reactions)
// -------------------------------------------------------------
export const CHEMICAL_REACTIONS_DB: ChemicalReaction[] = [
  // ===========================================================
  // 1. تفاعلات الاتحاد المباشر (Direct Combination / Synthesis)
  // ===========================================================
  {
    id: 'syn-mg-o',
    category: 'synthesis',
    categoryAr: 'الاتحاد المباشر',
    categoryEn: 'Direct Combination / Synthesis',
    reactants: ['Mg', 'O2'],
    equation: '2Mg(s) + O₂(g) → 2MgO(s)',
    equationAr: '2Mg(شريط ماغنسيوم) + O₂(أكسجين) → 2MgO(رماد أبيض)',
    typeEn: 'Synthesis / Dazzling Combustion',
    typeAr: 'اتحاد مباشر / احتراق فوسفوري مبهر',
    energyEn: 'Exothermic (ΔH = -1204 kJ/mol)',
    energyAr: 'طارد شديد للحرارة (طاقة إشعاعية وضوء أبيض مبهر)',
    productsEn: 'Magnesium Oxide (White Ash)',
    productsAr: 'أكسيد الماغنسيوم (مسحوق رماد أبيض ناصع)',
    colorChangeEn: 'Blinding white incandescence leaving brilliant white powder',
    colorChangeAr: 'وميض أبيض شديد اللمعان يعمي البصر ويتحول الرماد لمسحوق أبيض',
    temperatureChange: 180,
    visualEffect: 'bright_flash',
    liquidColor: '#f8fafc',
    solidProduct: 'MgO (مسحوق رماد أبيض ناصع)',
    safetyHazardAr: 'تحذير: تجنب التحديق المباشر في الوميض لحماية شبكية العين من الأشعة فوق البنفسجية',
    safetyHazardEn: 'Caution: Extreme UV emission - avoid direct optical viewing',
    scientificExplanationAr: 'يفقد الماغنسيوم إلكتروني التكافؤ بسهولة مانحاً إياهما للأكسجين، مكوناً شبكة أيونية فائقة الاستقرار مع تحرر طاقة هائلة على شكل فوتونات مرئية وفوق بنفسجية.',
    scientificExplanationEn: 'Rapid oxidation generates vast lattice energy emitted as intense visible and ultraviolet photons.'
  },
  {
    id: 'syn-na-cl',
    category: 'synthesis',
    categoryAr: 'الاتحاد المباشر',
    categoryEn: 'Direct Combination / Synthesis',
    reactants: ['Na', 'Cl2'],
    equation: '2Na(s) + Cl₂(g) → 2NaCl(s)',
    equationAr: '2Na(صوديوم) + Cl₂(غاز كلور) → 2NaCl(ملح طعام)',
    typeEn: 'Violent Redox Synthesis',
    typeAr: 'اتحاد مباشر / تكوين ملح الطعام الأيوني',
    energyEn: 'Exothermic (ΔH = -822 kJ/mol)',
    energyAr: 'طارد شديد للحرارة (ΔH = -822 ك.جول/مول)',
    productsEn: 'Sodium Chloride (Table Salt)',
    productsAr: 'كلوريد الصوديوم (ملح طعام بلوري نقي)',
    colorChangeEn: 'Intense yellow sodium flare with dense white salt smoke',
    colorChangeAr: 'لهب أصفر ساطع متوهج مع تصاعد سحب بيضاء كثيفة تترسب كملح طعام',
    temperatureChange: 145,
    visualEffect: 'bright_flash',
    liquidColor: '#ffffff',
    solidProduct: 'NaCl (بلورات ملح طعام نقية)',
    safetyHazardAr: 'خطر: تفاعل عنيف ينتج درجات حرارة فائقة؛ الصوديوم والكلور خطران بمفردهما لكن ناتجهما صالح للأكل!',
    safetyHazardEn: 'Vigorous reaction of dangerous elemental reagents yielding harmless edible salt',
    scientificExplanationAr: 'انتقال كامل لإلكترون 3s من الصوديوم إلى المدار 3p للكلور ليكتمل الغلاف الخارجي لكليهما (قاعدة الثمانيات) وبناء شبكة مكعبة صلبة.',
    scientificExplanationEn: 'Complete valence electron transfer generates stable Na+ and Cl- octets arranged in an FCC ionic lattice.'
  },
  {
    id: 'syn-h-o',
    category: 'synthesis',
    categoryAr: 'الاتحاد المباشر',
    categoryEn: 'Direct Combination / Synthesis',
    reactants: ['H2', 'O2'],
    equation: '2H₂(g) + O₂(g) → 2H₂O(l)',
    equationAr: '2H₂(هيدروجين) + O₂(أكسجين) → 2H₂O(ماء مقطر نقي)',
    typeEn: 'Clean Combustion Synthesis',
    typeAr: 'اتحاد مباشر / احتراق نظيف وتكوين الماء',
    energyEn: 'Exothermic (ΔH = -572 kJ/mol)',
    energyAr: 'طارد شديد للحرارة مع صوت فرقعة مائية',
    productsEn: 'Pure Water Droplets & Steam',
    productsAr: 'بخار ماء متكثف وقطرات ماء نقي',
    colorChangeEn: 'Pale blue combustion flash with water droplets condensing on glass',
    colorChangeAr: 'وميض أزرق هادئ مصحوب بفرقعة وتكثف قطرات الماء الشفاف على جدران الوعاء',
    temperatureChange: 110,
    visualEffect: 'blue_flame',
    liquidColor: '#38bdf8',
    gasReleased: 'بخار ماء نقي فائق السخونة',
    safetyHazardAr: 'تفاعل فرقعة سريع هو أساس محركات صواريخ الفضاء وخلايا وقود الهيدروجين النظيفة',
    safetyHazardEn: 'Explosive pop producing pure eco-friendly water vapor',
    scientificExplanationAr: 'تتكسر الروابط التساهمية غير القطبية في جزيئات H₂ و O₂ لتتشكل روابط تساهمية قطبية قوية ومستقرة H-O تفرز فائض الطاقة الكيميائية.',
    scientificExplanationEn: 'Recombination of broken covalent bonds into polarized H-O bonds releases vast thermodynamic enthalpy.'
  },
  {
    id: 'syn-fe-s',
    category: 'synthesis',
    categoryAr: 'الاتحاد المباشر',
    categoryEn: 'Direct Combination / Synthesis',
    reactants: ['Fe', 'S'],
    requiresHeat: true,
    equation: 'Fe(s) + S(s) + Heat → FeS(s)',
    equationAr: 'Fe(برادة حديد) + S(مسحوق كبريت) + تسخين → FeS(كبريتيد حديد)',
    typeEn: 'Direct Combination / Sulfidation',
    typeAr: 'اتحاد مباشر لتكوين كبريتيد الفلز بالحرارة',
    energyEn: 'Exothermic once ignited (ΔH = -100 kJ/mol)',
    energyAr: 'طارد ذاتي بعد بدء التسخين بموقد بنزن',
    productsEn: 'Iron(II) Sulfide (Black Insoluble Solid)',
    productsAr: 'كبريتيد الحديد الثنائي (مادة سوداء غير مغناطيسية)',
    colorChangeEn: 'Yellow sulfur and grey iron melt into a glowing red mass cooling to black solid',
    colorChangeAr: 'ينصهر الكبريت الأصفر مع برادة الحديد في جمرة حمراء متوهجة تتصلب إلى كتلة سوداء',
    temperatureChange: 95,
    visualEffect: 'orange_fire',
    liquidColor: '#1e293b',
    solidProduct: 'FeS (كتلة سوداء صلبة تفقد خاصية الجذب المغناطيسي)',
    safetyHazardAr: 'انبعاث روائح كبريتية وتوهج جمر مستمر ذاتياً بعد إبعاد لهب بنزن',
    safetyHazardEn: 'Self-propagating incandescent red glow releasing sulfurous fumes',
    scientificExplanationAr: 'يفقد الحديد إلكترونين ليرتبط بأيون الكبريتيد S²⁻؛ ويلاحظ فقدان الحديد لخاصيته المغناطيسية الأصلية كدليل على حدوث تغير كيميائي وليس مجرد خلط فيزيائي.',
    scientificExplanationEn: 'Iron surrenders its ferromagnetism as valence electrons enter localized coordinate bonds with sulfur.'
  },
  {
    id: 'syn-c-o',
    category: 'synthesis',
    categoryAr: 'الاتحاد المباشر',
    categoryEn: 'Direct Combination / Synthesis',
    reactants: ['C', 'O2'],
    equation: 'C(s) + O₂(g) → CO₂(g)',
    equationAr: 'C(فحم نقي) + O₂(أكسجين) → CO₂(ثاني أكسيد الكربون)',
    typeEn: 'Combustion Synthesis',
    typeAr: 'اتحاد مباشر / احتراق كربوني كامل',
    energyEn: 'Exothermic (ΔH = -393.5 kJ/mol)',
    energyAr: 'طارد للحرارة (مصدر الطاقة الحرارية)',
    productsEn: 'Carbon Dioxide Gas',
    productsAr: 'غاز ثاني أكسيد الكربون عديم اللون (يعكر ماء الجير)',
    colorChangeEn: 'Charcoal glows bright orange-red emitting warm convective heat',
    colorChangeAr: 'يتوهج الفحم بوهج برتقالي أحمر ساطع دافئ ويتصاعد غاز عديم اللون',
    temperatureChange: 85,
    visualEffect: 'orange_fire',
    liquidColor: '#334155',
    gasReleased: 'CO₂ (غاز ثاني أكسيد الكربون يعكر ماء الجير الرائق)',
    safetyHazardAr: 'استهلاك سريع للأكسجين وتصاعد غازات خانقة في الأماكن المغلقة',
    safetyHazardEn: 'Depletes oxygen rapidly, producing asphyxiant carbon dioxide',
    scientificExplanationAr: 'ترتبط ذرة الكربون برابطتين ثنائيتين خطيتين مع ذرتي أكسجين (O=C=O) مشكلة جزيئاً مستقراً خامل نسبياً ذو طاقة وضع كيميائية منخفضة.',
    scientificExplanationEn: 'Formation of linear dual C=O double bonds releases sustained thermal flux.'
  },
  {
    id: 'syn-cao-h2o',
    category: 'synthesis',
    categoryAr: 'الاتحاد المباشر',
    categoryEn: 'Direct Combination / Synthesis',
    reactants: ['CaO', 'H2O'],
    equation: 'CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat',
    equationAr: 'CaO(الجير الحي) + H₂O(ماء) → Ca(OH)₂(ماء الجير المطفأ) + حرارة',
    typeEn: 'Slaking / Exothermic Hydration Synthesis',
    typeAr: 'اتحاد مباشر / إطفاء الجير الحي شديد الحرارة',
    energyEn: 'Highly Exothermic (ΔH = -65 kJ/mol)',
    energyAr: 'طارد شديد للحرارة يغلي الماء فورياً',
    productsEn: 'Calcium Hydroxide (Slaked Lime Solution)',
    productsAr: 'هيدروكسيد الكالسيوم (ماء الجير الرائق / الجير المطفأ)',
    colorChangeEn: 'Lumps of white quicklime swell, crack, and boil water into steaming milky suspension',
    colorChangeAr: 'تنتفخ قطع الجير الأبيض وتتصدع ويغلي الماء متصاعداً كبخار كثيف مكوناً محلولاً حليبياً ساخناً',
    temperatureChange: 75,
    visualEffect: 'smoke_effervescence',
    liquidColor: '#f8fafc',
    solidProduct: 'Ca(OH)₂ (معلق أبيض جيري)',
    gasReleased: 'بخار ماء متصاعد من حرارة الغليان',
    safetyHazardAr: 'تحذير: حرارة التفاعل كافية لغليان الماء وتطاير رذاذ قلوي كاوٍ للجلد والعيون',
    safetyHazardEn: 'Extreme boiling heat generation capable of spraying caustic alkaline slurry',
    scientificExplanationAr: 'تتفكك الشبكة البلورية للجير الحي CaO وتتحد مع جزيئات الماء لتكوين أيونات الكالسيوم Ca²⁺ والهيدروكسيل OH⁻، محررة طاقة إماهة هائلة تفوق طاقة التفكك.',
    scientificExplanationEn: 'Massive hydration enthalpy of calcium ions overcomes lattice dissociation energy, boiling surrounding water.'
  },

  // ===========================================================
  // 2. تفاعلات الإحلال البسيط (Single Displacement / Substitution)
  // ===========================================================
  {
    id: 'disp-zn-hcl',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['Zn', 'HCl'],
    equation: 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
    equationAr: 'Zn(خارصين) + 2HCl(حمض هيدروكلوريك) → ZnCl₂(كلوريد خارصين) + H₂(غاز هيدروجين)↑',
    typeEn: 'Single Replacement (Metal displaces Hydrogen)',
    typeAr: 'إحلال بسيط / إحلال فلز نشط محل هيدروجين الحمض',
    energyEn: 'Exothermic (ΔH = -153 kJ/mol)',
    energyAr: 'طارد للحرارة مع فوران غازي سريع',
    productsEn: 'Zinc Chloride Solution + Hydrogen Gas',
    productsAr: 'محلول كلوريد الخارصين الرائق + غاز الهيدروجين المتصاعد',
    colorChangeEn: 'Vigorous bubbling and effervescence, zinc granules gradually dissolve',
    colorChangeAr: 'فوران سريع متدفق لفقاعات غاز الهيدروجين مع ذوبان تدريجي لحبيبات الخارصين الرمادية',
    temperatureChange: 45,
    visualEffect: 'effervescence_bubbles',
    liquidColor: '#f1f5f9',
    gasReleased: 'H₂ (غاز الهيدروجين يشتعل بفرقعة عند تقريب شظية مشتعلة)',
    safetyHazardAr: 'تصاعد غاز الهيدروجين القابل للاشتعال والفرقعة؛ يجب تجنب اللهب المكشوف أثناء التجربة',
    safetyHazardEn: 'Generates flammable hydrogen gas that pops with audible explosion near sparks',
    scientificExplanationAr: 'يسبق الخارصين (Zn) الهيدروجين في متسلسلة النشاط الكيميائي (جهد اختزاله القياسي -0.76V)؛ لذا يتأكسد الخارصين مانحاً إلكتروناته لأيونات H⁺ فتختزل إلى غاز H₂.',
    scientificExplanationEn: 'Zinc sits above hydrogen in the electrochemical series (E° = -0.76V), readily reducing aqueous protons into H2 gas.'
  },
  {
    id: 'disp-mg-hcl',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['Mg', 'HCl'],
    equation: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)↑',
    equationAr: 'Mg(شريط ماغنسيوم) + 2HCl(حمض هيدروكلوريك) → MgCl₂(كلوريد ماغنسيوم) + H₂(غاز هيدروجين)↑',
    typeEn: 'Violent Acid-Metal Displacement',
    typeAr: 'إحلال بسيط عاصف / فوران هيدروجيني فائق السرعة',
    energyEn: 'Highly Exothermic (ΔH = -467 kJ/mol)',
    energyAr: 'طارد شديد للحرارة مع تسخين الأنبوب فورياً',
    productsEn: 'Magnesium Chloride + Rapid Hydrogen Jet',
    productsAr: 'محلول كلوريد الماغنسيوم + تدفق نفاث لغاز الهيدروجين',
    colorChangeEn: 'Violent effervescence, magnesium ribbon zooms around and vanishes in seconds',
    colorChangeAr: 'فوران عاصف يتحرك فيه شريط الماغنسيوم كالمقذوف داخل السائل ويختفي في ثوانٍ',
    temperatureChange: 65,
    visualEffect: 'effervescence_bubbles',
    liquidColor: '#f8fafc',
    gasReleased: 'H₂ (تدفق هيدروجيني قوي يشتعل بفرقعة حادة)',
    safetyHazardAr: 'حرارة عالية وفوران سريع قد يقذف بقطرات الحمض خارج الأنبوب إذا لم يراعَ التخفيف',
    safetyHazardEn: 'Rapid effervescence with substantial heat dissipation',
    scientificExplanationAr: 'الماغنسيوم أعلى بكثير من الخارصين في متسلسلة النشاط الكيميائي (E° = -2.37V)، مما يجعل معدل التفاعل أسرع بأضعاف مضاعفة ويفرز حرارة عالية.',
    scientificExplanationEn: 'Higher standard oxidation potential of Mg drives near-instantaneous proton reduction.'
  },
  {
    id: 'disp-fe-cuso4',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['Fe', 'CuSO4'],
    equation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)↓',
    equationAr: 'Fe(مسمار حديد) + CuSO₄(كبريتات نحاس زرقاء) → FeSO₄(كبريتات حديد خضراء) + Cu(نحاس أحمر)↓',
    typeEn: 'Metal-Metal Displacement (Activity Series)',
    typeAr: 'إحلال بسيط / إحلال الحديد محل النحاس وترسيب النحاس الأحمر',
    energyEn: 'Exothermic (ΔH = -219 kJ/mol)',
    energyAr: 'طارد معتدل للحرارة مع تحول لوني بديع',
    productsEn: 'Iron(II) Sulfate (Pale Green) + Reddish Copper Metal',
    productsAr: 'محلول كبريتات الحديد الثنائي الأخضر الفاتح + مسحوق نحاس أحمر نقي',
    colorChangeEn: 'Deep blue solution fades to pale green while shiny iron turns coated with reddish-brown copper',
    colorChangeAr: 'يتحول اللون الأزرق السماوي تدريجياً لأخضر باهت، ويكتسي الحديد بطبقة نحاسية حمراء لامعة',
    temperatureChange: 35,
    visualEffect: 'none',
    liquidColor: '#86efac',
    solidProduct: 'Cu (طبقة نحاس فلزي أحمر بني لامع تترسب على الحديد)',
    safetyHazardAr: 'تفاعل مدرسي كلاسيكي آمن يبرهن ترتيب الفلزات في متسلسلة النشاط الكيميائي',
    safetyHazardEn: 'Safe classic educational proof of electrochemical displacement',
    scientificExplanationAr: 'الحديد أكثر نشاطاً من النحاس في المتسلسلة؛ يتأكسد الحديد إلى Fe²⁺ ويذوب في المحلول، بينما تكتسب أيونات Cu²⁺ إلكترونات وتختزل وتترسب على شكل ذرات نحاس حمراء.',
    scientificExplanationEn: 'Iron oxidizes spontaneously (Fe → Fe²⁺ + 2e⁻) while copper ions reduce (Cu²⁺ + 2e⁻ → Cu) coating the metal.'
  },
  {
    id: 'disp-zn-cuso4',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['Zn', 'CuSO4'],
    equation: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)↓',
    equationAr: 'Zn(خارصين) + CuSO₄(كبريتات نحاس زرقاء) → ZnSO₄(محلول عديم اللون) + Cu(نحاس أحمر)↓',
    typeEn: 'Displacement / Decolorization of Blue Solution',
    typeAr: 'إحلال بسيط / زوال لون كبريتات النحاس وترسب النحاس',
    energyEn: 'Exothermic (ΔH = -217 kJ/mol)',
    energyAr: 'طارد للحرارة مع زوال تام للون الأزرق',
    productsEn: 'Zinc Sulfate (Colorless Solution) + Spongy Copper',
    productsAr: 'محلول كبريتات الخارصين عديم اللون + كتل نحاس إسفنجي أحمر',
    colorChangeEn: 'Striking blue fades completely to crystal clear; dark red spongy copper precipitates',
    colorChangeAr: 'يزول اللون الأزرق تماماً ويصبح السائل شفافاً كالماء، مع ترسب كتل إسفنجية حمراء داكنة من النحاس',
    temperatureChange: 50,
    visualEffect: 'none',
    liquidColor: '#f1f5f9',
    solidProduct: 'Cu (نحاس إسفنجي أحمر داكن يترسب في القاع)',
    safetyHazardAr: 'ارتفاع ملحوظ في درجة الحرارة مع زوال تام لزرقة النحاس',
    safetyHazardEn: 'Significant temperature rise accompanying complete solution bleaching',
    scientificExplanationAr: 'الزنك يسبق النحاس بمسافة أكبر في متسلسلة النشاط الكيميائي، لذا يحل محله بسرعة وتتحول أيونات النحاس الزرقاء إلى ذرات نحاس حمراء متعادلة.',
    scientificExplanationEn: 'Greater potential difference between Zn and Cu drives rapid bleaching of blue Cu²⁺ chromophores.'
  },
  {
    id: 'disp-na-h2o',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['Na', 'H2O'],
    equation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑ + Heat',
    equationAr: '2Na(صوديوم) + 2H₂O(ماء) → 2NaOH(صودا كاوية) + H₂(غاز هيدروجين)↑ + حرارة',
    typeEn: 'Alkali Metal Water Displacement',
    typeAr: 'إحلال بسيط / إحلال فلز قلوي محل هيدروجين الماء باشتعال',
    energyEn: 'Extremely Exothermic (ΔH = -368 kJ/mol)',
    energyAr: 'طارد شديد جداً للحرارة مع اشتعال هيدروجيني تلقائي',
    productsEn: 'Sodium Hydroxide (Strong Alkaline) + Hydrogen Flame',
    productsAr: 'محلول هيدروكسيد الصوديوم القلوي + لهب هيدروجيني أصفر وفرقعة',
    colorChangeEn: 'Sodium melts into a buzzing silver sphere skating on water, catching fire with yellow flame and pop',
    colorChangeAr: 'ينصهر الصوديوم متحولاً لكرة فضية تسبح بسرعة على سطح الماء مع اشتعال بلهب أصفر ساطع وفرقعة نهائية',
    temperatureChange: 90,
    visualEffect: 'orange_fire',
    liquidColor: '#c084fc',
    gasReleased: 'H₂ (هيدروجين يشتعل ذاتياً بفعل حرارة التفاعل)',
    safetyHazardAr: 'خطر شديد في الواقع: تناثر قطرات منصهرة من الصوديوم ومحلول قلوي كاوي يسبب حروقاً خطيرة',
    safetyHazardEn: 'Hazard: Molten sodium skitters and explodes; forms caustic corrosive alkali',
    scientificExplanationAr: 'جهد تأين الصوديوم المنخفض جداً يجعل تفاعله مع بروتونات الماء فورياً وطارداً لحرارة تفوق نقطة اشتعال غاز الهيدروجين المنطلق، فيشتعل الهيدروجين ذاتياً.',
    scientificExplanationEn: 'Low ionization energy makes reaction so exothermic that emitted H2 immediately auto-ignites in air.'
  },
  {
    id: 'disp-k-h2o',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['K', 'H2O'],
    equation: '2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)↑',
    equationAr: '2K(بوتاسيوم) + 2H₂O(ماء) → 2KOH(بوتاس كاوية) + H₂(هيدروجين)↑',
    typeEn: 'Violent Water Displacement with Lilac Flame',
    typeAr: 'إحلال بسيط فائق العنف واللهب البنفسجي',
    energyEn: 'Extremely Exothermic (ΔH = -391 kJ/mol)',
    energyAr: 'طارد فائق يشتعل لحظياً بدون أي تأخير',
    productsEn: 'Potassium Hydroxide + Violet Flame Explosion',
    productsAr: 'هيدروكسيد البوتاسيوم + وميض بنفسجي ليلكي وفرقعة فورية',
    colorChangeEn: 'Instant ignition upon water contact with brilliant violet/lilac flame and sharp pop',
    colorChangeAr: 'اشتعال فوري بمجرد ملامسة سطح الماء بلهب بنفسجي (ليلكي) ساحر يتبعه فرقعة قوية',
    temperatureChange: 115,
    visualEffect: 'purple_flame',
    liquidColor: '#a855f7',
    gasReleased: 'H₂ (يشتعل بلهب بنفسجي فوري)',
    safetyHazardAr: 'أعنف من الصوديوم؛ لا يجوز لمسه أو تقريبه من الوجه في المعامل الحقيقية',
    safetyHazardEn: 'More violent than sodium - instant ignition with lilac emission spectrum',
    scientificExplanationAr: 'كبر الحجم الذري للبوتاسيوم يجعل إلكترون التكافؤ أضعف ارتباطاً بالنواة، مما يحرر طاقة التفاعل أسرع بكثير من الصوديوم، مع إثارة أيونات K⁺ لتبعث طيفها البنفسجي المميز.',
    scientificExplanationEn: 'Larger atomic radius allows faster electron loss; atomic excitation produces characteristic 766 nm lilac emission.'
  },
  {
    id: 'disp-cu-agno3',
    category: 'single_replacement',
    categoryAr: 'الإحلال البسيط',
    categoryEn: 'Single Displacement / Replacement',
    reactants: ['Cu', 'AgNO3'],
    equation: 'Cu(s) + 2AgNO₃(aq) → Cu(NO₃)₂(aq) + 2Ag(s)↓',
    equationAr: 'Cu(سلك نحاس) + 2AgNO₃(نترات فضة شفافة) → Cu(NO₃)₂(نترات نحاس زرقاء) + 2Ag(بلورات فضة)↓',
    typeEn: 'Silver Tree Crystal Displacement',
    typeAr: 'إحلال بسيط / شجرة الفضة وترسيب بلورات الفضة الإبرية',
    energyEn: 'Exothermic (ΔH = -147 kJ/mol)',
    energyAr: 'طارد معتدل مع نمو بلورات فضية مذهلة',
    productsEn: 'Copper(II) Nitrate (Royal Blue) + Needle Silver Crystals',
    productsAr: 'محلول نترات النحاس الأزرق الملكي + شجيرات بلورية من الفضة النقية',
    colorChangeEn: 'Clear liquid turns shimmering sapphire blue; lustrous needle-like silver crystals grow on copper',
    colorChangeAr: 'يتحول السائل الشفاف لأزرق ياقوتي ملكي ساحر، وتنمو إبر فضية لامعة كريستالية تشبه شجرة الصنوبر',
    temperatureChange: 30,
    visualEffect: 'precipitate_white',
    liquidColor: '#0284c7',
    solidProduct: 'Ag (بلورات فضة إبرية لامعة فائقة النقاء)',
    safetyHazardAr: 'تفاعل جمالي مبهر يعرض في المعارض؛ نترات الفضة تسوّد الجلد إذا لامسته',
    safetyHazardEn: 'Gorgeous crystal growth demonstration; silver nitrate causes harmless black skin staining',
    scientificExplanationAr: 'النحاس يسبق الفضة في متسلسلة النشاط الكيميائي؛ يتأكسد النحاس Cu إلى Cu²⁺ (الذي يمنح المحلول لونه الأزرق الملكي)، وتختزل أيونات Ag⁺ وتترسب كبلورات فضة ناصعة.',
    scientificExplanationEn: 'Cu oxidizes to hydrated sapphire [Cu(H2O)6]²⁺, precipitating dendritic metallic silver needles.'
  },

  // ===========================================================
  // 3. تفاعلات الإحلال المزدوج والترسيب والتعادل (Double Displacement)
  // ===========================================================
  {
    id: 'dbl-pbno3-ki',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Precipitation',
    reactants: ['Pb_NO3_2', 'KI'],
    equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
    equationAr: 'Pb(NO₃)₂(نترات رصاص شفافة) + 2KI(يوديد بوتاسيوم) → PbI₂(يوديد رصاص أصفر ذهبي)↓ + 2KNO₃',
    typeEn: 'Golden Rain Precipitation',
    typeAr: 'إحلال مزدوج / تجربة المطر الذهبي الشهيرة وترسب الراسب الأصفر',
    energyEn: 'Exothermic (ΔH = -62 kJ/mol)',
    energyAr: 'طارد معتدل مع وميض أصفر ذهبي ساطع',
    productsEn: 'Lead(II) Iodide (Golden Yellow Precipitate) + Potassium Nitrate',
    productsAr: 'يوديد الرصاص الثنائي (راسب أصفر ذهبي كناري فاقع) + نترات بوتاسيوم',
    colorChangeEn: 'Two crystal clear solutions mix to instantly produce vivid bright canary golden yellow precipitate',
    colorChangeAr: 'يمتزج محلولان شفافان كالماء ليتحولا فورياً في جزء من الثانية إلى راسب أصفر ذهبي ساطع شديد الكثافة',
    temperatureChange: 20,
    visualEffect: 'precipitate_yellow',
    liquidColor: '#facc15',
    solidProduct: 'PbI₂ (راسب أصفر ذهبي فاقع ميكروسكوبي - المطر الذهبي)',
    safetyHazardAr: 'يحتوي على مركبات الرصاص الثقيلة السامة؛ يجب التخلص منه وفق معايير النفايات الكيميائية',
    safetyHazardEn: 'Toxic heavy metal waste requires proper laboratory containment',
    scientificExplanationAr: 'تبادل مزدوج للأيونات: تلتقي أيونات Pb²⁺ مع أيونات I⁻ لتكوين ملح PbI₂ ذو حاصل إذابة منخفض للغاية (Ksp = 9.8×10⁻⁹)، فيترسب كبلورات صفراء ذهبية سداسية ساطعة.',
    scientificExplanationEn: 'Extremely low solubility product (Ksp) triggers instantaneous crystallization of vibrant yellow hexagonal PbI2 plates.'
  },
  {
    id: 'dbl-agno3-nacl',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Precipitation',
    reactants: ['AgNO3', 'HCl'],
    equation: 'AgNO₃(aq) + HCl(aq) → AgCl(s)↓ + HNO₃(aq)',
    equationAr: 'AgNO₃(نترات فضة) + HCl(حمض هيدروكلوريك) → AgCl(راسب أبيض حليبي)↓ + HNO₃',
    typeEn: 'Curdy White Chloride Precipitation',
    typeAr: 'إحلال مزدوج / كشف الهاليدات وترسيب كلوريد الفضة الجبني',
    energyEn: 'Exothermic (ΔH = -65 kJ/mol)',
    energyAr: 'طارد معتدل مع تكون راسب حليبي فوري',
    productsEn: 'Silver Chloride (Curdy White Precipitate) + Nitric Acid',
    productsAr: 'كلوريد الفضة (راسب أبيض حليبي متخثر) + حمض نيتريك',
    colorChangeEn: 'Clear liquids turn instantly into a thick white milk-like cloudy precipitate',
    colorChangeAr: 'يتحول المحلول الشفاف فورياً إلى سائل أبيض حليبي كثيف متخثر يشبه اللبن الرائب',
    temperatureChange: 20,
    visualEffect: 'precipitate_white',
    liquidColor: '#f8fafc',
    solidProduct: 'AgCl (راسب أبيض حليبي يتحول للبنفسجي الرمادي عند التعرض للضوء)',
    safetyHazardAr: 'الكشف القياسي المعتمد في المناهج عن شق الكلوريد في الأملاح ومياه الشرب',
    safetyHazardEn: 'Standard qualitative analytical test detecting chloride ions in water',
    scientificExplanationAr: 'حاصل إذابة AgCl بالغ الصغر (1.8×10⁻¹⁰)؛ بمجرد امتزاج أيونات Ag⁺ مع Cl⁻ تتجاوز الجداء الأيوني فتتجمع في دقائق بلورية حليبية غير ذائبة في الماء.',
    scientificExplanationEn: 'Negligible Ksp causes instant saturation and coagulation of curdy white AgCl particles.'
  },
  {
    id: 'dbl-bacl2-na2so4',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Precipitation',
    reactants: ['BaCl2', 'Na2SO4'],
    equation: 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq)',
    equationAr: 'BaCl₂(كلوريد باريوم) + Na₂SO₄(كبريتات صوديوم) → BaSO₄(راسب أبيض ناصع)↓ + 2NaCl',
    typeEn: 'Barium Sulfate Heavy Precipitation',
    typeAr: 'إحلال مزدوج / كشف الكبريتات وترسيب كبريتات الباريوم الثقيلة',
    energyEn: 'Exothermic (ΔH = -26 kJ/mol)',
    energyAr: 'طارد معتدل مع راسب أبيض ناصع معتم',
    productsEn: 'Barium Sulfate (Dense White Precipitate) + Salt Water',
    productsAr: 'كبريتات الباريوم (راسب أبيض ناصع ثقيل لا يذوب في الأحماض) + محلول ملحي',
    colorChangeEn: 'Clear solutions turn instantly chalky white with dense heavy precipitate settling to bottom',
    colorChangeAr: 'يتحول المحلولان الشفافان في لمح البصر إلى أبيض طباشيري معتم وترسب بودرة بيضاء ثقيلة',
    temperatureChange: 15,
    visualEffect: 'precipitate_white',
    liquidColor: '#f8fafc',
    solidProduct: 'BaSO₄ (راسب أبيض ناصع خامل يستخدم كصبغة في أشعة الجهاز الهضمي)',
    safetyHazardAr: 'كبريتات الباريوم غير سامة تماماً بسبب عدم قابليتها للذوبان مطلقاً حتى في حمض المعدة المركز',
    safetyHazardEn: 'Insoluble BaSO4 is non-toxic and widely utilized as medical radiocontrast agent',
    scientificExplanationAr: 'شحنة الأيونات الثنائية (Ba²⁺ و SO₄²⁻) تعطي طاقة شبكة بلورية هائلة تمنع جزيئات الماء من إذابتها، مما يجعل الترسيب كمياً ودليلاً قاطعاً على وجود الكبريتات.',
    scientificExplanationEn: 'Divalent electrostatic attraction creates massive lattice enthalpy defying hydration forces.'
  },
  {
    id: 'dbl-cuso4-naoh',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Precipitation',
    reactants: ['CuSO4', 'NaOH'],
    equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
    equationAr: 'CuSO₄(كبريتات نحاس زرقاء) + 2NaOH(صودا كاوية) → Cu(OH)₂(راسب أزرق هلامي)↓ + Na₂SO₄',
    typeEn: 'Gelatinous Hydroxide Precipitation',
    typeAr: 'إحلال مزدوج / ترسب هيدروكسيد النحاس الأزرق الجيلاتيني',
    energyEn: 'Exothermic (ΔH = -54 kJ/mol)',
    energyAr: 'طارد للحرارة مع تكون راسب هلامي ساطع',
    productsEn: 'Copper(II) Hydroxide (Royal Blue Jelly Precipitate) + Sodium Sulfate',
    productsAr: 'هيدروكسيد النحاس الثنائي (راسب هلامي أزرق ساطع) + كبريتات صوديوم',
    colorChangeEn: 'Blue solution forms thick, jelly-like bright royal blue precipitate flakes',
    colorChangeAr: 'يتكون في المحلول راسب هلامي أزرق سماوي ساطع كثيف يشبه الجيلي يترسب في القاع',
    temperatureChange: 25,
    visualEffect: 'precipitate_blue',
    liquidColor: '#38bdf8',
    solidProduct: 'Cu(OH)₂ (راسب هلامي أزرق سماوي ساطع يتحول لأسود بالتسخين)',
    safetyHazardAr: 'محلول قلوي كاوي؛ الراسب الأزرق الناتج هو المادة المستخدمة في تجربة الانحلال الحراري التالية',
    safetyHazardEn: 'Caustic alkaline reaction yielding thermal decomposition precursor',
    scientificExplanationAr: 'أيونات الهيدروكسيل OH⁻ تهاجم معقدات النحاس المائية، طاردة جزيئات الماء ومكونة هيدروكسيد النحاس غير الذائب بروابط جسرية بوليمرية هلامية.',
    scientificExplanationEn: 'Hydroxide ions displace coordination water, forming an insoluble polymeric blue hydroxide gel.'
  },
  {
    id: 'dbl-fecl3-naoh',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Precipitation',
    reactants: ['FeCl3', 'NaOH'],
    equation: 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s)↓ + 3NaCl(aq)',
    equationAr: 'FeCl₃(كلوريد حديد أصفر) + 3NaOH(صودا كاوية) → Fe(OH)₃(راسب بني محمر جيلاتيني)↓ + 3NaCl',
    typeEn: 'Iron(III) Rust-Colored Gelatinous Precipitation',
    typeAr: 'إحلال مزدوج / ترسب هيدروكسيد الحديد الثلاثي البني المحمر',
    energyEn: 'Exothermic (ΔH = -88 kJ/mol)',
    energyAr: 'طارد للحرارة مع تكون راسب بني كثيف',
    productsEn: 'Iron(III) Hydroxide (Red-Brown Flocculent Precipitate) + Salt',
    productsAr: 'هيدروكسيد الحديد الثلاثي (راسب بني محمر يشبه الصدأ الرطب) + كلوريد صوديوم',
    colorChangeEn: 'Yellow-brown liquid instantly clots into dense reddish-brown rust-colored flakes',
    colorChangeAr: 'يتخثر المحلول الأصفر فورياً إلى كتل جيلاتينية بنية محمرة داكنة تشبه الصدأ الرطب',
    temperatureChange: 30,
    visualEffect: 'precipitate_brown',
    liquidColor: '#78350f',
    solidProduct: 'Fe(OH)₃ (راسب جيلاتيني بني محمر داكن)',
    safetyHazardAr: 'كشف نوعي يفرّق بين أملاح الحديد الثنائي (راسب أبيض مخضر) والثلاثي (راسب بني محمر)',
    safetyHazardEn: 'Diagnostic qualitative test distinguishing Fe(II) and Fe(III) ions',
    scientificExplanationAr: 'كثافة الشحنة العالية لأيون Fe³⁺ تجعله يرتبط بقوة بثلاث مجموعات هيدروكسيل OH⁻، مكوناً هيدروكسيداً غير متبلور عديم الذوبان تماماً في الماء.',
    scientificExplanationEn: 'High charge density of Fe³⁺ drives rapid precipitation of amorphous hydrous ferric oxide gel.'
  },
  {
    id: 'dbl-na2co3-hcl',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Acid-Carbonate Effervescence',
    reactants: ['Na2CO3', 'HCl'],
    equation: 'Na₂CO₃(s) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)↑',
    equationAr: 'Na₂CO₃(كربونات صوديوم) + 2HCl(حمض هيدروكلوريك) → 2NaCl(ملح) + H₂O(ماء) + CO₂(غاز ثاني أكسيد الكربون)↑',
    typeEn: 'Acid-Carbonate Gas Eruption',
    typeAr: 'إحلال مزدوج ثم تفكك / كشف أملاح الكربونات بالفوران الشديد',
    energyEn: 'Exothermic (ΔH = -28 kJ/mol)',
    energyAr: 'طارد معتدل مع فوران رغوي غزير',
    productsEn: 'Carbon Dioxide Gas Eruption + Salt Water',
    productsAr: 'فوران عاصف لغاز ثاني أكسيد الكربون + ماء مالح متعادل',
    colorChangeEn: 'Violent effervescence and frothing white foam as carbon dioxide gas erupts',
    colorChangeAr: 'فوران شديد وتصاعد رغوة غازية بيضاء كثيفة لغاز ثاني أكسيد الكربون الذي يعكر ماء الجير الرائق',
    temperatureChange: 25,
    visualEffect: 'effervescence_bubbles',
    liquidColor: '#f1f5f9',
    gasReleased: 'CO₂ (غاز ثاني أكسيد الكربون يعكر ماء الجير الرائق ويطفئ الشمعة المشتعلة)',
    safetyHazardAr: 'التجربة المعتمدة لاختبار حجر الكلس والرخام وكشف بيكربونات وكربونات الصوديوم',
    safetyHazardEn: 'Diagnostic test confirming carbonates; gas extinguishes burning splints',
    scientificExplanationAr: 'يتكون حمض الكربونيك H₂CO₃ غير المستقر أولاً، فيتفكك لحظياً إلى ماء وغاز ثاني أكسيد الكربون CO₂ الذي يفور متصاعداً بقوة خارج المحلول.',
    scientificExplanationEn: 'Transient carbonic acid intermediate decomposes spontaneously into water and escaping CO2 bubbles.'
  },
  {
    id: 'dbl-hcl-naoh',
    category: 'double_replacement',
    categoryAr: 'الإحلال المزدوج والترسيب',
    categoryEn: 'Double Displacement / Acid-Base Neutralization',
    reactants: ['HCl', 'NaOH'],
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + Heat',
    equationAr: 'HCl(حمض قوي) + NaOH(قلوي قوي) → NaCl(ملح طعام متعادل) + H₂O(ماء) + حرارة',
    typeEn: 'Classic Acid-Base Neutralization',
    typeAr: 'إحلال مزدوج / تفاعل التعادل الكلاسيكي وتوليد الحرارة',
    energyEn: 'Exothermic (ΔH = -57.3 kJ/mol)',
    energyAr: 'طارد للحرارة (حرارة التعادل القياسية 57.3 ك.جول/مول)',
    productsEn: 'Neutral Saline Solution (pH = 7) + Thermal Energy',
    productsAr: 'محلول ملحي متعادل تماماً (الأس الهيدروجيني pH = 7) + حرارة',
    colorChangeEn: 'Two corrosive clear solutions neutralize into completely harmless warm saline water',
    colorChangeAr: 'يمتزج سائلان كاويان حارقان ليتحولا فورياً إلى ماء مالح دافئ صالح للشرب بعد التبخير متعادل تماماً',
    temperatureChange: 35,
    visualEffect: 'none',
    liquidColor: '#e0f2fe',
    safetyHazardAr: 'أشهر تفاعلات الكيمياء التعليمية؛ يفقد كلا السائلين خواصهما الحارقة ويصبح المحلول متعادلاً',
    safetyHazardEn: 'Iconic neutralization eradicating acidity and basicity into neutral water',
    scientificExplanationAr: 'يتحد أيون الهيدروجين الموجب H⁺ (من الحمض) مع أيون الهيدروكسيل السالب OH⁻ (من القلوي) لتكوين جزيء الماء المستقر H₂O محرراً حرارة التعادل الثابتة.',
    scientificExplanationEn: 'Net ionic reaction H⁺ + OH⁻ → H2O liberates constant neutralization enthalpy (-57.3 kJ/mol).'
  },

  // ===========================================================
  // 4. تفاعلات الانحلال الحراري (Thermal Decomposition) بموقد بنزن
  // ===========================================================
  {
    id: 'dec-hgo',
    category: 'thermal_decomposition',
    categoryAr: 'الانحلال الحراري',
    categoryEn: 'Thermal Decomposition',
    reactants: ['HgO'],
    requiresHeat: true,
    equation: '2HgO(s) + Heat → 2Hg(l) + O₂(g)↑',
    equationAr: '2HgO(أكسيد زئبق أحمر) + تسخين → 2Hg(زئبق فضي سائل) + O₂(أكسجين يزيد اشتعال الشظية)↑',
    typeEn: 'Thermal Decomposition of Metal Oxide',
    typeAr: 'انحلال حراري / تفكك أكسيد الزئبق الأحمر وتجربة بريستلي ولا فوازييه',
    energyEn: 'Endothermic (Requires continuous Bunsen flame)',
    energyAr: 'ماص للحرارة (يتطلب تسخيناً مستمراً بموقد بنزن)',
    productsEn: 'Silvery Liquid Mercury Droplets + Oxygen Gas',
    productsAr: 'قطرات زئبق فضي ميثالي لامع + غاز الأكسجين النقي',
    colorChangeEn: 'Red powder darkens then decomposes; brilliant silvery metallic liquid beads condense on glass',
    colorChangeAr: 'يسود المسحوق الأحمر تدريجياً ثم تظهر قطرات فضية لامعة من الزئبق السائل وتتكثف على جدار الأنبوب',
    temperatureChange: 150,
    visualEffect: 'orange_fire',
    liquidColor: '#94a3b8',
    solidProduct: 'Hg (قطرات سائلة فضية لامعة من معدن الزئبق في قاع الأنبوب)',
    gasReleased: 'O₂ (غاز الأكسجين الذي يزيد توهج واشتعال شظية مشتعلة)',
    safetyHazardAr: 'تحذير تاريخي: بخار الزئبق سام؛ التجربة التي قادت جوزيف بريستلي لاكتشاف غاز الأكسجين عام 1774',
    safetyHazardEn: 'Historic experiment through which Joseph Priestley discovered Oxygen in 1774',
    scientificExplanationAr: 'ضعف الرابطة الأيونية بين الزئبق والأكسجين يجعل الطاقة الحرارية للهب بنزن كافية لتفكيك المركب إلى عنصري الزئبق السائل والأكسجين الغازي.',
    scientificExplanationEn: 'Modest bond dissociation energy of Hg-O allows moderate thermal energy to liberate elemental O2 and Hg.'
  },
  {
    id: 'dec-cuco3',
    category: 'thermal_decomposition',
    categoryAr: 'الانحلال الحراري',
    categoryEn: 'Thermal Decomposition',
    reactants: ['CuCO3'],
    requiresHeat: true,
    equation: 'CuCO₃(s) + Heat → CuO(s) + CO₂(g)↑',
    equationAr: 'CuCO₃(كربونات نحاس خضراء) + تسخين → CuO(أكسيد نحاس أسود) + CO₂(ثاني أكسيد الكربون)↑',
    typeEn: 'Thermal Decomposition of Metal Carbonate',
    typeAr: 'انحلال حراري / تفكك كربونات النحاس الخضراء إلى أكسيد نحاس أسود',
    energyEn: 'Endothermic (ΔH = +51 kJ/mol)',
    energyAr: 'ماص للحرارة (يتفكك بالتسخين المباشر)',
    productsEn: 'Copper(II) Oxide (Black Powder) + Carbon Dioxide Gas',
    productsAr: 'أكسيد النحاس الثنائي (مسحوق أسود) + غاز ثاني أكسيد الكربون',
    colorChangeEn: 'Vibrant green powder bubbles with escaping gas and turns completely into jet black powder',
    colorChangeAr: 'يتحول المسحوق الأخضر الزاهي تدريجياً مع التسخين إلى مسحوق أسود فاحم ويتصاعد غاز CO₂',
    temperatureChange: 120,
    visualEffect: 'orange_fire',
    liquidColor: '#0f172a',
    solidProduct: 'CuO (مسحوق أكسيد النحاس الأسود في قاع الأنبوب)',
    gasReleased: 'CO₂ (غاز يعكر ماء الجير الرائق)',
    safetyHazardAr: 'تطبيق منهجي شهير في المدارس لإثبات انحلال كربونات الفلزات بالحرارة',
    safetyHazardEn: 'Standard curriculum demonstration of metal carbonate thermal dissociation',
    scientificExplanationAr: 'تتفكك مجموعة الكربونات CO₃²⁻ بفعل الحرارة محررة غاز ثاني أكسيد الكربون CO₂ ويتبقى أيون الأكسيد O²⁻ مرتبطاً بالنحاس مشكلاً أكسيد النحاس الأسود CuO.',
    scientificExplanationEn: 'Thermal vibrations split carbonate ion into gaseous CO2 and stable solid black metal oxide.'
  },
  {
    id: 'dec-cuoh2',
    category: 'thermal_decomposition',
    categoryAr: 'الانحلال الحراري',
    categoryEn: 'Thermal Decomposition',
    reactants: ['Cu_OH_2'],
    requiresHeat: true,
    equation: 'Cu(OH)₂(s) + Heat → CuO(s) + H₂O(g)↑',
    equationAr: 'Cu(OH)₂(هيدروكسيد نحاس أزرق) + تسخين → CuO(أكسيد نحاس أسود) + H₂O(بخار ماء متصاعد)↑',
    typeEn: 'Thermal Decomposition of Metal Hydroxide',
    typeAr: 'انحلال حراري / انحلال هيدروكسيد النحاس الأزرق إلى أكسيد أسود',
    energyEn: 'Endothermic (Requires heating)',
    energyAr: 'ماص للحرارة (تحول لوني دراماتيكي من الأزرق للأسود)',
    productsEn: 'Black Copper Oxide + Water Vapor Steam',
    productsAr: 'أكسيد النحاس الأسود + بخار ماء يتكثف على فوهة الأنبوب',
    colorChangeEn: 'Bright blue precipitate turns rapidly into jet black precipitate with steam rising',
    colorChangeAr: 'يتحول الراسب الأزرق الجميل فور بدء التسخين إلى مسحوق أسود قاتم مع تصاعد بخار ماء',
    temperatureChange: 100,
    visualEffect: 'orange_fire',
    liquidColor: '#020617',
    solidProduct: 'CuO (أكسيد نحاس أسود)',
    gasReleased: 'H₂O (بخار ماء يتكثف كقطرات على الجدار البارد)',
    safetyHazardAr: 'يوضح القاعدة العامة: تنحل هيدروكسيدات الفلزات بالحرارة إلى أكسيد الفلز وبخار الماء',
    safetyHazardEn: 'Demonstrates rule: metal hydroxides decompose to metal oxides and steam',
    scientificExplanationAr: 'تفقد مجموعتا الهيدروكسيل جزيء ماء بفعل الطاقة الحركية الحرارية ويتحول المركب إلى أكسيد النحاس الأسود الأكثر استقراراً حرارياً.',
    scientificExplanationEn: 'Thermal dehydration eliminates water, yielding thermodynamically favored black CuO.'
  },
  {
    id: 'dec-nano3',
    category: 'thermal_decomposition',
    categoryAr: 'الانحلال الحراري',
    categoryEn: 'Thermal Decomposition',
    reactants: ['NaNO3'],
    requiresHeat: true,
    equation: '2NaNO₃(s) + Heat → 2NaNO₂(s) + O₂(g)↑',
    equationAr: '2NaNO₃(نترات صوديوم بيضاء) + تسخين → 2NaNO₂(نيتريت صوديوم أبيض مصفر) + O₂(أكسجين)↑',
    typeEn: 'Partial Thermal Decomposition of Nitrate',
    typeAr: 'انحلال حراري جزئي لنترات الفلزات القلوية وتصاعد الأكسجين',
    energyEn: 'Endothermic (ΔH = +107 kJ/mol)',
    energyAr: 'ماص للحرارة (يتطلب تسخيناً شديداً)',
    productsEn: 'Sodium Nitrite (Yellowish White) + Oxygen Gas',
    productsAr: 'نيتريت الصوديوم (مسحوق أبيض مصفر) + غاز الأكسجين النقي',
    colorChangeEn: 'White crystals melt to clear liquid, bubbling vigorously and solidifying yellowish-white',
    colorChangeAr: 'تنصهر البلورات البيضاء لسائل شفاف يفور بفقاعات الأكسجين ويتصلب بعد التبريد لمسحوق أبيض مصفر',
    temperatureChange: 140,
    visualEffect: 'orange_fire',
    liquidColor: '#fef08a',
    solidProduct: 'NaNO₂ (مسحوق نيتريت الصوديوم الأبيض المصفر)',
    gasReleased: 'O₂ (غاز الأكسجين يزيد توهج شظية مشتعلة)',
    safetyHazardAr: 'مادة مؤكسدة قوية؛ تنحل نترات الفلزات النشطة جزئياً فقط ولا تتفكك كلياً',
    safetyHazardEn: 'Strong oxidizer; alkali nitrates decompose partially into nitrites and O2',
    scientificExplanationAr: 'تحافظ الرابطة القوية بين الصوديوم وشق النيتروجين على ثبات الملح القلوي، فينحل الشق جزئياً فقط طارداً ذرة أكسجين واحدة متحولاً إلى نيتريت الصوديوم.',
    scientificExplanationEn: 'Strong cation stabilization restricts decomposition to partial oxygen elimination, forming nitrite.'
  }
];

// -------------------------------------------------------------
// Helper Query Function for Reactant Matching
// -------------------------------------------------------------
export function findMatchingReaction(selectedIds: string[], bunsenHeatActive: boolean = false): ChemicalReaction | null {
  if (selectedIds.length === 0) return null;

  // Single reactant check (thermal decomposition)
  if (selectedIds.length === 1) {
    const rId = selectedIds[0];
    const match = CHEMICAL_REACTIONS_DB.find(rx => 
      rx.category === 'thermal_decomposition' && 
      rx.reactants.length === 1 && 
      rx.reactants[0] === rId
    );
    if (match) {
      if (match.requiresHeat && !bunsenHeatActive) {
        return null; // needs bunsen heat
      }
      return match;
    }
    return null;
  }

  // Two reactants check
  if (selectedIds.length === 2) {
    const idA = selectedIds[0];
    const idB = selectedIds[1];

    const match = CHEMICAL_REACTIONS_DB.find(rx => {
      if (rx.reactants.length !== 2) return false;
      const hasA = rx.reactants.includes(idA);
      const hasB = rx.reactants.includes(idB);
      return hasA && hasB;
    });

    if (match) {
      if (match.requiresHeat && !bunsenHeatActive) {
        return null;
      }
      return match;
    }
  }

  return null;
}
