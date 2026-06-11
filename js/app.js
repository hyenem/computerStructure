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
      ? '▸ 도식 위의 부품을 클릭해 그 안으로 들어가세요'
      : '● 이 줄기의 가장 깊은 곳입니다';
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

  // ── 렌더: 게이지 / 깊이태그 / 뒤로버튼 ────────────────────
  function renderChrome() {
    const node = current();
    gaugeMarker.style.top = gaugePercent(node.scaleM) + '%';
    gaugeReadout.textContent = node.scale;
    depthTag.textContent = 'L' + node.depth;
    btnBack.disabled = path.length <= 1;
  }

  // ── 전체 렌더 + 진입 애니메이션 ───────────────────────────
  function render(entering) {
    renderBreadcrumb();
    renderStage();
    renderPanel();
    renderChrome();
    if (entering && !reduceMotion) {
      stageFrame.classList.remove('is-zooming');
      stageFrame.style.transformOrigin = '50% 50%';
      stageFrame.classList.add('is-entering');
      // 강제 리플로우 후 클래스 제거로 트랜지션 트리거
      void stageFrame.offsetWidth;
      requestAnimationFrame(() => stageFrame.classList.remove('is-entering'));
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

  // ── 위로 / 처음으로 / 빵부스러기 점프 ─────────────────────
  function goUp() {
    if (path.length <= 1 || locked) return;
    path.pop();
    render(true);
  }
  function goHome() {
    if (locked || path.length === 1) return;
    path = [ROOT];
    render(true);
  }
  function jumpTo(index) {
    if (locked) return;
    path = path.slice(0, index + 1);
    render(true);
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
  try { if (!localStorage.getItem('cs_seen')) showIntro(); } catch (e) { showIntro(); }
  introStart.addEventListener('click', hideIntro);
  intro.addEventListener('click', (e) => { if (e.target === intro) hideIntro(); });
  if (wordmark) wordmark.addEventListener('click', showIntro);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !intro.hidden) hideIntro(); });

  // ── 시작 ──────────────────────────────────────────────────
  render(false);
})();
