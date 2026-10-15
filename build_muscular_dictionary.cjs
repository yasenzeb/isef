const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, 'src/data/skeletalBoneDictionary.json');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const meshNames = require('./muscular_mesh_names.json');

// Base muscle lookups from user's CSV dataset and standard anatomical atlas
const baseMuscleKnowledge = {
  'pectoralis major': {
    ar: 'العضلة الصدرية الكبرى',
    descAr: 'عضلة صدرية مروحية ضخمة تسهم في تقريب وثني وتدوير الذراع نحو الداخل ودفع الأثقال.',
    descEn: 'Large fan-shaped chest muscle responsible for arm adduction, flexion, and internal rotation.'
  },
  'pectoralis minor': {
    ar: 'العضلة الصدرية الصغرى',
    descAr: 'عضلة رقيقة مثلثة تقع أسفل الصدرية الكبرى، تسحب لوح الكتف للأمام والأسفل وتثبته على القفص الصدري.',
    descEn: 'Thin triangular chest muscle stabilizing and depressing the scapula against the thoracic wall.'
  },
  'biceps brachii': {
    ar: 'العضلة ذات الرأسين العضدية',
    descAr: 'عضلة ثنائية الرؤوس في مقدمة العضد، تعمل كثانٍ رئيسي لمفصل الكوع وباطح قوي للساعد.',
    descEn: 'Two-headed anterior arm muscle serving as a primary elbow flexor and powerful forearm supinator.'
  },
  'triceps brachii': {
    ar: 'العضلة ثلاثية الرؤوس العضدية',
    descAr: 'عضلة ثلاثية الرؤوس على الوجه الخلفي للعضد، الباسط الرئيسي لمفصل الكوع وتثبيت مفصل الكتف.',
    descEn: 'Three-headed posterior arm muscle acting as the principal extensor of the elbow joint.'
  },
  'biceps femoris': {
    ar: 'العضلة ذات الرأسين الفخذية',
    descAr: 'إحدى عضلات المأبض (الهمسترنج) الخلفية للفخذ، تسهم في ثني الركبة وبسط مفصل الفخذ وتدوير الساق وحشياً.',
    descEn: 'Posterior hamstring muscle responsible for knee flexion, hip extension, and lateral tibia rotation.'
  },
  'gastrocnemius': {
    ar: 'العضلة التوأمية الساقية',
    descAr: 'العضلة السطحية القوية لربلة الساق، تسهم في الثني الأخمصي للقدم عند الكاحل والمساعدة في ثني الركبة.',
    descEn: 'Superficial two-bellied calf muscle powering plantar flexion of the foot and assisting knee flexion.'
  },
  'soleus': {
    ar: 'العضلة النعلية',
    descAr: 'عضلة مسطحة عريضة عميقة للربلة، تحافظ على التوازن القائم وتولد قوة ثني أخمصي مستمرة أثناء المشي.',
    descEn: 'Broad flat deep calf muscle essential for standing posture and continuous ankle plantar flexion.'
  },
  'plantaris': {
    ar: 'العضلة الأخمصية',
    descAr: 'عضلة صغيرة ذات وتر طويل ورفيع تمتد خلف الركبة إلى وتر أخيل، تسهم في استشعار وضعية القدم.',
    descEn: 'Small posterior leg muscle with an elongated tendon contributing to proprioceptive ankle feedback.'
  },
  'deltoid': {
    ar: 'العضلة الدالية',
    descAr: 'عضلة الكتف المحيطية الكبيرة، المسؤولة الرئيسية عن تبعيد الذراع ورفعه للأعلى وتثبيت مفصل الكتف.',
    descEn: 'Major shoulder muscle providing arm abduction, anterior flexion, posterior extension, and joint stabilization.'
  },
  'trapezius': {
    ar: 'العضلة شبه المنحرفة',
    descAr: 'عضلة ظهرية سطحية واسعة، تتحكم في حركة لوح الكتف ورفعه وخفضه وتثبيت الرقبة والعمود الفقري.',
    descEn: 'Large superficial back muscle elevating, retracting, and rotating the scapula, supporting the cervical spine.'
  },
  'latissimus dorsi': {
    ar: 'العضلة الظهرية العريضة',
    descAr: 'أعرض عضلة في الظهر، مسؤولة عن بسط وتقريب وتدوير الذراع للداخل أثناء التسلق والسحب.',
    descEn: 'Broadest muscle of the back powering humerus adduction, extension, and internal rotation during pulling.'
  },
  'rectus abdominis': {
    ar: 'العضلة المستقيمة البطنية',
    descAr: 'عضلة شريطية أمامية للبطن مقسمة لأقسام ليفية، تثني الجذع والعمود الفقري وتزيد الضغط داخل البطن.',
    descEn: 'Paired anterior abdominal muscle flexing the lumbar spine and compressing abdominal viscera.'
  },
  'external abdominal oblique': {
    ar: 'العضلة المائلة البطنية الخارجية',
    descAr: 'الطبقة السطحية للعضلات الجدارية الجانبية للبطن، تدير الجذع للجانب المعاكس وتثني العمود الفقري.',
    descEn: 'Superficial lateral abdominal muscle driving contralateral trunk rotation and supporting lateral flexion.'
  },
  'internal abdominal oblique': {
    ar: 'العضلة المائلة البطنية الداخلية',
    descAr: 'الطبقة المتوسطة لجدار البطن الجانبي، تدير الجذع لنفس الجانب وتثبت الحوض والقفص الصدري.',
    descEn: 'Intermediate abdominal muscle enabling ipsilateral trunk rotation and abdominal wall stabilization.'
  },
  'transversus abdominis': {
    ar: 'العضلة المستعرضة البطنية',
    descAr: 'أعمق طبقات عضلات البطن، تعمل كحزام داعم طبيعي لحماية الأعضاء الحشوية وتثبيت الفقرات القطنية.',
    descEn: 'Deepest abdominal muscle layer acting as a natural corset to compress viscera and stabilize the lumbar spine.'
  },
  'masseter': {
    ar: 'العضلة الماضغة',
    descAr: 'أقوى عضلات المضغ، ترفع الفك السفلي بقوة لإطباق الأسنان وسحق الطعام أثناء المضغ.',
    descEn: 'Powerful quadrangular mastication muscle elevating the mandible to crush food between dental arches.'
  },
  'temporalis': {
    ar: 'العضلة الصدغية',
    descAr: 'عضلة مروحية في جانب الجمجمة، ترفع الفك السفلي وتسحبه للخلف لتثبيت العضة والإغلاق الفكي.',
    descEn: 'Fan-shaped masticatory muscle elevating and retracting the mandible within the temporal fossa.'
  },
  'orbicularis oculi': {
    ar: 'العضلة الحلقية العينية',
    descAr: 'عضلة دائرية تحيط بحجاج العين والجفنين، مسؤولة عن إغلاق الجفون وحماية مقلة العين وترطيبها بالدموع.',
    descEn: 'Circular sphincter muscle surrounding the orbit closing the eyelids and protecting the ocular surface.'
  },
  'orbicularis oris': {
    ar: 'العضلة الحلقية الفموية',
    descAr: 'عضلة دائرية تحيط بالشفاه، تتحكم في حركة الشفتين وإغلاقهما والتصفير والنطق الدقيق للحروف.',
    descEn: 'Complex circular oral sphincter muscle controlling lip closure, puckering, and articulate speech.'
  },
  'frontalis': {
    ar: 'العضلة الجبهية',
    descAr: 'عضلة الوجه العلوية التي ترفع الحاجبين وتجعد جلد الجبهة أثناء التعبير عن الدهشة أو الانتباه.',
    descEn: 'Anterior epicranial muscle elevating the eyebrows and furrowing the forehead during facial expressions.'
  },
  'occipitalis': {
    ar: 'العضلة القذالية',
    descAr: 'العضلة الخلفية لفروة الرأس، تشد السفاق القحفي للخلف وتثبت غطاء الرأس الليفي.',
    descEn: 'Posterior scalp muscle retracting the galea aponeurotica and stabilizing the epicranial sheath.'
  },
  'sternocleidomastoid': {
    ar: 'العضلة القصية الترقوية الحلمية',
    descAr: 'عضلة عنقية بارزة ثنائية الرؤوس، تدير الرأس للجانب المعاكس وتثني العنق للأمام أو الجانب.',
    descEn: 'Prominent neck muscle driving contralateral head rotation, ipsilateral flexion, and cervical stabilization.'
  },
  'semimembranosus': {
    ar: 'العضلة نصف الغشائية',
    descAr: 'إحدى عضلات المأبض الإنسية الخلفية للفخذ، تثني مفصل الركبة وتبسط الورك وتدور الساق إنسياً.',
    descEn: 'Medial hamstring muscle facilitating knee flexion, hip extension, and medial tibial rotation.'
  },
  'semitendinosus': {
    ar: 'العضلة نصف الوترية',
    descAr: 'عضلة مأبضية خلفية ذات وتر طويل متميز، تسهم في ثني الركبة وبسط مفصل الفخذ.',
    descEn: 'Posterior hamstring muscle with an elongated distal tendon powering knee flexion and hip extension.'
  },
  'sartorius': {
    ar: 'العضلة الخياطية',
    descAr: 'أطول عضلة في جسم الإنسان، تمتد مائلة عبر الفخذ لتثني وتدور مفصلي الورك والركبة (وضعية الخياط).',
    descEn: 'Longest strap muscle in the human body flexing, abducting, and laterally rotating the hip and knee.'
  },
  'gracilis': {
    ar: 'العضلة الرشيقة',
    descAr: 'عضلة إنسية رفيعة تمتد على طول الفخذ، تقرب الفخذ عند مفصل الورك وتساعد في ثني مفصل الركبة.',
    descEn: 'Slender medial thigh muscle assisting in hip adduction and stabilizing the medial knee compartment.'
  },
  'adductor magnus': {
    ar: 'العضلة المقربة الكبرى',
    descAr: 'أضخم عضلات الفخذ المقربة، تقرب الفخذ بقوة وتثبته أثناء المشي والركض وتدعيم الحوض.',
    descEn: 'Massive triangular medial thigh muscle powerfully adducting and extending the femur.'
  },
  'adductor longus': {
    ar: 'العضلة المقربة الطويلة',
    descAr: 'عضلة مثلثة في إنسي الفخذ، تقرب مفصل الورك وتثنيه وتسهم في التوازن الحركي أثناء الحركة.',
    descEn: 'Triangular medial thigh muscle adducting and flexing the hip joint during ambulation.'
  },
  'adductor brevis': {
    ar: 'العضلة المقربة القصيرة',
    descAr: 'عضلة مقربة عميقة تقع خلف المقربة الطويلة، تسهم في تقريب الفخذ وتثبيت حركات الحوض.',
    descEn: 'Deep adductor muscle positioned behind adductor longus providing hip adduction.'
  },
  'pectineus': {
    ar: 'العضلة المشطية',
    descAr: 'عضلة مسطحة في أعلى إنسي الفخذ، تثني مفصل الورك وتقربه وتدوره إنسياً.',
    descEn: 'Flat quadrangular pelvic-femoral muscle adducting and flexing the hip joint.'
  },
  'piriformis': {
    ar: 'العضلة الكمثرية',
    descAr: 'عضلة كمثرية الشكل عميقة في الحوض، تدور الفخذ وحشياً وتبعده أثناء ثني الورك ويمر أسفلها العصب الوركي.',
    descEn: 'Deep pear-shaped gluteal muscle laterally rotating the femur and closely associated with the sciatic nerve.'
  },
  'quadratus femoris': {
    ar: 'العضلة المربعة الفخذية',
    descAr: 'عضلة مربعة مسطحة في مؤخرة مفصل الورك، تدور عظم الفخذ وحشياً وتثبت رأس الفخذ داخل الحُق.',
    descEn: 'Flat quadrilateral gluteal muscle providing strong lateral rotation of the thigh at the hip.'
  },
  'gluteus maximus': {
    ar: 'العضلة الألوية الكبرى',
    descAr: 'أضخم عضلة في جسم الإنسان، الباسط الرئيسي لمفصل الورك والمسؤولة عن النهوض والقفز وصعود الدرج.',
    descEn: 'Largest and heaviest human muscle serving as the primary hip extensor for climbing, rising, and running.'
  },
  'gluteus medius': {
    ar: 'العضلة الألوية المتوسطة',
    descAr: 'عضلة مروحية جانبية للحوض، المبعد الرئيسي لمفصل الورك وتمنع سقوط الحوض للجانب المعاكس أثناء المشي.',
    descEn: 'Powerful lateral pelvic abductor stabilizing the pelvis horizontally during single-leg stance.'
  },
  'gluteus minimus': {
    ar: 'العضلة الألوية الصغرى',
    descAr: 'أعمق العضلات الألوية، تعمل بتناسق مع الألوية المتوسطة في تبعيد الفخذ وتدويره إنسياً.',
    descEn: 'Deepest gluteal muscle working synergistically with gluteus medius to abduct and internally rotate the hip.'
  },
  'tibialis anterior': {
    ar: 'العضلة الظنبوبية الأمامية',
    descAr: 'العضلة الرئيسية في مقدمة الساق، ترفع القدم للأعلى (ثني ظهري) وتقلبها إنسياً لمنع تعثر القدم أثناء المشي.',
    descEn: 'Key anterior crural muscle dorsiflexing and inverting the foot to ensure ground clearance during swing phase.'
  },
  'tibialis posterior': {
    ar: 'العضلة الظنبوبية الخلفية',
    descAr: 'أعمق عضلات الساق الخلفية، تدعم القوس الطولي الإنسي للقدم وتؤمن الثني الأخمصي والانقلاب الداخلي.',
    descEn: 'Deep posterior calf muscle dynamic stabilizer supporting the medial longitudinal arch of the foot.'
  },
  'fibularis longus': {
    ar: 'العضلة الشظوية الطويلة',
    descAr: 'عضلة وحشية للساق يلتف وترها تحت القدم لدعم القوس المستعرض وتوليد انقلاب وحشي وثني أخمصي.',
    descEn: 'Lateral leg muscle whose tendon crosses the plantar foot to support transverse arch and evert the foot.'
  },
  'fibularis brevis': {
    ar: 'العضلة الشظوية القصيرة',
    descAr: 'عضلة وحشية تحت الشظوية الطويلة، ترتكز على قاعدة المشط الخامس وتؤمن حركة شقلبة القدم وحشياً.',
    descEn: 'Short lateral calf muscle inserting at fifth metatarsal tuberosity for foot eversion.'
  },
  'brachioradialis': {
    ar: 'العضلة العضدية الكعبرية',
    descAr: 'عضلة بارزة في وحشي الساعد، تثني الكوع بقوة خاصة عندما يكون الساعد في وضعية محايدة (بين الكب والبطح).',
    descEn: 'Prominent forearm muscle flexing the elbow most efficiently when the forearm is in neutral midposition.'
  },
  'pronator teres': {
    ar: 'العضلة الكابة المدورة',
    descAr: 'عضلة أمامية للساعد تدير الساعد نحو الداخل (كب) لتوجيه راحة اليد للخلف وتساعد في ثني الكوع.',
    descEn: 'Anterior forearm muscle pronating the forearm and assisting in elbow flexion.'
  },
  'supinator': {
    ar: 'العضلة الباطحة',
    descAr: 'عضلة عميقة خلفية للمرفق والساعد، تدور الكعبرة لبطح الساعد وتوجيه راحة اليد للأمام.',
    descEn: 'Deep posterior forearm muscle rotating the radius to supinate the hand and forearm.'
  },
};

const headPartNames = [
  { match: /long head of /i, arPrefix: 'الرأس الطويل لـ', enPrefix: 'Long head of ' },
  { match: /short head of /i, arPrefix: 'الرأس القصير لـ', enPrefix: 'Short head of ' },
  { match: /lateral head of /i, arPrefix: 'الرأس الوحشي لـ', enPrefix: 'Lateral head of ' },
  { match: /medial head of /i, arPrefix: 'الرأس الإنسي لـ', enPrefix: 'Medial head of ' },
  { match: /clavicular head of /i, arPrefix: 'الرأس الترقوي لـ', enPrefix: 'Clavicular head of ' },
  { match: /sternocostal head of /i, arPrefix: 'الرأس القصي الضلعي لـ', enPrefix: 'Sternocostal head of ' },
  { match: /\(?abdominal part of /i, arPrefix: 'الجزء البطني لـ', enPrefix: 'Abdominal part of ' },
  { match: /orbital part of /i, arPrefix: 'الجزء المداري لـ', enPrefix: 'Orbital part of ' },
  { match: /palpebral part of /i, arPrefix: 'الجزء الجفني لـ', enPrefix: 'Palpebral part of ' },
  { match: /deep head of /i, arPrefix: 'الرأس العميق لـ', enPrefix: 'Deep head of ' },
  { match: /superficial head of /i, arPrefix: 'الرأس السطحي لـ', enPrefix: 'Superficial head of ' },
  { match: /deep part of /i, arPrefix: 'الجزء العميق لـ', enPrefix: 'Deep part of ' },
  { match: /superficial part of /i, arPrefix: 'الجزء السطحي لـ', enPrefix: 'Superficial part of ' },
  { match: /ascending part of /i, arPrefix: 'الجزء الصاعد لـ', enPrefix: 'Ascending part of ' },
  { match: /descending part of /i, arPrefix: 'الجزء الهابط لـ', enPrefix: 'Descending part of ' },
  { match: /transverse part of /i, arPrefix: 'الجزء المستعرض لـ', enPrefix: 'Transverse part of ' },
  { match: /acromial part of /i, arPrefix: 'الجزء الأخرمي لـ', enPrefix: 'Acromial part of ' },
  { match: /clavicular part of /i, arPrefix: 'الجزء الترقوي لـ', enPrefix: 'Clavicular part of ' },
  { match: /scapular spinal part of /i, arPrefix: 'الجزء الشوكي للكتف لـ', enPrefix: 'Scapular spinal part of ' },
  { match: /humeral head of /i, arPrefix: 'الرأس العضدي لـ', enPrefix: 'Humeral head of ' },
  { match: /ulnar head of /i, arPrefix: 'الرأس الزندي لـ', enPrefix: 'Ulnar head of ' },
  { match: /radial head of /i, arPrefix: 'الرأس الكعبري لـ', enPrefix: 'Radial head of ' },
];

let added = 0;

for (const rawName of meshNames) {
  // Clean rawName
  let cleanName = rawName.replace(/^ZA:/i, '').replace(/\.\d+$/i, '').trim();
  const isLeft = cleanName.endsWith('.l') || cleanName.endsWith('_L') || cleanName.includes('(Left)');
  const isRight = cleanName.endsWith('.r') || cleanName.endsWith('_R') || cleanName.includes('(Right)');
  const sideSuffixEn = isLeft ? ' (Left)' : isRight ? ' (Right)' : '';
  const sideSuffixAr = isLeft ? ' (الأيسر)' : isRight ? ' (الأيمن)' : '';

  // Base stripping lateral tags
  let baseName = cleanName
    .replace(/\.(l|r)$/i, '')
    .replace(/_[lr]$/i, '')
    .replace(/\((Left|Right)\)/i, '')
    .trim();

  // If already directly in dict, augment with exact variants
  if (dict[rawName] || dict[cleanName] || dict[baseName]) {
    const existing = dict[rawName] || dict[cleanName] || dict[baseName];
    dict[rawName] = existing;
    dict[rawName.toLowerCase()] = existing;
    dict[cleanName] = existing;
    dict[cleanName.toLowerCase()] = existing;
    continue;
  }

  // Check head/part prefix
  let partPrefixAr = '';
  let partPrefixEn = '';
  let coreName = baseName;

  for (const hp of headPartNames) {
    if (hp.match.test(coreName)) {
      partPrefixAr = hp.arPrefix;
      partPrefixEn = hp.enPrefix;
      coreName = coreName.replace(hp.match, '').replace(/\)$/, '').trim();
      break;
    }
  }

  // Strip "muscle" or "muscles" suffix
  const coreMuscleKey = coreName.replace(/\s*muscle(s)?/i, '').replace(/^\(/, '').replace(/\)$/, '').trim().toLowerCase();

  // Find match in baseMuscleKnowledge
  let matchedKnowledge = null;
  for (const [k, v] of Object.entries(baseMuscleKnowledge)) {
    if (coreMuscleKey === k || coreMuscleKey.includes(k) || k.includes(coreMuscleKey)) {
      matchedKnowledge = v;
      break;
    }
  }

  if (matchedKnowledge) {
    const finalNameAr = (partPrefixAr ? `${partPrefixAr}${matchedKnowledge.ar}` : matchedKnowledge.ar) + sideSuffixAr;
    const finalNameEn = `${baseName}${sideSuffixEn}`;
    const descAr = matchedKnowledge.descAr;
    const descEn = matchedKnowledge.descEn;

    const entry = {
      ar: finalNameAr,
      descAr,
      descEn,
      system: 'muscular',
    };

    dict[rawName] = entry;
    dict[rawName.toLowerCase()] = entry;
    dict[cleanName] = entry;
    dict[cleanName.toLowerCase()] = entry;
    dict[baseName] = entry;
    dict[baseName.toLowerCase()] = entry;
    added++;
    continue;
  }

  // Check if it is a bursa, tendon, fascia, or retinaculum
  let categoryAr = 'بنية عضلية ليفية';
  let categoryDescAr = 'بنية تشريحية تتبع الجهاز العضلي والأنسجة الضامة، تسهم في تقليل الاحتكاك وحماية الأوتار.';
  let categoryDescEn = 'Anatomical fibrous structure belonging to the muscular-fascial system, reducing friction and guiding tendons.';

  if (coreName.toLowerCase().includes('bursa')) {
    categoryAr = `جِراب مفصلي زلالي (${coreName})`;
    categoryDescAr = 'كيس زلالي مبطن يفرز سائلاً ممتصاً للاحتكاك بين الأوتار والعظام أو العضلات المجاورة.';
    categoryDescEn = 'Synovial fluid-filled sac cushioning tendons, bones, and surrounding soft tissues against friction.';
  } else if (coreName.toLowerCase().includes('tendon')) {
    categoryAr = `وتر عضلي ليفي (${coreName})`;
    categoryDescAr = 'شريط كولاجيني متين يربط جسم العضلة بالعظم، وينقل القوة الانقباضية العضلية لإحداث الحركة.';
    categoryDescEn = 'Dense regular collagenous band transmitting mechanical contractile force from muscle to bone.';
  } else if (coreName.toLowerCase().includes('fascia') || coreName.toLowerCase().includes('aponeurosis')) {
    categoryAr = `لفافة عضلية / سِفاق (${coreName})`;
    categoryDescAr = 'غلاف ليفي واقٍ يحيط بالمجموعات العضلية ويفصل بينها ويوجه اتجاه الألياف ويحافظ على الضغط الحركي.';
    categoryDescEn = 'Fibrous connective tissue sheath enveloping muscle compartments and transmitting tension.';
  } else if (coreName.toLowerCase().includes('retinaculum')) {
    categoryAr = `قيد مفصلي ليفي (${coreName})`;
    categoryDescAr = 'رباط ليفي مستعرض سميك يثبت أوتار العضلات في مكانها حول المفاصل ويمنع وترها عند الحركة.';
    categoryDescEn = 'Dense retaining band of connective tissue holding tendons in place close to joint axes during movement.';
  } else {
    categoryAr = `عضلة تشريحية (${coreName})`;
    categoryDescAr = `عضلة متخصصة تتبع الجهاز العضلي تسهم في الحركة الدقيقة والتوازن وتثبيت المفاصل.`;
    categoryDescEn = `Specialized anatomical muscle contributing to biomechanical movement, posture, and articulation stability.`;
  }

  const genericEntry = {
    ar: categoryAr + sideSuffixAr,
    descAr: categoryDescAr,
    descEn: categoryDescEn,
    system: 'muscular',
  };

  dict[rawName] = genericEntry;
  dict[rawName.toLowerCase()] = genericEntry;
  dict[cleanName] = genericEntry;
  dict[cleanName.toLowerCase()] = genericEntry;
  dict[baseName] = genericEntry;
  dict[baseName.toLowerCase()] = genericEntry;
  added++;
}

fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), 'utf8');
console.log(`Successfully mapped all muscular meshes! Added/updated: ${added} entries. Total dictionary keys: ${Object.keys(dict).length}`);
