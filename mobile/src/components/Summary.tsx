import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { SelectedByDate, CompletionStatusMap, SchoolRecord } from '../types';
import { calcDday, toDisplayJP } from '../utils/date';
import { schoolKey } from '../utils/storage';
interface Props { orderedDates:string[]; selections:SelectedByDate; completions:CompletionStatusMap; onToggle:(key:string,field:keyof CompletionStatusMap[string])=>void; onReset:()=>void; onRevisit:(date:string)=>void; userDev:number; }
function bgByDiff(dev:number|null,base:number){
  if(dev==null) return '#fff';
  const diff=dev-base;
  // 기준값 ± 3까지: 녹색
  if(diff >= -3 && diff <= 3) return '#e0f7e9';
  // 기준값 +3 초과 ~ +6 이하: 주황색
  if(diff > 3 && diff <= 6) return '#ffe4cc';
  // 기준값 +6 초과: 빨간색
  if(diff > 6) return '#ffd6d6';
  // 기준값 -3 초과 ~ -6 이하: 노란색
  if(diff < -3 && diff >= -6) return '#fff9cc';
  // 기준값 -6 미만: 흰색
  if(diff < -6) return '#ffffff';
  return '#ffffff';
}
const blank={applyStartDone:false,applyEndDone:false,examDateDone:false,resultDateDone:false};
export const Summary:React.FC<Props>=({orderedDates,selections,completions,onToggle,onReset,onRevisit,userDev})=>{
  const selected = useMemo(()=> orderedDates.filter(d=>{ const r=selections[d]; return r && r.schoolName!== '志願しない'; }),[orderedDates,selections]);
  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={{padding:16}}>
      <Text style={s.title}>最終選択結果</Text>
      <TouchableOpacity style={s.reset} onPress={onReset}><Text style={s.resetText}>選択をリセット</Text></TouchableOpacity>
      {selected.length===0 && <Text style={s.empty}>選択された学校はありません。</Text>}
      {selected.map(d=>{ const r=selections[d]; if(!r) return null; const key=r.id || schoolKey(r); const st=completions[schoolKey(r)]||blank; return (
        <View key={key} style={s.card}>
          <TouchableOpacity onPress={()=> onRevisit(r.examDate)}>
            <Text style={[s.school,{backgroundColor:bgByDiff(r.deviation,userDev)}]}>
              {r.schoolName} ({r.deviation??'-'}) {r.examName}
            </Text>
          </TouchableOpacity>
          <View style={s.dateRow}>
            {renderDateCell('出願開始',r.applyStart,st.applyStartDone,()=>onToggle(key,'applyStartDone'))}
            {renderDateCell('出願締切',r.applyEnd,st.applyEndDone,()=>onToggle(key,'applyEndDone'))}
            {renderDateCell('試験日',r.examDate,st.examDateDone,()=>onToggle(key,'examDateDone'))}
            {renderDateCell('合格発表',r.resultDate,st.resultDateDone,()=>onToggle(key,'resultDateDone'))}
          </View>
          <View style={s.row}>
            <Text style={s.label}>延納:</Text><Text style={s.value}>{r.annual}</Text>
            <Text style={s.label2}>返還:</Text><Text style={s.value}>{r.refund}</Text>
          </View>
        </View>
      ); })}
      </ScrollView>
    </SafeAreaView>
  );
};
function renderDateCell(title:string,date:string,done:boolean,onPress:()=>void){ const dday=calcDday(date); return (
  <TouchableOpacity style={[ss.dateCell,done && ss.done]} onPress={onPress}>
    <Text style={ss.dateTitle}>{title}</Text>
    <Text style={ss.dateValue}>{toDisplayJP(date)}</Text>
    {!!dday && <Text style={ss.dday}>{dday}</Text>}
  </TouchableOpacity>
); }
const s=StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#fff'},
  title:{fontSize:28,fontWeight:'700',textAlign:'center',marginBottom:12},
  reset:{alignSelf:'center',paddingVertical:8,paddingHorizontal:14,borderRadius:8,borderWidth:1,borderColor:'#c62828',marginBottom:14},
  resetText:{color:'#c62828',fontWeight:'600'},
  empty:{textAlign:'center',color:'#666',marginTop:40},
  card:{borderWidth:1,borderColor:'#ddd',borderRadius:14,padding:14,marginBottom:16,backgroundColor:'#fafafa'},
  school:{fontSize:16,fontWeight:'700',padding:8,borderRadius:8,overflow:'hidden',marginBottom:8},
  row:{flexDirection:'row',alignItems:'center',marginTop:6},
  label:{width:50,fontSize:12,color:'#555',fontWeight:'600'},
  label2:{width:50,fontSize:12,color:'#555',fontWeight:'600',marginLeft:12},
  value:{flex:1,fontSize:12,color:'#222'},
  dateRow:{flexDirection:'row',justifyContent:'space-between',marginTop:8,marginBottom:6}
});
const ss=StyleSheet.create({
  dateCell:{width:'23.5%',borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:6,backgroundColor:'#fff'},
  done:{backgroundColor:'#e8f5e9',borderColor:'#64b5f6'},
  dateTitle:{fontSize:9,color:'#666'},
  dateValue:{fontSize:11,fontWeight:'600'},
  dday:{fontSize:8,color:'#888',marginTop:1}
});
