import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,       // kita kirim RAW file
    sizeLimit: "50mb",       // batas upload
  },
};

// Helper baca stream body (raw file)
function readStream(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const fileBuffer = await readStream(req);
    const filename = req.headers["x-filename"] || "file.bin";
    const bucket = process.env.SUPABASE_BUCKET;

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const filePath = `${Date.now()}-${filename}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: req.headers["content-type"],
      });

    if (uploadError) {
      return res.status(400).json({ error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return res.status(200).json({
      url: publicUrlData.publicUrl,
      path: filePath,
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
