export const executiveSummaryTemplates = {
  TR: {
    meta: {
      title: "Yönetici Özeti Raporu",
    },
    sections: [
      {
        id: "cover",
        label: "Kapak",
        render: (meta: any) => ({
          type: "block",
          content: [
            { type: "h1", text: meta.companyName || "Şirket Adı" },
            { type: "h2", text: "Yönetici Özeti Raporu" },
            {
              type: "p",
              text: `Dönem: ${meta.currentYear} (Karşılaştırma: ${meta.previousYear})`,
            },
            {
              type: "p",
              text: `Oluşturulma Tarihi: ${new Date(meta.generatedAt).toLocaleDateString("tr-TR")}`,
            },
          ],
        }),
      },
      {
        id: "profitSummary",
        label: "Kârlılık Özeti",
        render: (data: any) => ({
          type: "table",
          title: "Kârlılık Özeti",
          headers: ["Gösterge", "Cari Yıl", "Önceki Yıl", "Fark", "%"],
          rows: [
            ["Net Satışlar", data.netSales.current, data.netSales.previous, data.netSales.diff, data.netSales.pct],
            ["Brüt Kâr", data.grossProfit.current, data.grossProfit.previous, data.grossProfit.diff, data.grossProfit.pct],
            ["Faaliyet Kârı", data.operatingProfit.current, data.operatingProfit.previous, data.operatingProfit.diff, data.operatingProfit.pct],
            ["Net Kâr", data.netProfit.current, data.netProfit.previous, data.netProfit.diff, data.netProfit.pct],
          ],
        }),
      },
      {
        id: "balanceSummary",
        label: "Bilanço Özeti",
        render: (data: any) => ({
          type: "table",
          title: "Bilanço Özeti",
          headers: ["Kalem", "Cari Yıl", "Önceki Yıl", "Fark", "%"],
          rows: [
            ["Dönen Varlıklar", data.currentAssets.current, data.currentAssets.previous, data.currentAssets.diff, data.currentAssets.pct],
            ["Duran Varlıklar", data.nonCurrentAssets.current, data.nonCurrentAssets.previous, data.nonCurrentAssets.diff, data.nonCurrentAssets.pct],
            ["Kısa Vadeli Yükümlülükler", data.shortTermLiabilities.current, data.shortTermLiabilities.previous, data.shortTermLiabilities.diff, data.shortTermLiabilities.pct],
            ["Uzun Vadeli Yükümlülükler", data.longTermLiabilities.current, data.longTermLiabilities.previous, data.longTermLiabilities.diff, data.longTermLiabilities.pct],
            ["Öz Kaynaklar", data.equity.current, data.equity.previous, data.equity.diff, data.equity.pct],
          ],
        }),
      },
      {
        id: "ratios",
        label: "Finansal Yapı Göstergeleri",
        render: (ratios: any) => ({
          type: "table",
          title: "Finansal Yapı Göstergeleri",
          headers: ["Rasyo", "Değer"],
          rows: [
            ["Cari Oran", ratios.currentRatio],
            ["Likidite Oranı", ratios.quickRatio],
            ["Borç / Öz Kaynak", ratios.debtToEquity],
            ["Kaldıraç Oranı", ratios.leverage],
          ],
        }),
      },
      {
        id: "commentary",
        label: "Kısa Yorum",
        render: (commentary: string) => ({
          type: "paragraph",
          title: "Genel Değerlendirme",
          text: commentary,
        }),
      },
    ],
  },

  EN: {
    meta: {
      title: "Executive Summary Report",
    },
    sections: [
      {
        id: "cover",
        label: "Cover",
        render: (meta: any) => ({
          type: "block",
          content: [
            { type: "h1", text: meta.companyName || "Company Name" },
            { type: "h2", text: "Executive Summary Report" },
            {
              type: "p",
              text: `Period: ${meta.currentYear} (Comparison: ${meta.previousYear})`,
            },
            {
              type: "p",
              text: `Generated At: ${new Date(meta.generatedAt).toLocaleDateString("en-US")}`,
            },
          ],
        }),
      },
      {
        id: "profitSummary",
        label: "Profitability Summary",
        render: (data: any) => ({
          type: "table",
          title: "Profitability Summary",
          headers: ["Metric", "Current Year", "Previous Year", "Difference", "%"],
          rows: [
            ["Net Sales", data.netSales.current, data.netSales.previous, data.netSales.diff, data.netSales.pct],
            ["Gross Profit", data.grossProfit.current, data.grossProfit.previous, data.grossProfit.diff, data.grossProfit.pct],
            ["Operating Profit", data.operatingProfit.current, data.operatingProfit.previous, data.operatingProfit.diff, data.operatingProfit.pct],
            ["Net Profit", data.netProfit.current, data.netProfit.previous, data.netProfit.diff, data.netProfit.pct],
          ],
        }),
      },
      {
        id: "balanceSummary",
        label: "Balance Sheet Summary",
        render: (data: any) => ({
          type: "table",
          title: "Balance Sheet Summary",
          headers: ["Item", "Current Year", "Previous Year", "Difference", "%"],
          rows: [
            ["Current Assets", data.currentAssets.current, data.currentAssets.previous, data.currentAssets.diff, data.currentAssets.pct],
            ["Non-Current Assets", data.nonCurrentAssets.current, data.nonCurrentAssets.previous, data.nonCurrentAssets.diff, data.nonCurrentAssets.pct],
            ["Short-Term Liabilities", data.shortTermLiabilities.current, data.shortTermLiabilities.previous, data.shortTermLiabilities.diff, data.shortTermLiabilities.pct],
            ["Long-Term Liabilities", data.longTermLiabilities.current, data.longTermLiabilities.previous, data.longTermLiabilities.diff, data.longTermLiabilities.pct],
            ["Equity", data.equity.current, data.equity.previous, data.equity.diff, data.equity.pct],
          ],
        }),
      },
      {
        id: "ratios",
        label: "Financial Ratios",
        render: (ratios: any) => ({
          type: "table",
          title: "Financial Ratios",
          headers: ["Ratio", "Value"],
          rows: [
            ["Current Ratio", ratios.currentRatio],
            ["Quick Ratio", ratios.quickRatio],
            ["Debt to Equity", ratios.debtToEquity],
            ["Leverage", ratios.leverage],
          ],
        }),
      },
      {
        id: "commentary",
        label: "Commentary",
        render: (commentary: string) => ({
          type: "paragraph",
          title: "Overall Assessment",
          text: commentary,
        }),
      },
    ],
  },
};

