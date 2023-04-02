import { useRef, useEffect, useState } from "react";
import Link from 'next/link';
import Tilt from 'react-parallax-tilt';
import createREGL from 'regl';

import { palette, transpile } from "../lib/draw";

const bayerMatrix = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

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
      #define SIZE 16.0
      #define BAYER_SIZE 8.0
      varying vec2 uv;
      uniform sampler2D palette; // 16 colors
      uniform sampler2D bayer; // 8x8 bayer matrix
      uniform float time;
      
      void main () {
        float x = floor(uv.x * SIZE);
        float y = floor(-uv.y * SIZE);
        float t = time * 3.;
        float i = x * SIZE * 2. + y;

        float bayerValue = texture2D(bayer, vec2(
          mod(uv.x * 128., BAYER_SIZE) / BAYER_SIZE,
          mod(uv.y * 128., BAYER_SIZE) / BAYER_SIZE
        )).r / 4.;

        float value = mod(${transpile(expression)} / 16. + bayerValue, 1.0);
        gl_FragColor = texture2D(palette, vec2(value, 0.0));
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
          // quad vertex positions
          // we pass two triangles to draw a quad
          position: [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, -1],
            [1, 1],
            [-1, 1],
          ],
        },
        uniforms: {
          time: regl.current.context("time"),
          palette: regl.current.texture([palette]),
          bayer: regl.current.texture(bayerMatrix),
        },
        count: 6,
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
    <div className="p-3 shadow-lg bg-white">
      <Link href={encodeURIComponent(expression)}>
        <canvas ref={canvas} width={768} height={768} className="" />
      </Link>
    </div>
  );
}
