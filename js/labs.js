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
};
