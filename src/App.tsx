import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SchoolSchedulePage } from './pages/SchoolSchedulePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/highschool">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/school-schedule" element={<SchoolSchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
};
