import React from 'react';
import { Scroll, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function Header({ activePage, setActivePage }) {
  const handleNav = (target) => {
    setActivePage(target);
    if (target === 'landing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (id) => {
    if (activePage !== 'landing') {
      setActivePage('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-ivory-100/95 backdrop-blur-md border-b border-ivory-300 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-lg bg-forest-700 border border-gold-400 flex items-center justify-center text-gold-300 shadow-sm group-hover:bg-forest-800 transition-colors">
              <Scroll className="w-6 h-6 text-gold-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-forest-800">
                  ಅಕ್ಷರೋದ್ಧಾರ
                </span>
                <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold hidden sm:inline">
                  Aksharoddhaara
                </span>
              </div>
              <span className="text-xs text-forest-600 italic">
                ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-ink-800">
            <button
              onClick={() => handleNav('landing')}
              className={`transition-colors py-1 hover:text-forest-700 ${
                activePage === 'landing' ? 'text-forest-700 font-semibold border-b-2 border-forest-600' : 'text-ink-700'
              }`}
            >
              ಮುಖಪುಟ (Home)
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-ink-700 hover:text-forest-700 transition-colors py-1"
            >
              ಕಾರ್ಯವಿಧಾನ (How It Works)
            </button>
            <button
              onClick={() => scrollToSection('principles')}
              className="text-ink-700 hover:text-forest-700 transition-colors py-1"
            >
              ತತ್ವಗಳು (About & Ethics)
            </button>
          </nav>

          {/* Primary CTA Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('workspace')}
              className={`px-4 sm:px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${
                activePage === 'workspace'
                  ? 'bg-forest-800 text-gold-300 border border-gold-400 ring-2 ring-gold-400/20'
                  : 'bg-forest-700 hover:bg-forest-800 text-ivory-50 border border-forest-800 hover:shadow-md'
              }`}
            >
              <Sparkles className="w-4 h-4 text-gold-300" />
              <span>ದಾಖಲೆ ಸುಧಾರಿಸಿ (Restore a Document)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
