import React from 'react';
import { Link } from 'react-router-dom';

interface ContentCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
  bgColor?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  icon,
  path,
  bgColor = '#1976d2'
}) => {
  return (
    <Link
      to={path}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1a1a1a'
          }}>
            {title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#666',
            lineHeight: 1.5
          }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};
