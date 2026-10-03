import { readdirSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

/**
 * Layout invariants.
 *
 * These pin the specific CSS defects that caused measured horizontal page
 * overflow in the admin. They are source-level on purpose: the runtime probes
 * (`scripts/admin-responsive-probe.mjs`) prove the fix, while these stop it
 * regressing in CI where no browser is available.
 *
 * The underlying rule, in CSS terms:
 *
 *   A grid track sized `auto` — which is what you get from a bare `class="grid"`
 *   with no `grid-cols-*` — has a minimum of min-content, NOT zero. So a child
 *   with a min-content floor (a table with `min-width: 640px`, a long
 *   unbreakable email, `white-space: nowrap`) forces the track wider than its
 *   container and the whole page scrolls sideways.
 *
 *   Tailwind's `grid-cols-1` compiles to `repeat(1, minmax(0, 1fr))`, whose
 *   minimum is 0, so the track can shrink and the wide child scrolls inside its
 *   own overflow container.
 *
 * That is exactly the 72px overflow measured on /admin at 768px and 834px.
 */

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..');

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.jsx') ? [full] : [];
  });
}

const files = walk(src);
const classNames = files.flatMap((file) => {
  const content = readFileSync(file, 'utf8');
  return [...content.matchAll(/className="([^"]*)"/g)].map((m) => ({
    file: file.replace(src, ''),
    value: m[1],
    tokens: m[1].split(/\s+/).filter(Boolean),
  }));
});

const STRUCTURAL = new Set(['admin-layout', 'admin-sidebar-container', 'admin-mobile-overlay']);

describe('responsive grid tracks can shrink', () => {
  it('every responsive grid declares an explicit base column count', () => {
    const offenders = classNames.filter(({ tokens }) => {
      if (!tokens.includes('grid')) return false;
      if (tokens.some((t) => STRUCTURAL.has(t))) return false;
      // Does any token give a real base column count (unprefixed)?
      return !tokens.some((t) => /^grid-cols-\d+$/.test(t));
    });

    expect(
      offenders.map((o) => `${o.file}: "${o.value}"`)
    ).toEqual([]);
  });

  it('does not stack two conflicting base column declarations', () => {
    // `grid-cols-1 grid-cols-2` is dead code: the later class wins the cascade.
    const offenders = classNames.filter(({ tokens }) =>
      tokens.includes('grid-cols-1') && tokens.some((t) => /^grid-cols-[2-9]$/.test(t))
    );

    expect(offenders.map((o) => `${o.file}: "${o.value}"`)).toEqual([]);
  });

  it('responsive column overrides are paired with a mobile base', () => {
    // Catches the specific regression: `grid lg:grid-cols-2` with no base, which
    // yields one implicit auto track at every width below lg.
    const offenders = classNames.filter(({ tokens }) =>
      tokens.includes('grid')
      && tokens.some((t) => /^(sm|md|lg|xl|2xl):grid-cols-/.test(t))
      && !tokens.some((t) => /^grid-cols-\d+$/.test(t))
    );

    expect(offenders.map((o) => `${o.file}: "${o.value}"`)).toEqual([]);
  });
});

describe('admin data tables stay inside their wrapper', () => {
  const css = readFileSync(join(src, 'index.css'), 'utf8');

  it('provides a horizontal scroll container for tables', () => {
    expect(css).toMatch(/\.admin-table-wrapper\s*\{[\s\S]{0,160}overflow-x:\s*auto/);
    expect(css).toMatch(/\.table-responsive\s*\{[\s\S]{0,160}overflow-x:\s*auto/);
  });

  it('does not raise the tablet table floor above the collapsed-sidebar content area', () => {
    // At 768px with a 64px collapsed sidebar the content column is ~704px, so a
    // 720px floor reintroduced the nested scroll.
    const tablet = css.match(
      /@media \(min-width: 641px\) and \(max-width: 1024px\) \{[\s\S]*?\n\s*\}/
    );
    expect(tablet).not.toBeNull();
    expect(tablet[0]).not.toMatch(/min-width:\s*(7[2-9]\d|[89]\d\d|\d{4,})px/);
  });
});

describe('admin filter toolbars wrap', () => {
  /**
   * Scoped deliberately narrowly.
   *
   * The overflow was a row of `sm:w-40` <Select> triggers inside a narrow grid
   * column: 4 x 160px + 3 x 12px gap = exactly the 676px measured at 1024px.
   * `flex` items default to `min-width: auto`, so they cannot shrink below
   * their content, and `sm:flex-row` has no wrapping to fall back on.
   *
   * This must NOT be generalised to "every `sm:flex-row` needs flex-wrap":
   * `dialog.jsx` and friends are vendored shadcn primitives, and the centered
   * CTA rows on the confirmation/404 pages have never overflowed. Asserting
   * that would mean editing vendor code to satisfy a made-up rule.
   */
  const toolbars = ['components/admin/FilterBar.jsx', 'pages/Admin/InventoryManagement.jsx'];

  it.each(toolbars)('%s wraps its fixed-width controls', (file) => {
    const content = readFileSync(join(src, file), 'utf8');
    const toolbar = [...content.matchAll(/className="([^"]*)"/g)]
      .map((m) => m[1].split(/\s+/).filter(Boolean))
      .find((tokens) => tokens.includes('sm:flex-row') && tokens.includes('gap-3'));

    expect(toolbar, 'expected a gap-3 sm:flex-row toolbar').toBeDefined();
    // `flex-wrap` or `sm:flex-wrap`; below sm the toolbar is already a column,
    // so the responsive variant is the tighter choice.
    expect(toolbar.some((t) => t.endsWith('flex-wrap'))).toBe(true);
  });

  it('still lays the controls out in a row, not a stack', () => {
    // Guards against "fixing" the overflow by removing sm:flex-row entirely.
    for (const file of toolbars) {
      const content = readFileSync(join(src, file), 'utf8');
      expect(content).toMatch(/sm:w-40/);
    }
  });
});

describe('admin sidebar offset matches the docked breakpoint', () => {
  it('collapses by default below the lg breakpoint', () => {
    const sidebar = readFileSync(join(src, 'components', 'Sidebar.jsx'), 'utf8');
    // 768-1023px is the docked-but-cramped range: an expanded 256px sidebar
    // leaves ~512px, too little for a data table.
    expect(sidebar).toMatch(/innerWidth\s*<\s*1024/);
  });

  it('honours an explicitly stored preference first', () => {
    const sidebar = readFileSync(join(src, 'components', 'Sidebar.jsx'), 'utf8');
    const block = sidebar.match(/const \[isCollapsed[\s\S]*?\}\);/);
    expect(block).not.toBeNull();
    expect(block[0].indexOf('getItem')).toBeLessThan(block[0].indexOf('innerWidth'));
  });
});
