import lookup, { Expr } from './lookup';
import { decode } from "../lib/decode"

// define a 16 colors palette
// https://lospec.com/palette-list/taffy-16
export const palette = [
  [0x1a, 0x1c, 0x2c],
  [0x5d, 0x27, 0x5d],
  [0xb1, 0x3e, 0x53],
  [0xef, 0x7d, 0x57],
  [0xff, 0xcd, 0x75],
  [0xa7, 0xf0, 0x70],
  [0x38, 0xb7, 0x64],
  [0x25, 0x71, 0x79],
  [0x29, 0x36, 0x6f],
  [0x3b, 0x5d, 0xc9],
  [0x41, 0xa6, 0xf6],
  [0x73, 0xef, 0xf7],
  [0xf4, 0xf4, 0xf4],
  [0x94, 0xb0, 0xc2],
  [0x56, 0x6c, 0x86],
  [0x33, 0x3c, 0x57],
];


const SIZE = 32;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const TIMESCALE = 1 / 256;

export function _eval(expr: string, x: number, y: number, t: number, i: number) {
  let stack: number[] = [];
  for (const op of expr) {
    const fn = lookup[op].fn;
    stack = fn(stack, { x, y, t, i });
  }
  return stack;
}

export function draw(context: CanvasRenderingContext2D, expr: string, t: number) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [value] = _eval(expr, i, j, t * TIMESCALE, i * SIZE + j);
      const color = palette[Math.floor(value) & 0xf];
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

export function getPixels(expr: string): number[][][] {
  return [...Array(SIZE)].map((_, j) => [...Array(SIZE)].map((_, i) => {
    const [value] = _eval(expr, i, j, 1, i * SIZE + j);
    const color = palette[Math.floor(value) & 0xf];
    return color;
  }));
}

export function transpile(expr: string): string {
  const [result] = [...expr].reduce((s, c) => {
    return lookup[c]?.compile?.(s) || s;
  }, [] as string[])
  return result
}


