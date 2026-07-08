// Pure monogram derivations (initials and a deterministic hue), split out of
// monogram.tsx so the name → initials/hue mapping can be unit-tested without
// rendering.

/**
 * Uppercased initials for a monogram: the first two letters of a single-word
 * name, or the first letters of the first and last words otherwise. Surrounding
 * and repeated whitespace is collapsed first.
 */
export function monogramInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic hue offset in the range −30..+30 (applied around the citron
 * base hue of 115) hashed from a name, so the same name always renders the same
 * tint.
 */
export function monogramHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h % 60) - 30;
}
