import React, { useMemo, useState } from "react";

function getRowStyle(level) {
  if (level === 1) {
    return {
      background: "#f0f4ff",
      fontWeight: 700,
      paddingLeft: 8,
    };
  }
  if (level === 2) {
    return {
      background: "#f7faff",
      fontWeight: 600,
      paddingLeft: 16,
    };
  }
  if (level === 3 || level === 4) {
    return {
      background: "white",
      fontWeight: 500,
      paddingLeft: level * 12,
    };
  }
  return {
    background: "white",
    fontWeight: 400,
    paddingLeft: (level || 1) * 12,
  };
}

function HierarchicalMizan({ plan = [], mizan = [] }) {
  const [expanded, setExpanded] = useState({});

  const mizanMap = useMemo(() => {
    const map = new Map();
    (mizan || []).forEach((r) => map.set(r.code, r));
    return map;
  }, [mizan]);

  function toggle(code) {
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  function computeTotals(node) {
    let borc = 0;
    let alacak = 0;

    if (mizanMap.has(node.code)) {
      const r = mizanMap.get(node.code);
      borc += Number(r.toplam_borc) || 0;
      alacak += Number(r.toplam_alacak) || 0;
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const c = computeTotals(child);
        borc += c.borc;
        alacak += c.alacak;
      });
    }

    return { borc, alacak, bakiye: borc - alacak };
  }

  function renderNode(node) {
    const totals = computeTotals(node);
    const hasChildren = node.children && node.children.length > 0;
    const isOpen = expanded[node.code];
    const level = node.level || 1;

    return (
      <div key={node.code}>
        <div
          style={{
            display: "flex",
            ...getRowStyle(level),
            borderBottom: "1px solid #eee",
            padding: "6px 8px",
          }}
        >
          <div
            style={{
              width: "40%",
              cursor: hasChildren ? "pointer" : "default",
            }}
            onClick={() => hasChildren && toggle(node.code)}
          >
            {hasChildren ? (isOpen ? "▼ " : "▶ ") : "• "}
            {node.code} – {node.name}
          </div>
          <div style={{ width: "20%", textAlign: "right" }}>
            {totals.borc.toLocaleString()}
          </div>
          <div style={{ width: "20%", textAlign: "right" }}>
            {totals.alacak.toLocaleString()}
          </div>
          <div style={{ width: "20%", textAlign: "right" }}>
            {totals.bakiye.toLocaleString()}
          </div>
        </div>

        {isOpen && hasChildren && (
          <div>
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          padding: "6px 8px",
          borderBottom: "2px solid #ccc",
          fontWeight: 700,
          background: "#eee",
        }}
      >
        <div style={{ width: "40%" }}>Hesap</div>
        <div style={{ width: "20%", textAlign: "right" }}>Borç</div>
        <div style={{ width: "20%", textAlign: "right" }}>Alacak</div>
        <div style={{ width: "20%", textAlign: "right" }}>Bakiye</div>
      </div>
      {(plan || []).map((root) => renderNode(root))}
    </div>
  );
}

export default HierarchicalMizan;
