import React, { useEffect, useState } from "react";

const DEFAULT_PROPERTIES = {
  kkeg: false,
  calisma_sekli: "",
  hesap_tipi: "",
  raporlama_grubu: "",
  notlar: "",
};

const CALISMA_SEKLI_OPTIONS = [
  { value: "", label: "Seçiniz" },
  { value: "Borç ağırlıklı", label: "Borç ağırlıklı" },
  { value: "Alacak ağırlıklı", label: "Alacak ağırlıklı" },
  { value: "Dönem içi", label: "Dönem içi" },
  { value: "Dönem sonu", label: "Dönem sonu" },
];

const HESAP_TIPI_OPTIONS = [
  { value: "", label: "Seçiniz" },
  { value: "Varlık", label: "Varlık" },
  { value: "Kaynak", label: "Kaynak" },
  { value: "Gelir", label: "Gelir" },
  { value: "Gider", label: "Gider" },
  { value: "Nazım", label: "Nazım" },
];

const RAPORLAMA_GRUBU_OPTIONS = [
  { value: "", label: "Seçiniz" },
  { value: "Finansal gider", label: "Finansal gider" },
  { value: "Pazarlama gideri", label: "Pazarlama gideri" },
  { value: "Stok", label: "Stok" },
  { value: "Nakit", label: "Nakit" },
  { value: "Diğer", label: "Diğer" },
];

function AccountPropertiesPanel({ account }) {
  const [properties, setProperties] = useState({ ...DEFAULT_PROPERTIES });

  useEffect(() => {
    if (!account?.code || !window.api?.getAccountProperties) {
      setProperties({ ...DEFAULT_PROPERTIES });
      return;
    }
    async function load() {
      try {
        const data = await window.api.getAccountProperties(account.code);
        if (data) {
          setProperties({
            kkeg: !!data.kkeg,
            calisma_sekli: data.calisma_sekli || "",
            hesap_tipi: data.hesap_tipi || "",
            raporlama_grubu: data.raporlama_grubu || "",
            notlar: data.notlar || "",
          });
        } else {
          setProperties({ ...DEFAULT_PROPERTIES });
        }
      } catch (err) {
        console.error("Hesap özellikleri yükleme hatası:", err);
        setProperties({ ...DEFAULT_PROPERTIES });
      }
    }
    load();
  }, [account?.code]);

  const handleChange = (field, value) => {
    setProperties((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!account?.code || !window.api?.saveAccountProperties) return;
    try {
      await window.api.saveAccountProperties({
        code: account.code,
        ...properties,
        kkeg: properties.kkeg ? 1 : 0,
      });
      alert("Hesap özellikleri kaydedildi.");
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Kaydetme sırasında bir hata oluştu.");
    }
  };

  if (!account) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Hesap Özellikleri</h2>
        <p style={{ color: "#666" }}>Özellikleri görüntülemek için soldan bir hesap seçin.</p>
      </div>
    );
  }

  const formStyle = { marginBottom: 12 };
  const labelStyle = { display: "block", marginBottom: 4, fontWeight: 500 };
  const inputStyle = { width: "100%", maxWidth: 320, padding: 8 };

  return (
    <div style={{ padding: 16 }}>
      <h2>Hesap Özellikleri</h2>

      <div style={formStyle}>
        <label style={labelStyle}>Hesap kodu</label>
        <input
          type="text"
          readOnly
          value={account.code}
          style={{ ...inputStyle, background: "#f5f5f5" }}
        />
      </div>

      <div style={formStyle}>
        <label style={labelStyle}>Hesap adı</label>
        <input
          type="text"
          readOnly
          value={account.name}
          style={{ ...inputStyle, background: "#f5f5f5" }}
        />
      </div>

      <div style={formStyle}>
        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={properties.kkeg}
            onChange={(e) => handleChange("kkeg", e.target.checked)}
          />
          KKEG
        </label>
      </div>

      <div style={formStyle}>
        <label style={labelStyle}>Çalışma şekli</label>
        <select
          value={properties.calisma_sekli}
          onChange={(e) => handleChange("calisma_sekli", e.target.value)}
          style={inputStyle}
        >
          {CALISMA_SEKLI_OPTIONS.map((opt) => (
            <option key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={formStyle}>
        <label style={labelStyle}>Hesap tipi</label>
        <select
          value={properties.hesap_tipi}
          onChange={(e) => handleChange("hesap_tipi", e.target.value)}
          style={inputStyle}
        >
          {HESAP_TIPI_OPTIONS.map((opt) => (
            <option key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={formStyle}>
        <label style={labelStyle}>Raporlama grubu</label>
        <select
          value={properties.raporlama_grubu}
          onChange={(e) => handleChange("raporlama_grubu", e.target.value)}
          style={inputStyle}
        >
          {RAPORLAMA_GRUBU_OPTIONS.map((opt) => (
            <option key={opt.value || "empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={formStyle}>
        <label style={labelStyle}>Notlar</label>
        <textarea
          value={properties.notlar}
          onChange={(e) => handleChange("notlar", e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <button type="button" onClick={handleSave}>
        Kaydet
      </button>
    </div>
  );
}

export default AccountPropertiesPanel;
