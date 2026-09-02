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

  const head = `
    <div class="card" style="margin-bottom:12px">
      <p class="label">자체 집행 Meta 광고 <span class="tag">집행 종료</span></p>
      <p class="value sm">${fmt.md(m.runStart)} ~ ${fmt.md(m.runEnd)} · ${A.runDays}일</p>
      <p class="sub">${esc(m.campaign)} · 현재 중단 상태입니다. 이후 광고는 Makuake 대행으로 넘어갔습니다.</p>
    </div>`;

  /* ── 최상단 지표 8개 ─────────────────────────── */
  const kpi = `
    <div class="grid g4" style="margin-bottom:12px">
      ${card('광고비', fmt.money(A.spendJpy), `${fmt.moneyAlt(A.spendJpy)} · 일평균 ${fmt.money(A.spendJpy / A.runDays)}`)}
      ${card('노출', fmt.int(A.impressions), `도달 ${fmt.int(A.reach)} · 1인당 ${A.frequency.toFixed(2)}회`)}
      ${card('클릭 수', fmt.int(A.linkClicks), `CTR ${fmt.pct(A.ctr, 2)}`)}
      ${card('트래픽', fmt.int(A.traffic), `클릭 중 ${fmt.pct(A.landingRate)}가 페이지 도달`)}
    </div>
    <div class="grid g4">
      ${card('CPM', fmt.moneyFine(A.cpmJpy), '노출 1,000회당 비용')}
      ${card('CPC', fmt.moneyFine(A.cpcJpy), '클릭 1회당 비용')}
      ${card('CPL', fmt.moneyFine(A.cplJpy), '트래픽 1회당 비용')}
      ${card('CVR', fmt.pct(A.cvr, 2),
             `트래픽 ${fmt.int(A.traffic)}회 → 광고 기여 신청 ${A.orders}건<br>
              <span style="color:var(--text-tertiary)">기간 총 ${A.ordersAll}건에서 오가닉 ${A.organicOrders}건 제외</span>`)}
    </div>`;

  const kpi2 = `
    <div class="grid g2">
      ${card('신청 1건당 광고비', fmt.moneyFine(A.cpaJpy),
             `광고 기여 ${A.orders}건 기준 · 건당 매출의 ${fmt.pct(A.cpaShare)}`)}
      ${card('클릭 → 트래픽 도달률', fmt.pct(A.landingRate),
             `클릭 ${fmt.int(A.linkClicks)}회 중 ${fmt.int(A.traffic)}회 도달`)}
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
    <div class="section">
      <h2>Makuake 대행 광고</h2>
      <p class="hint">
        주간 리포트 <strong>${esc(G.reportFile)}</strong> 기준 ·
        ${fmt.md(G.weekFrom)} ~ ${fmt.md(G.weekTo)} 중 ${G.deliveryDays}일 집행 ·
        게재 예정 종료 ${fmt.md(G.plannedEnd)}
      </p>
      <div class="grid g4" style="margin-bottom:12px">
        ${card('광고비', fmt.money(G.costJpy), `${fmt.moneyAlt(G.costJpy)} · 예산 소진율 ${fmt.pct(G.totals.budgetUsePct)}`)}
        ${card('전환 (cv)', fmt.int(G.cv) + '건', `Makuake 애널리틱스 같은 기간 신청 건수와 일치`)}
        ${card('CPA', fmt.money(G.cpaJpy), `상한 ${fmt.money(G.capCpaJpy)} 대비 <span class="neg">+${fmt.pct(G.capOverPct, 0)}</span>`)}
        ${card('ROAS', fmt.pct(G.roas, 1), `응원 금액 ${fmt.money(G.amountJpy)}`)}
      </div>
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
            <tr><td>펀딩 금액</td>
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
    <div class="section">${head}${kpi}</div>
    <div class="section">${kpi2}</div>
    ${agencyBlock}
    <div class="section">
      <h2>자체 광고에서 대행으로 넘어간 뒤</h2>
      ${compare}
    </div>
    <div class="section">
      <div class="chart-card">
        <div class="chart-head">
          <h3>일별 광고비와 트래픽</h3>
          <p class="hint">막대는 광고비, 선은 광고로 페이지가 열린 횟수입니다.</p>
        </div>
        <div class="chart-box"><canvas id="ch-ads-daily"></canvas></div>
      </div>
    </div>
    <div class="section"><h2>일별 상세</h2>${table}</div>`;

  drawAdsChart();
}

function drawAdsChart() {
  const d = CALC.ads.daily;
  const conv = j => CURRENCY === 'KRW' ? j * CONFIG.fx.krwPerJpy : j;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  makeChart('ch-ads-daily', {
    type: 'bar',
    data: {
      labels: d.map(x => fmt.short(x.date)),
      datasets: [
        { type: 'bar', label: '광고비', data: d.map(x => conv(x.spendJpy)),
          backgroundColor: '#D85A30', borderRadius: 4, yAxisID: 'y', order: 2 },
        { type: 'line', label: '트래픽', data: d.map(x => x.traffic),
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
