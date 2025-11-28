import AWS from "aws-sdk";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "100mb",
  },
};

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

    const s3 = new AWS.S3({
      endpoint: process.env.B2_ENDPOINT,
      region: process.env.B2_REGION,
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
      signatureVersion: "v4",
    });

    const key = `${Date.now()}-${filename}`;

    const uploadResult = await s3
      .upload({
        Bucket: process.env.B2_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: req.headers["content-type"],
      })
      .promise();

    const publicUrl = `https://f002.backblazeb2.com/file/${process.env.B2_BUCKET}/${key}`;

    return res.status(200).json({
      url: publicUrl,
      path: key,
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
