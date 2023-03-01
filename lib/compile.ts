type Op = (stack: string[]) => string[]

const lookup: Record<string, Op> = {
  0: (s) => ['0', ...s],
  1: (s) => ['1', ...s],
  2: (s) => ['2', ...s],
  3: (s) => ['3', ...s],
  4: (s) => ['4', ...s],
  5: (s) => ['5', ...s],
  6: (s) => ['6', ...s],
  7: (s) => ['7', ...s],
  8: (s) => ['8', ...s],
  9: (s) => ['9', ...s],
  a: (s) => ['10', ...s],
  b: (s) => ['11', ...s],
  c: (s) => ['12', ...s],
  d: (s) => ['13', ...s],
  e: (s) => ['14', ...s],
  f: (s) => ['15', ...s],
  g: (s) => ['16', ...s],
  h: ([a, ...s]) => [`(${a}/2)`, ...s],
  i: (s) => ['i', ...s],
  j: ([a, b, ...s]) => [`(${b}&${a})`, ...s],
  k: ([a, b, ...s]) => [`(${b}|${a})`, ...s],
  l: ([a, b, ...s]) => [`(${b}^${a})`, ...s],
  m: ([a, ...s]) => [`(${a}+t)`, ...s],
  n: ([a, ...s]) => [`(-${a})`, ...s],
  o: ([a, ...s]) => [a, ...s],
  p: (s) => ["Math.PI", ...s],
  q: ([a, ...s]) => [`(${a}/4)`, ...s],
  r: ([a, ...s]) => [`(${a}/8)`, ...s],
  s: ([a, ...s]) => [`(${a}-8)`, ...s],
  t: (s) => ["t", ...s],
  u: ([a, ...s]) => [`(${a}-1)`, ...s],
  v: ([a, ...s]) => [`(${a}*4)`, ...s],
  w: ([a, ...s]) => [`(${a}*2)`, ...s],
  x: (s) => [`x`, ...s],
  y: (s) => [`y`, ...s],
  z: ([a, b, c, ...s]) => [`noise(${a}, ${b} || 0, ${c} || 0)`, ...s],
  A: ([a, ...s]) => [`Math.abs(${a})`, ...s],
  B: ([a, ...s]) => [a, ...s],
  C: ([a, ...s]) => [`Math.cos(${a})`, ...s],
  D: ([a, b, c, d]) => [`(${a} * ${d} - ${b} * ${c})`],
  E: ([a, ...s]) => [a, ...s],
  F: ([a, ...s]) => [`Math.floor(${a})`, ...s],
  G: ([a, ...s]) => [`Math.ceil(${a})`, ...s],
  H: ([a, b, ...s]) => [`Math.hypot(${a}, ${b})`, ...s],
  I: ([a, ...s]) => [`(1/${a})`, ...s],
  J: ([a, ...s]) => [a, ...s],
  K: ([a, b, ...s]) => [`Math.atan2(${b}, ${a})`, ...s],
  L: (s) => ["128", ...s],
  M: ([a, ...s]) => [`Math.max(${a}, 0)`, ...s],
  N: ([a, ...s]) => [`Math.min(${a}, 0)`, ...s],
  O: ([a, ...s]) => [`Math.round(${a})`, ...s],
  P: (s) => [`(Math.PI * 2)`, ...s],
  Q: ([a, ...s]) => [`Math.sqrt(${a})`, ...s],
  R: (s) => [`(${s.join('+')})`],
  S: ([a, ...s]) => [`Math.sin(${a})`, ...s],
  T: ([a, ...s]) => [`Math.tan(${a})`, ...s],
  U: (s) => [`Math.cos(t)`, ...s],
  V: (s) => [`Math.sin(t)`, ...s],
  W: ([a, ...s]) => [`(${a}*${a})`, ...s],
  X: (s) => [`(x-16)`, ...s],
  Y: (s) => [`(y-16)`, ...s],
  Z: ([a, ...s]) => [a, ...s],
  '-': ([a, b, ...s]) => [`(${b}-${a})`, ...s],
  ".": ([a, b, ...s]) => [`(${b}+${a})`, ...s],
  "*": ([a, b, ...s]) => [`(${b}*${a})`, ...s],
  "_": ([a, b, ...s]) => [`(${b}/${a})`, ...s],
  "~": ([a, b, ...s]) => [`(${b}%${a})`, ...s],
  "(": s => s,
  ")": s => s,
  "'": s => s,
  "!": s => s,
  ":": s => s,
  "@": s => s,
  ",": s => s,
  ";": ([a, b, ...s]) => [`((${a} > ${b}) ? 8 : 0)`, ...s],
}

export const getString = (input: string) => {
  const [result] = input.split('').reduce((s, c) => (lookup[c] || (() => ["", ...s]))(s), [] as string[])
  return result
}

const compile = (input: string) => {
  const result = getString(input);
  return new Function('x', 'y', 't', 'i', 'noise', `"use strict";const _=0;return ${result}`)
}

export default compile
