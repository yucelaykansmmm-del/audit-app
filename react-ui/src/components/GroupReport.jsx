import React from "react";

function extractLevel(plan, level) {
  const result = [];
  function walk(node) {
    if (node.level === level) result.push(node);
    if (node.children) node.children.forEach(walk);
  }
  (plan || []).forEach(walk);
  return result;
}

function computeTotals(node) {
  let borc = node.borc || 0;
  let alacak = node.alacak || 0;

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const c = computeTotals(child);
      borc += c.borc;
      alacak += c.alacak;
    });
  }

  return { borc, alacak, bakiye: borc - alacak };
}

function GroupReport({ plan = [], level = 1 }) {
  const nodes = extractLevel(plan, level);

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Kod</th>
          <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Ad</th>
          <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Borç</th>
          <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Alacak</th>
          <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Bakiye</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map((n) => {
          const t = computeTotals(n);
          return (
            <tr key={n.code}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.code}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{n.name}</td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                {Number(t.borc).toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                {Number(t.alacak).toLocaleString()}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                {Number(t.bakiye).toLocaleString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default GroupReport;
