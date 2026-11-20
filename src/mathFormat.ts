export interface OstChoice {
  html: string;
  isCorrect: boolean;
  reason: string;
}

export interface XMethodDiamondData {
  a: number;
  b: number;
  c: number;
  ac: number;
  m1: number;
  m2: number;
  simp1Num: number;
  simp1Den: number;
  simp2Num: number;
  simp2Den: number;
}

export interface OstProblem {
  id: string;
  topicId: string;
  taskType: string;
  promptHtml: string;
  visualTitle?: string;
  visualHtml?: string;
  xMethodData?: XMethodDiamondData;
  choices: OstChoice[];
  steps: string[];
  isLongChoice?: boolean;
}

export interface OstTopicMeta {
  id: string;
  title: string;
  shortTitle: string;
  sheetHeader: string;
  badgeColor: string;
  description: string;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function frac(num: string | number, den: string | number): string {
  return `<span class="v-frac"><span class="v-frac-num">${num}</span><span class="v-frac-den">${den}</span></span>`;
}

export function signedFrac(num: number, den: number): string {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  const sign = n < 0 ? '−' : '';
  return `<span class="math-atom">${sign}${frac(Math.abs(n), d)}</span>`;
}

export function pow(base: string | number, exp: string | number): string {
  return `<span class="math-atom">${base}<sup class="math-exp">${exp}</sup></span>`;
}

export function powFrac(base: string | number, num: string | number, den: string | number): string {
  return `<span class="math-atom">${base}<sup class="math-exp math-exp-frac">${frac(num, den)}</sup></span>`;
}

export function atom(html: string): string {
  return `<span class="math-atom">${html}</span>`;
}

export function polyHtml(a: number, b: number, c: number, v = 'x'): string {
  const parts: string[] = [];
  if (a !== 0) {
    if (a === 1) parts.push(pow(v, 2));
    else if (a === -1) parts.push(`−${pow(v, 2)}`);
    else parts.push(`${a}${pow(v, 2)}`);
  }
  if (b !== 0) {
    const absB = Math.abs(b);
    const term = absB === 1 ? v : `${absB}${v}`;
    if (parts.length === 0) {
      parts.push(b < 0 ? `−${term}` : term);
    } else {
      parts.push(b < 0 ? `− ${term}` : `+ ${term}`);
    }
  }
  if (c !== 0 || parts.length === 0) {
    const absC = Math.abs(c);
    if (parts.length === 0) {
      parts.push(c < 0 ? `−${absC}` : `${absC}`);
    } else {
      parts.push(c < 0 ? `− ${absC}` : `+ ${absC}`);
    }
  }
  return atom(parts.join(' '));
}

export function cubicPolyHtml(c3: number, c2: number, c1: number, c0: number, v = 'x'): string {
  const terms: Array<[number, string]> = [
    [c3, pow(v, 3)],
    [c2, pow(v, 2)],
    [c1, v],
    [c0, '']
  ];
  const parts: string[] = [];
  for (const [coef, varStr] of terms) {
    if (coef === 0) continue;
    const absC = Math.abs(coef);
    const label = varStr === '' ? `${absC}` : (absC === 1 ? varStr : `${absC}${varStr}`);
    if (parts.length === 0) parts.push(coef < 0 ? `−${label}` : label);
    else parts.push(coef < 0 ? `− ${label}` : `+ ${label}`);
  }
  return atom(parts.length ? parts.join(' ') : '0');
}

export function linearExpr(mNum: number, mDen: number, bNum: number, bDen = 1, v = 'x'): string {
  const gM = gcd(mNum, mDen);
  const mn = (mDen < 0 ? -mNum : mNum) / gM;
  const md = Math.abs(mDen) / gM;

  const gB = gcd(bNum, bDen);
  const bn = (bDen < 0 ? -bNum : bNum) / gB;
  const bd = Math.abs(bDen) / gB;

  const parts: string[] = [];
  if (mn !== 0) {
    if (md === 1) {
      if (mn === 1) parts.push(v);
      else if (mn === -1) parts.push(`−${v}`);
      else parts.push(`${mn}${v}`);
    } else {
      const sign = mn < 0 ? '−' : '';
      parts.push(`${sign}${frac(Math.abs(mn), md)}${v}`);
    }
  }
  if (bn !== 0 || parts.length === 0) {
    const valStr = bd === 1 ? `${Math.abs(bn)}` : frac(Math.abs(bn), bd);
    if (parts.length === 0) {
      parts.push(bn < 0 ? `−${valStr}` : `${valStr}`);
    } else {
      parts.push(bn < 0 ? `− ${valStr}` : `+ ${valStr}`);
    }
  }
  return atom(parts.join(' '));
}

export function formatLinearFactor(coefX: number, constant: number): string {
  const xPart = coefX === 1 ? 'x' : `${coefX}x`;
  if (constant === 0) return `(${xPart})`;
  return `(${xPart} ${constant >= 0 ? '+' : '−'} ${Math.abs(constant)})`;
}

export function htmlTable(headers: string[], rows: Array<Array<string | number>>): string {
  const ths = headers
    .map(h => `<th class="px-2.5 py-1.5 text-center font-display font-bold text-[11px] text-amber-300 border border-emerald-500/30 bg-emerald-950/70">${h}</th>`)
    .join('');
  const trs = rows
    .map(
      row =>
        `<tr>${row
          .map(
            (cell, i) =>
              `<td class="px-2.5 py-1.5 text-center font-mono-code text-xs ${
                i === 0 ? 'text-emerald-200 font-bold bg-emerald-950/30' : 'text-white'
              } border border-emerald-500/25">${cell}</td>`
          )
          .join('')}</tr>`
    )
    .join('');
  return `<div class="w-full overflow-x-auto"><table class="w-full border-collapse rounded-lg overflow-hidden">${ths ? `<thead><tr>${ths}</tr></thead>` : ''}<tbody>${trs}</tbody></table></div>`;
}

export interface BoxPlotSeries {
  label?: string;
  min: number;
  q1: number;
  med: number;
  q3: number;
  max: number;
  color?: string;
}

export function svgBoxPlot(
  seriesList: BoxPlotSeries[],
  axisMin: number,
  axisMax: number,
  tickStep: number,
  axisLabel = ''
): string {
  const W = 320;
  const rowH = 38;
  const topPad = 14;
  const H = topPad + seriesList.length * rowH + 34;
  const left = 22;
  const right = 300;
  const mapX = (v: number) => left + ((v - axisMin) / (axisMax - axisMin)) * (right - left);

  let rowsSvg = '';
  seriesList.forEach((s, idx) => {
    const cy = topPad + idx * rowH + 18;
    const col = s.color || (idx === 0 ? '#34d399' : '#38bdf8');
    const xMin = mapX(s.min);
    const xQ1 = mapX(s.q1);
    const xMed = mapX(s.med);
    const xQ3 = mapX(s.q3);
    const xMax = mapX(s.max);
    rowsSvg += `
      ${s.label ? `<text x="${left}" y="${cy - 12}" fill="#e2e8f0" font-size="10" font-family="Inter" font-weight="700">${s.label}</text>` : ''}
      <line x1="${xMin}" y1="${cy}" x2="${xQ1}" y2="${cy}" stroke="${col}" stroke-width="2.2" />
      <line x1="${xQ3}" y1="${cy}" x2="${xMax}" y2="${cy}" stroke="${col}" stroke-width="2.2" />
      <line x1="${xMin}" y1="${cy - 6}" x2="${xMin}" y2="${cy + 6}" stroke="${col}" stroke-width="2.2" />
      <line x1="${xMax}" y1="${cy - 6}" x2="${xMax}" y2="${cy + 6}" stroke="${col}" stroke-width="2.2" />
      <rect x="${xQ1}" y="${cy - 9}" width="${Math.max(2, xQ3 - xQ1)}" height="18" fill="${col}" fill-opacity="0.22" stroke="${col}" stroke-width="2" rx="2" />
      <line x1="${xMed}" y1="${cy - 9}" x2="${xMed}" y2="${cy + 9}" stroke="#fbbf24" stroke-width="2.6" />
    `;
  });

  const axisY = topPad + seriesList.length * rowH + 8;
  let ticksSvg = `<line x1="${left - 6}" y1="${axisY}" x2="${right + 6}" y2="${axisY}" stroke="#94a3b8" stroke-width="1.5" />`;
  for (let v = axisMin; v <= axisMax + 0.0001; v += tickStep) {
    const tx = mapX(v);
    const labelVal = Number.isInteger(v) ? v : Math.round(v * 10) / 10;
    ticksSvg += `
      <line x1="${tx}" y1="${axisY - 4}" x2="${tx}" y2="${axisY + 4}" stroke="#94a3b8" stroke-width="1.3" />
      <text x="${tx}" y="${axisY + 15}" text-anchor="middle" fill="#cbd5e1" font-size="9.5" font-family="JetBrains Mono">${labelVal}</text>
    `;
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="w-full max-w-[320px] h-auto mx-auto">
    ${rowsSvg}
    ${ticksSvg}
    ${axisLabel ? `<text x="${W / 2}" y="${H - 2}" text-anchor="middle" fill="#34d399" font-size="9.5" font-family="Inter" font-weight="700">${axisLabel}</text>` : ''}
  </svg>`;
}

export function svgDotPlot(
  counts: Record<number, number>,
  axisMin: number,
  axisMax: number,
  title = ''
): string {
  const W = 310;
  const maxStack = Math.max(1, ...Object.values(counts));
  const H = 36 + maxStack * 12 + 26;
  const left = 22;
  const right = 288;
  const axisY = H - 22;
  const mapX = (v: number) => left + ((v - axisMin) / (axisMax - axisMin)) * (right - left);

  let dots = '';
  let ticks = `<line x1="${left - 8}" y1="${axisY}" x2="${right + 8}" y2="${axisY}" stroke="#94a3b8" stroke-width="1.5" />`;
  for (let v = axisMin; v <= axisMax; v++) {
    const x = mapX(v);
    ticks += `
      <line x1="${x}" y1="${axisY - 4}" x2="${x}" y2="${axisY + 4}" stroke="#94a3b8" stroke-width="1.2" />
      <text x="${x}" y="${axisY + 15}" text-anchor="middle" fill="#cbd5e1" font-size="9.5" font-family="JetBrains Mono">${v}</text>
    `;
    const n = counts[v] || 0;
    for (let k = 0; k < n; k++) {
      const cy = axisY - 10 - k * 11;
      dots += `<circle cx="${x}" cy="${cy}" r="3.8" fill="#38bdf8" stroke="#e0f2fe" stroke-width="0.7" />`;
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="w-full max-w-[310px] h-auto mx-auto">
    ${title ? `<text x="${W / 2}" y="13" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="Inter" font-weight="700">${title}</text>` : ''}
    ${dots}
    ${ticks}
  </svg>`;
}

export function svgHistogram(
  bins: Array<{ label: string; count: number }>,
  title = '',
  barColor = '#10b981'
): string {
  const W = 300;
  const H = 165;
  const left = 34;
  const right = 284;
  const top = 24;
  const bottom = 136;
  const maxC = Math.max(4, ...bins.map(b => b.count));
  const bw = (right - left) / bins.length;

  let grid = '';
  const step = maxC <= 6 ? 1 : Math.ceil(maxC / 5);
  for (let yv = 0; yv <= maxC; yv += step) {
    const y = bottom - (yv / maxC) * (bottom - top);
    grid += `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#334155" stroke-width="0.8" />
             <text x="${left - 5}" y="${y + 3}" text-anchor="end" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">${yv}</text>`;
  }

  let barsSvg = '';
  bins.forEach((b, i) => {
    const x = left + i * bw;
    const h = (b.count / maxC) * (bottom - top);
    const y = bottom - h;
    barsSvg += `<rect x="${x + 1}" y="${y}" width="${Math.max(4, bw - 2)}" height="${h}" fill="${barColor}" fill-opacity="0.78" stroke="#ecfdf5" stroke-width="1" />
                <text x="${x + bw / 2}" y="${bottom + 12}" text-anchor="middle" fill="#cbd5e1" font-size="8" font-family="JetBrains Mono">${b.label}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" class="w-full max-w-[300px] h-auto mx-auto">
    ${title ? `<text x="${W / 2}" y="14" text-anchor="middle" fill="#fbbf24" font-size="11" font-family="Inter" font-weight="700">${title}</text>` : ''}
    ${grid}
    ${barsSvg}
    <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#cbd5e1" stroke-width="1.4" />
    <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#cbd5e1" stroke-width="1.4" />
  </svg>`;
}

export interface CoordGraphOptions {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  step?: number;
  points?: Array<{ x: number; y: number; color?: string }>;
  lines?: Array<{ m: number; b: number; color?: string; dashed?: boolean }>;
  vertLines?: Array<{ x: number; color?: string; dashed?: boolean }>;
  parabolas?: Array<{ a: number; b: number; c: number; color?: string }>;
  expCurves?: Array<{ a: number; base: number; color?: string }>;
  shadePolygon?: Array<[number, number]>;
  customPath?: string;
  xLabel?: string;
  yLabel?: string;
}

export function svgCoordGraph(opts: CoordGraphOptions): string {
  const W = 250;
  const H = 220;
  const padL = 28;
  const padR = 14;
  const padT = 14;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const { xMin, xMax, yMin, yMax } = opts;
  const mapX = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const mapY = (y: number) => padT + ((yMax - y) / (yMax - yMin)) * plotH;
  const clipId = `clip_${Math.random().toString(36).slice(2, 9)}`;

  const step = opts.step || (xMax - xMin <= 12 ? 1 : 2);
  let grid = '';
  for (let gx = Math.ceil(xMin); gx <= xMax; gx += step) {
    const px = mapX(gx);
    grid += `<line x1="${px}" y1="${padT}" x2="${px}" y2="${H - padB}" stroke="#1e293b" stroke-width="1" />`;
    if (gx !== 0 && (Math.abs(gx) % (step * 2) === 0 || xMax - xMin <= 10)) {
      const labelY = yMin <= 0 && yMax >= 0 ? Math.min(H - padB + 12, Math.max(padT + 12, mapY(0) + 12)) : H - padB + 12;
      grid += `<text x="${px}" y="${labelY}" text-anchor="middle" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">${gx}</text>`;
    }
  }
  const yStep = opts.step || (yMax - yMin <= 12 ? 1 : Math.ceil((yMax - yMin) / 10));
  for (let gy = Math.ceil(yMin); gy <= yMax; gy += yStep) {
    const py = mapY(gy);
    grid += `<line x1="${padL}" y1="${py}" x2="${W - padR}" y2="${py}" stroke="#1e293b" stroke-width="1" />`;
    if (gy !== 0) {
      const labelX = xMin <= 0 && xMax >= 0 ? Math.max(padL - 4, Math.min(W - padR - 4, mapX(0) - 5)) : padL - 4;
      grid += `<text x="${labelX}" y="${py + 3}" text-anchor="end" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">${gy}</text>`;
    }
  }

  let axes = '';
  if (xMin <= 0 && xMax >= 0) {
    const x0 = mapX(0);
    axes += `<line x1="${x0}" y1="${padT}" x2="${x0}" y2="${H - padB}" stroke="#94a3b8" stroke-width="1.6" />`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const y0 = mapY(0);
    axes += `<line x1="${padL}" y1="${y0}" x2="${W - padR}" y2="${y0}" stroke="#94a3b8" stroke-width="1.6" />`;
  }

  let content = '';
  if (opts.shadePolygon && opts.shadePolygon.length >= 3) {
    const ptsStr = opts.shadePolygon.map(([x, y]) => `${mapX(x)},${mapY(y)}`).join(' ');
    content += `<polygon points="${ptsStr}" fill="#10b981" fill-opacity="0.26" />`;
  }

  if (opts.lines) {
    for (const ln of opts.lines) {
      const x1 = xMin - 1;
      const x2 = xMax + 1;
      const y1 = ln.m * x1 + ln.b;
      const y2 = ln.m * x2 + ln.b;
      content += `<line x1="${mapX(x1)}" y1="${mapY(y1)}" x2="${mapX(x2)}" y2="${mapY(y2)}" stroke="${ln.color || '#38bdf8'}" stroke-width="2.4" ${ln.dashed ? 'stroke-dasharray="5,4"' : ''} />`;
    }
  }

  if (opts.vertLines) {
    for (const vl of opts.vertLines) {
      content += `<line x1="${mapX(vl.x)}" y1="${padT}" x2="${mapX(vl.x)}" y2="${H - padB}" stroke="${vl.color || '#fbbf24'}" stroke-width="2.4" ${vl.dashed ? 'stroke-dasharray="5,4"' : ''} />`;
    }
  }

  if (opts.parabolas) {
    for (const pb of opts.parabolas) {
      const pts: string[] = [];
      const samples = 50;
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (i / samples) * (xMax - xMin);
        const y = pb.a * x * x + pb.b * x + pb.c;
        pts.push(`${i === 0 ? 'M' : 'L'}${mapX(x).toFixed(1)},${mapY(y).toFixed(1)}`);
      }
      content += `<path d="${pts.join(' ')}" fill="none" stroke="${pb.color || '#fbbf24'}" stroke-width="2.5" />`;
    }
  }

  if (opts.expCurves) {
    for (const ec of opts.expCurves) {
      const pts: string[] = [];
      const samples = 50;
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (i / samples) * (xMax - xMin);
        const y = ec.a * Math.pow(ec.base, x);
        pts.push(`${i === 0 ? 'M' : 'L'}${mapX(x).toFixed(1)},${mapY(y).toFixed(1)}`);
      }
      content += `<path d="${pts.join(' ')}" fill="none" stroke="${ec.color || '#34d399'}" stroke-width="2.5" />`;
    }
  }

  if (opts.customPath) {
    content += opts.customPath;
  }

  if (opts.points) {
    for (const pt of opts.points) {
      content += `<circle cx="${mapX(pt.x)}" cy="${mapY(pt.y)}" r="3.6" fill="${pt.color || '#fbbf24'}" stroke="#0f172a" stroke-width="0.9" />`;
    }
  }

  return `<svg viewBox="0 0 ${W} ${H}" class="w-full max-w-[250px] h-auto mx-auto bg-[#040a08] rounded-xl border border-emerald-500/25">
    <defs><clipPath id="${clipId}"><rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" /></clipPath></defs>
    ${grid}
    ${axes}
    <g clip-path="url(#${clipId})">${content}</g>
    ${opts.xLabel ? `<text x="${W / 2}" y="${H - 4}" text-anchor="middle" fill="#34d399" font-size="9" font-family="Inter" font-weight="700">${opts.xLabel}</text>` : ''}
    ${opts.yLabel ? `<text x="10" y="${H / 2}" text-anchor="middle" fill="#34d399" font-size="9" font-family="Inter" font-weight="700" transform="rotate(-90 10 ${H / 2})">${opts.yLabel}</text>` : ''}
  </svg>`;
}
