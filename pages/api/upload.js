import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

// helper: stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read raw body (since bodyParser is false)
    const buffer = await streamToBuffer(req);

    // Determine filename from header or fallback
    const filenameHeader = req.headers['x-filename'] || `upload_${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const extension = filenameHeader.includes('.') ? '' : '';
    const filename = `${Date.now()}-${filenameHeader}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.BUCKET_NAME)
      .upload(filename, buffer, {
        contentType
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const { publicURL } = supabase.storage
      .from(process.env.BUCKET_NAME)
      .getPublicUrl(filename);

    return res.status(200).json({ url: publicURL, path: data?.path || filename });
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
