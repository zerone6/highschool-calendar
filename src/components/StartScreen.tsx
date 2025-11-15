import React from 'react';
import { loadUserName, saveUserName, loadUserDeviation, saveUserDeviation } from '../utils/storage';

interface Props { onStart: () => void; onExit?: () => void; }

export const StartScreen: React.FC<Props> = ({ onStart, onExit }) => {
  const [name, setName] = React.useState<string>(() => loadUserName());
  const [dev, setDev] = React.useState<number>(() => loadUserDeviation());

  const deviationOptions = Array.from({ length: 51 }, (_, i) => i + 40); // 40~90 1단위 (끝값 90)

  const handleStart = () => {
    saveUserName(name.trim() || 'シア');
    saveUserDeviation(dev);
    onStart();
  };

  return (
    <div style={styles.wrapper}>
      {/* 홈으로 돌아가기 버튼 */}
      {onExit && (
        <div style={{ position:'absolute', top:'1rem', left:'1rem', zIndex:50 }}>
          <button
            onClick={onExit}
            style={{
              padding:'0.5rem 1rem',
              fontSize:'0.85rem',
              borderRadius:'8px',
              border:'1px solid #d0d0d0',
              background:'#ffffff',
              cursor:'pointer',
              boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
              display:'flex',
              alignItems:'center',
              gap:'0.5rem',
              transition:'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <span style={{ fontSize:'1rem' }}>🏠</span>
            <span>ホームへ戻る</span>
          </button>
        </div>
      )}
      <div style={styles.titleArea}>
        <h1 style={styles.h1}>東京都私立学校<br/>入試日程選択</h1>
      </div>
      <div style={styles.formArea}>
        <div style={styles.userBox}>
          <label style={styles.label}>名前
            <input
              style={styles.input}
              value={name}
              onChange={e=>setName(e.target.value)}
              placeholder="シア"
            />
          </label>
          <label style={styles.label}>偏差値
            <select style={styles.select} value={dev} onChange={e=>setDev(parseInt(e.target.value,10))}>
              {deviationOptions.map(o=> <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <div style={styles.buttons}>
          <button style={styles.startBtn} onClick={handleStart}>開始</button>
        </div>
      </div>
      <div style={styles.credit}>시아슬아아빠</div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  wrapper: { flex:1, minHeight:'100vh', position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'flex-start', padding:'0 2rem', boxSizing:'border-box', background:'#fff' },
  titleArea: { position:'absolute', top:'20vh', left:'50%', transform:'translateX(-50%)', textAlign:'center', width:'100%', pointerEvents:'none' },
  h1: { fontSize:'clamp(2.34rem,5.85vw,4.03rem)', lineHeight:1.15, margin:0, whiteSpace:'pre-wrap' },
  formArea: { position:'absolute', top:'70vh', left:'50%', transform:'translate(-50%, -50%)', display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:'920px', padding:'1rem 0' },
  userBox: { display:'flex', gap:'1.5rem', marginBottom:'1.2rem', flexWrap:'wrap', justifyContent:'center' },
  label: { display:'flex', flexDirection:'column', fontSize:'0.8rem', fontWeight:600, color:'#333', gap:'0.35rem' },
  input: { padding:'0.55rem 0.7rem', border:'1px solid #999', borderRadius:'6px', minWidth:'180px', fontSize:'0.95rem' },
  select: { padding:'0.55rem 0.7rem', border:'1px solid #999', borderRadius:'6px', minWidth:'140px', fontSize:'0.95rem', background:'#fff' },
  buttons: { display:'flex', gap:'1rem', marginBottom:'0.5rem', flexWrap:'wrap', justifyContent:'center' },
  startBtn: { fontSize:'1.1rem', padding:'0.7rem 1.6rem', borderRadius:'8px', border:'1px solid #333', cursor:'pointer', background:'#fff' },
  exitBtn: { fontSize:'1.1rem', padding:'0.7rem 1.6rem', borderRadius:'8px', border:'1px solid #b71c1c', cursor:'pointer', background:'#fff', color:'#b71c1c' },
  credit: { position:'absolute', right:'1rem', bottom:'1rem', fontSize:'0.9rem', color:'#555' }
};
