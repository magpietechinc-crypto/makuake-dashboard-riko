/* tab-overview.js — '매출 현황' 탭. 전체 요약과 손익 계산서. */

function renderOverview(el) {
  const C = CALC;
  const F = FIGURES;
  const est = F.adSpend.estimated ? ` <span class="tag tag-est">추정</span>` : '';

  const card = (label, value, sub, cls) => `
    <div class="card">
      <p class="label">${label}</p>
      <p class="value ${cls || ''}">${value}</p>
      ${sub ? `<p class="sub">${sub}</p>` : ''}
    </div>`;

  /* ── 핵심 카드 ───────────────────────────────── */
  const kpi = `
    <div class="grid g4">
      ${card('총 펀딩 금액', fmt.money(C.revenue),
             `서포터 ${fmt.int(C.units)}명 · 1건당 평균 ${fmt.money(C.avgUnitPrice)}<br>
              <span style="color:var(--text-tertiary)">${fmt.moneyAlt(C.revenue)}</span>`)}
      ${card('총 사용 광고비' + est, fmt.money(C.adSpend), fmt.moneyAlt(C.adSpend) + ' · ' + esc(F.adSpend.note))}
      ${card('남은 펀딩 기간', C.remainDays + '일',
             `${fmt.md(CONFIG.project.startDate)} ~ ${fmt.md(CONFIG.project.endDate)} 중 ${C.elapsedDays}일 경과`)}
      ${card('현재 매출 이익', fmt.money(C.profit),
             `이익률 ${fmt.pct(C.profitRate)}`, C.profit < 0 ? 'neg' : 'pos')}
    </div>`;

  /* ── 목표 두 가지 ────────────────────────────── */
  const goalCard = (label, target, pct, hint, success) => `
    <div class="card">
      <p class="label">${label}</p>
      <p class="value sm">${fmt.money(target)}</p>
      <div class="bar ${success ? 'success' : ''}"><span style="width:${Math.min(100, pct).toFixed(1)}%"></span></div>
      <p class="sub"><strong>${fmt.pct(pct)}</strong> 달성 · ${hint}</p>
    </div>`;

  const beRemain = C.breakEven ? Math.max(0, C.breakEven - C.revenue) : 0;
  const goalRemain = Math.max(0, CONFIG.goal.fixed - C.revenue);

  const goals = `
    <div class="grid g3">
      ${goalCard('손익분기점 (자동 계산)', C.breakEven, C.breakEvenPct,
                 beRemain > 0 ? `${fmt.money(beRemain)} 더 필요` : '흑자 전환', C.breakEvenPct >= 100)}
      ${goalCard('내부 목표', CONFIG.goal.fixed, C.goalPct,
                 goalRemain > 0 ? `${fmt.money(goalRemain)} 남음` : '목표 달성', C.goalPct >= 100)}
      ${card('현재 ROAS', fmt.pct(C.roas, 0),
             `부가세 제외 매출 ${fmt.money(C.revenueExVat)} ÷ 광고비`)}
    </div>`;

  /* ── 손익 계산서 ─────────────────────────────── */
  const row = (name, param, amount, cls) => `
    <tr class="${cls || ''}">
      <td>${name}</td>
      <td class="p">${param || ''}</td>
      <td class="n">${fmt.money(amount)}</td>
    </tr>`;

  const pl = `
    <div class="table-wrap">
      <table class="pl">
        <tbody>
          <tr class="grp"><td colspan="3">수입</td></tr>
          ${row('펀딩 금액', `${fmt.int(C.units)}건`, C.revenue)}
          <tr class="sum"><td>수입 소계</td><td class="p"></td><td class="n">${fmt.money(C.revenue)}</td></tr>

          <tr class="grp"><td colspan="3">지출</td></tr>
          ${row('MC (제조원가)', `${fmt.money(CONFIG.cost.mcPerUnit)} × ${fmt.int(C.units)}건`, C.cost.mc)}
          ${row('수수료', fmt.pct(CONFIG.cost.feeRate * 100, 2), C.cost.fee)}
          ${row('부가세', fmt.pct(CONFIG.cost.vatRate * 100, 2), C.cost.vat)}
          ${row('광고비' + est, F.adSpend.estimated ? '추정' : '', C.cost.ad)}
          ${row('LOSS', fmt.pct(CONFIG.cost.lossRate * 100, 0), C.cost.loss)}
          ${row('쿠폰', '', C.cost.coupon)}
          ${row('판관비', `${fmt.money(C.sgaPerDay)}/일 × ${C.elapsedDays}일`, C.cost.sga)}
          <tr class="sum"><td>지출 소계</td><td class="p"></td><td class="n">${fmt.money(C.cost.total)}</td></tr>

          <tr class="final">
            <td>수입 − 지출</td><td class="p">${fmt.pct(C.profitRate)}</td>
            <td class="n ${C.profit < 0 ? 'neg' : 'pos'}">${fmt.money(C.profit)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">
      판관비는 총 ${fmt.money(CONFIG.cost.sgaTotal)}을 프로젝트 기간 ${C.totalDays}일로 나눠 하루치
      ${fmt.money(C.sgaPerDay)}로 잡고, 경과한 ${C.elapsedDays}일만큼 반영했습니다.
    </p>`;

  /* ── 누적 추이 ───────────────────────────────── */
  const chart = `
    <div class="chart-card">
      <div class="chart-head">
        <h3>누적 펀딩 금액과 누적 페이지 조회수</h3>
        <p class="hint">두 선이 함께 눕기 시작하면 유입이 끊긴 것입니다. 일별 수치는 본펀딩 탭에 있습니다.</p>
      </div>
      <div class="chart-box"><canvas id="ch-overview"></canvas></div>
    </div>`;

  el.innerHTML = `
    <div class="section">${kpi}</div>
    <div class="section">${goals}</div>
    <div class="section">
      <h2>예상 최종 펀딩 금액</h2>
      <div class="grid g3">
        ${card('예상 최종 금액', fmt.money(C.forecast),
               `최근 ${CONFIG.forecastWindowDays}일 평균 ${fmt.money(C.recentAvg)}/일 × 잔여 ${C.remainDays}일`)}
        ${card('페이지 조회수', fmt.int(FIGURES.analytics.pageViews) + '회', `일평균 ${fmt.int(FIGURES.analytics.pageViews / C.elapsedDays)}회`)}
        ${card('전환율', fmt.pct(C.cvr, 2), `조회 ${fmt.int(FIGURES.analytics.pageViews)}회 대비 신청 ${fmt.int(FIGURES.analytics.orders)}건`)}
      </div>
    </div>
    <div class="section">${chart}</div>
    <div class="section"><h2>손익 계산서</h2>${pl}</div>`;

  drawOverviewChart();
}

function drawOverviewChart() {
  const cum = CALC.cumulative;
  const conv = v => CURRENCY === 'KRW' ? v * CONFIG.fx.krwPerJpy : v;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  makeChart('ch-overview', {
    type: 'line',
    data: {
      labels: cum.map(d => fmt.short(d.date)),
      datasets: [
        { label: '누적 펀딩 금액', data: cum.map(d => conv(d.amount)),
          borderColor: '#D85A30', backgroundColor: 'rgba(216,90,48,0.10)',
          borderWidth: 2, pointRadius: 3, tension: 0.25, fill: true, yAxisID: 'y' },
        { label: '누적 페이지 조회수', data: cum.map(d => d.pageViews),
          borderColor: '#0F6E56', backgroundColor: '#0F6E56',
          borderWidth: 2, pointRadius: 3, tension: 0.25, borderDash: [5, 4], yAxisID: 'y1' }
      ]
    },
    options: chartOptions({
      yTick: v => sym + Math.round(v).toLocaleString('ko-KR'),
      y1: true, y1Tick: v => Math.round(v).toLocaleString('ko-KR') + '회',
      tip: (label, v) => label === '누적 페이지 조회수'
        ? `${label}: ${Math.round(v).toLocaleString('ko-KR')}회`
        : `${label}: ${sym}${Math.round(v).toLocaleString('ko-KR')}`
    })
  });
}
