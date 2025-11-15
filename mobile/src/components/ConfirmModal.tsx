import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SchoolRecord } from '../types';
interface Props { open:boolean; record?:SchoolRecord|null; onConfirm:()=>void; onCancel:()=>void; }
export const ConfirmModal:React.FC<Props>=({open,record,onConfirm,onCancel})=>{
  return (
    <Modal visible={open} transparent animationType='fade'>
      <View style={s.back}>
        <View style={s.box}>
          <Text style={s.title}>選択確認</Text>
          <Text style={s.msg}>{record? `${record.examDate} に ${record.schoolName} (偏差${record.deviation??'-'}) を志願しますか?`:'-'}</Text>
          <View style={s.row}>
            <TouchableOpacity style={[s.btn,s.cancel]} onPress={onCancel}><Text style={s.cancelText}>戻る</Text></TouchableOpacity>
            <TouchableOpacity style={[s.btn,s.ok]} onPress={onConfirm}><Text style={s.okText}>はい</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const s=StyleSheet.create({ back:{flex:1,backgroundColor:'rgba(0,0,0,0.35)',justifyContent:'center',alignItems:'center',padding:24}, box:{backgroundColor:'#fff',borderRadius:16,padding:20,width:'92%'}, title:{fontSize:18,fontWeight:'700',marginBottom:6}, msg:{fontSize:14,lineHeight:20,marginBottom:16}, row:{flexDirection:'row',justifyContent:'flex-end',gap:12}, btn:{paddingVertical:10,paddingHorizontal:18,borderRadius:8}, cancel:{backgroundColor:'#eee'}, ok:{backgroundColor:'#1976d2'}, cancelText:{color:'#333',fontSize:14,fontWeight:'600'}, okText:{color:'#fff',fontSize:14,fontWeight:'600'} });

