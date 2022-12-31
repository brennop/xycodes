import { useRef, useEffect } from "react";
import Link from 'next/link';

import Tilt from 'react-parallax-tilt';

import { draw } from "../lib/draw";

export default function Art({ expression = "xy+", dynamic = true }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  // schedule a draw on the next frame
  // and return a function to cancel it
  useEffect(() => {
    let frameId: number;
    const ctx = canvas.current?.getContext("2d");

    function render(time: number) {
      if (ctx) draw(ctx, expression, time);
      if (!dynamic) return;
      frameId = requestAnimationFrame(render);
    }

    frameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(frameId);
  }, [expression, dynamic]);

  return (
    <Tilt
      glareEnable
      glarePosition="all"
      gyroscope
      scale={1.1}
    >
      <div className="p-3 shadow-lg rounded-lg bg-white">
        <Link href={encodeURIComponent(expression)}>
          <canvas ref={canvas} width={256} height={256} className="w-64" />
        </Link>
      </div>
    </Tilt>
  );
}
