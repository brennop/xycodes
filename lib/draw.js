// define a 16 colors palette
// https://lospec.com/palette-list/taffy-16
const pallet = [
  "#1a1b35",
  "#2e354e",
  "#4f6678",
  "#a4bcc2",
  "#ffffff",
  "#75ceea",
  "#317ad7",
  "#283785",
  "#512031",
  "#a43e4b",
  "#dc7d5e",
  "#f0cc90",
  "#ecf860",
  "#94d446",
  "#3b7850",
  "#20322e",
];

const SIZE = 32;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const RATIO = 16 / SIZE;

const lookup = {
  x: (s, { x }) => [x * RATIO, ...s],
  y: (s, { y }) => [y * RATIO, ...s],
  t: (s, { t }) => [t / 256, ...s],
  i: (s, { i }) => [i / RATIO, ...s],
  r: (s) => [Math.random(), ...s],

  "+": ([a, b, ...s]) => [b + a, ...s],
  "-": ([a, b, ...s]) => [b - a, ...s],
  "*": ([a, b, ...s]) => [b * a, ...s],
  "/": ([a, b, ...s]) => [b / a, ...s],
  "%": ([a, b, ...s]) => [b % a, ...s],
  "&": ([a, b, ...s]) => [b & a, ...s],
  "|": ([a, b, ...s]) => [b | a, ...s],
  "^": ([a, b, ...s]) => [b ^ a, ...s],
  "=": ([a, b, ...s]) => [b === a, ...s],
  "<": ([a, b, ...s]) => [b < a, ...s],
  ">": ([a, b, ...s]) => [b > a, ...s],
  "!": ([a, ...s]) => [!a, ...s],
  "~": ([a, ...s]) => [~a, ...s],
  "?": ([a, b, c, ...s]) => [a ? b : c, ...s],

  S: ([a, ...s]) => [Math.sin(a), ...s],
  C: ([a, ...s]) => [Math.cos(a), ...s],
  T: ([a, ...s]) => [Math.tan(a), ...s],
  A: ([a, ...s]) => [Math.abs(a), ...s],
  H: ([a, b, ...s]) => [Math.hypot(a, b), ...s],
  F: ([a, ...s]) => [Math.floor(a), ...s],
  R: ([a, ...s]) => [Math.sqrt(a), ...s],
  D: ([a, ...s]) => [a, a, ...s],

  h: ([a, ...s]) => [a / 2, ...s],
  w: ([a, ...s]) => [a * 2, ...s],
  q: ([a, ...s]) => [a / 4, ...s],

  0: (s) => [0, ...s],
  1: (s) => [1, ...s],
  2: (s) => [2, ...s],
  3: (s) => [3, ...s],
  4: (s) => [4, ...s],
  5: (s) => [5, ...s],
  6: (s) => [6, ...s],
  7: (s) => [7, ...s],
  8: (s) => [8, ...s],
  9: (s) => [9, ...s],
  a: (s) => [10, ...s],
  b: (s) => [11, ...s],
  c: (s) => [12, ...s],
  d: (s) => [13, ...s],
  e: (s) => [14, ...s],
  f: (s) => [15, ...s],
  l: (s) => [16, ...s],
};

function _eval(expr, x, y, t, i) {
  return [...expr].reduce((stack, token) => {
    return lookup[token]?.(stack, { x, y, t, i }) || stack;
  }, []);
}

export function draw(context, expr, t) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [value] = _eval(expr, i, j, t, i * SIZE + j);
      const color = pallet[Math.floor(value) & 0xf];
      context.fillStyle = color;
      context.fillRect(
        i * PIXEL_SIZE,
        j * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE
      );
    }
  }
}

