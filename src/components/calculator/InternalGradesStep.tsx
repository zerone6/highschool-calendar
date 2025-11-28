import React, { useState, useEffect } from 'react';
import type { InternalGrades } from '../../types/calculator';
import { saveCalculatorData } from '../../api/calculator';

interface InternalGradesStepProps {
  onNext: () => void;
  onBack: () => void;
  internalGrades: InternalGrades;
  onGradesChange: (grades: InternalGrades) => void;
}

export const InternalGradesStep: React.FC<InternalGradesStepProps> = ({
  onNext,
  onBack,
  internalGrades,
  onGradesChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 내신 계산
  const calculateNaishin = () => {
    // 가중치 없는 원점수 (45점 만점)
    const rawNoWeight =
      internalGrades.japanese +
      internalGrades.math +
      internalGrades.english +
      internalGrades.social +
      internalGrades.science +
      internalGrades.tech_home +
      internalGrades.pe +
      internalGrades.music +
      internalGrades.art;

    // 가중치 적용 (실기 4과목 2배, 65점 만점)
    const rawWithWeight =
      internalGrades.japanese +
      internalGrades.math +
      internalGrades.english +
      internalGrades.social +
      internalGrades.science +
      internalGrades.tech_home * 2 +
      internalGrades.pe * 2 +
      internalGrades.music * 2 +
      internalGrades.art * 2;

    return { rawNoWeight, rawWithWeight };
  };

  const { rawNoWeight, rawWithWeight } = calculateNaishin();

  // 과목 변경 핸들러
  const handleGradeChange = (subject: keyof InternalGrades, value: number) => {
    onGradesChange({
      ...internalGrades,
      [subject]: value,
    });
  };

  // 입력 완료 및 저장
  const handleComplete = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await saveCalculatorData({
        grade_japanese: internalGrades.japanese,
        grade_math: internalGrades.math,
        grade_english: internalGrades.english,
        grade_social: internalGrades.social,
        grade_science: internalGrades.science,
        grade_tech_home: internalGrades.tech_home,
        grade_pe: internalGrades.pe,
        grade_music: internalGrades.music,
        grade_art: internalGrades.art,
      });

      setSuccessMessage('내신 성적이 저장되었습니다.');
      setTimeout(() => {
        onNext();
      }, 500);
    } catch (err: any) {
      console.error('Failed to save internal grades:', err);
      setError('내신 성적 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    { key: 'japanese' as keyof InternalGrades, label: '국어', isPractical: false },
    { key: 'math' as keyof InternalGrades, label: '수학', isPractical: false },
    { key: 'english' as keyof InternalGrades, label: '영어', isPractical: false },
    { key: 'social' as keyof InternalGrades, label: '사회', isPractical: false },
    { key: 'science' as keyof InternalGrades, label: '과학', isPractical: false },
    { key: 'tech_home' as keyof InternalGrades, label: '기술·가정', isPractical: true },
    { key: 'pe' as keyof InternalGrades, label: '체육', isPractical: true },
    { key: 'music' as keyof InternalGrades, label: '음악', isPractical: true },
    { key: 'art' as keyof InternalGrades, label: '미술', isPractical: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 내신 성적 입력 */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '8px' }}>
          내신 성적 입력
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 0, marginBottom: '20px' }}>
          중학교 3학년 내신 성적을 5단계 평가로 입력해주세요.
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
                  성적 (1-5)
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  가중치
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(({ key, label, isPractical }) => (
                <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', fontSize: '0.875rem', color: '#374151' }}>
                    {label}
                    {isPractical && (
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: '#6b7280' }}>(실기)</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <select
                      value={internalGrades[key]}
                      onChange={(e) => handleGradeChange(key, Number(e.target.value))}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                    {isPractical ? '×2' : '×1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 내신 계산 결과 */}
        <div style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>내신 원점수 (가중치 없음)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
            {rawNoWeight} / 45
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px', marginBottom: '4px' }}>
            환산 내신 (실기 4과목 2배)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
            {rawWithWeight} / 65
          </div>
        </div>

        {/* 버튼들 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
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
    </div>
  );
};
