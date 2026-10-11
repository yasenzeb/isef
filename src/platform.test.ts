import { describe, it, expect } from 'vitest';
import { getFullPeriodicElements } from './data/periodicTableData';
import { EGYPT_GOVERNORATES } from './data/egyptLocationData';
import { translations } from './i18n/translations';
import { solveCircuit, CircuitComponent } from './simulators/circuitSolver';
import { calculateTsunamiSpeed, calculateSeismicTravelTimes } from './simulators/geophysicsSolver';

describe('SciNexa Scientific Virtual Laboratory Test Suite', () => {
  // 1. Chemistry Validation
  it('should include all 118 chemical elements in periodic table data', () => {
    const elements = getFullPeriodicElements();
    expect(elements).toHaveLength(118);
    expect(elements[0].symbol).toBe('H');
    expect(elements[117].symbol).toBe('Og');
  });

  // 2. Localization Validation
  it('should support full 4-language localization (EN, AR, FR, DE) with SciNexa branding', () => {
    const supportedLangs = ['en', 'ar', 'fr', 'de'] as const;
    for (const lang of supportedLangs) {
      expect(translations[lang]).toBeDefined();
      expect(translations[lang].appName).toContain('SciNexa');
      expect(translations[lang].nav.anatomy).toBeTruthy();
      expect(translations[lang].physics.mechanics).toBeTruthy();
      expect(translations[lang].chemistry.title).toBeTruthy();
      expect(translations[lang].biology.title).toBeTruthy();
      expect(translations[lang].geology.title).toBeTruthy();
    }
  });

  // 3. MNA Circuit Solver Numerical Validation
  it('should solve a DC resistor divider circuit accurately using Modified Nodal Analysis (MNA)', () => {
    // 10V DC source connected to a 100 Ohm and 100 Ohm series divider to ground
    const components: CircuitComponent[] = [
      { id: 'v1', type: 'dc_source', node1: 1, node2: 0, value: 10 },
      { id: 'r1', type: 'resistor', node1: 1, node2: 2, value: 100 },
      { id: 'r2', type: 'resistor', node1: 2, node2: 0, value: 100 },
    ];

    const solution = solveCircuit(components, 0);
    expect(solution.converged).toBe(true);
    expect(solution.nodeVoltages[1]).toBeCloseTo(10, 4);
    expect(solution.nodeVoltages[2]).toBeCloseTo(5, 4); // Voltage divider half
    expect(solution.branchCurrents['r1']).toBeCloseTo(0.05, 4); // 10V / 200 Ohm = 50mA
    expect(solution.componentPowers['v1']).toBeCloseTo(0.5, 4); // 10V * 50mA = 500mW
  });

  // 4. Geophysics Shallow-Water Tsunami Speed Validation
  it('should calculate shallow water tsunami phase speed accurately: c = sqrt(g * h)', () => {
    // At depth h = 4000m (typical open Pacific ocean depth), speed should be ~198 m/s (~713 km/h)
    const { speedMs, speedKmh } = calculateTsunamiSpeed(4000, 9.81);
    expect(speedMs).toBeCloseTo(198.09, 1);
    expect(speedKmh).toBeCloseTo(713.12, 1);
  });

  // 5. Seismology Travel Times Validation
  it('should calculate P-wave and S-wave arrival times accurately', () => {
    const times = calculateSeismicTravelTimes(150, 15, 6.5, 3.75);
    expect(times.pArrivalTimeSec).toBeGreaterThan(0);
    expect(times.sArrivalTimeSec).toBeGreaterThan(times.pArrivalTimeSec);
    expect(times.sMinusPDurationSec).toBeGreaterThan(0);
  });

  // 6. Egyptian Location Mapping Validation
  it('should maintain verified Egyptian governorates and administrations mapping', () => {
    expect(EGYPT_GOVERNORATES.length).toBeGreaterThanOrEqual(10);
    const cairo = EGYPT_GOVERNORATES.find(g => g.id === 'cairo');
    expect(cairo).toBeDefined();
    expect(cairo?.administrations.length).toBeGreaterThanOrEqual(5);
  });
});
