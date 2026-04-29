import * as XLSX from 'xlsx';
import type { BeadColor } from '../types';

const CODE_HEADERS = ['code', '编号', '色号', '颜色编号', 'bead_code', 'color_code', '色号code'];
const HEX_HEADERS = ['hex', 'hex值', '颜色值', '色值', 'color', 'hexcolor'];
const NAME_HEADERS = ['name', '颜色名', '名称', '颜色名称', 'color_name'];

const normalize = (v: unknown) => String(v ?? '').trim().toLowerCase().replace(/[\s_\-]/g, '');
const cleanHex = (raw: unknown) => {
  const text = String(raw ?? '').trim().replace('#', '').toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(text)) return null;
  return `#${text}`;
};

function resolveHeaderRow(rows: unknown[][]): { headerIndex: number; codeCol: number; hexCol: number; nameCol?: number } | null {
  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const row = rows[i].map(normalize);
    const find = (aliases: string[]) => row.findIndex((h) => aliases.includes(h));
    const codeCol = find(CODE_HEADERS);
    const hexCol = find(HEX_HEADERS);
    if (codeCol >= 0 && hexCol >= 0) {
      const nameCol = find(NAME_HEADERS);
      return { headerIndex: i, codeCol, hexCol, nameCol: nameCol >= 0 ? nameCol : undefined };
    }
  }
  return null;
}

export function parseWorkbook(pathOrBuffer: string | ArrayBuffer): BeadColor[] {
  const wb = typeof pathOrBuffer === 'string' ? XLSX.readFile(pathOrBuffer) : XLSX.read(pathOrBuffer, { type: 'array' });
  const map = new Map<string, BeadColor>();
  const errors: string[] = [];

  for (const sheetName of wb.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, blankrows: false, defval: '' });
    if (!matrix.length) continue;
    const resolved = resolveHeaderRow(matrix);
    if (!resolved) {
      errors.push(`Sheet ${sheetName} missing required columns. sample_headers=${(matrix[0] || []).join(',')}`);
      continue;
    }

    for (let i = resolved.headerIndex + 1; i < matrix.length; i++) {
      const row = matrix[i] || [];
      const code = String(row[resolved.codeCol] ?? '').trim();
      const hex = cleanHex(row[resolved.hexCol]);
      if (!code || !hex) continue;
      const bigint = parseInt(hex.slice(1), 16);
      const nameRaw = resolved.nameCol === undefined ? '' : String(row[resolved.nameCol] ?? '').trim();
      map.set(code, {
        code,
        name: nameRaw || undefined,
        hex,
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      });
    }
  }

  if (!map.size) {
    console.error('Palette parse failed', { errors, sheets: wb.SheetNames });
    throw new Error(`Unable to parse palette workbook. ${errors.join(' | ')}`);
  }

  return [...map.values()];
}
