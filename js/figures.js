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

  /* 광고비 (엔).
     estimated: true 이면 화면에 '추정' 표시가 붙는다.
     Makuake 대행 광고비가 포함된 추정치이며, 매주 수요일 리포트 수령 후 확정치로 교체한다. */
  adSpend: {
    total: 148007,
    estimated: true,
    note: 'Makuake 대행 광고비 포함 추정치'
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

  /* 소재별 성과. Makuake 광고 리포트(주 1회 수요일)를 받으면 채운다. */
  creatives: [],

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
