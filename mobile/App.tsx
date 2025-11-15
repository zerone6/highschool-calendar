import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StartScreen } from './src/components/StartScreen';
import { DateNavigator, SortBy } from './src/components/DateNavigator';
import { SchoolList } from './src/components/SchoolList';
import { ConfirmModal } from './src/components/ConfirmModal';
import { Summary } from './src/components/Summary';
import rawData from './assets/tokyo_2025.json';
import { SchoolRecord, DateGroupedRecords, SelectedByDate, CompletionStatusMap } from './src/types';
import { schoolKey, loadSelections, saveSelections, loadCompletions, saveCompletions, loadUserDeviation, migrateCompletionKeys } from './src/utils/storage';

enum Phase { START='START', SELECT='SELECT', SUMMARY='SUMMARY' }

function groupByDate(data: SchoolRecord[]): { grouped: DateGroupedRecords; ordered: string[] } {
  const grouped: DateGroupedRecords = {};
  data.forEach((r,i)=>{ const id = `${r.examDate}__${r.schoolName}__${r.examName}__${i}`; (r as any).id = id; if(!grouped[r.examDate]) grouped[r.examDate]=[]; grouped[r.examDate].push(r); });
  const ordered = Object.keys(grouped).sort((a,b)=> a.localeCompare(b,undefined,{numeric:true}));
  return { grouped, ordered };
}

export default function App(){
  const [phase,setPhase]=useState<Phase>(Phase.START);
  const [grouped,setGrouped]=useState<DateGroupedRecords>({});
  const [dates,setDates]=useState<string[]>([]);
  const [index,setIndex]=useState(0);
  const [selections,setSelections]=useState<SelectedByDate>({});
  const [completions,setCompletions]=useState<CompletionStatusMap>({});
  const [userDev,setUserDev]=useState<number>(60);
  const [loading,setLoading]=useState(true);
  const [modalRec,setModalRec]=useState<SchoolRecord|null>(null);
  const [modalOpen,setModalOpen]=useState(false);
  const [sortBy,setSortBy]=useState<SortBy>('devDesc');

  useEffect(()=>{ const {grouped,ordered}=groupByDate(rawData as SchoolRecord[]); setGrouped(grouped); setDates(ordered); },[]);
  useEffect(()=>{ (async()=>{ setSelections(await loadSelections()); const loadedC= await loadCompletions(); setUserDev(await loadUserDeviation()); setCompletions(loadedC); setLoading(false); })(); },[]);
  // 선택 변경 혹은 데이터 초기 로드 후 마이그레이션 수행
  useEffect(()=>{ (async()=>{ if(Object.keys(grouped).length===0) return; const migrated = await migrateCompletionKeys(completions, selections); if(Object.keys(migrated).length !== Object.keys(completions).length){ setCompletions(migrated); saveCompletions(migrated); } })(); },[grouped, selections]);
  const currentDate = dates[index];
  const currentRecords = currentDate ? grouped[currentDate] || [] : [];
  const NO_APPLY: SchoolRecord | null = currentDate ? { id:`NO_APPLY_${currentDate}`, schoolName: '志願しない', area: '', deviation: null, category: '', examName: '', applyStart: '', applyEnd: '', examDate: currentDate, resultDate: '', annual: '', refund: '' } : null;

  function openConfirm(r:SchoolRecord){ setModalRec(r); setModalOpen(true); }
  function confirm(){
    if(!modalRec) return;
    const date = modalRec.examDate;
    const next = { ...selections, [date]: modalRec };
    setSelections(next); saveSelections(next);
    // 완료키 마이그레이션 (선택 변경 후)
    (async()=>{ const migrated = await migrateCompletionKeys(completions, next); setCompletions(migrated); saveCompletions(migrated); })();
    setModalOpen(false); setModalRec(null);
    const idx = dates.indexOf(date);
    if(idx >=0 && idx < dates.length-1){ setIndex(idx+1); }
    else if(idx === dates.length-1 && dates.every(d => next[d])) setPhase(Phase.SUMMARY);
  }
  function cancel(){ setModalOpen(false); setModalRec(null); }
  const allSelected = dates.length>0 && dates.every(d=> selections[d]);
  function finish(){ if(allSelected) setPhase(Phase.SUMMARY); }
  function toggleCompletion(key:string,field:keyof CompletionStatusMap[string]){ const next={...completions,[key]:{...(completions[key]||{applyStartDone:false,applyEndDone:false,examDateDone:false,resultDateDone:false}),[field]: !(completions[key]?.[field])}}; setCompletions(next); saveCompletions(next); }
  function revisit(date:string){ const idx=dates.indexOf(date); if(idx>=0){ setIndex(idx); setPhase(Phase.SELECT); } }
  function resetAll(){ setSelections({}); saveSelections({}); setCompletions({}); saveCompletions({}); setPhase(Phase.START); setIndex(0); }
  function finishAllNoApply(){
    const next = { ...selections } as SelectedByDate;
    for(const d of dates){ if(!next[d]) next[d] = { id:`NO_APPLY_${d}`, schoolName: '志願しない', area:'', deviation:null, category:'', examName:'', applyStart:'', applyEnd:'', examDate:d, resultDate:'', annual:'', refund:'' }; }
    setSelections(next); saveSelections(next);
    (async()=>{ const migrated = await migrateCompletionKeys(completions, next); setCompletions(migrated); saveCompletions(migrated); })();
    setPhase(Phase.SUMMARY);
  }

  if(loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator size='large' /></View>;
  if(phase===Phase.START) return <StartScreen onStart={async ()=> { setUserDev(await loadUserDeviation()); setPhase(Phase.SELECT); }} />;
  if(phase===Phase.SUMMARY) return <Summary orderedDates={dates} selections={selections} completions={completions} onToggle={toggleCompletion} onReset={resetAll} onRevisit={revisit} userDev={userDev} />;
  if(phase===Phase.SELECT) return (
    <SafeAreaView style={{flex:1,backgroundColor:'#f0f2f5'}}>
      <DateNavigator dates={dates} index={index} onGo={setIndex} onFinish={finish} allSelected={allSelected} sortBy={sortBy} onSortChange={setSortBy} />
      <SchoolList records={currentRecords} selected={selections[currentDate]} onSelect={openConfirm} baseDev={userDev} sortBy={sortBy} />
      {NO_APPLY && (
        <View style={{ position:'absolute', left:0, right:0, bottom:34, backgroundColor:'#fff', borderTopWidth:1, borderColor:'#ddd', padding:10, paddingBottom:16 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <Text style={{ fontSize:12, color:'#444' }}>この日は志願しない可能性があります。</Text>
            <TouchableOpacity onPress={() => { setModalRec(NO_APPLY); setModalOpen(true); }} style={{ paddingVertical:8, paddingHorizontal:14, borderWidth:1, borderColor:'#999', borderRadius:8 }}>
              <Text style={{ fontSize:12 }}>志願しないを選択</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={finishAllNoApply} style={{ paddingVertical:8, paddingHorizontal:14, backgroundColor:'#1976d2', borderRadius:8 }}>
              <Text style={{ fontSize:12, color:'#fff' }}>選択終了</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ConfirmModal open={modalOpen} record={modalRec} onConfirm={confirm} onCancel={cancel} />
    </SafeAreaView>
  );
}
