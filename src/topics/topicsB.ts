import {
  OstProblem,
  atom,
  frac,
  gcd,
  htmlTable,
  linearExpr,
  pow,
  powFrac,
  signedFrac,
  svgCoordGraph
} from '../mathFormat';

function makeId(prefix: string, idx: number): string {
  return `${prefix}_${String(idx).padStart(2, '0')}`;
}

// ============================================================================
// TOPIC 6: CREATE, ANALYZE, MODEL EXPONENTIAL FUNCTIONS (30 PROBLEMS)
// ============================================================================
function buildExponentialProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-6: Exact PDF Pages 18-19 iconic questions
  list.push({
    id: makeId('exp', 1),
    topicId: 'exponential',
    taskType: 'INTERPRET EXPONENTIAL EXPRESSION:',
    promptHtml: `Isaac deposits money into a new bank account: ${atom(`200${pow('(1 + 0.08)', 'n')}`)}. What does the number <b>200</b> represent?`,
    choices: [
      { html: 'The original amount of money deposited into the account', isCorrect: true, reason: '' },
      { html: 'The percent interest earned annually', isCorrect: false, reason: '0.08 (8%) is the annual interest rate, not 200.' },
      { html: 'The number of times interest is compounded', isCorrect: false, reason: 'n is the number of years; 200 is the initial value a.' },
      { html: 'The total amount of money after n years', isCorrect: false, reason: 'The entire expression 200(1 + 0.08)ⁿ represents the total after n years.' }
    ],
    steps: [
      `In ${atom(`y = a${pow('(1 + r)', 'x')}`)}, a = 200 is always the initial starting amount.`,
      `Therefore, 200 is the original amount deposited.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('exp', 2),
    topicId: 'exponential',
    taskType: 'CORRECT EXPONENTIAL DECAY:',
    promptHtml: `Alfred buys $15,000 of equipment that decreases in value by <b>12.5% per year</b>. He writes ${atom(`15,000${pow('(0.125)', 't')} < 8,000`)}, which is incorrect. Which change fixes it?`,
    choices: [
      { html: 'Replace 0.125 with 0.875', isCorrect: true, reason: '' },
      { html: 'Replace 0.125 with 12.5', isCorrect: false, reason: '12.5 would mean multiplying by 12.5 every year (huge growth), not decay!' },
      { html: 'Replace 8,000 with 7,000', isCorrect: false, reason: 'The target threshold is still less than $8,000.' },
      { html: 'Replace 15,000 with 2,018', isCorrect: false, reason: '2,018 is the calendar year, not the starting equipment value ($15,000).' }
    ],
    steps: [
      `For exponential decay, the base is ${atom('1 − r')}, NOT ${atom('r')}.`,
      `Convert 12.5% to 0.125, then subtract: ${atom('1 − 0.125 = 0.875')}.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('exp', 3),
    topicId: 'exponential',
    taskType: 'MODEL EXPONENTIAL GROWTH:',
    promptHtml: `A landscaper puts 5 fish into a new pond. The number of fish <b>doubles</b> each month. Write a function ${atom('f(x)')} for the number of fish after ${atom('x')} months.`,
    choices: [
      { html: atom(`f(x) = 5(${pow('2', 'x')})`), isCorrect: true, reason: '' },
      { html: atom(`f(x) = 2(${pow('5', 'x')})`), isCorrect: false, reason: 'Initial value a = 5 goes in front; the doubling factor b = 2 gets the exponent x.' },
      { html: atom('f(x) = 5 + 2x'), isCorrect: false, reason: '5 + 2x is linear (adding 2 fish per month), not doubling.' },
      { html: atom(`f(x) = 5(${pow('0.5', 'x')})`), isCorrect: false, reason: '0.5 would cut the fish population in half each month instead of doubling.' }
    ],
    steps: [
      `Starting value a = 5 fish. "Doubles" means growth factor b = 2.`,
      `Model: ${atom(`f(x) = 5(${pow('2', 'x')})`)}.`
    ]
  });

  list.push({
    id: makeId('exp', 4),
    topicId: 'exponential',
    taskType: 'MODEL EXPONENTIAL GROWTH:',
    promptHtml: `The population of snails in an aquarium <b>triples</b> every year. Mark counts 80 snails initially. Write ${atom('f(n)')} for the population after ${atom('n')} years.`,
    choices: [
      { html: atom(`f(n) = 80(${pow('3', 'n')})`), isCorrect: true, reason: '' },
      { html: atom(`f(n) = 3(${pow('80', 'n')})`), isCorrect: false, reason: '80 is the starting amount (a), and 3 is the tripling factor (b).' },
      { html: atom('f(n) = 80 + 3n'), isCorrect: false, reason: 'Tripling multiplies by 3 each year, so n must be in the exponent.' },
      { html: atom(`f(n) = 80(${pow('1.3', 'n')})`), isCorrect: false, reason: '1.3 represents 30% growth, not tripling (× 3).' }
    ],
    steps: [
      `Starting amount a = 80 snails. "Triples" means factor b = 3.`,
      `Model: ${atom(`f(n) = 80(${pow('3', 'n')})`)}.`
    ]
  });

  list.push({
    id: makeId('exp', 5),
    topicId: 'exponential',
    taskType: 'PERCENT GROWTH RATE:',
    promptHtml: `An insect colony is modeled by ${atom(`P = 10,000${pow('(1.08)', 't')}`)}, where ${atom('t')} is years. By what <b>percent</b> does the population grow each year?`,
    choices: [
      { html: '8%', isCorrect: true, reason: '' },
      { html: '1.08%', isCorrect: false, reason: '1.08 is 1 + r. Subtract 1 first: 1.08 − 1 = 0.08 = 8%.' },
      { html: '108%', isCorrect: false, reason: '1.08 as a percent is 108% of the previous year, meaning an 8% INCREASE.' },
      { html: '0.08%', isCorrect: false, reason: '0.08 is the decimal form; multiply by 100 to get 8%.' }
    ],
    steps: [
      `Compare ${atom('1.08')} to ${atom('1 + r')}: ${atom('r = 1.08 − 1 = 0.08')}.`,
      `Convert decimal to percent: ${atom('0.08 = 8%')}.`
    ]
  });

  list.push({
    id: makeId('exp', 6),
    topicId: 'exponential',
    taskType: 'IDENTIFY EXPONENTIAL SITUATION:',
    promptHtml: `Which situation could be represented by an exponential function ${atom('g(t)')}, where ${atom('t')} represents time in years?`,
    choices: [
      { html: "A city's population increases by 300 people each year.", isCorrect: false, reason: 'Adding a constant 300 each year is LINEAR, not exponential.' },
      { html: 'A checking account decreases by $150 in one year.', isCorrect: false, reason: 'Subtracting a fixed dollar amount is linear, and only happens once.' },
      { html: 'A car decreases in value by 17% in one year.', isCorrect: false, reason: 'Only happens in ONE year, not repeated growth/decay over t years.' },
      { html: 'A house increases in value by 3% each year.', isCorrect: true, reason: '' }
    ],
    steps: [
      `Exponential functions change by a constant PERCENT rate repeatedly over time t.`,
      `"Increases by 3% each year" multiplies by 1.03 every year → Exponential.`
    ],
    isLongChoice: true
  });

  // 7-9: More PDF Page 19 questions
  list.push({
    id: makeId('exp', 7),
    topicId: 'exponential',
    taskType: 'IDENTIFY EXPONENTIAL SITUATION:',
    promptHtml: `Which situation represents exponential growth or decay?`,
    choices: [
      { html: 'The population of a town grows by 3% each year.', isCorrect: true, reason: '' },
      { html: 'The population of a town grows by 200 each year.', isCorrect: false, reason: '+200 per year is a constant linear rate.' },
      { html: 'A town grows by 3% one year, then decreases by 3% the next year.', isCorrect: false, reason: 'The percent rate flips between growth and decay rather than staying a constant factor.' },
      { html: 'A town grows by 200 one year, then decreases by 200 the next year.', isCorrect: false, reason: 'Adding/subtracting 200 is linear, not exponential.' }
    ],
    steps: [
      `Look for a consistent percent increase or decrease "each year".`,
      `"Grows by 3% each year" has constant multiplier 1.03.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('exp', 8),
    topicId: 'exponential',
    taskType: 'CONSTANT PERCENT RATE:',
    promptHtml: `Which situation describes a quantity that <b>increases by a constant percent rate</b>?`,
    choices: [
      { html: 'The size of one photo is 15% larger than another photo.', isCorrect: false, reason: 'Comparing two static photos does not change over time.' },
      { html: 'The number of plants is 85% of the number from the previous year.', isCorrect: false, reason: '85% of the previous year is DECREASING by 15% (decay), not increasing.' },
      { html: 'One city is 85% greater in population than another city.', isCorrect: false, reason: 'Static comparison between two cities, not growth over time.' },
      { html: 'Magazine subscribers each year are 15% greater than the previous year.', isCorrect: true, reason: '' }
    ],
    steps: [
      `"15% greater than the previous year" means multiplying by 1.15 each year.`,
      `That is a constant percent rate of increase.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('exp', 9),
    topicId: 'exponential',
    taskType: 'EXPONENTIAL DECAY GRAPH:',
    promptHtml: `A radioactive substance decays exponentially. Its initial amount is <b>3 grams</b>, and over time ${atom('t')} the amount ${atom('f(t)')} approaches 0. Which graph models ${atom('f(t)')}?`,
    visualTitle: 'DECAY MODEL',
    visualHtml: svgCoordGraph({
      xMin: 0, xMax: 8, yMin: 0, yMax: 7, step: 1,
      xLabel: 't', yLabel: 'f(t)',
      expCurves: [{ a: 3, base: 0.5, color: '#fbbf24' }],
      points: [{ x: 0, y: 3, color: '#34d399' }]
    }),
    choices: [
      { html: 'Starts at (0, 3) and curves downward approaching 0 (shown above)', isCorrect: true, reason: '' },
      { html: 'Starts at (0, 0) and increases up toward 3', isCorrect: false, reason: 'Decay starts at the initial amount (0, 3) and decreases, never starting at 0.' },
      { html: 'Starts at (0, 6) and curves downward approaching 3', isCorrect: false, reason: 'Initial amount is 3 grams, not 6, and it approaches 0.' },
      { html: 'Starts at (0, 3) and increases up toward 6', isCorrect: false, reason: 'Radioactive decay decreases over time.' }
    ],
    steps: [
      `Initial amount = 3 grams means y-intercept is (0, 3).`,
      `"Decays exponentially and approaches zero" means the curve goes down toward the t-axis.`
    ],
    isLongChoice: true
  });

  // 10-19: Writing Growth / Decay Models from Percent Word Problems (10 problems)
  const expModels: Array<{
    story: string;
    a: number;
    pct: number;
    isGrowth: boolean;
  }> = [
    { story: 'An investment starts at $1,000 and increases by 5% per year.', a: 1000, pct: 5, isGrowth: true },
    { story: 'A substance starts at 500 grams and decreases by 30% each year.', a: 500, pct: 30, isGrowth: false },
    { story: 'A car costs $24,000 and loses 15% of its value each year.', a: 24000, pct: 15, isGrowth: false },
    { story: 'A YouTube channel has 800 subscribers and grows by 25% each month.', a: 800, pct: 25, isGrowth: true },
    { story: 'A medicine starts at 400 mg and decays by 20% every hour.', a: 400, pct: 20, isGrowth: false },
    { story: 'A town has 3,200 residents and grows by 4% per year.', a: 3200, pct: 4, isGrowth: true },
    { story: 'A rare card is worth $150 and increases in value by 12% each year.', a: 150, pct: 12, isGrowth: true },
    { story: 'A glacier holds 900 tons of ice and melts by 8% per decade.', a: 900, pct: 8, isGrowth: false },
    { story: 'A lab culture starts at 60 cells and grows by 40% every hour.', a: 60, pct: 40, isGrowth: true },
    { story: 'A phone priced at $1,200 depreciates by 22% each year.', a: 1200, pct: 22, isGrowth: false }
  ];

  expModels.forEach((em, idx) => {
    const dec = em.pct / 100;
    const base = Math.round((em.isGrowth ? 1 + dec : 1 - dec) * 1000) / 1000;
    const wrongBaseFlip = Math.round((em.isGrowth ? 1 - dec : 1 + dec) * 1000) / 1000;
    const rawRateBase = dec;
    const badDecimal = em.isGrowth ? 1 + em.pct : em.pct;

    const ansHtml = atom(`y = ${em.a}${pow(`(${base})`, 'x')}`);
    const w1 = atom(`y = ${em.a}${pow(`(${rawRateBase})`, 'x')}`);
    const w2 = atom(`y = ${em.a}${pow(`(${wrongBaseFlip})`, 'x')}`);
    const w3 = atom(`y = ${em.a}${pow(`(${badDecimal})`, 'x')}`);

    list.push({
      id: makeId('exp', 10 + idx),
      topicId: 'exponential',
      taskType: `WRITE EXPONENTIAL ${em.isGrowth ? 'GROWTH' : 'DECAY'} MODEL:`,
      promptHtml: `${em.story} Write an equation modeling the amount ${atom('y')} after ${atom('x')} time periods.`,
      choices: [
        { html: ansHtml, isCorrect: true, reason: '' },
        { html: w1, isCorrect: false, reason: `Do not use ${dec} alone as the base! Compute ${em.isGrowth ? `1 + ${dec}` : `1 − ${dec}`} = ${base}.` },
        { html: w2, isCorrect: false, reason: em.isGrowth ? `This is ${em.isGrowth ? 'growth' : 'decay'}: use 1 + ${dec}, not 1 − ${dec}.` : `This is decay: subtract ${dec} from 1 (1 − ${dec} = ${base}).` },
        { html: w3, isCorrect: false, reason: `Convert ${em.pct}% to a decimal (${dec}) before adding/subtracting with 1!` }
      ],
      steps: [
        `Initial value a = ${em.a}. Convert ${em.pct}% → ${dec}.`,
        `${em.isGrowth ? 'Growth' : 'Decay'} factor b = ${em.isGrowth ? `1 + ${dec}` : `1 − ${dec}`} = ${base} → ${ansHtml}.`
      ]
    });
  });

  // 20-30: Interpreting b (Growth vs Decay & % rate) & Evaluating Exponential Functions (11 problems)
  const interpretItems: Array<{
    a: number; b: number; isGrowth: boolean; pctLabel: string; context: string;
  }> = [
    { a: 650, b: 0.85, isGrowth: false, pctLabel: '15% decrease', context: 'phone resale value' },
    { a: 1400, b: 1.06, isGrowth: true, pctLabel: '6% increase', context: 'savings account balance' },
    { a: 2500, b: 0.72, isGrowth: false, pctLabel: '28% decrease', context: 'lake water level' },
    { a: 90, b: 1.35, isGrowth: true, pctLabel: '35% increase', context: 'social media followers' },
    { a: 5000, b: 0.94, isGrowth: false, pctLabel: '6% decrease', context: 'forest tree count' },
    { a: 300, b: 1.18, isGrowth: true, pctLabel: '18% increase', context: 'bakery revenue' }
  ];

  interpretItems.forEach((it, idx) => {
    const pctNum = Math.round(Math.abs(it.b - 1) * 100);
    const otherNum = Math.round(it.b * 100);
    list.push({
      id: makeId('exp', 20 + idx),
      topicId: 'exponential',
      taskType: 'INTERPRET GROWTH / DECAY FACTOR:',
      promptHtml: `The ${it.context} is modeled by ${atom(`y = ${it.a}${pow(`(${it.b})`, 't')}`)}. What does <b>${it.b}</b> tell you about the yearly change?`,
      choices: [
        { html: `${pctNum}% ${it.isGrowth ? 'increase (growth)' : 'decrease (decay)'} per year`, isCorrect: true, reason: '' },
        { html: `${pctNum}% ${it.isGrowth ? 'decrease (decay)' : 'increase (growth)'} per year`, isCorrect: false, reason: `Since ${it.b} is ${it.b > 1 ? 'greater than 1' : 'between 0 and 1'}, it represents ${it.isGrowth ? 'growth' : 'decay'}.` },
        { html: `${otherNum}% ${it.isGrowth ? 'increase' : 'decrease'} per year`, isCorrect: false, reason: `Compare ${it.b} to 1.00: |${it.b} − 1| = 0.${String(pctNum).padStart(2, '0')} = ${pctNum}%.` },
        { html: `Starts at ${it.b} initially`, isCorrect: false, reason: `The starting value is ${it.a}, not ${it.b}.` }
      ],
      steps: [
        `Since b = ${it.b} is ${it.b > 1 ? '> 1' : '< 1'}, it is exponential ${it.isGrowth ? 'growth' : 'decay'}.`,
        `Difference from 1: |${it.b} − 1| = ${(Math.abs(it.b - 1)).toFixed(2)} = ${pctNum}% ${it.isGrowth ? 'increase' : 'decrease'}.`
      ],
      isLongChoice: true
    });
  });

  // 26-30: Half-life / Doubling evaluation & comparison (5 problems)
  const evalExp: Array<{ a: number; b: number; t: number; ans: number; unit: string }> = [
    { a: 100, b: 2, t: 4, ans: 1600, unit: 'bacteria' },
    { a: 800, b: 0.5, t: 3, ans: 100, unit: 'grams' },
    { a: 50, b: 3, t: 3, ans: 1350, unit: 'cells' },
    { a: 640, b: 0.5, t: 4, ans: 40, unit: 'mg' },
    { a: 25, b: 2, t: 5, ans: 800, unit: 'members' }
  ];
  evalExp.forEach((ee, idx) => {
    const linearWrong = Math.round(ee.a * ee.b * ee.t);
    const offByOne = Math.round(ee.a * Math.pow(ee.b, ee.t - 1));
    const doubleWrong = ee.ans * 2;
    const baseStr = ee.b === 0.5 ? frac(1, 2) : `${ee.b}`;

    const seen = new Set([ee.ans]);
    const distractorCands: Array<{ val: number; reason: string }> = [
      { val: linearWrong, reason: 'Do not multiply by t! Raise the base to the t-th power first.' },
      { val: offByOne, reason: `That is the value for t = ${ee.t - 1}, not t = ${ee.t}.` },
      { val: doubleWrong, reason: `Check the exponent: ${pow(baseStr, ee.t)} = ${Math.pow(ee.b, ee.t)}.` },
      { val: Math.round(ee.a * Math.pow(ee.b, ee.t + 1)), reason: `That would be the value at t = ${ee.t + 1}, not t = ${ee.t}.` },
      { val: Math.round(ee.a * ee.b), reason: `That is only after 1 step (t = 1), not t = ${ee.t}.` }
    ];
    const wrongs: Array<{ html: string; isCorrect: boolean; reason: string }> = [];
    for (const c of distractorCands) {
      if (!seen.has(c.val) && wrongs.length < 3) {
        seen.add(c.val);
        wrongs.push({ html: `${c.val} ${ee.unit}`, isCorrect: false, reason: c.reason });
      }
    }

    list.push({
      id: makeId('exp', 26 + idx),
      topicId: 'exponential',
      taskType: 'EVALUATE EXPONENTIAL MODEL:',
      promptHtml: `An amount is modeled by ${atom(`y = ${ee.a}${pow(`(${baseStr})`, 't')}`)}. What is the amount when ${atom(`t = ${ee.t}`)}?`,
      choices: [
        { html: `${ee.ans} ${ee.unit}`, isCorrect: true, reason: '' },
        ...wrongs
      ],
      steps: [
        `Plug in ${atom(`t = ${ee.t}`)}: ${atom(`y = ${ee.a}${pow(`(${baseStr})`, ee.t)} = ${ee.a} · ${Math.pow(ee.b, ee.t)}`)}.`,
        `Multiply: ${ee.ans} ${ee.unit}.`
      ]
    });
  });

  return list;
}

// ============================================================================
// TOPIC 7: CREATING, GRAPHING, MODELING LINEAR (PART 1) (30 PROBLEMS)
// ============================================================================
function buildLinearPart1Problems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-4: Exact PDF Page 21-22 problems
  list.push({
    id: makeId('lp1', 1),
    topicId: 'linear_part1',
    taskType: 'POINT ON A LINE:',
    promptHtml: `An equation is given: ${atom('5y − 2x = 5')}. Which ordered pair represents a point on the graph of the equation?`,
    choices: [
      { html: atom('(0, 1)'), isCorrect: true, reason: '' },
      { html: atom('(1, 0)'), isCorrect: false, reason: 'At (1, 0): 5(0) − 2(1) = −2 ≠ 5.' },
      { html: atom('(2, 1)'), isCorrect: false, reason: 'At (2, 1): 5(1) − 2(2) = 1 ≠ 5.' },
      { html: atom('(5, 2)'), isCorrect: false, reason: 'At (5, 2): 5(2) − 2(5) = 0 ≠ 5.' }
    ],
    steps: [
      `Plug in each (x, y) pair to see which makes 5y − 2x = 5 true.`,
      `For (0, 1): 5(1) − 2(0) = 5 − 0 = 5 ✓.`
    ]
  });

  list.push({
    id: makeId('lp1', 2),
    topicId: 'linear_part1',
    taskType: 'COMPLETE LINEAR TABLE:',
    promptHtml: `A table of values for a linear function is shown. What is the missing value for ${atom('x = 6')}?`,
    visualTitle: 'LINEAR FUNCTION TABLE',
    visualHtml: htmlTable(['x', 'f(x)'], [[0, 4], [1, 6], [3, 10], [5, 14], [6, '?']]),
    choices: [
      { html: '16', isCorrect: true, reason: '' },
      { html: '15', isCorrect: false, reason: 'Slope is +2 per 1 unit of x, so from x = 5 (14) to x = 6 add 2 → 16.' },
      { html: '18', isCorrect: false, reason: '18 would be for x = 7, not x = 6.' },
      { html: '12', isCorrect: false, reason: 'Values are increasing by 2 each unit of x.' }
    ],
    steps: [
      `Find the rate of change: when x increases by 1 (0 → 1), f(x) increases by 2 (4 → 6).`,
      `Equation: ${atom('f(x) = 2x + 4')}. At x = 6: ${atom('2(6) + 4 = 16')}.`
    ]
  });

  list.push({
    id: makeId('lp1', 3),
    topicId: 'linear_part1',
    taskType: 'FIND x-INTERCEPT:',
    promptHtml: `What is the <b>x-intercept</b> of the graph of the function ${atom('f(x) = 2x + 9')}?`,
    choices: [
      { html: atom(`(−${frac(9, 2)}, 0)`), isCorrect: true, reason: '' },
      { html: atom('(0, 9)'), isCorrect: false, reason: '(0, 9) is the y-intercept! For the x-intercept, set y = 0.' },
      { html: atom(`(${frac(9, 2)}, 0)`), isCorrect: false, reason: 'Subtracting 9 from both sides gives 2x = −9, so x is negative!' },
      { html: atom(`(−${frac(2, 9)}, 0)`), isCorrect: false, reason: 'Divide −9 by 2, not 2 by −9.' }
    ],
    steps: [
      `Set ${atom('f(x) = 0')}: ${atom('0 = 2x + 9')}.`,
      `Solve: ${atom('2x = −9')} → ${atom(`x = −${frac(9, 2)}`)} → x-intercept is ${atom(`(−${frac(9, 2)}, 0)`)}.`
    ]
  });

  list.push({
    id: makeId('lp1', 4),
    topicId: 'linear_part1',
    taskType: 'EQUATION FROM GRAPH:',
    promptHtml: `The graph of a linear function is shown. What is the equation of the linear function?`,
    visualTitle: 'LINEAR GRAPH',
    visualHtml: svgCoordGraph({
      xMin: -2, xMax: 10, yMin: -2, yMax: 10, step: 2,
      lines: [{ m: 0.5, b: 4, color: '#38bdf8' }],
      points: [{ x: 0, y: 4, color: '#fbbf24' }, { x: 8, y: 8, color: '#fbbf24' }]
    }),
    choices: [
      { html: atom('f(x) = 2x + 4'), isCorrect: false, reason: `Rise is 4, Run is 8 → slope is ${frac(4, 8)} = ${frac(1, 2)}, not 2!` },
      { html: atom(`f(x) = ${frac(1, 2)}x + 4`), isCorrect: true, reason: '' },
      { html: atom('f(x) = 4x + 2'), isCorrect: false, reason: 'The y-intercept is at 4, not 2, and slope is ½.' },
      { html: atom(`f(x) = 4x + ${frac(1, 2)}`), isCorrect: false, reason: 'You swapped slope (½) and y-intercept (4).' }
    ],
    steps: [
      `Read y-intercept: (0, 4) → b = 4.`,
      `Use another point (8, 8): Rise = 4, Run = 8 → slope ${atom(`m = ${frac(4, 8)} = ${frac(1, 2)}`)}. Equation: ${atom(`f(x) = ${frac(1, 2)}x + 4`)}.`
    ]
  });

  // 5-12: Graph -> Equation with fractional & integer slopes (8 problems)
  const graphLines: Array<{ mNum: number; mDen: number; b: number }> = [
    { mNum: 2, mDen: 1, b: -1 }, // PDF p.22: f(x) = 2x - 1
    { mNum: -2, mDen: 3, b: 4 },
    { mNum: 3, mDen: 2, b: -3 },
    { mNum: -1, mDen: 2, b: 5 },
    { mNum: 3, mDen: 4, b: 1 },
    { mNum: -3, mDen: 1, b: 6 },
    { mNum: 1, mDen: 3, b: -2 },
    { mNum: -4, mDen: 3, b: 4 }
  ];

  graphLines.forEach((gl, idx) => {
    const m = gl.mNum / gl.mDen;
    const x2 = gl.mDen * 2;
    const y2 = gl.b + gl.mNum * 2;
    const correct = atom(`f(x) = ${linearExpr(gl.mNum, gl.mDen, gl.b)}`);
    const flippedSign = atom(`f(x) = ${linearExpr(-gl.mNum, gl.mDen, gl.b)}`);
    const invSlope = atom(`f(x) = ${linearExpr(gl.mDen, gl.mNum, gl.b)}`);
    const swapped = atom(`f(x) = ${linearExpr(gl.b || 1, 1, gl.mNum, gl.mDen)}`);

    const seen = new Set([correct]);
    const wrongs = [
      { html: flippedSign, reason: `Check direction! This line goes ${m > 0 ? 'UP' : 'DOWN'} from left to right, so slope is ${m > 0 ? 'positive' : 'negative'}.` },
      { html: invSlope, reason: 'Slope is Rise ÷ Run (vertical change over horizontal change), not Run ÷ Rise!' },
      { html: swapped, reason: 'Do not swap the slope m and the y-intercept b.' }
    ].filter(w => !seen.has(w.html) && seen.add(w.html));
    while (wrongs.length < 3) wrongs.push({ html: atom(`f(x) = ${linearExpr(gl.mNum, gl.mDen, -gl.b || 3)}`), reason: 'Check the y-intercept on the vertical axis.' });

    list.push({
      id: makeId('lp1', 5 + idx),
      topicId: 'linear_part1',
      taskType: 'MATCH GRAPH TO EQUATION:',
      promptHtml: `Which equation represents the linear function shown on the graph?`,
      visualTitle: 'LINEAR GRAPH',
      visualHtml: svgCoordGraph({
        xMin: -6, xMax: 6, yMin: -6, yMax: 8, step: 2,
        lines: [{ m, b: gl.b, color: '#34d399' }],
        points: [{ x: 0, y: gl.b, color: '#fbbf24' }, { x: x2 <= 6 ? x2 : -gl.mDen, y: x2 <= 6 ? y2 : gl.b - gl.mNum, color: '#fbbf24' }]
      }),
      choices: [
        { html: correct, isCorrect: true, reason: '' },
        ...wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `y-intercept is at (0, ${gl.b}) → b = ${gl.b}.`,
        `Count Rise / Run between points: slope ${atom(`m = ${signedFrac(gl.mNum, gl.mDen)}`)} → ${correct}.`
      ]
    });
  });

  // 13-18: Find Slope & Intercepts from Standard Form Ax + By = C (6 problems)
  const stdIntercepts: Array<{ A: number; B: number; C: number; ask: 'xint' | 'yint' | 'slope' }> = [
    { A: 3, B: 4, C: 24, ask: 'xint' },
    { A: 2, B: -5, C: 20, ask: 'yint' },
    { A: 4, B: 6, C: 18, ask: 'slope' },
    { A: 5, B: 2, C: 15, ask: 'xint' },
    { A: 3, B: -2, C: 12, ask: 'slope' },
    { A: 6, B: 4, C: 24, ask: 'yint' }
  ];

  stdIntercepts.forEach((si, idx) => {
    const eqStr = `${si.A}x ${si.B >= 0 ? '+' : '−'} ${Math.abs(si.B)}y = ${si.C}`;
    let ansHtml = '';
    let wList: Array<{ html: string; reason: string }> = [];
    let stepStr = '';

    if (si.ask === 'xint') {
      const xVal = si.C / si.A;
      const yVal = si.C / si.B;
      ansHtml = atom(`(${xVal}, 0)`);
      wList = [
        { html: atom(`(0, ${yVal})`), reason: 'That is the y-intercept! For the x-intercept, set y = 0.' },
        { html: atom(`(${si.A}, 0)`), reason: `Divide ${si.C} by ${si.A} to get ${xVal}.` },
        { html: atom(`(0, ${xVal})`), reason: 'An x-intercept sits on the x-axis, so its coordinates are (x, 0), not (0, x).' }
      ];
      stepStr = `Set y = 0: ${atom(`${si.A}x = ${si.C}`)} → ${atom(`x = ${xVal}`)} → ${ansHtml}.`;
    } else if (si.ask === 'yint') {
      const yVal = si.C / si.B;
      const xVal = si.C / si.A;
      ansHtml = atom(`(0, ${yVal})`);
      wList = [
        { html: atom(`(${xVal}, 0)`), reason: 'That is the x-intercept! For the y-intercept, set x = 0.' },
        { html: atom(`(0, ${-yVal})`), reason: `Watch the sign of B (${si.B}): ${si.C} ÷ (${si.B}) = ${yVal}.` },
        { html: atom(`(${yVal}, 0)`), reason: 'A y-intercept has x = 0: (0, y).' }
      ];
      stepStr = `Set x = 0: ${atom(`${si.B}y = ${si.C}`)} → ${atom(`y = ${yVal}`)} → ${ansHtml}.`;
    } else {
      ansHtml = signedFrac(-si.A, si.B);
      wList = [
        { html: signedFrac(si.A, si.B), reason: `When moving ${si.A}x to the other side, its sign flips to −${si.A}x before dividing by ${si.B}!` },
        { html: signedFrac(-si.B, si.A), reason: `Divide by B (${si.B}), not by A (${si.A}).` },
        { html: `${si.A}`, reason: 'Isolate y first (divide by B) to read the slope.' }
      ];
      stepStr = `Solve for y: ${atom(`${si.B}y = −${si.A}x + ${si.C}`)} → slope ${atom(`m = ${ansHtml}`)}.`;
    }

    list.push({
      id: makeId('lp1', 13 + idx),
      topicId: 'linear_part1',
      taskType: `LINEAR INTERCEPTS & SLOPE:`,
      promptHtml: `For the line ${atom(eqStr)}, what is the <b>${si.ask === 'xint' ? 'x-intercept' : si.ask === 'yint' ? 'y-intercept' : 'slope'}</b>?`,
      choices: [
        { html: ansHtml, isCorrect: true, reason: '' },
        ...wList.map(w => ({ ...w, isCorrect: false }))
      ],
      steps: [stepStr]
    });
  });

  // 19-24: Is Table Linear? & Complete Missing Values (6 problems)
  const tableItems: Array<{
    rows: Array<[number, number | string]>;
    isLinearCheck: boolean;
    ans: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      rows: [[0, 3], [2, 9], [4, 15], [7, '?']],
      isLinearCheck: false, ans: '24',
      wrongs: [
        { html: '21', reason: 'Careful! x jumped by +3 (from 4 to 7), not +2! Slope is 3, so 15 + 3(3) = 24.' },
        { html: '18', reason: 'From x = 4 to x = 7 is 3 steps of +3.' },
        { html: '27', reason: 'At x = 7: 3(7) + 3 = 24.' }
      ],
      step: `Slope = ${frac('9 − 3', '2 − 0')} = 3. Equation: ${atom('y = 3x + 3')}. At x = 7: ${atom('3(7) + 3 = 24')}.`
    },
    {
      rows: [[1, 10], [3, 4], [5, -2], [8, '?']],
      isLinearCheck: false, ans: '−11',
      wrongs: [
        { html: '−8', reason: 'x goes from 5 to 8 (+3), and slope is −3 → −2 + 3(−3) = −11.' },
        { html: '−5', reason: 'Slope is −3 per unit of x, not −1.' },
        { html: '11', reason: 'The y-values are decreasing below zero.' }
      ],
      step: `Slope = ${frac('4 − 10', '3 − 1')} = −3. Equation: ${atom('y = −3x + 13')}. At x = 8: −24 + 13 = −11.`
    },
    {
      rows: [[0, -5], [2, 3], [5, 15], [6, '?']],
      isLinearCheck: false, ans: '19',
      wrongs: [
        { html: '17', reason: 'Slope is +4 per unit of x: 15 + 4 = 19.' },
        { html: '23', reason: 'x increases by 1 from 5 to 6, so add 4 once.' },
        { html: '18', reason: '4(6) − 5 = 19.' }
      ],
      step: `Slope = ${frac('3 − (−5)', '2 − 0')} = 4. Equation: ${atom('y = 4x − 5')}. At x = 6: 24 − 5 = 19.`
    },
    {
      rows: [[0, 2], [1, 5], [2, 10], [3, 17]],
      isLinearCheck: true, ans: 'No — rate of change is not constant (+3, +5, +7)',
      wrongs: [
        { html: 'Yes — slope is 3', isCorrect: false } as unknown as { html: string; reason: string },
        { html: 'Yes — y increases every step', isCorrect: false } as unknown as { html: string; reason: string },
        { html: 'Yes — y-intercept is 2', isCorrect: false } as unknown as { html: string; reason: string }
      ],
      step: `Differences: 5−2 = +3, 10−5 = +5, 17−10 = +7. Since the rate of change is NOT constant, the table is NOT linear.`
    },
    {
      rows: [[1, 7], [2, 12], [4, 22], [6, 32]],
      isLinearCheck: true, ans: 'Yes — constant slope of +5 per unit of x',
      wrongs: [
        { html: 'No — the jump from 12 to 22 is +10', reason: `Check ${frac('Δy', 'Δx')}! From x = 2 to x = 4, Δx = 2, so ${frac(10, 2)} = 5 (same slope!).` },
        { html: 'No — there is no x = 0 row', reason: 'A linear table does not have to list x = 0.' },
        { html: 'No — slope is changing', reason: `${frac('12 − 7', 1)} = 5, ${frac('22 − 12', 2)} = 5, ${frac('32 − 22', 2)} = 5. Slope is constant!` }
      ],
      step: `Check ${frac('Δy', 'Δx')} for every pair: ${frac(5, 1)} = 5, ${frac(10, 2)} = 5, ${frac(10, 2)} = 5 → YES, Linear.`
    },
    {
      rows: [[2, 11], [5, 20], [7, 26], [10, '?']],
      isLinearCheck: false, ans: '35',
      wrongs: [
        { html: '32', reason: 'From x = 7 to x = 10 is +3 units of x, and slope is +3 → 26 + 9 = 35.' },
        { html: '29', reason: '29 is for x = 8, not x = 10.' },
        { html: '38', reason: '3(10) + 5 = 35.' }
      ],
      step: `Slope = ${frac('20 − 11', '5 − 2')} = 3. Equation: ${atom('y = 3x + 5')}. At x = 10: 35.`
    }
  ];

  // Clean up tableItems[3] reasons properly
  tableItems[3].wrongs = [
    { html: 'Yes — slope is 3', reason: 'Only the first step increases by 3; the next step increases by 5!' },
    { html: 'Yes — y increases every step', reason: 'Increasing does not mean linear — the RATE of increase must stay constant.' },
    { html: 'Yes — y-intercept is 2', reason: 'Having a y-intercept does not make a table linear.' }
  ];

  tableItems.forEach((ti, idx) => {
    list.push({
      id: makeId('lp1', 19 + idx),
      topicId: 'linear_part1',
      taskType: ti.isLinearCheck ? 'IS THE TABLE LINEAR?:' : 'COMPLETE LINEAR TABLE:',
      promptHtml: ti.isLinearCheck
        ? `Does the table of values represent a <b>linear function</b>?`
        : `The table represents a linear function. What is the missing value?`,
      visualTitle: 'FUNCTION TABLE',
      visualHtml: htmlTable(['x', 'y'], ti.rows),
      choices: [
        { html: ti.ans, isCorrect: true, reason: '' },
        ...ti.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [ti.step],
      isLongChoice: ti.isLinearCheck
    });
  });

  // 25-30: Writing equation from 2 points (6 problems)
  const twoPts: Array<[number, number, number, number]> = [
    [2, 7, 4, 13],
    [0, -3, 5, 7],
    [-2, 9, 2, 1],
    [3, 5, 9, 9],
    [-4, 1, 4, 5],
    [2, 10, 6, 4]
  ];

  twoPts.forEach(([x1, y1, x2, y2], idx) => {
    const dm = y2 - y1;
    const dx = x2 - x1;
    const g = gcd(dm, dx);
    const mn = dm / g;
    const md = dx / g;
    // b = y1 - (mn/md)*x1 = (y1*md - mn*x1)/md
    const bNum = y1 * md - mn * x1;
    const gB = gcd(bNum, md);
    const bn = bNum / gB;
    const bd = md / gB;

    const correct = atom(`y = ${linearExpr(mn, md, bn, bd)}`);
    const w1 = atom(`y = ${linearExpr(-mn, md, bn, bd)}`);
    const w2 = atom(`y = ${linearExpr(md, mn, bn, bd)}`);
    const w3 = atom(`y = ${linearExpr(mn, md, y1, 1)}`);

    const seen = new Set([correct]);
    const wrongs = [
      { html: w1, reason: `Check the slope sign using ${frac('y₂ − y₁', 'x₂ − x₁')}.` },
      { html: w2, reason: 'Slope is Δy ÷ Δx (rise over run), not Δx ÷ Δy!' },
      { html: w3, reason: `${y1} is the y-value at x = ${x1}, NOT the y-intercept at x = 0.` }
    ].filter(w => !seen.has(w.html) && seen.add(w.html));
    while (wrongs.length < 3) wrongs.push({ html: atom(`y = ${linearExpr(mn, md, bn + wrongs.length + 2, bd)}`), reason: 'Plug both points into your equation to verify.' });

    list.push({
      id: makeId('lp1', 25 + idx),
      topicId: 'linear_part1',
      taskType: 'EQUATION FROM 2 POINTS:',
      promptHtml: `Write the linear equation passing through ${atom(`(${x1}, ${y1})`)} and ${atom(`(${x2}, ${y2})`)}.`,
      choices: [
        { html: correct, isCorrect: true, reason: '' },
        ...wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Slope ${atom(`m = ${frac(`${y2} − (${y1})`, `${x2} − (${x1})`)} = ${signedFrac(mn, md)}`)}.`,
        `Plug (${x1}, ${y1}) into ${atom('y = mx + b')} to find b → ${correct}.`
      ]
    });
  });

  return list;
}

// ============================================================================
// TOPIC 8: CREATING, GRAPHING, MODELING LINEAR (PART 2) (30 PROBLEMS)
// ============================================================================
function buildLinearPart2Problems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-7: Exact PDF Pages 24-25 problems
  list.push({
    id: makeId('lp2', 1),
    topicId: 'linear_part2',
    taskType: 'INTERPRET SLOPE-INTERCEPT:',
    promptHtml: `Jamal distributes charity items. The items remaining after ${atom('w')} weeks is ${atom('800 − 60w')}. What does the coefficient of ${atom('−60w')} represent?`,
    choices: [
      { html: 'The number of items Jamal distributes every week', isCorrect: true, reason: '' },
      { html: 'The number of weeks it takes to distribute 800 items', isCorrect: false, reason: '800 is the starting number of items, not weeks.' },
      { html: 'The number of weeks it takes to distribute 60 items', isCorrect: false, reason: '60 is items PER week, not weeks.' },
      { html: 'The total number of items Jamal distributes', isCorrect: false, reason: '800 is the starting total; −60 is the weekly rate.' }
    ],
    steps: [
      `In ${atom('800 − 60w')}, −60 is the slope (rate of change per week w).`,
      `It means Jamal distributes 60 items every week.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('lp2', 2),
    topicId: 'linear_part2',
    taskType: 'INTERPRET STANDARD FORM:',
    promptHtml: `Samantha sells rope and beaded wristbands, charging MORE for beaded wristbands. Total money collected is ${atom('5x + 8y')}. What does the variable ${atom('y')} represent?`,
    choices: [
      { html: 'The number of beaded wristbands sold', isCorrect: true, reason: '' },
      { html: 'The number of rope wristbands sold', isCorrect: false, reason: 'Rope wristbands cost less ($5), so x is the number of rope wristbands.' },
      { html: 'The selling price of one rope wristband', isCorrect: false, reason: '$5 is the price of a rope wristband; variables x and y count quantities.' },
      { html: 'The selling price of one beaded wristband', isCorrect: false, reason: '$8 is the selling price of one beaded wristband; y is the NUMBER sold.' }
    ],
    steps: [
      `Since $8 > $5 and beaded wristbands cost more, 8 is the price of a beaded wristband.`,
      `Therefore, y represents the number of beaded wristbands sold.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('lp2', 3),
    topicId: 'linear_part2',
    taskType: 'INTERPRET RATE OF CHANGE:',
    promptHtml: `A descending hot air balloon's altitude in feet after ${atom('x')} minutes is ${atom('−375x + 1,500')}. What does <b>−375</b> represent?`,
    choices: [
      { html: 'The rate of descent of the hot air balloon (375 ft/min)', isCorrect: true, reason: '' },
      { html: 'The altitude of the balloon after x minutes', isCorrect: false, reason: 'The entire expression −375x + 1,500 is the altitude after x minutes.' },
      { html: 'The total descent after x minutes', isCorrect: false, reason: '−375x is the total descent; −375 alone is the rate per minute.' },
      { html: 'The altitude before it begins descending', isCorrect: false, reason: '1,500 feet is the initial altitude (y-intercept).' }
    ],
    steps: [
      `In ${atom('mx + b')}, the coefficient m = −375 is the rate of change per minute.`,
      `Negative means descending at 375 feet per minute.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('lp2', 4),
    topicId: 'linear_part2',
    taskType: 'IDENTIFY FIXED FEE (y-INTERCEPT):',
    promptHtml: `A shipping company's total cost in dollars for ${atom('x')} pounds is ${atom('f(x) = 4.99x + 5.75')}. Which part represents the <b>fixed fee</b>?`,
    choices: [
      { html: '5.75', isCorrect: true, reason: '' },
      { html: '4.99', isCorrect: false, reason: '4.99 is the cost PER pound (slope).' },
      { html: 'x', isCorrect: false, reason: 'x is the weight in pounds.' },
      { html: '4.99x', isCorrect: false, reason: '4.99x is the variable weight charge, not the fixed fee.' }
    ],
    steps: [
      `Fixed fee = starting value b (does not get multiplied by x).`,
      `Here, b = $5.75.`
    ]
  });

  list.push({
    id: makeId('lp2', 5),
    topicId: 'linear_part2',
    taskType: 'INTERPRET LINEAR EXPRESSION:',
    promptHtml: `A landscape company charges ${atom('40 + 23t')} dollars for ${atom('t')} hours of labor. What does <b>23</b> represent?`,
    choices: [
      { html: 'The hourly rate ($23 per hour)', isCorrect: true, reason: '' },
      { html: 'The one-time consultation fee ($23)', isCorrect: false, reason: '40 is the one-time consultation fee.' },
      { html: 'The total cost for t hours', isCorrect: false, reason: 'The full expression 40 + 23t is the total cost.' },
      { html: 'The total hours worked', isCorrect: false, reason: 't represents the hours worked.' }
    ],
    steps: [
      `23 is multiplied by t (hours), so 23 is the hourly rate.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('lp2', 6),
    topicId: 'linear_part2',
    taskType: 'CREATE & SOLVE LINEAR WORD PROBLEM:',
    promptHtml: `Trent plants a sunflower that is <b>6 inches</b> tall. It grows <b>1.5 inches per day</b>. Which equation finds the days ${atom('x')} to reach 45 inches, and how many days will it take?`,
    choices: [
      { html: `${atom('6 + 1.5x = 45')}; 26 days`, isCorrect: true, reason: '' },
      { html: `${atom('1.5 + 6x = 45')}; 7.25 days`, isCorrect: false, reason: '1.5 is the growth rate per day (goes with x), and 6 is the starting height!' },
      { html: `${atom('6 + 1.5x = 45')}; 34 days`, isCorrect: false, reason: 'Subtract 6 from 45 first (39), then divide by 1.5: 39 ÷ 1.5 = 26.' },
      { html: `${atom('1.5x = 45')}; 30 days`, isCorrect: false, reason: 'Do not forget the starting height of 6 inches!' }
    ],
    steps: [
      `Starting height b = 6, rate m = 1.5 → ${atom('6 + 1.5x = 45')}.`,
      `Solve: ${atom('1.5x = 39')} → ${atom('x = 26 days')}.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('lp2', 7),
    topicId: 'linear_part2',
    taskType: 'WRITE STANDARD FORM EQUATION:',
    promptHtml: `Madison bought ${atom('b')} pounds of bananas at $0.60/lb and ${atom('p')} pounds of pears at $1.74/lb, spending $10.38 total. Which equation models this?`,
    choices: [
      { html: atom('0.60b + 1.74p = 10.38'), isCorrect: true, reason: '' },
      { html: atom('1.74b + 0.60p = 10.38'), isCorrect: false, reason: 'You swapped the prices of bananas ($0.60) and pears ($1.74).' },
      { html: atom('b + p = 10.38'), isCorrect: false, reason: 'Multiply each quantity by its price per pound before adding.' },
      { html: atom('10.38b + 0.60p = 1.74'), isCorrect: false, reason: '$10.38 is the total cost on the right side of the equation.' }
    ],
    steps: [
      `Use Standard Form ${atom('Ax + By = C')}: (price × lbs of bananas) + (price × lbs of pears) = total.`,
      `${atom('0.60b + 1.74p = 10.38')}.`
    ]
  });

  // 8-18: Slope-Intercept Word Problems (11 problems)
  const siStories: Array<{
    story: string;
    m: number; b: number; mLabel: string; bLabel: string;
  }> = [
    { story: 'A streaming subscription costs $10 per month plus a $20 setup fee.', m: 10, b: 20, mLabel: 'per month', bLabel: 'setup fee' },
    { story: 'A gym membership charges $35 per month plus a $50 enrollment fee.', m: 35, b: 50, mLabel: 'per month', bLabel: 'enrollment fee' },
    { story: 'A water tank holds 450 gallons and drains at 18 gallons per minute.', m: -18, b: 450, mLabel: 'per minute', bLabel: 'starting water' },
    { story: 'A plumber charges $75 for a house call plus $65 per hour of work.', m: 65, b: 75, mLabel: 'per hour', bLabel: 'house call fee' },
    { story: 'A candle is 12 inches tall and burns down 0.5 inches every hour.', m: -0.5, b: 12, mLabel: 'per hour', bLabel: 'starting height' },
    { story: 'A rideshare charges $3.50 base fare plus $1.80 per mile.', m: 1.8, b: 3.5, mLabel: 'per mile', bLabel: 'base fare' },
    { story: 'A drone starts at 300 feet and climbs 25 feet per second.', m: 25, b: 300, mLabel: 'per second', bLabel: 'initial height' },
    { story: 'A student starts with $120 saved and saves $15 each week.', m: 15, b: 120, mLabel: 'each week', bLabel: 'initial savings' },
    { story: 'A freezer starts at 70°F and cools down by 4°F per minute.', m: -4, b: 70, mLabel: 'per minute', bLabel: 'starting temp' },
    { story: 'A bike rental costs a $12 deposit plus $8 per hour.', m: 8, b: 12, mLabel: 'per hour', bLabel: 'deposit' },
    { story: 'A phone battery starts at 100% and loses 12% per hour of gaming.', m: -12, b: 100, mLabel: 'per hour', bLabel: 'full charge' }
  ];

  siStories.forEach((st, idx) => {
    const mStr = st.m === -0.5 ? `−${frac(1, 2)}` : `${st.m}`;
    const mSwapStr = st.m < 0 ? `${Math.abs(st.m)}` : `−${st.m}`;
    const ansHtml = atom(`y = ${mStr}x + ${st.b}`);
    const w1 = atom(`y = ${st.b}x ${st.m >= 0 ? '+' : '−'} ${Math.abs(st.m)}`);
    const w2 = atom(`y = ${mSwapStr}x + ${st.b}`);
    const w3 = atom(`y = ${mStr}x`);

    list.push({
      id: makeId('lp2', 8 + idx),
      topicId: 'linear_part2',
      taskType: 'WRITE SLOPE-INTERCEPT EQUATION:',
      promptHtml: `${st.story} Write an equation for ${atom('y')} after ${atom('x')} units.`,
      choices: [
        { html: ansHtml, isCorrect: true, reason: '' },
        { html: w1, isCorrect: false, reason: `Swapped m and b! ${st.m} is the rate (${st.mLabel}), so ${st.m} goes with x.` },
        { html: w2, isCorrect: false, reason: `Check the sign of the rate: ${st.m < 0 ? 'decreasing/draining/burning uses a NEGATIVE slope' : 'increasing/charging uses a POSITIVE slope'}.` },
        { html: w3, isCorrect: false, reason: `Do not leave out the starting value (${st.b})!` }
      ],
      steps: [
        `Identify starting value b = ${st.b} (${st.bLabel}) and rate m = ${st.m} (${st.mLabel}).`,
        `Write in ${atom('y = mx + b')}: ${ansHtml}.`
      ]
    });
  });

  // 19-25: Standard Form Word Problems (7 problems)
  const stdStories: Array<{
    story: string;
    A: number; B: number; C: number; v1: string; v2: string;
  }> = [
    { story: 'A café sells coffees (x) for $3 each and muffins (y) for $2 each. Total sales are $60.', A: 3, B: 2, C: 60, v1: 'x', v2: 'y' },
    { story: 'A store sells pencils (x) for $2 each and notebooks (y) for $3 each. Total sales are $50.', A: 2, B: 3, C: 50, v1: 'x', v2: 'y' },
    { story: 'A bakery sells brownies (b) for $4 each and cookies (c) for $1.50 each for $84 total.', A: 4, B: 1.5, C: 84, v1: 'b', v2: 'c' },
    { story: 'Small pizzas (s) cost $9 and large pizzas (L) cost $14. A team spends $128 total.', A: 9, B: 14, C: 128, v1: 's', v2: 'L' },
    { story: 'Student tickets (s) are $6 and adult tickets (a) are $11. Total box office is $550.', A: 6, B: 11, C: 550, v1: 's', v2: 'a' },
    { story: 'Trucks carry 5 tons (t) and vans carry 2 tons (v) to haul 70 tons total.', A: 5, B: 2, C: 70, v1: 't', v2: 'v' },
    { story: 'Hardcover books (h) are $18 and paperbacks (p) are $10, totaling $260.', A: 18, B: 10, C: 260, v1: 'h', v2: 'p' }
  ];

  stdStories.forEach((ss, idx) => {
    const ans = atom(`${ss.A}${ss.v1} + ${ss.B}${ss.v2} = ${ss.C}`);
    const w1 = atom(`${ss.B}${ss.v1} + ${ss.A}${ss.v2} = ${ss.C}`);
    const w2 = atom(`${ss.v1} + ${ss.v2} = ${ss.C}`);
    const w3 = atom(`${ss.A}${ss.v1} − ${ss.B}${ss.v2} = ${ss.C}`);

    list.push({
      id: makeId('lp2', 19 + idx),
      topicId: 'linear_part2',
      taskType: 'STANDARD FORM WORD PROBLEM:',
      promptHtml: `${ss.story} Which equation models this situation?`,
      choices: [
        { html: ans, isCorrect: true, reason: '' },
        { html: w1, isCorrect: false, reason: `Check which rate belongs to ${ss.v1} (${ss.A}) and which belongs to ${ss.v2} (${ss.B}).` },
        { html: w2, isCorrect: false, reason: 'You must multiply each variable by its unit price/rate.' },
        { html: w3, isCorrect: false, reason: 'Combining sales/totals adds the two amounts together.' }
      ],
      steps: [
        `Assign rates A = ${ss.A}, B = ${ss.B}, and Total C = ${ss.C}.`,
        `Standard Form: ${ans}.`
      ]
    });
  });

  // 26-30: Interpreting x-intercept / y-intercept in context (5 problems)
  const ctxItems: Array<{
    prompt: string;
    ans: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      prompt: `A tank drains according to ${atom('V(t) = 360 − 15t')}, where ${atom('V')} is gallons and ${atom('t')} is minutes. What does the <b>t-intercept (24, 0)</b> mean?`,
      ans: 'It takes 24 minutes for the tank to completely empty (0 gallons left)',
      wrongs: [
        { html: 'The tank starts with 24 gallons', reason: 'It starts with 360 gallons (at t = 0).' },
        { html: 'The tank drains 24 gallons per minute', reason: 'The drain rate is 15 gallons per minute (the slope).' },
        { html: 'After 0 minutes there are 24 gallons', reason: 'In (24, 0), t = 24 minutes and V = 0 gallons.' }
      ],
      step: `When V = 0 (empty), t = 24 minutes.`
    },
    {
      prompt: `The cost to print shirts is ${atom('C(n) = 12n + 85')}. What does <b>85</b> represent?`,
      ans: 'The one-time setup/design fee before printing any shirts',
      wrongs: [
        { html: 'The cost per shirt', reason: '12 is the cost per shirt (slope).' },
        { html: 'The maximum number of shirts', reason: '85 is in dollars (y-intercept), not shirts.' },
        { html: 'The total cost for 12 shirts', reason: '85 is the fixed cost when n = 0.' }
      ],
      step: `At n = 0 shirts, C(0) = $85 → fixed setup fee.`
    },
    {
      prompt: `A hiker's elevation is ${atom('E(h) = 4,200 − 600h')} feet after ${atom('h')} hours of hiking down. After how many hours does the hiker reach sea level (0 ft)?`,
      ans: '7 hours',
      wrongs: [
        { html: '6 hours', reason: '4,200 − 600(6) = 600 ft, still above sea level.' },
        { html: '8 hours', reason: '600 × 7 = 4,200.' },
        { html: '4.2 hours', reason: 'Solve 4,200 − 600h = 0 → h = 4200 ÷ 600 = 7.' }
      ],
      step: `Set ${atom('4,200 − 600h = 0')} → ${atom('600h = 4,200')} → ${atom('h = 7 hours')}.`
    },
    {
      prompt: `In ${atom('4x + 6y = 48')}, ${atom('x')} is adult tickets and ${atom('y')} is child tickets for $48 total. What does the x-intercept <b>(12, 0)</b> mean?`,
      ans: 'If 0 child tickets are bought, 12 adult tickets can be bought for $48',
      wrongs: [
        { html: 'Adult tickets cost $12 each', reason: 'Adult tickets cost $4 each; 12 is the maximum number of adult tickets.' },
        { html: '12 total tickets were sold', reason: '4(12) + 6(0) = $48 means 12 adult and 0 child tickets.' },
        { html: '12 child tickets can be bought', reason: 'In (12, 0), x = 12 (adults) and y = 0 (children).' }
      ],
      step: `In (12, 0), x = 12 adult tickets and y = 0 child tickets.`
    },
    {
      prompt: `A phone plan costs ${atom('C = 25 + 0.10m')} where ${atom('m')} is text messages over the limit. What is the cost for <b>40 extra texts</b>?`,
      ans: '$29.00',
      wrongs: [
        { html: '$25.40', reason: '40 × $0.10 = $4.00, not $0.40!' },
        { html: '$65.00', reason: 'Texts cost $0.10 each, not $1.00 each.' },
        { html: '$4.00', reason: 'Do not forget the $25 base plan cost!' }
      ],
      step: `${atom('C = 25 + 0.10(40) = 25 + 4 = $29.00')}.`
    }
  ];

  ctxItems.forEach((ci, idx) => {
    list.push({
      id: makeId('lp2', 26 + idx),
      topicId: 'linear_part2',
      taskType: 'CONTEXT INTERPRETATION:',
      promptHtml: ci.prompt,
      choices: [
        { html: ci.ans, isCorrect: true, reason: '' },
        ...ci.wrongs.map(w => ({ ...w, isCorrect: false }))
      ],
      steps: [ci.step],
      isLongChoice: true
    });
  });

  return list;
}

// ============================================================================
// TOPIC 9: CREATING, SOLVING, MODELING SYSTEMS OF EQUATIONS (30 PROBLEMS)
// ============================================================================
function buildSystemsProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-9: Direct OST Playbook Pages 28-31 questions
  list.push({
    id: makeId('sys', 1),
    topicId: 'systems',
    taskType: 'SYSTEMS — NO SOLUTION:',
    promptHtml: `Which statement is true about a system of linear equations that has <b>no solution</b>?`,
    choices: [
      { html: 'The graphs of the equations are parallel lines', isCorrect: true, reason: '' },
      { html: 'The graphs of the equations are the same line', isCorrect: false, reason: 'Same line means INFINITELY MANY solutions, not no solution.' },
      { html: 'The graphs of the equations are perpendicular lines', isCorrect: false, reason: 'Perpendicular lines cross once → ONE solution.' },
      { html: 'The graphs are non-perpendicular intersecting lines', isCorrect: false, reason: 'Intersecting lines cross once → ONE solution.' }
    ],
    steps: [
      `No solution = lines never intersect = same slope, different y-intercepts.`,
      `Lines that never cross are parallel lines.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('sys', 2),
    topicId: 'systems',
    taskType: 'SYSTEM FROM GRAPH:',
    promptHtml: `A system of two linear equations is shown on the graph. What is the <b>solution</b> to the system?`,
    visualTitle: 'SYSTEM GRAPH',
    visualHtml: svgCoordGraph({
      xMin: -8, xMax: 8, yMin: -6, yMax: 6, step: 2,
      lines: [
        { m: 0.5, b: 0, color: '#38bdf8' },
        { m: -3, b: 21, color: '#fbbf24' }
      ],
      points: [{ x: 6, y: 3, color: '#34d399' }]
    }),
    choices: [
      { html: atom('(6, 3)'), isCorrect: true, reason: '' },
      { html: atom('(3, 6)'), isCorrect: false, reason: 'Read x first (6), then y (3): (6, 3).' },
      { html: atom('(7, 0)'), isCorrect: false, reason: '(7, 0) is only the x-intercept of one line, not where the two lines cross!' },
      { html: atom('(0, 0)'), isCorrect: false, reason: '(0, 0) is only on the blue line, not the yellow line.' }
    ],
    steps: [
      `The solution to a graphed system is the intersection point of the two lines.`,
      `They cross at x = 6, y = 3 → ${atom('(6, 3)')}.`
    ]
  });

  list.push({
    id: makeId('sys', 3),
    topicId: 'systems',
    taskType: 'SOLVE SYSTEM WITH FRACTIONS:',
    promptHtml: `Solve the system: ${atom('y = 2x + 5')} and ${atom(`y = ${frac(1, 4)}x − ${frac(1, 4)}`)}.`,
    choices: [
      { html: atom('(−3, −1)'), isCorrect: true, reason: '' },
      { html: atom('(3, 11)'), isCorrect: false, reason: 'Check the second equation at x = 3: ¼(3) − ¼ = ½ ≠ 11.' },
      { html: atom('(−1, 3)'), isCorrect: false, reason: 'At x = −1: 2(−1) + 5 = 3, but ¼(−1) − ¼ = −½ ≠ 3.' },
      { html: atom('(−3, 1)'), isCorrect: false, reason: '2(−3) + 5 = −6 + 5 = −1, not +1.' }
    ],
    steps: [
      `Set equal: ${atom(`2x + 5 = ${frac(1, 4)}x − ${frac(1, 4)}`)}. Multiply everything by 4: ${atom('8x + 20 = x − 1')}.`,
      `${atom('7x = −21')} → ${atom('x = −3')}. Then ${atom('y = 2(−3) + 5 = −1')} → ${atom('(−3, −1)')}.`
    ]
  });

  list.push({
    id: makeId('sys', 4),
    topicId: 'systems',
    taskType: 'SOLVE f(x) = g(x):',
    promptHtml: `Two functions are given: ${atom('f(x) = 3x + 4')} and ${atom('g(x) = 7x − 2')}. What value of ${atom('x')} makes ${atom('f(x) = g(x)')} true?`,
    choices: [
      { html: atom(`x = ${frac(3, 2)}`), isCorrect: true, reason: '' },
      { html: atom(`x = ${frac(1, 2)}`), isCorrect: false, reason: 'Add 2 to 4 (6), do not subtract 2!' },
      { html: atom(`x = −${frac(3, 2)}`), isCorrect: false, reason: `${frac(6, 4)} = +${frac(3, 2)}, positive.` },
      { html: atom(`x = ${frac(2, 3)}`), isCorrect: false, reason: 'Divide 6 by 4, not 4 by 6.' }
    ],
    steps: [
      `Set ${atom('3x + 4 = 7x − 2')}.`,
      `Add 2 and subtract 3x: ${atom('6 = 4x')} → ${atom(`x = ${frac(6, 4)} = ${frac(3, 2)}`)}.`
    ]
  });

  list.push({
    id: makeId('sys', 5),
    topicId: 'systems',
    taskType: 'SYSTEM WORD PROBLEM (TICKETS):',
    promptHtml: `Adult tickets (${atom('a')}) and child tickets (${atom('c')}) satisfy ${atom('a + c = 256')} and ${atom('8a + 5c = 1,673')}. How many <b>adult tickets</b> were sold?`,
    choices: [
      { html: '131 adult tickets', isCorrect: true, reason: '' },
      { html: '125 adult tickets', isCorrect: false, reason: '125 is the number of CHILD tickets (c = 256 − 131 = 125).' },
      { html: '256 adult tickets', isCorrect: false, reason: '256 is the total of adult AND child tickets combined.' },
      { html: '140 adult tickets', isCorrect: false, reason: 'Check: 8(131) + 5(125) = 1,048 + 625 = 1,673.' }
    ],
    steps: [
      `Multiply ${atom('a + c = 256')} by 5: ${atom('5a + 5c = 1,280')}.`,
      `Subtract from ${atom('8a + 5c = 1,673')}: ${atom('3a = 393')} → ${atom('a = 131')} adult tickets.`
    ]
  });

  list.push({
    id: makeId('sys', 6),
    topicId: 'systems',
    taskType: 'SYSTEM WORD PROBLEM:',
    promptHtml: `What two numbers have a sum of <b>217</b> and a difference of <b>85</b>?`,
    choices: [
      { html: '151 and 66', isCorrect: true, reason: '' },
      { html: '132 and 85', isCorrect: false, reason: '132 − 85 = 47, not 85.' },
      { html: '160 and 57', isCorrect: false, reason: '160 − 57 = 103 ≠ 85.' },
      { html: '141 and 76', isCorrect: false, reason: '141 − 76 = 65 ≠ 85.' }
    ],
    steps: [
      `Set up: ${atom('x + y = 217')} and ${atom('x − y = 85')}.`,
      `Add the equations: ${atom('2x = 302')} → ${atom('x = 151')}, and ${atom('y = 217 − 151 = 66')}.`
    ]
  });

  list.push({
    id: makeId('sys', 7),
    topicId: 'systems',
    taskType: 'EQUIVALENT SYSTEMS:',
    promptHtml: `Given ${atom('x + 3y = 1')} and ${atom('−2x − y = −2')}, which system has the <b>exact same solution</b>?`,
    choices: [
      { html: `${atom('2x + 6y = 2')} &nbsp;|&nbsp; ${atom('−2x − y = −2')}`, isCorrect: true, reason: '' },
      { html: `${atom('−2x + 3y = 1')} &nbsp;|&nbsp; ${atom('−2x − y = −2')}`, isCorrect: false, reason: 'You multiplied only x by −2 instead of the entire equation!' },
      { html: `${atom('2x + 6y = 1')} &nbsp;|&nbsp; ${atom('2x + y = 2')}`, isCorrect: false, reason: 'You forgot to multiply the right side (1 × 2 = 2) of the first equation.' },
      { html: `${atom('x + 3y = 1')} &nbsp;|&nbsp; ${atom('−x − y = −2')}`, isCorrect: false, reason: 'You divided −2x by 2 without dividing −y and −2 by 2.' }
    ],
    steps: [
      `Multiplying an entire equation (both sides!) by the same nonzero constant preserves the solution.`,
      `Multiply ${atom('x + 3y = 1')} by 2 → ${atom('2x + 6y = 2')}.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('sys', 8),
    topicId: 'systems',
    taskType: 'SYSTEM OF INEQUALITIES (GRAPH):',
    promptHtml: `Which description matches the solution set for ${atom('y ≤ x + 4')} and ${atom('y > 3x − 1')}?`,
    visualTitle: 'SYSTEM OF INEQUALITIES',
    visualHtml: svgCoordGraph({
      xMin: -6, xMax: 8, yMin: -6, yMax: 10, step: 2,
      shadePolygon: [[-6, -2], [2.5, 6.5], [-1.67, -6], [-6, -6]],
      lines: [
        { m: 1, b: 4, color: '#34d399', dashed: false },
        { m: 3, b: -1, color: '#fbbf24', dashed: true }
      ]
    }),
    choices: [
      { html: 'Solid line for y ≤ x + 4 (shaded below); Dotted line for y > 3x − 1 (shaded above)', isCorrect: true, reason: '' },
      { html: 'Dotted line for y ≤ x + 4; Solid line for y > 3x − 1', isCorrect: false, reason: '≤ uses a SOLID line, while > uses a DOTTED line!' },
      { html: 'Solid line for y ≤ x + 4 (shaded above); Dotted line for y > 3x − 1 (shaded below)', isCorrect: false, reason: 'y ≤ means shade BELOW; y > means shade ABOVE.' },
      { html: 'Both lines solid, shaded in the top-right region', isCorrect: false, reason: 'Strict > must be a dotted line.' }
    ],
    steps: [
      `${atom('≤')} or ${atom('≥')} → Solid line. ${atom('<')} or ${atom('>')} → Dotted line.`,
      `${atom('y ≤ x + 4')} shades below the solid line; ${atom('y > 3x − 1')} shades above the dotted line.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('sys', 9),
    topicId: 'systems',
    taskType: 'MODEL SYSTEM OF INEQUALITIES:',
    promptHtml: `Product X costs $3.50/unit and Product Y costs $2.50/unit. Weekly cost cannot exceed $3,000, and at least 1,000 total units must be made. Which system models this?`,
    choices: [
      { html: `${atom('x + y ≥ 1000')} &nbsp;|&nbsp; ${atom('3.5x + 2.5y ≤ 3000')}`, isCorrect: true, reason: '' },
      { html: `${atom('x + y ≥ 1000')} &nbsp;|&nbsp; ${atom('x + y ≤ 3000')}`, isCorrect: false, reason: 'The $3,000 limit is on COST (3.5x + 2.5y), not units.' },
      { html: `${atom('x + y ≤ 1000')} &nbsp;|&nbsp; ${atom('x + y ≥ 3000')}`, isCorrect: false, reason: '"At least 1,000" means ≥ 1000, and "not exceed $3,000" means ≤ 3000.' },
      { html: `${atom('x + y ≤ 1000')} &nbsp;|&nbsp; ${atom('3.5x + 2.5y ≥ 3000')}`, isCorrect: false, reason: 'Both inequality signs are reversed!' }
    ],
    steps: [
      `"At least 1,000 units" → ${atom('x + y ≥ 1000')}.`,
      `"Cost must not exceed $3,000" → ${atom('3.5x + 2.5y ≤ 3000')}.`
    ],
    isLongChoice: true
  });

  // 10-12: Remaining PDF p.29 & p.31 problems
  list.push({
    id: makeId('sys', 10),
    topicId: 'systems',
    taskType: 'THEATER TICKETS SYSTEM:',
    promptHtml: `Lower-level seats cost $35 and upper-level seats cost $25. A theater sells <b>350 tickets</b> for <b>$10,250</b>. How many lower-level tickets were sold?`,
    choices: [
      { html: '150 lower-level tickets', isCorrect: true, reason: '' },
      { html: '200 lower-level tickets', isCorrect: false, reason: '200 is the number of UPPER-level tickets (350 − 150 = 200).' },
      { html: '175 lower-level tickets', isCorrect: false, reason: '35(175) + 25(175) = $10,500 ≠ $10,250.' },
      { html: '125 lower-level tickets', isCorrect: false, reason: '35(125) + 25(225) = $10,000 ≠ $10,250.' }
    ],
    steps: [
      `${atom('L + U = 350')} and ${atom('35L + 25U = 10,250')}.`,
      `Substitute ${atom('U = 350 − L')}: ${atom('35L + 25(350 − L) = 10,250')} → ${atom('10L = 1,500')} → ${atom('L = 150')}.`
    ]
  });

  list.push({
    id: makeId('sys', 11),
    topicId: 'systems',
    taskType: 'COINS SYSTEM (DAVID):',
    promptHtml: `David has 30 coins totaling $4.80, all dimes (${atom('D')}) and quarters (${atom('Q')}). How many <b>quarters</b> does he have?`,
    choices: [
      { html: '12 quarters', isCorrect: true, reason: '' },
      { html: '18 quarters', isCorrect: false, reason: '18 is the number of DIMES (18 × $0.10 + 12 × $0.25 = $4.80).' },
      { html: '15 quarters', isCorrect: false, reason: '15 quarters + 15 dimes = $3.75 + $1.50 = $5.25 ≠ $4.80.' },
      { html: '10 quarters', isCorrect: false, reason: '10 quarters + 20 dimes = $2.50 + $2.00 = $4.50 ≠ $4.80.' }
    ],
    steps: [
      `Equations: ${atom('D + Q = 30')} and ${atom('0.10D + 0.25Q = 4.80')}.`,
      `Multiply 1st by 0.10 and subtract: ${atom('0.15Q = 1.80')} → ${atom('Q = 12 quarters')}.`
    ]
  });

  list.push({
    id: makeId('sys', 12),
    topicId: 'systems',
    taskType: 'ORDERED PAIR IN INEQUALITY SYSTEM:',
    promptHtml: `Which ordered pair is a solution to the system ${atom('x ≤ 4')} and ${atom('y > 0')}?`,
    choices: [
      { html: atom('(−4, 6)'), isCorrect: true, reason: '' },
      { html: atom('(5, 2)'), isCorrect: false, reason: 'x = 5 is NOT ≤ 4.' },
      { html: atom('(3, 0)'), isCorrect: false, reason: 'y = 0 is NOT strictly > 0!' },
      { html: atom('(−7, −1)'), isCorrect: false, reason: 'y = −1 is NOT > 0.' }
    ],
    steps: [
      `Check both conditions: x must be 4 or less, and y must be strictly positive (> 0).`,
      `Only (−4, 6) satisfies −4 ≤ 4 and 6 > 0.`
    ]
  });

  // 13-22: Solving 2x2 Linear Systems (10 problems)
  const sysPairs: Array<{
    eq1: string; eq2: string; x: number; y: number;
  }> = [
    { eq1: 'y = 3x − 1', eq2: 'y = x + 5', x: 3, y: 8 },
    { eq1: 'x + y = 14', eq2: 'x − y = 4', x: 9, y: 5 },
    { eq1: '2x + y = 11', eq2: 'x − y = 4', x: 5, y: 1 },
    { eq1: 'y = −2x + 10', eq2: 'y = 3x − 5', x: 3, y: 4 },
    { eq1: '3x + 2y = 19', eq2: 'x + 2y = 11', x: 4, y: 3.5 },
    { eq1: '4x − y = 10', eq2: '2x + y = 8', x: 3, y: 2 },
    { eq1: 'y = 4x − 7', eq2: 'y = 2x + 1', x: 4, y: 9 },
    { eq1: '2x + 3y = 18', eq2: '2x − y = 2', x: 3, y: 4 },
    { eq1: '5x + y = 17', eq2: '3x − y = 7', x: 3, y: 2 },
    { eq1: 'x + 2y = 13', eq2: '3x − 2y = 7', x: 5, y: 4 }
  ];

  sysPairs.forEach((sp, idx) => {
    const yDisp = sp.y === 3.5 ? frac(7, 2) : `${sp.y}`;
    const ans = atom(`(${sp.x}, ${yDisp})`);
    const w1 = atom(`(${yDisp}, ${sp.x})`);
    const w2 = atom(`(${-sp.x}, ${yDisp})`);
    const w3 = atom(`(${sp.x + 1}, ${sp.y === 3.5 ? 3 : sp.y - 1})`);
    const w4 = atom(`(${sp.x}, ${sp.y === 3.5 ? 4 : -sp.y})`);

    const seen = new Set([ans]);
    const wrongs: Array<{ html: string; isCorrect: boolean; reason: string }> = [];
    for (const cand of [
      { html: w1, reason: 'Coordinates must be ordered (x, y), not (y, x)!' },
      { html: w2, reason: 'Check your sign when solving for x.' },
      { html: w3, reason: 'Plug (x, y) into BOTH equations to verify.' },
      { html: w4, reason: 'Check your sign when solving for y.' }
    ]) {
      if (!seen.has(cand.html) && wrongs.length < 3) {
        seen.add(cand.html);
        wrongs.push({ html: cand.html, isCorrect: false, reason: cand.reason });
      }
    }

    list.push({
      id: makeId('sys', 13 + idx),
      topicId: 'systems',
      taskType: 'SOLVE SYSTEM OF EQUATIONS:',
      promptHtml: `What is the solution to the system ${atom(sp.eq1)} and ${atom(sp.eq2)}?`,
      choices: [
        { html: ans, isCorrect: true, reason: '' },
        ...wrongs
      ],
      steps: [
        `Use elimination or substitution (or type both into Desmos and click the intersection).`,
        `Intersection: ${ans}.`
      ]
    });
  });

  // 23-30: Number of Solutions (One / None / Infinite) & Linear-Quadratic Intersections (8 problems)
  const solCountItems: Array<{
    eq1: string; eq2: string; ans: string; why: string;
  }> = [
    { eq1: 'y = 4x − 3', eq2: 'y = 4x + 7', ans: 'No solution (parallel lines)', why: 'Same slope (4), different y-intercepts (−3 and 7) → parallel lines.' },
    { eq1: 'y = 2x + 5', eq2: '4x − 2y = −10', ans: 'Infinitely many solutions (same line)', why: 'Dividing 4x − 2y = −10 by −2 gives y = 2x + 5 (identical line!).' },
    { eq1: 'y = 3x − 2', eq2: 'y = −3x + 4', ans: 'One solution (intersecting lines)', why: 'Different slopes (3 and −3) → lines cross at exactly one point.' },
    { eq1: '3x + y = 9', eq2: '6x + 2y = 12', ans: 'No solution (parallel lines)', why: 'Both have slope −3, but y-intercepts are 9 and 6 → parallel.' },
    { eq1: '2x − 3y = 6', eq2: '4x − 6y = 12', ans: 'Infinitely many solutions (same line)', why: '2nd equation is just 2 × the 1st equation → same line.' },
    { eq1: 'y = 5', eq2: 'x = −2', ans: 'One solution: (−2, 5)', why: 'Horizontal line y = 5 and vertical line x = −2 cross at (−2, 5).' }
  ];

  solCountItems.forEach((sc, idx) => {
    const pool = [
      'No solution (parallel lines)',
      'Infinitely many solutions (same line)',
      sc.ans.startsWith('One solution') ? sc.ans : 'One solution (intersecting lines)',
      'Two solutions'
    ];
    list.push({
      id: makeId('sys', 23 + idx),
      topicId: 'systems',
      taskType: 'NUMBER OF SOLUTIONS:',
      promptHtml: `How many solutions does the system ${atom(sc.eq1)} and ${atom(sc.eq2)} have?`,
      choices: pool.map(opt => ({
        html: opt,
        isCorrect: opt === sc.ans,
        reason: opt === sc.ans ? '' : sc.why
      })),
      steps: [
        `Compare slopes and y-intercepts (or graph both in Desmos).`,
        sc.why
      ],
      isLongChoice: true
    });
  });

  // 29-30: Linear-Quadratic system & Store Apples/Bananas inequality check (PDF p.27 & p.29)
  list.push({
    id: makeId('sys', 29),
    topicId: 'systems',
    taskType: 'LINEAR–QUADRATIC SYSTEM:',
    promptHtml: `The parabola ${atom(`y = −${pow('x', 2)} + 6x − 2`)} and line ${atom('y = −2x + 10')} intersect on the graph. What is a solution?`,
    visualTitle: 'SYSTEM INTERSECTION',
    visualHtml: svgCoordGraph({
      xMin: -1, xMax: 7, yMin: -4, yMax: 10, step: 2,
      parabolas: [{ a: -1, b: 6, c: -2, color: '#38bdf8' }],
      lines: [{ m: -2, b: 10, color: '#fbbf24' }],
      points: [{ x: 2, y: 6, color: '#34d399' }, { x: 6, y: -2, color: '#34d399' }]
    }),
    choices: [
      { html: atom('(2, 6)'), isCorrect: true, reason: '' },
      { html: atom('(3, 7)'), isCorrect: false, reason: '(3, 7) is the vertex of the parabola, not on the line −2(3) + 10 = 4.' },
      { html: atom('(0, 10)'), isCorrect: false, reason: '(0, 10) is only on the line, not the parabola.' },
      { html: atom('(5, 0)'), isCorrect: false, reason: 'At x = 5, the line is at y = 0, while the parabola is at y = 3.' }
    ],
    steps: [
      `Set equal or check the intersection on the graph: at x = 2, both give y = 6.`,
      `Solution: ${atom('(2, 6)')} (and ${atom('(6, −2)')}).`
    ]
  });

  list.push({
    id: makeId('sys', 30),
    topicId: 'systems',
    taskType: 'INEQUALITY SYSTEM WORD PROBLEM:',
    promptHtml: `Apples cost $3 each and bananas cost $2 each. You can spend <b>no more than $18</b> and must buy <b>at least 5 fruits</b>. Which combination works?`,
    choices: [
      { html: '3 apples and 3 bananas', isCorrect: true, reason: '' },
      { html: '5 apples and 2 bananas', isCorrect: false, reason: '5(3) + 2(2) = $19, which exceeds your $18 budget!' },
      { html: '2 apples and 2 bananas', isCorrect: false, reason: '2 + 2 = 4 fruits, which is less than the required 5 fruits!' },
      { html: '4 apples and 4 bananas', isCorrect: false, reason: '4(3) + 4(2) = $20, exceeding $18.' }
    ],
    steps: [
      `Check both constraints: ${atom('3x + 2y ≤ 18')} and ${atom('x + y ≥ 5')}.`,
      `3 apples + 3 bananas: 3 + 3 = 6 ≥ 5 fruits, and 3(3) + 2(3) = $15 ≤ $18 ✓.`
    ],
    isLongChoice: true
  });

  return list;
}

// ============================================================================
// TOPIC 10: EXPRESSIONS (30 PROBLEMS)
// ============================================================================
function buildExpressionsProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-10: Simplifying Linear & Algebraic Expressions (distributing negatives & fractions) (10 problems)
  const simpItems: Array<{
    exprHtml: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      exprHtml: '2(x + 3) + 4x − 5', ansHtml: '6x + 1',
      wrongs: [
        { html: '6x − 2', reason: 'Distribute 2 to 3: 2(3) = 6, then 6 − 5 = +1.' },
        { html: '5x + 1', reason: '2x + 4x = 6x.' },
        { html: '6x + 11', reason: 'Subtract 5 from 6: 6 − 5 = 1.' }
      ],
      step: `${atom('2x + 6 + 4x − 5 = 6x + 1')}.`
    },
    {
      exprHtml: '5(2x − 4) − 3(x − 6)', ansHtml: '7x − 2',
      wrongs: [
        { html: '7x − 38', reason: 'Watch the negative sign: −3(−6) = +18, so −20 + 18 = −2!' },
        { html: '13x − 2', reason: '10x − 3x = 7x, not 13x.' },
        { html: '7x + 2', reason: '−20 + 18 = −2, negative.' }
      ],
      step: `${atom('10x − 20 − 3x + 18 = 7x − 2')}.`
    },
    {
      exprHtml: '−4(3x − 2) + 7x − 9', ansHtml: '−5x − 1',
      wrongs: [
        { html: '−5x − 17', reason: '−4(−2) = +8, and 8 − 9 = −1!' },
        { html: '−19x − 1', reason: '−12x + 7x = −5x.' },
        { html: '5x − 1', reason: '−12x + 7x = −5x, negative.' }
      ],
      step: `${atom('−12x + 8 + 7x − 9 = −5x − 1')}.`
    },
    {
      exprHtml: `${frac(2, 3)}(9x − 12) − 4x + 5`, ansHtml: '2x − 3',
      wrongs: [
        { html: '2x − 13', reason: `${frac(2, 3)}(−12) = −8, and −8 + 5 = −3.` },
        { html: '2x + 13', reason: `${frac(2, 3)}(−12) is negative (−8).` },
        { html: '10x − 3', reason: '6x − 4x = 2x, not 10x.' }
      ],
      step: `${atom('6x − 8 − 4x + 5 = 2x − 3')}.`
    },
    {
      exprHtml: '8 − 2(5x − 3) + 4x', ansHtml: '−6x + 14',
      wrongs: [
        { html: '−6x + 2', reason: '−2(−3) = +6, so 8 + 6 = 14!' },
        { html: '30x − 18', reason: 'Order of operations: distribute −2 BEFORE subtracting from 8!' },
        { html: '−14x + 14', reason: '−10x + 4x = −6x.' }
      ],
      step: `${atom('8 − 10x + 6 + 4x = −6x + 14')}.`
    },
    {
      exprHtml: `${frac(3, 4)}(8x + 12) − ${frac(1, 2)}(4x − 6)`, ansHtml: '4x + 12',
      wrongs: [
        { html: '4x + 6', reason: `Watch −${frac(1, 2)}(−6) = +3, so 9 + 3 = 12!` },
        { html: '8x + 12', reason: '6x − 2x = 4x.' },
        { html: '4x + 9', reason: `Include −${frac(1, 2)}(−6) = +3.` }
      ],
      step: `${atom('6x + 9 − 2x + 3 = 4x + 12')}.`
    },
    {
      exprHtml: '3(4x − 1) − (5x − 7)', ansHtml: '7x + 4',
      wrongs: [
        { html: '7x − 10', reason: 'Distribute the negative sign to −7: −(−7) = +7, so −3 + 7 = +4!' },
        { html: '17x + 4', reason: '12x − 5x = 7x.' },
        { html: '7x − 4', reason: '−3 + 7 = +4.' }
      ],
      step: `${atom('12x − 3 − 5x + 7 = 7x + 4')}.`
    },
    {
      exprHtml: '6(x + 2) − 4(2x + 3)', ansHtml: '−2x',
      wrongs: [
        { html: '−2x + 24', reason: '−4(+3) = −12, so 12 − 12 = 0.' },
        { html: '2x', reason: '6x − 8x = −2x.' },
        { html: '−2x + 15', reason: 'Multiply −4 by 3 to get −12.' }
      ],
      step: `${atom('6x + 12 − 8x − 12 = −2x')}.`
    },
    {
      exprHtml: `3x(2x − 5) − (4${pow('x', 2)} − 7x)`, ansHtml: `2${pow('x', 2)} − 8x`,
      wrongs: [
        { html: `2${pow('x', 2)} − 22x`, reason: 'Distribute −1 over −7x: −(−7x) = +7x, so −15x + 7x = −8x!' },
        { html: `10${pow('x', 2)} − 8x`, reason: `Subtract 4${pow('x', 2)} from 6${pow('x', 2)} to get 2${pow('x', 2)}.` },
        { html: `2${pow('x', 2)} − 12x`, reason: 'Multiply 3x by −5 to get −15x, then add +7x.' }
      ],
      step: `${atom(`6${pow('x', 2)} − 15x − 4${pow('x', 2)} + 7x = 2${pow('x', 2)} − 8x`)}.`
    },
    {
      exprHtml: '7x − [5 − 2(3x − 4)]', ansHtml: '13x − 13',
      wrongs: [
        { html: '13x + 3', reason: 'Inside brackets: 5 − 6x + 8 = 13 − 6x, then 7x − (13 − 6x) = 13x − 13.' },
        { html: 'x − 13', reason: 'Subtracting −6x adds 6x: 7x − (−6x) = 13x!' },
        { html: '13x − 3', reason: 'Distribute −2 to −4 (+8), add 5 (13), then negate (−13).' }
      ],
      step: `Simplify brackets: ${atom('5 − 6x + 8 = 13 − 6x')}. Then ${atom('7x − 13 + 6x = 13x − 13')}.`
    }
  ];

  simpItems.forEach((si, idx) => {
    list.push({
      id: makeId('expr', 1 + idx),
      topicId: 'expressions',
      taskType: 'SIMPLIFY EXPRESSION:',
      promptHtml: `Simplify completely: ${atom(si.exprHtml)}`,
      choices: [
        { html: atom(si.ansHtml), isCorrect: true, reason: '' },
        ...si.wrongs.map(w => ({ html: atom(w.html), isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Distribute to EVERY term inside parentheses (watch negative signs!).`,
        si.step
      ]
    });
  });

  // 11-18: Equivalent Expressions & Factoring GCF / Fractional Numerators (8 problems)
  const equivItems: Array<{
    promptHtml: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    steps: string[];
  }> = [
    {
      promptHtml: `Which expression is equivalent to ${atom(`${frac(1, 2)}(6x − 8) + 3`)}?`,
      ansHtml: atom('3x − 1'),
      wrongs: [
        { html: atom('3x + 4'), reason: `${frac(1, 2)}(−8) = −4, and −4 + 3 = −1, not +4.` },
        { html: atom('3x − 5'), reason: `Distribute ${frac(1, 2)} only to (6x − 8), not to +3.` },
        { html: atom(frac('6x + 4', 2)), reason: `${frac('6x + 4', 2)} simplifies to 3x + 2, not 3x − 1.` }
      ],
      steps: [
        `Distribute ${frac(1, 2)}: ${atom('3x − 4 + 3')}.`,
        `Combine constants: ${atom('3x − 1')}.`
      ]
    },
    {
      promptHtml: `Which expression is equivalent to ${atom(frac('12x − 18', 6))}?`,
      ansHtml: atom('2x − 3'),
      wrongs: [
        { html: atom('2x − 18'), reason: 'Divide BOTH terms in the numerator by 6, not just 12x!' },
        { html: atom('12x − 3'), reason: 'Divide 12x by 6 as well → 2x − 3.' },
        { html: atom('6x − 9'), reason: 'Divide by 6, not by 2.' }
      ],
      steps: [
        `Split the fraction: ${atom(`${frac('12x', 6)} − ${frac(18, 6)}`)}.`,
        `Simplify each term: ${atom('2x − 3')}.`
      ]
    },
    {
      promptHtml: `Factor out the greatest common factor (GCF) of ${atom('18x − 27y + 9')}:`,
      ansHtml: atom('9(2x − 3y + 1)'),
      wrongs: [
        { html: atom('9(2x − 3y)'), reason: '9 ÷ 9 = 1! Do not drop the +1 placeholder term.' },
        { html: atom('3(6x − 9y + 3)'), reason: '3 is a common factor, but the GREATEST common factor is 9.' },
        { html: atom('9(2x + 3y − 1)'), reason: 'Keep the original signs: −27y stays negative and +9 stays positive.' }
      ],
      steps: [
        `The GCF of 18, 27, and 9 is 9.`,
        `Divide each term by 9: ${atom('9(2x − 3y + 1)')}.`
      ]
    },
    {
      promptHtml: `Which expression is equivalent to ${atom(`${frac('8x + 4', 2)} + ${frac('9x − 6', 3)}`)}?`,
      ansHtml: atom('7x'),
      wrongs: [
        { html: atom('7x + 4'), reason: `${frac(4, 2)} = 2 and ${frac(-6, 3)} = −2, so 2 − 2 = 0!` },
        { html: atom('7x − 2'), reason: `Check both constant parts: +2 + (−2) = 0.` },
        { html: atom('17x − 2'), reason: 'Simplify each fraction BEFORE combining like terms.' }
      ],
      steps: [
        `Divide each numerator term: ${atom('(4x + 2) + (3x − 2)')}.`,
        `Combine like terms: ${atom('7x + 0 = 7x')}.`
      ]
    },
    {
      promptHtml: `Which expression is equivalent to ${atom(`4(3x − y) − 2(5x − 3y)`)}?`,
      ansHtml: atom('2x + 2y'),
      wrongs: [
        { html: atom('2x − 10y'), reason: 'Watch −2(−3y) = +6y, so −4y + 6y = +2y!' },
        { html: atom('2x − 2y'), reason: '−4y + 6y = +2y (positive).' },
        { html: atom('22x + 2y'), reason: '12x − 10x = 2x.' }
      ],
      steps: [
        `Distribute: ${atom('12x − 4y − 10x + 6y')}.`,
        `Combine like terms: ${atom('2x + 2y')}.`
      ]
    },
    {
      promptHtml: `Which expression is equivalent to ${atom(`−(7 − 4x) + 3(2x + 1)`)}?`,
      ansHtml: atom('10x − 4'),
      wrongs: [
        { html: atom('2x − 4'), reason: '−(−4x) = +4x, so 4x + 6x = 10x!' },
        { html: atom('10x − 10'), reason: '−7 + 3 = −4, not −10.' },
        { html: atom('10x + 10'), reason: 'The negative sign applies to +7 → −7.' }
      ],
      steps: [
        `Distribute negative & 3: ${atom('−7 + 4x + 6x + 3')}.`,
        `Combine: ${atom('10x − 4')}.`
      ]
    },
    {
      promptHtml: `Which expression is equivalent to ${atom(`${frac(5, 6)}(12x + 18) − 7x`)}?`,
      ansHtml: atom('3x + 15'),
      wrongs: [
        { html: atom('3x + 18'), reason: `Multiply 18 by ${frac(5, 6)} as well: ${frac(5, 6)}(18) = 15.` },
        { html: atom('17x + 15'), reason: '10x − 7x = 3x.' },
        { html: atom('3x − 15'), reason: `${frac(5, 6)}(+18) is positive (+15).` }
      ],
      steps: [
        `Distribute ${frac(5, 6)}: ${atom('10x + 15 − 7x')}.`,
        `Combine x-terms: ${atom('3x + 15')}.`
      ]
    },
    {
      promptHtml: `Which expression is equivalent to ${atom(`2(x − 3) + 5 − 4(x − 1)`)}?`,
      ansHtml: atom('−2x + 3'),
      wrongs: [
        { html: atom('−2x − 5'), reason: '−4(−1) = +4, so −6 + 5 + 4 = +3!' },
        { html: atom('6x + 3'), reason: '2x − 4x = −2x.' },
        { html: atom('−2x − 1'), reason: 'Check constants: −6 + 5 + 4 = 3.' }
      ],
      steps: [
        `Distribute: ${atom('2x − 6 + 5 − 4x + 4')}.`,
        `Combine: ${atom('−2x + 3')}.`
      ]
    }
  ];

  equivItems.forEach((eq, idx) => {
    list.push({
      id: makeId('expr', 11 + idx),
      topicId: 'expressions',
      taskType: 'EQUIVALENT EXPRESSIONS:',
      promptHtml: eq.promptHtml,
      choices: [
        { html: eq.ansHtml, isCorrect: true, reason: '' },
        ...eq.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: eq.steps
    });
  });

  // 19-24: Translating & Interpreting Real-World Expressions (6 problems)
  const wordExprItems: Array<{
    promptHtml: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    steps: string[];
    isLong?: boolean;
  }> = [
    {
      promptHtml: `A jacket with regular price ${atom('p')} is on sale for <b>25% off</b>. Which expression represents the sale price?`,
      ansHtml: atom('0.75p'),
      wrongs: [
        { html: atom('0.25p'), reason: '0.25p is only the discount amount; subtract p − 0.25p = 0.75p for the sale price!' },
        { html: atom('1.25p'), reason: '1.25p adds 25% (a markup/tax) instead of subtracting 25%.' },
        { html: atom('p − 25'), reason: '25% of p is 0.25p, not a flat $25.' }
      ],
      steps: [
        `25% off means you pay 100% − 25% = 75% of p.`,
        `${atom('p − 0.25p = 0.75p')}.`
      ]
    },
    {
      promptHtml: `A meal costs ${atom('m')} dollars before an <b>8% sales tax</b>. Which expression represents the total cost with tax?`,
      ansHtml: atom('1.08m'),
      wrongs: [
        { html: atom('0.08m'), reason: '0.08m is ONLY the tax; include the meal cost m + 0.08m = 1.08m.' },
        { html: atom('1.8m'), reason: '8% is 0.08, not 0.80!' },
        { html: atom('m + 8'), reason: '8% of m is 0.08m, not $8.' }
      ],
      steps: [
        `Total = original meal + 8% tax = ${atom('1m + 0.08m')}.`,
        `Combine like terms: ${atom('1.08m')}.`
      ]
    },
    {
      promptHtml: `A rectangle has length ${atom('2w + 5')} and width ${atom('w − 1')}. Write a simplified expression for its <b>perimeter</b>.`,
      ansHtml: atom('6w + 8'),
      wrongs: [
        { html: atom('3w + 4'), reason: '3w + 4 is only length + width (half the perimeter). Multiply by 2!' },
        { html: atom(`${2}${pow('w', 2)} + 3w − 5`), reason: 'That is the AREA (length × width), not the perimeter (sum of all 4 sides).' },
        { html: atom('6w + 9'), reason: '2(2w + 5) + 2(w − 1) = 4w + 10 + 2w − 2 = 6w + 8.' }
      ],
      steps: [
        `Perimeter P = 2L + 2W = ${atom('2(2w + 5) + 2(w − 1)')}.`,
        `Expand & combine: ${atom('4w + 10 + 2w − 2 = 6w + 8')}.`
      ]
    },
    {
      promptHtml: `In the expression ${atom('35 + 18h')} for a plumber's total bill after ${atom('h')} hours, what does the term ${atom('18h')} represent?`,
      ansHtml: 'The total labor charge for h hours at $18 per hour',
      wrongs: [
        { html: 'The flat trip fee charged before work starts', reason: 'The flat trip fee is the constant term 35.' },
        { html: 'The number of hours the plumber worked', reason: 'h alone is the hours; 18h is $18 × h (total hourly charge).' },
        { html: 'The total bill including the trip fee', reason: 'The total bill is the entire expression 35 + 18h.' }
      ],
      steps: [
        `35 is the constant service fee (when h = 0).`,
        `${atom('18h')} = ($18/hour) × (h hours) = total labor charge.`
      ],
      isLong: true
    },
    {
      promptHtml: `Translate into an algebraic expression: <b>"7 less than twice a number ${atom('n')}"</b>`,
      ansHtml: atom('2n − 7'),
      wrongs: [
        { html: atom('7 − 2n'), reason: '"7 less than X" means X − 7 (reverse the subtraction order!).' },
        { html: atom('2(n − 7)'), reason: '"Twice" applies only to n (2n), then subtract 7.' },
        { html: atom(`${pow('n', 2)} − 7`), reason: 'Twice n is 2n, whereas n squared is n².' }
      ],
      steps: [
        `"Twice a number n" → ${atom('2n')}.`,
        `"7 less than 2n" → ${atom('2n − 7')}.`
      ]
    },
    {
      promptHtml: `A streaming bundle costs $12 per month plus a $15 activation fee, with a <b>$5 coupon</b> applied once. Which expression gives the cost for ${atom('m')} months?`,
      ansHtml: atom('12m + 10'),
      wrongs: [
        { html: atom('12m + 20'), reason: 'A coupon SUBTRACTS $5 from the $15 fee: 15 − 5 = 10.' },
        { html: atom('7m + 15'), reason: 'The $5 coupon applies once, not every month!' },
        { html: atom('22m'), reason: '10 is a constant fee and cannot combine with 12m.' }
      ],
      steps: [
        `Monthly cost: ${atom('12m')}. One-time fees after coupon: ${atom('15 − 5 = 10')}.`,
        `Expression: ${atom('12m + 10')}.`
      ]
    }
  ];

  wordExprItems.forEach((we, idx) => {
    list.push({
      id: makeId('expr', 19 + idx),
      topicId: 'expressions',
      taskType: 'CONTEXT & TRANSLATE EXPRESSIONS:',
      promptHtml: we.promptHtml,
      choices: [
        { html: we.ansHtml, isCorrect: true, reason: '' },
        ...we.wrongs.map(w => ({ html: w.html, isCorrect: false, reason: w.reason }))
      ],
      steps: we.steps,
      isLongChoice: we.isLong
    });
  });

  // 25-30: Evaluating Algebraic Expressions (negatives, powers & vertical fractions) (6 problems)
  const evalExprItems: Array<{
    exprHtml: string;
    valsHtml: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      exprHtml: `2${pow('x', 2)} − 5x + 3`, valsHtml: atom('x = −2'),
      ansHtml: '21',
      wrongs: [
        { html: '1', reason: 'Wrap (−2) in parentheses: (−2)² = +4 and −5(−2) = +10 → 8 + 10 + 3 = 21!' },
        { html: '−15', reason: 'Squaring −2 gives +4 (positive), so 2(4) = +8.' },
        { html: '15', reason: 'Add +3 at the end: 8 + 10 + 3 = 21.' }
      ],
      step: `${atom('2(−2)² − 5(−2) + 3 = 2(4) + 10 + 3 = 21')}.`
    },
    {
      exprHtml: frac('3a − 2b', 4), valsHtml: `${atom('a = 6')} and ${atom('b = −1')}`,
      ansHtml: '5',
      wrongs: [
        { html: '4', reason: 'Watch −2(−1) = +2! Numerator is 18 + 2 = 20, and 20 ÷ 4 = 5.' },
        { html: frac(9, 2), reason: 'Multiply 2(−1) = −2, then subtract: 18 − (−2) = 20.' },
        { html: '20', reason: 'Do not forget to divide by 4 at the end!' }
      ],
      step: `Substitute: ${atom(`${frac('3(6) − 2(−1)', 4)} = ${frac('18 + 2', 4)} = ${frac(20, 4)} = 5`)}.`
    },
    {
      exprHtml: `−${pow('x', 2)} + 4y`, valsHtml: `${atom('x = −3')} and ${atom('y = 5')}`,
      ansHtml: '11',
      wrongs: [
        { html: '29', reason: 'Order of operations: evaluate (−3)² = 9 first, then apply the front negative: −9 + 20 = 11!' },
        { html: '14', reason: 'Square −3 to get 9 (not 6), then −9 + 20 = 11.' },
        { html: '−11', reason: '20 is larger than 9, so −9 + 20 = +11.' }
      ],
      step: `${atom('−(−3)² + 4(5) = −9 + 20 = 11')}.`
    },
    {
      exprHtml: `${frac(3, 4)}(8x − 4) + 7`, valsHtml: atom('x = 2'),
      ansHtml: '16',
      wrongs: [
        { html: '12', reason: '8(2) − 4 = 12, then ¾(12) = 9, and 9 + 7 = 16!' },
        { html: '19', reason: 'Subtract 4 inside parentheses BEFORE multiplying by ¾.' },
        { html: '9', reason: 'Add the +7 outside the parentheses: 9 + 7 = 16.' }
      ],
      step: `${atom(`${frac(3, 4)}(16 − 4) + 7 = ${frac(3, 4)}(12) + 7 = 9 + 7 = 16`)}.`
    },
    {
      exprHtml: `|2x − 9| + 3x`, valsHtml: atom('x = 1'),
      ansHtml: '10',
      wrongs: [
        { html: '−4', reason: 'Absolute value makes |2(1) − 9| = |−7| = +7, so 7 + 3 = 10!' },
        { html: '14', reason: '2(1) − 9 = −7, whose absolute value is 7 (not 11).' },
        { html: '4', reason: 'Remember 3x = 3(1) = 3, added to +7.' }
      ],
      step: `${atom('|2(1) − 9| + 3(1) = |−7| + 3 = 7 + 3 = 10')}.`
    },
    {
      exprHtml: `${frac('2x + 1', 'x − 1')}`, valsHtml: atom('x = 4'),
      ansHtml: '3',
      wrongs: [
        { html: frac(7, 3), reason: 'Numerator is 2(4) + 1 = 9, not 7!' },
        { html: frac(9, 5), reason: 'Denominator is 4 − 1 = 3, not 4 + 1.' },
        { html: '9', reason: 'Divide 9 by (4 − 1) = 3 to get 3.' }
      ],
      step: `Substitute x = 4: ${atom(`${frac('2(4) + 1', '4 − 1')} = ${frac(9, 3)} = 3`)}.`
    }
  ];

  evalExprItems.forEach((ev, idx) => {
    list.push({
      id: makeId('expr', 25 + idx),
      topicId: 'expressions',
      taskType: 'EVALUATE EXPRESSION:',
      promptHtml: `Evaluate ${atom(ev.exprHtml)} when ${ev.valsHtml}.`,
      choices: [
        { html: atom(ev.ansHtml), isCorrect: true, reason: '' },
        ...ev.wrongs.map(w => ({ html: atom(w.html), isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Wrap negative substitutions in parentheses and follow PEMDAS.`,
        ev.step
      ]
    });
  });

  return list;
}

// ============================================================================
// TOPIC 11: EQUATIONS AND INEQUALITIES (30 PROBLEMS)
// ============================================================================
function buildEquationsInequalitiesProblems(): OstProblem[] {
  const list: OstProblem[] = [];

  // 1-7: Exact OST Playbook Pages 33-34 equations & error-analysis tables (7 problems)
  list.push({
    id: makeId('eqin', 1),
    topicId: 'equations_inequalities',
    taskType: 'SOLVE MULTI-STEP EQUATION:',
    promptHtml: `What is the solution to ${atom('12(x + 5) = 4x')}?`,
    choices: [
      { html: atom(`x = −${frac(15, 2)}`), isCorrect: true, reason: '' },
      { html: atom(`x = ${frac(15, 2)}`), isCorrect: false, reason: `12x + 60 = 4x → 8x = −60 → x = −${frac(60, 8)} = −${frac(15, 2)} (negative!).` },
      { html: atom(`x = −${frac(5, 8)}`), isCorrect: false, reason: 'Distribute 12 to BOTH x and 5 (12 × 5 = 60, not 5).' },
      { html: atom('x = −4'), isCorrect: false, reason: 'Check: 12(−4 + 5) = 12, while 4(−4) = −16.' }
    ],
    steps: [
      `Distribute 12: ${atom('12x + 60 = 4x')}.`,
      `Subtract 12x: ${atom('60 = −8x')} → ${atom(`x = −${frac(60, 8)} = −${frac(15, 2)}`)}.`
    ]
  });

  list.push({
    id: makeId('eqin', 2),
    topicId: 'equations_inequalities',
    taskType: 'SOLVE EQUATION WITH FRACTION:',
    promptHtml: `What is the solution to ${atom(`3x + 4 − ${frac('x', 2)} = 19`)}?`,
    choices: [
      { html: atom('x = 6'), isCorrect: true, reason: '' },
      { html: atom('x = 10'), isCorrect: false, reason: `Combine 3x − ${frac(1, 2)}x = ${frac(5, 2)}x, then ${frac(5, 2)}x = 15 → x = 6.` },
      { html: atom('x = 5'), isCorrect: false, reason: '3(5) + 4 − 2.5 = 16.5 ≠ 19.' },
      { html: atom('x = 9'), isCorrect: false, reason: `Check: 3(6) + 4 − ${frac(6, 2)} = 18 + 4 − 3 = 19.` }
    ],
    steps: [
      `Subtract 4: ${atom(`3x − ${frac('x', 2)} = 15`)}. Multiply all terms by 2: ${atom('6x − x = 30')}.`,
      `${atom('5x = 30')} → ${atom('x = 6')}.`
    ]
  });

  list.push({
    id: makeId('eqin', 3),
    topicId: 'equations_inequalities',
    taskType: 'SPOT THE ERROR & SOLVE (STUDENT WORK):',
    promptHtml: `A student solved ${atom('4x + 5 = 31 − (x − 4)')} as shown. In which step did the student make an error, and what is the <b>correct solution</b>?`,
    visualTitle: 'STUDENT WORK',
    visualHtml: htmlTable(['Step', 'Equation'], [
      ['Given', atom('4x + 5 = 31 − (x − 4)')],
      ['Step 1', atom('4x + 5 = 31 − x − 4')],
      ['Step 2', atom('4x + x = 31 − 4 − 5')],
      ['Step 3', atom('5x = 22')],
      ['Step 4', atom('x = 4.4')]
    ]),
    choices: [
      { html: `Step 1 error; correct ${atom('x = 6')}`, isCorrect: true, reason: '' },
      { html: `Step 2 error; correct ${atom('x = 6')}`, isCorrect: false, reason: 'The error already happened in Step 1: −(x − 4) should become −x + 4, not −x − 4!' },
      { html: `Step 1 error; correct ${atom('x = 4.4')}`, isCorrect: false, reason: 'Fixing −(x − 4) to −x + 4 gives 5x = 30 → x = 6.' },
      { html: `Step 3 error; correct ${atom('x = 7')}`, isCorrect: false, reason: '31 + 4 − 5 = 30, and 30 ÷ 5 = 6.' }
    ],
    steps: [
      `In Step 1, distributing the negative over (x − 4) gives ${atom('31 − x + 4')}, NOT ${atom('31 − x − 4')}.`,
      `Correct work: ${atom('4x + 5 = 35 − x')} → ${atom('5x = 30')} → ${atom('x = 6')}.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('eqin', 4),
    topicId: 'equations_inequalities',
    taskType: 'SPOT THE ERROR (ELEANOR):',
    promptHtml: `Eleanor solved ${atom(`${frac(1, 2)}(x + 18) = 4(2x − 6) − 9x`)}. In which step did Eleanor make her <b>first error</b>?`,
    visualTitle: "ELEANOR'S WORK",
    visualHtml: htmlTable(['Step', 'Equation'], [
      ['Given', atom(`${frac(1, 2)}(x + 18) = 4(2x − 6) − 9x`)],
      ['Step 1', atom('x + 18 = 8(2x − 6) − 9x')],
      ['Step 2', atom('x + 18 = 16x − 48 − 9x')],
      ['Step 3', atom('x + 18 = 7x − 48')],
      ['Step 4', atom('66 = 6x')]
    ]),
    choices: [
      { html: 'Step 1 — forgot to multiply −9x by 2', isCorrect: true, reason: '' },
      { html: 'Step 2 — distributed 8 incorrectly', isCorrect: false, reason: '8(2x − 6) = 16x − 48 is correct from Step 1, so the first mistake was in Step 1.' },
      { html: 'Step 3 — combined 16x − 9x incorrectly', isCorrect: false, reason: '16x − 9x = 7x is correct.' },
      { html: 'Step 4 — subtracted x incorrectly', isCorrect: false, reason: '18 + 48 = 66 and 7x − x = 6x are algebraically valid from Step 3.' }
    ],
    steps: [
      `To clear ${frac(1, 2)} in Step 1, Eleanor multiplied the left side and 4(2x − 6) by 2, but forgot to multiply −9x by 2!`,
      `Corrected Step 1: ${atom('x + 18 = 8(2x − 6) − 18x')}.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('eqin', 5),
    topicId: 'equations_inequalities',
    taskType: 'CORRECT SOLUTION (ELEANOR):',
    promptHtml: `What is the <b>correct solution</b> to Eleanor's equation ${atom(`${frac(1, 2)}(x + 18) = 4(2x − 6) − 9x`)}?`,
    choices: [
      { html: atom('x = −22'), isCorrect: true, reason: '' },
      { html: atom('x = 11'), isCorrect: false, reason: 'x = 11 was Eleanor’s wrong answer from forgetting to multiply −9x by 2.' },
      { html: atom('x = 22'), isCorrect: false, reason: '3x = −66 gives x = −22, negative.' },
      { html: atom('x = −11'), isCorrect: false, reason: 'Check: ½(−22 + 18) = −2, and 4(−44 − 6) − 9(−22) = −200 + 198 = −2 ✓.' }
    ],
    steps: [
      `Multiply ALL terms by 2: ${atom('x + 18 = 8(2x − 6) − 18x = 16x − 48 − 18x')}.`,
      `Simplify right side: ${atom('x + 18 = −2x − 48')} → ${atom('3x = −66')} → ${atom('x = −22')}.`
    ]
  });

  list.push({
    id: makeId('eqin', 6),
    topicId: 'equations_inequalities',
    taskType: 'SPOT THE ERROR & SOLVE (FRED):',
    promptHtml: `Fred solved ${atom('8(3x − 7) = −6(x + 7) + 4')}. Where is Fred's error, and what is the <b>correct solution</b>?`,
    visualTitle: "FRED'S WORK",
    visualHtml: htmlTable(['Step', 'Equation'], [
      ['Given', atom('8(3x − 7) = −6(x + 7) + 4')],
      ['Step 1', atom('24x − 56 = −6x − 42 + 4')],
      ['Step 2', atom('24x − 56 = −6x + 46')],
      ['Step 3', atom('30x = 102')],
      ['Step 4', atom(`x = ${frac(17, 5)}`)]
    ]),
    choices: [
      { html: `Step 2 error; correct ${atom(`x = ${frac(3, 5)}`)}`, isCorrect: true, reason: '' },
      { html: `Step 1 error; correct ${atom(`x = ${frac(3, 5)}`)}`, isCorrect: false, reason: 'Step 1 (−6x − 42 + 4) is right; Step 2 added −42 + 4 to get +46 instead of −38!' },
      { html: `Step 2 error; correct ${atom(`x = ${frac(17, 5)}`)}`, isCorrect: false, reason: `Fixing Step 2 to −6x − 38 gives 30x = 18 → x = ${frac(3, 5)}.` },
      { html: `Step 3 error; correct ${atom('x = 3')}`, isCorrect: false, reason: `−38 + 56 = 18, and ${frac(18, 30)} = ${frac(3, 5)}.` }
    ],
    steps: [
      `In Step 2, ${atom('−42 + 4 = −38')}, NOT +46!`,
      `Correct: ${atom('24x − 56 = −6x − 38')} → ${atom('30x = 18')} → ${atom(`x = ${frac(18, 30)} = ${frac(3, 5)}`)}.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('eqin', 7),
    topicId: 'equations_inequalities',
    taskType: 'SPOT THE ERROR & SOLVE (TIA):',
    promptHtml: `Tia solved ${atom(`${frac(1, 3)}(10x − 15) = 5x + 20`)}. Where did Tia make her first error, and what is the <b>correct solution</b>?`,
    visualTitle: "TIA'S WORK",
    visualHtml: htmlTable(['Step', 'Equation'], [
      ['Given', atom(`${frac(1, 3)}(10x − 15) = 5x + 20`)],
      ['Step 1', atom('10x − 15 = 3(5x + 20)')],
      ['Step 2', atom('10x − 15 = 15x + 20')],
      ['Step 3', atom('−35 = 5x')],
      ['Step 4', atom('−7 = x')]
    ]),
    choices: [
      { html: `Step 2 error; correct ${atom('x = −15')}`, isCorrect: true, reason: '' },
      { html: `Step 1 error; correct ${atom('x = −15')}`, isCorrect: false, reason: 'Multiplying both sides by 3 in Step 1 is valid; Step 2 forgot to multiply 3 × 20 = 60!' },
      { html: `Step 2 error; correct ${atom('x = −7')}`, isCorrect: false, reason: 'Fixing 3(5x + 20) to 15x + 60 gives −75 = 5x → x = −15.' },
      { html: `Step 3 error; correct ${atom('x = 15')}`, isCorrect: false, reason: '−15 − 60 = −75, and −75 ÷ 5 = −15 (negative!).' }
    ],
    steps: [
      `In Step 2, Tia distributed 3 to 5x, but forgot to multiply 3 × 20 = 60!`,
      `Correct: ${atom('10x − 15 = 15x + 60')} → ${atom('−75 = 5x')} → ${atom('x = −15')}.`
    ],
    isLongChoice: true
  });

  // 8-17: Solving Multi-Step Equations (with fractions & distributions) (10 problems)
  const eqItems: Array<{
    eqHtml: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      eqHtml: '2(x + 3) + 4 = 10', ansHtml: 'x = 0',
      wrongs: [
        { html: 'x = 2', reason: '2x + 6 + 4 = 10 → 2x + 10 = 10 → 2x = 0 → x = 0.' },
        { html: 'x = 3', reason: '2(3 + 3) + 4 = 16 ≠ 10.' },
        { html: 'x = −2', reason: '2(−2 + 3) + 4 = 6 ≠ 10.' }
      ],
      step: `${atom('2x + 10 = 10')} → ${atom('2x = 0')} → ${atom('x = 0')}.`
    },
    {
      eqHtml: `${frac(3, 4)}x − 5 = ${frac(1, 2)}x + 1`, ansHtml: 'x = 24',
      wrongs: [
        { html: 'x = 12', reason: `(${frac(3, 4)} − ${frac(1, 2)})x = ${frac(1, 4)}x = 6 → x = 24.` },
        { html: 'x = 6', reason: `Divide 6 by ${frac(1, 4)} (multiply by 4) → 24.` },
        { html: 'x = −16', reason: 'Add 5 to 1 to get +6.' }
      ],
      step: `Multiply by 4: ${atom('3x − 20 = 2x + 4')} → ${atom('x = 24')}.`
    },
    {
      eqHtml: '5(x − 2) = 3(x + 4)', ansHtml: 'x = 11',
      wrongs: [
        { html: 'x = 1', reason: '5x − 10 = 3x + 12 → 2x = 22 → x = 11.' },
        { html: 'x = 7', reason: '5(7 − 2) = 25, while 3(7 + 4) = 33.' },
        { html: 'x = 22', reason: 'Divide 22 by 2 to get x = 11.' }
      ],
      step: `${atom('5x − 10 = 3x + 12')} → ${atom('2x = 22')} → ${atom('x = 11')}.`
    },
    {
      eqHtml: `${frac('2x − 5', 3)} = 7`, ansHtml: 'x = 13',
      wrongs: [
        { html: 'x = 8', reason: 'Multiply both sides by 3 first: 2x − 5 = 21 → 2x = 26 → x = 13.' },
        { html: 'x = 6', reason: '7 × 3 = 21, then add 5 (26), then divide by 2.' },
        { html: 'x = 26', reason: 'Do not forget to divide 26 by 2!' }
      ],
      step: `Multiply by 3: ${atom('2x − 5 = 21')} → ${atom('2x = 26')} → ${atom('x = 13')}.`
    },
    {
      eqHtml: '7x − (2x − 9) = 34', ansHtml: 'x = 5',
      wrongs: [
        { html: 'x = 8.6', reason: '−(2x − 9) = −2x + 9, NOT −2x − 9!' },
        { html: 'x = 3', reason: '5(3) + 9 = 24 ≠ 34.' },
        { html: 'x = 7', reason: '5x = 25 → x = 5.' }
      ],
      step: `Distribute negative: ${atom('7x − 2x + 9 = 34')} → ${atom('5x = 25')} → ${atom('x = 5')}.`
    },
    {
      eqHtml: `${frac(2, 5)}(10x − 15) = 14`, ansHtml: 'x = 5',
      wrongs: [
        { html: 'x = 2', reason: '4x − 6 = 14 → 4x = 20 → x = 5.' },
        { html: 'x = 4', reason: 'Add 6 to 14 (20), then divide by 4.' },
        { html: 'x = 7', reason: '4(7) − 6 = 22 ≠ 14.' }
      ],
      step: `Distribute ${frac(2, 5)}: ${atom('4x − 6 = 14')} → ${atom('4x = 20')} → ${atom('x = 5')}.`
    },
    {
      eqHtml: '4(3x + 1) − 2x = 24', ansHtml: 'x = 2',
      wrongs: [
        { html: 'x = 2.3', reason: '4(1) = +4, so 10x + 4 = 24 → 10x = 20 → x = 2.' },
        { html: 'x = 4', reason: '10(4) + 4 = 44 ≠ 24.' },
        { html: 'x = 3', reason: '10(3) + 4 = 34 ≠ 24.' }
      ],
      step: `${atom('12x + 4 − 2x = 24')} → ${atom('10x = 20')} → ${atom('x = 2')}.`
    },
    {
      eqHtml: `${frac(1, 3)}x + 7 = ${frac(5, 6)}x + 1`, ansHtml: 'x = 12',
      wrongs: [
        { html: 'x = 6', reason: 'Multiply by 6: 2x + 42 = 5x + 6 → 36 = 3x → x = 12.' },
        { html: 'x = 9', reason: `Check: ${frac(1, 3)}(12) + 7 = 11, and ${frac(5, 6)}(12) + 1 = 11.` },
        { html: 'x = 18', reason: '36 ÷ 3 = 12, not 18.' }
      ],
      step: `Multiply all terms by 6: ${atom('2x + 42 = 5x + 6')} → ${atom('36 = 3x')} → ${atom('x = 12')}.`
    },
    {
      eqHtml: '3(2x − 5) = 9x + 6', ansHtml: 'x = −7',
      wrongs: [
        { html: 'x = 7', reason: '6x − 15 = 9x + 6 → −21 = 3x → x = −7 (negative!).' },
        { html: 'x = −3', reason: '−15 − 6 = −21, and −21 ÷ 3 = −7.' },
        { html: 'x = −9', reason: 'Check: 3(−14 − 5) = −57, 9(−7) + 6 = −57.' }
      ],
      step: `${atom('6x − 15 = 9x + 6')} → ${atom('−21 = 3x')} → ${atom('x = −7')}.`
    },
    {
      eqHtml: `${frac('x + 4', 2)} + 3 = 11`, ansHtml: 'x = 12',
      wrongs: [
        { html: 'x = 18', reason: `Subtract 3 first: ${frac('x + 4', 2)} = 8 → x + 4 = 16 → x = 12.` },
        { html: 'x = 8', reason: 'Multiply 8 by 2 (16), then subtract 4 (12).' },
        { html: 'x = 20', reason: 'Subtract 4 from 16, do not add.' }
      ],
      step: `Subtract 3: ${atom(`${frac('x + 4', 2)} = 8`)} → ${atom('x + 4 = 16')} → ${atom('x = 12')}.`
    }
  ];

  eqItems.forEach((eq, idx) => {
    list.push({
      id: makeId('eqin', 8 + idx),
      topicId: 'equations_inequalities',
      taskType: 'SOLVE EQUATION:',
      promptHtml: `What is the solution to ${atom(eq.eqHtml)}?`,
      choices: [
        { html: atom(eq.ansHtml), isCorrect: true, reason: '' },
        ...eq.wrongs.map(w => ({ html: atom(w.html), isCorrect: false, reason: w.reason }))
      ],
      steps: [eq.step]
    });
  });

  // 18-21: Special Solution Counts & Literal Equations (4 problems)
  list.push({
    id: makeId('eqin', 18),
    topicId: 'equations_inequalities',
    taskType: 'EQUATION SOLUTIONS (IDENTITY / NONE):',
    promptHtml: `How many solutions does the equation ${atom('3(2x + 4) = 6x + 12')} have?`,
    choices: [
      { html: 'Infinitely many solutions (all real numbers)', isCorrect: true, reason: '' },
      { html: 'No solution', isCorrect: false, reason: 'Both sides simplify to 6x + 12 (identical!), which is true for every x.' },
      { html: `One solution: ${atom('x = 0')}`, isCorrect: false, reason: 'Since 6x + 12 = 6x + 12 simplifies to 12 = 12, EVERY x works!' },
      { html: `One solution: ${atom('x = 2')}`, isCorrect: false, reason: 'Both x = 0 and x = 2 (and any x) make 6x + 12 = 6x + 12 true.' }
    ],
    steps: [
      `Distribute left side: ${atom('6x + 12 = 6x + 12')}.`,
      `Subtract 6x: ${atom('12 = 12')} (always true) → infinitely many solutions.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('eqin', 19),
    topicId: 'equations_inequalities',
    taskType: 'EQUATION SOLUTIONS (IDENTITY / NONE):',
    promptHtml: `How many solutions does the equation ${atom('4(x − 2) + 5 = 4x + 1')} have?`,
    choices: [
      { html: 'No solution', isCorrect: true, reason: '' },
      { html: 'Infinitely many solutions', isCorrect: false, reason: '4x − 3 = 4x + 1 leaves −3 = 1, which is FALSE for all x!' },
      { html: `One solution: ${atom('x = 1')}`, isCorrect: false, reason: 'Left: 4(−1) + 5 = 1; Right: 4(1) + 1 = 5 (not equal!).' },
      { html: `One solution: ${atom('x = −3')}`, isCorrect: false, reason: 'Notice the 4x terms cancel out on both sides, leaving −3 = 1 (impossible).' }
    ],
    steps: [
      `Simplify left side: ${atom('4x − 8 + 5 = 4x − 3')}.`,
      `Subtract 4x from ${atom('4x − 3 = 4x + 1')}: ${atom('−3 = 1')} (false!) → no solution.`
    ],
    isLongChoice: true
  });

  list.push({
    id: makeId('eqin', 20),
    topicId: 'equations_inequalities',
    taskType: 'LITERAL EQUATION (SOLVE FOR A VARIABLE):',
    promptHtml: `The area of a triangle is ${atom(`A = ${frac(1, 2)}bh`)}. Which equation correctly solves the formula for ${atom('h')}?`,
    choices: [
      { html: atom(`h = ${frac('2A', 'b')}`), isCorrect: true, reason: '' },
      { html: atom(`h = ${frac('A', '2b')}`), reason: `Multiply both sides by 2 (NOT divide by 2!) to clear ${frac(1, 2)}.`, isCorrect: false },
      { html: atom('h = 2A − b'), reason: 'Since b multiplies h, undo multiplication by dividing by b (not subtracting b).', isCorrect: false },
      { html: atom(`h = ${frac('b', '2A')}`), reason: 'Isolate h by dividing 2A by b, not the other way around.', isCorrect: false }
    ],
    steps: [
      `Multiply both sides by 2: ${atom('2A = bh')}.`,
      `Divide both sides by b: ${atom(`h = ${frac('2A', 'b')}`)}.`
    ]
  });

  list.push({
    id: makeId('eqin', 21),
    topicId: 'equations_inequalities',
    taskType: 'LITERAL EQUATION (SOLVE FOR A VARIABLE):',
    promptHtml: `Solve the perimeter formula ${atom('P = 2L + 2W')} for ${atom('W')}.`,
    choices: [
      { html: atom(`W = ${frac('P − 2L', 2)}`), isCorrect: true, reason: '' },
      { html: atom(`W = ${frac('P', 2)} − 2L`), isCorrect: false, reason: 'Subtract 2L first, OR divide BOTH P and 2L by 2!' },
      { html: atom('W = P − L'), isCorrect: false, reason: 'Divide P by 2 as well: ½P − L.' },
      { html: atom(`W = ${frac('P + 2L', 2)}`), isCorrect: false, reason: 'Subtract 2L from P, do not add 2L.' }
    ],
    steps: [
      `Subtract 2L from both sides: ${atom('P − 2L = 2W')}.`,
      `Divide by 2: ${atom(`W = ${frac('P − 2L', 2)}`)}.`
    ]
  });

  // 22-30: Solving & Modeling Linear Inequalities (flipping sign on negative division + word problems!) (9 problems)
  const ineqItems: Array<{
    ineqHtml: string;
    ansHtml: string;
    wrongs: Array<{ html: string; reason: string }>;
    step: string;
  }> = [
    {
      ineqHtml: '−3x + 7 ≤ 22', ansHtml: 'x ≥ −5',
      wrongs: [
        { html: 'x ≤ −5', reason: 'Dividing by a NEGATIVE (−3) FLIPS the inequality sign from ≤ to ≥!' },
        { html: 'x ≥ 5', reason: '15 ÷ (−3) = −5, negative.' },
        { html: 'x ≤ 5', reason: 'Both sign of −5 and inequality direction need attention.' }
      ],
      step: `${atom('−3x ≤ 15')}. Divide by −3 (FLIP sign!): ${atom('x ≥ −5')}.`
    },
    {
      ineqHtml: '−2(x − 4) > 14', ansHtml: 'x < −3',
      wrongs: [
        { html: 'x > −3', reason: 'When dividing −2x > 6 by −2, FLIP > to <!' },
        { html: 'x < 3', reason: '−2x + 8 > 14 → −2x > 6 → x < −3.' },
        { html: 'x < −11', reason: '−2(−4) = +8, so subtract 8 from 14 to get 6.' }
      ],
      step: `Distribute: ${atom('−2x + 8 > 14')} → ${atom('−2x > 6')} → divide by −2 & flip → ${atom('x < −3')}.`
    },
    {
      ineqHtml: '5x − 9 ≥ 2x + 12', ansHtml: 'x ≥ 7',
      wrongs: [
        { html: 'x ≤ 7', reason: 'We divided by POSITIVE 3, so do NOT flip the inequality sign.' },
        { html: 'x ≥ 1', reason: 'Add 9 to 12 to get 21, not 3.' },
        { html: 'x ≥ 21', reason: 'Divide 21 by 3 to get 7.' }
      ],
      step: `${atom('3x ≥ 21')} → divide by +3 → ${atom('x ≥ 7')}.`
    },
    {
      ineqHtml: `−${frac(1, 2)}x + 6 < 10`, ansHtml: 'x > −8',
      wrongs: [
        { html: 'x < −8', reason: 'Multiplying by −2 FLIPS the inequality sign from < to >!' },
        { html: 'x > −2', reason: `4 ÷ (−${frac(1, 2)}) = 4 × (−2) = −8, not −2.` },
        { html: 'x > 8', reason: 'Multiplying +4 by −2 gives −8.' }
      ],
      step: `Subtract 6: ${atom(`−${frac(1, 2)}x < 4`)}. Multiply by −2 (FLIP!): ${atom('x > −8')}.`
    },
    {
      ineqHtml: '4(x − 3) ≤ 6x + 2', ansHtml: 'x ≥ −7',
      wrongs: [
        { html: 'x ≤ −7', reason: '−2x ≤ 14 divided by −2 FLIPS ≤ to ≥!' },
        { html: 'x ≥ 7', reason: '−12 − 2 = −14, and −2x ≤ 14 gives x ≥ −7.' },
        { html: 'x ≤ 7', reason: 'Check signs and flip when dividing by −2.' }
      ],
      step: `${atom('4x − 12 ≤ 6x + 2')} → ${atom('−2x ≤ 14')} → ${atom('x ≥ −7')}.`
    },
    {
      ineqHtml: '9 − 4x < 29', ansHtml: 'x > −5',
      wrongs: [
        { html: 'x < −5', reason: 'Dividing −4x < 20 by −4 FLIPS < to >!' },
        { html: 'x > 5', reason: '20 ÷ (−4) = −5.' },
        { html: 'x < 5', reason: 'Watch the negative on −4x.' }
      ],
      step: `Subtract 9: ${atom('−4x < 20')} → divide by −4 (FLIP!) → ${atom('x > −5')}.`
    },
    {
      ineqHtml: '3(x + 2) − 5x ≥ 14', ansHtml: 'x ≤ −4',
      wrongs: [
        { html: 'x ≥ −4', reason: '3x − 5x = −2x, and dividing −2x ≥ 8 by −2 FLIPS ≥ to ≤!' },
        { html: 'x ≤ 4', reason: '8 ÷ (−2) = −4 (negative!).' },
        { html: 'x ≤ −10', reason: 'Subtract 6 from 14 to get 8, not 20.' }
      ],
      step: `${atom('3x + 6 − 5x ≥ 14')} → ${atom('−2x ≥ 8')} → divide by −2 (FLIP!) → ${atom('x ≤ −4')}.`
    }
  ];

  ineqItems.forEach((iq, idx) => {
    list.push({
      id: makeId('eqin', 22 + idx),
      topicId: 'equations_inequalities',
      taskType: 'SOLVE INEQUALITY (WATCH SIGN FLIP):',
      promptHtml: `Solve the inequality: ${atom(iq.ineqHtml)}`,
      choices: [
        { html: atom(iq.ansHtml), isCorrect: true, reason: '' },
        ...iq.wrongs.map(w => ({ html: atom(w.html), isCorrect: false, reason: w.reason }))
      ],
      steps: [
        `Rule: Multiplying or dividing both sides by a NEGATIVE number flips the inequality symbol.`,
        iq.step
      ]
    });
  });

  // 29-30: Compound Inequality & Real-World Inequality Constraint (2 problems)
  list.push({
    id: makeId('eqin', 29),
    topicId: 'equations_inequalities',
    taskType: 'COMPOUND INEQUALITY:',
    promptHtml: `Solve the compound inequality: ${atom('−4 ≤ 2x + 6 < 12')}`,
    choices: [
      { html: atom('−5 ≤ x < 3'), isCorrect: true, reason: '' },
      { html: atom('−5 < x ≤ 3'), isCorrect: false, reason: 'Keep ≤ on the left (−4 ≤ ...) and < on the right (... < 12).' },
      { html: atom('1 ≤ x < 9'), isCorrect: false, reason: 'Subtract 6 from all three parts (−4 − 6 = −10 and 12 − 6 = 6), not add 6!' },
      { html: atom('−10 ≤ x < 6'), isCorrect: false, reason: 'Divide all three parts by 2 after subtracting 6!' }
    ],
    steps: [
      `Subtract 6 from all three parts: ${atom('−10 ≤ 2x < 6')}.`,
      `Divide by +2: ${atom('−5 ≤ x < 3')}.`
    ]
  });

  list.push({
    id: makeId('eqin', 30),
    topicId: 'equations_inequalities',
    taskType: 'INEQUALITY WORD PROBLEM:',
    promptHtml: `A gym charges a $15 registration fee plus $8 per class. Sam has <b>at most $75</b> to spend. Which inequality shows how many classes ${atom('c')} Sam can take?`,
    choices: [
      { html: atom('15 + 8c ≤ 75; c ≤ 7.5'), isCorrect: true, reason: '' },
      { html: atom('15 + 8c ≥ 75; c ≥ 7.5'), isCorrect: false, reason: '"At most $75" means no more than $75, which uses ≤, not ≥!' },
      { html: atom('15c + 8 ≤ 75; c ≤ 4.4'), isCorrect: false, reason: '$8 is per class (8c), while $15 is the one-time fee.' },
      { html: atom('15 + 8c < 75; c < 7.5'), isCorrect: false, reason: '"At most" allows spending all $75, so use ≤ (inclusive).' }
    ],
    steps: [
      `Set up total cost ≤ budget: ${atom('15 + 8c ≤ 75')}.`,
      `Solve: ${atom('8c ≤ 60')} → ${atom('c ≤ 7.5')} (so at most 7 full classes).`
    ],
    isLongChoice: true
  });

  return list;
}

export const TOPICS_PART_B: OstProblem[] = [
  ...buildExponentialProblems(),
  ...buildLinearPart1Problems(),
  ...buildLinearPart2Problems(),
  ...buildSystemsProblems(),
  ...buildExpressionsProblems(),
  ...buildEquationsInequalitiesProblems()
];

