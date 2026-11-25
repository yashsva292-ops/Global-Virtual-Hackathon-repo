# Global Virtual Hackathon: Project Blueprint & Token-Efficient Protocol

## Permanent Master Prompt & Core Directive
> **Standard:** Meticulously crafted, production-grade engineering—zero "vibe-coded" shortcuts, zero bloated files, and zero generic AI UI templates. Every file has one clear responsibility, strict TypeScript types (zero `any`), zero-trust database security with Row-Level Security (RLS), and a handcrafted, bespoke visual direction.

---

## Plugin Coordination & Token Efficiency Architecture

| Plugin / Tool | Designated Role | Token-Efficiency Guardrail |
| :--- | :--- | :--- |
| **Context7** | Framework & Library Docs | Query only target symbols & exact version API signatures; prevent hallucinating deprecated APIs. |
| **Google Developer Knowledge** | Gemini API / Google Cloud specs | Targeted keyword queries for exact parameters, SDK types, and structured outputs. |
| **Superpowers** | Architecture, Planning & Review | Enforce strict phase gates (Brainstorm -> Plan -> TDD -> Review); prevent uncontrolled iteration loops. |
| **Supabase (MCP / CLI)** | Schema & Zero-Trust Security | Fetch live schema metadata; design normalized schemas with indexing & RLS policies for judge safety. |
| **Chrome DevTools** | Performance, A11y, Layout Audits | Run targeted audits post-build to ensure smooth 60fps animations and accessible design. |
| **CodeRabbit** | Static Review & Linting | Catch anti-patterns and performance bottlenecks before any commit to `main`. |
| **Vercel CLI** | Build & Deployment | Edge caching, fast previews, and zero-downtime production deployment. |

---

## Phase 1 Blueprint: Architecture, Security & Design

### 1. Workspace & Docs Audit
- **Repository:** `Global-Virtual-Hackathon-repo` (Git branch: `main`, clean tree).
- **Environment:** Node.js `v24.19.0`, npm `11.17.0`, Windows OS.
- **Framework Target:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Supabase SSR (`@supabase/ssr`).
- **Google GenAI Target:** `@google/genai` (official modern SDK).

### 2. Modular Engineering Architecture (`/src` or root)
```text
src/
├── app/                  # Next.js App Router (pages, layout, route handlers)
│   ├── (auth)/           # Authenticated & judge preview routes
│   ├── api/              # Secure backend Route Handlers with validation
│   ├── layout.tsx        # Root layout with fonts, metadata, providers
│   └── page.tsx          # High-impact landing page & interactive demo
├── components/           # UI Components
│   ├── ui/               # Atomic design primitives (buttons, inputs, cards)
│   ├── layout/           # Navigation, footer, hero banners
│   └── features/         # Domain-specific interactive widgets
├── lib/                  # Infrastructure & Shared Utilities
│   ├── supabase/         # Typed SSR client & server helpers
│   ├── gemini/           # Gemini API client & prompt orchestration
│   └── utils/            # Styling (cn), formatters, constants
├── hooks/                # Custom React hooks (isolated business logic)
├── types/                # Strict TypeScript interfaces & database types (Zero `any`)
└── schemas/              # Zod validation schemas for forms & API payloads
```

### 3. Database & Zero-Trust Security (Supabase PostgreSQL)
- **RLS Everywhere:** `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` on every single table.
- **Judge / Anonymous Sandbox Isolation:** Public judges get test accounts or scoped session IDs that can interact with the app without overwriting or viewing other judges' submissions.
- **Foreign Keys & Cascades:** Explicit referential integrity on all relational tables.
- **Indexes:** B-tree indexes on foreign keys, `user_id`, `created_at`, and query filters.

### 4. Bespoke Visual Design System
- **Theme:** *"Unveiling Technology"* — Tech-forward, atmospheric dark/light mode with deep slate accents, precision borders, glow accents, and monospace code typography.
- **Typography:** `Inter` / `Geist Sans` for UI prose, `JetBrains Mono` / `Geist Mono` for technical data and code.
- **Micro-Interactions:** Fluid CSS transitions, hover elevations, and responsive loading skeletons for zero layout shift.


---

## Phase 2: Parallel Execution, Review & Live Launch

> **Execution Protocol:** Coordinate parallel workers via `@mentions` and do not mark the task complete until the Verifier passes every check.

1. **@db-architect (`Supabase` + `Context7`):**
   - Apply the SQL migrations, indexes, and strict Row-Level Security (RLS) policies in Supabase.
   - Generate accurate TypeScript database types and build a clean, isolated data-access layer with full error handling and input validation.

2. **@ui-craftsman (`Context7` + `Gemini API` if needed):**
   - Build the frontend components strictly following our Phase 1 design tokens and modular file structure.
   - Implement skeleton loading states, graceful error boundaries, keyboard accessibility, and responsive layouts across desktop and mobile. Keep components small, pure, and readable.

3. **@staff-reviewer (`CodeRabbit` + `Superpowers`):**
   - Run a `CodeRabbit` audit across all newly written code.
   - Flag and refactor any security vulnerabilities, exposed secrets, N+1 queries, race conditions, dead code, or messy logic until the diff is spotless.

4. **@qa-verifier (`Chrome DevTools`):**
   - Start the local dev server and open the live app using `Chrome DevTools`.
   - Test the full user journey end-to-end, inspect the Console and Network tabs to confirm zero runtime errors or failed Supabase requests, and verify visual alignment.

5. **@release-lead (`Vercel`):**
   - Write a crisp, judge-ready `README.md` featuring the problem statement, system architecture overview, tech stack, and local setup steps.
   - Verify environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc. — never hardcoded), deploy the build to `Vercel`, and confirm the live public `.vercel.app` URL responds cleanly.


---

## Phase 3: Frontend Craftsmanship & Interaction Engine

> **Standard:** Awwwards-grade, premium interactive engineering. An experience that feels like a professionally engineered web showcase, far beyond a conventional school project.

### 3.1 — Visual Design Direction
- **Modern, Premium Visual Language:** Atmospheric dark/obsidian theme inspired by top-tier creative technology showcases.
- **Storytelling + Usability:** Immersive visual narrative balanced with clear, intuitive information architecture.
- **Rigorous Design System:** Consistent color tokens, typography, modular scale, fine hairline borders, glow accents, and elevations.
- **Full Responsiveness:** Flawless cross-device experience across desktop, tablet, and mobile.

### 3.2 — Animation & Motion Engine
- **Purposeful Motion:** Smooth, 60fps GPU-accelerated micro-interactions; zero gratuitous motion or layout shifts.
- **Orchestration:**
  - Staggered entrance sequences.
  - Smooth route & view transitions.
  - Scroll-driven progressive reveals & subtle parallax depth.
  - Fluid hover feedback & tactile interactive states.
  - Respect for `prefers-reduced-motion`.

### 3.3 — Modular Component Architecture
- Reusable, atomic primitives: Navigation, Hero Canvas, Interactive Simulation Canvas, Control Dials & Sliders, Metric Cards, Technical Annotation Tooltips, Step-by-Step Mechanism Explanations.
- Zero copy-paste or duplicate logic; clean separation of presentation and simulation state.

---

## Phase 4: Simulation Experience & Visual Intelligence

> **Core Philosophy:** The mechanism must be genuinely computed in our own client-side code—never faked with pre-rendered videos or hardcoded animations.

### 4.1 — Genuine Interactive Simulation
- Real-time parameter inputs (voltages, frequencies, particle densities, physical coordinates).
- Mathematical calculations performed live per frame (differential equations, field vectors, or charge distributions).
- Immediate, visible cause-and-effect relationship between user inputs and simulation state.

### 4.2 — Visual Explanations & Multimodal Clarity
- Interactive diagrams, dynamic vector graphs, and animated SVGs/Canvas.
- Step-by-step playback controls (Play, Pause, Step-Forward, Reset, Velocity adjustment).
- Interactive annotations, before-and-after state toggles, and live readouts.

### 4.3 — The 2-Minute "Aha!" Learning Experience
- **Progressive Disclosure:** Simple, intuitive physical analogy first; technical mathematical rigor accessible on demand.
- First-time visitors and judges grasp the central technological breakthrough within 2 minutes.
- Strictly NOT a generic chatbot wrapper or static reading article.

---

## Phase 5: Performance, Accessibility & Competition Readiness

### 5.1 — Performance Guardrails
- 60fps animation budget with minimal GPU/CPU overhead.
- Zero layout shifts (CLS = 0).
- Tree-shaken dependencies; lazy loading of heavy simulation or 3D modules.
- Fast initial load time on standard consumer hardware and network conditions.

### 5.2 — Accessibility (A11y)
- Full keyboard operability for all simulation controls and navigation.
- WCAG AA compliant contrast ratios across dark mode surfaces.
- ARIA live regions for dynamic simulation state announcements.
- Strict reduced-motion support disabling non-essential motion.

### 5.3 — Competition Hard Gates (Judges Verification)
- **Zero Friction:** 100% functional via a public URL; no sign-in, login, download, or browser extension required.
- **Zero API Dependency for Core:** The core scientific/technological simulation runs entirely in-browser with zero paid external API quotas.
- **Universal Device Compatibility:** Tested and verified on multiple viewport sizes.
- **Robust Error & Empty States:** Graceful fallbacks for WebGL/Canvas context loss or invalid input bounds.

---

## Phase 6: Visual Graphics & Motion Experience

### 6.1 — Curated Library Stack (Zero Bloat)
Evaluate and integrate only what directly serves the project:
* **UI Primitives:** `shadcn/ui` (accessible Radix primitives) + `Tailwind CSS`.
* **Motion & Layout:** `Motion` (Framer Motion) for UI component animation & gestures; `GSAP` for complex multi-stage timelines if needed; `Lenis` for smooth inertial scrolling.
* **Specialized Effects:** Curated components from `Aceternity UI` / `Magic UI` / `React Bits` where they genuinely enhance the theme without bloat.
* **Canvas & 3D:** HTML5 2D Canvas / WebGL or lightweight `Three.js` / `@react-three/fiber` for physical particle simulations.
* **Data Visualization:** `Recharts` / `D3.js` for real-time mathematical curve plotting.

### 6.2 — Advanced Motion Design & Scientific Visualization
* Layered parallax, smooth camera-like view transitions, and interactive particle fields.
* Scientific accuracy: all visual representations must faithfully reflect the underlying physical equations.

---

## Future Development Roadmap (Backlog)

> **IMPORTANT:** The following concept is preserved in the backlog for a future development cycle. It is explicitly **DEFERRED** and will NOT be implemented in the initial core delivery.

### [FUTURE — NOT IMPLEMENTED] Animated Phone-to-Interactive-Science-Simulation
- **Step 1:** Premium vertical 3D smartphone rendering with photorealistic glass, reflections, and ambient depth.
- **Step 2:** Smooth 3D rolling rotation from vertical portrait to horizontal landscape orientation.
- **Step 3:** Cinematic finger entrance interacting naturally with the screen surface.
- **Step 4:** The phone screen morphs into the primary electron simulation arena (displaying electrostatic charge transfer, capacitive touch field distortion, or semiconductor electron transport).
- **Step 5:** "Deep Dive" trigger opening expanded technical breakdown and advanced parameter controls.
- **Implementation Stack (Future):** Three.js / React Three Fiber + GSAP scene timeline + Canvas electron physics engine.

---

## Phase 7: Tooling, Plugin & Integration Audit

| Integration | Type | Audit Status | Project Purpose |
| :--- | :--- | :--- | :--- |
| **GitHub** | Core VCS | ✅ Configured | Branching, atomic commits, remote sync to `Global-Virtual-Hackathon-repo`. |
| **Context7** | Docs Intelligence | ✅ Installed | Version-exact documentation retrieval for Next.js 15, Motion, Canvas, and Tailwind. |
| **Google Developer Knowledge** | Google SDK Docs | ✅ Installed | Official Google Cloud & modern `@google/genai` reference docs. |
| **Superpowers** | Engineering Discipline | ✅ Installed | Phase gates: Brainstorming, Planning, TDD, and Strict Verification. |
| **CodeRabbit** | Static Code Review | ✅ Installed | Security, anti-pattern, dead-code, and bundle hygiene checks. |
| **Chrome DevTools** | QA & A11y Verification | ✅ Installed | Performance profiling, 60fps motion audits, console error checks, responsive testing. |
| **Supabase** | Backend & Sandbox | ✅ Installed (Optional) | User data, session persistence, or judge sandbox (isolated with RLS; non-blocking for core demo). |
| **Vercel** | CI/CD & Public Hosting | ✅ Installed | Public zero-friction preview & production deployments. |

---

## Master Execution Rules
1. **Never implement everything at once.** Work sequentially through validated planning phases.
2. **Inspect first, verify always.** Never guess package versions or APIs; consult Context7 or official docs.
3. **Decoupled Simulation Engine:** Separate the pure mathematical/scientific computation layer (`lib/simulation/`) from the React rendering layer (`components/simulation/`).
4. **Zero-API Core Independence:** Core mechanism must work client-side without external API keys or auth.
5. **Real Browser Testing:** Verify every interactive control, canvas, and animation in a real browser tab via DevTools before claiming completion.
6. **Preserve Future Backlog:** Keep future enhancements clearly delineated from active deliverables.
