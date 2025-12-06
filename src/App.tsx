import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SchoolSchedulePage } from './pages/SchoolSchedulePage';
import { PointCalculatorPageNew } from './pages/PointCalculatorPageNew';
import { SchoolManagementPage } from './pages/SchoolManagementPage';
import AppHeader from './components/AppHeader';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/highschool">
      <AppHeader />
      <div style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/school-schedule" element={<SchoolSchedulePage />} />
          <Route path="/point-calculator" element={<PointCalculatorPageNew />} />
          <Route path="/school-management" element={<SchoolManagementPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
