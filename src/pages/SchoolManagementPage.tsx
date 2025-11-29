import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchools } from '../api/calculator';
import type { School } from '../types/calculator';

const API_BASE = '/api/calculator';

export const SchoolManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedSchools = await getSchools();
      setSchools(fetchedSchools);
    } catch (err) {
      console.error('Failed to load schools:', err);
      setError('학교 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (schoolId: number) => {
    const newSelected = new Set(selectedSchools);
    if (newSelected.has(schoolId)) {
      newSelected.delete(schoolId);
    } else {
      newSelected.add(schoolId);
    }
    setSelectedSchools(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSchools.size === schools.length) {
      setSelectedSchools(new Set());
    } else {
      setSelectedSchools(new Set(schools.map((s) => s.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSchools.size === 0) {
      alert('삭제할 학교를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedSchools.size}개의 학교를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      const deletePromises = Array.from(selectedSchools).map((schoolId) =>
        fetch(`${API_BASE}/schools/${schoolId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      );

      await Promise.all(deletePromises);
      setSelectedSchools(new Set());
      await loadSchools();
      alert('선택한 학교가 삭제되었습니다.');
    } catch (err) {
      console.error('Failed to delete schools:', err);
      setError('학교 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        background: 'linear-gradient(to bottom right, #6366f1, #a855f7, #9333ea)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
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
            <button
              onClick={() => navigate('/')}
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← 홈으로
            </button>
            <h1
              style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 600,
                margin: 0,
              }}
            >
              학교 관리
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1f2937',
                  margin: 0,
                }}
              >
                학교 목록 ({schools.length}개)
              </h2>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedSchools.size === 0 || loading}
                style={{
                  padding: '10px 20px',
                  background: selectedSchools.size === 0 ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: selectedSchools.size === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedSchools.size > 0) {
                    e.currentTarget.style.background = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSchools.size > 0) {
                    e.currentTarget.style.background = '#ef4444';
                  }
                }}
              >
                선택 삭제 ({selectedSchools.size})
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>로딩 중...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</div>
            ) : schools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>등록된 학교가 없습니다.</div>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                      <input
                        type="checkbox"
                        checked={selectedSchools.size === schools.length && schools.length > 0}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                      학교명
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                      계산 패턴
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                      비율 (학력:내신)
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
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        background: selectedSchools.has(school.id) ? '#f3f4f6' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedSchools.has(school.id)}
                          onChange={() => handleCheckboxChange(school.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                        {school.name}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                        {school.pattern_type === 'simple' ? '단순형' : '비율형'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                        {school.pattern_type === 'ratio' ? `${school.ratio_test}:${school.ratio_naishin}` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                        {school.pass_rate_80 ? `${school.pass_rate_80}점` : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                        {school.pass_rate_60 ? `${school.pass_rate_60}점` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
