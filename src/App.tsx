import { useMemo, useState } from 'react';
import { loadPalette } from './utils/paletteLoader';
import { generatePattern } from './utils/patternGenerator';
import { splitPattern } from './utils/splitPattern';
import { PatternCanvas } from './components/PatternCanvas';
import type { PatternCell, BeadColor } from './types';

export default function App(){
  const [img,setImg]=useState<HTMLImageElement>(); const [cells,setCells]=useState<PatternCell[]>([]); const [palette,setPalette]=useState<BeadColor[]>([]); const [err,setErr]=useState('');
  const [board,setBoard]=useState(52); const [grid,setGrid]=useState({x:1,y:1}); const [dither,setDither]=useState(true);
  const width=board*grid.x,height=board*grid.y;
  const boards=useMemo(()=>splitPattern(cells,width,height,52),[cells,width,height]);
  return <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:16,padding:16}}>
    <aside><h2>图片转拼豆图纸</h2><input type='file' accept='image/*' onChange={(e)=>{const f=e.target.files?.[0]; if(!f)return; const i=new Image(); i.onload=()=>setImg(i); i.src=URL.createObjectURL(f);}}/>
    <div><label>板尺寸</label><select value={board} onChange={(e)=>setBoard(Number(e.target.value))}><option>52</option><option>78</option><option>104</option></select></div>
    <div><label>拼接</label><input value={grid.x} onChange={(e)=>setGrid({...grid,x:Number(e.target.value)})}/>x<input value={grid.y} onChange={(e)=>setGrid({...grid,y:Number(e.target.value)})}/></div>
    <label><input type='checkbox' checked={dither} onChange={(e)=>setDither(e.target.checked)}/>Floyd–Steinberg 抖动</label>
    <button onClick={async()=>{try{const p=await loadPalette(); setPalette(p); if(!img)return; setCells(await generatePattern(img,width,height,p,dither)); setErr('');}catch(e){console.error(e);setErr(String(e));}}}>生成图纸</button>
    {err && <p style={{color:'red'}}>{err}</p>}
    <p>颜色数:{new Set(cells.map((c)=>c.code)).size} 总豆数:{cells.length}</p>
    <ul>{Object.entries(cells.reduce((a,c)=>(a[c.code]=(a[c.code]||0)+1,a),{} as Record<string,number>)).map(([k,v])=><li key={k}>{k}:{v}</li>)}</ul></aside>
    <main><PatternCanvas cells={cells} width={width} height={height}/><h3>分板({boards.length})</h3><div>{boards.map((b)=><span key={`${b.row}-${b.col}`}>Board({b.row+1},{b.col+1}) </span>)}</div></main>
  </div>;
}
