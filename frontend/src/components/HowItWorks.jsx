import React from 'react';
import { UploadCloud, Wand2, FileSearch, UserCheck, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '೧',
      title: 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ (Upload Document)',
      description:
        'ತಾಳೆಗರಿ ಹಸ್ತಪ್ರತಿ, ಕಲ್ಲಿನ ಶಾಸನದ ಛಾಪಣೆ (estampage), ಅಥವಾ ಹಳೆಯ ಕಾಗದದ ಮುದ್ರಿತ ಪುಟವನ್ನು (PNG, JPG, WEBP, ಗರಿಷ್ಠ 10MB) ಸುರಕ್ಷಿತವಾಗಿ ಸೇರಿಸಿ.',
      icon: UploadCloud,
      status: 'ಲಭ್ಯವಿದೆ (Active)',
      active: true,
    },
    {
      number: '೨',
      title: 'ಚಿತ್ರದ ಸ್ಪಷ್ಟತೆ ಸುಧಾರಣೆ (Enhance Readability)',
      description:
        'JavaScript ಆಧಾರಿತ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ (ಗ್ರೇಸ್ಕೇಲ್, ಲೋಕಲ್ ಅಡಾಪ್ಟಿವ್ ಥ್ರೆಶ್‌ಹೋಲ್ಡಿಂಗ್, ಕಾಂಟ್ರಾಸ್ಟ್ ಮತ್ತು ನಾಯ್ಸ್ ರಿಡಕ್ಷನ್) ಮೂಲಕ ಮಸುಕಾದ ಗೆರೆಗಳನ್ನು ದೃಗ್ಗೋಚರವಾಗಿಸಿ.',
      icon: Wand2,
      status: 'ಲಭ್ಯವಿದೆ (Active)',
      active: true,
    },
    {
      number: '೩',
      title: 'ಕನ್ನಡ ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆ (Kannada Text OCR)',
      description:
        'ಸುಧಾರಿತ ಚಿತ್ರದಿಂದ Tesseract.js (kan) ಭಾಷಾ ಮಾದರಿಯ ಮೂಲಕ ಕನ್ನಡ ಅಕ್ಷರಗಳನ್ನು ಗಣಕೀಕೃತ ಯುನಿಕೋಡ್ ಪಠ್ಯವಾಗಿ ಪರಿವರ್ತಿಸುವುದು.',
      icon: FileSearch,
      status: 'ಲಭ್ಯವಿದೆ (Active)',
      active: true,
    },
    {
      number: '೪',
      title: 'ಮಾನವ-ಪರಿಶೀಲಿತ ಪಠ್ಯ ಮರುಪಡೆಯುವಿಕೆ (Recovery Suggestions)',
      description:
        'ಸಂದಿಗ್ಧ ಅಥವಾ ಅಳಿಸಿಹೋದ ಅಕ್ಷರಗಳಿಗೆ AI ಮಾದರಿಯಿಂದ ಸಂಭಾವ್ಯ ಪರ್ಯಾಯ ಪದಗಳನ್ನು ಪಡೆದು, ಬಳಕೆದಾರರು ಮತ್ತು ವಿದ್ವಾಂಸರು ದೃಢೀಕರಿಸಲು ಅವಕಾಶ ಕಲ್ಪಿಸುವುದು.',
      icon: UserCheck,
      status: 'ಲಭ್ಯವಿದೆ (Active)',
      active: true,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-ivory-100 border-b border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold font-serif">
            ಕಾರ್ಯವಿಧಾನ (Process Workflow)
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900">
            ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?
          </h2>
          <p className="text-ink-600 text-sm sm:text-base leading-relaxed">
            ಅಕ್ಷರೋದ್ಧಾರವು ಡಿಜಿಟಲ್ ಪುನರುಜ್ಜೀವನದ ನಾಲ್ಕು ಪ್ರಮುಖ ಹಂತಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. ಪ್ರಸ್ತುತ ಹಂತದಲ್ಲಿ ನೈಜ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಸೌಲಭ್ಯವು ಸಂಪೂರ್ಣವಾಗಿ ಸಕ್ರಿಯವಾಗಿದೆ.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-xl p-6 transition-all duration-200 border flex flex-col justify-between ${
                  step.active
                    ? 'bg-ivory-50 border-gold-300 shadow-parchment hover:shadow-parchment-lg'
                    : 'bg-ivory-200/60 border-ivory-300/80 opacity-85'
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-full bg-forest-700 text-gold-200 font-serif font-bold text-sm flex items-center justify-center border border-gold-400">
                      {step.number}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        step.active
                          ? 'bg-forest-100 text-forest-800 border border-forest-200'
                          : 'bg-ivory-300 text-ink-600'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 inline-block p-3 rounded-lg bg-ivory-200 text-forest-800">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-serif text-lg font-bold text-ink-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom step progression indicator */}
                <div className="pt-4 mt-4 border-t border-ivory-300 text-[11px] font-mono text-ink-500 flex items-center justify-between">
                  <span>ಹಂತ {step.number}</span>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-gold-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
