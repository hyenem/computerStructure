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

  // ── 용어 교차 링크: 설명 속 용어 → 해당 노드로 점프 ───────
  // 긴 용어 먼저 (부분 일치 방지). 패널당 용어별 첫 등장만 링크.
  const XREF = [
    ['프로그램 카운터', 'reg_pc'], ['페이지 테이블', 'virtualmem'], ['가상 메모리', 'virtualmem'],
    ['명령 레지스터', 'reg_ir'], ['명령어', 'isa'], ['기계어', 'isa'], ['클럭', 'clock'],
    ['패킷', 'packet'], ['NIC', 'nic'], ['인터럽트', 'bus_ctrl'], ['DMA', 'chipset'],
    ['그래픽 파이프라인', 'gfx'], ['셰이더', 'gfx'], ['텐서 코어', 'tensor'], ['워프', 'warp'],
    ['주소 버스', 'bus_addr'], ['데이터 버스', 'bus_data'], ['제어 버스', 'bus_ctrl'],
    ['논리게이트', 'gate'], ['트랜지스터', 'transistor'], ['플립플롭', 'register'],
    ['메모리 셀', 'memcell'], ['제어장치', 'control'], ['파이프라인', 'pipeline'],
    ['PN접합', 'semiconductor'], ['PN 접합', 'semiconductor'], ['반도체', 'semiconductor'],
    ['레지스터', 'register'], ['메인보드', 'motherboard'], ['가산기', 'adder'],
    ['MMU', 'virtualmem'], ['TLB', 'virtualmem'], ['MAR', 'reg_mar'], ['MDR', 'reg_mdr'],
    ['ACC', 'reg_acc'], ['ALU', 'alu'], ['VRAM', 'vram'], ['캐시', 'cache'],
    ['CPU', 'cpu'], ['GPU', 'gpu'], ['RAM', 'ram'], ['SSD', 'ssd'], ['HDD', 'hdd'],
  ];
  // 부모 맵으로 노드까지의 경로 계산
  const PARENT = {};
  Object.keys(NODES).forEach((pid) => (NODES[pid].kids || []).forEach((k) => { PARENT[k] = pid; }));
  function findPath(id) {
    const p = [id];
    while (p[0] !== ROOT && PARENT[p[0]]) p.unshift(PARENT[p[0]]);
    return p[0] === ROOT ? p : null;
  }
  function linkify(html, currentId) {
    const used = new Set();
    // 태그는 건드리지 않고 텍스트 조각만 치환
    return html.split(/(<[^>]*>)/).map((seg) => {
      if (seg.startsWith('<')) return seg;
      for (const [term, target] of XREF) {
        if (used.has(term) || target === currentId) continue;
        const idx = seg.indexOf(term);
        if (idx === -1) continue;
        used.add(term);
        seg = seg.slice(0, idx)
          + `<a class="xref" data-node="${target}" title="${NODES[target].title}(으)로 이동">${term}</a>`
          + seg.slice(idx + term.length);
      }
      return seg;
    }).join('');
  }

  // ── 렌더: 설명 패널 + 미니랩 + 전공노트/사실/퀴즈 ─────────
  function renderPanel() {
    const node = current();
    const id = path[path.length - 1];
    const ex = (window.EXTRAS || {})[id] || {};
    const body = (node.body || []).map((p) => `<p>${p}</p>`).join('');

    const deepHtml = ex.deep ? `
      <div class="deep">
        <div class="deep__head">📘 전공 노트</div>
        <ul>${ex.deep.map((d) => `<li>${d}</li>`).join('')}</ul>
      </div>` : '';

    const book = (window.BOOK || {})[id];
    const bookHtml = book ? `
      <details class="bookx">
        <summary>📖 교재 딥다이브 <span class="bookx__hint">— 전공책 수준으로 한 층 더</span></summary>
        <div class="bookx__body">
          ${book.map((s) => `
            <h3 class="bookx__h">${s.h}</h3>
            ${s.p.map((pp) => `<p>${pp}</p>`).join('')}`).join('')}
        </div>
      </details>` : '';

    const factsHtml = ex.facts ? `
      <div class="facts">
        <div class="facts__head">💡 알아두면</div>
        <ul>${ex.facts.map((f) => `<li>${f}</li>`).join('')}</ul>
      </div>` : '';

    const quizHtml = ex.quiz ? `
      <div class="quiz" id="quizBox">
        <div class="quiz__head">✅ 확인 퀴즈</div>
        <p class="quiz__q">${ex.quiz.q}</p>
        <div class="quiz__opts">
          ${ex.quiz.opts.map((o, i) => `<button class="quiz__opt" data-q="${i}">${o}</button>`).join('')}
        </div>
        <p class="quiz__why" hidden></p>
      </div>` : '';

    // 본문·노트·교재·사실에만 교차 링크 적용 (퀴즈 제외)
    const content = linkify(`
        <div class="info__body">${body}</div>
        ${node.lab ? `
          <div class="lab-wrap">
            <div class="lab-wrap__head"><span class="lab-wrap__icon">🧪</span> 직접 해보기 · MINI&nbsp;LAB</div>
            <div class="lab-mount" id="labMount"></div>
          </div>` : ''}
        ${deepHtml}
        ${bookHtml}
        ${factsHtml}`, id);

    // 🚪 시리즈 다리 배지 (경계 노드 → 다음 편 예고)
    const bridgeHtml = node.bridge ? `
      <div class="bridge">
        <div class="bridge__head">🚪 여기서부터는 <b>${node.bridge.series}</b>의 영역</div>
        <p class="bridge__text">${node.bridge.text}</p>
        <div class="bridge__foot">— 시리즈 「${node.bridge.series === '네트워크' ? '회선 속으로' : '커널 속으로'}」에서 계속 (준비 중)</div>
      </div>` : '';

    panelScroll.innerHTML = `
      <div class="info">
        <div class="info__depth">L${node.depth} / L8</div>
        <h1 class="info__title">${node.title}</h1>
        <div class="info__en">${node.en}</div>
        <p class="info__tag">${node.tagline || ''}</p>
        ${content}
        ${quizHtml}
        ${bridgeHtml}
      </div>`;

    if (node.lab && LABS[node.lab]) {
      LABS[node.lab]($('labMount'));
    }
    if (ex.quiz) bindQuiz(ex.quiz);
    // 교차 링크 클릭 → 해당 노드로 점프
    panelScroll.querySelectorAll('.xref').forEach((a) => {
      a.addEventListener('click', () => {
        if (locked) return;
        const p = findPath(a.dataset.node);
        if (p) { path = p; render('in'); }
      });
    });
    panelScroll.scrollTop = 0;
  }

  // 퀴즈: 선택 → 채점 + 해설
  function bindQuiz(quiz) {
    const box = $('quizBox');
    const opts = box.querySelectorAll('.quiz__opt');
    const why = box.querySelector('.quiz__why');
    let answered = false;
    opts.forEach((btn) => btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const pick = +btn.dataset.q;
      opts.forEach((b, i) => {
        b.disabled = true;
        if (i === quiz.a) b.classList.add('quiz__opt--right');
        else if (i === pick) b.classList.add('quiz__opt--wrong');
      });
      why.innerHTML = (pick === quiz.a ? '<b>정답!</b> ' : '<b>아쉽!</b> ') + quiz.why;
      why.hidden = false;
    }));
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
    if (visited.size === TOTAL) celebrate();
  }

  // ── 완주 축하 (1회) ───────────────────────────────────────
  function celebrate() {
    try { if (localStorage.getItem('cs_done')) return; localStorage.setItem('cs_done', '1'); } catch (e) {}
    const ov = document.createElement('div');
    ov.className = 'intro';
    ov.innerHTML = `
      <div class="intro__card">
        <div class="intro__glyph">🌌</div>
        <h2 class="intro__title">완주!</h2>
        <p class="intro__lead">컴퓨터 본체에서 출발해 <b>원자</b>까지 — ${TOTAL}곳을 모두 탐험했습니다.<br>
        이제 알게 됐죠: 전자의 흐름 → 트랜지스터 → 게이트 → 가산기 → ALU →<br>CPU → 컴퓨터. 가장 작은 것이 모여 화면을 그립니다.</p>
        <button class="intro__btn">탐험 계속하기 ↻</button>
        <p class="intro__hint">미니랩과 교재 딥다이브는 언제든 다시 열 수 있습니다</p>
      </div>`;
    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.querySelector('.intro__btn').addEventListener('click', close);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
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

  // ── 전체 지도 · 목차 ──────────────────────────────────────
  const btnMap = $('btnMap');
  let mapEl = null;
  function closeMap() { if (mapEl) { mapEl.remove(); mapEl = null; } }
  function showMap() {
    closeMap();
    const cur = path[path.length - 1];
    const labCount = Object.keys(NODES).filter((id) => NODES[id].lab).length;
    function walk(id) {
      const n = NODES[id];
      const kids = (n.kids || []).map(walk).join('');
      const isCur = id === cur, seen = visited.has(id);
      return `<li>
        <button class="map__item${isCur ? ' map__item--cur' : ''}${seen ? ' map__item--seen' : ''}" data-m="${id}">
          <span class="map__glyph">${n.glyph || '◆'}</span>
          <span class="map__title">${n.title}</span>
          ${n.lab ? '<span class="map__lab" title="미니랩 있음">🧪</span>' : ''}
          <span class="map__meta">L${n.depth} · ${n.scale}</span>
          <span class="map__check">${isCur ? '📍' : (seen ? '✓' : '')}</span>
        </button>
        ${kids ? `<ul>${kids}</ul>` : ''}
      </li>`;
    }
    mapEl = document.createElement('div');
    mapEl.className = 'intro map';
    mapEl.innerHTML = `
      <div class="intro__card map__card">
        <div class="map__head">
          <h2 class="map__h">🗺 전체 지도 · 목차</h2>
          <span class="map__prog">탐험 ${visited.size}/${TOTAL} · 미니랩 ${labCount}곳</span>
          <button class="map__close" aria-label="닫기">✕</button>
        </div>
        <div class="map__scroll"><ul class="map__tree">${walk(ROOT)}</ul></div>
        <div class="map__foot">노드를 클릭하면 그곳으로 점프 · ✓ 방문함 · 📍 현재 위치</div>
      </div>`;
    document.body.appendChild(mapEl);
    mapEl.querySelector('.map__close').addEventListener('click', closeMap);
    mapEl.addEventListener('click', (e) => { if (e.target === mapEl) closeMap(); });
    mapEl.querySelectorAll('.map__item').forEach((b) => b.addEventListener('click', () => {
      const p = findPath(b.dataset.m);
      closeMap();
      if (p && b.dataset.m !== cur) { path = p; render('in'); }
    }));
    // 현재 위치가 보이도록 스크롤
    const curEl = mapEl.querySelector('.map__item--cur');
    if (curEl) curEl.scrollIntoView({ block: 'center' });
  }
  btnMap.addEventListener('click', showMap);

  // ── 이벤트 ────────────────────────────────────────────────
  btnBack.addEventListener('click', goUp);
  btnHome.addEventListener('click', goHome);
  btnSettings.addEventListener('click', () => {
    btnSettings.classList.add('btn--pulse');
    setTimeout(() => btnSettings.classList.remove('btn--pulse'), 400);
    stageHint.textContent = '⚙ 표현 모드 · 언어 설정은 다음 업데이트에서 열립니다';
  });
  document.addEventListener('keydown', (e) => {
    if (mapEl) { // 지도 열림: Esc로 닫기만
      if (e.key === 'Escape') { e.preventDefault(); closeMap(); }
      return;
    }
    const introEl = document.getElementById('intro');
    if (introEl && !introEl.hidden) return; // 인트로 열려있으면 네비 무시
    // 입력 요소나 키보드 미니랩에 포커스가 있으면 단축키 무시
    if (e.target.closest && e.target.closest('input, select, textarea, .key-stage')) return;
    if (e.key === 'm' || e.key === 'M') { showMap(); return; }
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
