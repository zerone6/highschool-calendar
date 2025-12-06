import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: 'linear-gradient(to bottom right, #6366f1, #a855f7, #9333ea)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      overflow: 'hidden',
    }}>
      {/* Main Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 20px',
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto',
            justifyContent: 'center',
          }}>
            {/* School Schedule Card */}
            <div
              onClick={() => navigate('/school-schedule')}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '388px',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}>
                📚
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '4px',
                }}>
                  일시일정
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                }}>
                  선택
                </p>
              </div>
            </div>

            {/* Point Calculator Card */}
            <div
              onClick={() => navigate('/point-calculator')}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '388px',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              }}>
                🧮
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '4px',
                }}>
                  도립 점수 계산
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                }}>
                  입시 점수 계산기
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 0',
        textAlign: 'center',
      }}>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.875rem',
          margin: 0,
        }}>
          &copy; 2024 Family Services. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
