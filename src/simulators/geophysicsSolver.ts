// Scientifically validated Earth science geophysics calculations and models

/**
 * Calculates long-wave tsunami phase speed in the shallow-water gravity wave approximation:
 * c = sqrt(g * h)
 * Valid when water depth h is significantly smaller than the wavelength lambda (h / lambda < 0.05).
 *
 * @param depthMeters - Ocean water depth in meters (e.g., 4000m for deep ocean)
 * @param gravity - Gravitational acceleration (default 9.81 m/s^2)
 * @returns Phase speed in meters per second
 */
export function calculateTsunamiSpeed(depthMeters: number, gravity = 9.81): { speedMs: number; speedKmh: number } {
  const safeDepth = Math.max(0.1, depthMeters);
  const speedMs = Math.sqrt(gravity * safeDepth);
  const speedKmh = speedMs * 3.6;
  return { speedMs, speedKmh };
}

/**
 * Simplified seismological P-wave and S-wave arrival time model
 * P-waves: Primary compressional waves (v_p ~ 6.0 to 8.0 km/s in continental crust / upper mantle)
 * S-waves: Secondary shear waves (v_s ~ v_p / sqrt(3) ~ 3.5 to 4.5 km/s)
 *
 * @param epicentralDistanceKm - Distance from epicenter to seismic station in km
 * @param focalDepthKm - Hypocenter depth in km
 */
export function calculateSeismicTravelTimes(
  epicentralDistanceKm: number,
  focalDepthKm = 10,
  vp = 6.5, // km/s
  vs = 3.75 // km/s
) {
  // Hypocentral distance D = sqrt(dist^2 + depth^2)
  const hypocentralDist = Math.sqrt(Math.pow(epicentralDistanceKm, 2) + Math.pow(focalDepthKm, 2));
  const pArrivalSec = hypocentralDist / vp;
  const sArrivalSec = hypocentralDist / vs;
  const sMinusPSec = sArrivalSec - pArrivalSec;

  return {
    hypocentralDistanceKm: Number(hypocentralDist.toFixed(1)),
    pArrivalTimeSec: Number(pArrivalSec.toFixed(2)),
    sArrivalTimeSec: Number(sArrivalSec.toFixed(2)),
    sMinusPDurationSec: Number(sMinusPSec.toFixed(2)),
  };
}

/**
 * Richter / Moment Magnitude energy release calculation:
 * log10(E) = 4.8 + 1.5 * M (Energy in Joules)
 */
export function calculateEarthquakeEnergyJoules(magnitude: number): number {
  return Math.pow(10, 4.8 + 1.5 * magnitude);
}
