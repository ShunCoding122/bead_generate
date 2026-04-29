import fs from 'node:fs';
import path from 'node:path';
import { parseWorkbook } from '../src/utils/excelParser';

const input = path.resolve('public/mard_bead_palette_221.xlsx');
const output = path.resolve('src/data/beadPalette.json');
const colors = parseWorkbook(input);
fs.writeFileSync(output, JSON.stringify(colors, null, 2), 'utf-8');
console.log(`Generated ${colors.length} colors -> ${output}`);
