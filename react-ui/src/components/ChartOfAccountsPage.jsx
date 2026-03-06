import React, { useState } from "react";
import ChartOfAccountsTree from "./ChartOfAccountsTree";
import AccountPropertiesPanel from "./AccountPropertiesPanel";

function ChartOfAccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: "50%", overflow: "auto", borderRight: "1px solid #ccc" }}>
        <ChartOfAccountsTree onSelect={setSelectedAccount} />
      </div>
      <div style={{ width: "50%", overflow: "auto" }}>
        <AccountPropertiesPanel account={selectedAccount} />
      </div>
    </div>
  );
}

export default ChartOfAccountsPage;
