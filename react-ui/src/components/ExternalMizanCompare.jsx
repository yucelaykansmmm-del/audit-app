import React, { useState, useCallback } from "react";
import DetailModal from "./DetailModal";

function compareMizan(internalMizan, internalNameByCode, externalMizan) {
  const internalMap = new Map();
  (internalMizan || []).forEach((r) => {
    internalMap.set(r.code, {
      borc: Number(r.toplam_borc) || 0,
      alacak: Number(r.toplam_alacak) || 0,
    });
  });

  const externalMap = new Map();
  (externalMizan || []).forEach((r) => {
    externalMap.set(r.code, {
      borc: Number(r.borc) || 0,
      alacak: Number(r.alacak) || 0,
      name: r.name != null ? String(r.name).trim() : "",
    });
  });

  const allCodes = new Set([
    ...(internalMizan || []).map((r) => r.code),
    ...(externalMizan || []).map((r) => r.code),
  ]);

  const result = [];
  allCodes.forEach((code) => {
    const internal = internalMap.get(code);
    const external = externalMap.get(code);
    const internal_borc = internal ? internal.borc : 0;
    const internal_alacak = internal ? internal.alacak : 0;
    const external_borc = external ? external.borc : 0;
    const external_alacak = external ? external.alacak : 0;
    const fark_borc = internal_borc - external_borc;
    const fark_alacak = internal_alacak - external_alacak;
    const internal_name = (internalNameByCode && internalNameByCode.get(code)) || "";
    const external_name = external ? external.name : "";

    let durum;
    if (!internal && external) {
      durum = "eksik";
    } else if (internal && !external) {
      durum = "fazla";
    } else {
      if (fark_borc !== 0 || fark_alacak !== 0) {
        durum = "tutar_farki";
      } else if (internal_name !== external_name) {
        durum = "ad_farki";
      } else {
        durum = "uyumlu";
      }
    }

    result.push({
      code,
      internal_borc,
      internal_alacak,
      external_borc,
      external_alacak,
      fark_borc,
      fark_alacak,
      durum,
    });
  });

  return result.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
}

function getRowStyle(durum) {
  if (durum === "uyumlu") return { background: "#ddffdd" };
  if (durum === "ad_farki") return { background: "#ffe8cc" };
  return { background: "#ffdddd" };
}

function computeStats(rows) {
  return {
    total: rows.length,
    uyumlu: rows.filter((r) => r.durum === "uyumlu").length,
    tutar_farki: rows.filter((r) => r.durum === "tutar_farki").length,
    eksik: rows.filter((r) => r.durum === "eksik").length,
    fazla: rows.filter((r) => r.durum === "fazla").length,
    ad_farki: rows.filter((r) => r.durum === "ad_farki").length,
  };
}

function ExternalMizanCompare() {
  const [externalMizan, setExternalMizan] = useState(null);
  const [internalMizan, setInternalMizan] = useState(null);
  const [compareResults, setCompareResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState("all");

  const openDetailModal = useCallback((code) => {
    const internalRow = (compareResults || []).find((r) => r.code === code) ?? null;
    const externalRow = (externalMizan || []).find((r) => r.code === code) ?? null;
    setDetail({ code, internalRow, externalRow });
  }, [compareResults, externalMizan]);

  const handleLoadAndCompare = useCallback(async () => {
    if (!window.api?.openFileDialog || !window.api?.getMizanTotals || !window.api?.readExternalMizanExcel) return;
    setLoading(true);
    setCompareResults(null);
    try {
      const path = await window.api.openFileDialog();
      if (!path) {
        setLoading(false);
        return;
      }
      const external = await window.api.readExternalMizanExcel(path);
      setExternalMizan(Array.isArray(external) ? external : []);

      const [internal, plan] = await Promise.all([
        window.api.getMizanTotals(),
        window.api.getChartOfAccounts ? window.api.getChartOfAccounts() : Promise.resolve([]),
      ]);
      setInternalMizan(internal || []);

      const internalNameByCode = new Map();
      (plan || []).forEach((p) => internalNameByCode.set(p.code, p.name || ""));

      const results = compareMizan(internal || [], internalNameByCode, Array.isArray(external) ? external : []);
      setCompareResults(results);
    } catch (err) {
      console.error("Dış mizan karşılaştırma hatası:", err);
      alert("Dosya okunamadı veya karşılaştırma yapılamadı.");
    } finally {
      setLoading(false);
    }
  }, []);

  const hasExternal = externalMizan != null && externalMizan.length > 0;
  const stats = compareResults ? computeStats(compareResults) : null;
  const filteredResults =
    compareResults && filter !== "all"
      ? compareResults.filter((r) => r.durum === filter)
      : compareResults;

  return (
    <div>
      {!hasExternal && !loading && (
        <p style={{ color: "#666", marginBottom: 12 }}>
          Dış mizan yüklenmedi. Karşılaştırma yapmak için dosya seçin.
        </p>
      )}

      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={handleLoadAndCompare} disabled={loading}>
          {loading ? "Yükleniyor..." : "Dış Mizan Yükle ve Karşılaştır"}
        </button>
      </div>

      {compareResults && stats && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            margin: "15px 0",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              background: "#f5f5f5",
              border: filter === "all" ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "6px",
              minWidth: "140px",
              cursor: "pointer",
            }}
            onClick={() => setFilter("all")}
          >
            Toplam: {stats.total}
          </div>
          <div
            style={{
              padding: "10px 14px",
              background:
                filter === "uyumlu" ? "#ccffcc" : "#ddffdd",
              border: filter === "uyumlu" ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "6px",
              minWidth: "140px",
              cursor: "pointer",
            }}
            onClick={() => setFilter("uyumlu")}
          >
            Uyumlu: {stats.uyumlu}
          </div>
          <div
            style={{
              padding: "10px 14px",
              background:
                filter === "tutar_farki"
                  ? stats.tutar_farki > 0
                    ? "#ffcccc"
                    : "#ccffcc"
                  : stats.tutar_farki > 0
                    ? "#ffdddd"
                    : "#ddffdd",
              border:
                filter === "tutar_farki" ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "6px",
              minWidth: "140px",
              cursor: "pointer",
            }}
            onClick={() => setFilter("tutar_farki")}
          >
            Tutar Farkı: {stats.tutar_farki}
          </div>
          <div
            style={{
              padding: "10px 14px",
              background:
                filter === "eksik"
                  ? stats.eksik > 0
                    ? "#ffcccc"
                    : "#ccffcc"
                  : stats.eksik > 0
                    ? "#ffdddd"
                    : "#ddffdd",
              border: filter === "eksik" ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "6px",
              minWidth: "140px",
              cursor: "pointer",
            }}
            onClick={() => setFilter("eksik")}
          >
            Eksik: {stats.eksik}
          </div>
          <div
            style={{
              padding: "10px 14px",
              background:
                filter === "fazla"
                  ? stats.fazla > 0
                    ? "#ffcccc"
                    : "#ccffcc"
                  : stats.fazla > 0
                    ? "#ffdddd"
                    : "#ddffdd",
              border: filter === "fazla" ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "6px",
              minWidth: "140px",
              cursor: "pointer",
            }}
            onClick={() => setFilter("fazla")}
          >
            Fazla: {stats.fazla}
          </div>
          <div
            style={{
              padding: "10px 14px",
              background:
                filter === "ad_farki"
                  ? stats.ad_farki > 0
                    ? "#ffddbb"
                    : "#ccffcc"
                  : stats.ad_farki > 0
                    ? "#ffe8cc"
                    : "#ddffdd",
              border:
                filter === "ad_farki" ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "6px",
              minWidth: "140px",
              cursor: "pointer",
            }}
            onClick={() => setFilter("ad_farki")}
          >
            Ad Farkı: {stats.ad_farki}
          </div>
        </div>
      )}

      {filteredResults != null && filteredResults.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Kod</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>İç Borç</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>İç Alacak</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Dış Borç</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Dış Alacak</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Fark</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r) => (
              <tr
                key={r.code}
                style={{ ...getRowStyle(r.durum), cursor: "pointer" }}
                onClick={() => openDetailModal(r.code)}
              >
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.code}</td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  {r.internal_borc.toLocaleString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  {r.internal_alacak.toLocaleString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  {r.external_borc.toLocaleString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  {r.external_alacak.toLocaleString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  {r.fark_borc !== 0 || r.fark_alacak !== 0
                    ? `B: ${r.fark_borc.toLocaleString()} / A: ${r.fark_alacak.toLocaleString()}`
                    : "0"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {r.durum === "uyumlu" && "Uyumlu"}
                  {r.durum === "tutar_farki" && "Tutar farkı"}
                  {r.durum === "eksik" && "Eksik (dışta var)"}
                  {r.durum === "fazla" && "Fazla (içte var)"}
                  {r.durum === "ad_farki" && "Ad farkı"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {compareResults != null && compareResults.length === 0 && (
        <p style={{ color: "#666" }}>Karşılaştırılacak hesap kodu yok.</p>
      )}

      {compareResults != null &&
        compareResults.length > 0 &&
        filteredResults?.length === 0 && (
          <p style={{ color: "#666" }}>Seçilen filtrede kayıt yok.</p>
        )}

      {detail !== null && (
        <DetailModal
          code={detail.code}
          internalRow={detail.internalRow}
          externalRow={detail.externalRow}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

export default ExternalMizanCompare;
