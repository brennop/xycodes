import { useRef, useEffect, useState } from "react";
import Link from 'next/link';

import { download, record } from "../lib/download";
import useArt from "../lib/useArt";

export default function Art({ expression = "xy+", dynamic = true }) {
  const { canvas } = useArt(expression, { dynamic });

  const handleDownload = async () => {
    const blob = await record(canvas.current!, 6000);
    download(blob, "art");
  };

  return (
    <>
      <div className="p-3 shadow-lg bg-white">
        <Link href={encodeURIComponent(expression)}>
          <canvas ref={canvas} width={256} height={256} className="" />
        </Link>
      </div>
      <button onClick={handleDownload} className="">download</button>
    </>
  );
}
