export type Language = 'en' | 'ar' | 'fr' | 'de';

export interface Translations {
  appName: string;
  appTagline: string;
  appDescription: string;
  nav: {
    home: string;
    anatomy: string;
    biology: string;
    physics: string;
    chemistry: string;
    geology: string;
    classroom: string;
    searchPlaceholder: string;
  };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    exploreModules: string;
    openClassroom: string;
    statsMeshes: string;
    statsMeshesLabel: string;
    statsSimulations: string;
    statsSimulationsLabel: string;
    statsLanguages: string;
    statsLanguagesLabel: string;
  };
  features: {
    sectionTitle: string;
    sectionSubtitle: string;
    anatomyTitle: string;
    anatomyDesc: string;
    physicsTitle: string;
    physicsDesc: string;
    chemistryTitle: string;
    chemistryDesc: string;
    geologyTitle: string;
    geologyDesc: string;
    biologyTitle: string;
    biologyDesc: string;
    classroomTitle: string;
    classroomDesc: string;
    launch: string;
  };
  egyptLocation: {
    title: string;
    detectedGovernorate: string;
    selectAdministration: string;
    note: string;
    change: string;
    save: string;
    selectPrompt: string;
  };
  classroom: {
    title: string;
    subtitle: string;
    exitPresentation: string;
    prevStep: string;
    nextStep: string;
    fullscreen: string;
    step: string;
    of: string;
    quickTools: string;
    selectModule: string;
  };
  anatomy: {
    title: string;
    badge: string;
    searchPlaceholder: string;
    viewAngle: string;
    front: string;
    back: string;
    left: string;
    right: string;
    resetCamera: string;
    xrayMode: string;
    isolate: string;
    showAll: string;
    takeScreenshot: string;
    structuresList: string;
    organDetails: string;
    system: string;
    fmaId: string;
    latinName: string;
    description: string;
    layers: string;
    bones: string;
    muscles: string;
    organs: string;
    vessels: string;
    nerves: string;
    quizMode: string;
    quizQuestion: string;
    score: string;
  };
  physics: {
    title: string;
    subtitle: string;
    mechanics: string;
    waves: string;
    circuits: string;
    optics: string;
    thermo: string;
    play: string;
    pause: string;
    reset: string;
    step: string;
    mass: string;
    velocity: string;
    gravity: string;
    angle: string;
    frequency: string;
    amplitude: string;
    voltage: string;
    resistance: string;
    current: string;
    power: string;
    refractiveIndex: string;
    lawExplanation: string;
    formula: string;
    liveReadings: string;
  };
  chemistry: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    alkaliMetal: string;
    alkalineEarth: string;
    transitionMetal: string;
    postTransition: string;
    metalloid: string;
    nonmetal: string;
    nobleGas: string;
    lanthanide: string;
    actinide: string;
    atomicNumber: string;
    atomicMass: string;
    electronConfig: string;
    electronegativity: string;
    group: string;
    period: string;
    summary: string;
    modelDisclaimer: string;
    reactionSim: string;
  };
  geology: {
    title: string;
    subtitle: string;
    earthLayers: string;
    crust: string;
    mantle: string;
    outerCore: string;
    innerCore: string;
    depth: string;
    temperature: string;
    composition: string;
    tectonics: string;
    earthquakes: string;
    volcanoes: string;
    rockCycle: string;
    simulateEvent: string;
  };
  biology: {
    title: string;
    subtitle: string;
    cellModel: string;
    plantCell: string;
    animalCell: string;
    dnaGenetics: string;
    photosynthesis: string;
    circulation: string;
    respiration: string;
    digestive: string;
    nervous: string;
    organelleDetails: string;
    function: string;
  };
  quiz: {
    quizTitle: string;
    question: string;
    correct: string;
    incorrect: string;
    nextQuestion: string;
    completed: string;
    finalScore: string;
    restart: string;
  };
  footer: {
    tagline: string;
    sources: string;
    credits: string;
    license: string;
    disclaimer: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "SciNexa",
    appTagline: "Interactive Science Learning Platform & Virtual Laboratory",
    appDescription: "Empowering STEM learners with high-fidelity 3D anatomical models, real-time physics simulations, and comprehensive scientific laboratories.",
    nav: {
      home: "Home",
      anatomy: "Human Anatomy",
      biology: "Biology Lab",
      physics: "Physics Lab",
      chemistry: "Periodic Table",
      geology: "Earth Science",
      classroom: "Classroom Mode",
      searchPlaceholder: "Search concepts, simulations, elements...",
    },
    hero: {
      badge: "National Science Competition Edition",
      title: "Interactive Scientific Discovery",
      titleAccent: "Without Physical Boundaries",
      subtitle: "Bridging the gap between theory and experimental discovery. Explore over 10 million anatomical triangles, interactive mechanics, chemical reaction dynamics, and geological models.",
      exploreModules: "Explore Labs",
      openClassroom: "Classroom Mode",
      statsMeshes: "2,821+",
      statsMeshesLabel: "Anatomical Structures",
      statsSimulations: "15+",
      statsSimulationsLabel: "Interactive Simulations",
      statsLanguages: "4",
      statsLanguagesLabel: "Full Languages (AR/EN/FR/DE)",
    },
    features: {
      sectionTitle: "Interactive Scientific Disciplines",
      sectionSubtitle: "Engineered for high school & university level inquiry with parameter manipulation and real-time visualization.",
      anatomyTitle: "Flagship 3D Human Anatomy",
      anatomyDesc: "High-resolution anatomical atlas based on Z-Anatomy & BodyParts3D with 10M+ triangles, layer filtering, X-ray mode, and structure dissection.",
      physicsTitle: "Real-time Physics Laboratory",
      physicsDesc: "Interactive mechanics, projectile trajectory, wave harmonics, DC electric circuits (Ohm's & Kirchhoff's laws), and Snell's optical refraction.",
      chemistryTitle: "Interactive Periodic Table & Reactions",
      chemistryDesc: "Complete 118-element periodic explorer with electron configuration Bohr approximations, periodic trends, and reaction stoichiometry.",
      geologyTitle: "Earth & Planetary Geophysics",
      geologyDesc: "Explorable 3D Earth cross-section, crust-to-core thermal gradients, plate tectonics, seismic wave propagation, and the rock cycle.",
      biologyTitle: "Cellular Biology & Human Systems",
      biologyDesc: "Interactive 3D plant and animal cell organelles, DNA double-helix genetics, photosynthesis Calvin cycle, and physiological systems.",
      classroomTitle: "Classroom & Projector Mode",
      classroomDesc: "Full-screen optimized presentation view for interactive whiteboards and school projectors with high-contrast guided steps.",
      launch: "Launch Module",
    },
    egyptLocation: {
      title: "Egyptian Educational Administration Suggestions",
      detectedGovernorate: "Suggested Governorate",
      selectAdministration: "Educational Administration (الإدارة التعليمية)",
      note: "Based on approximate geographic location. You can select your administration manually at any time.",
      change: "Change Location",
      save: "Save Preference",
      selectPrompt: "Select an Educational Administration...",
    },
    classroom: {
      title: "Classroom Presentation Mode",
      subtitle: "Optimized for smartboards, whiteboards, and classroom projectors.",
      exitPresentation: "Exit Presentation Mode",
      prevStep: "Previous Step",
      nextStep: "Next Step",
      fullscreen: "Toggle Fullscreen",
      step: "Step",
      of: "of",
      quickTools: "Classroom Quick Controls",
      selectModule: "Select Presentation Module",
    },
    anatomy: {
      title: "Human Anatomy 3D Atlas",
      badge: "Z-Anatomy & BodyParts3D Engine",
      searchPlaceholder: "Search bone, muscle, organ, nerve...",
      viewAngle: "Standard Projections",
      front: "Anterior (Front)",
      back: "Posterior (Back)",
      left: "Lateral Left",
      right: "Lateral Right",
      resetCamera: "Reset View",
      xrayMode: "X-Ray Mode",
      isolate: "Isolate Structure",
      showAll: "Show All Layers",
      takeScreenshot: "Export View Image",
      structuresList: "Anatomical Hierarchy",
      organDetails: "Specimen Inspection",
      system: "Body System",
      fmaId: "FMA Identifier",
      latinName: "Terminologia Anatomica (Latin)",
      description: "Anatomical & Functional Description",
      layers: "System Filters",
      bones: "Skeletal System",
      muscles: "Muscular System",
      organs: "Visceral Organs",
      vessels: "Cardiovascular System",
      nerves: "Nervous System",
      quizMode: "Anatomy Identification Quiz",
      quizQuestion: "Identify the following structure:",
      score: "Score",
    },
    physics: {
      title: "Physics Virtual Simulation Lab",
      subtitle: "Calculated with exact equations of motion, electrodynamics, and optics.",
      mechanics: "Classical Mechanics",
      waves: "Wave Harmonics",
      circuits: "Electric Circuits",
      optics: "Geometric Optics",
      thermo: "Thermodynamics",
      play: "Start Simulation",
      pause: "Pause",
      reset: "Reset Parameters",
      step: "Single Step",
      mass: "Mass (m)",
      velocity: "Initial Velocity (v₀)",
      gravity: "Gravitational Acceleration (g)",
      angle: "Launch Angle (θ)",
      frequency: "Frequency (f)",
      amplitude: "Amplitude (A)",
      voltage: "Voltage Source (V)",
      resistance: "Load Resistance (R)",
      current: "Calculated Current (I)",
      power: "Power Dissipation (P)",
      refractiveIndex: "Index of Refraction (n₂)",
      lawExplanation: "Governing Law & Physical Formulation",
      formula: "Mathematical Model",
      liveReadings: "Real-time Telemetry & Data",
    },
    chemistry: {
      title: "Interactive Periodic Table of Elements",
      subtitle: "Accurate physical and chemical properties for all 118 chemical elements.",
      searchPlaceholder: "Search by element name, symbol, or atomic number...",
      allCategories: "All Element Families",
      alkaliMetal: "Alkali Metals",
      alkalineEarth: "Alkaline Earth Metals",
      transitionMetal: "Transition Metals",
      postTransition: "Post-transition Metals",
      metalloid: "Metalloids",
      nonmetal: "Reactive Nonmetals",
      nobleGas: "Noble Gases",
      lanthanide: "Lanthanides",
      actinide: "Actinides",
      atomicNumber: "Atomic Number",
      atomicMass: "Standard Atomic Weight",
      electronConfig: "Electron Configuration",
      electronegativity: "Pauling Electronegativity",
      group: "IUPAC Group",
      period: "Period",
      summary: "Overview & Occurrence",
      modelDisclaimer: "Electron orbit diagrams are educational Bohr representations, not literal quantum electron clouds.",
      reactionSim: "Educational Reaction Demonstrator",
    },
    geology: {
      title: "Geology & Planetary Earth Science",
      subtitle: "Investigate internal layers, tectonic boundaries, seismic waves, and rock petrology.",
      earthLayers: "Internal Geosphere Strata",
      crust: "Lithospheric Crust",
      mantle: "Silicate Mantle",
      outerCore: "Liquid Iron Outer Core",
      innerCore: "Solid Nickel-Iron Inner Core",
      depth: "Depth Boundary",
      temperature: "Estimated Temperature",
      composition: "Dominant Chemical Composition",
      tectonics: "Plate Tectonics & Faulting",
      earthquakes: "Seismic P & S Wave Dynamics",
      volcanoes: "Magma Dynamics & Volcanism",
      rockCycle: "Igneous, Sedimentary & Metamorphic Cycle",
      simulateEvent: "Simulate Geological Event",
    },
    biology: {
      title: "Biological Sciences Laboratory",
      subtitle: "Interactive cytological ultrastructure, molecular genetics, and physiology.",
      cellModel: "Interactive 3D Cytology",
      plantCell: "Plant Cell (Autotrophic)",
      animalCell: "Animal Cell (Heterotrophic)",
      dnaGenetics: "DNA Double Helix & Base Pairing",
      photosynthesis: "Light Reactions & Calvin Cycle",
      circulation: "Systemic & Pulmonary Circulation",
      respiration: "Alveolar Gas Exchange",
      digestive: "Gastrointestinal Tract",
      nervous: "Synaptic Transmission",
      organelleDetails: "Organelle Inspection",
      function: "Biological Function & Synthesis",
    },
    quiz: {
      quizTitle: "Knowledge Check Quiz",
      question: "Question",
      correct: "Correct Answer!",
      incorrect: "Incorrect. Let's review why:",
      nextQuestion: "Next Question",
      completed: "Assessment Completed!",
      finalScore: "Your Final Score:",
      restart: "Retake Quiz",
    },
    footer: {
      tagline: "SciNexa Science Education Platform — Built for accessible, world-class experimental inquiry.",
      sources: "Scientific Sources & Citations: Z-Anatomy Project, BodyParts3D (DBCLS), IUPAC Periodic Data, USGS Geophysics.",
      credits: "Asset Attribution: BodyParts3D © The Database Center for Life Science (CC BY 4.0), Z-Anatomy (CC BY-SA 4.0).",
      license: "Application Software: MIT License.",
      disclaimer: "Educational simulations simplify complex physical dynamics for pedagogical clarity.",
    },
  },

  ar: {
    appName: "SciNexa — ساي نكسا",
    appTagline: "منصة العلوم التفاعلية والمختبر الافتراضي الذكي",
    appDescription: "تمكين طلاب العلوم والتكنولوجيا من خلال نماذج تشريحية متقدمة ثلاثية الأبعاد، ومحاكاة فيزيائية حية، ومختبرات علمية متكاملة.",
    nav: {
      home: "الرئيسية",
      anatomy: "تشريح جسم الإنسان",
      biology: "مختبر الأحياء",
      physics: "مختبر الفيزياء",
      chemistry: "الجدول الدوري",
      geology: "علوم الأرض والجيولوجيا",
      classroom: "وضع الفصل الذكي",
      searchPlaceholder: "ابحث عن مفاهيم، تجارب، عناصر كيميائية...",
    },
    hero: {
      badge: "منصة العلوم والبحث العلمي المتطورة",
      title: "استكشاف علمي تفاعلي",
      titleAccent: "بلا حدود مادية",
      subtitle: "سد الفجوة بين الدروس النظرية والتجربة المعملية الحية. استكشف أكثر من 10 ملايين مضلع ثلاثي الأبعاد لتشريح الإنسان، ومحاكاة ميكانيكية دقيقة، وتفاعلات كيميائية، وجيولوجيا كوكب الأرض.",
      exploreModules: "استكشف المختبرات",
      openClassroom: "عرض الفصل الذكي",
      statsMeshes: "+2,821",
      statsMeshesLabel: "بنية تشريحية مصنفة",
      statsSimulations: "+15",
      statsSimulationsLabel: "محاكاة فيزيائية تفاعلية",
      statsLanguages: "4",
      statsLanguagesLabel: "لغات مع دعم كامل للعربية (RTL)",
    },
    features: {
      sectionTitle: "التخصصات العلمية التفاعلية",
      sectionSubtitle: "مصممة للبحث والاستقصاء العلمي المدرسي والجامعي مع تحكم كامل بالمتغيرات والملاحظة الفورية.",
      anatomyTitle: "أطلس التشريح البشري ثلاثي الأبعاد",
      anatomyDesc: "أطلس طبي عالي الدقة مبني على بيانات Z-Anatomy و BodyParts3D بأكثر من 10 ملايين مضلع مع الأشعة السينية والتشريح الطبقي.",
      physicsTitle: "مختبر الفيزياء التفاعلي المتزامن",
      physicsDesc: "محاكاة حركة المقذوفات، والتوافقيات الموجية، والدوائر الكهربائية وقانون أوم وكيرشوف، وانكسار الضوء عبر العدسات.",
      chemistryTitle: "الجدول الدوري التفاعلي والتفاعلات",
      chemistryDesc: "مستكشف كامل لـ 118 عنصراً كيميائياً مع مدارات بوهر التقريبية، والخواص الدورية، ومحاكاة المعادلات الكيميائية.",
      geologyTitle: "علوم الأرض والجيوفيزياء الكوكبية",
      geologyDesc: "مقطع عرضي تفاعلي للكرة الأرضية من القشرة إلى اللب، وحركة الصفائح التكتونية، والموجات الزلزالية ودورة الصخور.",
      biologyTitle: "علم الأحياء الخلوي ووظائف الأعضاء",
      biologyDesc: "عضيات الخلية النباتية والحيوانية ثلاثية الأبعاد، والشريط الوراثي DNA، ومسار البناء الضوئي، والأجهزة الحيوية للإنسان.",
      classroomTitle: "وضع الفصل والشاشات الذكية",
      classroomDesc: "شاشة كاملة مخصصة للشاشات التفاعلية وأجهزة العرض المدرسية مع خطوط واضحة وخطوات تعليمية إرشادية.",
      launch: "تشغيل المختبر",
    },
    egyptLocation: {
      title: "اقتراحات الإدارات التعليمية بجمهورية مصر العربية",
      detectedGovernorate: "المحافظة المقترحة",
      selectAdministration: "الإدارة التعليمية التابعة",
      note: "التقدير بناءً على الموقع الجغرافي التقريبي. يمكنك تحديد إدارتك التعليمية يدوياً في أي وقت.",
      change: "تعديل المحافظة",
      save: "حفظ الاختيار",
      selectPrompt: "اختر الإدارة التعليمية...",
    },
    classroom: {
      title: "وضع العرض والشاشات الذكية للفصول",
      subtitle: "مصمم خصيصاً لأجهزة العرض والسبورات الذكية في المدارس والمعارض العلمية.",
      exitPresentation: "الخروج من وضع الفصل",
      prevStep: "الخطوة السابقة",
      nextStep: "الخطوة التالية",
      fullscreen: "ملء الشاشة",
      step: "خطوة",
      of: "من",
      quickTools: "أدوات التحكم السريع",
      selectModule: "اختر وحدة العرض",
    },
    anatomy: {
      title: "أطلس التشريح البشري التفاعلي",
      badge: "محرك Z-Anatomy و BodyParts3D",
      searchPlaceholder: "ابحث عن عظم، عضلة، عضو، عصب...",
      viewAngle: "المساقط التشريحية القياسية",
      front: "أمامي (Anterior)",
      back: "خلفي (Posterior)",
      left: "جانبي أيسر",
      right: "جانبي أيمن",
      resetCamera: "إعادة ضبط الكاميرا",
      xrayMode: "وضع الأشعة السينية (X-Ray)",
      isolate: "عزل البنية المحددة",
      showAll: "إظهار كافة الطبقات",
      takeScreenshot: "تصدير صورة المشهد",
      structuresList: "التسلسل الهرمي للتركيب",
      organDetails: "فحص العينة المحددة",
      system: "الجهاز الحيوي",
      fmaId: "رمز التعريف الطبي (FMA)",
      latinName: "المصطلح اللاتيني الدقيق",
      description: "الوصف التشريحي والوظيفي",
      layers: "طبقات الأجهزة",
      bones: "الهيكل العظمي",
      muscles: "الجهاز العضلي",
      organs: "الأحشاء والأعضاء الداخلية",
      vessels: "الأوعية الدموية والقلب",
      nerves: "الجهاز العصبي",
      quizMode: "اختبار التعرف على الأعضاء",
      quizQuestion: "حدد البنية التشريحية التالية في النموذج:",
      score: "الدرجة",
    },
    physics: {
      title: "مختبر محاكاة الفيزياء العملية",
      subtitle: "حسابات رقمية متوافقة لحظياً مع القوانين الفيزيائية المعتمدة.",
      mechanics: "الميكانيكا الكلاسيكية",
      waves: "الأمواج والترددات",
      circuits: "الدوائر الكهربائية",
      optics: "البصريات والانكسار",
      thermo: "الديناميكا الحرارية",
      play: "بدء المحاكاة",
      pause: "إيقاف مؤقت",
      reset: "إعادة الضبط",
      step: "خطوة زمنية واحدة",
      mass: "الكتلة (كجم)",
      velocity: "السرعة الابتدائية (م/ث)",
      gravity: "تسارع الجاذبية (م/ث²)",
      angle: "زاوية الإطلاق (درجة)",
      frequency: "التردد (هرتز)",
      amplitude: "السعة الموجية (م)",
      voltage: "فرق الجهد الكهربائي (فولت)",
      resistance: "المقاومة الكهربائية (أوم)",
      current: "التيار المحسوب (أمبير)",
      power: "القدرة المستهلكة (وات)",
      refractiveIndex: "معامل الانكسار (n₂)",
      lawExplanation: "القانون الفيزيائي الحاكم",
      formula: "المعادلة الرياضية",
      liveReadings: "القراءات والبيانات اللحظية",
    },
    chemistry: {
      title: "الجدول الدوري للعناصر الكيميائية",
      subtitle: "بيانات موثوقة وشاملة لكافة الـ 118 عنصراً وفق معايير IUPAC.",
      searchPlaceholder: "ابحث بالاسم العربي، الرمز، أو العدد الذري...",
      allCategories: "كافة عائلات العناصر",
      alkaliMetal: "الفلزات القلوية",
      alkalineEarth: "الفلزات القلوية الترابية",
      transitionMetal: "الفلزات الانتقالية",
      postTransition: "فلزات ما بعد الانتقال",
      metalloid: "أشباه الفلزات",
      nonmetal: "اللافلزات النشطة",
      nobleGas: "الغازات النبيلة",
      lanthanide: "اللانثانيدات",
      actinide: "الأكتينيدات",
      atomicNumber: "العدد الذري",
      atomicMass: "الكتلة الذرية النسبية",
      electronConfig: "التوزيع الإلكتروني",
      electronegativity: "السالبية الكهربية (باولنج)",
      group: "المجموعة",
      period: "الدورة",
      summary: "نبذة واستخدامات العنصر",
      modelDisclaimer: "مخطط المدارات يمثل نموذج بوهر التوضيحي للتعليم ولا يمثل السحابة الإلكترونية الكمية الحرفية.",
      reactionSim: "محاكي التفاعلات التعليمي",
    },
    geology: {
      title: "علوم الأرض والجيولوجيا الكوكبية",
      subtitle: "استكشف طبقات الأرض الداخلية، والنشاط التكتوني، والزلازل والبراكين.",
      earthLayers: "طبقات الأرض الداخلية",
      crust: "القشرة الأرضية (Lithosphere)",
      mantle: "الوشاح الصخري (Mantle)",
      outerCore: "اللب الخارجي السائل",
      innerCore: "اللب الداخلي الصلب",
      depth: "العمق",
      temperature: "درجة الحرارة التقريبية",
      composition: "التركيب الكيميائي السائد",
      tectonics: "الصفائح التكتونية والصدوع",
      earthquakes: "ديناميكية الموجات الزلزالية P و S",
      volcanoes: "حركة الماغما والنشاط البركاني",
      rockCycle: "دورة الصخور النارية والرسوبية والمتحولة",
      simulateEvent: "محاكاة حدث جيولوجي",
    },
    biology: {
      title: "مختبر العلوم الحيوية والخلية",
      subtitle: "دراسة تفاعلية للعضيات الخلوية، وعلم الوراثة، والأجهزة الحيوية.",
      cellModel: "الخلية ثلاثية الأبعاد",
      plantCell: "خلية نباتية (ذاتية التغذية)",
      animalCell: "خلية حيوانية",
      dnaGenetics: "الحمض النووي DNA واقتران القواعد",
      photosynthesis: "البناء الضوئي وحلقة كالفن",
      circulation: "الدورة الدموية الصغرى والكبرى",
      respiration: "تبادل الغازات في الحويصلات الرئوية",
      digestive: "الجهاز الهضمي والامتصاص",
      nervous: "نقل الإشارات العصبية المشبكية",
      organelleDetails: "فحص العضية الخلوية",
      function: "الوظيفة الحيوية والتخليق",
    },
    quiz: {
      quizTitle: "اختبار التحقق من الفهم العلمي",
      question: "السؤال",
      correct: "إجابة صحيحة وممتازة!",
      incorrect: "إجابة غير صحيحة. دعنا نستعرض السبب العلمي:",
      nextQuestion: "السؤال التالي",
      completed: "اكتمل الاختبار بنجاح!",
      finalScore: "النتيجة النهائية:",
      restart: "إعادة الاختبار",
    },
    footer: {
      tagline: "منصة آيسف للعلوم — صممت لتمكين التعلم العلمي الاستقصائي والتطبيقي مجاناً.",
      sources: "المصادر والمراجع العلمية: مشروع Z-Anatomy، وBodyParts3D (DBCLS)، والاتحاد الدولي للكيمياء IUPAC، وهيئة المسح الجيولوجي الأمريكية USGS.",
      credits: "نسب الأصول البرمجية والنماذج: BodyParts3D بموجب CC BY 4.0، وZ-Anatomy بموجب CC BY-SA 4.0.",
      license: "ترخيص البرنامج: رخصة MIT مفتوحة المصدر.",
      disclaimer: "نماذج المحاكاة التعليمية تقرّب المفاهيم الفيزيائية لأغراض الشرح والتدريس.",
    },
  },

  fr: {
    appName: "SciNexa",
    appTagline: "Plateforme d'Apprentissage Scientifique & Laboratoire Virtuel",
    appDescription: "Offrir aux étudiants des outils d'exploration immersifs: modèles 3D anatomiques de haute précision, simulations physiques en temps réel et laboratoires intégrés.",
    nav: {
      home: "Accueil",
      anatomy: "Anatomie Humaine",
      biology: "Laboratoire de Biologie",
      physics: "Laboratoire de Physique",
      chemistry: "Tableau Périodique",
      geology: "Sciences de la Terre",
      classroom: "Mode Salle de Classe",
      searchPlaceholder: "Rechercher concepts, simulations, éléments...",
    },
    hero: {
      badge: "Plateforme Scientifique Avancée SciNexa",
      title: "Découverte Scientifique Interactive",
      titleAccent: "Sans Frontières Physiques",
      subtitle: "Combler le fossé entre théorie et pratique de laboratoire. Explorez plus de 10 millions de triangles anatomiques, des simulations mécaniques et optiques, et la géophysique terrestre.",
      exploreModules: "Explorer les Laboratoires",
      openClassroom: "Mode Présentation",
      statsMeshes: "+2 821",
      statsMeshesLabel: "Structures Anatomiques",
      statsSimulations: "+15",
      statsSimulationsLabel: "Simulations Interactives",
      statsLanguages: "4",
      statsLanguagesLabel: "Langues Complètes",
    },
    features: {
      sectionTitle: "Disciplines Scientifiques Interactives",
      sectionSubtitle: "Conçues pour l'expérimentation pédagogique avec manipulation des paramètres et visualisation immédiate.",
      anatomyTitle: "Atlas 3D d'Anatomie Humaine",
      anatomyDesc: "Atlas haute définition basé sur Z-Anatomy et BodyParts3D avec mode rayons X, filtres de systèmes et dissection virtuelle.",
      physicsTitle: "Laboratoire de Physique Paramétrique",
      physicsDesc: "Mécanique du mouvement, propagation des ondes, circuits électriques (Lois d'Ohm et Kirchhoff) et réfraction de Snell-Descartes.",
      chemistryTitle: "Tableau Périodique et Réactions",
      chemistryDesc: "Les 118 éléments avec configurations électroniques de Bohr, périodicité chimique et démonstrateur de réactions.",
      geologyTitle: "Sciences de la Terre et Géophysique",
      geologyDesc: "Coupe interactive du globe terrestre, tectonique des plaques, ondes sismiques P et S, et cycle des roches.",
      biologyTitle: "Biologie Cellulaire et Physiologie",
      biologyDesc: "Organites cellulaires 3D végétaux et animaux, double hélice d'ADN, photosynthèse et grands systèmes corporels.",
      classroomTitle: "Mode Tableau Blanc & Classe",
      classroomDesc: "Interface plein écran simplifiée pour vidéoprojecteurs scolaires et tableaux interactifs avec navigation séquentielle.",
      launch: "Ouvrir le Module",
    },
    egyptLocation: {
      title: "Suggestions d'Administration Éducative Égyptienne",
      detectedGovernorate: "Gouvernorat suggéré",
      selectAdministration: "Administration éducative",
      note: "Basé sur la géolocalisation approximative. Vous pouvez sélectionner votre administration manuellement.",
      change: "Modifier",
      save: "Enregistrer",
      selectPrompt: "Sélectionner une administration éducative...",
    },
    classroom: {
      title: "Mode Présentation Pédagogique",
      subtitle: "Optimisé pour les tableaux blancs interactifs et projecteurs de classe.",
      exitPresentation: "Quitter le Mode Présentation",
      prevStep: "Étape Précédente",
      nextStep: "Étape Suivante",
      fullscreen: "Plein Écran",
      step: "Étape",
      of: "sur",
      quickTools: "Contrôles Rapides",
      selectModule: "Choisir un Module",
    },
    anatomy: {
      title: "Atlas 3D du Corps Humain",
      badge: "Moteur Z-Anatomy & BodyParts3D",
      searchPlaceholder: "Rechercher un os, un muscle, un organe...",
      viewAngle: "Vues Standard",
      front: "Vue Antérieure",
      back: "Vue Postérieure",
      left: "Vue Gauche",
      right: "Vue Droite",
      resetCamera: "Réinitialiser la Vue",
      xrayMode: "Mode Rayons X",
      isolate: "Isoler la Structure",
      showAll: "Afficher Tout",
      takeScreenshot: "Exporter l'Image",
      structuresList: "Hiérarchie Anatomique",
      organDetails: "Détails de la Structure",
      system: "Système Anatomique",
      fmaId: "Identifiant FMA",
      latinName: "Terminologie Latine",
      description: "Description Médicale",
      layers: "Systèmes",
      bones: "Squelette",
      muscles: "Muscles",
      organs: "Viscères",
      vessels: "Vaisseaux",
      nerves: "Système Nerveux",
      quizMode: "Quiz d'Identification",
      quizQuestion: "Identifiez la structure suivante :",
      score: "Score",
    },
    physics: {
      title: "Laboratoire de Simulation Physique",
      subtitle: "Calculé avec les équations rigoureuses de la cinématique et de l'électrodynamique.",
      mechanics: "Mécanique Classique",
      waves: "Ondes et Harmoniques",
      circuits: "Circuits Électriques",
      optics: "Optique Géométrique",
      thermo: "Thermodynamique",
      play: "Démarrer",
      pause: "Pause",
      reset: "Réinitialiser",
      step: "Pas à Pas",
      mass: "Masse (m)",
      velocity: "Vitesse Initiale (v₀)",
      gravity: "Accélération Gravitationnelle (g)",
      angle: "Angle de Tir (θ)",
      frequency: "Fréquence (f)",
      amplitude: "Amplitude (A)",
      voltage: "Tension Source (V)",
      resistance: "Résistance (R)",
      current: "Courant Calculé (I)",
      power: "Puissance Dissipée (P)",
      refractiveIndex: "Indice de Réfraction (n₂)",
      lawExplanation: "Loi Physique & Formulation",
      formula: "Modèle Mathématique",
      liveReadings: "Télémétrie en Direct",
    },
    chemistry: {
      title: "Tableau Périodique Interactif",
      subtitle: "Propriétés physico-chimiques vérifiées pour les 118 éléments.",
      searchPlaceholder: "Rechercher par nom, symbole ou numéro atomique...",
      allCategories: "Toutes les Familles",
      alkaliMetal: "Métaux Alcalins",
      alkalineEarth: "Métaux Alcalino-terreux",
      transitionMetal: "Métaux de Transition",
      postTransition: "Métaux Pauvres",
      metalloid: "Métalloïdes",
      nonmetal: "Non-métaux Réactifs",
      nobleGas: "Gaz Nobles",
      lanthanide: "Lanthanides",
      actinide: "Actinides",
      atomicNumber: "Numéro Atomique",
      atomicMass: "Masse Atomique",
      electronConfig: "Configuration Électronique",
      electronegativity: "Électronégativité (Pauling)",
      group: "Groupe",
      period: "Période",
      summary: "Description et Usages",
      modelDisclaimer: "Les modèles d'orbites de Bohr sont pédagogiques et simplifiés.",
      reactionSim: "Simulateur de Réactions",
    },
    geology: {
      title: "Sciences de la Terre & Géologie",
      subtitle: "Coupe interne du globe, dynamique des plaques et sismologie.",
      earthLayers: "Couches de la Terre",
      crust: "Croûte Terrestre",
      mantle: "Manteau Supérieur et Inférieur",
      outerCore: "Noyau Externe Liquide",
      innerCore: "Noyau Interne Solide",
      depth: "Profondeur",
      temperature: "Température Estimée",
      composition: "Composition Dominante",
      tectonics: "Tectonique des Plaques",
      earthquakes: "Ondes Sismiques P et S",
      volcanoes: "Volcanisme et Magma",
      rockCycle: "Cycle des Roches",
      simulateEvent: "Déclencher l'Événement",
    },
    biology: {
      title: "Laboratoire de Biologie",
      subtitle: "Ultrastructure cellulaire 3D, génétique et physiologie.",
      cellModel: "Cytologie Interactive 3D",
      plantCell: "Cellule Végétale",
      animalCell: "Cellule Animale",
      dnaGenetics: "Structure ADN et Paires de Bases",
      photosynthesis: "Photosynthèse et Cycle de Calvin",
      circulation: "Système Cardio-vasculaire",
      respiration: "Échanges Gazeux Respiratoires",
      digestive: "Appareil Digestif",
      nervous: "Transmission Synaptique",
      organelleDetails: "Examen de l'Organite",
      function: "Rôle et Synthèse Biologique",
    },
    quiz: {
      quizTitle: "Test des Connaissances",
      question: "Question",
      correct: "Bonne Réponse !",
      incorrect: "Réponse Incorrecte. Explication :",
      nextQuestion: "Question Suivante",
      completed: "Test Terminé !",
      finalScore: "Score Obtenu :",
      restart: "Recommencer",
    },
    footer: {
      tagline: "Plateforme SciNexa — Conçue pour un enseignement scientifique de haut niveau.",
      sources: "Sources Scientifiques: Z-Anatomy, BodyParts3D (DBCLS), IUPAC, USGS.",
      credits: "Licences: BodyParts3D (CC BY 4.0), Z-Anatomy (CC BY-SA 4.0).",
      license: "Code logiciel sous licence MIT.",
      disclaimer: "Les modèles pédagogiques simplifient la complexité physique réelle.",
    },
  },

  de: {
    appName: "SciNexa",
    appTagline: "Interaktive Wissenschaftsplattform & Virtuelles Labor",
    appDescription: "Förderung von MINT-Lernenden durch hochpräzise 3D-Anatomiemodelle, Echtzeit-Physiksimulationen und umfassende wissenschaftliche Labore.",
    nav: {
      home: "Startseite",
      anatomy: "Menschliche Anatomie",
      biology: "Biologielabor",
      physics: "Physiklabor",
      chemistry: "Periodensystem",
      geology: "Geowissenschaften",
      classroom: "Klassenraum-Modus",
      searchPlaceholder: "Konzepte, Simulationen, Elemente suchen...",
    },
    hero: {
      badge: "SciNexa Wissenschafts- und Bildungsplattform",
      title: "Interaktive Wissenschaftliche Entdeckung",
      titleAccent: "Ohne Physische Grenzen",
      subtitle: "Die Brücke zwischen Theorie und praktischem Experimentieren. Erkunden Sie über 10 Millionen anatomische Dreiecke, physikalische Simulationen und geophysikalische Modelle.",
      exploreModules: "Labore Entdecken",
      openClassroom: "Präsentationsmodus",
      statsMeshes: "2.821+",
      statsMeshesLabel: "Anatomische Strukturen",
      statsSimulations: "15+",
      statsSimulationsLabel: "Interaktive Simulationen",
      statsLanguages: "4",
      statsLanguagesLabel: "Vollständige Sprachen",
    },
    features: {
      sectionTitle: "Interaktive Wissenschaftsdisziplinen",
      sectionSubtitle: "Entwickelt für gymnasiale und universitäre Forschung mit Parametereinstellung und Echtzeitvisualisierung.",
      anatomyTitle: "3D-Atlas der Menschlichen Anatomie",
      anatomyDesc: "Hochauflösender Anatomieatlas basierend auf Z-Anatomy und BodyParts3D mit Röntgenmodus und Struktursektion.",
      physicsTitle: "Echtzeit-Physiklabor",
      physicsDesc: "Bewegungsgesetze, harmonische Wellen, Stromkreise (Ohmsches & Kirchhoffsches Gesetz) und optische Brechung.",
      chemistryTitle: "Periodensystem & Reaktionen",
      chemistryDesc: "Alle 118 Elemente mit Bohr-Elektronenkonfigurationen, Periodizitätstrends und Reaktionssimulator.",
      geologyTitle: "Geowissenschaften & Geophysik",
      geologyDesc: "Erkundbarer 3D-Erdquerschnitt, Plattentektonik, seismische Wellen und der Gesteinskreislauf.",
      biologyTitle: "Zellbiologie & Physiologie",
      biologyDesc: "Interaktive 3D-Zellorganellen von Tier und Pflanze, DNA-Doppelhelix und Organfunktion.",
      classroomTitle: "Präsentations- & Smartboard-Modus",
      classroomDesc: "Für Beamer und interaktive Tafeln optimierte Vollbildansicht mit kontrastreichen Schritten.",
      launch: "Modul Starten",
    },
    egyptLocation: {
      title: "Vorschläge für Ägyptische Bildungsverwaltung",
      detectedGovernorate: "Vorgeschlagenes Gouvernement",
      selectAdministration: "Bildungsverwaltung",
      note: "Basiert auf ungefährer Geolokalisierung. Sie können Ihre Verwaltung jederzeit manuell ändern.",
      change: "Ändern",
      save: "Speichern",
      selectPrompt: "Bildungsverwaltung auswählen...",
    },
    classroom: {
      title: "Klassenraum-Präsentationsmodus",
      subtitle: "Optimiert für Smartboards und Klassenzimmer-Projektoren.",
      exitPresentation: "Präsentation Beenden",
      prevStep: "Vorheriger Schritt",
      nextStep: "Nächster Schritt",
      fullscreen: "Vollbild Umschalten",
      step: "Schritt",
      of: "von",
      quickTools: "Schnellsteuerung",
      selectModule: "Modul Auswählen",
    },
    anatomy: {
      title: "3D-Atlas der Menschlichen Anatomie",
      badge: "Z-Anatomy & BodyParts3D Engine",
      searchPlaceholder: "Knochen, Muskel, Organ suchen...",
      viewAngle: "Standardperspektiven",
      front: "Vorderansicht (Anterior)",
      back: "Rückansicht (Posterior)",
      left: "Linksansicht",
      right: "Rechtsansicht",
      resetCamera: "Kamera Zurücksetzen",
      xrayMode: "Röntgenmodus",
      isolate: "Struktur Isolieren",
      showAll: "Alle Ebenen Zeigen",
      takeScreenshot: "Bild Exportieren",
      structuresList: "Anatomische Hierarchie",
      organDetails: "Strukturdetails",
      system: "Organsystem",
      fmaId: "FMA-Identifikator",
      latinName: "Lateinische Bezeichnung",
      description: "Medizinische Beschreibung",
      layers: "Organsysteme",
      bones: "Skelett",
      muscles: "Muskulatur",
      organs: "Eingeweide & Organe",
      vessels: "Blutgefäße",
      nerves: "Nervensystem",
      quizMode: "Anatomie-Erkennungsquiz",
      quizQuestion: "Identifizieren Sie folgende Struktur:",
      score: "Punktzahl",
    },
    physics: {
      title: "Virtuelles Physiklabor",
      subtitle: "Berechnet nach exakten physikalischen Formeln der Mechanik und Elektrizitätslehre.",
      mechanics: "Klassische Mechanik",
      waves: "Wellen und Resonanz",
      circuits: "Elektrische Stromkreise",
      optics: "Geometrische Optik",
      thermo: "Thermodynamik",
      play: "Starten",
      pause: "Pause",
      reset: "Zurücksetzen",
      step: "Einzelschritt",
      mass: "Masse (m)",
      velocity: "Anfangsgeschwindigkeit (v₀)",
      gravity: "Erdbeschleunigung (g)",
      angle: "Abschusswinkel (θ)",
      frequency: "Frequenz (f)",
      amplitude: "Amplitude (A)",
      voltage: "Spannung (V)",
      resistance: "Widerstand (R)",
      current: "Stromstärke (I)",
      power: "Leistung (P)",
      refractiveIndex: "Brechungsindex (n₂)",
      lawExplanation: "Gültiges Physikalisches Gesetz",
      formula: "Mathematische Formel",
      liveReadings: "Echtzeit-Telemetrie",
    },
    chemistry: {
      title: "Interaktives Periodensystem",
      subtitle: "Genaue physikalische und chemische Werte aller 118 Elemente.",
      searchPlaceholder: "Nach Elementname, Symbol oder Ordnungszahl suchen...",
      allCategories: "Alle Elementfamilien",
      alkaliMetal: "Alkalimetalle",
      alkalineEarth: "Erdalkalimetalle",
      transitionMetal: "Übergangsmetalle",
      postTransition: "Metalle",
      metalloid: "Halbmetalle",
      nonmetal: "Reaktive Nichtmetalle",
      nobleGas: "Edelgase",
      lanthanide: "Lanthanoide",
      actinide: "Actinoide",
      atomicNumber: "Ordnungszahl",
      atomicMass: "Relative Atommasse",
      electronConfig: "Elektronenkonfiguration",
      electronegativity: "Elektronegativität",
      group: "Gruppe",
      period: "Periode",
      summary: "Überblick und Vorkommen",
      modelDisclaimer: "Bohr-Schalenmodelle dienen der pädagogischen Veranschaulichung.",
      reactionSim: "Reaktions-Simulator",
    },
    geology: {
      title: "Geowissenschaften & Geophysik",
      subtitle: "Erdschichten, Plattentektonik, seismische Wellen und Gesteinsarten.",
      earthLayers: "Schichten des Erdkörpers",
      crust: "Erdkruste",
      mantle: "Erdmantel",
      outerCore: "Flüssiger Äußerer Erdkern",
      innerCore: "Fester Innerer Erdkern",
      depth: "Tiefengrenze",
      temperature: "Geschätzte Temperatur",
      composition: "Hauptzusammensetzung",
      tectonics: "Plattentektonik",
      earthquakes: "Seismische P- und S-Wellen",
      volcanoes: "Magmatismus & Vulkanismus",
      rockCycle: "Gesteinskreislauf",
      simulateEvent: "Ereignis Simulieren",
    },
    biology: {
      title: "Biologisches Lehrlabor",
      subtitle: "Interaktive Zellultrastruktur, Genetik und Humanphysiologie.",
      cellModel: "Interaktive 3D-Zellbiologie",
      plantCell: "Pflanzenzelle",
      animalCell: "Tierzelle",
      dnaGenetics: "DNA-Doppelhelix & Basenpaarung",
      photosynthesis: "Photosynthese & Calvin-Zyklus",
      circulation: "Blutkreislauf",
      respiration: "Atmungssystem",
      digestive: "Verdauungssystem",
      nervous: "Synaptische Signalübertragung",
      organelleDetails: "Organellendetails",
      function: "Biologische Funktion",
    },
    quiz: {
      quizTitle: "Wissensüberprüfung",
      question: "Frage",
      correct: "Richtige Antwort!",
      incorrect: "Falsche Antwort. Wissenschaftliche Erklärung:",
      nextQuestion: "Nächste Frage",
      completed: "Quiz Abgeschlossen!",
      finalScore: "Endergebnis:",
      restart: "Wiederholen",
    },
    footer: {
      tagline: "SciNexa Wissenschaftsplattform — Gebaut für freien, erstklassigen Experimentalunterricht.",
      sources: "Wissenschaftliche Quellen: Z-Anatomy, BodyParts3D (DBCLS), IUPAC, USGS.",
      credits: "Lizenzen: BodyParts3D (CC BY 4.0), Z-Anatomy (CC BY-SA 4.0).",
      license: "Software unter MIT-Lizenz.",
      disclaimer: "Pädagogische Simulationen vereinfachen reale physikalische Komplexität.",
    },
  },
};
