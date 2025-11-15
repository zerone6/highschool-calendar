import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { toDisplayJP } from '../utils/date';

export type SortBy = 'nameAsc' | 'nameDesc' | 'devAsc' | 'devDesc';

interface Props { dates:string[]; index:number; onGo:(i:number)=>void; onFinish:()=>void; allSelected:boolean; sortBy:SortBy; onSortChange:(sort:SortBy)=>void; }
export const DateNavigator:React.FC<Props>=({dates,index,onGo,onFinish,allSelected,sortBy,onSortChange})=>{
  return (
    <>
      <View style={s.bar}>
        <View style={s.side}>
          {index>0 && <TouchableOpacity style={s.btn} onPress={()=>onGo(index-1)}><Text style={s.btnText}>← 前へ ({toDisplayJP(dates[index-1])})</Text></TouchableOpacity>}
        </View>
        <Text style={s.center}>{toDisplayJP(dates[index])}</Text>
        <View style={[s.side,{alignItems:'flex-end'}]}>
          {index < dates.length-1 && <TouchableOpacity style={s.btn} onPress={()=>onGo(index+1)}><Text style={s.btnText}>次へ ({toDisplayJP(dates[index+1])}) →</Text></TouchableOpacity>}
          {index===dates.length-1 && allSelected && <TouchableOpacity style={s.finish} onPress={onFinish}><Text style={s.finishText}>最終確認</Text></TouchableOpacity>}
        </View>
      </View>
      <View style={s.sortBar}>
        <Text style={s.sortLabel}>並び替え:</Text>
        <TouchableOpacity style={[s.sortBtn, sortBy==='nameAsc' && s.sortActive]} onPress={()=>onSortChange('nameAsc')}><Text style={[s.sortBtnText, sortBy==='nameAsc' && s.sortActiveText]}>学校名 ↑</Text></TouchableOpacity>
        <TouchableOpacity style={[s.sortBtn, sortBy==='nameDesc' && s.sortActive]} onPress={()=>onSortChange('nameDesc')}><Text style={[s.sortBtnText, sortBy==='nameDesc' && s.sortActiveText]}>学校名 ↓</Text></TouchableOpacity>
        <TouchableOpacity style={[s.sortBtn, sortBy==='devAsc' && s.sortActive]} onPress={()=>onSortChange('devAsc')}><Text style={[s.sortBtnText, sortBy==='devAsc' && s.sortActiveText]}>偏差値 ↑</Text></TouchableOpacity>
        <TouchableOpacity style={[s.sortBtn, sortBy==='devDesc' && s.sortActive]} onPress={()=>onSortChange('devDesc')}><Text style={[s.sortBtnText, sortBy==='devDesc' && s.sortActiveText]}>偏差値 ↓</Text></TouchableOpacity>
      </View>
    </>
  );
};
const s=StyleSheet.create({
  bar:{flexDirection:'row',alignItems:'center',paddingVertical:10,paddingHorizontal:12,backgroundColor:'#f6f6f6',borderBottomWidth:1,borderColor:'#ddd'},
  side:{flex:1},
  center:{fontSize:22,fontWeight:'700',textAlign:'center',flex:1},
  btn:{paddingVertical:6,paddingHorizontal:10,borderWidth:1,borderColor:'#999',borderRadius:6,backgroundColor:'#fff',marginBottom:4},
  btnText:{fontSize:12},
  finish:{paddingVertical:8,paddingHorizontal:14,borderRadius:8,backgroundColor:'#2e7d32'},
  finishText:{color:'#fff',fontSize:14,fontWeight:'600'},
  sortBar:{flexDirection:'row',alignItems:'center',gap:6,paddingVertical:8,paddingHorizontal:12,backgroundColor:'#f0f0f0',borderBottomWidth:1,borderColor:'#e0e0e0'},
  sortLabel:{fontSize:13,fontWeight:'600',color:'#666',marginRight:4},
  sortBtn:{paddingVertical:6,paddingHorizontal:10,borderRadius:5,borderWidth:1,borderColor:'#ccc',backgroundColor:'#fff'},
  sortActive:{backgroundColor:'#1976d2',borderColor:'#1976d2'},
  sortBtnText:{fontSize:11,color:'#333'},
  sortActiveText:{color:'#fff',fontWeight:'600'}
});

