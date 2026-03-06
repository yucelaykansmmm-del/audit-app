import React, { useState } from "react";

const CODE_KEYS = ["code", "Code", "Hesap Kodu", "hesap kodu", "kod"];
const NAME_KEYS = ["name", "Name", "Hesap Adı", "hesap adı", "ad"];

function findColumnValue(row, keys) {
  const lower = (v) => (v == null ? "" : String(v).trim().toLowerCase());
  const rowKeys = Object.keys(row || {});
  for (const key of keys) {
    const found = rowKeys.find((rk) => lower(rk) === lower(key));
    if (found != null && row[found] != null && String(row[found]).trim() !== "") {
      return String(row[found]).trim();
    }
  }
  return "";
}

function normalizeAccountRow(row) {
  const code = findColumnValue(row, CODE_KEYS);
  const name = findColumnValue(row, NAME_KEYS);
  const level = code ? code.split(".").length : 0;
  const parentCode = code.includes(".")
    ? code.split(".").slice(0, -1).join(".")
    : "";
  return { code, name, level, parentCode };
}

function ChartOfAccountsImport() {
  const [previewRows, setPreviewRows] = useState([]);

  const handleSelectExcel = async () => {
    if (!window.api?.selectExcelFile || !window.api?.readExcelFile) return;
    try {
      const filePath = await window.api.selectExcelFile();
      if (!filePath) return;
      const rows = await window.api.readExcelFile(filePath);
      const normalized = (rows || []).map(normalizeAccountRow);
      console.log("Normalize Edilmiş Satırlar:", normalized);
      setPreviewRows(normalized);
    } catch (err) {
      console.error("Excel okuma hatası:", err);
    }
  };

  const handleSave = async () => {
    if (previewRows.length === 0) return;
    try {
      const result = await window.api.saveChartOfAccounts(previewRows);
      console.log("Kayıt sonucu:", result);
      alert("Hesap planı başarıyla kaydedildi!");
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  return (
    <div>
      <button type="button" onClick={handleSelectExcel}>
        Excel Yükle
      </button>
      {previewRows.length > 0 && (
        <button type="button" onClick={handleSave}>
          Kaydet
        </button>
      )}
      {previewRows.length > 0 && (
        <table style={{ marginTop: 20, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Kod</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Ad</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Seviye</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Parent Kod</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.code}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.name}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.level}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.parentCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ChartOfAccountsImport;
export { normalizeAccountRow };
