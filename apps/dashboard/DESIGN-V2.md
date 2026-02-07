# Bullpen Dashboard — Design System v2
## "Warm Professional" — YC-ready polish

### Philosophy
Keep the warmth and personality. Drop the roughness. Think Linear meets Notion on a cream palette.
The dashboard should feel **confident, clean, and production-ready** — not like a design experiment.

### What Changed from v1 (Warm Brutalist)
- ❌ Grain overlay → removed
- ❌ Dot grid background → removed  
- ❌ Terminal headers (dark bars with traffic light dots) → clean section headers
- ❌ CRT scanlines → removed
- ❌ Diagonal stripes → removed
- ❌ Bebas Neue display font → Inter for headings (clean, professional)
- ❌ Geometric dividers → subtle dividers or spacing
- ❌ Dark sidebar (#1a1a1a) → warm light sidebar matching the palette
- ✅ Cream palette preserved (#f5f3ee warm cream base)
- ✅ Burnt orange accent preserved (#c2410c) — used sparingly for active states
- ✅ JetBrains Mono for data/code — kept
- ✅ IBM Plex Sans for body — kept
- ✅ Lucide icons — kept

### Color Palette

```
Background:      #f5f3ee  (warm cream)
Surface:         #ffffff  (white cards)
Surface Hover:   #faf9f6  (warm white)
Border:          #e8e5de  (warm gray border)
Border Subtle:   #f0ede6  (very subtle dividers)

Text Primary:    #1a1a1a  (near black)
Text Secondary:  #6b6560  (warm gray)
Text Muted:      #9c9590  (lighter warm gray)

Accent:          #c2410c  (burnt orange — active nav, primary actions)
Accent Hover:    #9a3412  (darker orange)
Accent Subtle:   #c2410c/8  (background tint for active items)

Status Green:    #16a34a
Status Yellow:   #ca8a04
Status Red:      #dc2626
Status Blue:     #2563eb
Status Purple:   #7c3aed
```

### Typography

```
Headings:     Inter, 600 weight (page titles, section headers)
Body:         IBM Plex Sans, 400/500
Mono/Data:    JetBrains Mono, 400 (status badges, timestamps, IDs)
```

Page titles: 18-20px, semibold Inter, sentence case (not ALL CAPS)
Section headers: 13px, semibold, text-secondary
Body: 13-14px IBM Plex Sans
Small: 11-12px for metadata, timestamps

### Sidebar
- Warm cream background (#faf9f6), matching the page
- Subtle right border (#e8e5de)
- Nav items: 13px, medium weight, warm gray text
- Active item: burnt orange text + soft orange left indicator bar + orange/5 bg tint
- Hover: slight bg darken
- Logo area: clean, no traffic light dots
- Bottom: collapse toggle, subtle

### Cards
- White background (#ffffff)
- 1px warm border (#e8e5de)
- 8px border radius (rounded-lg)
- Subtle shadow on hover: `0 1px 3px rgba(0,0,0,0.04)`
- Section headers: text, not dark terminal bars
- Padding: 16-20px

### Stat Cards
- White card with border
- Large number in mono font (JetBrains Mono)
- Accent color for the number (context-dependent)
- Small label above in muted text
- No dark header bar, no CRT effects

### Status Badges
- Pill shape (rounded-full), small
- Soft background tint + colored text
- No uppercase, no monospace — just clean labels
- Subtle, not loud

### Buttons
- Primary: filled burnt orange, white text, rounded-lg
- Secondary: white bg, border, dark text
- Ghost: no border, subtle hover bg
- All: 13px text, medium weight, 8px radius

### Spacing & Layout
- Page padding: 24px
- Card gap: 16px  
- Section gap: 24px
- Consistent 4px grid

### Transitions
- All interactive elements: 150ms ease
- Hover states: background color shifts, not transforms
- No fancy animations for basic interactions
- Loading: clean skeleton shimmer (warm gray)

### Empty States
- Centered, subtle icon (24px, muted color)
- Short title + description
- Optional CTA button
- Minimal, not dramatic

### What NOT to do
- No grain/noise overlays
- No dot grids
- No dark terminal-style headers on cards
- No CRT/scanline effects
- No ALL CAPS headings (except maybe tiny labels)
- No diagonal stripes
- No geometric dividers
- No traffic light dots
- No brutalist box shadows
