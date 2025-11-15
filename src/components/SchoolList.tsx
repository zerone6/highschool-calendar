import React from 'react';
import { SchoolRecord } from '../types';

export type SortBy = 'nameAsc' | 'nameDesc' | 'devAsc' | 'devDesc';

interface Props {
  records: SchoolRecord[];
  selected?: SchoolRecord;
  onSelect: (record: SchoolRecord) => void;
  sortBy: SortBy;
  baseDev: number;
}

export const SchoolList: React.FC<Props> = ({ records, selected, onSelect, sortBy, baseDev }) => {
  if (!records.length) return <div style={{ padding:'1rem', fontSize:'0.8rem', color:'#666' }}>表示する学校がありません。</div>;

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

  return (
    <div style={styles.container}>
      {sortedRecords.map(r => {
        const isSel = selected && selected.schoolName === r.schoolName && selected.examDate === r.examDate;
        const dev = r.deviation ?? null;
        let bg = '#ffffff';
        if (dev != null) {
          const diff = dev - baseDev;
          // 기준값 ± 3까지: 녹색
          if (diff >= -3 && diff <= 3) bg = '#e0f7e9';
          // 기준값 +3 초과 ~ +6 이하: 주황색
          else if (diff > 3 && diff <= 6) bg = '#ffe4cc';
          // 기준값 +6 초과: 빨간색
          else if (diff > 6) bg = '#ffd6d6';
          // 기준값 -3 초과 ~ -6 이하: 노란색
          else if (diff < -3 && diff >= -6) bg = '#fff9cc';
          // 기준값 -6 미만: 흰색
          else if (diff < -6) bg = '#ffffff';
        }
        return (
          <div key={r.schoolName + r.examDate + r.examName} style={{ ...styles.item, ...(isSel ? styles.selected : {}), background:bg }} onClick={() => onSelect(r)}>
            <div style={styles.row1}>
              <strong style={styles.school}>{r.schoolName}</strong>
              <span style={styles.deviation}>{r.deviation != null ? `偏差 ${r.deviation}` : ''}</span>
            </div>
            <div style={styles.meta}>
              <span style={styles.label}><strong>地域:</strong> {r.area || '-'}</span>
              <span style={styles.label}><strong>試験名称:</strong> {r.examName || '-'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: { padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' },
  item: { border:'1px solid #ccc', borderRadius:'10px', padding:'0.75rem 1rem', cursor:'pointer', background:'#fff', display:'flex', flexDirection:'column', gap:'0.4rem', transition:'background .15s,border-color .15s' },
  selected: { background:'#e3f2fd', borderColor:'#64b5f6' },
  row1: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  school: { fontSize:'1rem' },
  deviation: { fontSize:'0.75rem', color:'#444' },
  meta: { display:'flex', flexWrap:'wrap', gap:'0.9rem', fontSize:'0.7rem', color:'#333' },
  label: { display:'flex', gap:'0.3rem', alignItems:'center' }
};
