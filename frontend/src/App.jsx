import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';

export default function App() {
  const [activePage, setActivePage] = useState('landing'); // 'landing' | 'workspace'

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 font-sans selection:bg-gold-200 selection:text-forest-900">
      <Header activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1">
        {activePage === 'landing' ? (
          <LandingPage onOpenWorkspace={() => setActivePage('workspace')} />
        ) : (
          <WorkspacePage />
        )}
      </main>

      <Footer onNavigate={setActivePage} />
    </div>
  );
}
