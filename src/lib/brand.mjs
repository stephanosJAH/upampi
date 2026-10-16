// Geometric UPAMPI letterforms, drawn as centre-line strokes on a 14-unit
// cap height (stroke width 3). Shared by the SVG logo, the footer line
// wordmark (canvas), the 3D voxel mark and the OG image generator.

export const STROKE = 3;
export const CAP = 14;

/** @type {{ char: string, x: number, w: number, d: string }[]} */
export const GLYPHS = [
  { char: 'U', x: 0, w: 10, d: 'M1.5 0 V9 A3.5 3.5 0 0 0 8.5 9 V0' },
  { char: 'P', x: 12.6, w: 10, d: 'M1.5 14 V1.5 H5.25 A3.25 3.25 0 0 1 5.25 8 H1.5' },
  { char: 'A', x: 25.2, w: 10, d: 'M1.5 14 V5 A3.5 3.5 0 0 1 8.5 5 V14 M1.5 9.4 H8.5' },
  { char: 'M', x: 37.8, w: 12, d: 'M1.5 14 V1.2 L6 8.2 L10.5 1.2 V14' },
  { char: 'P', x: 52.4, w: 10, d: 'M1.5 14 V1.5 H5.25 A3.25 3.25 0 0 1 5.25 8 H1.5' },
  { char: 'I', x: 65, w: 3, d: 'M1.5 0 V14' },
];
export const WORDMARK_WIDTH = 68;

/** Translate each glyph path into wordmark space. */
export const wordmarkPaths = () =>
  GLYPHS.map((g) => ({ ...g, transform: `translate(${g.x} 0)` }));

// The mark: a "U" whose right stem keeps rising (UP) and a single bit of
// data dropping in above the left stem. viewBox below frames it optically.
export const MARK = {
  viewBox: '1.8 0.6 16.4 21.1',
  stroke: 3.4,
  path: 'M5.5 8 V14.5 A4.5 4.5 0 0 0 14.5 14.5 V2',
  bit: { x: 3.8, y: 1.6, size: 3.4 },
};
