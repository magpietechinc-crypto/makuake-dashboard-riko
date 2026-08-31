/* diagnose.js — 진단 규칙. 화면은 그리지 않는다.
   규칙에 걸린 항목만 내놓고, 모든 항목에 근거 수치를 함께 담는다.
   여기서 나오지 않은 말은 화면에도 쓰지 않는다. */

function buildFindings() {
  const T = CONFIG.diagnose;
  const A = CALC.ads;
  const P = CALC.period;
  const out = [];

  const add = (level, title, evidence, action) => out.push({ level, title, evidence, action });

  /* ── 1. 광고를 멈춘 뒤 트래픽 ─────────────────── */
  if (P.off.days > 0 && P.viewsDrop <= T.trafficDropPct) {
    add('warn', '광고를 멈추자 트래픽이 절반 아래로 떨어졌습니다',
      `일평균 페이지 조회수가 집행기 ${fmt.int(P.on.viewsPerDay)}회에서 ` +
      `중단 후 ${fmt.int(P.off.viewsPerDay)}회로 ${Math.abs(P.viewsDrop).toFixed(0)}% 줄었습니다. ` +
      `마지막 날은 ${fmt.int(FIGURES.daily[FIGURES.daily.length - 1].pageViews)}회입니다.`,
      '이 페이지는 광고가 들어가야 사람이 옵니다. Makuake 대행 광고가 실제로 트래픽을 만들고 있는지 리포트에서 가장 먼저 확인할 지점입니다.');
  }

  if (P.off.days > 0 && P.ordersDrop <= T.orderDropPct) {
    add('warn', '신청 건수도 함께 줄었습니다',
      `일평균 신청이 집행기 ${P.on.ordersPerDay.toFixed(1)}건에서 ` +
      `중단 후 ${P.off.ordersPerDay.toFixed(1)}건으로 ${Math.abs(P.ordersDrop).toFixed(0)}% 줄었습니다.`,
      '광고 없이도 신청이 완전히 끊기지는 않았습니다. 광고를 다시 넣으면 증폭될 여지가 있다는 뜻입니다.');
  }

  /* ── 2. 전환율 위치 ──────────────────────────── */
  const past = FIGURES.compare.filter(p => !p.ongoing)
    .map(p => ({ ...p, cvr: p.pageViews ? (p.orders / p.pageViews) * 100 : 0 }));
  const pastAvg = past.reduce((s, p) => s + p.cvr, 0) / past.length;
  const ranked = [...past, { id: CONFIG.project.makuakeId, cvr: CALC.cvr }]
    .sort((a, b) => b.cvr - a.cvr);
  const rank = ranked.findIndex(p => p.id === CONFIG.project.makuakeId) + 1;

  if (CALC.cvr < pastAvg * T.cvrLowRatio) {
    add('warn', `전환율이 과거 프로젝트 평균의 ${(pastAvg / CALC.cvr).toFixed(0)}분의 1입니다`,
      `RIKO 전환율 ${fmt.pct(CALC.cvr, 2)} · 과거 ${past.length}개 평균 ${fmt.pct(pastAvg, 2)} · ` +
      `${ranked.length}개 중 ${rank}위입니다.`,
      '트래픽을 더 붓기 전에 페이지에서 무엇이 막고 있는지부터 봐야 합니다. 지금 구조라면 광고비를 늘려도 같은 비율로 새어 나갑니다.');
  }

  /* ── 3. 트래픽은 부족하지 않았다 ─────────────── */
  const similar = past.filter(p => p.pageViews < FIGURES.analytics.pageViews)
    .sort((a, b) => b.pageViews - a.pageViews)[0];
  if (similar) {
    const lbl = CONFIG.compareLabels[similar.id];
    add('info', '문제는 트래픽 양이 아닙니다',
      `RIKO 페이지 조회 ${fmt.int(FIGURES.analytics.pageViews)}회는 ` +
      `${esc(lbl ? lbl.short : similar.id)}(${fmt.int(similar.pageViews)}회)보다 많습니다. ` +
      `그런데 신청은 ${FIGURES.analytics.orders}건 대 ${similar.orders}건입니다.`,
      '같은 사람 수를 데려와도 신청으로 안 넘어갑니다. 리워드 구성·가격 제시·페이지 상단 설득이 점검 대상입니다.');
  }

  /* ── 4. 광고 효율 자체는 나빴나 ──────────────── */
  if (A.landingRate >= T.landingRateOk) {
    add('good', '광고에서 페이지까지 오는 과정은 문제없었습니다',
      `Link Clicks ${fmt.int(A.linkClicks)}회 중 ${fmt.int(A.lpv)}회가 실제로 페이지를 열었습니다. ` +
      `도달률 ${fmt.pct(A.landingRate)}입니다.`,
      '클릭 후 이탈은 크지 않습니다. 로딩이나 링크 문제는 아닙니다.');
  }
  if (A.cpaShare > 0 && A.cpaShare <= T.cpaShareOk) {
    add('good', '신청 1건을 만드는 광고비는 과하지 않았습니다',
      `집행기 신청 ${P.on.orders}건, 광고비 ${fmt.money(A.spendJpy)} → 건당 ${fmt.moneyFine(A.cpaJpy)}. ` +
      `신청 1건 평균 매출 ${fmt.money(CALC.avgUnitPrice)}의 ${fmt.pct(A.cpaShare)}입니다.`,
      '광고 단가가 아니라 신청 건수의 절대량이 부족한 상태입니다.');
  }

  /* ── 5. 예산이 한 소재에 쏠렸나 ──────────────── */
  const top = A.creatives[0];
  if (top && top.share >= T.spendConcentration) {
    add('warn', `광고비의 ${fmt.pct(top.share)}가 소재 하나에 몰렸습니다`,
      `${esc(top.name)} 한 편이 ${fmt.money(top.spendJpy)}를 썼습니다. ` +
      `나머지 ${A.creatives.length - 1}개를 합쳐도 ${fmt.pct(100 - top.share)}입니다.`,
      '한 소재에 의존하면 그 소재가 피로해질 때 대안이 없습니다. 재개 시 예산 분산을 검토할 지점입니다.');
  }

  /* ── 6. 노출조차 못 받은 소재 ────────────────── */
  const sb = FIGURES.metaAds.standby || [];
  if (sb.length) {
    add('info', `소재 ${sb.length}개가 한 번도 노출되지 않았습니다`,
      `${sb.map(s => esc(s.name)).join(', ')} — 노출 0회입니다. ` +
      `집행된 소재는 ${A.creatives.length}개뿐입니다.`,
      '이미 만들어 둔 자산입니다. 광고 재개 시 추가 제작 없이 바로 시험해볼 수 있습니다.');
  }

  /* ── 7. 포맷별 CTR 격차 ─────────────────────── */
  const byKind = {};
  A.creatives.forEach(c => {
    byKind[c.kind] = byKind[c.kind] || { imp: 0, clk: 0 };
    byKind[c.kind].imp += c.impressions;
    byKind[c.kind].clk += c.linkClicks;
  });
  const allKinds = Object.entries(byKind)
    .map(([k, v]) => ({ kind: k, ctr: v.imp ? (v.clk / v.imp) * 100 : 0, imp: v.imp }));
  /* 노출이 너무 적은 포맷은 뺀다. 36회 노출로 계산한 CTR은 배수가 크게 튀어 근거가 못 된다. */
  const kinds = allKinds.filter(k => k.imp >= T.minImpressions).sort((a, b) => b.ctr - a.ctr);
  const dropped = allKinds.filter(k => k.imp < T.minImpressions);

  if (kinds.length >= 2 && kinds[kinds.length - 1].ctr > 0 &&
      kinds[0].ctr / kinds[kinds.length - 1].ctr >= T.ctrGapRatio) {
    const hi = kinds[0], lo = kinds[kinds.length - 1];
    const note = dropped.length
      ? ` · ${dropped.map(k => `${esc(k.kind)}(노출 ${fmt.int(k.imp)}회)`).join(', ')}는 표본이 작아 제외`
      : '';
    add('info', `${esc(hi.kind)} 소재의 CTR이 ${esc(lo.kind)}보다 ${(hi.ctr / lo.ctr).toFixed(1)}배 높습니다`,
      kinds.map(k => `${esc(k.kind)} ${fmt.pct(k.ctr, 2)} (노출 ${fmt.int(k.imp)}회)`).join(' · ') + note,
      `광고를 재개한다면 ${esc(hi.kind)} 쪽에 무게를 두는 편이 근거가 있습니다.`);
  }

  return out;
}
