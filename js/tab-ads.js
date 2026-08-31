/* tab-ads.js — '광고 성과' 탭.
   자체 집행한 Meta 광고의 실측 결과와, 광고를 멈춘 전후 비교.
   Makuake 대행 광고는 리포트를 받으면 같은 자리에 더한다. */

function renderAds(el) {
  const A = CALC.ads;
  const P = CALC.period;
  const m = FIGURES.metaAds;

  const card = (label, value, sub) => `
    <div class="card"><p class="label">${label}</p><p class="value">${value}</p>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;

  /* ── 캠페인 요약 ─────────────────────────────── */
  const head = `
    <div class="card" style="margin-bottom:12px">
      <p class="label">자체 집행 Meta 광고 <span class="tag">집행 종료</span></p>
      <p class="value sm">${fmt.md(m.runStart)} ~ ${fmt.md(m.runEnd)} · ${A.runDays}일</p>
      <p class="sub">${esc(m.campaign)} · 현재 중단 상태입니다. 이후 광고는 Makuake 대행으로 넘어갔습니다.</p>
    </div>`;

  const kpi = `
    <div class="grid g4">
      ${card('광고비', fmt.money(A.spendJpy), `${fmt.moneyAlt(A.spendJpy)} · 일평균 ${fmt.money(A.spendJpy / A.runDays)}`)}
      ${card('노출', fmt.int(A.impressions), `도달 ${fmt.int(A.reach)} · 1인당 ${A.frequency.toFixed(2)}회`)}
      ${card('Link Clicks', fmt.int(A.linkClicks), `CTR ${fmt.pct(A.ctr, 2)} · 클릭당 ${fmt.moneyFine(A.cpcJpy)}`)}
      ${card('랜딩 페이지 도달', fmt.int(A.lpv), `클릭 중 ${fmt.pct(A.landingRate)} 도달 · 건당 ${fmt.moneyFine(A.cplpvJpy)}`)}
    </div>`;

  const kpi2 = `
    <div class="grid g3">
      ${card('CPM (1,000회 노출당)', fmt.moneyFine(A.cpmJpy), '노출 단가')}
      ${card('신청 1건당 광고비', fmt.moneyFine(A.cpaJpy),
             `집행기 신청 ${P.on.orders}건 기준 · 건당 매출의 ${fmt.pct(A.cpaShare)}`)}
      ${card('Meta 기준 전환율', fmt.pct(A.metaCvr, 2),
             `랜딩 도달 ${fmt.int(A.lpv)}회 대비 신청 ${P.on.orders}건`)}
    </div>`;

  /* ── 광고 중단 전후 ──────────────────────────── */
  const cmpRow = (name, on, off, unit, fmtFn) => {
    const diff = on ? (off / on - 1) * 100 : 0;
    return `<tr>
      <td>${name}</td>
      <td>${fmtFn(on)}${unit}</td>
      <td>${fmtFn(off)}${unit}</td>
      <td class="${diff < 0 ? 'neg' : 'pos'}">${diff >= 0 ? '+' : ''}${diff.toFixed(0)}%</td>
    </tr>`;
  };

  const compare = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>일평균</th>
          <th>광고 집행기<br><span style="font-weight:400;color:var(--text-tertiary)">${fmt.short(P.on.from)}~${fmt.short(P.on.to)} · ${P.on.days}일</span></th>
          <th>광고 중단 후<br><span style="font-weight:400;color:var(--text-tertiary)">${fmt.short(P.off.from)}~${fmt.short(P.off.to)} · ${P.off.days}일</span></th>
          <th>변화</th>
        </tr></thead>
        <tbody>
          ${cmpRow('페이지 조회수', P.on.viewsPerDay, P.off.viewsPerDay, '회', v => fmt.int(v))}
          ${cmpRow('신청 건수', P.on.ordersPerDay, P.off.ordersPerDay, '건', v => v.toFixed(1))}
          ${cmpRow('펀딩 금액', P.on.amountPerDay, P.off.amountPerDay, '', v => fmt.money(v))}
        </tbody>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">
      Makuake 페이지 기준 수치입니다. 광고를 멈춘 뒤 트래픽이 얼마나 줄었는지 보여줍니다.
    </p>`;

  /* ── 일별 표 ─────────────────────────────────── */
  const rows = m.daily.map(d => {
    const spendJpy = d.spendKrw / CONFIG.fx.krwPerJpy;
    const ctr = d.impressions ? (d.linkClicks / d.impressions) * 100 : 0;
    return `<tr>
      <td>${fmt.md(d.date)}</td>
      <td>${fmt.money(spendJpy)}</td>
      <td>${fmt.int(d.impressions)}</td>
      <td>${fmt.int(d.reach)}</td>
      <td>${fmt.int(d.linkClicks)}</td>
      <td>${fmt.pct(ctr, 2)}</td>
      <td>${fmt.int(d.lpv)}</td>
      <td>${fmt.moneyFine(d.lpv ? spendJpy / d.lpv : 0)}</td>
    </tr>`;
  }).join('');

  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>날짜</th><th>광고비</th><th>노출</th><th>도달</th>
          <th>Link Clicks</th><th>CTR</th><th>랜딩 도달</th><th>도달당 비용</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
          <td>합계</td>
          <td>${fmt.money(A.spendJpy)}</td>
          <td>${fmt.int(A.impressions)}</td>
          <td>${fmt.int(A.reach)}</td>
          <td>${fmt.int(A.linkClicks)}</td>
          <td>${fmt.pct(A.ctr, 2)}</td>
          <td>${fmt.int(A.lpv)}</td>
          <td>${fmt.moneyFine(A.cplpvJpy)}</td>
        </tr></tfoot>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">
      도달 합계는 기간 전체에서 중복을 제거한 값이라 날짜별 합보다 작습니다.
      클릭은 Link Clicks 기준이며 좋아요·공유 같은 다른 클릭은 빠져 있습니다.
    </p>`;

  el.innerHTML = `
    <div class="section">${head}${kpi}</div>
    <div class="section">${kpi2}</div>
    <div class="section">
      <h2>광고를 멈춘 뒤 무슨 일이 있었나</h2>
      ${compare}
    </div>
    <div class="section">
      <div class="chart-card">
        <div class="chart-head">
          <h3>일별 광고비와 랜딩 페이지 도달</h3>
          <p class="hint">막대는 광고비, 선은 광고로 페이지에 도달한 횟수입니다.</p>
        </div>
        <div class="chart-box"><canvas id="ch-ads-daily"></canvas></div>
      </div>
    </div>
    <div class="section"><h2>일별 상세</h2>${table}</div>`;

  drawAdsChart();
}

function drawAdsChart() {
  const d = FIGURES.metaAds.daily;
  const rate = CONFIG.fx.krwPerJpy;
  const conv = krw => CURRENCY === 'KRW' ? krw : krw / rate;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  makeChart('ch-ads-daily', {
    type: 'bar',
    data: {
      labels: d.map(x => fmt.short(x.date)),
      datasets: [
        { type: 'bar', label: '광고비', data: d.map(x => conv(x.spendKrw)),
          backgroundColor: '#D85A30', borderRadius: 4, yAxisID: 'y', order: 2 },
        { type: 'line', label: '랜딩 페이지 도달', data: d.map(x => x.lpv),
          borderColor: '#0F6E56', backgroundColor: '#0F6E56', borderWidth: 2,
          pointRadius: 3, tension: 0.25, yAxisID: 'y1', order: 1 }
      ]
    },
    options: chartOptions({
      yTick: v => sym + Math.round(v).toLocaleString('ko-KR'),
      y1: true, y1Tick: v => Math.round(v).toLocaleString('ko-KR') + '회',
      tip: (l, v) => l === '광고비'
        ? `${l}: ${sym}${Math.round(v).toLocaleString('ko-KR')}`
        : `${l}: ${Math.round(v).toLocaleString('ko-KR')}회`
    })
  });
}
