/**
 * Thin wrapper around picocolors applying NO_COLOR / TTY / FORCE_COLOR detection.
 * Only human-formatter.ts should call these helpers.
 * JSON formatter must never import from this module.
 */
import pc from 'picocolors';

// Evaluate once at module load time so every call is O(1) and consistent.
// NO_COLOR takes priority over everything (https://no-color.org/)
// FORCE_COLOR overrides TTY detection
// Default: only enable colors when stdout is a TTY
const COLORS_ENABLED: boolean =
  process.env.NO_COLOR === undefined &&
  (process.env.FORCE_COLOR !== undefined || process.stdout.isTTY === true);

function wrap(fn: (text: string) => string, text: string): string {
  return COLORS_ENABLED ? fn(text) : text;
}

export function bold(text: string): string {
  return wrap(pc.bold, text);
}

export function dim(text: string): string {
  return wrap(pc.dim, text);
}

export function red(text: string): string {
  return wrap(pc.red, text);
}

export function green(text: string): string {
  return wrap(pc.green, text);
}

export function yellow(text: string): string {
  return wrap(pc.yellow, text);
}
