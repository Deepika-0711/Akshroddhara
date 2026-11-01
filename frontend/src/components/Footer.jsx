import React from 'react';
import { Scroll, Heart, Award } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-forest-900 text-ivory-200 border-t-2 border-gold-500/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-forest-800 border border-gold-400 flex items-center justify-center text-gold-300">
                <Scroll className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-gold-300">
                ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)
              </span>
            </div>
            <p className="font-serif text-gold-200/90 italic text-sm">
              « ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ »
            </p>
            <p className="text-xs text-ivory-300 leading-relaxed max-w-sm">
              ಕನ್ನಡದ ಸಾವಿರಾರು ವರ್ಷಗಳ ಲಿಖಿತ ಪರಂಪರೆಯನ್ನು ಸಂರಕ್ಷಿಸಲು, ಮಸುಕಾದ ತಾಳೆಗರಿಗಳು ಹಾಗೂ ಶಾಸನಗಳ ಅಕ್ಷರಗಳನ್ನು ಗಣಕೀಯ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಮೂಲಕ ಪುನರುಜ್ಜೀವನಗೊಳಿಸುವ ಮುಕ್ತ ತಂತ್ರಜ್ಞಾನ ಯೋಜನೆ.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-forest-800/80 border border-gold-500/30 text-[11px] text-gold-300">
              <Award className="w-3.5 h-3.5" />
              <span>ಕನ್ನಡ ಡಿಜಿಟಲ್ ನಾವೀನ್ಯತಾ ಹ್ಯಾಕಥಾನ್ ೨೦೨೬</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-sm font-bold text-gold-400 uppercase tracking-wider">
              ನ್ಯಾವಿಗೇಷನ್ (Navigation)
            </h4>
            <ul className="space-y-2 text-xs text-ivory-300">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-gold-300 transition-colors"
                >
                  ಮುಖಪುಟ (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('workspace')}
                  className="hover:text-gold-300 transition-colors"
                >
                  ದಾಖಲೆ ಸುಧಾರಿಸಿ (Document Workspace)
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-gold-300 transition-colors">
                  ಕಾರ್ಯವಿಧಾನ (How It Works)
                </a>
              </li>
              <li>
                <a href="#principles" className="hover:text-gold-300 transition-colors">
                  ಸಂರಕ್ಷಣಾ ತತ್ವಗಳು (Ethics & Principles)
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif text-sm font-bold text-gold-400 uppercase tracking-wider">
              ತಂತ್ರಜ್ಞಾನ ವಿವರ (Technical Stack)
            </h4>
            <p className="text-xs text-ivory-300 leading-relaxed">
              ಶುದ್ಧ JavaScript ವಾಸ್ತುಶಿಲ್ಪ: React + Vite, Tailwind CSS, Node.js + Express, ಮತ್ತು ಪಿಕ್ಸೆಲ್-ಹಂತದ ಗಣಿತೀಯ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಅಲ್ಗಾರಿದಮ್‌ಗಳು.
            </p>
            <div className="p-3 rounded-lg bg-forest-800/60 border border-forest-700 text-[11px] text-ivory-300 space-y-1">
              <div>• ಯಾವುದೇ ಬಾಹ್ಯ ಪೈಥಾನ್ ಅವಲಂಬನೆ ಇಲ್ಲ (Zero Python)</div>
              <div>• ಕ್ಲೌಡ್ ಅಥವಾ ದತ್ತಸಂಚಯ ಸಂಗ್ರಹವಿಲ್ಲ (In-memory processing)</div>
              <div>• ಯುನಿಕೋಡ್ ಕನ್ನಡ ಬೆಂಬಲ (Full Kannada Unicode)</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-forest-800 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-400 gap-3">
          <p>
            © ೨೦೨೬ ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara). ಕನ್ನಡ ಡಿಜಿಟಲ್ ನಾವೀನ್ಯತಾ ಹ್ಯಾಕಥಾನ್ ೨೦೨೬.
          </p>
          <p className="flex items-center gap-1.5 text-gold-400/80">
            ಕನ್ನಡ ಲಿಪಿ ಮತ್ತು ಸಾಹಿತ್ಯ ಪರಂಪರೆಯ ಸಂರಕ್ಷಣೆಗಾಗಿ ಸಮರ್ಪಿತ
          </p>
        </div>
      </div>
    </footer>
  );
}
