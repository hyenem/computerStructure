/* ============================================================
   labs.js — 인라인 미니랩(작은 실습) 모음
   각 빌더는 컨테이너 엘리먼트를 받아 위젯을 채운다.
   LABS[id](el) 형태로 app.js에서 호출.
   ⭐ 1차: gate(논리게이트) · adder(가산기) · transistor(트랜지스터)
   ============================================================ */

const LABS = {

  /* ── 논리게이트: 입력 0/1 토글 → 출력 + 진리표 하이라이트 ── */
  gate(el) {
    const GATES = {
      AND: { sym: '∧', fn: (a, b) => a & b, desc: '둘 다 1일 때만 1' },
      OR:  { sym: '∨', fn: (a, b) => a | b, desc: '하나라도 1이면 1' },
      XOR: { sym: '⊕', fn: (a, b) => a ^ b, desc: '서로 다르면 1' },
      NOT: { sym: '¬', fn: (a) => a ? 0 : 1, desc: '입력을 뒤집는다', unary: true },
    };
    let cur = 'AND';
    let a = 1, b = 0;

    el.innerHTML = `
      <div class="lab lab--gate">
        <div class="lab__tabs" role="tablist">
          ${Object.keys(GATES).map(g => `<button class="lab__tab" data-g="${g}">${g}</button>`).join('')}
        </div>
        <div class="lab__stage gate-stage">
          <div class="gate-inputs">
            <button class="bit" data-in="a">1</button>
            <button class="bit" data-in="b">0</button>
          </div>
          <div class="gate-body">
            <span class="gate-sym">∧</span>
            <span class="gate-name">AND</span>
          </div>
          <div class="gate-output">
            <span class="wire"></span>
            <span class="bit bit--out">0</span>
          </div>
        </div>
        <table class="truth">
          <thead><tr><th>A</th><th>B</th><th>출력</th></tr></thead>
          <tbody></tbody>
        </table>
        <p class="lab__caption"></p>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const tabs = el.querySelectorAll('.lab__tab');
    const bitA = $('[data-in="a"]'), bitB = $('[data-in="b"]');
    const sym = $('.gate-sym'), name = $('.gate-name');
    const out = $('.bit--out'), tbody = $('.truth tbody'), cap = $('.lab__caption');

    function render() {
      const g = GATES[cur];
      sym.textContent = g.sym;
      name.textContent = cur;
      bitB.style.display = g.unary ? 'none' : '';
      const res = g.unary ? g.fn(a) : g.fn(a, b);

      bitA.textContent = a; bitA.classList.toggle('bit--on', !!a);
      bitB.textContent = b; bitB.classList.toggle('bit--on', !!b);
      out.textContent = res; out.classList.toggle('bit--on', !!res);

      // 진리표
      const rows = [];
      const combos = g.unary ? [[0], [1]] : [[0,0],[0,1],[1,0],[1,1]];
      for (const c of combos) {
        const r = g.unary ? g.fn(c[0]) : g.fn(c[0], c[1]);
        const active = g.unary ? (c[0] === a) : (c[0] === a && c[1] === b);
        rows.push(`<tr class="${active ? 'truth--active' : ''}">
          <td>${c[0]}</td><td>${g.unary ? '–' : c[1]}</td><td class="${r ? 'one' : 'zero'}">${r}</td></tr>`);
      }
      tbody.innerHTML = rows.join('');
      cap.innerHTML = `<b>${cur}</b> — ${g.desc}.`;
    }

    tabs.forEach(t => t.addEventListener('click', () => {
      cur = t.dataset.g;
      tabs.forEach(x => x.classList.toggle('lab__tab--on', x === t));
      render();
    }));
    bitA.addEventListener('click', () => { a ^= 1; render(); });
    bitB.addEventListener('click', () => { b ^= 1; render(); });

    tabs[0].classList.add('lab__tab--on');
    render();
  },

  /* ── 가산기: 두 비트 입력 → 합/자리올림 (반가산기) ── */
  adder(el) {
    let a = 1, b = 1;
    el.innerHTML = `
      <div class="lab lab--adder">
        <div class="add-row">
          <span class="add-label">A</span>
          <button class="bit" data-in="a">1</button>
        </div>
        <div class="add-row">
          <span class="add-label">B</span>
          <button class="bit" data-in="b">1</button>
        </div>
        <div class="add-line"></div>
        <div class="add-result">
          <div class="add-out">
            <span class="add-out__label">자리올림 (Carry)</span>
            <span class="bit bit--out" data-out="carry">0</span>
            <span class="add-gate">AND</span>
          </div>
          <div class="add-out">
            <span class="add-out__label">합 (Sum)</span>
            <span class="bit bit--out" data-out="sum">0</span>
            <span class="add-gate">XOR</span>
          </div>
        </div>
        <p class="lab__caption"></p>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const bitA = $('[data-in="a"]'), bitB = $('[data-in="b"]');
    const sum = $('[data-out="sum"]'), carry = $('[data-out="carry"]');
    const cap = $('.lab__caption');

    function render() {
      const s = a ^ b, c = a & b;
      bitA.textContent = a; bitA.classList.toggle('bit--on', !!a);
      bitB.textContent = b; bitB.classList.toggle('bit--on', !!b);
      sum.textContent = s; sum.classList.toggle('bit--on', !!s);
      carry.textContent = c; carry.classList.toggle('bit--on', !!c);
      const total = a + b;
      const bin = (c.toString() + s.toString());
      cap.innerHTML = `${a} + ${b} = <b>${total}</b> &nbsp;→&nbsp; 2진수 <b>${bin}</b> &nbsp;(자리올림 ${c}, 합 ${s})`;
    }
    bitA.addEventListener('click', () => { a ^= 1; render(); });
    bitB.addEventListener('click', () => { b ^= 1; render(); });
    render();
  },

  /* ── 트랜지스터: 게이트 전압 슬라이더 → 전류 ON/OFF ── */
  transistor(el) {
    const TH = 50; // 문턱 전압(%)
    el.innerHTML = `
      <div class="lab lab--tr">
        <div class="tr-diagram ${''}">
          <div class="tr-rail tr-rail--src">전원<span>＋</span></div>
          <div class="tr-channel" data-state="off">
            <span class="tr-flow"></span>
            <div class="tr-gate">
              <span class="tr-gate__label">게이트</span>
            </div>
          </div>
          <div class="tr-rail tr-rail--drn">출력 <span class="tr-lamp">○</span></div>
        </div>
        <label class="tr-control">
          <span>게이트 전압</span>
          <input type="range" min="0" max="100" value="20" class="tr-slider" />
          <span class="tr-volt">20%</span>
        </label>
        <p class="lab__caption"></p>
      </div>`;

    const slider = el.querySelector('.tr-slider');
    const volt = el.querySelector('.tr-volt');
    const channel = el.querySelector('.tr-channel');
    const lamp = el.querySelector('.tr-lamp');
    const cap = el.querySelector('.lab__caption');

    function render() {
      const v = +slider.value;
      volt.textContent = v + '%';
      const on = v >= TH;
      channel.dataset.state = on ? 'on' : 'off';
      lamp.textContent = on ? '●' : '○';
      lamp.classList.toggle('tr-lamp--on', on);
      cap.innerHTML = on
        ? `전압이 문턱(${TH}%)을 넘었습니다 → 채널이 열려 <b class="one">전류 흐름 = 1</b>`
        : `전압이 문턱(${TH}%)보다 낮습니다 → 채널이 막혀 <b class="zero">전류 차단 = 0</b>`;
    }
    slider.addEventListener('input', render);
    render();
  },

  /* ── 페치-디코드-실행: 한 단계씩 명령 처리 ── */
  fdx(el) {
    const PROG = [
      { text: 'LOAD 5', op: 'LOAD', arg: 5 },
      { text: 'ADD 3',  op: 'ADD',  arg: 3 },
      { text: 'OUT',    op: 'OUT' },
    ];
    const PLABEL = { idle: '대기', fetch: '가져오기 FETCH', decode: '해석 DECODE', execute: '실행 EXECUTE' };
    // 마이크로 스텝 시퀀스
    const seq = [];
    PROG.forEach((_, i) => { seq.push({ pc: i, ph: 'fetch' }, { pc: i, ph: 'decode' }, { pc: i, ph: 'execute' }); });

    let si = -1, acc = 0, ir = null, out = null;

    el.innerHTML = `
      <div class="lab lab--fdx">
        <div class="fdx-top">
          <span class="fdx-phase" data-p="idle">대기</span>
          <button class="fdx-next">▸ 다음 단계</button>
        </div>
        <div class="fdx-grid">
          <div class="fdx-mem">
            ${PROG.map((p, i) => `<div class="fdx-row" data-i="${i}"><span class="fdx-ptr">▸</span><span>${p.text}</span></div>`).join('')}
          </div>
          <div class="fdx-regs">
            <div class="fdx-reg" data-r="pc"><span>PC</span><b>0</b></div>
            <div class="fdx-reg" data-r="ir"><span>IR</span><b>—</b></div>
            <div class="fdx-reg" data-r="acc"><span>ACC</span><b>0</b></div>
            <div class="fdx-reg" data-r="out"><span>OUT</span><b>—</b></div>
          </div>
        </div>
        <p class="lab__caption">버튼을 눌러 한 단계씩 — CPU가 명령을 처리하는 과정</p>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const phaseEl = $('.fdx-phase'), nextBtn = $('.fdx-next'), cap = $('.lab__caption');
    const rows = el.querySelectorAll('.fdx-row');
    const reg = (r) => el.querySelector(`.fdx-reg[data-r="${r}"]`);

    function setReg(r, v) { reg(r).querySelector('b').textContent = v; }

    function paint(step, caption, hotReg) {
      const ph = step ? step.ph : 'idle';
      phaseEl.textContent = PLABEL[ph];
      phaseEl.dataset.p = ph;
      const last = si >= seq.length - 1;
      nextBtn.textContent = last ? '↻ 처음부터' : '▸ 다음 단계';
      rows.forEach((row, i) => row.classList.toggle('active', step && i === step.pc));
      setReg('pc', step ? step.pc : 0);
      setReg('ir', ir ? ir.text : '—');
      setReg('acc', acc);
      setReg('out', out == null ? '—' : out);
      ['pc','ir','acc','out'].forEach(r => reg(r).classList.toggle('hot', r === hotReg));
      cap.innerHTML = caption;
    }

    function step() {
      if (si >= seq.length - 1) { // 처음부터
        si = -1; acc = 0; ir = null; out = null;
        paint(null, '버튼을 눌러 한 단계씩 — CPU가 명령을 처리하는 과정', null);
        return;
      }
      si++;
      const s = seq[si];
      let cap = '', hot = null;
      if (s.ph === 'fetch') {
        ir = PROG[s.pc];
        cap = `<b>가져오기</b> — PC가 가리키는 명령 「${ir.text}」을 IR로 불러옴`; hot = 'ir';
      } else if (s.ph === 'decode') {
        cap = `<b>해석</b> — IR의 명령을 풀이: 동작은 <b>${ir.op}</b>`; hot = 'ir';
      } else { // execute
        const o = ir;
        if (o.op === 'LOAD') { acc = o.arg; cap = `<b>실행</b> — 값 ${o.arg}을 ACC에 적재 → ACC=${acc}`; hot = 'acc'; }
        else if (o.op === 'ADD') { acc += o.arg; cap = `<b>실행</b> — ACC에 ${o.arg}을 더함 → ACC=${acc}`; hot = 'acc'; }
        else if (o.op === 'OUT') { out = acc; cap = `<b>실행</b> — ACC 값을 출력 → OUT=${out}`; hot = 'out'; }
        if (si >= seq.length - 1) cap += ' &nbsp;· 프로그램 끝!';
      }
      paint(s, cap, hot);
    }

    nextBtn.addEventListener('click', step);
    paint(null, '버튼을 눌러 한 단계씩 — CPU가 명령을 처리하는 과정', null);
  },

  /* ── 플립플롭: 클럭이 올 때만 값을 저장 ── */
  flipflop(el) {
    let d = 1, q = 0;
    el.innerHTML = `
      <div class="lab lab--ff">
        <div class="ff-row">
          <div class="ff-cell"><span>입력 D</span><button class="bit" data-d>1</button></div>
          <button class="ff-clk">⎍ CLK</button>
          <div class="ff-cell"><span>저장 Q</span><span class="bit bit--out" data-q>0</span></div>
        </div>
        <p class="lab__caption"></p>
      </div>`;
    const bitD = el.querySelector('[data-d]');
    const bitQ = el.querySelector('[data-q]');
    const clk = el.querySelector('.ff-clk');
    const cap = el.querySelector('.lab__caption');

    function render(latched) {
      bitD.textContent = d; bitD.classList.toggle('bit--on', !!d);
      bitQ.textContent = q; bitQ.classList.toggle('bit--on', !!q);
      cap.innerHTML = latched
        ? `⎍ <b>클럭!</b> 이 순간 Q ← D 가 저장됨 → Q=${q}`
        : (d === q
            ? 'D를 바꿔 보세요. 클럭(CLK)을 눌러야 Q에 저장됩니다.'
            : `지금 D=${d}, Q=${q} — <b>다르죠?</b> 클럭을 눌러야 Q가 따라옵니다.`);
    }
    bitD.addEventListener('click', () => { d ^= 1; render(false); });
    clk.addEventListener('click', () => {
      q = d;
      bitQ.classList.remove('ff-flash'); void bitQ.offsetWidth; bitQ.classList.add('ff-flash');
      render(true);
    });
    render(false);
  },

  /* ── 캐시 적중/실패: 주소 요청 → HIT(즉시) / MISS(RAM 왕복 후 적재) ── */
  cache(el) {
    const ADDRS = ['A', 'B', 'C', 'D', 'E', 'F'];
    const SIZE = 3;            // 캐시 칸 수 (작아야 MISS를 자주 체험)
    let cache = ['A', 'B'];    // 초기 적재 (FIFO)
    let hits = 0, misses = 0, busy = false;

    el.innerHTML = `
      <div class="lab lab--cache">
        <div class="cache-req">
          <span class="cache-req__label">CPU 요청 →</span>
          ${ADDRS.map(a => `<button class="cache-addr" data-a="${a}">${a}</button>`).join('')}
        </div>
        <div class="cache-rows">
          <div class="cache-tier" data-tier="cache">
            <span class="cache-tier__name">캐시 (${SIZE}칸 · 빠름)</span>
            <div class="cache-slots"></div>
            <span class="cache-verdict"></span>
          </div>
          <div class="cache-tier" data-tier="ram">
            <span class="cache-tier__name">RAM (전부 있음 · 느림)</span>
            <div class="cache-ramline">${ADDRS.map(a => `<span class="cache-ram" data-r="${a}">${a}</span>`).join('')}</div>
          </div>
        </div>
        <div class="cache-score">
          적중 <b class="one" data-s="hit">0</b> · 실패 <b data-s="miss">0</b>
        </div>
        <p class="lab__caption">주소를 눌러 보세요. 같은 주소를 다시 부르면? 처음 부르는 주소는?</p>
      </div>`;

    const slots = el.querySelector('.cache-slots');
    const verdict = el.querySelector('.cache-verdict');
    const cap = el.querySelector('.lab__caption');
    const sHit = el.querySelector('[data-s="hit"]');
    const sMiss = el.querySelector('[data-s="miss"]');

    function renderSlots(flashAddr, missAddr) {
      slots.innerHTML = '';
      for (let i = 0; i < SIZE; i++) {
        const a = cache[i];
        const d = document.createElement('span');
        d.className = 'cache-slot'
          + (a ? '' : ' cache-slot--empty')
          + (a && a === flashAddr ? ' cache-slot--hit' : '')
          + (a && a === missAddr ? ' cache-slot--fill' : '');
        d.textContent = a || '·';
        slots.appendChild(d);
      }
      sHit.textContent = hits; sMiss.textContent = misses;
    }

    function request(a, btn) {
      if (busy) return;
      el.querySelectorAll('.cache-addr').forEach(b => b.classList.toggle('cache-addr--on', b === btn));
      if (cache.includes(a)) {
        hits++;
        verdict.textContent = '✓ HIT';
        verdict.className = 'cache-verdict cache-verdict--hit';
        renderSlots(a, null);
        cap.innerHTML = `<b class="one">적중!</b> 「${a}」가 캐시에 있어 <b>즉시</b> 응답 — RAM까지 갈 필요 없음`;
      } else {
        busy = true;
        misses++;
        verdict.textContent = '✗ MISS';
        verdict.className = 'cache-verdict cache-verdict--miss';
        renderSlots(null, null);
        cap.innerHTML = `<b>실패…</b> 캐시에 「${a}」가 없음 → <b>느린 RAM</b>까지 다녀오는 중`;
        const ramEl = el.querySelector(`.cache-ram[data-r="${a}"]`);
        ramEl.classList.add('cache-ram--read');
        setTimeout(() => {
          ramEl.classList.remove('cache-ram--read');
          const evicted = cache.length >= SIZE ? cache.shift() : null; // FIFO 교체
          cache.push(a);
          renderSlots(null, a);
          cap.innerHTML = `RAM에서 가져와 <b>캐시에 적재</b>${evicted ? ` (자리가 없어 「${evicted}」 교체)` : ''} — 다음번 「${a}」는 적중!`;
          busy = false;
        }, 900);
      }
    }

    el.querySelectorAll('.cache-addr').forEach(b =>
      b.addEventListener('click', () => request(b.dataset.a, b)));
    renderSlots(null, null);
  },

  /* ── 2진수 변환기: 8비트 토글 → 10진수 ── */
  binary(el) {
    const N = 8;
    let bits = [0, 0, 1, 0, 1, 0, 1, 0]; // 42
    el.innerHTML = `
      <div class="lab lab--bin">
        <div class="bin-row">
          ${bits.map((b, i) => `
            <div class="bin-col">
              <span class="bin-weight">${2 ** (N - 1 - i)}</span>
              <button class="bit" data-i="${i}">${b}</button>
            </div>`).join('')}
        </div>
        <div class="bin-result">= <b class="bin-dec">42</b></div>
        <p class="lab__caption">비트를 눌러 켜고 꺼보세요. 켜진 자리의 가중치를 더하면 10진수!</p>
      </div>`;
    const dec = el.querySelector('.bin-dec');
    const cap = el.querySelector('.lab__caption');
    function render() {
      let v = 0; const on = [];
      bits.forEach((b, i) => {
        const w = 2 ** (N - 1 - i);
        if (b) { v += w; on.push(w); }
        const btn = el.querySelector(`[data-i="${i}"]`);
        btn.textContent = b; btn.classList.toggle('bit--on', !!b);
      });
      dec.textContent = v;
      cap.innerHTML = on.length
        ? `${on.join(' + ')} = <b>${v}</b> — 메모리 한 칸에 담긴 숫자도 이렇게 비트로.`
        : '모든 비트가 0 → 값도 0. 비트를 켜보세요!';
    }
    el.querySelectorAll('.bit').forEach(btn =>
      btn.addEventListener('click', () => { bits[+btn.dataset.i] ^= 1; render(); }));
    render();
  },

  /* ── PN 접합 바이어스: 순방향/역방향 → 전류 통과/차단 ── */
  pn(el) {
    let forward = true;
    el.innerHTML = `
      <div class="lab lab--pn">
        <div class="pn-diagram">
          <span class="pn-pole pn-pole--l">＋</span>
          <div class="pn-body">
            <div class="pn-block pn-block--p">P</div>
            <div class="pn-junction"><span class="pn-flow"></span></div>
            <div class="pn-block pn-block--n">N</div>
          </div>
          <span class="pn-pole pn-pole--r">−</span>
        </div>
        <button class="pn-swap">⇄ 전지 방향 뒤집기</button>
        <p class="lab__caption"></p>
      </div>`;
    const lPole = el.querySelector('.pn-pole--l');
    const rPole = el.querySelector('.pn-pole--r');
    const junction = el.querySelector('.pn-junction');
    const cap = el.querySelector('.lab__caption');
    function render() {
      lPole.textContent = forward ? '＋' : '−';
      rPole.textContent = forward ? '−' : '＋';
      junction.dataset.state = forward ? 'on' : 'off';
      cap.innerHTML = forward
        ? 'P쪽에 ＋ → <b class="one">순방향: 전류 통과!</b> 정공과 전자가 접합부로 모여 길이 열립니다.'
        : 'P쪽에 − → <b class="zero">역방향: 차단.</b> 캐리어가 양끝으로 끌려가 공핍 영역이 넓어집니다.';
    }
    el.querySelector('.pn-swap').addEventListener('click', () => { forward = !forward; render(); });
    render();
  },

  /* ── 파이프라인: 사이클을 한 박자씩 진행 ── */
  pipeline(el) {
    const ST = ['IF', 'ID', 'EX', 'MEM', 'WB'];
    const N = 3; // 명령 수
    const LAST = N - 1 + ST.length - 1; // 마지막 사이클 번호
    let cycle = -1;

    el.innerHTML = `
      <div class="lab lab--pipe">
        <div class="pipe-top">
          <span class="pipe-cycle">시작 전</span>
          <button class="pipe-next">▸ 다음 박자</button>
        </div>
        <table class="pipe-grid">
          <thead><tr><th></th>${ST.map(s => `<th>${s}</th>`).join('')}</tr></thead>
          <tbody>
            ${Array.from({ length: N }, (_, i) => `<tr><td class="pipe-name">명령${i + 1}</td>${ST.map((_, j) => `<td class="pipe-cell" data-i="${i}" data-j="${j}"></td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <p class="lab__caption">순차 실행이면 3×5 = <b>15박자</b>. 파이프라인은 몇 박자에 끝날까요?</p>
      </div>`;

    const cyc = el.querySelector('.pipe-cycle');
    const btn = el.querySelector('.pipe-next');
    const cap = el.querySelector('.lab__caption');
    const cells = el.querySelectorAll('.pipe-cell');

    function render() {
      const live = [];
      cells.forEach((c) => {
        const i = +c.dataset.i, j = +c.dataset.j;
        const at = i + j; // 이 칸이 활성인 사이클
        c.classList.toggle('pipe-cell--on', cycle === at);
        c.classList.toggle('pipe-cell--done', cycle > at);
        c.textContent = cycle >= at ? ST[j] : '';
        if (cycle === at) live.push(`명령${i + 1}=${ST[j]}`);
      });
      if (cycle < 0) {
        cyc.textContent = '시작 전';
        btn.textContent = '▸ 다음 박자';
      } else if (cycle >= LAST) {
        cyc.textContent = `사이클 ${cycle + 1} — 완료!`;
        btn.textContent = '↻ 처음부터';
        cap.innerHTML = `명령 3개가 단 <b>${LAST + 1}박자</b>에 끝! (순차였다면 15박자) — 겹침의 힘입니다.`;
      } else {
        cyc.textContent = `사이클 ${cycle + 1}`;
        cap.innerHTML = live.join(' · ') + ' — <b>같은 박자에 동시!</b>';
      }
    }
    btn.addEventListener('click', () => {
      cycle = cycle >= LAST ? -1 : cycle + 1;
      if (cycle < 0) cap.innerHTML = '순차 실행이면 3×5 = <b>15박자</b>. 파이프라인은 몇 박자에 끝날까요?';
      render();
    });
    render();
  },

  /* ── 가상 메모리: 주소 변환 + 페이지 폴트 체험 ── */
  vm(el) {
    const FRAMES = 6;
    let table = { P0: 2, P1: null, P2: 0, P3: 4 }; // null = 디스크
    let busy = false, faults = 0;

    el.innerHTML = `
      <div class="lab lab--vm">
        <div class="vm-req">
          <span class="vm-req__label">프로그램 접근 →</span>
          ${Object.keys(table).map(p => `<button class="vm-page" data-p="${p}">${p}</button>`).join('')}
        </div>
        <div class="vm-frames">${Array.from({ length: FRAMES }, (_, f) => `<span class="vm-frame" data-f="${f}">F${f}</span>`).join('')}</div>
        <div class="vm-disk">💾 디스크(스왑) <span class="vm-disk__light">●</span></div>
        <p class="lab__caption">페이지를 눌러 보세요 — 매핑된 것과 디스크에 있는 것의 차이!</p>
      </div>`;

    const cap = el.querySelector('.lab__caption');
    const diskLight = el.querySelector('.vm-disk__light');

    function paintFrames(hot) {
      el.querySelectorAll('.vm-frame').forEach((fr) => {
        const f = +fr.dataset.f;
        const owner = Object.keys(table).find(p => table[p] === f);
        fr.textContent = owner ? `F${f}·${owner}` : `F${f}`;
        fr.classList.toggle('vm-frame--used', !!owner);
        fr.classList.toggle('vm-frame--hot', f === hot);
      });
    }

    function access(p, btn) {
      if (busy) return;
      el.querySelectorAll('.vm-page').forEach(b => b.classList.toggle('vm-page--on', b === btn));
      const f = table[p];
      if (f != null) {
        paintFrames(f);
        cap.innerHTML = `<b class="one">변환 성공</b> — MMU: ${p}(가상) → <b>F${f}</b>(물리). 프로그램은 이 과정을 모릅니다.`;
      } else {
        busy = true; faults++;
        paintFrames(-1);
        cap.innerHTML = `<b>⚠ 페이지 폴트!</b> ${p}는 RAM에 없음 → 운영체제가 디스크에서 가져오는 중…`;
        diskLight.classList.add('vm-disk--busy');
        setTimeout(() => {
          diskLight.classList.remove('vm-disk--busy');
          // 빈 프레임 찾아 적재
          const used = new Set(Object.values(table).filter(v => v != null));
          let free = 0; while (used.has(free)) free++;
          table[p] = free;
          paintFrames(free);
          cap.innerHTML = `디스크에서 ${p}를 <b>F${free}</b>에 적재 + 페이지 테이블 갱신 — 다음부턴 즉시 변환! (폴트 ${faults}회)`;
          busy = false;
        }, 1100);
      }
    }
    el.querySelectorAll('.vm-page').forEach(b => b.addEventListener('click', () => access(b.dataset.p, b)));
    paintFrames(-1);
  },

  /* ── NAND 조립: NAND만으로 NOT·AND·OR 만들기 ── */
  nandlab(el) {
    const nand = (x, y) => (x & y) ? 0 : 1;
    let target = 'NOT', a = 1, b = 0;

    el.innerHTML = `
      <div class="lab lab--nnd">
        <div class="lab__tabs">
          ${['NOT', 'AND', 'OR'].map(t => `<button class="lab__tab" data-t="${t}">${t}</button>`).join('')}
        </div>
        <div class="nnd-in">
          <span class="nnd-lbl">입력</span>
          <button class="bit" data-i="a">1</button>
          <button class="bit" data-i="b">0</button>
        </div>
        <div class="nnd-stages"></div>
        <p class="lab__caption"></p>
      </div>`;

    const tabs = el.querySelectorAll('.lab__tab');
    const bitA = el.querySelector('[data-i="a"]');
    const bitB = el.querySelector('[data-i="b"]');
    const stages = el.querySelector('.nnd-stages');
    const cap = el.querySelector('.lab__caption');

    const chip = (label, v) => `<span class="nnd-chip ${v ? 'nnd-chip--on' : ''}">${label} = <b>${v}</b></span>`;

    function render() {
      tabs.forEach(t => t.classList.toggle('lab__tab--on', t.dataset.t === target));
      bitA.textContent = a; bitA.classList.toggle('bit--on', !!a);
      bitB.textContent = b; bitB.classList.toggle('bit--on', !!b);
      bitB.style.display = target === 'NOT' ? 'none' : '';

      let rows = [], out, expr;
      if (target === 'NOT') {
        out = nand(a, a);
        rows.push(chip(`NAND(A,A)`, out));
        expr = `NOT(${a}) = ${out} — 입력을 두 갈래로 묶으면 끝 (NAND 1개)`;
      } else if (target === 'AND') {
        const n1 = nand(a, b); out = nand(n1, n1);
        rows.push(chip(`① NAND(A,B)`, n1), chip(`② NAND(①,①)`, out));
        expr = `AND(${a},${b}) = ${out} — NAND 뒤에 NOT(=NAND)을 달면 AND (NAND 2개)`;
      } else {
        const n1 = nand(a, a), n2 = nand(b, b); out = nand(n1, n2);
        rows.push(chip(`① NAND(A,A)`, n1) + chip(`② NAND(B,B)`, n2), chip(`③ NAND(①,②)`, out));
        expr = `OR(${a},${b}) = ${out} — 드모르간: A+B = NAND(¬A,¬B) (NAND 3개)`;
      }
      stages.innerHTML = rows.map(r => `<div class="nnd-row">${r}</div>`).join('<div class="nnd-arrow">↓</div>');
      cap.innerHTML = expr;
    }
    tabs.forEach(t => t.addEventListener('click', () => { target = t.dataset.t; render(); }));
    bitA.addEventListener('click', () => { a ^= 1; render(); });
    bitB.addEventListener('click', () => { b ^= 1; render(); });
    render();
  },

  /* ── 발열 평형: 부하·팬 속도 → 온도, 스로틀링 체험 ── */
  thermal(el) {
    const AMB = 25, TMAX = 100;
    el.innerHTML = `
      <div class="lab lab--thermal">
        <div class="th-visual">
          <div class="th-cpu"><span class="th-temp">--°C</span></div>
          <span class="th-fan">✣</span>
        </div>
        <div class="th-bar"><div class="th-bar__fill"></div><span class="th-bar__limit"></span></div>
        <label class="tr-control"><span>CPU 부하</span>
          <input type="range" min="5" max="150" value="60" class="tr-slider" data-s="load"/>
          <span class="tr-volt" data-v="load">60W</span></label>
        <label class="tr-control"><span>팬 속도</span>
          <input type="range" min="0" max="100" value="40" class="tr-slider" data-s="fan"/>
          <span class="tr-volt" data-v="fan">40%</span></label>
        <p class="lab__caption"></p>
      </div>`;

    const sLoad = el.querySelector('[data-s="load"]');
    const sFan = el.querySelector('[data-s="fan"]');
    const vLoad = el.querySelector('[data-v="load"]');
    const vFan = el.querySelector('[data-v="fan"]');
    const cpu = el.querySelector('.th-cpu');
    const tempEl = el.querySelector('.th-temp');
    const fan = el.querySelector('.th-fan');
    const fill = el.querySelector('.th-bar__fill');
    const cap = el.querySelector('.lab__caption');

    function render() {
      const load = +sLoad.value, fanPct = +sFan.value;
      vLoad.textContent = load + 'W'; vFan.textContent = fanPct + '%';
      const theta = 0.85 - fanPct / 100 * 0.55;          // 열저항 °C/W
      let T = AMB + load * theta;
      const throttled = T > TMAX;
      if (throttled) T = TMAX;
      tempEl.textContent = Math.round(T) + '°C';
      const heat = Math.min(1, (T - AMB) / (TMAX - AMB));
      cpu.style.background = `rgb(${40 + heat * 160}, ${50 - heat * 20}, ${60 - heat * 30})`;
      cpu.style.boxShadow = throttled ? '0 0 18px rgba(224,100,60,.7)' : 'none';
      fill.style.width = Math.min(100, (T - AMB) / (TMAX - AMB) * 100) + '%';
      fill.style.background = throttled ? '#e0654a' : (heat > .7 ? '#e0916f' : '#86e6a2');
      fan.style.animationDuration = (1.8 - fanPct / 100 * 1.5) + 's';
      fan.style.opacity = fanPct === 0 ? .25 : 1;
      cap.innerHTML = throttled
        ? `⚠ <b>스로틀링!</b> ${TMAX}°C 한계 도달 — CPU가 스스로 클럭을 낮춥니다. 팬을 올리거나 부하를 줄여보세요.`
        : `평형 온도 = 25°C + ${load}W × ${theta.toFixed(2)}°C/W = <b>${Math.round(T)}°C</b> — 열저항 모델 그대로!`;
    }
    sLoad.addEventListener('input', render);
    sFan.addEventListener('input', render);
    render();
  },

  /* ── 평활: 커패시터 용량 → 리플 감소 ── */
  smooth(el) {
    const W = 240, H = 80, P = 40; // 파형 폭/높이/반주기 px
    el.innerHTML = `
      <div class="lab lab--smooth">
        <svg class="smooth-svg" viewBox="0 0 ${W} ${H}">
          <path class="smooth-raw" fill="none" stroke="#a9803a" stroke-width="1.2" opacity=".6"/>
          <path class="smooth-out" fill="none" stroke="#86e6a2" stroke-width="2"/>
        </svg>
        <label class="tr-control"><span>커패시터 용량</span>
          <input type="range" min="0" max="100" value="15" class="tr-slider"/>
          <span class="tr-volt">15%</span></label>
        <p class="lab__caption"></p>
      </div>`;
    const raw = el.querySelector('.smooth-raw');
    const out = el.querySelector('.smooth-out');
    const slider = el.querySelector('.tr-slider');
    const volt = el.querySelector('.tr-volt');
    const cap = el.querySelector('.lab__caption');

    function render() {
      const c = +slider.value;
      volt.textContent = c + '%';
      const ripple = 1 - c / 100 * 0.96; // 0.04 ~ 1
      let dRaw = '', dOut = '';
      for (let x = 0; x <= W; x += 2) {
        const s = Math.abs(Math.sin(x / P * Math.PI));       // 정류된 맥동 0~1
        const yR = H - 8 - s * (H - 20);
        const vO = 1 - ripple * (1 - s);                      // 평활 후
        const yO = H - 8 - vO * (H - 20);
        dRaw += (x ? 'L' : 'M') + x + ' ' + yR.toFixed(1) + ' ';
        dOut += (x ? 'L' : 'M') + x + ' ' + yO.toFixed(1) + ' ';
      }
      raw.setAttribute('d', dRaw);
      out.setAttribute('d', dOut);
      const pct = Math.round(ripple * 100);
      cap.innerHTML = pct > 60
        ? `리플 ±${pct}% — 이 출렁임으론 칩이 오작동! 커패시터를 키워보세요.`
        : pct > 10
          ? `리플 ±${pct}% — 커패시터가 골을 메워주는 중 (출렁임을 물탱크처럼 흡수)`
          : `리플 ±${pct}% — <b>매끈한 직류!</b> 황금색(정류 직후) → 초록색(평활 후)`;
    }
    slider.addEventListener('input', render);
    render();
  },

  /* ── 밴드갭: 에너지 틈을 조절해 도체/반도체/부도체 체험 ── */
  bandgap(el) {
    el.innerHTML = `
      <div class="lab lab--band">
        <div class="band-view">
          <div class="band band--cond"><span>전도대 (자유로운 전자의 층)</span></div>
          <div class="band-gap"><span class="band-gap__label"></span><span class="band-jump">e⁻</span></div>
          <div class="band band--val"><span>가전자대 (결합에 묶인 전자)</span>
            <span class="band-e">●</span><span class="band-e">●</span><span class="band-e">●</span><span class="band-e">●</span>
          </div>
        </div>
        <label class="tr-control">
          <span>밴드갭</span>
          <input type="range" min="0" max="100" value="22" class="tr-slider band-slider"/>
          <span class="tr-volt band-ev">1.1eV</span>
        </label>
        <div class="band-verdict"></div>
        <p class="lab__caption"></p>
      </div>`;
    const gapEl = el.querySelector('.band-gap');
    const gapLabel = el.querySelector('.band-gap__label');
    const jump = el.querySelector('.band-jump');
    const slider = el.querySelector('.band-slider');
    const ev = el.querySelector('.band-ev');
    const verdict = el.querySelector('.band-verdict');
    const cap = el.querySelector('.lab__caption');

    function render() {
      const v = +slider.value;
      const gap = v / 100 * 6;                  // 0 ~ 6 eV
      ev.textContent = gap.toFixed(1) + 'eV';
      gapEl.style.height = Math.max(4, v * 0.9) + 'px';
      gapLabel.textContent = gap < 0.2 ? '' : '에너지 틈';
      let cls, msg, jmp;
      if (gap < 0.2) {
        cls = 'cond'; jmp = 'free';
        msg = '<b>도체</b> (구리·금) — 띠가 겹쳐 전자가 항상 자유롭게 흐른다';
      } else if (gap < 3) {
        cls = 'semi'; jmp = 'hop';
        msg = `<b>반도체</b> (실리콘 1.1eV) — 적당한 틈: 열·전압·도핑으로 <b>건널 수 있다</b> = 조건부 스위치!`;
      } else {
        cls = 'insul'; jmp = 'none';
        msg = '<b>부도체</b> (유리·고무) — 틈이 너무 넓어 전자가 건너지 못한다';
      }
      verdict.dataset.v = cls;
      verdict.innerHTML = msg;
      jump.dataset.j = jmp;
      cap.innerHTML = '슬라이더로 에너지 틈을 조절해 보세요 — 물질의 운명이 갈립니다.';
    }
    slider.addEventListener('input', render);
    render();
  },

  /* ── HDD 탐색: 헤드 이동 + 회전 대기를 직접 겪는다 ── */
  hddseek(el) {
    const CX = 112, CY = 96;
    const TRACKS = [38, 56, 74];          // 안쪽→바깥쪽 반경
    const FULLSEEK = 8, ROTMS = 8.3;      // 풀스트로크 탐색 8ms, 1회전 8.3ms(7200rpm)
    let headTrack = 2, busy = false;

    const REQ = [
      { name: 'A · 안쪽 멀리', track: 0, angle: 250 },
      { name: 'B · 같은 트랙', track: -1, angle: 140 },  // -1 = 현재 트랙
      { name: 'C · 바깥쪽', track: 2, angle: 320 },
    ];

    el.innerHTML = `
      <div class="lab lab--hdd">
        <div class="lab__tabs">${REQ.map((r, i) => `<button class="lab__tab" data-r="${i}">${r.name}</button>`).join('')}</div>
        <svg class="hdd-svg" viewBox="0 0 230 192">
          <circle cx="${CX}" cy="${CY}" r="82" fill="#11202c" stroke="#26384a" stroke-width="1.5"/>
          ${TRACKS.map(r => `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="#2c7a78" stroke-dasharray="2 5" opacity=".55"/>`).join('')}
          <g class="hdd-sec"><circle class="hdd-dot" cx="${CX + 56}" cy="${CY}" r="5.5" fill="#f0bf5a"/></g>
          <circle cx="${CX}" cy="${CY}" r="15" fill="#33414f"/>
          <circle cx="${CX}" cy="${CY}" r="4" fill="#2c7a78"/>
          <g class="hdd-arm">
            <path d="M226 ${CY} H${CX + 74}" stroke="#33414f" stroke-width="7" stroke-linecap="round"/>
            <circle class="hdd-head" cx="${CX + 74}" cy="${CY}" r="6" fill="#56d6cf"/>
          </g>
        </svg>
        <div class="hdd-stats">
          <span>탐색 <b data-h="seek">—</b></span>
          <span>회전 <b data-h="rot">—</b></span>
          <span>합계 <b data-h="tot">—</b></span>
        </div>
        <p class="lab__caption">요청을 골라보세요 — 헤드가 움직이고, 원반이 돌아올 때까지 기다립니다.</p>
      </div>`;

    const secG = el.querySelector('.hdd-sec');
    const dot = el.querySelector('.hdd-dot');
    const armG = el.querySelector('.hdd-arm');
    const cap = el.querySelector('.lab__caption');
    const S = (k) => el.querySelector(`[data-h="${k}"]`);
    const tabs = el.querySelectorAll('.lab__tab');

    secG.style.transformOrigin = `${CX}px ${CY}px`;
    armG.style.transformOrigin = `226px ${CY}px`;

    function run(i) {
      if (busy) return;
      busy = true;
      tabs.forEach((t, j) => t.classList.toggle('lab__tab--on', j === i));
      const r = REQ[i];
      const target = r.track === -1 ? headTrack : r.track;
      const seekMs = Math.abs(target - headTrack) / (TRACKS.length - 1) * FULLSEEK;
      const rotMs = r.angle / 360 * ROTMS;
      const totMs = seekMs + rotMs + 0.1;

      // 섹터를 시작 각도·트랙에 즉시 배치 (전환 없이)
      secG.classList.add('hdd-notrans');
      dot.setAttribute('cx', CX + TRACKS[target]);
      secG.style.transform = `rotate(${r.angle}deg)`;
      void secG.offsetWidth;
      secG.classList.remove('hdd-notrans');

      // ① 탐색: 헤드 이동
      S('seek').textContent = seekMs.toFixed(1) + 'ms';
      S('rot').textContent = '—'; S('tot').textContent = '—';
      cap.innerHTML = `① <b>탐색</b> — 헤드를 트랙으로 이동 (${seekMs.toFixed(1)}ms)` + (seekMs === 0 ? ' · 이미 그 트랙!' : '');
      armG.style.transform = `translateX(${TRACKS[target] - 74}px)`;
      setTimeout(() => {
        // ② 회전 대기: 섹터가 헤드(각도 0) 밑으로
        S('rot').textContent = rotMs.toFixed(1) + 'ms';
        cap.innerHTML = `② <b>회전 대기</b> — 섹터가 돌아올 때까지 (${rotMs.toFixed(1)}ms)`;
        secG.style.transform = 'rotate(0deg)';
        setTimeout(() => {
          // ③ 읽기
          dot.classList.add('hdd-dot--read');
          S('tot').textContent = totMs.toFixed(1) + 'ms';
          const ratio = Math.round(totMs / 0.1);
          cap.innerHTML = `③ <b>읽기!</b> 합계 <b>${totMs.toFixed(1)}ms</b> — SSD라면 ≈0.1ms, <b>약 ${ratio}배</b> 차이`;
          setTimeout(() => { dot.classList.remove('hdd-dot--read'); busy = false; }, 500);
          headTrack = target;
        }, 300 + rotMs * 90);
      }, 250 + seekMs * 90);
    }
    tabs.forEach((t) => t.addEventListener('click', () => run(+t.dataset.r)));
  },

  /* ── 래스터화: 꼭짓점을 끌면 덮인 픽셀이 판정된다 ── */
  raster(el) {
    const W = 240, H = 180, CS = 20;
    const v = [[34, 150], [120, 24], [206, 140]];
    el.innerHTML = `
      <div class="lab lab--raster">
        <svg class="raster-svg" viewBox="0 0 ${W} ${H}">
          <g class="raster-cells"></g>
          <path class="raster-tri" fill="none" stroke="#f0bf5a" stroke-width="1.5"/>
          ${v.map((_, i) => `<circle class="raster-v" data-i="${i}" r="8" fill="#f0bf5a" stroke="#070a0f" stroke-width="1.5"/>`).join('')}
        </svg>
        <p class="lab__caption"></p>
      </div>`;
    const svgEl = el.querySelector('.raster-svg');
    const cellsG = el.querySelector('.raster-cells');
    const triEl = el.querySelector('.raster-tri');
    const cap = el.querySelector('.lab__caption');
    const dots = el.querySelectorAll('.raster-v');

    const sign = (p, a, b) => (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]);
    function inside(p) {
      const d1 = sign(p, v[0], v[1]), d2 = sign(p, v[1], v[2]), d3 = sign(p, v[2], v[0]);
      const neg = (d1 < 0) || (d2 < 0) || (d3 < 0), pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
      return !(neg && pos);
    }
    function render() {
      let html = '', n = 0;
      for (let r = 0; r < H / CS; r++) for (let c = 0; c < W / CS; c++) {
        const ins = inside([c * CS + CS / 2, r * CS + CS / 2]);
        if (ins) n++;
        html += `<rect x="${c * CS}" y="${r * CS}" width="${CS - 1}" height="${CS - 1}" fill="${ins ? '#1f4631' : '#0c121b'}" stroke="#1b2733" stroke-width=".5"/>`;
      }
      cellsG.innerHTML = html;
      triEl.setAttribute('d', `M${v[0]} L${v[1]} L${v[2]} Z`);
      dots.forEach((d, i) => { d.setAttribute('cx', v[i][0]); d.setAttribute('cy', v[i][1]); });
      cap.innerHTML = `덮인 픽셀 <b>${n}개</b> — 꼭짓점(●)을 끌어보세요. 셀 중심이 삼각형 안이면 점등!`;
    }
    let drag = -1;
    const toSvg = (e) => {
      const r = svgEl.getBoundingClientRect();
      return [
        Math.max(4, Math.min(W - 4, (e.clientX - r.left) * W / r.width)),
        Math.max(4, Math.min(H - 4, (e.clientY - r.top) * H / r.height)),
      ];
    };
    dots.forEach((d) => d.addEventListener('pointerdown', (e) => {
      drag = +d.dataset.i; d.setPointerCapture(e.pointerId); e.preventDefault();
    }));
    svgEl.addEventListener('pointermove', (e) => { if (drag >= 0) { v[drag] = toSvg(e); render(); } });
    svgEl.addEventListener('pointerup', () => { drag = -1; });
    render();
  },

  /* ── 워프 발산: 분기 시나리오 → 실행 패스와 효율 ── */
  divergence(el) {
    const SC = [
      ['모두 같은 길', 32, 0],
      ['반반 갈림', 16, 16],
      ['1명만 다른 길', 31, 1],
    ];
    el.innerHTML = `
      <div class="lab lab--div">
        <div class="lab__tabs">${SC.map((s, i) => `<button class="lab__tab" data-s="${i}">${s[0]}</button>`).join('')}</div>
        <div class="div-warp">${Array.from({ length: 32 }, (_, i) => `<span class="div-th" data-t="${i}"></span>`).join('')}</div>
        <div class="div-stats">
          <span>패스 <b data-d="pass">—</b></span>
          <span>효율 <b data-d="eff">—</b></span>
        </div>
        <p class="lab__caption">시나리오를 골라 보세요 — 워프 32스레드가 분기를 만나면?</p>
      </div>`;
    const tabs = el.querySelectorAll('.lab__tab');
    const ths = el.querySelectorAll('.div-th');
    const passEl = el.querySelector('[data-d="pass"]');
    const effEl = el.querySelector('[data-d="eff"]');
    const cap = el.querySelector('.lab__caption');
    let timer = null;

    function run(i) {
      const [name, a, b] = SC[i];
      tabs.forEach((t, j) => t.classList.toggle('lab__tab--on', j === i));
      if (timer) { clearTimeout(timer); timer = null; }
      const passes = b > 0 ? 2 : 1;
      const eff = Math.round(32 / (passes * 32) * 100);
      // 패스 1: if 쪽 활성
      ths.forEach((t, k) => { t.className = 'div-th ' + (k < a ? 'div-th--on' : 'div-th--mask'); });
      passEl.textContent = passes + '회';
      effEl.textContent = eff + '%';
      cap.innerHTML = `<b>패스 1</b>: if 쪽 ${a}명 실행, 나머지 ${b}명은 마스크(대기)`;
      if (b > 0) {
        timer = setTimeout(() => {
          ths.forEach((t, k) => { t.className = 'div-th ' + (k < a ? 'div-th--mask' : 'div-th--on2'); });
          cap.innerHTML = `<b>패스 2</b>: else 쪽 ${b}명 실행 — 단 ${b}명을 위해 한 바퀴 더! 효율 ${eff}%`;
        }, 1000);
      } else {
        cap.innerHTML = `모두 같은 길 → <b>한 번에 끝</b>. 효율 100% — GPU가 좋아하는 코드입니다`;
      }
    }
    tabs.forEach((t) => t.addEventListener('click', () => run(+t.dataset.s)));
    run(0);
  },

  /* ── 텐서 레이스: 범용 ALU 64스텝 vs 텐서 코어 1명령 ── */
  tensorrace(el) {
    const N = 64;
    el.innerHTML = `
      <div class="lab lab--race">
        <button class="race-go">▶ 4×4 행렬곱 실행 (곱-누산 64개)</button>
        <div class="race-row">
          <span class="race-name">범용 ALU</span>
          <div class="race-track">${Array.from({ length: N }, () => '<span class="race-cell"></span>').join('')}</div>
          <span class="race-count" data-r="alu">0</span>
        </div>
        <div class="race-row">
          <span class="race-name">텐서 코어</span>
          <div class="race-track race-track--one"><span class="race-cell race-cell--big"></span></div>
          <span class="race-count" data-r="tc">0</span>
        </div>
        <p class="lab__caption">한쪽은 64번, 한쪽은 단 1번 — 직접 출발시켜 보세요.</p>
      </div>`;
    const btn = el.querySelector('.race-go');
    const aluCells = el.querySelectorAll('.race-track:not(.race-track--one) .race-cell');
    const tcCell = el.querySelector('.race-cell--big');
    const aluN = el.querySelector('[data-r="alu"]');
    const tcN = el.querySelector('[data-r="tc"]');
    const cap = el.querySelector('.lab__caption');
    let timer = null;

    btn.addEventListener('click', () => {
      if (timer) clearInterval(timer);
      aluCells.forEach((c) => c.classList.remove('race-cell--on'));
      tcCell.classList.remove('race-cell--on');
      aluN.textContent = '0'; tcN.textContent = '0';
      cap.innerHTML = '경주 중…';
      let i = 0;
      // 텐서 코어: 첫 박자에 끝
      setTimeout(() => { tcCell.classList.add('race-cell--on'); tcN.textContent = '1 명령 ✓'; }, 60);
      timer = setInterval(() => {
        aluCells[i].classList.add('race-cell--on');
        i++; aluN.textContent = i + ' 스텝';
        if (i >= N) {
          clearInterval(timer); timer = null;
          cap.innerHTML = `범용 ALU <b>${N}스텝</b> vs 텐서 코어 <b>1명령</b> — 전용화의 격차입니다`;
        }
      }, 45);
    });
  },
};
