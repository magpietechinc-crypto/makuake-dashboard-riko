/* tab-creative.js — '소재별 성과' 탭.
   자체 집행한 Meta 광고의 소재별 결과를 보여준다.
   Makuake 대행 광고 리포트를 받으면 FIGURES.agencyCreatives 에 채워 아래에 덧붙인다. */

function renderCreative(el) {
  const list = CALC.ads.creatives;
  const standby = FIGURES.metaAds.standby || [];

  const bestCtr  = list.reduce((a, b) => (b.ctr > a.ctr ? b : a));
  const bestCost = list.filter(c => c.lpv > 0).reduce((a, b) => (b.cplpvJpy < a.cplpvJpy ? b : a));

  const kindOf = c => c.duration ? `${c.kind} · ${c.duration}` : c.kind;

  /* ── 카드 ────────────────────────────────────── */
  const cards = list.map(c => {
    const tags = [
      c === bestCtr ? '<span class="tag">CTR 1위</span>' : '',
      c === bestCost ? '<span class="tag">도달당 비용 최저</span>' : ''
    ].join(' ');
    return `
      <div class="card">
        <p class="label">${esc(c.name)} <span style="color:var(--text-tertiary)">${esc(kindOf(c))}</span> ${tags}</p>
        <p class="value sm">${fmt.money(c.spendJpy)}</p>
        <div class="bar"><span style="width:${c.share.toFixed(1)}%"></span></div>
        <p class="sub">광고비 비중 ${fmt.pct(c.share)}</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px 14px;margin-top:12px;font-size:12px">
          <div><span style="color:var(--text-tertiary)">노출</span><br><strong>${fmt.int(c.impressions)}</strong></div>
          <div><span style="color:var(--text-tertiary)">Link Clicks</span><br><strong>${fmt.int(c.linkClicks)}</strong></div>
          <div><span style="color:var(--text-tertiary)">CTR</span><br><strong>${fmt.pct(c.ctr, 2)}</strong></div>
          <div><span style="color:var(--text-tertiary)">랜딩 도달</span><br><strong>${fmt.int(c.lpv)}</strong></div>
        </div>
      </div>`;
  }).join('');

  /* ── 표 ──────────────────────────────────────── */
  const rows = list.map(c => `
    <tr class="${c === bestCtr ? 'me' : ''}">
      <td>${esc(c.name)}</td>
      <td>${esc(kindOf(c))}</td>
      <td>${fmt.money(c.spendJpy)}</td>
      <td>${fmt.pct(c.share)}</td>
      <td>${fmt.int(c.impressions)}</td>
      <td>${fmt.int(c.linkClicks)}</td>
      <td>${fmt.pct(c.ctr, 2)}</td>
      <td>${fmt.moneyFine(c.cpcJpy)}</td>
      <td>${fmt.int(c.lpv)}</td>
      <td>${fmt.moneyFine(c.cplpvJpy)}</td>
    </tr>`).join('');

  const standbyBlock = standby.length ? `
    <div class="section">
      <h2>한 번도 노출되지 않은 소재</h2>
      <p class="hint">등록은 되어 있으나 예산이 배분되지 않아 성과가 없는 소재입니다. 광고 재개 시 우선 투입 후보입니다.</p>
      <div class="grid g4">
        ${standby.map(s => `
          <div class="card">
            <p class="label">${esc(s.name)}</p>
            <p class="value sm" style="color:var(--text-tertiary)">노출 0</p>
            <p class="sub">${esc(s.duration ? s.kind + ' · ' + s.duration : s.kind)}</p>
          </div>`).join('')}
      </div>
    </div>` : '';

  const agencyBlock = (FIGURES.agencyCreatives && FIGURES.agencyCreatives.length) ? '' : `
    <div class="section">
      <h2>Makuake 대행 광고 소재</h2>
      <div class="empty">
        <strong>아직 리포트가 없습니다</strong>
        Makuake 대행 광고 리포트는 매주 수요일에 옵니다.<br>
        받아서 폴더에 넣어주시면 이 자리에 대행 광고의 소재별 성과가 채워집니다.
      </div>
    </div>`;

  el.innerHTML = `
    <div class="section">
      <h2>자체 Meta 광고 소재</h2>
      <p class="hint">
        ${fmt.md(FIGURES.metaAds.runStart)} ~ ${fmt.md(FIGURES.metaAds.runEnd)} 집행분입니다.
        광고비가 많이 들어간 순서이며, 예산은 성과가 좋은 소재로 자동 재배분되므로 비중 자체가 성적표이기도 합니다.
      </p>
      <div class="grid g3">${cards}</div>
    </div>
    <div class="section">
      <div class="chart-card">
        <div class="chart-head"><h3>소재별 CTR과 광고비 비중</h3>
          <p class="hint">막대가 CTR, 점이 광고비 비중입니다. 둘이 어긋나면 예산이 잘못 쏠린 것입니다.</p></div>
        <div class="chart-box"><canvas id="ch-cre-ctr"></canvas></div>
      </div>
    </div>
    <div class="section">
      <h2>소재 비교표</h2>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>소재</th><th>형식</th><th>광고비</th><th>비중</th><th>노출</th>
            <th>Link Clicks</th><th>CTR</th><th>클릭당</th><th>랜딩 도달</th><th>도달당</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    ${standbyBlock}
    ${agencyBlock}`;

  drawCreativeChart(list);
}

function drawCreativeChart(list) {
  makeChart('ch-cre-ctr', {
    type: 'bar',
    data: {
      labels: list.map(c => c.name),
      datasets: [
        { type: 'bar', label: 'CTR', data: list.map(c => c.ctr),
          backgroundColor: '#D85A30', borderRadius: 4, yAxisID: 'y', order: 2 },
        { type: 'line', label: '광고비 비중', data: list.map(c => c.share),
          borderColor: '#5F5E5A', backgroundColor: '#5F5E5A', borderWidth: 2,
          pointRadius: 4, tension: 0.2, yAxisID: 'y1', order: 1 }
      ]
    },
    options: chartOptions({
      yTick: v => v.toFixed(1) + '%',
      y1: true, y1Tick: v => v.toFixed(0) + '%',
      tip: (l, v) => `${l}: ${v.toFixed(2)}%`
    })
  });
}
