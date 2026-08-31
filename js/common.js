/* common.js — 숫자·날짜 표기 공통 유틸. 화면 로직은 넣지 않는다.
   현재 언어(LANG)에 따라 날짜 표기가 달라진다. */

const fmt = {
  int(n) {
    return Number(n).toLocaleString(t('locale'));
  },

  won(n) {
    return '₩' + Number(n).toLocaleString(t('locale'));
  },

  /* 원화를 엔화 참고치로 환산한다. 100엔 미만은 소수 첫째 자리까지 보여준다. */
  jpy(krw) {
    const v = Number(krw) / REPORT.fx.krwPerJpy;
    return '¥' + (v >= 100
      ? Math.round(v).toLocaleString(t('locale'))
      : v.toFixed(1));
  },

  /* 읽는 언어의 통화를 크게, 다른 통화를 작게 붙인다.
     일본어 화면이면 엔화가 크고 원화가 작게, 한국어 화면이면 그 반대.
     엔화는 환산값이므로 어느 자리에 오든 항상 ≈ 를 붙인다. */
  primary(krw) {
    return LANG === 'ja' ? '≈ ' + this.jpy(krw) : this.won(krw);
  },

  altCurrency(krw) {
    return LANG === 'ja' ? this.won(krw) : '≈ ' + this.jpy(krw);
  },

  /* 두 통화를 위아래로 쌓는다. 표·카드처럼 세로 여유가 있는 곳에 쓴다.
     HTML을 돌려주므로 esc()로 감싸지 않는다(숫자만 들어가 안전하다). */
  money(krw) {
    return `${this.primary(krw)}<span class="fx">${this.altCurrency(krw)}</span>`;
  },

  /* 한 줄 안에 괄호로 붙인다. 설명 문구처럼 줄을 늘릴 수 없는 곳에 쓴다. */
  moneyInline(krw) {
    return `${this.primary(krw)} (${this.altCurrency(krw)})`;
  },

  pct(n, digits = 2) {
    return Number(n).toFixed(digits) + '%';
  },

  decimal(n, digits = 2) {
    return Number(n).toFixed(digits);
  },

  /* '2026-08-19' -> ko '8월 19일' / ja '8月19日' */
  dateKo(iso) {
    const [, m, d] = iso.split('-');
    return LANG === 'ja'
      ? `${Number(m)}月${Number(d)}日`
      : `${Number(m)}월 ${Number(d)}일`;
  },

  /* '2026-08-19' -> '8/19' (양쪽 동일) */
  dateShort(iso) {
    const [, m, d] = iso.split('-');
    return Number(m) + '/' + Number(d);
  },

  /* '2026-08-19' -> ko '2026년 8월 19일' / ja '2026年8月19日' */
  dateFull(iso) {
    const [y, m, d] = iso.split('-');
    return LANG === 'ja'
      ? `${y}年${Number(m)}月${Number(d)}日`
      : `${y}년 ${Number(m)}월 ${Number(d)}일`;
  }
};

/* 나눗셈으로 나오는 지표는 전부 여기서 계산한다.
   data.js에는 Meta가 준 '세는 값'만 두고, 파생값을 손으로 옮겨 적지 않는다.
   행(row)은 spend/impressions/reach/linkClicks/results를 가진 객체면 된다.
   캠페인 합계·일별·소재별 어디에든 같은 함수를 쓴다. */
const calc = {
  ctr(r)       { return r.impressions ? r.linkClicks / r.impressions * 100 : 0; },
  cpc(r)       { return r.linkClicks ? r.spend / r.linkClicks : 0; },
  cpm(r)       { return r.impressions ? r.spend / r.impressions * 1000 : 0; },
  frequency(r) { return r.reach ? r.impressions / r.reach : 0; },
  cpr(r)       { return r.results ? r.spend / r.results : 0; }
};

/* 문자열을 HTML에 넣기 전에 무해화한다. */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* 소재의 '형식 · 길이' 표기를 만든다. 길이가 없으면 형식만. */
function kindText(c) {
  const k = L(c.kind);
  const d = L(c.duration);
  return d ? `${k} · ${d}` : k;
}
