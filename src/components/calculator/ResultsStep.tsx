import React, { useState } from 'react';
import type { School, InternalGrades, ExamScores, SubjectWeights, AdditionalScores } from '../../types/calculator';
import { calculateResults, calculateSchoolResults } from '../../utils/calculatorUtils';

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
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

  // 학교별 결과 계산
  const schoolResults = selectedSchools.map((school) => {
    const results = calculateResults(
      internalGrades,
      examScores,
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

    const passRate80Status =
      school.pass_rate_80 !== null
        ? results.finalScore >= school.pass_rate_80
          ? 'pass'
          : 'fail'
        : 'unknown';

    const passRate60Status =
      school.pass_rate_60 !== null
        ? results.finalScore >= school.pass_rate_60
          ? 'pass'
          : 'fail'
        : 'unknown';

    return {
      ...school,
      results,
      passRate80Status,
      passRate60Status,
    };
  });

  // 선택된 학교의 상세 정보
  const selectedSchoolResult = schoolResults.find((sr) => sr.id === selectedSchoolId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  최종 점수
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  80% 합격
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  60% 합격
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  상세
                </th>
              </tr>
            </thead>
            <tbody>
              {schoolResults.map((schoolResult) => (
                <tr
                  key={schoolResult.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    background: selectedSchoolId === schoolResult.id ? '#f3f4f6' : 'transparent',
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
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                    {schoolResult.results.finalScore.toFixed(1)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {schoolResult.passRate80Status === 'unknown' ? (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>-</span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: schoolResult.passRate80Status === 'pass' ? '#dcfce7' : '#fee2e2',
                          color: schoolResult.passRate80Status === 'pass' ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {schoolResult.passRate80Status === 'pass' ? '합격권' : '미달'}
                      </span>
                    )}
                    {schoolResult.pass_rate_80 && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                        ({schoolResult.pass_rate_80}점)
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {schoolResult.passRate60Status === 'unknown' ? (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>-</span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: schoolResult.passRate60Status === 'pass' ? '#dcfce7' : '#fee2e2',
                          color: schoolResult.passRate60Status === 'pass' ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {schoolResult.passRate60Status === 'pass' ? '합격권' : '미달'}
                      </span>
                    )}
                    {schoolResult.pass_rate_60 && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                        ({schoolResult.pass_rate_60}점)
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() =>
                        setSelectedSchoolId(selectedSchoolId === schoolResult.id ? null : schoolResult.id)
                      }
                      style={{
                        padding: '6px 12px',
                        background: selectedSchoolId === schoolResult.id ? '#6b7280' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          selectedSchoolId === schoolResult.id ? '#4b5563' : '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          selectedSchoolId === schoolResult.id ? '#6b7280' : '#3b82f6';
                      }}
                    >
                      {selectedSchoolId === schoolResult.id ? '닫기' : '상세보기'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 결과 (선택한 학교) */}
      {selectedSchoolResult && (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'white',
              marginTop: 0,
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            {selectedSchoolResult.name}
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: '24px' }}>
            {selectedSchoolResult.pattern_type === 'simple'
              ? '단순형 (최대 695점)'
              : `비율형 ${selectedSchoolResult.ratio_test}:${selectedSchoolResult.ratio_naishin} (최대 1000점)`}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
              {selectedSchoolResult.results.finalScore.toFixed(1)}
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
                  {selectedSchoolResult.results.naishinFinal.toFixed(1)} 점
                </span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>시험</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                  {selectedSchoolResult.results.testFinal.toFixed(1)} 점
                </span>
              </div>
              {selectedSchoolResult.results.extraTotal > 0 && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>추가</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                      {selectedSchoolResult.results.extraTotal} 점
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
                    width: `${(selectedSchoolResult.results.naishinFinal / selectedSchoolResult.results.finalScore) * 100}%`,
                    background: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#78350f',
                  }}
                >
                  {((selectedSchoolResult.results.naishinFinal / selectedSchoolResult.results.finalScore) * 100).toFixed(0)}%
                </div>
                <div
                  style={{
                    width: `${(selectedSchoolResult.results.testFinal / selectedSchoolResult.results.finalScore) * 100}%`,
                    background: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#1e3a8a',
                  }}
                >
                  {((selectedSchoolResult.results.testFinal / selectedSchoolResult.results.finalScore) * 100).toFixed(0)}%
                </div>
                {selectedSchoolResult.results.extraTotal > 0 && (
                  <div
                    style={{
                      width: `${(selectedSchoolResult.results.extraTotal / selectedSchoolResult.results.finalScore) * 100}%`,
                      background: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#064e3b',
                    }}
                  >
                    {((selectedSchoolResult.results.extraTotal / selectedSchoolResult.results.finalScore) * 100).toFixed(0)}%
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
                {selectedSchoolResult.results.extraTotal > 0 && (
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
                  <span>{selectedSchoolResult.results.naishinRawNoWeight} / 45</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>환산 내신 (실기 4과목 2배)</span>
                  <span>
                    {selectedSchoolResult.results.naishinRaw} / {selectedSchoolResult.results.naishinMaxRaw}
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
                  <span>{selectedSchoolResult.results.testRawTotal} / 500</span>
                </div>
                {useWeights && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>가중치 적용 후</span>
                    <span>{selectedSchoolResult.results.testWeightedTotal.toFixed(1)}</span>
                  </div>
                )}
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
