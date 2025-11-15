#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';

const excelPath = path.resolve('Data/tokyo_2025.xlsx');
const outPath = path.resolve('Data/tokyo_2025.json');

// JSON 존재 시 스킵
try {
  await access(outPath); // 접근 성공이면 파일 존재
  console.log('[genExcelJson] JSON already exists. Skip generation and use existing file:', outPath);
  process.exit(0);
} catch (_) {
  // 존재하지 않음 -> 계속 진행
}

try {
  const buf = await readFile(excelPath);
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets['Sheet1'] || wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error('Sheet not found');
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  if (!rows.length) throw new Error('No rows read');
  const dataRows = rows.slice(1);
  const records = dataRows.map(cols => {
    const [schoolName, area, deviation, examName, applyStart, applyEnd, examDate, resultDate, annual, refund] = cols;
    return {
      schoolName: str(schoolName),
      area: str(area),
      deviation: parseDeviation(deviation),
      category: '',
      examName: str(examName),
      applyStart: normalDate(applyStart),
      applyEnd: normalDate(applyEnd),
      examDate: normalDate(examDate),
      resultDate: normalDate(resultDate),
      annual: str(annual),
      refund: str(refund)
    };
  }).filter(r => r.examDate);
  // area 보정
  const areaMap = {};
  for (const r of records) if (r.schoolName && r.area) areaMap[r.schoolName] = r.area;
  for (const r of records) if (r.schoolName && !r.area && areaMap[r.schoolName]) r.area = areaMap[r.schoolName];
  await writeFile(outPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log('[genExcelJson] wrote', records.length, 'records to', outPath);
} catch (e) {
  console.error('[genExcelJson] failed:', e);
  process.exit(1);
}

function str(v){ return v == null ? '' : String(v).trim(); }
function parseDeviation(v){ if (v == null || v === '') return null; if (typeof v === 'number') return v; const n = parseInt(String(v),10); return isNaN(n)? null : n; }
function normalDate(v){ if (v == null || v === '') return ''; if (typeof v === 'number'){ const date = excelSerialToDate(v); if (date){ const m = String(date.getUTCMonth()+1).padStart(2,'0'); const d = String(date.getUTCDate()).padStart(2,'0'); return m + '/' + d; } } return str(v); }
function excelSerialToDate(serial){ if (typeof serial !== 'number') return null; // Excel 기준 1899-12-30 UTC
  const epoch = Date.UTC(1899,11,30); const ms = epoch + serial*86400000; return new Date(ms); }
