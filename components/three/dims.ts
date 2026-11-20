/**
 * Glass dimensions (scene units ≈ decimetres). Everything that sits inside or
 * on the glass derives from these, so the glass can be reshaped in one place.
 */
export const GLASS = {
  height: 2.6,
  rOutBottom: 0.74,
  rOutTop: 0.84,
  wall: 0.045,
  base: 0.34, // inner floor height (thick, heavy base = premium feel)
};

/** inner radius at height y (the inner wall is a straight taper) */
export function innerRadius(y: number) {
  const { height, rOutBottom, rOutTop, wall, base } = GLASS;
  const t = Math.min(1, Math.max(0, (y - base) / (height - base)));
  const rb = rOutBottom - wall * 1.25;
  const rt = rOutTop - wall;
  return rb + (rt - rb) * t;
}

/** outer radius at height y */
export function outerRadius(y: number) {
  const { height, rOutBottom, rOutTop } = GLASS;
  const t = Math.min(1, Math.max(0, y / height));
  return rOutBottom + (rOutTop - rOutBottom) * t;
}

export const LIQUID = {
  floor: GLASS.base + 0.004,
  /** level after the liquor pour */
  liquorTop: GLASS.base + 0.62,
  /** final level after the mixer */
  fullTop: GLASS.height - 0.36,
};

export const COLORS = {
  liquor: "#9d0f43",    // deep raspberry liqueur
  mixed: "#ff86ab",     // luminous rosé after tonic
  glowNeutral: "#ffe2ea",
  glowRose: "#ff4f93",
  rind: "#ff7a45",
  flesh: "#ff4f6d",
};
