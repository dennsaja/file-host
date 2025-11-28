import React, { useState } from 'react';
import Head from 'next/head';
import '../public/styles.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) {
      alert('Pilih file dulu!');
      return;
    }
    setStatus('Uploading...');
    try {
      // We POST the raw file bytes and set x-filename header so server can name it
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
        setStatus('Uploaded ke Supabase!');
        // Optionally push to files list
        setFiles(prev => [{ url: data.url, name: data.path }, ...prev]);
      } else {
        setStatus('Gagal upload: ' + (data?.error || 'unknown'));
      }
    } catch (err) {
      setStatus('Gagal upload: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <Head>
        <title>Open's API (Demo)</title>
      </Head>

      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Open's API (Demo)</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 20,
        marginTop: 30
      }}>
        <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
          <h3>Total Files</h3>
          <p style={{ fontSize: 28 }}>0</p>
        </div>

        <div style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
          <h3>Total Size</h3>
          <p style={{ fontSize: 28 }}>0.00 KB</p>
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
        maxWidth: 900
      }}>
        <h2>Upload File</h2>

        <label className="upload-btn">
          Pilih File
          <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        <button className="submit-btn" onClick={uploadFile} style={{ marginLeft: 12 }}>
          Upload
        </button>

        <p style={{ marginTop: 12 }}>{status}</p>
      </div>

      <h2 style={{ marginTop: 40 }}>Files</h2>
      <ul>
        {files.map(f => (
          <li key={f.url}>
            <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
