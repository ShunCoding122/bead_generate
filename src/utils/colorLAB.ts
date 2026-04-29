import type { BeadColor, LabColor } from '../types';

const pivotRgb = (v: number) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92);
const pivotXyz = (v: number) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);

export function rgbToLab(r: number, g: number, b: number) {
  const R = pivotRgb(r / 255); const G = pivotRgb(g / 255); const B = pivotRgb(b / 255);
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const fx = pivotXyz(x), fy = pivotXyz(y), fz = pivotXyz(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b2: 200 * (fy - fz) };
}
export const deltaE76 = (p1: {L:number;a:number;b2:number}, p2:{L:number;a:number;b2:number}) => Math.sqrt((p1.L-p2.L)**2 + (p1.a-p2.a)**2 + (p1.b2-p2.b2)**2);
export const buildLabPalette = (p: BeadColor[]): LabColor[] => p.map((c)=> ({...c, ...rgbToLab(c.r,c.g,c.b)}));
export function getClosestBeadColor(rgb:{r:number;g:number;b:number}, palette: LabColor[]) {
  const lab = rgbToLab(rgb.r,rgb.g,rgb.b); let best=palette[0]; let min=Infinity;
  for (const p of palette){const d=deltaE76(lab,p); if(d<min){min=d;best=p;}}
  return best;
}
