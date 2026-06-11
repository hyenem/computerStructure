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

  const SCENES = {

    /* ─── L0 본체: 케이스 내부 배치도 ─── */
    case: svg(`
      <rect x="14" y="14" width="572" height="392" rx="12" fill="${C.pan}" stroke="${C.ln2}" stroke-width="1.5"/>
      <rect x="22" y="22" width="556" height="376" rx="8" fill="none" stroke="${C.ln}" stroke-dasharray="3 5"/>
      ${lbl(30, 38, 'CASE · 측면 개방도')}

      ${hot('motherboard', '메인보드',
        `<rect class="hot__shape" x="250" y="58" width="316" height="312" rx="6" fill="${C.pcb}" stroke="${C.pcbL}" stroke-width="1.5"/>
         <path d="M268 90 H520 M268 120 H470 M268 340 H520" stroke="${C.pcbL}" stroke-width="1" opacity=".4" fill="none"/>`,
        262, 360)}

      ${hot('io', '입출력 포트',
        `<rect class="hot__shape" x="256" y="66" width="40" height="150" rx="3" fill="${C.metal}" stroke="${C.ln2}"/>
         <rect x="263" y="76" width="26" height="14" rx="2" fill="${C.pan2}"/>
         <rect x="263" y="98" width="26" height="14" rx="2" fill="${C.pan2}"/>
         <circle cx="276" cy="130" r="9" fill="${C.pan2}"/>
         <rect x="263" y="150" width="26" height="10" rx="2" fill="${C.pan2}"/>
         <rect x="263" y="168" width="26" height="10" rx="2" fill="${C.pan2}"/>`,
        252, 232, 'start')}

      ${hot('cooler', '냉각',
        `<rect class="hot__shape" x="360" y="100" width="120" height="120" rx="6" fill="${C.metal}" stroke="${C.ln2}"/>
         ${fins(366, 106, 108, 108, 10, C.pan2)}
         <circle cx="420" cy="160" r="34" fill="${C.pan}" stroke="${C.cyanD}"/>
         <path d="M420 160 L420 130 M420 160 L446 174 M420 160 L394 174" stroke="${C.cyanD}" stroke-width="3"/>`,
        420, 240, 'middle')}

      ${hot('gpu', '그래픽카드',
        `<rect class="hot__shape" x="258" y="290" width="280" height="74" rx="5" fill="#12202c" stroke="${C.cyanD}" stroke-width="1.5"/>
         <circle cx="320" cy="327" r="24" fill="${C.pan}" stroke="${C.cyanD}"/>
         <circle cx="320" cy="327" r="6" fill="${C.cyanD}"/>
         <circle cx="430" cy="327" r="24" fill="${C.pan}" stroke="${C.cyanD}"/>
         <circle cx="430" cy="327" r="6" fill="${C.cyanD}"/>`,
        470, 327, 'start')}

      ${hot('storage', '저장장치',
        `<rect class="hot__shape" x="40" y="58" width="178" height="120" rx="5" fill="${C.pan2}" stroke="${C.ln2}"/>
         <rect x="50" y="68" width="158" height="30" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="50" y="103" width="158" height="30" rx="3" fill="#13202b" stroke="${C.ln2}"/>
         <rect x="50" y="138" width="158" height="30" rx="3" fill="#13202b" stroke="${C.ln2}"/>`,
        44, 50)}

      ${hot('psu', '전원공급',
        `<rect class="hot__shape" x="40" y="262" width="178" height="108" rx="5" fill="${C.pan2}" stroke="${C.ln2}"/>
         <circle cx="129" cy="316" r="40" fill="none" stroke="${C.goldD}" stroke-width="1.5"/>
         <path d="M129 276 V356 M89 316 H169 M101 288 L157 344 M157 288 L101 344" stroke="${C.goldD}" stroke-width="1" opacity=".6"/>`,
        44, 254)}
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
  };

  window.SCENES = SCENES;
})();
