# Fusion Architecture Design System

Project priority for `ui-ux-pro-max`: use Fusion Architecture for tenant-facing
frontend work.

## Visual Direction

- Blend modern glass and steel construction aesthetics with restrained Ethiopian
  geometric precision.
- Use crisp structural grids, sharp edges, thin strokes, and spacious modern
  layouts.
- Apply heritage patterns as separators, masks, borders, or low-opacity lattice
  surfaces. Avoid decorative overload.

## Palette

- Base: graphite `#0d0e11`, steel `#14161b`, polished concrete `#f4f5f7`, crisp
  white.
- Secondary: glass blue `#6f8bab`.
- Accent: heritage gold `#d4af37`, reserved for CTAs, focus rings, active states,
  and geometric motif highlights.

## Typography

- UI/body: Outfit or a comparable high-readability geometric sans.
- Headings: Fraunces or a comparable refined serif for a classic-current tone.
- Labels: condensed technical sans for blueprint-like navigation and metadata.
- Do not use viewport-based font sizing or negative letter spacing.

## Motion

- Use Framer Motion for header, footer, services, projects, team, and contact.
- Prefer staggered fade/slide and geometric reveal effects.
- Respect `prefers-reduced-motion` through Framer Motion configuration and CSS.

## Component Rules

- Use SVG icons for interface controls. Do not use emoji as UI icons.
- Keep hover states stable and non-layout-shifting.
- Keep glass surfaces readable in light and dark themes.
- Maintain responsive behavior at 375px, 768px, 1024px, and 1440px.
