/* data.js — config.js(사람이 쓴 설정)와 figures.js(기계가 쓴 숫자)를 하나로 합친다.
   화면을 그리는 파일들은 여기서 나온 REPORT만 본다.

   Meta에 새 광고가 생겨 config.js에 아직 없으면, Meta 광고 이름을 그대로 쓰고
   썸네일은 비운다. 화면이 깨지는 대신 그 사실이 눈에 보이게 한다. */

const REPORT = (() => {
  const cfg = REPORT_CONFIG;
  const fig = REPORT_FIGURES;

  const unknown = [];

  function label(adName) {
    const hit = cfg.creativeCatalog[adName];
    if (hit) return hit;
    unknown.push(adName);
    return { name: adName, asset: null, kind: { ko: '미분류', ja: '未分類' }, duration: null };
  }

  const report = {
    meta: { ...cfg.meta, ...fig.period },
    fx: cfg.fx,
    fetchedAt: fig.fetchedAt,
    totals: fig.totals,
    daily: fig.daily,
    creatives: fig.creatives.map(c => ({ ...label(c.adName), ...c })),
    standby: fig.standby.map(adName => ({ ...label(adName), adName }))
  };

  if (unknown.length) {
    console.warn('config.js에 등록되지 않은 광고가 있습니다. 번역과 썸네일을 추가하세요:', unknown);
  }

  return report;
})();
