/* MELLOTEIN site interactions */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 모바일 메뉴 */
  var menu = document.getElementById('mmenu');
  var burger = document.querySelector('[data-open-menu]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    updateBar();
    if (open) { var c = menu.querySelector('[data-close-menu]'); if (c) c.focus(); }
    else if (burger) burger.focus();
  }
  if (burger) burger.addEventListener('click', function () { setMenu(true); });
  document.querySelectorAll('[data-close-menu]').forEach(function (el) {
    el.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  /* 모바일 하단 고정 CTA 바: 히어로를 지나면 보이고, 마무리 CTA에서 숨김 */
  var bar = document.getElementById('mbarwrap');
  var hero = document.querySelector('[data-hero]');
  var cta = document.querySelector('[data-cta]');
  var heroOut = false, ctaIn = false;
  function updateBar() {
    if (!bar) return;
    bar.hidden = !(heroOut && !ctaIn && (!menu || menu.hidden));
  }

  var countEl = document.querySelector('[data-count]');
  var numSec = document.querySelector('[data-num]');
  var counted = false;
  function countUp() {
    counted = true;
    var target = parseInt(countEl.getAttribute('data-count'), 10);
    if (reduce) { countEl.textContent = target; return; }
    var start = performance.now(), dur = 1200;
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      countEl.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    if (countEl && !reduce) countEl.textContent = '0';
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === hero) heroOut = !e.isIntersecting;
        if (e.target === cta) ctaIn = e.isIntersecting;
        if (e.target === numSec && e.isIntersecting && !counted && countEl) countUp();
      });
      updateBar();
    });
    [hero, cta, numSec].forEach(function (el) { if (el) io.observe(el); });
  }

  /* 메인: 블라인드 테스트 결과 공개 */
  var revealBtn = document.getElementById('revealBtn');
  if (revealBtn) {
    var dots = document.querySelectorAll('[data-dot]');
    var revealed = false;
    var MISS = 56;
    var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
    revealBtn.addEventListener('click', function () {
      revealed = !revealed;
      dots.forEach(function (d, k) {
        var on = revealed && k < MISS;
        d.style.transitionDelay = revealed ? (k * 18) + 'ms' : '0ms';
        d.style.backgroundColor = on ? '#E0AE52' : 'transparent';
        d.style.transform = 'scale(' + (on ? 1 : 0.86) + ')';
      });
      set('resultNum', revealed ? String(MISS) : '?');
      set('resultText', revealed ? '어느 쪽이 프로틴 케이크인지 맞히지 못했습니다.' : '버튼을 눌러 결과를 확인해 보세요.');
      set('missLabel', revealed ? '맞히지 못함 ' + MISS + '명' : '맞히지 못함');
      set('hitLabel', revealed ? '맞힘 ' + (100 - MISS) + '명' : '맞힘');
      revealBtn.textContent = revealed ? '다시 보기' : '블라인드 테스트 결과 보기';
      var grid = document.getElementById('dotGrid');
      if (grid) grid.setAttribute('aria-label', revealed ? '참여자 100명 중 ' + MISS + '명은 맞히지 못했고 ' + (100 - MISS) + '명은 맞혔습니다' : '참여자 100명, 결과 공개 전');
    });
  }

  /* 제품: 다음 맛 투표 */
  var flavorBtns = document.querySelectorAll('[data-flavor]');
  if (flavorBtns.length) {
    var voted = null;
    var msg = document.getElementById('voteMsg');
    var label = document.getElementById('voteLabel');
    flavorBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-flavor');
        voted = voted === key ? null : key;
        flavorBtns.forEach(function (b) {
          var on = b.getAttribute('data-flavor') === voted;
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.style.borderColor = on ? '#C24C00' : 'transparent';
          var tag = b.querySelector('[data-tag]');
          if (tag) {
            tag.textContent = on ? '내가 고른 맛' : '출시 후보';
            tag.style.background = on ? '#C24C00' : '#FCC144';
            tag.style.color = on ? '#FFFFFF' : '#3A2214';
          }
        });
        var name = voted ? document.querySelector('[data-flavor="' + voted + '"]').getAttribute('data-name') : '';
        if (msg) msg.textContent = voted ? name + '를 골랐어요. 출시 알림을 신청해 주세요.' : '말차와 초코 중 먹고 싶은 맛을 눌러주세요.';
        if (label) label.textContent = voted ? '이 맛 출시 알림 받기' : '출시 알림 받기';
      });
    });
  }
})();
