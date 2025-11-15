import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SchoolRecord } from '../types';

export type SortBy = 'nameAsc' | 'nameDesc' | 'devAsc' | 'devDesc';

interface Props { records:SchoolRecord[]; selected?:SchoolRecord; onSelect:(r:SchoolRecord)=>void; baseDev:number; sortBy:SortBy; }
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
export const SchoolList:React.FC<Props>=({records,selected,onSelect,baseDev,sortBy})=>{
  // 정렬 로직
  const sortedRecords = [...records].sort((a, b) => {
    if (sortBy === 'nameAsc') {
      return (a.schoolName || '').localeCompare(b.schoolName || '', 'ja');
    } else if (sortBy === 'nameDesc') {
      return (b.schoolName || '').localeCompare(a.schoolName || '', 'ja');
    } else if (sortBy === 'devAsc') {
      const devA = a.deviation ?? -Infinity;
      const devB = b.deviation ?? -Infinity;
      return devA - devB;
    } else if (sortBy === 'devDesc') {
      const devA = a.deviation ?? -Infinity;
      const devB = b.deviation ?? -Infinity;
      return devB - devA;
    }
    return 0;
  });

  return <FlatList data={sortedRecords} keyExtractor={(r)=> r.id || (r.schoolName + '_' + r.examName + '_' + r.examDate)} contentContainerStyle={{padding:12,paddingBottom:140}} renderItem={({item})=>{
    const isSel = selected && selected.schoolName===item.schoolName && selected.examDate===item.examDate;
    return (
      <TouchableOpacity style={[s.card,{backgroundColor:bgByDiff(item.deviation,baseDev),borderColor:isSel? '#64b5f6':'#ccc'}]} onPress={()=>onSelect(item)}>
        <View style={s.row}><Text style={s.name}>{item.schoolName}</Text><Text style={s.dev}>{item.deviation!=null? `偏差 ${item.deviation}`:''}</Text></View>
        <View style={s.meta}><Text style={s.metaText}>地域: {item.area||'-'}</Text><Text style={s.metaText}>試験: {item.examName||'-'}</Text></View>
      </TouchableOpacity>
    );
  }} />;
};
const s=StyleSheet.create({
  card:{borderWidth:1,borderRadius:12,padding:12,marginBottom:10},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  name:{fontSize:15,fontWeight:'600'},
  dev:{fontSize:11,color:'#444'},
  meta:{flexDirection:'row',flexWrap:'wrap',marginTop:6},
  metaText:{fontSize:11,marginRight:10,color:'#333'}
});
