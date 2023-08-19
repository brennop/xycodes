import { useRef, useEffect } from "react";
import createREGL from "regl";

import { palette, transpile } from "../lib/draw";

const bayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export default function useArt(
  expression: string,
  {
    dynamic = true,
  }: {
    dynamic?: boolean;
  },
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const regl = useRef<ReturnType<typeof createREGL>>();
  const position = useRef<number[][]>([
    [-1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 1],
    [1, -1],
  ]);

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
      #define BAYER_SIZE 4.0
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
          mod(uv.x * 64., BAYER_SIZE * 1.0) / BAYER_SIZE * 1.,
          mod(uv.y * 64., BAYER_SIZE * 1.0) / BAYER_SIZE * 1.
        )).r / 1.;

        float value = mod(${transpile(expression)} / 16. + bayerValue, 1.0);
        gl_FragColor = texture2D(palette, vec2(value, 0.0));
      }
    `,
        vert: `
      precision mediump float;
      attribute vec2 position;
      attribute vec2 uvs;
      varying vec2 uv;
      void main () {
        uv = uvs; // FIXME: improve this
        gl_Position = vec4(position, 0, 1);
      }
    `,
        attributes: {
          // quad vertex positions
          // we pass two triangles to draw a quad
          position: regl.current.prop<{ position: number[][] }, "position">(
            "position",
          ),
          // uv coordinates
          uvs: [
            [-1, -1],
            [-1, 1],
            [1, 1],
            [-1, -1],
            [1, 1],
            [1, -1],
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
        if (!dynamic) return;
        regl.current!.clear({
          color: [0, 0, 0, 0],
          depth: 1,
        });
        drawFrame({
          position: position?.current,
        });
      });

      return () => {
        frame.cancel();
      };
    } catch (e) {
      console.error(e);
    }
  }, [expression, dynamic, regl]);

  return { canvas, position };
}
