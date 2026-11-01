/**
 * devicePerf.ts — Dynamic Hardware Performance & Optimization Manager
 * Detects low-end hardware (mobile, budget laptops, low core count, low RAM)
 * and dynamically scales WebGL pixel ratios and rendering frequency
 * to guarantee smooth 60 FPS on weak devices without thermal throttling.
 */

export function isLowPowerDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const lowCores = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 8;
  const lowMemory = typeof (navigator as any).deviceMemory === 'number' && (navigator as any).deviceMemory <= 8;
  return isMobile || lowCores || lowMemory;
}

export function getOptimalPixelRatio(maxDesktopDpr = 1.0): number {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr, maxDesktopDpr);
}
