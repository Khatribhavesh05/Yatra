---
name: Institutional Progress
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3f4941'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#6f7a70'
  outline-variant: '#becabe'
  surface-tint: '#006d3d'
  primary: '#006a3b'
  on-primary: '#ffffff'
  primary-container: '#268451'
  on-primary-container: '#f6fff4'
  inverse-primary: '#7ed99e'
  secondary: '#376757'
  on-secondary: '#ffffff'
  secondary-container: '#baeed9'
  on-secondary-container: '#3d6d5d'
  tertiary: '#4c6059'
  on-tertiary: '#ffffff'
  tertiary-container: '#657971'
  on-tertiary-container: '#f5fff9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9af6b8'
  primary-fixed-dim: '#7ed99e'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522d'
  secondary-fixed: '#baeed9'
  secondary-fixed-dim: '#9ed1bd'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#1d4f40'
  tertiary-fixed: '#d2e7de'
  tertiary-fixed-dim: '#b6cbc2'
  on-tertiary-fixed: '#0c1f19'
  on-tertiary-fixed-variant: '#384b44'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  section-padding-desktop: 80px
  section-padding-mobile: 40px
  gutter: 24px
  container-max-width: 1280px
---

## Brand & Style

This design system embodies a **Corporate/Modern** aesthetic tailored for institutional and governmental trust. It balances high-authority professionalism with the forward-thinking energy of green technology. The visual language is structured, clean, and highly legible, prioritizing information hierarchy and public accessibility.

The brand personality is **Reliable, Sustainable, and Authoritative**. It utilizes a "Clean Government" approach: heavy reliance on white space to signify transparency, combined with a signature palette of greens to represent ecological innovation. Visuals are grounded in reality—using crisp photography of public infrastructure—complemented by precise, technical iconography.

Key characteristics include:
- **Clarity first:** Content is organized in distinct, logical sections with clear headings.
- **Institutional Weight:** Subtle use of borders and structured grids to create a sense of stability.
- **Modern Efficiency:** While traditional in its mission, the UI feels fast and contemporary through the use of vibrant accents and modern sans-serif type.

## Colors

The color palette is dominated by a range of "Institutional Greens" that evoke growth and sustainability while maintaining a professional distance.

- **Primary Green (#2E8B57):** Used for primary actions, success states, and key brand identifiers. It is vibrant enough to stand out but deep enough to feel official.
- **Deep Emerald (#1B4D3E):** Used for footers, dark backgrounds, and high-contrast text to provide a sense of weight and gravity.
- **Soft Mint (#DCF2E8):** A functional background color for cards, alerts, or secondary sections to provide visual separation without the harshness of pure white.
- **Neutral Greys:** A range of greys (from #333333 for text to #E0E0E0 for borders) ensures the interface remains grounded and accessible.

## Typography

The typography system uses a tiered sans-serif approach to ensure maximum readability across technical data and marketing copy.

- **Headlines:** Use **Plus Jakarta Sans** for a modern, approachable, yet professional feel. Heavy weights (700-800) are used for "Power Headlines" to command attention.
- **Body Text:** **Inter** is the workhorse font, chosen for its exceptional legibility in long-form descriptions and data-heavy tables.
- **Functional Labels:** **Work Sans** provides a slightly more industrial and structured feel for eyebrows, buttons, and navigation items.

**Scaling Rules:** Headlines should tighten their line-height as they grow in size. For mobile, display sizes must scale down significantly (roughly 30-40% reduction) to prevent awkward wrapping.

## Layout & Spacing

The design system utilizes a **Fixed Grid** model for desktop to maintain the "contained" and "organized" feel of an official portal, transitioning to a fluid model for mobile devices.

- **Desktop (1440px+):** 12-column grid, 1280px max-width container, 24px gutters.
- **Tablet (768px - 1024px):** 8-column grid, 16px gutters, 32px side margins.
- **Mobile (Up to 767px):** 4-column fluid grid, 16px margins.

**Spacing Rhythm:** Use a strict 8px base unit. Section vertical spacing should be generous (80px+) to allow the content to "breathe," emphasizing the minimalist and transparent brand values. Cards and content blocks should use internal padding of 24px or 32px to maintain a premium feel.

## Elevation & Depth

Visual hierarchy is primarily established through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows. This keeps the interface feeling "flat" and modern, aligned with contemporary government digital standards.

- **Level 0 (Background):** Pure white (#FFFFFF) or ultra-light grey (#F8F9FA).
- **Level 1 (Cards/Containers):** White surfaces with a 1px solid border (#E0E0E0).
- **Interactive Depth:** When a user interacts with a card or button, a very soft, high-diffusion shadow (0px 4px 20px rgba(0,0,0,0.05)) may be applied to indicate lift.
- **Depth via Color:** Darker background sections (using the Deep Emerald) are used to "anchor" the page, typically for the hero footer or specialized feature blocks.

## Shapes

The shape language is **Soft and Professional**. It avoids the playfulness of fully rounded "pill" shapes in favor of precise, small-radius corners that feel architectural.

- **Standard Components:** Buttons, input fields, and small cards use a **4px (0.25rem)** radius.
- **Large Containers:** Hero sections or large feature cards use a **8px (0.5rem)** radius.
- **Iconography:** Icons should follow a "linear-filled" hybrid style, using the primary green and maintaining consistent stroke weights that match the typography's stem thickness.

## Components

### Buttons
- **Primary:** Solid Primary Green background, white text, 4px radius. High-contrast hover state (slight darken).
- **Secondary:** Ghost style with a Primary Green border and text.
- **Tertiary/Link:** Text-only with a trailing "arrow" or "external link" icon to denote movement.

### Cards
- Cards feature a 1px border (#E0E0E0) and no shadow by default.
- Header cards for "Latest Updates" include a top-aligned image with no border-radius on the top corners, maintaining the 8px radius only on the bottom of the container.

### Input Fields & Search
- Inputs should be rectangular with a subtle 1px grey border. 
- On focus, the border should transition to Primary Green with a soft 2px outer glow in the same hue.

### Chips & Badges
- Used for categories (e.g., "Public Transit"). Small, all-caps text using the Label-Bold style, placed in a Soft Mint (#DCF2E8) background with a tight 2px radius.

### Data Visualization
- Statistical blocks should feature large, bold numbers in Primary Green or Neutral Dark, accompanied by a small icon and a descriptive label in a lighter grey.