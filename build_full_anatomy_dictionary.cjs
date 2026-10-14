const fs = require('fs');

const dictPath = 'src/data/skeletalBoneDictionary.json';
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// 1. Brain & Neuroanatomy dictionary entries matching Excel Sheet 6 + Z-Anatomy nodes
const brainAndNerveEntries = {
  // Primary Brain Divisions (from Excel)
  "Brain": {
    "ar": "الدماغ",
    "descEn": "Control center of the body, sensory processing, cognition, and emotion.",
    "descAr": "مركز التحكم الرئيسي في الجسم، ومعالجة المدخلات الحسية، والتفكير والذاكرة."
  },
  "Cerebrum": {
    "ar": "المخ",
    "descEn": "Thinking, memory, executive planning, and voluntary motor movement.",
    "descAr": "مركز التفكير والذاكرة والحركة الإرادية ومعالجة الوظائف المعرفية العليا."
  },
  "Cerebellum": {
    "ar": "المخيخ",
    "descEn": "Balance, equilibrium, posture, and fine motor coordination.",
    "descAr": "تنظيم التوازن والتنسيق الحركي الدقيق والحفاظ على وضعية واستقرار الجسم."
  },
  "Brainstem": {
    "ar": "جذع الدماغ",
    "descEn": "Regulates vital autonomous functions: breathing, heart rate, and blood pressure.",
    "descAr": "تنظيم الوظائف الحيوية اللاإرادية كالتنفس وضغط الدم ونبض القلب وحركات البلع."
  },
  "Spinal cord": {
    "ar": "النخاع الشوكي",
    "descEn": "Transmits nerve signals bidirectionally between the brain and peripheral body.",
    "descAr": "نقل الإشارات العصبية الحسية والحركية ثنائية الاتجاه بين الدماغ وسائر أجزاء الجسم."
  },
  "Spinal dura": {
    "ar": "الأم الجافية النخاعية",
    "descEn": "Tough protective outer fibrous membrane enclosing the spinal cord and CSF.",
    "descAr": "الغشاء الليفي الخارجي المتين الذي يحيط بالنخاع الشوكي والسائل الدماغي الشوكي لحمايته داخل القناة الفقرية."
  },
  "Spinal dura mater": {
    "ar": "الأم الجافية النخاعية",
    "descEn": "Tough protective outer fibrous membrane enclosing the spinal cord and CSF.",
    "descAr": "الغشاء الليفي الخارجي المتين الذي يحيط بالنخاع الشوكي والسائل الدماغي الشوكي لحمايته داخل القناة الفقرية."
  },
  "Medulla oblongata": {
    "ar": "النخاع المستطيل (جذع الدماغ)",
    "descEn": "Lower half of brainstem containing cardiac, respiratory, vomiting, and vasomotor centers.",
    "descAr": "الجزء السفلي من جذع الدماغ، يحوي مراكز التنفس وضغط الدم والقلب ومنعكسات القيء والسعال."
  },
  "Pons": {
    "ar": "الجسر (جذع الدماغ)",
    "descEn": "Part of brainstem relaying signals between cerebrum and cerebellum; regulates sleep and breathing.",
    "descAr": "جزء من جذع الدماغ ينقل الإشارات بين المخ والمخيخ، وينظم دورات النوم وإيقاع التنفس."
  },
  "Midbrain": {
    "ar": "الدماغ المتوسط (جذع الدماغ)",
    "descEn": "Associated with vision, hearing, motor control, alertness, and temperature regulation.",
    "descAr": "جزء من جذع الدماغ مسؤول عن المنعكسات البصرية والسمعية والتحكم الحركي واليقظة."
  },
  "Thalamus": {
    "ar": "المهاد (الثلاموس)",
    "descEn": "Major sensory relay hub routing incoming sensory information to the cerebral cortex.",
    "descAr": "محطة الترحيل الرئيسية للإشارات الحسية وإعادة توجيهها نحو القشرة المخية المناسبة."
  },
  "Hypothalamus": {
    "ar": "تحت المهاد (الهيبوثلاموس)",
    "descEn": "Coordinates the autonomic nervous system, endocrine activity via pituitary, and homeostasis.",
    "descAr": "مركز ضبط التوازن الداخلي، وحرارة الجسم، والعطش، والجوع، والتحكم في الغدة النخامية."
  },
  "Corpus callosum": {
    "ar": "الجسم الثفني",
    "descEn": "Broad, thick nerve fiber tract facilitating interhemispheric communication.",
    "descAr": "حزمة عصبية سميكة تربط نصفي الكرة المخية وتتيح التواصل والتنسيق الفوري بينهما."
  },
  "Hippocampus": {
    "ar": "الحصين (قرن آمون)",
    "descEn": "Crucial structure for the consolidation of short-term memory into long-term memory.",
    "descAr": "بنية عصبية محورية لتحويل الذاكرة قصيرة المدى إلى ذاكرة طويلة المدى والملاحة المكانية."
  },
  "Amygdaloid body": {
    "ar": "اللوزة العصبية (الأميجدالا)",
    "descEn": "Integrative center for emotions, emotional behavior, fear response, and motivation.",
    "descAr": "المركز العصبي لمعالجة المشاعر والانفعالات كاستجابة الخوف والقلق والذاكرة العاطفية."
  },
  "Fourth ventricle": {
    "ar": "البطين الرابع للدماغ",
    "descEn": "CSF-filled cavity located posterior to pons and medulla and anterior to cerebellum.",
    "descAr": "تجويف مملوء بالسائل الدماغي الشوكي يقع بين جذع الدماغ والمخيخ ويسهم في حماية الجهاز العصبي."
  },
  "Third ventricle": {
    "ar": "البطين الثالث للدماغ",
    "descEn": "Median narrow cleft between the two thalami filled with cerebrospinal fluid.",
    "descAr": "شق بطيني يتوسط نصفي المهاد ويجري عبره السائل الدماغي الشوكي لامتصاص الصدمات."
  },
  "Lateral ventricle": {
    "ar": "البطين الجانبي للدماغ",
    "descEn": "C-shaped paired CSF-filled cavities located deep inside each cerebral hemisphere.",
    "descAr": "زوج من التجاويف الدماغية الكبيرة ينتج السائل الدماغي الشوكي عبر الضفيرة المشيمية."
  },
  "Aqueduct of midbrain": {
    "ar": "مسال الدماغ المتوسط (مسال سيلفيوس)",
    "descEn": "Channel connecting the third and fourth ventricles for CSF passage.",
    "descAr": "قناة ضيقة داخل الدماغ المتوسط تنقل السائل الشوكي من البطين الثالث إلى البطين الرابع."
  },
  "Optic chiasm": {
    "ar": "التصالب البصري",
    "descEn": "X-shaped space where the two optic nerves partially cross their medial retinal fibers.",
    "descAr": "منطقة تقاطع ألياف العصبين البصريين تتيح الرؤية المجسمة ثلاثية الأبعاد ودمج المجالين البصريين."
  },
  "Optic tract": {
    "ar": "السبيل البصري",
    "descEn": "Continuation of the optic nerve carrying visual fibers to lateral geniculate nucleus.",
    "descAr": "امتداد الألياف العصبية البصرية من التصالب البصري إلى النواة الركبية الوحشية بالمهاد."
  },
  "Olive": {
    "ar": "الزيتونة (النخاع المستطيل)",
    "descEn": "Prominent oval mass on the anterior surface of medulla involved in cerebellar motor learning.",
    "descAr": "بروز بيضاوي على النخاع المستطيل يسهم في معالجة الإشارات السمعية والتعلم الحركي الدقيق."
  },
  "Pyramid of medulla oblongata": {
    "ar": "هرم النخاع المستطيل",
    "descEn": "Paired white matter structures containing the corticospinal motor tracts.",
    "descAr": "بنية هرمية مزدوجة بالنخاع المستطيل تعبرها السبيل الهرمي الحركي المسؤولة عن الحركة الإرادية."
  },
  "Superior colliculus": {
    "ar": "الأكيمة العلوية (الدماغ المتوسط)",
    "descEn": "Layered midbrain structure directing visual attention and saccadic eye movements.",
    "descAr": "بنية بسقف الدماغ المتوسط مسؤولة عن توجيه الانتباه البصري وحركات العين الانعكاسية السريعة."
  },
  "Inferior colliculus": {
    "ar": "الأكيمة السفلية (الدماغ المتوسط)",
    "descEn": "Principal midbrain nucleus of the auditory pathway integrating sound location.",
    "descAr": "مركز رئيسي في المسار السمعي بالدماغ المتوسط يدمج الإشارات السمعية لتحديد موقع الصوت."
  },
  "Red nucleus": {
    "ar": "النواة الحمراء",
    "descEn": "Midbrain motor nucleus coordinating motor tone and locomotion.",
    "descAr": "نواة حركية بالدماغ المتوسط غنية بالحديد تشارك في تنسيق الحركات الحركية العضلية والوضعية."
  },
  "Caudate nucleus": {
    "ar": "النواة المذنبة (العقد القاعدية)",
    "descEn": "C-shaped basal ganglia component essential for goal-directed action and motor planning.",
    "descAr": "جزء من العقد القاعدية بالدماغ يسهم في التخطيط الحركي والتعلم والذاكرة الإجرائية."
  },
  "Putamen": {
    "ar": "اللقمة (العقد القاعدية)",
    "descEn": "Round basal ganglia structure involved in motor control and reinforcement learning.",
    "descAr": "نواة قاعدية كبيرة تسهم في تنظيم مهارات الحركة وتثبيط الحركات غير المرغوبة."
  },
  "Globus pallidus": {
    "ar": "الكرة الشاحبة (العقد القاعدية)",
    "descEn": "Subcortical structure acting as major output regulator of the basal ganglia system.",
    "descAr": "منظم رئيسي للمخرجات الحركية من العقد القاعدية إلى المهاد لتنعيم الحركة الإرادية."
  },
  "Precentral gyrus": {
    "ar": "التلفيف أمام المركزي (القشرة الحركية)",
    "descEn": "Primary motor cortex controlling voluntary somatic movements of the body.",
    "descAr": "القشرة الحركية الأولية المسؤولة عن إصدار الأوامر العصبية للحركات الإرادية لكافة عضلات الجسم."
  },
  "Postcentral gyrus": {
    "ar": "التلفيف خلف المركزي (القشرة الحسية)",
    "descEn": "Primary somatosensory cortex receiving touch, proprioception, pain, and temperature.",
    "descAr": "القشرة الحسية الأولية التي تستقبل وتفسر أحاسيس اللمس والحرارة والألم وموضع الجسم."
  },
  "Superior frontal gyrus": {
    "ar": "التلفيف الجبهي العلوي",
    "descEn": "Frontal lobe cortex involved in working memory, executive function, and motor planning.",
    "descAr": "تلفيف في الفص الجبهي يشارك في الذاكرة العاملة والوظائف التنفيذية والتخطيط المعرفي."
  },
  "Middle frontal gyrus": {
    "ar": "التلفيف الجبهي الأوسط",
    "descEn": "Cortex involved in attention networks, literacy, and calculation.",
    "descAr": "تلفيف جبهي يسهم في شبكات الانتباه والتركيز والعمليات الحسابية الذهنية."
  },
  "Inferior frontal gyrus": {
    "ar": "التلفيف الجبهي السفلي (منطقة بروكا)",
    "descEn": "Houses Broca's area on the dominant hemisphere, vital for speech production.",
    "descAr": "يحوي باحة بروكا المسؤولة عن النطق وتشكيل الكلمات والتعبير اللغوي."
  },
  "Superior temporal gyrus": {
    "ar": "التلفيف الصدغي العلوي (منطقة فيرنيكه)",
    "descEn": "Primary auditory cortex and Wernicke's area, critical for auditory processing and speech comprehension.",
    "descAr": "يحوي القشرة السمعية الأولية وباحة فيرنيكه المسؤولة عن فهم وإدراك الكلام المسموع."
  },
  "Cingulate gyrus": {
    "ar": "التلفيف الحزامي",
    "descEn": "Limbic cortex involved in emotion formation and processing, learning, and memory.",
    "descAr": "تلفيف ضمن الجهاز النطاقي يربط العواطف بالاستجابات الحركية واتخاذ القرارات."
  },
  "Insula": {
    "ar": "الفص الجزيري (الجزيرة)",
    "descEn": "Deep cerebral cortex regulating interoception, self-awareness, and taste.",
    "descAr": "قشرة مخية عميقة مسؤولة عن الإدراك الحسي الجسدي الداخلي، وحاسة التذوق والوعي الذاتي."
  },

  // Cranial Nerves
  "Olfactory nerve": {
    "ar": "العصب الشمي (العصب القحفي I)",
    "descEn": "Sensory nerve transmitting smell sensations from the nasal cavity to the brain.",
    "descAr": "العصب القحفي الأول، ينقل إشارات حاسة الشم من التجويف الأنفي إلى الدماغ."
  },
  "Optic nerve": {
    "ar": "العصب البصري (العصب القحفي II)",
    "descEn": "Sensory nerve transmitting visual information from the retina to the brain.",
    "descAr": "العصب القحفي الثاني، ينقل الإشارات البصرية من شبكية العين إلى القشرة البصرية."
  },
  "Oculomotor nerve": {
    "ar": "العصب محرك العين (العصب القحفي III)",
    "descEn": "Controls majority of extraocular eye muscles, pupil constriction, and lens accommodation.",
    "descAr": "العصب القحفي الثالث، يتحكم بمعظم عضلات العين وتضييق بؤبؤ العين وتكيف العدسة."
  },
  "Trochlear nerve": {
    "ar": "العصب البكري (العصب القحفي IV)",
    "descEn": "Innervates superior oblique muscle, controlling downward and outward eye motion.",
    "descAr": "العصب القحفي الرابع، يغذي العضلة المائلة العلوية لتحريك العين للأسفل والخارج."
  },
  "Trigeminal nerve": {
    "ar": "العصب ثلاثي التوائم (العصب القحفي V)",
    "descEn": "Major sensory nerve of the face and motor supply to muscles of mastication.",
    "descAr": "العصب القحفي الخامس، المسؤول عن الإحساس في الوجه والتحكم الحركي بعضلات المضغ."
  },
  "Abducens nerve": {
    "ar": "العصب المبعد (العصب القحفي VI)",
    "descEn": "Innervates lateral rectus muscle, turning the eye laterally outward.",
    "descAr": "العصب القحفي السادس، يحرك العين جانبياً للخارج عبر العضلة المستقيمة الوحشية."
  },
  "Facial nerve": {
    "ar": "العصب الوجهي (العصب القحفي VII)",
    "descEn": "Controls muscles of facial expression, taste on anterior 2/3 of tongue, and salivary glands.",
    "descAr": "العصب القحفي السابع، يتحكم بتعابير الوجه والتذوق في ثلثي اللسان الأماميين والغدد اللعابية."
  },
  "Vestibulocochlear nerve": {
    "ar": "العصب الدهليزي القوقعي (العصب القحفي VIII)",
    "descEn": "Responsible for hearing and body balance/equilibrium.",
    "descAr": "العصب القحفي الثامن، مسؤول عن حاسة السمع وتوازن الجسم والتسارع الزاوي."
  },
  "Glossopharyngeal nerve": {
    "ar": "العصب البلعومي اللساني (العصب القحفي IX)",
    "descEn": "Sensory and taste for posterior tongue, swallowing, and carotid body monitoring.",
    "descAr": "العصب القحفي التاسع، مسؤول عن التذوق بالثلث الخلفي للسان والمساعدة في البلع."
  },
  "Vagus nerve": {
    "ar": "العصب الحائر / المبهم (العصب القحفي X)",
    "descEn": "Major parasympathetic nerve regulating heart rate, digestive tract, and vocal cords.",
    "descAr": "العصب القحفي العاشر، العصب نظير الودي الرئيسي الذي يبطئ نبضات القلب وينظم الهضم."
  },
  "Accessory nerve": {
    "ar": "العصب الإضافي (العصب القحفي XI)",
    "descEn": "Motor innervation to sternocleidomastoid and trapezius muscles.",
    "descAr": "العصب القحفي الحادي عشر، يغذي العضلة القصية الترقوية والعضلة شبه المنحرفة لرفع الكتف وإدارة الرأس."
  },
  "Hypoglossal nerve": {
    "ar": "العصب تحت اللساني (العصب القحفي XII)",
    "descEn": "Motor innervation to intrinsic and extrinsic muscles of the tongue.",
    "descAr": "العصب القحفي الثاني عشر، يتحكم بكافة الحركات الحركية للسان أثناء الكلام والبلع."
  },

  // Ecorche and Tendons
  "Achilles tendon": {
    "ar": "وتر أخيل (العرقوب)",
    "descEn": "Strongest tendon connecting calf muscles to calcaneus, crucial for walking and jumping.",
    "descAr": "أقوى أوتار الجسم يربط عضلات الساق الخلفية بعظم العقب، وهو ضروري للمشي والقفز والجري."
  },
  "Patellar tendon": {
    "ar": "الوتر الرضفي",
    "descEn": "Connects quadriceps and patella to tibial tuberosity to extend the leg.",
    "descAr": "وتر سميك يربط عظمة الرضفة بحديبة عظم الظنبوب لينقل قوة عضلات الفخذ لفرد الساق."
  },
  "Plantar fascia": {
    "ar": "السفاق الأخمصي (اللفافة الأخمصية)",
    "descEn": "Thick connective tissue supporting the longitudinal arch of the foot.",
    "descAr": "نسيج ضام ليفي سميك يدعم قوس القدم الطولي ويمتص الصدمات أثناء الوقوف والمشي."
  },
  "Linea alba": {
    "ar": "الخط الأبيض للبطن",
    "descEn": "Fibrous structure running down the midline of the abdomen between rectus abdominis muscles.",
    "descAr": "شريط ليفي يمتد في منتصف البطن بين العضلتين المستقيمتين البطنيتين ويثبت جدار البطن."
  }
};

// Merge into dictionary
let addedCount = 0;
for (const [key, val] of Object.entries(brainAndNerveEntries)) {
  dict[key] = val;
  // Also register lateralized variants if applicable
  dict[`${key} _L`] = { ar: `${val.ar} الأيسر`, descEn: val.descEn, descAr: val.descAr };
  dict[`${key} _R`] = { ar: `${val.ar} الأيمن`, descEn: val.descEn, descAr: val.descAr };
  dict[`${key}.l`] = { ar: `${val.ar} الأيسر`, descEn: val.descEn, descAr: val.descAr };
  dict[`${key}.r`] = { ar: `${val.ar} الأيمن`, descEn: val.descEn, descAr: val.descAr };
  addedCount++;
}

fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), 'utf8');
console.log(`Successfully added ${addedCount} brain/nerve master entries. Total entries now: ${Object.keys(dict).length}`);
