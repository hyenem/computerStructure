/* ============================================================
   scenes.js — 부품별 SVG 도식(실제 생김새/구조 모사)
   SCENES[id] → SVG 문자열. 하위 부품은 도식 위 실제 위치의 핫스팟.
   - hot(kid,label,body,lx,ly,anchor) : 클릭 가능한 하위 부품
   - lbl/wire/grid : 정적 보조 그래픽
   핫스팟이 정의되지 않은 노드는 app.js가 카드 그리드로 폴백.
   viewBox 0 0 600 420 공통.
   ============================================================ */
(function () {
  const C = {
    pan:'#0c121b', pan2:'#101a25', ln:'#1b2733', ln2:'#26384a',
    ink:'#e2e9f0', dim:'#7e8d9d', fnt:'#566578',
    gold:'#f0bf5a', goldD:'#a9803a', cyan:'#56d6cf', cyanD:'#2c7a78',
    grn:'#86e6a2', pcb:'#0e2a20', pcbL:'#1f6b47', si:'#3a4658', metal:'#33414f',
  };

  // 클릭 가능한 하위 부품(핫스팟)
  function hot(kid, label, body, lx, ly, anchor) {
    anchor = anchor || 'start';
    return `<g class="hot" data-kid="${kid}" tabindex="0" role="button" aria-label="${label}">
      ${body}
      <text class="hot__label" x="${lx}" y="${ly}" text-anchor="${anchor}">${label}</text>
      <text class="hot__go" x="${lx}" y="${ly + 13}" text-anchor="${anchor}">▸ 들어가기</text>
    </g>`;
  }
  function lbl(x, y, t, anchor) {
    return `<text class="s-label" x="${x}" y="${y}" text-anchor="${anchor || 'start'}">${t}</text>`;
  }
  function svg(inner) {
    return `<svg class="scene" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid meet" role="img">${inner}</svg>`;
  }
  // 반복 그래픽 헬퍼
  function fins(x, y, w, h, n, col) { // 방열판 핀
    let s = '';
    const gap = w / n;
    for (let i = 0; i < n; i++) s += `<rect x="${x + i * gap}" y="${y}" width="${gap * .55}" height="${h}" fill="${col}"/>`;
    return s;
  }
  function pins(x, y, cols, rows, gap, col) { // 핀 격자
    let s = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
      s += `<circle cx="${x + c * gap}" cy="${y + r * gap}" r="1.4" fill="${col}"/>`;
    return s;
  }
  function traces(seed) { // PCB 회로 배선(장식)
    let s = '';
    for (let i = 0; i < 7; i++) {
      const y = 40 + i * 50 + (seed ? 7 : 0);
      s += `<path d="M30 ${y} H${120 + i * 30} V${y + 22} H${260}" fill="none" stroke="${C.pcbL}" stroke-width="1" opacity=".35"/>`;
    }
    return s;
  }
  // 오른쪽 화살표
  function arrowR(x1, y, x2, col) {
    return `<path d="M${x1} ${y} H${x2}" stroke="${col}" stroke-width="2" fill="none"/>
            <path d="M${x2 - 9} ${y - 6} L${x2} ${y} L${x2 - 9} ${y + 6}" fill="${col}"/>`;
  }
  // 경로 d를 따라 흐르는 입자 n개(데이터·전류·신호 연출)
  function flow(d, col, n, dur, r) {
    n = n || 3; dur = dur || 2.4; r = r || 3;
    let s = '';
    for (let i = 0; i < n; i++) {
      const begin = (-dur * i / n).toFixed(2);
      s += `<circle r="${r}" fill="${col}" opacity=".9">
        <animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}"/>
      </circle>`;
    }
    return s;
  }
  // 자체 중심으로 회전(팬·플래터). cls: spin | spin-slow | spin-rev
  function spin(inner, cls) {
    return `<g class="${cls || 'spin'}">${inner}</g>`;
  }
  // 헤더(제목 strip) 달린 클릭 가능한 부품 패널
  function bay(kid, label, x, y, w, h, art, opts) {
    opts = opts || {};
    const fill = opts.fill || C.pan2;
    const accent = opts.accent || C.cyanD;
    const body = `
      <rect class="hot__shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${C.ln2}" stroke-width="1.5"/>
      <rect x="${x}" y="${y}" width="5" height="${h}" rx="2.5" fill="${accent}" opacity=".7"/>
      <line x1="${x + 5}" y1="${y + 26}" x2="${x + w}" y2="${y + 26}" stroke="${C.ln}" stroke-width="1"/>
      ${art}`;
    return hot(kid, label, body, x + 16, y + 18);
  }

  const SCENES = {

    /* ─── L0 본체: 케이스 내부 배치도 (겹침 없는 6개 패널) ─── */
    case: svg(`
      <rect x="14" y="14" width="572" height="392" rx="12" fill="${C.pan}" stroke="${C.ln2}" stroke-width="1.5"/>
      <rect x="22" y="22" width="556" height="376" rx="8" fill="none" stroke="${C.ln}" stroke-dasharray="3 5"/>
      ${lbl(30, 40, 'CASE · 내부 구성')}

      ${bay('motherboard', '메인보드', 250, 56, 312, 210,
        `<path d="M270 120 H540 M270 150 H470 M270 250 H540" stroke="${C.pcbL}" stroke-width="1" opacity=".5" fill="none"/>
         <rect x="300" y="104" width="84" height="84" rx="3" fill="${C.metal}" stroke="${C.ln2}"/>
         ${pins(312, 116, 7, 7, 11, C.cyanD)}
         <text x="342" y="206" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.dim}">CPU 소켓</text>
         <rect x="430" y="104" width="112" height="9" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>
         <rect x="430" y="120" width="112" height="9" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>
         <rect x="430" y="136" width="112" height="9" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>
         <rect x="430" y="152" width="112" height="9" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>
         <text x="486" y="178" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.dim}">RAM 슬롯</text>`,
        { fill: C.pcb, accent: C.pcbL })}

      ${bay('cooler', '냉각 시스템', 250, 280, 150, 104,
        `${fins(262, 312, 126, 50, 9, C.pan)}
         ${spin(`<circle cx="325" cy="345" r="26" fill="${C.pan}" stroke="${C.cyanD}"/>
           <path d="M325 345 L325 322 M325 345 L345 357 M325 345 L305 357" stroke="${C.cyanD}" stroke-width="2.5"/>`)}`)}

      ${bay('gpu', '그래픽카드', 412, 280, 150, 104,
        `<rect x="426" y="312" width="122" height="58" rx="4" fill="#12202c" stroke="${C.cyanD}"/>
         <circle cx="457" cy="341" r="17" fill="${C.pan}" stroke="${C.cyanD}"/>
         <circle cx="457" cy="341" r="4" fill="${C.cyanD}"/>
         <circle cx="513" cy="341" r="17" fill="${C.pan}" stroke="${C.cyanD}"/>
         <circle cx="513" cy="341" r="4" fill="${C.cyanD}"/>`)}

      ${bay('storage', '저장장치', 38, 56, 188, 116,
        `<rect x="52" y="92" width="160" height="30" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="52" y="128" width="160" height="30" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <circle cx="200" cy="107" r="3" fill="${C.cyanD}"/>
         <circle cx="200" cy="143" r="3" fill="${C.cyanD}"/>`)}

      ${bay('io', '입출력 포트', 38, 184, 188, 78,
        `<rect x="54" y="220" width="30" height="14" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>
         <rect x="92" y="220" width="30" height="14" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>
         <circle cx="146" cy="227" r="9" fill="${C.pan}" stroke="${C.ln2}"/>
         <rect x="166" y="220" width="44" height="14" rx="2" fill="${C.pan}" stroke="${C.ln2}"/>`)}

      ${bay('psu', '전원공급장치', 38, 280, 188, 104,
        `<rect x="56" y="312" width="152" height="58" rx="4" fill="#13202b" stroke="${C.ln2}"/>
         ${spin(`<circle cx="132" cy="341" r="24" fill="none" stroke="${C.goldD}" stroke-width="1.5"/>
           <path d="M132 317 V365 M108 341 H156 M115 324 L149 358 M149 324 L115 358" stroke="${C.goldD}" stroke-width="1" opacity=".6"/>`, 'spin-slow')}`,
        { accent: C.goldD })}

      <!-- 데이터의 여정: 저장장치 → CPU → GPU(화면) -->
      <path d="M226 107 H264 V146 H300" fill="none" stroke="${C.gold}" stroke-width="1" stroke-dasharray="3 4" opacity=".4"/>
      ${flow('M226 107 H264 V146 H298', C.gold, 2, 2.6, 2.5)}
      <path d="M384 146 H398 V341 H424" fill="none" stroke="${C.cyan}" stroke-width="1" stroke-dasharray="3 4" opacity=".4"/>
      ${flow('M386 146 H398 V341 H422', C.cyan, 2, 2.8, 2.5)}
      <text x="300" y="412" text-anchor="middle" class="s-label" fill="${C.fnt}">·· 데이터의 여정 — 저장장치에서 깨어나 CPU를 거쳐 GPU(화면)로 ··</text>
    `),

    /* ─── L1 메인보드: PCB 탑뷰 ─── */
    motherboard: svg(`
      <rect x="14" y="14" width="572" height="392" rx="8" fill="${C.pcb}" stroke="${C.pcbL}" stroke-width="1.5"/>
      ${traces(0)}
      ${lbl(30, 36, 'MOTHERBOARD · 탑뷰')}
      <circle cx="40" cy="402" r="0"/>

      ${hot('cpu', 'CPU',
        `<rect class="hot__shape" x="206" y="120" width="170" height="170" rx="6" fill="${C.metal}" stroke="${C.ln2}" stroke-width="1.5"/>
         <rect x="224" y="138" width="134" height="134" rx="3" fill="${C.pan}" stroke="${C.cyanD}"/>
         ${pins(236, 150, 11, 11, 11, C.cyanD)}`,
        291, 308, 'middle')}

      ${hot('ram', 'RAM',
        `<rect class="hot__shape" x="430" y="70" width="128" height="250" rx="4" fill="none"/>
         <rect x="430" y="78"  width="128" height="14" rx="2" fill="${C.pan2}" stroke="${C.ln2}"/>
         <rect x="430" y="100" width="128" height="14" rx="2" fill="${C.pan2}" stroke="${C.ln2}"/>
         <rect x="430" y="122" width="128" height="14" rx="2" fill="${C.pan2}" stroke="${C.ln2}"/>
         <rect x="430" y="144" width="128" height="14" rx="2" fill="${C.pan2}" stroke="${C.ln2}"/>`,
        494, 184, 'middle')}

      ${hot('chipset', '칩셋·버스',
        `<rect class="hot__shape" x="250" y="318" width="92" height="68" rx="4" fill="${C.metal}" stroke="${C.ln2}"/>
         ${fins(256, 326, 80, 52, 7, C.pan)}`,
        296, 402, 'middle')}

      ${hot('rom', 'ROM·BIOS',
        `<rect class="hot__shape" x="70" y="320" width="96" height="50" rx="3" fill="${C.pan2}" stroke="${C.goldD}"/>
         <rect x="78" y="328" width="80" height="34" rx="2" fill="${C.pan}"/>
         <text x="118" y="350" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.goldD}">BIOS</text>`,
        118, 388, 'middle')}

      <!-- 버스를 따라 흐르는 데이터 -->
      ${flow('M376 205 H430', C.cyan, 2, 1.8, 2.5)}
      ${flow('M291 290 V318', C.cyan, 2, 1.6, 2.5)}
      ${flow('M250 352 H166', C.gold, 2, 2.2, 2.5)}
    `),

    /* ─── L2 CPU: 다이 플로어플랜 ─── */
    cpu: svg(`
      <rect x="60" y="40" width="480" height="340" rx="10" fill="${C.metal}" stroke="${C.ln2}" stroke-width="1.5"/>
      ${pins(78, 58, 1, 1, 1, C.ln2)}
      ${lbl(74, 32, 'CPU DIE · 플로어플랜')}
      <rect x="92" y="68" width="416" height="284" rx="6" fill="${C.pan}" stroke="${C.cyanD}"/>

      ${hot('control', '제어장치',
        `<rect class="hot__shape" x="110" y="86" width="180" height="80" rx="4" fill="#14202c" stroke="${C.ln2}"/>
         <path d="M120 126 H280 M150 96 V156" stroke="${C.cyanD}" stroke-width="1" opacity=".5"/>`,
        200, 130, 'middle')}

      ${hot('alu', 'ALU',
        `<rect class="hot__shape" x="310" y="86" width="180" height="80" rx="4" fill="#1a2030" stroke="${C.gold}"/>
         <path d="M350 96 L450 96 L437 132 L363 132 Z" fill="none" stroke="${C.goldD}" stroke-width="1.5"/>`,
        400, 152, 'middle')}

      ${hot('pipeline', '파이프라인',
        `<rect class="hot__shape" x="310" y="186" width="180" height="60" rx="4" fill="#14202c" stroke="${C.ln2}"/>
         ${['IF','ID','EX','ME','WB'].map((s,i) => `
           <rect x="${318+i*34}" y="196" width="28" height="20" rx="2" fill="${C.pan}" stroke="${C.cyanD}"/>
           <text x="${332+i*34}" y="210" text-anchor="middle" font-family="monospace" font-size="7.5" fill="${C.cyan}">${s}</text>`).join('')}
         ${flow('M318 226 H486', C.cyan, 3, 1.8, 2)}`,
        400, 238, 'middle')}

      ${hot('register', '레지스터',
        `<rect class="hot__shape" x="110" y="186" width="180" height="60" rx="4" fill="#14202c" stroke="${C.ln2}"/>
         <rect x="122" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>
         <rect x="160" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>
         <rect x="198" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>
         <rect x="236" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>`,
        200, 232, 'middle')}

      ${hot('cache', '캐시 메모리',
        `<rect class="hot__shape" x="110" y="266" width="380" height="60" rx="4" fill="#13202b" stroke="${C.ln2}"/>
         ${fins(120, 274, 360, 44, 26, C.pan2)}`,
        300, 300, 'middle')}
      <text x="300" y="372" text-anchor="middle" class="s-label" fill="${C.dim}">이 한 묶음이 "코어" 1개 — 요즘 CPU엔 이런 코어가 4·8·16개</text>
    `),

    /* ─── L3 ALU: 사다리꼴 회로기호 ─── */
    alu: svg(`
      ${lbl(40, 40, 'ARITHMETIC LOGIC UNIT')}
      <path d="M120 90 L280 90 L300 130 L320 90 L480 90 L410 330 L190 330 Z"
            fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="300" y="80" text-anchor="middle" class="s-label" fill="${C.dim}">입력 A</text>
      <text x="300" y="118" text-anchor="middle" class="s-label" fill="${C.dim}">입력 B</text>
      <path d="M210 70 V90 M390 70 V90" stroke="${C.cyanD}" stroke-width="2"/>
      <text x="500" y="200" class="s-label" fill="${C.goldD}">연산 선택</text>
      <path d="M480 200 L410 210" stroke="${C.goldD}" stroke-width="1.5"/>
      <text x="300" y="360" text-anchor="middle" class="s-label" fill="${C.grn}">결과 출력 ↓</text>
      <path d="M300 330 V356" stroke="${C.grn}" stroke-width="2"/>
      ${flow('M210 72 V128', C.cyan, 2, 1.6, 2.5)}
      ${flow('M390 72 V128', C.cyan, 2, 1.6, 2.5)}
      ${flow('M300 250 V356', C.grn, 2, 1.8, 2.5)}

      ${hot('adder', '가산기',
        `<rect class="hot__shape" x="200" y="150" width="92" height="130" rx="4" fill="#1a2433" stroke="${C.cyanD}"/>
         <text x="246" y="200" text-anchor="middle" font-family="monospace" font-size="20" fill="${C.cyan}">＋</text>`,
        246, 300, 'middle')}

      ${hot('logic', '논리연산',
        `<rect class="hot__shape" x="308" y="150" width="92" height="130" rx="4" fill="#1a2433" stroke="${C.cyanD}"/>
         <text x="354" y="200" text-anchor="middle" font-family="monospace" font-size="18" fill="${C.cyan}">∧∨</text>`,
        354, 300, 'middle')}
    `),

    /* ─── L4 가산기: 반가산기 게이트 배선 ─── */
    adder: svg(`
      ${lbl(40, 40, 'HALF ADDER · 게이트 배선')}
      <!-- 입력선 -->
      <text x="44" y="135" class="s-label" fill="${C.dim}">A</text>
      <text x="44" y="245" class="s-label" fill="${C.dim}">B</text>
      <path d="M60 130 H170 M60 240 H140" stroke="${C.cyanD}" stroke-width="2" fill="none"/>
      <path d="M110 130 V200 H170" stroke="${C.cyanD}" stroke-width="2" fill="none"/>
      <path d="M90 240 V170 H170" stroke="${C.cyanD}" stroke-width="2" fill="none"/>
      <circle cx="110" cy="130" r="3" fill="${C.cyan}"/>
      <circle cx="90" cy="240" r="3" fill="${C.cyan}"/>

      ${hot('gate', '논리게이트',
        `<!-- XOR gate -->
         <path class="hot__shape" d="M176 120 Q205 150 176 180 Q220 180 246 150 Q220 120 176 120 Z" fill="#16222e" stroke="${C.gold}" stroke-width="1.5"/>
         <path d="M168 120 Q196 150 168 180" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
         <text x="206" y="155" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">XOR</text>
         <!-- AND gate -->
         <path class="hot__shape" d="M176 200 H210 Q246 200 246 230 Q246 260 210 260 H176 Z" fill="#16222e" stroke="${C.gold}" stroke-width="1.5"/>
         <text x="206" y="235" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">AND</text>`,
        300, 175, 'middle')}

      <!-- 출력선 -->
      <path d="M246 150 H470" stroke="${C.grn}" stroke-width="2" fill="none"/>
      <path d="M246 230 H470" stroke="${C.grn}" stroke-width="2" fill="none"/>
      <text x="478" y="155" class="s-label" fill="${C.grn}">합 (Sum)</text>
      <text x="478" y="235" class="s-label" fill="${C.grn}">자리올림 (Carry)</text>
      <!-- 신호 흐름 -->
      ${flow('M60 130 H170', C.cyan, 2, 1.6, 2.5)}
      ${flow('M60 240 H140 M90 240 V170 H170', C.cyan, 2, 1.9, 2.5)}
      ${flow('M246 150 H470', C.grn, 2, 1.8, 2.5)}
      ${flow('M246 230 H470', C.grn, 2, 2.0, 2.5)}

      <!-- 확장: 전가산기 = 반가산기 ×2 + OR -->
      <text x="300" y="298" text-anchor="middle" class="s-label" fill="${C.fnt}">확장 — 아랫자리 올림(Cin)까지 받는 전가산기:</text>
      <text x="40" y="330" font-family="monospace" font-size="9" fill="${C.dim}">A,B</text>
      <path d="M66 326 H88" stroke="${C.cyanD}" stroke-width="1.5"/>
      <rect x="88" y="312" width="88" height="40" rx="4" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <text x="132" y="336" text-anchor="middle" font-family="monospace" font-size="8.5" fill="${C.cyan}">반가산기 1</text>
      <text x="252" y="296" font-family="monospace" font-size="9" fill="${C.dim}">Cin ↓</text>
      <path d="M268 300 V312" stroke="${C.cyanD}" stroke-width="1.5"/>
      <path d="M176 324 H224" stroke="${C.grn}" stroke-width="1.5"/>
      <rect x="224" y="312" width="88" height="40" rx="4" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <text x="268" y="336" text-anchor="middle" font-family="monospace" font-size="8.5" fill="${C.cyan}">반가산기 2</text>
      <path d="M312 324 H560" stroke="${C.grn}" stroke-width="1.5"/>
      <text x="536" y="318" font-family="monospace" font-size="9" fill="${C.grn}">합</text>
      <path d="M132 352 V376 H368 M268 352 V376" stroke="${C.goldD}" stroke-width="1.5" fill="none"/>
      <rect x="368" y="358" width="64" height="36" rx="4" fill="${C.pan2}" stroke="${C.goldD}"/>
      <text x="400" y="380" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.gold}">OR</text>
      <path d="M432 376 H560" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="510" y="370" font-family="monospace" font-size="9" fill="${C.gold}">올림 Cout</text>
      ${flow('M178 324 H222', C.grn, 1, 1.5, 2)}
      ${flow('M434 376 H558', C.gold, 1, 1.7, 2)}
    `),

    /* ─── L5 논리게이트: AND 기호 + 트랜지스터로 분해 ─── */
    gate: svg(`
      ${lbl(40, 40, 'LOGIC GATE · AND 기호')}
      <path d="M70 130 H190 M70 230 H190" stroke="${C.cyanD}" stroke-width="2"/>
      <text x="52" y="135" class="s-label" fill="${C.dim}">A</text>
      <text x="52" y="235" class="s-label" fill="${C.dim}">B</text>
      <path d="M190 100 H250 Q330 100 330 180 Q330 260 250 260 H190 Z"
            fill="${C.pan2}" stroke="${C.gold}" stroke-width="2"/>
      <text x="250" y="186" text-anchor="middle" font-family="monospace" font-size="18" fill="${C.gold}">AND</text>
      <path d="M330 180 H400" stroke="${C.grn}" stroke-width="2"/>
      <text x="404" y="185" class="s-label" fill="${C.grn}">출력</text>
      ${flow('M70 130 H190', C.cyan, 2, 1.7, 2.5)}
      ${flow('M70 230 H190', C.cyan, 2, 1.9, 2.5)}
      ${flow('M330 180 H398', C.grn, 2, 1.7, 2.5)}
      <text x="250" y="300" text-anchor="middle" class="s-label" fill="${C.dim}">이 게이트는 무엇으로 만들까? ↓</text>

      <!-- 내부 회로: CMOS — PMOS 병렬(위) + NMOS 직렬(아래) = NAND -->
      <rect x="438" y="56" width="148" height="240" rx="6" fill="#0f1620" stroke="${C.ln2}"/>
      <text x="512" y="74" text-anchor="middle" font-family="monospace" font-size="8.5" fill="${C.fnt}">내부 회로 · CMOS</text>
      <text x="512" y="92" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.gold}">VDD (전원)</text>
      <path d="M458 98 H566" stroke="${C.gold}" stroke-width="1.5"/>
      <rect x="464" y="108" width="44" height="26" rx="3" fill="${C.pan2}" stroke="${C.cyan}"/>
      <text x="486" y="125" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.cyan}">P (A)</text>
      <rect x="516" y="108" width="44" height="26" rx="3" fill="${C.pan2}" stroke="${C.cyan}"/>
      <text x="538" y="125" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.cyan}">P (B)</text>
      <path d="M486 98 V108 M538 98 V108 M486 134 V150 M538 134 V150" stroke="${C.ln2}"/>
      <path d="M458 150 H566" stroke="${C.grn}" stroke-width="1.5"/>
      ${flow('M460 150 H564', C.grn, 1, 1.8, 2)}
      <rect x="490" y="160" width="44" height="26" rx="3" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <text x="512" y="177" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.cyanD}">N (A)</text>
      <rect x="490" y="196" width="44" height="26" rx="3" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <text x="512" y="213" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.cyanD}">N (B)</text>
      <path d="M512 150 V160 M512 186 V196 M512 222 V234" stroke="${C.ln2}"/>
      <path d="M458 234 H566" stroke="${C.fnt}" stroke-width="1.5"/>
      <text x="512" y="250" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.fnt}">GND (접지)</text>
      <text x="512" y="268" text-anchor="middle" font-family="monospace" font-size="7.5" fill="${C.dim}">P병렬 + N직렬 = NAND (4T)</text>
      <text x="512" y="282" text-anchor="middle" font-family="monospace" font-size="7.5" fill="${C.dim}">+ NOT(2T) → AND = 6개</text>

      ${hot('transistor', '트랜지스터',
        `<rect class="hot__shape" x="180" y="320" width="240" height="78" rx="6" fill="#16222e" stroke="${C.cyanD}" stroke-width="1.5"/>
         <path d="M210 388 V346 M210 346 H236" stroke="${C.cyan}" stroke-width="2" fill="none"/>
         <path d="M260 330 V388 M236 340 V392" stroke="${C.cyan}" stroke-width="2" fill="none"/>
         <path d="M260 350 H300 V330 M260 374 H300 V392" stroke="${C.cyan}" stroke-width="2" fill="none"/>
         <text x="360" y="365" font-family="monospace" font-size="11" fill="${C.cyan}">스위치 ×N</text>`,
        300, 414, 'middle')}
    `),

    /* ─── L6 트랜지스터: MOSFET 단면도 ─── */
    transistor: svg(`
      ${lbl(40, 40, 'MOSFET · 단면도')}
      <!-- 기판(반도체) = 핫스팟 -->
      ${hot('semiconductor', '반도체 (기판)',
        `<rect class="hot__shape" x="80" y="200" width="440" height="150" rx="4" fill="#1d2a3a" stroke="${C.cyanD}" stroke-width="1.5"/>
         <text x="300" y="320" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">P형 실리콘 기판</text>`,
        300, 392, 'middle')}
      <!-- 소스 / 드레인 (N영역) -->
      <rect x="110" y="200" width="90" height="60" rx="3" fill="#21506b" stroke="${C.cyan}"/>
      <rect x="400" y="200" width="90" height="60" rx="3" fill="#21506b" stroke="${C.cyan}"/>
      <text x="155" y="235" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.cyan}">N</text>
      <text x="445" y="235" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.cyan}">N</text>
      <!-- 산화막 + 게이트 전극 -->
      <rect x="205" y="186" width="190" height="14" fill="${C.goldD}" opacity=".5"/>
      <rect x="225" y="150" width="150" height="36" rx="3" fill="${C.metal}" stroke="${C.gold}"/>
      <!-- 단자 라벨 -->
      <text x="155" y="180" text-anchor="middle" class="s-label" fill="${C.dim}">소스</text>
      <text x="300" y="142" text-anchor="middle" class="s-label" fill="${C.gold}">게이트</text>
      <text x="445" y="180" text-anchor="middle" class="s-label" fill="${C.dim}">드레인</text>
      <path d="M155 200 V178 M300 150 V128 M445 200 V178" stroke="${C.ln2}" stroke-width="1"/>
      <!-- 게이트가 열리면 소스→드레인으로 전자가 흐른다 -->
      <path d="M160 234 Q300 256 440 234" fill="none" stroke="${C.grn}" stroke-width="1" stroke-dasharray="2 4" opacity=".5"/>
      ${flow('M160 234 Q300 256 440 234', C.grn, 4, 1.8, 2.5)}
      <text x="300" y="290" text-anchor="middle" class="s-label" fill="${C.grn}">전자 흐름 = 전류</text>
    `),

    /* ─── L7 반도체: PN 접합 ─── */
    semiconductor: svg(`
      ${lbl(40, 40, 'PN 접합 · DIODE')}
      <!-- P형 -->
      <rect x="70" y="120" width="200" height="180" rx="4" fill="#3a2230" stroke="${C.goldD}" stroke-width="1.5"/>
      <text x="170" y="112" text-anchor="middle" class="s-label" fill="${C.gold}">P형 (정공 +)</text>
      ${[0,1,2,3,4,5,6,7].map(i=>`<text x="${92+(i%4)*40}" y="${160+Math.floor(i/4)*60}" font-size="16" fill="${C.gold}">+</text>`).join('')}
      <!-- N형 -->
      <rect x="330" y="120" width="200" height="180" rx="4" fill="#1d3344" stroke="${C.cyan}" stroke-width="1.5"/>
      <text x="430" y="112" text-anchor="middle" class="s-label" fill="${C.cyan}">N형 (전자 −)</text>
      ${[0,1,2,3,4,5,6,7].map(i=>`<text x="${352+(i%4)*40}" y="${160+Math.floor(i/4)*60}" font-size="16" fill="${C.cyan}">−</text>`).join('')}
      <!-- 공핍 영역 -->
      <rect x="270" y="120" width="60" height="180" fill="#11202c" opacity=".8"/>
      <line x1="300" y1="120" x2="300" y2="300" stroke="${C.ink}" stroke-dasharray="4 4"/>
      <text x="300" y="330" text-anchor="middle" class="s-label" fill="${C.dim}">공핍 영역 (한 방향으로만 전류 통과)</text>
      <!-- 정공·전자가 접합부로 드리프트 -->
      ${flow('M110 250 H262', C.gold, 2, 2.6, 3)}
      ${flow('M490 190 H338', C.cyan, 2, 2.6, 3)}

      ${hot('atom', '실리콘 원자',
        `<circle class="hot__shape" cx="300" cy="375" r="22" fill="#16222e" stroke="${C.cyanD}" stroke-width="1.5"/>
         <circle cx="300" cy="375" r="6" fill="${C.cyan}"/>`,
        300, 414, 'middle')}
    `),

    /* ─── L8 원자: 실리콘 결정 격자 (종착) ─── */
    atom: (function () {
      const nodes = [];
      const bonds = [];
      const cols = 5, rows = 4, gap = 110, ox = 70, oy = 90;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = ox + c * gap, y = oy + r * gap * .8;
        if (c < cols - 1) bonds.push(`<line x1="${x}" y1="${y}" x2="${x + gap}" y2="${y}" stroke="#2c7a78" stroke-width="1.5" opacity=".5"/>`);
        if (r < rows - 1) bonds.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + gap * .8}" stroke="#2c7a78" stroke-width="1.5" opacity=".5"/>`);
        nodes.push(`<circle cx="${x}" cy="${y}" r="13" fill="#16303a" stroke="#56d6cf" stroke-width="1.5"/>
                    <text x="${x}" y="${y + 4}" text-anchor="middle" font-family="monospace" font-size="9" fill="#86e6a2">Si</text>`);
      }
      // 떠도는 전자
      const e = [[170,150],[390,230],[280,310],[480,170]].map(([x,y]) =>
        `<circle cx="${x}" cy="${y}" r="4" fill="#86e6a2"><animate attributeName="cx" values="${x};${x+30};${x}" dur="3s" repeatCount="indefinite"/></circle>`).join('');
      return svg(`${lbl(40, 40, 'SILICON CRYSTAL · 결정 격자')}
        ${bonds.join('')}${nodes.join('')}${e}
        <text x="300" y="404" text-anchor="middle" class="s-label" fill="${C.dim}">초록 점 = 전자의 흐름 = 우리가 "전류"라 부른 것</text>`);
    })(),

    /* ─── 저장장치: SSD / HDD 분기 ─── */
    storage: svg(`
      ${lbl(40, 40, 'STORAGE')}
      ${hot('ssd', 'SSD',
        `<rect class="hot__shape" x="70" y="110" width="200" height="200" rx="6" fill="${C.pan2}" stroke="${C.cyanD}" stroke-width="1.5"/>
         <rect x="92" y="140" width="70" height="44" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="178" y="140" width="70" height="44" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="92" y="200" width="70" height="44" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="178" y="200" width="70" height="44" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="120" y="270" width="100" height="14" rx="2" fill="${C.metal}"/>`,
        170, 340, 'middle')}
      ${hot('hdd', 'HDD',
        `<rect class="hot__shape" x="330" y="110" width="200" height="200" rx="6" fill="${C.pan2}" stroke="${C.cyanD}" stroke-width="1.5"/>
         <circle cx="425" cy="205" r="78" fill="#13202b" stroke="${C.ln2}"/>
         <circle cx="425" cy="205" r="18" fill="${C.metal}"/>
         <circle cx="425" cy="205" r="4" fill="${C.cyanD}"/>
         <path d="M500 150 L430 200" stroke="${C.metal}" stroke-width="6" stroke-linecap="round"/>`,
        430, 340, 'middle')}
    `),

    /* ─── RAM: 셀로 분기 ─── */
    ram: svg(`
      ${lbl(40, 40, 'RAM · 메모리 격자')}
      <rect x="60" y="70" width="480" height="280" rx="6" fill="${C.pcb}" stroke="${C.pcbL}"/>
      ${(function(){let s='';for(let r=0;r<4;r++)for(let c=0;c<8;c++){s+=`<rect x="${84+c*56}" y="${94+r*60}" width="40" height="40" rx="3" fill="#13202b" stroke="${C.ln2}"/>`;}return s;})()}
      ${hot('memcell', '메모리 셀',
        `<rect class="hot__shape" x="82" y="92" width="44" height="44" rx="3" fill="#1a2c20" stroke="${C.gold}" stroke-width="2"/>
         <path d="M104 136 Q104 168 84 188" fill="none" stroke="${C.gold}" stroke-width="1" stroke-dasharray="2 3" opacity=".7"/>`,
        60, 378)}

      ${hot('virtualmem', '가상 메모리 · MMU',
        `<rect class="hot__shape" x="300" y="356" width="240" height="44" rx="5" fill="#16222e" stroke="${C.cyanD}" stroke-width="1.5"/>
         <text x="420" y="374" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.cyan}">가상 주소 → 물리 주소</text>`,
        420, 390, 'middle')}
    `),

    /* ─── 제어장치 ─── */
    control: svg(`
      ${lbl(40, 40, 'CONTROL UNIT · 지휘 흐름')}
      <rect x="56" y="100" width="150" height="58" rx="4" fill="${C.pan2}" stroke="${C.ln2}"/>
      <text x="131" y="134" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">명령 레지스터</text>
      ${arrowR(206, 129, 262, C.cyan)}
      <path d="M262 90 L406 90 L426 168 L282 168 Z" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="350" y="134" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.gold}">디코더</text>
      ${[0,1,2,3].map(i => arrowR(426, 108 + i*16, 506, C.grn) + flow(`M426 ${108+i*16} H500`, C.grn, 1, 1.5, 2)).join('')}
      ${flow('M206 129 H256', C.cyan, 2, 1.4, 2.5)}
      <text x="430" y="210" class="s-label" fill="${C.grn}">→ 제어신호: ALU · 레지스터 · 메모리에 "지금 무엇을 하라"</text>

      <!-- FSM: 명령 사이클의 상태 기계 (순환 구조) -->
      <text x="300" y="252" text-anchor="middle" class="s-label" fill="${C.fnt}">유한 상태 기계(FSM) — 매 명령마다 이 고리를 돈다</text>
      ${[['FETCH', 150, C.cyan], ['DECODE', 300, C.gold], ['EXEC', 450, C.grn]].map(([t, x, col]) => `
        <circle cx="${x}" cy="320" r="34" fill="${C.pan2}" stroke="${col}" stroke-width="1.5"/>
        <text x="${x}" y="325" text-anchor="middle" font-family="monospace" font-size="10" fill="${col}">${t}</text>`).join('')}
      <path d="M184 320 H416" stroke="${C.ln2}" stroke-width="1.5"/>
      <path d="M210 314 L184 320 L210 326 M330 314 L304 320 M444 314 L418 320" fill="none" stroke="${C.ln2}"/>
      <path d="M450 354 Q300 412 150 354" fill="none" stroke="${C.ln2}" stroke-width="1.5" stroke-dasharray="4 4"/>
      ${flow('M184 320 H266', C.cyan, 1, 1.4, 2.5)}
      ${flow('M334 320 H416', C.gold, 1, 1.4, 2.5)}
      ${flow('M450 354 Q300 412 150 354', C.grn, 2, 2.6, 2.5)}
      <text x="300" y="404" text-anchor="middle" class="s-label" fill="${C.fnt}">↺ 다음 명령으로</text>
    `),

    /* ─── 레지스터: 종류별 파일(각 행이 진입) ─── */
    register: (function () {
      const REGS = [
        ['reg_pc', 'PC', '프로그램 카운터', '다음 명령의 주소'],
        ['reg_ir', 'IR', '명령 레지스터', '실행 중인 명령'],
        ['reg_acc', 'ACC', '누산기', '연산 결과 누적'],
        ['reg_mar', 'MAR', '메모리 주소 레지스터', '접근할 메모리 주소'],
        ['reg_mdr', 'MDR', '메모리 데이터 레지스터', '메모리와 주고받는 값'],
        ['reg_sp', 'SP', '스택 포인터', '스택 꼭대기 주소'],
        ['reg_flags', 'FLG', '상태 레지스터', 'Z · N · C · V 플래그'],
        ['reg_gp', 'R0–R7', '범용 레지스터', '자유롭게 쓰는 작업칸'],
      ];
      const rows = REGS.map(([id, abbr, name, desc], i) => {
        const y = 54 + i * 45;
        return `<g class="hot" data-kid="${id}" tabindex="0" role="button" aria-label="${name}">
          <rect class="hot__shape" x="60" y="${y}" width="480" height="38" rx="5" fill="${C.pan2}" stroke="${C.ln2}"/>
          <rect x="70" y="${y + 6}" width="92" height="26" rx="3" fill="#070a0f" stroke="${C.cyanD}"/>
          <text x="116" y="${y + 23}" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">${abbr}</text>
          <text x="180" y="${y + 17}" font-family="'IBM Plex Sans KR', sans-serif" font-size="12.5" font-weight="600" fill="${C.ink}">${name}</text>
          <text x="180" y="${y + 31}" class="s-label" fill="${C.fnt}">${desc}</text>
          <text class="hot__go" x="526" y="${y + 23}" text-anchor="end" font-family="monospace" font-size="11" fill="${C.cyan}">▸ 들어가기</text>
        </g>`;
      }).join('');
      return svg(`${lbl(40, 36, 'REGISTER FILE · 레지스터 종류')}\n${rows}`);
    })(),

    /* ─── 캐시: L1<L2<L3 계층 ─── */
    cache: svg(`
      ${lbl(40, 40, 'CACHE · 속도 계층')}
      <rect x="90" y="70" width="420" height="280" rx="10" fill="#0f1a16" stroke="${C.ln2}"/>
      <text x="120" y="96" class="s-label" fill="${C.dim}">L3 (크고 느림)</text>
      <rect x="150" y="110" width="300" height="200" rx="8" fill="#13231d" stroke="${C.cyanD}"/>
      <text x="180" y="134" class="s-label" fill="${C.cyan}">L2</text>
      <rect x="210" y="150" width="180" height="120" rx="6" fill="#1a2c20" stroke="${C.gold}"/>
      <text x="236" y="172" class="s-label" fill="${C.gold}">L1 (작고 빠름)</text>
      <rect class="throb" x="262" y="190" width="76" height="62" rx="4" fill="${C.metal}" stroke="${C.ink}"/>
      <text x="300" y="226" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.ink}">CPU</text>
      ${flow('M110 300 Q190 280 262 232', C.cyan, 2, 2.4, 2.5)}
      <text x="300" y="338" text-anchor="middle" class="s-label" fill="${C.dim}">자주 쓰는 데이터일수록 CPU 가까이</text>
    `),

    /* ─── 논리연산: 세 기본 게이트 ─── */
    logic: svg(`
      ${lbl(40, 40, 'BOOLEAN · 기본 3종')}
      <path d="M90 110 H140 Q200 110 200 160 Q200 210 140 210 H90 Z" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="140" y="166" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.gold}">AND</text>
      <text x="140" y="236" text-anchor="middle" class="s-label" fill="${C.dim}">둘 다 1 → 1</text>
      <path d="M240 110 Q270 160 240 210 Q300 200 330 160 Q300 120 240 110 Z" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="280" y="166" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.gold}">OR</text>
      <text x="285" y="236" text-anchor="middle" class="s-label" fill="${C.dim}">하나라도 1 → 1</text>
      <path d="M390 110 L390 210 L460 160 Z" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <circle cx="468" cy="160" r="8" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="420" y="166" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">NOT</text>
      <text x="430" y="236" text-anchor="middle" class="s-label" fill="${C.dim}">뒤집기</text>
      <text x="300" y="284" text-anchor="middle" class="s-label" fill="${C.cyan}">이 셋만 있으면 어떤 계산이든 만들 수 있다</text>
      ${hot('gate', '논리게이트 자세히',
        `<rect class="hot__shape" x="180" y="316" width="240" height="56" rx="6" fill="#16222e" stroke="${C.gold}"/>
         <text x="300" y="349" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.gold}">게이트 회로 들여다보기 ↘</text>`,
        300, 406, 'middle')}
    `),

    /* ─── 칩셋·버스: 세 갈래 길(각 진입) ─── */
    chipset: (function () {
      function lane(id, name, y, col, two) {
        const x1 = 250, x2 = 414;
        const ar = two
          ? `<path d="M${x1} ${y} H${x2}" stroke="${col}" stroke-width="2"/><path d="M${x1+9} ${y-6} L${x1} ${y} L${x1+9} ${y+6} M${x2-9} ${y-6} L${x2} ${y} L${x2-9} ${y+6}" fill="none" stroke="${col}" stroke-width="2"/>`
          : `<path d="M${x1} ${y} H${x2}" stroke="${col}" stroke-width="2"/><path d="M${x2-9} ${y-6} L${x2} ${y} L${x2-9} ${y+6}" fill="${col}"/>`;
        const fl = two
          ? flow(`M${x1+4} ${y} H${x2-4}`, col, 2, 1.9, 2.5) + flow(`M${x2-4} ${y} H${x1+4}`, col, 1, 2.4, 2.5)
          : flow(`M${x1+2} ${y} H${x2-2}`, col, 2, 1.8, 2.5);
        return `<g class="hot" data-kid="${id}" tabindex="0" role="button" aria-label="${name}">
          <rect class="hot__shape" x="160" y="${y-18}" width="280" height="36" rx="5" fill="#0f1620" stroke="${C.ln2}"/>
          <text x="172" y="${y+4}" font-family="'IBM Plex Sans KR', sans-serif" font-size="12" font-weight="600" fill="${col}">${name}</text>
          ${ar}${fl}
          <text class="hot__go" x="434" y="${y-22}" text-anchor="end" font-family="monospace" font-size="10" fill="${C.cyan}">▸</text>
        </g>`;
      }
      return svg(`${lbl(40, 40, 'BUS · 칩셋이 잇는 세 갈래 길')}
        <rect x="44" y="118" width="116" height="184" rx="6" fill="${C.metal}" stroke="${C.cyanD}"/>
        <text x="102" y="214" text-anchor="middle" font-family="monospace" font-size="13" fill="${C.cyan}">CPU</text>
        <rect x="440" y="118" width="116" height="184" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
        <text x="498" y="206" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">메모리</text>
        <text x="498" y="224" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">·장치</text>
        ${lane('bus_addr', '주소 버스', 158, C.gold, false)}
        ${lane('bus_data', '데이터 버스', 210, C.grn, true)}
        ${lane('bus_ctrl', '제어 버스', 262, C.cyan, false)}`);
    })(),

    /* ─── 주소 버스: 단방향 ─── */
    bus_addr: svg(`
      ${lbl(40, 40, 'ADDRESS BUS · 단방향')}
      <rect x="56" y="116" width="134" height="168" rx="6" fill="${C.metal}" stroke="${C.gold}"/>
      <text x="123" y="196" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.cyan}">CPU</text>
      <text x="123" y="216" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">(MAR)</text>
      <rect x="410" y="116" width="134" height="168" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
      <text x="477" y="205" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">메모리</text>
      ${[0,1,2,3,4,5,6,7].map(i => `<path d="M190 ${140+i*20} H404" stroke="${C.gold}" stroke-width="1.5"/><path d="M396 ${134+i*20} L404 ${140+i*20} L396 ${146+i*20}" fill="${C.gold}"/>`).join('')}
      ${flow('M192 160 H400', C.gold, 2, 1.6, 2.5)}
      ${flow('M192 240 H400', C.gold, 2, 1.9, 2.5)}
      <text x="300" y="316" text-anchor="middle" class="s-label" fill="${C.dim}">폭(선 개수) = 주소 비트 수 → 다룰 수 있는 메모리 크기</text>
    `),

    /* ─── 데이터 버스: 양방향 ─── */
    bus_data: svg(`
      ${lbl(40, 40, 'DATA BUS · 양방향')}
      <rect x="56" y="116" width="134" height="168" rx="6" fill="${C.metal}" stroke="${C.cyan}"/>
      <text x="123" y="196" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.cyan}">CPU</text>
      <text x="123" y="216" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">(MDR)</text>
      <rect x="410" y="116" width="134" height="168" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
      <text x="477" y="205" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">메모리</text>
      ${[0,1,2,3,4,5,6,7].map(i => `<path d="M190 ${140+i*20} H404" stroke="${C.grn}" stroke-width="1.5"/><path d="M198 ${134+i*20} L190 ${140+i*20} L198 ${146+i*20} M396 ${134+i*20} L404 ${140+i*20} L396 ${146+i*20}" fill="none" stroke="${C.grn}" stroke-width="1.5"/>`).join('')}
      ${flow('M194 180 H400', C.grn, 2, 1.6, 2.5)}
      ${flow('M400 220 H194', C.grn, 2, 1.9, 2.5)}
      <text x="300" y="316" text-anchor="middle" class="s-label" fill="${C.dim}">폭이 넓을수록 한 번에 더 많은 비트 — 8 / 16 / 32 / 64bit</text>
    `),

    /* ─── 제어 버스: 신호 ─── */
    bus_ctrl: svg(`
      ${lbl(40, 40, 'CONTROL BUS · 제어 신호')}
      <rect x="56" y="116" width="120" height="184" rx="6" fill="${C.metal}" stroke="${C.cyan}"/>
      <text x="116" y="214" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.cyan}">CPU</text>
      <rect x="448" y="116" width="96" height="184" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
      <text x="496" y="208" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.dim}">메모리·장치</text>
      ${[['READ', 1], ['WRITE', 1], ['CLK', 1], ['IRQ', -1]].map(([t, dir], i) => {
        const y = 150 + i * 40;
        const head = dir > 0 ? `<path d="M440 ${y-6} L448 ${y} L440 ${y+6}" fill="${C.cyan}"/>` : `<path d="M184 ${y-6} L176 ${y} L184 ${y+6}" fill="${C.gold}"/>`;
        const col = dir > 0 ? C.cyan : C.gold;
        return `<text x="180" y="${y-9}" font-family="monospace" font-size="10" fill="${col}">${t}</text>
          <path d="M176 ${y} H448" stroke="${col}" stroke-width="1.5"/>${head}
          ${flow(`M${dir>0?178:446} ${y} H${dir>0?446:178}`, col, 1, 1.8, 2.5)}`;
      }).join('')}
      <text x="300" y="320" text-anchor="middle" class="s-label" fill="${C.dim}">언제·어느 방향인지 신호로 조율 (읽기·쓰기·클럭·인터럽트)</text>
    `),

    /* ─── ROM·BIOS ─── */
    rom: svg(`
      ${lbl(40, 40, 'ROM · 부팅 펌웨어')}
      <rect x="80" y="120" width="170" height="120" rx="6" fill="${C.pan2}" stroke="${C.goldD}" stroke-width="1.5"/>
      ${[0,1,2,3,4].map(i => `<rect x="${72}" y="${134+i*20}" width="8" height="8" fill="${C.goldD}"/><rect x="${250}" y="${134+i*20}" width="8" height="8" fill="${C.goldD}"/>`).join('')}
      <text x="165" y="186" text-anchor="middle" font-family="monospace" font-size="13" fill="${C.gold}">BIOS / UEFI</text>
      ${arrowR(250, 180, 320, C.cyan)}
      <text x="330" y="150" class="s-label" fill="${C.cyan}">전원 ON</text>
      <text x="330" y="178" class="s-label" fill="${C.dim}">→ 부품 점검(POST)</text>
      <text x="330" y="206" class="s-label" fill="${C.dim}">→ 운영체제 로드</text>
    `),

    /* ─── GPU: 코어 그리드 + VRAM (둘 다 진입) ─── */
    gpu: svg(`
      ${lbl(40, 40, 'GPU · 코어 + VRAM')}
      ${hot('gpucore', '연산 코어',
        `<rect class="hot__shape" x="70" y="70" width="380" height="280" rx="8" fill="${C.pan2}" stroke="${C.cyanD}"/>
         ${(function(){let s='';for(let r=0;r<8;r++)for(let c=0;c<11;c++){s+=`<rect class="gpu-core" style="animation-delay:${(((r*11+c)%10)*0.28).toFixed(2)}s" x="${88+c*33}" y="${90+r*31}" width="24" height="22" rx="2" fill="#16303a" stroke="${C.cyanD}"/>`;}return s;})()}`,
        260, 374, 'middle')}
      ${hot('vram', 'VRAM',
        `<rect class="hot__shape" x="470" y="70" width="60" height="280" rx="6" fill="#13202b" stroke="${C.ln2}"/>
         <text x="500" y="215" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}" transform="rotate(90 500 215)">VRAM</text>`,
        500, 374, 'middle')}
    `),

    /* ─── PSU: AC→DC 변환 ─── */
    psu: svg(`
      ${lbl(40, 40, 'PSU · AC → DC 변환')}
      <text x="100" y="120" text-anchor="middle" class="s-label" fill="${C.dim}">콘센트 (AC 220V)</text>
      <path d="M40 180 Q70 130 100 180 T160 180" fill="none" stroke="${C.gold}" stroke-width="2"/>
      ${flow('M40 180 Q70 130 100 180 T160 180', C.gold, 2, 2.0, 2.5)}
      ${arrowR(170, 180, 240, C.cyan)}
      <rect x="244" y="146" width="120" height="68" rx="6" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <text x="304" y="185" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.cyan}">정류 · 평활</text>
      ${arrowR(370, 180, 430, C.grn)}
      ${[['12V',150],['5V',185],['3.3V',220]].map(([t,y]) => `
        <path d="M438 ${y} H540" stroke="${C.grn}" stroke-width="2"/>
        ${flow(`M438 ${y} H540`, C.grn, 1, 1.6, 2.5)}
        <text x="548" y="${y+4}" class="s-label" fill="${C.grn}">${t}</text>`).join('')}
      <text x="300" y="300" text-anchor="middle" class="s-label" fill="${C.dim}">부품이 먹을 수 있는 안정된 직류로 공급</text>
    `),

    /* ─── 냉각: 히트파이프 + 핀 + 팬 ─── */
    cooler: svg(`
      ${lbl(40, 40, 'COOLING · 열을 퍼낸다')}
      <rect x="220" y="320" width="160" height="40" rx="4" fill="#3a1f1f" stroke="#c0654a" stroke-width="1.5"/>
      <text x="300" y="345" text-anchor="middle" font-family="monospace" font-size="11" fill="#e0916f">CPU (뜨거움)</text>
      <path d="M260 320 V160 M340 320 V160" stroke="${C.metal}" stroke-width="8" stroke-linecap="round"/>
      ${fins(200, 110, 200, 70, 12, C.pan2)}
      <rect x="196" y="106" width="208" height="78" rx="4" fill="none" stroke="${C.ln2}"/>
      ${spin(`<circle cx="300" cy="80" r="34" fill="${C.pan}" stroke="${C.cyanD}"/>
        <path d="M300 80 L300 50 M300 80 L326 96 M300 80 L274 96" stroke="${C.cyanD}" stroke-width="3"/>`)}
      <path d="M430 300 Q460 240 430 180" stroke="#c0654a" stroke-width="2" fill="none" opacity=".35"/>
      ${flow('M300 318 Q332 250 300 188', '#c0654a', 3, 2.2, 2.5)}
      ${flow('M430 300 Q460 240 430 180', '#c0654a', 2, 2.6, 2)}
      <text x="470" y="245" class="s-label" fill="#c0654a">열 ↑</text>
    `),

    /* ─── I/O 포트 패널 ─── */
    io: svg(`
      ${lbl(40, 40, 'I/O · 바깥 세상과의 문')}
      <rect x="70" y="90" width="320" height="240" rx="8" fill="${C.pan2}" stroke="${C.ln2}"/>
      ${[['USB',130],['USB',180],['HDMI',230],['LAN',280]].map(([t,y]) => `
        <rect x="100" y="${y-14}" width="70" height="26" rx="3" fill="${C.pan}" stroke="${C.cyanD}"/>
        <text x="200" y="${y+4}" class="s-label" fill="${C.dim}">${t}</text>
        <circle cx="300" cy="${y-2}" r="4" fill="${C.cyanD}"/>`).join('')}
      ${arrowR(400, 200, 470, C.cyan)}
      <path d="M470 220 H400" stroke="${C.grn}" stroke-width="2"/><path d="M409 214 L400 220 L409 226" fill="${C.grn}"/>
      ${flow('M402 200 H466', C.cyan, 2, 1.6, 2.5)}
      ${flow('M468 220 H404', C.grn, 2, 1.9, 2.5)}
      <text x="480" y="195" class="s-label" fill="${C.dim}">키보드·모니터</text>
      <text x="480" y="225" class="s-label" fill="${C.dim}">·인터넷</text>
    `),

    /* ─── SSD: 컨트롤러 + NAND(→플래시 셀) ─── */
    ssd: svg(`
      ${lbl(40, 40, 'SSD · 플래시 메모리')}
      <rect x="70" y="74" width="460" height="252" rx="8" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <rect x="240" y="100" width="120" height="60" rx="5" fill="${C.metal}" stroke="${C.gold}"/>
      <text x="300" y="135" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.gold}">컨트롤러</text>
      ${hot('flashcell', '플래시 셀',
        `<rect class="hot__shape" x="88" y="200" width="424" height="108" rx="6" fill="#0f1a23" stroke="${C.cyanD}"/>
         ${[0,1,2,3].map(i => `<rect x="${100+i*110}" y="216" width="90" height="76" rx="4" fill="#13202b" stroke="${C.ln2}"/>
           <text x="${145+i*110}" y="258" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.dim}">NAND</text>`).join('')}`,
        300, 330, 'middle')}
      ${[0,1,2,3].map(i => flow(`M300 160 Q${145+i*110} 190 ${145+i*110} 216`, C.cyan, 1, 2.2, 2)).join('')}
    `),

    /* ─── HDD: 플래터 + 헤드 ─── */
    hdd: svg(`
      ${lbl(40, 40, 'HDD · 자기 원반')}
      <circle cx="250" cy="220" r="140" fill="#11202c" stroke="${C.ln2}" stroke-width="1.5"/>
      ${spin(`<circle cx="250" cy="220" r="95" fill="none" stroke="${C.cyanD}" stroke-dasharray="2 6" opacity=".6"/>
        <circle cx="250" cy="220" r="60" fill="none" stroke="${C.cyanD}" stroke-dasharray="2 6" opacity=".6"/>
        <circle cx="250" cy="128" r="4" fill="${C.gold}"/>
        <circle cx="310" cy="220" r="3" fill="${C.cyanD}"/>`, 'spin-slow')}
      <circle cx="250" cy="220" r="26" fill="${C.metal}"/>
      <circle cx="250" cy="220" r="6" fill="${C.cyanD}"/>
      <circle cx="470" cy="120" r="14" fill="${C.metal}"/>
      <path d="M470 120 L300 200" stroke="${C.metal}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="300" cy="200" r="5" fill="${C.gold}"/>
      <path d="M250 90 A130 130 0 0 1 350 130" fill="none" stroke="${C.grn}" stroke-width="2"/>
      <path d="M350 130 L344 116 M350 130 L336 134" stroke="${C.grn}" stroke-width="2"/>
      <text x="250" y="392" text-anchor="middle" class="s-label" fill="${C.dim}">회전하는 원반에 자석 방향으로 0/1 기록</text>
    `),

    /* ─── 메모리 셀: 1T1C DRAM ─── */
    memcell: svg(`
      ${lbl(40, 40, 'DRAM CELL · 1 트랜지스터 + 1 축전기')}
      <path d="M80 120 H520" stroke="${C.cyan}" stroke-width="2"/>
      ${flow('M80 120 H520', C.cyan, 2, 2.4, 2.5)}
      <text x="60" y="125" text-anchor="end" class="s-label" fill="${C.cyan}">워드라인</text>
      <path d="M300 300 V360" stroke="${C.gold}" stroke-width="2"/>
      <text x="300" y="384" text-anchor="middle" class="s-label" fill="${C.gold}">비트라인</text>
      <path d="M300 120 V180" stroke="${C.ink}" stroke-width="2"/>
      <rect x="270" y="180" width="60" height="50" rx="3" fill="${C.pan2}" stroke="${C.ink}"/>
      <text x="300" y="210" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.dim}">TR</text>
      <path d="M300 230 V270" stroke="${C.ink}" stroke-width="2"/>
      <g class="throb"><path d="M270 272 H330 M278 282 H322" stroke="${C.grn}" stroke-width="3"/></g>
      <text x="258" y="280" text-anchor="end" class="s-label" fill="${C.grn}">축전기 (전하=1, 빔=0) →</text>
      <path d="M300 282 V300" stroke="${C.gold}" stroke-width="2"/>

      <!-- 비교: SRAM 6T 셀 (캐시용) -->
      <rect x="386" y="146" width="190" height="186" rx="6" fill="#0f1620" stroke="${C.ln2}"/>
      <text x="481" y="166" text-anchor="middle" font-family="monospace" font-size="8.5" fill="${C.fnt}">비교 · SRAM 6T 셀 (캐시)</text>
      <path d="M428 184 L428 216 L462 200 Z" fill="${C.pan2}" stroke="${C.cyan}" stroke-width="1.5"/>
      <circle cx="467" cy="200" r="4" fill="none" stroke="${C.cyan}"/>
      <path d="M534 264 L534 232 L500 248 Z" fill="${C.pan2}" stroke="${C.cyan}" stroke-width="1.5"/>
      <circle cx="495" cy="248" r="4" fill="none" stroke="${C.cyan}"/>
      <path d="M471 200 H548 V248 H538" fill="none" stroke="${C.cyanD}" stroke-width="1.5"/>
      <path d="M491 248 H414 V200 H428" fill="none" stroke="${C.cyanD}" stroke-width="1.5"/>
      ${flow('M471 200 H548 V248 H538 M491 248 H414 V200 H426', C.grn, 2, 2.4, 2)}
      <text x="481" y="292" text-anchor="middle" font-family="monospace" font-size="7.5" fill="${C.dim}">인버터 2개가 서로를 붙듦</text>
      <text x="481" y="306" text-anchor="middle" font-family="monospace" font-size="7.5" fill="${C.dim}">리프레시 불필요 · 빠름</text>
      <text x="481" y="320" text-anchor="middle" font-family="monospace" font-size="7.5" fill="${C.dim}">대신 트랜지스터 6개 = 비쌈</text>
    `),

    /* ─── GPU 연산 코어: SIMD 방송 ─── */
    gpucore: (function () {
      const cols = 6, rows = 4, x0 = 96, y0 = 156, gw = 70, gh = 50, bw = gw - 14, bh = gh - 14;
      let boxes = '', arrows = '';
      for (let c = 0; c < cols; c++) {
        const ax = x0 + c * gw + bw / 2;
        arrows += `<path d="M${ax} 110 V${y0}" stroke="${C.gold}" stroke-width="1" opacity=".35"/>`;
      }
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = x0 + c * gw, y = y0 + r * gh;
        boxes += `<rect class="gpu-core" style="animation-delay:${(((r * cols + c) % 8) * 0.3).toFixed(2)}s" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="#16303a" stroke="${C.cyanD}"/>
                  <text x="${x + bw / 2}" y="${y + bh / 2 + 3}" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.cyanD}">ALU</text>`;
      }
      return svg(`${lbl(40, 40, 'STREAMING CORES · SIMD')}
        <rect x="60" y="66" width="480" height="42" rx="5" fill="${C.pan2}" stroke="${C.gold}"/>
        <text x="300" y="92" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">같은 명령을 모든 코어에 한 번에 방송</text>
        ${arrows}${boxes}
        <text x="300" y="400" text-anchor="middle" class="s-label" fill="${C.dim}">수천 코어가 서로 다른 데이터에 동시에 — 픽셀 · 행렬</text>`);
    })(),

    /* ─── VRAM: 넓은 대역폭 ─── */
    vram: (function () {
      let lanes = '', flows = '', banks = '';
      for (let i = 0; i < 6; i++) {
        const y = 140 + i * 26;
        lanes += `<path d="M214 ${y} H386" stroke="${C.cyanD}" stroke-width="2"/>`;
        flows += flow(`M216 ${y} H384`, C.grn, 1, 1.3 + i * 0.04, 2.5);
      }
      for (let i = 0; i < 4; i++) {
        banks += `<rect x="392" y="${126 + i * 44}" width="148" height="36" rx="3" fill="#13202b" stroke="${C.ln2}"/>
                  <text x="466" y="${148 + i * 44}" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.dim}">BANK ${i}</text>`;
      }
      return svg(`${lbl(40, 40, 'VRAM · 넓은 대역폭')}
        <rect x="60" y="120" width="150" height="180" rx="6" fill="${C.pan2}" stroke="${C.cyan}"/>
        <text x="135" y="216" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.cyan}">GPU 코어</text>
        ${lanes}${flows}${banks}
        <text x="300" y="396" text-anchor="middle" class="s-label" fill="${C.dim}">여러 길로 한꺼번에 — 대역폭이 일반 RAM보다 훨씬 크다</text>`);
    })(),

    /* ─── 플래시 셀: 플로팅 게이트 트랜지스터 ─── */
    flashcell: svg(`
      ${lbl(40, 40, 'FLOATING-GATE CELL · 갇힌 전자')}
      <rect x="80" y="252" width="440" height="110" rx="4" fill="#1d2a3a" stroke="${C.cyanD}" stroke-width="1.5"/>
      <text x="300" y="335" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.dim}">P형 기판</text>
      <rect x="110" y="252" width="90" height="46" rx="3" fill="#21506b" stroke="${C.cyan}"/>
      <rect x="400" y="252" width="90" height="46" rx="3" fill="#21506b" stroke="${C.cyan}"/>
      <text x="155" y="280" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.cyan}">소스</text>
      <text x="445" y="280" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.cyan}">드레인</text>
      <!-- 터널 산화막 -->
      <rect x="210" y="238" width="180" height="14" fill="${C.goldD}" opacity=".4"/>
      <!-- 플로팅 게이트 (갇힌 전자) -->
      <rect x="222" y="196" width="156" height="34" rx="3" fill="${C.metal}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="300" y="190" text-anchor="middle" class="s-label" fill="${C.gold}">플로팅 게이트 (절연체로 격리)</text>
      ${[0,1,2,3,4].map(i => `<text x="${244+i*28}" y="${218}" font-size="13" fill="${C.grn}">−</text>`).join('')}
      <!-- 제어 게이트 -->
      <rect x="222" y="150" width="156" height="34" rx="3" fill="${C.metal}" stroke="${C.cyan}"/>
      <text x="300" y="172" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.cyan}">제어 게이트</text>
      <text x="300" y="392" text-anchor="middle" class="s-label" fill="${C.grn}">절연체에 갇힌 전자 = 1 · 없으면 0 (전원 꺼져도 유지)</text>
    `),

    /* ─── 레지스터 종류별 도식 ─── */
    reg_pc: svg(`
      ${lbl(40, 40, 'PROGRAM COUNTER')}
      ${[0,1,2,3,4].map(i => `<rect x="300" y="${88+i*52}" width="210" height="42" rx="4" fill="${i===1?'#1a2c20':C.pan2}" stroke="${i===1?C.gold:C.ln2}"/>
        <text x="314" y="${114+i*52}" font-family="monospace" font-size="10" fill="${C.fnt}">0x0${i}</text>
        <text x="360" y="${114+i*52}" font-family="monospace" font-size="11" fill="${i===1?C.gold:C.dim}">명령 ${i}</text>`).join('')}
      <rect x="80" y="120" width="150" height="40" rx="5" fill="${C.metal}" stroke="${C.gold}"/>
      <text x="155" y="145" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.gold}">PC = 0x01</text>
      ${arrowR(230, 140, 300, C.gold)}
      ${flow('M232 140 H298', C.gold, 1, 1.6, 2.5)}
      <text x="300" y="386" text-anchor="middle" class="s-label" fill="${C.dim}">명령을 가져올 때마다 PC +1 → 자연히 다음 명령으로</text>
    `),

    reg_ir: svg(`
      ${lbl(40, 40, 'INSTRUCTION REGISTER')}
      <rect x="80" y="150" width="210" height="64" rx="6" fill="${C.pan2}" stroke="${C.cyan}"/>
      <text x="185" y="176" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">IR · 현재 명령</text>
      <text x="185" y="198" text-anchor="middle" font-family="monospace" font-size="14" fill="${C.cyan}">ADD R1, R2</text>
      ${arrowR(290, 182, 360, C.cyan)}
      ${flow('M292 182 H358', C.cyan, 2, 1.6, 2.5)}
      <path d="M360 150 L500 150 L478 232 L382 232 Z" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="440" y="196" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">디코더</text>
      <text x="300" y="320" text-anchor="middle" class="s-label" fill="${C.dim}">담긴 명령을 제어장치가 해석해 신호로 바꾼다</text>
    `),

    reg_acc: svg(`
      ${lbl(40, 40, 'ACCUMULATOR')}
      <path d="M110 120 L240 120 L210 224 L140 224 Z" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="175" y="178" text-anchor="middle" font-family="monospace" font-size="12" fill="${C.gold}">ALU</text>
      <rect x="370" y="146" width="150" height="56" rx="6" fill="${C.metal}" stroke="${C.cyan}"/>
      <text x="445" y="170" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">ACC</text>
      <text x="445" y="192" text-anchor="middle" font-family="monospace" font-size="16" fill="${C.grn}">8</text>
      ${arrowR(240, 172, 370, C.grn)}
      ${flow('M242 172 H368', C.grn, 2, 1.6, 2.5)}
      <path d="M445 202 V272 H175 V228" fill="none" stroke="${C.cyanD}" stroke-width="2"/>
      <path d="M169 240 L175 228 L181 240" fill="${C.cyanD}"/>
      ${flow('M445 202 V272 H175 V230', C.cyan, 2, 2.4, 2.5)}
      <text x="300" y="330" text-anchor="middle" class="s-label" fill="${C.dim}">결과가 ACC로 → 다시 ALU 입력으로 (누적)</text>
    `),

    reg_mar: svg(`
      ${lbl(40, 40, 'MEMORY ADDRESS REGISTER')}
      <rect x="70" y="150" width="150" height="50" rx="5" fill="${C.metal}" stroke="${C.gold}"/>
      <text x="145" y="172" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">MAR</text>
      <text x="145" y="190" text-anchor="middle" font-family="monospace" font-size="13" fill="${C.gold}">0x02</text>
      ${arrowR(220, 175, 300, C.gold)}
      ${flow('M222 175 H298', C.gold, 2, 1.6, 2.5)}
      <text x="260" y="166" class="s-label" fill="${C.fnt}">주소 버스</text>
      ${[0,1,2,3,4].map(i => `<rect x="300" y="${96+i*44}" width="210" height="36" rx="4" fill="${i===2?'#1a2c20':C.pan2}" stroke="${i===2?C.gold:C.ln2}"/>
        <text x="314" y="${119+i*44}" font-family="monospace" font-size="10" fill="${i===2?C.gold:C.fnt}">0x0${i}</text>
        <text x="360" y="${119+i*44}" font-family="monospace" font-size="10" fill="${C.dim}">데이터</text>`).join('')}
      <text x="300" y="350" text-anchor="middle" class="s-label" fill="${C.dim}">MAR이 가리킨 주소의 칸을 메모리가 선택한다</text>
    `),

    reg_mdr: svg(`
      ${lbl(40, 40, 'MEMORY DATA REGISTER')}
      <rect x="60" y="150" width="140" height="64" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
      <text x="130" y="186" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">메모리</text>
      <rect x="240" y="150" width="120" height="64" rx="6" fill="${C.metal}" stroke="${C.cyan}"/>
      <text x="300" y="176" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">MDR</text>
      <text x="300" y="198" text-anchor="middle" font-family="monospace" font-size="15" fill="${C.cyan}">42</text>
      <rect x="400" y="150" width="140" height="64" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
      <text x="470" y="186" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}">CPU</text>
      <path d="M200 176 H240 M360 176 H400" stroke="${C.grn}" stroke-width="2"/>
      ${flow('M202 176 H238', C.grn, 1, 1.6, 2.5)}
      ${flow('M362 176 H398', C.grn, 1, 1.6, 2.5)}
      <path d="M400 196 H360 M240 196 H200" stroke="${C.cyanD}" stroke-width="2"/>
      <path d="M209 190 L200 196 L209 202 M351 190 L360 196 L351 202" fill="${C.cyanD}"/>
      <text x="300" y="262" text-anchor="middle" class="s-label" fill="${C.grn}">읽기: 메모리 → MDR → CPU</text>
      <text x="300" y="284" text-anchor="middle" class="s-label" fill="${C.cyan}">쓰기: CPU → MDR → 메모리</text>
    `),

    reg_sp: svg(`
      ${lbl(40, 40, 'STACK POINTER')}
      ${[0,1,2,3].map(i => `<rect x="230" y="${108+i*56}" width="170" height="48" rx="4" fill="${i===0?'#1a2c20':C.pan2}" stroke="${i===0?C.gold:C.ln2}"/>
        <text x="315" y="${137+i*56}" text-anchor="middle" font-family="monospace" font-size="11" fill="${i===0?C.gold:C.dim}">${i===0?'← 꼭대기 (top)':'스택 데이터'}</text>`).join('')}
      <rect x="70" y="108" width="120" height="48" rx="5" fill="${C.metal}" stroke="${C.gold}"/>
      <text x="130" y="137" text-anchor="middle" font-family="monospace" font-size="13" fill="${C.gold}">SP</text>
      ${arrowR(190, 132, 230, C.gold)}
      <text x="300" y="368" text-anchor="middle" class="s-label" fill="${C.dim}">push/pop 할 때 SP가 오르내림 — 함수 호출·복귀에 사용</text>
    `),

    reg_flags: svg(`
      ${lbl(40, 40, 'STATUS REGISTER · FLAGS')}
      ${[['Z','결과가 0?'],['N','음수?'],['C','자리올림?'],['V','오버플로?']].map(([f,d],i) => `
        <rect x="${78+i*120}" y="140" width="98" height="64" rx="6" fill="${C.pan2}" stroke="${C.gold}"/>
        <text x="${127+i*120}" y="180" text-anchor="middle" font-family="monospace" font-size="22" fill="${C.gold}">${f}</text>
        <text x="${127+i*120}" y="230" text-anchor="middle" class="s-label" fill="${C.dim}">${d}</text>`).join('')}
      <text x="300" y="300" text-anchor="middle" class="s-label" fill="${C.cyan}">조건 분기(if문)가 이 플래그를 보고 갈림길을 정한다</text>
    `),

    reg_gp: svg(`
      ${lbl(40, 40, 'GENERAL PURPOSE · R0–R7')}
      ${[42,7,0,255,13,88,1,64].map((v,i) => `<rect x="${88+(i%4)*116}" y="${118+Math.floor(i/4)*92}" width="100" height="72" rx="5" fill="${C.pan2}" stroke="${C.cyanD}"/>
        <text x="${138+(i%4)*116}" y="${146+Math.floor(i/4)*92}" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.fnt}">R${i}</text>
        <text x="${138+(i%4)*116}" y="${172+Math.floor(i/4)*92}" text-anchor="middle" font-family="monospace" font-size="15" fill="${C.ink}">${v}</text>`).join('')}
      <text x="300" y="334" text-anchor="middle" class="s-label" fill="${C.dim}">프로그램이 자유롭게 값을 담아 쓰는 작업용 칸들</text>
    `),

    /* ─── 파이프라인: 5단계 사선 중첩 ─── */
    pipeline: (function () {
      const ST = ['IF', 'ID', 'EX', 'MEM', 'WB'];
      const COLS = [C.cyan, C.gold, C.grn, '#e0916f', '#b08ae0'];
      let head = '', rows = '';
      ST.forEach((s, j) => {
        head += `<text x="${150 + j * 80}" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="${COLS[j]}">${s}</text>`;
      });
      for (let i = 0; i < 3; i++) { // 명령 3개, 한 칸씩 밀려 시작
        rows += `<text x="64" y="${136 + i * 64}" font-family="monospace" font-size="10" fill="${C.dim}">명령${i + 1}</text>`;
        ST.forEach((s, j) => {
          const x = 110 + j * 80 + i * 26, y = 112 + i * 64;
          rows += `<rect x="${x}" y="${y}" width="66" height="38" rx="4" fill="${C.pan2}" stroke="${COLS[j]}" opacity="${i === 1 ? 1 : .75}"/>
                   <text x="${x + 33}" y="${y + 24}" text-anchor="middle" font-family="monospace" font-size="9" fill="${COLS[j]}">${s}</text>`;
        });
      }
      return svg(`${lbl(40, 40, 'PIPELINE · 단계가 겹쳐 흐른다')}
        ${head}${rows}
        <line x1="318" y1="100" x2="318" y2="320" stroke="${C.ink}" stroke-dasharray="3 5" opacity=".35"/>
        <text x="318" y="336" text-anchor="middle" class="s-label" fill="${C.dim}">↑ 같은 박자: 명령1=EX · 명령2=ID · 명령3=IF 동시 진행</text>
        <text x="300" y="392" text-anchor="middle" class="s-label" fill="#e0916f">단, 앞 명령의 결과를 바로 쓰면? → 해저드(전공 노트)</text>`);
    })(),

    /* ─── 가상 메모리: 페이지 → MMU → 프레임 매핑 ─── */
    virtualmem: (function () {
      const MAP = [['P0', 2, C.cyan], ['P1', -1, '#e0916f'], ['P2', 0, C.grn], ['P3', 4, C.gold]];
      let pages = '', frames = '', wires = '';
      MAP.forEach(([p, f, col], i) => {
        const py = 96 + i * 56;
        pages += `<rect x="60" y="${py}" width="96" height="40" rx="4" fill="${C.pan2}" stroke="${col}"/>
                  <text x="108" y="${py + 25}" text-anchor="middle" font-family="monospace" font-size="11" fill="${col}">${p}</text>`;
        if (f >= 0) {
          const fy = 96 + f * 44;
          wires += `<path d="M156 ${py + 20} C240 ${py + 20} 300 ${fy + 18} 396 ${fy + 18}" fill="none" stroke="${col}" stroke-width="1.5" opacity=".75"/>
                    ${flow(`M158 ${py + 20} C240 ${py + 20} 300 ${fy + 18} 394 ${fy + 18}`, col, 1, 2.2, 2.5)}`;
        } else {
          wires += `<path d="M156 ${py + 20} C230 ${py + 20} 250 360 300 372" fill="none" stroke="${col}" stroke-width="1.5" stroke-dasharray="4 4" opacity=".8"/>`;
        }
      });
      for (let f = 0; f < 6; f++) {
        const fy = 96 + f * 44;
        const owner = MAP.find(([, m]) => m === f);
        frames += `<rect x="396" y="${fy}" width="144" height="34" rx="4" fill="${owner ? '#13202b' : C.pan}" stroke="${owner ? owner[2] : C.ln}" ${owner ? '' : 'stroke-dasharray="3 4"'}/>
                   <text x="468" y="${fy + 22}" text-anchor="middle" font-family="monospace" font-size="10" fill="${owner ? owner[2] : C.fnt}">F${f}${owner ? ' ← ' + owner[0] : ' (빈 프레임)'}</text>`;
      }
      return svg(`${lbl(40, 40, 'VIRTUAL MEMORY · 주소 변환 지도')}
        <text x="108" y="82" text-anchor="middle" class="s-label" fill="${C.dim}">가상 페이지</text>
        <text x="468" y="82" text-anchor="middle" class="s-label" fill="${C.dim}">물리 프레임 (RAM)</text>
        <rect x="226" y="160" width="120" height="64" rx="6" fill="${C.metal}" stroke="${C.gold}"/>
        <text x="286" y="188" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">MMU</text>
        <text x="286" y="206" text-anchor="middle" font-family="monospace" font-size="8" fill="${C.fnt}">페이지 테이블</text>
        ${pages}${frames}${wires}
        <rect x="300" y="362" width="140" height="36" rx="4" fill="#1a1410" stroke="#e0916f"/>
        <text x="370" y="384" text-anchor="middle" font-family="monospace" font-size="9" fill="#e0916f">디스크(스왑) — P1은 여기에</text>`);
    })(),
  };

  window.SCENES = SCENES;
})();
