import { useRef, useState, useEffect } from "react";
import useArt from "../lib/useArt";
import { font } from "./_app";
import Head from "next/head";

// only require works for this package
import type { scanImageData as ScanImageData } from "@undecaf/zbar-wasm";
const { scanImageData } = require("@undecaf/zbar-wasm") as {
  scanImageData: typeof ScanImageData;
};

const TIME_TO_LIVE = 500;

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

  const animate = (t: number) => {
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

    if (t - lastScanRef.current > TIME_TO_LIVE) {
      setVisible(false);
    }

    scanImageData(imageData)
      .then(([detected]) => {

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
            try {
              const url = new URL(decoded);
              setExpression(url.pathname.slice(1));
            } catch (e) {
              setExpression(decoded);
            }
          }

          if (!visible) {
            setVisible(true);
          }
        }
      })
      .finally(() => {
        animateRef.current = requestAnimationFrame(animate);
      });
  };

  useEffect(() => {
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef!.current!);
  }, []);

  useEffect(() => {
    const handler = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const scale = videoRef.current
        ? Math.max(
            window.innerWidth / videoRef.current!.videoWidth,
            window.innerHeight / videoRef.current!.videoHeight,
          ) / pixelRatio
        : 1;

      setWidth(videoRef.current!.videoWidth * scale);
      setHeight(videoRef.current!.videoHeight * scale);
    };

    window.addEventListener("resize", handler);
    videoRef.current!.addEventListener("loadedmetadata", handler);
    return () => {
      window.removeEventListener("resize", handler);
      videoRef.current!.removeEventListener("loadedmetadata", handler);
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current!;
    const targetCanvas = targetCanvasRef.current!;

    const canvas = document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1920;

    const context = canvas.getContext("2d")!;

    // clear canvas
    context.clearRect(0, 0, video.videoWidth, video.videoHeight);

    const artContext = targetCanvas.getContext("webgl", {
      preserveDrawingBuffer: true,
    })!;

    const scale = Math.max(
      canvas.width / video.videoWidth,
      canvas.height / video.videoHeight,
    );

    const x = (canvas.width - video.videoWidth * scale) / 2;
    const y = (canvas.height - video.videoHeight * scale) / 2;

    requestAnimationFrame(() => {
      context.drawImage(
        video,
        x,
        y,
        video.videoWidth * scale,
        video.videoHeight * scale,
      );
      context.drawImage(
        artContext.canvas,
        x,
        y,
        video.videoWidth * scale,
        video.videoHeight * scale,
      );

      context.font = `bold 64px ${font.style.fontFamily}`;
      context.fillStyle = "#fff";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.globalCompositeOperation = "difference";
      const offset = 300;

      context.fillText("qrxy", canvas.width / 2, offset);
      context.fillText(expression, canvas.width / 2, canvas.height - offset);

      canvas.toBlob((blob) => {
        const file = new File([blob!], "qrxy-capture.png", {
          type: "image/png",
        });
        // @ts-ignore
        if (navigator.canShare) {
          navigator.share({ files: [file] });
        } else {
          const url = URL.createObjectURL(file);
          window.open(url, "_blank");
        }
      });

      canvas.remove();
    });
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <title>qrxy</title>
      </Head>
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
        className={`absolute left-1/2 m-auto transform -translate-x-1/2 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      {visible ? (
        <button
          className="absolute p-4 text-4xl text-white bg-gray-900 shadow-md rounded-lg bottom-8 left-1/2 transform -translate-x-1/2 w-max"
          onClick={handleCapture}
        >
          capturar 📸
        </button>
      ) : (
        <span className="absolute p-4 text-[4vw] text-white drop-shadow-lg bottom-8 left-1/2 transform -translate-x-1/2 w-max">
          aponte a câmera para um QR Code
        </span>
      )}
    </>
  );
}
