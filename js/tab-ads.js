/* tab-ads.js — '광고 성과' 탭.
   자체 집행한 Meta 광고의 실측 결과와, 광고를 멈춘 전후 비교.

   지표 정의는 calc.js 주석과 같다.
     트래픽 = 광고를 눌러 실제로 페이지가 열린 횟수
     CPM = 광고비/노출x1000 · CPC = 광고비/클릭 · CPL = 광고비/트래픽 · CVR = 신청/트래픽 */

function renderAds(el) {
  const A = CALC.ads;
  const P = CALC.period;
  const m = FIGURES.metaAds;

  const card = (label, value, sub) => `
    <div class="card"><p class="label">${label}</p><p class="value">${value}</p>${sub ? `<p class="sub">${sub}</p>` : ''}</div>`;

  /* ── 두 광고를 같은 지표 구성으로 그린다 ─────── */
  const S = CALC.selfRun;

  /* 공통 지표 10개. 어느 쪽이든 같은 순서, 같은 이름으로 나온다. */
  const metricCards = (x) => `
    <div class="grid g4">
      ${card('광고비', fmt.money(x.cost), x.costSub)}
      ${card('노출', fmt.int(x.impressions), x.impSub)}
      ${card('클릭', fmt.int(x.clicks), `CTR ${fmt.pct(x.ctr, 2)}`)}
      ${card('CTR', fmt.pct(x.ctr, 2), '노출 대비 클릭 비율')}
    </div>
    <div class="grid g4">
      ${card('CPM', fmt.moneyFine(x.cpm), '노출 1,000회당 비용')}
      ${card('CPC', fmt.moneyFine(x.cpc), '클릭 1회당 비용')}
      ${card('CVR', fmt.pct(x.cvr, 3), `클릭 ${fmt.int(x.clicks)}회 → 전환 ${x.conv}건`)}
      ${card('CPA', fmt.money(x.cpa), `전환 1건당 광고비`)}
    </div>
    <div class="grid g2">
      ${card('광고 매출액', fmt.money(x.revenue), x.revenueSub)}
      ${card('ROAS', fmt.pct(x.roas, 1), `광고 매출액 ÷ 광고비`)}
    </div>`;

  const selfBlock = `
    <div class="ad-block self">
      <div class="ad-head">
        <span class="ad-badge">자체 집행</span>
        <h2>자체 Meta 광고</h2>
        <span class="tag">집행 종료</span>
      </div>
      <p class="ad-sub">
        ${fmt.md(m.runStart)} ~ ${fmt.md(m.runEnd)} · ${A.runDays}일 · ${esc(m.campaign)}<br>
        전환은 <strong>오가닉 ${S.organicOrders}건(${fmt.money(S.organicAmount)})을 뺀 광고 기여분</strong>입니다.
      </p>
      ${metricCards({
        cost: S.costJpy, costSub: `${fmt.moneyAlt(S.costJpy)} · 일평균 ${fmt.money(S.costJpy / A.runDays)}`,
        impressions: S.impressions, impSub: `도달 ${fmt.int(A.reach)} · 1인당 ${A.frequency.toFixed(2)}회`,
        clicks: S.clicks, ctr: S.ctr, cpm: S.cpmJpy, cpc: S.cpcJpy,
        cvr: S.cvrClicks, conv: S.adOrders, cpa: S.cpaJpy,
        revenue: S.adAmountJpy, revenueSub: `기간 총 ${fmt.money(S.amountJpy)}에서 오가닉 제외`,
        roas: S.roas
      })}
      <div class="ad-extra">
        <p>자체 Meta 광고에만 있는 지표</p>
        <div class="grid g3">
          ${card('트래픽', fmt.int(A.traffic), '광고를 눌러 실제로 페이지가 열린 횟수')}
          ${card('CPL', fmt.moneyFine(A.cplJpy), '트래픽 1회당 비용')}
          ${card('클릭 → 트래픽 도달률', fmt.pct(A.landingRate), `클릭 ${fmt.int(S.clicks)}회 중 ${fmt.int(A.traffic)}회 도달`)}
        </div>
      </div>
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
          <th>자체 Meta 광고 기간<br><span style="font-weight:400;color:var(--text-tertiary)">${fmt.short(P.on.from)}~${fmt.short(P.on.to)} · ${P.on.days}일</span></th>
          <th>Makuake 대행 기간<br><span style="font-weight:400;color:var(--text-tertiary)">${fmt.short(P.off.from)}~${fmt.short(P.off.to)} · ${P.off.days}일</span></th>
          <th>변화</th>
        </tr></thead>
        <tbody>
          ${cmpRow('페이지 조회수', P.on.viewsPerDay, P.off.viewsPerDay, '회', v => fmt.int(v))}
          ${cmpRow('신청 건수', P.on.ordersPerDay, P.off.ordersPerDay, '건', v => v.toFixed(1))}
          ${cmpRow('펀딩 금액', P.on.amountPerDay, P.off.amountPerDay, '', v => fmt.money(v))}
        </tbody>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">Makuake 페이지 기준 수치입니다. 광고가 멈춘 게 아니라 자체 집행에서 대행으로 넘어간 구간입니다.</p>`;

  /* ── Makuake 대행 광고 ──────────────────────── */
  const G = CALC.agency;
  const V = CALC.adVs;
  const agencyBlock = !G ? '' : `
    <div class="ad-block agency">
      <div class="ad-head">
        <span class="ad-badge">대행</span>
        <h2>Makuake 대행 광고</h2>
        <span class="tag">집행 중</span>
      </div>
      <p class="ad-sub">
        ${fmt.md(G.weekFrom)} ~ ${fmt.md(G.weekTo)} 중 ${G.deliveryDays}일 집행 · 게재 예정 종료 ${fmt.md(G.plannedEnd)}<br>
        주간 리포트 <strong>${esc(G.reportFile)}</strong> 기준 · 전환·매출액은 대행사가 낸 값이며 오가닉 구분이 없습니다.
      </p>
      ${metricCards({
        cost: G.costJpy, costSub: `${fmt.moneyAlt(G.costJpy)} · 예산 소진율 ${fmt.pct(G.totals.budgetUsePct)}`,
        impressions: G.impressions, impSub: `매체 ${G.media.filter(x => x.impressions > 0).length}곳 합계`,
        clicks: G.clicks, ctr: G.ctr, cpm: G.cpmJpy, cpc: G.cpcJpy,
        cvr: G.cvrClicks, conv: G.cv, cpa: G.cpaJpy,
        revenue: G.amountJpy, revenueSub: `리포트의 応援金額 · 같은 기간 확정 매출과 일치`,
        roas: G.roas
      })}
      <div class="ad-extra">
        <p>Makuake 대행 광고에만 있는 지표</p>
        <div class="grid g2">
          ${card('상한 CPA', fmt.money(G.capCpaJpy),
                 `실제 ${fmt.money(G.cpaJpy)} · <span class="neg">${fmt.pct(G.capOverPct, 0)} 초과</span>`)}
          ${card('예산 소진율', fmt.pct(G.totals.budgetUsePct), `게재 예정 종료 ${fmt.md(G.plannedEnd)}까지`)}
        </div>
      </div>
    </div>

    <div class="section">
      <h2>대행 광고 매체별</h2>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>매체</th><th>광고비</th><th>노출</th><th>클릭</th><th>CTR</th>
            <th>CPC</th><th>CPM</th><th>전환</th><th>CVR</th><th>CPA</th>
          </tr></thead>
          <tbody>
            ${G.media.map(m => `<tr class="${m.cv > 0 ? 'me' : ''}">
              <td>${esc(m.name)}</td>
              <td>${fmt.money(m.costJpy)}</td>
              <td>${fmt.int(m.impressions)}</td>
              <td>${fmt.int(m.clicks)}</td>
              <td>${m.ctr == null ? '—' : fmt.pct(m.ctr, 2)}</td>
              <td>${m.cpcJpy == null ? '—' : fmt.moneyFine(m.cpcJpy)}</td>
              <td>${m.cpmJpy == null ? '—' : fmt.moneyFine(m.cpmJpy)}</td>
              <td>${fmt.int(m.cv)}</td>
              <td>${m.cvrPct == null ? '—' : fmt.pct(m.cvrPct, 2)}</td>
              <td>${m.cpaJpy == null ? '—' : fmt.money(m.cpaJpy)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="hint" style="margin-top:10px">
        전환이 나온 매체는 Facebook 하나입니다. RTBHouse는 노출 ${fmt.int(G.media[1].impressions)}회에 클릭 ${G.media[1].clicks}회로
        CTR이 ${fmt.pct(G.media[1].ctr, 2)}이고 전환은 0건, Criteo는 아직 집행되지 않았습니다.
      </p>
    </div>

    <div class="section">
      <h2>자체 광고 vs 대행 광고</h2>
      <p class="hint">
        자체 Meta 쪽은 <strong>오가닉으로 확인된 ${V.self.organicOrders}건(${fmt.money(V.self.organicAmount)})을 빼고</strong>
        광고 기여분만 셌습니다. 대행 쪽은 대행사가 낸 값을 그대로 썼는데, 그 값은
        Makuake 애널리틱스의 같은 기간 총계와 정확히 일치합니다.
        <strong>즉 대행 숫자에는 오가닉이 섞여 있을 수 있고, 그만큼 아래 배수는 대행에 유리하게 나온 값입니다.</strong>
      </p>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th></th>
            <th>자체 Meta<br><span style="font-weight:400;color:var(--text-tertiary)">${fmt.short(P.on.from)}~${fmt.short(P.on.to)} · ${V.self.days}일 · 오가닉 제외</span></th>
            <th>Makuake 대행<br><span style="font-weight:400;color:var(--text-tertiary)">${fmt.short(P.off.from)}~${fmt.short(P.off.to)} · ${V.agency.days}일 · 기간 총계</span></th>
            <th>차이</th>
          </tr></thead>
          <tbody>
            <tr><td>광고비</td><td>${fmt.money(V.self.costJpy)}</td><td>${fmt.money(V.agency.costJpy)}</td>
                <td class="neg">${V.costRatio.toFixed(1)}배</td></tr>
            <tr><td>신청 건수</td>
                <td>${V.self.adOrders}건 <span style="color:var(--text-tertiary)">(총 ${V.self.orders}건 − 오가닉 ${V.self.organicOrders}건)</span></td>
                <td>${V.agency.orders}건</td>
                <td class="${V.agency.orders < V.self.adOrders ? 'neg' : 'pos'}">${(V.agency.orders / V.self.adOrders * 100 - 100).toFixed(0)}%</td></tr>
            <tr><td>광고 매출액</td>
                <td>${fmt.money(V.self.adAmountJpy)} <span style="color:var(--text-tertiary)">(총 ${fmt.money(V.self.amountJpy)} − 오가닉 ${fmt.money(V.self.organicAmount)})</span></td>
                <td>${fmt.money(V.agency.amountJpy)}</td>
                <td class="${V.agency.amountJpy < V.self.adAmountJpy ? 'neg' : 'pos'}">${(V.agency.amountJpy / V.self.adAmountJpy * 100 - 100).toFixed(0)}%</td></tr>
            <tr><td><strong>신청 1건당 광고비</strong></td>
                <td><strong>${fmt.money(V.self.cpaJpy)}</strong></td>
                <td><strong>${fmt.money(V.agency.cpaJpy)}</strong></td>
                <td class="neg"><strong>${V.cpaRatio.toFixed(1)}배 비쌈</strong></td></tr>
            <tr><td><strong>ROAS</strong></td>
                <td><strong>${fmt.pct(V.self.roas, 0)}</strong></td>
                <td><strong>${fmt.pct(V.agency.roas, 0)}</strong></td>
                <td class="neg"><strong>${V.roasRatio.toFixed(1)}배 차이</strong></td></tr>
          </tbody>
        </table>
      </div>

      <h3 style="font-size:15px;margin:22px 0 10px">단가·효율 지표</h3>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th></th><th>자체 Meta</th><th>Makuake 대행</th><th>차이</th>
          </tr></thead>
          <tbody>
            <tr><td>노출</td><td>${fmt.int(S.impressions)}</td><td>${fmt.int(G.impressions)}</td>
                <td>${(G.impressions / S.impressions).toFixed(1)}배</td></tr>
            <tr><td>클릭</td><td>${fmt.int(S.clicks)}</td><td>${fmt.int(G.clicks)}</td>
                <td>${(G.clicks / S.clicks * 100 - 100).toFixed(0)}%</td></tr>
            <tr><td>CTR</td><td>${fmt.pct(S.ctr, 2)}</td><td>${fmt.pct(G.ctr, 2)}</td>
                <td class="pos">자체가 ${(S.ctr / G.ctr).toFixed(1)}배 높음</td></tr>
            <tr><td><strong>CPM</strong></td><td>${fmt.moneyFine(S.cpmJpy)}</td><td>${fmt.moneyFine(G.cpmJpy)}</td>
                <td class="neg">대행이 ${(G.cpmJpy / S.cpmJpy).toFixed(1)}배 비쌈</td></tr>
            <tr><td><strong>CPC</strong></td><td>${fmt.moneyFine(S.cpcJpy)}</td><td>${fmt.moneyFine(G.cpcJpy)}</td>
                <td class="neg">대행이 ${(G.cpcJpy / S.cpcJpy).toFixed(1)}배 비쌈</td></tr>
            <tr><td><strong>CPL</strong></td><td>${fmt.moneyFine(S.cplJpy)}</td>
                <td style="color:var(--text-tertiary)">—</td>
                <td style="color:var(--text-tertiary)">대행 리포트에 트래픽 지표 없음</td></tr>
            <tr><td><strong>CVR</strong> <span style="color:var(--text-tertiary);font-weight:400">(클릭 대비)</span></td>
                <td>${fmt.pct(S.cvrClicks, 3)}</td><td>${fmt.pct(G.cvrClicks, 3)}</td>
                <td class="pos">대행이 ${(G.cvrClicks / S.cvrClicks).toFixed(1)}배 높음</td></tr>
          </tbody>
        </table>
      </div>
      <p class="hint" style="margin-top:10px">
        <strong>CVR은 여기서만 '클릭 대비'로 계산했습니다.</strong>
        대행 리포트에 랜딩 도달(트래픽) 지표가 없어 양쪽이 함께 가진 클릭을 분모로 맞췄습니다.
        다른 탭의 CVR(${fmt.pct(CALC.ads.cvr, 2)})은 트래픽을 분모로 쓴 값이라 숫자가 다릅니다.
        같은 이유로 CPL은 자체 Meta만 낼 수 있습니다.
      </p>
      <p class="hint">
        읽는 법 — 자체 광고는 <strong>싸고 클릭을 많이</strong> 모았지만 그 클릭이 신청으로 잘 안 넘어갔고,
        대행 광고는 <strong>비싸고 클릭은 적지만</strong> 그 클릭이 신청으로 더 잘 넘어갔습니다.
        결과적으로 두 기간 모두 6건 · ${fmt.money(V.agency.amountJpy)}로 같고, 든 돈만 ${V.costRatio.toFixed(1)}배 차이입니다.
      </p>
      <p class="hint" style="margin-top:10px">
        오가닉을 빼지 않은 기간 총계로 보면 자체 Meta는 신청 ${V.self.orders}건 ·
        건당 ${fmt.money(V.self.cpaAllJpy)} · ROAS ${fmt.pct(V.self.roasAll, 0)}입니다.
      </p>
    </div>`;

  /* ── 일별 상세 ───────────────────────────────── */
  const rows = A.daily.map(d => `
    <tr>
      <td>${fmt.md(d.date)}</td>
      <td>${fmt.money(d.spendJpy)}</td>
      <td>${fmt.int(d.impressions)}</td>
      <td>${fmt.int(d.linkClicks)}</td>
      <td>${fmt.pct(d.ctr, 2)}</td>
      <td>${fmt.int(d.traffic)}</td>
      <td>${fmt.moneyFine(d.cpmJpy)}</td>
      <td>${fmt.moneyFine(d.cpcJpy)}</td>
      <td>${fmt.moneyFine(d.cplJpy)}</td>
      <td>${fmt.pct(d.cvr, 2)}</td>
    </tr>`).join('');

  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>날짜</th><th>광고비</th><th>노출</th><th>클릭</th><th>CTR</th>
          <th>트래픽</th><th>CPM</th><th>CPC</th><th>CPL</th><th>CVR</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr>
          <td>합계</td>
          <td>${fmt.money(A.spendJpy)}</td>
          <td>${fmt.int(A.impressions)}</td>
          <td>${fmt.int(A.linkClicks)}</td>
          <td>${fmt.pct(A.ctr, 2)}</td>
          <td>${fmt.int(A.traffic)}</td>
          <td>${fmt.moneyFine(A.cpmJpy)}</td>
          <td>${fmt.moneyFine(A.cpcJpy)}</td>
          <td>${fmt.moneyFine(A.cplJpy)}</td>
          <td>${fmt.pct(A.cvr, 2)}</td>
        </tr></tfoot>
      </table>
    </div>
    <p class="hint" style="margin-top:10px">
      CVR 의 분자인 신청 건수는 Makuake 쪽 수치이고 분모인 트래픽은 Meta 쪽 수치입니다.
      출처가 달라 정확한 귀속은 아니며, 광고가 데려온 방문이 신청으로 얼마나 이어졌는지 보는 용도입니다.
      클릭은 Link Clicks 기준으로 좋아요·공유 같은 다른 클릭은 빠져 있습니다.
    </p>`;

  el.innerHTML = `
    <div class="section">${selfBlock}</div>
    ${agencyBlock}
    <div class="section">
      <h2>자체 광고에서 대행으로 넘어간 뒤</h2>
      ${compare}
    </div>
    <div class="section">
      <div class="chart-card">
        <div class="chart-head">
          <h3>일별 광고비와 페이지 조회수</h3>
          <p class="hint">
            8월 26일부터 Makuake 대행으로 넘어갔습니다. 세로 점선이 그 지점입니다.
            대행 구간 막대는 <strong>주간 총액을 일수로 나눈 평균</strong>입니다 — 대행 리포트가 주 단위로만 오기 때문입니다.
          </p>
        </div>
        <div class="chart-box"><canvas id="ch-ads-daily"></canvas></div>
      </div>
    </div>
    <div class="section"><h2>일별 상세</h2>${table}</div>`;

  drawAdsChart();
}

function drawAdsChart() {
  /* x축은 전체 기간(자체 + 대행). 자체는 일별 실측, 대행은 주간 총액의 일평균이다. */
  const days = FIGURES.daily;                 // 8/19 ~ 데이터 마지막 날
  const G = CALC.agency;
  const m = FIGURES.metaAds;
  const conv = j => CURRENCY === 'KRW' ? j * CONFIG.fx.krwPerJpy : j;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  /* 자체 Meta 일별 광고비 */
  const metaByDate = {};
  CALC.ads.daily.forEach(x => { metaByDate[x.date] = x.spendJpy; });

  /* 대행: 주간 총액을 리포트 주간의 날짜 수로 나눠 고르게 편다 */
  const agDays = G ? days.filter(d => d.date >= G.weekFrom && d.date <= G.weekTo) : [];
  const agPerDay = (G && agDays.length) ? G.costJpy / agDays.length : 0;

  const selfBars = days.map(d => (metaByDate[d.date] != null ? conv(metaByDate[d.date]) : null));
  const agBars = days.map(d => (G && d.date >= G.weekFrom && d.date <= G.weekTo ? conv(agPerDay) : null));

  /* 대행 전환 지점 = 자체 마지막 집행일과 그다음 날 사이 */
  const switchIdx = days.findIndex(d => d.date > m.runEnd);

  const switchLine = {
    id: 'switchLine',
    afterDatasetsDraw(chart) {
      if (switchIdx <= 0) return;
      const x = chart.scales.x;
      const px = x.getPixelForValue(switchIdx) - (x.getPixelForValue(1) - x.getPixelForValue(0)) / 2;
      const { top, bottom } = chart.chartArea;
      const g = chart.ctx;
      g.save();
      g.setLineDash([5, 4]);
      g.strokeStyle = '#5F5E5A';
      g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(px, top); g.lineTo(px, bottom); g.stroke();
      g.setLineDash([]);
      g.fillStyle = '#5F5E5A';
      g.font = '600 11px ' + getComputedStyle(document.body).fontFamily;
      g.textAlign = 'left';
      g.fillText('▶ Makuake 대행 전환', px + 6, top + 12);
      g.restore();
    }
  };

  makeChart('ch-ads-daily', {
    type: 'bar',
    data: {
      labels: days.map(x => fmt.short(x.date)),
      datasets: [
        { type: 'bar', label: '자체 Meta 광고비', data: selfBars,
          backgroundColor: '#D85A30', borderRadius: 4, yAxisID: 'y', order: 3 },
        { type: 'bar', label: 'Makuake 대행 광고비 (일평균)', data: agBars,
          backgroundColor: '#8FA8B8', borderRadius: 4, yAxisID: 'y', order: 3 },
        { type: 'line', label: '페이지 조회수', data: days.map(x => x.pageViews),
          borderColor: '#0F6E56', backgroundColor: '#0F6E56', borderWidth: 2,
          pointRadius: 3, tension: 0.25, yAxisID: 'y1', order: 1 }
      ]
    },
    options: (() => {
      const o = chartOptions({
        yTick: v => sym + Math.round(v).toLocaleString('ko-KR'),
        y1: true, y1Tick: v => Math.round(v).toLocaleString('ko-KR') + '회',
        tip: (l, v) => l === '페이지 조회수'
          ? `${l}: ${Math.round(v).toLocaleString('ko-KR')}회`
          : `${l}: ${sym}${Math.round(v).toLocaleString('ko-KR')}`
      });
      o.scales.x.stacked = true;
      o.scales.y.stacked = true;
      return o;
    })(),
    plugins: [switchLine]
  });
}
