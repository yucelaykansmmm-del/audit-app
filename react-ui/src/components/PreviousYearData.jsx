import React, { useState, useEffect, useCallback } from "react";

function PreviousYearData() {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [balanceRows, setBalanceRows] = useState([]);
  const [incomeRows, setIncomeRows] = useState([]);
  const [savedBalance, setSavedBalance] = useState([]);
  const [savedIncome, setSavedIncome] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!window.api?.getPreviousYearData) return;
    try {
      const rows = await window.api.getPreviousYearData(year);
      const balance = (rows || []).filter((r) => r.type === "balance");
      const income = (rows || []).filter((r) => r.type === "income");
      setSavedBalance(balance);
      setSavedIncome(income);
    } catch (err) {
      console.error("Önceki yıl verisi yükleme hatası:", err);
    }
  }, [year]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleLoadBalance = async () => {
    if (!window.api?.openFileDialog || !window.api?.readPreviousYearExcel) return;
    try {
      const path = await window.api.openFileDialog();
      if (!path) return;
      const rows = await window.api.readPreviousYearExcel(path);
      setBalanceRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Bilanço Excel okuma hatası:", err);
      alert("Dosya okunamadı.");
    }
  };

  const handleLoadIncome = async () => {
    if (!window.api?.openFileDialog || !window.api?.readPreviousYearExcel) return;
    try {
      const path = await window.api.openFileDialog();
      if (!path) return;
      const rows = await window.api.readPreviousYearExcel(path);
      setIncomeRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Gelir tablosu Excel okuma hatası:", err);
      alert("Dosya okunamadı.");
    }
  };

  const handleLoadBalancePdf = async () => {
    if (!window.api?.openFileDialogPdf || !window.api?.readPreviousYearPdf) return;
    try {
      const filePath = await window.api.openFileDialogPdf();
      if (!filePath) return;
      const rows = await window.api.readPreviousYearPdf(filePath);
      setBalanceRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Bilanço PDF okuma hatası:", err);
      alert("PDF okunamadı.");
    }
  };

  const handleLoadIncomePdf = async () => {
    if (!window.api?.openFileDialogPdf || !window.api?.readPreviousYearPdf) return;
    try {
      const filePath = await window.api.openFileDialogPdf();
      if (!filePath) return;
      const rows = await window.api.readPreviousYearPdf(filePath);
      setIncomeRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error("Gelir tablosu PDF okuma hatası:", err);
      alert("PDF okunamadı.");
    }
  };

  const handleSave = async () => {
    if (!window.api?.savePreviousYearData) return;
    setSaving(true);
    try {
      await window.api.savePreviousYearData({
        year,
        type: "balance",
        rows: balanceRows,
      });
      await window.api.savePreviousYearData({
        year,
        type: "income",
        rows: incomeRows,
      });
      await loadSaved();
      alert("Kaydedildi.");
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const previewRows = (rows, max = 5) =>
    (rows || []).slice(0, max).map((r, i) => (
      <tr key={i}>
        <td style={{ padding: 4, border: "1px solid #eee" }}>{r.code}</td>
        <td style={{ padding: 4, border: "1px solid #eee" }}>{r.name}</td>
        <td style={{ padding: 4, border: "1px solid #eee", textAlign: "right" }}>
          {Number(r.amount).toLocaleString()}
        </td>
      </tr>
    ));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Yıl:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value) || year)}
          min={1990}
          max={2100}
          style={{ width: 80, padding: 4 }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button type="button" onClick={handleLoadBalance}>
          Bilanço Excel Yükle
        </button>
        <button type="button" onClick={handleLoadBalancePdf}>
          PDF'den Bilanço Yükle
        </button>
        <button type="button" onClick={handleLoadIncome}>
          Gelir Tablosu Excel Yükle
        </button>
        <button type="button" onClick={handleLoadIncomePdf}>
          PDF'den Gelir Tablosu Yükle
        </button>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 280 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Yüklenen Bilanço (önizleme)</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "left" }}>Kod</th>
                <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "left" }}>Ad</th>
                <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "right" }}>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {balanceRows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 8, color: "#666" }}>
                    Henüz yüklenmedi
                  </td>
                </tr>
              ) : (
                previewRows(balanceRows)
              )}
            </tbody>
          </table>
          {balanceRows.length > 5 && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              +{balanceRows.length - 5} satır daha
            </div>
          )}
        </div>

        <div style={{ minWidth: 280 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Yüklenen Gelir Tablosu (önizleme)</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "left" }}>Kod</th>
                <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "left" }}>Ad</th>
                <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "right" }}>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {incomeRows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 8, color: "#666" }}>
                    Henüz yüklenmedi
                  </td>
                </tr>
              ) : (
                previewRows(incomeRows)
              )}
            </tbody>
          </table>
          {incomeRows.length > 5 && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              +{incomeRows.length - 5} satır daha
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Kaydedilmiş veriler ({year})</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ minWidth: 200 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>Bilanço: {savedBalance.length} satır</div>
            {savedBalance.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th style={{ padding: 4, border: "1px solid #ccc" }}>Kod</th>
                    <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "right" }}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {savedBalance.slice(0, 8).map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: 4, border: "1px solid #eee" }}>{r.code}</td>
                      <td style={{ padding: 4, border: "1px solid #eee", textAlign: "right" }}>
                        {Number(r.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {savedBalance.length > 8 && (
              <div style={{ fontSize: 12, color: "#666" }}>+{savedBalance.length - 8} satır daha</div>
            )}
          </div>
          <div style={{ minWidth: 200 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>Gelir tablosu: {savedIncome.length} satır</div>
            {savedIncome.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#eee" }}>
                    <th style={{ padding: 4, border: "1px solid #ccc" }}>Kod</th>
                    <th style={{ padding: 4, border: "1px solid #ccc", textAlign: "right" }}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {savedIncome.slice(0, 8).map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: 4, border: "1px solid #eee" }}>{r.code}</td>
                      <td style={{ padding: 4, border: "1px solid #eee", textAlign: "right" }}>
                        {Number(r.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {savedIncome.length > 8 && (
              <div style={{ fontSize: 12, color: "#666" }}>+{savedIncome.length - 8} satır daha</div>
            )}
          </div>
        </div>
        {savedBalance.length === 0 && savedIncome.length === 0 && (
          <p style={{ color: "#666", marginTop: 8 }}>Bu yıl için kayıtlı veri yok.</p>
        )}
      </div>
    </div>
  );
}

export default PreviousYearData;
