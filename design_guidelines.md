# Chess Battle Arena - Design Guidelines

## Design Approach
**System Selected:** Material Design with clean, functional focus
**Rationale:** Utility-focused chess application requiring clarity, data density, and standard interaction patterns. The user explicitly requested "simple but completely functional" design, prioritizing usability over visual complexity.

## Core Design Principles
1. **Clarity First:** Chess board and game state must be immediately readable
2. **Information Hierarchy:** Active game elements prioritized over static controls
3. **Spatial Organization:** Symmetric layout reflecting White vs Black opposition
4. **Minimal Distraction:** Zero decorative animations; focus on game logic

## Layout System

### Overall Structure
```
[Player Selection & Game Setup - Full Width Container]
[Selected Players Display + Control Buttons - Centered]
[Three Column Layout:]
  - Left: White Move Notation (20% width)
  - Center: Chess Board (60% width)
  - Right: Black Move Notation (20% width)
[Scorecard - Centered below board]
[Rules Section - Full Width]
```

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: `p-4` to `p-6`
- Section spacing: `py-8` to `py-12`
- Element gaps: `gap-4` standard, `gap-6` for major sections

### Container Widths
- Main container: `max-w-7xl mx-auto px-4`
- Chess board: Fixed aspect ratio, responsive scaling
- Move notation panels: Fixed width sidebars, scrollable vertically

## Typography

### Font Selection
- Primary: **Inter** (via Google Fonts)
- Monospace: **JetBrains Mono** for move notation (PGN format)

### Type Scale
- Page title: `text-3xl font-bold` (Chess Battle Arena)
- Section headers: `text-xl font-semibold` (Selected Players, Rules)
- Labels: `text-sm font-medium uppercase tracking-wide`
- Move notation: `text-sm font-mono leading-relaxed`
- Body text: `text-base leading-relaxed`
- Timer display: `text-2xl font-bold tabular-nums`

## Component Library

### Player Selection Area
- **Dropdowns:** Full-width on mobile, side-by-side on desktop with labels above
- **Match Configuration:** Horizontal layout with three controls: match format dropdown, timer toggle, timer duration selector
- **Visual Grouping:** Light border around entire setup section with rounded corners

### Selected Players Display
- **Layout:** Two-column grid showing "Player 1 (White): [Model]" and "Player 2 (Black): [Model]"
- **Typography:** Medium weight, prominent but not oversized

### Control Buttons
- **Size:** Large clickable targets (`px-8 py-3`)
- **Arrangement:** Horizontal row with consistent spacing (`gap-4`)
- **States:** Clear disabled states when game conditions not met
- **Icons:** Use Heroicons for Start (play), Pause, and Resign (flag) with text labels

### Chess Board
- **Grid:** 8×8 standard board using CSS Grid
- **Squares:** Perfect squares maintaining aspect ratio across viewports
- **Pieces:** Unicode chess symbols (`♔♕♖♗♘♙`) scaled appropriately, or SVG pieces for clarity
- **Coordinates:** Algebraic notation (a-h, 1-8) along edges in subdued styling
- **Last Move Highlight:** Distinct visual treatment for source and destination squares
- **Legal Moves:** Subtle indicators on valid destination squares during player turn

### Move Notation Panels
- **Container:** Fixed height with overflow scroll, border separation from board
- **Format:** Numbered move pairs (1. e4 e5, 2. Nf3 Nc6)
- **Highlighting:** Current move emphasized
- **Monospace Font:** Ensures alignment and readability

### Timer Display
- **Position:** Above each player's move notation area
- **Format:** MM:SS with clear player association
- **Warning States:** Visual urgency when time running low (below 10 seconds)

### Scorecard
- **Layout:** Table format showing Game #, Result, White Score, Black Score
- **Summary Row:** Bold totals with winner declaration when match complete
- **Spacing:** Clear row separation, aligned columns

### Draw Offer Modal
- **Type:** Centered overlay with backdrop
- **Actions:** Clear "Accept Draw" and "Reject" buttons with consequences explained
- **Dismissible:** Only via explicit action choice

### Rules Section
- **Layout:** Two-column list of game-specific rules on desktop, single column mobile
- **Typography:** Readable body text with numbered or bulleted lists
- **External Link:** Prominent button/link to FIDE rules using external link icon

## Responsive Behavior

### Mobile (<768px)
- Single column layout: controls stack vertically
- Chess board: Full width minus minimal padding
- Move notation: Collapsible panels or tabs
- Scorecard: Simplified table or cards

### Tablet (768-1024px)
- Two-column player selection
- Reduced sidebar widths, larger board
- Full feature set maintained

### Desktop (>1024px)
- Full three-column layout as designed
- Optimal chess board size (600-700px)
- Comfortable notation panel widths (240-280px each)

## Accessibility

- **Focus Indicators:** Clear keyboard navigation for all interactive elements
- **ARIA Labels:** Comprehensive labeling for screen readers ("White's move notation", "Black's timer")
- **Color Independence:** Board squares distinguishable by pattern/texture, not just shading
- **Text Contrast:** All text meets WCAG AA standards minimum

## Images
**No images required** - This is a functional chess application using standard chess piece representations (Unicode or SVG) and UI controls. All visual elements are programmatic.