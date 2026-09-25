---
version: alpha
name: "GIS Mission Platform"
description: "A Thai-language field notebook for learning GIS, Raster, Remote Sensing, and coordinate systems through short interactive missions."
colors:
  primary: "#4B90DC"
  primary-hover: "#2563A8"
  ink: "#16324A"
  background: "#EEF7FF"
  surface: "#FFFFFF"
  line: "#CFE2F2"
  danger: "#E11D48"
  warning: "#F59E0B"
  mission-teal: "#4B90DC"
  mission-amber: "#D9A441"
  mission-blue: "#2563EB"
typography:
  sans:
    fontFamily: "Inter, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: "1.5"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.375rem"
  md: "0.625rem"
  lg: "0.875rem"
spacing:
  control: "0.5rem"
  card: "1rem"
  section-gap: "2.75rem"
  page-max: "73.75rem"
components:
  button:
    rounded: "0.5rem"
    height: "2.5rem"
  card:
    rounded: "0.875rem"
  dialog:
    rounded: "0.875rem"
---

# GIS Mission Platform Design System

## Overview

### Creative North Star

The interface is a digital field notebook: pale blue map-paper surfaces establish orientation, while each mission uses a clear blue instrument language where measurements, grids, and feedback feel operational without switching into a dark theme. The product is for Thai learners who should understand a GIS concept by manipulating its evidence, not by reading a long abstract lesson.

### Product context and register

- **Audience and primary job:** Thai GIS and geography learners; complete short guided experiments and connect the result to real GIS vocabulary.
- **Target market(s) and evidence:** Thai-language educational use; the current product copy, route structure, and mission content are the evidence.
- **Locale(s) and language policy:** Thai-first UI with English GIS terms in parentheses where they are standard learning vocabulary. Numbers and units remain explicit.
- **Usage scene:** Laptop or tablet during a lesson; dense grids and maps need stable geometry, visible focus, and readable status feedback.
- **Register:** Product UI with a small amount of field-training character.
- **Memorable signature:** A measured grid is the recurring visual instrument: raster cells, UTM squares, and progress steps carry the meaning of the screen.
- **Restraint:** Controls, warnings, score changes, and recovery actions stay plain and predictable.
- **Anti-references:** Avoid generic game-dashboard neon, decorative map clutter, and marketing-card layouts that hide the next action.
- **Token ownership/runtime mapping:** Existing runtime CSS remains canonical. Tokens mirror `client/src/index.css`; changed mission surfaces consume the established CSS classes plus the documented semantic colors. Drift is checked by comparing this file with the CSS token block and representative route styles.

## Colors

The entire product uses a light-blue map-paper foundation (`background`, `surface`, `ink`, `line`) with blue as the safe primary action. Mission surfaces stay white or pale blue for continuity; amber remains for measurement and score, green for success, and rose for failure. Intent is never communicated by color alone: labels, icons, and status text accompany it.

## Typography

Inter with Noto Sans Thai is the body stack for mixed Thai/Latin copy. JetBrains Mono (falling back to a system monospace) is reserved for coordinates, timers, cell values, and compact metadata. Body copy stays at the browser-readable baseline with generous Thai line-height; display headings use weight and scale rather than decorative effects.

## Layout

Mission pages use a centered content measure of roughly 1180px, sticky mission headers, and document scrolling. Interactive grids retain a stable rectangular footprint and pair with a legend or instruction panel. At narrow widths, panels stack, tables scroll horizontally, and important actions remain reachable without clipped overlays.

## Elevation & Depth

Hierarchy comes first from tonal layers and 1px borders. Cards may use a restrained shadow; interactive modals use a stronger shadow and blurred backdrop so the active task is unmistakable. No overlay should move page content or rely on a hidden scrollbar.

## Shapes

Controls use 6–10px radii, cards use 14px, and status badges may be pill-shaped when they represent a compact state. Grid cells stay square/rectangular and use outlines for hover/focus so the data instrument remains legible.

## Components

### Foundational visual states

Enabled controls have hover, pressed, and visible keyboard-focus states. Disabled controls are dimmed and non-interactive. Busy states preserve button dimensions and expose text or a spinner. Success, warning, and error always include explanatory copy.

### Buttons and actions

Solid blue actions are the primary safe action; ghost/outline controls are secondary; amber marks measurement or score context; green marks success; red is reserved for failure or a deliberate skip/penalty. Labels use the actual action, such as “ตรวจคำตอบ”, “ลองใหม่อีกครั้ง”, and “ไปภารกิจถัดไป”.

### Navigation and data display

Mission navigation is a horizontal, keyboard-accessible step list. Read-only leaderboard and reference data use semantic tables. Raster and UTM grids use labeled interactive cells with a nearby readout so the visual cell is not the only source of meaning.

### Forms and overlays

Coordinate and score-name inputs are native labeled controls with inline recovery copy. App-owned overlays provide an accessible title, Escape/backdrop close where safe, internal scrolling, and focus placement. Critical results remain visible in the page summary after an overlay closes.

### Iconography

Lucide icons use a consistent outline style, generally 14–20px beside a text label. Icon-only close controls retain an accessible Thai label.

### Motion

Motion is short and functional: card hover, modal entrance, focus/selection outlines, and score celebration. Timers never depend on animation for meaning. `prefers-reduced-motion` disables non-essential transitions.

### Content and data visualization

Use conversational Thai, keep GIS terms stable, and format measurements with units and coordinate axes. Raster color ramps communicate elevation, not decorative branding. Every interactive grid exposes a textual cell readout.

## Do's and Don'ts

- **Do:** Keep a learner's next action visible after success, timeout, or skip.
- **Do:** Treat a timeout as an explicit educational outcome with its score consequence and a way forward.
- **Don't:** Put a denominator beside a score in the RS summary or result popup; show the score actually earned.
- **Don't:** make a clickable card or data cell a non-semantic `div` when a native button can provide keyboard access.
