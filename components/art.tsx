import { useRef, useEffect } from "react";

import { useSpring, animated } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";

import { draw } from "../lib/draw";

export default function Art({ expression = "xy+" }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const rect = useRef<HTMLDivElement>(null);

  // schedule a draw on the next frame
  // and return a function to cancel it
  useEffect(() => {
    let frameId: number;
    const ctx = canvas.current?.getContext("2d");

    function render(time: number) {
      if (ctx) draw(ctx, expression, time);
      frameId = requestAnimationFrame(render);
    }

    frameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameId);
  }, [expression]);

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

  const rotX = (py: number, box: DOMRect) =>
    (py - props.y.get() - box.y - box.height / 2) * 0.1;
  const rotY = (px: number, box: DOMRect) =>
    (px - props.x.get() - box.x - box.width / 2) * 0.1;

  const bind = useGesture(
    {
      onMove: ({ xy: [px, py] }) => {
        const boundingBox = rect.current?.getBoundingClientRect();
        if (boundingBox) {
          api({
            rotateX: rotX(py, boundingBox),
            rotateY: rotY(px, boundingBox),
            scale: 1.1,
          });
        }
      },
      onHover: ({ hovering }) =>
        !hovering && api({ rotateX: 0, rotateY: 0, scale: 1 }),
    },
    { eventOptions: { passive: false } }
  );

  return (
    <animated.div
      ref={rect}
      className="p-3 shadow-lg rounded-lg bg-white"
      {...bind()}
      style={props}
    >
      <canvas ref={canvas} width={256} height={256} className="w-64" />
    </animated.div>
  );
}
