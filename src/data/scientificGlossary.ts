/**
 * SciNexa Centralized Scientific Terminology Glossary
 * Standardized across English, Arabic (Modern Standard Arabic - فصحى علمية دقيقة), French, and German.
 */

export interface GlossaryEntry {
  id: string;
  en: string;
  ar: string;
  fr: string;
  de: string;
  field: 'anatomy' | 'biology' | 'chemistry' | 'physics' | 'geology' | 'general';
  notes?: string;
}

export const SCIENTIFIC_GLOSSARY: GlossaryEntry[] = [
  // ANATOMY & PHYSIOLOGY
  { id: 'anatomy', en: 'Anatomy', ar: 'علم التشريح', fr: 'Anatomie', de: 'Anatomie', field: 'anatomy' },
  { id: 'structure', en: 'Anatomical Structure', ar: 'بِنية تشريحية', fr: 'Structure anatomique', de: 'Anatomische Struktur', field: 'anatomy' },
  { id: 'skeleton', en: 'Skeletal System', ar: 'الهيكل العظمي', fr: 'Système squelettique', de: 'Skelettsystem', field: 'anatomy' },
  { id: 'bone', en: 'Bone (Osseous Tissue)', ar: 'عظم (نسيج عظمي)', fr: 'Os', de: 'Knochen', field: 'anatomy' },
  { id: 'cartilage', en: 'Cartilage', ar: 'غضروف', fr: 'Cartilage', de: 'Knorpel', field: 'anatomy' },
  { id: 'ligament', en: 'Ligament', ar: 'رِباط مفصلي', fr: 'Ligament', de: 'Band (Ligament)', field: 'anatomy' },
  { id: 'tendon', en: 'Tendon', ar: 'وَتَر عضلي', fr: 'Tendon', de: 'Sehne', field: 'anatomy' },
  { id: 'skeletal_muscle', en: 'Skeletal Muscle', ar: 'عضلة هيكلية إرادية', fr: 'Muscle squelettique', de: 'Skelettmuskel', field: 'anatomy' },
  { id: 'muscular_system', en: 'Muscular System', ar: 'الجهاز العضلي', fr: 'Système musculaire', de: 'Muskelsystem', field: 'anatomy' },
  { id: 'cardiovascular_system', en: 'Cardiovascular System', ar: 'جهاز الدوران (القلب والأوعية الدموية)', fr: 'Système cardiovasculaire', de: 'Herz-Kreislauf-System', field: 'anatomy' },
  { id: 'nervous_system', en: 'Nervous System', ar: 'الجهاز العصبي', fr: 'Système nerveux', de: 'Nervensystem', field: 'anatomy' },
  { id: 'visceral_system', en: 'Visceral Organs', ar: 'الأعضاء الحشوية', fr: 'Organes viscéraux', de: 'Eingeweide', field: 'anatomy' },
  { id: 'lymphatic_system', en: 'Lymphatic System', ar: 'الجهاز اللمفاوي والمناعي', fr: 'Système lymphatique', de: 'Lymphsystem', field: 'anatomy' },
  { id: 'joint', en: 'Articular Joint', ar: 'مَفْصِل', fr: 'Articulation', de: 'Gelenk', field: 'anatomy' },
  { id: 'axial_skeleton', en: 'Axial Skeleton', ar: 'الهيكل المحوري', fr: 'Squelette axial', de: 'Axiales Skelett', field: 'anatomy' },
  { id: 'appendicular_skeleton', en: 'Appendicular Skeleton', ar: 'الهيكل الطرفي', fr: 'Squelette appendiculaire', de: 'Appendikuläres Skelett', field: 'anatomy' },
  { id: 'femur', en: 'Femur (Thigh Bone)', ar: 'عظم الفخذ', fr: 'Fémur', de: 'Oberschenkelknochen', field: 'anatomy' },
  { id: 'humerus', en: 'Humerus', ar: 'عظم العضد', fr: 'Humérus', de: 'Oberarmknochen', field: 'anatomy' },
  { id: 'cranium', en: 'Cranium (Skull)', ar: 'الجمجمة (القحف)', fr: 'Crâne', de: 'Schädel', field: 'anatomy' },
  { id: 'vertebral_column', en: 'Vertebral Column (Spine)', ar: 'العمود الفقري', fr: 'Colonne vertébrale', de: 'Wirbelsäule', field: 'anatomy' },

  // BIOLOGY & CYTOLOGY
  { id: 'cell', en: 'Cell', ar: 'خلية', fr: 'Cellule', de: 'Zelle', field: 'biology' },
  { id: 'cell_membrane', en: 'Plasma Membrane', ar: 'الغشاء الخلوي (البلازمي)', fr: 'Membrane plasmique', de: 'Zellmembran', field: 'biology' },
  { id: 'cytoplasm', en: 'Cytoplasm', ar: 'السيتوبلازم', fr: 'Cytoplasme', de: 'Zytoplasma', field: 'biology' },
  { id: 'nucleus', en: 'Nucleus', ar: 'النواة الخلوية', fr: 'Noyau cellulaire', de: 'Zellkern', field: 'biology' },
  { id: 'mitochondrion', en: 'Mitochondrion', ar: 'الميتوكوندريا (المتقدرة)', fr: 'Mitochondrie', de: 'Mitochondrium', field: 'biology' },
  { id: 'chloroplast', en: 'Chloroplast', ar: 'البلاستيدة الخضراء', fr: 'Chloroplaste', de: 'Chloroplast', field: 'biology' },
  { id: 'ribosome', en: 'Ribosome', ar: 'الريبوسوم', fr: 'Ribosome', de: 'Ribosom', field: 'biology' },
  { id: 'er', en: 'Endoplasmic Reticulum', ar: 'الشبكة الإندوبلازمية', fr: 'Réticulum endoplasmique', de: 'Endoplasmatisches Retikulum', field: 'biology' },
  { id: 'golgi', en: 'Golgi Apparatus', ar: 'جهاز غولجي', fr: 'Appareil de Golgi', de: 'Golgi-Apparat', field: 'biology' },
  { id: 'cell_wall', en: 'Cellulose Cell Wall', ar: 'الجدار الخلوي السليولوزي', fr: 'Paroi cellulaire', de: 'Zellwand', field: 'biology' },
  { id: 'dna', en: 'Deoxyribonucleic Acid (DNA)', ar: 'الحمض النووي الريبوزي منقوص الأكسجين (DNA)', fr: 'Acide désoxyribonucléique (ADN)', de: 'Desoxyribonukleinsäure (DNS)', field: 'biology' },
  { id: 'rna', en: 'Ribonucleic Acid (RNA)', ar: 'الحمض النووي الريبوزي (RNA)', fr: 'Acide ribonucléique (ARN)', de: 'Ribonukleinsäure (RNS)', field: 'biology' },
  { id: 'base_pairing', en: 'Complementary Base Pairing', ar: 'ازدواج القواعد النيتروجينية المتكاملة', fr: 'Appariement des bases complémentaires', de: 'Komplementäre Basenpaarung', field: 'biology' },
  { id: 'atp', en: 'Adenosine Triphosphate (ATP)', ar: 'أدينوسين ثلاثي الفوسفات (ATP)', fr: 'Adénosine triphosphate (ATP)', de: 'Adenosintriphosphat (ATP)', field: 'biology' },

  // CHEMISTRY
  { id: 'periodic_table', en: 'Periodic Table of Elements', ar: 'الجدول الدوري للعناصر', fr: 'Tableau périodique des éléments', de: 'Periodensystem der Elemente', field: 'chemistry' },
  { id: 'atomic_number', en: 'Atomic Number (Z)', ar: 'العدد الذري (Z)', fr: 'Numéro atomique (Z)', de: 'Ordnungszahl (Z)', field: 'chemistry' },
  { id: 'atomic_mass', en: 'Standard Atomic Weight', ar: 'الكتلة الذرية القياسية', fr: 'Masse atomique standard', de: 'Standardatomgewicht', field: 'chemistry' },
  { id: 'electron_config', en: 'Electron Configuration', ar: 'التوزيع الإلكتروني', fr: 'Configuration électronique', de: 'Elektronenkonfiguration', field: 'chemistry' },
  { id: 'electronegativity', en: 'Electronegativity (Pauling)', ar: 'السالبية الكهربائية (مقياس باولنج)', fr: 'Électronégativité', de: 'Elektronegativität', field: 'chemistry' },
  { id: 'chemical_bond', en: 'Chemical Bond', ar: 'رابطة كيميائية', fr: 'Liaison chimique', de: 'Chemische Bindung', field: 'chemistry' },
  { id: 'molecule', en: 'Molecule', ar: 'جزيء', fr: 'Molécule', de: 'Molekül', field: 'chemistry' },
  { id: 'conformer', en: 'Molecular Conformer (3D)', ar: 'المتطابق الجزيئي ثلاثي الأبعاد', fr: 'Conformère moléculaire', de: 'Molekülkonformation', field: 'chemistry' },

  // PHYSICS
  { id: 'electric_current', en: 'Electric Current (I)', ar: 'شدة التيار الكهربائي (I)', fr: 'Courant électrique (I)', de: 'Elektrische Stromstärke (I)', field: 'physics' },
  { id: 'voltage', en: 'Voltage / Potential Difference (V)', ar: 'فرق الجهد الكهربائي (V)', fr: 'Tension électrique (V)', de: 'Elektrische Spannung (V)', field: 'physics' },
  { id: 'resistance', en: 'Electrical Resistance (R)', ar: 'المقاومة الكهربائية (R)', fr: 'Résistance électrique (R)', de: 'Elektrischer Widerstand (R)', field: 'physics' },
  { id: 'electric_power', en: 'Electric Power (P)', ar: 'القدرة الكهربائية (P)', fr: 'Puissance électrique (P)', de: 'Elektrische Leistung (P)', field: 'physics' },
  { id: 'circuit_node', en: 'Circuit Node', ar: 'عقدة كهربائية', fr: 'Nœud de circuit', de: 'Schaltungsknoten', field: 'physics' },
  { id: 'ground_node', en: 'Ground Reference Node', ar: 'العقدة المرجعية (التأريض)', fr: 'Nœud de référence (Masse)', de: 'Referenzknoten (Masse)', field: 'physics' },
  { id: 'mna_solver', en: 'Modified Nodal Analysis (MNA)', ar: 'التحليل العُقَدي المُعَدَّل (MNA)', fr: 'Analyse nodale modifiée (MNA)', de: 'Modifizierte Knotenpunktsanalyse (MNA)', field: 'physics' },
  { id: 'kinematics', en: 'Kinematics', ar: 'علم الحركة المجردة (الكينماتيكا)', fr: 'Cinématique', de: 'Kinematik', field: 'physics' },
  { id: 'velocity', en: 'Velocity', ar: 'السرعة المتجهة', fr: 'Vitesse vectorielle', de: 'Vektorgeschwindigkeit', field: 'physics', notes: 'Distinguished from scalar speed (السرعة القياسية)' },
  { id: 'speed', en: 'Speed', ar: 'السرعة القياسية', fr: 'Vitesse scalaire', de: 'Skalare Geschwindigkeit', field: 'physics' },
  { id: 'acceleration', en: 'Acceleration', ar: 'التسارع', fr: 'Accélération', de: 'Beschleunigung', field: 'physics' },
  { id: 'displacement', en: 'Displacement', ar: 'الإزاحة', fr: 'Déplacement', de: 'Verschiebung', field: 'physics' },
  { id: 'projectile_motion', en: 'Projectile Motion', ar: 'حركة المقذوفات في مجال الجاذبية', fr: 'Mouvement de projectile', de: 'Wurfbewegung', field: 'physics' },
  { id: 'refraction', en: 'Optical Refraction', ar: 'انكسار الضوء', fr: 'Réfraction optique', de: 'Lichtbrechung', field: 'physics' },
  { id: 'refractive_index', en: 'Refractive Index', ar: 'معامل الانكسار', fr: 'Indice de réfraction', de: 'Brechungsindex', field: 'physics' },
  { id: 'critical_angle', en: 'Critical Angle', ar: 'الزاوية الحرجة', fr: 'Angle critique', de: 'Grenzwinkel', field: 'physics' },

  // GEOLOGY & GEOPHYSICS
  { id: 'crust', en: 'Earth Crust', ar: 'القشرة الأرضية', fr: 'Croûte terrestre', de: 'Erdkruste', field: 'geology' },
  { id: 'mantle', en: 'Mantle', ar: 'الوشاح الصخري', fr: 'Manteau terrestre', de: 'Erdmantel', field: 'geology' },
  { id: 'outer_core', en: 'Outer Core', ar: 'اللب الخارجي السائل', fr: 'Noyau externe liquide', de: 'Äußerer Erdkern', field: 'geology' },
  { id: 'inner_core', en: 'Inner Core', ar: 'اللب الداخلي (الصلب)', fr: 'Noyau interne solide', de: 'Innerer Erdkern', field: 'geology' },
  { id: 'earthquake_magnitude', en: 'Earthquake Magnitude (Moment)', ar: 'مقدار الزلزال (الطاقة المنطلقة)', fr: 'Magnitude du séisme', de: 'Erdbebenmagnitude', field: 'geology', notes: 'Distinguished from local felt intensity (شدة تأثير الزلزال)' },
  { id: 'earthquake_intensity', en: 'Earthquake Intensity (Mercalli)', ar: 'شدة تأثير الزلزال (الميداني)', fr: 'Intensité sismique', de: 'Erdbebenintensität', field: 'geology' },
  { id: 'epicenter', en: 'Epicenter', ar: 'المركز السطحي للزلزال', fr: 'Épicentre', de: 'Epizentrum', field: 'geology' },
  { id: 'hypocenter', en: 'Hypocenter (Focal Depth)', ar: 'بؤرة الزلزال (العمق البؤري)', fr: 'Hypocentre (foyer)', de: 'Hypozentrum (Erdbebenherd)', field: 'geology' },
  { id: 'p_wave', en: 'Primary Wave (P-wave)', ar: 'الموجة الزلزالية الأولية (P - تضاغطية)', fr: 'Onde primaire (P)', de: 'Primärwelle (P-Welle)', field: 'geology' },
  { id: 's_wave', en: 'Secondary Wave (S-wave)', ar: 'الموجة الزلزالية الثانوية (S - قصّية)', fr: 'Onde secondaire (S)', de: 'Sekundärwelle (S-Welle)', field: 'geology' },
  { id: 'tsunami', en: 'Tsunami Long Waves', ar: 'موجات تسونامي البحرية الطويلة', fr: 'Tsunami (ondes longues)', de: 'Tsunami-Langwellen', field: 'geology' },
  { id: 'base_isolation', en: 'Base Isolation', ar: 'عزل القواعد الزلزالي', fr: 'Isolation parasismique à la base', de: 'Basisisolierung', field: 'geology' },
];

export function getGlossaryTerm(id: string): GlossaryEntry | undefined {
  return SCIENTIFIC_GLOSSARY.find(term => term.id === id);
}

