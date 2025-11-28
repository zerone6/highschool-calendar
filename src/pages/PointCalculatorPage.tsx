import React, { useState, useEffect } from 'react';

interface UserInfo {
  email: string;
  name: string;
  picture_url: string;
  role: string;
}

// 내신 성적 (9교과)
interface InternalGrades {
  japanese: number;
  math: number;
  english: number;
  social: number;
  science: number;
  tech_home: number;
  pe: number;
  music: number;
  art: number;
}

// 학력검사 점수 (5교과)
interface ExamScores {
  japanese: number;
  math: number;
  english: number;
  social: number;
  science: number;
}

// 과목별 가중치
interface SubjectWeights {
  japanese: number;
  math: number;
  english: number;
  social: number;
  science: number;
}

// 추가 점수
interface AdditionalScores {
  interview: number;
  essay: number;
  practical: number;
  bonus: number;
}

export const PointCalculatorPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 학교/패턴 설정
  const [schoolName, setSchoolName] = useState('');
  const [patternType, setPatternType] = useState<'simple' | 'ratio'>('simple');
  const [ratioTest, setRatioTest] = useState(7);
  const [ratioNaishin, setRatioNaishin] = useState(3);
  const [naishinMultiplier] = useState(3);

  // 내신 성적
  const [internalGrades, setInternalGrades] = useState<InternalGrades>({
    japanese: 3,
    math: 3,
    english: 3,
    social: 3,
    science: 3,
    tech_home: 3,
    pe: 3,
    music: 3,
    art: 3,
  });

  // 학력검사 점수
  const [examScores, setExamScores] = useState<ExamScores>({
    japanese: 0,
    math: 0,
    english: 0,
    social: 0,
    science: 0,
  });

  // 가중치
  const [useWeights, setUseWeights] = useState(false);
  const [weights, setWeights] = useState<SubjectWeights>({
    japanese: 1.0,
    math: 1.0,
    english: 1.0,
    social: 1.0,
    science: 1.0,
  });

  // 추가 점수
  const [useInterview, setUseInterview] = useState(false);
  const [useEssay, setUseEssay] = useState(false);
  const [usePractical, setUsePractical] = useState(false);
  const [useBonus, setUseBonus] = useState(false);
  const [additionalScores, setAdditionalScores] = useState<AdditionalScores>({
    interview: 0,
    essay: 0,
    practical: 0,
    bonus: 0,
  });
  const [interviewMax] = useState(100);
  const [essayMax] = useState(100);
  const [practicalMax] = useState(100);
  const [bonusMax] = useState(5);

  // 사용자 인증
  useEffect(() => {
    fetch('/auth/status', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      });
  }, []);

  // 드롭다운 외부 클릭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.profile-menu')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // 계산 로직
  const calculateResults = () => {
    // 1. 내신 원점수
    const naishinRaw = Object.values(internalGrades).reduce((sum, grade) => sum + grade, 0);

    // 2. 내신 환산점
    const naishinScaled = naishinRaw * naishinMultiplier;

    // 3. 학력검사 원점수
    const testRawTotal = Object.values(examScores).reduce((sum, score) => sum + score, 0);

    // 4. 학력검사 가중치 적용
    const testWeightedTotal = useWeights
      ? examScores.japanese * weights.japanese +
        examScores.math * weights.math +
        examScores.english * weights.english +
        examScores.social * weights.social +
        examScores.science * weights.science
      : testRawTotal;

    // 5. 추가 점수
    const extraTotal =
      (useInterview ? additionalScores.interview : 0) +
      (useEssay ? additionalScores.essay : 0) +
      (usePractical ? additionalScores.practical : 0) +
      (useBonus ? additionalScores.bonus : 0);

    // 6. 최종 점수 계산
    let finalScore = 0;
    let naishinFinal = 0;
    let testFinal = 0;

    if (patternType === 'simple') {
      // 패턴 A: 단순형 (135 + 500)
      naishinFinal = naishinScaled;
      testFinal = testWeightedTotal;
      finalScore = naishinFinal + testFinal + extraTotal;
    } else {
      // 패턴 B: 비율형 (7:3, 6:4, 5:5 등)
      const totalRatio = ratioTest + ratioNaishin;
      const finalMax = 1000; // 최종 만점을 1000으로 가정
      const naishinMaxComponent = finalMax * (ratioNaishin / totalRatio);
      const testMaxComponent = finalMax * (ratioTest / totalRatio);

      naishinFinal = (naishinRaw / 45) * naishinMaxComponent;

      const testWeightedMax = useWeights
        ? 100 * (weights.japanese + weights.math + weights.english + weights.social + weights.science)
        : 500;

      testFinal = (testWeightedTotal / testWeightedMax) * testMaxComponent;
      finalScore = naishinFinal + testFinal + extraTotal;
    }

    return {
      naishinRaw,
      naishinScaled,
      testRawTotal,
      testWeightedTotal,
      extraTotal,
      naishinFinal,
      testFinal,
      finalScore,
    };
  };

  const results = calculateResults();

  const handleLogout = async () => {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/';
  };

  // 내신 성적 변경 핸들러
  const handleGradeChange = (subject: keyof InternalGrades, value: number) => {
    setInternalGrades((prev) => ({ ...prev, [subject]: value }));
  };

  // 시험 점수 변경 핸들러
  const handleExamScoreChange = (subject: keyof ExamScores, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setExamScores((prev) => ({ ...prev, [subject]: clampedValue }));
  };

  // 가중치 변경 핸들러
  const handleWeightChange = (subject: keyof SubjectWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [subject]: value }));
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #6366f1, #a855f7, #9333ea)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '16px 0',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="/"
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Home
            </a>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
              도립 점수 계산
            </h1>
          </div>

          {user && (
            <div className="profile-menu" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    transition: 'border-color 0.2s',
                    fontWeight: 600,
                    fontSize: '1rem',
                    overflow: 'hidden',
                  }}
                >
                  {user.picture_url ? (
                    <img
                      src={user.picture_url}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    minWidth: '280px',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {user.picture_url ? (
                        <img
                          src={user.picture_url}
                          alt="Profile"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: '#6b7280',
                          }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user.email}
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: user.role === 'admin' ? '#fef3c7' : '#e5e7eb',
                          color: user.role === 'admin' ? '#92400e' : '#6b7280',
                        }}
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#e5e7eb' }}></div>
                  {user.role === 'admin' && (
                    <>
                      <button
                        onClick={() => (window.location.href = '/main-page/admin.html')}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          fontSize: '0.875rem',
                          color: '#374151',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '1.125rem', width: '20px' }}>⚙️</span>
                        Admin Dashboard
                      </button>
                      <div style={{ height: '1px', background: '#e5e7eb' }}></div>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      fontSize: '0.875rem',
                      color: '#374151',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '1.125rem', width: '20px' }}>🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 20px' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 학교/패턴 설정 영역 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
              학교 및 계산 방식 설정
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  학교 이름 (선택)
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="예: 都立日比谷高校"
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
                  계산 패턴
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={patternType === 'simple'}
                      onChange={() => setPatternType('simple')}
                    />
                    <span style={{ fontSize: '0.875rem' }}>단순형 (내신 135점 + 시험 500점)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={patternType === 'ratio'}
                      onChange={() => setPatternType('ratio')}
                    />
                    <span style={{ fontSize: '0.875rem' }}>비율형 (시험:내신 비율)</span>
                  </label>
                </div>
              </div>

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
            </div>
          </div>

          {/* 내신 입력 영역 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
              내신 성적 (중3, 5단계 평가)
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>과목</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>성적 (1-5)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries({
                    japanese: '국어',
                    math: '수학',
                    english: '영어',
                    social: '사회',
                    science: '과학',
                    tech_home: '기술·가정',
                    pe: '체육',
                    music: '음악',
                    art: '미술',
                  }).map(([key, label]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: '#374151' }}>{label}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <select
                          value={internalGrades[key as keyof InternalGrades]}
                          onChange={(e) => handleGradeChange(key as keyof InternalGrades, Number(e.target.value))}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>내신 원점수</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
                {results.naishinRaw} / 45
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px', marginBottom: '4px' }}>내신 환산점 (×{naishinMultiplier})</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                {results.naishinScaled} / {45 * naishinMultiplier}
              </div>
            </div>
          </div>

          {/* 학력검사 입력 영역 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
              학력검사 점수 (본시험, 0-100점)
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>과목</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>점수</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries({
                    japanese: '국어',
                    math: '수학',
                    english: '영어',
                    social: '사회',
                    science: '과학',
                  }).map(([key, label]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: '#374151' }}>{label}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={examScores[key as keyof ExamScores]}
                          onChange={(e) => handleExamScoreChange(key as keyof ExamScores, Number(e.target.value))}
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

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={useWeights}
                  onChange={(e) => setUseWeights(e.target.checked)}
                />
                과목별 가중치 사용
              </label>
            </div>

            {useWeights && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>과목별 가중치 (기본: 1.0)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {Object.entries({
                    japanese: '국어',
                    math: '수학',
                    english: '영어',
                    social: '사회',
                    science: '과학',
                  }).map(([key, label]) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>{label}</label>
                      <input
                        type="number"
                        value={weights[key as keyof SubjectWeights]}
                        onChange={(e) => handleWeightChange(key as keyof SubjectWeights, Number(e.target.value))}
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

            <div style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>시험 원점수</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>
                {results.testRawTotal} / 500
              </div>
              {useWeights && (
                <>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px', marginBottom: '4px' }}>가중치 적용 후</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                    {results.testWeightedTotal.toFixed(1)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 추가 점수 영역 */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '20px' }}>
              추가 점수 (선택)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={useInterview}
                    onChange={(e) => setUseInterview(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>면접 점수</span>
                </label>
                {useInterview && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                    <input
                      type="number"
                      value={additionalScores.interview}
                      onChange={(e) => setAdditionalScores({ ...additionalScores, interview: Number(e.target.value) })}
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

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={useEssay}
                    onChange={(e) => setUseEssay(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>소논문 점수</span>
                </label>
                {useEssay && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                    <input
                      type="number"
                      value={additionalScores.essay}
                      onChange={(e) => setAdditionalScores({ ...additionalScores, essay: Number(e.target.value) })}
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

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={usePractical}
                    onChange={(e) => setUsePractical(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>실기 점수</span>
                </label>
                {usePractical && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                    <input
                      type="number"
                      value={additionalScores.practical}
                      onChange={(e) => setAdditionalScores({ ...additionalScores, practical: Number(e.target.value) })}
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

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={useBonus}
                    onChange={(e) => setUseBonus(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>가산점</span>
                </label>
                {useBonus && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '28px' }}>
                    <input
                      type="number"
                      value={additionalScores.bonus}
                      onChange={(e) => setAdditionalScores({ ...additionalScores, bonus: Number(e.target.value) })}
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
            </div>

            {results.extraTotal > 0 && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>추가 점수 합계</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>
                  {results.extraTotal} 점
                </div>
              </div>
            )}
          </div>

          {/* 최종 결과 영역 */}
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>
              최종 점수
            </h2>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {results.finalScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '8px' }}>
                {patternType === 'simple' ? '단순형 (최대 635점)' : `비율형 ${ratioTest}:${ratioNaishin} (최대 1000점)`}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '20px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '16px' }}>점수 구성</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>내신</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                    {results.naishinFinal.toFixed(1)} 점
                  </span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>시험</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                    {results.testFinal.toFixed(1)} 점
                  </span>
                </div>
                {results.extraTotal > 0 && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)' }}>추가</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white' }}>
                        {results.extraTotal} 점
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* 시각화 바 */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>점수 비율</div>
                <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.2)' }}>
                  <div
                    style={{
                      width: `${(results.naishinFinal / results.finalScore) * 100}%`,
                      background: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#78350f',
                    }}
                  >
                    {((results.naishinFinal / results.finalScore) * 100).toFixed(0)}%
                  </div>
                  <div
                    style={{
                      width: `${(results.testFinal / results.finalScore) * 100}%`,
                      background: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#1e3a8a',
                    }}
                  >
                    {((results.testFinal / results.finalScore) * 100).toFixed(0)}%
                  </div>
                  {results.extraTotal > 0 && (
                    <div
                      style={{
                        width: `${(results.extraTotal / results.finalScore) * 100}%`,
                        background: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#064e3b',
                      }}
                    >
                      {((results.extraTotal / results.finalScore) * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fbbf24' }}></div>
                    내신
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#60a5fa' }}></div>
                    시험
                  </div>
                  {results.extraTotal > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#34d399' }}></div>
                      추가
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '16px 0',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.875rem',
            margin: 0,
          }}
        >
          © 2024 입시 정보. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
