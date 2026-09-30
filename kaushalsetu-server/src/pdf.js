// Minimal VALID PDF 1.4 writer (no dependency): Helvetica text, tables with
// word-wrap, header/footer, page numbers. Output opens in any PDF reader.
const PAGE_W = 595; // A4
const PAGE_H = 842;
const MARGIN = 48;

function esc(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

// items: [{ text, size, bold, gap }] and tables: { head: [], rows: [[]], widths: [] }
export function buildPdf({ title, subtitle, meta = [], sections = [] }) {
  const pages = [];
  let ops = [];
  let y = PAGE_H - MARGIN;

  const ensure = (need) => {
    if (y - need < MARGIN + 24) {
      pages.push(ops.join('\n'));
      ops = [];
      y = PAGE_H - MARGIN;
    }
  };

  const text = (t, { size = 11, bold = false, color = '0 0 0', x = MARGIN } = {}) => {
    for (const ln of wrap(t, Math.floor((PAGE_W - MARGIN - x) / (size * 0.52)))) {
      ensure(size + 4);
      ops.push(`BT /F${bold ? 'B' : 'R'} ${size} Tf ${color} rg ${x} ${y} Td (${esc(ln)}) Tj ET`);
      y -= size + 4;
    }
  };

  const gap = (n = 10) => { y -= n; };

  // Title block
  text('KAUSHALSETU', { size: 10, bold: true, color: '0.15 0.35 0.92' });
  text(title, { size: 20, bold: true });
  if (subtitle) text(subtitle, { size: 11 });
  gap(4);
  for (const [k, v] of meta) text(`${k}: ${v}`, { size: 9, color: '0.3 0.3 0.3' });
  gap(8);

  for (const sec of sections) {
    ensure(40);
    if (sec.heading) {
      text(sec.heading, { size: 13, bold: true, color: '0.06 0.35 0.5' });
      gap(2);
    }
    if (sec.paragraph) text(sec.paragraph, { size: 10 });
    if (sec.bullets) for (const b of sec.bullets) text(`-  ${b}`, { size: 10, x: MARGIN + 10 });
    if (sec.table) {
      const { head, rows, widths } = sec.table;
      const avail = PAGE_W - MARGIN * 2;
      const total = widths.reduce((a, b) => a + b, 0);
      const colW = widths.map((w) => (w / total) * avail);
      const drawRow = (cells, bold, fill) => {
        const wrapped = cells.map((c, i) => wrap(c, Math.max(4, Math.floor(colW[i] / 5))));
        const h = Math.max(...wrapped.map((w) => w.length)) * 12 + 8;
        ensure(h);
        if (fill) {
          ops.push(`${fill} rg ${MARGIN} ${y - h + 4} ${avail} ${h} re f`);
        }
        // grid
        let x = MARGIN;
        ops.push(`0.8 0.8 0.8 RG 0.5 w`);
        ops.push(`${MARGIN} ${y - h + 4} ${avail} ${h} re S`);
        for (let i = 1; i < colW.length; i++) {
          x += colW[i - 1];
          ops.push(`${x} ${y - h + 4} m ${x} ${y} l S`);
        }
        wrapped.forEach((lines, i) => {
          const cx = MARGIN + colW.slice(0, i).reduce((a, b) => a + b, 0) + 4;
          lines.forEach((ln, li) => {
            const ly = y - 10 - li * 12;
            ops.push(`BT /F${bold ? 'B' : 'R'} 9 Tf 0 0 0 rg ${cx.toFixed(1)} ${ly.toFixed(1)} Td (${esc(ln.slice(0, 90))}) Tj ET`);
          });
        });
        y -= h;
      };
      if (head) drawRow(head, true, '0.94 0.96 1');
      for (const r of rows) drawRow(r.map(String), false, null);
      gap(6);
    }
    gap(6);
  }
  pages.push(ops.join('\n'));

  // Assemble PDF with real xref
  const objects = [];
  const fontR = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;
  const fontB = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`;
  objects.push(fontR); // 1
  objects.push(fontB); // 2
  const pageIds = [];
  pages.forEach((content, i) => {
    const contentId = 3 + i * 2;
    const pageId = 4 + i * 2;
    pageIds.push(pageId);
    const footer = `BT /FR 8 Tf 0.45 0.45 0.45 rg ${MARGIN} 30 Td (KaushalSetu  |  Page ${i + 1} of ${pages.length}) Tj ET`;
    objects[contentId - 1] = `<< /Length ${Buffer.byteLength(content + '\n' + footer)} >>\nstream\n${content}\n${footer}\nendstream`;
    objects[pageId - 1] = `<< /Type /Page /Parent 999 /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${contentId} 0 R /Resources << /Font << /FR 1 0 R /FB 2 0 R >> >> >>`;
  });
  const pagesId = objects.length + 1;
  objects.push(`<< /Type /Pages /Kids [${pageIds.map((p) => `${p} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  const catalogId = objects.length + 1;
  objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  // fix Parent ref
  for (let i = 0; i < pages.length; i++) {
    const idx = (4 + i * 2) - 1;
    objects[idx] = objects[idx].replace('/Parent 999', `/Parent ${pagesId} 0 R`);
  }

  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets = [0];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out, 'latin1'));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefAt = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}
