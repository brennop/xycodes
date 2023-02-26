import { useRef, useEffect, useState } from "react";
import { palette, transpile } from "../lib/draw";

import createREGL from 'regl';
import QrScanner from 'qr-scanner';

export default function Scan() {
  const regl = useRef<ReturnType<typeof createREGL>>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [expression, setExpression] = useState("xy+");

  useEffect(() => {
    if (!videoRef.current) return;
    regl.current = createREGL();
    const qrScanner = new QrScanner(
      videoRef.current!,
      result => console.log('decoded qr code:', result),
      { returnDetailedScanResult: true },
    );

    qrScanner.start();
  }, []);

  useEffect(() => {
    if (!regl.current) return;

    try {
      const drawFrame = regl.current({
        frag: `
      precision mediump float;
      #define PI 3.1415926538
      #define SIZE 16.0
      varying vec2 uv;
      uniform sampler2D palette; // 16 colors
      uniform sampler2D bayer; // 4x4 bayer matrix
      uniform float time;
      
      void main () {
        float x = floor(uv.x * SIZE);
        float y = floor(-uv.y * SIZE);
        float t = time * 4.;
        float i = x * SIZE * 2. + y;
        // float bayerValue = texture2D(bayer, vec2(mod(uv.x * 128., 4.) * .25, mod(uv.y * 128., 4.) * .25)).r;
        // float value = mod(${transpile(expression)} / 16. + bayerValue, 1.0);
        float value = mod(${transpile(expression)} / 16., 1.0);
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
          position: [-4, -4, 4, -4, 0, 4],
        },
        uniforms: {
          time: regl.current.context("time"),
          palette: regl.current.texture([palette]),
        },
        count: 3,
      });

      const frame = regl.current.frame(() => {
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
  }, [expression, regl]);

  return <video className="w-screen h-screen" ref={videoRef} />;
}
