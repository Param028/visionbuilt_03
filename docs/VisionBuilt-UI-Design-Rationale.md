# Vision Built UI design rationale

## Rationale

The redesign treats Vision Built as an engineering-led product studio: the interface uses a visible 12-column blueprint grid, IBM Plex typography, mono index labels, precise rules, and alternating paper/ink surfaces. Large editorial headings establish confidence while restrained cobalt and a single orange accent keep attention intentional. Project imagery is given most of the visual weight through layered hero sheets, large case-study covers, and two-column galleries. Every public route keeps the existing Supabase data model and URL structure, but now exposes clearer states for empty work, missing images, filters, enquiries, and 404s. The system avoids gradients, glass, blur, decorative motion, and vague marketing language so the result feels considered and credible at every viewport.

## Animation inventory

| Interaction | Duration | Easing | Trigger |
|---|---:|---|---|
| Header hide/show | 200ms | ease | Scroll direction |
| Route scroll restoration | immediate | — | Route change |
| Hero project-sheet separation | 250ms | ease | Pointer hover |
| Project cover scale | 600ms | ease | Pointer hover |
| Project title rule | 300ms | ease | Pointer hover/focus |
| Scroll cue line | 1.8s | ease-in-out | Continuous, disabled for reduced motion |
| Skeleton shimmer | 1.4s | linear | Loading state |
| Service accordion chevron | 200ms | ease | Click/tap |
| Command palette | 200ms | ease | Cmd/Ctrl+K |
| Lightbox open/close | 200ms | ease | Gallery click / Escape |

All motion is transform/opacity or a small color transition. `prefers-reduced-motion: reduce` disables decorative animation.

## Manual QA checklist

- [ ] Test at 360, 768, 1024, 1440, and 1920px with no horizontal overflow.
- [ ] Confirm keyboard focus is visible on header links, filters, cards, forms, gallery controls, and dialogs.
- [ ] Confirm Cmd/Ctrl+K opens the command palette and Escape closes it.
- [ ] Confirm Work URL filters update and clear correctly.
- [ ] Confirm empty work, missing project, failed cover image, and 404 states are usable.
- [ ] Confirm project gallery images open in the lightbox and Arrow keys/Escape work.
- [ ] Confirm Contact validation, character counter, cooldown, honeypot, success, and error states.
- [ ] Confirm admin upload and project-media relations remain functional.
- [ ] Confirm reduced-motion behavior.
- [ ] Run the build and public-route checker before release.

## Performance note

The application build currently completes successfully. Lighthouse measurements should be run against the deployed production domain with real Supabase data and representative project media; they are intentionally not fabricated here.
