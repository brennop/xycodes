import { useRef, useEffect, useState } from "react";
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';
import createREGL from 'regl';

import { palette, transpile } from "../lib/draw";

export default function Art({ expression = "xy+", dynamic = true }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const regl = useRef<ReturnType<typeof createREGL>>();

  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!canvas.current) return;
    regl.current = createREGL(canvas.current);
  }, []);

  useEffect(() => {
    if (!regl.current) return;

    try {
      const drawFrame = regl.current({
        frag: `
      precision mediump float;
      #define PI 3.1415926538
      varying vec2 uv;
      uniform sampler2D palette; // 16 colors
      uniform float time;
      void main () {
        float x = uv.x * 16.;
        float y = -uv.y * 16.;
        float t = time;
        float i = x * 16. + y;
        gl_FragColor = texture2D(palette, vec2(mod(${transpile(expression)} / 16., 1.0), 0.0));
      }
    `,
        vert: `
      precision mediump float;
      attribute vec2 position;
      varying vec2 uv;
      void main () {
        uv = position;
        gl_Position = vec4(position, 0, 1);
      }
    `,
        attributes: {
          position: [-4, -4, 4, -4, 0, 4],
        },
        uniforms: {
          time: regl.current.context("time"),
          palette: regl.current.texture([palette]),
        },
        count: 3,
      });

      const frame = regl.current.frame(() => {
        if (!dynamic && !hovering) return;
        regl.current!.clear({
          color: [0, 0, 0, 1],
          depth: 1,
        });
        drawFrame();
      });

      return () => {
        frame.cancel();
      };
    }
    catch (e) {
      console.error(e)
    }
  }, [expression, dynamic, hovering, regl]);

  return (
    <Tilt
      glareEnable
      glarePosition="all"
      gyroscope
      scale={1.1}
      onEnter={() => setHovering(true)}
      onLeave={() => setHovering(false)}
    >
      <div className="p-3 shadow-lg rounded-lg bg-white">
        <Link href={encodeURIComponent(expression)}>
          <canvas ref={canvas} width={256} height={256} className="w-64" />
        </Link>
      </div>
    </Tilt>
  );
}
