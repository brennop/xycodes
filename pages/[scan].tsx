import { useRef, useState, useEffect } from "react";
import useArt from "../lib/useArt";

// only require works for this package
import type { scanImageData as ScanImageData } from "@undecaf/zbar-wasm";
const { scanImageData } = require("@undecaf/zbar-wasm") as {
  scanImageData: typeof ScanImageData;
};

const TIME_TO_LIVE = 1000;

export default function Home() {
  const [expression, setExpression] = useState<string>("xy+t+");
  const [visible, setVisible] = useState<boolean>(false);

  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { canvas: targetCanvasRef, position: pointsRef } = useArt(expression, {
    dynamic: true,
  });

  const animateRef = useRef<number | null>(null);
  const lastScanRef = useRef<number>(0);

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

  const animate = (t) => {
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
      if (t - lastScanRef.current < TIME_TO_LIVE) {
        setVisible(false);
      }

      if (detected) {
        lastScanRef.current = t;

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

        if (expression !== detected.decode()) {
          const decoded = detected.decode();
          const url = new URL(decoded);
          console.log(url.pathname.slice(1));
          setExpression(url.pathname.slice(1));
        }

        if (!visible) {
          setVisible(true);
        }
      }
    }).finally(() => {
      animateRef.current = requestAnimationFrame(animate);
    });
  };

  useEffect(() => {
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef!.current!);
  }, []);

  useEffect(() => {
    const handler = () => {
      const scale = videoRef.current ? Math.max(
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
    <div className="ios-notch">
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
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={targetCanvasRef}
        width={width}
        height={height}
        className={`absolute left-1/2 m-auto transform -translate-x-1/2 ${visible ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
