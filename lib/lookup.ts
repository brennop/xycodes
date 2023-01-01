type Expr = string | Expr[] | { fn: string, args: Expr[] };

type Op = {
  fn: (stack: number[], data: { x: number, y: number, t: number, i: number }) => number[];
  decode: (stack: string[]) => Expr[];
}

const lookup: Record<string, Op> = {
  "+": {
    fn: ([a, b, ...s]) => [b + a, ...s],
    decode: ([a, b, ...s]) => [[b, "+", a], ...s],
  },
  "-": {
    fn: ([a, b, ...s]) => [b - a, ...s],
    decode: ([a, b, ...s]) => [[b, "-", a], ...s],
  },
  "*": {
    fn: ([a, b, ...s]) => [b * a, ...s],
    decode: ([a, b, ...s]) => [[b, "*", a], ...s],
  },
  "/": {
    fn: ([a, b, ...s]) => [b / a, ...s],
    decode: ([a, b, ...s]) => [[b, "/", a], ...s],
  },
  "&": {
    fn: ([a, b, ...s]) => [b & a, ...s],
    decode: ([a, b, ...s]) => [[b, "&", a], ...s],
  },
  "|": {
    fn: ([a, b, ...s]) => [b | a, ...s],
    decode: ([a, b, ...s]) => [[b, "|", a], ...s],
  },
  "^": {
    fn: ([a, b, ...s]) => [b ^ a, ...s],
    decode: ([a, b, ...s]) => [[b, "^", a], ...s],
  },
  "%": {
    fn: ([a, b, ...s]) => [b % a, ...s],
    decode: ([a, b, ...s]) => [[b, "%", a], ...s],
  },
  "~": {
    fn: ([a, ...s]) => [~a, ...s],
    decode: ([a, ...s]) => [[a, "~"], ...s],
  },
  "²": {
    fn: ([a, ...s]) => [a * a, ...s],
    decode: ([a, ...s]) => [[a, "²"], ...s],
  },
  "³": {
    fn: ([a, ...s]) => [a * a * a, ...s],
    decode: ([a, ...s]) => [[a, "³"], ...s],
  },
  "½": {
    fn: ([a, ...s]) => [a / 2, ...s],
    decode: ([a, ...s]) => [[a, "½"], ...s],
  },
  "?" : {
    fn: ([a, b, c, ...s]) => [a ? b : c, ...s],
    decode: ([a, b, c, ...s]) => [[a, "?", b, ":", c], ...s],
  },

  a: {
    fn: (s) => [10, ...s],
    decode: (s) => s,
  },
  b: {
    fn: (s) => [11, ...s],
    decode: (s) => s,
  },
  c: {
    fn: (s) => [12, ...s],
    decode: (s) => s,
  },
  d: {
    fn: (s) => [13, ...s],
    decode: (s) => s,
  },
  e: {
    fn: (s) => [14, ...s],
    decode: (s) => s,
  },
  f: {
    fn: (s) => [15, ...s],
    decode: (s) => s,
  },
  g: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  h: {
    fn: ([a, ...s]) => [a / 2, ...s],
    decode: (s) => s,
  },
  i: {
    fn: ([...s], { i }) => [i, ...s],
    decode: (s) => s,
  },
  j: {
    fn: ([a, ...s]) => [a - 8, ...s],
    decode: (s) => s,
  },
  k: {
    fn: ([a, ...s]) => [a - 16, ...s],
    decode: (s) => s,
  },
  l: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  m: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  n: {
    fn: ([a, ...s]) => [-a, ...s],
    decode: (s) => s
  },
  o: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  p: {
    fn: ([...s]) => [Math.PI, ...s],
    decode: (s) => s,
  },
  q: {
    fn: ([a, ...s]) => [a / 4, ...s],
    decode: (s) => s,
  },
  r: {
    fn: (s) => s.reverse(),
    decode: (s) => s,
  },
  s: {
    fn: ([a, b, ...s]) => [b, a, ...s],
    decode: (s) => s,
  },
  t: {
    fn: ([...s], { t }) => [t / 256, ...s],
    decode: (s) => s,
  },
  u: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  v: {
    fn: ([a, ...s]) => [a * 4, ...s],
    decode: (s) => s
  },
  w: {
    fn: ([a, ...s]) => [a * 2, ...s],
    decode: (s) => s,
  },
  x: {
    fn: ([...s], { x }) => [x, ...s],
    decode: (s) => s,
  },
  y: {
    fn: ([...s], { y }) => [y, ...s],
    decode: (s) => s,
  },
  z: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  A: {
    fn: ([a, ...s]) => [Math.abs(a), ...s],
    decode: (s) => s,
  },
  B: {
    fn: ([a, ...s]) => [...s],
    decode: (s) => s,
  },
  C: {
    fn: ([a, ...s]) => [Math.cos(a), ...s],
    decode: (s) => s,
  },
  D: {
    fn: ([a, ...s]) => [a, a, ...s],
    decode: (s) => s,
  },
  E: {
    fn: ([a, ...s]) => [Math.exp(a), ...s],
    decode: (s) => s,
  },
  F: {
    fn: ([a, ...s]) => [Math.floor(a), ...s],
    decode: (s) => s,
  },
  G: {
    fn: ([a, ...s]) => [Math.log(a), ...s],
    decode: (s) => s,
  },
  H: {
    fn: ([a, b, ...s]) => [Math.hypot(a, b), ...s],
    decode: (s) => s,
  },
  I: {
    fn: ([a, ...s]) => [1 / a, ...s],
    decode: (s) => s,
  },
  J: {
    fn: ([a, ...s]) => [1 + a, ...s],
    decode: (s) => s,
  },
  K: {
    fn: ([a, b, ...s]) => [Math.atan2(a, b), ...s],
    decode: (s) => s,
  },
  L: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  M: {
    fn: ([a, ...s]) => [Math.max(a, 0), ...s],
    decode: (s) => s,
  },
  N: {
    fn: ([a, ...s]) => [Math.min(a, 0), ...s],
    decode: (s) => s
  },
  O: {
    fn: ([...s]) => [...s],
    decode: (s) => s,
  },
  P: {
    fn: ([...s]) => [Math.PI * 2, ...s],
    decode: (s) => s,
  },
  Q: {
    fn: ([a, ...s]) => [Math.sqrt(a), ...s],
    decode: (s) => s,
  },
  R: {
    fn: ([a, ...s]) => [Math.round(a), ...s],
    decode: (s) => s,
  },
  S: {
    fn: ([a, ...s]) => [Math.sin(a), ...s],
    decode: (s) => s
  },
  T: {
    fn: ([a, ...s]) => [Math.tan(a), ...s],
    decode: (s) => s,
  },
  U: {
    fn: ([a, ...s]) => [Math.ceil(a), ...s],
    decode: (s) => s,
  },
  V: {
    fn: ([...s], { t }) => [Math.cos(t / 256), ...s],
    decode: (s) => s
  },
  W: {
    fn: ([a, ...s]) => [a * a, ...s],
    decode: (s) => s,
  },
  X: {
    fn: ([...s], { x }) => [x - 16, ...s],
    decode: (s) => s,
  },
  Y: {
    fn: ([...s], { y }) => [y - 16, ...s],
    decode: (s) => s,
  },
  Z: {
    fn: ([...s], { t }) => [Math.sin(t / 256), ...s],
    decode: (s) => ["sin(t)", ...s],
  },
  0: {
    fn: (s) => [0, ...s],
    decode: (s) => s,
  },
  1: {
    fn: (s) => [1, ...s],
    decode: (s) => s,
  },
  2: {
    fn: (s) => [2, ...s],
    decode: (s) => s,
  },
  3: {
    fn: (s) => [3, ...s],
    decode: (s) => s,
  },
  4: {
    fn: (s) => [4, ...s],
    decode: (s) => s,
  },
  5: {
    fn: (s) => [5, ...s],
    decode: (s) => s,
  },
  6: {
    fn: (s) => [6, ...s],
    decode: (s) => s,
  },
  7: {
    fn: (s) => [7, ...s],
    decode: (s) => s,
  },
  8: {
    fn: (s) => [8, ...s],
    decode: (s) => s,
  },
  9: {
    fn: (s) => [9, ...s],
    decode: (s) => s,
  },
};

export default lookup;
