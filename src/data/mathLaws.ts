/**
 * mathLaws.ts — the 6 slope (الميل) laws, written in one place.
 * To change a law: edit its entry here (formula, inputs, compute). The UI is generated from this list.
 * Every compute() delegates to src/utils/mathEngine.ts, which is checked by `npm run verify`.
 */
import type { Language } from '../i18n/translations';
import { fmt, slope, type SlopeErr } from '../utils/mathEngine';

export type L4 = Record<'en' | 'ar' | 'fr' | 'de', string> & Partial<Record<'ja', string>>;

export interface LawInput {
  key: string;
  /** symbol shown on the box, e.g. "x₁", "θ (°)" */
  sym: string;
  /** example value pre-filled so the card shows a worked result immediately */
  def: string;
}

export type Verdict = 'parallel' | 'notParallel' | 'perpendicular' | 'notPerpendicular';

export type LawResult =
  | { kind: 'value'; sym: string; text: string; steps: string[]; verdict?: Verdict }
  | { kind: 'error'; err: SlopeErr };

export interface LawMode {
  id: string;
  /** language-neutral label (formula shaped) */
  label: string;
  formula: string;
  inputs: LawInput[];
  compute: (v: Record<string, number>) => LawResult;
}

export interface SlopeLaw {
  id: number;
  name: L4;
  note: L4;
  modes: LawMode[];
}

/** wraps negatives in brackets for readable working: 3 − (−2) */
const b = (n: number): string => (n < 0 ? `(${fmt(n)})` : fmt(n));

const fail = (err: SlopeErr): LawResult => ({ kind: 'error', err });
const isErr = (r: number | SlopeErr): r is SlopeErr => typeof r === 'string';

export const SLOPE_LAWS: SlopeLaw[] = [
  /* ── 1 ── slope through two points */
  {
    id: 1,
    name: {
      en: 'Slope through two points', ar: 'ميل المستقيم المار بنقطتين',
      fr: 'Pente d’une droite par deux points', de: 'Steigung durch zwei Punkte',
    },
    note: {
      en: 'If x₁ = x₂ the line is vertical and its slope is undefined. If y₁ = y₂ the line is horizontal and m = 0.',
      ar: 'إذا كان x₁ = x₂ فالمستقيم رأسي وميله غير معرّف. وإذا كان y₁ = y₂ فالمستقيم أفقي وميله صفر.',
      fr: 'Si x₁ = x₂ la droite est verticale et sa pente n’est pas définie. Si y₁ = y₂ elle est horizontale et m = 0.',
      de: 'Ist x₁ = x₂, ist die Gerade senkrecht und die Steigung nicht definiert. Ist y₁ = y₂, ist sie waagerecht und m = 0.',
    },
    modes: [{
      id: 'points',
      label: 'm = (y₂ − y₁) / (x₂ − x₁)',
      formula: 'm = (y₂ − y₁) / (x₂ − x₁)',
      inputs: [
        { key: 'x1', sym: 'x₁', def: '1' }, { key: 'y1', sym: 'y₁', def: '2' },
        { key: 'x2', sym: 'x₂', def: '3' }, { key: 'y2', sym: 'y₂', def: '6' },
      ],
      compute: ({ x1, y1, x2, y2 }) => {
        const m = slope.fromPoints(x1, y1, x2, y2);
        if (isErr(m)) return fail(m);
        return {
          kind: 'value', sym: 'm', text: fmt(m),
          steps: [
            `m = (${b(y2)} − ${b(y1)}) / (${b(x2)} − ${b(x1)})`,
            `m = ${fmt(y2 - y1)} / ${fmt(x2 - x1)}`,
            `m = ${fmt(m)}`,
          ],
        };
      },
    }],
  },

  /* ── 2 ── slope and angle: m = tan θ */
  {
    id: 2,
    name: {
      en: 'Slope and inclination angle', ar: 'الميل وزاوية الميل',
      fr: 'Pente et angle d’inclinaison', de: 'Steigung und Neigungswinkel',
    },
    note: {
      en: 'θ is measured from the positive x-axis, 0° ≤ θ < 180°. At θ = 90° the line is vertical (slope undefined).',
      ar: 'تُقاس θ من الاتجاه الموجب لمحور السينات، حيث 0° ≤ θ < 180°. عند θ = 90° يكون المستقيم رأسيًا (الميل غير معرّف).',
      fr: 'θ est mesuré depuis l’axe des x positif, 0° ≤ θ < 180°. Pour θ = 90° la droite est verticale (pente non définie).',
      de: 'θ wird von der positiven x-Achse aus gemessen, 0° ≤ θ < 180°. Bei θ = 90° ist die Gerade senkrecht (Steigung nicht definiert).',
    },
    modes: [
      {
        id: 'toSlope',
        label: 'm = tan θ',
        formula: 'm = tan θ',
        inputs: [{ key: 'th', sym: 'θ (°)', def: '45' }],
        compute: ({ th }) => {
          const m = slope.fromAngle(th);
          if (isErr(m)) return fail(m);
          return {
            kind: 'value', sym: 'm', text: fmt(m),
            steps: [`m = tan(${fmt(th)}°)`, `m = ${fmt(m)}`],
          };
        },
      },
      {
        id: 'toAngle',
        label: 'θ = tan⁻¹ m',
        formula: 'tan θ = m  ⇒  θ = tan⁻¹ m',
        inputs: [{ key: 'm', sym: 'm', def: '1' }],
        compute: ({ m }) => {
          const th = slope.angleFromSlope(m);
          if (isErr(th)) return fail(th);
          return {
            kind: 'value', sym: 'θ', text: `${fmt(th, 4)}°`,
            steps: [
              `θ = tan⁻¹(${b(m)})`,
              m < 0 ? `tan⁻¹(${b(m)}) = ${fmt((Math.atan(m) * 180) / Math.PI, 4)}°  →  θ = 180° + (${fmt((Math.atan(m) * 180) / Math.PI, 4)}°)` : `θ = ${fmt(th, 4)}°`,
              `θ = ${fmt(th, 4)}°`,
            ].filter((s, i, arr) => i === 0 || s !== arr[i - 1]),
          };
        },
      },
    ],
  },

  /* ── 3 ── general form ax + by + c = 0 */
  {
    id: 3,
    name: {
      en: 'Slope from ax + by + c = 0', ar: 'الميل من المعادلة العامة ax + by + c = 0',
      fr: 'Pente à partir de ax + by + c = 0', de: 'Steigung aus ax + by + c = 0',
    },
    note: {
      en: 'Solve for y: y = (−a/b)x − c/b, so the slope is −a/b. If b = 0 the line is vertical.',
      ar: 'بحلّ المعادلة لـ y نحصل على y = (−a/b)x − c/b، فيكون الميل −a/b. وإذا كان b = 0 فالمستقيم رأسي.',
      fr: 'En résolvant pour y : y = (−a/b)x − c/b, donc la pente est −a/b. Si b = 0 la droite est verticale.',
      de: 'Nach y aufgelöst: y = (−a/b)x − c/b, die Steigung ist also −a/b. Ist b = 0, ist die Gerade senkrecht.',
    },
    modes: [{
      id: 'general',
      label: 'm = −a / b',
      formula: 'ax + by + c = 0  ⇒  m = −a / b',
      inputs: [{ key: 'a', sym: 'a', def: '3' }, { key: 'b', sym: 'b', def: '−1' }],
      compute: ({ a, b: bb }) => {
        const m = slope.fromGeneral(a, bb);
        if (isErr(m)) return fail(m);
        return {
          kind: 'value', sym: 'm', text: fmt(m),
          steps: [`m = −(${b(a)}) / (${b(bb)})`, `m = ${fmt(m)}`],
        };
      },
    }],
  },

  /* ── 4 ── slope-intercept form y = mx + c */
  {
    id: 4,
    name: {
      en: 'Slope–intercept form y = mx + c', ar: 'صيغة الميل والمقطع y = mx + c',
      fr: 'Forme réduite y = mx + c', de: 'Normalform y = mx + c',
    },
    note: {
      en: 'm is the coefficient of x (the slope) and c is where the line crosses the y-axis.',
      ar: 'العدد m هو معامل x (الميل) والعدد c هو الجزء المقطوع من محور الصادات.',
      fr: 'm est le coefficient de x (la pente) et c l’ordonnée à l’origine.',
      de: 'm ist der Koeffizient von x (die Steigung) und c der y-Achsenabschnitt.',
    },
    modes: [
      {
        id: 'readY',
        label: 'y = mx + c',
        formula: 'y = m·x + c',
        inputs: [{ key: 'm', sym: 'm', def: '2' }, { key: 'c', sym: 'c', def: '1' }, { key: 'x', sym: 'x', def: '3' }],
        compute: ({ m, c, x }) => {
          const y = slope.yAt(m, c, x);
          return {
            kind: 'value', sym: 'y', text: fmt(y),
            steps: [`y = ${b(m)}·${b(x)} + ${b(c)}`, `y = ${fmt(m * x)} + ${b(c)}`, `y = ${fmt(y)}`],
          };
        },
      },
      {
        id: 'findM',
        label: 'm = (y − c) / x',
        formula: 'y = m·x + c  ⇒  m = (y − c) / x',
        inputs: [{ key: 'x', sym: 'x', def: '3' }, { key: 'y', sym: 'y', def: '7' }, { key: 'c', sym: 'c', def: '1' }],
        compute: ({ x, y, c }) => {
          const m = slope.mFromPointAndIntercept(x, y, c);
          if (isErr(m)) return fail(m);
          return {
            kind: 'value', sym: 'm', text: fmt(m),
            steps: [`m = (${b(y)} − ${b(c)}) / ${b(x)}`, `m = ${fmt(y - c)} / ${b(x)}`, `m = ${fmt(m)}`],
          };
        },
      },
    ],
  },

  /* ── 5 ── parallel lines */
  {
    id: 5,
    name: { en: 'Parallel lines', ar: 'المستقيمان المتوازيان', fr: 'Droites parallèles', de: 'Parallele Geraden' },
    note: {
      en: 'Two non-vertical lines are parallel exactly when their slopes are equal.',
      ar: 'يتوازى مستقيمان غير رأسيين إذا وفقط إذا تساوى ميلاهما.',
      fr: 'Deux droites non verticales sont parallèles exactement lorsque leurs pentes sont égales.',
      de: 'Zwei nicht senkrechte Geraden sind genau dann parallel, wenn ihre Steigungen gleich sind.',
    },
    modes: [{
      id: 'parallel',
      label: 'm₁ = m₂',
      formula: 'L₁ ∥ L₂  ⇔  m₁ = m₂',
      inputs: [{ key: 'm1', sym: 'm₁', def: '2' }, { key: 'm2', sym: 'm₂', def: '2' }],
      compute: ({ m1, m2 }) => {
        const yes = slope.areParallel(m1, m2);
        return {
          kind: 'value', sym: 'm₁ = m₂ ?', text: yes ? '✓' : '✗', verdict: yes ? 'parallel' : 'notParallel',
          steps: [`m₁ = ${fmt(m1)}`, `m₂ = ${fmt(m2)}`, `${fmt(m1)} ${yes ? '=' : '≠'} ${fmt(m2)}`],
        };
      },
    }],
  },

  /* ── 6 ── perpendicular lines */
  {
    id: 6,
    name: { en: 'Perpendicular lines', ar: 'المستقيمان المتعامدان', fr: 'Droites perpendiculaires', de: 'Senkrechte Geraden' },
    note: {
      en: 'Two lines with slopes are perpendicular exactly when m₁ × m₂ = −1. A horizontal line (m = 0) is perpendicular to a vertical one.',
      ar: 'يتعامد مستقيمان لهما ميلان إذا وفقط إذا كان m₁ × m₂ = −1. والمستقيم الأفقي (m = 0) عمودي على المستقيم الرأسي.',
      fr: 'Deux droites ayant une pente sont perpendiculaires exactement lorsque m₁ × m₂ = −1. Une droite horizontale (m = 0) est perpendiculaire à une droite verticale.',
      de: 'Zwei Geraden mit Steigung stehen genau dann senkrecht aufeinander, wenn m₁ × m₂ = −1. Eine waagerechte Gerade (m = 0) steht senkrecht auf einer senkrechten.',
    },
    modes: [
      {
        id: 'check',
        label: 'm₁ × m₂ = −1',
        formula: 'L₁ ⟂ L₂  ⇔  m₁ × m₂ = −1',
        inputs: [{ key: 'm1', sym: 'm₁', def: '2' }, { key: 'm2', sym: 'm₂', def: '−0.5' }],
        compute: ({ m1, m2 }) => {
          const yes = slope.arePerpendicular(m1, m2);
          return {
            kind: 'value', sym: 'm₁ × m₂', text: fmt(m1 * m2), verdict: yes ? 'perpendicular' : 'notPerpendicular',
            steps: [`m₁ × m₂ = ${b(m1)} × ${b(m2)}`, `m₁ × m₂ = ${fmt(m1 * m2)}`, `${fmt(m1 * m2)} ${yes ? '=' : '≠'} −1`],
          };
        },
      },
      {
        id: 'find',
        label: 'm₂ = −1 / m₁',
        formula: 'm₂ = −1 / m₁',
        inputs: [{ key: 'm1', sym: 'm₁', def: '2' }],
        compute: ({ m1 }) => {
          const m2 = slope.perpendicularSlope(m1);
          if (isErr(m2)) return fail(m2);
          return {
            kind: 'value', sym: 'm₂', text: fmt(m2),
            steps: [`m₂ = −1 / ${b(m1)}`, `m₂ = ${fmt(m2)}`],
          };
        },
      },
    ],
  },
];
