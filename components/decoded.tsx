import {
  useFloating,
  autoUpdate,
  useHover,
  useInteractions,
} from "@floating-ui/react";

import { useState } from "react";
import lookup from "../lib/lookup";

const pallet = [
  ["text-red-600", "peer-hover:bg-pink-200"],
  ["text-orange-600", "peer-hover:bg-red-200"],
  ["text-yellow-600", "peer-hover:bg-orange-200"],
  ["text-green-600", "peer-hover:bg-amber-200"],
  ["text-blue-600", "peer-hover:bg-green-200"],
  ["text-indigo-600", "peer-hover:bg-blue-200"],
  ["text-purple-600", "peer-hover:bg-indigo-200"],
  ["text-pink-600", "peer-hover:bg-purple-200"],
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
          " flex mx-0.5 flex-row-reverse"
        }
      >
        <span ref={reference} {...getReferenceProps()} className="peer mx-0.5">
          {op}
        </span>
        {args.reverse().map((expr, i) => (
          <Decoded expression={expr} depth={depth + 1} key={i} />
        ))}
      </span>
      {open && (
        <span
          className={pallet[depth % pallet.length].join(" ")}
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
        </span>
      )}
    </>
  );
}
