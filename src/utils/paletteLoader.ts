import cache from '../data/beadPalette.json';
import { parseWorkbook } from './excelParser';
import type { BeadColor } from '../types';

export async function loadPalette(): Promise<BeadColor[]> {
  if ((cache as BeadColor[]).length) return cache as BeadColor[];
  const res = await fetch('/mard_bead_palette_221.xlsx');
  const buf = await res.arrayBuffer();
  return parseWorkbook(buf);
}
