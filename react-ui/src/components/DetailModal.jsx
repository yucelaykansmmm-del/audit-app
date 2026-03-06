import React, { useState, useEffect } from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const boxStyle = {
  background: "white",
  borderRadius: 8,
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  padding: 20,
  maxWidth: 900,
  width: "90%",
  maxHeight: "85vh",
  overflow: "auto",
};

const panelStyle = {
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: 12,
  flex: 1,
  minWidth: 0,
};

function computeMuavinTotals(rows) {
  let borc = 0;
  let alacak = 0;
  (rows || []).forEach((r) => {
    borc += Number(r.borc) || 0;
    alacak += Number(r.alacak) || 0;
  });
  return { borc, alacak };
}

function analyzeDifference(internalRow, externalRow, muavinTotals, internalName, externalName) {
  const messages = [];
  let severity = "ok"; // ok | warn | error

  const internal = internalRow ?? { internal_borc: 0, internal_alacak: 0 };
  const external = externalRow ?? { borc: 0, alacak: 0 };

  // 1) İç vs dış mizan tutar farkı
  const borcDiff = (Number(internal.internal_borc) || 0) - (Number(external.borc) || 0);
  const alacakDiff = (Number(internal.internal_alacak) || 0) - (Number(external.alacak) || 0);

  if (borcDiff === 0 && alacakDiff === 0) {
    messages.push("İç ve dış mizan tutarları uyumlu.");
  } else {
    severity = "error";
    const diffText = `
         Borç farkı: ${borcDiff.toLocaleString()},
         Alacak farkı: ${alacakDiff.toLocaleString()}
       `;
    messages.push("İç ve dış mizan arasında tutar farkı var. " + diffText);
  }

  // 2) Muavin toplamı vs iç mizan
  const intBorc = Number(internal.internal_borc) || 0;
  const intAlacak = Number(internal.internal_alacak) || 0;
  const muavinBorcDiff = (muavinTotals?.borc ?? 0) - intBorc;
  const muavinAlacakDiff = (muavinTotals?.alacak ?? 0) - intAlacak;

  if (muavinBorcDiff === 0 && muavinAlacakDiff === 0) {
    messages.push("Muavin toplamı iç mizana uyumlu.");
  } else {
    severity = "error";
    messages.push(
      "Muavin toplamı iç mizandan farklı. " +
        "Borç farkı: " + muavinBorcDiff.toLocaleString() + ", " +
        "Alacak farkı: " + muavinAlacakDiff.toLocaleString()
    );
  }

  // 3) Ad farkı
  if (internalName && externalName && internalName !== externalName) {
    if (severity === "ok") severity = "warn";
    messages.push(`Hesap adları farklı: İç = "${internalName}", Dış = "${externalName}".`);
  }

  return { messages, severity };
}

function DetailModal({ code, internalRow, externalRow, onClose }) {
  const [muavinRows, setMuavinRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalName, setInternalName] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMuavinRows([]);
      setInternalName("");

      try {
        const [rows, plan] = await Promise.all([
          window.api.getMuavinByCode ? window.api.getMuavinByCode(code) : Promise.resolve([]),
          window.api.getChartOfAccounts ? window.api.getChartOfAccounts() : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setMuavinRows(Array.isArray(rows) ? rows : []);
          const found = (plan || []).find((p) => p.code === code);
          setInternalName(found ? (found.name || "") : "");
        }
      } catch (err) {
        if (!cancelled) setMuavinRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [code]);

  const internalBakiye = internalRow
    ? (Number(internalRow.internal_borc) || 0) - (Number(internalRow.internal_alacak) || 0)
    : 0;
  const externalBakiye = externalRow
    ? (Number(externalRow.borc) || 0) - (Number(externalRow.alacak) || 0)
    : 0;

  const durumLabel =
    internalRow?.durum === "uyumlu"
      ? "Uyumlu"
      : internalRow?.durum === "tutar_farki"
        ? "Tutar farkı"
        : internalRow?.durum === "eksik"
          ? "Eksik (dışta var)"
          : internalRow?.durum === "fazla"
            ? "Fazla (içte var)"
            : internalRow?.durum === "ad_farki"
              ? "Ad farkı"
              : "";

  const totals = computeMuavinTotals(muavinRows);
  const analysis = analyzeDifference(
    internalRow,
    externalRow,
    totals,
    internalName,
    externalRow?.name
  );

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <strong>Hesap kodu: {code}</strong>
            {durumLabel && (
              <span style={{ marginLeft: 12, color: "#666" }}>Durum: {durumLabel}</span>
            )}
          </div>
          <button type="button" onClick={onClose}>
            Kapat
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <div style={panelStyle}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>İç Mizan</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0" }}>Kod</td><td style={{ padding: "4px 0" }}>{code}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Ad</td><td style={{ padding: "4px 0" }}>{internalName || "—"}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Borç</td><td style={{ padding: "4px 0", textAlign: "right" }}>{(internalRow ? Number(internalRow.internal_borc) || 0 : 0).toLocaleString()}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Alacak</td><td style={{ padding: "4px 0", textAlign: "right" }}>{(internalRow ? Number(internalRow.internal_alacak) || 0 : 0).toLocaleString()}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Bakiye</td><td style={{ padding: "4px 0", textAlign: "right" }}>{internalBakiye.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
          <div style={panelStyle}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Dış Mizan</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                <tr><td style={{ padding: "4px 0" }}>Kod</td><td style={{ padding: "4px 0" }}>{code}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Ad</td><td style={{ padding: "4px 0" }}>{externalRow ? (externalRow.name || "—") : "—"}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Borç</td><td style={{ padding: "4px 0", textAlign: "right" }}>{(externalRow ? Number(externalRow.borc) || 0 : 0).toLocaleString()}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Alacak</td><td style={{ padding: "4px 0", textAlign: "right" }}>{(externalRow ? Number(externalRow.alacak) || 0 : 0).toLocaleString()}</td></tr>
                <tr><td style={{ padding: "4px 0" }}>Bakiye</td><td style={{ padding: "4px 0", textAlign: "right" }}>{externalBakiye.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background:
              analysis.severity === "ok"
                ? "#ddffdd"
                : analysis.severity === "warn"
                  ? "#ffe8cc"
                  : "#ffdddd",
          }}
        >
          {analysis.messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 4 }}>{m}</div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Muavin Hareketleri</div>
          {loading ? (
            <p style={{ color: "#666" }}>Yükleniyor...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Tarih</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Belge No</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Açıklama</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>Borç</th>
                  <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>Alacak</th>
                </tr>
              </thead>
              <tbody>
                {muavinRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ border: "1px solid #ddd", padding: 8, color: "#666" }}>
                      Hareket yok
                    </td>
                  </tr>
                ) : (
                  muavinRows.map((row, i) => (
                    <tr key={i}>
                      <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.date || "—"}</td>
                      <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.belge_no ?? "—"}</td>
                      <td style={{ border: "1px solid #ddd", padding: 8 }}>{row.description ?? "—"}</td>
                      <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>
                        {(Number(row.borc) || 0).toLocaleString()}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "right" }}>
                        {(Number(row.alacak) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
