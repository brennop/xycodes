import lookup from './lookup';

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

function _eval(expr: string, x: number, y: number, t: number, i: number) {
  return [...expr].reduce((stack, token) => {
    return lookup[token]?.fn(stack, { x, y, t, i }) || stack;
  }, [] as number[]);
}

export function draw(context: CanvasRenderingContext2D, expr: string, t: number) {
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

