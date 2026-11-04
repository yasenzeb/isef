# SciNexa — Design System (light)

## World
**A clinical blueprint on frosted paper.** Near-white canvas, white cards, hairline borders, 24px containers and 18px controls. The interface is achromatic at rest; educational colour appears only as a subject accent or a semantic signal. Typography does the hierarchy work.

## Non-negotiables
- Surfaces: `#f5f5f5` canvas → `#fafafa` sidebar → `#ffffff` card.
- Primary action: ink `#0a0a0a` on white. Ghost: `#f5f5f5`. Outline: 1px `#e5e5e5`.
- Red `#e7000b` is reserved for destructive and error states. Never decorative.
- Subject accents are muted and functional: anatomy rose, physics blue, chemistry amber, biology emerald, geology violet, astronomy cyan.
- Cards get a 1px hairline + whisper shadow; no gradients, no coloured shadows.
- Radius: 24px containers, 18px interactive controls, 10px nested elements.
- Body 14px; labels 12px; micro labels never below 10px.
- Motion 160–240ms, transform/opacity only. No layout-property animation. Honour reduced motion.

## Type
- UI: Geist 400/500/600. Arabic: IBM Plex Sans Arabic 400/500/600.
- Display: 36–60px / 600 / -0.05em. Arabic display: 600, tracking 0.
- Data: JetBrains Mono, tabular numerals.
- Caption: 12px, uppercase, tracking 0.05–0.08em (Latin).

## Tokens
Colours: `--canvas`, `--paper`, `--surface-alt`, `--ink`, `--ink-soft`, `--mid`, `--hairline`, `--ember`, plus six `--edu-*` accents.
Radii: `--radius-card: 24px`, `--radius-control: 18px`, `--radius-nested: 10px`.
Shadow: `0 0 0 1px rgba(23,23,23,.05), 0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`.
Layout: 1280px max, 264px sidebar, 64px topbar, 20/32px page padding.

## Surfaces
- `.sn-card` — white, 24px, hairline, shadow.
- `.sn-panel` — `#fafafa` nested block, 10px.
- `.sn-lab-stage` — dark immersive stage that keeps legacy WebGL labs readable.

## Components
`sn-btn` (primary/ghost/outline/quiet/sm/lg), `sn-input`, `sn-badge`, `sn-segmented`, `sn-navitem`, `sn-eyebrow`, `sn-stat-value`, `sn-bar`, `sn-icon-tile`, `sn-link`. Accent classes: `sn-anatomy`, `sn-physics`, `sn-chemistry`, `sn-biology`, `sn-geology`, `sn-astronomy`.

## Product surfaces
- Public landing: editorial, two-column, component mockup as imagery.
- Auth: split ink/paper, Clerk card styled into the system.
- Dashboard: sidebar + topbar + 1280px content, role-aware navigation.
- Labs: light shell, dark immersive stage with an error boundary for WebGL failure.
