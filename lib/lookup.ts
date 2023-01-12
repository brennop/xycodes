import { createNoise3D } from "simplex-noise"

const noise = createNoise3D();

export type Expr = string | [string, ...Expr[]]

type Op = {
  fn: (stack: number[], data: { x: number, y: number, t: number, i: number }) => number[];
  decode: (stack: Expr[]) => Expr[];
  description: string;
}

const lookup: Record<string, Op> = {
  "+": {
    fn: ([a, b, ...s]) => [b + a, ...s],
    decode: ([a, b, ...s]) => [["+", b, a], ...s],
    description: "a + b"
  },
  "-": {
    fn: ([a, b, ...s]) => [b - a, ...s],
    decode: ([a, b, ...s]) => [["-", b, a], ...s],
    description: "a - b"
  },
  "*": {
    fn: ([a, b, ...s]) => [b * a, ...s],
    decode: ([a, b, ...s]) => [["*", b, a], ...s],
    description: "a * b"
  },
  "/": {
    fn: ([a, b, ...s]) => [b / a, ...s],
    decode: ([a, b, ...s]) => [["/", b, a], ...s],
    description: "a / b"
  },
  "&": {
    fn: ([a, b, ...s]) => [b & a, ...s],
    decode: ([a, b, ...s]) => [["&", b, a], ...s],
    description: "a & b"
  },
  "|": {
    fn: ([a, b, ...s]) => [b | a, ...s],
    decode: ([a, b, ...s]) => [["|", b, a], ...s],
    description: "a | b"
  },
  "^": {
    fn: ([a, b, ...s]) => [b ^ a, ...s],
    decode: ([a, b, ...s]) => [["^", b, a], ...s],
    description: "a ^ b"
  },
  "%": {
    fn: ([a, b, ...s]) => [b % a, ...s],
    decode: ([a, b, ...s]) => [["%", b, a], ...s],
    description: "a % b"
  },
  "~": {
    fn: ([a, ...s]) => [~a, ...s],
    decode: ([a, ...s]) => [["~", a], ...s],
    description: "~a"
  },
  "²": {
    fn: ([a, ...s]) => [a * a, ...s],
    decode: ([a, ...s]) => [["²", a], ...s],
    description: "a²"
  },
  "³": {
    fn: ([a, ...s]) => [a * a * a, ...s],
    decode: ([a, ...s]) => [["³", a], ...s],
    description: "a³",
  },
  "½": {
    fn: ([a, ...s]) => [a / 2, ...s],
    decode: ([a, ...s]) => [["½", a], ...s],
    description: "a / 2",
  },
  "!": {
    fn: ([a, ...s]) => [Number(!a), ...s],
    decode: ([a, ...s]) => [["!", a], ...s],
    description: "!a",
  },
  "?": {
    fn: ([a, b, c, ...s]) => [a ? b : c, ...s],
    decode: ([a, b, c, ...s]) => [["?", c, b, a], ...s],
    description: "a ? b : c",
  },
  "<": {
    fn: ([a, b, ...s]) => [Number(b < a), ...s],
    decode: ([a, b, ...s]) => [["<", b, a], ...s],
    description: "b < a",
  },
  "$": { // cubic Hermit interpolation
    fn: ([b, a, ...s]) => {
      const lowerBound = 0x0;
      const upperBound = b;
      if (a < lowerBound) return [lowerBound, ...s];
      if (a > upperBound) return [upperBound, ...s];
      const x = (a - lowerBound) / (upperBound - lowerBound);
      return [x * x * (3 - 2 * x), ...s];
    },
    decode: ([a, b, ...s]) => [["$", b, a], ...s],
    description: "smoothstep(a, 0, 16)",
  },

  ".": {
    fn: (s) => [s.slice(s.length / 2).reduce((a, n, i) => a + n * s[i], 0)],
    decode: (s) => [[".", ...s.reverse()]],
    description: "dot product",
  },

  a: {
    fn: (s) => [10, ...s],
    decode: (s) => [["a"], ...s],
    description: "10",
  },
  b: {
    fn: (s) => [11, ...s],
    decode: (s) => [["b"], ...s],
    description: "11",
  },
  c: {
    fn: (s) => [12, ...s],
    decode: (s) => [["c"], ...s],
    description: "12",
  },
  d: {
    fn: (s) => [13, ...s],
    decode: (s) => [["d"], ...s],
    description: "13",
  },
  e: {
    fn: (s) => [14, ...s],
    decode: (s) => [["e"], ...s],
    description: "14",
  },
  f: {
    fn: (s) => [15, ...s],
    decode: (s) => [["f"], ...s],
    description: "15",
  },
  g: {
    fn: ([a, ...s]) => [a / 8, ...s],
    decode: ([a, ...s]) => [["g", a], ...s],
    description: "a / 8",
  },
  h: {
    fn: ([a, ...s]) => [a / 2, ...s],
    decode: ([a, ...s]) => [["h", a], ...s],
    description: "a / 2",
  },
  i: {
    fn: ([...s], { i }) => [i, ...s],
    decode: ([...s]) => ["i", ...s],
    description: "i (index)",
  },
  j: {
    fn: ([a, ...s]) => [a - 8, ...s],
    decode: ([a, ...s]) => [["j", a], ...s],
    description: "a - 8",
  },
  k: {
    fn: ([a, ...s]) => [a - 16, ...s],
    decode: ([a, ...s]) => [["k", a], ...s],
    description: "a - 16",
  },
  l: {
    fn: ([a, ...s]) => [a - 24, ...s],
    decode: ([a, ...s]) => [["l", a], ...s],
    description: "a - 24",
  },
  m: {
    fn: ([a, ...s], { t }) => [a + t, ...s],
    decode: ([a, ...s]) => [["m", a], ...s],
    description: "a + t",
  },
  n: {
    fn: ([a, ...s]) => [-a, ...s],
    decode: ([a, ...s]) => [["n", a], ...s],
    description: "-a",
  },
  o: {
    fn: (s) => [16, ...s],
    decode: (s) => [["o"], ...s],
    description: "16",
  },
  p: {
    fn: ([...s]) => [Math.PI, ...s],
    decode: (s) => [["p"], ...s],
    description: "π",
  },
  q: {
    fn: ([a, ...s]) => [a / 4, ...s],
    decode: ([a, ...s]) => [["q", a], ...s],
    description: "a / 4",
  },
  r: {
    fn: (s) => s.reverse(),
    decode: (s) => [["r", ...s]],
    description: "reverse",
  },
  s: {
    fn: ([a, b, ...s]) => [b, a, ...s],
    decode: ([a, b, ...s]) => [b, a, ...s],
    description: "swap",
  },
  t: {
    fn: ([...s], { t }) => [t, ...s],
    decode: ([...s]) => ["t", ...s],
    description: "t (time)",
  },
  u: {
    fn: ([a, ...s]) => [a - 1, ...s],
    decode: ([a, ...s]) => [["u", a], ...s],
    description: "a  - 1",
  },
  v: {
    fn: ([a, ...s]) => [a * 4, ...s],
    decode: ([a, ...s]) => [["v", a], ...s],
    description: "a * 4",
  },
  w: {
    fn: ([a, ...s]) => [a * 2, ...s],
    decode: ([a, ...s]) => [["w", a], ...s],
    description: "a * 2",
  },
  x: {
    fn: ([...s], { x }) => [x, ...s],
    decode: ([...s]) => ["x", ...s],
    description: "x (x position)",
  },
  y: {
    fn: ([...s], { y }) => [y, ...s],
    decode: ([...s]) => ["y", ...s],
    description: "y (y position)",
  },
  z: {
    fn: ([a, b, c, ...s]) => [noise(c || 0, b || 0, a), ...s],
    decode: ([a, b, c, ...s]) => [["z", c, b, a], ...s],
    description: "noise(a, b)",
  },
  A: {
    fn: ([a, ...s]) => [Math.abs(a), ...s],
    decode: ([a, ...s]) => [["A", a], ...s],
    description: "abs(a)",
  },
  B: {
    fn: (s) => [64, ...s],
    decode: (s) => [["B"], ...s],
    description: "64 (big)",
  },
  C: {
    fn: ([a, ...s]) => [Math.cos(a), ...s],
    decode: ([a, ...s]) => [["C", a], ...s],
    description: "cos(a)",
  },
  D: {
    fn: ([a, ...s]) => [a, a, ...s],
    decode: ([a, ...s]) => [a, a, ...s],
    description: "[a] -> [a a]",
  },
  E: {
    fn: ([a, ...s]) => [Math.exp(a), ...s],
    decode: ([a, ...s]) => [["E", a], ...s],
    description: "exp(a)",
  },
  F: {
    fn: ([a, ...s]) => [Math.floor(a), ...s],
    decode: ([a, ...s]) => [["F", a], ...s],
    description: "floor(a)",
  },
  G: {
    fn: ([a, ...s]) => [Math.log(a), ...s],
    decode: ([a, ...s]) => [["G", a], ...s],
    description: "log(a)",
  },
  H: {
    fn: ([a, b, ...s]) => [Math.hypot(a, b), ...s],
    decode: ([a, b, ...s]) => [["H", b, a], ...s],
    description: "hypot(a, b)",
  },
  I: {
    fn: ([a, ...s]) => [1 / a, ...s],
    decode: ([a, ...s]) => [["I", a], ...s],
    description: "1 / a",
  },
  J: {
    fn: ([a, ...s]) => [1 + a, ...s],
    decode: ([a, ...s]) => [["J", a], ...s],
    description: "1 + a",
  },
  K: {
    fn: ([a, b, ...s]) => [Math.atan2(a, b), ...s],
    decode: ([a, b, ...s]) => [["K", a, b], ...s],
    description: "atan2(a, b)",
  },
  L: {
    fn: ([...s]) => [128, ...s],
    decode: (s) => [["L"], ...s],
    description: "128 (large)",
  },
  M: {
    fn: ([a, ...s]) => [Math.max(a, 0), ...s],
    decode: ([a, ...s]) => [["M", a], ...s],
    description: "max(a, 0)",
  },
  N: {
    fn: ([a, ...s]) => [Math.min(a, 0), ...s],
    decode: ([a, ...s]) => [["N", a], ...s],
    description: "min(a, 0)",
  },
  O: {
    fn: (s) => [s.reduce((s, v) => s + v)],
    decode: (s) => [["O", ...s.reverse()]],
    description: "a + b + c + ...",
  },
  P: {
    fn: ([...s]) => [Math.PI * 2, ...s],
    decode: (s) => [["P"], ...s],
    description: "2 * PI",
  },
  Q: {
    fn: ([a, ...s]) => [Math.sqrt(a), ...s],
    decode: ([a, ...s]) => [["Q", a], ...s],
    description: "sqrt(a)",
  },
  R: {
    fn: ([a, ...s]) => [Math.round(a), ...s],
    decode: ([a, ...s]) => [["R", a], ...s],
    description: "round(a)",
  },
  S: {
    fn: ([a, ...s]) => [Math.sin(a), ...s],
    decode: ([a, ...s]) => [["S", a], ...s],
    description: "sin(a)",
  },
  T: {
    fn: ([a, ...s]) => [Math.tan(a), ...s],
    decode: ([a, ...s]) => [["T", a], ...s],
    description: "tan(a)",
  },
  U: {
    fn: ([a, ...s]) => [Math.ceil(a), ...s],
    decode: ([a, ...s]) => [["U", a], ...s],
    description: "ceil(a)",
  },
  V: {
    fn: ([...s], { t }) => [Math.cos(t), ...s],
    decode: ([...s]) => [["V"], ...s],
    description: "cos(t)",
  },
  W: {
    fn: ([a, ...s]) => [a * a, ...s],
    decode: ([a, ...s]) => [["W", a], ...s],
    description: "a * a",
  },
  X: {
    fn: ([...s], { x }) => [x - 16, ...s],
    decode: ([...s]) => [["X"], ...s],
    description: "x - 16",
  },
  Y: {
    fn: ([...s], { y }) => [y - 16, ...s],
    decode: ([...s]) => [["Y"], ...s],
    description: "y - 16",
  },
  Z: {
    fn: ([...s], { t }) => [Math.sin(t), ...s],
    decode: ([...s]) => [["Z"], ...s],
    description: "sin(t)",
  },
  0: {
    fn: (s) => [0, ...s],
    decode: (s) => [["0"], ...s],
    description: "0",
  },
  1: {
    fn: (s) => [1, ...s],
    decode: (s) => [["1"], ...s],
    description: "1",
  },
  2: {
    fn: (s) => [2, ...s],
    decode: (s) => [["2"], ...s],
    description: "2",
  },
  3: {
    fn: (s) => [3, ...s],
    decode: (s) => [["3"], ...s],
    description: "3",
  },
  4: {
    fn: (s) => [4, ...s],
    decode: (s) => [["4"], ...s],
    description: "4",
  },
  5: {
    fn: (s) => [5, ...s],
    decode: (s) => [["5"], ...s],
    description: "5",
  },
  6: {
    fn: (s) => [6, ...s],
    decode: (s) => [["6"], ...s],
    description: "6",
  },
  7: {
    fn: (s) => [7, ...s],
    decode: (s) => [["7"], ...s],
    description: "7",
  },
  8: {
    fn: (s) => [8, ...s],
    decode: (s) => [["8"], ...s],
    description: "8",
  },
  9: {
    fn: (s) => [9, ...s],
    decode: (s) => [["9"], ...s],
    description: "9",
  },
}

export default lookup;
