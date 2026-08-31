/* app.js — 탭 전환, 통화 전환, 차트 공통 설정.
   각 탭의 내용은 tab-*.js 가 그린다. 여기는 지휘만 한다. */

/* ── 차트 공통 ───────────────────────────────── */
const CHARTS = {};

function makeChart(id, cfg) {
  const el = document.getElementById(id);
  if (!el || typeof Chart === 'undefined') return;
  if (CHARTS[id]) { CHARTS[id].destroy(); delete CHARTS[id]; }
  CHARTS[id] = new Chart(el, cfg);
}

function destroyCharts() {
  for (const k of Object.keys(CHARTS)) { CHARTS[k].destroy(); delete CHARTS[k]; }
}

function chartOptions(o) {
  const grid = { color: 'rgba(0,0,0,0.06)', drawBorder: false };
  const tick = { color: '#5F5E5A', font: { size: 11, family: getComputedStyle(document.body).fontFamily } };

  const scales = {
    x: { grid: { display: false }, ticks: tick },
    y: { beginAtZero: true, grid, ticks: { ...tick, callback: o.yTick || (v => v) } }
  };
  if (o.y1) {
    scales.y1 = {
      beginAtZero: true, position: 'right',
      grid: { display: false },
      ticks: { ...tick, callback: o.y1Tick || (v => v) }
    };
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: o.legend === false ? { display: false } : {
        position: 'bottom',
        labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true, padding: 16,
                  color: '#5F5E5A', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1A1A1A', padding: 10, cornerRadius: 8, displayColors: true,
        callbacks: {
          label: ctx => o.tip
            ? ' ' + o.tip(ctx.dataset.label, ctx.parsed.y)
            : ` ${ctx.dataset.label}: ${ctx.parsed.y}`
        }
      }
    },
    scales
  };
}

/* ── 탭 ──────────────────────────────────────── */
const TABS = [
  { id: 'overview',  name: '매출 현황',    render: renderOverview },
  { id: 'funding',   name: '본펀딩',       render: renderFunding },
  { id: 'ads',       name: '광고 성과',    render: renderAds },
  { id: 'creative',  name: '소재별 성과',  render: renderCreative },
  { id: 'compare',   name: '프로젝트 비교', render: renderCompare },
  { id: 'diagnosis', name: '진단·개선',    render: renderDiagnosis }
];

let ACTIVE = 'overview';

function renderHeader() {
  const p = CONFIG.project;
  document.getElementById('title').textContent = `[Makuake] ${p.fullName} 펀딩 대시보드`;
  document.getElementById('subtitle').innerHTML =
    `${fmt.full(p.startDate)} ~ ${fmt.full(p.endDate)} · ` +
    `데이터 기준 <strong>${fmt.full(FIGURES.dataThrough)}</strong> · ` +
    `갱신 ${fmt.full(FIGURES.updatedAt)}`;

  document.querySelectorAll('#currency button').forEach(b =>
    b.classList.toggle('on', b.dataset.cur === CURRENCY));

  document.getElementById('tabs').innerHTML = TABS.map(t =>
    `<button data-tab="${t.id}" class="${t.id === ACTIVE ? 'on' : ''}">${t.name}</button>`).join('');

  document.getElementById('footnotes').innerHTML = `
    <p>출처: Makuake 애널리틱스 및 공개 프로젝트 페이지. 대표 펀딩 금액은 Makuake 공개 표시액 기준입니다.</p>
    <p>적용 환율 1엔 = ${CONFIG.fx.krwPerJpy}원 (${esc(CONFIG.fx.asOf)}). 원화 금액은 참고용 환산치입니다.</p>
    <p>광고비는 Makuake 대행 광고비를 포함한 추정치이며, 주간 리포트 수령 후 확정치로 교체됩니다.</p>`;
}

function renderActive() {
  destroyCharts();
  const el = document.getElementById('panel');
  const tab = TABS.find(t => t.id === ACTIVE) || TABS[0];
  tab.render(el);
}

function boot() {
  initCurrency();
  renderHeader();
  renderActive();

  document.getElementById('tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    ACTIVE = b.dataset.tab;
    renderHeader();
    renderActive();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('currency').addEventListener('click', e => {
    const b = e.target.closest('[data-cur]');
    if (!b) return;
    setCurrency(b.dataset.cur);
    renderHeader();
    renderActive();
  });
}

document.addEventListener('DOMContentLoaded', boot);
