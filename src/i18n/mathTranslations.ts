/**
 * mathTranslations.ts — all Math Lab UI strings in the 4 platform languages (en · ar · fr · de).
 * Self-contained on purpose: it does NOT modify src/i18n/translations.ts.
 */
import type { Language } from './translations';
import type { ShapeKind } from '../utils/mathEngine';

export interface MathStrings {
  badge: string; title: string; subtitle: string;
  tabFunctions: string; tabGeometry: string; tabGrid: string; tabSlope: string;

  // f(x) table
  fxTitle: string; fxExprLabel: string; fxSyntax: string; fxFrom: string; fxTo: string; fxStep: string;
  fxAngle: string; fxRad: string; fxDeg: string; fxPresets: string; fxUndefined: string;
  fxErrEmpty: string; fxErrInvalid: string; fxErrStep: string; fxErrRange: string; fxTruncated: string;
  fxGraph: string; fxRows: string;

  // Pythagoras & Euclid
  geoPyth: string; geoEuclid: string;
  pythTitle: string; pythSolveFor: string; pythLegA: string; pythLegB: string; pythHyp: string;
  pythResult: string; pythTriples: string; pythCheckTitle: string; pythCheckDesc: string;
  pythIsRight: string; pythNotRight: string; pythErrNeedTwo: string; pythErrPositive: string; pythErrHyp: string;
  pythSquares: string;
  euTitle: string; euIntro: string; euEnter: string; euRelations: string;
  euErrNeedTwo: string; euErrPositive: string; euErrInconsistent: string; euTwoSolutions: string; euSolved: string;

  // coordinate grid
  gridTitle: string; gridHint: string; gridRange: string; gridSnap: string; gridLengths: string;
  gridFill: string; gridOpacity: string; gridUndo: string; gridClear: string; gridQuick: string;
  qTriangle: string; qSquare: string; qRectangle: string; qParallelogram: string; qTrapezoid: string;
  gridAddByCoords: string; gridAdd: string; gridPoints: string; gridDelete: string; gridShape: string;
  gridArea: string; gridPerimeter: string; gridSides: string; gridLength: string; gridSlope: string;
  gridVertical: string; gridNeedMore: string; gridMax: string; gridDuplicate: string;
  gridNotSimple: string; gridConcave: string; gridConvex: string; gridSideCount: string; gridMidpoint: string;
  gridShapes: string; gridComplete: string; gridAllDone: string; gridOriginal: string; gridImage: string; gridShapeN: string; gridFillFor: string;
  shapes: Record<ShapeKind, string>;

  // slope laws
  slopeTitle: string; slopeIntro: string; slopeVerified: string; slopeVertical: string; slopeInvalid: string;
  slopeZeroDen: string; slopeParallelYes: string; slopeParallelNo: string; slopePerpYes: string; slopePerpNo: string;
  slopeResult: string; slopeSteps: string; slopeLawWord: string;

  // calculator
  calcButton: string; calcTitle: string; calcClose: string; calcError: string; calcHistory: string; calcHint: string; calcDrag: string;
}

const enStrings: MathStrings = {
    badge: 'Mathematics Lab',
    title: 'Functions, Geometry & Coordinates',
    subtitle: 'Build tables, solve theorems, plot shapes and test the slope laws — live.',
    tabFunctions: 'f(x) Table', tabGeometry: 'Pythagoras & Euclid', tabGrid: 'Coordinate Grid', tabSlope: 'Slope Laws',

    fxTitle: 'Function table f(x)', fxExprLabel: 'Function', fxSyntax: 'Use x, + − × ÷ ^, ( ), sqrt, abs, sin, cos, tan, ln, log, π, e. Writing 2x or (x+1)(x−1) works.',
    fxFrom: 'x from', fxTo: 'to', fxStep: 'step', fxAngle: 'Angles', fxRad: 'Radians', fxDeg: 'Degrees', fxPresets: 'Examples',
    fxUndefined: 'undefined', fxErrEmpty: 'Type a function of x to see its table.', fxErrInvalid: 'This expression could not be read. Check brackets and operators.',
    fxErrStep: 'The step cannot be 0.', fxErrRange: 'Enter valid numbers for the range and step.', fxTruncated: 'Showing the first 201 rows — increase the step to see more of the range.',
    fxGraph: 'Graph', fxRows: '{n} rows',

    geoPyth: 'Pythagoras', geoEuclid: 'Euclid',
    pythTitle: 'Pythagorean theorem', pythSolveFor: 'Find', pythLegA: 'Leg a', pythLegB: 'Leg b', pythHyp: 'Hypotenuse c',
    pythResult: 'Result', pythTriples: 'Common triples', pythCheckTitle: 'Is it a right triangle?', pythCheckDesc: 'Enter three side lengths (the converse of the theorem).',
    pythIsRight: 'Yes — it is a right triangle', pythNotRight: 'No — it is not a right triangle',
    pythErrNeedTwo: 'Enter the two known sides.', pythErrPositive: 'Lengths must be positive.', pythErrHyp: 'The hypotenuse must be longer than a leg.',
    pythSquares: 'Squares on the sides',
    euTitle: "Euclid's theorems", euIntro: 'Right angle at A, and AD ⟂ BC (D lies on BC).', euEnter: 'Enter any two lengths — everything else is solved.',
    euRelations: 'The relations', euErrNeedTwo: 'Enter at least two lengths.', euErrPositive: 'Lengths must be positive.',
    euErrInconsistent: 'These two values cannot belong to the same right triangle.', euTwoSolutions: 'Two mirror triangles fit (BD and DC can swap). The one with BD ≤ DC is shown.', euSolved: 'Solved triangle',

    gridTitle: 'Coordinate grid', gridHint: 'Click the grid to add a point. Drag a point to move it. Points are joined in order.',
    gridRange: 'Grid size', gridSnap: 'Snap to whole numbers', gridLengths: 'Show side lengths', gridFill: 'Fill colour', gridOpacity: 'Opacity',
    gridUndo: 'Undo', gridClear: 'Clear', gridQuick: 'Quick shapes',
    qTriangle: 'Triangle', qSquare: 'Square', qRectangle: 'Rectangle', qParallelogram: 'Parallelogram', qTrapezoid: 'Trapezoid',
    gridAddByCoords: 'Add by coordinates', gridAdd: 'Add', gridPoints: 'Points', gridDelete: 'Delete', gridShape: 'Shape',
    gridArea: 'Area', gridPerimeter: 'Perimeter', gridSides: 'Sides', gridLength: 'Length', gridSlope: 'Slope', gridVertical: 'vertical',
    gridNeedMore: 'Add at least 3 points to form a shape.', gridMax: 'Maximum of 12 points.', gridDuplicate: 'There is already a point there.',
    gridNotSimple: 'The sides cross each other — change the order of the points.', gridConcave: 'Concave', gridConvex: 'Convex', gridSideCount: '{n} sides', gridMidpoint: 'Midpoint',
    gridShapes: 'Number of shapes', gridComplete: 'Shape complete', gridAllDone: 'All the shapes are complete. Raise the number of shapes to draw another one.', gridOriginal: 'Original', gridImage: 'Image', gridShapeN: 'Shape {n}', gridFillFor: 'Colour of',
    shapes: {
      point: 'Point', segment: 'Line segment', equilateral: 'Equilateral triangle', isoscelesRight: 'Isosceles right triangle', rightTriangle: 'Right triangle',
      isosceles: 'Isosceles triangle', scalene: 'Scalene triangle', square: 'Square', rectangle: 'Rectangle', rhombus: 'Rhombus', parallelogram: 'Parallelogram',
      isoscelesTrapezoid: 'Isosceles trapezoid', trapezoid: 'Trapezoid', kite: 'Kite', quadrilateral: 'Quadrilateral', regular: 'Regular polygon', polygon: 'Polygon',
      degenerate: 'Points on one straight line',
    },

    slopeTitle: 'The 6 slope laws', slopeIntro: 'Type numbers in the boxes — the empty box is the unknown. Every law shows its working.',
    slopeVerified: 'Self-check passed: {n} tests', slopeVertical: 'Undefined — the line is vertical', slopeInvalid: 'Check the values you entered',
    slopeZeroDen: 'x must not be 0', slopeParallelYes: 'Parallel ✓', slopeParallelNo: 'Not parallel ✗', slopePerpYes: 'Perpendicular ✓', slopePerpNo: 'Not perpendicular ✗',
    slopeResult: 'Result', slopeSteps: 'Working', slopeLawWord: 'Law',
    calcButton: 'Calculator', calcTitle: 'Calculator', calcClose: 'Close', calcError: 'Cannot calculate this', calcHistory: 'History', calcHint: 'Type or tap. Enter = equals.', calcDrag: 'Drag to move',
  };

export const mathStrings: Record<Language, MathStrings> = {
  en: enStrings,
  ar: {
    badge: 'معمل الرياضيات',
    title: 'الدوال والهندسة والإحداثيات',
    subtitle: 'ابنِ الجداول، وحُلّ النظريات، وارسم الأشكال، وجرّب قوانين الميل — مباشرةً.',
    tabFunctions: 'جدول f(x)', tabGeometry: 'فيثاغورس وإقليدس', tabGrid: 'الشبكة التربيعية', tabSlope: 'قوانين الميل',

    fxTitle: 'جدول الدالة f(x)', fxExprLabel: 'الدالة', fxSyntax: 'استخدم x و + − × ÷ ^ و ( ) و sqrt و abs و sin و cos و tan و ln و log و π و e. كتابة 2x أو (x+1)(x−1) مقبولة.',
    fxFrom: 'x من', fxTo: 'إلى', fxStep: 'الخطوة', fxAngle: 'الزوايا', fxRad: 'راديان', fxDeg: 'درجات', fxPresets: 'أمثلة',
    fxUndefined: 'غير معرّف', fxErrEmpty: 'اكتب دالة بدلالة x لعرض جدولها.', fxErrInvalid: 'تعذّرت قراءة هذه العبارة. راجع الأقواس والعمليات.',
    fxErrStep: 'لا يمكن أن تكون الخطوة صفرًا.', fxErrRange: 'أدخل أرقامًا صحيحة للمدى والخطوة.', fxTruncated: 'تم عرض أول 201 صف — كبّر الخطوة لرؤية بقية المدى.',
    fxGraph: 'المنحنى', fxRows: '{n} صفًا',

    geoPyth: 'فيثاغورس', geoEuclid: 'إقليدس',
    pythTitle: 'نظرية فيثاغورس', pythSolveFor: 'أوجد', pythLegA: 'الضلع a', pythLegB: 'الضلع b', pythHyp: 'الوتر c',
    pythResult: 'الناتج', pythTriples: 'ثلاثيات شائعة', pythCheckTitle: 'هل المثلث قائم الزاوية؟', pythCheckDesc: 'أدخل أطوال الأضلاع الثلاثة (عكس النظرية).',
    pythIsRight: 'نعم — المثلث قائم الزاوية', pythNotRight: 'لا — المثلث ليس قائم الزاوية',
    pythErrNeedTwo: 'أدخل الضلعين المعلومين.', pythErrPositive: 'يجب أن تكون الأطوال موجبة.', pythErrHyp: 'يجب أن يكون الوتر أطول من أي ضلع قائم.',
    pythSquares: 'المربعات المنشأة على الأضلاع',
    euTitle: 'نظريات إقليدس', euIntro: 'الزاوية القائمة عند A، و AD ⟂ BC (النقطة D على BC).', euEnter: 'أدخل أي طولين — وسيُحَل الباقي تلقائيًا.',
    euRelations: 'العلاقات', euErrNeedTwo: 'أدخل طولين على الأقل.', euErrPositive: 'يجب أن تكون الأطوال موجبة.',
    euErrInconsistent: 'لا يمكن أن تنتمي هاتان القيمتان إلى نفس المثلث القائم.', euTwoSolutions: 'يوجد مثلثان متناظران (يمكن تبديل BD و DC). المعروض هو الذي فيه BD ≤ DC.', euSolved: 'المثلث بعد الحل',

    gridTitle: 'الشبكة التربيعية', gridHint: 'اضغط على الشبكة لإضافة نقطة. اسحب النقطة لتحريكها. تُوصَل النقاط بالترتيب.',
    gridRange: 'حجم الشبكة', gridSnap: 'الالتصاق بالأعداد الصحيحة', gridLengths: 'إظهار أطوال الأضلاع', gridFill: 'لون التعبئة', gridOpacity: 'الشفافية',
    gridUndo: 'تراجع', gridClear: 'مسح', gridQuick: 'أشكال سريعة',
    qTriangle: 'مثلث', qSquare: 'مربع', qRectangle: 'مستطيل', qParallelogram: 'متوازي أضلاع', qTrapezoid: 'شبه منحرف',
    gridAddByCoords: 'إضافة بالإحداثيات', gridAdd: 'إضافة', gridPoints: 'النقاط', gridDelete: 'حذف', gridShape: 'الشكل',
    gridArea: 'المساحة', gridPerimeter: 'المحيط', gridSides: 'الأضلاع', gridLength: 'الطول', gridSlope: 'الميل', gridVertical: 'رأسي',
    gridNeedMore: 'أضف 3 نقاط على الأقل لتكوين شكل.', gridMax: 'الحد الأقصى 12 نقطة.', gridDuplicate: 'توجد نقطة في هذا المكان بالفعل.',
    gridNotSimple: 'الأضلاع تتقاطع — غيّر ترتيب النقاط.', gridConcave: 'مقعّر', gridConvex: 'محدّب', gridSideCount: '{n} أضلاع', gridMidpoint: 'نقطة المنتصف',
    gridShapes: 'عدد الأشكال', gridComplete: 'اكتمل الشكل', gridAllDone: 'اكتملت كل الأشكال. زِد عدد الأشكال لرسم شكل آخر.', gridOriginal: 'الأصل', gridImage: 'الصورة', gridShapeN: 'الشكل {n}', gridFillFor: 'لون',
    shapes: {
      point: 'نقطة', segment: 'قطعة مستقيمة', equilateral: 'مثلث متساوي الأضلاع', isoscelesRight: 'مثلث قائم متساوي الساقين', rightTriangle: 'مثلث قائم الزاوية',
      isosceles: 'مثلث متساوي الساقين', scalene: 'مثلث مختلف الأضلاع', square: 'مربع', rectangle: 'مستطيل', rhombus: 'معين', parallelogram: 'متوازي أضلاع',
      isoscelesTrapezoid: 'شبه منحرف متساوي الساقين', trapezoid: 'شبه منحرف', kite: 'طائرة ورقية', quadrilateral: 'شكل رباعي', regular: 'مضلع منتظم', polygon: 'مضلع',
      degenerate: 'نقاط على استقامة واحدة',
    },

    slopeTitle: 'قوانين الميل الستة', slopeIntro: 'اكتب الأرقام في الخانات — الخانة الفارغة هي المجهول. كل قانون يعرض خطوات الحل.',
    slopeVerified: 'اجتاز الفحص الذاتي: {n} اختبارًا', slopeVertical: 'غير معرّف — المستقيم رأسي', slopeInvalid: 'راجع القيم التي أدخلتها',
    slopeZeroDen: 'يجب ألّا تساوي x صفرًا', slopeParallelYes: 'متوازيان ✓', slopeParallelNo: 'غير متوازيين ✗', slopePerpYes: 'متعامدان ✓', slopePerpNo: 'غير متعامدين ✗',
    slopeResult: 'الناتج', slopeSteps: 'خطوات الحل', slopeLawWord: 'القانون',
    calcButton: 'آلة حاسبة', calcTitle: 'آلة حاسبة', calcClose: 'إغلاق', calcError: 'تعذّر الحساب', calcHistory: 'السجل', calcHint: 'اكتب أو اضغط. Enter = يساوي.', calcDrag: 'اسحب لتحريك الآلة',
  },

  /* ───────────────────────────── Français ───────────────────────────── */
  fr: {
    badge: 'Laboratoire de mathématiques',
    title: 'Fonctions, géométrie et coordonnées',
    subtitle: 'Créez des tableaux, résolvez des théorèmes, tracez des figures et testez les lois de la pente — en direct.',
    tabFunctions: 'Tableau f(x)', tabGeometry: 'Pythagore et Euclide', tabGrid: 'Grille de coordonnées', tabSlope: 'Lois de la pente',

    fxTitle: 'Tableau de valeurs de f(x)', fxExprLabel: 'Fonction', fxSyntax: 'Utilisez x, + − × ÷ ^, ( ), sqrt, abs, sin, cos, tan, ln, log, π, e. Écrire 2x ou (x+1)(x−1) fonctionne.',
    fxFrom: 'x de', fxTo: 'à', fxStep: 'pas', fxAngle: 'Angles', fxRad: 'Radians', fxDeg: 'Degrés', fxPresets: 'Exemples',
    fxUndefined: 'non défini', fxErrEmpty: 'Saisissez une fonction de x pour voir son tableau.', fxErrInvalid: 'Cette expression est illisible. Vérifiez les parenthèses et les opérateurs.',
    fxErrStep: 'Le pas ne peut pas être 0.', fxErrRange: 'Saisissez des nombres valides pour l’intervalle et le pas.', fxTruncated: 'Affichage des 201 premières lignes — augmentez le pas pour voir plus d’intervalle.',
    fxGraph: 'Courbe', fxRows: '{n} lignes',

    geoPyth: 'Pythagore', geoEuclid: 'Euclide',
    pythTitle: 'Théorème de Pythagore', pythSolveFor: 'Trouver', pythLegA: 'Côté a', pythLegB: 'Côté b', pythHyp: 'Hypoténuse c',
    pythResult: 'Résultat', pythTriples: 'Triplets courants', pythCheckTitle: 'Le triangle est-il rectangle ?', pythCheckDesc: 'Saisissez les trois longueurs (réciproque du théorème).',
    pythIsRight: 'Oui — le triangle est rectangle', pythNotRight: 'Non — le triangle n’est pas rectangle',
    pythErrNeedTwo: 'Saisissez les deux côtés connus.', pythErrPositive: 'Les longueurs doivent être positives.', pythErrHyp: 'L’hypoténuse doit être plus longue qu’un côté de l’angle droit.',
    pythSquares: 'Carrés construits sur les côtés',
    euTitle: 'Théorèmes d’Euclide', euIntro: 'Angle droit en A, et AD ⟂ BC (D est sur BC).', euEnter: 'Saisissez deux longueurs — le reste est calculé.',
    euRelations: 'Les relations', euErrNeedTwo: 'Saisissez au moins deux longueurs.', euErrPositive: 'Les longueurs doivent être positives.',
    euErrInconsistent: 'Ces deux valeurs ne peuvent pas appartenir au même triangle rectangle.', euTwoSolutions: 'Deux triangles symétriques conviennent (BD et DC peuvent être échangés). Celui avec BD ≤ DC est affiché.', euSolved: 'Triangle résolu',

    gridTitle: 'Grille de coordonnées', gridHint: 'Cliquez sur la grille pour ajouter un point. Faites glisser un point pour le déplacer. Les points sont reliés dans l’ordre.',
    gridRange: 'Taille de la grille', gridSnap: 'Aimanter aux nombres entiers', gridLengths: 'Afficher les longueurs', gridFill: 'Couleur de remplissage', gridOpacity: 'Opacité',
    gridUndo: 'Annuler', gridClear: 'Effacer', gridQuick: 'Figures rapides',
    qTriangle: 'Triangle', qSquare: 'Carré', qRectangle: 'Rectangle', qParallelogram: 'Parallélogramme', qTrapezoid: 'Trapèze',
    gridAddByCoords: 'Ajouter par coordonnées', gridAdd: 'Ajouter', gridPoints: 'Points', gridDelete: 'Supprimer', gridShape: 'Figure',
    gridArea: 'Aire', gridPerimeter: 'Périmètre', gridSides: 'Côtés', gridLength: 'Longueur', gridSlope: 'Pente', gridVertical: 'verticale',
    gridNeedMore: 'Ajoutez au moins 3 points pour former une figure.', gridMax: '12 points au maximum.', gridDuplicate: 'Il y a déjà un point ici.',
    gridNotSimple: 'Les côtés se croisent — changez l’ordre des points.', gridConcave: 'Concave', gridConvex: 'Convexe', gridSideCount: '{n} côtés', gridMidpoint: 'Milieu',
    gridShapes: 'Nombre de figures', gridComplete: 'Figure terminée', gridAllDone: 'Toutes les figures sont terminées. Augmentez le nombre de figures pour en dessiner une autre.', gridOriginal: 'Figure initiale', gridImage: 'Image', gridShapeN: 'Figure {n}', gridFillFor: 'Couleur de',
    shapes: {
      point: 'Point', segment: 'Segment', equilateral: 'Triangle équilatéral', isoscelesRight: 'Triangle rectangle isocèle', rightTriangle: 'Triangle rectangle',
      isosceles: 'Triangle isocèle', scalene: 'Triangle quelconque', square: 'Carré', rectangle: 'Rectangle', rhombus: 'Losange', parallelogram: 'Parallélogramme',
      isoscelesTrapezoid: 'Trapèze isocèle', trapezoid: 'Trapèze', kite: 'Cerf-volant', quadrilateral: 'Quadrilatère', regular: 'Polygone régulier', polygon: 'Polygone',
      degenerate: 'Points alignés',
    },

    slopeTitle: 'Les 6 lois de la pente', slopeIntro: 'Saisissez des nombres — la case vide est l’inconnue. Chaque loi montre son calcul.',
    slopeVerified: 'Auto-vérification réussie : {n} tests', slopeVertical: 'Non définie — la droite est verticale', slopeInvalid: 'Vérifiez les valeurs saisies',
    slopeZeroDen: 'x ne doit pas être 0', slopeParallelYes: 'Parallèles ✓', slopeParallelNo: 'Non parallèles ✗', slopePerpYes: 'Perpendiculaires ✓', slopePerpNo: 'Non perpendiculaires ✗',
    slopeResult: 'Résultat', slopeSteps: 'Calcul', slopeLawWord: 'Loi',
    calcButton: 'Calculatrice', calcTitle: 'Calculatrice', calcClose: 'Fermer', calcError: 'Calcul impossible', calcHistory: 'Historique', calcHint: 'Saisissez ou touchez. Entrée = égal.', calcDrag: 'Glisser pour déplacer',
  },

  /* ───────────────────────────── Deutsch ───────────────────────────── */
  de: {
    badge: 'Mathematik-Labor',
    title: 'Funktionen, Geometrie & Koordinaten',
    subtitle: 'Erstelle Tabellen, löse Sätze, zeichne Figuren und teste die Steigungsgesetze – live.',
    tabFunctions: 'f(x)-Tabelle', tabGeometry: 'Pythagoras & Euklid', tabGrid: 'Koordinatengitter', tabSlope: 'Steigungsgesetze',

    fxTitle: 'Wertetabelle f(x)', fxExprLabel: 'Funktion', fxSyntax: 'Verwende x, + − × ÷ ^, ( ), sqrt, abs, sin, cos, tan, ln, log, π, e. Schreibweisen wie 2x oder (x+1)(x−1) funktionieren.',
    fxFrom: 'x von', fxTo: 'bis', fxStep: 'Schrittweite', fxAngle: 'Winkel', fxRad: 'Bogenmaß', fxDeg: 'Grad', fxPresets: 'Beispiele',
    fxUndefined: 'nicht definiert', fxErrEmpty: 'Gib eine Funktion von x ein, um die Tabelle zu sehen.', fxErrInvalid: 'Dieser Ausdruck ist nicht lesbar. Prüfe Klammern und Operatoren.',
    fxErrStep: 'Die Schrittweite darf nicht 0 sein.', fxErrRange: 'Gib gültige Zahlen für Bereich und Schrittweite ein.', fxTruncated: 'Die ersten 201 Zeilen werden angezeigt – erhöhe die Schrittweite, um mehr vom Bereich zu sehen.',
    fxGraph: 'Graph', fxRows: '{n} Zeilen',

    geoPyth: 'Pythagoras', geoEuclid: 'Euklid',
    pythTitle: 'Satz des Pythagoras', pythSolveFor: 'Berechne', pythLegA: 'Kathete a', pythLegB: 'Kathete b', pythHyp: 'Hypotenuse c',
    pythResult: 'Ergebnis', pythTriples: 'Häufige Tripel', pythCheckTitle: 'Ist das Dreieck rechtwinklig?', pythCheckDesc: 'Gib drei Seitenlängen ein (Umkehrung des Satzes).',
    pythIsRight: 'Ja – das Dreieck ist rechtwinklig', pythNotRight: 'Nein – das Dreieck ist nicht rechtwinklig',
    pythErrNeedTwo: 'Gib die beiden bekannten Seiten ein.', pythErrPositive: 'Längen müssen positiv sein.', pythErrHyp: 'Die Hypotenuse muss länger als eine Kathete sein.',
    pythSquares: 'Quadrate über den Seiten',
    euTitle: 'Sätze des Euklid', euIntro: 'Rechter Winkel bei A und AD ⟂ BC (D liegt auf BC).', euEnter: 'Gib zwei beliebige Längen ein – der Rest wird berechnet.',
    euRelations: 'Die Beziehungen', euErrNeedTwo: 'Gib mindestens zwei Längen ein.', euErrPositive: 'Längen müssen positiv sein.',
    euErrInconsistent: 'Diese beiden Werte können nicht zum selben rechtwinkligen Dreieck gehören.', euTwoSolutions: 'Zwei spiegelbildliche Dreiecke passen (BD und DC können getauscht werden). Gezeigt wird das mit BD ≤ DC.', euSolved: 'Gelöstes Dreieck',

    gridTitle: 'Koordinatengitter', gridHint: 'Klicke ins Gitter, um einen Punkt zu setzen. Ziehe einen Punkt, um ihn zu verschieben. Die Punkte werden der Reihe nach verbunden.',
    gridRange: 'Gittergröße', gridSnap: 'An ganze Zahlen einrasten', gridLengths: 'Seitenlängen anzeigen', gridFill: 'Füllfarbe', gridOpacity: 'Deckkraft',
    gridUndo: 'Rückgängig', gridClear: 'Leeren', gridQuick: 'Schnellformen',
    qTriangle: 'Dreieck', qSquare: 'Quadrat', qRectangle: 'Rechteck', qParallelogram: 'Parallelogramm', qTrapezoid: 'Trapez',
    gridAddByCoords: 'Per Koordinaten hinzufügen', gridAdd: 'Hinzufügen', gridPoints: 'Punkte', gridDelete: 'Löschen', gridShape: 'Figur',
    gridArea: 'Fläche', gridPerimeter: 'Umfang', gridSides: 'Seiten', gridLength: 'Länge', gridSlope: 'Steigung', gridVertical: 'senkrecht',
    gridNeedMore: 'Setze mindestens 3 Punkte, um eine Figur zu bilden.', gridMax: 'Höchstens 12 Punkte.', gridDuplicate: 'Dort liegt bereits ein Punkt.',
    gridNotSimple: 'Die Seiten kreuzen sich – ändere die Reihenfolge der Punkte.', gridConcave: 'Konkav', gridConvex: 'Konvex', gridSideCount: '{n} Seiten', gridMidpoint: 'Mittelpunkt',
    gridShapes: 'Anzahl der Figuren', gridComplete: 'Figur fertig', gridAllDone: 'Alle Figuren sind fertig. Erhöhe die Anzahl der Figuren, um eine weitere zu zeichnen.', gridOriginal: 'Urbild', gridImage: 'Bild', gridShapeN: 'Figur {n}', gridFillFor: 'Farbe von',
    shapes: {
      point: 'Punkt', segment: 'Strecke', equilateral: 'Gleichseitiges Dreieck', isoscelesRight: 'Gleichschenklig-rechtwinkliges Dreieck', rightTriangle: 'Rechtwinkliges Dreieck',
      isosceles: 'Gleichschenkliges Dreieck', scalene: 'Ungleichseitiges Dreieck', square: 'Quadrat', rectangle: 'Rechteck', rhombus: 'Raute', parallelogram: 'Parallelogramm',
      isoscelesTrapezoid: 'Gleichschenkliges Trapez', trapezoid: 'Trapez', kite: 'Drachenviereck', quadrilateral: 'Viereck', regular: 'Regelmäßiges Vieleck', polygon: 'Vieleck',
      degenerate: 'Punkte auf einer Geraden',
    },

    slopeTitle: 'Die 6 Steigungsgesetze', slopeIntro: 'Trage Zahlen ein – das leere Feld ist die Unbekannte. Jedes Gesetz zeigt den Rechenweg.',
    slopeVerified: 'Selbsttest bestanden: {n} Tests', slopeVertical: 'Nicht definiert – die Gerade ist senkrecht', slopeInvalid: 'Prüfe die eingegebenen Werte',
    slopeZeroDen: 'x darf nicht 0 sein', slopeParallelYes: 'Parallel ✓', slopeParallelNo: 'Nicht parallel ✗', slopePerpYes: 'Senkrecht zueinander ✓', slopePerpNo: 'Nicht senkrecht ✗',
    slopeResult: 'Ergebnis', slopeSteps: 'Rechenweg', slopeLawWord: 'Gesetz',
    calcButton: 'Taschenrechner', calcTitle: 'Taschenrechner', calcClose: 'Schließen', calcError: 'Berechnung nicht möglich', calcHistory: 'Verlauf', calcHint: 'Tippen oder eingeben. Enter = Ergebnis.', calcDrag: 'Zum Verschieben ziehen',
  },
  ja: {
    ...enStrings,
    badge: '数学ラボ',
    title: '関数・幾何学・座標平面',
    subtitle: '関数グラフ、幾何学定理、座標プロット、傾きの法則をリアルタイムで検証。',
    tabFunctions: 'f(x) テーブル',
    tabGeometry: 'ピタゴラスとユークリッド',
    tabGrid: '座標グリッド',
    tabSlope: '傾きの法則',
    geoPyth: 'ピタゴラス',
    geoEuclid: 'ユークリッド',
    pythTitle: 'ピタゴラスの定理',
    euTitle: 'ユークリッドの定理',
    gridTitle: 'インタラクティブ座標平面',
    slopeTitle: '直線の傾きの法則 (6つの公式)',
    calcButton: 'ステップ計算機',
    calcTitle: 'ステップバイステップ計算機',
  }
};

/** Replaces `{n}` in a template string. */
export const tpl = (s: string, n: number | string): string => s.replace('{n}', String(n));