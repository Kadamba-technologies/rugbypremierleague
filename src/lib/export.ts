import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table as DocxTable, 
  TableRow, 
  TableCell, 
  WidthType, 
  ImageRun, 
  AlignmentType,
  BorderStyle
} from 'docx';
import { MatchPack, Player } from '../types';

/**
 * Export Options
 */
export interface ExportOptions {
  format: 'pdf' | 'word' | 'excel';
  pages: string[]; // List of tab IDs to export
}

/**
 * Capture a DOM element as an image (PNG base64)
 */
async function captureElement(selector: string): Promise<string | null> {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return null;
  
  try {
    return await toPng(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#0e1218' 
    });
  } catch (e) {
    console.error('Failed to capture element', selector, e);
    return null;
  }
}

/**
 * EXCEL EXPORT - COMPREHENSIVE
 */
export async function exportToExcel(pack: MatchPack, allPlayers: Player[]) {
  const wb = XLSX.utils.book_new();

  // 1. Facts & Insights
  const factsData = pack.facts.map(f => ({ Metric: f.value, Insight: f.text }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(factsData), 'Insights');

  // 2. Standings
  const standingsData = pack.standings.map(s => ({
    Rank: s.rank,
    Team: s.teamName,
    Played: s.played,
    Wins: s.wins,
    Draws: s.draws,
    Losses: s.losses,
    SD: s.scoreDiff,
    LP: s.leaguePoints,
    PTS: s.pointsScored,
    Tries: s.tries,
    Conversions: s.conversions
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(standingsData), 'Standings');

  // 3. Detailed Player Stats
  const playerStats = allPlayers.map(p => ({
    Name: p.name,
    NAT: p.nat,
    Team: p.team,
    Points: p.pts,
    Tries: p.tries,
    Conversions: p.conv,
    'Line Breaks': p.linebreaks,
    'Defenders Beaten': p.defbeaten,
    Turnovers: p.turnovers,
    Tackles: p.tackles,
    Offloads: p.offloads,
    Assists: p.assists,
    'Yellow Cards': p.yc || 0,
    'Red Cards': p.rc || 0
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playerStats), 'Player Database');

  // 4. Discipline
  const discData = pack.discipline.yellowCards.map(t => ({
    Team: t.team,
    'Yellow Cards': t.count,
    'Red Cards': 0, // Not available in current schema
    'Total Cards': t.count
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(discData), 'Team Discipline');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `RPL_Analytics_${pack.id}.xlsx`);
}

/**
 * WORD EXPORT - TEXT BASED & STRUCTURED
 */
export async function exportToWord(pack: MatchPack, allPlayers: Player[]) {
  const children: any[] = [
    new Paragraph({
      text: "RUGBY PREMIER LEAGUE ANALYTICS REPORT",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: pack.competition,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
  ];

  // 1. KEY INSIGHTS
  children.push(new Paragraph({ text: "1. KADAMBA FACTS & KEY INSIGHTS", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
  pack.facts.forEach(f => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: `${f.value}: `, bold: true, color: "A12806" }),
        new TextRun({ text: f.text }),
      ],
      spacing: { after: 120 },
    }));
  });

  // 2. LEAGUE TABLE
  children.push(new Paragraph({ text: "2. OFFICIAL LEAGUE STANDINGS", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
  const standingRows = [
    new TableRow({
      children: ["POS", "TEAM", "P", "W", "D", "L", "SD", "PTS"].map(h => new TableCell({
        children: [new Paragraph({ text: h, alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, color: "FFFFFF" })] })],
        shading: { fill: "0e1218" },
      }))
    }),
    ...pack.standings.map(s => new TableRow({
      children: [s.rank.toString(), s.teamName, s.played.toString(), s.wins.toString(), s.draws.toString(), s.losses.toString(), s.scoreDiff.toString(), s.leaguePoints.toString()].map(t => new TableCell({
        children: [new Paragraph({ text: t, alignment: AlignmentType.CENTER })],
      }))
    }))
  ];
  children.push(new DocxTable({ rows: standingRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  // 3. LEADERBOARDS (TOP 10s)
  children.push(new Paragraph({ text: "3. STATISTICAL LEADERBOARDS", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }));
  
  const addLeaderTable = (title: string, data: any[], key: string) => {
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }));
    
    // Safety check for title splitting
    let headerLabel = title;
    if (title.includes('—')) {
      const parts = title.split('—');
      if (parts.length > 1 && parts[1]) {
        headerLabel = parts[1].trim();
      }
    } else {
      // Fallback: take the first word or the whole thing
      headerLabel = title.split(' ')[0] || title;
    }

    const rows = [
      new TableRow({
        children: ["PLAYER", "TEAM", headerLabel.toUpperCase()].map(h => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
          shading: { fill: "f3f4f6" }
        }))
      }),
      ...data.slice(0, 10).map(p => new TableRow({
        children: [p.name || "N/A", p.team || "N/A", ((p as any)[key] ?? 0).toString()].map(t => new TableCell({ children: [new Paragraph({ text: t })] }))
      }))
    ];
    children.push(new DocxTable({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  };

  addLeaderTable("POINTS SCORED", pack.leaderboards.points, "pts");
  addLeaderTable("TRIES SCORED", pack.leaderboards.tries, "tries");
  addLeaderTable("CONVERSIONS", pack.leaderboards.conversions, "conv");

  // 4. DISCIPLINE
  children.push(new Paragraph({ text: "4. DISCIPLINE & CARDS", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
  const discRows = [
    new TableRow({
      children: ["TEAM", "YELLOW CARDS", "RED CARDS"].map(h => new TableCell({ 
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] 
      }))
    }),
    ...pack.discipline.yellowCards.map(t => new TableRow({
      children: [t.team, t.count.toString(), "0"].map(txt => new TableCell({ children: [new Paragraph({ text: txt })] }))
    }))
  ];
  children.push(new DocxTable({ rows: discRows, width: { size: 100, type: WidthType.PERCENTAGE } }));

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `RPL_Analytics_${pack.id}.docx`);
}

/**
 * COMPREHENSIVE PDF EXPORT (Captured Pages)
 */
export async function exportToPDF(pack: MatchPack, capturedPages: Record<string, string>) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const primary: [number, number, number] = [161, 40, 6];
  const darkNavy: [number, number, number] = [14, 18, 24];

  // Cover Page
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, width, height, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('RUGBY PREMIER LEAGUE', width / 2, 70, { align: 'center' });
  doc.setFontSize(16);
  doc.text(pack.competition.toUpperCase(), width / 2, 85, { align: 'center' });
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("ANALYTICS BROADCAST PACK", width / 2, 98, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, width / 2, height - 20, { align: 'center' });

  // Add Captured Pages
  let pageIndex = 2;
  for (const [id, imgData] of Object.entries(capturedPages)) {
    doc.addPage();
    
    // Header
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, width, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`RPL ANALYTICS | ${id.toUpperCase().replace('_', ' ')}`, 15, 12);
    doc.text(`PAGE ${pageIndex}`, width - 15, 12, { align: 'right' });
    
    // Add the screenshot
    // Maintain aspect ratio
    const imgWidth = width - 20;
    const imgHeight = (imgWidth * 9) / 16; // Assumption
    doc.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);
    
    // If it's a table-heavy page like standings, maybe add the raw table too?
    if (id === 'table') {
       const tableData = pack.standings.map(s => [s.rank, s.teamName, s.played, `${s.wins}-${s.draws}-${s.losses}`, s.scoreDiff, s.leaguePoints, s.pointsScored]);
       autoTable(doc, {
         startY: imgHeight + 35,
         head: [['POS', 'TEAM', 'MP', 'W-D-L', 'SD', 'PT', 'PTS']],
         body: tableData,
         theme: 'striped',
         headStyles: { fillColor: primary }
       });
    }

    pageIndex++;
  }

  doc.save(`RPL_Analytics_${pack.id}.pdf`);
}

/**
 * LEGACY EXPORT (Keeping for compatibility or fallback)
 */
export async function generateMatchPackPDF(pack: MatchPack, matchups: { p1: Player; p2: Player }[]) {
  // Transfering basic logic to the new comprehensive export or keeping as is if user specifically wants the old "PDF only" button
  console.log('Legacy PDF export called');
  // For now, just call the new one if we have captures, but this needs a UI bridge.
}
