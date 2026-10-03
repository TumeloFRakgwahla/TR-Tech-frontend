# Layout Debugging Guide

Written after resolving the admin horizontal-overflow bug (72px page-level scroll
at 768px and 834px). It records the underlying CSS rule, because the symptom
pointed at tables and the cause was something else entirely.

## The core rule

**A grid track sized `auto` has a minimum of `min-content`, not zero.**

A grid item can be wider than its container. Most people expect width to be a
hard ceiling; it isn't, unless the track explicitly says so.

```css
/* Implicit `auto` track -> floor is min-content. */
.card   { display: grid; }

/* 1fr is also auto in practice: floor is also min-content. */
.card   { display: grid; grid-template-columns: 1fr; }

/* minmax(0, 1fr) -> floor is 0. */
.card   { display: grid; grid-template-columns: minmax(0, 1fr); }
```

Tailwind's `grid-cols-1` compiles to `repeat(1, minmax(0, 1fr))`, which is why
supplying a base column count fixes it. Both `grid` and `grid-cols-1` are
required: `grid-cols-1` sets `grid-template-columns` but not `display`.

`min-content` of a wide-but-unbreakable child — a table with `min-width: 640px`,
an email address, `white-space: nowrap` — then exceeds the container, the track
grows, and **the entire page scrolls sideways**, not just the intended element.

## Diagnosing overflow

Don't eyeball it. Measure it.

```bash
node scripts/layout-probe.mjs        # 12 public routes x 11 viewports
node scripts/admin-responsive-probe.mjs   # 5 admin routes x 10 viewports
node scripts/overflow-why.mjs "<route>"    # explains a single case
```

Each probe logs elements whose `getBoundingClientRect().right` exceeds
`innerWidth`. That distinguishes the two failure classes, which need opposite fixes:

| Widest offender | Cause | Fix |
| --- | --- | --- |
| Table / a known wrapper | Local content too wide | Constrain + wrap that element |
| `.admin-section-card` or similar | Grid/flex track won't shrink | Add base track / `min-w-0` |

The first time through I trusted the symptom (tables were visible and wide) and
"fixed" the tables. The probe proved the tables were correct and the *card*
was the overflowing element.

## Diagnosing without a browser

Screenshots were unreadable in this environment, so geometry was verified through
`getComputedStyle` / `getBoundingClientRect` instead. Visual checks — contrast,
overlap, spacing — still need a human.

## The admin width budget

`.admin-table-wrapper` has `overflow-x: auto`, so a table can never widen its
parent. The constraint is the **content column's min-content**, which is the
narrowest the sidebar may be:

| Viewport | Sidebar | Content | Table floor | Fits? |
| --- | --- | --- | --- | --- |
| 1024px | expanded, 256px | 720px | 640px | Yes |
| 1024px | collapsed, 64px | 912px | 640px | Yes |
| 768px | collapsed, 64px | 704px | 640px | Yes |
| 640px | collapsed, 64px | 576px | 640px | No, nested scroll |

Two rules follow:

- **Tablet table floor is 640px, not 720px.** 720px only fit with the sidebar
  expanded at exactly 1024px; the moment the sidebar collapsed, 768px overflowed.
- **The sidebar must default to collapsed below 1024px.** An expanded 256px
  sidebar leaves ~512px of content, which cannot hold even the 640px floor.

Don't raise the table floor above 640px without redoing this budget.

## The min-width trap

The fix is to *lower* the floor, never to widen the floor's container. Setting
`min-width: 640px` on a track with `minmax(0, 1fr)` does not re-flood the page;
the track can still shrink below 640, and the wrapper scrolls instead.

## Breakpoints and the sidebar

Docked (`fixed`) at `>= 1024px`; overlay below that. Both use the same
`isDocked` calculation so breakpoint decisions are never inconsistent.

Default is collapsed when `window.innerWidth < 1024`, but an **explicitly stored
preference always wins** — otherwise a returning desktop user who collapsed the
sidebar would get it re-expanded on every narrow window.

`1024` is a media query, so it cannot live in a JS matchMedia string. `Sidebar.jsx`
does subscribe to the `lg` breakpoint directly.

## Checklist for new layouts

1. Every `class="grid"` with responsive columns gets a base `grid-cols-1`, even
   when a mobile layout looks obvious. `grid lg:grid-cols-2` has **one implicit
   auto track at every width below `lg`** — the most common form of this bug.
2. Never stack two unprefixed column counts (`grid-cols-1 grid-cols-2`); the
   later one silently wins.
3. Flex items need `min-w-0` or `flex-wrap` to shrink. `flex` items default to
   `min-width: auto`, so `sm:flex-row` of fixed-width children will overflow
   rather than compress.
4. Wide content (tables, code, emails) belongs in an `overflow-x: auto` wrapper,
   and the wrapper needs a shrinkable parent — points 1 and 4 together.
5. Re-run both probes after touching layout CSS. Visual inspection will not
   catch a 72px overflow.
6. `src/index.css` is **mostly unlayered**, so custom rules there beat Tailwind's
   layered responsive utilities regardless of specificity. If a `md:` class
   appears not to work, check `index.css` before questioning the markup.

`src/test/layout-invariants.test.js` enforces points 1-3 and the table-floor rule.