import React, { useState } from 'react';
import type { School, InternalGrades, ExamScores, SubjectWeights, AdditionalScores } from '../../types/calculator';
import { calculateResults } from '../../utils/calculatorUtils';

interface ResultsStepProps {
  onBack: () => void;
  selectedSchools: School[];
  internalGrades: InternalGrades;
  examScores: ExamScores;
  useWeights: boolean;
  weights: SubjectWeights;
  additionalScores: AdditionalScores;
  useInterview: boolean;
  useEssay: boolean;
  usePractical: boolean;
  useBonus: boolean;
  useSpeaking: boolean;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
  onBack,
  selectedSchools,
  internalGrades,
  examScores,
  useWeights,
  weights,
  additionalScores,
  useInterview,
  useEssay,
  usePractical,
  useBonus,
  useSpeaking,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSchoolId, setModalSchoolId] = useState<number | null>(null);

  // 학력고사 원점수 조정을 위한 state (초기값은 입력된 시험 점수 합계)
  const initialTestRawTotal =
    examScores.japanese + examScores.math + examScores.english + examScores.social + examScores.science;
  const [adjustedTestRawTotal, setAdjustedTestRawTotal] = useState(initialTestRawTotal);

  // 조정된 원점수로 examScores 재계산
  const adjustedExamScores: ExamScores = {
    japanese: Math.round((examScores.japanese / initialTestRawTotal) * adjustedTestRawTotal),
    math: Math.round((examScores.math / initialTestRawTotal) * adjustedTestRawTotal),
    english: Math.round((examScores.english / initialTestRawTotal) * adjustedTestRawTotal),
    social: Math.round((examScores.social / initialTestRawTotal) * adjustedTestRawTotal),
    science: adjustedTestRawTotal -
      Math.round((examScores.japanese / initialTestRawTotal) * adjustedTestRawTotal) -
      Math.round((examScores.math / initialTestRawTotal) * adjustedTestRawTotal) -
      Math.round((examScores.english / initialTestRawTotal) * adjustedTestRawTotal) -
      Math.round((examScores.social / initialTestRawTotal) * adjustedTestRawTotal),
  };

  // 합격 상태 판정 함수
  const getPassStatus = (finalScore: number, targetScore: number | null) => {
    if (targetScore === null) return 'unknown';
    const diff = finalScore - targetScore;
    if (diff >= 30) return 'safe';     // 안정권
    if (diff >= 0) return 'possible';  // 가능권
    if (diff >= -30) return 'risky';   // 위험권
    return 'difficult';                 // 어려움
  };

  // 학교별 결과 계산 (조정된 점수 사용)
  const schoolResults = selectedSchools.map((school) => {
    const results = calculateResults(
      internalGrades,
      adjustedExamScores,
      weights,
      additionalScores,
      useWeights,
      useInterview,
      useEssay,
      usePractical,
      useBonus,
      useSpeaking,
      school.pattern_type,
      school.ratio_test,
      school.ratio_naishin
    );

    const passRate80Status = getPassStatus(results.finalScore, school.pass_rate_80);
    const passRate60Status = getPassStatus(results.finalScore, school.pass_rate_60);

    return {
      ...school,
      results,
      passRate80Status,
      passRate60Status,
    };
  });

  // 대표 결과 (첫 번째 학교 기준으로 개요 표시)
  const overviewResult = schoolResults.length > 0 ? schoolResults[0].results : null;

  // 모달에 표시할 학교 결과
  const modalSchoolResult = schoolResults.find((sr) => sr.id === modalSchoolId);

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'safe':
        return { background: '#10b981', color: 'white', text: '안정권' };
      case 'possible':
        return { background: '#3b82f6', color: 'white', text: '가능권' };
      case 'risky':
        return { background: '#f59e0b', color: 'white', text: '위험권' };
      case 'difficult':
        return { background: '#ef4444', color: 'white', text: '어려움' };
      default:
        return { background: '#9ca3af', color: 'white', text: '-' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 개요 섹션 */}
      {overviewResult && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '10px' }}>
            개요
          </h2>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            {/* 최종 점수 - 클릭 가능 */}
            <div
              onClick={() => {
                if (schoolResults.length > 0) {
                  setModalSchoolId(schoolResults[0].id);
                  setIsModalOpen(true);
                }
              }}
              style={{
                flex: 1,
                background: '#f3f4f6',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>최종 점수 (클릭하여 상세보기)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                {overviewResult.finalScore.toFixed(1)}
              </div>
            </div>

            {/* 학력고사 원점수 */}
            <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>학력고사 원점수</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                {adjustedTestRawTotal} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#6b7280' }}>/ 500</span>
              </div>
            </div>
          </div>

          {/* 원점수 슬라이드바 */}
          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                학력고사 원점수 조정
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6' }}>
                {adjustedTestRawTotal}점
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={adjustedTestRawTotal}
              onChange={(e) => setAdjustedTestRawTotal(Number(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(adjustedTestRawTotal / 500) * 100}%, #e5e7eb ${(adjustedTestRawTotal / 500) * 100}%, #e5e7eb 100%)`,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.625rem', color: '#6b7280' }}>
              <span>0</span>
              <span>500</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.625rem', color: '#6b7280', textAlign: 'center' }}>
              슬라이드바를 움직여 학력고사 점수를 조정하면 아래 합격권이 실시간으로 변경됩니다
            </div>
          </div>
        </div>
      )}

      {/* 학교별 비교 테이블 */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
          학교별 점수 비교
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  학교명
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  계산 패턴
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  80% 합격
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  60% 합격
                </th>
              </tr>
            </thead>
            <tbody>
              {schoolResults.map((schoolResult) => (
                <tr
                  key={schoolResult.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ padding: '12px', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                    {schoolResult.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                    {schoolResult.pattern_type === 'simple'
                      ? '단순형'
                      : `비율형 (${schoolResult.ratio_test}:${schoolResult.ratio_naishin})`}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {(() => {
                      const style = getStatusStyle(schoolResult.passRate80Status);
                      return (
                        <div>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: style.background,
                              color: style.color,
                            }}
                          >
                            {style.text}
                          </span>
                          {schoolResult.pass_rate_80 && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                              ({schoolResult.pass_rate_80}점)
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {(() => {
                      const style = getStatusStyle(schoolResult.passRate60Status);
                      return (
                        <div>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: style.background,
                              color: style.color,
                            }}
                          >
                            {style.text}
                          </span>
                          {schoolResult.pass_rate_60 && (
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                              ({schoolResult.pass_rate_60}점)
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && modalSchoolResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'white',
                  margin: 0,
                }}
              >
                {modalSchoolResult.name}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                닫기
              </button>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: '24px' }}>
              {modalSchoolResult.pattern_type === 'simple'
                ? '단순형 (최대 695점)'
                : `비율형 ${modalSchoolResult.ratio_test}:${modalSchoolResult.ratio_naishin} (최대 1000점)`}
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {modalSchoolResult.results.finalScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '8px' }}>최종 점수</div>
            </div>

            {/* 점수 구성 */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '16px' }}>점수 구성</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>내신</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                    {modalSchoolResult.results.naishinFinal.toFixed(1)} 점
                  </span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>시험</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                    {modalSchoolResult.results.testFinal.toFixed(1)} 점
                  </span>
                </div>
                {modalSchoolResult.results.extraTotal > 0 && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>추가</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                        {modalSchoolResult.results.extraTotal} 점
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 시각화 바 */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>점수 비율</div>
                <div
                  style={{
                    display: 'flex',
                    height: '20px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div
                    style={{
                      width: `${(modalSchoolResult.results.naishinFinal / modalSchoolResult.results.finalScore) * 100}%`,
                      background: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#78350f',
                    }}
                  >
                    {((modalSchoolResult.results.naishinFinal / modalSchoolResult.results.finalScore) * 100).toFixed(0)}%
                  </div>
                  <div
                    style={{
                      width: `${(modalSchoolResult.results.testFinal / modalSchoolResult.results.finalScore) * 100}%`,
                      background: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#1e3a8a',
                    }}
                  >
                    {((modalSchoolResult.results.testFinal / modalSchoolResult.results.finalScore) * 100).toFixed(0)}%
                  </div>
                  {modalSchoolResult.results.extraTotal > 0 && (
                    <div
                      style={{
                        width: `${(modalSchoolResult.results.extraTotal / modalSchoolResult.results.finalScore) * 100}%`,
                        background: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#064e3b',
                      }}
                    >
                      {((modalSchoolResult.results.extraTotal / modalSchoolResult.results.finalScore) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '12px',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fbbf24' }}></div>
                    내신
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#60a5fa' }}></div>
                    시험
                  </div>
                  {modalSchoolResult.results.extraTotal > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#34d399' }}></div>
                      추가
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 상세 내역 */}
            <div style={{ marginTop: '24px' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>
                  내신 상세
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>원점수 (가중치 없음)</span>
                    <span>{modalSchoolResult.results.naishinRawNoWeight} / 45</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>환산 내신 (실기 4과목 2배)</span>
                    <span>
                      {modalSchoolResult.results.naishinRaw} / {modalSchoolResult.results.naishinMaxRaw}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  backdropFilter: 'blur(10px)',
                  marginTop: '12px',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>
                  시험 상세
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>원점수</span>
                    <span>{modalSchoolResult.results.testRawTotal} / 500</span>
                  </div>
                  {useWeights && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>가중치 적용 후</span>
                      <span>{modalSchoolResult.results.testWeightedTotal.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4b5563';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#6b7280';
          }}
        >
          이전 단계
        </button>
      </div>
    </div>
  );
};
