/* summary.js — 표지 헤더와 캠페인 전체 성과 지표를 그린다. */

function renderSummary() {
  const m = REPORT.meta;
  const s = REPORT.totals;

  /* ── 표지 ───────────────────────────────────────── */
  document.getElementById('cover').innerHTML = `
    <p class="eyebrow">${esc(m.platform)} · ${esc(L(m.market))}</p>
    <h1 class="hero">${esc(L(m.campaignLabel))}</h1>
    <dl class="factline">
      <div><dt>${esc(t('factPeriod'))}</dt><dd>${fmt.dateFull(m.periodStart)} — ${fmt.dateFull(m.periodEnd)} <span class="muted">${esc(t('daysSuffix')(m.days))}</span></dd></div>
      <div><dt>${esc(t('factAsOf'))}</dt><dd>${fmt.dateFull(m.generatedAt)}</dd></div>
    </dl>`;

  /* ── 핵심 지표 6 ─────────────────────────────────── */
  /* value/note는 금액일 때 두 통화가 담긴 HTML이므로 esc()로 감싸지 않는다.
     숫자에서 만들어진 문자열이라 안전하다. 라벨만 esc()로 처리한다. */
  const headline = [
    { label: t('kpiSpend'), value: fmt.money(s.spend), note: t('kpiSpendNote')(fmt.moneyInline(Math.round(s.spend / m.days))) },
    { label: METRIC.impressions, value: fmt.int(s.impressions), note: t('kpiImpressionsNote') },
    { label: METRIC.reach, value: fmt.int(s.reach), note: t('kpiReachNote')(fmt.decimal(calc.frequency(s), 1)) },
    { label: METRIC.clicks, value: fmt.int(s.linkClicks), note: t('kpiClicksNote')(fmt.pct(calc.ctr(s))) },
    { label: METRIC.result, value: fmt.int(s.results), note: t('kpiResultsNote')(fmt.pct(s.results / s.linkClicks * 100, 1)) },
    { label: METRIC.costPerResult, value: fmt.money(Math.round(calc.cpr(s))), note: t('kpiCprNote')(fmt.moneyInline(Math.round(calc.cpc(s)))) }
  ];

  document.getElementById('headline').innerHTML = headline.map(k => `
    <div class="kpi">
      <p class="kpi-label">${esc(k.label)}</p>
      <p class="kpi-value">${k.value}</p>
      <p class="kpi-note">${k.note}</p>
    </div>`).join('');

  /* ── 보조 지표 ───────────────────────────────────── */
  const secondary = [
    { label: METRIC.ctr, value: fmt.pct(calc.ctr(s)) },
    { label: METRIC.cpc, value: fmt.money(Math.round(calc.cpc(s))) },
    { label: METRIC.cpm, value: fmt.money(Math.round(calc.cpm(s))) },
    { label: METRIC.frequency, value: t('freqUnit')(fmt.decimal(calc.frequency(s), 2)) }
  ];

  document.getElementById('secondary').innerHTML = secondary.map(k => `
    <div class="stat">
      <span class="stat-label">${esc(k.label)}</span>
      <span class="stat-value">${k.value}</span>
    </div>`).join('');

  /* ── 적용 환율 고지 ─────────────────────────────── */
  const fx = REPORT.fx;
  document.getElementById('fxnote').textContent =
    t('fxNote')(fx.krwPerJpy, L(fx.source), L(fx.asOf));
}
