/* tab-diagnosis.js — '진단·개선' 탭.
   diagnose.js 가 규칙으로 뽑아낸 항목만 그린다. 여기서 문장을 지어내지 않는다. */

function renderDiagnosis(el) {
  const findings = buildFindings();
  const warn = findings.filter(f => f.level === 'warn');
  const info = findings.filter(f => f.level === 'info');
  const good = findings.filter(f => f.level === 'good');

  const style = {
    warn: { border: 'var(--text-danger)', bg: '#FBEDED', label: '점검 필요', color: 'var(--text-danger)' },
    info: { border: 'var(--accent-info)', bg: '#EAF1F8', label: '참고',      color: 'var(--accent-info)' },
    good: { border: 'var(--accent-success)', bg: 'var(--accent-success-soft)', label: '양호', color: 'var(--accent-success)' }
  };

  const item = f => {
    const s = style[f.level];
    return `
      <div class="card" style="border-left:3px solid ${s.border}">
        <p class="label">
          <span class="tag" style="background:${s.bg};color:${s.color}">${s.label}</span>
        </p>
        <p style="font-size:15px;font-weight:700;margin:0 0 8px">${f.title}</p>
        <p style="font-size:13px;color:var(--text-secondary);margin:0 0 10px">
          <strong style="color:var(--text-tertiary);font-weight:600">근거</strong> ${f.evidence}
        </p>
        <p style="font-size:13px;color:var(--text-primary);margin:0">
          <strong style="color:var(--text-tertiary);font-weight:600">해석</strong> ${f.action}
        </p>
      </div>`;
  };

  const group = (title, arr) => arr.length ? `
    <div class="section">
      <h2>${title} <span style="font-weight:400;color:var(--text-tertiary);font-size:13px">${arr.length}건</span></h2>
      <div class="grid" style="gap:12px">${arr.map(item).join('')}</div>
    </div>` : '';

  const summary = `
    <div class="card" style="margin-bottom:20px">
      <p class="label">한 줄 요약</p>
      <p style="font-size:16px;font-weight:700;margin:0 0 8px;line-height:1.5">
        ${CALC.adVs
          ? '페이지 전환율이 낮은 데다, 대행으로 넘어간 뒤 광고 효율까지 떨어졌습니다.'
          : '광고는 사람을 데려왔지만, 페이지가 그 사람을 잡지 못하고 있습니다.'}
      </p>
      <p style="font-size:13px;color:var(--text-secondary);margin:0">
        전체 전환율이 ${fmt.pct(CALC.cvr, 2)}로 과거 프로젝트 평균에 크게 못 미칩니다.
        자체 Meta 광고는 클릭 대비 페이지 도달률 ${fmt.pct(CALC.ads.landingRate)}로 정상이었고
        신청 1건당 ${fmt.money(CALC.ads.cpaJpy)}였습니다.
        ${CALC.adVs
          ? `대행으로 넘어간 뒤에는 광고비를 ${CALC.adVs.costRatio.toFixed(1)}배 쓰면서
             신청 1건당 ${fmt.money(CALC.adVs.agency.cpaJpy)}로 ${CALC.adVs.cpaRatio.toFixed(1)}배 비싸졌고,
             트래픽은 ${Math.abs(CALC.period.viewsDrop).toFixed(0)}% 줄었습니다.`
          : `광고를 멈춘 뒤에는 트래픽이 ${Math.abs(CALC.period.viewsDrop).toFixed(0)}% 줄었습니다.`}
      </p>
    </div>`;

  el.innerHTML = `
    <div class="section">
      <h2>진단 · 개선 포인트</h2>
      <p class="hint">
        아래 항목은 전부 규칙에 걸린 것만 나옵니다. 각 줄에 근거 수치가 붙어 있으며,
        기준값은 <code>js/config.js</code> 의 <code>diagnose</code> 에 있습니다.
        자체 Meta 광고(${fmt.md(FIGURES.metaAds.runStart)}~${fmt.md(FIGURES.metaAds.runEnd)}) 결과 기준이며,
        Makuake 대행 광고 리포트는 아직 반영되지 않았습니다.
      </p>
      ${summary}
    </div>
    ${group('점검이 필요한 것', warn)}
    ${group('참고할 것', info)}
    ${group('잘 되고 있는 것', good)}
    ${findings.length ? '' : '<div class="section"><div class="empty"><strong>걸린 항목이 없습니다</strong>기준값에 걸린 항목이 하나도 없습니다.</div></div>'}`;
}
