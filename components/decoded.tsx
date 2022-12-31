const pallet = [
  ["text-red-600"],
  ["text-orange-600"],
  ["text-yellow-600"],
  ["text-green-600"],
  ["text-blue-600"],
  ["text-indigo-600"],
  ["text-purple-600"],
  ["text-pink-600"],
];

type Expr = string | Expr[] | { fn: string, args: Expr[] };

export default function Decoded({
  expression,
  depth = 0,
}: {
  expression: Expr;
  depth?: number;
}) {
  if (!expression) return null;

  if (typeof expression === "string") {
    return <>{expression}</>;
  }

  if (Array.isArray(expression)) {
    return (
      <span className={pallet[depth % pallet.length].join(" ")}>
        {depth > 0 && "("}
        {expression.map((expr, i) => (
          <Decoded expression={expr} depth={depth + 1} key={i} />
        ))}
        {depth > 0 && ")"}
      </span>
    );
  }

  const addParens = typeof expression.args[0] === "string";

  return (
    <span className={pallet[depth % pallet.length].join(" ")}>
      {expression.fn}
      {addParens && "("}
      {expression.args.map((expr, i) => (
        <Decoded expression={expr} depth={depth + 1} key={i} />
      ))}
      {addParens && ")"}
    </span>
  );
}
