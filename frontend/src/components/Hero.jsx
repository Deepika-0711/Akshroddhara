import React from 'react';
import { Sparkles, ArrowRight, BookOpen, ShieldCheck, FileText } from 'lucide-react';

export default function Hero({ onOpenWorkspace, onLearnMore }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-parchment border-b border-ivory-300">
      {/* Decorative Heritage Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-gold-400/60 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-gold-400/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-gold-400/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-gold-400/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hackathon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-forest-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
              <span>ಕನ್ನಡ ಡಿಜಿಟಲ್ ನಾವೀನ್ಯತಾ ಹ್ಯಾಕಥಾನ್ ೨೦೨೬ (Kannada Digital Innovation Hackathon 2026)</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
                Every Faded Letter <br />
                <span className="text-forest-700 italic">Holds a Story.</span>
              </h1>
              <p className="font-serif text-xl sm:text-2xl text-gold-700 font-medium">
                « ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ »
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-ink-700 leading-relaxed max-w-2xl">
              ಶತಮಾನಗಳ ಪ್ರಾಚೀನ ತಾಳೆಗರಿಗಳು, ಶಿಲಾಶಾಸನಗಳು ಮತ್ತು ನಶಿಸುತ್ತಿರುವ ಹಳೆಯ ಕಾಗದದ ದಾಖಲೆಗಳನ್ನು ಡಿಜಿಟಲ್ ರೂಪದಲ್ಲಿ ಸಂರಕ್ಷಿಸುವ ನೂತನ ತಂತ್ರಜ್ಞಾನ.
              ಬೆಳಕು ಮತ್ತು ಕಾಲದ ಹೊಡೆತಕ್ಕೆ ಮಸುಕಾಗಿರುವ ಕನ್ನಡ ಅಕ್ಷರಗಳನ್ನು ಗಣಿತೀಯ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಮೂಲಕ ಮರು-ಸ್ಪಷ್ಟಗೊಳಿಸಿ, ನಮ್ಮ ಲಿಪಿಯ ಪರಂಪರೆಯನ್ನು ಉಳಿಸಿ.
            </p>

            <p className="text-sm text-ink-600 italic">
              Digital preservation of damaged Kannada documents: from 10th-century palm-leaf manuscripts to 19th-century faded lithographs, restoring character legibility with verifiable precision.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenWorkspace}
                className="px-6 py-3.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-ivory-50 font-medium text-base shadow-parchment hover:shadow-parchment-lg transition-all flex items-center gap-2.5 border border-forest-800 group"
              >
                <Sparkles className="w-5 h-5 text-gold-300 group-hover:rotate-12 transition-transform" />
                <span>ದಾಖಲೆ ಸುಧಾರಿಸಿ (Restore a Document)</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onLearnMore}
                className="px-5 py-3.5 rounded-xl bg-ivory-200/90 hover:bg-ivory-300 text-ink-800 font-medium text-base transition-colors border border-ivory-400/80 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-forest-700" />
                <span>ಕಾರ್ಯವಿಧಾನ ನೋಡಿ (How It Works)</span>
              </button>
            </div>

            {/* Micro-Trust Highlights */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-ivory-300 text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                <span>ಮೂಲ ದಾಖಲೆ ಸುರಕ್ಷಿತ (Non-destructive)</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-forest-600" />
                <span>ಖಾಸಗಿತನ (In-memory Processing)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>ಕನ್ನಡ ಯುನಿಕೋಡ್ (Unicode Support)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Manuscript Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Parchment Frame */}
              <div className="p-4 sm:p-5 rounded-2xl bg-ivory-50 border-2 border-gold-300 shadow-parchment-lg">
                <div className="border border-gold-300/60 rounded-xl p-4 bg-parchment space-y-4">
                  {/* Top Bar simulating manuscript catalog */}
                  <div className="flex items-center justify-between border-b border-ivory-300 pb-2 text-xs text-ink-600 font-serif">
                    <span className="font-semibold text-forest-800">ತಾಳೆಗರಿ ಹಸ್ತಪ್ರತಿ ಸಂ. ೪೨ (Palm-Leaf Folio)</span>
                    <span className="text-gold-700 font-mono">೧೨ನೆಯ ಶತಮಾನ</span>
                  </div>

                  {/* Visual Simulation of Degradation & Enhancement */}
                  <div className="relative rounded-lg overflow-hidden border border-ivory-300 bg-[#7A5B38] text-ivory-100 p-4">
                    <div className="space-y-2 font-serif text-sm opacity-90 leading-relaxed">
                      <div className="text-xs uppercase tracking-wider text-gold-300 border-b border-gold-400/30 pb-1 flex justify-between">
                        <span>ಹಳೆಗನ್ನಡ ಪದ್ಯ ಸಾಲು (Halegannada Verse)</span>
                        <span className="text-[10px] bg-forest-800/80 px-1.5 py-0.5 rounded text-gold-200">
                          ಸುಧಾರಣೆ ಪೂರ್ವ
                        </span>
                      </div>
                      <p className="tracking-wide text-xs sm:text-sm text-[#E2D6C0] blur-[0.3px]">
                        ॥ ಶ್ರೀಮತ್ಪರಮಗಂಭೀರಸ್ಯಾದ್ವಾದಾಮೋಘಲಾಂಛನಂ ॥
                      </p>
                      <p className="tracking-wide text-xs sm:text-sm text-[#C8B89E] opacity-75">
                        ಜೀಯಾತ್ ತ್ರೈಲೋಕ್ಯನಾಥಸ್ಯ ಶಾಸನಂ ಜಿನ ಶಾಸನಂ ॥
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-ivory-400/20 bg-ivory-100 text-ink-900 rounded p-2.5 shadow-sm">
                      <div className="text-[11px] font-semibold text-forest-700 flex items-center justify-between">
                        <span>ಅಕ್ಷರೋದ್ಧಾರ ಸುಧಾರಿತ ಫಲಿತಾಂಶ (Enhanced):</span>
                        <span className="text-[10px] text-forest-800 font-mono bg-forest-100 px-1 rounded">
                          ಸ್ಪಷ್ಟ ರೂಪ
                        </span>
                      </div>
                      <p className="font-serif text-sm text-ink-900 font-bold mt-1 tracking-wide">
                        ॥ ಶ್ರೀಮತ್ ಪರಮ ಗಂಭೀರ ಸ್ಯಾದ್ವಾದಾಮೋಘ ಲಾಂಛನಂ ॥
                      </p>
                    </div>
                  </div>

                  {/* Caption underneath */}
                  <div className="text-[11px] text-ink-600 text-center font-serif italic">
                    ಕಾಲಕ್ರಮೇಣ ಅಳಿಸಿಹೋದ ಅಕ್ಷರಗಳನ್ನು ಪಿಕ್ಸೆಲ್ ಮಟ್ಟದ ಗಣಿತೀಯ ವ್ಯತ್ಯಾಸಗಳಿಂದ ಪುನಃ ಸ್ಪಷ್ಟಗೊಳಿಸಲಾಗುತ್ತದೆ.
                  </div>
                </div>
              </div>

              {/* Decorative Stamp Tag */}
              <div className="absolute -bottom-4 -left-4 bg-forest-800 text-gold-300 border border-gold-400 px-3.5 py-1.5 rounded-lg text-xs font-serif shadow-md flex items-center gap-1.5">
                <span>ಕನ್ನಡ ಸಂರಕ್ಷಣೆ ೨೦೨೬</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
