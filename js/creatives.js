/* creatives.js — 소재별 성과 카드와 대기 소재 목록을 그린다. */

function renderCreatives() {
  const list = REPORT.creatives;
  const total = REPORT.totals.spend;

  const best = list.reduce((a, b) => (calc.cpr(a) <= calc.cpr(b) ? a : b));

  /* 썸네일이 없는 광고(config.js에 아직 등록 안 된 새 소재)는 빈 자리로 표시한다.
     이미지가 깨진 아이콘으로 나오는 것보다 낫다. */
  const shot = (c, name) => c.asset
    ? `<img src="${esc(c.asset)}" alt="${esc(t('altPreview')(name))}" loading="lazy">`
    : `<span class="shot-empty" aria-hidden="true"></span>`;

  const cards = list.map((c, i) => {
    const share = c.spend / total * 100;
    const name = L(c.name);
    const shareLabel = share < 0.05 ? t('shareTiny') : fmt.pct(share, 1);
    const lead = c === best ? `<span class="tag tag-lead">${esc(t('tagBest'))}</span>` : '';

    return `
      <article class="creative${i === 0 ? ' creative-top' : ''}">
        <div class="creative-shot">
          ${shot(c, name)}
        </div>
        <div class="creative-body">
          <header class="creative-head">
            <h3>${esc(name)}</h3>
            <span class="tag">${esc(kindText(c))}</span>
            ${lead}
          </header>

          <div class="share">
            <div class="share-bar"><span style="width:${share.toFixed(2)}%"></span></div>
            <p class="share-text">${t('shareText')(fmt.moneyInline(c.spend), esc(shareLabel))}</p>
          </div>

          <dl class="creative-metrics">
            <div><dt>${esc(METRIC.impressions)}</dt><dd>${fmt.int(c.impressions)}</dd></div>
            <div><dt>${esc(METRIC.reach)}</dt><dd>${fmt.int(c.reach)}</dd></div>
            <div><dt>${esc(METRIC.clicks)}</dt><dd>${fmt.int(c.linkClicks)}</dd></div>
            <div><dt>${esc(METRIC.ctr)}</dt><dd>${fmt.pct(calc.ctr(c))}</dd></div>
            <div><dt>${esc(METRIC.result)}</dt><dd>${fmt.int(c.results)}</dd></div>
            <div class="hero-metric"><dt>${esc(METRIC.costPerResultShort)}</dt><dd>${fmt.money(Math.round(calc.cpr(c)))}</dd></div>
          </dl>
        </div>
      </article>`;
  }).join('');

  document.getElementById('creative-list').innerHTML = cards;

  /* ── 소재 비교 표 ───────────────────────────────── */
  const rows = list.map(c => `
    <tr>
      <th scope="row">${esc(L(c.name))}</th>
      <td>${esc(kindText(c))}</td>
      <td>${fmt.money(c.spend)}</td>
      <td>${fmt.int(c.impressions)}</td>
      <td>${fmt.int(c.linkClicks)}</td>
      <td>${fmt.pct(calc.ctr(c))}</td>
      <td>${fmt.money(Math.round(calc.cpc(c)))}</td>
      <td>${fmt.int(c.results)}</td>
      <td>${fmt.money(Math.round(calc.cpr(c)))}</td>
    </tr>`).join('');

  /* 소재별 Link Clicks의 합이 캠페인 합계와 어긋나면 그 사실을 각주로 밝힌다.
     숫자를 맞추려고 손대지 않는다. */
  const clickSum = list.reduce((a, c) => a + c.linkClicks, 0);
  const clickTotal = REPORT.totals.linkClicks;
  const note = clickSum !== clickTotal
    ? `<p class="tnote">${esc(t('creativeNote')(fmt.int(clickSum), fmt.int(clickTotal)))}</p>`
    : '';

  document.getElementById('creative-table').innerHTML = `
    <table>
      <thead>
        <tr>
          <th scope="col">${esc(t('thCreative'))}</th><th scope="col">${esc(t('thFormat'))}</th>
          <th scope="col">${esc(METRIC.spend)}</th><th scope="col">${esc(METRIC.impressions)}</th>
          <th scope="col">${esc(METRIC.clicks)}</th><th scope="col">${esc(METRIC.ctr)}</th>
          <th scope="col">${esc(METRIC.cpcShort)}</th><th scope="col">${esc(METRIC.resultShort)}</th>
          <th scope="col">${esc(METRIC.costPerResultShort)}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    ${note}`;

  /* ── 대기 소재 ──────────────────────────────────── */
  document.getElementById('standby-list').innerHTML = REPORT.standby.map(c => {
    const name = L(c.name);
    return `
      <li>
        ${shot(c, name)}
        <span class="sb-name">${esc(name)}</span>
        <span class="sb-kind">${esc(kindText(c))}</span>
      </li>`;
  }).join('');
}
