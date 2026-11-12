/** algebraStats.ts — quadratic formula, Heron's formula, descriptive statistics (pure functions, no React). */
import { fmt } from './mathEngine';

export type QuadKind = 'twoReal' | 'equalReal' | 'complex';
export interface QuadResult {
  D: number; kind: QuadKind;
  x1?: number; x2?: number;          // real roots
  re?: number; im?: number;          // complex roots: re ± im·i
  steps: string[];
}

/** ax² + bx + c = 0 → x = (−b ± √(b²−4ac)) / 2a */
export function solveQuadratic(a: number, b: number, c: number): QuadResult | { error: 'a0' } {
  if (![a, b, c].every(Number.isFinite)) return { error: 'a0' };
  if (a === 0) return { error: 'a0' };
  const D = b * b - 4 * a * c;
  const br = (n: number): string => (n < 0 ? `(${fmt(n)})` : fmt(n));
  const steps = [`Δ = b² − 4ac = ${br(b)}² − 4(${br(a)})(${br(c)}) = ${fmt(D)}`];
  if (D > 0) {
    const r = Math.sqrt(D), x1 = (-b + r) / (2 * a), x2 = (-b - r) / (2 * a);
    steps.push(`x = (${fmt(-b)} ± √${fmt(D)}) / ${fmt(2 * a)}`, `x₁ = ${fmt(x1)} ,  x₂ = ${fmt(x2)}`);
    return { D, kind: 'twoReal', x1, x2, steps };
  }
  if (D === 0) {
    const x = -b / (2 * a);
    steps.push(`x = −b / 2a = ${fmt(x)}`);
    return { D, kind: 'equalReal', x1: x, x2: x, steps };
  }
  const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * Math.abs(a));
  steps.push(`x = (${fmt(-b)} ± √${fmt(D)}) / ${fmt(2 * a)}`, `x = ${fmt(re)} ± ${fmt(im)} i`);
  return { D, kind: 'complex', re, im, steps };
}

export interface HeronResult { p: number; area: number; steps: string[] }
/** Area = √(p(p−x)(p−y)(p−z)), p = half the perimeter */
export function heron(x: number, y: number, z: number): HeronResult | { error: 'positive' | 'inequality' } {
  if (![x, y, z].every((n) => Number.isFinite(n) && n > 0)) return { error: 'positive' };
  if (x + y <= z || x + z <= y || y + z <= x) return { error: 'inequality' };
  const p = (x + y + z) / 2;
  const prod = p * (p - x) * (p - y) * (p - z);
  const area = Math.sqrt(prod);
  return {
    p, area,
    steps: [
      `p = (${fmt(x)} + ${fmt(y)} + ${fmt(z)}) / 2 = ${fmt(p)}`,
      `A = √(${fmt(p)} × ${fmt(p - x)} × ${fmt(p - y)} × ${fmt(p - z)}) = √${fmt(prod)}`,
      `A = ${fmt(area)}`,
    ],
  };
}

const medianOfSorted = (s: number[]): number => {
  const n = s.length, m = Math.floor(n / 2);
  return n % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export interface StatsResult {
  n: number; sorted: number[]; min: number; max: number; range: number; sum: number; mean: number;
  median: number; medianPos: string; q1: number; q3: number; iqr: number; lower: number[]; upper: number[];
}
/** range, mean, median, Q1, Q3, IQR. For odd n the median is left out of both halves when finding Q1 and Q3. */
export function describe(values: number[]): StatsResult | { error: 'few' } {
  if (values.length < 2) return { error: 'few' };
  const sorted = [...values].sort((p, q) => p - q), n = sorted.length;
  const sum = sorted.reduce((t, v) => t + v, 0), h = Math.floor(n / 2);
  const lower = sorted.slice(0, h), upper = sorted.slice(n - h);
  const q1 = medianOfSorted(lower), q3 = medianOfSorted(upper);
  return {
    n, sorted, min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0], sum, mean: sum / n,
    median: medianOfSorted(sorted), medianPos: n % 2 ? `${(n + 1) / 2}` : `${n / 2}, ${n / 2 + 1}`,
    q1, q3, iqr: q3 - q1, lower, upper,
  };
}

/** splits "3, 5 7;9" (also Arabic digits / ٫ ،) into numbers; invalid tokens are reported */
export function parseList(raw: string): { values: number[]; bad: string[] } {
  const toks = raw
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/٫/g, '.').replace(/[−–—]/g, '-')
    .split(/[\s,;،؛]+/).filter(Boolean);
  const values: number[] = [], bad: string[] = [];
  toks.forEach((t) => (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? values.push(Number(t)) : bad.push(t)));
  return { values, bad };
}
