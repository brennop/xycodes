import { useRef, useEffect, useState } from "react";

import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";

import { draw } from "../lib/draw";

const HOVER_SCALE = 0.1;

const calcX = (y: number, ly: number) =>
  -(y - ly - window.innerHeight / 2) * HOVER_SCALE;
const calcY = (x: number, lx: number) =>
  (x - lx - window.innerWidth / 2) * HOVER_SCALE;

export default function Art() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctx = canvas.current?.getContext("2d");

  const [expression, setExpression] = useState("xy+");

  const rect = useRef<HTMLDivElement>(null);

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

  const [props, api] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    zoom: 0,
    x: 0,
    y: 0,
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  const boundingBox = rect.current?.getBoundingClientRect();

  const rotX = (py: number, box: DOMRect) =>
    (py - props.y.get() - box.y - box.height / 2) * 0.1;
  const rotY = (px: number, box: DOMRect) =>
    (px - props.x.get() - box.x - box.width / 2) * 0.1;

  const bind = useGesture(
    {
      onMove: ({ xy: [px, py] }) =>
        boundingBox &&
        api({
          rotateX: rotX(py, boundingBox),
          rotateY: rotY(px, boundingBox),
          scale: 1.1,
        }),
      onHover: ({ hovering }) =>
        !hovering && api({ rotateX: 0, rotateY: 0, scale: 1 }),
    },
    { eventOptions: { passive: false } }
  );

  return (
    <div className="flex flex-col items-center w-min p-4">
      <animated.div
        ref={rect}
        className="p-3 shadow-lg rounded-lg bg-white"
        {...bind()}
        style={props}
      >
        <canvas ref={canvas} width={256} height={256} className="w-64" />
      </animated.div>
      <input
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        className="px-2 py-1 text-lg tracking-widest mt-2 w-full outline-none border-b-2 border-gray-900 shadow-md"
      />
    </div>
  );
}
