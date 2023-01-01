type Expr = string | Expr[] | { fn: string, args: Expr[] };

const lookup: Record<string, (state: Expr[]) => Expr[]> = {
  x: (s) => ["x", ...s],
  y: (s) => ["y", ...s],
  t: (s) => ["t", ...s],
  i: (s) => ["i", ...s],
  r: (s) => ["R()", ...s],

  "+": ([a, b, ...s]) => [[b, "+", a], ...s],
  "-": ([a, b, ...s]) => [[b, "-", a], ...s],
  "*": ([a, b, ...s]) => [[b, "*", a], ...s],
  "/": ([a, b, ...s]) => [[b, "/", a], ...s],
  "^": ([a, b, ...s]) => [[b, "^", a], ...s],
  "%": ([a, b, ...s]) => [[b, "%", a], ...s],
  "|": ([a, b, ...s]) => [[b, "|", a], ...s],
  "&": ([a, b, ...s]) => [[b, "&", a], ...s],
  "~": ([a, ...s]) => [["~", a], ...s],
  "=": ([a, b, ...s]) => [[b, "==", a], ...s],
  "<": ([a, b, ...s]) => [[b, "<", a], ...s],
  ">": ([a, b, ...s]) => [[b, ">", a], ...s],
  "!": ([a, ...s]) => [["!", a], ...s],
  "?": ([a, b, c, ...s]) => [[a, "?", b, ":", c], ...s],

  S: ([a, ...s]) => [{ fn: "sin", args: [a] }, ...s],
  C: ([a, ...s]) => [{ fn: "cos", args: [a] }, ...s],
  T: ([a, ...s]) => [["tan(", a, ")"], ...s],
  A: ([a, ...s]) => [["abs(", a, ")"], ...s],
  H: ([a, b, ...s]) => [["hypot(", a, ",", b, ")"], ...s],
  F: ([a, ...s]) => [["floor(", a, ")"], ...s],
  R: ([a, ...s]) => [["sqrt(", a, ")"], ...s],
  D: ([a, ...s]) => [a, a, ...s],

  0: (s) => ["0", ...s],
  1: (s) => ["1", ...s],
  2: (s) => ["2", ...s],
  3: (s) => ["3", ...s],
  4: (s) => ["4", ...s],
  5: (s) => ["5", ...s],
  6: (s) => ["6", ...s],
  7: (s) => ["7", ...s],
  8: (s) => ["8", ...s],
  9: (s) => ["9", ...s],
  a: (s) => ["10", ...s],
  b: (s) => ["11", ...s],
  c: (s) => ["12", ...s],
  d: (s) => ["13", ...s],
  e: (s) => ["14", ...s],
  f: (s) => ["15", ...s],
  l: (s) => ["16", ...s],
};

export function decode(expression: string) {
  const [result] = [...expression].reduce((s, c) => {
    const fn = lookup[c]
    if (fn === undefined) {
      console.warn(`Unknown character: ${c}`)
      return s
    }
    return fn(s)
  }, [] as Expr[])
  return result
}
