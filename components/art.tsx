import { useState } from "react";
import Link from 'next/link';

import { download, record } from "../lib/download";
import useArt from "../lib/useArt";
import Tilt from 'react-parallax-tilt';

export default function Art({ expression = "xy+", dynamic = true }) {
  const [hover, setHover] = useState(false);
  const { canvas } = useArt(expression, { 
    dynamic: hover || dynamic,
  });

  const handleDownload = async () => {
    const blob = await record(canvas.current!, 5000);
    download(blob, "art");
  };

  return (
    <div>
      <Tilt
        glareEnable
        glarePosition="all"
        gyroscope
        scale={1.1}
        onEnter={() => setHover(true)}
        onLeave={() => setHover(false)}
      >
        <div className="p-3 shadow-lg rounded-lg bg-white">
          <Link href={encodeURIComponent(expression)} className="hover:cursor-none">
            <canvas ref={canvas} width={256} height={256} className="w-64" />
          </Link>
        </div>
      </Tilt>
      <button onClick={handleDownload}>download</button>
    </div>
  );
}


