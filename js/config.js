/* config.js — 사람이 손으로 관리하는 설정.
   자동 갱신 스크립트는 이 파일을 절대 건드리지 않는다.
   소재 이름 번역, 썸네일 파일, 환율, 리포트 제목이 여기 있다.

   숫자는 figures.js에 있다. 그쪽은 기계가 덮어쓴다. */

const REPORT_CONFIG = {
  meta: {
    client: 'RIKO',
    campaignLabel: { ko: 'RIKO Makuake Meta 광고 리포트', ja: 'RIKO Makuake Meta 広告レポート' },
    market: { ko: '일본', ja: '日本' },
    platform: 'Meta (Facebook · Instagram)',
    currencySymbol: '₩'
  },

  /* 환율. 광고 계정은 원화로 청구되므로 원화가 원본이고 엔화는 참고 환산치다.
     갱신할 때는 krwPerJpy와 asOf를 함께 바꾼다. */
  fx: {
    krwPerJpy: 8.69,
    source: { ko: 'Google 환율', ja: 'Google 為替レート' },
    asOf: { ko: '2026년 8월 26일 10:42 (KST)', ja: '2026年8月26日 10:42 (KST)' }
  },

  /* 소재 목록. 열쇠는 Meta 광고 관리자에 등록된 광고 이름 그대로다.
     Meta에서 이름을 바꾸면 여기 열쇠도 같이 바꿔야 한다.
     여기 없는 광고가 새로 들어오면 Meta 이름이 그대로 화면에 나오고 썸네일은 빈칸이 된다. */
  creativeCatalog: {
    '영상_C':    { name: { ko: '영상 C', ja: '動画 C' }, asset: 'assets/yeongsang_C.jpg',
                  kind: { ko: '동영상', ja: '動画' }, duration: { ko: '20초', ja: '20秒' } },
    '영상_B':    { name: { ko: '영상 B', ja: '動画 B' }, asset: 'assets/yeongsang_B.jpg',
                  kind: { ko: '동영상', ja: '動画' }, duration: { ko: '20초', ja: '20秒' } },
    '영상_A':    { name: { ko: '영상 A', ja: '動画 A' }, asset: 'assets/yeongsang_A.jpg',
                  kind: { ko: '동영상', ja: '動画' }, duration: { ko: '20초', ja: '20秒' } },
    '이미지_01': { name: { ko: '이미지 01', ja: '画像 01' }, asset: 'assets/image_01.jpg',
                  kind: { ko: '이미지', ja: '画像' }, duration: null },
    '이미지_02': { name: { ko: '이미지 02', ja: '画像 02' }, asset: 'assets/image_02.jpg',
                  kind: { ko: '이미지', ja: '画像' }, duration: null },
    '썸네일':    { name: { ko: '썸네일', ja: 'サムネイル' }, asset: 'assets/sseomneil.jpg',
                  kind: { ko: '이미지', ja: '画像' }, duration: null },
    'GIF_01':   { name: 'GIF 01', asset: 'assets/gif_01.jpg',
                  kind: 'GIF', duration: { ko: '3초', ja: '3秒' } },
    'GIF_02':   { name: 'GIF 02', asset: 'assets/gif_02.jpg',
                  kind: 'GIF', duration: { ko: '3초', ja: '3秒' } },
    'GIF_03':   { name: 'GIF 03', asset: 'assets/gif_03.jpg',
                  kind: 'GIF', duration: { ko: '4초', ja: '4秒' } }
  }
};
