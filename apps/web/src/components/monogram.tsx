import * as React from "react";
import { cn } from "@/lib/utils";
import { monogramHue, monogramInitials } from "@/lib/monogram-lib";

/** Deterministic citron-tinted gradient monogram avatar. */
export function Monogram({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = React.useMemo(() => monogramInitials(name), [name]);

  // Deterministic hue offset (−30..+30 around citron 115) from the name
  const hue = React.useMemo(() => monogramHue(name), [name]);

  const bg = `linear-gradient(135deg, oklch(0.94 0.18 ${115 + hue}) 0%, oklch(0.88 0.12 ${115 + hue + 20}) 100%)`;
  const fontPx = Math.round(size * 0.38);

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-display font-semibold text-[color:var(--accent-ink)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: fontPx,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}
