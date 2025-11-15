import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectedByDate, CompletionStatusMap } from '../types';
const SELECTION_KEY='rn_tokyoSelections';
const COMPLETION_KEY='rn_tokyoCompletions';
const USER_NAME_KEY='rn_userName';
const USER_DEV_KEY='rn_userDeviation';
export async function loadSelections(): Promise<SelectedByDate> { try { const raw = await AsyncStorage.getItem(SELECTION_KEY); return raw? JSON.parse(raw):{}; } catch { return {}; } }
export async function saveSelections(sel: SelectedByDate){ await AsyncStorage.setItem(SELECTION_KEY, JSON.stringify(sel)); }
export async function loadCompletions(): Promise<CompletionStatusMap>{ try { const raw=await AsyncStorage.getItem(COMPLETION_KEY); return raw? JSON.parse(raw):{}; } catch { return {}; } }
export async function saveCompletions(map: CompletionStatusMap){ await AsyncStorage.setItem(COMPLETION_KEY, JSON.stringify(map)); }
export function schoolKey(r:{schoolName:string;examDate:string;examName?:string}){ return `${r.examDate}__${r.schoolName}__${r.examName||''}`; }
// 마이그레이션: 과거 키(2 segment) -> 신규 키(3 segment)
export async function migrateCompletionKeys(map:CompletionStatusMap, records:SelectedByDate): Promise<CompletionStatusMap> {
  const upgraded: CompletionStatusMap = {};
  for(const [d,rec] of Object.entries(records)){
    if(!rec) continue;
    const newKey = schoolKey(rec);
    const oldKey = `${rec.examDate}__${rec.schoolName}`; // 이전 포맷
    upgraded[newKey] = map[newKey] || map[oldKey] || { applyStartDone:false, applyEndDone:false, examDateDone:false, resultDateDone:false };
  }
  return upgraded;
}
export async function loadUserName(){ try { return (await AsyncStorage.getItem(USER_NAME_KEY)) || 'シア'; } catch { return 'シア'; } }
export async function saveUserName(v:string){ await AsyncStorage.setItem(USER_NAME_KEY,v); }
export async function loadUserDeviation(){ try { const v= await AsyncStorage.getItem(USER_DEV_KEY); return v? parseInt(v,10)||60:60; } catch { return 60; } }
export async function saveUserDeviation(dev:number){ await AsyncStorage.setItem(USER_DEV_KEY,String(dev)); }
