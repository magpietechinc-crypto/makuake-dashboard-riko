/* tab-compare.js — '프로젝트 비교' 탭.
   과거 Makuake 프로젝트와 RIKO를 나란히 놓는다.
   보고 싶은 프로젝트를 여러 개 골라 볼 수 있다. */

let COMPARE_SELECTED = null;   // Set<projectId>

function compareRows() {
  return FIGURES.compare.map(p => {
    const label = CONFIG.compareLabels[p.id] || { short: p.id, full: p.id };
    const days = daysBetween(p.start, p.end);
    return {
      ...p,
      short: label.short,
      full: label.full,
      days,
      cvr: p.pageViews ? (p.orders / p.pageViews) * 100 : 0,
      perDay: days ? p.amount / days : 0,
      avgUnit: p.orders ? p.amount / p.orders : 0
    };
  });
}

function renderCompare(el) {
  const all = compareRows();
  if (!COMPARE_SELECTED) COMPARE_SELECTED = new Set(all.map(p => p.id));

  const picker = `
    <div class="picker" id="cmp-picker">
      ${all.map(p => `
        <label class="${COMPARE_SELECTED.has(p.id) ? 'on' : ''}" data-id="${p.id}">
          <input type="checkbox" ${COMPARE_SELECTED.has(p.id) ? 'checked' : ''}>
          ${esc(p.short)}
        </label>`).join('')}
    </div>`;

  const sel = all.filter(p => COMPARE_SELECTED.has(p.id));
  const riko = all.find(p => p.id === CONFIG.project.makuakeId);

  /* RIKO 가 전환율에서 몇 번째인지 */
  const ranked = [...all].sort((a, b) => b.cvr - a.cvr);
  const rikoRank = ranked.findIndex(p => p.id === riko.id) + 1;

  const summary = `
    <div class="grid g3">
      <div class="card">
        <p class="label">RIKO 전환율 순위</p>
        <p class="value">${rikoRank}위 <span style="font-size:14px;color:var(--text-tertiary)">/ ${all.length}개</span></p>
        <p class="sub">전환율 ${fmt.pct(riko.cvr, 2)} · 1위 ${esc(ranked[0].short)} ${fmt.pct(ranked[0].cvr, 2)}</p>
      </div>
      <div class="card">
        <p class="label">과거 평균 전환율</p>
        <p class="value">${fmt.pct(all.filter(p => !p.ongoing).reduce((s, p) => s + p.cvr, 0) / all.filter(p => !p.ongoing).length, 2)}</p>
        <p class="sub">RIKO를 뺀 ${all.length - 1}개 프로젝트 평균</p>
      </div>
      <div class="card">
        <p class="label">RIKO 페이지 조회수</p>
        <p class="value">${fmt.int(riko.pageViews)}회</p>
        <p class="sub">${riko.days}일 기준 · 진행 중</p>
      </div>
    </div>`;

  const rows = sel.map(p => `
    <tr class="${p.id === riko.id ? 'me' : ''}">
      <td>${esc(p.full)}${p.ongoing ? ' <span class="tag">진행중</span>' : ''}</td>
      <td>${p.start.slice(0, 7).replace('-', '.')} ~ ${p.end.slice(0, 7).replace('-', '.')}</td>
      <td>${p.days}일</td>
      <td>${fmt.money(p.amount)}</td>
      <td>${fmt.int(p.pageViews)}</td>
      <td>${fmt.int(p.orders)}</td>
      <td>${fmt.pct(p.cvr, 2)}</td>
      <td>${fmt.money(p.avgUnit)}</td>
    </tr>`).join('');

  const table = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>프로젝트</th><th>기간</th><th>일수</th><th>모금액</th>
          <th>페이지 조회</th><th>신청</th><th>전환율</th><th>건당 평균</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:var(--text-tertiary)">선택된 프로젝트가 없습니다</td></tr>'}</tbody>
      </table>
    </div>`;

  el.innerHTML = `
    <div class="section">
      <h2>프로젝트 비교</h2>
      <p class="hint">보고 싶은 프로젝트를 눌러 켜고 끌 수 있습니다. RIKO는 색으로 강조됩니다.</p>
      ${picker}
      ${summary}
    </div>
    <div class="section">
      <div class="chart-card" style="margin-bottom:12px">
        <div class="chart-head"><h3>전환율 비교</h3>
          <p class="hint">페이지를 본 사람 중 몇 %가 신청했는지입니다.</p></div>
        <div class="chart-box"><canvas id="ch-cmp-cvr"></canvas></div>
      </div>
      <div class="chart-card" style="margin-bottom:12px">
        <div class="chart-head"><h3>페이지 조회수와 신청 건수</h3>
          <p class="hint">트래픽이 많아도 신청으로 이어지지 않으면 막대 높이가 어긋납니다.</p></div>
        <div class="chart-box"><canvas id="ch-cmp-traffic"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-head"><h3>모금액</h3>
          <p class="hint">프로젝트별 총 모금액입니다.</p></div>
        <div class="chart-box"><canvas id="ch-cmp-amount"></canvas></div>
      </div>
    </div>
    <div class="section"><h2>상세 표</h2>${table}</div>`;

  /* 선택 토글 */
  const pk = document.getElementById('cmp-picker');
  pk.addEventListener('click', e => {
    const lab = e.target.closest('label[data-id]');
    if (!lab) return;
    e.preventDefault();
    const id = lab.dataset.id;
    if (COMPARE_SELECTED.has(id)) COMPARE_SELECTED.delete(id);
    else COMPARE_SELECTED.add(id);
    renderCompare(el);
  });

  drawCompareCharts(sel, riko.id);
}

function drawCompareCharts(sel, rikoId) {
  const labels = sel.map(p => p.short);
  const color = p => (p.id === rikoId ? '#D85A30' : '#C9C6BC');
  const conv = v => CURRENCY === 'KRW' ? v * CONFIG.fx.krwPerJpy : v;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  makeChart('ch-cmp-cvr', {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: '전환율', data: sel.map(p => p.cvr),
                   backgroundColor: sel.map(color), borderRadius: 4 }]
    },
    options: chartOptions({
      yTick: v => v.toFixed(1) + '%',
      tip: (l, v) => `전환율: ${v.toFixed(2)}%`,
      legend: false
    })
  });

  makeChart('ch-cmp-traffic', {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '페이지 조회', data: sel.map(p => p.pageViews),
          backgroundColor: '#C9C6BC', borderRadius: 4, yAxisID: 'y' },
        { label: '신청 건수', data: sel.map(p => p.orders),
          backgroundColor: '#D85A30', borderRadius: 4, yAxisID: 'y1' }
      ]
    },
    options: chartOptions({
      yTick: v => Math.round(v).toLocaleString('ko-KR'),
      y1: true, y1Tick: v => Math.round(v).toLocaleString('ko-KR'),
      tip: (l, v) => `${l}: ${Math.round(v).toLocaleString('ko-KR')}`
    })
  });

  makeChart('ch-cmp-amount', {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: '모금액', data: sel.map(p => conv(p.amount)),
                   backgroundColor: sel.map(color), borderRadius: 4 }]
    },
    options: chartOptions({
      yTick: v => sym + Math.round(v / 10000).toLocaleString('ko-KR') + '만',
      tip: (l, v) => `모금액: ${sym}${Math.round(v).toLocaleString('ko-KR')}`,
      legend: false
    })
  });
}
