import jsPDF from 'jspdf';
import type { PatternBoard } from '../types';

export function exportBoardsPdf(boards:PatternBoard[], snapshots:string[]) {
  const pdf=new jsPDF({unit:'pt',format:'a4'});
  boards.forEach((b,i)=>{ if(i) pdf.addPage(); pdf.text(`Board(${b.row+1},${b.col+1})`,40,40); pdf.addImage(snapshots[i],'PNG',40,60,520,520); });
  pdf.save('bead-pattern.pdf');
}
