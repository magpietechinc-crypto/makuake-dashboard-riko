/* app.js — 언어 전환 버튼을 달고, 화면 전체를 다시 그린다.
   각 섹션을 그리는 일은 summary/trend/creatives.js가 맡는다. 여기는 지휘만 한다. */

(function () {

  /* 언어 버튼을 만든다. */
  function buildSwitch() {
    const bar = document.getElementById('langbar');
    bar.setAttribute('role', 'group');
    bar.innerHTML = LANGS.map(code =>
      `<button type="button" class="lang-btn" data-lang="${code}">${esc(LANG_NAMES[code])}</button>`
    ).join('');

    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      setLang(btn.dataset.lang);
      render();
    });
  }

  /* data-i18n 이 붙은 고정 문구를 채운다. */
  function fillStatic() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  }

  function fillGlossary() {
    document.getElementById('glossary').innerHTML = t('glossary').map(
      ([term, desc]) => `<li><strong>${esc(term)}</strong> — ${esc(desc)}</li>`
    ).join('');
  }

  function fillFootnotes() {
    const notes = ['footSource', 'footReach', 'footCurrency', 'footPurpose'];
    document.getElementById('footnotes').innerHTML =
      notes.map(k => `<p>${esc(t(k))}</p>`).join('');
  }

  function render() {
    document.documentElement.lang = t('htmlLang');
    document.title = t('docTitle');

    const bar = document.getElementById('langbar');
    bar.setAttribute('aria-label', t('langSwitchAria'));
    bar.querySelectorAll('[data-lang]').forEach(b => {
      const on = b.dataset.lang === LANG;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });

    fillStatic();
    fillGlossary();
    fillFootnotes();

    renderSummary();
    renderTrend();
    renderCreatives();
  }

  initLang();
  buildSwitch();
  render();
})();
