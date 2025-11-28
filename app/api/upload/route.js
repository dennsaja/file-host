
import { put } from '@vercel/blob';
export const runtime = 'edge';

export async function POST(req) {
  const form = await req.formData();
  const file = form.get('file');

  const blob = await put(file.name, file, { access: "public" });

  return Response.json({
    url: blob.url,
    name: file.name,
    size: file.size
  });
}
