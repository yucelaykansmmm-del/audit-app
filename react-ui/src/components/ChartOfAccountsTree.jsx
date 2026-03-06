import React, { useEffect, useState } from "react";

function TreeNode({ node, level = 0, onSelect }) {
  return (
    <div
      style={{
        marginLeft: level * 20,
        padding: "4px 0",
        cursor: onSelect ? "pointer" : "default",
      }}
      onClick={() => onSelect?.(node)}
      role={onSelect ? "button" : undefined}
      onKeyDown={(e) => onSelect && (e.key === "Enter" || e.key === " ") && onSelect(node)}
      tabIndex={onSelect ? 0 : undefined}
    >
      <strong>{node.code}</strong> - {node.name}
      {node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.code} node={child} level={level + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChartOfAccountsTree({ onSelect }) {
  const [rows, setRows] = useState([]);
  const [tree, setTree] = useState([]);

  useEffect(() => {
    async function load() {
      if (!window.api?.getChartOfAccounts) return;
      try {
        const data = await window.api.getChartOfAccounts();
        setRows(data || []);

        const list = data || [];
        const map = {};
        list.forEach((item) => {
          map[item.code] = { ...item, children: [] };
        });

        const root = [];

        list.forEach((item) => {
          if (item.parentCode && map[item.parentCode]) {
            map[item.parentCode].children.push(map[item.code]);
          } else {
            root.push(map[item.code]);
          }
        });

        setTree(root);
      } catch (err) {
        console.error("Hesap planı yükleme hatası:", err);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Hesap Planı (Hiyerarşik Görünüm)</h2>
      {tree.map((node) => (
        <TreeNode key={node.code} node={node} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default ChartOfAccountsTree;
