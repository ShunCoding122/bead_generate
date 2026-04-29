export type BeadColor = { code: string; name?: string; hex: string; r: number; g: number; b: number };
export type LabColor = BeadColor & { L: number; a: number; b2: number };
export type PatternCell = { x: number; y: number; code: string; hex: string };
export type PatternBoard = { row: number; col: number; width: number; height: number; cells: PatternCell[] };
