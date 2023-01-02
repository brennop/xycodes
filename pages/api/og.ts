import type { NextApiRequest, NextApiResponse } from 'next'
import { getPixels } from "../../lib/draw";
import Jimp from "jimp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { expr } = req.query;
  const pixels = getPixels(expr as string);

  const image = new Jimp(32, 32, 0xffffffff);

  pixels.forEach((row, i) => {
    row.forEach((color, j) => {
      image.setPixelColor(Jimp.cssColorToHex(color), j, i);
    });
  });

  const buffer = await image
    .resize(256, 256, Jimp.RESIZE_NEAREST_NEIGHBOR)
    .getBufferAsync(Jimp.MIME_PNG);

  res.setHeader("Content-Type", "image/png");
  res.send(buffer);
}
