/* calc.js — 손익 계산 한 곳.
   화면 파일들은 여기서 나온 값만 쓴다. 같은 식이 여러 곳에 흩어지지 않게 한다.
   모든 금액은 엔화 기준이며, 통화 전환은 표시할 때만 한다(common.js). */

const CALC = (() => {
  const c = CONFIG.cost;
  const p = CONFIG.project;

  /* ── 기간 ────────────────────────────────────── */
  const totalDays   = daysBetween(p.startDate, p.endDate);            // 28일
  const elapsedDays = daysBetween(p.startDate, FIGURES.dataThrough);  // 데이터가 있는 날수
  const today       = todayISO();
  const remainDays  = Math.max(0, daysBetween(today, p.endDate) - 1);

  /* 하루치 판관비. 프로젝트 기간으로 나눈다. */
  const sgaPerDay = c.sgaTotal / totalDays;

  /* ── 기준 수치 ───────────────────────────────── */
  /* 대표 금액은 Makuake 공개 표시액. 손익도 같은 기준으로 계산해 화면 안에서 앞뒤가 맞게 한다. */
  const revenue = FIGURES.public.amount;
  const units   = FIGURES.public.supporters;

  /* 광고비 = 자체 Meta(원화 실측을 엔화 환산) + Makuake 대행(추정) */
  const rate      = CONFIG.fx.krwPerJpy;
  const metaJpy   = FIGURES.adSpend.meta.krw / rate;
  const agencyJpy = FIGURES.adSpend.agency.jpy;
  const adSpend   = metaJpy + agencyJpy;

  /* ── 지출 ────────────────────────────────────── */
  const cost = {
    mc:     c.mcPerUnit * units,
    fee:    revenue * c.feeRate,
    vat:    revenue * c.vatRate,
    ad:     adSpend,
    loss:   revenue * c.lossRate,
    coupon: c.coupon,
    sga:    sgaPerDay * elapsedDays
  };
  cost.total = cost.mc + cost.fee + cost.vat + cost.ad + cost.loss + cost.coupon + cost.sga;

  const profit     = revenue - cost.total;
  const profitRate = revenue ? (profit / revenue) * 100 : 0;

  /* ROAS 는 부가세를 뺀 매출 기준 (와디즈 대시보드와 같은 관례) */
  const revenueExVat = revenue - cost.vat;
  const roas = adSpend ? (revenueExVat / adSpend) * 100 : 0;

  /* ── 손익분기 매출 ───────────────────────────── */
  /* R × (1 − 수수료 − 부가세 − LOSS − MC비율) = 광고비 + 판관비 */
  const avgUnitPrice = units ? revenue / units : 0;
  const mcRate       = avgUnitPrice ? c.mcPerUnit / avgUnitPrice : 0;
  const margin       = 1 - c.feeRate - c.vatRate - c.lossRate - mcRate;
  const breakEven    = margin > 0 ? (cost.ad + cost.sga) / margin : null;

  /* ── 예상 최종 펀딩액 ────────────────────────── */
  const win    = CONFIG.forecastWindowDays;
  const recent = FIGURES.daily.slice(-win);
  const recentAvg = recent.length
    ? recent.reduce((s, d) => s + d.amount, 0) / recent.length
    : 0;
  const forecast = revenue + recentAvg * remainDays;

  /* ── 누적 시계열 ─────────────────────────────── */
  let ra = 0, rv = 0, ro = 0;
  const cumulative = FIGURES.daily.map(d => {
    ra += d.amount; rv += d.pageViews; ro += d.orders;
    return { date: d.date, amount: ra, pageViews: rv, orders: ro };
  });

  /* ── 전환율 ──────────────────────────────────── */
  const cvr = FIGURES.analytics.pageViews
    ? (FIGURES.analytics.orders / FIGURES.analytics.pageViews) * 100
    : 0;

  /* ── 자체 Meta 광고 지표 ─────────────────────── */
  const m = FIGURES.metaAds;
  const mt = m.totals;
  /* 지표 정의 (화면 전체가 이 정의를 따른다)
       트래픽  = 광고를 눌러 실제로 페이지가 열린 횟수 (Meta 의 Landing Page Views)
       CPM     = 광고비 / 노출 x 1000
       CPC     = 광고비 / 클릭
       CPL     = 광고비 / 트래픽        (트래픽 1회를 만드는 데 든 돈)
       CVR     = 신청 / 트래픽          (페이지가 열린 뒤 실제 신청으로 이어진 비율)
       도달률   = 트래픽 / 클릭          (클릭이 방문으로 이어진 비율) */
  const ads = {
    spendJpy:   metaJpy,
    spendKrw:   mt.spendKrw,
    agencyJpy,
    runDays:    daysBetween(m.runStart, m.runEnd),
    impressions: mt.impressions,
    reach:      mt.reach,
    linkClicks: mt.linkClicks,
    traffic:    mt.lpv,
    frequency:  mt.reach ? mt.impressions / mt.reach : 0,
    ctr:        mt.impressions ? (mt.linkClicks / mt.impressions) * 100 : 0,
    cpmJpy:     mt.impressions ? (metaJpy / mt.impressions) * 1000 : 0,
    cpcJpy:     mt.linkClicks ? metaJpy / mt.linkClicks : 0,
    cplJpy:     mt.lpv ? metaJpy / mt.lpv : 0,
    landingRate: mt.linkClicks ? (mt.lpv / mt.linkClicks) * 100 : 0
  };

  /* 소재별 파생 지표.
     소재 단위 CVR 은 낼 수 없다. Makuake 가 어느 소재에서 신청이 왔는지 알려주지 않는다.
     대신 도달률(클릭 -> 트래픽)을 쓴다. */
  ads.creatives = m.creatives.map(c => {
    const sj = c.spendKrw / rate;
    return {
      ...c,
      traffic:  c.lpv,
      spendJpy: sj,
      share:    mt.spendKrw ? (c.spendKrw / mt.spendKrw) * 100 : 0,
      ctr:      c.impressions ? (c.linkClicks / c.impressions) * 100 : 0,
      cpmJpy:   c.impressions ? (sj / c.impressions) * 1000 : 0,
      cpcJpy:   c.linkClicks ? sj / c.linkClicks : 0,
      cplJpy:   c.lpv ? sj / c.lpv : 0,
      landingRate: c.linkClicks ? (c.lpv / c.linkClicks) * 100 : 0
    };
  });

  /* ── 광고 집행기 vs 중단 후 ──────────────────── */
  const onDays  = FIGURES.daily.filter(d => d.date >= m.runStart && d.date <= m.runEnd);
  const offDays = FIGURES.daily.filter(d => d.date > m.runEnd);
  const avg = (arr, k) => arr.length ? arr.reduce((s, d) => s + d[k], 0) / arr.length : 0;
  const sum = (arr, k) => arr.reduce((s, d) => s + d[k], 0);

  const period = {
    on: {
      label: '광고 집행기', from: m.runStart, to: m.runEnd, days: onDays.length,
      views: sum(onDays, 'pageViews'), orders: sum(onDays, 'orders'), amount: sum(onDays, 'amount'),
      viewsPerDay: avg(onDays, 'pageViews'), ordersPerDay: avg(onDays, 'orders'), amountPerDay: avg(onDays, 'amount')
    },
    off: {
      label: '광고 중단 후', from: offDays[0] ? offDays[0].date : null,
      to: offDays.length ? offDays[offDays.length - 1].date : null, days: offDays.length,
      views: sum(offDays, 'pageViews'), orders: sum(offDays, 'orders'), amount: sum(offDays, 'amount'),
      viewsPerDay: avg(offDays, 'pageViews'), ordersPerDay: avg(offDays, 'orders'), amountPerDay: avg(offDays, 'amount')
    }
  };
  period.viewsDrop  = period.on.viewsPerDay  ? (period.off.viewsPerDay  / period.on.viewsPerDay  - 1) * 100 : 0;
  period.ordersDrop = period.on.ordersPerDay ? (period.off.ordersPerDay / period.on.ordersPerDay - 1) * 100 : 0;

  /* 오가닉으로 확인된 건. 광고 기여분을 셀 때 뺀다. */
  const onRows = FIGURES.daily.filter(d => d.date >= m.runStart && d.date <= m.runEnd);
  const organicOrders = onRows.reduce((s, d) => s + (d.organicOrders || 0), 0);
  const organicAmount = onRows.reduce((s, d) => s + (d.organicAmount || 0), 0);
  const adOrders = period.on.orders - organicOrders;

  /* CVR = 광고 기여 신청 / 트래픽. 신청은 Makuake 쪽, 트래픽은 Meta 쪽 수치다. */
  ads.cvr    = mt.lpv ? (adOrders / mt.lpv) * 100 : 0;
  ads.orders = adOrders;
  ads.ordersAll = period.on.orders;
  ads.organicOrders = organicOrders;
  ads.cpaJpy = adOrders ? metaJpy / adOrders : 0;
  /* 신청 1건이 만드는 매출 대비 광고비 비중 */
  ads.cpaShare = avgUnitPrice ? (ads.cpaJpy / avgUnitPrice) * 100 : 0;

  /* 일별 광고 지표. Makuake 의 그날 신청 건수를 붙여 CVR 까지 낸다. */
  const ordersByDate = {};
  FIGURES.daily.forEach(d => { ordersByDate[d.date] = d.orders; });
  ads.daily = m.daily.map(d => {
    const sj = d.spendKrw / rate;
    const orders = ordersByDate[d.date] || 0;
    return {
      date: d.date, spendJpy: sj, spendKrw: d.spendKrw,
      impressions: d.impressions, reach: d.reach, linkClicks: d.linkClicks,
      traffic: d.lpv, orders,
      ctr:    d.impressions ? (d.linkClicks / d.impressions) * 100 : 0,
      cpmJpy: d.impressions ? (sj / d.impressions) * 1000 : 0,
      cpcJpy: d.linkClicks ? sj / d.linkClicks : 0,
      cplJpy: d.lpv ? sj / d.lpv : 0,
      cvr:    d.lpv ? (orders / d.lpv) * 100 : 0
    };
  });

  /* ── Makuake 대행 광고 ───────────────────────── */
  /* 두 광고를 같은 잣대로 비교한다.
     대행사는 '기간 총계'를 광고 성과로 잡았으므로(리포트의 cv 6건·¥179,400 이
     Makuake 애널리틱스의 같은 기간 실적과 정확히 일치), 자체 Meta 쪽도 같은 기준으로 낸다. */
  const ag = FIGURES.agencyAds;
  const agency = ag ? {
    ...ag,
    costJpy: ag.totals.costJpy,
    cv: ag.totals.cv,
    amountJpy: ag.totals.amountJpy,
    cpaJpy: ag.totals.cv ? ag.totals.costJpy / ag.totals.cv : 0,
    roas: ag.totals.costJpy ? (ag.totals.amountJpy / ag.totals.costJpy) * 100 : 0,
    /* 상한 CPA 대비 얼마나 넘었나 */
    capOverPct: ag.capCpaJpy ? ((ag.totals.costJpy / ag.totals.cv) / ag.capCpaJpy - 1) * 100 : 0
  } : null;

  /* 자체 Meta 기간(8/19~8/25).
     오가닉으로 확인된 건은 빼고 '광고 기여분'을 따로 낸다.
     기간 총계 기준도 함께 남겨 두 잣대를 나란히 보여준다. */
  const selfRun = {
    costJpy: metaJpy,
    days: period.on.days,
    /* 기간 총계 */
    orders: period.on.orders,
    amountJpy: period.on.amount,
    /* 오가닉 제외 = 광고 기여분 */
    organicOrders, organicAmount,
    adOrders: period.on.orders - organicOrders,
    adAmountJpy: period.on.amount - organicAmount
  };
  selfRun.cpaJpy = selfRun.adOrders ? metaJpy / selfRun.adOrders : 0;
  selfRun.roas   = metaJpy ? (selfRun.adAmountJpy / metaJpy) * 100 : 0;
  /* 참고용: 오가닉을 빼지 않은 기간 총계 기준 */
  selfRun.cpaAllJpy = period.on.orders ? metaJpy / period.on.orders : 0;
  selfRun.roasAll   = metaJpy ? (period.on.amount / metaJpy) * 100 : 0;

  /* 두 광고 맞대기 */
  const adVs = agency ? {
    self: selfRun,
    agency: {
      costJpy: agency.costJpy, orders: agency.cv, amountJpy: agency.amountJpy,
      cpaJpy: agency.cpaJpy, roas: agency.roas, days: period.off.days
    },
    /* 자체는 오가닉을 뺀 광고 기여분, 대행은 대행사가 낸 값(기간 총계)이다.
       대행 쪽 오가닉은 알 수 없으므로, 아래 배수는 대행에 유리한 쪽으로 기운 값이다. */
    cpaRatio:  selfRun.cpaJpy ? agency.cpaJpy / selfRun.cpaJpy : 0,
    roasRatio: agency.roas ? selfRun.roas / agency.roas : 0,
    costRatio: selfRun.costJpy ? agency.costJpy / selfRun.costJpy : 0
  } : null;

  return {
    totalDays, elapsedDays, remainDays, sgaPerDay, today,
    agency, selfRun, adVs,
    revenue, units, adSpend, metaJpy, agencyJpy, cost, profit, profitRate,
    revenueExVat, roas,
    avgUnitPrice, mcRate, margin, breakEven,
    breakEvenPct: breakEven ? (revenue / breakEven) * 100 : 0,
    goalPct: CONFIG.goal.fixed ? (revenue / CONFIG.goal.fixed) * 100 : 0,
    recentAvg, forecast, cumulative, cvr,
    ads, period
  };
})();
