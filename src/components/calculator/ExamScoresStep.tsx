import React, { useState } from 'react';
import type { ExamScores, SubjectWeights, AdditionalScores } from '../../types/calculator';
import { saveCalculatorData } from '../../api/calculator';
import { getSpeakingScore } from '../../utils/calculatorUtils';

interface ExamScoresStepProps {
  onNext: () => void;
  onBack: () => void;
  examScores: ExamScores;
  onExamScoresChange: (scores: ExamScores) => void;
  useWeights: boolean;
  onUseWeightsChange: (use: boolean) => void;
  weights: SubjectWeights;
  onWeightsChange: (weights: SubjectWeights) => void;
  additionalScores: AdditionalScores;
  onAdditionalScoresChange: (scores: AdditionalScores) => void;
  useInterview: boolean;
  onUseInterviewChange: (use: boolean) => void;
  useEssay: boolean;
  onUseEssayChange: (use: boolean) => void;
  usePractical: boolean;
  onUsePracticalChange: (use: boolean) => void;
  useBonus: boolean;
  onUseBonusChange: (use: boolean) => void;
  useSpeaking: boolean;
  onUseSpeakingChange: (use: boolean) => void;
  speakingGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  onSpeakingGradeChange: (grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => void;
}

export const ExamScoresStep: React.FC<ExamScoresStepProps> = ({
  onNext,
  onBack,
  examScores,
  onExamScoresChange,
  useWeights,
  onUseWeightsChange,
  weights,
  onWeightsChange,
  additionalScores,
  onAdditionalScoresChange,
  useInterview,
  onUseInterviewChange,
  useEssay,
  onUseEssayChange,
  usePractical,
  onUsePracticalChange,
  useBonus,
  onUseBonusChange,
  useSpeaking,
  onUseSpeakingChange,
  speakingGrade,
  onSpeakingGradeChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const interviewMax = 100;
  const essayMax = 100;
  const practicalMax = 100;
  const bonusMax = 5;

  // 시험 점수 계산
  const testRawTotal = Object.values(examScores).reduce((sum, score) => sum + score, 0);
  const testWeightedTotal = useWeights
    ? examScores.japanese * weights.japanese +
      examScores.math * weights.math +
      examScores.english * weights.english +
      examScores.social * weights.social +
      examScores.science * weights.science
    : testRawTotal;

  const extraTotal =
    (useInterview ? additionalScores.interview : 0) +
    (useEssay ? additionalScores.essay : 0) +
    (usePractical ? additionalScores.practical : 0) +
    (useBonus ? additionalScores.bonus : 0) +
    (useSpeaking ? additionalScores.speaking : 0);

  // 과목 점수 변경
  const handleExamScoreChange = (subject: keyof ExamScores, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    onExamScoresChange({
      ...examScores,
      [subject]: clampedValue,
    });
  };

  // 가중치 변경
  const handleWeightChange = (subject: keyof SubjectWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [subject]: value,
    });
  };

  // 스피킹 등급 변경
  const handleSpeakingGradeChange = (grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => {
    onSpeakingGradeChange(grade);
    onAdditionalScoresChange({
      ...additionalScores,
      speaking: getSpeakingScore(grade),
    });
  };

  // 입력 완료 및 저장
  const handleComplete = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await saveCalculatorData({
        exam_japanese: examScores.japanese,
        exam_math: examScores.math,
        exam_english: examScores.english,
        exam_social: examScores.social,
        exam_science: examScores.science,
        use_weights: useWeights,
        weight_japanese: weights.japanese,
        weight_math: weights.math,
        weight_english: weights.english,
        weight_social: weights.social,
        weight_science: weights.science,
        use_interview: useInterview,
        use_essay: useEssay,
        use_practical: usePractical,
        use_bonus: useBonus,
        use_speaking: useSpeaking,
        additional_interview: additionalScores.interview,
        additional_essay: additionalScores.essay,
        additional_practical: additionalScores.practical,
        additional_bonus: additionalScores.bonus,
        additional_speaking: additionalScores.speaking,
        speaking_grade: speakingGrade,
      });

      setSuccessMessage('시험 점수가 저장되었습니다.');
      setTimeout(() => {
        onNext();
      }, 500);
    } catch (err: any) {
      console.error('Failed to save exam scores:', err);
      setError('시험 점수 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const examSubjects = [
    { key: 'japanese' as keyof ExamScores, label: '국어' },
    { key: 'math' as keyof ExamScores, label: '수학' },
    { key: 'english' as keyof ExamScores, label: '영어' },
    { key: 'social' as keyof ExamScores, label: '사회' },
    { key: 'science' as keyof ExamScores, label: '과학' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 학력검사 점수 입력 */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '8px' }}>
          학력검사 점수 입력
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 0, marginBottom: '20px' }}>
          본시험 점수를 0-100점 범위로 입력해주세요.
        </p>

        {error && (
          <div
            style={{
              padding: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#16a34a' }}>{successMessage}</p>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  과목
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  점수 (0-100)
                </th>
              </tr>
            </thead>
            <tbody>
              {examSubjects.map(({ key, label }) => (
                <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontSize: '0.875rem', color: '#374151' }}>{label}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={examScores[key]}
                      onChange={(e) => handleExamScoreChange(key, Number(e.target.value))}
                      min={0}
                      max={100}
                      style={{
                        width: '100px',
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 가중치 옵션 */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
            <input type="checkbox" checked={useWeights} onChange={(e) => onUseWeightsChange(e.target.checked)} />
            과목별 가중치 사용
          </label>
        </div>

        {useWeights && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
              과목별 가중치 (기본: 1.0)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {examSubjects.map(({ key, label }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                    {label}
                  </label>
                  <input
                    type="number"
                    value={weights[key]}
                    onChange={(e) => handleWeightChange(key, Number(e.target.value))}
                    step={0.1}
                    min={0}
                    max={3}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 시험 점수 합계 */}
        <div style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>시험 원점수</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>{testRawTotal} / 500</div>
          {useWeights && (
            <>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px', marginBottom: '4px' }}>
                가중치 적용 후
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>{testWeightedTotal.toFixed(1)}</div>
            </>
          )}
        </div>
      </div>

      {/* 추가 점수 */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
          추가 점수 (선택)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 면접 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={useInterview} onChange={(e) => onUseInterviewChange(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>면접 점수</span>
            </label>
            {useInterview && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                <input
                  type="number"
                  value={additionalScores.interview}
                  onChange={(e) =>
                    onAdditionalScoresChange({ ...additionalScores, interview: Number(e.target.value) })
                  }
                  min={0}
                  max={interviewMax}
                  style={{
                    width: '100px',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ {interviewMax}</span>
              </div>
            )}
          </div>

          {/* 소논문 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={useEssay} onChange={(e) => onUseEssayChange(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>소논문 점수</span>
            </label>
            {useEssay && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                <input
                  type="number"
                  value={additionalScores.essay}
                  onChange={(e) => onAdditionalScoresChange({ ...additionalScores, essay: Number(e.target.value) })}
                  min={0}
                  max={essayMax}
                  style={{
                    width: '100px',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ {essayMax}</span>
              </div>
            )}
          </div>

          {/* 실기 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={usePractical} onChange={(e) => onUsePracticalChange(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>실기 점수</span>
            </label>
            {usePractical && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                <input
                  type="number"
                  value={additionalScores.practical}
                  onChange={(e) =>
                    onAdditionalScoresChange({ ...additionalScores, practical: Number(e.target.value) })
                  }
                  min={0}
                  max={practicalMax}
                  style={{
                    width: '100px',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ {practicalMax}</span>
              </div>
            )}
          </div>

          {/* 가산점 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={useBonus} onChange={(e) => onUseBonusChange(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>가산점</span>
            </label>
            {useBonus && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                <input
                  type="number"
                  value={additionalScores.bonus}
                  onChange={(e) => onAdditionalScoresChange({ ...additionalScores, bonus: Number(e.target.value) })}
                  min={0}
                  max={bonusMax}
                  style={{
                    width: '100px',
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/ {bonusMax}</span>
              </div>
            )}
          </div>

          {/* 영어 스피킹 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" checked={useSpeaking} onChange={(e) => onUseSpeakingChange(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>영어 스피킹 테스트</span>
            </label>
            {useSpeaking && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                <select
                  value={speakingGrade}
                  onChange={(e) => handleSpeakingGradeChange(e.target.value as 'A' | 'B' | 'C' | 'D' | 'E' | 'F')}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="A">A (20점)</option>
                  <option value="B">B (16점)</option>
                  <option value="C">C (12점)</option>
                  <option value="D">D (8점)</option>
                  <option value="E">E (4점)</option>
                  <option value="F">F (0점)</option>
                </select>
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>
                  {getSpeakingScore(speakingGrade)}점
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 추가 점수 합계 */}
        {extraTotal > 0 && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>추가 점수 합계</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>{extraTotal} 점</div>
          </div>
        )}
      </div>

      {/* 버튼들 */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
        <button
          onClick={handleComplete}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#059669';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#10b981';
          }}
        >
          {loading ? '저장 중...' : '입력 완료'}
        </button>
      </div>
    </div>
  );
};
