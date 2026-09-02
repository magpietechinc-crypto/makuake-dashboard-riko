/* tab-creative.js — '소재별 성과' 탭.
   소재 이미지는 assets/creatives/ 에서 가져온다. 파일이 없으면 점선 빈 칸이 나온다.

   소재 단위 CVR 은 낼 수 없다. Makuake 가 어느 소재에서 신청이 왔는지 알려주지 않기 때문이다.
   대신 도달률(클릭 -> 트래픽)을 쓰고 그 사실을 화면에 밝힌다. */

function creativeAsset(name) {
  return (CONFIG.creativeAssets && CONFIG.creativeAssets[name]) || null;
}

function creativeShot(name, cls) {
  const src = creativeAsset(name);
  return src
    ? `<img src="${esc(src)}" alt="${esc(name)} 소재" loading="lazy" class="${cls || 'shot'}">`
    : `<span class="shot-empty" aria-hidden="true"></span>`;
}

function renderCreative(el) {
  const list = CALC.ads.creatives;
  const standby = FIGURES.metaAds.standby || [];

  const bestCtr  = list.reduce((a, b) => (b.ctr > a.ctr ? b : a));
  const bestCost = list.filter(c => c.traffic > 0).reduce((a, b) => (b.cplJpy < a.cplJpy ? b : a));
  const kindOf = c => c.duration ? `${c.kind} · ${c.duration}` : c.kind;

  /* ── 카드 ────────────────────────────────────── */
  const cards = list.map(c => {
    const tags = [
      c === bestCtr ? '<span class="tag">CTR 1위</span>' : '',
      c === bestCost ? '<span class="tag">CPL 최저</span>' : ''
    ].join(' ');
    return `
      <div class="card creative-card">
        <div class="shot-box">${creativeShot(c.name)}</div>
        <div class="creative-body">
          <p class="label">${esc(c.name)} <span style="color:var(--text-tertiary)">${esc(kindOf(c))}</span> ${tags}</p>
          <p class="value sm">${fmt.money(c.spendJpy)}</p>
          <div class="bar"><span style="width:${c.share.toFixed(1)}%"></span></div>
          <p class="sub">광고비 비중 ${fmt.pct(c.share)}</p>
          <div class="mini-grid">
            <div><span>노출</span><strong>${fmt.int(c.impressions)}</strong></div>
            <div><span>클릭</span><strong>${fmt.int(c.linkClicks)}</strong></div>
            <div><span>CTR</span><strong>${fmt.pct(c.ctr, 2)}</strong></div>
            <div><span>트래픽</span><strong>${fmt.int(c.traffic)}</strong></div>
            <div><span>CPC</span><strong>${fmt.moneyFine(c.cpcJpy)}</strong></div>
            <div><span>CPL</span><strong>${fmt.moneyFine(c.cplJpy)}</strong></div>
          </div>
        </div>
      </div>`;
  }).join('');

  /* ── 비교표 ──────────────────────────────────── */
  const rows = list.map(c => `
    <tr class="${c === bestCtr ? 'me' : ''}">
      <td>${esc(c.name)}</td>
      <td>${esc(kindOf(c))}</td>
      <td>${fmt.money(c.spendJpy)}</td>
      <td>${fmt.pct(c.share)}</td>
      <td>${fmt.int(c.impressions)}</td>
      <td>${fmt.int(c.linkClicks)}</td>
      <td>${fmt.pct(c.ctr, 2)}</td>
      <td>${fmt.int(c.traffic)}</td>
      <td>${fmt.moneyFine(c.cpmJpy)}</td>
      <td>${fmt.moneyFine(c.cpcJpy)}</td>
      <td>${fmt.moneyFine(c.cplJpy)}</td>
      <td>${fmt.pct(c.landingRate)}</td>
    </tr>`).join('');

  const A = CALC.ads;
  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>소재</th><th>형식</th><th>광고비</th><th>비중</th><th>노출</th>
          <th>클릭</th><th>CTR</th><th>트래픽</th><th>CPM</th><th>CPC</th><th>CPL</th><th>도달률</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
          <td>합계</td><td></td>
          <td>${fmt.money(A.spendJpy)}</td><td>100.0%</td>
          <td>${fmt.int(A.impressions)}</td><td>${fmt.int(A.linkClicks)}</td>
          <td>${fmt.pct(A.ctr, 2)}</td><td>${fmt.int(A.traffic)}</td>
          <td>${fmt.moneyFine(A.cpmJpy)}</td><td>${fmt.moneyFine(A.cpcJpy)}</td>
          <td>${fmt.moneyFine(A.cplJpy)}</td><td>${fmt.pct(A.landingRate)}</td>
        </tr></tfoot>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">
      <strong>CVR(신청 전환율)은 소재별로 낼 수 없습니다.</strong>
      Makuake 가 어느 소재를 보고 신청했는지 알려주지 않기 때문입니다.
      대신 <strong>도달률</strong>(클릭이 실제 방문으로 이어진 비율)을 넣었습니다.
      캠페인 전체 CVR ${fmt.pct(A.cvr, 2)} 는 광고 성과 탭에 있습니다.
    </p>`;

  /* ── 미집행 소재 ─────────────────────────────── */
  const standbyBlock = standby.length ? `
    <div class="section">
      <h2>한 번도 노출되지 않은 소재</h2>
      <p class="hint">등록은 되어 있으나 예산이 배분되지 않아 성과가 없습니다. 광고 재개 시 우선 투입 후보입니다.</p>
      <div class="grid g4">
        ${standby.map(s => `
          <div class="card">
            <div class="shot-box" style="margin-bottom:10px">${creativeShot(s.name)}</div>
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
    <div class="section"><h2>소재 비교표</h2>${table}</div>
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
