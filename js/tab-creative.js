/* tab-creative.js — '소재별 성과' 탭.
   Makuake 광고 대행 리포트(주 1회, 수요일)를 받으면 FIGURES.creatives 를 채운다.
   비어 있으면 무엇을 기다리는지 화면에 그대로 알린다. */

function renderCreative(el) {
  const list = FIGURES.creatives || [];

  if (!list.length) {
    el.innerHTML = `
      <div class="section">
        <div class="empty">
          <strong>아직 광고 리포트가 없습니다</strong>
          Makuake 광고 대행 리포트는 매주 수요일에 옵니다.<br>
          리포트를 받아 폴더에 넣어주시면 이 화면에 소재별 성과가 채워집니다.
          <div style="margin-top:18px; font-size:12px; color:var(--text-tertiary)">
            들어갈 항목: 소재별 광고비 · 노출 · 클릭 · CTR · CPC · 전환수 · CPA · ROAS
          </div>
        </div>
      </div>`;
    return;
  }

  const total = list.reduce((s, c) => s + (c.spend || 0), 0);
  const best = list.reduce((a, b) => ((b.ctr || 0) > (a.ctr || 0) ? b : a));

  const rows = list.map(c => {
    const share = total ? (c.spend / total) * 100 : 0;
    return `<tr class="${c === best ? 'me' : ''}">
      <td>${esc(c.name || '-')}</td>
      <td>${fmt.money(c.spend || 0)}</td>
      <td>${fmt.pct(share)}</td>
      <td>${fmt.int(c.impressions || 0)}</td>
      <td>${fmt.int(c.clicks || 0)}</td>
      <td>${fmt.pct(c.ctr || 0, 2)}</td>
      <td>${fmt.moneyFine(c.cpc || 0)}</td>
      <td>${fmt.int(c.conversions || 0)}</td>
      <td>${c.conversions ? fmt.money(c.spend / c.conversions) : '-'}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="section">
      <h2>소재별 성과</h2>
      <p class="hint">광고비가 많이 투입된 순서입니다. CTR이 가장 높은 소재를 강조했습니다.</p>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>소재</th><th>광고비</th><th>비중</th><th>노출</th><th>클릭</th>
            <th>CTR</th><th>CPC</th><th>전환</th><th>CPA</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}
