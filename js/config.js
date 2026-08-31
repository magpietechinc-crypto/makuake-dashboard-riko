/* config.js — 사람이 손으로 관리하는 설정.
   원가 파라미터, 목표, 환율, 프로젝트 정보가 여기 있다.
   숫자(실적)는 figures.js 에 있다. 갱신할 때 그쪽만 바꾼다. */

const CONFIG = {
  project: {
    name: 'RIKO',
    fullName: '자동 습식 급식기 RIKO',
    platform: 'Makuake',
    makuakeId: '140182',
    url: 'https://www.makuake.com/project/riko/',
    startDate: '2026-08-19',
    endDate: '2026-09-15'      // 총 28일
  },

  /* 원가 구조. 사용자 제공 표 기준.
     비율 항목은 모두 '수입(펀딩액)'에 곱한다. */
  cost: {
    mcPerUnit: 15559,          // 제조원가 (엔/개)
    feeRate: 0.22,             // Makuake 수수료
    vatRate: 0.036,            // 부가세
    lossRate: 0.01,            // LOSS
    coupon: 0,                 // 쿠폰
    sgaTotal: 300000           // 판관비 총액(엔). 프로젝트 일수로 나눠 하루치 산정
  },

  /* 목표. 두 가지를 함께 보여준다.
     - 손익분기점: 누적 비용을 회수하는 데 필요한 매출 (자동 계산, 광고비가 늘면 함께 올라감)
     - 고정 목표: 사람이 정한 숫자 */
  goal: {
    fixed: 2000000             // 엔
  },

  /* 환율. 원화로 집행한 광고비를 엔화로 바꿀 때와, 화면 통화 전환에 쓴다.
     사용자 원가표와 같은 값(8.72 원/엔)을 쓴다. */
  fx: {
    krwPerJpy: 8.72,
    asOf: '2026년 8월 (원가표 기준)'
  },

  /* 예상 최종 펀딩액을 추정할 때 쓸 최근 일수 */
  forecastWindowDays: 7,

  /* 비교 프로젝트 표시 이름. Makuake 프로젝트 ID가 열쇠다. */
  compareLabels: {
    '140182': { short: 'RIKO', full: '자동 습식 급식기 RIKO' },
    '136500': { short: 'ROAD MATE', full: '만능 카용품 ROAD MATE' },
    '126886': { short: 'AirCannon', full: '강력 에어블로워 AirCannon' },
    '123556': { short: 'VADER', full: '레이저 레벨기 VADER & VADER 3D' },
    '121371': { short: '미니 드라이버', full: 'Magpie 3.6V 미니 전동드라이버' },
    '115428': { short: 'Maker PRO', full: '멀티 공구세트 Maker PRO' },
    '108570': { short: 'H500', full: '하이브리드 드라이버 H500' },
    '63609':  { short: 'VH-80 SE', full: '레이저 measure VH-80 SE' }
  }
};
