import React, { useEffect, useState } from "react";

function ChartOfAccountsList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      if (!window.api?.getChartOfAccounts) return;
      try {
        const data = await window.api.getChartOfAccounts();
        setRows(data || []);
      } catch (err) {
        console.error("Hesap planı yükleme hatası:", err);
      }
    }
    load();
  }, []);

  const filtered = rows.filter(
    (r) =>
      (r.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 16 }}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ara..."
        style={{ marginBottom: 12, padding: 8, width: "100%", maxWidth: 320 }}
      />
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Kod</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Ad</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Seviye</th>
            <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Parent Kod</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.code}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.name}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.level}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{row.parentCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChartOfAccountsList;
