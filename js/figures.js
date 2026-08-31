/* figures.js — 실적 숫자. 갱신할 때 이 파일만 바꾼다.
   출처: Makuake 애널리틱스 (owner.makuake.com/projects/140182/analytics/)
   수집 방법: 시작일 고정 + 종료일 이동으로 누적값을 받아 앞뒤 차이로 하루치 산출.
   검산: 일별 세 열의 합이 애널리틱스 총계와 일치함을 확인했다. */

const FIGURES = {
  updatedAt: '2026-08-31',
  dataThrough: '2026-08-30',      // 이 날짜까지의 실적이 들어 있다

  /* Makuake 공개 페이지에 표시되는 확정 수치 */
  public: {
    amount: 666200,               // 応援購入総額 (엔)
    supporters: 18,               // サポーター (명)
    makuakeGoal: 100000           // Makuake 형식 목표액 (엔)
  },

  /* 애널리틱스 누적. 결제 대기분이 포함되어 공개 수치보다 1건(¥29,900) 많다. */
  analytics: {
    amount: 696100,
    orders: 19,
    pageViews: 15230
  },

  /* 광고비. 두 갈래로 나눠 담는다.
     meta   — 자체 집행한 Meta 광고. Meta 광고 관리자 실측값(원화 원본).
     agency — Makuake 대행 광고비. 리포트 전이라 추정치.
     두 값의 합이 원가표의 ¥148,007 과 맞는다. */
  adSpend: {
    meta:   { krw: 418651, note: 'Meta 광고 관리자 실측' },
    agency: { jpy: 99997, estimated: true, note: 'Makuake 대행 광고비 (리포트 수령 전 추정)' }
  },

  /* 자체 집행 Meta 광고. 2026-08-19 ~ 08-25 집행 후 중단(PAUSED).
     금액은 원화가 원본이며 화면에서 환율로 엔화 환산한다.
     클릭은 Link Clicks 기준(좋아요·공유 등 제외), 성과는 Landing Page Views 기준. */
  metaAds: {
    campaign: 'JP_MK_RIKO_본마케팅(0819)',
    status: 'PAUSED',
    runStart: '2026-08-19',
    runEnd: '2026-08-25',
    totals: { spendKrw: 418651, impressions: 81611, reach: 67889, linkClicks: 6329, lpv: 4895 },

    daily: [
      { date: '2026-08-19', spendKrw: 71309, impressions: 14471, reach: 12956, linkClicks: 738,  lpv: 641 },
      { date: '2026-08-20', spendKrw: 61438, impressions: 12648, reach: 11693, linkClicks: 683,  lpv: 601 },
      { date: '2026-08-21', spendKrw: 70619, impressions: 13645, reach: 13114, linkClicks: 1256, lpv: 967 },
      { date: '2026-08-22', spendKrw: 36711, impressions: 7368,  reach: 7368,  linkClicks: 745,  lpv: 528 },
      { date: '2026-08-23', spendKrw: 58282, impressions: 11907, reach: 11555, linkClicks: 1057, lpv: 745 },
      { date: '2026-08-24', spendKrw: 53675, impressions: 10391, reach: 9930,  linkClicks: 891,  lpv: 666 },
      { date: '2026-08-25', spendKrw: 66617, impressions: 11181, reach: 10670, linkClicks: 959,  lpv: 747 }
    ],

    /* 노출이 발생한 소재. 지출 많은 순. */
    creatives: [
      { name: '영상 C',    kind: '동영상', duration: '20초', spendKrw: 374558, impressions: 72869, reach: 61305, linkClicks: 5948, lpv: 4564 },
      { name: '이미지 01', kind: '이미지', duration: null,   spendKrw: 19262,  impressions: 3742,  reach: 3448,  linkClicks: 169,  lpv: 150 },
      { name: '썸네일',    kind: '이미지', duration: null,   spendKrw: 14689,  impressions: 2913,  reach: 2759,  linkClicks: 109,  lpv: 102 },
      { name: '영상 B',    kind: '동영상', duration: '20초', spendKrw: 9974,   impressions: 2051,  reach: 1787,  linkClicks: 102,  lpv: 78 },
      { name: 'GIF 03',   kind: 'GIF',   duration: '4초',  spendKrw: 168,    impressions: 36,    reach: 34,    linkClicks: 1,    lpv: 1 }
    ],

    /* 등록만 되고 한 번도 노출되지 않은 소재 */
    standby: [
      { name: '영상 A',    kind: '동영상', duration: '20초' },
      { name: '이미지 02', kind: '이미지', duration: null },
      { name: 'GIF 01',   kind: 'GIF',   duration: '3초' },
      { name: 'GIF 02',   kind: 'GIF',   duration: '3초' }
    ]
  },

  /* 일별 실적. 누적값의 차이로 산출했다. */
  daily: [
    { date: '2026-08-19', amount: 121700, pageViews: 2721, orders: 3 },
    { date: '2026-08-20', amount: 29900,  pageViews: 1610, orders: 1 },
    { date: '2026-08-21', amount: 29900,  pageViews: 1509, orders: 1 },
    { date: '2026-08-22', amount: 89700,  pageViews: 1713, orders: 3 },
    { date: '2026-08-23', amount: 29900,  pageViews: 1252, orders: 1 },
    { date: '2026-08-24', amount: 29900,  pageViews: 1361, orders: 1 },
    { date: '2026-08-25', amount: 215600, pageViews: 1433, orders: 4 },
    { date: '2026-08-26', amount: 0,      pageViews: 1643, orders: 0 },
    { date: '2026-08-27', amount: 59800,  pageViews: 801,  orders: 2 },
    { date: '2026-08-28', amount: 29900,  pageViews: 461,  orders: 1 },
    { date: '2026-08-29', amount: 0,      pageViews: 450,  orders: 0 },
    { date: '2026-08-30', amount: 59800,  pageViews: 276,  orders: 2 }
  ],

  /* Makuake 대행 광고의 소재별 성과. 주간 리포트를 받으면 여기에 채운다.
     비어 있으면 소재별 성과 탭에 자체 Meta 광고 결과만 나온다. */
  agencyCreatives: [],

  /* 비교용 과거 프로젝트. 각 프로젝트 애널리틱스의 전체 기간 누적값. */
  compare: [
    { id: '140182', start: '2026-08-19', end: '2026-09-15', amount: 696100,   pageViews: 15230,  orders: 19,   ongoing: true },
    { id: '136500', start: '2026-04-14', end: '2026-05-30', amount: 921700,   pageViews: 13847,  orders: 23 },
    { id: '126886', start: '2025-05-29', end: '2025-07-30', amount: 24356200, pageViews: 129988, orders: 1086 },
    { id: '123556', start: '2025-02-12', end: '2025-03-28', amount: 5100400,  pageViews: 27571,  orders: 316 },
    { id: '121371', start: '2024-11-13', end: '2024-12-18', amount: 1132660,  pageViews: 11393,  orders: 191 },
    { id: '115428', start: '2024-05-16', end: '2024-06-28', amount: 12024600, pageViews: 40514,  orders: 256 },
    { id: '108570', start: '2023-11-27', end: '2024-01-05', amount: 10647640, pageViews: 49248,  orders: 1676 },
    { id: '63609',  start: '2021-01-06', end: '2021-02-27', amount: 16898300, pageViews: 74051,  orders: 1126 }
  ]
};
