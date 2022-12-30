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
    <div className="flex flex-col items-center w-min p-4">
      <div className="p-2 shadow-lg">
        <canvas ref={canvas} width={256} height={256} className="w-64"/>
      </div>
      <input value={expression} onChange={(e) => setExpression(e.target.value)} 
        className="px-2 py-1 text-lg tracking-widest mt-2 w-full outline-none border-b-2 border-gray-900 shadow-md"/>
    </div>
  );
}
