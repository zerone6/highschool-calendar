import React, { useState, useEffect } from 'react';
import { SchoolSelectionStep } from '../components/calculator/SchoolSelectionStep';
import { InternalGradesStep } from '../components/calculator/InternalGradesStep';
import { ExamScoresStep } from '../components/calculator/ExamScoresStep';
import { ResultsStep } from '../components/calculator/ResultsStep';
import type {
  School,
  InternalGrades,
  ExamScores,
  SubjectWeights,
  AdditionalScores,
} from '../types/calculator';
import { getCalculatorData, getSelectedSchools } from '../api/calculator';
import { getSpeakingScore } from '../utils/calculatorUtils';

interface UserInfo {
  email: string;
  name: string;
  picture_url: string;
  role: string;
}

export const PointCalculatorPageNew: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Step 1: 선택한 학교 목록
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);

  // Step 2: 내신 성적
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

  // Step 3: 학력검사 점수
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
  const [useSpeaking, setUseSpeaking] = useState(false);

  const [additionalScores, setAdditionalScores] = useState<AdditionalScores>({
    interview: 0,
    essay: 0,
    practical: 0,
    bonus: 0,
    speaking: 0,
  });

  const [speakingGrade, setSpeakingGrade] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('A');

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

  // 저장된 데이터 로드
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      // 저장된 계산기 데이터 로드
      const calculatorData = await getCalculatorData();
      if (calculatorData) {
        setInternalGrades({
          japanese: calculatorData.grade_japanese,
          math: calculatorData.grade_math,
          english: calculatorData.grade_english,
          social: calculatorData.grade_social,
          science: calculatorData.grade_science,
          tech_home: calculatorData.grade_tech_home,
          pe: calculatorData.grade_pe,
          music: calculatorData.grade_music,
          art: calculatorData.grade_art,
        });

        setExamScores({
          japanese: calculatorData.exam_japanese,
          math: calculatorData.exam_math,
          english: calculatorData.exam_english,
          social: calculatorData.exam_social,
          science: calculatorData.exam_science,
        });

        setUseWeights(calculatorData.use_weights);
        setWeights({
          japanese: calculatorData.weight_japanese,
          math: calculatorData.weight_math,
          english: calculatorData.weight_english,
          social: calculatorData.weight_social,
          science: calculatorData.weight_science,
        });

        setUseInterview(calculatorData.use_interview);
        setUseEssay(calculatorData.use_essay);
        setUsePractical(calculatorData.use_practical);
        setUseBonus(calculatorData.use_bonus);
        setUseSpeaking(calculatorData.use_speaking);

        setAdditionalScores({
          interview: calculatorData.additional_interview,
          essay: calculatorData.additional_essay,
          practical: calculatorData.additional_practical,
          bonus: calculatorData.additional_bonus,
          speaking: calculatorData.additional_speaking,
        });

        setSpeakingGrade(calculatorData.speaking_grade);
      }

      // 선택한 학교 목록 로드
      const schools = await getSelectedSchools();
      setSelectedSchools(schools);
    } catch (error) {
      console.error('Failed to load saved data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SchoolSelectionStep
            onNext={() => setCurrentStep(2)}
            selectedSchools={selectedSchools}
            onSchoolsChange={setSelectedSchools}
          />
        );
      case 2:
        return (
          <InternalGradesStep
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            internalGrades={internalGrades}
            onGradesChange={setInternalGrades}
          />
        );
      case 3:
        return (
          <ExamScoresStep
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
            examScores={examScores}
            onExamScoresChange={setExamScores}
            useWeights={useWeights}
            onUseWeightsChange={setUseWeights}
            weights={weights}
            onWeightsChange={setWeights}
            additionalScores={additionalScores}
            onAdditionalScoresChange={setAdditionalScores}
            useInterview={useInterview}
            onUseInterviewChange={setUseInterview}
            useEssay={useEssay}
            onUseEssayChange={setUseEssay}
            usePractical={usePractical}
            onUsePracticalChange={setUsePractical}
            useBonus={useBonus}
            onUseBonusChange={setUseBonus}
            useSpeaking={useSpeaking}
            onUseSpeakingChange={setUseSpeaking}
            speakingGrade={speakingGrade}
            onSpeakingGradeChange={setSpeakingGrade}
          />
        );
      case 4:
        return (
          <ResultsStep
            onBack={() => setCurrentStep(3)}
            selectedSchools={selectedSchools}
            internalGrades={internalGrades}
            examScores={examScores}
            useWeights={useWeights}
            weights={weights}
            additionalScores={additionalScores}
            useInterview={useInterview}
            useEssay={useEssay}
            usePractical={usePractical}
            useBonus={useBonus}
            useSpeaking={useSpeaking}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #6366f1, #a855f7, #9333ea)',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>로딩 중...</div>
        </div>
      </div>
    );
  }

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
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>도립 점수 계산</h1>
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

      {/* Progress Indicator */}
      <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '4px',
                    background: currentStep >= step ? '#10b981' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'background 0.3s',
                  }}
                />
                {step < 4 && <div style={{ width: '8px' }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setCurrentStep(1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentStep(1);
                }
              }}
              style={{
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: currentStep === 1 ? 600 : 400,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              1. 학교 선택
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setCurrentStep(2)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentStep(2);
                }
              }}
              style={{
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: currentStep === 2 ? 600 : 400,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              2. 내신 입력
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setCurrentStep(3)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentStep(3);
                }
              }}
              style={{
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: currentStep === 3 ? 600 : 400,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              3. 시험 점수
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setCurrentStep(4)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentStep(4);
                }
              }}
              style={{
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: currentStep === 4 ? 600 : 400,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              4. 최종 결과
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 20px' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>{renderStep()}</div>
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
