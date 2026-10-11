export interface AnatomyAtlasModel {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  system: string;
  systemAr: string;
  category: 'cell' | 'organ' | 'system' | 'tissue';
  thumbnail: string;
  author: string;
  descriptionEn: string;
  descriptionAr: string;
  sketchfabUid: string;
  keywords: string[];
}

export const SKETCHFAB_ANATOMY_COLLECTION: AnatomyAtlasModel[] = [
  {
    id: 'animal-cell',
    slug: 'animal-cell-3a90e22871004d92a020c54e8964938c',
    sketchfabUid: '3a90e22871004d92a020c54e8964938c',
    titleEn: 'Animal Cell Ultrastructure',
    titleAr: 'المجسم الحقيقي للخلية الحيوانية ومحتوياتها',
    system: 'Cytology & Cell Biology',
    systemAr: 'علم الأحياء الخلوية وعلم الخلية',
    category: 'cell',
    thumbnail: 'https://media.sketchfab.com/models/3a90e22871004d92a020c54e8964938c/thumbnails/9aed1b0e4eef4233929fdef8d110cda5/blob.jpeg',
    author: 'Gaia Tech',
    descriptionEn: 'High-definition 3D animal cell cutaway displaying nucleus, mitochondria, rough & smooth ER, Golgi apparatus, lysosomes, ribosomes, and plasma membrane.',
    descriptionAr: 'مقطع تشريحي دقيق عالي الدقة للخلية الحيوانية يوضح النواة، الميتوكوندريا، الشبكة الإندوبلازمية الخشنة والملساء، جهاز غولجي، الليسوسومات، وغشاء الخلية.',
    keywords: ['cell', 'animal cell', 'nucleus', 'mitochondria', 'organelle', 'خلية', 'نواة', 'ميتوكوندريا']
  },
  {
    id: 'human-heart-animated',
    slug: 'human-heart-3d-animated-911272d9f7c146bea5403d1e4d2dfb31',
    sketchfabUid: '911272d9f7c146bea5403d1e4d2dfb31',
    titleEn: 'Human Heart (Animated Cardiac Cycle)',
    titleAr: 'قلب الإنسان ثلاثي الأبعاد (نبض وانقباض حي)',
    system: 'Cardiovascular System',
    systemAr: 'الجهاز الدوري والقلب',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/911272d9f7c146bea5403d1e4d2dfb31/thumbnails/026d2ee181144075b2dae8fafa983bfa/70f27a8b5fa9428db3bf418300514a1d.jpeg',
    author: 'Ebers',
    descriptionEn: 'Full 3D anatomical model of the beating human heart with coronary arteries, atria, ventricles, aorta, and cardiac valves in coordinated systolic pumping.',
    descriptionAr: 'مجسم تشريحي ثلاثي الأبعاد لقلب الإنسان ينبض حياً، موضحاً الشرايين التاجية، الأذينين، البطينين، والشريان الأورطي مع الصمامات القلبية أثناء الانقباض والانبساط.',
    keywords: ['heart', 'cardiac', 'ventricle', 'atrium', 'aorta', 'قلب', 'بطين', 'أذين', 'أورطي']
  },
  {
    id: 'stomach-cross-section',
    slug: 'stomach-cross-section-40147c529bdb42c7a2fca1fbd6529a89',
    sketchfabUid: '40147c529bdb42c7a2fca1fbd6529a89',
    titleEn: 'Stomach Cross-Section & Gastric Rugae',
    titleAr: 'مقطع تشريحي ثلاثي الأبعاد للمعدة والجدار المعدي',
    system: 'Gastrointestinal & Digestive',
    systemAr: 'الجهاز الهضمي والمعدة',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/40147c529bdb42c7a2fca1fbd6529a89/thumbnails/71f1d00fee1748ff8014b506229ec6b8/4f2ad506d1a64f51aaa1e1afb0aef00f.jpeg',
    author: 'Ebers',
    descriptionEn: 'Detailed anatomical coronal cutaway of the stomach showing gastric mucosa, rugae folds, fundus, body, pyloric sphincter, and muscular layers (longitudinal, circular, oblique).',
    descriptionAr: 'مقطع تشريحي دقيق للمعدة يوضح الغشاء المخاطي المعدي، الثنيات المعدية (Rugae)، قاع المعدة، العاصرة البوابية، وطبقات العضلات الطولية والدائرية والمائلة.',
    keywords: ['stomach', 'gastric', 'pylorus', 'digestive', 'معدة', 'جهاز هضمي', 'بواب']
  },
  {
    id: 'brain-and-nuclei',
    slug: 'the-brain-and-brain-nuclei-a96c9e7b98b248959eac004f7b206387',
    sketchfabUid: 'a96c9e7b98b248959eac004f7b206387',
    titleEn: 'Human Brain & Deep Brain Nuclei',
    titleAr: 'الدماغ البشري والنوى العصبية العميقة',
    system: 'Nervous System & Neuroanatomy',
    systemAr: 'الجهاز العصبي وعلم الأعصاب',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/a96c9e7b98b248959eac004f7b206387/thumbnails/5fc159672d6647099015783eb0ea1ee0/c76c10d176ac4d608c4a3757f26af06b.jpeg',
    author: 'Ebers',
    descriptionEn: 'Cerebral hemispheres, cerebellum, thalamus, basal ganglia, brainstem, and ventricular fluid cavities rendered in high anatomical detail.',
    descriptionAr: 'نصفا الكرتين المخيتين، المخيخ، المهاد، العقد القاعدية، وجذع الدماغ مع البطينات الدماغية بدقة تشريحية طبية متناهية.',
    keywords: ['brain', 'cerebrum', 'cerebellum', 'thalamus', 'مخ', 'دماغ', 'مخيخ', 'أعصاب']
  },
  {
    id: 'cranial-nerves',
    slug: 'cranial-nerves-and-brain-stem-2792c4a8600b4984960c5caf949feb4d',
    sketchfabUid: '2792c4a8600b4984960c5caf949feb4d',
    titleEn: 'Cranial Nerves & Brainstem',
    titleAr: 'الأعصاب القحفية الاثنا عشر وجذع الدماغ',
    system: 'Nervous System & Neuroanatomy',
    systemAr: 'الجهاز العصبي والأعصاب القحفية',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/2792c4a8600b4984960c5caf949feb4d/thumbnails/bfcd2ec2f59944b5ad0fca2e89aad1dc/6557370b8df444d48862d72b4b2a48fd.jpeg',
    author: 'Ebers',
    descriptionEn: 'The 12 pairs of cranial nerves emerging from the midbrain, pons, and medulla oblongata, illustrating motor and sensory peripheral pathways.',
    descriptionAr: 'أزواج الأعصاب القحفية الاثنا عشر الخارجة من الدماغ المتوسط، الجسر، والنخاع المستطيل، موضحاً المسارات الحركية والحسية.',
    keywords: ['cranial nerves', 'brainstem', 'pons', 'medulla', 'أعصاب قحفية', 'جذع الدماغ']
  },
  {
    id: 'gastrointestinal-tract',
    slug: 'gastrointestinal-tract-8c4c69035f4f4773813533d7ca56e516',
    sketchfabUid: '8c4c69035f4f4773813533d7ca56e516',
    titleEn: 'Complete Gastrointestinal Tract',
    titleAr: 'القناة الهضمية المتكاملة والأحشاء',
    system: 'Digestive System',
    systemAr: 'الجهاز الهضمي والأمعاء',
    category: 'system',
    thumbnail: 'https://media.sketchfab.com/models/8c4c69035f4f4773813533d7ca56e516/thumbnails/d00e60e12688486eae3e7c766f441299/f88fa021a6fa4f29aa707e6b1f8b9a6f.jpeg',
    author: 'Ebers',
    descriptionEn: 'Full digestive tract model showing esophagus, stomach, duodenum, jejunum, ileum, colon, cecum, appendix, and rectum with mesenteric vessels.',
    descriptionAr: 'مجسم كامل للجهاز الهضمي يشمل المريء، المعدة، الاثني عشر، الصائم، اللفائفي، القولون الصاعد والمستعرض والهابط، والزائدة الدودية.',
    keywords: ['digestive', 'intestine', 'colon', 'gut', 'أمعاء', 'قولون', 'معدة', 'هضم']
  },
  {
    id: 'human-eye',
    slug: 'human-eye-photorealistic-225b58ebf0c84d6a9e2bc1e17cfbb167',
    sketchfabUid: '225b58ebf0c84d6a9e2bc1e17cfbb167',
    titleEn: 'Human Eye & Optic Anatomy',
    titleAr: 'عين الإنسان وتشريح الجهاز البصري',
    system: 'Sensory Organs & Vision',
    systemAr: 'الأعضاء الحسية وحاسة الإبصار',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/225b58ebf0c84d6a9e2bc1e17cfbb167/thumbnails/7b00353285824c12bba707b4de436b69/4b3725c09b0f41e08c872eae00e586b3.jpeg',
    author: 'Cesar Salcedo CG',
    descriptionEn: 'Photorealistic eye anatomy detailing cornea, iris, pupil, crystalline lens, vitreous body, retina, sclera, choroid, and optic nerve.',
    descriptionAr: 'تشريح مجسم فائق الدقة للعين يوضح القرنية، القزحية، بؤبؤ العين، العدسة البلورية، الجسم الزجاجي، الشبكية، والعصب البصري.',
    keywords: ['eye', 'vision', 'retina', 'cornea', 'optic', 'عين', 'بصر', 'شبكية', 'قرنية']
  },
  {
    id: 'endocrine-system',
    slug: 'endocrine-system-95a189613e624dc69c89ae6b263fbd93',
    sketchfabUid: '95a189613e624dc69c89ae6b263fbd93',
    titleEn: 'Endocrine Glandular System',
    titleAr: 'جهاز الغدد الصماء والهرمونات',
    system: 'Endocrine System',
    systemAr: 'جهاز الغدد الصماء',
    category: 'system',
    thumbnail: 'https://media.sketchfab.com/models/95a189613e624dc69c89ae6b263fbd93/thumbnails/fd2e49facc4b410ba4a36a504956a452/blob.jpeg',
    author: 'NGX',
    descriptionEn: 'Spatial distribution of major human endocrine glands: pituitary, thyroid, parathyroid, adrenals, pancreas, ovaries/testes.',
    descriptionAr: 'توزيع الغدد الصماء في جسم الإنسان: الغدة النخامية، الدرقية، جارات الدرقية، الكظرية فوق الكلوية، البنكرياس والغدد التناسلية.',
    keywords: ['endocrine', 'glands', 'thyroid', 'pituitary', 'adrenal', 'غدد', 'هرمونات', 'درقية']
  },
  {
    id: 'lymph-node',
    slug: 'lymph-node-a57d37d551bc4fa0a246c881e3d1e14e',
    sketchfabUid: 'a57d37d551bc4fa0a246c881e3d1e14e',
    titleEn: 'Lymph Node Cross-Section',
    titleAr: 'العقدة اللمفاوية والجهاز المناعي',
    system: 'Lymphatic & Immune System',
    systemAr: 'الجهاز اللمفاوي والمناعي',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/a57d37d551bc4fa0a246c881e3d1e14e/thumbnails/6226b2f34e004f65851f1c88198b45d6/837209b686d84763b19b9147dcb29f4b.jpeg',
    author: 'sarastewartwork',
    descriptionEn: 'Internal cortex, medulla, trabeculae, afferent and efferent lymphatic vessels with germinal center immune zones.',
    descriptionAr: 'القشرة الداخلية، النخاع، الترابيق، والأوعية اللمفاوية الصادرة والواردة مع مراكز تكاثر الخلايا المناعية اللمفية.',
    keywords: ['lymph', 'immune', 'lymph node', 'عقدة لمفاوية', 'مناعة']
  },
  {
    id: 'muscle-tissue',
    slug: 'muscle-tissue-5a7a63e0c48f4851a6e82599b2682d2c',
    sketchfabUid: '5a7a63e0c48f4851a6e82599b2682d2c',
    titleEn: 'Skeletal Muscle Tissue & Fascicle',
    titleAr: 'النسيج العضلي الهيكلي والألياف العضلية',
    system: 'Muscular System & Histology',
    systemAr: 'الجهاز العضلي وعلم الأنسجة',
    category: 'tissue',
    thumbnail: 'https://media.sketchfab.com/models/5a7a63e0c48f4851a6e82599b2682d2c/thumbnails/277321ef243b4578b2e6dde33f613c46/29ec6c03a503408598a5c463b0c2846b.jpeg',
    author: 'Clacydarch',
    descriptionEn: 'Microscopic organization of skeletal muscle: epimysium, perimysium, fascicles, muscle fibers, endomysium, and sarcomeres.',
    descriptionAr: 'التركيب المجهري للعضلة الهيكلية: غلاف العضلة الخارجي، الحزم العضلية، الألياف الفردية، وخيوط الأكتين والميوسين المنقبضة.',
    keywords: ['muscle', 'tissue', 'sarcomere', 'fascicle', 'عضلات', 'نسيج عضلي', 'ألياف']
  },
  {
    id: 'dna-double-helix',
    slug: 'dna-3aafb51201ab414b86d231a1ee4c32a8',
    sketchfabUid: '3aafb51201ab414b86d231a1ee4c32a8',
    titleEn: 'DNA Molecular Double Helix',
    titleAr: 'الحمض النووي DNA والتركيب الجزيئي',
    system: 'Molecular Genetics & Cytology',
    systemAr: 'الوراثة الجزيئية والجينات',
    category: 'cell',
    thumbnail: 'https://media.sketchfab.com/models/3aafb51201ab414b86d231a1ee4c32a8/thumbnails/f874429d23e84dfaaad9398b80a8064b/720x405.jpeg',
    author: 'iqcenter',
    descriptionEn: 'Full atomic and ribbon representation of B-DNA showing adenine, thymine, cytosine, guanine, and sugar-phosphate backbone.',
    descriptionAr: 'نموذج جزيئي ثلاثي الأبعاد للحمض النووي يوضح القواعد النيتروجينية A-T و C-G مع هيكل السكر والفوسفات.',
    keywords: ['dna', 'genetics', 'double helix', 'وراثة', 'حمض نووي', 'جين']
  },
  {
    id: 'tooth-morphology',
    slug: 'adult-tooth-morphology-e4d36352db5e414ca1d734845375308b',
    sketchfabUid: 'e4d36352db5e414ca1d734845375308b',
    titleEn: 'Adult Molar Tooth Morphology',
    titleAr: 'تشريح الضرس البشري وطبقات السن',
    system: 'Oral & Dental Anatomy',
    systemAr: 'تشريح الفم والأسنان',
    category: 'organ',
    thumbnail: 'https://media.sketchfab.com/models/e4d36352db5e414ca1d734845375308b/thumbnails/e34c5f1243584da68b4027c7b0509025/blob.jpeg',
    author: 'ushefdentistry',
    descriptionEn: 'Cross-section of human molar displaying enamel, dentin, pulp chamber, root canals, cementum, and periodontal ligament.',
    descriptionAr: 'مقطع تشريحي لضرس الإنسان يوضح طبقة المينا، العاج، حجرة اللب، قنوات الجذور، والملاط السني.',
    keywords: ['tooth', 'molar', 'dental', 'enamel', 'سن', 'ضرس', 'مينا']
  }
];
