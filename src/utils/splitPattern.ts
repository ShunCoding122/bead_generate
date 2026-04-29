import type { PatternBoard, PatternCell } from '../types';
export function splitPattern(cells:PatternCell[], width:number,height:number,boardSize:number):PatternBoard[]{
  const cols=Math.ceil(width/boardSize), rows=Math.ceil(height/boardSize); const boards:PatternBoard[]=[];
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const minX=c*boardSize,minY=r*boardSize; const subset=cells.filter((p)=>p.x>=minX&&p.x<minX+boardSize&&p.y>=minY&&p.y<minY+boardSize).map((p)=>({...p,x:p.x-minX,y:p.y-minY}));
    boards.push({row:r,col:c,width:Math.min(boardSize,width-minX),height:Math.min(boardSize,height-minY),cells:subset});}
  return boards;
}
