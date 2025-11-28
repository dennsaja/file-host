import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));  // preview image/file
  };

  const loadStats = async () => {
    const res = await fetch('/api/list');
    const data = await res.json();
    setFiles(data.files);
    setTotalSize(data.totalSize);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const uploadFile = async () => {
    if (!file) return alert("Pilih file dulu!");

    setStatus("Uploading...");

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-filename': file.name,
          'content-type': file.type || 'application/octet-stream'
        },
        body: file
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Upload berhasil!");
        await loadStats();
        setPreview(null);
      } else {
        setStatus("Gagal upload: " + data.error);
      }

    } catch (e) {
      setStatus("Gagal upload: " + e.message);
    }
  };

  return (
    <>
      <Head>
        <title>Open's API (Demo)</title>
      </Head>

      <div style={{ padding: 40, fontFamily: 'Arial' }}>
        <h1>Open's API (Demo)</h1>

        {/* GRID STATS */}
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
            <p style={{ fontSize: 28 }}>
              {(totalSize / 1024).toFixed(2)} KB
            </p>
          </div>

          <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
            <h3>API Hits</h3>
            <p style={{ fontSize: 28 }}>—</p>
          </div>
        </div>

        {/* UPLOAD BOX */}
        <div style={{
          marginTop: 40,
          padding: 20,
          background: '#fff',
          borderRadius: 12,
          maxWidth: 900
        }}>
          <h2>Upload File</h2>

          <label style={{
            display: 'inline-block',
            padding: '10px 16px',
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #ddd',
            cursor: 'pointer',
            fontWeight: 600
          }}>
            Pilih File
            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <button style={{
            padding: '10px 16px',
            background: '#222',
            color: '#fff',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            marginLeft: 12
          }} onClick={uploadFile}>
            Upload
          </button>

          {preview && (
            <div style={{ marginTop: 20 }}>
              <h4>Preview:</h4>
              <img src={preview} style={{ maxWidth: 300, borderRadius: 10 }} />
            </div>
          )}

          <p style={{ marginTop: 12 }}>{status}</p>
        </div>

        {/* FILE LIST */}
        <h2 style={{ marginTop: 40 }}>Files</h2>
        <ul>
          {files.map(f => (
            <li key={f.url}>
              <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
