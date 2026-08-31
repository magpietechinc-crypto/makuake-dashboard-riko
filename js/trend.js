/* trend.js — 일별 추이 차트(SVG 직접 생성)와 일별 표를 그린다.
   외부 차트 라이브러리를 쓰지 않는다. 인쇄·오프라인에서 그대로 나와야 하기 때문이다. */

function renderTrend() {
  const d = REPORT.daily;

  /* ── 좌표계 ─────────────────────────────────────── */
  const W = 960, H = 360;
  const padL = 8, padR = 8, padT = 56, padB = 58;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const base = padT + plotH;

  const band = plotW / d.length;
  const barW = Math.min(52, band * 0.42);

  const resTop = Math.ceil(Math.max(...d.map(x => x.results)) / 200) * 200;
  const ctrTop = Math.ceil(Math.max(...d.map(x => calc.ctr(x))) / 2) * 2 + 2;

  const cx = i => padL + band * i + band / 2;
  const yRes = v => base - (v / resTop) * plotH;
  const yCtr = v => base - (v / ctrTop) * plotH;

  /* 막대 숫자는 막대 위, 클릭률 숫자는 점 위에 놓는 것이 기본이다.
     둘이 가까워지면(선이 막대 끝에 붙는 날) 클릭률 숫자만 점 아래로 내려 겹침을 피한다. */
  const GAP_BAR = 10;      // 막대 위 여백
  const GAP_LINE = 14;     // 점 위 여백
  const GAP_BELOW = 26;    // 점 아래로 피할 때의 여백
  const MIN_APART = 26;    // 이보다 가까우면 겹친 것으로 본다

  function lineLabelY(i) {
    const barY = yRes(d[i].results) - GAP_BAR;
    const dotY = yCtr(calc.ctr(d[i]));
    const above = dotY - GAP_LINE;
    if (Math.abs(above - barY) >= MIN_APART) return above;
    return Math.min(dotY + GAP_BELOW, base - 6);
  }

  /* ── 격자 ───────────────────────────────────────── */
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const y = base - (plotH / 4) * g;
    grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}"
             stroke="${g === 0 ? 'var(--hairline)' : 'var(--divider)'}" stroke-width="1"/>`;
  }

  /* ── 막대: Landing Page Views ───────────────────── */
  const bars = d.map((x, i) => {
    const y = yRes(x.results);
    return `<rect x="${(cx(i) - barW / 2).toFixed(1)}" y="${y.toFixed(1)}"
              width="${barW.toFixed(1)}" height="${(base - y).toFixed(1)}"
              rx="3" fill="var(--bar)"/>
            <text class="c-barval" x="${cx(i).toFixed(1)}" y="${(y - GAP_BAR).toFixed(1)}"
              text-anchor="middle">${fmt.int(x.results)}</text>`;
  }).join('');

  /* ── 선: CTR ────────────────────────────────────── */
  const path = d.map((x, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)},${yCtr(calc.ctr(x)).toFixed(1)}`).join(' ');
  const dots = d.map((x, i) => `
    <circle cx="${cx(i).toFixed(1)}" cy="${yCtr(calc.ctr(x)).toFixed(1)}" r="4"
      fill="var(--canvas)" stroke="var(--accent)" stroke-width="2"/>
    <text class="c-lineval" x="${cx(i).toFixed(1)}" y="${lineLabelY(i).toFixed(1)}"
      text-anchor="middle">${fmt.pct(calc.ctr(x), 1)}</text>`).join('');

  /* ── x축 ────────────────────────────────────────── */
  const xlabels = d.map((x, i) => `
    <text class="c-axis" x="${cx(i).toFixed(1)}" y="${base + 24}" text-anchor="middle">${fmt.dateShort(x.date)}</text>
    <text class="c-axis-sub" x="${cx(i).toFixed(1)}" y="${base + 43}" text-anchor="middle">${esc(fmt.primary(x.spend))}</text>`).join('');

  document.getElementById('trend-chart').innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" preserveAspectRatio="xMidYMid meet"
         aria-label="${esc(t('chartAria')(METRIC.result))}">
      ${grid}${bars}
      <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${xlabels}
    </svg>`;

  document.getElementById('trend-legend').innerHTML = `
    <span class="lg"><i class="sw sw-bar"></i>${esc(METRIC.result)}</span>
    <span class="lg"><i class="sw sw-line"></i>${esc(METRIC.ctr)}</span>
    <span class="lg lg-note">${esc(t('legendNote'))}</span>`;

  /* ── 일별 표 ────────────────────────────────────── */
  /* 금액 칸은 두 통화를 위아래로 쌓는다. 가로 폭은 늘어나지 않는다. */
  const rows = d.map(x => `
    <tr>
      <th scope="row">${fmt.dateKo(x.date)}</th>
      <td>${fmt.money(x.spend)}</td>
      <td>${fmt.int(x.impressions)}</td>
      <td>${fmt.int(x.reach)}</td>
      <td>${fmt.int(x.linkClicks)}</td>
      <td>${fmt.pct(calc.ctr(x))}</td>
      <td>${fmt.int(x.results)}</td>
      <td>${fmt.money(Math.round(calc.cpr(x)))}</td>
    </tr>`).join('');

  const s = REPORT.totals;
  document.getElementById('trend-table').innerHTML = `
    <table>
      <thead>
        <tr>
          <th scope="col">${esc(t('thDate'))}</th><th scope="col">${esc(METRIC.spend)}</th>
          <th scope="col">${esc(METRIC.impressions)}</th><th scope="col">${esc(METRIC.reach)}</th>
          <th scope="col">${esc(METRIC.clicks)}</th><th scope="col">${esc(METRIC.ctr)}</th>
          <th scope="col">${esc(METRIC.resultShort)}</th><th scope="col">${esc(METRIC.costPerResultShort)}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <th scope="row">${esc(t('thTotal'))}</th>
          <td>${fmt.money(s.spend)}</td>
          <td>${fmt.int(s.impressions)}</td>
          <td>${fmt.int(s.reach)}</td>
          <td>${fmt.int(s.linkClicks)}</td>
          <td>${fmt.pct(calc.ctr(s))}</td>
          <td>${fmt.int(s.results)}</td>
          <td>${fmt.money(Math.round(calc.cpr(s)))}</td>
        </tr>
      </tfoot>
    </table>
    <p class="tnote">${esc(t('trendNote'))}</p>`;
}
