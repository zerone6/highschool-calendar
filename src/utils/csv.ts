import Papa from 'papaparse';
import { SchoolRecord, DateGroupedRecords } from '../types';
import { sortExamDates } from './date';
import * as XLSX from 'xlsx';

// 엑셀 기본 경로 및 시트명
const DEFAULT_XLSX_PATH = '/highschool/data/tokyo_2025.xlsx';
const DEFAULT_XLSX_SHEET = 'Sheet1';
const DEFAULT_JSON_PATH = '/highschool/data/tokyo_2025.json';

export async function loadCsv(path: string = DEFAULT_JSON_PATH): Promise<SchoolRecord[]> {
  if (path.endsWith('.json')) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`JSON fetch failed: ${res.status}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error('JSON format invalid');
      const records: SchoolRecord[] = json.map(j => ({
        schoolName: j.schoolName || '',
        area: j.area || '',
        deviation: typeof j.deviation === 'number' ? j.deviation : (j.deviation ? parseInt(String(j.deviation),10) || null : null),
        category: j.category || '',
        examName: j.examName || '',
        applyStart: j.applyStart || '',
        applyEnd: j.applyEnd || '',
        examDate: j.examDate || '',
        resultDate: j.resultDate || '',
        annual: j.annual || '',
        refund: j.refund || ''
      })).filter(r=>r.examDate);
      fillMissingAreas(records);
      return records.map(cleanRecord);
    } catch (e) {
      console.error('[loadCsv] JSON 로드 실패:', e);
      throw e; // 상위 loadGrouped에서 catch
    }
  }
  if (path.endsWith('.xlsx')) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`XLSX fetch failed: ${res.status}`);
      const ab = await res.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const sheet = wb.Sheets[DEFAULT_XLSX_SHEET] || wb.Sheets[wb.SheetNames[0]];
      if (!sheet) throw new Error('Sheet not found');
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
      if (!rows.length) throw new Error('No rows read');
      const dataRows = rows.slice(1);
      const mapped: SchoolRecord[] = dataRows.map(cols => mapXlsxRow(cols)).filter(r => r.examDate);
      fillMissingAreas(mapped);
      return mapped.map(cleanRecord);
    } catch (e) {
      console.error('[loadCsv] XLSX 로드 실패:', e);
      throw e;
    }
  }
  // 기존 로직 fallback
  return legacyLoad(path);
}

function excelSerialToDate(serial: any): string {
  if (typeof serial !== 'number') return String(serial || '').trim();
  const epoch = Date.UTC(1899, 11, 30);
  const ms = epoch + serial * 86400000;
  const date = new Date(ms);
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${m}/${d}`;
}

function mapXlsxRow(cols: any[]): SchoolRecord {
  const [schoolName, area, deviation, examName, applyStart, applyEnd, examDate, resultDate, annual, refund] = cols as (string | number | undefined)[];
  return {
    schoolName: toStr(schoolName),
    area: toStr(area),
    deviation: deviation != null ? (typeof deviation === 'number' ? deviation : parseInt(String(deviation),10) || null) : null,
    category: '',
    examName: toStr(examName),
    applyStart: excelSerialToDate(applyStart),
    applyEnd: excelSerialToDate(applyEnd),
    examDate: excelSerialToDate(examDate),
    resultDate: excelSerialToDate(resultDate),
    annual: toStr(annual),
    refund: toStr(refund),
  };
}

function toStr(v: any): string { return (v == null ? '' : String(v)).trim(); }

async function legacyLoad(path: string): Promise<SchoolRecord[]> {
  const isTxt = path.endsWith('.txt');
  const isFixed = path.endsWith('_fixed.csv');
  if (isFixed) {
    const res = await fetch(path);
    const text = await res.text();
    const lines = text.replace(/\r\n?/g,'\n').split('\n').filter(l=>l.trim().length>0);
    if (!lines.length) return [];
    const data = lines.slice(1);
    const records = data.map(line => {
      const norm = line.replace(/[ ]{2,}/g,'\t').replace(/\t+/g,'\t');
      const cols = norm.split('\t');
      return mapColumnsFlexible(cols);
    }).map(cleanRecord).filter(r=>r.examDate);
    fillMissingAreas(records);
    return records;
  }
  if (!isTxt) {
    const res = await fetch(path);
    const text = await res.text();
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
    const rows = parsed.data as string[][];
    if (!rows.length) return [];
    const dataRows = rows.slice(1);
    const records = dataRows.map(mapColumnsFlexible).map(cleanRecord).filter(r => r.examDate);
    fillMissingAreas(records);
    return records;
  }
  const res = await fetch(path);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let decoder: TextDecoder;
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) decoder = new TextDecoder('utf-16le');
  else if (bytes[0] === 0xFE && bytes[1] === 0xFF) decoder = new TextDecoder('utf-16be');
  else decoder = new TextDecoder('utf-8');
  let text = decoder.decode(buf).replace(/\r\n?/g,'\n');
  const lines = text.split('\n').filter(l=>l.trim().length>0);
  if (!lines.length) return [];
  const dataLines = lines.slice(1);
  const records = dataLines.map(line => line.split('\t')).map(mapColumnsFlexible).map(cleanRecord).filter(r => r.examDate);
  fillMissingAreas(records);
  return records;
}

function mapColumnsFlexible(cols: string[]): SchoolRecord {
  let schoolName = (cols[0] || '').trim();
  let area = (cols[1] || '').trim();
  let deviationRaw = cols[2];
  let deviation = deviationRaw ? parseInt(deviationRaw, 10) || null : null;
  let category: string; let examName: string; let applyStart: string; let applyEnd: string; let examDate: string; let resultDate: string; let annual: string; let refund: string;
  if (cols.length >= 11) {
    category = (cols[3] || '').trim();
    examName = (cols[4] || '').trim();
    applyStart = (cols[5] || '').trim();
    applyEnd = (cols[6] || '').trim();
    examDate = (cols[7] || '').trim();
    resultDate = (cols[8] || '').trim();
    annual = (cols[9] || '').trim();
    refund = (cols[10] || '').trim();
  } else {
    examName = (cols[3] || '').trim();
    applyStart = (cols[4] || '').trim();
    applyEnd = (cols[5] || '').trim();
    examDate = (cols[6] || '').trim();
    resultDate = (cols[7] || '').trim();
    annual = (cols[8] || '').trim();
    refund = (cols[9] || '').trim();
    category = '';
  }
  return { schoolName, area, deviation, category, examName, applyStart, applyEnd, examDate, resultDate, annual, refund };
}

function cleanField(s: string): string { return (s || '').replace(/\uFFFD/g,'').replace(/\uFEFF/g,'').trim(); }
function cleanRecord(r: SchoolRecord): SchoolRecord { return { ...r, schoolName: cleanField(r.schoolName), area: cleanField(r.area), category: cleanField(r.category), examName: cleanField(r.examName), applyStart: cleanField(r.applyStart), applyEnd: cleanField(r.applyEnd), examDate: cleanField(r.examDate), resultDate: cleanField(r.resultDate), annual: cleanField(r.annual), refund: cleanField(r.refund) }; }
function fillMissingAreas(records: SchoolRecord[]) {
  const areaMap: Record<string,string> = {};
  for (const r of records) if (r.schoolName && r.area) areaMap[r.schoolName] = r.area;
  for (const r of records) if (r.schoolName && !r.area && areaMap[r.schoolName]) r.area = areaMap[r.schoolName];
}
function logDecodeIssues(records: SchoolRecord[]) { if (typeof window==='undefined') return; const hasBroken = records.some(r=>/\uFFFD/.test(Object.values(r).join(''))); if (hasBroken) console.warn('디코딩 후 깨진 문자(\uFFFD)가 남아 있습니다.'); }

export async function loadGrouped(): Promise<{ grouped: DateGroupedRecords; orderedDates: string[] }> {
  const records = await loadCsv();
  console.info('[loadGrouped] raw records count:', records.length);
  const missingDate = records.filter(r => !r.examDate).length;
  if (missingDate) console.warn('[loadGrouped] records missing examDate:', missingDate);
  const valid = records.filter(r => r.examDate);
  console.info('[loadGrouped] valid records count:', valid.length);
  logDecodeIssues(valid);
  const grouped: DateGroupedRecords = {};
  for (const rec of valid) {
    grouped[rec.examDate] ||= [];
    grouped[rec.examDate].push(rec);
  }
  const orderedDates = sortExamDates(Object.keys(grouped));
  console.info('[loadGrouped] dates:', orderedDates);
  return { grouped, orderedDates };
}
