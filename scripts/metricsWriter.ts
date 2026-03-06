import * as fs from "fs";
import * as path from "path";

const METRICS_DIR = "metrics";

const MODULES = ["finansman", "amortisman", "kurfarki", "stok"] as const;

const KEYS = ["risk", "trend", "jest", "pw", "ui", "diff", "coverage", "render", "api", "memory", "bundle"] as const;

function getEnv(mod: string, key: string): string | undefined {
  return process.env[`${key}_${mod}`] ?? process.env[`${mod}_${key}`];
}

function main() {
  if (!fs.existsSync(METRICS_DIR)) {
    fs.mkdirSync(METRICS_DIR, { recursive: true });
  }

  for (const mod of MODULES) {
    const m: Record<string, unknown> = { module: mod };
    for (const key of KEYS) {
      const v = getEnv(mod, key);
      if (v !== undefined) m[key] = v;
    }

    const outPath = path.join(METRICS_DIR, `${mod}.json`);
    fs.writeFileSync(outPath, JSON.stringify(m, null, 2), "utf8");
    console.log("Yazıldı:", outPath);
  }

  console.log("metricsWriter tamamlandı.");
}

main();