import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { describe, it, expect } from 'vitest';

/**
 * Accessibility invariants for the checkout form.
 *
 * These are source-level checks on purpose. A rendering test would prove the
 * attributes exist in some state; these prove every validated field is wired
 * the same way, so a field added later cannot quietly ship without an
 * accessible name / error association.
 */

const here = dirname(fileURLToPath(import.meta.url));
const checkoutModal = readFileSync(join(here, '..', 'components', 'CheckoutModal.jsx'), 'utf8');
const indexCss = readFileSync(join(here, '..', 'index.css'), 'utf8');

/** Fields the delivery form validates. */
const VALIDATED_FIELDS = ['name', 'email', 'phone', 'street', 'city'];

describe('CheckoutModal form accessibility', () => {
  it.each(VALIDATED_FIELDS)('%s error is announced and associated', (field) => {
    // The error node must be a live region with a stable id.
    expect(checkoutModal).toContain(`id="${field}-error"`);
    expect(checkoutModal).toContain(`role="alert" className="text-xs text-red-600">{errors.${field}}`);
  });

  it.each(VALIDATED_FIELDS)('%s input points at its error and flags invalid', (field) => {
    expect(checkoutModal).toContain(`aria-invalid={Boolean(errors.${field})}`);
    expect(checkoutModal).toContain(`aria-describedby={errors.${field} ? '${field}-error' : undefined}`);
  });

  it('coupon field has an accessible name and error association', () => {
    expect(checkoutModal).toContain('aria-label="Coupon code"');
    expect(checkoutModal).toContain("aria-describedby={couponError ? 'coupon-error' : undefined}");
    expect(checkoutModal).toContain('id="coupon-error"');
  });

  it.each(VALIDATED_FIELDS)('%s label is bound to its input', (field) => {
    expect(checkoutModal).toContain(`htmlFor="${field}"`);
    expect(checkoutModal).toContain(`id="${field}"`);
  });

  it('every validated input carries a stable id for label binding', () => {
    // A missing id would silently break both the label and the error wiring.
    const ids = checkoutModal.match(/<Label htmlFor="([^"]+)"/g) || [];
    for (const field of VALIDATED_FIELDS) {
      expect(ids.some((i) => i.includes(`"${field}"`))).toBe(true);
    }
  });

  it('validation remains a colour-independent cue (text message, not border alone)', () => {
    // The red border is supplementary; each error also renders text.
    const errorParagraphs = checkoutModal.match(/\{errors\.\w+ && <p[^>]*>/g) || [];
    expect(errorParagraphs.length).toBeGreaterThanOrEqual(VALIDATED_FIELDS.length);
  });
});

describe('Admin tablet layout invariants', () => {
  it('does not force a table wider than the collapsed-sidebar content area', () => {
    // At 768px tablet portrait with a collapsed 64px sidebar the content area is
    // ~704px. A 720px floor forced a horizontal scroll inside a narrow column.
    const tabletBlock = indexCss.match(
      /@media \(min-width: 641px\) and \(max-width: 1024px\) \{[\s\S]*?\n\s*\}/
    );
    expect(tabletBlock).not.toBeNull();
    expect(tabletBlock[0]).not.toMatch(/min-width:\s*(7[2-9]\d|[89]\d\d|\d{4,})px/);
  });

  it('keeps the table horizontally scrollable rather than clipping', () => {
    expect(indexCss).toContain('.table-responsive {');
    expect(indexCss).toMatch(/\.table-responsive\s*\{[\s\S]{0,120}overflow-x:\s*auto/);
  });
});

describe('Sidebar default-collapse invariant', () => {
  const sidebar = readFileSync(join(here, '..', 'components', 'Sidebar.jsx'), 'utf8');

  it('respects an explicitly stored preference over the viewport default', () => {
    const block = sidebar.match(/const \[isCollapsed[\s\S]*?\}\);/);
    expect(block).not.toBeNull();
    // The stored value must be returned before any viewport fallback is reached.
    expect(block[0].indexOf('getItem')).toBeLessThan(block[0].indexOf('innerWidth'));
  });

  it('defaults to collapsed below the lg breakpoint', () => {
    expect(sidebar).toMatch(/innerWidth\s*<\s*1024/);
  });
});
