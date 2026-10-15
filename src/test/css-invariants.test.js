/**
 * CSS Contract Regression Suite
 * -----------------------------
 * Guards the two silent-failure classes that lint and the bundler both miss:
 *
 *  1. Phantom classes - JSX references a hand-written `admin-*` class that is
 *     never defined in index.css. The `admin-*` namespace is project-specific,
 *     so Tailwind can never generate it: an undefined name silently applies no
 *     styling and produces no error anywhere in the toolchain.
 *     (Originally caught: admin-z-sidebar, admin-input, admin-chart-tons.)
 *
 *  2. Date-separator character classes written literally in any file under
 *     the Tailwind `content` glob. Tailwind's content scanner reads source as
 *     raw text - comments included - and parses them as utility candidates,
 *     emitting a malformed selector that fails the CSS parse while the build
 *     still exits 0.
 *
 * Both of these shipped unnoticed. They are structural invariants, so a
 * source-level test is the correct place to enforce them.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SRC = join(process.cwd(), 'src');
const CONTENT_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return CONTENT_EXTS.has(extname(full)) ? [full] : [];
  });

// This file intentionally contains the strings it searches for, so exclude
// the test directory from its own scan.
const appFiles = walk(SRC).filter((f) => !f.includes(`${join('src', 'test')}`));
const rel = (p) => p.slice(SRC.length + 1);
const read = (f) => readFileSync(f, 'utf8');

describe('CSS class contracts', () => {
  it('finds source files to scan', () => {
    expect(appFiles.length).toBeGreaterThan(20);
  });

  it('defines every admin-* class that JSX references', () => {
    const css = read(join(SRC, 'index.css'));
    const defined = new Set([...css.matchAll(/\.(admin-[a-zA-Z][\w-]*)/g)].map((m) => m[1]));

    // Only look inside className/class attribute values. A bare scan also
    // matches non-class identifiers such as the `admin-data-changed` event
    // name, `components/admin/utils` import paths, and chart-theme colour keys.
    const CLASS_ATTR = /class(?:Name)?\s*=\s*(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g;

    const phantom = new Map();
    for (const file of appFiles) {
      const text = read(file);
      for (const attr of text.matchAll(CLASS_ATTR)) {
        const value = attr[1] || attr[2] || attr[3] || '';
        for (const m of value.matchAll(/\b(admin-[a-zA-Z][\w-]*)\b/g)) {
          const cls = m[1];
          if (!defined.has(cls) && !phantom.has(cls)) phantom.set(cls, rel(file));
        }
      }
    }

    expect([...phantom].map(([c, f]) => `${c} (undefined, used in ${f})`)).toEqual([]);
  });

  it('does not reference the misspelled chart-tab class', () => {
    const typo = ['admin', 'chart', 'tons'].join('-');
    const offenders = appFiles.filter((f) => read(f).includes(typo)).map(rel);
    expect(offenders).toEqual([]);
  });

  it('sets data-radix-dialog-content so the mobile dialog CSS is reachable', () => {
    // index.css keys its entire mobile bottom-sheet layer off this attribute.
    // Without it on the element the whole block is dead code.
    expect(read(join(SRC, 'index.css'))).toContain('[data-radix-dialog-content]');
    expect(read(join(SRC, 'components', 'ui', 'dialog.jsx'))).toContain('data-radix-dialog-content');
  });

  it('scopes the admin overlay below md in CSS rather than via md:hidden', () => {
    // An unlayered `.admin-mobile-overlay.active { display: block }` outranks
    // Tailwind's layered `md:hidden` utility, which silently showed the
    // full-viewport backdrop on desktop.
    const css = read(join(SRC, 'index.css'));
    const at = css.indexOf('.admin-mobile-overlay');
    expect(at).toBeGreaterThan(-1);
    // The enclosing @media must appear before the rule it wraps.
    expect(css.slice(Math.max(0, at - 120), at)).toContain('@media');
  });
});

describe('Tailwind content-scanner safety', () => {
  it('contains no literal date-separator character classes', () => {
    // Built dynamically so this test file does not itself contain the token
    // it forbids anywhere under `src/`.
    const bait = new RegExp(`\\[\\-:${'T'}\\.${'Z'}\\]`);
    expect(appFiles.filter((f) => bait.test(read(f))).map(rel)).toEqual([]);
  });
});
