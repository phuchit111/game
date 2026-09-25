# UX Contract

## Product context

- **Audience:** Thai learners studying introductory GIS, Raster, Remote Sensing, and geographic coordinate systems.
- **Primary jobs:** Read the concept, manipulate the model, understand the feedback, complete or intentionally skip a timed activity, and save the resulting score.
- **Target market(s):** Thai educational use, evidenced by the Thai-first copy and mission content.
- **Active locales:** Thai-first (`th-TH`-style content); standard GIS English terms remain alongside Thai explanations.
- **Language/content register:** Clear instructional Thai; action labels describe the result of the action.
- **Timezone/calendar policy:** No date/time persistence; countdowns are local elapsed seconds.
- **Accessibility target:** WCAG 2.2 AA baseline for semantic controls, focus, contrast, and status text.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Mission behavior and scoring | User-provided Raster/RS/Coordinate improvement plan | Current product brief | 2026-09-18 |
| Domain terminology | `client/src/constants/rasterData.ts`, `client/src/constants/coordinateData.ts`, `client/src/constants/rsData.ts` | Runtime content constants | 2026-09-18 |
| Persistence | `client/src/services/leaderboardService.ts` and `/api/leaderboard` calls | Service/API behavior | 2026-09-18 |

## Visual contract

- **Project `DESIGN.md`:** [`DESIGN.md`](DESIGN.md)
- **Token ownership:** Existing runtime CSS is canonical; `DESIGN.md` mirrors accepted values.
- **Runtime source:** `client/src/index.css` and route/component styles.
- **Mapping/drift gate:** Compare documented values with the `:root` block and run the premium static audit.
- **Supported theme:** One unified light-blue map-paper surface across the welcome screen, hub, coordinate flow, and all mission routes; amber, green, and rose remain semantic status accents.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Table Selection | Not applicable; leaderboards are read-only | This contract | n/a | semantic table inspection |
| Select/Listbox | Native `<select>` where the platform popup is acceptable; changed mission controls use labeled native buttons | Component markup | native / authored buttons | keyboard activation |
| Date | Not applicable | n/a | n/a | n/a |
| Form | Native labeled inputs with inline validation in mission result/UTM surfaces | Component markup + this contract | score entry / coordinate entry | typecheck + browser keyboard check |
| Scrollbar | Global application stylesheet in `client/src/index.css` | `DESIGN.md` + CSS | density/geometry exceptions only | computed style + browser inspection |
| Toast | Mission-owned inline status/readout plus app-owned result modals | Store state and component markup | success / warning / error | live text inspection |
| CRUD | Not applicable; score submission is a single non-CRUD mutation | n/a | n/a | submit-state inspection |

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button | Labeled native button | tonal lift/border change | visible outline | pressed position | dim/non-pointer | stable size + status | inline message when needed |
| Grid cell | Native button with cell label | outline | visible outline | selected readout | non-target cells disabled | n/a | n/a |
| Input | Native labeled field | border emphasis | visible outline | n/a | dim | submit control remains stable | inline correction copy |
| Modal | App-owned dialog | n/a | first useful control | n/a | background inert by behavior | n/a | result-specific explanation |

## Dataset navigation

- **Admin tables:** None.
- **Exploratory lists:** Leaderboards are bounded to the top entries; raster grids are fixed datasets.
- **URL state:** Mission route is persisted; transient cell selection, timers, and modal state are not.
- **Empty/loading:** Leaderboards show distinct loading and empty copy without moving the surrounding layout unexpectedly.
- **Selection scope:** Grid selection is one cell at a time; leaderboard has no selection.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Complete timed sub-mission | Correct answer or timeout/skip | Timer stops | Next sub-mission or summary | Inline result plus score | Replay where available or continue with penalty | Action remains reachable | User-provided improvement plan |
| Save score | “บันทึกคะแนน” | Button shows saving | Same result view | Saved rank/status | Local fallback in store | Keep result context | `client/src/store/*Store.ts` |
| Cancel/back | Hub/back button or safe modal close | n/a | Prior route or underlying task | No destructive side effect | n/a | Restore triggering control where available | Route/component behavior |

## Navigation and responsive behavior

- Mission routes use `/missions/:missionId`; browser back/forward restores the route.
- Sticky headers and nav do not obscure focused content; long grids/panels use document scrolling.
- Tables scroll horizontally at narrow widths; grids and forms stack below the mobile breakpoint.

## Overlays and feedback

- Dialog primitive: `.modal-backdrop` + labeled app-owned dialog, with Escape and safe backdrop close for changed resolution/flood dialogs.
- Destructive/penalty action: explicit “ยอมแพ้ / ข้ามไปข้อถัดไป (หัก 10 คะแนน)” label.
- Critical outcomes are duplicated in the underlying page status, not only in a transient popup.
- Coordinate timeout reveal: UTM timeouts mark the correct grid cell with a labeled guide point; globe timeouts add a distinct target marker, show the exact latitude/longitude, and automatically focus the camera on that point.

## Async and resilience

- Score submission is pessimistic; duplicate saves are disabled while saving and after a successful rank is returned.
- Leaderboard loading has a local fallback.
- Timers stop on terminal outcomes, including timeout, and terminal outcomes unlock the documented next activity.

## Validation

- Native inputs keep semantic types and labels; score/coordinate validation is owned by the component and displayed inline.
- No changed flow uses browser `alert`, `confirm`, or `prompt`.

## Verification

- **Static:** `node ./client/node_modules/typescript/bin/tsc --noEmit -p client/tsconfig.app.json`, `npm --prefix client run lint`, `npm --prefix client run build`, premium audit.
- **Browser:** Raster resolution modal (mouse, keyboard, Escape), flood win/loss popup, Reclassify timeout/skip, RS theory launch, RS process timeout/unlock, RS summary score text, UTM map center/labels.
- **Responsive:** desktop and narrow viewport for modal, grids, tables, and coordinate input.
- **Reduced motion:** CSS media query and state behavior should remain understandable without transitions.
