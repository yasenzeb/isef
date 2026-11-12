// Reaction-type selector data for the Chemistry Lab: the four basic reaction types,
// extra reactions, extra reagents, and the sources used. Type-only import avoids a runtime cycle.
import type { ChemicalReaction, ReactionCategory, WorkbenchReagent } from './chemicalReactionsData';

export type ReactionTypeKey = 'combination' | 'decomposition' | 'single' | 'double';
export type ReactionTypeFilter = 'all' | ReactionTypeKey;

export const REACTION_TYPE_KEYS: ReactionTypeKey[] = ['combination', 'decomposition', 'single', 'double'];

export const REACTION_TYPE_CATEGORY: Record<ReactionTypeKey, ReactionCategory> = {
  combination: 'synthesis',
  decomposition: 'thermal_decomposition',
  single: 'single_replacement',
  double: 'double_replacement',
};

export function typeKeyOfCategory(c: ReactionCategory): ReactionTypeKey | null {
  return REACTION_TYPE_KEYS.find(k => REACTION_TYPE_CATEGORY[k] === c) ?? null;
}

export interface ReactionSource { title: string; url: string }

// Real, openly available chemistry references. Indices are used by REACTION_TYPE_INFO.
export const REACTION_SOURCES: ReactionSource[] = [
  { title: 'LibreTexts — Types of Inorganic Reactions (Chemistry for Allied Health, Soult)', url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Chemistry_for_Allied_Health_(Soult)/11%3A_Properties_of_Reactions/11.03%3A_Types_of_Inorganic_Reactions' },
  { title: 'LibreTexts — Classifying Chemical Reactions (Introductory Chemistry Online, Young)', url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Book%3A_Introductory_Chemistry_Online_(Young)/05%3A_Chemical_Reactions/5.4%3A_Classifying_Chemical_Reactions' },
  { title: 'LibreTexts — Single and Double Displacement Reactions (Consumer Chemistry, activity series)', url: 'https://chem.libretexts.org/Courses/BridgeValley_Community_and_Technical_College/Consumer_Chemistry/11%3A_The_Chemical_Equation/11.03%3A_Types_of_Chemical_Reactions_-_Single_and_Double_Displacement_Reactions' },
  { title: 'LibreTexts — Precipitation Reactions (solubility rules)', url: 'https://chem.libretexts.org/Inorganic_Chemistry/Reactions_in_Aqueous_Solutions/Precipitation_Reactions' },
  { title: 'LibreTexts — Classifying Reactions (Madera College: HgO, metal carbonates)', url: 'https://chem.libretexts.org/Courses/Madera_Community_College/Concepts_of_Physical_Science/13%3A_Chemical_Reactions/13.07%3A_Classifying_Reactions' },
  { title: 'BCcampus Introductory Chemistry — Single- and Double-Displacement Reactions', url: 'https://opentextbc.ca/introductorychemistry/chapter/types-of-chemical-reactions-single-and-double-displacement-reactions/' },
  { title: 'LibreTexts — Activity Series of Metals (Stephen Lower)', url: 'https://chem.libretexts.org/Ancillary_Materials/Reference/Reference_Tables/Electrochemistry_Tables/P3:_Activity_Series_of_Metals' },
];

export const REACTION_TYPE_INFO: Record<ReactionTypeKey, {
  ar: string; en: string; form: string; descAr: string; descEn: string; sources: number[];
}> = {
  combination: { ar: 'اتحاد مباشر', en: 'Direct combination', form: 'A + B → AB', descAr: 'مادتان أو أكثر تتحدان لتكوّنا مادة واحدة جديدة.', descEn: 'Two or more substances combine into one new substance.', sources: [0, 1] },
  decomposition: { ar: 'انحلال', en: 'Decomposition', form: 'AB → A + B', descAr: 'مركّب واحد ينكسر إلى مادتين أبسط، وغالبًا يحتاج حرارة أو ضوءًا أو كهرباء. اختر مركّبًا واحدًا.', descEn: 'One compound breaks into simpler substances, usually needing heat, light or electricity. Pick one compound.', sources: [0, 4] },
  single: { ar: 'إحلال بسيط', en: 'Single displacement', form: 'AB + C → AC + B', descAr: 'عنصر نشط يحلّ محل عنصر أقل نشاطًا في مركّبه (حسب متسلسلة النشاط).', descEn: 'A more active element replaces a less active one in a compound (activity series).', sources: [0, 2, 5, 6] },
  double: { ar: 'إحلال مزدوج', en: 'Double displacement', form: 'AB + CD → AD + CB', descAr: 'يتبادل مركّبان أيونيان أيوناتهما، ويحدث تفاعل إذا تكوّن راسب أو غاز أو ماء.', descEn: 'Two ionic compounds swap ions; a reaction occurs if a precipitate, gas or water forms.', sources: [0, 3, 5] },
};

export const EXTRA_REAGENTS: WorkbenchReagent[] = [
  { id: 'NaCl', symbol: 'NaCl', nameEn: 'Sodium Chloride', nameAr: 'محلول كلوريد الصوديوم', formula: 'NaCl(aq)', category: 'salt', categoryAr: 'محلول ملح الطعام', stateAtRoomTemp: 'aqueous', colorHex: '#e2e8f0', descriptionAr: 'محلول ملح الطعام يكشف عن أيون الفضة بترسيب كلوريد الفضة', descriptionEn: 'Table-salt solution that precipitates silver chloride' },
  { id: 'KClO3', symbol: 'KClO₃', nameEn: 'Potassium Chlorate', nameAr: 'كلورات البوتاسيوم', formula: 'KClO₃(s)', category: 'compound', categoryAr: 'مركّب يتحلل حراريًا', stateAtRoomTemp: 'solid', colorHex: '#f1f5f9', descriptionAr: 'ملح أبيض يتحلل بالتسخين مع MnO₂ ويعطي الأكسجين', descriptionEn: 'White salt that releases oxygen when heated with MnO₂' },
];

type Fx = ChemicalReaction['visualEffect'];
interface Spec {
  id: string; type: ReactionTypeKey; reactants: string[]; eq: string;
  prodAr: string; prodEn: string; obsAr: string; obsEn: string;
  fx: Fx; liquid: string; heat?: boolean; ppt?: string; gas?: string; solid?: string;
  dT: number; enAr: string; enEn: string; saAr: string; saEn: string; whyAr: string; whyEn: string;
}

const CAT: Record<ReactionTypeKey, [string, string]> = {
  combination: ['الاتحاد المباشر', 'Direct Combination / Synthesis'],
  decomposition: ['الانحلال', 'Decomposition'],
  single: ['الإحلال البسيط', 'Single Displacement / Replacement'],
  double: ['الإحلال المزدوج والترسيب', 'Double Displacement / Precipitation'],
};

const rx = (s: Spec): ChemicalReaction => ({
  id: s.id,
  category: REACTION_TYPE_CATEGORY[s.type],
  categoryAr: CAT[s.type][0],
  categoryEn: CAT[s.type][1],
  reactants: s.reactants,
  requiresHeat: s.heat,
  equation: s.eq,
  equationAr: s.eq,
  typeEn: REACTION_TYPE_INFO[s.type].en,
  typeAr: REACTION_TYPE_INFO[s.type].ar,
  energyEn: s.enEn,
  energyAr: s.enAr,
  productsEn: s.prodEn,
  productsAr: s.prodAr,
  colorChangeEn: s.obsEn,
  colorChangeAr: s.obsAr,
  temperatureChange: s.dT,
  visualEffect: s.fx,
  liquidColor: s.liquid,
  precipitateColor: s.ppt,
  solidProduct: s.solid,
  gasReleased: s.gas,
  safetyHazardAr: s.saAr,
  safetyHazardEn: s.saEn,
  scientificExplanationAr: s.whyAr,
  scientificExplanationEn: s.whyEn,
});

const HOT = 'طارد للحرارة'; const HOT_EN = 'Exothermic';
const COLD = 'ماص للحرارة (يحتاج تسخينًا)'; const COLD_EN = 'Endothermic (needs heating)';
const MILD_AR = 'احتياطات المعمل العادية: نظارة وقفازات.'; const MILD_EN = 'Standard lab precautions: goggles and gloves.';

export const EXTRA_REACTIONS: ChemicalReaction[] = ([
  // ── Combination ──
  { id: 'x-syn-zn-s', type: 'combination', reactants: ['Zn', 'S'], eq: 'Zn(s) + S(s) → ZnS(s)', prodAr: 'كبريتيد الخارصين', prodEn: 'Zinc sulfide', obsAr: 'توهج ساطع ويتكوّن مسحوق أبيض مصفرّ.', obsEn: 'Bright glow; a pale-yellow white solid forms.', fx: 'orange_fire', liquid: '#fef9c3', heat: true, solid: 'ZnS', dT: 150, enAr: HOT, enEn: HOT_EN, saAr: 'يتصاعد أكسيد الكبريت إن وُجد هواء: اعمل تحت شفاط.', saEn: 'Sulfur oxides may form in air: work under a fume hood.', whyAr: 'يتحد عنصران مباشرة لتكوين مركّب واحد (ZnS).', whyEn: 'Two elements combine directly into a single compound (ZnS).' },
  { id: 'x-syn-al-o', type: 'combination', reactants: ['Al', 'O2'], eq: '4Al(s) + 3O₂(g) → 2Al₂O₃(s)', prodAr: 'أكسيد الألومنيوم', prodEn: 'Aluminium oxide', obsAr: 'وميض أبيض ويتكوّن مسحوق أبيض من Al₂O₃.', obsEn: 'White flash; white Al₂O₃ powder forms.', fx: 'bright_flash', liquid: '#f8fafc', heat: true, solid: 'Al₂O₃', dT: 200, enAr: HOT, enEn: HOT_EN, saAr: 'مسحوق الألومنيوم قابل للاشتعال: لا تقترب منه بلهب مكشوف.', saEn: 'Aluminium powder is flammable: keep away from open flame.', whyAr: 'الألومنيوم يتحد مع الأكسجين، والتسخين يكسر الطبقة الأكسيدية الواقية.', whyEn: 'Aluminium combines with oxygen; heating breaks through the protective oxide layer.' },
  { id: 'x-syn-cu-o', type: 'combination', reactants: ['Cu', 'O2'], eq: '2Cu(s) + O₂(g) → 2CuO(s)', prodAr: 'أكسيد النحاس II', prodEn: 'Copper(II) oxide', obsAr: 'يتحول النحاس الأحمر إلى طبقة سوداء من CuO.', obsEn: 'Red copper turns into a black CuO coating.', fx: 'none', liquid: '#1f2937', heat: true, solid: 'CuO', dT: 60, enAr: HOT, enEn: HOT_EN, saAr: MILD_AR, saEn: MILD_EN, whyAr: 'النحاس يتحد مع الأكسجين عند التسخين فيتكوّن أكسيد واحد.', whyEn: 'Copper combines with oxygen on heating to give a single oxide.' },
  { id: 'x-syn-h-cl', type: 'combination', reactants: ['H2', 'Cl2'], eq: 'H₂(g) + Cl₂(g) → 2HCl(g)', prodAr: 'غاز كلوريد الهيدروجين', prodEn: 'Hydrogen chloride gas', obsAr: 'يختفي اللون الأخضر المصفرّ للكلور.', obsEn: 'The yellow-green colour of chlorine fades.', fx: 'blue_flame', liquid: '#e0f2fe', gas: 'HCl', dT: 90, enAr: HOT, enEn: HOT_EN, saAr: 'الكلور غاز سام: اعمل تحت شفاط وبكميات صغيرة.', saEn: 'Chlorine is toxic: use a fume hood and small amounts.', whyAr: 'يتحد غازان في وجود الضوء أو الشرارة لتكوين مركّب واحد.', whyEn: 'Two gases combine, started by light or a spark, into one compound.' },
  // ── Decomposition ──
  { id: 'x-dec-caco3', type: 'decomposition', reactants: ['CaCO3'], eq: 'CaCO₃(s) → CaO(s) + CO₂(g)↑', prodAr: 'أكسيد الكالسيوم + ثاني أكسيد الكربون', prodEn: 'Calcium oxide + carbon dioxide', obsAr: 'يتصاعد CO₂ ويتبقى مسحوق أبيض من CaO.', obsEn: 'CO₂ is released and white CaO remains.', fx: 'effervescence_bubbles', liquid: '#f1f5f9', heat: true, solid: 'CaO', gas: 'CO₂', dT: 400, enAr: COLD, enEn: COLD_EN, saAr: 'CaO كاوٍ: لا تلمسه.', saEn: 'CaO is caustic: do not touch it.', whyAr: 'كربونات الفلز تنحل بالحرارة إلى أكسيد الفلز وCO₂.', whyEn: 'A metal carbonate breaks down on heating into a metal oxide and CO₂.' },
  { id: 'x-dec-kclo3', type: 'decomposition', reactants: ['KClO3'], eq: '2KClO₃(s) → 2KCl(s) + 3O₂(g)↑', prodAr: 'كلوريد البوتاسيوم + أكسجين', prodEn: 'Potassium chloride + oxygen', obsAr: 'يتصاعد الأكسجين بسرعة (يُنشّط الشظية المتوهجة).', obsEn: 'Oxygen evolves quickly (relights a glowing splint).', fx: 'effervescence_bubbles', liquid: '#f8fafc', heat: true, solid: 'KCl', gas: 'O₂', dT: 350, enAr: COLD, enEn: COLD_EN, saAr: 'مؤكسد قوي: أبعده عن المواد العضوية.', saEn: 'Strong oxidiser: keep away from organic matter.', whyAr: 'مركّب واحد ينكسر إلى ملح وغاز أكسجين، ويُسرّعه MnO₂ كعامل حفاز.', whyEn: 'One compound breaks into a salt and oxygen; MnO₂ speeds it up as a catalyst.' },
  { id: 'x-dec-h2o', type: 'decomposition', reactants: ['H2O'], eq: '2H₂O(l) → 2H₂(g)↑ + O₂(g)↑', prodAr: 'هيدروجين + أكسجين', prodEn: 'Hydrogen + oxygen', obsAr: 'فقاقيع: حجم الهيدروجين ضعف حجم الأكسجين.', obsEn: 'Bubbles: hydrogen volume is twice the oxygen volume.', fx: 'effervescence_bubbles', liquid: '#bae6fd', gas: 'H₂ + O₂', dT: 5, enAr: 'ماص للطاقة (تحليل كهربي)', enEn: 'Endothermic (electrolysis)', saAr: 'خليط H₂ وO₂ قابل للانفجار.', saEn: 'The H₂/O₂ mixture is explosive.', whyAr: 'الماء ينحل بالتيار الكهربي إلى عنصريه.', whyEn: 'Water is split into its elements by an electric current.' },
  // ── Single displacement ──
  { id: 'x-sr-fe-hcl', type: 'single', reactants: ['Fe', 'HCl'], eq: 'Fe(s) + 2HCl(aq) → FeCl₂(aq) + H₂(g)↑', prodAr: 'كلوريد الحديد II + هيدروجين', prodEn: 'Iron(II) chloride + hydrogen', obsAr: 'فقاقيع بطيئة ويتلوّن المحلول بالأخضر الباهت.', obsEn: 'Slow bubbles; solution turns pale green.', fx: 'effervescence_bubbles', liquid: '#bbf7d0', gas: 'H₂', dT: 8, enAr: HOT, enEn: HOT_EN, saAr: 'الهيدروجين قابل للاشتعال.', saEn: 'Hydrogen is flammable.', whyAr: 'الحديد أعلى من الهيدروجين في متسلسلة النشاط فيحلّ محله في الحمض.', whyEn: 'Iron is above hydrogen in the activity series, so it displaces H from the acid.' },
  { id: 'x-sr-al-hcl', type: 'single', reactants: ['Al', 'HCl'], eq: '2Al(s) + 6HCl(aq) → 2AlCl₃(aq) + 3H₂(g)↑', prodAr: 'كلوريد الألومنيوم + هيدروجين', prodEn: 'Aluminium chloride + hydrogen', obsAr: 'فقاقيع هيدروجين بعد زوال الطبقة الأكسيدية.', obsEn: 'Hydrogen bubbles once the oxide layer is gone.', fx: 'effervescence_bubbles', liquid: '#e2e8f0', gas: 'H₂', dT: 25, enAr: HOT, enEn: HOT_EN, saAr: 'الهيدروجين قابل للاشتعال.', saEn: 'Hydrogen is flammable.', whyAr: 'الألومنيوم أنشط من الهيدروجين فيحلّ محله.', whyEn: 'Aluminium is more active than hydrogen, so it replaces it.' },
  { id: 'x-sr-zn-h2so4', type: 'single', reactants: ['Zn', 'H2SO4'], eq: 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑', prodAr: 'كبريتات الخارصين + هيدروجين', prodEn: 'Zinc sulfate + hydrogen', obsAr: 'فقاقيع هيدروجين من سطح الخارصين.', obsEn: 'Hydrogen bubbles stream off the zinc.', fx: 'effervescence_bubbles', liquid: '#f1f5f9', gas: 'H₂', dT: 10, enAr: HOT, enEn: HOT_EN, saAr: 'استعمل الحمض مخففًا فقط.', saEn: 'Use dilute acid only.', whyAr: 'الخارصين أنشط من الهيدروجين فيحلّ محله في الحمض.', whyEn: 'Zinc is more active than hydrogen and displaces it from the acid.' },
  { id: 'x-sr-mg-cuso4', type: 'single', reactants: ['Mg', 'CuSO4'], eq: 'Mg(s) + CuSO₄(aq) → MgSO₄(aq) + Cu(s)↓', prodAr: 'كبريتات الماغنسيوم + نحاس', prodEn: 'Magnesium sulfate + copper', obsAr: 'يترسب نحاس أحمر ويبهت اللون الأزرق.', obsEn: 'Red copper deposits; the blue colour fades.', fx: 'precipitate_brown', liquid: '#e2e8f0', ppt: '#b45309', solid: 'Cu', dT: 12, enAr: HOT, enEn: HOT_EN, saAr: MILD_AR, saEn: MILD_EN, whyAr: 'الماغنسيوم أنشط من النحاس فيحلّ محله في محلول ملحه.', whyEn: 'Magnesium is more active than copper and displaces it from its salt solution.' },
  { id: 'x-sr-al-cuso4', type: 'single', reactants: ['Al', 'CuSO4'], eq: '2Al(s) + 3CuSO₄(aq) → Al₂(SO₄)₃(aq) + 3Cu(s)↓', prodAr: 'كبريتات الألومنيوم + نحاس', prodEn: 'Aluminium sulfate + copper', obsAr: 'راسب نحاسي ويبهت الأزرق تدريجيًا.', obsEn: 'Copper deposit; blue fades gradually.', fx: 'precipitate_brown', liquid: '#cbd5e1', ppt: '#b45309', solid: 'Cu', dT: 10, enAr: HOT, enEn: HOT_EN, saAr: MILD_AR, saEn: MILD_EN, whyAr: 'الألومنيوم أنشط من النحاس فيحلّ محله.', whyEn: 'Aluminium is more active than copper and replaces it.' },
  { id: 'x-sr-cl-ki', type: 'single', reactants: ['Cl2', 'KI'], eq: 'Cl₂(g) + 2KI(aq) → 2KCl(aq) + I₂(aq)', prodAr: 'كلوريد البوتاسيوم + يود', prodEn: 'Potassium chloride + iodine', obsAr: 'يتحول المحلول إلى اللون البني (يتحرر اليود).', obsEn: 'The solution turns brown (iodine is released).', fx: 'none', liquid: '#a16207', dT: 6, enAr: HOT, enEn: HOT_EN, saAr: 'الكلور سام: اعمل تحت شفاط.', saEn: 'Chlorine is toxic: use a fume hood.', whyAr: 'الكلور أنشط من اليود (لافلز يحل محل لافلز) فيطرد اليود من مركّبه.', whyEn: 'Chlorine is more reactive than iodine (a non-metal replaces a non-metal) and displaces it.' },
  // ── Double displacement ──
  { id: 'x-dr-agno3-nacl', type: 'double', reactants: ['AgNO3', 'NaCl'], eq: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)', prodAr: 'كلوريد الفضة (راسب) + نترات الصوديوم', prodEn: 'Silver chloride (precipitate) + sodium nitrate', obsAr: 'راسب أبيض متجبّن من AgCl.', obsEn: 'Curdy white AgCl precipitate.', fx: 'precipitate_white', liquid: '#f1f5f9', ppt: '#f8fafc', solid: 'AgCl', dT: 1, enAr: 'تغيّر حراري طفيف', enEn: 'Slight thermal change', saAr: 'نترات الفضة تُلوّن الجلد: استعمل قفازات.', saEn: 'Silver nitrate stains skin: wear gloves.', whyAr: 'تتبادل الأيونات ويتكوّن AgCl غير الذائب في الماء.', whyEn: 'Ions swap and insoluble AgCl forms.' },
  { id: 'x-dr-agno3-ki', type: 'double', reactants: ['AgNO3', 'KI'], eq: 'AgNO₃(aq) + KI(aq) → AgI(s)↓ + KNO₃(aq)', prodAr: 'يوديد الفضة (راسب) + نترات البوتاسيوم', prodEn: 'Silver iodide (precipitate) + potassium nitrate', obsAr: 'راسب أصفر باهت من AgI.', obsEn: 'Pale yellow AgI precipitate.', fx: 'precipitate_yellow', liquid: '#fef9c3', ppt: '#fde68a', solid: 'AgI', dT: 1, enAr: 'تغيّر حراري طفيف', enEn: 'Slight thermal change', saAr: 'نترات الفضة تُلوّن الجلد: استعمل قفازات.', saEn: 'Silver nitrate stains skin: wear gloves.', whyAr: 'تتبادل الأيونات ويترسب AgI غير الذائب.', whyEn: 'Ions swap and insoluble AgI precipitates.' },
  { id: 'x-dr-pbno3-na2so4', type: 'double', reactants: ['Pb_NO3_2', 'Na2SO4'], eq: 'Pb(NO₃)₂(aq) + Na₂SO₄(aq) → PbSO₄(s)↓ + 2NaNO₃(aq)', prodAr: 'كبريتات الرصاص (راسب) + نترات الصوديوم', prodEn: 'Lead sulfate (precipitate) + sodium nitrate', obsAr: 'راسب أبيض من PbSO₄.', obsEn: 'White PbSO₄ precipitate.', fx: 'precipitate_white', liquid: '#f1f5f9', ppt: '#f8fafc', solid: 'PbSO₄', dT: 1, enAr: 'تغيّر حراري طفيف', enEn: 'Slight thermal change', saAr: 'مركّبات الرصاص سامة: لا تُسكب في المصرف.', saEn: 'Lead compounds are toxic: do not pour down the drain.', whyAr: 'تتبادل الأيونات ويتكوّن PbSO₄ غير الذائب (من قواعد الذوبان).', whyEn: 'Ions swap and insoluble PbSO₄ forms (solubility rules).' },
] as Spec[]).map(rx);
