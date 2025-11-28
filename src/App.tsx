import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SchoolSchedulePage } from './pages/SchoolSchedulePage';
import { PointCalculatorPage } from './pages/PointCalculatorPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/highschool">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/school-schedule" element={<SchoolSchedulePage />} />
        <Route path="/point-calculator" element={<PointCalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
};
