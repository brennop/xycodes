import {useRef, useEffect, useState} from "react";
import { draw } from "../lib/draw"

export default function Art() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = canvas.current?.getContext("2d");

  const [expression, setExpression] = useState("xy+");

  // schedule a draw on the next frame
  // and return a function to cancel it
  useEffect(() => {
    if (!ctx) return;

    let frameId: number;

    function render(time: number) {
      draw(ctx, expression, time);
      frameId = requestAnimationFrame(render);
    }

    frameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameId);
  }, [ctx, expression]);


  return (
    <div>
      <canvas ref={canvas} width={256} height={256} />
      <input value={expression} onChange={(e) => setExpression(e.target.value)} />
    </div>
  );
}
