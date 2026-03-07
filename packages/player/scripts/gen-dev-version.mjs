import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const tauriConfPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src-tauri/tauri.conf.json",
);

const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf-8"));

// 核心逻辑：只确保版本号是 0.0.1 这种干净的格式
// 删掉所有可能导致冲突的移动端配置
tauriConf.version = "0.0.1";
delete tauriConf.ios;
delete tauriConf.android;
if (tauriConf.bundle) {
  delete tauriConf.bundle.ios;
  delete tauriConf.bundle.android;
}

writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));
console.log("✅ 已清理 tauri.conf.json 中的非法配置字段");
