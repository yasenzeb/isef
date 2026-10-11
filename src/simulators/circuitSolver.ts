// MNA (Modified Nodal Analysis) Linear Circuit Solver
// Supports DC Voltage Sources, Current Sources, Resistors, Switches, Meters, and Ground references.

export interface CircuitComponent {
  id: string;
  type: 'resistor' | 'dc_source' | 'current_source' | 'ground' | 'switch' | 'meter';
  node1: number; // Node index
  node2: number; // Node index
  value: number; // Ohms for resistor, Volts for DC source, Amps for current source
  label?: string;
  state?: boolean; // For switches (true = closed, false = open)
}

export interface CircuitSolution {
  nodeVoltages: Record<number, number>;
  branchCurrents: Record<string, number>;
  componentPowers: Record<string, number>;
  converged: boolean;
  message?: string;
}

/**
 * Solves a linear DC circuit using Modified Nodal Analysis (MNA):
 * [ G   B ] [ v ] = [ i ]
 * [ C   D ] [ j ]   [ e ]
 */
export function solveCircuit(components: CircuitComponent[], groundNode = 0): CircuitSolution {
  // Filter out open switches
  // For closed switches, model them as near-zero resistance (0.001 Ohm)
  const effectiveComponents: CircuitComponent[] = [];

  for (const c of components) {
    if (c.type === 'switch') {
      if (c.state !== false) {
        // Closed switch acts like a small resistance wire (1mOhm)
        effectiveComponents.push({
          id: c.id,
          type: 'resistor',
          node1: c.node1,
          node2: c.node2,
          value: 0.001,
          label: c.label || 'Closed Switch',
        });
      }
      // If switch is open, it isolates the branch entirely
    } else if (c.type === 'meter') {
      // Ideal voltmeter has high resistance (10 MOhm)
      effectiveComponents.push({
        id: c.id,
        type: 'resistor',
        node1: c.node1,
        node2: c.node2,
        value: 10000000,
        label: c.label || 'Voltmeter',
      });
    } else {
      effectiveComponents.push(c);
    }
  }

  // Find all distinct nodes (excluding ground)
  const nodeSet = new Set<number>();
  effectiveComponents.forEach(c => {
    if (c.type !== 'ground') {
      nodeSet.add(c.node1);
      nodeSet.add(c.node2);
    }
  });

  const vSources = effectiveComponents.filter(c => c.type === 'dc_source');
  const resistors = effectiveComponents.filter(c => c.type === 'resistor');
  const cSources = effectiveComponents.filter(c => c.type === 'current_source');

  // Remap nodes to 0..N-1 excluding ground
  const normalNodes = Array.from(nodeSet).filter(n => n !== groundNode).sort((a, b) => a - b);
  const nodeMap = new Map<number, number>();
  normalNodes.forEach((n, idx) => nodeMap.set(n, idx));

  const n = normalNodes.length;
  const m = vSources.length;
  const totalSize = n + m;

  if (totalSize === 0) {
    return { nodeVoltages: { [groundNode]: 0 }, branchCurrents: {}, componentPowers: {}, converged: true };
  }

  // Create matrix A and vector z: A * x = z
  const A: number[][] = Array.from({ length: totalSize }, () => Array(totalSize).fill(0));
  const z: number[] = Array(totalSize).fill(0);

  // 1. Fill conductance matrix G
  resistors.forEach(r => {
    const rVal = Math.max(1e-9, r.value);
    const g = 1 / rVal;
    const n1 = nodeMap.get(r.node1);
    const n2 = nodeMap.get(r.node2);

    if (n1 !== undefined) A[n1][n1] += g;
    if (n2 !== undefined) A[n2][n2] += g;
    if (n1 !== undefined && n2 !== undefined) {
      A[n1][n2] -= g;
      A[n2][n1] -= g;
    }
  });

  // 2. Fill B, C matrices and z vector for voltage sources
  vSources.forEach((vs, idx) => {
    const vIndex = n + idx;
    const n1 = nodeMap.get(vs.node1);
    const n2 = nodeMap.get(vs.node2);

    if (n1 !== undefined) {
      A[n1][vIndex] += 1;
      A[vIndex][n1] += 1;
    }
    if (n2 !== undefined) {
      A[n2][vIndex] -= 1;
      A[vIndex][n2] -= 1;
    }

    z[vIndex] = vs.value; // e vector entry
  });

  // 3. Fill independent current sources into z vector
  cSources.forEach(cs => {
    const n1 = nodeMap.get(cs.node1);
    const n2 = nodeMap.get(cs.node2);
    if (n1 !== undefined) z[n1] -= cs.value; // Leaving node 1
    if (n2 !== undefined) z[n2] += cs.value; // Entering node 2
  });

  // Gaussian elimination with partial pivoting
  try {
    const x = gaussianElimination(A, z);

    // Extract node voltages
    const nodeVoltages: Record<number, number> = { [groundNode]: 0 };
    normalNodes.forEach((nodeId, idx) => {
      nodeVoltages[nodeId] = x[idx];
    });

    // Compute branch currents and powers
    const branchCurrents: Record<string, number> = {};
    const componentPowers: Record<string, number> = {};

    resistors.forEach(r => {
      const v1 = nodeVoltages[r.node1] ?? 0;
      const v2 = nodeVoltages[r.node2] ?? 0;
      const vDrop = v1 - v2;
      const current = vDrop / Math.max(1e-9, r.value);
      branchCurrents[r.id] = current;
      componentPowers[r.id] = Math.abs(current * vDrop);
    });

    vSources.forEach((vs, idx) => {
      const current = x[n + idx];
      branchCurrents[vs.id] = current;
      const v1 = nodeVoltages[vs.node1] ?? 0;
      const v2 = nodeVoltages[vs.node2] ?? 0;
      componentPowers[vs.id] = Math.abs(current * (v1 - v2));
    });

    return {
      nodeVoltages,
      branchCurrents,
      componentPowers,
      converged: true,
    };
  } catch (err: any) {
    return {
      nodeVoltages: { [groundNode]: 0 },
      branchCurrents: {},
      componentPowers: {},
      converged: false,
      message: err.message || 'Singular matrix: floating nodes or shorted sources',
    };
  }
}

/**
 * Standard Gaussian elimination with partial pivoting solver
 */
function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let p = 0; p < n; p++) {
    // Find pivot
    let maxRow = p;
    for (let i = p + 1; i < n; i++) {
      if (Math.abs(M[i][p]) > Math.abs(M[maxRow][p])) {
        maxRow = i;
      }
    }

    // Swap rows
    [M[p], M[maxRow]] = [M[maxRow], M[p]];

    if (Math.abs(M[p][p]) < 1e-12) {
      throw new Error('Singular matrix');
    }

    // Eliminate below
    for (let i = p + 1; i < n; i++) {
      const alpha = M[i][p] / M[p][p];
      for (let j = p; j <= n; j++) {
        M[i][j] -= alpha * M[p][j];
      }
    }
  }

  // Back substitution
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}
