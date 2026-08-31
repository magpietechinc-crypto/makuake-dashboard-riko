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
  const adSpend = FIGURES.adSpend.total;

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

  return {
    totalDays, elapsedDays, remainDays, sgaPerDay, today,
    revenue, units, adSpend, cost, profit, profitRate,
    revenueExVat, roas,
    avgUnitPrice, mcRate, margin, breakEven,
    breakEvenPct: breakEven ? (revenue / breakEven) * 100 : 0,
    goalPct: CONFIG.goal.fixed ? (revenue / CONFIG.goal.fixed) * 100 : 0,
    recentAvg, forecast, cumulative, cvr
  };
})();
