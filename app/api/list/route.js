
import { list } from '@vercel/blob';
export const runtime = 'edge';

export async function GET() {
  const files = await list();
  return Response.json(files.blobs);
}
