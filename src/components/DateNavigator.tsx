import React from 'react';
import { toDisplayJP } from '../utils/date';

export type SortBy = 'nameAsc' | 'nameDesc' | 'devAsc' | 'devDesc';

interface Props {
  dates: string[];
  currentIndex: number;
  onGo: (index: number) => void;
  onFinish: () => void;
  allSelected: boolean;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export const DateNavigator: React.FC<Props> = ({ dates, currentIndex, onGo, onFinish, allSelected, sortBy, onSortChange }) => {
  return (
    <>
      <div style={styles.nav}>
        <div style={styles.left}>
          {currentIndex > 0 && (
            <button style={styles.btn} onClick={() => onGo(currentIndex - 1)}>← 前へ ({toDisplayJP(dates[currentIndex - 1])})</button>
          )}
        </div>
        <div style={styles.center}>{toDisplayJP(dates[currentIndex])}</div>
        <div style={styles.right}>
          {currentIndex < dates.length - 1 && (
            <button style={styles.btn} onClick={() => onGo(currentIndex + 1)}>次へ ({toDisplayJP(dates[currentIndex + 1])}) →</button>
          )}
          {currentIndex === dates.length - 1 && allSelected && (
            <button style={styles.finishBtn} onClick={onFinish}>最終確認</button>
          )}
        </div>
      </div>
      <div style={styles.sortBar}>
        <span style={styles.sortLabel}>並び替え:</span>
        <button style={{...styles.sortBtn, ...(sortBy === 'nameAsc' ? styles.sortActive : {})}} onClick={() => onSortChange('nameAsc')}>学校名 ↑</button>
        <button style={{...styles.sortBtn, ...(sortBy === 'nameDesc' ? styles.sortActive : {})}} onClick={() => onSortChange('nameDesc')}>学校名 ↓</button>
        <button style={{...styles.sortBtn, ...(sortBy === 'devAsc' ? styles.sortActive : {})}} onClick={() => onSortChange('devAsc')}>偏差値 ↑</button>
        <button style={{...styles.sortBtn, ...(sortBy === 'devDesc' ? styles.sortActive : {})}} onClick={() => onSortChange('devDesc')}>偏差値 ↓</button>
      </div>
    </>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  nav: { display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1rem', background:'#fafafa', borderBottom:'1px solid #ddd', position:'sticky', top:0, zIndex:50 },
  left: { justifySelf:'start' },
  center: { fontWeight:600, fontSize:'1.32rem', textAlign:'center' },
  right: { justifySelf:'end', display:'flex', gap:'0.5rem', alignItems:'center' },
  btn: { padding:'0.4rem 0.9rem', fontSize:'0.9rem', borderRadius:'6px', border:'1px solid #999', background:'#fff', cursor:'pointer' },
  finishBtn: { padding:'0.5rem 1.1rem', fontSize:'0.95rem', borderRadius:'8px', border:'none', background:'#2e7d32', color:'#fff', cursor:'pointer' },
  sortBar: { display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1rem', background:'#f5f5f5', borderBottom:'1px solid #e0e0e0' },
  sortLabel: { fontSize:'0.85rem', fontWeight:600, color:'#666' },
  sortBtn: { padding:'0.35rem 0.75rem', fontSize:'0.8rem', borderRadius:'5px', border:'1px solid #ccc', background:'#fff', cursor:'pointer', transition:'all 0.2s' },
  sortActive: { background:'#1976d2', color:'#fff', borderColor:'#1976d2', fontWeight:600 }
};
