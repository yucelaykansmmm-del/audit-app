const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const pdfParse = require("pdf-parse");

const dbPath = path.join(__dirname, "database", "app.db");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS previous_year_financials (
    year INTEGER,
    code TEXT,
    name TEXT,
    amount REAL,
    type TEXT,
    PRIMARY KEY (year, code, type)
  )
`).run();

ipcMain.handle("select-excel-file", async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "Excel", extensions: ["xlsx"] }],
    properties: ["openFile"],
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle("read-excel-file", async (event, filePath) => {
  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows;
});

ipcMain.handle("read-excel-external-mizan", async (event, filePath) => {
  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const normalized = (rows || []).map((row) => ({
    code: String(row["Kod"] != null ? row["Kod"] : "").trim(),
    name: String(row["Ad"] != null ? row["Ad"] : "").trim(),
    borc: Number(row["Borç"]) || 0,
    alacak: Number(row["Alacak"]) || 0,
  }));
  return normalized;
});

ipcMain.handle("save-chart-of-accounts", async (event, rows) => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS hesap_plani (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      name TEXT,
      level INTEGER,
      parentCode TEXT
    )
  `).run();

  db.prepare(`DELETE FROM hesap_plani`).run();

  const insert = db.prepare(`
    INSERT INTO hesap_plani (code, name, level, parentCode)
    VALUES (@code, @name, @level, @parentCode)
  `);

  const transaction = db.transaction((items) => {
    for (const item of items) insert.run(item);
  });

  transaction(rows || []);

  return { success: true, count: (rows || []).length };
});

ipcMain.handle("get-chart-of-accounts", async () => {
  try {
    const rows = db
      .prepare(
        "SELECT code, name, level, parentCode FROM hesap_plani ORDER BY code"
      )
      .all();
    return rows;
  } catch (err) {
    return [];
  }
});

function buildChartOfAccountsTree(rows) {
  const list = rows || [];
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
  return root;
}

ipcMain.handle("get-chart-of-accounts-tree", () => {
  try {
    const rows = db
      .prepare(
        "SELECT code, name, level, parentCode FROM hesap_plani ORDER BY code"
      )
      .all();
    return buildChartOfAccountsTree(rows);
  } catch (err) {
    return [];
  }
});

db.prepare(`
  CREATE TABLE IF NOT EXISTS hesap_ozellikleri (
    code TEXT PRIMARY KEY,
    kkeg INTEGER,
    calisma_sekli TEXT,
    hesap_tipi TEXT,
    raporlama_grubu TEXT,
    notlar TEXT
  )
`).run();

ipcMain.handle("get-account-properties", (event, code) => {
  const row = db
    .prepare("SELECT * FROM hesap_ozellikleri WHERE code = ?")
    .get(code);
  return row || null;
});

ipcMain.handle("save-account-properties", (event, props) => {
  db.prepare(`
    INSERT INTO hesap_ozellikleri (code, kkeg, calisma_sekli, hesap_tipi, raporlama_grubu, notlar)
    VALUES (@code, @kkeg, @calisma_sekli, @hesap_tipi, @raporlama_grubu, @notlar)
    ON CONFLICT(code) DO UPDATE SET
      kkeg = excluded.kkeg,
      calisma_sekli = excluded.calisma_sekli,
      hesap_tipi = excluded.hesap_tipi,
      raporlama_grubu = excluded.raporlama_grubu,
      notlar = excluded.notlar
  `).run(props);
  return { success: true };
});

ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "Excel", extensions: ["xlsx"] }],
    properties: ["openFile"],
  });
  return result.canceled ? null : result.filePaths[0] || null;
});

ipcMain.handle("open-file-dialog-pdf", async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: "PDF", extensions: ["pdf"] }],
    properties: ["openFile"],
  });
  return result.canceled ? null : result.filePaths[0] || null;
});

ipcMain.handle("read-excel-muavin", (event, filePath) => {
  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const rows = raw.map((r) => {
    const tarih = r.Tarih;
    let dateStr = "";
    if (tarih != null) {
      if (typeof tarih === "number") {
        const d = new Date((tarih - 25569) * 86400 * 1000);
        dateStr = d.toISOString().slice(0, 10);
      } else {
        dateStr = new Date(tarih).toISOString().slice(0, 10);
      }
    }
    return {
      date: dateStr,
      code: String(r.Kod != null ? r.Kod : "").trim(),
      name: String(r.Ad != null ? r.Ad : "").trim(),
      description: String(r.Aciklama != null ? r.Aciklama : "").trim(),
      borc: Number(r.Borc) || 0,
      alacak: Number(r.Alacak) || 0,
    };
  });

  return rows;
});

db.prepare(`
  CREATE TABLE IF NOT EXISTS muavin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    code TEXT,
    name TEXT,
    description TEXT,
    borc REAL,
    alacak REAL
  )
`).run();

ipcMain.handle("save-muavin", (event, rows) => {
  const insert = db.prepare(`
    INSERT INTO muavin (date, code, name, description, borc, alacak)
    VALUES (@date, @code, @name, @description, @borc, @alacak)
  `);

  const transaction = db.transaction((list) => {
    (list || []).forEach((r) => insert.run(r));
  });

  transaction(rows || []);

  return { success: true };
});

db.prepare(`
  CREATE TABLE IF NOT EXISTS hesap_eslestirme (
    code TEXT PRIMARY KEY,
    matched_code TEXT,
    matched_name TEXT
  )
`).run();

ipcMain.handle("get-muavin-codes", () => {
  try {
    return db.prepare("SELECT DISTINCT code FROM muavin ORDER BY code").all();
  } catch (err) {
    return [];
  }
});

ipcMain.handle("get-all-matches", () => {
  try {
    const rows = db.prepare("SELECT * FROM hesap_eslestirme").all();
    const map = {};
    rows.forEach((r) => {
      map[r.code] = r;
    });
    return map;
  } catch (err) {
    return {};
  }
});

ipcMain.handle("save-match", (event, data) => {
  db.prepare(`
    INSERT INTO hesap_eslestirme (code, matched_code, matched_name)
    VALUES (@code, @matched_code, @matched_name)
    ON CONFLICT(code) DO UPDATE SET
      matched_code = excluded.matched_code,
      matched_name = excluded.matched_name
  `).run(data);
  return { success: true };
});

ipcMain.handle("get-mizan", () => {
  try {
    const rows = db
      .prepare(
        `SELECT m.code, CASE WHEN e.matched_code IS NOT NULL AND e.matched_code != '' THEN 1 ELSE 0 END as eslesmis
         FROM (SELECT DISTINCT code FROM muavin) m
         LEFT JOIN hesap_eslestirme e ON m.code = e.code
         ORDER BY m.code`
      )
      .all();
    return rows;
  } catch (err) {
    return [];
  }
});

ipcMain.handle("get-mizan-totals", () => {
  try {
    const rows = db
      .prepare(
        `SELECT e.matched_code as code,
                SUM(m.borc) as toplam_borc,
                SUM(m.alacak) as toplam_alacak
         FROM muavin m
         JOIN hesap_eslestirme e ON m.code = e.code
         WHERE e.matched_code IS NOT NULL AND e.matched_code != ''
         GROUP BY e.matched_code`
      )
      .all();
    return rows;
  } catch (err) {
    return [];
  }
});

ipcMain.handle("get-muavin-by-code", (event, code) => {
  try {
    const rows = db
      .prepare(
        `SELECT m.date, m.description, m.borc, m.alacak
         FROM muavin m
         JOIN hesap_eslestirme e ON m.code = e.code
         WHERE e.matched_code = ?
         ORDER BY m.date`
      )
      .all(code);
    return rows;
  } catch (err) {
    return [];
  }
});

ipcMain.handle("read-previous-year-excel", async (event, filePath) => {
  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const normalized = (rows || []).map((row) => ({
    code: String(row["Kod"] != null ? row["Kod"] : "").trim(),
    name: String(row["Ad"] != null ? row["Ad"] : "").trim(),
    amount: Number(row["Tutar"]) || 0,
  }));
  return normalized;
});

ipcMain.handle("save-previous-year-data", (event, payload) => {
  const { year, type, rows } = payload || {};
  db.prepare(
    "DELETE FROM previous_year_financials WHERE year = ? AND type = ?"
  ).run(year, type);
  const stmt = db.prepare(`
    INSERT INTO previous_year_financials (year, code, name, amount, type)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const r of rows || []) {
    stmt.run(year, r.code, r.name, Number(r.amount) || 0, type);
  }
  return true;
});

ipcMain.handle("get-previous-year-data", (event, year) => {
  try {
    return db
      .prepare("SELECT * FROM previous_year_financials WHERE year = ?")
      .all(year);
  } catch (err) {
    return [];
  }
});

ipcMain.handle("read-previous-year-pdf", async (event, filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows = [];

  for (const line of lines) {
    const match = line.match(/^(\d{3,4})\s+(.*?)\s+([0-9\.,]+)$/);
    if (match) {
      const code = match[1];
      const name = match[2].trim();
      const amountStr = match[3].replace(/\./g, "").replace(",", ".");
      const amount = parseFloat(amountStr) || 0;
      rows.push({ code, name, amount });
    }
  }

  return rows;
});

ipcMain.handle("update-chart-of-accounts", (event, filePath) => {
  db.prepare("DELETE FROM hesap_plani").run();

  const XLSX = require("xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const insert = db.prepare(`
    INSERT INTO hesap_plani (code, name, level, parentCode)
    VALUES (@code, @name, @level, @parentCode)
  `);

  const rows = raw.map((r) => ({
    code: String(r.Kod != null ? r.Kod : "").trim(),
    name: String(r.Ad != null ? r.Ad : "").trim(),
    level: Number(r.Seviye) || 1,
    parentCode: r.UstKod ? String(r.UstKod).trim() : null,
  }));

  const transaction = db.transaction((list) => {
    (list || []).forEach((r) => insert.run(r));
  });
  transaction(rows);

  db.prepare("DELETE FROM hesap_eslestirme").run();

  return { success: true };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
  });

  win.loadFile("C:/Users/yucel/OneDrive/Masaüstü/audit-app/react-ui/build/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});