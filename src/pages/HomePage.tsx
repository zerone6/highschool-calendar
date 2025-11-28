import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserInfo {
  email: string;
  name: string;
  picture_url?: string;
  role: string;
  status: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch user authentication status
    fetch('/auth/status', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Auth status response:', data);
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch auth status:', err);
      });
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: 'linear-gradient(to bottom right, #6366f1, #a855f7, #9333ea)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 0',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="/"
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
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
            <h1 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: 0,
            }}>
              입시 정보
            </h1>
          </div>

          {/* Profile Menu */}
          {user && (
            <div style={{ position: 'relative' }}>
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
                <div style={{
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
                }}>
                  {user.picture_url ? (
                    <img
                      src={user.picture_url}
                      alt="Profile"
                      onError={(e) => {
                        console.error('Failed to load profile image:', user.picture_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Profile image loaded successfully:', user.picture_url);
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    getInitial(user.email)
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  minWidth: '280px',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}>
                  {/* User Info */}
                  <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '1.125rem',
                      overflow: 'hidden',
                    }}>
                      {user.picture_url ? (
                        <img
                          src={user.picture_url}
                          alt="Profile"
                          onError={(e) => {
                            console.error('Failed to load dropdown profile image:', user.picture_url);
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        getInitial(user.email)
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        color: '#1f2937',
                        marginBottom: '4px',
                      }}>
                        {user.email}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: user.role === 'admin' ? '#dc2626' : '#3b82f6',
                        color: 'white',
                        fontWeight: 500,
                      }}>
                        {user.role === 'admin' ? '관리자' : '사용자'}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '8px 0' }}>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => window.location.href = '/auth/admin'}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'background 0.2s',
                          fontSize: '0.875rem',
                          color: '#374151',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                        }}
                      >
                        <span>👑</span>
                        관리자 대시보드
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background 0.2s',
                        fontSize: '0.875rem',
                        color: '#374151',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      <span>🚪</span>
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '800px',
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px',
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
