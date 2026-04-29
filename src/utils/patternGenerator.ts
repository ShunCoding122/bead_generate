import type { BeadColor, PatternCell } from '../types';
import { buildLabPalette, getClosestBeadColor } from './colorLAB';
import { floydSteinbergQuantize } from './dithering';

export async function generatePattern(image: HTMLImageElement, width:number, height:number, palette:BeadColor[], useDither:boolean): Promise<PatternCell[]> {
  const c=document.createElement('canvas'); c.width=width; c.height=height; const ctx=c.getContext('2d')!; ctx.drawImage(image,0,0,width,height);
  const data=ctx.getImageData(0,0,width,height); const lab=buildLabPalette(palette);
  const px:number[][][]=[]; for(let y=0;y<height;y++){ const row=[] as number[][]; for(let x=0;x<width;x++){const i=(y*width+x)*4; row.push([data.data[i],data.data[i+1],data.data[i+2]]);} px.push(row);}
  const processed = useDither ? floydSteinbergQuantize(px,(p)=>getClosestBeadColor(p,lab)) : px;
  const cells:PatternCell[]=[];
  for(let y=0;y<height;y++) for(let x=0;x<width;x++){ const p=processed[y][x]; const color=getClosestBeadColor({r:p[0],g:p[1],b:p[2]},lab); cells.push({x,y,code:color.code,hex:color.hex}); }
  return cells;
}
