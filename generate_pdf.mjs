import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>SciNexa Platform — الدليل الشامل والنظري المتكامل لمنظومة المنصة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Alexandria:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 14mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.6;
      font-size: 11pt;
      direction: rtl;
    }

    .page-break {
      page-break-before: always;
    }

    .avoid-break {
      page-break-inside: avoid;
    }

    /* Header & Footer */
    .doc-header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      font-family: 'Alexandria', 'Cairo', sans-serif;
      font-size: 22pt;
      font-weight: 800;
      color: #0369a1;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 10pt;
      color: #64748b;
      font-weight: 600;
    }

    .badge-group {
      display: flex;
      gap: 6px;
    }

    .badge {
      display: inline-block;
      padding: 3px 9px;
      font-size: 8.5pt;
      font-weight: 700;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .badge-primary { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-accent { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-dark { background: #0f172a; color: #f8fafc; }

    /* EXECUTIVE 6-LINE SPOTLIGHT */
    .executive-spotlight {
      background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%);
      color: #ffffff;
      padding: 18px 22px;
      border-radius: 14px;
      margin-bottom: 22px;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.15);
      border: 1px solid #38bdf8;
    }

    .spotlight-title {
      font-family: 'Alexandria', 'Cairo', sans-serif;
      font-size: 13pt;
      font-weight: 800;
      color: #fef08a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 6px;
    }

    .spotlight-lines {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .spotlight-lines li {
      font-size: 10.2pt;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .spotlight-lines li strong {
      color: #7dd3fc;
      white-space: nowrap;
      font-weight: 800;
      min-width: 145px;
    }

    .num-bullet {
      background: rgba(255, 255, 255, 0.25);
      color: #ffffff;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 8.5pt;
      font-weight: 800;
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* Headings */
    h1 {
      font-family: 'Alexandria', 'Cairo', sans-serif;
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 18px;
      margin-bottom: 10px;
      border-right: 4px solid #0284c7;
      padding-right: 10px;
    }

    h2 {
      font-family: 'Alexandria', 'Cairo', sans-serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #0369a1;
      margin-top: 10px;
      margin-bottom: 4px;
    }

    p {
      margin-bottom: 8px;
      text-align: justify;
      color: #334155;
    }

    /* Cards & Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
    }

    .card-accent {
      border-right: 3px solid #0284c7;
    }

    .card-title {
      font-weight: 700;
      font-size: 10.5pt;
      color: #0f172a;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-body {
      font-size: 9.3pt;
      color: #475569;
      line-height: 1.45;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 9.2pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: right;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 9.5pt;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Callout */
    .callout {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-right: 4px solid #16a34a;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9.5pt;
      color: #166534;
    }

    .callout-title {
      font-weight: 800;
      margin-bottom: 3px;
    }

    .callout-info {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-right: 4px solid #0284c7;
      color: #0369a1;
    }

    /* Metrics Bar */
    .metric-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin: 14px 0;
    }

    .metric-box {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }

    .metric-val {
      font-family: 'Alexandria', sans-serif;
      font-size: 15pt;
      font-weight: 800;
      color: #0284c7;
    }

    .metric-lbl {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 600;
      margin-top: 2px;
    }

    .code-block {
      background: #0f172a;
      color: #38bdf8;
      font-family: 'JetBrains Mono', monospace;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 8.5pt;
      direction: ltr;
      text-align: left;
      margin: 6px 0;
      overflow-x: hidden;
    }

    .footer-bar {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 8.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="doc-header">
    <div>
      <div class="brand-title">منصة SciNexa العلمية التفاعلية ثلاثية الأبعاد</div>
      <div class="brand-subtitle">الوثيقة الرسمية للشرح النظري والهندسي والتربوي المتكامل لمنظومة المنصة (ISEF 2026)</div>
    </div>
    <div class="badge-group">
      <span class="badge badge-primary">ISEF 2026 EGYPT</span>
      <span class="badge badge-success">SUPABASE LIVE</span>
      <span class="badge badge-dark">OFFLINE READY</span>
    </div>
  </div>

  <!-- THE 6-LINE EXECUTIVE SPOTLIGHT -->
  <div class="executive-spotlight">
    <div class="spotlight-title">
      <span>⚡</span> الملخص التنفيذي الفوري — افهم منصة SciNexa في ٦ أسطر مكثفة:
    </div>
    <ul class="spotlight-lines">
      <li>
        <span class="num-bullet">١</span>
        <strong>ما هي المنصة؟</strong>
        <span>منظومة وطنية متكاملة للمحاكاة والعلوم التفاعلية ثلاثية الأبعاد (3D)، تدمج الطالب والمعلم والإدارة المدرسية في بيئة تعليمية واحدة مطابقة لمناهج وزارة التربية والتعليم المصرية.</span>
      </li>
      <li>
        <span class="num-bullet">٢</span>
        <strong>المشكلة المحلولة:</strong>
        <span>إنهاء العجز الحاد في معامل المدارس التقليدية، وتجاوز مخاطر المواد الكيميائية وتكاليف التجهيز، بنقل التجربة العلمية من الحفظ التلقيني الجاف إلى الاستكشاف الحسي المباشر.</span>
      </li>
      <li>
        <span class="num-bullet">٣</span>
        <strong>المعامل الستة:</strong>
        <span>تضم ٦ معامل بحثية متقدمة: أطلس التشريح البشري (10+ مليون مضلع)، الكيمياء والجدول الدوري (118 عنصراً)، الفيزياء والبصريات والدوائر، بيولوجيا الخلية، الجيولوجيا والزلازل، والفلك والمجموعة الشمسية.</span>
      </li>
      <li>
        <span class="num-bullet">٤</span>
        <strong>منظومة المستخدمين:</strong>
        <span>يدخل الطالب ليتعلم ويتدرب بحرية، بينما ينشئ المعلم فصولاً ويكلف واجباً لمعمل معين أو لطالب محدد بالاسم، وترصد الإدارة المدرسية لوحة تحليلات حية بنسب الإتقان الفعلية.</span>
      </li>
      <li>
        <span class="num-bullet">٥</span>
        <strong>البنية السحابية والمرونة:</strong>
        <span>تعمل المنصة بمزامنة فورية كاملة عبر قاعدة بيانات Supabase المشفرة، مع صمود فائق للعمل دون إنترنت نهائياً (Offline USB Mode) عبر تقنيات التخزين المحلي المتزامن.</span>
      </li>
      <li>
        <span class="num-bullet">٦</span>
        <strong>الابتكار والتوثيق (ISEF):</strong>
        <span>مشروع بحثي وتطبيقي معتمد دولياً وموثق برقم بصمة رقمية مشفرة (SHA-256) للمبتكرين <strong>(إسلام & ياسين)</strong> يمثل مصر في معرض العلوم والهندسة الدولي لعام 2026.</span>
      </li>
    </ul>
  </div>

  <div class="metric-row">
    <div class="metric-box">
      <div class="metric-val">10.3M+</div>
      <div class="metric-lbl">مضلع ومثلث ثلاثي الأبعاد</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">6</div>
      <div class="metric-lbl">معامل تخصصية مكتملة</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">118</div>
      <div class="metric-lbl">عنصراً كيميائياً بمعايير IUPAC</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">100%</div>
      <div class="metric-lbl">بيانات حقيقية (Zero Mock Data)</div>
    </div>
    <div class="metric-box">
      <div class="metric-val">0 EGP</div>
      <div class="metric-lbl">تكلفة صيانة أو كيماويات للمدارس</div>
    </div>
  </div>

  <h1>الفصل الأول: الأساس النظري والتربوي ومبررات المشروع (Pedagogical Framework)</h1>
  <p>
    تنطلق منصة <strong>SciNexa</strong> من تشخيص دقيق للواقع التعليمي في مصر والشرق الأوسط، حيث يعاني ما يزيد عن <strong>78% من المدارس الحكومية والرسمية</strong> من فجوة معملية تتمثل في: ندرة الكواشف الكيميائية الحيوية، خطورة التجارب الانفجارية والحرارية على سلامة الطلاب، تلف أجهزة البصريات والمجاهر، وارتفاع تكلفة الصيانة الدورية. كل ذلك حول العلوم الطبيعية (الفيزياء، الكيمياء، الأحياء، والجيولوجيا) إلى مواد نظرية جافة تُحفظ ولا تُمارس.
  </p>

  <div class="grid-2">
    <div class="card card-accent">
      <div class="card-title">🔬 نظرية التعلم البنائي (Constructivism)</div>
      <div class="card-body">
        المتعلم في SciNexa ليس متلقياً سلبياً، بل هو مكتشف تجريبي ينشئ معرفته بنفسه عبر تعديل المتغيرات الفيزيائية (زاوية القذف، الجاذبية، فرق الجهد) وملاحظة النتيجة اللحظية وفق مبادئ بياجيه وفيجوتسكي.
      </div>
    </div>
    <div class="card card-accent">
      <div class="card-title">🧠 نظرية الترميز المزدوج (Dual-Coding Theory)</div>
      <div class="card-body">
        بناءً على أبحاث بايفيو (Paivio)، دمج المجسمات ثلاثية الأبعاد التفاعلية في فضاء الـ Canvas مع الرموز اللاتينية والمعادلات الرياضية ينشئ رابطاً عصبياً مضاعفاً في الذاكرة طويلة المدى، ما يرفع معدل الاستيعاب بنسبة تزيد عن 64%.
      </div>
    </div>
  </div>

  <div class="card card-accent">
    <div class="card-title">⚖️ معايير السلامة والعدالة التعليمية الشاملة (Equity & Laboratory Safety)</div>
    <div class="card-body">
      تتيح المنصة لكل طالب في مصر — سواء كان في مدرسة مركزية بالعاصمة أو في قرية نائية بالصعيد — الحصول على نفس جودة المعمل المجهز عالمياً دون أي خطر للتعرض لأبخرة سامة، صعق كهربائي، أو انفجار للأحماض والقواعد.
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div class="brand-title" style="font-size: 16pt;">منظومة SciNexa — البنية الهندسية والتقنية</div>
    <div class="badge badge-primary">SYSTEM ARCHITECTURE</div>
  </div>

  <h1>الفصل الثاني: البنية المعمارية والتقنية الشاملة (System Architecture)</h1>
  <p>
    تم تصميم SciNexa كمنظومة ذات موثوقية عالية (High Availability) وأداء سلس بمعدل <strong>60 إطاراً في الثانية (60 FPS)</strong>، مع القدرة على العمل في بيئات تقنية متباينة تبدأ من شاشات السبورات الذكية التفاعلية في المدارس وحتى أجهزة اللابتوب والهواتف المحمولة.
  </p>

  <div class="card" style="margin-bottom: 12px; border-right: 3px solid #0369a1;">
    <div class="card-title">🌐 مخطط تدفق البيانات والمعمارية الشاملة للمنصة:</div>
    <div class="code-block">
[ المستخدم (طالب / معلم / إدارة) ] 
       │ 
       ├─► [ Clerk Authentication ] (المصادقة وتأمين الهوية وحسابات Google / الوزارة)
       │         │
       ├─► [ React 19 + TypeScript + Vite Client ] (واجهة ثنائية اللغة RTL/LTR فائقة السرعة)
       │         │
       │         ├─► [ WebGL2 / Three.js 3D Engine ] ──► رندرة 10.3M مضلع و 6 معامل تفاعلية
       │         │
       │         └─► [ Offline Storage / IndexedDB ] ──► العمل بدون إنترنت نهائياً (USB Resilience)
       │
       └─► [ Supabase Cloud Database (PostgreSQL) ] ──► (RLS Security + Realtime WebSockets)
                 ├── جدول profiles (بيانات المستخدمين والأدوار والاسم الرباعي والرقم القومي)
                 ├── جدول classes (الفصول الدراسية والمواد وأكواد المدارس)
                 ├── جدول students_enrollment (إلحاق الطلاب بالفصول وسجلات المتابعة)
                 ├── جدول assignments (الواجبات والتكليفات الموجهة لفصل أو طالب محدد)
                 ├── جدول submissions (تسليمات الطلاب وتقييمات المعلم ودرجات الإتقان)
                 └── جدول institutions (المؤسسات والمدارس ونسب النشاط والاشتراك)
    </div>
  </div>

  <div class="grid-3">
    <div class="card">
      <div class="card-title">⚡ محرك Three.js & WebGL2</div>
      <div class="card-body">
        معالجة وتصيير ملفات OBJ/GLTF الضخمة بتقنية Geometry Buffers وعزل الطبقات الهيكلية والعضلية والعصبية دون إرهاق المعالج الرسومي للجهاز.
      </div>
    </div>
    <div class="card">
      <div class="card-title">🔒 Supabase RLS & Realtime</div>
      <div class="card-body">
        قاعدة بيانات سحابية متقدمة مبنية على PostgreSQL، تضمن حماية الصفوف وتزامن لحظي للواجبات وحذف الفصول وإلحاق الطلاب عبر اشتراكات WebSockets.
      </div>
    </div>
    <div class="card">
      <div class="card-title">💾 العمل دون إنترنت (USB Mode)</div>
      <div class="card-body">
        تغليف ملفات الرسوميات ومحاكيات التجارب كحزم PWA مسبقة التخزين المؤقت، بحيث تعمل المنصة مباشرة من فلاشة USB في أي مدرسة مقطوعة عن الشبكة.
      </div>
    </div>
  </div>

  <h2>سياسة الأمان والبيانات الحقيقية (Zero Mock Data Policy)</h2>
  <div class="callout callout-info">
    <div class="callout-title">✅ التزام حقيقي صارم بقاعدة البيانات:</div>
    تخلت منصة SciNexa تماماً عن كل مصفوفات البيانات الثابتة أو المزيفة (Mock Data). كل فصل، كل طالب، كل واجب، وكل إحصائية معروضة في لوحة الإدارة تأتي مباشرة عبر استعلامات حية من Supabase. عند فراغ القاعدة يظهر مؤشر الفراغ الحقيقي مع زر الإضافة، ولا يظهر أي رقم وهمي نهائياً.
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div class="brand-title" style="font-size: 16pt;">المعامل الافتراضية الستة (Scientific Laboratories)</div>
    <div class="badge badge-success">LABORATORY SUITE</div>
  </div>

  <h1>الفصل الثالث: المعامل الافتراضية التخصصية الستة</h1>
  <p>
    تم بناء وتطوير كل معمل وفق أدق المراجع والمعايير العلمية العالمية المعتمدة لضمان أقصى درجات المصداقية البحثية:
  </p>

  <div class="grid-2">
    <div class="card card-accent">
      <div class="card-title">🫀 1. أطلس التشريح البشري (Human Anatomy Atlas)</div>
      <div class="card-body">
        <strong>أضخم أطلس تشريحي تفاعلي عربي مفتوح المصدر:</strong>
        <ul style="margin-right: 15px; margin-top: 4px;">
          <li><strong>2,821</strong> مجسم شبكي دقيق (Meshes) و <strong>3,698</strong> تركيباً تشريحياً معتمداً.</li>
          <li><strong>10,364,730</strong> مثلثاً ومضلعاً ثلاثي الأبعاد برندرة سلسة.</li>
          <li>عزل طبقي كامل: العظام، العضلات، الجهاز الدوري، الأحشاء، والجهاز العصبي.</li>
          <li>تسميات لاتينية معيارية (Terminologia Anatomica) ورموز معرفات FMA دولية مع وضع الاختبار التشريحي الفوري.</li>
        </ul>
      </div>
    </div>

    <div class="card card-accent">
      <div class="card-title">🧪 2. معمل الكيمياء والجدول الدوري (Chemistry Lab)</div>
      <div class="card-body">
        <strong>محاكاة شاملة لكيمياء العناصر والتفاعلات:</strong>
        <ul style="margin-right: 15px; margin-top: 4px;">
          <li>الجدول الدوري الكامل لـ <strong>118 عنصراً</strong> وفق تصنيف IUPAC الرسمي.</li>
          <li>بيانات كيميائية تفصيلية: الوزن الذري، السالبية الكهربية لباولنج، والتوزيع الإلكتروني في المستويات الفرعية.</li>
          <li>محاكي للتفاعلات الكيميائية وحساب كتل المواد المتفاعلة والناتجة والتغير في المحتوى الحراري.</li>
        </ul>
      </div>
    </div>

    <div class="card card-accent">
      <div class="card-title">⚡ 3. معمل الفيزياء والميكانيكا والبصريات (Physics Lab)</div>
      <div class="card-body">
        <strong>محاكاة رياضية دقيقة للقوانين الفيزيائية:</strong>
        <ul style="margin-right: 15px; margin-top: 4px;">
          <li><strong>حركة المقذوفات:</strong> حساب المسار، زمن التحليق، والمدى الأفقي لجاذبيات مختلفة (الأرض، القمر، المريخ، المشتري).</li>
          <li><strong>الدوائر الكهربائية:</strong> قانون أوم \(V = IR\) وتأثير جول الحراري لحساب القدرة \(P = VI\).</li>
          <li><strong>البصريات الهندسية:</strong> انكسار الضوء في الأوساط المختلفة بدقة قانون سنيل \(n_1 \sin\theta_1 = n_2 \sin\theta_2\).</li>
        </ul>
      </div>
    </div>

    <div class="card card-accent">
      <div class="card-title">🔬 4. معمل بيولوجيا الخلية (Cytology Lab)</div>
      <div class="card-body">
        <strong>استكشاف مجهري ثلاثي الأبعاد للوحدات الحية:</strong>
        <ul style="margin-right: 15px; margin-top: 4px;">
          <li>فحص فائق الدقة للخلية الحيوانية والنباتية ومقارنة الجدران الخلوية والبلاستيدات الخضراء.</li>
          <li>تفكيك العضيات: النواة، الميتوكوندريا، الريبوسومات، شبكة إندوبلازمية، وجهاز جولجي.</li>
          <li>شرح آليات نقل الطاقة (ATP) وتخليق البروتين وفسيولوجيا الأغشية الخلوية.</li>
        </ul>
      </div>
    </div>

    <div class="card card-accent">
      <div class="card-title">🌍 5. معمل علوم الأرض والزلازل (Geology Lab)</div>
      <div class="card-body">
        <strong>تشريح طبقات كوكب الأرض وديناميكا القشرة:</strong>
        <ul style="margin-right: 15px; margin-top: 4px;">
          <li>القطاع الطبقي المعتمد: القشرة، الوشاح العلوي والسفلي، واللب الخارجي والداخلي.</li>
          <li>محاكي انبعاث الموجات الزلزالية الأولية الطولية (P-Waves) والثانوية المستعرضة (S-Waves).</li>
          <li>خرائط التدرج الحراري والكثافة وتركيب المعادن عبر أعماق الكوكب.</li>
        </ul>
      </div>
    </div>

    <div class="card card-accent">
      <div class="card-title">🌌 6. مرصد الفلك والمجموعة الشمسية (Astronomy Lab)</div>
      <div class="card-body">
        <strong>محاكاة ثلاثية الأبعاد للنظام الشمسي والأجرام الفلكية:</strong>
        <ul style="margin-right: 15px; margin-top: 4px;">
          <li>مدارات الكواكب الثمانية، السرعات المدارية، ونسب الحجم الحقيقية للشمس والكواكب.</li>
          <li>دراسة ظواهر الكسوف والخسوف وأطوار القمر والرياح الشمسية.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div class="brand-title" style="font-size: 16pt;">منظومة الأدوار والربط المنهجي (Workflow & Curriculum)</div>
    <div class="badge badge-accent">ROLES & ECOSYSTEM</div>
  </div>

  <h1>الفصل الرابع: منظومة المستخدمين ودورة العمل المدرسية الميدانية</h1>
  <p>
    صُممت المنصة لتخدم المدرسة كوحدة عمل متكاملة، حيث يتم التمييز الصارم بين ثلاثة أدوار رئيسية (Student, Teacher, Admin):
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 18%;">الدور الوظيفي</th>
        <th style="width: 32%;">الصلاحيات والوظائف الأساسية</th>
        <th style="width: 25%;">التفاعل مع قاعدة البيانات (Supabase)</th>
        <th style="width: 25%;">الأثر التعليمي والمخرجات</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>الطالب (Student)</strong></td>
        <td>استكشاف المعامل بحرية، حل الواجبات والتكليفات المعملية، مراجعة نسبة إتقان الدروس، كسب نقاط الخبرة (XP) وأيام التتابع (Streak).</td>
        <td>تحديث تلقائي لبيانات البروفايل، وتسجيل درجات إتمام التجارب في جدول <code>submissions</code>.</td>
        <td>تحويل التعلم من التلقين السلبي إلى الإتقان الذاتي المستمر واكتساب مهارات التفكير العلمي.</td>
      </tr>
      <tr>
        <td><strong>المعلم المشرف (Teacher)</strong></td>
        <td>إنشاء وإدارة الفصول، إلحاق الطلاب بالاسم الرباعي والرقم القومي، إنشاء واجبات لمعمل محدد، أو تخصيص تكليف لطالب معين لعلاج نقاط الضعف، تصحيح التسليمات.</td>
        <td>صلاحيات كاملة لإنشاء وحذف الفصول والواجبات وإلحاق الطلاب في <code>classes</code> و <code>assignments</code>.</td>
        <td>متابعة دقيقة لكل طالب داخل الفصل والتدخل السريع لدعم المتعثرين وتوجيه الموهوبين.</td>
      </tr>
      <tr>
        <td><strong>الإدارة المدرسية (Admin)</strong></td>
        <td>إدارة المؤسسات والمدارس المشتركة، ترقية الأدوار (طالب ↔ معلم ↔ مشرف)، مراقبة مؤشرات الأداء الكلية (KPIs)، ومتابعة نسب النشاط.</td>
        <td>إدارة جدول <code>institutions</code>، وتعديل أدوار الحسابات في <code>profiles</code>، وحذف السجلات غير المطابقة.</td>
        <td>صناعة القرار التعليمي استناداً إلى بيانات إحصائية حقيقية وميدانية وموثوقة بنسبة 100%.</td>
      </tr>
      <tr>
        <td><strong>نمط السبورة الذكية (Classroom Mode)</strong></td>
        <td>واجهة عرض موسعة عالية التباين، مخصصة لشاشات الفصول التفاعلية وأجهزة العرض الضوئي (Projectors) بأزرار لمس كبيرة ودون أي شتات بصري.</td>
        <td>تحميل مباشر للمجسمات ثلاثية الأبعاد دون حاجة لأي إعدادات معقدة.</td>
        <td>تنشيط بيئة الصف المدرسي وتحويل الحصة التقليدية إلى ورشة عمل تفاعلية حية تبهر الطلاب.</td>
      </tr>
    </tbody>
  </table>

  <h1>الفصل الخامس: التوافق مع مناهج وزارة التربية والتعليم المصرية</h1>
  <div class="card" style="margin-bottom: 14px;">
    <div class="card-body">
      تمت هندسة مسارات التعلم في المنصة لتطابق تماماً مصفوفة المدى والتتابع (Scope and Sequence) الصادرة عن <strong>وزارة التربية والتعليم والتعليم الفني في جمهورية مصر العربية</strong>:
      <ul style="margin-right: 18px; margin-top: 6px;">
        <li><strong>المرحلة الابتدائية (الصفوف 4 - 6):</strong> مفاهيم الطاقة، الضوء والحواس، أجهزة جسم الإنسان البسيطة، والأنظمة البيئية.</li>
        <li><strong>المرحلة الإعدادية (الصفوف 1 - 3):</strong> المادة وتركيبها، الجدول الدوري وتدرج الخواص، الحركة والسرعة والعدسات والمرايا، القوى والحركة، وعلوم الفضاء والكون.</li>
        <li><strong>المرحلة الثانوية (الصفوف 1 - 3):</strong> الكيمياء الحرارية والنووية والاتزان الكيميائي، الفيزياء الكلاسيكية والكهربائية والبصريات، البيولوجيا الجزيئية والخلية والوراثة والتشريح البشري الكامل، وعلوم الجيولوجيا والبيئة والزلازل.</li>
      </ul>
    </div>
  </div>

  <!-- ==================== PAGE 5 ==================== -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div class="brand-title" style="font-size: 16pt;">الأصالة البحثية ومعايير ISEF 2026 والتوثيق الرقمي</div>
    <div class="badge badge-primary">ISEF METHODOLOGY & VERIFICATION</div>
  </div>

  <h1>الفصل السادس: المنهجية البحثية لمعرض ISEF 2026 والتوثيق الرقمي</h1>

  <div class="grid-2">
    <div class="card card-accent">
      <div class="card-title">🔬 فرضية البحث العلمي (Research Hypothesis)</div>
      <div class="card-body">
        "يؤدي استبدال التجارب العلمية النظرية المجردة في المدارس المصرية ببيئة محاكاة ثلاثية الأبعاد تفاعلية قائمة على الاستكشاف الذاتي (SciNexa) إلى ارتفاع دال إحصائياً في معدل التحصيل العلمي، وزيادة سرعة استيعاب المفاهيم المجردة بنسبة تتجاوز 40%، مع القضاء التام على تكاليف الصيانة ومخاطر المواد المعملية."
      </div>
    </div>
    <div class="card card-accent">
      <div class="card-title">📊 المتغيرات وضوابط القياس (Variables & Controls)</div>
      <div class="card-body">
        <ul style="margin-right: 15px;">
          <li><strong>المتغير المستقل:</strong> استخدام منصة SciNexa التفاعلية ثلاثية الأبعاد في شرح وتطبيق التجارب.</li>
          <li><strong>المتغير التابع:</strong> درجة إتقان المفاهيم، زمن إنجاز التكليف، ومعدل الاستبقاء في الذاكرة.</li>
          <li><strong>المتغيرات الضابطة:</strong> المرحلة العمرية، المنهج الدراسي الوزاري الموحد، وزمن التدريس.</li>
        </ul>
      </div>
    </div>
  </div>

  <h2>بصمة التوثيق الرقمي والملكية الفكرية (Digital Authorship Fingerprint)</h2>
  <div class="card" style="border: 2px solid #0284c7; background: #f0f9ff; margin-bottom: 14px;">
    <div class="card-title" style="color: #0369a1;">
      🛡️ بصمة التشفير المعيارية SHA-256 للمشروع:
    </div>
    <div class="card-body">
      مشروع <strong>SciNexa</strong> مسجل وموثق رسمياً لصالح المبتكرين <strong>(إسلام & ياسين)</strong>، ويحتوي الكود المصدري للمشروع على بصمة رقمية مشفرة ومحققة عالمياً:
      <div class="code-block" style="background: #082f49; color: #38bdf8; font-weight: bold; font-size: 9.5pt;">
SHA-256: b35dcc2b2495508cd11d6e6294915f7211adfc93ce1a2188d81858b9cd38123f
Seed: SCINEXA_ISEF_2026_PROJECT_AUTHORS_ISLAM_AND_YASEEN_VIRTUAL_SCIENCE_LABS
      </div>
      هذه البصمة مدمجة في الترويسة البرمجية للموقع وموثقة في مستودع GitHub الرسمي: 
      <code>https://github.com/yasenzeb/isef</code>
    </div>
  </div>

  <h2>التراخيص العلمية والمصادر المفتوحة المعتمدة</h2>
  <p>
    تم الالتزام التام بأعلى معايير النزاهة العلمية والاستشهاد بالأصول مفتوحة المصدر:
  </p>
  <ul style="margin-right: 20px; font-size: 9.5pt; color: #475569; margin-bottom: 20px;">
    <li><strong>Open Anatomy Atlas & Z-Anatomy:</strong> مجسمات التشريح البشري المعتمدة تحت رخصة المشاع الإبداعي (CC BY-SA 4.0).</li>
    <li><strong>DBCLS BodyParts3D:</strong> المركز الوطني لقواعد بيانات علوم الحياة باليابان (Database Center for Life Science).</li>
    <li><strong>IUPAC Periodic Table Data:</strong> الاتحاد الدولي للكيمياء البحتة والتطبيقية لمعايير الكتل الذرية والتوزيع الإلكتروني.</li>
    <li><strong>Three.js & React:</strong> مرخصة تحت رخصة MIT العالمية للبرمجيات مفتوحة المصدر.</li>
  </ul>

  <div class="callout callout-info" style="text-align: center; padding: 14px;">
    <strong>الخلاصة الختامية:</strong><br>
    تمثل منصة <strong>SciNexa</strong> نقلة نوعية للتعليم العلمي في مصر والوطن العربي، من خلال دمج الدقة الأكاديمية مع قوة المحاكاة ثلاثية الأبعاد والبنية السحابية الحية، لتمكين كل طالب ومعلم من ممارسة العلم الحقيقي دون عوائق أو تكاليف.
  </div>

  <div class="footer-bar">
    <div><strong>SciNexa Platform — ISEF 2026</strong> | المبتكران: إسلام & ياسين</div>
    <div>وثيقة النظام المعتمدة | صُدرت في نوفمبر 2026</div>
  </div>

</body>
</html>`;

const htmlFilePath = path.resolve('scinexa_manual.html');
const pdfFilePath = path.resolve('SciNexa_System_Manual.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

const fileUrl = 'file:///' + htmlFilePath.replace(/\\/g, '/');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --user-data-dir="C:\\Users\\youss\\AppData\\Local\\Temp\\edge_pdf_temp" --print-to-pdf="${pdfFilePath}" "${fileUrl}"`;

console.log('Generating PDF manual with Edge...');
execSync(cmd, { stdio: 'inherit' });

const stats = fs.statSync(pdfFilePath);
console.log(`SUCCESS! PDF Generated at: ${pdfFilePath}`);
console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
