/**
 * Build wrapper that fails on CSS parse errors.
 *
 * `vite build` reports malformed stylesheet rules (for example a malformed
 * selector produced by Tailwind's content scanner reading a regex literal) as
 * a WARNING and still exits 0. The rule is silently dropped from the output,
 * so a broken stylesheet reaches production with a green build.
 *
 * This wrapper runs the real build, then fails loudly on any css-syntax-error
 * in the output.
 */

import { spawn } from 'node:child_process';

const child = spawn('npx', ['vite', 'build'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
});

let output = '';

const collect = (chunk) => {
  const text = chunk.toString();
  output += text;
  // Stream through unchanged so the normal build log is still visible.
  process.stdout.write(text);
};

child.stdout.on('data', collect);
child.stderr.on('data', collect);

child.on('close', (code) => {
  const failures = [
    'css-syntax-error',
    'Unexpected identifier',
    'Expected identifier',
  ].filter((token) => output.includes(token));

  if (code !== 0) {
    console.error('\n[build] vite build failed.');
    process.exit(code ?? 1);
  }

  if (failures.length > 0) {
    console.error(
      `\n[build] FAILED: stylesheet error(s) detected during build: ${failures.join(', ')}.\n` +
        '[build] Vite exits 0 on these and silently drops the rule. Treat as fatal.',
    );
    process.exit(1);
  }

  console.log('\n[build] OK: no stylesheet errors.');
  process.exit(0);
});
