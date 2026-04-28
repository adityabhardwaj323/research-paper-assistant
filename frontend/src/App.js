import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [page, setPage] = useState('landing');

  return (
    <div style={{ fontFamily: "'Syne', sans-serif" }}>
      {page === 'landing' ? (
        <LandingPage onEnterApp={() => setPage('app')} />
      ) : (
        <Dashboard onBack={() => setPage('landing')} />
      )}
    </div>
  );
}