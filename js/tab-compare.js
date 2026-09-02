/* tab-compare.js — '프로젝트 비교' 탭.
   과거 Makuake 프로젝트와 RIKO를 나란히 놓는다.
   보고 싶은 프로젝트를 여러 개 골라 볼 수 있다. */

let COMPARE_SELECTED = null;   // Set<projectId>
let COMPARE_METRIC = 'pageViews';   // 추이 그래프에서 볼 지표
let COMPARE_MODE = 'daily';         // 'daily' 하루치 · 'cum' 누적

const COMPARE_METRICS = [
  { key: 'pageViews', name: '페이지 조회수', unit: '회', money: false },
  { key: 'orders',    name: '신청 건수',     unit: '건', money: false },
  { key: 'amount',    name: '펀딩 금액',     unit: '',   money: true }
];

function compareRows() {
  return FIGURES.compare.map(p => {
    const label = CONFIG.compareLabels[p.id] || { short: p.id, full: p.id };
    /* 진행 중인 프로젝트는 아직 안 지난 날까지 나누면 안 된다.
       실제로 데이터가 쌓인 날수(경과일)로 나눈다. 끝난 프로젝트는 둘이 같다. */
    const totalDays = daysBetween(p.start, p.end);
    const days = p.ongoing ? CALC.elapsedDays : totalDays;
    return {
      ...p,
      short: label.short,
      full: label.full,
      days, totalDays,
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
      <td>${p.days}일${p.ongoing ? ` <span style="color:var(--text-tertiary)">/ ${p.totalDays}일</span>` : ''}</td>
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

  /* ── 지표 선택 (아래 두 그래프가 함께 쓴다) ───── */
  const withDaily = sel.filter(p => (FIGURES.dailyByProject || {})[p.id]);
  const spec = COMPARE_METRICS.find(m => m.key === COMPARE_METRIC);

  const metricPicker = `
    <div class="picker" id="cmp-metric">
      ${COMPARE_METRICS.map(m => `
        <label class="${COMPARE_METRIC === m.key ? 'on' : ''}" data-metric="${m.key}">${esc(m.name)}</label>`).join('')}
    </div>`;

  /* 일평균 비교 — 총계를 캠페인 일수로 나눈 값이라 모든 프로젝트에 쓸 수 있다 */
  const paceChart = `
    <div class="chart-card" style="margin-bottom:12px">
      <div class="chart-head">
        <h3>하루 평균 ${esc(spec.name)}</h3>
        <p class="hint">총계를 캠페인 일수로 나눈 값입니다. 기간이 다른 프로젝트를 같은 잣대로 비교합니다.
        진행 중인 RIKO는 아직 안 지난 날을 빼고 경과한 ${CALC.elapsedDays}일로 나눴습니다.</p>
      </div>
      ${metricPicker}
      <div class="chart-box" style="margin-top:14px"><canvas id="ch-cmp-pace"></canvas></div>
    </div>`;

  /* RIKO 일별 추이 — 과거 프로젝트는 Makuake가 일별 조회를 막아 선을 그릴 수 없다 */
  const trend = `
    <div class="chart-card">
      <div class="chart-head">
        <h3>RIKO 일별 ${esc(spec.name)}</h3>
        <p class="hint">진행 중인 RIKO만 일별로 볼 수 있습니다. 위에서 고른 지표를 그대로 씁니다.</p>
      </div>
      <div class="picker" id="cmp-mode">
        <label class="${COMPARE_MODE === 'daily' ? 'on' : ''}" data-mode="daily">하루치</label>
        <label class="${COMPARE_MODE === 'cum' ? 'on' : ''}" data-mode="cum">누적</label>
      </div>
      <div class="chart-box" style="margin-top:14px"><canvas id="ch-cmp-trend"></canvas></div>
      <p class="hint" style="margin-top:12px">
        <strong>과거 프로젝트는 일별 선을 그릴 수 없습니다.</strong>
        Makuake는 종료된 프로젝트의 애널리틱스 기간을 전체 기간으로 잠가 둡니다.
        날짜를 눌러도 범위가 바뀌지 않아 하루치를 뽑아낼 방법이 없습니다.
        대신 위의 하루 평균 그래프로 비교해 주세요.
      </p>
    </div>`;

  el.innerHTML = `
    <div class="section">
      <h2>프로젝트 비교</h2>
      <p class="hint">보고 싶은 프로젝트를 눌러 켜고 끌 수 있습니다. RIKO는 색으로 강조됩니다.</p>
      ${picker}
      ${summary}
    </div>
    <div class="section">${paceChart}${trend}</div>
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
  document.getElementById('cmp-picker').addEventListener('click', e => {
    const lab = e.target.closest('label[data-id]');
    if (!lab) return;
    e.preventDefault();
    const id = lab.dataset.id;
    if (COMPARE_SELECTED.has(id)) COMPARE_SELECTED.delete(id);
    else COMPARE_SELECTED.add(id);
    renderCompare(el);
  });

  document.getElementById('cmp-metric').addEventListener('click', e => {
    const lab = e.target.closest('label[data-metric]');
    if (!lab) return;
    e.preventDefault();
    COMPARE_METRIC = lab.dataset.metric;
    renderCompare(el);
  });

  document.getElementById('cmp-mode').addEventListener('click', e => {
    const lab = e.target.closest('label[data-mode]');
    if (!lab) return;
    e.preventDefault();
    COMPARE_MODE = lab.dataset.mode;
    renderCompare(el);
  });

  drawPaceChart(sel, riko.id);
  drawTrendChart(withDaily, riko.id);
  drawCompareCharts(sel, riko.id);
}

/* 하루 평균 비교. 총계 / 캠페인 일수 — 총계만 있으면 되므로 모든 프로젝트에 쓸 수 있다. */
function drawPaceChart(projects, rikoId) {
  const spec = COMPARE_METRICS.find(m => m.key === COMPARE_METRIC);
  const conv = v => (spec.money && CURRENCY === 'KRW') ? v * CONFIG.fx.krwPerJpy : v;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';
  const valueOf = p => {
    const total = spec.key === 'amount' ? p.amount : spec.key === 'orders' ? p.orders : p.pageViews;
    return p.days ? total / p.days : 0;
  };

  makeChart('ch-cmp-pace', {
    type: 'bar',
    data: {
      labels: projects.map(p => p.short),
      datasets: [{
        label: `하루 평균 ${spec.name}`,
        data: projects.map(p => conv(valueOf(p))),
        backgroundColor: projects.map(p => (p.id === rikoId ? '#D85A30' : '#C9C6BC')),
        borderRadius: 4
      }]
    },
    options: chartOptions({
      legend: false,
      yTick: v => spec.money
        ? sym + Math.round(v).toLocaleString('ko-KR')
        : (v >= 10 ? Math.round(v).toLocaleString('ko-KR') : v.toFixed(1)) + spec.unit,
      tip: (l, v) => spec.money
        ? `${l}: ${sym}${Math.round(v).toLocaleString('ko-KR')}`
        : `${l}: ${(v >= 10 ? Math.round(v).toLocaleString('ko-KR') : v.toFixed(1))}${spec.unit}`
    })
  });
}

/* 캠페인 경과일로 맞춘 일별 추이. 지금은 RIKO 만 데이터가 있다. */
function drawTrendChart(projects, rikoId) {
  const spec = COMPARE_METRICS.find(m => m.key === COMPARE_METRIC);
  const maxLen = projects.reduce((n, p) => Math.max(n, FIGURES.dailyByProject[p.id].length), 0);
  const labels = Array.from({ length: maxLen }, (_, i) => `${i + 1}일차`);
  const palette = ['#185FA5', '#0F6E56', '#8A6D3B', '#6B4E9B', '#A32D2D', '#5F5E5A', '#2E7D8F'];
  let ci = 0;

  const conv = v => (spec.money && CURRENCY === 'KRW') ? v * CONFIG.fx.krwPerJpy : v;
  const sym = CURRENCY === 'KRW' ? '₩' : '¥';

  const datasets = projects.map(p => {
    const raw = FIGURES.dailyByProject[p.id].map(d => d[spec.key]);
    let series = raw;
    if (COMPARE_MODE === 'cum') {
      let acc = 0;
      series = raw.map(v => (acc += v));
    }
    const isRiko = p.id === rikoId;
    const color = isRiko ? '#D85A30' : palette[ci++ % palette.length];
    return {
      label: p.short, data: series.map(conv),
      borderColor: color, backgroundColor: color,
      borderWidth: isRiko ? 3 : 2, pointRadius: isRiko ? 3 : 2,
      tension: 0.25, fill: false
    };
  });

  makeChart('ch-cmp-trend', {
    type: 'line',
    data: { labels, datasets },
    options: chartOptions({
      yTick: v => spec.money
        ? sym + Math.round(v).toLocaleString('ko-KR')
        : Math.round(v).toLocaleString('ko-KR') + spec.unit,
      tip: (l, v) => spec.money
        ? `${l}: ${sym}${Math.round(v).toLocaleString('ko-KR')}`
        : `${l}: ${Math.round(v).toLocaleString('ko-KR')}${spec.unit}`
    })
  });
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
