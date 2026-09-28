# Impeccable Design System — Gossip Protocol

A codified, high-precision design specification and design token reference for the Gossip Protocol Social Media Intelligence Engine.

---

## 1. Visual Theme & Philosophy

- **Atmosphere**: Deep, high-contrast midnight chrome with a warm cosmic purple/magenta ambient glow and organic micro-grain film noise.
- **Architectural Anchor**: Seamless, single-viewport framed canvas surrounded by zero-divider perimeter chrome (Left Primary Rail, Top Command Bar, Right Tool Dock).
- **Core Principles**:
  - **No Unnecessary Nesting**: Avoid arbitrary wrapping boxes. Elements sit directly on the matte canvas surface.
  - **100% Dynamic Bindings**: Never hardcode operator names, dummy mock statuses, or persona copy. All values flow from telemetry APIs or authenticated sessions.
  - **Subtle, Tangible Physics**: Micro-interactions provide tactile feedback (`translateY(-1px)` hover lift, soft border glow, springy active button compressions).

---

## 2. Design Tokens

### Color Palette

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--color-viewport-bg` | `#08090d` | Outer window shell / chrome background |
| `--color-canvas-bg` | `#101116` | Main framed canvas surface |
| `--color-canvas-border` | `rgba(255, 255, 255, 0.09)` | Perimeter border of the canvas |
| `--color-card-bg` | `#151722` | Internal cards and metric tiles |
| `--color-card-border` | `rgba(255, 255, 255, 0.07)` | Neutral card border |
| `--color-card-hover-border` | `rgba(168, 85, 247, 0.30)` | Card border highlight on focus/hover |
| `--color-accent-purple` | `#a855f7` | Primary brand accent, focus states, telemetry |
| `--color-accent-orange` | `#f97316` | Emerging threat signals, active issues |
| `--color-accent-red` | `#ef4444` | Critical alerts, severe anomaly flags |
| `--color-accent-emerald` | `#10b981` | System live beacons, healthy status markers |
| `--color-accent-blue` | `#3b82f6` | Connectors (Bluesky), navigation links |

### Typography

- **Primary Sans**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Body copy, labels, headers, button text.
- **Telemetry Mono**: `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace`
  - Numerical metrics, timestamps, telemetry badges, Z-scores, JSON coordinates.

### Micro-Texture & Lighting

```css
/* Ambient Cosmic Glow */
background: 
  radial-gradient(circle 750px at 100% 0%, rgba(168, 85, 247, 0.45) 0%, rgba(126, 34, 206, 0.3) 25%, rgba(112, 26, 117, 0.16) 48%, rgba(8, 9, 13, 0) 75%),
  radial-gradient(circle 500px at 100% 30%, rgba(147, 51, 234, 0.22) 0%, rgba(91, 33, 182, 0.1) 45%, transparent 70%),
  #08090d;

/* Micro-Grain Noise */
baseFrequency: 1.45;
numOctaves: 4;
opacity: 0.055;
```

---

## 3. Structural Grid & Layout Hierarchy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TOP COMMAND BAR (h-11, transparent chrome, no dividing line, cosmic glow)    │
├────────┬────────────────────────────────────────────────────────────┬────────┤
│ LEFT   │ SEAMLESS FRAMED CANVAS (bg-[#101116], border-white/[0.09])  │ RIGHT  │
│ RAIL   │                                                            │ DOCK   │
│ (w-11) │ • Dynamic Operator Greeting                                │ (w-12) │
│        │ • 4 Metric Tiles + Segmented Quick Access                   │        │
│        │ • Real Items Needing Attention                             │ • Edit │
│        │ • Live Event Updates Feed                                  │ • Line │
│        │ • Analytical Visualizations (Recharts)                     │ • Chat │
│        │                                                            │ • Hist │
│        │ [Bottom spacing: pb-2.5 (~10px) with rounded-2xl corners]  │ • Full │
└────────┴────────────────────────────────────────────────────────────┴────────┘
```

---

## 4. Component Standards

1. **Metric Card**:
   - `rounded-xl`, `bg-[#151722]`, `border border-white/[0.07]`.
   - Top row: category label (`text-xs text-zinc-400`) + icon (`text-zinc-500`).
   - Value: `text-2xl font-bold font-mono text-white`.
   - Subtitle: `text-xs text-zinc-400`.
   - Relative timestamp: `text-[11px] font-mono text-zinc-500`.

2. **Segmented Switcher**:
   - Container: `bg-[#0b0c12] p-0.5 rounded-lg border border-white/[0.06]`.
   - Active Tab: `bg-[#2b2d3d] text-zinc-100 font-semibold rounded-md shadow-sm`.
   - Inactive Tab: `text-zinc-400 hover:text-zinc-200`.

3. **Status Badges & Beacons**:
   - Live Beacon: `w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse`.
   - Severity Pills: `CRITICAL` (`bg-red-500/20 text-red-400 border border-red-500/30`), `HIGH` (`bg-orange-500/20 text-orange-400 border border-orange-500/30`).

---

## 5. Animation Specifications

- **Page Entry (`animate-canvas-enter`)**:
  - `transform: translateY(4px) -> translateY(0)`
  - `opacity: 0 -> 1`
  - Duration: `0.25s cubic-bezier(0.16, 1, 0.3, 1)`
- **Hover Transitions**:
  - `transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`
  - Card hover: `border-color: rgba(168, 85, 247, 0.3)`, `transform: translateY(-1px)`, `box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.5)`
- **Active State**:
  - `active:scale-[0.98]` on buttons and actionable cards.
