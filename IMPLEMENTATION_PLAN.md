# SkinCode — work plan

## Product slice

Build a mobile-first Telegram Mini App prototype that lets a user select a known foundation shade, describe how it fits, optionally set formula preferences, and receive deterministic demo recommendations. The prototype must also support product details, demo stores, saved items, feedback, and the no-data path.

## Delivery phases

1. **Foundation — complete** — Vite + React + TypeScript, route shell, design tokens, mobile canvas, safe-area support, reusable glass/card/button/navigation components.
2. **Demo domain — complete** — typed local catalog, shade match table, stores, persisted user selection, saved products, and feedback.
3. **Core matching journey — complete** — home, product search, shade selection, fit assessment, preferences, loading, results, recommendation detail, and store list.
4. **Retention paths — complete** — My shades, saved collection, local feedback, missing-product form, and no-match recovery.
5. **Telegram shell — complete** — safe `ready`/`expand`, safe-area variables, back-button integration, and browser fallback.
6. **Quality pass — in progress** — keyboard/focus states, 44px touch targets, reduced motion, 320–480px checks, desktop framing, production build verification, and reference-driven asset refinement.

## Acceptance checks

- Complete happy path from `/` to a demo store notification.
- Search and selection operate on local data only.
- Recommendations are deterministic and never repeat the source product.
- Saved state and feedback survive refresh through `localStorage`.
- No-match and missing-product flows are intentional, not errors.
- No horizontal overflow at 320px; fixed controls clear safe areas.
- Demo-data disclosure is visible in results and commerce screens.

## Current execution order

The current pass validates the deterministic matching engine, tightens route focus and navigation states, and replaces placeholder hero art with a reference-driven product asset. Browser-device visual regression remains the last QA item.
