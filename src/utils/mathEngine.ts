/**
 * mathEngine.ts — pure math logic for the SciNexa Math Lab (no React, no DOM).
 * Everything here is checked by scripts/verify-math.ts.
 */

/* ───────────────────────── number formatting ───────────────────────── */

export function fmt(n: number, digits = 6): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(digits));
  if (Object.is(r, -0) || r === 0) return '0';
  if (Math.abs(r) >= 1e12) return r.toExponential(3);
  return String(r);
}

/** Accepts Arabic-Indic digits and comma decimals, returns NaN when not a number. */
export function parseNum(raw: string): number {
  if (raw == null) return NaN;
  let s = String(raw).trim();
  if (s === '') return NaN;
  s = s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٫,]/g, '.')
    .replace(/[−–—]/g, '-');
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

/* ───────────────────────── expression parser (f(x)) ───────────────────────── */

type Tok =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string };

const NAMES = [
  'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'floor', 'ceil', 'round',
  'sin', 'cos', 'tan', 'abs', 'log', 'ln', 'exp', 'pi', 'e', 'x',
];
const FUNCS = new Set([
  'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'floor', 'ceil', 'round',
  'sin', 'cos', 'tan', 'abs', 'log', 'ln', 'exp',
]);

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[٫]/g, '.')
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/\*\*/g, '^')
    .replace(/\s+/g, '')
    .toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const txt = s.slice(i, j);
      if ((txt.match(/\./g) || []).length > 1 || txt === '.') throw new Error('number');
      out.push({ t: 'num', v: Number(txt) });
      i = j;
    } else if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      let k = i;
      while (k < j) {
        const m = NAMES.find((n) => s.startsWith(n, k) && k + n.length <= j);
        if (!m) throw new Error('name');
        out.push({ t: 'id', v: m });
        k += m.length;
      }
      i = j;
    } else if ('+-*/^()'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else {
      throw new Error('char');
    }
  }
  return out;
}

type Node =
  | { k: 'num'; v: number }
  | { k: 'x' }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: string; a: Node; b: Node }
  | { k: 'fn'; name: string; a: Node };

function parseTokens(toks: Tok[]): Node {
  let p = 0;
  const isOp = (v: string): boolean => {
    const t = toks[p];
    return !!t && t.t === 'op' && t.v === v;
  };
  const startsAtom = (): boolean => {
    const t = toks[p];
    if (!t) return false;
    if (t.t === 'num' || t.t === 'id') return true;
    return t.t === 'op' && t.v === '(';
  };

  function expr(): Node {
    let left = term();
    while (isOp('+') || isOp('-')) {
      const op = (toks[p++] as { v: string }).v;
      left = { k: 'bin', op, a: left, b: term() };
    }
    return left;
  }
  function term(): Node {
    let left = unary();
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = (toks[p++] as { v: string }).v;
        left = { k: 'bin', op, a: left, b: unary() };
      } else if (startsAtom()) {
        // implicit multiplication: 2x, x(x+1), (x+1)(x-1), 2sin(x)
        left = { k: 'bin', op: '*', a: left, b: unary() };
      } else break;
    }
    return left;
  }
  function unary(): Node {
    if (isOp('-')) { p++; return { k: 'neg', a: unary() }; }
    if (isOp('+')) { p++; return unary(); }
    return power();
  }
  function power(): Node {
    const base = atom();
    if (isOp('^')) { p++; return { k: 'bin', op: '^', a: base, b: unary() }; }
    return base;
  }
  function atom(): Node {
    const t = toks[p++];
    if (!t) throw new Error('end');
    if (t.t === 'num') return { k: 'num', v: t.v };
    if (t.t === 'op' && t.v === '(') {
      const inner = expr();
      if (!isOp(')')) throw new Error('paren');
      p++;
      return inner;
    }
    if (t.t === 'id') {
      if (t.v === 'x') return { k: 'x' };
      if (t.v === 'pi') return { k: 'num', v: Math.PI };
      if (t.v === 'e') return { k: 'num', v: Math.E };
      if (FUNCS.has(t.v)) {
        // argument: (..) or a power-level atom, e.g. sin x, sqrt(x+1)
        const arg = isOp('(') ? atom() : power();
        return { k: 'fn', name: t.v, a: arg };
      }
    }
    throw new Error('atom');
  }

  const tree = expr();
  if (p < toks.length) throw new Error('trailing');
  return tree;
}

function evalNode(n: Node, x: number, deg: boolean): number {
  switch (n.k) {
    case 'num': return n.v;
    case 'x': return x;
    case 'neg': return -evalNode(n.a, x, deg);
    case 'bin': {
      const a = evalNode(n.a, x, deg);
      const b = evalNode(n.b, x, deg);
      switch (n.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? NaN : a / b;
        case '^': {
          if (a < 0 && !Number.isInteger(b)) {
            // odd roots of negatives, e.g. x^(1/3)
            const inv = 1 / b;
            if (Number.isInteger(inv) && Math.abs(inv) % 2 === 1) return -Math.pow(-a, b);
            return NaN;
          }
          if (a === 0 && b < 0) return NaN;
          return Math.pow(a, b);
        }
      }
      return NaN;
    }
    case 'fn': {
      const v = evalNode(n.a, x, deg);
      const toRad = (d: number): number => (deg ? (d * Math.PI) / 180 : d);
      const fromRad = (r: number): number => (deg ? (r * 180) / Math.PI : r);
      switch (n.name) {
        case 'sin': return Math.sin(toRad(v));
        case 'cos': return Math.cos(toRad(v));
        case 'tan': {
          const r = toRad(v);
          return Math.abs(Math.cos(r)) < 1e-12 ? NaN : Math.tan(r);
        }
        case 'asin': return fromRad(Math.asin(v));
        case 'acos': return fromRad(Math.acos(v));
        case 'atan': return fromRad(Math.atan(v));
        case 'sinh': return Math.sinh(v);
        case 'cosh': return Math.cosh(v);
        case 'tanh': return Math.tanh(v);
        case 'sqrt': return v < 0 ? NaN : Math.sqrt(v);
        case 'cbrt': return Math.cbrt(v);
        case 'abs': return Math.abs(v);
        case 'log': return v <= 0 ? NaN : Math.log10(v);
        case 'ln': return v <= 0 ? NaN : Math.log(v);
        case 'exp': return Math.exp(v);
        case 'floor': return Math.floor(v);
        case 'ceil': return Math.ceil(v);
        case 'round': return Math.round(v);
      }
      return NaN;
    }
  }
}

export type MathFn = (x: number, deg?: boolean) => number;

export type CompiledFn =
  | { ok: true; fn: MathFn }
  | { ok: false; error: 'empty' | 'invalid' };

export function compileExpression(src: string): CompiledFn {
  if (!src || !src.trim()) return { ok: false, error: 'empty' };
  try {
    // allow "f(x) = ..." or "y = ..."
    const body = src.replace(/^\s*(f\s*\(\s*x\s*\)|y)\s*=/i, '');
    const toks = tokenize(body);
    if (toks.length === 0) return { ok: false, error: 'empty' };
    const tree = parseTokens(toks);
    return { ok: true, fn: (x: number, deg = false) => evalNode(tree, x, deg) };
  } catch {
    return { ok: false, error: 'invalid' };
  }
}

export const MAX_TABLE_ROWS = 201;

export interface TableRow { x: number; y: number }

export function buildTable(
  fn: MathFn, from: number, to: number, step: number, deg: boolean,
): { rows: TableRow[]; truncated: boolean } | { error: 'step' | 'range' } {
  if (![from, to, step].every(Number.isFinite)) return { error: 'range' };
  if (step === 0) return { error: 'step' };
  // a reversed range simply walks backwards
  const s = (to >= from ? 1 : -1) * Math.abs(step);
  const count = Math.floor((to - from) / s + 1e-9) + 1;
  const rows: TableRow[] = [];
  const n = Math.min(count, MAX_TABLE_ROWS);
  for (let i = 0; i < n; i++) {
    const x = Number((from + i * s).toFixed(10));
    const y = fn(x, deg);
    rows.push({ x, y: Number.isFinite(y) ? y : NaN });
  }
  return { rows, truncated: count > MAX_TABLE_ROWS };
}

/* ───────────────────────── Calculator ───────────────────────── */

export type CalcResult = { ok: true; value: number } | { ok: false };

/** Evaluates a plain expression (no variable). "ans" is replaced by the previous result. */
export function calculate(expr: string, deg: boolean, ans: number): CalcResult {
  if (!expr.trim()) return { ok: false };
  // x is the variable of f(x); a calculator has none
  if (/x/i.test(expr.replace(/exp/gi, ''))) return { ok: false };
  const withAns = expr.replace(/ans/gi, `(${Number.isFinite(ans) ? ans : 0})`);
  const c = compileExpression(withAns);
  if (!c.ok) return { ok: false };
  const v = c.fn(0, deg);
  return Number.isFinite(v) ? { ok: true, value: v } : { ok: false };
}

/* ───────────────────────── Pythagoras ───────────────────────── */

export type PythKey = 'a' | 'b' | 'c';

/** a, b = legs, c = hypotenuse. Provide two of the three. */
export function solvePythagoras(
  v: Partial<Record<PythKey, number>>,
): { a: number; b: number; c: number } | { error: 'needTwo' | 'positive' | 'hypotenuse' } {
  const given = (Object.keys(v) as PythKey[]).filter((k) => v[k] !== undefined && Number.isFinite(v[k] as number));
  if (given.length < 2) return { error: 'needTwo' };
  if (given.some((k) => (v[k] as number) <= 0)) return { error: 'positive' };
  const { a, b, c } = v;
  if (a !== undefined && b !== undefined) return { a, b, c: Math.sqrt(a * a + b * b) };
  if (a !== undefined && c !== undefined) {
    if (c <= a) return { error: 'hypotenuse' };
    return { a, b: Math.sqrt(c * c - a * a), c };
  }
  if (b !== undefined && c !== undefined) {
    if (c <= b) return { error: 'hypotenuse' };
    return { a: Math.sqrt(c * c - b * b), b, c };
  }
  return { error: 'needTwo' };
}

export function isRightTriangle(s1: number, s2: number, s3: number, tol = 1e-9): boolean {
  const [x, y, z] = [s1, s2, s3].sort((p, q) => p - q);
  if (!(x > 0) || x + y <= z) return false;
  return Math.abs(x * x + y * y - z * z) <= tol * Math.max(1, z * z);
}

/* ───────────────────────── Euclid ─────────────────────────
 * Right angle at A. D is the foot of the altitude from A onto BC.
 *   c = AB, b = AC, a = BC, h = AD, p = BD, q = DC
 *   (1) c² = p·a   (2) b² = q·a   (3) h² = p·q   (4) b·c = a·h   and   a = p + q
 */
export type EuclidKey = 'c' | 'b' | 'a' | 'h' | 'p' | 'q';
export interface EuclidSolution { c: number; b: number; a: number; h: number; p: number; q: number }

function fromPQ(p: number, q: number): EuclidSolution {
  const a = p + q;
  return { p, q, a, c: Math.sqrt(p * a), b: Math.sqrt(q * a), h: Math.sqrt(p * q) };
}

export function solveEuclid(
  v: Partial<Record<EuclidKey, number>>,
): { sol: EuclidSolution; twoSolutions: boolean } | { error: 'needTwo' | 'positive' | 'inconsistent' } {
  const keys = (Object.keys(v) as EuclidKey[]).filter((k) => v[k] !== undefined && Number.isFinite(v[k] as number));
  if (keys.length < 2) return { error: 'needTwo' };
  if (keys.some((k) => (v[k] as number) <= 0)) return { error: 'positive' };
  const has = (k: EuclidKey): boolean => keys.includes(k);
  const g = (k: EuclidKey): number => v[k] as number;
  const bad = { error: 'inconsistent' as const };
  const ok = (p: number, q: number, two = false) =>
    p > 1e-12 && q > 1e-12 && Number.isFinite(p) && Number.isFinite(q)
      ? { sol: fromPQ(p, q), twoSolutions: two }
      : bad;

  // use the first two given values in a fixed priority order → deterministic result
  const order: EuclidKey[] = ['p', 'q', 'a', 'c', 'b', 'h'];
  const [k1, k2] = order.filter(has);
  switch (`${k1}${k2}`) {
    case 'pq': return ok(g('p'), g('q'));
    case 'pa': return ok(g('p'), g('a') - g('p'));
    case 'qa': return ok(g('a') - g('q'), g('q'));
    case 'pc': { const p = g('p'), c = g('c'); return ok(p, (c * c) / p - p); }
    case 'qc': { const q = g('q'), c = g('c'); return ok((-q + Math.sqrt(q * q + 4 * c * c)) / 2, q); }
    case 'pb': { const p = g('p'), b = g('b'); return ok(p, (-p + Math.sqrt(p * p + 4 * b * b)) / 2); }
    case 'qb': { const q = g('q'), b = g('b'); return ok((b * b) / q - q, q); }
    case 'ph': return ok(g('p'), (g('h') * g('h')) / g('p'));
    case 'qh': return ok((g('h') * g('h')) / g('q'), g('q'));
    case 'ac': { const a = g('a'), c = g('c'); return c >= a ? bad : ok((c * c) / a, a - (c * c) / a); }
    case 'ab': { const a = g('a'), b = g('b'); return b >= a ? bad : ok(a - (b * b) / a, (b * b) / a); }
    case 'ah': {
      const a = g('a'), h = g('h');
      const disc = a * a - 4 * h * h;
      if (disc < -1e-12) return bad;
      const r = Math.sqrt(Math.max(0, disc));
      // p ≤ q  →  AB ≤ AC (swapping gives the mirror triangle)
      return ok((a - r) / 2, (a + r) / 2, r > 1e-12);
    }
    case 'cb': {
      const c = g('c'), b = g('b');
      const a = Math.sqrt(b * b + c * c);
      return ok((c * c) / a, (b * b) / a);
    }
    case 'ch': {
      const c = g('c'), h = g('h');
      if (h >= c) return bad;
      const b = (c * h) / Math.sqrt(c * c - h * h);
      const a = Math.sqrt(b * b + c * c);
      return ok((c * c) / a, (b * b) / a);
    }
    case 'bh': {
      const b = g('b'), h = g('h');
      if (h >= b) return bad;
      const c = (b * h) / Math.sqrt(b * b - h * h);
      const a = Math.sqrt(b * b + c * c);
      return ok((c * c) / a, (b * b) / a);
    }
  }
  return bad;
}

/* ───────────────────────── Slope (الميل) laws ───────────────────────── */

const EPS = 1e-12;
export type SlopeErr = 'vertical' | 'invalid' | 'zeroDen';

export const slope = {
  /** Law 1 — slope through two points: m = (y₂ − y₁)/(x₂ − x₁) */
  fromPoints(x1: number, y1: number, x2: number, y2: number): number | SlopeErr {
    if (![x1, y1, x2, y2].every(Number.isFinite)) return 'invalid';
    if (x1 === x2 && y1 === y2) return 'invalid';
    if (x1 === x2) return 'vertical';
    const m = (y2 - y1) / (x2 - x1);
    return m === 0 ? 0 : m;
  },
  /** Law 2 — m = tan θ (θ in degrees from the +x axis, 0 ≤ θ < 180) */
  fromAngle(thetaDeg: number): number | SlopeErr {
    if (!Number.isFinite(thetaDeg) || thetaDeg < 0 || thetaDeg >= 180) return 'invalid';
    if (Math.abs(thetaDeg - 90) < 1e-9) return 'vertical';
    const t = Math.tan((thetaDeg * Math.PI) / 180);
    return Math.abs(t) < 1e-12 ? 0 : t;
  },
  angleFromSlope(m: number): number | SlopeErr {
    if (!Number.isFinite(m)) return 'invalid';
    let d = (Math.atan(m) * 180) / Math.PI;
    if (d < 0) d += 180;
    return d;
  },
  /** Law 3 — line ax + by + c = 0  →  m = −a/b */
  fromGeneral(a: number, b: number): number | SlopeErr {
    if (![a, b].every(Number.isFinite) || (a === 0 && b === 0)) return 'invalid';
    if (b === 0) return 'vertical';
    const m = -a / b;
    return m === 0 ? 0 : m;
  },
  /** Law 4 — y = m·x + c */
  yAt(m: number, c: number, x: number): number { return m * x + c; },
  mFromPointAndIntercept(x: number, y: number, c: number): number | SlopeErr {
    if (![x, y, c].every(Number.isFinite)) return 'invalid';
    if (x === 0) return 'zeroDen';
    const m = (y - c) / x;
    return m === 0 ? 0 : m;
  },
  /** Law 5 — parallel lines: m₁ = m₂ */
  areParallel(m1: number, m2: number, tol = 1e-9): boolean {
    return Math.abs(m1 - m2) <= tol * Math.max(1, Math.abs(m1), Math.abs(m2));
  },
  /** Law 6 — perpendicular lines: m₁·m₂ = −1 */
  arePerpendicular(m1: number, m2: number, tol = 1e-9): boolean {
    return Math.abs(m1 * m2 + 1) <= tol * Math.max(1, Math.abs(m1 * m2));
  },
  perpendicularSlope(m: number): number | SlopeErr {
    if (!Number.isFinite(m)) return 'invalid';
    if (Math.abs(m) < EPS) return 'vertical';
    return -1 / m;
  },
};

/* ───────────────────────── Polygon analysis (coordinate grid) ───────────────────────── */

export interface Pt { x: number; y: number }

export type ShapeKind =
  | 'point' | 'segment'
  | 'equilateral' | 'isoscelesRight' | 'rightTriangle' | 'isosceles' | 'scalene'
  | 'square' | 'rectangle' | 'rhombus' | 'parallelogram' | 'isoscelesTrapezoid' | 'trapezoid' | 'kite' | 'quadrilateral'
  | 'regular' | 'polygon'
  | 'degenerate';

export interface SideInfo { from: number; to: number; length: number; slope: number | 'vertical' }

export interface PolygonInfo {
  kind: ShapeKind;
  n: number;
  convex: boolean;
  simple: boolean;
  area: number;
  perimeter: number;
  sides: SideInfo[];
  midpoint?: Pt;
}

const dist = (a: Pt, b: Pt): number => Math.hypot(b.x - a.x, b.y - a.y);
const cross = (o: Pt, a: Pt, b: Pt): number => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

function segCross(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
  return d1 * d2 < -1e-12 && d3 * d4 < -1e-12;
}

export function polygonArea(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

export function analyzePolygon(pts: Pt[]): PolygonInfo {
  const n = pts.length;
  const sides: SideInfo[] = [];
  const count = n < 2 ? 0 : n === 2 ? 1 : n;
  for (let i = 0; i < count; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b.x - a.x;
    const m = Math.abs(dx) < 1e-12 ? 'vertical' : (b.y - a.y) / dx;
    sides.push({ from: i, to: (i + 1) % n, length: dist(a, b), slope: m === 'vertical' ? m : m === 0 ? 0 : m });
  }
  const perimeter = sides.reduce((s, e) => s + e.length, 0);
  const base: PolygonInfo = { kind: 'polygon', n, convex: true, simple: true, area: 0, perimeter, sides };
  if (n <= 1) return { ...base, kind: 'point', perimeter: 0 };
  if (n === 2) {
    return { ...base, kind: 'segment', midpoint: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } };
  }

  const area = polygonArea(pts);
  const L = sides.map((s) => s.length);
  const scale = Math.max(1, ...L);
  const eq = (u: number, w: number): boolean => Math.abs(u - w) <= 1e-9 * scale;

  let simple = true;
  for (let i = 0; i < n && simple; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (segCross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) { simple = false; break; }
    }
  }
  let pos = 0, neg = 0;
  for (let i = 0; i < n; i++) {
    const c = cross(pts[i], pts[(i + 1) % n], pts[(i + 2) % n]);
    if (c > 1e-12) pos++; else if (c < -1e-12) neg++;
  }
  const convex = pos === 0 || neg === 0;
  const info: PolygonInfo = { ...base, area, simple, convex };

  if (area < 1e-9 * scale * scale) return { ...info, kind: 'degenerate' };
  if (!simple) return { ...info, kind: 'polygon' };

  if (n === 3) {
    const [a, b, c] = [...L].sort((p, q) => p - q);
    if (eq(a, c)) return { ...info, kind: 'equilateral' };
    const right = Math.abs(a * a + b * b - c * c) <= 1e-9 * scale * scale;
    if (right) return { ...info, kind: eq(a, b) ? 'isoscelesRight' : 'rightTriangle' };
    if (eq(a, b) || eq(b, c)) return { ...info, kind: 'isosceles' };
    return { ...info, kind: 'scalene' };
  }

  if (n === 4) {
    const [P0, P1, P2, P3] = pts;
    const para = eq(P0.x + P2.x, P1.x + P3.x) && eq(P0.y + P2.y, P1.y + P3.y);
    if (para) {
      const diagEq = eq(dist(P0, P2), dist(P1, P3));
      const adjEq = eq(L[0], L[1]);
      if (diagEq && adjEq) return { ...info, kind: 'square' };
      if (diagEq) return { ...info, kind: 'rectangle' };
      if (adjEq) return { ...info, kind: 'rhombus' };
      return { ...info, kind: 'parallelogram' };
    }
    const parallel = (u: Pt, v: Pt, w: Pt, z: Pt): boolean =>
      Math.abs((v.x - u.x) * (z.y - w.y) - (v.y - u.y) * (z.x - w.x)) <= 1e-9 * scale * scale;
    const t1 = parallel(P0, P1, P3, P2); // AB ∥ DC
    const t2 = parallel(P1, P2, P0, P3); // BC ∥ AD
    if (t1 || t2) {
      const legsEqual = t1 ? eq(L[1], L[3]) : eq(L[0], L[2]);
      return { ...info, kind: legsEqual ? 'isoscelesTrapezoid' : 'trapezoid' };
    }
    if ((eq(L[0], L[1]) && eq(L[2], L[3])) || (eq(L[1], L[2]) && eq(L[3], L[0]))) return { ...info, kind: 'kite' };
    return { ...info, kind: 'quadrilateral' };
  }

  // regular polygon: equal sides and equal diagonals of the same skip
  if (convex && L.every((l) => eq(l, L[0]))) {
    const d2 = dist(pts[0], pts[2]);
    let anglesEqual = true;
    for (let i = 1; i < n; i++) if (!eq(dist(pts[i], pts[(i + 2) % n]), d2)) anglesEqual = false;
    if (anglesEqual) return { ...info, kind: 'regular' };
  }
  return { ...info, kind: 'polygon' };
}

/* ───────────────────────── self-check of the 6 slope laws ───────────────────────── */

export interface VerifyReport { passed: number; failed: string[] }

/** Deterministic pseudo-random generator so the check is reproducible. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function verifySlopeLaws(seed = 20260107, rounds = 200): VerifyReport {
  const rnd = lcg(seed);
  const r = (lo: number, hi: number): number => lo + rnd() * (hi - lo);
  const failed: string[] = [];
  let passed = 0;
  const check = (name: string, cond: boolean): void => { if (cond) passed++; else failed.push(name); };
  const close = (a: number, b: number, tol = 1e-7): boolean =>
    Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

  // fixed textbook values
  check('tan 45° = 1', close(slope.fromAngle(45) as number, 1));
  check('tan 0° = 0', slope.fromAngle(0) === 0);
  check('tan 90° is vertical', slope.fromAngle(90) === 'vertical');
  check('tan 135° = −1', close(slope.fromAngle(135) as number, -1));
  check('tan 60° = √3', close(slope.fromAngle(60) as number, Math.sqrt(3)));
  check('atan(1) = 45°', close(slope.angleFromSlope(1) as number, 45));
  check('atan(−1) = 135°', close(slope.angleFromSlope(-1) as number, 135));
  check('(1,2),(3,6) → 2', slope.fromPoints(1, 2, 3, 6) === 2);
  check('vertical points', slope.fromPoints(2, 1, 2, 9) === 'vertical');
  check('horizontal points', slope.fromPoints(0, 4, 5, 4) === 0);
  check('2x + y − 5 = 0 → −2', slope.fromGeneral(2, 1) === -2);
  check('x − 3 = 0 is vertical', slope.fromGeneral(1, 0) === 'vertical');
  check('perp of 2 is −1/2', slope.perpendicularSlope(2) === -0.5);
  check('perp of 0 is vertical', slope.perpendicularSlope(0) === 'vertical');

  for (let i = 0; i < rounds; i++) {
    const m = r(-8, 8), c = r(-10, 10);
    const x1 = r(-10, 10), x2 = x1 + (rnd() < 0.5 ? 1 : -1) * r(0.5, 9);
    const y1 = m * x1 + c, y2 = m * x2 + c;

    // Law 1: two points on y = mx + c give m
    check('law1', close(slope.fromPoints(x1, y1, x2, y2) as number, m));

    // Law 2: slope ↔ angle round trip, and agreement with a direction vector
    const th = slope.angleFromSlope(m) as number;
    check('law2 range', th >= 0 && th < 180);
    check('law2 roundtrip', close(slope.fromAngle(th) as number, m, 1e-6));
    const vx = Math.cos((th * Math.PI) / 180), vy = Math.sin((th * Math.PI) / 180);
    check('law2 direction', close(vy / vx, m, 1e-6));

    // Law 3: a·x + b·y + c0 = 0 rewritten from y = m x + c  →  k·m·x − k·y + k·c = 0
    const k = r(0.5, 4) * (rnd() < 0.5 ? -1 : 1);
    check('law3', close(slope.fromGeneral(k * m, -k) as number, m));

    // Law 4: y = mx + c reproduces the points; m recovered from point + intercept
    check('law4 y', close(slope.yAt(m, c, x1), y1));
    const xs = Math.abs(x1) < 0.1 ? 1 : x1;
    check('law4 m', close(slope.mFromPointAndIntercept(xs, m * xs + c, c) as number, m));

    // Law 5: a parallel line (same slope, other intercept) has equal slope; a different slope is not parallel
    const pm = slope.fromPoints(x1, y1 + 3, x2, y2 + 3) as number;
    check('law5', slope.areParallel(m, pm) && !slope.areParallel(m, m + 0.5));

    // Law 6: perpendicular direction vectors (1, m)·(1, m') = 1 + m·m' = 0
    const pp = slope.perpendicularSlope(m);
    if (typeof pp === 'number') {
      check('law6 product', slope.arePerpendicular(m, pp));
      check('law6 dot', Math.abs(1 + m * pp) < 1e-8);
    }
  }
  return { passed, failed };
}
