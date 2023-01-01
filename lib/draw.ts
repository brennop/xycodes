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

