import {
  useFloating,
  autoUpdate,
  useHover,
  useInteractions,
} from "@floating-ui/react";

import { useState } from "react";
import lookup from "../lib/lookup";

const pallet = [
  ["text-red-600", "peer-hover:bg-pink-100"],
  ["text-orange-600", "peer-hover:bg-red-100"],
  ["text-yellow-600", "peer-hover:bg-orange-100"],
  ["text-green-600", "peer-hover:bg-yellow-100"],
  ["text-blue-600", "peer-hover:bg-green-100"],
  ["text-indigo-600", "peer-hover:bg-blue-100"],
  ["text-purple-600", "peer-hover:bg-indigo-100"],
  ["text-pink-600", "peer-hover:bg-purple-100"],
];

type Expr = string | Expr[];

export default function Decoded({
  expression,
  depth = 0,
}: {
  expression: Expr;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context);

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  if (!expression) return null;

  const [op, ...args] = expression;
  const description = lookup[op as string].description;

  return (
    <>
      <span
        className={
          pallet[depth % pallet.length].join(" ") +
          " flex mr-2 flex-row-reverse"
        }
      >
        <span ref={reference} {...getReferenceProps()} className="peer">
          {op}
        </span>
        {args.reverse().map((expr, i) => (
          <Decoded expression={expr} depth={depth + 1} key={i} />
        ))}
      </span>
      {open && (
        <div
          ref={floating}
          {...getFloatingProps()}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 1000,
          }}
        >
          {description}
        </div>
      )}
    </>
  );
}
