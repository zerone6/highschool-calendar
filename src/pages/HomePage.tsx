import React from 'react';
import { ContentCard } from '../components/ContentCard';

export const HomePage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#ffffff',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            家族情報共有サイト
          </h1>
          <p style={{
            fontSize: '1.1rem',
            margin: 0,
            opacity: 0.9,
          }}>
            家族のための便利なツールを一箇所に
          </p>
        </header>

        {/* Content Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
          padding: '0 0.5rem',
        }}>
          <ContentCard
            title="東京都私立学校入試日程選択"
            description="東京都の私立学校の入試日程を確認し、受験校を選択・管理できます。"
            icon="📚"
            path="/school-schedule"
            bgColor="#1976d2"
          />

          {/* 추가 카드는 여기에 계속 추가 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}>
            <div style={{ textAlign: 'center', color: '#ffffff' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>➕</div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                新しいコンテンツを追加予定
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          marginTop: '4rem',
          color: '#ffffff',
          opacity: 0.7,
          fontSize: '0.85rem',
        }}>
          <p style={{ margin: 0 }}>
            © 2025 Family Information Hub
          </p>
        </footer>
      </div>
    </div>
  );
};
