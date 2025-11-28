
"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  async function uploadFile() {
    const form = new FormData();
    form.append("file", file);
    await fetch("/api/upload", { method: "POST", body: form });
    loadFiles();
  }

  async function loadFiles() {
    const res = await fetch("/api/list");
    setFiles(await res.json());
  }

  useEffect(() => { loadFiles() }, []);

  const totalSize = files.reduce((a,b)=>a+b.size,0);

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Open's API (Demo)</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
        marginTop: 30
      }}>
        <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
          <h3>Total Files</h3>
          <p style={{ fontSize: 28 }}>{files.length}</p>
        </div>

        <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
          <h3>Total Size</h3>
          <p style={{ fontSize: 28 }}>{(totalSize/1024).toFixed(2)} KB</p>
        </div>

        <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
          <h3>API Hits</h3>
          <p style={{ fontSize: 28 }}>—</p>
        </div>
      </div>

      <div style={{
        marginTop: 40,
        padding: 20,
        background: '#fff',
        borderRadius: 12,
        maxWidth: 600
      }}>
        <h2>Upload File</h2>
        <input type="file" onChange={e=>setFile(e.target.files[0])}/>
        <button onClick={uploadFile} style={{ marginLeft: 10, padding: '6px 14px' }}>
          Upload
        </button>
      </div>

      <h2 style={{ marginTop: 40 }}>Files</h2>
      <ul>
        {files.map(f=>(
          <li key={f.url}>
            <a href={f.url} target="_blank">{f.pathname} — {(f.size/1024).toFixed(2)} KB</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
