import AWS from "aws-sdk";

export default async function handler(req, res) {
  try {
    const s3 = new AWS.S3({
      endpoint: process.env.B2_ENDPOINT,
      region: process.env.B2_REGION,
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APP_KEY,
      signatureVersion: "v4",
    });

    const result = await s3
      .listObjectsV2({
        Bucket: process.env.B2_BUCKET,
      })
      .promise();

    const files = result.Contents.map((f) => ({
      name: f.Key,
      size: f.Size,
      url: `https://f002.backblazeb2.com/file/${process.env.B2_BUCKET}/${f.Key}`
    }));

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    res.json({
      files,
      totalFiles: files.length,
      totalSize,
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
