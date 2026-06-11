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
};
