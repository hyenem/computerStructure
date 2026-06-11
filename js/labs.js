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
};
