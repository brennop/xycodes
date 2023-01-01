import lookup, { Expr } from './lookup';

export function decode(expression: string) {
  const [result] = [...expression].reduce((s, c) => {
    return lookup[c]?.decode(s) || s;
  }, [] as Expr[])
  return result
}

