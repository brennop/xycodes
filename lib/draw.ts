import lookup from './lookup';

// define a 16 colors palette
// https://lospec.com/palette-list/taffy-16
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


const SIZE = 32;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const TIMESCALE = 1 / 256;
const DITHER_SCALE = 4;

const bayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function _eval(expr: string, x: number, y: number, t: number, i: number) {
  return [...expr].reduce((stack, token) => {
    return lookup[token]?.fn(stack, { x, y, t, i }) || stack;
  }, [] as number[]);
}

export function draw(context: CanvasRenderingContext2D, expr: string, t: number) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [value] = _eval(expr, i, j, t * TIMESCALE, i * SIZE + j);

      for (let k = 0; k < DITHER_SCALE * DITHER_SCALE; k++) {
        const newValue = value + bayerMatrix[k % DITHER_SCALE][Math.floor(k / DITHER_SCALE)] / (DITHER_SCALE * DITHER_SCALE);
        const color = pallet[Math.floor(newValue) & 0xf];
        context.fillStyle = color;
        context.fillRect(
          i * PIXEL_SIZE + (k % DITHER_SCALE) * PIXEL_SIZE / DITHER_SCALE,
          j * PIXEL_SIZE + Math.floor(k / DITHER_SCALE) * PIXEL_SIZE / DITHER_SCALE,
          PIXEL_SIZE / DITHER_SCALE,
          PIXEL_SIZE / DITHER_SCALE,
        );
      }
    }
  }
}

export function getPixels(expr: string): string[][] {
  return [...Array(SIZE)].map((_, j) => [...Array(SIZE)].map((_, i) => {
    const [value] = _eval(expr, i, j, 1, i * SIZE + j);
    const color = pallet[Math.floor(value) & 0xf];
    return color;
  }));
}
