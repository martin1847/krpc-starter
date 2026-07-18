#!/usr/bin/env node
/**
 * check-ds-drift.mjs — DS anti-drift gate.
 *
 * Design tokens have a single source of truth: apps/web/tailwind.config.cjs
 * (theme.extend.colors). packages/app/src/features/theme.ts holds a *runtime*
 * hex mirror (react-native-svg etc. need hex, not className). This script compares
 * the runtime mirror against the tailwind tokens key by key using an explicit mapping.
 *
 * It fails (non-zero) on any of:
 *   - a mapped key whose hex differs from its tailwind token (real drift),
 *   - a mapping that points at a tailwind token that no longer exists,
 *   - a mapping whose theme.ts key was removed (stale mapping),
 *   - a theme.ts key that is neither mapped nor declared runtime-only.
 *
 * Usage: node scripts/check-ds-drift.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const TAILWIND_CONFIG = resolve(ROOT, 'apps/web/tailwind.config.cjs');
const THEME_TS = resolve(ROOT, 'packages/app/src/features/theme.ts');

/** theme.ts key -> tailwind color token (dotted path into theme.extend.colors). */
const MAP = {
  ink: 'ink',
  inkMuted: 'ink-muted',
  white: 'surface',
  brand200: 'brand.200',
  brand500: 'brand.500',
  brand600: 'brand.600',
  star: 'star',
  badgeSale: 'badge-sale',
};

/** theme.ts keys that intentionally have NO tailwind counterpart (runtime-only hues). */
const RUNTIME_ONLY = new Set(['decoPurple', 'heroFrom', 'heroTo']);

function fail(msg) {
  console.error(`\x1b[31m✗ DS drift gate: ${msg}\x1b[0m`);
}

/** Parse the flat `export const colors = { ... } as const` literal from theme.ts. */
function parseThemeColors(text) {
  const block = text.match(/export\s+const\s+colors\s*=\s*\{([\s\S]*?)\}\s*as\s+const/);
  if (!block) {
    throw new Error(`could not locate \`export const colors\` in ${THEME_TS}`);
  }
  const lines = text.split('\n');
  const out = {};
  const re = /^\s*(\w+)\s*:\s*'(#[0-9a-fA-F]{3,8})'\s*,?/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(re);
    if (m) out[m[1]] = { hex: m[2].toLowerCase(), line: i + 1 };
  }
  return out;
}

/** Resolve a dotted path (e.g. "brand.200") into the tailwind colors tree. */
function resolvePath(tree, path) {
  return path.split('.').reduce((node, seg) => (node == null ? undefined : node[seg]), tree);
}

function main() {
  const tw = require(TAILWIND_CONFIG);
  const twColors = tw?.theme?.extend?.colors;
  if (!twColors || typeof twColors !== 'object') {
    fail(`theme.extend.colors missing/invalid in ${TAILWIND_CONFIG}`);
    process.exit(1);
  }

  const themeText = readFileSync(THEME_TS, 'utf8');
  const theme = parseThemeColors(themeText);

  const errors = [];

  // 1) stale mappings: MAP key removed from theme.ts.
  for (const key of Object.keys(MAP)) {
    if (!(key in theme)) {
      errors.push(`stale mapping: MAP["${key}"] set but key absent from theme.ts`);
    }
  }

  // 2) per theme.ts key: mapped-and-matching, runtime-only, or undeclared.
  for (const [key, { hex, line }] of Object.entries(theme)) {
    if (RUNTIME_ONLY.has(key)) continue;
    if (!(key in MAP)) {
      errors.push(
        `undeclared theme.ts key "${key}" (theme.ts:${line}) — add it to MAP ` +
          `(mirrors a tailwind token) or RUNTIME_ONLY (no counterpart) in ` +
          `scripts/check-ds-drift.mjs`,
      );
      continue;
    }
    const twPath = MAP[key];
    const twVal = resolvePath(twColors, twPath);
    if (typeof twVal !== 'string') {
      errors.push(
        `mapping target missing: theme.ts "${key}" -> tailwind "${twPath}" ` +
          `not found in theme.extend.colors`,
      );
      continue;
    }
    if (twVal.toLowerCase() !== hex) {
      errors.push(
        `DRIFT "${key}": theme.ts=${hex} (theme.ts:${line})  !=  ` +
          `tailwind ${twPath}=${twVal.toLowerCase()} (tailwind.config.cjs)`,
      );
    }
  }

  if (errors.length) {
    console.error('');
    for (const e of errors) fail(e);
    console.error(
      `\nFix: align packages/app/src/features/theme.ts to ` +
        `apps/web/tailwind.config.cjs (tailwind is the source of truth), ` +
        `or update the MAP/RUNTIME_ONLY table in scripts/check-ds-drift.mjs.`,
    );
    process.exit(1);
  }

  const checked = Object.keys(theme).filter((k) => k in MAP).length;
  console.log(
    `\x1b[32m✓ DS drift gate: ${checked} runtime token(s) aligned with tailwind, ` +
      `${RUNTIME_ONLY.size} runtime-only.\x1b[0m`,
  );
}

main();
