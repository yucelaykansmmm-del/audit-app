import React, { useState, useEffect, useMemo, useRef } from "react";
import PreviousYearData from "./PreviousYearData";
import bilancoEN from "./BilancoHSPL.csv";
import gelirEN from "./GelirTHSPL.csv";

const TDHP_GROUP_MAP = {
  // 1 DÖNEN VARLIKLAR (10–19)
  10: { group: "dönen", subgroup: "Hazır Değerler", header: "A. Hazır Değerler" },
  11: { group: "dönen", subgroup: "Menkul Kıymetler", header: "B. Menkul Kıymetler" },
  12: { group: "dönen", subgroup: "Ticari Alacaklar", header: "C. Ticari Alacaklar" },
  13: { group: "dönen", subgroup: "Diğer Alacaklar", header: "D. Diğer Alacaklar" },
  15: { group: "dönen", subgroup: "Stoklar", header: "E. Stoklar" },
  18: {
    group: "dönen",
    subgroup: "Gelecek Aylara Ait Giderler ve Gelir Tahakkukları",
    header: "F. Gelecek Aylara Ait Giderler",
  },
  19: { group: "dönen", subgroup: "Diğer Dönen Varlıklar", header: "G. Diğer Dönen Varlıklar" },

  // 2 DURAN VARLIKLAR (20–29)
  22: { group: "duran", subgroup: "Ticari Alacaklar", header: "A. Ticari Alacaklar" },
  23: { group: "duran", subgroup: "Diğer Alacaklar", header: "B. Diğer Alacaklar" },
  24: { group: "duran", subgroup: "Mali Duran Varlıklar", header: "C. Mali Duran Varlıklar" },
  25: { group: "duran", subgroup: "Maddi Duran Varlıklar", header: "D. Maddi Duran Varlıklar" },
  26: {
    group: "duran",
    subgroup: "Maddi Olmayan Duran Varlıklar",
    header: "E. Maddi Olmayan Duran Varlıklar",
  },
  27: {
    group: "duran",
    subgroup: "Özel Tükenmeye Tabi Varlıklar",
    header: "F. Özel Tükenmeye Tabi Varlıklar",
  },
  28: {
    group: "duran",
    subgroup: "Gelecek Yıllara Ait Giderler ve Gelir Tahakkukları",
    header: "G. Gelecek Yıllara Ait Giderler",
  },
  29: { group: "duran", subgroup: "Diğer Duran Varlıklar", header: "H. Diğer Duran Varlıklar" },

  // 3 KISA VADELİ YABANCI KAYNAKLAR (30–39)
  30: { group: "kvyk", subgroup: "Mali Borçlar", header: "A. Mali Borçlar" },
  32: { group: "kvyk", subgroup: "Ticari Borçlar", header: "B. Ticari Borçlar" },
  33: { group: "kvyk", subgroup: "Diğer Borçlar", header: "C. Diğer Borçlar" },
  34: { group: "kvyk", subgroup: "Alınan Avanslar", header: "D. Alınan Avanslar" },
  36: {
    group: "kvyk",
    subgroup: "Ödenecek Vergi ve Diğer Yükümlülükler",
    header: "E. Ödenecek Vergi ve Diğer Yükümlülükler",
  },
  37: { group: "kvyk", subgroup: "Borç ve Gider Karşılıkları", header: "F. Borç ve Gider Karşılıkları" },
  38: {
    group: "kvyk",
    subgroup: "Gelecek Aylara Ait Gelirler ve Gider Tahakkukları",
    header: "G. Gelecek Aylara Ait Gelirler",
  },
  39: {
    group: "kvyk",
    subgroup: "Diğer Kısa Vadeli Yabancı Kaynaklar",
    header: "H. Diğer Kısa Vadeli Yabancı Kaynaklar",
  },

  // 4 UZUN VADELİ YABANCI KAYNAKLAR (40–49)
  40: { group: "uvyk", subgroup: "Mali Borçlar", header: "A. Mali Borçlar" },
  42: { group: "uvyk", subgroup: "Ticari Borçlar", header: "B. Ticari Borçlar" },
  43: { group: "uvyk", subgroup: "Diğer Borçlar", header: "C. Diğer Borçlar" },
  44: { group: "uvyk", subgroup: "Alınan Avanslar", header: "D. Alınan Avanslar" },
  47: { group: "uvyk", subgroup: "Borç ve Gider Karşılıkları", header: "E. Borç ve Gider Karşılıkları" },
  48: {
    group: "uvyk",
    subgroup: "Gelecek Yıllara Ait Gelirler ve Gider Tahakkukları",
    header: "F. Gelecek Yıllara Ait Gelirler",
  },
  49: {
    group: "uvyk",
    subgroup: "Diğer Uzun Vadeli Yabancı Kaynaklar",
    header: "G. Diğer Uzun Vadeli Yabancı Kaynaklar",
  },

  // 5 ÖZ KAYNAKLAR (50–59)
  50: { group: "ozkaynak", subgroup: "Ödenmiş Sermaye", header: "A. Ödenmiş Sermaye" },
  52: { group: "ozkaynak", subgroup: "Sermaye Yedekleri", header: "B. Sermaye Yedekleri" },
  54: { group: "ozkaynak", subgroup: "Kâr Yedekleri", header: "C. Kâr Yedekleri" },
  57: { group: "ozkaynak", subgroup: "Geçmiş Yıllar Kârları", header: "D. Geçmiş Yıllar Kârları" },
  58: { group: "ozkaynak", subgroup: "Geçmiş Yıllar Zararları", header: "E. Geçmiş Yıllar Zararları" },
  59: { group: "ozkaynak", subgroup: "Dönem Net Kârı/Zararı", header: "F. Dönem Net Kârı/Zararı" },
};

const TDHP_INCOME_MAP = {
  60: { section: "Brüt Satışlar", header: "A. Brüt Satışlar" },
  61: { section: "Satış İndirimleri", header: "B. Satış İndirimleri (-)" },
  62: { section: "Satışların Maliyeti", header: "C. Satışların Maliyeti (-)" },
  63: { section: "Faaliyet Giderleri", header: "D. Faaliyet Giderleri (-)" },
  64: { section: "Diğer Olağan Gelir ve Kârlar", header: "E. Diğer Olağan Gelir ve Kârlar" },
  65: { section: "Diğer Olağan Gider ve Zararlar", header: "F. Diğer Olağan Gider ve Zararlar (-)" },
  66: { section: "Finansman Giderleri", header: "G. Finansman Giderleri (-)" },
  67: { section: "Olağandışı Gelir ve Kârlar", header: "H. Olağandışı Gelir ve Kârlar" },
  68: { section: "Olağandışı Gider ve Zararlar", header: "I. Olağandışı Gider ve Zararlar (-)" },
  69: { section: "Dönem Net Kârı/Zararı", header: "J. Dönem Net Kârı/Zararı" },
};

const tableStyles = {
  headerCell: {
    fontWeight: "600",
    fontSize: "12px",
    padding: "6px 10px",
    borderBottom: "1px solid #ddd",
    background: "#f5f5f5",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  row: {
    fontSize: "12px",
    padding: "4px 10px",
    borderBottom: "1px solid #eee",
  },
  codeCell: {
    whiteSpace: "nowrap",
    fontFamily: "monospace",
    position: "sticky",
    left: 0,
    background: "#fff",
    zIndex: 1,
  },
  sectionHeader: {
    fontWeight: "700",
    fontSize: "13px",
    padding: "8px 10px",
    background: "#f0f2f5",
    borderTop: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
  },
  classRow: {
    fontWeight: "600",
    background: "#fafafa",
  },
  totalRow: {
    fontWeight: "700",
    background: "#f3f3f3",
    borderTop: "2px solid #ccc",
    borderBottom: "2px solid #ccc",
  },
  negative: {
    color: "#b00020",
  },
  positive: {
    color: "#006400",
  },
};

const summaryCardStyle = {
  flex: 1,
  padding: "12px 16px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  background: "#fafafa",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const summaryLabelStyle = {
  fontWeight: "600",
  fontSize: "12px",
  marginBottom: "4px",
  color: "#555",
};

const summaryValueMainStyle = {
  fontSize: "18px",
  fontWeight: "700",
  marginTop: "4px",
};

const summaryValueSubStyle = {
  fontSize: "12px",
  marginTop: "2px",
};

function buildEnglishDictionary() {
  const dict = {};

  (bilancoEN || []).forEach((row) => {
    const codeRaw = row["Hesap Planı Kodları"];
    const nameRaw = row["İngilizce Hesap İsimleri"];
    if (codeRaw && nameRaw) {
      const code = String(codeRaw).trim();
      const nameEN = String(nameRaw).trim();
      if (code) {
        dict[code] = nameEN;
      }
    }
  });

  (gelirEN || []).forEach((row) => {
    const codeRaw = row["Hesap Planı Kodları"];
    const nameRaw = row["İngilizce Hesap İsimleri"];
    if (codeRaw && nameRaw) {
      const code = String(codeRaw).trim();
      const nameEN = String(nameRaw).trim();
      if (code) {
        dict[code] = nameEN;
      }
    }
  });

  return dict;
}

const EN_DICT = buildEnglishDictionary();

function translateMizanToEnglish(mizan) {
  return (mizan || []).map((item) => {
    const code = String(item.code);
    const nameEN = EN_DICT[code] || item.name;
    return {
      ...item,
      nameEN,
    };
  });
}

function getBalanceGroup(code) {
  const codeStr = String(code || "");
  const c = parseInt(codeStr.substring(0, 2), 10) || 0;

  if (c >= 10 && c <= 19) return "dönen";
  if (c >= 20 && c <= 29) return "duran";
  if (c >= 30 && c <= 39) return "kvyk";
  if (c >= 40 && c <= 49) return "uvyk";
  if (c >= 50 && c <= 59) return "ozkaynak";

  return "other";
}

function getSubGroup(code) {
  const codeStr = String(code || "");
  const c = parseInt(codeStr.substring(0, 2), 10);

  const map = {
    10: "Hazır Değerler",
    11: "Menkul Kıymetler",
    12: "Ticari Alacaklar",
    13: "Diğer Alacaklar",
    15: "Stoklar",
    18: "Gelecek Aylara Ait Giderler",
    19: "Diğer Dönen Varlıklar",

    22: "Ticari Alacaklar",
    23: "Diğer Alacaklar",
    25: "Maddi Duran Varlıklar",
    26: "Maddi Olmayan Duran Varlıklar",
    28: "Gelecek Yıllara Ait Giderler",

    32: "Ticari Borçlar",
    33: "Diğer Borçlar",
    36: "Kısa Vadeli Karşılıklar",
    38: "Gelecek Aylara Ait Gelirler",

    42: "Ticari Borçlar",
    43: "Diğer Borçlar",
    47: "Uzun Vadeli Karşılıklar",
    48: "Gelecek Yıllara Ait Gelirler",

    50: "Sermaye",
    52: "Sermaye Yedekleri",
    54: "Kar Yedekleri",
    57: "Geçmiş Yıl Kar/Zararları",
    59: "Dönem Net Kar/Zararı",
  };

  return map[c] || "Diğer";
}

function getAccountClass(code) {
  const codeStr = String(code || "");
  return codeStr.substring(0, 3);
}

function getAccountDetail(code) {
  const codeStr = String(code || "");
  return codeStr.length >= 5 ? codeStr.substring(0, 5) : null;
}

function computeBalanceSheet(mizanTotals, chartOfAccounts, previousYearData, compareMode) {
  const groups = {
    dönen: { title: "Dönen Varlıklar", subgroups: {} },
    duran: { title: "Duran Varlıklar", subgroups: {} },
    kvyk: { title: "Kısa Vadeli Yükümlülükler", subgroups: {} },
    uvyk: { title: "Uzun Vadeli Yükümlülükler", subgroups: {} },
    ozkaynak: { title: "Öz Kaynaklar", subgroups: {} },
    other: { title: "Diğer", subgroups: {} },
  };

  const mizan = (mizanTotals || []).map((r) => ({
    code: r.code,
    borc: Number(r.toplam_borc) || 0,
    alacak: Number(r.toplam_alacak) || 0,
  }));
  const plan = chartOfAccounts || [];
  const prev = previousYearData || [];

  const isAktif = (groupKey) => groupKey === "dönen" || groupKey === "duran";

  mizan.forEach((item) => {
    const acc = plan.find((p) => p.code === item.code);
    if (!acc) return;

    const codeStr = String(item.code || "");
    if (!/^[1-5]/.test(codeStr)) return;

    const code2 = parseInt(codeStr.substring(0, 2), 10);
    const td = TDHP_GROUP_MAP[code2];
    if (!td) return;

    const groupKey = td.group;
    const subgroupKey = td.subgroup;
    const subgroupHeader = td.header;

    const group = groups[groupKey];
    if (!group) return;

    if (!group.subgroups[subgroupKey]) {
      group.subgroups[subgroupKey] = {
        header: subgroupHeader,
        classes: {},
        totals: { current: 0, previous: 0, difference: 0 },
      };
    }
    const sg = group.subgroups[subgroupKey];

    const classCode = getAccountClass(item.code);
    if (!sg.classes[classCode]) {
      const classAcc = plan.find((a) => a.code === classCode);
      sg.classes[classCode] = {
        name: classAcc ? classAcc.name : `Hesap ${classCode}`,
        rows: [],
        totals: { current: 0, previous: 0, difference: 0 },
      };
    }

    const borc = Number(item.borc) || 0;
    const alacak = Number(item.alacak) || 0;
    const currentAmount = isAktif(groupKey) ? borc - alacak : alacak - borc;

    const prevRow = prev.find((x) => x.code === item.code && x.type === "balance");
    const previousAmount = prevRow ? Number(prevRow.amount) || 0 : 0;
    const difference = currentAmount - previousAmount;

    const row = {
      code: item.code,
      name: acc.name || "",
      currentAmount,
      previousAmount: compareMode === "compare" ? previousAmount : undefined,
      difference: compareMode === "compare" ? difference : undefined,
    };

    const cls = sg.classes[classCode];
    const detailCode = getAccountDetail(item.code);

    if (detailCode) {
      if (!cls.details) cls.details = {};
      if (!cls.details[detailCode]) {
        const detailAcc = plan.find((a) => a.code === detailCode);
        cls.details[detailCode] = {
          name: detailAcc ? detailAcc.name : `Hesap ${detailCode}`,
          rows: [],
          totals: { current: 0, previous: 0, difference: 0 },
        };
      }
      cls.details[detailCode].rows.push(row);
      cls.details[detailCode].totals.current += currentAmount;
      cls.details[detailCode].totals.previous += previousAmount;
      cls.details[detailCode].totals.difference += difference;
    } else {
      cls.rows.push(row);
    }
  });

  Object.keys(groups).forEach((gKey) => {
    Object.keys(groups[gKey].subgroups).forEach((sgKey) => {
      const sg = groups[gKey].subgroups[sgKey];
      Object.keys(sg.classes).forEach((cKey) => {
        const cls = sg.classes[cKey];
        cls.totals = { current: 0, previous: 0, difference: 0 };
        cls.rows.forEach((r) => {
          cls.totals.current += r.currentAmount;
          cls.totals.previous += (r.previousAmount ?? 0);
          cls.totals.difference += (r.difference ?? 0);
        });
        if (cls.details) {
          Object.keys(cls.details).forEach((dKey) => {
            const dt = cls.details[dKey].totals;
            cls.totals.current += dt.current;
            cls.totals.previous += dt.previous;
            cls.totals.difference += dt.difference;
          });
        }
      });
      sg.totals = { current: 0, previous: 0, difference: 0 };
      Object.keys(sg.classes).forEach((cKey) => {
        const ct = sg.classes[cKey].totals;
        sg.totals.current += ct.current;
        sg.totals.previous += ct.previous;
        sg.totals.difference += ct.difference;
      });
    });
  });

  Object.keys(groups).forEach((gKey) => {
    const group = groups[gKey];
    group.totals = { current: 0, previous: 0, difference: 0 };
    Object.keys(group.subgroups).forEach((sgKey) => {
      const st = group.subgroups[sgKey].totals;
      group.totals.current += st.current;
      group.totals.previous += st.previous;
      group.totals.difference += st.difference;
    });
  });

  return {
    groups,
    totals: {
      aktif: {
        current: groups.dönen.totals.current + groups.duran.totals.current,
        previous: groups.dönen.totals.previous + groups.duran.totals.previous,
        difference: groups.dönen.totals.difference + groups.duran.totals.difference,
      },
      pasif: {
        current: groups.kvyk.totals.current + groups.uvyk.totals.current + groups.ozkaynak.totals.current,
        previous: groups.kvyk.totals.previous + groups.uvyk.totals.previous + groups.ozkaynak.totals.previous,
        difference: groups.kvyk.totals.difference + groups.uvyk.totals.difference + groups.ozkaynak.totals.difference,
      },
    },
  };
}

function computeIncomeStatement(mizan, chartOfAccounts) {
  const sections = {};
  const plan = chartOfAccounts || [];

  (mizan || []).forEach((item) => {
    const code = String(item.code || "");
    const code2 = parseInt(code.substring(0, 2), 10);
    const td = TDHP_INCOME_MAP[code2];
    if (!td) return;

    const sectionKey = td.section;
    const sectionHeader = td.header;

    if (!sections[sectionKey]) {
      sections[sectionKey] = {
        header: sectionHeader,
        classes: {},
        totals: { current: 0, previous: 0, difference: 0 },
      };
    }

    const sectionObj = sections[sectionKey];

    const classCode = code.substring(0, 3);
    if (!sectionObj.classes[classCode]) {
      const classAcc = plan.find((a) => a.code === classCode);
      sectionObj.classes[classCode] = {
        name: classAcc ? classAcc.name : `Hesap ${classCode}`,
        rows: [],
        details: {},
        totals: { current: 0, previous: 0, difference: 0 },
      };
    }

    const cls = sectionObj.classes[classCode];

    const detailCode = code.length >= 5 ? code.substring(0, 5) : null;

    const currentAmount = item.currentAmount ?? 0;
    const previousAmount = item.previousAmount ?? 0;
    const difference = currentAmount - previousAmount;

    const row = {
      code,
      name: item.name ?? "",
      currentAmount,
      previousAmount,
      difference,
    };

    if (detailCode) {
      if (!cls.details[detailCode]) {
        const detailAcc = plan.find((a) => a.code === detailCode);
        cls.details[detailCode] = {
          name: detailAcc ? detailAcc.name : `Hesap ${detailCode}`,
          rows: [],
          totals: { current: 0, previous: 0, difference: 0 },
        };
      }
      cls.details[detailCode].rows.push(row);
      cls.details[detailCode].totals.current += currentAmount;
      cls.details[detailCode].totals.previous += previousAmount;
      cls.details[detailCode].totals.difference += difference;
    } else {
      cls.rows.push(row);
    }
  });

  Object.keys(sections).forEach((secKey) => {
    const sec = sections[secKey];
    sec.totals = { current: 0, previous: 0, difference: 0 };

    Object.keys(sec.classes).forEach((cKey) => {
      const cls = sec.classes[cKey];
      cls.totals = { current: 0, previous: 0, difference: 0 };

      cls.rows.forEach((r) => {
        cls.totals.current += r.currentAmount;
        cls.totals.previous += r.previousAmount;
        cls.totals.difference += r.difference;
      });

      if (cls.details) {
        Object.keys(cls.details).forEach((dKey) => {
          const dt = cls.details[dKey].totals;
          cls.totals.current += dt.current;
          cls.totals.previous += dt.previous;
          cls.totals.difference += dt.difference;
        });
      }

      sec.totals.current += cls.totals.current;
      sec.totals.previous += cls.totals.previous;
      sec.totals.difference += cls.totals.difference;
    });
  });

  return { sections };
}

function computeIncomeSummary(sections) {
  const get = (name) => sections[name]?.totals || { current: 0, previous: 0, difference: 0 };

  const brütSatış = get("Brüt Satışlar");
  const satışİndirimi = get("Satış İndirimleri");
  const satışMaliyeti = get("Satışların Maliyeti");
  const faaliyetGideri = get("Faaliyet Giderleri");
  const digerOlaganGelir = get("Diğer Olağan Gelir ve Kârlar");
  const digerOlaganGider = get("Diğer Olağan Gider ve Zararlar");
  const finansmanGideri = get("Finansman Giderleri");
  const olagandisiGelir = get("Olağandışı Gelir ve Kârlar");
  const olagandisiGider = get("Olağandışı Gider ve Zararlar");
  const netKarBolumu = get("Dönem Net Kârı/Zararı");

  const netSatis = {
    current: brütSatış.current - satışİndirimi.current,
    previous: brütSatış.previous - satışİndirimi.previous,
    difference: brütSatış.difference - satışİndirimi.difference,
  };

  const brütKar = {
    current: netSatis.current - satışMaliyeti.current,
    previous: netSatis.previous - satışMaliyeti.previous,
    difference: netSatis.difference - satışMaliyeti.difference,
  };

  const faaliyetKari = {
    current: brütKar.current - faaliyetGideri.current + digerOlaganGelir.current - digerOlaganGider.current,
    previous: brütKar.previous - faaliyetGideri.previous + digerOlaganGelir.previous - digerOlaganGider.previous,
    difference: brütKar.difference - faaliyetGideri.difference + digerOlaganGelir.difference - digerOlaganGider.difference,
  };

  const vergiOncesiKar = {
    current: faaliyetKari.current - finansmanGideri.current + olagandisiGelir.current - olagandisiGider.current,
    previous: faaliyetKari.previous - finansmanGideri.previous + olagandisiGelir.previous - olagandisiGider.previous,
    difference: faaliyetKari.difference - finansmanGideri.difference + olagandisiGelir.difference - olagandisiGider.difference,
  };

  const netKar = netKarBolumu;

  return {
    netSatis,
    brütKar,
    faaliyetKari,
    vergiOncesiKar,
    netKar,
  };
}

function computeBalanceSheetEN(mizan, chartOfAccounts) {
  const translated = translateMizanToEnglish(mizan);
  const mizanTotals = (translated || []).map((item) => ({
    code: item.code,
    toplam_borc: item.borc ?? 0,
    toplam_alacak: item.alacak ?? 0,
  }));

  const result = computeBalanceSheet(mizanTotals, chartOfAccounts, [], "solo");

  Object.values(result.groups || {}).forEach((group) => {
    Object.values(group.subgroups || {}).forEach((sg) => {
      Object.values(sg.classes || {}).forEach((cls) => {
        const firstRowCode =
          (cls.rows && cls.rows[0] && String(cls.rows[0].code)) || null;
        const code = firstRowCode ? firstRowCode.substring(0, 3) : null;
        if (code && EN_DICT[code]) {
          cls.name = EN_DICT[code];
        }
      });
    });
  });

  return result;
}

function computeIncomeStatementEN(mizan, chartOfAccounts) {
  const translated = translateMizanToEnglish(mizan);
  const result = computeIncomeStatement(translated, chartOfAccounts);

  Object.values(result.sections || {}).forEach((sec) => {
    Object.values(sec.classes || {}).forEach((cls) => {
      const firstRowCode =
        (cls.rows && cls.rows[0] && String(cls.rows[0].code)) || null;
      const code = firstRowCode ? firstRowCode.substring(0, 3) : null;
      if (code && EN_DICT[code]) {
        cls.name = EN_DICT[code];
      }
    });
  });

  result.summary = computeIncomeSummary(result.sections || {});
  return result;
}

function buildFinancialDataSet(mizan, chartOfAccounts, currentYear, previousYear) {
  const detailMizan = (mizan || []).map((item) => {
    const code = item.code;
    const borc = item.borc ?? 0;
    const alacak = item.alacak ?? 0;
    const currentAmount = item.currentAmount ?? 0;
    const previousAmount = item.previousAmount ?? 0;

    return {
      code,
      name: item.name,
      nameEN: EN_DICT[code] || item.name,
      borc,
      alacak,
      currentAmount,
      previousAmount,
      difference: currentAmount - previousAmount,
    };
  });

  const mizanTotalsForBalance = (mizan || []).map((item) => ({
    code: item.code,
    toplam_borc: item.borc ?? 0,
    toplam_alacak: item.alacak ?? 0,
  }));

  const balanceTR = computeBalanceSheet(
    mizanTotalsForBalance,
    chartOfAccounts,
    [],
    "solo"
  );

  const incomeTR = computeIncomeStatement(mizan, chartOfAccounts);
  const summaryTR = computeIncomeSummary(incomeTR.sections || {});

  const balanceEN = computeBalanceSheetEN(mizan, chartOfAccounts);
  const incomeEN = computeIncomeStatementEN(mizan, chartOfAccounts);

  return {
    detailMizan,
    tr: {
      balance: balanceTR,
      income: { ...incomeTR, summary: summaryTR },
    },
    en: {
      balance: balanceEN,
      income: incomeEN,
    },
  };
}

function FinancialTables() {
  const [activeTab, setActiveTab] = useState("balance");
  const [incomeMode, setIncomeMode] = useState("6");
  const [mizanTotals, setMizanTotals] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [compareMode, setCompareMode] = useState("solo");
  const [previousYearData, setPreviousYearData] = useState([]);
  const [financialDataSet, setFinancialDataSet] = useState(null);
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState({});

  function toggleGroup(code) {
    setCollapsedGroups((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }

  useEffect(() => {
    if (!tableRef.current) return;

    const colWidths = {};
    const rows = tableRef.current.querySelectorAll("tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      cells.forEach((cell, index) => {
        const width = cell.offsetWidth;
        if (!colWidths[index] || width > colWidths[index]) {
          colWidths[index] = width;
        }
      });
    });

    setColumnWidths(colWidths);
  }, [balance, income, compareMode, activeTab]);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!window.api?.getMizanTotals || !window.api?.getChartOfAccounts) return;
      try {
        const [totals, plan] = await Promise.all([
          window.api.getMizanTotals(),
          window.api.getChartOfAccounts(),
        ]);
        if (!cancelled) {
          setMizanTotals(totals || []);
          setChartOfAccounts(plan || []);
        }
      } catch (err) {
        console.error("Finansal tablolar yükleme hatası:", err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadPrev() {
      if (!window.api?.getPreviousYearData) return;
      try {
        const prev = await window.api.getPreviousYearData(previousYear);
        if (!cancelled) setPreviousYearData(prev || []);
      } catch (err) {
        if (!cancelled) setPreviousYearData([]);
      }
    }
    loadPrev();
    return () => { cancelled = true; };
  }, [previousYear]);

  const mizanNormalized = useMemo(
    () =>
      (mizanTotals || []).map((r) => ({
        code: r.code,
        borc: Number(r.toplam_borc) || 0,
        alacak: Number(r.toplam_alacak) || 0,
      })),
    [mizanTotals]
  );

  const balance = useMemo(
    () =>
      computeBalanceSheet(
        mizanTotals,
        chartOfAccounts,
        previousYearData,
        compareMode
      ),
    [mizanTotals, chartOfAccounts, previousYearData, compareMode]
  );

  const income = useMemo(() => {
    const prev = previousYearData || [];
    const plan = chartOfAccounts || [];
    const items = (mizanNormalized || [])
      .filter((r) => {
        const code = String(r.code || "");
        const is6 = code.startsWith("6");
        const is7 = code.startsWith("7");
        if (incomeMode === "6") return is6;
        if (incomeMode === "6-7") return is6 || is7;
        return is6;
      })
      .map((r) => {
        const code = String(r.code || "");
        const borc = Number(r.borc) || 0;
        const alacak = Number(r.alacak) || 0;
        const is6 = code.startsWith("6");
        const currentAmount = is6 ? alacak - borc : borc - alacak;
        const prevRow = prev.find((x) => x.code === r.code && x.type === "income");
        const previousAmount = prevRow ? Number(prevRow.amount) || 0 : 0;
        const acc = plan.find((a) => a.code === code);
        return {
          code: r.code,
          name: acc ? acc.name : "",
          currentAmount,
          previousAmount,
        };
      });
    const result = computeIncomeStatement(items, chartOfAccounts);
    const summary = computeIncomeSummary(result.sections || {});
    return { ...result, summary };
  }, [mizanNormalized, chartOfAccounts, incomeMode, previousYearData]);

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("balance")}
          style={{
            fontWeight: activeTab === "balance" ? 700 : 400,
            background: activeTab === "balance" ? "#d0eaff" : "#f0f0f0",
          }}
        >
          Bilanço
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("income")}
          style={{
            fontWeight: activeTab === "income" ? 700 : 400,
            background: activeTab === "income" ? "#d0eaff" : "#f0f0f0",
          }}
        >
          Gelir Tablosu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dataset")}
          style={{
            fontWeight: activeTab === "dataset" ? 700 : 400,
            background: activeTab === "dataset" ? "#d0eaff" : "#f0f0f0",
          }}
        >
          Mali Veri Seti
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("previous")}
          style={{
            fontWeight: activeTab === "previous" ? 700 : 400,
            background: activeTab === "previous" ? "#d0eaff" : "#f0f0f0",
          }}
        >
          Önceki Yıl Verisi
        </button>
      </div>

      {activeTab === "balance" && (
        <div ref={tableRef}>
          <div style={{ marginBottom: "15px" }}>
            <button
              type="button"
              onClick={() => setCompareMode("solo")}
              style={{
                background: compareMode === "solo" ? "#d0eaff" : "#f0f0f0",
                marginRight: "10px",
              }}
            >
              Solo
            </button>
            <button
              type="button"
              onClick={() => setCompareMode("compare")}
              style={{
                background: compareMode === "compare" ? "#d0eaff" : "#f0f0f0",
              }}
              disabled={!previousYearData || previousYearData.length === 0}
            >
              Karşılaştırmalı
            </button>
          </div>

          {Object.keys(balance.groups).map((gKey) => {
            const g = balance.groups[gKey];
            return (
              <div key={gKey} style={{ marginBottom: "40px" }}>
                <div style={{ ...tableStyles.sectionHeader, marginTop: "12px" }}>{g.title}</div>

                {Object.keys(g.subgroups).map((sgKey) => {
                  const sg = g.subgroups[sgKey];
                  return (
                    <div key={sgKey} style={{ marginBottom: "25px" }}>
                      <div style={{ ...tableStyles.sectionHeader, marginTop: "8px" }}>
                        {sg.header || sgKey}
                      </div>

                      {Object.keys(sg.classes).map((cKey) => {
                        const cls = sg.classes[cKey];
                        return (
                          <div key={cKey} style={{ marginBottom: "20px" }}>
                            <div
                              style={{
                                ...tableStyles.row,
                                ...tableStyles.classRow,
                                cursor: "pointer",
                              }}
                              onClick={() => toggleGroup(cKey)}
                            >
                              <span style={{ fontFamily: "monospace", marginRight: 8 }}>
                                {collapsedGroups[cKey] ? "▶" : "▼"} {cKey}
                              </span>
                              {cls.name}
                            </div>

                            <div
                              style={{
                                marginTop: "12px",
                                maxHeight: "70vh",
                                overflow: "auto",
                              }}
                            >
                              {compareMode === "solo" ? (
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                      >
                                        Kod
                                      </th>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          width: columnWidths[1],
                                        }}
                                      >
                                        Ad
                                      </th>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          textAlign: "right",
                                        }}
                                      >
                                        Tutar
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr
                                      style={{
                                        ...tableStyles.row,
                                        ...tableStyles.classRow,
                                        cursor: "pointer",
                                      }}
                                      onClick={() => toggleGroup(cKey)}
                                    >
                                      <td
                                        style={{
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                      >
                                        {collapsedGroups[cKey] ? "▶" : "▼"} {cKey}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          width: columnWidths[1],
                                        }}
                                      >
                                        {cls.name}
                                      </td>
                                      <td style={{ ...tableStyles.row }} />
                                    </tr>
                                    {!collapsedGroups[cKey] &&
                                      cls.rows.map((r) => {
                                        const amount = r.currentAmount ?? 0;
                                        const amountStyle =
                                          amount < 0
                                            ? tableStyles.negative
                                            : amount > 0
                                            ? tableStyles.positive
                                            : {};
                                        return (
                                          <tr key={r.code} style={tableStyles.row}>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                ...tableStyles.codeCell,
                                                width: columnWidths[0],
                                              }}
                                            >
                                              {r.code}
                                            </td>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                width: columnWidths[1],
                                              }}
                                            >
                                              {r.name}
                                            </td>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                textAlign: "right",
                                                ...amountStyle,
                                              }}
                                            >
                                              {amount.toLocaleString()}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    <tr style={{ ...tableStyles.row, ...tableStyles.totalRow }}>
                                      <td
                                        style={{
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                      >
                                        Toplam {cKey}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          width: columnWidths[1],
                                        }}
                                      >
                                        {cls.name} Toplamı
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                          ...((cls.totals.current ?? 0) < 0
                                            ? tableStyles.negative
                                            : (cls.totals.current ?? 0) > 0
                                            ? tableStyles.positive
                                            : {}),
                                        }}
                                      >
                                        {(cls.totals.current ?? 0).toLocaleString()}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              ) : (
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                      >
                                        Kod
                                      </th>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          width: columnWidths[1],
                                        }}
                                      >
                                        Ad
                                      </th>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          textAlign: "right",
                                        }}
                                      >
                                        {currentYear}
                                      </th>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          textAlign: "right",
                                        }}
                                      >
                                        {previousYear}
                                      </th>
                                      <th
                                        style={{
                                          ...tableStyles.headerCell,
                                          textAlign: "right",
                                        }}
                                      >
                                        Fark
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {!collapsedGroups[cKey] &&
                                      cls.rows.map((r) => {
                                        const diff = r.difference ?? 0;
                                        const diffStyle =
                                          diff < 0
                                            ? tableStyles.negative
                                            : diff > 0
                                            ? tableStyles.positive
                                            : {};
                                        return (
                                          <tr key={r.code} style={tableStyles.row}>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                ...tableStyles.codeCell,
                                                width: columnWidths[0],
                                              }}
                                            >
                                              {r.code}
                                            </td>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                width: columnWidths[1],
                                              }}
                                            >
                                              {r.name}
                                            </td>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                textAlign: "right",
                                              }}
                                            >
                                              {r.currentAmount.toLocaleString()}
                                            </td>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                textAlign: "right",
                                              }}
                                            >
                                              {(r.previousAmount ?? 0).toLocaleString()}
                                            </td>
                                            <td
                                              style={{
                                                ...tableStyles.row,
                                                textAlign: "right",
                                                ...diffStyle,
                                              }}
                                            >
                                              {diff.toLocaleString()}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    <tr style={{ ...tableStyles.row, ...tableStyles.totalRow }}>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                        colSpan={2}
                                      >
                                        Toplam {cKey}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                        }}
                                      >
                                        {(cls.totals.current ?? 0).toLocaleString()}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                        }}
                                      >
                                        {(cls.totals.previous ?? 0).toLocaleString()}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                        }}
                                      >
                                        {(cls.totals.difference ?? 0).toLocaleString()}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div style={{ fontWeight: "bold", marginTop: "5px" }}>
                        Toplam {sgKey}: {sg.totals.current.toLocaleString()}
                        {compareMode === "compare" && (
                          <>
                            {" "}/ {sg.totals.previous.toLocaleString()}
                            {" "}/ {sg.totals.difference.toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div style={{ fontWeight: "bold", marginTop: "10px" }}>
                  Toplam {g.title}: {g.totals.current.toLocaleString()}
                  {compareMode === "compare" && (
                    <>
                      {" "}/ {g.totals.previous.toLocaleString()}
                      {" "}/ {g.totals.difference.toLocaleString()}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: "30px", fontWeight: "bold" }}>
            <p>Toplam Aktif: {balance.totals.aktif.current.toLocaleString()}</p>
            {compareMode === "compare" && (
              <>
                <p>Önceki Yıl Aktif: {balance.totals.aktif.previous.toLocaleString()}</p>
                <p>Fark: {balance.totals.aktif.difference.toLocaleString()}</p>
              </>
            )}
            <p>Toplam Pasif: {balance.totals.pasif.current.toLocaleString()}</p>
            {compareMode === "compare" && (
              <>
                <p>Önceki Yıl Pasif: {balance.totals.pasif.previous.toLocaleString()}</p>
                <p>Fark: {balance.totals.pasif.difference.toLocaleString()}</p>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "income" && (
        <div ref={tableRef}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={() => setIncomeMode("6")}
              style={{
                background: incomeMode === "6" ? "#d0eaff" : "#f0f0f0",
              }}
            >
              Yıl Sonu (Sadece 6)
            </button>
            <button
              type="button"
              onClick={() => setIncomeMode("6-7")}
              style={{
                background: incomeMode === "6-7" ? "#d0eaff" : "#f0f0f0",
              }}
            >
              Yıl İçi (6 + 7)
            </button>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button
              type="button"
              onClick={() => setCompareMode("solo")}
              style={{
                background: compareMode === "solo" ? "#d0eaff" : "#f0f0f0",
                marginRight: "10px",
              }}
            >
              Solo
            </button>
            <button
              type="button"
              onClick={() => setCompareMode("compare")}
              style={{
                background: compareMode === "compare" ? "#d0eaff" : "#f0f0f0",
              }}
              disabled={!previousYearData || previousYearData.length === 0}
            >
              Karşılaştırmalı
            </button>
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            {[
              { key: "netSatis", label: "Net Satışlar" },
              { key: "brütKar", label: "Brüt Kâr" },
              { key: "faaliyetKari", label: "Faaliyet Kârı" },
              { key: "vergiOncesiKar", label: "Vergi Öncesi Kâr" },
              { key: "netKar", label: "Dönem Net Kârı" },
            ].map((item) => {
              const v = income.summary?.[item.key] || {
                current: 0,
                previous: 0,
                difference: 0,
              };
              const diff = v.difference ?? 0;
              const diffStyle =
                diff < 0 ? tableStyles.negative : diff > 0 ? tableStyles.positive : {};
              return (
                <div key={item.key} style={summaryCardStyle}>
                  <div style={summaryLabelStyle}>{item.label}</div>
                  {compareMode === "solo" ? (
                    <div style={summaryValueMainStyle}>{v.current.toLocaleString()}</div>
                  ) : (
                    <>
                      <div style={summaryValueSubStyle}>
                        <b>{currentYear}:</b> {v.current.toLocaleString()}
                      </div>
                      <div style={summaryValueSubStyle}>
                        <b>{previousYear}:</b> {v.previous.toLocaleString()}
                      </div>
                      <div style={summaryValueSubStyle}>
                        <b>Fark:</b>{" "}
                        <span style={diffStyle}>{diff.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(income.sections || {}).map((secKey) => {
            const sec = income.sections[secKey];
            return (
              <div key={secKey} style={{ marginBottom: "40px" }}>
                <div style={{ ...tableStyles.sectionHeader, marginTop: "16px" }}>
                  {sec.header}
                </div>

                {Object.keys(sec.classes || {}).map((cKey) => {
                  const cls = sec.classes[cKey];
                  return (
                    <div key={cKey} style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          ...tableStyles.row,
                          ...tableStyles.classRow,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleGroup(cKey)}
                      >
                        <span style={{ fontFamily: "monospace", marginRight: 8 }}>
                          {collapsedGroups[cKey] ? "▶" : "▼"} {cKey}
                        </span>
                        {cls.name}
                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          maxHeight: "70vh",
                          overflow: "auto",
                        }}
                      >
                        {compareMode === "solo" ? (
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    ...tableStyles.codeCell,
                                    width: columnWidths[0],
                                  }}
                                >
                                  Kod
                                </th>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    width: columnWidths[1],
                                  }}
                                >
                                  Ad
                                </th>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    textAlign: "right",
                                  }}
                                >
                                  Tutar
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!collapsedGroups[cKey] &&
                                (cls.rows || []).map((r) => {
                                  const amount = r.currentAmount ?? 0;
                                  const amountStyle =
                                    amount < 0
                                      ? tableStyles.negative
                                      : amount > 0
                                      ? tableStyles.positive
                                      : {};
                                  return (
                                    <tr key={r.code} style={tableStyles.row}>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                      >
                                        {r.code}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          width: columnWidths[1],
                                        }}
                                      >
                                        {r.name}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                          ...amountStyle,
                                        }}
                                      >
                                        {amount.toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              <tr style={{ ...tableStyles.row, ...tableStyles.totalRow }}>
                                <td
                                  style={{
                                    ...tableStyles.row,
                                    ...tableStyles.codeCell,
                                    width: columnWidths[0],
                                  }}
                                  colSpan={2}
                                >
                                  Toplam {cKey}
                                </td>
                                <td
                                  style={{
                                    ...tableStyles.row,
                                    textAlign: "right",
                                  }}
                                >
                                  {(cls.totals?.current ?? 0).toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    ...tableStyles.codeCell,
                                    width: columnWidths[0],
                                  }}
                                >
                                  Kod
                                </th>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    width: columnWidths[1],
                                  }}
                                >
                                  Ad
                                </th>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    textAlign: "right",
                                  }}
                                >
                                  {currentYear}
                                </th>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    textAlign: "right",
                                  }}
                                >
                                  {previousYear}
                                </th>
                                <th
                                  style={{
                                    ...tableStyles.headerCell,
                                    textAlign: "right",
                                  }}
                                >
                                  Fark
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {!collapsedGroups[cKey] &&
                                (cls.rows || []).map((r) => {
                                  const diff = r.difference ?? 0;
                                  const diffStyle =
                                    diff < 0
                                      ? tableStyles.negative
                                      : diff > 0
                                      ? tableStyles.positive
                                      : {};
                                  return (
                                    <tr key={r.code} style={tableStyles.row}>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          ...tableStyles.codeCell,
                                          width: columnWidths[0],
                                        }}
                                      >
                                        {r.code}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          width: columnWidths[1],
                                        }}
                                      >
                                        {r.name}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                        }}
                                      >
                                        {r.currentAmount.toLocaleString()}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                        }}
                                      >
                                        {(r.previousAmount ?? 0).toLocaleString()}
                                      </td>
                                      <td
                                        style={{
                                          ...tableStyles.row,
                                          textAlign: "right",
                                          ...diffStyle,
                                        }}
                                      >
                                        {diff.toLocaleString()}
                                      </td>
                                    </tr>
                                  );
                                })}
                              <tr style={{ ...tableStyles.row, ...tableStyles.totalRow }}>
                                <td
                                  style={{
                                    ...tableStyles.row,
                                    ...tableStyles.codeCell,
                                    width: columnWidths[0],
                                  }}
                                  colSpan={2}
                                >
                                  Toplam {cKey}
                                </td>
                                <td
                                  style={{
                                    ...tableStyles.row,
                                    textAlign: "right",
                                  }}
                                >
                                  {(cls.totals?.current ?? 0).toLocaleString()}
                                </td>
                                <td
                                  style={{
                                    ...tableStyles.row,
                                    textAlign: "right",
                                  }}
                                >
                                  {(cls.totals?.previous ?? 0).toLocaleString()}
                                </td>
                                <td
                                  style={{
                                    ...tableStyles.row,
                                    textAlign: "right",
                                  }}
                                >
                                  {(cls.totals?.difference ?? 0).toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div style={{ fontWeight: "bold", marginTop: "10px" }}>
                  Toplam {sec.header}: {(sec.totals?.current ?? 0).toLocaleString()}
                  {compareMode === "compare" && (
                    <>
                      {" / "}
                      {(sec.totals?.previous ?? 0).toLocaleString()}
                      {" / "}
                      {(sec.totals?.difference ?? 0).toLocaleString()}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "dataset" && (
        <div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => {
                const plan = chartOfAccounts || [];
                const baseMizan = (mizanTotals || []).map((r) => {
                  const acc = plan.find((a) => a.code === r.code);
                  const borc = Number(r.toplam_borc) || 0;
                  const alacak = Number(r.toplam_alacak) || 0;
                  return {
                    code: r.code,
                    name: acc ? acc.name : "",
                    borc,
                    alacak,
                    currentAmount: alacak - borc,
                    previousAmount: 0,
                  };
                });
                const dataSet = buildFinancialDataSet(
                  baseMizan,
                  chartOfAccounts,
                  currentYear,
                  previousYear
                );
                setFinancialDataSet(dataSet);
              }}
              style={{
                background: "#d0eaff",
              }}
            >
              Türkçe Veri Seti Oluştur
            </button>
            <button
              type="button"
              onClick={() => {
                const plan = chartOfAccounts || [];
                const baseMizan = (mizanTotals || []).map((r) => {
                  const acc = plan.find((a) => a.code === r.code);
                  const borc = Number(r.toplam_borc) || 0;
                  const alacak = Number(r.toplam_alacak) || 0;
                  return {
                    code: r.code,
                    name: acc ? acc.name : "",
                    borc,
                    alacak,
                    currentAmount: alacak - borc,
                    previousAmount: 0,
                  };
                });
                const dataSet = buildFinancialDataSet(
                  baseMizan,
                  chartOfAccounts,
                  currentYear,
                  previousYear
                );
                setFinancialDataSet(dataSet);
              }}
              style={{
                background: "#d0eaff",
              }}
            >
              İngilizce Veri Seti Oluştur
            </button>
            <button
              type="button"
              onClick={() => {
                if (!financialDataSet) return;
                const dataSet = financialDataSet;
                const trContent = {
                  detailMizan: dataSet.detailMizan,
                  balance: dataSet.tr?.balance,
                  income: dataSet.tr?.income,
                };
                const payload = {
                  subject: "Mali Veri Seti (TR)",
                  body:
                    "Detay mizan, bilanço ve gelir tablosu (Türkçe) ekte JSON formatında sunulmuştur.",
                  attachmentName: "mali_veri_seti_tr.json",
                  attachmentContent: JSON.stringify(trContent, null, 2),
                };
                if (window.api && typeof window.api.sendMail === "function") {
                  window.api.sendMail(payload);
                }
              }}
              disabled={!financialDataSet}
              style={{
                background: financialDataSet ? "#d0eaff" : "#f0f0f0",
              }}
            >
              Mail ile Gönder (TR)
            </button>
            <button
              type="button"
              onClick={() => {
                if (!financialDataSet) return;
                const dataSet = financialDataSet;
                const enContent = {
                  detailMizan: dataSet.detailMizan,
                  balance: dataSet.en?.balance,
                  income: dataSet.en?.income,
                };
                const payload = {
                  subject: "Mali Veri Seti (EN)",
                  body:
                    "Detailed trial balance, balance sheet and income statement (English) are attached in JSON format.",
                  attachmentName: "mali_veri_seti_en.json",
                  attachmentContent: JSON.stringify(enContent, null, 2),
                };
                if (window.api && typeof window.api.sendMail === "function") {
                  window.api.sendMail(payload);
                }
              }}
              disabled={!financialDataSet}
              style={{
                background: financialDataSet ? "#d0eaff" : "#f0f0f0",
              }}
            >
              Mail ile Gönder (EN)
            </button>
          </div>

          {financialDataSet && (
            <pre
              style={{
                maxHeight: "400px",
                overflow: "auto",
                background: "#fafafa",
                border: "1px solid #ddd",
                padding: "10px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(financialDataSet, null, 2)}
            </pre>
          )}
        </div>
      )}

      {activeTab === "previous" && <PreviousYearData />}
    </div>
  );
}

export default FinancialTables;
export { buildFinancialDataSet };
