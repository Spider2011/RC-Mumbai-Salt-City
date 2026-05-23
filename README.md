# Rotaract Club of Mumbai Salt City · 2026–27

> **अन्त अस्ति प्रारम्भ** — *Aant Asti Prarambh* — "The End Is The Beginning"

A philosophically-rooted, glassmorphism website for the Rotaract Club of Mumbai Salt City
(RID 3141), built as the calling card of President Tanish Momaya's year. It is designed to feel
like a digital monument — a meditation on cyclicality, renewal, leadership, and service.

Apple meets Linear meets a Sanskrit philosopher's notebook.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + custom CSS design tokens |
| Animation | **Framer Motion** (exclusive motion library) |
| Smooth scroll | Lenis (integrates with Framer Motion's `useScroll`) |
| Icons | Lucide React + custom SVG (Sanskrit glyphs, brand logos) |
| Fonts | `next/font` — Cormorant Garamond, Inter, Space Grotesk, Tiro Devanagari Sanskrit |

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Pages

| Route | Status |
|-------|--------|
| `/` | **Production-ready** — full home experience |
| `/about` | Developed — history + year-theme deep dive |
| `/team` | Scaffolded — Board of Directors (Tanish Momaya, President) |
| `/projects` | Scaffolded — 7 avenues + signature projects |
| `/events` | Scaffolded — upcoming + recap |
| `/gallery` | Scaffolded — 12-tile mosaic placeholders |
| `/join` | Functional recruitment form (client-validated) |
| `/contact` | Functional contact form + socials |

Sparse content is marked with `// TODO: expand` comments.

## Project Structure

```
app/                     # App Router pages + layout + globals.css
components/
  ui/                    # GlassCard, GlassButton, GlassNav, SectionHeading,
                         # Eyebrow, GoldDivider, PageHeader, FormField, SocialIcons
  sections/              # Hero, Mission, YearTheme, Avenues, Gallery, CTA, Footer, forms
  effects/               # Mandala, CustomCursor, ParticleField, ScrollReveal,
                         # PageTransition, SmoothScroll, Loader, AmbientMandala, ShlokaEasterEgg
lib/
  motion.ts              # Centralized Framer Motion variants & transitions
  constants.ts           # Site copy, nav, avenues, stats, pillars, shloka
  utils.ts               # cn(), math helpers
types/index.ts           # Shared interfaces
design-system/           # UI/UX Pro Max persisted design system (MASTER.md)
```

## Customization

- **Copy & data** → `lib/constants.ts` (club info, avenues, stats, board roles, shloka)
- **Colors / glass / type scale** → CSS custom properties in `app/globals.css` (`:root`)
- **All animation** → `lib/motion.ts` (single source of truth for variants)
- **Gallery / team / project images** → drop into `public/images/{gallery,team,projects}/`
  and replace the placeholder `div`s (clearly commented)
- **Ambient audio** → add `public/audio/ambient.mp3` (toggle already wired in the footer)

## Signature Interactions

- **Custom cursor** — spring-following glass circle + dot (`useSpring` on `useMotionValue`)
- **Page transitions** — `AnimatePresence mode="wait"` + glass shutter wipe
- **Orchestrated hero** — staggered 6-step entrance (particles → mandala → Sanskrit → headline → CTA → nav)
- **Persistent mandala** — fixed top-right, infinitely rotating sitewide anchor
- **Glass 3D tilt** — mouse-tracked ±8° with spring smoothing
- **Loader** — Sanskrit glyph drawn stroke-by-stroke via SVG `pathLength`
- **Easter egg** — Konami code *or* clicking the ambient mandala 7× reveals the Īśopaniṣad
  *Pūrṇam adaḥ* invocation

---

## How the Skills Were Applied

### UI/UX Pro Max

The design system was generated via the skill's `--design-system` generator and persisted to
`design-system/`. Its guidance shaped:

- **Accessibility (CRITICAL)** — WCAG-AA contrast (dark blur underlays behind text on glass),
  designed focus rings (gold, 2px offset), `aria-label`s on icon-only buttons, semantic landmarks
  (`header`/`main`/`footer`/`nav`/`section` with `aria-labelledby`), and full keyboard navigation.
- **Touch & interaction** — every interactive element ≥ 44×44px; `cursor-pointer` on all
  clickables; loading/disabled states on form submit; inline validation with errors beside fields.
- **Performance** — `prefers-reduced-motion` respected everywhere via Framer Motion's
  `useReducedMotion` (loops, parallax, tilt, and the custom cursor all degrade gracefully);
  compositor-friendly properties only (`transform`/`opacity`/`filter`).
- **Typography & color** — a 1.333 modular scale, the skill-recommended elegant serif pairing
  (Cormorant Garamond display + Inter body), and a disciplined token palette.
- **Composition** — a small primitive set (`GlassCard`, `GlassButton`, `SectionHeading`,
  `Eyebrow`, `GoldDivider`, `PageHeader`, `FormField`) composed across every page — no one-off styling.
- **Anti-template policy** — moody cinematic glass (not pastel default), editorial bento gallery
  mosaic, intentional hierarchy, and SVG icons (never emoji).

### Framer Motion

Used as the **exclusive** animation library, idiomatically:

- **Variants & orchestration** — `staggerChildren` / `delayChildren` for the hero sequence,
  avenue grid, stat cards, and gallery mosaic; all variants centralized in `lib/motion.ts`.
- **Scroll** — `useScroll` + `useTransform` drive the hero parallax (mandala, text, particles);
  `whileInView` (with `once`) triggers section reveals; `pathLength` draws the theme divider and loader.
- **Gesture physics** — `useMotionValue` + `useTransform` + `useSpring` power the 3D card tilt and
  the custom cursor; `whileHover` / `whileTap` use spring transitions on buttons and cards.
- **Continuous loops** — `repeat: Infinity` with `ease: "linear"` for the mandala, `easeInOut`
  breathing glow on CTAs, orchestrated particle drift, and the animated CTA wave.
- **Transitions** — `AnimatePresence mode="wait"` for page transitions and form success states.

---

*© 2026–27 · Crafted with intention.*
"# RC-Mumbai-Salt-City" 
