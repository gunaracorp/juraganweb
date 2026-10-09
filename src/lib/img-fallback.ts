/**
 * Image fallback handler — tampilkan gradient + initial kalau image error.
 * Pakai di img tag: onError={onImgError("Client Name")}
 */
export function onImgError(label: string = "JW") {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = "none";
    const parent = target.parentElement;
    if (parent && !parent.querySelector(".img-fallback")) {
      const fallback = document.createElement("div");
      fallback.className =
        "img-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-gold/30";
      const initials = label
        .split(/[\s-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
      fallback.innerHTML = `<span class="text-3xl font-extrabold text-primary-foreground/90">${initials || "JW"}</span>`;
      parent.appendChild(fallback);
    }
  };
}

/** Pattern fallback image generator — returns a data URL SVG dengan gradient + label. */
export function fallbackImageDataUrl(label: string = "JW", w: number = 600, h: number = 450): string {
  const initials = label
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#2563eb" stop-opacity="0.3"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="${Math.floor(h / 4)}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials || "JW"}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
