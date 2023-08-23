import { kv } from '@vercel/kv';
import { NextApiRequest, NextApiResponse } from 'next';

const handlers = {
  "POST": async (request: NextApiRequest, response: NextApiResponse) => {
    // Add a new expression to the gallery
    const { expression } = request.body;
    await kv.sadd('gallery', expression);
    return response.status(200).json({ success: true });
  },
  "GET": async (request: NextApiRequest, response: NextApiResponse) => {
    const expressions = await kv.smembers('gallery');
    return response.status(200).json(expressions);
  }
}
 
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const handler = handlers[request.method as keyof typeof handlers];
  if (handler) {
    return handler(request, response);
  }
  return response.status(405).json({ error: 'Method not allowed' });
}
