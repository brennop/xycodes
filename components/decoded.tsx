const pallet = [
  ["text-red-600", "group/red"],
  [
    "text-orange-600",
    "group/orange",
    "group-hover/red:bg-red-100",
  ],
  [
    "text-yellow-600",
    "group/yellow",
    "group-hover/orange:bg-orange-100",
  ],
  [
    "text-green-600",
    "group/green",
    "group-hover/yellow:bg-yellow-100",
  ],
  [
    "text-blue-600",
    "group/blue",
    "group-hover/green:bg-green-100",
  ],
  [
    "text-indigo-600",
    "group/indigo",
    "group-hover/blue:bg-blue-100",
  ],
  [
    "text-purple-600",
    "group/purple",
    "group-hover/indigo:bg-indigo-100",
  ],
  [
    "text-pink-600",
    "group/pink",
    "group-hover/purple:bg-purple-100",
  ],
];

type Expr = string | Expr[];

export default function Decoded({
  expression,
  depth = 0,
}: {
  expression: Expr;
  depth?: number;
}) {
  if (!expression) return null;

  const className =
    pallet[depth % pallet.length].join(" ") + " hover:!bg-white mx-1";

  if (typeof expression === "string") {
    return <span className={className}>{expression}</span>;
  }

  const [op, ...args] = expression;

  return (
    <span className={className}>
      {args.map((expr, i) => (
        <Decoded expression={expr} depth={depth + 1} key={i} />
      ))}
      {op}
    </span>
  );
}
