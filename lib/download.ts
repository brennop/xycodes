export async function record(canvas: HTMLCanvasElement, duration: number) {
  const recordedChunks: Blob[] = [];
  return new Promise<Blob>((resolve, reject) => {
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream!, {
      videoBitsPerSecond: 2500 * 1000 * 10,
    })//, { mimeType: "video/webm;codecs=h264" });

    recorder.ondataavailable = (e) => {
      if (e.data.size) recordedChunks.push(e.data);

      if (recorder.state === "inactive") {
        const blob = new Blob(recordedChunks, {
          type: "video/webm",
        });

        resolve(blob);
      }
    };

    recorder.onerror = (e) => {
      reject(e);
    };

    recorder.start();
    setTimeout(() => recorder.stop(), duration);
  });
}

export async function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_blank";
  a.click();
  window.URL.revokeObjectURL(url);
}
