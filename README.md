# ISEF Science Education Platform

An original, high-fidelity, interactive science education platform designed for the International Science and Engineering Fair (ISEF). The platform provides student inquiry tools, 3D visualizations, and interactive virtual laboratories across Biology, Physics, Chemistry, Earth Sciences, and Classroom Presentation modes.

---

## Features Implemented

1. **Flagship 3D Human Anatomy Atlas**
   - Built on the open-source [Open Anatomy Atlas](https://github.com/CognitionLabSNUC/open-anatomy-atlas).
   - Commercial-safe Z-Anatomy & BodyParts3D dataset integrated: **2,821 meshes, 3,698 named structures, and 10,364,730 triangles**.
   - Multi-layer filtering (skeletal, muscular, cardiovascular, visceral, nervous).
   - Anatomical specimen inspection, Latin nomenclature (Terminologia Anatomica), and FMA identifiers.
   - Built-in identification quiz mode with instantaneous educational feedback.
   - Separate full-window canvas launcher.

2. **Real-time Physics Laboratory**
   - Exact mathematical kinematic simulation for 2D ballistic projectile motion with parameter adjustments for velocity, angle, and gravity (Earth, Moon, Mars, Jupiter).
   - Dynamic DC circuits laboratory testing Ohm's law (\(V=IR\)) and Joule heating power dissipation (\(P=VI\)).
   - Geometric optics simulator computing Snell's refraction law (\(n_1 \sin\theta_1 = n_2 \sin\theta_2\)).

3. **Interactive 118-Element Periodic Table**
   - Complete IUPAC 118 chemical elements from Hydrogen (#1) to Oganesson (#118).
   - Categorized by element family (alkali, alkaline earth, transition metals, lanthanides, actinides, nonmetals, noble gases).
   - Atomic weight, Pauling electronegativity, electron configurations, and verified descriptions.
   - Searchable by English and Arabic names, chemical symbol, and atomic number.

4. **Biological Sciences Cytology Lab**
   - Interactive 3D plant and animal cell ultrastructure.
   - Organelle inspection: Nucleus, Mitochondria, Chloroplasts, Ribosomes, Endoplasmic Reticulum, Golgi apparatus, Cell Wall.
   - Detailed biological functions, membrane potentials, and synthesis mechanisms.

5. **Geology & Planetary Earth Science**
   - Stratified Earth cross-section: Crust, Mantle, Outer Core, and Inner Core.
   - Real-time seismic P-wave and S-wave event simulation.
   - Temperature gradients, depth boundaries, and chemical composition breakdown.

6. **Four-Language Complete Localization & RTL Support**
   - **Arabic (العربية):** Full right-to-left layout and Arabic scientific terminology.
   - **English (EN):** Primary international nomenclature.
   - **French (Français):** Full UI and scientific translations.
   - **German (Deutsch):** Full UI and scientific translations.

7. **Classroom & Whiteboard Mode (`/classroom`)**
   - Fullscreen presentation view optimized for school interactive whiteboards and classroom projectors.
   - High-contrast labels, large touch-friendly targets, and seamless multi-module switching.

8. **Egyptian Educational Administration Suggestions**
   - Privacy-conscious location helper with mapping across Cairo, Giza, Alexandria, Dakahlia, Qalyubia, Sharqia, Gharbia, Asyut, and other Egyptian directorates.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4)
- **3D Graphics:** WebGL2 Canvas Renderer, Three.js
- **Icons:** Lucide React
- **Testing:** Vitest
- **Hosting Target:** Vercel

---

## Local Development & Build

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run automated test suite
npm run test

# 4. Create production build
npm run build
```

---

## Vercel Deployment

This repository is linked to Vercel. Pushing to the `main` branch of `https://github.com/yasenzeb/isef` triggers automatic production deployment.

---

## Citations & Licenses

See [ASSET-CREDITS.md](./ASSET-CREDITS.md) for full citations of BodyParts3D (DBCLS), Z-Anatomy, and software licenses.
