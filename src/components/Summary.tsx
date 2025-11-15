import React from 'react';
import { SelectedByDate, CompletionStatusMap, SchoolRecord } from '../types';
import { schoolKey } from '../utils/storage';

const NO_APPLY_NAMES = ['志願しない','지원하지 않음'];

interface Props {
  orderedDates: string[];
  selections: SelectedByDate;
  completions: CompletionStatusMap;
  onToggle: (key: string, field: keyof typeof blankStatus) => void;
  onReset: () => void;
  onRevisit: (date: string) => void;
  onBackToHome?: () => void;
  userDev: number;
}

const blankStatus = {
  applyStartDone: false,
  applyEndDone: false,
  examDateDone: false,
  resultDateDone: false
};

export const Summary: React.FC<Props> = ({ orderedDates, selections, completions, onToggle, onReset, onRevisit, onBackToHome, userDev }) => {
  const isNoApply = (r?: SchoolRecord) => !r || NO_APPLY_NAMES.includes((r.schoolName || '').trim());
  const selectedDates = orderedDates.filter(d => {
    const r = selections[d];
    return r && !isNoApply(r);
  });
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'linear-gradient(to bottom right, rgb(99, 102, 241), rgb(168, 85, 247), rgb(168, 85, 247))' }}>
      {/* Fixed Header */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'white', borderRadius:'0 0 12px 12px', padding:'0.75rem 0.5rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem', paddingLeft:'0.5rem', paddingRight:'0.5rem' }}>
          {onBackToHome ? (
            <button onClick={onBackToHome} style={{ padding:'0.5rem 1rem', border:'1px solid #4f46e5', background:'#fff', color:'#4f46e5', borderRadius:'8px', cursor:'pointer', fontWeight:'500', transition:'all 0.2s', whiteSpace:'nowrap' }} onMouseOver={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4f46e5'; }}>ホームへ</button>
          ) : (
            <div style={{ width:'100px' }} />
          )}
          <h2 style={{ margin:0, textAlign:'center', color:'#1f2937', fontSize:'1.5rem', fontWeight:'bold', flex:'1' }}>最終選択結果</h2>
          <button onClick={onReset} style={{ padding:'0.5rem 1rem', border:'1px solid #dc2626', background:'#fff', color:'#dc2626', borderRadius:'8px', cursor:'pointer', fontWeight:'500', transition:'all 0.2s', whiteSpace:'nowrap' }} onMouseOver={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#dc2626'; }}>選択をリセット</button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'0.5rem', paddingBottom:'2rem' }}>
        {selectedDates.length === 0 ? (
          <div style={{ background:'white', borderRadius:'12px', padding:'2rem', textAlign:'center', color:'#6b7280', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' }}>選択された学校はありません。</div>
        ) : (
          <div style={{ display:'grid', gap:'0.5rem' }}>
            {selectedDates.map(d => {
              const rec = selections[d];
              if (!rec) return null;
              return renderCardRecord(rec);
            })}
          </div>
        )}
      </div>
    </div>
  );

  function renderCardRecord(rec: SchoolRecord) {
    const key = schoolKey(rec);
    const status = completions[key] || blankStatus;
    const dev = rec.deviation;
    let nameBg = '#f3f4f6';
    let nameColor = '#1f2937';
    if (dev != null) {
      const diff = dev - userDev;
      if (diff >= -3 && diff <= 3) { nameBg = '#d1fae5'; nameColor = '#065f46'; }
      else if (diff > 3 && diff <= 6) { nameBg = '#fed7aa'; nameColor = '#9a3412'; }
      else if (diff > 6) { nameBg = '#fecaca'; nameColor = '#991b1b'; }
      else if (diff < -3 && diff >= -6) { nameBg = '#fef3c7'; nameColor = '#92400e'; }
    }

    const checkCell = (field: keyof typeof blankStatus, label: string, value: string) => {
      const done = status[field];
      const ddayText = formatDday(value);
      return (
        <div onClick={() => onToggle(key, field)} style={{ padding:'0.5rem 0.75rem', background: done ? '#dcfce7' : '#f9fafb', borderRadius:'6px', cursor:'pointer', border:'2px solid ' + (done ? '#22c55e' : '#e5e7eb'), transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
          <div style={{ fontSize:'0.7rem', color:'#6b7280', fontWeight:'500', minWidth:'60px' }}>{label}</div>
          <div style={{ fontSize:'0.85rem', fontWeight:'600', color:'#1f2937', flex:'1', textAlign:'center' }}>{value || '-'}</div>
          {ddayText && <div style={{ fontSize:'0.65rem', color:'#9ca3af', minWidth:'45px', textAlign:'right' }}>{ddayText}</div>}
        </div>
      );
    };

    // 연납/반환 O/X 색상 결정
    const getAnnualColor = (val: string) => {
      if (val === 'O' || val === 'o' || val === '○') return '#16a34a';
      if (val === 'X' || val === 'x' || val === '×') return '#dc2626';
      return '#6b7280';
    };

    return (
      <div key={key} style={{ background:'white', borderRadius:'12px', padding:'0.75rem', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom:'0.75rem', padding:'0.75rem', background:nameBg, borderRadius:'8px' }}>
          <button onClick={() => onRevisit(rec.examDate)} style={{ all:'unset', cursor:'pointer', color:'#2563eb', fontWeight:'700', fontSize:'1.1rem', display:'block' }}>
            {rec.schoolName || '（志願しない）'}
          </button>
          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
            {rec.deviation && <span style={{ fontSize:'0.85rem', color:nameColor, background:'rgba(255,255,255,0.7)', padding:'0.25rem 0.75rem', borderRadius:'12px', fontWeight:'600' }}>偏差値 {rec.deviation}</span>}
            {rec.examName && <span style={{ fontSize:'0.85rem', color:'#4b5563', background:'rgba(255,255,255,0.7)', padding:'0.25rem 0.75rem', borderRadius:'12px' }}>{rec.examName}</span>}
            {rec.annual && <span style={{ fontSize:'0.85rem', background:'rgba(255,255,255,0.7)', padding:'0.25rem 0.75rem', borderRadius:'12px' }}>
              <span style={{ color:'#6b7280' }}>延納</span> <span style={{ color:getAnnualColor(rec.annual), fontWeight:'700' }}>{rec.annual}</span>
            </span>}
            {rec.refund && <span style={{ fontSize:'0.85rem', background:'rgba(255,255,255,0.7)', padding:'0.25rem 0.75rem', borderRadius:'12px' }}>
              <span style={{ color:'#6b7280' }}>返還</span> <span style={{ color:getAnnualColor(rec.refund), fontWeight:'700' }}>{rec.refund}</span>
            </span>}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
          {checkCell('applyStartDone', '出願開始', rec.applyStart)}
          {checkCell('applyEndDone', '出願締切', rec.applyEnd)}
          {checkCell('examDateDone', '試験日', rec.examDate)}
          {checkCell('resultDateDone', '合格発表', rec.resultDate)}
        </div>
      </div>
    );
  }
};

// D-day 계산 헬퍼: MM/DD 형식 기준
function formatDday(md: string): string {
  if (!md) return '';
  const parts = md.split('/');
  if (parts.length !== 2) return '';
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  if (isNaN(month) || isNaN(day)) return '';
  const today = new Date();
  const baseYear = today.getFullYear();
  // 규칙: 12월은 baseYear, 1~3월은 baseYear+1 (시험 사이클), 나머지 4~11월은 baseYear
  let year = baseYear;
  if (month >= 1 && month <= 3) {
    year = baseYear + 1;
  } else if (month === 12) {
    year = baseYear;
  } else {
    year = baseYear; // 4~11월
  }
  const target = new Date(year, month - 1, day);
  target.setHours(0,0,0,0); today.setHours(0,0,0,0);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return 'D-day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}
