/* tab-funding.js — '본펀딩' 탭. 일별 실적과 트래픽. */

function renderFunding(el) {
  const C = CALC;
  const daily = FIGURES.daily;

  const best = daily.reduce((a, b) => (b.amount > a.amount ? b : a));
  const zeroDays = daily.filter(d => d.orders === 0).length;

  const card = (label, value, sub) => `
    <div class="card"><p class="label">${label}</p><p class="value">${value}</p>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;

  const kpi = `
    <div class="grid g4">
      ${card('일평균 펀딩 금액', fmt.money(C.revenue / C.elapsedDays), `${C.elapsedDays}일 기준`)}
      ${card('최고 실적일', fmt.md(best.date), `${fmt.money(best.amount)} · ${best.orders}건`)}
      ${card('신청 없는 날', zeroDays + '일', `전체 ${C.elapsedDays}일 중`)}
      ${card('일평균 조회수', fmt.int(FIGURES.analytics.pageViews / C.elapsedDays) + '회',
             `총 ${fmt.int(FIGURES.analytics.pageViews)}회`)}
    </div>`;

  const charts = `
    <div class="chart-card" style="margin-bottom:12px">
      <div class="chart-head">
        <h3>일별 펀딩 금액과 신청 건수</h3>
        <p class="hint">막대는 금액, 선은 건수입니다.</p>
      </div>
      <div class="chart-box"><canvas id="ch-fund-amount"></canvas></div>
    </div>
    <div class="chart-card">
      <div class="chart-head">
        <h3>일별 페이지 조회수</h3>
        <p class="hint">광고를 멈추면 여기가 가장 먼저 떨어집니다.</p>
      </div>
      <div class="chart-box"><canvas id="ch-fund-views"></canvas></div>
    </div>`;

  const rows = daily.map(d => {
    const cvr = d.pageViews ? (d.orders / d.pageViews) * 100 : 0;
    return `<tr>
      <td>${fmt.md(d.date)}</td>
      <td>${fmt.money(d.amount)}</td>
      <td>${fmt.int(d.orders)}건</td>
      <td>${fmt.int(d.pageViews)}회</td>
      <td>${fmt.pct(cvr, 2)}</td>
    </tr>`;
  }).join('');

  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>날짜</th><th>펀딩 금액</th><th>신청</th><th>페이지 조회</th><th>전환율</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
          <td>합계</td>
          <td>${fmt.money(FIGURES.analytics.amount)}</td>
          <td>${fmt.int(FIGURES.analytics.orders)}건</td>
          <td>${fmt.int(FIGURES.analytics.pageViews)}회</td>
          <td>${fmt.pct(CALC.cvr, 2)}</td>
        </tr></tfoot>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">
      표의 합계는 애널리틱스 기준 ${fmt.money(FIGURES.analytics.amount)}(${FIGURES.analytics.orders}건)입니다.
      상단 카드의 대표 금액 ${fmt.money(FIGURES.public.amount)}(${FIGURES.public.supporters}건)와
      ${fmt.money(FIGURES.analytics.amount - FIGURES.public.amount)} 차이가 나는데,
      결제가 아직 확정되지 않은 1건이 애널리틱스에만 잡혀 있기 때문입니다.
    </p>`;

  el.innerHTML = `
    <div class="section">${kpi}</div>
    <div class="section">${charts}</div>
    <div class="section"><h2>일별 상세</h2>${table}</div>`;

  drawFundingCharts();
}

function drawFundingCharts() {
  const daily = FIGURES.daily;
  const conv = v => CURRENCY === 'KRW' ? v * CONFIG.fx.krwPerJpy : v;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  makeChart('ch-fund-amount', {
    type: 'bar',
    data: {
      labels: daily.map(d => fmt.short(d.date)),
      datasets: [
        { type: 'bar', label: '펀딩 금액', data: daily.map(d => conv(d.amount)),
          backgroundColor: '#D85A30', borderRadius: 4, yAxisID: 'y', order: 2 },
        { type: 'line', label: '신청 건수', data: daily.map(d => d.orders),
          borderColor: '#185FA5', backgroundColor: '#185FA5', borderWidth: 2,
          pointRadius: 3, tension: 0.25, yAxisID: 'y1', order: 1 }
      ]
    },
    options: chartOptions({
      yTick: v => sym + Math.round(v).toLocaleString('ko-KR'),
      y1: true, y1Tick: v => v + '건',
      tip: (label, v) => label === '신청 건수'
        ? `${label}: ${v}건`
        : `${label}: ${sym}${Math.round(v).toLocaleString('ko-KR')}`
    })
  });

  makeChart('ch-fund-views', {
    type: 'line',
    data: {
      labels: daily.map(d => fmt.short(d.date)),
      datasets: [{
        label: '페이지 조회수', data: daily.map(d => d.pageViews),
        borderColor: '#0F6E56', backgroundColor: 'rgba(15,110,86,0.10)',
        borderWidth: 2, pointRadius: 3, tension: 0.25, fill: true
      }]
    },
    options: chartOptions({
      yTick: v => Math.round(v).toLocaleString('ko-KR'),
      tip: (label, v) => `${label}: ${Math.round(v).toLocaleString('ko-KR')}회`
    })
  });
}
