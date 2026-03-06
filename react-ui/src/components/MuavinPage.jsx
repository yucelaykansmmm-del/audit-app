import React, { useState } from "react";

function MuavinPage() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleLoad = async () => {
    if (!window.api?.openFileDialog || !window.api?.readExcelMuavin) return;
    try {
      const path = await window.api.openFileDialog();
      if (!path) return;
      const data = await window.api.readExcelMuavin(path);
      setRows(data || []);
      setFileName(path.split(/[/\\]/).pop() || path);
    } catch (err) {
      console.error("Muavin yükleme hatası:", err);
      alert("Dosya yüklenirken bir hata oluştu.");
    }
  };

  const handleSave = async () => {
    if (rows.length === 0) return;
    if (!window.api?.saveMuavin) return;
    try {
      await window.api.saveMuavin(rows);
      alert("Muavin başarıyla kaydedildi!");
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Muavin</h2>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={handleLoad}>
          Muavin Yükle
        </button>
        {fileName && <span style={{ color: "#666" }}>{fileName}</span>}
        {rows.length > 0 && (
          <button type="button" onClick={handleSave}>
            Kaydet
          </button>
        )}
      </div>

      {rows.length > 0 && (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Tarih</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Kod</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Ad</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Açıklama</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Borç</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Alacak</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.date}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.code}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.name}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.description}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.borc}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.alacak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MuavinPage;
