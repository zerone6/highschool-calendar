import React, { useState, useEffect } from 'react';
import type { School } from '../../types/calculator';
import { getSchools, createSchool, addSelectedSchool, excludeSchool } from '../../api/calculator';

interface SchoolSelectionStepProps {
  onNext: () => void;
  selectedSchools: School[];
  onSchoolsChange: (schools: School[]) => void;
}

export const SchoolSelectionStep: React.FC<SchoolSelectionStepProps> = ({
  onNext,
  selectedSchools,
  onSchoolsChange,
}) => {
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [isNewSchool, setIsNewSchool] = useState(true);
  const [selectedExistingSchoolId, setSelectedExistingSchoolId] = useState<number | null>(null);

  // 현재 입력 중인 학교 데이터
  const [schoolName, setSchoolName] = useState('');
  const [patternType, setPatternType] = useState<'simple' | 'ratio'>('simple');
  const [ratioTest, setRatioTest] = useState(7);
  const [ratioNaishin, setRatioNaishin] = useState(3);
  const [passRate80, setPassRate80] = useState('');
  const [passRate60, setPassRate60] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 저장된 학교 목록 불러오기
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const schools = await getSchools();
      setAvailableSchools(schools);
    } catch (err) {
      console.error('Failed to load schools:', err);
      setError('학교 목록을 불러오는데 실패했습니다.');
    }
  };

  // 기존 학교 선택 시 데이터 자동 입력
  const handleExistingSchoolSelect = (schoolId: number) => {
    const school = availableSchools.find((s) => s.id === schoolId);
    if (school) {
      setSelectedExistingSchoolId(schoolId);
      setSchoolName(school.name);
      setPatternType(school.pattern_type);
      setRatioTest(school.ratio_test);
      setRatioNaishin(school.ratio_naishin);
      setPassRate80(school.pass_rate_80?.toString() || '');
      setPassRate60(school.pass_rate_60?.toString() || '');
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setSchoolName('');
    setPatternType('simple');
    setRatioTest(7);
    setRatioNaishin(3);
    setPassRate80('');
    setPassRate60('');
    setSelectedExistingSchoolId(null);
    setIsNewSchool(true);
  };

  // 학교 추가
  const handleAddSchool = async () => {
    setError(null);

    if (!schoolName.trim()) {
      setError('학교 이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      let schoolToAdd: School;

      // 기존 학교를 선택한 경우
      if (!isNewSchool && selectedExistingSchoolId) {
        const existingSchool = availableSchools.find((s) => s.id === selectedExistingSchoolId);
        if (existingSchool) {
          schoolToAdd = existingSchool;
        } else {
          throw new Error('선택한 학교를 찾을 수 없습니다.');
        }
      } else {
        // 새 학교 생성
        const newSchool = await createSchool({
          name: schoolName,
          pattern_type: patternType,
          ratio_test: ratioTest,
          ratio_naishin: ratioNaishin,
          pass_rate_80: passRate80 ? parseFloat(passRate80) : null,
          pass_rate_60: passRate60 ? parseFloat(passRate60) : null,
        });
        schoolToAdd = newSchool;

        // 새로 생성된 학교를 목록에 추가
        setAvailableSchools([...availableSchools, newSchool]);
      }

      // 선택 목록에 추가 (중복 체크)
      if (!selectedSchools.find((s) => s.id === schoolToAdd.id)) {
        await addSelectedSchool(schoolToAdd.id, selectedSchools.length);
        onSchoolsChange([...selectedSchools, schoolToAdd]);
      } else {
        setError('이미 추가된 학교입니다.');
      }

      // 폼 초기화
      resetForm();
    } catch (err: any) {
      console.error('Failed to add school:', err);
      setError(err.message || '학교 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 선택 목록에서 학교 제거 및 제외 목록에 추가
  const handleRemoveSchool = async (schoolId: number) => {
    try {
      // DB에서 선택 목록 제거 및 제외 목록에 추가
      await excludeSchool(schoolId);

      // 로컬 상태 업데이트
      onSchoolsChange(selectedSchools.filter((s) => s.id !== schoolId));

      // 이용 가능한 학교 목록에서도 제거
      setAvailableSchools(availableSchools.filter((s) => s.id !== schoolId));
    } catch (err) {
      console.error('Failed to exclude school:', err);
      setError('학교 제거에 실패했습니다.');
    }
  };

  // 학교 입력 종료 (다음 단계로)
  const handleFinish = () => {
    if (selectedSchools.length === 0) {
      setError('최소 1개 이상의 학교를 추가해주세요.');
      return;
    }
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 선택된 학교 목록 */}
      {selectedSchools.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '16px' }}>
            선택한 학교 ({selectedSchools.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedSchools.map((school, index) => (
              <div
                key={school.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f3f4f6',
                  borderRadius: '8px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                    {index + 1}. {school.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                    {school.pattern_type === 'simple'
                      ? '단순형 (내신 195점 + 시험 500점)'
                      : `비율형 (시험:내신 = ${school.ratio_test}:${school.ratio_naishin})`}
                    {school.pass_rate_80 && ` | 80%: ${school.pass_rate_80}점`}
                    {school.pass_rate_60 && ` | 60%: ${school.pass_rate_60}점`}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSchool(school.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                  }}
                >
                  제거
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 학교 추가 폼 */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
          학교 정보 입력
        </h2>

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 새 학교 / 기존 학교 선택 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              학교 선택 방법
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={isNewSchool}
                  onChange={() => {
                    setIsNewSchool(true);
                    resetForm();
                  }}
                />
                <span style={{ fontSize: '0.875rem' }}>새 학교 등록</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={!isNewSchool}
                  onChange={() => setIsNewSchool(false)}
                />
                <span style={{ fontSize: '0.875rem' }}>기존 학교 선택</span>
              </label>
            </div>
          </div>

          {/* 기존 학교 드롭다운 */}
          {!isNewSchool && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                저장된 학교 목록
              </label>
              <select
                value={selectedExistingSchoolId || ''}
                onChange={(e) => handleExistingSchoolSelect(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">학교를 선택하세요</option>
                {availableSchools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name} ({school.pattern_type === 'simple' ? '단순형' : '비율형'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 학교 이름 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                학교 이름
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="예: 都立日比谷高校"
                disabled={!isNewSchool && !selectedExistingSchoolId}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                합격률 80% 점수
              </label>
              <input
                type="number"
                value={passRate80}
                onChange={(e) => setPassRate80(e.target.value)}
                placeholder="예: 850"
                step="0.1"
                disabled={!isNewSchool && !selectedExistingSchoolId}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                합격률 60% 점수
              </label>
              <input
                type="number"
                value={passRate60}
                onChange={(e) => setPassRate60(e.target.value)}
                placeholder="예: 800"
                step="0.1"
                disabled={!isNewSchool && !selectedExistingSchoolId}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 계산 패턴 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              계산 패턴
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={patternType === 'simple'}
                  onChange={() => setPatternType('simple')}
                  disabled={!isNewSchool && !selectedExistingSchoolId}
                />
                <span style={{ fontSize: '0.875rem' }}>단순형 (내신 195점 + 시험 500점)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={patternType === 'ratio'}
                  onChange={() => setPatternType('ratio')}
                  disabled={!isNewSchool && !selectedExistingSchoolId}
                />
                <span style={{ fontSize: '0.875rem' }}>비율형 (시험:내신 비율)</span>
              </label>
            </div>
          </div>

          {/* 비율 설정 (비율형인 경우만) */}
          {patternType === 'ratio' && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  시험 비율
                </label>
                <input
                  type="number"
                  value={ratioTest}
                  onChange={(e) => setRatioTest(Number(e.target.value))}
                  min={1}
                  max={10}
                  disabled={!isNewSchool && !selectedExistingSchoolId}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <span style={{ marginTop: '20px', fontSize: '1.25rem', fontWeight: 600 }}>:</span>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  내신 비율
                </label>
                <input
                  type="number"
                  value={ratioNaishin}
                  onChange={(e) => setRatioNaishin(Number(e.target.value))}
                  min={1}
                  max={10}
                  disabled={!isNewSchool && !selectedExistingSchoolId}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={handleAddSchool}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
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
                if (!loading) e.currentTarget.style.background = '#2563eb';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#3b82f6';
              }}
            >
              {loading ? '추가 중...' : '추가 입력'}
            </button>
            <button
              onClick={handleFinish}
              disabled={selectedSchools.length === 0}
              style={{
                padding: '10px 20px',
                background: selectedSchools.length === 0 ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: selectedSchools.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedSchools.length > 0) e.currentTarget.style.background = '#059669';
              }}
              onMouseLeave={(e) => {
                if (selectedSchools.length > 0) e.currentTarget.style.background = '#10b981';
              }}
            >
              학교 입력 종료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
