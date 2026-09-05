/**
 * Test Setup File
 * ---------------
 * This file is automatically loaded before every Vitest test run via the
 * Vitest configuration (setupFiles). It bootstraps the test environment so
 * that custom DOM matchers from @testing-library/jest-dom are available
 * globally in all test files.
 *
 * Structure:
 *   - A single import that extends the global `expect` with DOM matchers such
 *     as `toBeInTheDocument()`, `toBeVisible()`, etc.
 */

import '@testing-library/jest-dom';

window.open = () => {};
