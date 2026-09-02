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

  /* CVR = 신청 / 트래픽. 신청은 Makuake 쪽 수치, 트래픽은 Meta 쪽 수치라 출처가 다르다.
     Meta 가 데려온 방문이 신청으로 얼마나 이어졌는지 보는 용도다. */
  ads.cvr    = mt.lpv ? (period.on.orders / mt.lpv) * 100 : 0;
  ads.orders = period.on.orders;
  ads.cpaJpy = period.on.orders ? metaJpy / period.on.orders : 0;
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

  return {
    totalDays, elapsedDays, remainDays, sgaPerDay, today,
    revenue, units, adSpend, metaJpy, agencyJpy, cost, profit, profitRate,
    revenueExVat, roas,
    avgUnitPrice, mcRate, margin, breakEven,
    breakEvenPct: breakEven ? (revenue / breakEven) * 100 : 0,
    goalPct: CONFIG.goal.fixed ? (revenue / CONFIG.goal.fixed) * 100 : 0,
    recentAvg, forecast, cumulative, cvr,
    ads, period
  };
})();
