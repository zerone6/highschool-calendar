import { SelectedByDate, CompletionStatusMap } from '../types';

const SELECTION_KEY = 'tokyoSelections';
const COMPLETION_KEY = 'tokyoCompletions';
const USER_NAME_KEY = 'userName';
const USER_DEV_KEY = 'userDeviation';

export function loadSelections(): SelectedByDate {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSelections(sel: SelectedByDate) {
  localStorage.setItem(SELECTION_KEY, JSON.stringify(sel));
}

export function loadCompletions(): CompletionStatusMap {
  try {
    const raw = localStorage.getItem(COMPLETION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCompletions(map: CompletionStatusMap) {
  localStorage.setItem(COMPLETION_KEY, JSON.stringify(map));
}

export function schoolKey(record: { schoolName: string; examDate: string }): string {
  return `${record.examDate}__${record.schoolName}`;
}

export function loadUserName(): string {
  try { return localStorage.getItem(USER_NAME_KEY) || 'シア'; } catch { return 'シア'; }
}
export function saveUserName(name: string) { localStorage.setItem(USER_NAME_KEY, name); }
export function loadUserDeviation(): number {
  try { const v = localStorage.getItem(USER_DEV_KEY); return v ? parseInt(v,10) || 60 : 60; } catch { return 60; }
}
export function saveUserDeviation(dev: number) { localStorage.setItem(USER_DEV_KEY, String(dev)); }
