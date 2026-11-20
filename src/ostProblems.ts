import { OstProblem, OstTopicMeta } from './mathFormat';
import { TOPICS_PART_A } from './topics/topicsA';
import { TOPICS_PART_B } from './topics/topicsB';

export const OST_TOPICS: OstTopicMeta[] = [
  {
    id: 'lazy_way',
    title: 'The Lazy Way Strategies',
    shortTitle: 'Lazy Way',
    sheetHeader: 'THE LAZY WAY STRATEGIES',
    badgeColor: '#fbbf24',
    description: 'Identify function types, back-solve equations, Desmos shortcuts, and match equivalent expressions.'
  },
  {
    id: 'data_analysis',
    title: 'Data Analysis (Box Whisker, Line of Best Fit, Data)',
    shortTitle: 'Data Analysis',
    sheetHeader: 'DATA ANALYSIS (BOX WHISKER, LINE OF BEST FIT, DATA, ETC...)',
    badgeColor: '#38bdf8',
    description: 'Box plots, IQR, dot plots, histograms, skewness, two-way frequency tables, and lines of best fit.'
  },
  {
    id: 'polynomials',
    title: 'All Things Polynomials',
    shortTitle: 'Polynomials',
    sheetHeader: 'ALL THINGS POLYNOMIALS',
    badgeColor: '#a78bfa',
    description: 'Add, subtract (flip signs!), multiply with the Box Method, and match F/G/H polynomial coefficients.'
  },
  {
    id: 'functions',
    title: 'Functions and Function Notations',
    shortTitle: 'Functions',
    sheetHeader: 'FUNCTIONS AND FUNCTION NOTATIONS',
    badgeColor: '#34d399',
    description: 'Vertical Line Test, domain/function relations, evaluating f(x) with fractions/exponents, and tables.'
  },
  {
    id: 'quadratics',
    title: 'Factoring, Solving, Modeling, Analyzing Quadratics',
    shortTitle: 'Quadratics',
    sheetHeader: 'FACTORING, SOLVING, MODELING, ANALYZING QUADRATICS',
    badgeColor: '#f59e0b',
    description: 'X-Method factoring, GCF + trinomials, finding zeros/roots, projectile motion, and vertex analysis.'
  },
  {
    id: 'exponential',
    title: 'Create, Analyze, Model Exponential Functions',
    shortTitle: 'Exponential',
    sheetHeader: 'CREATE, ANALYZE, MODEL EXPONENTIAL FUNCTIONS',
    badgeColor: '#10b981',
    description: 'Exponential growth (1 + r) vs decay (1 − r), initial value a, percent rates, and evaluating models.'
  },
  {
    id: 'linear_part1',
    title: 'Creating, Graphing, Modeling Linear (Part 1)',
    shortTitle: 'Linear Pt. 1',
    sheetHeader: 'CREATING, GRAPHING, MODELING LINEAR (PART 1)',
    badgeColor: '#22d3ee',
    description: 'Slope from graphs/tables, points on a line, x/y-intercepts, standard form, and equations from 2 points.'
  },
  {
    id: 'linear_part2',
    title: 'Creating, Graphing, Modeling Linear (Part 2)',
    shortTitle: 'Linear Pt. 2',
    sheetHeader: 'CREATING, GRAPHING, MODELING LINEAR (PART 2)',
    badgeColor: '#2dd4bf',
    description: 'Interpret slope, fixed fees, and intercepts in context; build slope-intercept & standard form models.'
  },
  {
    id: 'systems',
    title: 'Creating, Solving, Modeling Systems of Equations',
    shortTitle: 'Systems',
    sheetHeader: 'CREATING, SOLVING, MODELING SYSTEMS OF EQUATIONS',
    badgeColor: '#fb7185',
    description: 'Graph intersections, substitution/elimination, parallel vs same line, word problems, and inequality regions.'
  },
  {
    id: 'expressions',
    title: 'Expressions (Simplify, Equivalent, Evaluate)',
    shortTitle: 'Expressions',
    sheetHeader: 'EXPRESSIONS (SIMPLIFY, EQUIVALENT, EVALUATE)',
    badgeColor: '#f472b6',
    description: 'Distributive property, combining like terms, factoring GCF, translating phrases, and evaluating expressions.'
  },
  {
    id: 'equations_inequalities',
    title: 'Equations and Inequalities',
    shortTitle: 'Eq & Ineq',
    sheetHeader: 'EQUATIONS AND INEQUALITIES',
    badgeColor: '#fb923c',
    description: 'Spot student errors, clear fractions, multi-step equations, literal formulas, and sign-flip inequalities.'
  }
];

export const TOPIC_STRATEGY_TIPS: Record<string, { title: string; bullets: string[] }> = {
  lazy_way: {
    title: 'OST PLAYBOOK — LAZY WAY',
    bullets: [
      '<b>Back-Solve:</b> Plug each answer choice in for <span class="math-atom">x</span> to see which makes both sides equal.',
      '<b>Equivalent Expressions:</b> Graph the prompt and each choice in Desmos — equivalent ones overlap completely!',
      '<b>Spot Type:</b> Linear = per hour; Quadratic = <span class="math-atom">x<sup class="math-exp">2</sup></span>; Exponential = % rate / variable in exponent.'
    ]
  },
  data_analysis: {
    title: 'OST PLAYBOOK — DATA ANALYSIS',
    bullets: [
      '<b>5-Number Summary:</b> Box plots show ONLY Min, Q1, Median, Q3, Max (never Mean or Mode).',
      '<b>IQR &amp; Range:</b> IQR = Q3 − Q1 (box width); Range = Max − Min.',
      '<b>Skewness:</b> Outliers pull the Mean toward the tail; Median stays resistant.'
    ]
  },
  polynomials: {
    title: 'OST PLAYBOOK — POLYNOMIALS',
    bullets: [
      '<b>Subtracting:</b> Flip EVERY sign inside the second parentheses before combining like terms!',
      '<b>Box Method:</b> Draw a 2×2 grid so you never miss the middle cross-product terms.',
      '<b>Check with Desmos:</b> Graph the original and your choice to confirm identical curves.'
    ]
  },
  functions: {
    title: 'OST PLAYBOOK — FUNCTIONS',
    bullets: [
      '<b>Function Rule:</b> Each input <span class="math-atom">x</span> can pair with only ONE <span class="math-atom">y</span> (passes Vertical Line Test).',
      '<b>Evaluate <span class="math-atom">f(a)</span>:</b> Wrap negative inputs in parentheses, especially when squaring!',
      '<b>Negative Exponents:</b> <span class="math-atom">b<sup class="math-exp">−1</sup></span> flips to a fraction <span class="v-frac"><span class="v-frac-num">1</span><span class="v-frac-den">b</span></span>.'
    ]
  },
  quadratics: {
    title: 'OST PLAYBOOK — QUADRATICS',
    bullets: [
      '<b>Always Factor GCF First:</b> Pull out any shared factor before using the X-Method.',
      '<b>X-Method Divide Rule:</b> Always divide wings <span class="math-atom">m₁, m₂</span> by leading coefficient <span class="math-atom">a</span> and simplify!',
      '<b>Vertex / Intercepts:</b> Max/Min value is the <span class="math-atom">y</span>-coordinate of the vertex; landing height is <span class="math-atom">h(t) = 0</span>.'
    ]
  },
  exponential: {
    title: 'OST PLAYBOOK — EXPONENTIAL',
    bullets: [
      '<b>Form <span class="math-atom">y = a(b)<sup class="math-exp">x</sup></span>:</b> <span class="math-atom">a</span> is the initial amount; <span class="math-atom">b</span> is the multiplier.',
      '<b>Growth vs Decay:</b> Add <span class="math-atom">1 + r</span> for percent growth; subtract <span class="math-atom">1 − r</span> for decay!',
      '<b>Read Rate:</b> Compare base <span class="math-atom">b</span> to 1.00 (e.g., 1.08 → +8%, 0.85 → −15%).'
    ]
  },
  linear_part1: {
    title: 'OST PLAYBOOK — LINEAR PT. 1',
    bullets: [
      '<b>Slope:</b> Always <span class="v-frac"><span class="v-frac-num">Rise (Δy)</span><span class="v-frac-den">Run (Δx)</span></span> — vertical change over horizontal change.',
      '<b>x-Intercept:</b> Set <span class="math-atom">y = 0</span>. &nbsp;<b>y-Intercept:</b> Set <span class="math-atom">x = 0</span>.',
      '<b>Standard to Slope:</b> Isolate <span class="math-atom">y</span> in <span class="math-atom">Ax + By = C</span> to read slope and y-intercept.'
    ]
  },
  linear_part2: {
    title: 'OST PLAYBOOK — LINEAR PT. 2',
    bullets: [
      '<b>Slope-Intercept <span class="math-atom">y = mx + b</span>:</b> <span class="math-atom">m</span> is rate per unit; <span class="math-atom">b</span> is one-time starting fee.',
      '<b>Standard Form <span class="math-atom">Ax + By = C</span>:</b> Use when two items have different prices adding to a total.',
      '<b>Intercepts in Context:</b> <span class="math-atom">(x, 0)</span> means zero of <span class="math-atom">y</span> remains (empty / 0 left).'
    ]
  },
  systems: {
    title: 'OST PLAYBOOK — SYSTEMS',
    bullets: [
      '<b>Solution Count:</b> Crossing = 1 solution; Parallel (same slope) = 0; Same line = Infinite.',
      '<b>Inequalities:</b> <span class="math-atom">≤, ≥</span> use a SOLID line; <span class="math-atom">&lt;, &gt;</span> use a DOTTED line.',
      '<b>Word Problems:</b> Translate quantity equation and cost equation separately, then eliminate or graph.'
    ]
  },
  expressions: {
    title: 'OST PLAYBOOK — EXPRESSIONS',
    bullets: [
      '<b>Watch Minus Signs:</b> Distribute negatives to EVERY term inside parentheses (e.g., <span class="math-atom">−(x − 5) = −x + 5</span>).',
      '<b>Factor &amp; Combine:</b> Only combine like terms with identical variable powers; pull out the GCF to match equivalent forms.',
      '<b>Evaluate Safely:</b> Wrap negative substitutions in parentheses before squaring or multiplying.'
    ]
  },
  equations_inequalities: {
    title: 'OST PLAYBOOK — EQ &amp; INEQ',
    bullets: [
      '<b>Clear Fractions:</b> Multiply EVERY term on both sides by the common denominator.',
      '<b>Spot Errors:</b> Check each student step carefully for dropped signs or missed distributive terms.',
      '<b>Inequality Flip Rule:</b> Multiplying or dividing by a NEGATIVE number flips the inequality symbol!'
    ]
  }
};

export const OST_PROBLEMS: OstProblem[] = [...TOPICS_PART_A, ...TOPICS_PART_B];

// Non-repeating shuffled deck cache per topic filter ('all' or any topicId)
const deckQueues: Record<string, { order: number[]; cursor: number }> = {};

function buildShuffledIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getTopicProblems(topicId: string): OstProblem[] {
  if (topicId === 'all') return OST_PROBLEMS;
  const filtered = OST_PROBLEMS.filter(p => p.topicId === topicId);
  return filtered.length > 0 ? filtered : OST_PROBLEMS;
}

export function getTopicMeta(topicId: string): OstTopicMeta {
  if (topicId === 'all') {
    return {
      id: 'all',
      title: 'All 11 OST Playbook Topics (330 Mixed)',
      shortTitle: 'All 330 Mixed',
      sheetHeader: 'ALL 11 OST PLAYBOOK TOPICS (330 QUESTIONS)',
      badgeColor: '#fbbf24',
      description: 'Full Algebra 1 OST Playbook mix drawn randomly without repeats across all 330 problems.'
    };
  }
  return OST_TOPICS.find(t => t.id === topicId) || OST_TOPICS[0];
}

export function drawOstProblem(topicId: string): {
  problem: OstProblem;
  topicMeta: OstTopicMeta;
  questionNumber: number;
  totalInDeck: number;
} {
  const pool = getTopicProblems(topicId);
  let state = deckQueues[topicId];
  if (!state || state.order.length !== pool.length || state.cursor >= state.order.length) {
    state = { order: buildShuffledIndices(pool.length), cursor: 0 };
    deckQueues[topicId] = state;
  }
  const idx = state.order[state.cursor];
  state.cursor += 1;
  const base = pool[idx];

  // Clone & shuffle choices cleanly without mutating master bank
  const shuffledChoices = [...base.choices];
  for (let i = shuffledChoices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
  }

  return {
    problem: { ...base, choices: shuffledChoices },
    topicMeta: OST_TOPICS.find(t => t.id === base.topicId) || getTopicMeta(topicId),
    questionNumber: state.cursor,
    totalInDeck: pool.length
  };
}
