import React from 'react';
import { toDisplayJP } from '../utils/date';
import { SchoolRecord } from '../types';

interface Props {
  open: boolean;
  date: string;
  record?: SchoolRecord;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ open, date, record, onConfirm, onCancel }) => {
  if (!open || !record) return null;
  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <p style={{ marginTop:0 }}>{`${toDisplayJP(date)}\n「${record.schoolName}」(偏差値 ${record.deviation ?? ''}) に志願しますか？`}</p>
        <div style={styles.row}>
          <button onClick={onConfirm} style={styles.ok}>はい</button>
          <button onClick={onCancel} style={styles.cancel}>いいえ</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  backdrop: { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal: { background:'#fff', padding:'1.5rem', borderRadius:'12px', width:'min(420px,90%)', boxShadow:'0 4px 18px rgba(0,0,0,0.3)', whiteSpace:'pre-line' },
  row: { display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'1rem' },
  ok: { padding:'0.5rem 1.3rem', cursor:'pointer', background:'#1976d2', color:'#fff', border:'none', borderRadius:'6px' },
  cancel: { padding:'0.5rem 1.3rem', cursor:'pointer', background:'#eee', color:'#333', border:'1px solid #ccc', borderRadius:'6px' }
};
