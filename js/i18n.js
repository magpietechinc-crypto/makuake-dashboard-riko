/* i18n.js — 한국어/일본어 문구 사전과 언어 상태.
   화면에 나가는 글자는 전부 이 파일에 있다. 문구 수정은 여기서만 한다.
   수치는 data.js, 화면 구성은 summary/trend/creatives.js가 담당한다.

   지표 이름(Impressions, Reach, CTR ...)은 두 언어 모두 영문으로 통일한다.
   설명 문장과 섹션 제목은 각 언어로 쓴다. */

const LANGS = ['ja', 'ko'];
const LANG_NAMES = { ko: '한국어', ja: '日本語' };
const DEFAULT_LANG = 'ja';          // 받는 쪽이 일본 클라이언트이므로 일본어로 연다.

let LANG = DEFAULT_LANG;

/* 두 언어가 함께 쓰는 지표 이름. 한 곳에서만 고친다. */
const METRIC = {
  spend: 'Spend',
  impressions: 'Impressions',
  reach: 'Reach',
  clicks: 'Link Clicks',
  ctr: 'Link CTR',
  cpc: 'Cost per Link Click',
  cpcShort: 'Cost / Click',
  cpm: 'CPM',
  frequency: 'Frequency',
  result: 'Landing Page Views',
  resultShort: 'LPV',
  costPerResult: 'Cost per Landing Page View',
  costPerResultShort: 'Cost / LPV'
};

const I18N = {
  ko: {
    docTitle: 'RIKO Makuake Meta 광고 리포트',
    htmlLang: 'ko',
    locale: 'ko-KR',

    /* 표지 */
    factPeriod: '집행 기간',
    factAsOf: '데이터 기준',
    daysSuffix: n => `(${n}일)`,

    /* 섹션 제목 */
    secTotalTitle: '캠페인 전체 성과',
    secTotalDesc: `집행 기간 전체를 합산한 수치입니다. 이 캠페인의 목표는 랜딩 페이지로 사람을 보내는 것이므로, 최종 성과는 ${METRIC.result}와 그 한 건을 만드는 데 든 비용으로 판단합니다.`,
    secTrendTitle: '일별 추이',
    secTrendDesc: `막대는 그날의 ${METRIC.result}, 선은 ${METRIC.ctr}입니다. 초반 이틀의 학습 구간을 지나면서 ${METRIC.ctr}이 5%대에서 8~10%대로 올라섰고 이후 그 수준을 유지하고 있습니다.`,
    secCreativeTitle: '소재별 성과',
    secCreativeDesc: '광고비가 많이 투입된 순서입니다. 예산은 성과가 좋은 소재로 자동 재배분되므로, 광고비 비중 자체가 그 소재의 성적표이기도 합니다.',
    secStandbyTitle: '대기 중인 소재',
    secStandbyDesc: '함께 등록되어 있으나 아직 노출이 배분되지 않은 소재입니다. 상위 소재의 성과가 꺾이면 순차적으로 투입됩니다.',
    secGlossaryTitle: '지표 읽는 법',
    secGlossaryDesc: '이 리포트에 나오는 용어를 짧게 정리했습니다.',

    /* 핵심 지표 */
    kpiSpend: `Total ${METRIC.spend}`,
    kpiSpendNote: v => `일평균 ${v}`,
    kpiImpressionsNote: '광고가 화면에 표시된 횟수',
    kpiReachNote: v => `1인당 평균 ${v}회 노출`,
    kpiClicksNote: v => `${METRIC.ctr} ${v}`,
    kpiResultsNote: v => `클릭 중 ${v} 도달`,
    kpiCprNote: v => `${METRIC.cpc} ${v}`,
    freqUnit: v => `${v}회`,

    /* 추이 */
    legendNote: '막대 아래 금액은 그날의 광고비입니다.',
    chartAria: r => `일별 ${r} 및 ${METRIC.ctr} 추이`,
    thDate: 'Date',
    thTotal: '합계',
    trendNote: `${METRIC.reach} 합계는 날짜별 합이 아니라 기간 전체에서 중복을 제거한 값입니다. 따라서 위 칸의 합보다 작습니다.`,

    /* 소재 */
    tagBest: '가장 효율이 좋은 소재',
    shareText: (money, pct) => `광고비 ${money} <span class="muted">· 전체의 ${pct}</span>`,
    shareTiny: '0.1% 미만',
    thCreative: '소재',
    thFormat: '형식',
    altPreview: n => `${n} 소재 미리보기`,

    /* 용어 — 표제어는 영문, 설명은 한국어 */
    glossary: [
      [METRIC.impressions, '광고가 화면에 표시된 횟수입니다. 같은 사람이 여러 번 보면 그만큼 늘어납니다.'],
      [METRIC.reach, '광고를 한 번이라도 본 계정 수입니다. 중복을 제외한 값이라 Impressions보다 작습니다.'],
      [METRIC.frequency, '한 계정이 평균 몇 번 봤는지입니다. Reach 대비 Impressions의 비율입니다.'],
      [METRIC.clicks, '광고 안의 링크를 눌러 목적지로 이동한 횟수입니다. 좋아요·댓글·공유·프로필 클릭은 포함하지 않습니다.'],
      [METRIC.ctr, 'Impressions 100번당 Link Clicks가 몇 번 일어났는지입니다. 소재가 얼마나 눈길을 끄는지 보여줍니다.'],
      [METRIC.result, '클릭한 사람이 실제로 페이지를 열어 화면이 뜬 것까지 확인된 수입니다. 클릭했다가 로딩 중 이탈한 경우는 빠집니다.'],
      [METRIC.costPerResult, 'Landing Page Views 한 건을 만드는 데 든 광고비입니다. 낮을수록 효율이 좋습니다.']
    ],

    creativeNote: (sum, total) => `소재별 ${METRIC.clicks}의 합(${sum})은 캠페인 합계(${total})와 차이가 있습니다. Meta가 소재 단위로 집계할 때 생기는 오차로, 임의로 맞추지 않고 원본 수치를 그대로 싣고 있습니다.`,

    /* 각주 */
    fxNote: (rate, src, asOf) => `적용 환율 1엔 = ${rate}원 · 출처 ${src} · ${asOf} 기준`,
    footSource: '출처: Meta 광고 관리자. 수치는 Meta의 기본 기여 기간(어트리뷰션) 기준이며, 집계 시점에 따라 소폭 변동될 수 있습니다.',
    footReach: `${METRIC.reach}와 ${METRIC.frequency}는 기간 전체에서 중복을 제거해 산출되므로 날짜별 값의 단순 합과 일치하지 않습니다.`,
    footCurrency: '청구 금액의 원본은 한국 원(KRW)입니다. 엔화는 아래 환율로 환산한 참고치이며, 환율 변동에 따라 실제 금액과 차이가 있을 수 있습니다.',
    footPurpose: '본 문서는 위 캠페인의 성과 공유를 위해 작성되었습니다.',

    langSwitchAria: '언어 선택'
  },

  ja: {
    docTitle: 'RIKO Makuake Meta 広告レポート',
    htmlLang: 'ja',
    locale: 'ja-JP',

    factPeriod: '配信期間',
    factAsOf: 'データ基準日',
    daysSuffix: n => `(${n}日間)`,

    secTotalTitle: 'キャンペーン全体の成果',
    secTotalDesc: `配信期間全体を合算した数値です。本キャンペーンの目的はランディングページへの誘導のため、最終的な成果は ${METRIC.result} と、その1件あたりにかかった費用で判断します。`,
    secTrendTitle: '日次推移',
    secTrendDesc: `棒グラフはその日の ${METRIC.result}、折れ線は ${METRIC.ctr} です。開始から2日間の学習期間を過ぎた後、${METRIC.ctr} は5%台から8〜10%台へ上昇し、その水準を維持しています。`,
    secCreativeTitle: 'クリエイティブ別の成果',
    secCreativeDesc: '広告費用の多い順に並べています。予算は成果の良いクリエイティブへ自動的に再配分されるため、広告費用の比率そのものがそのクリエイティブの評価でもあります。',
    secStandbyTitle: '配信待機中のクリエイティブ',
    secStandbyDesc: '登録済みですが、まだ配信が配分されていないクリエイティブです。上位クリエイティブの成果が落ちた際に順次投入されます。',
    secGlossaryTitle: '指標の見方',
    secGlossaryDesc: '本レポートに登場する用語を簡単にまとめました。',

    kpiSpend: `Total ${METRIC.spend}`,
    kpiSpendNote: v => `1日平均 ${v}`,
    kpiImpressionsNote: '広告が画面に表示された回数',
    kpiReachNote: v => `1アカウントあたり平均 ${v}回表示`,
    kpiClicksNote: v => `${METRIC.ctr} ${v}`,
    kpiResultsNote: v => `クリックのうち ${v} が到達`,
    kpiCprNote: v => `${METRIC.cpc} ${v}`,
    freqUnit: v => `${v}回`,

    legendNote: '棒グラフの下の金額は、その日の広告費用です。',
    chartAria: r => `日次の${r}と${METRIC.ctr}の推移`,
    thDate: 'Date',
    thTotal: '合計',
    trendNote: `${METRIC.reach} の合計は日別の単純合計ではなく、期間全体で重複を除いた値です。そのため各日の合計より小さくなります。`,

    tagBest: '最も効率の良いクリエイティブ',
    shareText: (money, pct) => `広告費用 ${money} <span class="muted">・全体の ${pct}</span>`,
    shareTiny: '0.1%未満',
    thCreative: 'クリエイティブ',
    thFormat: '形式',
    altPreview: n => `${n} のプレビュー`,

    glossary: [
      [METRIC.impressions, '広告が画面に表示された回数です。同じ方が複数回見た場合は、その分だけ増えます。'],
      [METRIC.reach, '広告を一度でも見たアカウント数です。重複を除いた値のため、Impressions より小さくなります。'],
      [METRIC.frequency, '1アカウントが平均して何回見たかを示します。Impressions を Reach で割った値です。'],
      [METRIC.clicks, '広告内のリンクをクリックして遷移先へ移動した回数です。いいね・コメント・シェア・プロフィールクリックは含みません。'],
      [METRIC.ctr, '100回の表示に対して Link Clicks が何回発生したかです。クリエイティブがどれだけ目を引くかを示します。'],
      [METRIC.result, 'クリックした方が実際にページを開き、表示されたことまで確認できた数です。読み込み中に離脱した場合は含まれません。'],
      [METRIC.costPerResult, 'Landing Page Views 1件あたりにかかった広告費用です。低いほど効率が良いことを示します。']
    ],

    creativeNote: (sum, total) => `クリエイティブ別 ${METRIC.clicks} の合計（${sum}）はキャンペーン合計（${total}）と差があります。Meta がクリエイティブ単位で集計する際に生じる誤差のため、調整せず原数値をそのまま掲載しています。`,

    fxNote: (rate, src, asOf) => `適用為替レート 1円 = ${rate}ウォン ・出典 ${src} ・${asOf} 時点`,
    footSource: '出典: Meta 広告マネージャ。数値は Meta の既定のアトリビューション期間に基づいており、集計時点により若干変動する場合があります。',
    footReach: `${METRIC.reach} と ${METRIC.frequency} は期間全体で重複を除いて算出されるため、日別の値の単純合計とは一致しません。`,
    footCurrency: '請求金額の原本は韓国ウォン（KRW）です。円建て金額は下記レートで換算した参考値であり、為替変動により実際の金額と差が生じる場合があります。',
    footPurpose: '本書は上記キャンペーンの成果共有のために作成されました。',

    langSwitchAria: '言語選択'
  }
};

function t(key) {
  return I18N[LANG][key];
}

/* data.js의 {ko:'', ja:''} 형태 값에서 현재 언어를 꺼낸다.
   문자열이 그대로 오면(양쪽 공통 문구) 그대로 돌려준다. */
function L(v) {
  if (v === null || v === undefined) return v;
  return typeof v === 'object' ? v[LANG] : v;
}

function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  LANG = lang;
  try { localStorage.setItem('riko-report-lang', lang); } catch (e) { /* file:// 등에서 무시 */ }
}

/* 언어 결정 순서
   1) 주소 끝의 #ko / #ja  — 특정 언어로 바로 열거나 PDF로 뽑을 때 쓴다
   2) 지난번에 고른 언어
   3) 기본값(일본어) */
function initLang() {
  const fromHash = (location.hash || '').replace('#', '').toLowerCase();
  if (LANGS.includes(fromHash)) { LANG = fromHash; return; }

  let saved = null;
  try { saved = localStorage.getItem('riko-report-lang'); } catch (e) { /* 무시 */ }
  LANG = LANGS.includes(saved) ? saved : DEFAULT_LANG;
}
