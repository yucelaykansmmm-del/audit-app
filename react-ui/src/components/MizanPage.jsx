import React, { useCallback, useEffect, useMemo, useState } from "react";
import HierarchicalMizan from "./HierarchicalMizan";
import GroupReport from "./GroupReport";
import ExternalMizanCompare from "./ExternalMizanCompare";
import FinancialTables from "./FinancialTables";

function enrichTreeWithMizan(tree, mizanTotals) {
  const byCode = new Map();
  (mizanTotals || []).forEach((r) => byCode.set(r.code, r));

  function clone(node) {
    const m = byCode.get(node.code);
    const borc = m ? Number(m.toplam_borc) || 0 : 0;
    const alacak = m ? Number(m.toplam_alacak) || 0 : 0;
    const next = {
      ...node,
      borc,
      alacak,
      children: (node.children || []).map(clone),
    };
    return next;
  }

  return (tree || []).map(clone);
}

function MizanPage() {
  const [rows, setRows] = useState([]);
  const [hasUnmatched, setHasUnmatched] = useState(false);
  const [planTree, setPlanTree] = useState([]);
  const [mizanTotals, setMizanTotals] = useState([]);
  const [activeTab, setActiveTab] = useState("mizan");
  const [reportLevel, setReportLevel] = useState(1);

  const enrichedPlanTree = useMemo(
    () => enrichTreeWithMizan(planTree, mizanTotals),
    [planTree, mizanTotals]
  );

  const loadMizan = useCallback(async () => {
    if (!window.api?.getMizan || !window.api?.getChartOfAccountsTree || !window.api?.getMizanTotals) return;
    try {
      const [matchRows, tree, totals] = await Promise.all([
        window.api.getMizan(),
        window.api.getChartOfAccountsTree(),
        window.api.getMizanTotals(),
      ]);
      setRows(matchRows || []);
      setHasUnmatched((matchRows || []).some((r) => r.eslesmis === 0));
      setPlanTree(tree || []);
      setMizanTotals(totals || []);
    } catch (err) {
      console.error("Mizan yükleme hatası:", err);
    }
  }, []);

  useEffect(() => {
    loadMizan();
  }, [loadMizan]);

  const handleUpdatePlan = async () => {
    if (!window.api?.openFileDialog || !window.api?.updateChartOfAccounts) return;
    try {
      const path = await window.api.openFileDialog();
      if (!path) return;
      const result = await window.api.updateChartOfAccounts(path);
      if (result?.success) {
        alert("Hesap planı güncellendi. Mizan yeniden oluşturuluyor.");
        loadMizan();
      }
    } catch (err) {
      console.error("Hesap planı güncelleme hatası:", err);
      alert("Güncelleme sırasında bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Mizan</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("mizan")}
          style={{ fontWeight: activeTab === "mizan" ? 700 : 400 }}
        >
          Mizan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rapor")}
          style={{ fontWeight: activeTab === "rapor" ? 700 : 400 }}
        >
          Grup Bazlı Rapor
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("mutabakat")}
          style={{ fontWeight: activeTab === "mutabakat" ? 700 : 400 }}
        >
          Dış Mizan Mutabakatı
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("financial")}
          style={{ fontWeight: activeTab === "financial" ? 700 : 400 }}
        >
          Finansal Tablolar
        </button>
      </div>

      {activeTab === "mizan" && (
        <>
          {hasUnmatched && (
            <div
              style={{
                background: "#ffdddd",
                padding: 10,
                marginBottom: 10,
                border: "1px solid #ffaaaa",
              }}
            >
              Muavinde olup hesap planında bulunmayan hesaplar var. Bu durum
              hesap planının güncel olmadığını gösterir.
              <button
                type="button"
                onClick={handleUpdatePlan}
                style={{ marginLeft: 10 }}
              >
                Hesap Planını Güncelle
              </button>
            </div>
          )}
          <HierarchicalMizan plan={planTree} mizan={mizanTotals} />
        </>
      )}

      {activeTab === "rapor" && (
        <div>
          <div style={{ marginBottom: 10 }}>
            <label>Seviye: </label>
            <select
              value={reportLevel}
              onChange={(e) => setReportLevel(Number(e.target.value))}
            >
              <option value={1}>Level 1 (Ana Gruplar)</option>
              <option value={2}>Level 2 (Ana Hesaplar)</option>
              <option value={3}>Level 3 (Ara Hesaplar)</option>
            </select>
          </div>
          <GroupReport plan={enrichedPlanTree} level={reportLevel} />
        </div>
      )}

      {activeTab === "mutabakat" && <ExternalMizanCompare />}

      {activeTab === "financial" && <FinancialTables />}

      {planTree.length === 0 && (
        <p style={{ color: "#666", marginTop: 16 }}>
          Hesap planı veya mizan verisi yok.
        </p>
      )}
    </div>
  );
}

export default MizanPage;
