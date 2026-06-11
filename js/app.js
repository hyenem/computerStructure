/* ============================================================
   app.js — 렌더링 · 네비게이션 · 물리적 줌인 연출
   ============================================================ */
(function () {
  'use strict';

  // ── DOM 참조 ──────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const breadcrumbEl = $('breadcrumb');
  const stageFrame   = $('stageFrame');
  const stageHint    = $('stageHint');
  const panelScroll  = $('panelScroll');
  const gaugeMarker  = $('gaugeMarker');
  const gaugeReadout = $('gaugeReadout');
  const depthTag     = $('depthTag');
  const btnBack      = $('btnBack');
  const btnHome      = $('btnHome');
  const btnSettings  = $('btnSettings');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 상태: 루트→현재까지의 경로 ────────────────────────────
  let path = [ROOT];
  let locked = false; // 전환 중 중복 클릭 방지

  const current = () => NODES[path[path.length - 1]];

  // ── 깊이 게이지: 로그축 위치 계산 ─────────────────────────
  function gaugePercent(scaleM) {
    const lo = Math.log10(SCALE_MIN);
    const hi = Math.log10(SCALE_MAX);
    const t = (Math.log10(scaleM) - hi) / (lo - hi); // 0(큼)~1(작음)
    return Math.max(0, Math.min(1, t)) * 100;
  }

  // 게이지 눈금(실제 크기 레퍼런스) — 물리적 줌인 무드
  function buildGaugeTicks() {
    const track = $('gaugeTrack');
    const marker = $('gaugeMarker');
    const TICKS = [
      ['10cm', 0.1, 1], ['1cm', 0.01, 1], ['1mm', 1e-3, 1],
      ['100µm', 1e-4, 0], ['1µm', 1e-6, 1], ['10nm', 1e-8, 0],
      ['1nm', 1e-9, 1], ['1Å', 1e-10, 1],
    ];
    TICKS.forEach(([label, m, major]) => {
      const top = gaugePercent(m);
      const tick = document.createElement('div');
      tick.className = 'gauge__tick' + (major ? ' gauge__tick--major' : '');
      tick.style.top = top + '%';
      track.insertBefore(tick, marker);
      if (major) {
        const lab = document.createElement('div');
        lab.className = 'gauge__ticklabel';
        lab.style.top = top + '%';
        lab.textContent = label;
        track.insertBefore(lab, marker);
      }
    });
  }

  // ── 렌더: 빵부스러기 ──────────────────────────────────────
  function renderBreadcrumb() {
    breadcrumbEl.innerHTML = '';
    path.forEach((id, i) => {
      const node = NODES[id];
      const crumb = document.createElement('button');
      crumb.className = 'crumb' + (i === path.length - 1 ? ' crumb--current' : '');
      crumb.innerHTML = `<span class="crumb__l">L${node.depth}</span> ${node.title}`;
      crumb.addEventListener('click', () => {
        if (i < path.length - 1) jumpTo(i);
      });
      breadcrumbEl.appendChild(crumb);
      if (i < path.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'crumb-sep';
        sep.textContent = '›';
        breadcrumbEl.appendChild(sep);
      }
    });
  }

  // ── 렌더: 스테이지(현재 모듈 = SVG 도식 + 하위 핫스팟) ─────
  function renderStage() {
    const node = current();
    const id = path[path.length - 1];
    const kids = node.kids || [];
    const scene = (window.SCENES || {})[id];

    const inner = scene ? scene : cardFallback(node, kids);

    stageFrame.innerHTML = `
      <div class="board">
        <div class="board__head">
          <span class="board__glyph">${node.glyph || '◆'}</span>
          <span class="board__title">${node.title}</span>
          <span class="board__tag">L${node.depth} · ${node.scale}</span>
        </div>
        <div class="board__stage">${inner}</div>
      </div>`;

    // 핫스팟(SVG) / 카드(폴백) 클릭 → 줌인
    stageFrame.querySelectorAll('[data-kid]').forEach((el) => {
      const kid = el.dataset.kid;
      const go = () => zoomInto(kid, el);
      el.addEventListener('click', go);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });

    const hotCount = stageFrame.querySelectorAll('[data-kid]').length;
    stageHint.textContent = hotCount
      ? `▸ 들어갈 수 있는 부품 ${hotCount}곳 — 클릭해 더 깊이`
      : '● 이 줄기의 가장 깊은 곳입니다 — 위로 올라가 다른 길을 탐험하세요';
  }

  // 장면(SVG)이 없는 노드용 카드 폴백
  function cardFallback(node, kids) {
    if (!kids.length) {
      return `<div class="board__grid board__grid--empty">${terminalCard()}</div>`;
    }
    const cards = kids.map((kid) => {
      const k = NODES[kid];
      return `<button class="card" data-kid="${kid}">
          <span class="card__glyph">${k.glyph || '◆'}</span>
          <span class="card__title">${k.title}</span>
          <span class="card__en">${k.en}</span>
          <span class="card__scale">${k.scale}</span>
          <span class="card__go">안으로 ↘</span>
        </button>`;
    }).join('');
    return `<div class="board__grid">${cards}</div>`;
  }

  function terminalCard() {
    return `<div class="card card--terminal">
        <span class="card__glyph">⌖</span>
        <span class="card__title">더 들어갈 곳이 없습니다</span>
        <span class="card__en">end of this branch</span>
      </div>`;
  }

  // ── 렌더: 설명 패널 + 인라인 미니랩 ───────────────────────
  function renderPanel() {
    const node = current();
    const body = (node.body || []).map((p) => `<p>${p}</p>`).join('');
    panelScroll.innerHTML = `
      <div class="info">
        <div class="info__depth">L${node.depth} / L8</div>
        <h1 class="info__title">${node.title}</h1>
        <div class="info__en">${node.en}</div>
        <p class="info__tag">${node.tagline || ''}</p>
        <div class="info__body">${body}</div>
        ${node.lab ? `
          <div class="lab-wrap">
            <div class="lab-wrap__head"><span class="lab-wrap__icon">🧪</span> 직접 해보기 · MINI&nbsp;LAB</div>
            <div class="lab-mount" id="labMount"></div>
          </div>` : ''}
      </div>`;

    if (node.lab && LABS[node.lab]) {
      LABS[node.lab]($('labMount'));
    }
    panelScroll.scrollTop = 0;
  }

  // ── 탐험 진행률 (방문 노드 기록) ──────────────────────────
  const TOTAL = Object.keys(NODES).length;
  let visited = new Set([ROOT]);
  try {
    const saved = JSON.parse(localStorage.getItem('cs_visited') || '[]');
    saved.forEach((id) => { if (NODES[id]) visited.add(id); });
  } catch (e) {}
  function markVisited(id) {
    if (visited.has(id)) return;
    visited.add(id);
    try { localStorage.setItem('cs_visited', JSON.stringify([...visited])); } catch (e) {}
  }

  // ── URL 해시 ↔ 경로 동기화 (새로고침·공유·뒤로가기) ───────
  function pathFromHash() {
    const ids = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const p = [ROOT];
    for (const id of ids) {
      const parent = NODES[p[p.length - 1]];
      if (parent && (parent.kids || []).includes(id)) p.push(id);
      else break; // 유효하지 않으면 거기까지만
    }
    return p;
  }
  let firstSync = true;
  function syncHash() {
    const want = path.length > 1 ? '#/' + path.slice(1).join('/') : '#/';
    const wasFirst = firstSync;
    firstSync = false;
    if (location.hash === want) return;
    // 첫 렌더는 교체, 이후 탐험은 히스토리에 쌓아 브라우저 뒤로가기 지원
    if (wasFirst) history.replaceState(null, '', want);
    else history.pushState(null, '', want);
  }

  // ── 렌더: 게이지 / 깊이태그 / 뒤로버튼 ────────────────────
  function renderChrome() {
    const node = current();
    gaugeMarker.style.top = gaugePercent(node.scaleM) + '%';
    gaugeReadout.textContent = node.scale;
    depthTag.textContent = `L${node.depth} · 탐험 ${visited.size}/${TOTAL}`;
    btnBack.disabled = path.length <= 1;
  }

  // ── 전체 렌더 + 진입/복귀 애니메이션 ──────────────────────
  // mode: false(없음) | 'in'(안으로) | 'out'(위로 빠져나옴)
  function render(mode) {
    if (mode === true) mode = 'in';
    markVisited(path[path.length - 1]);
    syncHash();
    renderBreadcrumb();
    renderStage();
    renderPanel();
    renderChrome();
    if (mode && !reduceMotion) {
      stageFrame.classList.remove('is-zooming', 'is-zoomout');
      stageFrame.style.transformOrigin = '50% 50%';
      const cls = mode === 'out' ? 'is-entering-out' : 'is-entering';
      stageFrame.classList.add(cls);
      // 강제 리플로우 후 클래스 제거로 트랜지션 트리거
      void stageFrame.offsetWidth;
      requestAnimationFrame(() => stageFrame.classList.remove(cls));
    }
    locked = false;
  }

  // ── 줌인: 클릭한 카드 중심으로 확대 → 하위로 진입 ─────────
  function zoomInto(kidId, cardEl) {
    if (locked) return;
    locked = true;

    if (reduceMotion) {
      path.push(kidId);
      render(false);
      return;
    }

    const fr = stageFrame.getBoundingClientRect();
    const cr = cardEl.getBoundingClientRect();
    const ox = ((cr.left + cr.width / 2) - fr.left) / fr.width * 100;
    const oy = ((cr.top + cr.height / 2) - fr.top) / fr.height * 100;
    stageFrame.style.transformOrigin = `${ox}% ${oy}%`;
    cardEl.classList.add('card--target');
    stageFrame.classList.add('is-zooming');

    const finish = () => {
      stageFrame.removeEventListener('transitionend', finish);
      path.push(kidId);
      render(true);
    };
    stageFrame.addEventListener('transitionend', finish);
    // 안전망(transitionend 미발생 대비)
    setTimeout(() => { if (locked) finish(); }, 600);
  }

  // ── 위로 빠져나오기: 화면이 줄어들며 상위로 (줌아웃) ──────
  function zoomOutTo(newPath) {
    if (locked) return;
    locked = true;
    if (reduceMotion) { path = newPath; render(false); return; }
    stageFrame.style.transformOrigin = '50% 50%';
    stageFrame.classList.add('is-zoomout');
    const finish = () => {
      stageFrame.removeEventListener('transitionend', finish);
      path = newPath;
      render('out');
    };
    stageFrame.addEventListener('transitionend', finish);
    setTimeout(() => { if (locked) finish(); }, 600); // 안전망
  }

  // ── 위로 / 처음으로 / 빵부스러기 점프 ─────────────────────
  function goUp() {
    if (path.length <= 1 || locked) return;
    zoomOutTo(path.slice(0, -1));
  }
  function goHome() {
    if (locked || path.length === 1) return;
    zoomOutTo([ROOT]);
  }
  function jumpTo(index) {
    if (locked) return;
    zoomOutTo(path.slice(0, index + 1));
  }

  // ── 이벤트 ────────────────────────────────────────────────
  btnBack.addEventListener('click', goUp);
  btnHome.addEventListener('click', goHome);
  btnSettings.addEventListener('click', () => {
    btnSettings.classList.add('btn--pulse');
    setTimeout(() => btnSettings.classList.remove('btn--pulse'), 400);
    stageHint.textContent = '⚙ 표현 모드 · 언어 설정은 다음 업데이트에서 열립니다';
  });
  document.addEventListener('keydown', (e) => {
    const introEl = document.getElementById('intro');
    if (introEl && !introEl.hidden) return; // 인트로 열려있으면 네비 무시
    if (e.key === 'Backspace' || e.key === 'Escape' || e.key === 'ArrowLeft') {
      e.preventDefault(); goUp();
    }
  });

  // ── 인트로 가이드 (첫 방문 / 로고 클릭) ───────────────────
  const intro = $('intro');
  const introStart = $('introStart');
  const wordmark = document.querySelector('.wordmark');
  function showIntro() { intro.hidden = false; }
  function hideIntro() {
    intro.hidden = true;
    try { localStorage.setItem('cs_seen', '1'); } catch (e) {}
  }
  const skipIntro = /[?&]skipintro/.test(location.search);
  try { if (!skipIntro && !localStorage.getItem('cs_seen')) showIntro(); } catch (e) { if (!skipIntro) showIntro(); }
  introStart.addEventListener('click', hideIntro);
  intro.addEventListener('click', (e) => { if (e.target === intro) hideIntro(); });
  if (wordmark) wordmark.addEventListener('click', showIntro);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !intro.hidden) hideIntro(); });

  // ── 브라우저 뒤로/앞으로 (해시 변경) ──────────────────────
  window.addEventListener('hashchange', () => {
    const p = pathFromHash();
    if (p.join('/') !== path.join('/')) { path = p; render(false); }
  });

  // ── 시작 ──────────────────────────────────────────────────
  buildGaugeTicks();
  path = pathFromHash(); // 공유된 URL이면 그 위치에서 시작
  render(false);
})();
