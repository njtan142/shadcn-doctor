/**
 * Thin wrapper around picocolors applying NO_COLOR / TTY / FORCE_COLOR detection.
 * Only human-formatter.ts should call these helpers.
 * JSON formatter must never import from this module.
 */
import pc from 'picocolors';

function colorsEnabled(): boolean {
  // NO_COLOR takes priority over everything (https://no-color.org/)
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }
  // FORCE_COLOR overrides TTY detection
  if (process.env.FORCE_COLOR !== undefined) {
    return true;
  }
  // Default: only enable colors when stdout is a TTY
  return process.stdout.isTTY === true;
}

function wrap(fn: (text: string) => string, text: string): string {
  return colorsEnabled() ? fn(text) : text;
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
