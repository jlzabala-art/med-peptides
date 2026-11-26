# Google Cloud Console Mobile & Responsive UX Patterns

Platform-wide UX standards for all public pricing schedules (`/pricing/*`), catalog collections (`/collection/*`), and clinical guides (`/guides/*`).

## 1. Navigation & Floating Docks (Zero Desktop Overlap)
- **`PublicUnifiedHeader`** is the single global navigation bar on desktop (`>= 768px`), exposing search, language/currency, copy/share, and `Atlas AI` (`hideAiButton={false}`).
- **`GlobalBottomStickyBar`** uses `.atlas-global-sticky-dock--mobile-only` on `/pricing/*`, `/collection/*`, `/vials/*`, and `/guides/*` so it never floats over cards or tables on laptop/desktop screens while remaining accessible for one-handed thumb use on mobile (`< 768px`).

## 2. Horizontal Scroll Affordance (Right-Edge Fade Mask)
- Any horizontal scrollable chip/tab strip (`CatalogPricingBridgeBar`, category filter pills, surgical protocol step tracks, clinical ops tabs) MUST apply a subtle right-edge alpha mask on mobile:
  ```css
  -webkit-mask-image: linear-gradient(to right, #000 88%, transparent 100%);
  mask-image: linear-gradient(to right, #000 88%, transparent 100%);
  padding-right: 22px;
  ```
- Hide native scrollbars (`scrollbar-width: none`) and enable momentum scrolling (`-webkit-overflow-scrolling: touch`).

## 3. Touch Target Minimums (Rule #23)
- Interactive controls on mobile (`<= 768px`) — filter chips, segmented switches (`Catalog | B2B Table`), tab buttons, and primary/secondary CTAs — target `min-height: 40px–44px` to prevent fat-finger mis-taps.

## 4. Symmetric Card Grids & Progressive KPI Disclosure
- **No orphan cards on desktop**: Pair 4-card sections in explicit `repeat(4, minmax(0, 1fr))` or `repeat(2, minmax(0, 1fr))` grids rather than `auto-fit` widths that leave 3 cards on row 1 and 1 orphan card on row 2.
- **Compact `2x2` KPI grid on mobile**: Keep the 4 mandatory KPIs (Rule #22) in a `2x2` grid (or collapsible 1-line summary strip expanding to `2x2`) rather than stacking 4 full-width cards vertically above the fold.
