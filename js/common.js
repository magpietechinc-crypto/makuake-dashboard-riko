/* common.js — 숫자·날짜 표기와 통화 전환. 화면 로직은 넣지 않는다. */

/* 현재 표시 통화. 'JPY' 가 원본, 'KRW' 는 환산치. */
let CURRENCY = 'JPY';

function setCurrency(c) {
  CURRENCY = (c === 'KRW') ? 'KRW' : 'JPY';
  try { localStorage.setItem('riko-mk-currency', CURRENCY); } catch (e) { /* 무시 */ }
}

function initCurrency() {
  let saved = null;
  try { saved = localStorage.getItem('riko-mk-currency'); } catch (e) { /* 무시 */ }
  CURRENCY = (saved === 'KRW') ? 'KRW' : 'JPY';
}

const fmt = {
  int(n) { return Math.round(Number(n) || 0).toLocaleString('ko-KR'); },

  /* 음수는 기호 앞에 붙인다. ¥-100 이 아니라 -¥100 이 되도록. */
  _wrap(sym, n) {
    const neg = n < 0;
    return (neg ? '-' : '') + sym + Math.abs(n).toLocaleString('ko-KR');
  },

  /* 엔화 원본 금액을 현재 통화로 표시한다. */
  money(jpy) {
    const v = Number(jpy) || 0;
    return CURRENCY === 'KRW'
      ? this._wrap('₩', Math.round(v * CONFIG.fx.krwPerJpy))
      : this._wrap('¥', Math.round(v));
  },

  /* 작은 금액(단가 등)은 소수 한 자리까지 */
  moneyFine(jpy) {
    const v = Number(jpy) || 0;
    const conv = CURRENCY === 'KRW' ? v * CONFIG.fx.krwPerJpy : v;
    const sym = CURRENCY === 'KRW' ? '₩' : '¥';
    if (Math.abs(conv) >= 100) return this._wrap(sym, Math.round(conv));
    return (conv < 0 ? '-' : '') + sym + Math.abs(conv).toFixed(1);
  },

  /* 다른 통화를 괄호로 덧붙인다 */
  moneyAlt(jpy) {
    const v = Number(jpy) || 0;
    return CURRENCY === 'KRW'
      ? this._wrap('¥', Math.round(v))
      : this._wrap('₩', Math.round(v * CONFIG.fx.krwPerJpy));
  },

  pct(n, digits = 1) { return (Number(n) || 0).toFixed(digits) + '%'; },

  /* '2026-08-19' -> '8/19' */
  short(iso) { const [, m, d] = iso.split('-'); return Number(m) + '/' + Number(d); },

  /* '2026-08-19' -> '2026년 8월 19일' */
  full(iso) { const [y, m, d] = iso.split('-'); return `${y}년 ${Number(m)}월 ${Number(d)}일`; },

  /* '2026-08-19' -> '8월 19일' */
  md(iso) { const [, m, d] = iso.split('-'); return `${Number(m)}월 ${Number(d)}일`; }
};

/* 날짜 사이의 일수 (양끝 포함) */
function daysBetween(a, b) {
  const ms = new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z');
  return Math.round(ms / 86400000) + 1;
}

/* 오늘 날짜 (YYYY-MM-DD, 로컬 기준) */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
