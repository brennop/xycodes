import { useRef, useState, useEffect } from "react";
import useArt from "../lib/useArt";

// only require works for this package
import type { scanImageData as ScanImageData } from "@undecaf/zbar-wasm";
const { scanImageData } = require("@undecaf/zbar-wasm") as {
  scanImageData: typeof ScanImageData;
};

export default function Home() {
  const [expression, setExpression] = useState<string>("xy+t+");

  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { canvas: targetCanvasRef, position: pointsRef } = useArt(expression, {
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

        setExpression(detected.decode());
      }

      animateRef.current = requestAnimationFrame(animate);
    });
  };

  useEffect(() => {
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef!.current!);
  }, []);

  useEffect(() => {
    const handler = () => {
      const scale = videoRef.current ? Math.min(
        window.innerWidth / videoRef.current.videoWidth,
        window.innerHeight / videoRef.current.videoHeight,
      ) : 1;

      setWidth(videoRef.current!.videoWidth * scale);
      setHeight(videoRef.current!.videoHeight * scale);
    }

    window.addEventListener("resize", handler);
    videoRef.current!.addEventListener("loadedmetadata", handler);
    return () => { 
      window.removeEventListener("resize", handler);
      videoRef.current!.removeEventListener("loadedmetadata", handler);
    };
  }, []);


  return (
    <div>
      <canvas
        ref={fallbackCanvasRef}
        width={width}
        height={height}
        className="opacity-0 absolute"
      />
      <video
        autoPlay
        playsInline
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
      />
      <canvas
        ref={targetCanvasRef}
        width={width}
        height={height}
        className="absolute inset-0 m-auto"
      />
    </div>
  );
}
