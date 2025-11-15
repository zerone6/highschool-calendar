import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadGrouped } from '../utils/csv';
import { DateGroupedRecords, SelectedByDate, CompletionStatusMap, SchoolRecord } from '../types';
import { StartScreen } from '../components/StartScreen';
import { DateNavigator, SortBy } from '../components/DateNavigator';
import { SchoolList } from '../components/SchoolList';
import { ConfirmModal } from '../components/ConfirmModal';
import { Summary } from '../components/Summary';
import { loadSelections, saveSelections, loadCompletions, saveCompletions, schoolKey, loadUserDeviation } from '../utils/storage';

enum Phase { START='START', SELECT='SELECT', SUMMARY='SUMMARY' }

export const SchoolSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>(Phase.START);
  const [grouped, setGrouped] = useState<DateGroupedRecords>({});
  const [orderedDates, setOrderedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<SelectedByDate>(() => loadSelections());
  const [completions, setCompletions] = useState<CompletionStatusMap>(() => loadCompletions());
  const [sortBy, setSortBy] = useState<SortBy>('devDesc');
  const [userDeviation, setUserDeviation] = useState<number>(() => loadUserDeviation());

  const [modalRecord, setModalRecord] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadGrouped().then(({ grouped, orderedDates }) => {
      setGrouped(grouped);
      setOrderedDates(orderedDates);
      setLoading(false);
    }).catch(e => {
      setError(String(e));
      setLoading(false);
    });
  }, []);

  const currentDate = orderedDates[currentIndex];
  const currentRecords = currentDate ? grouped[currentDate] : [];
  const NO_APPLY_SENTINEL: SchoolRecord | null = currentDate ? {
    schoolName: '志願しない', area: '', deviation: null, category: '', examName: '', applyStart: '', applyEnd: '', examDate: currentDate, resultDate: '', annual: '', refund: '' } : null;

  const handleSelectRecord = (rec: any) => {
    setModalRecord(rec);
    setModalOpen(true);
  };

  const confirmSelection = () => {
    if (!modalRecord) return;
    const date = modalRecord.examDate;
    const next: SelectedByDate = { ...selections, [date]: modalRecord };
    setSelections(next);
    saveSelections(next);
    setModalOpen(false);
    setModalRecord(null);
    // 자동 다음 날짜 이동
    const idx = orderedDates.indexOf(date);
    if (idx >= 0 && idx < orderedDates.length - 1) {
      setCurrentIndex(idx + 1);
    } else if (idx === orderedDates.length - 1) {
      // 마지막이면 요약 이동 조건: 모두 선택
      if (orderedDates.every(d => next[d])) {
        setPhase(Phase.SUMMARY);
      }
    }
  };

  const cancelSelection = () => {
    setModalOpen(false);
    setModalRecord(null);
  };

  const allSelected = orderedDates.length > 0 && orderedDates.every(d => selections[d]);

  const finishToSummary = () => {
    if (allSelected) setPhase(Phase.SUMMARY);
  };

  const toggleCompletion = (key: string, field: keyof { applyStartDone: boolean; applyEndDone: boolean; examDateDone: boolean; resultDateDone: boolean; }) => {
    const next = { ...completions, [key]: { ...(completions[key] || { applyStartDone:false, applyEndDone:false, examDateDone:false, resultDateDone:false }), [field]: !(completions[key]?.[field]) } };
    setCompletions(next);
    saveCompletions(next);
  };

  const resetAll = () => {
    if (!window.confirm('모든 선택을 초기화하고 처음으로 돌아가겠습니까?')) return;
    setSelections({});
    saveSelections({});
    setCompletions({});
    saveCompletions({});
    setPhase(Phase.START);
    setCurrentIndex(0);
  };

  const finishAllNoApply = () => {
    // 모든 날짜 중 아직 선택되지 않은 날짜를 '���원하지 않음'으로 채움
    const next: SelectedByDate = { ...selections };
    for (const d of orderedDates) {
      if (!next[d]) {
        next[d] = {
          schoolName: '지원하지 않음',
          area: '',
          deviation: null,
          category: '',
          examName: '',
          applyStart: '',
          applyEnd: '',
          examDate: d,
          resultDate: '',
          annual: '',
          refund: '',
        };
      }
    }
    setSelections(next);
    saveSelections(next);
    setPhase(Phase.SUMMARY);
  };

  useEffect(() => {
    // 선택된 학교가 제거되었을 경우 완료 상태 클린업 (선택 취소 여지는 현재 없음)
    const validKeys = new Set(Object.values(selections).map(r => schoolKey(r)));
    const cleaned: CompletionStatusMap = {};
    Object.entries(completions).forEach(([k,v]) => { if (validKeys.has(k)) cleaned[k]=v; });
    if (Object.keys(cleaned).length !== Object.keys(completions).length) {
      setCompletions(cleaned);
      saveCompletions(cleaned);
    }
  }, [selections]);

  const isDataEmpty = !loading && !error && orderedDates.length === 0;

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  // 날짜 변경이나 페이즈 변경 시 스크롤 최상단 복귀
  React.useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      // 윈도우 레벨 스크롤도 초기화 (모바일/브라우저 호환)
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [currentIndex, phase]);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', background:'#f0f2f5' }}>
      {/* 홈으로 돌아가기 버튼 (SELECT 단계에만 표시, SUMMARY는 내부 버튼 사용) */}
      {phase === Phase.SELECT && (
        <div style={{ position:'fixed', top:'1rem', left:'1rem', zIndex:50 }}>
          <button
            onClick={() => navigate('/')}
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
      {phase === Phase.START && <StartScreen onStart={() => {
        setUserDeviation(loadUserDeviation());
        setPhase(Phase.SELECT);
      }} onExit={() => {
        navigate('/');
      }} />}
      {error && phase === Phase.START && <div style={{padding:'1rem',color:'#b71c1c',fontSize:'0.85rem'}}>データ読み込みエラー: {error}</div>}
      {phase === Phase.SELECT && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
          {isDataEmpty && <div style={{ padding:'1rem', color:'#b71c1c', fontSize:'0.85rem' }}>データが空です。Excel前処理(prepare:data)後に再読込してください。</div>}
          <DateNavigator dates={orderedDates} currentIndex={currentIndex} onGo={setCurrentIndex} onFinish={finishToSummary} allSelected={allSelected} sortBy={sortBy} onSortChange={setSortBy} />
          {/* 상단 선택된 학교 + 날짜 고정 바 */}
          <div style={{ position:'sticky', top:0, zIndex:40, background:'#ffffff', borderBottom:'1px solid #e0e0e0', padding:'0.55rem 1rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
            {currentDate && <span style={{ fontWeight:600, color:'#1976d2' }}>{currentDate}</span>}
            {selections[currentDate] ? (
              <>
                <span style={{ fontWeight:600 }}>학교:</span>
                <span>{selections[currentDate].schoolName}</span>
                {selections[currentDate].deviation != null && <span style={{ fontSize:'0.7rem', color:'#666' }}>편차치 {selections[currentDate].deviation}</span>}
              </>
            ) : <span style={{ color:'#666' }}>아직 선택하지 않았습니다.</span>}
          </div>
          {/* 중간 스크롤 영역 (하단 고정바 높이 확보 padding-bottom) */}
          <div style={{ flex:1, overflowY:'auto', padding:'0.25rem 0 70px', background:'#f9fafb' }} ref={scrollRef}>
            {loading && <div style={{ padding:'1rem' }}>読み込み中...</div>}
            {error && <div style={{ padding:'1rem', color:'red' }}>エラー: {error}</div>}
            {!loading && !error && <SchoolList key={currentDate} records={currentRecords} selected={selections[currentDate]} onSelect={handleSelectRecord} sortBy={sortBy} baseDev={userDeviation} />}
          </div>
          {/* 하단 '지원하지 않음' 고정 바 (화면 최하단) */}
          {NO_APPLY_SENTINEL && (
            <div style={{ position:'fixed', left:0, right:0, bottom:0, background:'#ffffff', borderTop:'1px solid #d0d0d0', padding:'0.55rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 -2px 6px rgba(0,0,0,0.05)', gap:'0.75rem', flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.75rem', color:'#444', flex:'1 1 auto' }}>この日は志願しない可能性があります。</span>
              <div style={{ display:'flex', gap:'0.5rem', flex:'0 0 auto' }}>
                <button
                  style={{ padding:'0.45rem 0.95rem', fontSize:'0.75rem', borderRadius:'6px', border:'1px solid #b0b0b0', background:'#fafafa', cursor:'pointer' }}
                  onClick={() => { setModalRecord(NO_APPLY_SENTINEL); setModalOpen(true); }}
                >志願しないを選択</button>
                <button
                  style={{ padding:'0.45rem 0.95rem', fontSize:'0.75rem', borderRadius:'6px', border:'1px solid #1976d2', background:'#1976d2', color:'#fff', cursor:'pointer' }}
                  onClick={finishAllNoApply}
                  title="残り日付を全て '志願しない' にして終了"
                >選択終了</button>
              </div>
            </div>
          )}
          <ConfirmModal open={modalOpen} date={currentDate} record={modalRecord} onConfirm={confirmSelection} onCancel={cancelSelection} />
        </div>
      )}
      {phase === Phase.SUMMARY && <Summary orderedDates={orderedDates} selections={selections} completions={completions} onToggle={toggleCompletion} onReset={resetAll} userDev={userDeviation} onRevisit={(date) => {
        const idx = orderedDates.indexOf(date);
        if (idx >= 0) {
          setCurrentIndex(idx);
          setPhase(Phase.SELECT);
        }
      }} onBackToHome={() => navigate('/')} />}
    </div>
  );
};
