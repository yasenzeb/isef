/**
 * Single-degree-of-freedom (SDOF) Structural Dynamic Response Simulator
 * under harmonic ground excitation:
 * m * x'' + c * x' + k * x = -m * u_g''(t)
 *
 * Comparing conventional fixed-base vs. base-isolated structures.
 */

export interface StructuralResponse {
  naturalFrequencyHz: number;
  dampingRatio: number;
  displacementAmplification: number; // Dynamic Amplification Factor (DAF)
  peakRelativeDispMm: number;
  peakBaseShearKn: number;
}

export function calculateStructuralResponse(
  floorCount: number,
  groundFreqHz: number,
  groundAccG: number, // Peak ground acceleration in g (e.g. 0.3g)
  isBaseIsolated: boolean
): StructuralResponse {
  // Approximate structural period T ~ 0.1 * N floors (Rule of thumb in earthquake engineering)
  // Base isolation lengthens the period significantly to shift away from resonance
  const fixedPeriodSec = Math.max(0.2, 0.08 * floorCount);
  const periodSec = isBaseIsolated ? Math.max(2.0, fixedPeriodSec * 3.5) : fixedPeriodSec;
  const naturalFreqHz = 1 / periodSec;

  // Damping ratio: ~5% for conventional concrete, ~15-20% with base isolation dampers
  const dampingRatio = isBaseIsolated ? 0.18 : 0.05;

  // Frequency ratio r = f_ground / f_natural
  const r = groundFreqHz / naturalFreqHz;

  // Dynamic Amplification Factor (DAF) for harmonic excitation:
  // DAF = 1 / sqrt((1 - r^2)^2 + (2 * zeta * r)^2)
  const denom = Math.sqrt(Math.pow(1 - Math.pow(r, 2), 2) + Math.pow(2 * dampingRatio * r, 2));
  const daf = 1 / Math.max(0.01, denom);

  // Static displacement x_static = (m * a_g) / k = a_g / (omega_n^2)
  const omegaN = 2 * Math.PI * naturalFreqHz;
  const aGroundMs2 = groundAccG * 9.81;
  const xStaticMeters = aGroundMs2 / Math.pow(omegaN, 2);

  const peakRelativeDispMm = xStaticMeters * daf * 1000;
  
  // Approximate base shear force for a typical building mass (~500 tonnes per floor)
  const totalMassKg = floorCount * 500000;
  const peakBaseShearKn = (totalMassKg * aGroundMs2 * (isBaseIsolated ? 0.25 : Math.min(2.5, daf))) / 1000;

  return {
    naturalFrequencyHz: Number(naturalFreqHz.toFixed(2)),
    dampingRatio: Number(dampingRatio.toFixed(2)),
    displacementAmplification: Number(daf.toFixed(2)),
    peakRelativeDispMm: Number(peakRelativeDispMm.toFixed(1)),
    peakBaseShearKn: Number(peakBaseShearKn.toFixed(0)),
  };
}
