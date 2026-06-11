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
        `<rect class="hot__shape" x="310" y="86" width="180" height="160" rx="4" fill="#1a2030" stroke="${C.gold}"/>
         <path d="M340 110 L460 110 L440 200 L360 200 Z" fill="none" stroke="${C.goldD}" stroke-width="1.5"/>`,
        400, 158, 'middle')}

      ${hot('register', '레지스터',
        `<rect class="hot__shape" x="110" y="186" width="180" height="60" rx="4" fill="#14202c" stroke="${C.ln2}"/>
         <rect x="122" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>
         <rect x="160" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>
         <rect x="198" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>
         <rect x="236" y="200" width="30" height="32" fill="${C.pan2}" stroke="${C.cyanD}"/>`,
        200, 232, 'middle')}

      ${hot('cache', '캐시 메모리',
        `<rect class="hot__shape" x="110" y="266" width="380" height="70" rx="4" fill="#13202b" stroke="${C.ln2}"/>
         ${fins(120, 276, 360, 50, 26, C.pan2)}`,
        300, 308, 'middle')}
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
      <path d="M330 180 H420" stroke="${C.grn}" stroke-width="2"/>
      <text x="430" y="185" class="s-label" fill="${C.grn}">출력</text>
      ${flow('M70 130 H190', C.cyan, 2, 1.7, 2.5)}
      ${flow('M70 230 H190', C.cyan, 2, 1.9, 2.5)}
      ${flow('M330 180 H420', C.grn, 2, 1.7, 2.5)}
      <text x="250" y="300" text-anchor="middle" class="s-label" fill="${C.dim}">이 게이트는 무엇으로 만들까? ↓</text>

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
        `<rect class="hot__shape" x="82" y="92" width="44" height="44" rx="3" fill="#1a2c20" stroke="${C.gold}" stroke-width="2"/>`,
        300, 372, 'middle')}
      <text x="300" y="372" text-anchor="middle" class="s-label" fill="${C.dim}">한 칸(셀) = 비트 하나 →</text>
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
    `),

    /* ─── 레지스터 ─── */
    register: svg(`
      ${lbl(40, 40, 'REGISTER · 8비트 (플립플롭 ×8)')}
      <rect x="70" y="120" width="460" height="96" rx="6" fill="${C.pan2}" stroke="${C.ln2}"/>
      ${[0,1,2,3,4,5,6,7].map(i => `
        <rect x="${88 + i*54}" y="142" width="44" height="52" rx="3" fill="${C.pan}" stroke="${C.cyanD}"/>
        <text x="${110 + i*54}" y="175" text-anchor="middle" font-family="monospace" font-size="16" fill="${i%3===0?C.grn:C.zero}">${i%3===0?1:0}</text>`).join('')}
      <text x="300" y="252" text-anchor="middle" class="s-label" fill="${C.dim}">⎍ 클럭(CLK) 신호가 올 때마다 값이 한꺼번에 저장된다</text>
      <path d="M70 234 H530" stroke="${C.goldD}" stroke-dasharray="3 4" opacity=".6"/>
      ${flow('M70 234 H530', C.gold, 2, 1.3, 2.5)}
    `),

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
      <text x="300" y="300" text-anchor="middle" class="s-label" fill="${C.cyan}">이 셋만 있으면 어떤 계산이든 만들 수 있다</text>
    `),

    /* ─── 칩셋·버스 ─── */
    chipset: svg(`
      ${lbl(40, 40, 'CHIPSET · 버스 교차로')}
      <rect x="250" y="40" width="100" height="44" rx="4" fill="${C.metal}" stroke="${C.cyanD}"/>
      <text x="300" y="67" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.cyan}">CPU</text>
      <rect x="244" y="180" width="112" height="60" rx="5" fill="${C.pan2}" stroke="${C.gold}" stroke-width="1.5"/>
      <text x="300" y="216" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.gold}">칩셋</text>
      <path d="M300 84 V180" stroke="${C.cyan}" stroke-width="3"/>
      ${[['RAM',110],['저장장치',300],['주변기기',490]].map(([t,x]) => `
        <rect x="${x-50}" y="330" width="100" height="44" rx="4" fill="${C.pan2}" stroke="${C.ln2}"/>
        <text x="${x}" y="357" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.dim}">${t}</text>
        <path d="M300 240 Q${x} 285 ${x} 330" stroke="${C.cyanD}" stroke-width="2" fill="none"/>
        ${flow(`M300 240 Q${x} 285 ${x} 330`, C.cyan, 1, 2.0, 2.5)}`).join('')}
      ${flow('M300 90 V178', C.cyan, 2, 1.5, 2.5)}
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

    /* ─── GPU: 코어 그리드 + VRAM ─── */
    gpu: svg(`
      ${lbl(40, 40, 'GPU · 수천 개의 작은 코어')}
      <rect x="70" y="70" width="380" height="280" rx="8" fill="${C.pan2}" stroke="${C.cyanD}"/>
      ${(function(){let s='';for(let r=0;r<8;r++)for(let c=0;c<11;c++){s+=`<rect class="gpu-core" style="animation-delay:${(((r*11+c)%10)*0.28).toFixed(2)}s" x="${88+c*33}" y="${90+r*31}" width="24" height="22" rx="2" fill="#16303a" stroke="${C.cyanD}"/>`;}return s;})()}
      <rect x="470" y="70" width="60" height="280" rx="6" fill="#13202b" stroke="${C.ln2}"/>
      <text x="500" y="215" text-anchor="middle" font-family="monospace" font-size="11" fill="${C.dim}" transform="rotate(90 500 215)">VRAM</text>
      <text x="260" y="380" text-anchor="middle" class="s-label" fill="${C.dim}">같은 계산을 동시에 수천 번 — 그래픽 · AI</text>
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

    /* ─── SSD: 컨트롤러 + NAND ─── */
    ssd: svg(`
      ${lbl(40, 40, 'SSD · 플래시 메모리')}
      <rect x="70" y="80" width="460" height="260" rx="8" fill="${C.pan2}" stroke="${C.cyanD}"/>
      <rect x="240" y="110" width="120" height="70" rx="5" fill="${C.metal}" stroke="${C.gold}"/>
      <text x="300" y="150" text-anchor="middle" font-family="monospace" font-size="10" fill="${C.gold}">컨트롤러</text>
      ${[0,1,2,3].map(i => `<rect x="${100+i*110}" y="220" width="90" height="80" rx="4" fill="#13202b" stroke="${C.ln2}"/>
        <text x="${145+i*110}" y="265" text-anchor="middle" font-family="monospace" font-size="9" fill="${C.dim}">NAND</text>
        ${flow(`M300 180 Q${145+i*110} 200 ${145+i*110} 220`, C.cyan, 1, 2.2, 2)}`).join('')}
      <text x="300" y="328" text-anchor="middle" class="s-label" fill="${C.dim}">셀에 전자를 가둬 0/1 저장 — 움직이는 부품 없음</text>
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
      <text x="350" y="280" class="s-label" fill="${C.grn}">축전기 (전하=1, 빔=0)</text>
      <path d="M300 282 V300" stroke="${C.gold}" stroke-width="2"/>
    `),
  };

  window.SCENES = SCENES;
})();
