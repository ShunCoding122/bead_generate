const clamp = (n:number)=> Math.max(0, Math.min(255, n));
export function floydSteinbergQuantize(rgb:number[][][], mapper:(c:{r:number;g:number;b:number})=>{r:number;g:number;b:number}) {
  const h=rgb.length,w=rgb[0].length; const out=rgb.map((row)=>row.map((p)=>[...p]));
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const old=out[y][x]; const q=mapper({r:old[0],g:old[1],b:old[2]}); out[y][x]=[q.r,q.g,q.b];
    const er=[old[0]-q.r, old[1]-q.g, old[2]-q.b];
    const spread=[[1,0,7/16],[-1,1,3/16],[0,1,5/16],[1,1,1/16]];
    for(const [dx,dy,f] of spread){ const nx=x+dx, ny=y+dy; if(nx>=0&&nx<w&&ny>=0&&ny<h){for(let i=0;i<3;i++) out[ny][nx][i]=clamp(out[ny][nx][i]+er[i]*f);}}
  }
  return out;
}
