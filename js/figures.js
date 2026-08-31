/* figures.js — 자동 생성 파일. 손으로 고치지 마세요.
   update-data.py 가 Meta에서 받아 이 파일을 통째로 다시 씁니다.
   여기 적힌 것은 Meta가 '센 값'뿐입니다.
   CTR·CPC·CPM 같은 나눗셈 값은 화면을 그릴 때 계산합니다(common.js의 calc).

   마지막 갱신: 2026-08-27
   클릭은 Link Clicks 기준입니다. */

const REPORT_FIGURES = {
  fetchedAt: '2026-08-27',

  period: {
    periodStart: '2026-08-19',
    periodEnd: '2026-08-25',
    days: 7,
    generatedAt: '2026-08-27'
  },

  totals: {"spend": 418651, "impressions": 81611, "reach": 67889, "linkClicks": 6329, "results": 4895},

  daily: [
    { date: "2026-08-19", spend: 71309, impressions: 14471, reach: 12956, linkClicks: 738, results: 641 },
    { date: "2026-08-20", spend: 61438, impressions: 12648, reach: 11693, linkClicks: 683, results: 601 },
    { date: "2026-08-21", spend: 70619, impressions: 13645, reach: 13114, linkClicks: 1256, results: 967 },
    { date: "2026-08-22", spend: 36711, impressions: 7368, reach: 7368, linkClicks: 745, results: 528 },
    { date: "2026-08-23", spend: 58282, impressions: 11907, reach: 11555, linkClicks: 1057, results: 745 },
    { date: "2026-08-24", spend: 53675, impressions: 10391, reach: 9930, linkClicks: 891, results: 666 },
    { date: "2026-08-25", spend: 66617, impressions: 11181, reach: 10670, linkClicks: 959, results: 747 }
  ],

  /* adName은 Meta 광고 관리자의 광고 이름 그대로. config.js가 이 이름으로 번역·썸네일을 찾는다. */
  creatives: [
    { adName: "영상_C", spend: 374558, impressions: 72869, reach: 61305, linkClicks: 5948, results: 4564 },
    { adName: "이미지_01", spend: 19262, impressions: 3742, reach: 3448, linkClicks: 169, results: 150 },
    { adName: "썸네일", spend: 14689, impressions: 2913, reach: 2759, linkClicks: 109, results: 102 },
    { adName: "영상_B", spend: 9974, impressions: 2051, reach: 1787, linkClicks: 102, results: 78 },
    { adName: "GIF_03", spend: 168, impressions: 36, reach: 34, linkClicks: 1, results: 1 }
  ],

  /* 등록은 되어 있으나 아직 노출이 배분되지 않은 광고. */
  standby: ["영상_A", "이미지_02", "GIF_01", "GIF_02"]
};
