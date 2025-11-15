import React, { useEffect, useState } from 'react';
import { loadUserName, saveUserName, loadUserDeviation, saveUserDeviation } from '../utils/storage';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
interface Props { onStart: () => void; }
export const StartScreen: React.FC<Props> = ({ onStart }) => {
  const [name,setName]=useState('シア');
  const [dev,setDev]=useState(60);
  useEffect(()=>{ (async()=>{ setName(await loadUserName()); setDev(await loadUserDeviation()); })(); },[]);
  const deviationOptions = Array.from({length:51},(_,i)=> i+40);
  const handleStart= async ()=>{ await saveUserName(name.trim()||'シア'); await saveUserDeviation(dev); onStart(); };
  return (
    <SafeAreaView style={s.wrapper}>
      <View style={s.titleBox}>
        <Text style={s.title}>東京都私立学校{"\n"}入試日程選択</Text>
      </View>
      <View style={s.formBox}>
        <View style={s.field}>
          <Text style={s.label}>名前</Text>
          <TextInput value={name} onChangeText={setName} placeholder="シア" style={s.input} />
        </View>
        <View style={s.field}>
          <Text style={s.label}>偏差値</Text>
          <View style={s.pickerWrap}>
            <Picker
              selectedValue={dev}
              onValueChange={(v)=> setDev(Number(v))}
              style={s.picker}
              itemStyle={s.pickerItem}
            >
              {deviationOptions.map(o=> <Picker.Item key={o} label={`${o}`} value={o} />)}
            </Picker>
          </View>
        </View>
        <View style={s.buttonRow}>
          <TouchableOpacity style={s.startBtn} onPress={handleStart}>
            <Text style={s.startText}>開始</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.endBtn} onPress={() => {}}>
            <Text style={s.endText}>終了</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.credit}>시아슬아아빠</Text>
      </View>
    </SafeAreaView>
  );
};
const s=StyleSheet.create({
  wrapper:{flex:1,backgroundColor:'#fff',alignItems:'center'},
  titleBox:{marginTop:'18%',alignItems:'center',paddingHorizontal:16},
  title:{fontSize:36,lineHeight:44,textAlign:'center',fontWeight:'700'},
  formBox:{marginTop:'22%',width:'86%'},
  field:{marginBottom:18},
  label:{fontSize:14,fontWeight:'600',marginBottom:6},
  input:{borderWidth:1,borderColor:'#999',borderRadius:8,paddingHorizontal:12,paddingVertical:10,fontSize:16,backgroundColor:'#fafafa'},
  pickerWrap:{
    borderWidth:1,
    borderColor:'#999',
    borderRadius:8,
    backgroundColor:'#fafafa',
    height: Platform.OS === 'ios' ? 200 : 50,
  },
  picker:{
    width:'100%',
    height: Platform.OS === 'ios' ? 200 : 50,
  },
  pickerItem:{
    fontSize: 18,
    height: 130,
    color: '#000',
  },
  buttonRow:{flexDirection:'row',gap:12,marginTop:8},
  startBtn:{flex:1,backgroundColor:'#1976d2',borderRadius:10,paddingVertical:14,alignItems:'center'},
  startText:{color:'#fff',fontSize:18,fontWeight:'600'},
  endBtn:{flex:1,backgroundColor:'#d32f2f',borderRadius:10,paddingVertical:14,alignItems:'center'},
  endText:{color:'#fff',fontSize:18,fontWeight:'600'},
  credit:{marginTop:28,fontSize:12,color:'#555',textAlign:'right'}
});

