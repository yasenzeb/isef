const fs = require('fs');

const csvPath = 'src/data/user_provided_anatomy.csv';
const dictPath = 'src/data/skeletalBoneDictionary.json';

const rawCsv = fs.readFileSync(csvPath, 'utf8');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

const lines = rawCsv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

let addedCount = 0;
let updatedCount = 0;

for (const line of lines) {
  // Check if header line
  if (line.startsWith('العربية') || line.includes('Function (EN)')) {
    continue;
  }

  // Split CSV handling commas
  // Match standard CSV parts
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  parts.push(cur.trim());

  if (parts.length >= 6) {
    const arName = parts[0];
    const enName = parts[1];
    const frName = parts[2] || '';
    const deName = parts[3] || '';
    const arFunc = parts[4];
    const enFunc = parts[5];
    const frFunc = parts[6] || '';
    const deFunc = parts[7] || '';

    if (!enName) continue;

    const entry = {
      ar: arName,
      descEn: enFunc,
      descAr: arFunc,
      fr: frName,
      de: deName,
      descFr: frFunc,
      descDe: deFunc
    };

    // Main key
    if (dict[enName]) updatedCount++; else addedCount++;
    dict[enName] = entry;

    // Arabic key lookup fallback
    dict[arName] = entry;

    // Normalized variants
    // 1. Lowercase
    dict[enName.toLowerCase()] = entry;

    // 2. Lateral variants: e.g. "Deltoid _L" -> "Deltoid (Left)", "Deltoid.l", "Deltoid.L", "Deltoid_L"
    if (enName.endsWith(' _L')) {
      const base = enName.slice(0, -3).trim();
      dict[`${base} (Left)`] = entry;
      dict[`${base}.l`] = entry;
      dict[`${base}.L`] = entry;
      dict[`${base}_L`] = entry;
      dict[`${base}_l`] = entry;
      dict[`${base} left`] = entry;
      dict[`${base} Left`] = entry;
      // Also register base if not exists
      if (!dict[base]) {
        const baseAr = arName.replace(/\s*_[LR]$/, '').replace(/\s*(الأيسر|الأيمن)$/, '').trim();
        dict[base] = {
          ar: baseAr,
          descEn: enFunc,
          descAr: arFunc,
          fr: frName.replace(/\s*_[LR]$/, '').trim(),
          de: deName.replace(/\s*_[LR]$/, '').trim()
        };
      }
    } else if (enName.endsWith(' _R')) {
      const base = enName.slice(0, -3).trim();
      dict[`${base} (Right)`] = entry;
      dict[`${base}.r`] = entry;
      dict[`${base}.R`] = entry;
      dict[`${base}_R`] = entry;
      dict[`${base}_r`] = entry;
      dict[`${base} right`] = entry;
      dict[`${base} Right`] = entry;
      if (!dict[base]) {
        const baseAr = arName.replace(/\s*_[LR]$/, '').replace(/\s*(الأيسر|الأيمن)$/, '').trim();
        dict[base] = {
          ar: baseAr,
          descEn: enFunc,
          descAr: arFunc,
          fr: frName.replace(/\s*_[LR]$/, '').trim(),
          de: deName.replace(/\s*_[LR]$/, '').trim()
        };
      }
    }
  }
}

fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), 'utf8');
console.log(`Merged CSV! Added: ${addedCount}, Updated: ${updatedCount}. Total dictionary entries: ${Object.keys(dict).length}`);
