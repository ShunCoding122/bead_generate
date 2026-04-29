import type { PatternCell } from '../types';

export function PatternCanvas({cells,width,height}:{cells:PatternCell[];width:number;height:number}){
  const size=16; const map=new Map(cells.map((c)=>[`${c.x},${c.y}`,c]));
  return <canvas ref={(el)=>{if(!el)return; el.width=width*size; el.height=height*size; const ctx=el.getContext('2d')!; ctx.fillStyle='#fff'; ctx.fillRect(0,0,el.width,el.height);
    for(let y=0;y<height;y++) for(let x=0;x<width;x++){ const p=map.get(`${x},${y}`); if(!p)continue; ctx.fillStyle=p.hex; ctx.fillRect(x*size,y*size,size,size); ctx.strokeStyle=(x%5===0||y%5===0)?'#555':'#ccc'; ctx.strokeRect(x*size,y*size,size,size); ctx.fillStyle='#111'; ctx.font='10px sans-serif'; ctx.fillText(p.code,x*size+1,y*size+11);} }} style={{maxWidth:'100%',border:'1px solid #999'}}/>;
}
