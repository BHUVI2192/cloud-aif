---
name: Heritage Tech
colors:
  surface: '#f4faff'
  surface-dim: '#cfdce4'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f6fd'
  surface-container: '#e3f0f8'
  surface-container-high: '#ddeaf2'
  surface-container-highest: '#d7e4ec'
  on-surface: '#111d23'
  on-surface-variant: '#434652'
  inverse-surface: '#263238'
  inverse-on-surface: '#e6f3fb'
  outline: '#737783'
  outline-variant: '#c3c6d4'
  surface-tint: '#2b5bb5'
  primary: '#003178'
  on-primary: '#ffffff'
  primary-container: '#0d47a1'
  on-primary-container: '#a1bbff'
  inverse-primary: '#b0c6ff'
  secondary: '#046b5e'
  on-secondary: '#ffffff'
  secondary-container: '#9defde'
  on-secondary-container: '#0f6f62'
  tertiary: '#492f26'
  on-tertiary: '#ffffff'
  tertiary-container: '#62453c'
  on-tertiary-container: '#dcb4a8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00429c'
  secondary-fixed: '#a0f2e1'
  secondary-fixed-dim: '#84d5c5'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005046'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#e7bdb1'
  on-tertiary-fixed: '#2c160e'
  on-tertiary-fixed-variant: '#5d4037'
  background: '#f4faff'
  on-background: '#111d23'
  surface-variant: '#d7e4ec'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  kannada-body:
    fontFamily: Noto Sans Kannada
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system establishes a high-trust, institutional presence for a regional marketplace. It rejects fleeting "startup" aesthetics in favor of a **Modern Institutional** style that balances the reliability of a government entity with the efficiency of a premium service platform. 

The aesthetic is characterized by structured layouts, intentional whitespace, and a "physicality" derived from the Malnad region's environmental palette. The UI must feel grounded and authoritative to foster trust between local homeowners and service providers. Key visual markers include crisp borders, high-contrast typography, and a "Modular Card" system that organizes complex data into digestible, accessible units suitable for outdoor viewing on varying screen qualities.

## Colors

The palette is rooted in the **Trustworthy Institutional** and **Malnad Earth Tones** directions. 

- **Primary (Institutional Navy):** Used for headers, primary actions, and verification markers to denote authority.
- **Secondary (Deep Malnad Teal):** Used for service categories and secondary CTAs, reflecting the lush landscape of Shivamogga.
- **Tertiary (Areca Earth):** A rich, grounded brown used for subtle accents and backgrounds to provide warmth.
- **Neutral (Slate):** A deep charcoal for maximum legibility on text.

**Accessibility Note:** All background/foreground combinations must maintain a 4.5:1 ratio. Surfaces use a "Paper White" (#F9FAFB) rather than pure white to reduce glare on LCD screens in bright outdoor settings.

## Typography

The system utilizes a dual-font strategy to ensure bilingual harmony. **Inter** provides a clean, systematic feel for Latin characters and numbers, while **Noto Sans Kannada** is the standard for regional text due to its exceptional legibility at small sizes.

**Bilingual Rule:** When Kannada and English appear together, the Kannada text size should be matched to the English x-height or slightly larger (approx 110%) to ensure equal visual weight. Use "Medium" weights for Kannada to prevent the complex glyphs from "filling in" on low-resolution displays. Avoid italicizing Kannada text.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model.
- **Mobile:** A 4-column fluid grid with 16px side margins. 
- **Desktop:** A 12-column centered grid with a maximum width of 1280px.

Spacing is strictly based on an **8px grid**. Consistent vertical rhythm is essential for high-density information. Stats and data tiles should use "sm" (12px) internal padding to maximize data density while maintaining clear separation. Horizontal gutters are locked at 16px to prevent content crowding on smaller handsets common in the local market.

## Elevation & Depth

This design system uses **Tonal Layering** and **Low-Contrast Outlines** instead of heavy shadows. 

- **Level 0 (Base):** #F9FAFB (Paper White).
- **Level 1 (Cards):** Pure White surface with a 1px border (#E5E7EB).
- **Level 2 (Active/Hover):** 1px border using the Primary Color with a very subtle, 4px blur ambient shadow (Opacity 0.05).

This approach ensures that hierarchy is visible even on screens with poor contrast ratios or in direct sunlight. Verification badges and status indicators use solid color fills to pop against the outlined card surfaces.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a professional, "buttoned-up" look that feels more modern than sharp corners but more serious than fully rounded/pill shapes. 

- **Buttons & Inputs:** 4px (0.25rem) radius.
- **Cards & Containers:** 8px (0.5rem) radius.
- **Verification Badges:** 2px radius or sharp, to denote a "stamp of approval" or official seal.

## Components

### Service Provider Cards
Cards must lead with the provider's name and a "Verified" badge in the Primary color. Use a 2-column layout within the card for mobile: Left for the profile image (64x64px), Right for name, rating, and quick stats.

### Verification Badges
A combination of a checkmark icon and the text "Verified Professional." Use the Primary color (#0D47A1) for background with White text for maximum contrast.

### High-Contrast CTAs
Primary buttons use the Primary Color background with white text. Height is fixed at 48px for touch-target accessibility. Label text must be all-caps for Latin characters to increase prominence.

### Data-Dense Stats Tiles
Used for provider profiles (e.g., "500+ Jobs," "4.8 Rating"). These use a Tertiary color (#5D4037) for the numerical value and Neutral Slate for the label. Tiles should have a light grey background (#F3F4F6) to separate them from the main card surface.

### Input Fields
Fields use a 1px solid border (#94A3B8). Labels must stay visible above the field (no floating labels that disappear) to ensure users don't lose context in complex forms.