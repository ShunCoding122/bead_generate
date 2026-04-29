import * as XLSX from 'xlsx';
import type { BeadColor } from '../types';

const CODE_HEADERS = ['code', '编号', '色号', '颜色编号', 'bead_code', 'color_code'];
const HEX_HEADERS = ['hex', '颜色值', '色值', 'color'];
const NAME_HEADERS = ['name', '颜色名', '颜色名称', 'color_name'];

const normalize = (v: unknown) => String(v ?? '').trim().toLowerCase();
const cleanHex = (raw: unknown) => {
  const text = String(raw ?? '').trim().replace('#', '').toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(text)) return null;
  return `#${text}`;
};

export function parseWorkbook(pathOrBuffer: string | ArrayBuffer): BeadColor[] {
  const wb = typeof pathOrBuffer === 'string' ? XLSX.readFile(pathOrBuffer) : XLSX.read(pathOrBuffer, { type: 'array' });
  const map = new Map<string, BeadColor>();
  const errors: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName], { defval: '' });
    if (!rows.length) continue;
    const headers = Object.keys(rows[0]);
    const findKey = (candidates: string[]) => headers.find((h) => candidates.includes(normalize(h)));
    const codeKey = findKey(CODE_HEADERS);
    const hexKey = findKey(HEX_HEADERS);
    const nameKey = findKey(NAME_HEADERS);
    if (!codeKey || !hexKey) {
      errors.push(`Sheet ${sheetName} missing required columns. headers=${headers.join(',')}`);
      continue;
    }
    for (const row of rows) {
      const code = String(row[codeKey] ?? '').trim();
      const hex = cleanHex(row[hexKey]);
      if (!code || !hex) continue;
      const bigint = parseInt(hex.slice(1), 16);
      map.set(code, { code, name: String(row[nameKey ?? ''] || '').trim() || undefined, hex, r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 });
    }
  }
  if (!map.size) {
    console.error('Palette parse failed', errors);
    throw new Error(`Unable to parse palette workbook. ${errors.join(' | ')}`);
  }
  return [...map.values()];
}
