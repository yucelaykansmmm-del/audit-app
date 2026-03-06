import React, { useEffect, useState } from "react";
import ChartOfAccountsTree from "./ChartOfAccountsTree";

function MatchingPage() {
  const [codes, setCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedPlanNode, setSelectedPlanNode] = useState(null);
  const [matches, setMatches] = useState({});

  useEffect(() => {
    async function load() {
      if (!window.api?.getMuavinCodes || !window.api?.getAllMatches) return;
      try {
        const codeRows = await window.api.getMuavinCodes();
        setCodes((codeRows || []).map((r) => r.code));
        const map = await window.api.getAllMatches();
        setMatches(map || {});
      } catch (err) {
        console.error("Eşleştirme verisi yükleme hatası:", err);
      }
    }
    load();
  }, []);

  const handleMatch = async () => {
    if (!selectedCode || !selectedPlanNode || !window.api?.saveMatch) return;
    try {
      await window.api.saveMatch({
        code: selectedCode,
        matched_code: selectedPlanNode.code,
        matched_name: selectedPlanNode.name,
      });
      const map = await window.api.getAllMatches();
      setMatches(map || {});
      setSelectedPlanNode(null);
    } catch (err) {
      console.error("Eşleştirme kaydetme hatası:", err);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  const isMatched = (code) => matches[code]?.matched_code;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          width: "50%",
          overflow: "auto",
          borderRight: "1px solid #ccc",
          padding: 16,
        }}
      >
        <h2>Muavin Hesap Kodları</h2>
        <p style={{ color: "#666", fontSize: 14 }}>
          Eşleştirmek için bir kod seçin.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {codes.map((code) => (
            <li
              key={code}
              onClick={() => {
                setSelectedCode(code);
                setSelectedPlanNode(null);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                background: selectedCode === code ? "#e8f4fd" : "transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{code}</span>
              <span style={{ fontWeight: "bold" }}>
                {isMatched(code) ? "✓" : "✗"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ width: "50%", overflow: "auto", padding: 16 }}>
        <h2>Hesap Planı Eşleştirme</h2>
        {selectedCode ? (
          <>
            <p>
              <strong>Seçilen Kod:</strong> {selectedCode}
            </p>
            <p style={{ color: "#666", fontSize: 14 }}>
              Hesap planından doğru hesabı seçin.
            </p>
            <ChartOfAccountsTree onSelect={setSelectedPlanNode} />
            {selectedPlanNode && (
              <div style={{ marginTop: 16 }}>
                <p style={{ marginBottom: 8 }}>
                  Seçilen hesap: <strong>{selectedPlanNode.code}</strong> -{" "}
                  {selectedPlanNode.name}
                </p>
                <button type="button" onClick={handleMatch}>
                  Eşleştir
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: "#666" }}>
            Soldan bir muavin kodu seçin.
          </p>
        )}
      </div>
    </div>
  );
}

export default MatchingPage;
