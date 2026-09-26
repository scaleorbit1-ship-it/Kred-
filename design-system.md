# KRED Design System

## 1. Core Color Palette

| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| **Dark Gray Primary** | `#18181B` (Zinc 900) | Primary brand dark surface, solid action buttons, key text color, footers, and active badges across the UI. |
| **Dark Gray Elevated** | `#27272A` (Zinc 800) | Elevated cards, side navigation surface, tooltips, secondary dark elements. |
| **Dark Gray Muted** | `#3F3F46` (Zinc 700) | Secondary action states, dark borders, subdued elements. |
| **Zinc Subtext** | `#71717A` (Zinc 500) | Subtitles, metadata, secondary text. |
| **Accent Emerald** | `#10C77A` | Primary accent color for cryptographic verification, active indicators, success states, and glowing accents. |
| **Canvas Background** | `#F8F7F2` | Warm minimalist paper canvas background across the entire website and landing pages. |
| **Pure Surface** | `#FFFFFF` | Primary white card containers with soft zero-line elevation. |
| **Subtle Neutral Border**| `#EDEEF0` / `#E4E4E7` | Minimal hairline borders without harsh dividing lines. |

---

## 2. Logo Mark Specification (Original Tri-Card Brand Signature)

The **KRED Logo Mark** consists of three layered sovereign cryptographic credential cards in an isometric stack:

| Stack Layer | Color Code | Role |
| :--- | :--- | :--- |
| **Layer 1 (Front)** | `#10C77A` (Vault Green) | Frontmost card representing verified sovereign identity & live proof. |
| **Layer 2 (Middle)** | `#3A6EFF` (Signal Blue) | Middle elevated card representing zero-knowledge attestations. |
| **Layer 3 (Back)** | `#0E1E36` (Deep Navy) | Backing foundation card representing encrypted enclave security. |

---

## 3. Typography Guidelines

- **Standard Font Weight**: **Medium (`font-weight: 500` / `font-medium`)** across the website.
  - All body text, navigation elements, form controls, labels, buttons, and descriptions are styled in clean medium font weight (500) for uniform, legible contrast.
- **Headings**:
  - `font-medium` / `font-semibold` with crisp proportional letter spacing (`tracking-tight` / `-0.02em`).
- **Code & Cryptographic Hashes**:
  - `font-mono` (`JetBrains Mono`, tabular figures).

---

## 4. Spatial & Surface Architecture

- **Zero Harsh Dividing Lines**:
  - Eliminate harsh horizontal dividing strokes (`border-t`, `border-b`) between public landing sections.
  - Sections transition smoothly via airy whitespace (`py-20` / `py-28`), soft surface card elevation, and rounded containers.
- **Border Radius Standards**:
  - Outer Containers & Hero Displays: `rounded-[28px]` or `rounded-[32px]`.
  - Standard Cards & Feature Blocks: `rounded-[20px]` or `rounded-[24px]`.
  - Interactive Buttons & Inputs: `rounded-[12px]` or `rounded-xl`.
  - Indicator Tags & Status Labels: `rounded-full` or `rounded-lg`.
- **Shadows**:
  - Soft, modern, feather-light shadows (`shadow-2xs`, `shadow-xs`, `shadow-sm`).

---

## 5. Navigation Architecture & Post-Sign-Up SideNav

- **Public Website Navigation (Pre-Sign-Up)**:
  - Clean top navigation bar with brand logo, direct product/solution routes, "Sign In" modal launcher, and "Get Started" CTA button.
  - Free from clutter to maximize landing page conversion.
- **Post-Sign-Up Sovereign Workspace SideNav**:
  - Located on the workspace page after sign up (`/dashboard`, `/assistant`).
  - Features a collapsible dock (`w-[72px]` collapsed, `w-[260px]` expanded).
  - Includes full credential filtering, category navigation, live vault health telemetry, quick actions, and direct switching between Credentials & AI Assistant.
- **Fancy Hamburger Icon**:
  - 3-bar animated hamburger icon with smooth transition morphing into a close state and color-shifting center bar (`#10C77A`).
  - Positioned directly in the post-signup workspace sidebar header for seamless 1-click toggling.
- **Mobile Responsive Drawer**:
  - Seamlessly handles overlay and slide-in transitions on mobile viewports.

---

## 6. Components & Interactive States

- **Primary Action Buttons**:
  - Default: `bg-[#18181B] text-white font-medium hover:bg-[#27272A] shadow-xs`
  - Accent Alternative: `bg-[#10C77A] text-[#18181B] font-medium hover:bg-[#10C77A]/90 shadow-sm`
- **Secondary Buttons**:
  - `bg-white border border-[#EDEEF0] text-[#18181B] font-medium hover:bg-[#F8F7F2]`
- **Inputs & Form Controls**:
  - `bg-[#F8F7F2] border border-[#EDEEF0] text-[13px] text-[#18181B] font-medium focus:border-[#18181B] focus:bg-white`
