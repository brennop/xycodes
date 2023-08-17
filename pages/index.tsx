import { useRef, useState, useEffect } from "react";
import useArt from "../lib/useArt";
const { scanImageData } = require("@undecaf/zbar-wasm");

export default function Home() {
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { canvas: targetCanvasRef, position: pointsRef } = useArt("xy+t+", {
    dynamic: true,
  });

  const animateRef = useRef<number | null>(null);

  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
        },
      })
      .then((stream) => {
        videoRef.current!.srcObject = stream;
        videoRef.current!.play();
      });
  }, []);

  const animate = () => {
    const video = videoRef.current!;
    const fallbackCanvas = fallbackCanvasRef.current!;
    const context = fallbackCanvas.getContext("2d")!;

    if (!context || !video.videoWidth || !video.videoHeight) {
      animateRef.current = requestAnimationFrame(animate);
      return;
    }

    context.drawImage(video, 0, 0);
    const imageData = context.getImageData(
      0,
      0,
      video.videoWidth,
      video.videoHeight,
    );

    scanImageData(imageData).then(([detected]) => {
      if (detected) {
        const { points } = detected;
        const transformedPoints = points.map(
          ({ x, y }: { x: number; y: number }) => [
            (x / video.videoWidth) * 2 - 1,
            (y / video.videoHeight) * -2 + 1,
          ],
        );

        pointsRef.current = [
          transformedPoints[0],
          transformedPoints[1],
          transformedPoints[2],
          transformedPoints[0],
          transformedPoints[2],
          transformedPoints[3],
        ];
      }

      animateRef.current = requestAnimationFrame(animate);
    });
  };

  useEffect(() => {
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef!.current!);
  }, []);

  return (
    <div>
      <canvas ref={fallbackCanvasRef} width={width} height={height} />
      <video autoPlay playsInline ref={videoRef} />
      <canvas ref={targetCanvasRef} width={width} height={height} />
    </div>
  );
}
