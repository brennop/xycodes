const pairs = [
  ['.', '+'],
  ['_', '/'],
  ['~', '%'],
];

export function encode(url: string): string {
  return pairs.reduce((acc, [from, to]) => acc.replace(new RegExp(`\\${to}`, 'g'), from), url);
}

export function decode(url: string): string {
  return pairs.reduce((acc, [from, to]) => acc.replace(new RegExp(`\\${from}`, 'g'), to), url);
}
