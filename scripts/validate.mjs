// Dependency-free validator. Run: node scripts/validate.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED = new Set(["Public", "Bank", "Mercantile", "Poya"]);
const KEYS = ["uid", "summary", "categories", "start", "end"];
const files = readdirSync(root).filter((f) => /^\d{4}\.json$/.test(f)).sort();
const errors = [];
const seenUids = new Map();

const isDate = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

for (const file of files) {
  const year = file.slice(0, 4);
  let data;
  try {
    data = JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: invalid JSON (${e.message})`);
    continue;
  }
  if (!Array.isArray(data) || data.length === 0) {
    errors.push(`${file}: must be a non-empty array`);
    continue;
  }
  let prevStart = "";
  data.forEach((h, i) => {
    const at = `${file}[${i}]`;
    if (typeof h !== "object" || h === null || Array.isArray(h)) {
      errors.push(`${at}: must be an object`);
      return;
    }
    const keys = Object.keys(h).sort().join(",");
    if (keys !== [...KEYS].sort().join(","))
      errors.push(`${at}: keys must be exactly ${KEYS.join(", ")}`);
    if (typeof h.uid !== "string" || !/^sl_\d+$/.test(h.uid))
      errors.push(`${at}: uid must match sl_<number>`);
    else if (seenUids.has(h.uid))
      errors.push(`${at}: duplicate uid ${h.uid} (also in ${seenUids.get(h.uid)})`);
    else seenUids.set(h.uid, at);
    if (typeof h.summary !== "string" || !h.summary.trim())
      errors.push(`${at}: summary must be a non-empty string`);
    if (!Array.isArray(h.categories) || h.categories.length === 0)
      errors.push(`${at}: categories must be a non-empty array`);
    else {
      for (const c of h.categories)
        if (!ALLOWED.has(c)) errors.push(`${at}: unknown category "${c}"`);
      if (new Set(h.categories).size !== h.categories.length)
        errors.push(`${at}: duplicate categories`);
    }
    if (!isDate(h.start)) errors.push(`${at}: start is not a valid YYYY-MM-DD date`);
    if (!isDate(h.end)) errors.push(`${at}: end is not a valid YYYY-MM-DD date`);
    if (isDate(h.start) && isDate(h.end)) {
      if (h.end <= h.start) errors.push(`${at}: end must be after start`);
      if (!h.start.startsWith(year))
        errors.push(`${at}: start ${h.start} is not in ${year}`);
      if (h.start < prevStart) errors.push(`${at}: not sorted by start date`);
      prevStart = h.start;
    }
  });
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${files.length} file(s) valid (${seenUids.size} holidays)`);
