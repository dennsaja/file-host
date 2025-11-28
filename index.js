import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// ---------------------------
// CONFIG
// ---------------------------
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer(); // memory storage

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET;

// =============================
// 1. DASHBOARD ADMIN (React)
// =============================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>File Hosting Dashboard</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
</head>

<body class="bg-gray-100 text-gray-900 p-8">

<h1 class="text-3xl font-bold mb-5">Supabase File Hosting Dashboard</h1>

<div id="app"></div>

<script>
const e = React.createElement;

function Dashboard() {
  const [files, setFiles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function fetchFiles() {
    const res = await fetch("/api/list");
    const data = await res.json();
    setFiles(data.files || []);
  }

  async function deleteFile(name) {
    if (!confirm("Delete file " + name + "?")) return;
    await fetch("/api/delete", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ fileName: name })
    });
    fetchFiles();
  }

  async function uploadFile(ev) {
    const file = ev.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setLoading(true);
    await fetch("/api/upload", { method: "POST", body: form });
    setLoading(false);

    fetchFiles();
  }

  React.useEffect(() => { fetchFiles(); }, []);

  return e("div", { className: "space-y-5" },

    e("input", { type: "file", onChange: uploadFile, className: "p-2 border" }),
    loading ? e("p", null, "Uploading...") : null,

    e("div", { className: "grid grid-cols-1 gap-3" },
      files.map((f) =>
        e("div", {
          key: f.name,
          className: "p-4 bg-white shadow flex justify-between items-center rounded"
        },
          e("span", null, f.name),
          e("div", { className: "space-x-2" },
            e("a", {
              href: f.url,
              target: "_blank",
              className: "text-blue-600 underline"
            }, "View"),

            e("button", {
              onClick: () => deleteFile(f.name),
              className: "bg-red-500 text-white px-3 py-1 rounded"
            }, "Delete")
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(e(Dashboard));
</script>

</body>
</html>
  `);
});

// =============================
// 2. API – UPLOAD FILE
// =============================
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const f = req.file;
    const name = Date.now() + "-" + f.originalname;

    const { error } = await supabase
      .storage
      .from(BUCKET)
      .upload(name, f.buffer, {
        contentType: f.mimetype
      });

    if (error) return res.status(500).json({ error });

    res.json({ success: true, file: name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 3. API – LIST FILES
// =============================
app.get("/api/list", async (req, res) => {
  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .list("", { limit: 1000 });

  if (error) return res.status(500).json({ error });

  // Generate signed URLs
  const files = await Promise.all(
    data.map(async (file) => {
      const { data: signed } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(file.name, 60 * 60 * 24 * 30);

      return {
        name: file.name,
        url: signed.signedUrl
      };
    })
  );

  res.json({ files });
});

// =============================
// 4. API – DELETE FILE
// =============================
app.post("/api/delete", async (req, res) => {
  const { fileName } = req.body;

  const { error } = await supabase
    .storage
    .from(BUCKET)
    .remove([fileName]);

  if (error) return res.status(500).json({ error });

  res.json({ deleted: fileName });
});

// =============================
// START (Vercel)
export default app;
