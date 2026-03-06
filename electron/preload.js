const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectExcelFile: () => ipcRenderer.invoke("select-excel-file"),
  readExcelFile: (filePath) => ipcRenderer.invoke("read-excel-file", filePath),
  saveChartOfAccounts: (rows) =>
    ipcRenderer.invoke("save-chart-of-accounts", rows),
  getChartOfAccounts: () => ipcRenderer.invoke("get-chart-of-accounts"),
  getAccountProperties: (code) =>
    ipcRenderer.invoke("get-account-properties", code),
  saveAccountProperties: (props) =>
    ipcRenderer.invoke("save-account-properties", props),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  readExcelMuavin: (path) => ipcRenderer.invoke("read-excel-muavin", path),
  saveMuavin: (rows) => ipcRenderer.invoke("save-muavin", rows),
  getMuavinCodes: () => ipcRenderer.invoke("get-muavin-codes"),
  getAllMatches: () => ipcRenderer.invoke("get-all-matches"),
  saveMatch: (data) => ipcRenderer.invoke("save-match", data),
  updateChartOfAccounts: (path) =>
    ipcRenderer.invoke("update-chart-of-accounts", path),
  getMizan: () => ipcRenderer.invoke("get-mizan"),
  getChartOfAccountsTree: () =>
    ipcRenderer.invoke("get-chart-of-accounts-tree"),
  getMizanTotals: () => ipcRenderer.invoke("get-mizan-totals"),
  readExternalMizanExcel: (filePath) =>
    ipcRenderer.invoke("read-excel-external-mizan", filePath),
  getMuavinByCode: (code) => ipcRenderer.invoke("get-muavin-by-code", code),
  readPreviousYearExcel: (filePath) =>
    ipcRenderer.invoke("read-previous-year-excel", filePath),
  savePreviousYearData: (payload) =>
    ipcRenderer.invoke("save-previous-year-data", payload),
  getPreviousYearData: (year) =>
    ipcRenderer.invoke("get-previous-year-data", year),
  readPreviousYearPdf: (filePath) =>
    ipcRenderer.invoke("read-previous-year-pdf", filePath),
  openFileDialogPdf: () => ipcRenderer.invoke("open-file-dialog-pdf"),
});
