import {
  OstProblem,
  atom,
  cubicPolyHtml,
  formatLinearFactor,
  frac,
  gcd,
  htmlTable,
  linearExpr,
  polyHtml,
  pow,
  powFrac,
  signedFrac,
  svgBoxPlot,
  svgCoordGraph,
  svgDotPlot,
  svgHistogram
} from '../mathFormat';

function makeId(prefix: string, idx: number): string {
  return `${prefix}_${String(idx).padStart(2, '0')}`;
}

// ============================================================================
// TOPIC 1: THE LAZY WAY STRATEGIES (30 PROBLEMS)
// ============================================================================
function buildLazyWayProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-8: Identifying Type of Problem (Linear, Quadratic, Exponential, Systems)
  const typeQuestions: Array<{
    prompt: string;
    visual?: string;
    correct: 'Linear' | 'Quadratic' | 'Exponential' | 'Systems of Equations';
    clueStep: string;
  }> = [
    {
      prompt: `Identify the type of function shown: ${atom(`y = 3${pow('x', 2)} − 5x + 2`)}`,
      correct: 'Quadratic',
      clueStep: `Equation Clue: ${atom('x')} is squared (${pow('x', 2)}), which forms a U-shaped parabola.`
    },
    {
      prompt: `Identify the type of function shown: ${atom(`y = 250${pow('(1.06)', 'x')}`)}`,
      correct: 'Exponential',
      clueStep: `Equation Clue: The variable ${atom('x')} is in the exponent (${atom(`y = a${pow('(b)', 'x')}`)}).`
    },
    {
      prompt: `A taxi company charges $4.50 for the first mile and $2.25 per additional mile. Which problem type models the total cost?`,
      correct: 'Linear',
      clueStep: `Word Clue: "per additional mile" is a steady constant rate of change → Linear (${atom('y = mx + b')}).`
    },
    {
      prompt: `A bacteria colony starts at 40 cells and doubles every 3 hours. Which problem type models the population?`,
      correct: 'Exponential',
      clueStep: `Word Clue: "doubles every..." means multiplying by 2 each step → Exponential.`
    },
    {
      prompt: `A baseball is thrown into the air and reaches a maximum height before falling back down. Which model fits best?`,
      correct: 'Quadratic',
      clueStep: `Word Clue: "maximum height" and projectile motion make an upside-down U → Quadratic.`
    },
    {
      prompt: `Adult tickets cost $12 and student tickets cost $8. A group buys 20 tickets total and spends $200. Which type of problem is this?`,
      correct: 'Systems of Equations',
      clueStep: `Word Clue: Two unknowns happening at the same time that combine to two totals → Systems of Equations.`
    },
    {
      prompt: `Look at the table of values below. Which type of function does it represent?`,
      visual: htmlTable(['x', 'y'], [[0, 5], [1, 15], [2, 45], [3, 135]]),
      correct: 'Exponential',
      clueStep: `Table Clue: The y-values multiply by 3 each step (5 → 15 → 45 → 135) → Exponential.`
    },
    {
      prompt: `Look at the table of values below. Which type of function does it represent?`,
      visual: htmlTable(['x', 'y'], [[0, 7], [1, 11], [2, 15], [3, 19]]),
      correct: 'Linear',
      clueStep: `Table Clue: The y-values increase by the same amount (+4) each step → Linear.`
    }
  ];

  const allTypes: Array<'Linear' | 'Quadratic' | 'Exponential' | 'Systems of Equations'> = [
    'Linear',
    'Quadratic',
    'Exponential',
    'Systems of Equations'
  ];

  typeQuestions.forEach((tq, i) => {
    list.push({
      id: makeId('lw', i + 1),
      topicId: 'lazy_way',
      taskType: 'IDENTIFY PROBLEM TYPE:',
      promptHtml: tq.prompt,
      visualTitle: tq.visual ? 'TABLE CLUE' : 'LAZY WAY STRATEGY',
      visualHtml: tq.visual || `<div class="text-xs font-mono-code text-emerald-200 space-y-1.5 text-left">
        <div><span class="text-amber-300 font-bold">Linear:</span> Steady rate / per hour (${atom('y = mx + b')})</div>
        <div><span class="text-cyan-300 font-bold">Quadratic:</span> ${pow('x', 2)} / Max height / U-shape</div>
        <div><span class="text-purple-300 font-bold">Exponential:</span> x in exponent / doubles / % rate</div>
        <div><span class="text-rose-300 font-bold">Systems:</span> Two equations / two totals</div>
      </div>`,
      choices: allTypes.map(t => ({
        html: t,
        isCorrect: t === tq.correct,
        reason: t === tq.correct ? '' : `Wrong Type: This problem actually shows ${tq.correct}. ${tq.clueStep}`
      })),
      steps: [
        tq.clueStep,
        `Answer: ${tq.correct}.`
      ],
      isLongChoice: true
    });
  });

  // 9-16: Back Solving (Exact Playbook p.2 + variations)
  const backSolveTuples: Array<{
    prompt: string;
    ans: number;
    opts: [number, number, number, number];
    checkStep: string;
  }> = [
    {
      prompt: `Back-solve for ${atom('x')}: ${atom(`${frac('3x + 1', 2)} = 7`)}`,
      ans: 5,
      opts: [3, 4, 5, 6],
      checkStep: `Plug in ${atom('x = 5')}: ${atom(`${frac('3(5) + 1', 2)} = ${frac(16, 2)} = 8`)}? Wait check: ${atom('3(5) + 1 = 16')} and ${atom(`${frac(16, 2)} = 8 ≠ 7`)}; wait for ${atom('x = 5')}: ${atom('3(5)+1 = 16')}. Wait!`
    },
    {
      prompt: `Back-solve for ${atom('x')}: ${atom('4x − 7 = 2x + 9')}`,
      ans: 8,
      opts: [4, 6, 7, 8],
      checkStep: `Plug in ${atom('x = 8')}: Left = ${atom('4(8) − 7 = 25')}, Right = ${atom('2(8) + 9 = 25')}. Both match!`
    },
    {
      prompt: `If ${atom('f(x) = −2x + 9')}, find ${atom('x')} such that ${atom('f(x) = 1')}.`,
      ans: 4,
      opts: [3, 4, 5, 6],
      checkStep: `Plug in ${atom('x = 4')}: ${atom('−2(4) + 9 = −8 + 9 = 1')}.`
    },
    {
      prompt: `A taxi charges $4.50 for the first mile and $2.25 for each additional mile. If a passenger paid $13.50, how many total miles did they travel?`,
      ans: 5,
      opts: [3, 4, 5, 6],
      checkStep: `Back-solve 5 miles: 1st mile = $4.50, plus 4 additional miles × $2.25 = $9.00. Total = $4.50 + $9.00 = $13.50.`
    },
    {
      prompt: `Back-solve for ${atom('x')}: ${atom(`${frac(2, 3)}(3x − 9) + 5 = 11`)}`,
      ans: 6,
      opts: [3, 5, 6, 9],
      checkStep: `Plug in ${atom('x = 6')}: ${atom(`${frac(2, 3)}(18 − 9) + 5 = ${frac(2, 3)}(9) + 5 = 6 + 5 = 11`)}.`
    },
    {
      prompt: `Back-solve for ${atom('x')}: ${atom(`${frac('5x − 3', 4)} = 8`)}`,
      ans: 7,
      opts: [5, 6, 7, 9],
      checkStep: `Plug in ${atom('x = 7')}: ${atom(`${frac('5(7) − 3', 4)} = ${frac(32, 4)} = 8`)}.`
    },
    {
      prompt: `If ${atom('g(x) = 3x − 5')}, find ${atom('x')} such that ${atom('g(x) = 16')}.`,
      ans: 7,
      opts: [4, 6, 7, 8],
      checkStep: `Plug in ${atom('x = 7')}: ${atom('3(7) − 5 = 21 − 5 = 16')}.`
    },
    {
      prompt: `Back-solve for ${atom('x')}: ${atom('6x + 4 = 3x + 22')}`,
      ans: 6,
      opts: [4, 5, 6, 9],
      checkStep: `Plug in ${atom('x = 6')}: Left = ${atom('6(6) + 4 = 40')}, Right = ${atom('3(6) + 22 = 40')}.`
    }
  ];

  // Fix item 9 (page 2 Q1: (3x+1)/2 = 7 -> 3x+1=14 -> 3x=13... Wait! Look at PDF page 2 Q1: (3x+1)/2 = 7, options a.3, b.4, c.5, d.6! In the PDF itself 3(4)+1=13, 3(5)+1=16! Let's fix the equation to (3x-1)/2 = 7 so x=5 works cleanly!)
  backSolveTuples[0] = {
    prompt: `Back-solve for ${atom('x')}: ${atom(`${frac('3x − 1', 2)} = 7`)}`,
    ans: 5,
    opts: [3, 4, 5, 6],
    checkStep: `Plug in ${atom('x = 5')}: ${atom(`${frac('3(5) − 1', 2)} = ${frac(14, 2)} = 7`)}.`
  };

  backSolveTuples.forEach((bs, i) => {
    list.push({
      id: makeId('lw', 9 + i),
      topicId: 'lazy_way',
      taskType: 'BACK SOLVING — PLUG IN TO CHECK:',
      promptHtml: bs.prompt,
      visualTitle: 'BACK-SOLVING HACK',
      visualHtml: `<div class="text-xs font-mono-code text-cyan-200 text-left space-y-1">
        <div>1. Pick an answer choice.</div>
        <div>2. Plug it in for ${atom('x')}.</div>
        <div>3. See which choice makes both sides equal!</div>
      </div>`,
      choices: bs.opts.map(v => ({
        html: atom(`x = ${v}`),
        isCorrect: v === bs.ans,
        reason: v === bs.ans ? '' : `Plugging in ${atom(`x = ${v}`)} does not make both sides equal. ${bs.checkStep}`
      })),
      steps: [
        `Test the answer choices by substituting each value into the equation.`,
        bs.checkStep
      ]
    });
  });

  // 17-22: Desmos-Style Population / Vertex / Equation Solving (Page 3)
  list.push({
    id: makeId('lw', 17),
    topicId: 'lazy_way',
    taskType: 'DESMOS SOLVING:',
    promptHtml: `Find a positive solution to ${atom(`${pow('x', 2)} − 5x + 8 = 2`)}.`,
    visualTitle: 'DESMOS TIP',
    visualHtml: `<div class="text-xs font-mono-code text-emerald-200 text-left">Type ${atom('y = ' + pow('x', 2) + ' − 5x + 8')} and ${atom('y = 2')} into Desmos, then click the intersection!</div>`,
    choices: [
      { html: atom('x = 2'), isCorrect: true, reason: '' },
      { html: atom('x = 4'), isCorrect: false, reason: `At ${atom('x = 4')}: ${atom('16 − 20 + 8 = 4 ≠ 2')}.` },
      { html: atom('x = 5'), isCorrect: false, reason: `At ${atom('x = 5')}: ${atom('25 − 25 + 8 = 8 ≠ 2')}.` },
      { html: atom('x = 1'), isCorrect: false, reason: `At ${atom('x = 1')}: ${atom('1 − 5 + 8 = 4 ≠ 2')}.` }
    ],
    steps: [
      `Move all terms to one side: ${atom(`${pow('x', 2)} − 5x + 6 = 0`)}.`,
      `Factor or check intersections: ${atom('(x − 2)(x − 3) = 0')} → ${atom('x = 2')} or ${atom('x = 3')}.`
    ]
  });

  list.push({
    id: makeId('lw', 18),
    topicId: 'lazy_way',
    taskType: 'DESMOS EXPONENTIAL MODEL:',
    promptHtml: `A small town has 500 residents, and its population doubles every 3 years: ${atom(`P = 500${powFrac('(2)', 't', 3)}`)}. What will the population be after 6 years?`,
    visualTitle: 'EXPONENTIAL EVALUATION',
    visualHtml: `<div class="text-xs font-mono-code text-amber-200 text-left">Substitute ${atom('t = 6')} into the exponent ${frac('t', 3)} → ${frac(6, 3)} = 2.</div>`,
    choices: [
      { html: '1,000', isCorrect: false, reason: '1,000 is the population after 3 years (1 doubling), not 6 years.' },
      { html: '2,000', isCorrect: true, reason: '' },
      { html: '3,000', isCorrect: false, reason: 'Do not multiply 500 × 6. Evaluate the exponent first!' },
      { html: '4,000', isCorrect: false, reason: '4,000 would be after 9 years (3 doublings).' }
    ],
    steps: [
      `Plug in ${atom('t = 6')}: ${atom(`P = 500${powFrac('(2)', 6, 3)} = 500${pow('(2)', 2)}`)}.`,
      `Calculate: ${atom('500 × 4 = 2,000')} residents.`
    ]
  });

  list.push({
    id: makeId('lw', 19),
    topicId: 'lazy_way',
    taskType: 'DESMOS EXPONENTIAL MODEL:',
    promptHtml: `Using ${atom(`P = 500${powFrac('(2)', 't', 3)}`)}, after how many years will the population reach 1,000?`,
    choices: [
      { html: '2 years', isCorrect: false, reason: 'It doubles every 3 years, not 2.' },
      { html: '3 years', isCorrect: true, reason: '' },
      { html: '6 years', isCorrect: false, reason: 'After 6 years the population reaches 2,000.' },
      { html: '1.5 years', isCorrect: false, reason: `Check: ${frac(3, 3)} = 1 gives ${atom('500(2) = 1,000')}.` }
    ],
    steps: [
      `Since the town starts at 500 and 1,000 is double 500, we need ${pow('(2)', frac('t', 3))} to have exponent 1.`,
      `Set ${atom(`${frac('t', 3)} = 1`)} → ${atom('t = 3 years')}.`
    ]
  });

  const vertexItems: Array<{ a: number; b: number; c: number; vx: number; vy: number }> = [
    { a: 2, b: -8, c: 3, vx: 2, vy: -5 },
    { a: 1, b: -6, c: 5, vx: 3, vy: -4 },
    { a: -1, b: 4, c: 2, vx: 2, vy: 6 }
  ];
  vertexItems.forEach((vt, i) => {
    list.push({
      id: makeId('lw', 20 + i),
      topicId: 'lazy_way',
      taskType: 'FIND THE VERTEX (DESMOS):',
      promptHtml: `Find the vertex of the parabola ${atom(`y = ${polyHtml(vt.a, vt.b, vt.c)}`)}.`,
      choices: [
        { html: atom(`(${vt.vx}, ${vt.vy})`), isCorrect: true, reason: '' },
        { html: atom(`(${-vt.vx}, ${vt.vy})`), isCorrect: false, reason: `Check the sign of x: ${atom(`x = −${frac('b', '2a')}`)}.` },
        { html: atom(`(${vt.vx}, ${vt.c})`), isCorrect: false, reason: `${vt.c} is the y-intercept (when x = 0), not the vertex y-value.` },
        { html: atom(`(${vt.vy}, ${vt.vx})`), isCorrect: false, reason: 'Coordinates are ordered (x, y), not (y, x).' }
      ],
      steps: [
        `Find the axis of symmetry: ${atom(`x = −${frac(vt.b, 2 * vt.a)} = ${vt.vx}`)}.`,
        `Plug ${atom(`x = ${vt.vx}`)} in to get ${atom(`y = ${vt.vy}`)}. Vertex = ${atom(`(${vt.vx}, ${vt.vy})`)}.`
      ]
    });
  });

  // 23-30: Equivalent / "Same" Expressions (Page 3 Section 4)
  const equivItems: Array<{
    prompt: string;
    correct: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      prompt: `Select the expression equivalent to ${atom(`4${pow('x', 2)} − 81`)}.`,
      correct: atom('(2x − 9)(2x + 9)'),
      wrongs: [
        { html: atom('(2x − 3)(2x + 27)'), reason: 'Middle terms do not cancel: 54x − 6x = 48x ≠ 0.' },
        { html: pow('(2x + 9)', 2), reason: `Squaring gives ${atom(`4${pow('x', 2)} + 36x + 81`)}, not −81.` },
        { html: atom('(4x − 9)(x + 9)'), reason: 'Check FOIL: 36x − 9x = 27x ≠ 0.' }
      ],
      step: `Difference of squares: ${atom(`4${pow('x', 2)} − 81 = ${pow('(2x)', 2)} − ${pow('9', 2)} = (2x − 9)(2x + 9)`)}.`
    },
    {
      prompt: `Select the expression equivalent to ${atom(`${frac(1, 2)}(6x − 8) + 3`)}.`,
      correct: atom('3x − 1'),
      wrongs: [
        { html: atom('3x − 5'), reason: `Distributing ${frac(1, 2)} gives ${atom('3x − 4 + 3 = 3x − 1')}, not −5.` },
        { html: atom('3x + 4'), reason: 'Did you forget to multiply −8 by ½ or forget to combine −4 + 3?' },
        { html: atom('6x − 5'), reason: `You forgot to distribute ${frac(1, 2)} to 6x.` }
      ],
      step: `Distribute ${frac(1, 2)}: ${atom('3x − 4 + 3 = 3x − 1')}.`
    },
    {
      prompt: `Select the expression equivalent to ${atom(`4${pow('x', 2)} + 14x + 6`)}.`,
      correct: atom('2(2x + 1)(x + 3)'),
      wrongs: [
        { html: atom('2(x + 3)(x + 1)'), reason: `Expanding gives ${atom(`2${pow('x', 2)} + 8x + 6`)}, missing the 4x² and 14x.` },
        { html: atom('(4x + 2)(x + 1)'), reason: 'Constant term is 2 × 1 = 2, not 6.' },
        { html: atom('2x(x + 7) + 3'), reason: `Expanding gives ${atom(`2${pow('x', 2)} + 14x + 3`)}.` }
      ],
      step: `Factor GCF 2: ${atom(`2(2${pow('x', 2)} + 7x + 3) = 2(2x + 1)(x + 3)`)}.`
    },
    {
      prompt: `Select the equation equivalent to ${atom('y = 2(x − 3) + 5')}.`,
      correct: atom('y = 2x − 1'),
      wrongs: [
        { html: atom('y = 2x + 1'), reason: 'Check the sign: 2(−3) + 5 = −6 + 5 = −1, not +1.' },
        { html: atom('y = 2x + 2'), reason: 'You forgot to multiply −3 by 2!' },
        { html: atom('y = 2(x + 3) + 4'), reason: 'That simplifies to 2x + 10.' }
      ],
      step: `Distribute 2: ${atom('y = 2x − 6 + 5 = 2x − 1')}.`
    },
    {
      prompt: `Select the expression equivalent to ${atom(`${frac(1, 2)}(6x − 8) + 3`)}. (Fraction form)`,
      correct: atom(frac('6x − 2', 2)),
      wrongs: [
        { html: atom(frac('6x + 4', 2)), reason: `${frac('6x + 4', 2)} simplifies to 3x + 2, not 3x − 1.` },
        { html: atom(frac('6x − 5', 2)), reason: `To combine +3 with −${frac(8, 2)}, rewrite +3 as ${frac(6, 2)}: −8 + 6 = −2.` },
        { html: atom(frac('6x + 2', 2)), reason: 'Check the sign: −4 + 3 = −1, so numerator needs −2.' }
      ],
      step: `Simplify: ${atom(`${frac(1, 2)}(6x − 8) + 3 = 3x − 1 = ${frac('6x − 2', 2)}`)}.`
    },
    {
      prompt: `Select the expression equivalent to ${atom(`9${pow('x', 2)} − 25`)}.`,
      correct: atom('(3x − 5)(3x + 5)'),
      wrongs: [
        { html: pow('(3x − 5)', 2), reason: `Squaring produces ${atom(`9${pow('x', 2)} − 30x + 25`)}.` },
        { html: atom('(9x − 5)(x + 5)'), reason: 'Middle term becomes 40x instead of 0.' },
        { html: atom('(3x − 25)(3x + 1)'), reason: 'Constant term is −25, but middle term is −72x ≠ 0.' }
      ],
      step: `Difference of squares: ${atom(`9${pow('x', 2)} − 25 = (3x − 5)(3x + 5)`)}.`
    },
    {
      prompt: `Select the expression equivalent to ${atom(`−(9 − 2x)(2x + 9)`)}.`,
      correct: atom(`4${pow('x', 2)} − 81`),
      wrongs: [
        { html: atom(`81 − 4${pow('x', 2)}`), reason: 'The leading minus sign flips (81 − 4x²) into (4x² − 81)!' },
        { html: atom(`4${pow('x', 2)} + 81`), reason: 'Multiplying conjugates always gives a minus sign between squares.' },
        { html: atom(`4${pow('x', 2)} − 36x − 81`), reason: 'Conjugate pairs cancel out the middle x-term.' }
      ],
      step: `Rewrite ${atom('−(9 − 2x)')} as ${atom('(2x − 9)')}. Then ${atom(`(2x − 9)(2x + 9) = 4${pow('x', 2)} − 81`)}.`
    },
    {
      prompt: `Select the expression equivalent to ${atom(`${frac(2, 3)}(9x + 6) − 5`)}.`,
      correct: atom('6x − 1'),
      wrongs: [
        { html: atom('6x + 1'), reason: `${frac(2, 3)}(6) − 5 = 4 − 5 = −1, not +1.` },
        { html: atom('6x − 9'), reason: `${frac(2, 3)}(6) = +4, so 4 − 5 = −1.` },
        { html: atom('3x − 1'), reason: `${frac(2, 3)} × 9x = 6x, not 3x.` }
      ],
      step: `Distribute ${frac(2, 3)}: ${atom('6x + 4 − 5 = 6x − 1')}.`
    }
  ];

  equivItems.forEach((eq, i) => {
    list.push({
      id: makeId('lw', 23 + i),
      topicId: 'lazy_way',
      taskType: 'EQUIVALENT EXPRESSIONS (GRAPH & MATCH):',
      promptHtml: eq.prompt,
      choices: [
        { html: eq.correct, isCorrect: true, reason: '' },
        ...eq.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Strategy: Graph both the original expression and each option in Desmos — equivalent expressions have identical graphs.`,
        eq.step
      ]
    });
  });

  return list;
}

// ============================================================================
// TOPIC 2: DATA ANALYSIS (BOX WHISKER, LINE OF BEST FIT, DATA, ETC.) (30)
// ============================================================================
function buildDataAnalysisProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1: Jurrell's Bakery 5-number summary (PDF p.5)
  list.push({
    id: makeId('da', 1),
    topicId: 'data_analysis',
    taskType: 'DATA ANALYSIS — BOX PLOT:',
    promptHtml: `Jurrell tracks daily bakery customers for 1 month. Which box plot matches the 5-number summary shown?`,
    visualTitle: 'BAKERY CUSTOMER SUMMARY',
    visualHtml: htmlTable(['Statistic', 'Value'], [
      ['Mean', 68.5], ['Median', 77.5], ['Minimum', 32], ['Maximum', 103], ['First Quartile (Q1)', 51], ['Third Quartile (Q3)', 89]
    ]),
    choices: [
      { html: 'Min 32, Q1 51, Med 77.5, Q3 89, Max 103', isCorrect: true, reason: '' },
      { html: 'Min 32, Q1 68.5, Med 77.5, Q3 80, Max 103', isCorrect: false, reason: 'Mean (68.5) and Mode (80) are NOT part of a box-and-whisker plot!' },
      { html: 'Min 51, Q1 68.5, Med 77.5, Q3 89, Max 103', isCorrect: false, reason: 'Minimum must be 32, not Q1 (51).' },
      { html: 'Min 32, Q1 51, Med 68.5, Q3 89, Max 103', isCorrect: false, reason: 'The center line in the box is the Median (77.5), not the Mean (68.5).' }
    ],
    steps: [
      `A Box Plot uses the 5-Number Summary ONLY: Min, Q1, Median, Q3, Max.`,
      `Ignore Mean and Mode: Min = 32, Q1 = 51, Med = 77.5, Q3 = 89, Max = 103.`
    ],
    isLongChoice: true
  });

  // 2: Chicago vs Honolulu (PDF p.6)
  list.push({
    id: makeId('da', 2),
    topicId: 'data_analysis',
    taskType: 'DATA ANALYSIS — VARIATION:',
    promptHtml: `Molly wants a city with the <b>least variation</b> in high temperature over 6 months. Based on the table, where should she live and why?`,
    visualTitle: 'AVG HIGH TEMPS (°F)',
    visualHtml: htmlTable(['Month', 'Chicago, IL', 'Honolulu, HI'], [
      ['Jan', 33, 79], ['Feb', 36, 79], ['Mar', 46, 80], ['Apr', 57, 81], ['May', 67, 83], ['Jun', 77, 85]
    ]),
    choices: [
      { html: 'Honolulu, Hawaii — lower standard deviation', isCorrect: true, reason: '' },
      { html: 'Honolulu, Hawaii — higher standard deviation', isCorrect: false, reason: 'Less variation means a LOWER standard deviation (values stay close together).' },
      { html: 'Chicago, Illinois — lower mean', isCorrect: false, reason: 'Chicago ranges from 33° to 77° (huge variation), and mean measures center, not spread.' },
      { html: 'Chicago, Illinois — higher standard deviation', isCorrect: false, reason: 'Molly wants the LEAST variation, which corresponds to the lower standard deviation.' }
    ],
    steps: [
      `Compare spread: Chicago goes from 33°F to 77°F (range 44°F). Honolulu stays between 79°F and 85°F (range 6°F).`,
      `Less variation = lower standard deviation → Honolulu, Hawaii.`
    ],
    isLongChoice: true
  });

  // 3: Mr. Cooper's 5 Classes IQR (PDF p.6)
  list.push({
    id: makeId('da', 3),
    topicId: 'data_analysis',
    taskType: 'INTERQUARTILE RANGE (IQR):',
    promptHtml: `Class 5 has a box plot with Q1 = 20 and Q3 = 40. Which class has the <b>same interquartile range (IQR)</b> as Class 5?`,
    visualTitle: 'CLASS 5 PAGES READ',
    visualHtml: svgBoxPlot([{ label: 'Class 5', min: 10, q1: 20, med: 25, q3: 40, max: 50 }], 0, 60, 10, 'Pages Read'),
    choices: [
      { html: 'Class A: Q1 = 15, Q3 = 30 (IQR = 15)', isCorrect: false, reason: 'Class 5 IQR = 40 − 20 = 20, whereas 30 − 15 = 15.' },
      { html: 'Class B: Q1 = 30, Q3 = 50 (IQR = 20)', isCorrect: true, reason: '' },
      { html: 'Class C: Q1 = 15, Q3 = 25 (IQR = 10)', isCorrect: false, reason: '25 − 15 = 10, which is narrower than Class 5.' },
      { html: 'Class D: Q1 = 30, Q3 = 45 (IQR = 15)', isCorrect: false, reason: '45 − 30 = 15 ≠ 20.' }
    ],
    steps: [
      `IQR = Q3 − Q1 (the width of the box).`,
      `Class 5 IQR = 40 − 20 = 20. Class B also has 50 − 30 = 20.`
    ],
    isLongChoice: true
  });

  // 4: Dot Plots Product A vs Product B Range Difference (PDF p.7)
  list.push({
    id: makeId('da', 4),
    topicId: 'data_analysis',
    taskType: 'DOT PLOTS — RANGE DIFFERENCE:',
    promptHtml: `Customers rated Product A and Product B on a 1–10 scale. What is the <b>difference between the ranges</b> of the two dot plots?`,
    visualTitle: 'PRODUCT A (1–10) & PRODUCT B (3–10)',
    visualHtml: `${svgDotPlot({ 1: 1, 2: 2, 5: 4, 6: 5, 7: 6, 8: 4, 9: 5, 10: 3 }, 1, 10, 'Product A')}${svgDotPlot({ 3: 1, 4: 2, 6: 3, 7: 5, 8: 6, 9: 7, 10: 3 }, 1, 10, 'Product B')}`,
    choices: [
      { html: '1', isCorrect: false, reason: 'Range A = 10 − 1 = 9, Range B = 10 − 3 = 7. Difference = 9 − 7 = 2.' },
      { html: '2', isCorrect: true, reason: '' },
      { html: '3', isCorrect: false, reason: 'Product B starts at 3, not 4.' },
      { html: '7', isCorrect: false, reason: '7 is the range of Product B alone, not the difference between the two ranges.' }
    ],
    steps: [
      `Range = Max − Min. Product A: 10 − 1 = 9. Product B: 10 − 3 = 7.`,
      `Difference between ranges: 9 − 7 = 2.`
    ]
  });

  // 5: Rasheed & Valentina Median Difference (PDF p.7)
  list.push({
    id: makeId('da', 5),
    topicId: 'data_analysis',
    taskType: 'BOX PLOTS — MEDIAN DIFFERENCE:',
    promptHtml: `Rasheed and Valentina each read 10 books. What is the <b>difference in the median</b> number of pages per book they read?`,
    visualTitle: 'TOTAL PAGES PER BOOK',
    visualHtml: svgBoxPlot([
      { label: 'Rasheed', min: 275, q1: 300, med: 350, q3: 375, max: 425, color: '#34d399' },
      { label: 'Valentina', min: 200, q1: 275, med: 300, q3: 375, max: 400, color: '#38bdf8' }
    ], 200, 450, 50, 'Total Pages'),
    choices: [
      { html: '25 pages', isCorrect: false, reason: 'Check the vertical gold line inside each box: 350 and 300.' },
      { html: '50 pages', isCorrect: true, reason: '' },
      { html: '75 pages', isCorrect: false, reason: '75 is the difference in minimums (275 − 200), not medians.' },
      { html: '100 pages', isCorrect: false, reason: '100 is Valentina’s IQR (375 − 275), not the median difference.' }
    ],
    steps: [
      `Read the center line (median) of each box: Rasheed = 350, Valentina = 300.`,
      `Difference: 350 − 300 = 50 pages.`
    ]
  });

  // 6: Restaurant Survey Skewness (PDF p.7)
  list.push({
    id: makeId('da', 6),
    topicId: 'data_analysis',
    taskType: 'HISTOGRAM — SHAPE OF DATA:',
    promptHtml: `A restaurant surveyed 200 customers (Median = 8.00, Mean = 7.35). Which statement justifies why the median is greater than the mean?`,
    visualTitle: 'SURVEY RESULTS (1–10)',
    visualHtml: svgHistogram([
      { label: '1', count: 1 }, { label: '3', count: 2 }, { label: '5', count: 4 }, { label: '7', count: 9 }, { label: '9', count: 14 }, { label: '10', count: 6 }
    ], 'Customer Ratings', '#38bdf8'),
    choices: [
      { html: 'The data are skewed (left)', isCorrect: true, reason: '' },
      { html: 'There is a large standard deviation', isCorrect: false, reason: 'Standard deviation measures spread, not why mean < median.' },
      { html: 'There are gaps in the data distribution', isCorrect: false, reason: 'Gaps alone do not pull the mean below the median.' },
      { html: 'The distribution is roughly symmetrical', isCorrect: false, reason: 'In a symmetrical distribution, mean ≈ median.' }
    ],
    steps: [
      `The histogram has a tail stretching to the left (lower scores 1–5), pulling the mean down to 7.35 while the median stays at 8.00.`,
      `Therefore, the data are skewed (skewed left).`
    ],
    isLongChoice: true
  });

  // 7-9: Two-Way Frequency Tables (PDF p.8)
  list.push({
    id: makeId('da', 7),
    topicId: 'data_analysis',
    taskType: 'TWO-WAY FREQUENCY TABLE:',
    promptHtml: `A dealership tracks Car & Truck interiors. How many <b>trucks have leather seats</b>?`,
    visualTitle: 'CAR INTERIORS',
    visualHtml: htmlTable(['Type', 'Cloth', 'Leather', 'Total'], [
      ['Cars', 21, '?', 55], ['Trucks', '?', '?', 45], ['Total', 51, '?', 100]
    ]),
    choices: [
      { html: '15', isCorrect: true, reason: '' },
      { html: '30', isCorrect: false, reason: '30 is the number of trucks with CLOTH seats (51 − 21).' },
      { html: '34', isCorrect: false, reason: '34 is the number of CARS with leather seats (55 − 21).' },
      { html: '49', isCorrect: false, reason: '49 is the TOTAL number of leather vehicles (100 − 51).' }
    ],
    steps: [
      `Find Trucks with Cloth: Total Cloth (51) − Cars Cloth (21) = 30.`,
      `Find Trucks with Leather: Total Trucks (45) − Trucks Cloth (30) = 15.`
    ]
  });

  list.push({
    id: makeId('da', 8),
    topicId: 'data_analysis',
    taskType: 'TWO-WAY FREQUENCY TABLE:',
    promptHtml: `Ava has 48 fiction books and 22 nonfiction books. She has 18 total signed books, and 40 fiction books are unsigned. How many <b>nonfiction books are signed</b>?`,
    visualTitle: "AVA'S BOOK COLLECTION",
    visualHtml: htmlTable(['Type', 'Signed', 'Unsigned', 'Total'], [
      ['Fiction', '?', 40, 48], ['Nonfiction', '?', '?', 22], ['Total', 18, '?', 70]
    ]),
    choices: [
      { html: '8', isCorrect: false, reason: '8 is the number of signed FICTION books (48 − 40).' },
      { html: '10', isCorrect: true, reason: '' },
      { html: '12', isCorrect: false, reason: '12 is the number of UNSIGNED nonfiction books (22 − 10).' },
      { html: '18', isCorrect: false, reason: '18 is the total number of signed books.' }
    ],
    steps: [
      `Signed Fiction = 48 − 40 = 8.`,
      `Signed Nonfiction = Total Signed (18) − Signed Fiction (8) = 10.`
    ]
  });

  list.push({
    id: makeId('da', 9),
    topicId: 'data_analysis',
    taskType: 'TWO-WAY FREQUENCY TABLE:',
    promptHtml: `Of 680 households, 540 have video streaming and 80% of all households have cable TV. Among households with <b>no cable TV</b>, 7 times as many have streaming as do not. How many households have <b>both Cable TV and Streaming</b>?`,
    choices: [
      { html: '421', isCorrect: true, reason: '' },
      { html: '119', isCorrect: false, reason: '119 is the number of NO-cable households that have streaming.' },
      { html: '544', isCorrect: false, reason: '544 is the total number of Cable TV households (80% of 680).' },
      { html: '136', isCorrect: false, reason: '136 is the total number of households without Cable TV.' }
    ],
    steps: [
      `Cable TV total = 0.80 × 680 = 544. No Cable total = 680 − 544 = 136.`,
      `For No Cable: 7x + x = 136 → x = 17 (no stream), 7x = 119 (stream).`,
      `Cable + Streaming = Total Streaming (540) − 119 = 421.`
    ]
  });

  // 10-12: Scatterplots & Line of Best Fit (PDF p.9)
  list.push({
    id: makeId('da', 10),
    topicId: 'data_analysis',
    taskType: 'SCATTERPLOT — LINE OF BEST FIT:',
    promptHtml: `Which equation best describes the line of best fit for the scatterplot shown?`,
    visualTitle: 'SCATTERPLOT',
    visualHtml: svgCoordGraph({
      xMin: 0, xMax: 8, yMin: 0, yMax: 20, step: 2,
      points: [{ x: 1, y: 2.2 }, { x: 2, y: 7 }, { x: 3, y: 9 }, { x: 4, y: 13 }, { x: 5, y: 14 }, { x: 6, y: 18 }]
    }),
    choices: [
      { html: atom(`y = ${frac(1, 2)}x`), isCorrect: false, reason: 'Slope ½ would reach only y = 3 at x = 6, but the data reach y = 18.' },
      { html: atom(`y = ${frac(1, 3)}x`), isCorrect: false, reason: `That slope is inverted! Rise ÷ Run is ${frac(18, 6)} = 3, not ${frac(1, 3)}.` },
      { html: atom('y = 2x'), isCorrect: false, reason: 'y = 2x gives 12 at x = 6, which is below the trend.' },
      { html: atom('y = 3x'), isCorrect: true, reason: '' }
    ],
    steps: [
      `Pick two points near the trend: (0, 0) and (6, 18).`,
      `Slope m = ${frac('18 − 0', '6 − 0')} = 3, y-intercept b ≈ 0 → ${atom('y = 3x')}.`
    ]
  });

  list.push({
    id: makeId('da', 11),
    topicId: 'data_analysis',
    taskType: 'SCATTERPLOT — LINE OF BEST FIT:',
    promptHtml: `Which equation best describes the line of best fit for the scatterplot shown?`,
    visualTitle: 'SCATTERPLOT',
    visualHtml: svgCoordGraph({
      xMin: 0, xMax: 8, yMin: 0, yMax: 12, step: 2,
      points: [{ x: 0, y: 3 }, { x: 1, y: 4.6 }, { x: 1, y: 5 }, { x: 2, y: 7 }, { x: 3, y: 7.6 }, { x: 3, y: 8 }, { x: 4, y: 10 }, { x: 4, y: 11.5 }, { x: 5, y: 11 }]
    }),
    choices: [
      { html: atom('y = 3x + 1.75'), isCorrect: false, reason: 'y-intercept is at 3, not 1.75.' },
      { html: atom('y = 1.75x + 3'), isCorrect: true, reason: '' },
      { html: atom('y = 3x + 3'), isCorrect: false, reason: 'At x = 4, 3(4) + 3 = 15, which is way above 10–11.5.' },
      { html: atom('y = 1.75x'), isCorrect: false, reason: 'The line starts at (0, 3), not (0, 0).' }
    ],
    steps: [
      `Notice the point (0, 3) on the y-axis → y-intercept b = 3.`,
      `From (0, 3) to (4, 10): slope m = ${frac('10 − 3', '4 − 0')} = ${frac(7, 4)} = 1.75 → ${atom('y = 1.75x + 3')}.`
    ]
  });

  list.push({
    id: makeId('da', 12),
    topicId: 'data_analysis',
    taskType: 'SCATTERPLOT — BUSINESS GROWTH:',
    promptHtml: `Ms. Musto recorded coffee shop customers for the first 20 days. Which line best fits the data?`,
    visualTitle: 'BUSINESS GROWTH',
    visualHtml: svgCoordGraph({
      xMin: 0, xMax: 24, yMin: 0, yMax: 80, step: 5,
      xLabel: 'Day', yLabel: 'Customers',
      points: [{ x: 1, y: 25 }, { x: 3, y: 20 }, { x: 5, y: 38 }, { x: 8, y: 29 }, { x: 10, y: 46 }, { x: 12, y: 40 }, { x: 14, y: 56 }, { x: 17, y: 45 }, { x: 19, y: 64 }, { x: 20, y: 64 }]
    }),
    choices: [
      { html: atom('y = 3x + 10'), isCorrect: false, reason: 'Starts too low at y = 10; points near Day 0 are around 20–25.' },
      { html: atom('y = 2x + 20'), isCorrect: true, reason: '' },
      { html: atom('y = 3x + 30'), isCorrect: false, reason: 'At Day 20, 3(20) + 30 = 90, much higher than ~64.' },
      { html: atom('y = x + 20'), isCorrect: false, reason: 'At Day 20, 20 + 20 = 40, much lower than ~64.' }
    ],
    steps: [
      `y-intercept starts around (0, 20) and reaches around (20, 60).`,
      `Slope m = ${frac('60 − 20', '20 − 0')} = 2 → ${atom('y = 2x + 20')}.`
    ]
  });

  // 13-17: Chicken vs Beef / Box Plot & Quartiles (5 questions)
  list.push({
    id: makeId('da', 13),
    topicId: 'data_analysis',
    taskType: 'BOX PLOTS — QUARTILES:',
    promptHtml: `In any box-and-whisker plot, what percent of the data lies inside the box (between Q1 and Q3)?`,
    choices: [
      { html: '25%', isCorrect: false, reason: 'Each single whisker or half-box section is 25%; the whole box has two sections.' },
      { html: '50%', isCorrect: true, reason: '' },
      { html: '75%', isCorrect: false, reason: '75% of the data is below Q3, not inside the box.' },
      { html: '100%', isCorrect: false, reason: '100% covers from Minimum to Maximum.' }
    ],
    steps: [
      `A box plot splits data into 4 equal quartiles of 25% each.`,
      `The box spans Q1 (25%) to Q3 (75%), which holds the middle 50% of data.`
    ]
  });

  const boxStats: Array<{ min: number; q1: number; med: number; q3: number; max: number; ask: 'IQR' | 'Range' | 'Median' }> = [
    { min: 12, q1: 18, med: 24, q3: 32, max: 45, ask: 'IQR' },
    { min: 40, q1: 55, med: 70, q3: 85, max: 110, ask: 'Range' },
    { min: 5, q1: 15, med: 22, q3: 28, max: 40, ask: 'IQR' },
    { min: 100, q1: 150, med: 210, q3: 260, max: 320, ask: 'Median' }
  ];
  boxStats.forEach((bs, idx) => {
    const iqr = bs.q3 - bs.q1;
    const rng = bs.max - bs.min;
    const ans = bs.ask === 'IQR' ? iqr : bs.ask === 'Range' ? rng : bs.med;
    const dSet = new Set([iqr, rng, bs.med, bs.q3, bs.q1]);
    dSet.delete(ans);
    const wrongs = Array.from(dSet).slice(0, 3);
    while (wrongs.length < 3) wrongs.push(ans + (wrongs.length + 1) * 5);

    list.push({
      id: makeId('da', 14 + idx),
      topicId: 'data_analysis',
      taskType: `BOX PLOT — FIND ${bs.ask.toUpperCase()}:`,
      promptHtml: `Using the box plot shown, what is the <b>${bs.ask === 'IQR' ? 'Interquartile Range (IQR)' : bs.ask}</b> of the data?`,
      visualTitle: 'BOX & WHISKER PLOT',
      visualHtml: svgBoxPlot([bs], Math.floor(bs.min / 10) * 10, Math.ceil(bs.max / 10) * 10, Math.max(5, Math.round((bs.max - bs.min) / 6 / 5) * 5)),
      choices: [
        { html: `${ans}`, isCorrect: true, reason: '' },
        ...wrongs.map(w => ({
          html: `${w}`,
          isCorrect: false,
          reason: bs.ask === 'IQR'
            ? `IQR = Q3 − Q1 = ${bs.q3} − ${bs.q1} = ${iqr}.`
            : bs.ask === 'Range'
              ? `Range = Max − Min = ${bs.max} − ${bs.min} = ${rng}.`
              : `The Median is the middle line inside the box (${bs.med}).`
        }))
      ],
      steps: [
        bs.ask === 'IQR'
          ? `IQR = Q3 − Q1 = ${bs.q3} − ${bs.q1} = ${iqr}.`
          : bs.ask === 'Range'
            ? `Range = Max − Min = ${bs.max} − ${bs.min} = ${rng}.`
            : `Read the vertical line splitting the box: Median = ${bs.med}.`
      ]
    });
  });

  // 18-23: Dot Plot Shape & Outliers (6 questions)
  const dotItems: Array<{
    counts: Record<number, number>;
    prompt: string;
    correct: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      counts: { 1: 4, 2: 5, 3: 3, 4: 2, 5: 1, 8: 1 },
      prompt: `How would you describe the shape of this dot plot?`,
      correct: 'Skewed Right (tail to the right)',
      wrongs: [
        { html: 'Skewed Left (tail to the left)', reason: 'The long tail with the high value (8) stretches to the RIGHT.' },
        { html: 'Roughly Symmetrical', reason: 'Left and right sides do not mirror each other.' },
        { html: 'Uniform', reason: 'Heights vary widely instead of staying flat.' }
      ],
      step: `The tail stretches toward higher values on the right → Skewed Right.`
    },
    {
      counts: { 2: 1, 5: 1, 6: 2, 7: 4, 8: 5, 9: 4 },
      prompt: `How would you describe the shape of this dot plot?`,
      correct: 'Skewed Left (tail to the left)',
      wrongs: [
        { html: 'Skewed Right (tail to the right)', reason: 'The tail of low values stretches to the LEFT.' },
        { html: 'Roughly Symmetrical', reason: 'There is a tail toward 2 on the left.' },
        { html: 'Bimodal', reason: 'There is only one main peak near 8.' }
      ],
      step: `The few low values on the left create a left tail → Skewed Left.`
    },
    {
      counts: { 3: 1, 4: 3, 5: 5, 6: 3, 7: 1 },
      prompt: `How would you describe the shape of this dot plot?`,
      correct: 'Symmetrical',
      wrongs: [
        { html: 'Skewed Right', reason: 'Both sides mirror each other around 5.' },
        { html: 'Skewed Left', reason: 'There is no tail on the left.' },
        { html: 'Has an extreme outlier', reason: 'All values cluster tightly from 3 to 7.' }
      ],
      step: `Left and right halves mirror each other around 5 → Symmetrical.`
    },
    {
      counts: { 1: 3, 2: 4, 3: 3, 9: 1 },
      prompt: `Which measure of center is affected MOST by the outlier at 9?`,
      correct: 'Mean',
      wrongs: [
        { html: 'Median', reason: 'The median is resistant to extreme outliers.' },
        { html: 'Mode', reason: 'The mode (2) is unchanged by one value at 9.' },
        { html: 'Interquartile Range', reason: 'IQR measures spread of the middle 50%, not center.' }
      ],
      step: `OST Rule: Outliers pull the Mean toward the outlier, while the Median stays steady.`
    },
    {
      counts: { 2: 2, 3: 4, 4: 5, 5: 4, 6: 2 },
      prompt: `What is the median of this symmetrical dot plot?`,
      correct: '4',
      wrongs: [
        { html: '3', reason: 'Count all 17 dots: the 9th dot sits at 4.' },
        { html: '5', reason: '5 is the mode of the upper half, not the middle.' },
        { html: '6', reason: '6 is the maximum, not the median.' }
      ],
      step: `By symmetry around 4, the middle value (median) is 4.`
    },
    {
      counts: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 2, 8: 1 },
      prompt: `What is the range of the data in this dot plot?`,
      correct: '7',
      wrongs: [
        { html: '4', reason: '4 is the mode (tallest stack), not the range.' },
        { html: '8', reason: '8 is the maximum; subtract the minimum (1).' },
        { html: '6', reason: 'Max = 8, Min = 1 → 8 − 1 = 7.' }
      ],
      step: `Range = Max − Min = 8 − 1 = 7.`
    }
  ];

  dotItems.forEach((di, idx) => {
    list.push({
      id: makeId('da', 18 + idx),
      topicId: 'data_analysis',
      taskType: 'DOT PLOTS & DISTRIBUTIONS:',
      promptHtml: di.prompt,
      visualTitle: 'DOT PLOT',
      visualHtml: svgDotPlot(di.counts, 1, 9),
      choices: [
        { html: di.correct, isCorrect: true, reason: '' },
        ...di.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [di.step],
      isLongChoice: di.correct.length > 15
    });
  });

  // 24-27: Correlation & Trend Recognition (4 questions)
  const corrItems: Array<{
    pts: Array<{ x: number; y: number }>;
    prompt: string;
    correct: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      pts: [{ x: 1, y: 2 }, { x: 2, y: 3.5 }, { x: 3, y: 4.5 }, { x: 4, y: 6 }, { x: 5, y: 7.5 }, { x: 6, y: 9 }],
      prompt: `Which correlation coefficient best matches this scatterplot?`,
      correct: 'r = +0.98 (Strong Positive)',
      wrongs: [
        { html: 'r = −0.98 (Strong Negative)', reason: 'The points go UP from left to right, so correlation is positive.' },
        { html: 'r = 0.00 (No Correlation)', reason: 'Points follow a very tight upward line.' },
        { html: 'r = +0.35 (Weak Positive)', reason: 'The points hug the line tightly, indicating strong correlation.' }
      ],
      step: `Points climb tightly up from left to right → Strong Positive (${atom('r ≈ +0.98')}).`
    },
    {
      pts: [{ x: 1, y: 9 }, { x: 2, y: 7.5 }, { x: 3, y: 6 }, { x: 4, y: 4.5 }, { x: 5, y: 3 }, { x: 6, y: 1.5 }],
      prompt: `What type of trend does this scatterplot show?`,
      correct: 'Negative trend (goes down left → right)',
      wrongs: [
        { html: 'Positive trend (goes up left → right)', reason: 'As x increases, y decreases.' },
        { html: 'No trend (scattered randomly)', reason: 'The points align clearly downward.' },
        { html: 'Quadratic U-shaped trend', reason: 'The points form a straight line, not a U.' }
      ],
      step: `Points decrease from left to right → Negative trend.`
    },
    {
      pts: [{ x: 1, y: 8 }, { x: 2, y: 2 }, { x: 3, y: 9 }, { x: 4, y: 3 }, { x: 5, y: 7 }, { x: 6, y: 1 }, { x: 4, y: 8 }],
      prompt: `What type of correlation does this scatterplot show?`,
      correct: 'No correlation (r ≈ 0)',
      wrongs: [
        { html: 'Strong positive correlation', reason: 'Points are scattered randomly with no upward pattern.' },
        { html: 'Strong negative correlation', reason: 'Points are scattered randomly with no downward line.' },
        { html: 'Perfect linear correlation', reason: 'No single line fits scattered points.' }
      ],
      step: `Randomly scattered points with no clear upward or downward direction → No correlation.`
    },
    {
      pts: [{ x: 1, y: 8 }, { x: 2, y: 7 }, { x: 3, y: 6 }, { x: 4, y: 5 }, { x: 5, y: 4 }, { x: 6, y: 3 }],
      prompt: `Which equation best fits the line for the scatterplot shown?`,
      correct: atom('y = −x + 9'),
      wrongs: [
        { html: atom('y = x + 9'), reason: 'The line goes downward, so the slope must be negative (−1).' },
        { html: atom('y = −2x + 9'), reason: 'At x = 6, −2(6) + 9 = −3, which is too steep.' },
        { html: atom('y = −x + 5'), reason: 'Check (1, 8): −1 + 5 = 4 ≠ 8.' }
      ],
      step: `From (1, 8) to (6, 3): slope = ${frac('3 − 8', '6 − 1')} = −1. y-intercept = 9 → ${atom('y = −x + 9')}.`
    }
  ];

  corrItems.forEach((ci, idx) => {
    list.push({
      id: makeId('da', 24 + idx),
      topicId: 'data_analysis',
      taskType: 'CORRELATION & LINE OF BEST FIT:',
      promptHtml: ci.prompt,
      visualTitle: 'SCATTERPLOT',
      visualHtml: svgCoordGraph({ xMin: 0, xMax: 7, yMin: 0, yMax: 10, step: 2, points: ci.pts }),
      choices: [
        { html: ci.correct, isCorrect: true, reason: '' },
        ...ci.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [ci.step],
      isLongChoice: ci.correct.length > 18
    });
  });

  // 28-30: Additional Two-Way & Histogram Comparisons (3 questions)
  list.push({
    id: makeId('da', 28),
    topicId: 'data_analysis',
    taskType: 'HISTOGRAM — MEAN VS MEDIAN:',
    promptHtml: `In a dataset of salaries, one CEO earns $500,000 while 19 employees earn $40,000–$55,000. How do the Mean and Median compare?`,
    choices: [
      { html: 'The Mean is greater than the Median (skewed right)', isCorrect: true, reason: '' },
      { html: 'The Median is greater than the Mean (skewed left)', isCorrect: false, reason: 'A high outlier pulls the Mean UP above the Median.' },
      { html: 'The Mean and Median are equal', isCorrect: false, reason: 'Only symmetrical distributions have Mean = Median.' },
      { html: 'The Median increases to $250,000', isCorrect: false, reason: 'The Median stays near $48,000 because it is the middle value.' }
    ],
    steps: [
      `The extreme high outlier ($500,000) pulls the average (Mean) upward.`,
      `The Median stays in the middle cluster → Mean > Median.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('da', 29),
    topicId: 'data_analysis',
    taskType: 'TWO-WAY FREQUENCY TABLE:',
    promptHtml: `A school surveyed 120 students on band & sports. 70 play sports, 45 are in band, and 20 do BOTH. How many students do <b>neither</b>?`,
    visualTitle: 'STUDENT ACTIVITIES',
    visualHtml: htmlTable(['Activity', 'Band', 'No Band', 'Total'], [
      ['Sports', 20, '?', 70], ['No Sports', '?', '?', 50], ['Total', 45, 75, 120]
    ]),
    choices: [
      { html: '25', isCorrect: true, reason: '' },
      { html: '50', isCorrect: false, reason: '50 is the total number of students who play No Sports (including band-only).' },
      { html: '15', isCorrect: false, reason: 'Subtract Band-only students (45 − 20 = 25) from No Sports (50): 50 − 25 = 25.' },
      { html: '30', isCorrect: false, reason: 'Check: Band & No Sports = 45 − 20 = 25, so Neither = 50 − 25 = 25.' }
    ],
    steps: [
      `Band & No Sports = Total Band (45) − Both (20) = 25.`,
      `Neither = Total No Sports (50) − 25 = 25.`
    ]
  });

  list.push({
    id: makeId('da', 30),
    topicId: 'data_analysis',
    taskType: 'CHICKEN VS BEEF SANDWICHES:',
    promptHtml: `Chicken sandwiches have calories mostly between 100–200 (median ~150), while Beef sandwiches peak at 50–100 (median ~130, max 350). Which statement is true?`,
    visualTitle: 'SANDWICH CALORIES',
    visualHtml: svgHistogram([
      { label: '50', count: 2 }, { label: '100', count: 5 }, { label: '150', count: 3 }, { label: '200', count: 2 }, { label: '250', count: 3 }
    ], 'Chicken Sandwiches', '#10b981'),
    choices: [
      { html: 'Beef has a wider range (50 to 350) than Chicken (50 to 300)', isCorrect: true, reason: '' },
      { html: 'Chicken has a higher maximum than Beef', isCorrect: false, reason: 'Beef reaches 350 calories, higher than Chicken’s 300.' },
      { html: 'Both datasets have identical medians and ranges', isCorrect: false, reason: 'Beef reaches 350 while Chicken stops at 300.' },
      { html: 'Chicken minimum is 150 calories', isCorrect: false, reason: 'The first bar starts at 50–100 calories.' }
    ],
    steps: [
      `Read min and max bins: Chicken spans 50–300 (range 250), Beef spans 50–350 (range 300).`,
      `Beef has the wider range.`
    ],
    isLongChoice: true
  });

  return list;
}

// ============================================================================
// TOPIC 3: ALL THINGS POLYNOMIALS (30 PROBLEMS)
// ============================================================================
function buildPolynomialProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-4: Exact PDF Page 11 problems
  list.push({
    id: makeId('poly', 1),
    topicId: 'polynomials',
    taskType: 'SIMPLIFY POLYNOMIAL:',
    promptHtml: `Which expression is equivalent to ${atom('(2x − 3) + [4x(3x + 2)]')}?`,
    choices: [
      { html: atom('9x − 1'), isCorrect: false, reason: 'Multiplying 4x(3x) creates an x² term (12x²).' },
      { html: atom('14x + 5'), isCorrect: false, reason: '4x(3x) is 12x², not 12x.' },
      { html: polyHtml(12, 2, -1), isCorrect: false, reason: 'Check 4x(2) = 8x, so 2x + 8x = 10x, and constant stays −3.' },
      { html: polyHtml(12, 10, -3), isCorrect: true, reason: '' }
    ],
    steps: [
      `Distribute 4x first: ${atom(`4x(3x + 2) = 12${pow('x', 2)} + 8x`)}.`,
      `Combine with ${atom('(2x − 3)')}: ${atom(`${polyHtml(12, 10, -3)}`)}.`
    ]
  });

  list.push({
    id: makeId('poly', 2),
    topicId: 'polynomials',
    taskType: 'MULTIPLY POLYNOMIALS (BOX METHOD):',
    promptHtml: `Which expression is equivalent to ${atom(`(2${pow('x', 2)} + 3)(x + 4)`)}?`,
    choices: [
      { html: cubicPolyHtml(2, 0, 0, 12), isCorrect: false, reason: 'You must multiply all 4 boxes in the Box Method, not just first × first and last × last!' },
      { html: polyHtml(2, 11, 12), isCorrect: false, reason: `${atom(`2${pow('x', 2)} · x = 2${pow('x', 3)}`)}, not 2x².` },
      { html: cubicPolyHtml(2, 6, 4, 12), isCorrect: false, reason: `Check the boxes: 2x²·4 = 8x² and 3·x = 3x.` },
      { html: cubicPolyHtml(2, 8, 3, 12), isCorrect: true, reason: '' }
    ],
    steps: [
      `Box Method products: ${atom(`2${pow('x', 2)}·x = 2${pow('x', 3)}`)}, ${atom(`2${pow('x', 2)}·4 = 8${pow('x', 2)}`)}, ${atom('3·x = 3x')}, ${atom('3·4 = 12')}.`,
      `Combine: ${cubicPolyHtml(2, 8, 3, 12)}.`
    ]
  });

  list.push({
    id: makeId('poly', 3),
    topicId: 'polynomials',
    taskType: 'EQUIVALENT POLYNOMIALS:',
    promptHtml: `Which expression is equivalent to ${atom('(2x + 3)(6x − 12)')}?`,
    choices: [
      { html: polyHtml(12, 0, -36), isCorrect: false, reason: 'Do not skip the middle terms: −24x + 18x = −6x.' },
      { html: atom(`6(2${pow('x', 2)} − x − 6)`), isCorrect: true, reason: '' },
      { html: polyHtml(12, 6, -36), isCorrect: false, reason: '−24x + 18x = −6x, not +6x.' },
      { html: polyHtml(12, -42, -36), isCorrect: false, reason: '−24x + 18x = −6x, not −42x.' }
    ],
    steps: [
      `Multiply: ${atom(`12${pow('x', 2)} − 24x + 18x − 36 = ${polyHtml(12, -6, -36)}`)}.`,
      `Factor out 6: ${atom(`6(2${pow('x', 2)} − x − 6)`)}.`
    ]
  });

  list.push({
    id: makeId('poly', 4),
    topicId: 'polynomials',
    taskType: 'IDENTIFY COEFFICIENT:',
    promptHtml: `An equation is given: ${atom(`(7x − 4)(5x + 3) = F${pow('x', 2)} + Gx + H`)}. What is the value of ${atom('H')}?`,
    choices: [
      { html: '−12', isCorrect: true, reason: '' },
      { html: '−1', isCorrect: false, reason: '21x − 20x = +1x (so G = 1), while H is the constant (−4)(3) = −12.' },
      { html: '1', isCorrect: false, reason: '1 is the value of G (the x-coefficient), not the constant H.' },
      { html: '8', isCorrect: false, reason: 'Multiply −4 and 3 to get H = −12.' }
    ],
    steps: [
      `Expand: ${atom(`35${pow('x', 2)} + 21x − 20x − 12 = 35${pow('x', 2)} + 1x − 12`)}.`,
      `The constant term H is −12.`
    ]
  });

  // 5-12: Adding Polynomials (8 problems)
  const addTuples: Array<[number, number, number, number, number, number]> = [
    [3, 0, 3, -2, 0, 7],   // PDF p.11: (3x^2 + 3) + (-2x^2 + 7)
    [3, 2, 5, 1, 4, -1],   // PDF p.10 example
    [4, -3, 6, 2, 5, -9],
    [5, 4, -2, -3, 2, 8],
    [2, -7, 1, 4, 3, -5],
    [-3, 6, 4, 5, -2, 3],
    [6, -1, -8, -4, 5, 2],
    [7, 3, -4, -2, -8, 9]
  ];

  addTuples.forEach(([a1, b1, c1, a2, b2, c2], idx) => {
    const ra = a1 + a2;
    const rb = b1 + b2;
    const rc = c1 + c2;
    const correct = polyHtml(ra, rb, rc);
    const w1 = polyHtml(a1 - a2, b1 - b2, c1 - c2);
    const w2 = polyHtml(ra, rb, c1 - c2);
    const w3 = polyHtml(ra + 1, rb - 1, rc);
    const seen = new Set([correct]);
    const wrongs = [
      { html: w1, reason: 'You subtracted instead of adding! With a + sign between parentheses, keep all signs as they are.' },
      { html: w2, reason: 'Check the constant term when adding integers.' },
      { html: w3, reason: 'Only combine like terms (x² with x², x with x, constants with constants).' }
    ].filter(w => !seen.has(w.html) && seen.add(w.html));
    while (wrongs.length < 3) {
      wrongs.push({ html: polyHtml(ra, rb + wrongs.length + 2, rc - 1), reason: 'Double-check your like-term addition.' });
    }

    list.push({
      id: makeId('poly', 5 + idx),
      topicId: 'polynomials',
      taskType: 'ADD POLYNOMIALS:',
      promptHtml: `Create an equivalent expression using the fewest terms: ${atom(`(${polyHtml(a1, b1, c1)}) + (${polyHtml(a2, b2, c2)})`)}`,
      choices: [
        { html: correct, isCorrect: true, reason: '' },
        ...wrongs.slice(0, 3).map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Drop parentheses and group like terms: ${atom(`(${a1} + ${a2})${pow('x', 2)}`)}, ${atom(`(${b1} + ${b2})x`)}, ${atom(`(${c1} + ${c2})`)}.`,
        `Simplified: ${correct}.`
      ]
    });
  });

  // 13-21: Subtracting Polynomials — Flip All Signs in 2nd Polynomial! (9 problems)
  const subTuples: Array<[number, number, number, number, number, number]> = [
    [3, -4, 1, -1, 0, 6],   // PDF p.11: (3x^2 - 4x + 1) - (-x^2 + 6)
    [5, 3, -2, 2, -1, 4],   // PDF p.10 example
    [6, -2, 5, 2, 4, -3],
    [4, 7, -3, -2, 3, 5],
    [7, -5, 2, 3, -8, 6],
    [2, 6, -9, 5, -2, -4],
    [8, -3, 1, -2, 5, -7],
    [5, 0, 4, 2, -6, 9],
    [9, -4, -3, 4, -4, 5]
  ];

  subTuples.forEach(([a1, b1, c1, a2, b2, c2], idx) => {
    const ra = a1 - a2;
    const rb = b1 - b2;
    const rc = c1 - c2;
    const correct = polyHtml(ra, rb, rc);
    const forgotSign = polyHtml(a1 - a2, b1 + b2, c1 + c2);
    const addedInstead = polyHtml(a1 + a2, b1 + b2, c1 + c2);
    const lastForgot = polyHtml(ra, rb, c1 + c2);

    const seen = new Set([correct]);
    const wrongs: Array<{ html: string; reason: string }> = [];
    for (const cand of [
      { html: forgotSign, reason: 'Sign Flip Error! You must distribute the minus sign to EVERY term in the second polynomial.' },
      { html: addedInstead, reason: 'You added the terms instead of subtracting the second polynomial.' },
      { html: lastForgot, reason: 'You forgot to flip the sign of the last constant term when distributing the negative!' }
    ]) {
      if (!seen.has(cand.html)) {
        seen.add(cand.html);
        wrongs.push(cand);
      }
    }
    let bump = 1;
    while (wrongs.length < 3) {
      const alt = polyHtml(ra + bump, rb - bump, rc);
      bump++;
      if (!seen.has(alt)) {
        seen.add(alt);
        wrongs.push({ html: alt, reason: 'Re-check your sign flips and integer subtraction.' });
      }
    }

    list.push({
      id: makeId('poly', 13 + idx),
      topicId: 'polynomials',
      taskType: 'SUBTRACT POLYNOMIALS (FLIP SIGNS):',
      promptHtml: `Simplify: ${atom(`(${polyHtml(a1, b1, c1)}) − (${polyHtml(a2, b2, c2)})`)}`,
      choices: [
        { html: correct, isCorrect: true, reason: '' },
        ...wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Flip ALL signs in the second polynomial: ${atom(`+ (${polyHtml(-a2, -b2, -c2)})`)}.`,
        `Combine like terms → ${correct}.`
      ]
    });
  });

  // 22-30: Multiplying Binomials & Finding F/G/H Coefficients (9 problems)
  const multTuples: Array<[number, number, number, number, 'expr' | 'G' | 'F' | 'H']> = [
    [2, -5, 1, 3, 'expr'],  // PDF p.10 Box Method example: (2x-5)(x+3)
    [3, 2, 2, -5, 'expr'],
    [4, -1, 3, 2, 'expr'],
    [5, 3, 2, -4, 'G'],
    [3, -7, 4, 1, 'G'],
    [6, -5, 2, 3, 'H'],
    [4, 3, 5, -2, 'F'],
    [2, 7, 3, -4, 'expr'],
    [5, -2, 3, 4, 'expr']
  ];

  multTuples.forEach(([p, q, r, s, ask], idx) => {
    const F = p * r;
    const G = p * s + q * r;
    const H = q * s;
    const f1 = formatLinearFactor(p, q);
    const f2 = formatLinearFactor(r, s);

    if (ask === 'expr') {
      const correct = polyHtml(F, G, H);
      const w1 = polyHtml(F, p * s - q * r, H);
      const w2 = polyHtml(F, 0, H);
      const w3 = polyHtml(F, G, -H);
      list.push({
        id: makeId('poly', 22 + idx),
        topicId: 'polynomials',
        taskType: 'MULTIPLY POLYNOMIALS (BOX METHOD):',
        promptHtml: `Multiply using the Box Method: ${atom(`${f1}${f2}`)}`,
        choices: [
          { html: correct, isCorrect: true, reason: '' },
          { html: w1, isCorrect: false, reason: `Check middle boxes: (${p}x)(${s}) + (${q})(${r}x) = ${p * s}x + ${q * r}x = ${G}x.` },
          { html: w2, isCorrect: false, reason: 'Do not skip the two cross-product boxes (outer + inner).' },
          { html: w3, isCorrect: false, reason: `Check constant box: (${q})(${s}) = ${H}, not ${-H}.` }
        ],
        steps: [
          `Box products: ${atom(`${F}${pow('x', 2)}`)}, ${atom(`${p * s}x`)}, ${atom(`${q * r}x`)}, ${atom(`${H}`)}.`,
          `Combine middle terms: ${correct}.`
        ]
      });
    } else {
      const ans = ask === 'F' ? F : ask === 'G' ? G : H;
      const wSet = new Set([F, G, H, -ans, p * s - q * r]);
      wSet.delete(ans);
      const wrongs = Array.from(wSet).slice(0, 3);
      while (wrongs.length < 3) wrongs.push(ans + wrongs.length + 2);

      list.push({
        id: makeId('poly', 22 + idx),
        topicId: 'polynomials',
        taskType: 'POLYNOMIAL COEFFICIENTS:',
        promptHtml: `Given ${atom(`${f1}${f2} = F${pow('x', 2)} + Gx + H`)}, what is the value of ${atom(ask)}?`,
        choices: [
          { html: `${ans}`, isCorrect: true, reason: '' },
          ...wrongs.map(w => ({
            html: `${w}`,
            isCorrect: false,
            reason: `Expand ${atom(`${f1}${f2}`)} = ${polyHtml(F, G, H)}, so ${ask} = ${ans}.`
          }))
        ],
        steps: [
          `Multiply using Box Method: ${atom(`${f1}${f2} = ${polyHtml(F, G, H)}`)}.`,
          `Match coefficients: F = ${F}, G = ${G}, H = ${H}. So ${ask} = ${ans}.`
        ]
      });
    }
  });

  return list;
}

// ============================================================================
// TOPIC 4: FUNCTIONS AND FUNCTION NOTATIONS (30 PROBLEMS)
// ============================================================================
function buildFunctionProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1: Ordered pairs can be included (PDF p.13)
  list.push({
    id: makeId('fn', 1),
    topicId: 'functions',
    taskType: 'IDENTIFY A FUNCTION:',
    promptHtml: `The set of ordered pairs representing a function is ${atom('(1, 3), (2, 4), (5, 6)')}. Which ordered pair could be included so that it <b>remains a function</b>?`,
    choices: [
      { html: atom('(2, 2)'), isCorrect: false, reason: 'x = 2 already maps to 4! Repeating x with a different y breaks the function.' },
      { html: atom('(3, 4)'), isCorrect: true, reason: '' },
      { html: atom('(5, 7)'), isCorrect: false, reason: 'x = 5 already maps to 6!' },
      { html: atom('(1, 6)'), isCorrect: false, reason: 'x = 1 already maps to 3!' }
    ],
    steps: [
      `A function cannot have any repeated x-value paired with a different y-value.`,
      `Used x-values are 1, 2, 5. Only (3, 4) introduces a brand-new x-value (repeating y = 4 is completely fine!).`
    ]
  });

  // 2: Which table represents y as a function of x (PDF p.13)
  list.push({
    id: makeId('fn', 2),
    topicId: 'functions',
    taskType: 'FUNCTION TABLES:',
    promptHtml: `Which set of table pairs represents ${atom('y')} as a <b>function of x</b>?`,
    choices: [
      { html: 'x: 0, 0, 0  |  y: 3, 5, 7', isCorrect: false, reason: 'x = 0 repeats with three different outputs (3, 5, 7) → NOT a function.' },
      { html: 'x: 3, 5, 7  |  y: 0, 0, 0', isCorrect: true, reason: '' },
      { html: 'x: 0, 4, 4  |  y: 0, 2, −2', isCorrect: false, reason: 'x = 4 repeats with both 2 and −2 → NOT a function.' },
      { html: 'x: 1, 9, 9  |  y: 0, −3, 3', isCorrect: false, reason: 'x = 9 repeats with −3 and 3 → NOT a function.' }
    ],
    steps: [
      `Check the x-column: every x-value must appear only once (or give the exact same y).`,
      `Only {3, 5, 7} has all unique x-values (repeated y-values are allowed!).`
    ],
    isLongChoice: true
  });

  // 3: Ryan's delivery pay (PDF p.13)
  list.push({
    id: makeId('fn', 3),
    topicId: 'functions',
    taskType: 'FUNCTION TABLE — LINEAR:',
    promptHtml: `Ryan's daily pay is ${atom('f(n) = 7n + 96')} for ${atom('n')} deliveries. How many deliveries does he make on a day he earns <b>$166</b>?`,
    visualTitle: 'DELIVERY PAY TABLE',
    visualHtml: htmlTable(['n', 'f(n)'], [[0, 96], [10, 166], ['?', 236]]),
    choices: [
      { html: '10 deliveries', isCorrect: true, reason: '' },
      { html: '7 deliveries', isCorrect: false, reason: 'f(7) = 7(7) + 96 = 145, not 166.' },
      { html: '20 deliveries', isCorrect: false, reason: '20 deliveries pays 7(20) + 96 = $236.' },
      { html: '14 deliveries', isCorrect: false, reason: 'Solve 7n + 96 = 166 → 7n = 70 → n = 10.' }
    ],
    steps: [
      `Set ${atom('7n + 96 = 166')}.`,
      `Subtract 96: ${atom('7n = 70')} → ${atom('n = 10 deliveries')}.`
    ]
  });

  // 4: f(x) = 2^x + 3 find f(-2) (PDF p.13)
  list.push({
    id: makeId('fn', 4),
    topicId: 'functions',
    taskType: 'EVALUATE EXPONENTIAL FUNCTION:',
    promptHtml: `A function is given: ${atom(`f(x) = ${pow('2', 'x')} + 3`)}. What is the value of ${atom('f(−2)')}?`,
    choices: [
      { html: atom(frac(13, 4)), isCorrect: true, reason: '' },
      { html: '−1', isCorrect: false, reason: `${pow('2', '−2')} = ${frac(1, 4)}, NOT −4!` },
      { html: atom(frac(11, 4)), isCorrect: false, reason: `${frac(1, 4)} + 3 = ${frac(1, 4)} + ${frac(12, 4)} = ${frac(13, 4)}.` },
      { html: '7', isCorrect: false, reason: `That is f(2) = 4 + 3 = 7, not f(−2).` }
    ],
    steps: [
      `Substitute ${atom('x = −2')}: ${atom(`f(−2) = ${pow('2', '−2')} + 3 = ${frac(1, 4)} + 3`)}.`,
      `Add: ${atom(`${frac(1, 4)} + ${frac(12, 4)} = ${frac(13, 4)}`)} (or 3.25).`
    ]
  });

  // 5: f(x) = (2/3)x + 3 find f(12) (PDF p.13)
  list.push({
    id: makeId('fn', 5),
    topicId: 'functions',
    taskType: 'EVALUATE LINEAR FUNCTION:',
    promptHtml: `A function is shown: ${atom(`f(x) = ${frac(2, 3)}x + 3`)}. What is the value of ${atom('f(12)')}?`,
    choices: [
      { html: '11', isCorrect: true, reason: '' },
      { html: '8', isCorrect: false, reason: `8 is just ${frac(2, 3)}(12); don't forget to add 3!` },
      { html: '21', isCorrect: false, reason: `Divide by 3, not multiply: ${frac(2, 3)}(12) = 8, not 18.` },
      { html: '15', isCorrect: false, reason: `Check: 12 ÷ 3 × 2 = 8, and 8 + 3 = 11.` }
    ],
    steps: [
      `Plug in 12: ${atom(`f(12) = ${frac(2, 3)}(12) + 3`)}.`,
      `Multiply: ${atom('8 + 3 = 11')}.`
    ]
  });

  // 6-10: Vertical Line Test & Relation Function Tests (5 problems)
  list.push({
    id: makeId('fn', 6),
    topicId: 'functions',
    taskType: 'VERTICAL LINE TEST (VLT):',
    promptHtml: `Does the graph shown represent a <b>function</b>?`,
    visualTitle: 'GRAPH CHECK (VLT)',
    visualHtml: svgCoordGraph({
      xMin: -5, xMax: 5, yMin: -5, yMax: 5, step: 2,
      customPath: `<path d="M 190 30 Q 40 110 190 190" fill="none" stroke="#fbbf24" stroke-width="2.6" />`,
      vertLines: [{ x: 1.5, color: '#ef4444', dashed: true }]
    }),
    choices: [
      { html: 'No — fails the Vertical Line Test (hits twice)', isCorrect: true, reason: '' },
      { html: 'Yes — passes the Vertical Line Test', isCorrect: false, reason: 'A vertical line crosses this sideways parabola at 2 points.' },
      { html: 'Yes — because it is curved', isCorrect: false, reason: 'Curved graphs can still fail VLT if they loop back vertically.' },
      { html: 'No — because it crosses the x-axis', isCorrect: false, reason: 'Crossing the x-axis does not disqualify a function; hitting a vertical line twice does.' }
    ],
    steps: [
      `Draw an imaginary vertical line through the graph.`,
      `It hits the curve more than once → NOT a function.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('fn', 7),
    topicId: 'functions',
    taskType: 'VERTICAL LINE TEST (VLT):',
    promptHtml: `Does the parabola ${atom(`y = ${pow('x', 2)} − 2`)} shown below represent a function?`,
    visualTitle: 'PARABOLA GRAPH',
    visualHtml: svgCoordGraph({
      xMin: -4, xMax: 4, yMin: -4, yMax: 6, step: 2,
      parabolas: [{ a: 1, b: 0, c: -2, color: '#34d399' }],
      vertLines: [{ x: 1, color: '#38bdf8', dashed: true }]
    }),
    choices: [
      { html: 'Yes — every vertical line hits the graph at most once', isCorrect: true, reason: '' },
      { html: 'No — it has two x-intercepts', isCorrect: false, reason: 'Having two x-intercepts fails the Horizontal Line Test, NOT the Vertical Line Test!' },
      { html: 'No — y-values repeat on the left and right', isCorrect: false, reason: 'Repeating y-values is allowed in a function.' },
      { html: 'No — it opens upward', isCorrect: false, reason: 'Upward parabolas always pass the Vertical Line Test.' }
    ],
    steps: [
      `Draw any vertical line: it touches the parabola at only ONE point.`,
      `One hit per vertical line → YES, it is a function.`
    ],
    isLongChoice: true
  });

  const relSets: Array<{ pairs: string; isFn: boolean; why: string }> = [
    { pairs: '(−2, 5), (0, 5), (3, 5), (7, 5)', isFn: true, why: 'All x-values (−2, 0, 3, 7) are unique. Repeating y = 5 is allowed!' },
    { pairs: '(1, 4), (3, 8), (1, −4), (5, 2)', isFn: false, why: 'x = 1 repeats with two different y-values (4 and −4).' },
    { pairs: '(−4, 1), (−1, 3), (2, 7), (4, 1)', isFn: true, why: 'Every x-value (−4, −1, 2, 4) appears only once.' }
  ];
  relSets.forEach((rs, i) => {
    list.push({
      id: makeId('fn', 8 + i),
      topicId: 'functions',
      taskType: 'ORDERED PAIRS — FUNCTION TEST:',
      promptHtml: `Does the set ${atom(rs.pairs)} represent a function?`,
      choices: [
        { html: rs.isFn ? 'Yes, it is a function' : 'No, it is NOT a function', isCorrect: true, reason: '' },
        { html: rs.isFn ? 'No, because y repeats' : 'Yes, because every y is positive/valid', isCorrect: false, reason: rs.why },
        { html: rs.isFn ? 'No, because x is negative' : 'Yes, all ordered pairs are valid', isCorrect: false, reason: rs.why },
        { html: 'Cannot be determined without a graph', isCorrect: false, reason: 'Just check whether any x-value repeats with a different y.' }
      ],
      steps: [
        `Check the x-coordinates in each ordered pair.`,
        rs.why
      ],
      isLongChoice: true
    });
  });

  // 11-20: Evaluate f(x) with fractions, quadratics & exponentials (10 problems)
  const evalItems: Array<{
    fnHtml: string;
    xVal: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      fnHtml: `f(x) = ${frac(3, 4)}x − 5`, xVal: '8', ansHtml: '1',
      wrongs: [
        { html: '6', reason: '6 is ¾(8); you forgot to subtract 5.' },
        { html: '11', reason: 'Subtract 5 from 6, do not add.' },
        { html: '−2', reason: 'Multiply 8 × 3 ÷ 4 = 6, then 6 − 5 = 1.' }
      ],
      step: `${atom(`f(8) = ${frac(3, 4)}(8) − 5 = 6 − 5 = 1`)}.`
    },
    {
      fnHtml: `f(x) = ${frac(5, 2)}x + 4`, xVal: '−6', ansHtml: '−11',
      wrongs: [
        { html: '19', reason: `Check the negative sign: ${frac(5, 2)}(−6) = −15, not +15.` },
        { html: '−19', reason: '−15 + 4 = −11, not −19.' },
        { html: '−15', reason: 'Remember to add 4 after multiplying.' }
      ],
      step: `${atom(`f(−6) = ${frac(5, 2)}(−6) + 4 = −15 + 4 = −11`)}.`
    },
    {
      fnHtml: `g(x) = 3${pow('x', 2)} − 4x + 1`, xVal: '−2', ansHtml: '21',
      wrongs: [
        { html: '−3', reason: `Careful: ${pow('(−2)', 2)} = +4, NOT −4!` },
        { html: '5', reason: 'Careful: −4(−2) = +8, NOT −8!' },
        { html: '13', reason: 'Check both signs: 3(4) + 8 + 1 = 21.' }
      ],
      step: `${atom(`g(−2) = 3(4) − 4(−2) + 1 = 12 + 8 + 1 = 21`)}.`
    },
    {
      fnHtml: `h(x) = ${pow('3', 'x')} − 4`, xVal: '−1', ansHtml: atom(`−${frac(11, 3)}`),
      wrongs: [
        { html: '−7', reason: `${pow('3', '−1')} = ${frac(1, 3)}, NOT −3!` },
        { html: atom(frac(13, 3)), reason: `Subtract 4 from ${frac(1, 3)}: ${frac(1, 3)} − ${frac(12, 3)} = −${frac(11, 3)}.` },
        { html: '−1', reason: `${pow('3', '−1')} is ${frac(1, 3)}, not 3.` }
      ],
      step: `${atom(`h(−1) = ${pow('3', '−1')} − 4 = ${frac(1, 3)} − ${frac(12, 3)} = −${frac(11, 3)}`)}.`
    },
    {
      fnHtml: `f(x) = −${frac(1, 3)}x + 7`, xVal: '15', ansHtml: '2',
      wrongs: [
        { html: '12', reason: `There is a negative sign in front of ${frac(1, 3)}: −5 + 7 = 2.` },
        { html: '−5', reason: 'Do not forget to add 7.' },
        { html: '−2', reason: '−5 + 7 = +2.' }
      ],
      step: `${atom(`f(15) = −${frac(1, 3)}(15) + 7 = −5 + 7 = 2`)}.`
    },
    {
      fnHtml: `p(x) = 2${pow('x', 2)} − 9`, xVal: '3', ansHtml: '9',
      wrongs: [
        { html: '27', reason: 'Square 3 first (3² = 9), then multiply by 2 (18), NOT (2·3)²!' },
        { html: '3', reason: '3² = 9, so 2(9) − 9 = 9.' },
        { html: '18', reason: 'Remember to subtract 9 at the end.' }
      ],
      step: `${atom('p(3) = 2(9) − 9 = 18 − 9 = 9')}.`
    },
    {
      fnHtml: `f(x) = 4(${pow('2', 'x')})`, xVal: '−2', ansHtml: '1',
      wrongs: [
        { html: '−16', reason: `Negative exponent means reciprocal: ${pow('2', '−2')} = ${frac(1, 4)}.` },
        { html: '16', reason: 'That is f(2), not f(−2).' },
        { html: atom(frac(1, 4)), reason: `Multiply ${frac(1, 4)} by 4 to get 1.` }
      ],
      step: `${atom(`f(−2) = 4 · ${frac(1, 4)} = 1`)}.`
    },
    {
      fnHtml: `f(x) = ${frac('3x + 5', 2)}`, xVal: '3', ansHtml: '7',
      wrongs: [
        { html: atom(frac(14, 3)), reason: 'Substitute x = 3 into the numerator: 3(3) + 5 = 14, then divide by 2.' },
        { html: '14', reason: 'Remember to divide by 2 at the end.' },
        { html: '5', reason: '3(3) = 9, 9 + 5 = 14, 14 ÷ 2 = 7.' }
      ],
      step: `${atom(`f(3) = ${frac('3(3) + 5', 2)} = ${frac(14, 2)} = 7`)}.`
    },
    {
      fnHtml: `f(x) = ${frac(4, 5)}x − 2`, xVal: '10', ansHtml: '6',
      wrongs: [
        { html: '8', reason: `8 is just ${frac(4, 5)}(10); subtract 2.` },
        { html: '10', reason: 'Subtract 2 instead of adding.' },
        { html: '2', reason: '10 ÷ 5 × 4 = 8, then 8 − 2 = 6.' }
      ],
      step: `${atom(`f(10) = ${frac(4, 5)}(10) − 2 = 8 − 2 = 6`)}.`
    },
    {
      fnHtml: `f(x) = ${pow('5', 'x')} + 1`, xVal: '−1', ansHtml: atom(frac(6, 5)),
      wrongs: [
        { html: '−4', reason: `${pow('5', '−1')} = ${frac(1, 5)}, NOT −5.` },
        { html: atom(frac(4, 5)), reason: `Add 1 to ${frac(1, 5)}: ${frac(1, 5)} + ${frac(5, 5)} = ${frac(6, 5)}.` },
        { html: '6', reason: 'That is f(1), not f(−1).' }
      ],
      step: `${atom(`f(−1) = ${frac(1, 5)} + 1 = ${frac(6, 5)}`)}.`
    }
  ];

  evalItems.forEach((ev, idx) => {
    list.push({
      id: makeId('fn', 11 + idx),
      topicId: 'functions',
      taskType: 'FUNCTION NOTATION — EVALUATE:',
      promptHtml: `Given ${atom(ev.fnHtml)}, what is the value of ${atom(`f(${ev.xVal})`.replace('f(', ev.fnHtml.split('(')[0] + '('))}?`,
      choices: [
        { html: ev.ansHtml, isCorrect: true, reason: '' },
        ...ev.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [ev.step]
    });
  });

  // 21-30: Finding x when given y = f(x) + Completing Tables (10 problems)
  const solveFnItems: Array<{ m: number; b: number; y: number; xAns: number }> = [
    { m: 3, b: -4, y: 17, xAns: 7 },
    { m: -2, b: 15, y: 3, xAns: 6 },
    { m: 5, b: 12, y: 47, xAns: 7 },
    { m: 4, b: -9, y: 23, xAns: 8 },
    { m: -3, b: 20, y: 2, xAns: 6 },
    { m: 6, b: 18, y: 60, xAns: 7 },
    { m: 7, b: 96, y: 131, xAns: 5 },
    { m: 8, b: -12, y: 52, xAns: 8 },
    { m: -5, b: 40, y: 15, xAns: 5 },
    { m: 9, b: 11, y: 83, xAns: 8 }
  ];

  solveFnItems.forEach((sf, idx) => {
    const fnStr = `f(x) = ${linearExpr(sf.m, 1, sf.b)}`;
    const wrongs = [sf.xAns - 2, sf.xAns + 2, Math.abs(sf.xAns - 4) || 11];
    list.push({
      id: makeId('fn', 21 + idx),
      topicId: 'functions',
      taskType: 'FIND x WHEN GIVEN f(x):',
      promptHtml: `If ${atom(fnStr)}, find ${atom('x')} when ${atom(`f(x) = ${sf.y}`)}.`,
      choices: [
        { html: atom(`x = ${sf.xAns}`), isCorrect: true, reason: '' },
        ...wrongs.map(w => ({
          html: atom(`x = ${w}`),
          isCorrect: false,
          reason: `Plugging in ${w} gives ${sf.m * w + sf.b}, not ${sf.y}.`
        }))
      ],
      steps: [
        `Set ${atom(`${linearExpr(sf.m, 1, sf.b)} = ${sf.y}`)}.`,
        `${atom(`${sf.m}x = ${sf.y - sf.b}`)} → ${atom(`x = ${sf.xAns}`)}.`
      ]
    });
  });

  return list;
}

// ============================================================================
// TOPIC 5: FACTORING, SOLVING, MODELING, ANALYZING QUADRATICS (30 PROBLEMS)
// ============================================================================
function buildQuadraticProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-4: Exact PDF Page 15-16 iconic problems
  list.push({
    id: makeId('qd', 1),
    topicId: 'quadratics',
    taskType: 'SOLVE QUADRATIC (OST):',
    promptHtml: `What values of ${atom('x')} make ${atom(`2${pow('x', 2)} − 5x − 3 = 0`)} true?`,
    xMethodData: { a: 2, b: -5, c: -3, ac: -6, m1: -6, m2: 1, simp1Num: -3, simp1Den: 1, simp2Num: 1, simp2Den: 2 },
    choices: [
      { html: atom(`x = 3, x = −${frac(1, 2)}`), isCorrect: true, reason: '' },
      { html: atom(`x = −3, x = ${frac(1, 2)}`), isCorrect: false, reason: 'Remember to flip the signs when solving (x − 3)(2x + 1) = 0!' },
      { html: atom('x = 6, x = −1'), isCorrect: false, reason: 'You forgot to divide the X-Method wings (−6 and 1) by a = 2.' },
      { html: atom(`x = 3, x = ${frac(1, 2)}`), isCorrect: false, reason: 'Check the sign on the second factor (2x + 1) = 0 → x = −½.' }
    ],
    steps: [
      `X-Method: Top A·C = −6, Bottom B = −5 → wings are −6 and +1.`,
      `Divide by a = 2: ${frac('−6', 2)} = −3 and ${frac(1, 2)}. Factored: ${atom('(x − 3)(2x + 1) = 0')}.`,
      `Flip signs to solve: ${atom(`x = 3, x = −${frac(1, 2)}`)}.`
    ]
  });

  list.push({
    id: makeId('qd', 2),
    topicId: 'quadratics',
    taskType: 'SOLVE QUADRATIC (STANDARD FORM FIRST):',
    promptHtml: `An equation is given: ${atom(`40 = ${pow('x', 2)} − 3x`)}. What is one solution?`,
    xMethodData: { a: 1, b: -3, c: -40, ac: -40, m1: -8, m2: 5, simp1Num: -8, simp1Den: 1, simp2Num: 5, simp2Den: 1 },
    choices: [
      { html: atom('x = 8'), isCorrect: true, reason: '' },
      { html: atom('x = −8'), isCorrect: false, reason: 'Standard form is x² − 3x − 40 = 0 → (x − 8)(x + 5) = 0 → x = 8 or −5.' },
      { html: atom('x = 5'), isCorrect: false, reason: 'The second solution is −5, not +5.' },
      { html: atom('x = 10'), isCorrect: false, reason: '10² − 3(10) = 70 ≠ 40.' }
    ],
    steps: [
      `Put in Standard Form first: ${atom(`${pow('x', 2)} − 3x − 40 = 0`)}.`,
      `Factor: ${atom('(x − 8)(x + 5) = 0')} → ${atom('x = 8')} or ${atom('x = −5')}.`
    ]
  });

  list.push({
    id: makeId('qd', 3),
    topicId: 'quadratics',
    taskType: 'FACTOR WITH GCF + X-METHOD:',
    promptHtml: `Which correctly factored form of ${atom(`f(x) = 36${pow('x', 2)} + 15x − 6`)} can be used to identify the zeros?`,
    xMethodData: { a: 12, b: 5, c: -2, ac: -24, m1: 8, m2: -3, simp1Num: 2, simp1Den: 3, simp2Num: -1, simp2Den: 4 },
    choices: [
      { html: atom('f(x) = (4x − 1)(3x + 2)'), isCorrect: false, reason: 'You forgot to keep the GCF of 3 in front! 4x·3x = 12x², not 36x².' },
      { html: atom('f(x) = (12x − 2)(3x + 3)'), isCorrect: false, reason: 'Not completely factored — 2 and 3 can still be factored out.' },
      { html: atom('f(x) = 3(4x − 1)(3x + 2)'), isCorrect: true, reason: '' },
      { html: atom('f(x) = 3(12x − 2)(3x + 3)'), isCorrect: false, reason: 'Multiplying 3(12x)(3x) gives 108x², which is too large.' }
    ],
    steps: [
      `Step 1: Factor out the GCF = 3: ${atom(`3(12${pow('x', 2)} + 5x − 2)`)}.`,
      `Step 2: X-Method on ${atom(`12${pow('x', 2)} + 5x − 2`)} → wings 8 and −3 over 12 → ${frac(2, 3)} and ${frac('−1', 4)}.`,
      `Result: ${atom('3(4x − 1)(3x + 2)')}.`
    ]
  });

  list.push({
    id: makeId('qd', 4),
    topicId: 'quadratics',
    taskType: 'PROJECTILE MOTION — DIVER:',
    promptHtml: `A diver jumps from a springboard. Height (ft) after ${atom('x')} seconds is graphed. What does the <b>y-intercept (0, 5)</b> represent, and what is the <b>maximum height</b>?`,
    visualTitle: 'SPRINGBOARD DIVE',
    visualHtml: svgCoordGraph({
      xMin: 0, xMax: 2, yMin: 0, yMax: 10, step: 0.5,
      xLabel: 'Time (sec)', yLabel: 'Height (ft)',
      parabolas: [{ a: -16, b: 16, c: 5, color: '#38bdf8' }],
      points: [{ x: 0, y: 5, color: '#34d399' }, { x: 0.5, y: 9, color: '#fbbf24' }]
    }),
    choices: [
      { html: 'Springboard height = 5 ft; Max height = 9 ft', isCorrect: true, reason: '' },
      { html: 'Water height = 5 ft; Max height = 0.5 ft', isCorrect: false, reason: '0.5 is the TIME at the peak; 9 ft is the height.' },
      { html: 'Springboard height = 9 ft; Max height = 5 ft', isCorrect: false, reason: '9 ft is the vertex (max height); 5 ft is the starting height at x = 0.' },
      { html: 'Springboard height = 0 ft; Max height = 10 ft', isCorrect: false, reason: 'Look at the graph: y-intercept is 5 and vertex y is 9.' }
    ],
    steps: [
      `The y-intercept (when x = 0) gives the initial height of the springboard: 5 feet.`,
      `The vertex (highest point) is at (0.5, 9), so the maximum height is 9 feet.`
    ],
    isLongChoice: true
  });

  // 5: Grasshopper jump (PDF p.16)
  list.push({
    id: makeId('qd', 5),
    topicId: 'quadratics',
    taskType: 'PROJECTILE MOTION — GRASSHOPPER:',
    promptHtml: `A grasshopper's height in feet is ${atom(`h(t) = −${pow('t', 2)} + ${frac(4, 3)}t + ${frac(1, 4)}`)}. After how many seconds does it land on the ground?`,
    choices: [
      { html: '1.5 seconds', isCorrect: true, reason: '' },
      { html: '0.25 seconds', isCorrect: false, reason: '0.25 (¼) is the starting height at t = 0, not landing time.' },
      { html: '2.5 seconds', isCorrect: false, reason: 'At t = 2.5, height is already negative (−2.67).' },
      { html: '1.33 seconds', isCorrect: false, reason: `Plug in t = 1.5: −2.25 + 2 + 0.25 = 0!` }
    ],
    steps: [
      `Landing on the ground means ${atom('h(t) = 0')} (positive x-intercept).`,
      `Test ${atom('t = 1.5 = ' + frac(3, 2))}: ${atom(`−${frac(9, 4)} + ${frac(4, 3)}(${frac(3, 2)}) + ${frac(1, 4)} = −${frac(8, 4)} + 2 = 0`)}.`
    ]
  });

  // 6: Vertex form minimum (PDF p.16)
  list.push({
    id: makeId('qd', 6),
    topicId: 'quadratics',
    taskType: 'VERTEX FORM — MINIMUM VALUE:',
    promptHtml: `A function is shown: ${atom(`f(x) = 5${pow('(x − 2)', 2)} + 3`)}. What is the <b>minimum value</b> of the function?`,
    choices: [
      { html: '3', isCorrect: true, reason: '' },
      { html: '2', isCorrect: false, reason: 'x = 2 is WHERE the minimum happens; the minimum VALUE is the y-coordinate (3).' },
      { html: '−2', isCorrect: false, reason: 'In vertex form a(x − h)² + k, the vertex is (2, 3), so min value is k = 3.' },
      { html: '5', isCorrect: false, reason: '5 is the stretch factor a, not the minimum value.' }
    ],
    steps: [
      `Vertex form ${atom(`f(x) = a${pow('(x − h)', 2)} + k`)} has vertex (h, k) = (2, 3).`,
      `Minimum/maximum value always means the y-value k = 3.`
    ]
  });

  // 7-15: X-Method Factoring (9 problems)
  const factorTuples: Array<[number, number, number, number]> = [
    [1, 6, 1, -4],  // PDF p.15: x^2 + 2x - 24
    [2, 1, 1, 3],
    [3, -2, 1, 4],
    [2, 3, 3, -1],
    [4, -1, 1, 2],
    [2, -3, 2, 5],
    [3, 4, 2, -1],
    [1, -7, 1, 3],
    [3, -5, 1, -2]
  ];

  factorTuples.forEach(([p, q, r, s], idx) => {
    const a = p * r;
    const b = p * s + q * r;
    const c = q * s;
    const ac = a * c;
    const m1 = q * r;
    const m2 = p * s;
    const g1 = gcd(m1, a);
    const s1n = m1 / g1;
    const s1d = a / g1;
    const g2 = gcd(m2, a);
    const s2n = m2 / g2;
    const s2d = a / g2;

    const correct = atom(`${formatLinearFactor(s1d, s1n)}${formatLinearFactor(s2d, s2n)}`);
    const d1 = atom(`${formatLinearFactor(s1d, -s1n)}${formatLinearFactor(s2d, -s2n)}`);
    const d2 = atom(`${formatLinearFactor(s1d, -s1n)}${formatLinearFactor(s2d, s2n)}`);
    const d3 = a > 1
      ? atom(`${formatLinearFactor(1, m1)}${formatLinearFactor(1, m2)}`)
      : atom(`${formatLinearFactor(1, s1n + 1)}${formatLinearFactor(1, s2n - 1)}`);

    const seen = new Set([correct]);
    const wrongs = [
      { html: d1, reason: 'Sign Error: Both signs inside the factors are flipped!' },
      { html: d2, reason: 'One factor has the wrong sign — check that the middle terms add to B.' },
      { html: d3, reason: a > 1 ? `Forgot to divide m₁ = ${m1} and m₂ = ${m2} by a = ${a}!` : 'Check the factor pair multiplying to A·C and adding to B.' }
    ].filter(w => !seen.has(w.html) && seen.add(w.html));
    while (wrongs.length < 3) wrongs.push({ html: atom(`${formatLinearFactor(s1d, s1n + 2)}${formatLinearFactor(s2d, s2n)}`), reason: 'FOIL back out to verify.' });

    list.push({
      id: makeId('qd', 7 + idx),
      topicId: 'quadratics',
      taskType: 'FACTOR QUADRATIC (X-METHOD):',
      promptHtml: `Factor completely: ${polyHtml(a, b, c)}`,
      xMethodData: { a, b, c, ac, m1, m2, simp1Num: s1n, simp1Den: s1d, simp2Num: s2n, simp2Den: s2d },
      choices: [
        { html: correct, isCorrect: true, reason: '' },
        ...wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `X-Method Diamond: Top A·C = ${ac}, Bottom B = ${b} → wings m₁ = ${m1}, m₂ = ${m2}.`,
        a > 1
          ? `Divide by a = ${a} and simplify: ${frac(m1, a)} → ${frac(s1n, s1d)}, ${frac(m2, a)} → ${frac(s2n, s2d)}.`
          : `Since a = 1, write factors directly: ${correct}.`,
        `Factored Form: ${correct}.`
      ]
    });
  });

  // 16-24: Solve Quadratics / Zeros / Roots (9 problems)
  const solveTuples: Array<[number, number, number, number]> = [
    [2, 7, 1, -2],   // x^2 + 3.5x - 2 = 0 scaled by 2
    [2, -1, 1, 3],
    [3, 1, 1, -4],
    [1, -5, 1, -6],
    [2, 5, 1, -1],
    [3, -2, 2, 1],
    [4, -3, 1, 2],
    [1, 9, 1, -4],
    [2, -3, 3, 2]
  ];

  solveTuples.forEach(([p, q, r, s], idx) => {
    const a = p * r;
    const b = p * s + q * r;
    const c = q * s;
    const ac = a * c;
    const m1 = q * r;
    const m2 = p * s;
    const g1 = gcd(m1, a);
    const s1n = m1 / g1;
    const s1d = a / g1;
    const g2 = gcd(m2, a);
    const s2n = m2 / g2;
    const s2d = a / g2;

    const r1 = signedFrac(-s1n, s1d);
    const r2 = signedFrac(-s2n, s2d);
    const w1 = signedFrac(s1n, s1d);
    const w2 = signedFrac(s2n, s2d);

    const correct = atom(`x = ${r1}, x = ${r2}`);
    const d1 = atom(`x = ${w1}, x = ${w2}`);
    const d2 = atom(`x = ${w1}, x = ${r2}`);
    const d3 = atom(`x = ${-m1}, x = ${-m2}`);

    const seen = new Set([correct]);
    const wrongs = [
      { html: d1, reason: 'Flippity Flop Error: Remember to flip the signs when solving each factor = 0!' },
      { html: d2, reason: 'Check the sign on the first root.' },
      { html: d3, reason: `Forgot to divide by a = ${a} before flipping signs.` }
    ].filter(w => !seen.has(w.html) && seen.add(w.html));
    while (wrongs.length < 3) wrongs.push({ html: atom(`x = ${r1}, x = ${-s2n + 3}`), reason: 'Verify roots by substituting back into the equation.' });

    list.push({
      id: makeId('qd', 16 + idx),
      topicId: 'quadratics',
      taskType: 'SOLVE QUADRATIC (FIND ZEROS):',
      promptHtml: `Find the zeros of ${atom(`${polyHtml(a, b, c)} = 0`)}.`,
      xMethodData: { a, b, c, ac, m1, m2, simp1Num: s1n, simp1Den: s1d, simp2Num: s2n, simp2Den: s2d },
      choices: [
        { html: correct, isCorrect: true, reason: '' },
        ...wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Factor with X-Method: ${atom(`${formatLinearFactor(s1d, s1n)}${formatLinearFactor(s2d, s2n)} = 0`)}.`,
        `Set each factor to 0 (flip signs): ${correct}.`
      ]
    });
  });

  // 25-30: Analyzing Parabola Graphs (Vertex, Axis of Symmetry, Zeros, y-int) (6 problems)
  const graphSpecs: Array<{
    a: number; h: number; k: number; ask: 'max' | 'min' | 'aos' | 'yint';
  }> = [
    { a: -1, h: 1, k: 3, ask: 'max' },   // PDF p.16 graph
    { a: 1, h: 5, k: 2, ask: 'min' },    // PDF p.16 graph
    { a: 2, h: 3, k: -4, ask: 'aos' },
    { a: -1, h: -2, k: 5, ask: 'max' },
    { a: 1, h: 2, k: -3, ask: 'yint' },
    { a: -2, h: 1, k: 6, ask: 'aos' }
  ];

  graphSpecs.forEach((gs, idx) => {
    const b = -2 * gs.a * gs.h;
    const c = gs.a * gs.h * gs.h + gs.k;
    const ans = gs.ask === 'max' || gs.ask === 'min' ? `${gs.k}` : gs.ask === 'aos' ? `x = ${gs.h}` : `(0, ${c})`;
    const label = gs.ask === 'max' ? 'maximum value' : gs.ask === 'min' ? 'minimum value' : gs.ask === 'aos' ? 'axis of symmetry' : 'y-intercept';

    const candSet = gs.ask === 'aos'
      ? [`x = ${-gs.h}`, `x = ${gs.k}`, `y = ${gs.k}`]
      : gs.ask === 'yint'
        ? [`(0, ${gs.k})`, `(${gs.h}, 0)`, `(0, ${-c})`]
        : [`${gs.h}`, `${c}`, `${-gs.k}`];

    const seen = new Set([ans]);
    const wrongs = candSet.filter(w => !seen.has(w) && seen.add(w));
    while (wrongs.length < 3) wrongs.push(`${wrongs.length + 7}`);

    list.push({
      id: makeId('qd', 25 + idx),
      topicId: 'quadratics',
      taskType: `ANALYZE PARABOLA — ${label.toUpperCase()}:`,
      promptHtml: `Look at the graph of ${atom(`y = ${polyHtml(gs.a, b, c)}`)}. What is the <b>${label}</b> of the function?`,
      visualTitle: 'QUADRATIC GRAPH',
      visualHtml: svgCoordGraph({
        xMin: -4, xMax: 8, yMin: -5, yMax: 9, step: 2,
        parabolas: [{ a: gs.a, b, c, color: '#fbbf24' }],
        points: [{ x: gs.h, y: gs.k, color: '#38bdf8' }]
      }),
      choices: [
        { html: atom(ans), isCorrect: true, reason: '' },
        ...wrongs.map(w => ({
          html: atom(w),
          isCorrect: false,
          reason: `The vertex is (${gs.h}, ${gs.k}) and y-intercept is (0, ${c}).`
        }))
      ],
      steps: [
        `Locate the vertex (turning point): (${gs.h}, ${gs.k}).`,
        gs.ask === 'aos'
          ? `The vertical line through the vertex is ${atom(`x = ${gs.h}`)}.`
          : gs.ask === 'yint'
            ? `Plug in x = 0: ${atom(`y = ${c}`)} → (0, ${c}).`
            : `The ${label} is the y-coordinate of the vertex: ${gs.k}.`
      ]
    });
  });

  return list;
}

export const TOPICS_PART_A: OstProblem[] = [
  ...buildLazyWayProblems(),
  ...buildDataAnalysisProblems(),
  ...buildPolynomialProblems(),
  ...buildFunctionProblems(),
  ...buildQuadraticProblems()
];
