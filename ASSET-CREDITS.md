# Asset Credits, Provenance & Scientific Citations

This document details all scientific datasets, 3D anatomical models, chemical databases, and software libraries integrated into the **ISEF Science Platform**.

---

## 1. 3D Human Anatomy Atlas

- **Source Repository:** [Open Anatomy Atlas](https://github.com/CognitionLabSNUC/open-anatomy-atlas)
- **Author/Institution:** Cognition Lab, Shiv Nadar University Chennai (`research.cognition@snuchennai.edu.in`)
- **Primary Datasets:**
  - **Z-Anatomy:** Completed adult male body atlas with bones, muscles, viscera, nervous system, and cardiovascular structures.
    - **Integrated Build:** Commercial-safe CC BY-SA 4.0 build (excludes non-commercial inner ear and kidney models to preserve commercial freedom).
    - **Total Meshes:** 2,821 mesh files
    - **Named Structures:** 3,698 concepts indexed by Foundational Model of Anatomy (FMA) identifiers.
    - **Triangles:** 10,364,730 triangles.
    - **License:** Creative Commons Attribution-ShareAlike 4.0 International ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)).
  - **BodyParts3D:**
    - **Author:** The Database Center for Life Science (DBCLS), Japan.
    - **License:** Creative Commons Attribution 4.0 International ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
    - **Citation:** Mitsuhashi N, et al. *BodyParts3D: 3D structure database for anatomical concepts*. Nucleic Acids Res. 2009;37(Database issue):D782-D785.
  - **Procedural Geometric Fallback:**
    - Original parametric geometric primitives (`sphere`, `capsule`, `box`) created by the Cognition Lab for offline and hardware-constrained fallback.
    - **License:** MIT License.

---

## 2. Chemical Elements & Periodic Table

- **Source Organization:** International Union of Pure and Applied Chemistry ([IUPAC](https://iupac.org/)).
- **Standard Atomic Weights:** CIAAW (Commission on Isotopic Abundances and Atomic Weights).
- **Element Data Coverage:** All 118 recognized IUPAC chemical elements (Hydrogen #1 to Oganesson #118).
- **Physical Values:** Standard atomic weights, Pauling electronegativities, electron configurations, and melting/boiling points derived from verified chemical reference literature.
- **Pedagogical Disclaimer:** Electron shell diagrams are educational Bohr-model representations intended for high school and undergraduate pedagogical clarity, not literal quantum mechanical orbitals.

---

## 3. Physics Simulations & Formulations

- **Formulations:**
  - **Classical Mechanics / Projectile Motion:** Newton's Second Law of Motion (\(F=ma\)), kinematics equations for ballistic trajectories under constant gravitational acceleration (\(g\)).
  - **Electrodynamics:** Ohm's Law (\(V=IR\)) and Joule heating dissipation (\(P=VI=I^2R\)).
  - **Geometric Optics:** Snell-Descartes Law of Refraction (\(n_1 \sin\theta_1 = n_2 \sin\theta_2\)) for isotropic optical boundaries.
- **Implementation:** Custom parameterized HTML5 canvas simulation engine calculating exact positions per millisecond time-step.

---

## 4. Earth Sciences & Geophysics

- **Data Sources:** United States Geological Survey ([USGS](https://www.usgs.gov/)) and British Geological Survey ([BGS](https://www.bgs.ac.uk/)).
- **Planetary Metrics:** Standard Preliminary Reference Earth Model (PREM) boundary depths for Crust, Upper/Lower Mantle, Outer Core, and Inner Core.

---

## 5. Egyptian Educational Administration Mapping

- **Sources:** Egyptian Ministry of Education and Technical Education (MOETE) regional directorate directories.
- **Scope:** Major governorates including Cairo, Giza, Alexandria, Dakahlia, Qalyubia, Gharbia, Sharqia, Asyut, Sohag, Qena, Luxor, Aswan, Port Said, Ismailia, and Suez with verified administrative divisions.

---

## 6. Software Libraries & Licenses

- **React & React DOM:** MIT License (Meta Platforms, Inc.)
- **Three.js:** MIT License (Ricardo Cabello / Mr.doob)
- **Lucide Icons:** ISC License (Lucide Contributors)
- **Tailwind CSS:** MIT License (Tailwind Labs, Inc.)
- **Vite:** MIT License (Evan You & Vite Contributors)
- **Vitest:** MIT License (Vitest Team)
