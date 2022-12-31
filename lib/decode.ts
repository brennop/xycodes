const pallet = [
  "#1a1c2c",
  "#5d275d",
  "#b13e53",
  "#ef7d57",
  "#ffcd75",
  "#a7f070",
  "#38b764",
  "#257179",
  "#29366f",
  "#3b5dc9",
  "#41a6f6",
  "#73eff7",
  "#f4f4f4",
  "#94b0c2",
  "#566c86",
  "#333c57",
];

const removeParen = (expr: string) => {
  if (expr.startsWith('(') && expr.endsWith(')')) {
    return expr.slice(1, -1);
  }
  return expr;
};

const lookup: Record<string, (state: string[]) => string[]> = {
  x: (s) => ["x", ...s],
  y: (s) => ["y", ...s],
  t: (s) => ["t", ...s],
  i: (s) => ["i", ...s],
  r: (s) => ["R()", ...s],

  "+": ([a, b, ...s]) => [`(${b}+${a})`, ...s],
  "-": ([a, b, ...s]) => [`(${b}-${a})`, ...s],
  "*": ([a, b, ...s]) => [`(${b}*${a})`, ...s],
  "/": ([a, b, ...s]) => [`(${b}/${a})`, ...s],
  "^": ([a, b, ...s]) => [`(${b}^${a})`, ...s],
  "%": ([a, b, ...s]) => [`(${b}%${a})`, ...s],
  "|": ([a, b, ...s]) => [`(${b}|${a})`, ...s],
  "&": ([a, b, ...s]) => [`(${b}&${a})`, ...s],
  "~": ([a, ...s]) => [`(~${a})`, ...s],
  "=": ([a, b, ...s]) => [`(${b}==${a})`, ...s],
  "<": ([a, b, ...s]) => [`(${b}<${a})`, ...s],
  ">": ([a, b, ...s]) => [`(${b}>${a})`, ...s],
  "!": ([a, ...s]) => [`(!${a})`, ...s],
  "?": ([a, b, c, ...s]) => [`(${a}?${b}:${c})`, ...s],

  S: ([a, ...s]) => [`sin(${removeParen(a)})`, ...s],
  C: ([a, ...s]) => [`cos(${removeParen(a)})`, ...s],
  T: ([a, ...s]) => [`tan(${removeParen(a)})`, ...s],
  A: ([a, ...s]) => [`abs(${removeParen(a)})`, ...s],
  H: ([a, b, ...s]) => [`hypot(${a},${b})`, ...s],
  F: ([a, ...s]) => [`floor(${a})`, ...s],
  R: ([a, ...s]) => [`sqrt(${a})`, ...s],
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
  return removeParen([...expression].reduce((s, c) => {
    const fn = lookup[c]
    if (fn === undefined) {
      console.warn(`Unknown character: ${c}`)
      return s
    }
    return fn(s)
  }, [] as string[]).join(""))
}

export function highlight(decoded: string) {
  let depth = 0;
  return [...decoded].map((c) => {
    if (c === "(") {
      depth++;
      return `<span style="color: ${pallet[depth % pallet.length]}">(`;
    } else if (c === ")") {
      depth--;
      return `)</span>`;
    }
    return c;
  }).join("");
}
