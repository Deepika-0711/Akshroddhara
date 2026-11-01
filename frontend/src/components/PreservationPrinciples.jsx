import React from 'react';
import { ShieldCheck, GitCompare, HelpCircle, UserCheck } from 'lucide-react';

export default function PreservationPrinciples() {
  const principles = [
    {
      title: 'ಮೂಲ ದಾಖಲೆಯ ಸಂರಕ್ಷಣೆ (Preserve Original)',
      description:
        'ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಮೂಲ ಚಿತ್ರವನ್ನು ಮಾರ್ಪಡಿಸುವುದಿಲ್ಲ ಅಥವಾ ಅಳಿಸುವುದಿಲ್ಲ. ಎಲ್ಲಾ ಸುಧಾರಣೆಗಳು ಪ್ರತ್ಯೇಕ ಸ್ತರಗಳಲ್ಲಿ (layers) ನಡೆಯುತ್ತವೆ.',
      englishSub: 'Non-destructive preservation always retains original pixels untouched.',
      icon: ShieldCheck,
    },
    {
      title: 'ನಿಜವಾದ ಮತ್ತು ಊಹಿಸಿದ ಪಠ್ಯದ ಪ್ರತ್ಯೇಕತೆ (Distinguish Fact from Prediction)',
      description:
        'ಮೂಲದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಓದಬಹುದಾದ ಅಕ್ಷರಗಳು ಮತ್ತು ಗಣಕಯಂತ್ರ ಊಹಿಸಿದ ಅಕ್ಷರಗಳನ್ನು ಸ್ಪಷ್ಟ ಬಣ್ಣ ಮತ್ತು ಸಂಕೇತಗಳಿಂದ ಪ್ರತ್ಯೇಕವಾಗಿ ಗುರುತಿಸಲಾಗುತ್ತದೆ.',
      englishSub: 'Clear visual boundaries separate OCR-extracted text from proposed algorithmic completions.',
      icon: GitCompare,
    },
    {
      title: 'ಅನಿಶ್ಚಿತತೆಯ ಪಾರದರ್ಶಕತೆ (Communicate Uncertainty)',
      description:
        'ಅಸ್ಪಷ್ಟ ಅಥವಾ ಶಿಥಿಲಗೊಂಡ ಭಾಗಗಳ ಬಗ್ಗೆ ಸತ್ಯನಿಷ್ಠವಾಗಿ ಅನಿಶ್ಚಿತತೆಯನ್ನು ಸೂಚಿಸಲಾಗುತ್ತದೆ. ಎಂದಿಗೂ ಕೃತಕವಾಗಿ ದೃಢತೆಯನ್ನು ನಟಿಸುವುದಿಲ್ಲ.',
      englishSub: 'Explicit uncertainty indicators prevent historical misinterpretation or false certainty.',
      icon: HelpCircle,
    },
    {
      title: 'ಮಾನವ ತಜ್ಞರ ದೃಢೀಕರಣ (Human-in-the-Loop)',
      description:
        'ಅಂತಿಮ ನಿರ್ಧಾರವು ಯಾವಾಗಲೂ ಇತಿಹಾಸಕಾರರು, ಶಾಸನಶಾಸ್ತ್ರಜ್ಞರು ಮತ್ತು ಲಿಪಿ ತಜ್ಞರ ವಿವೇಚನೆಗೆ ಬಿಟ್ಟದ್ದು. ತಂತ್ರಜ್ಞಾನವು ಕೇವಲ ಸಹಾಯಕ.',
      englishSub: 'Algorithms propose, but trained epigraphists and scholars verify and authenticate.',
      icon: UserCheck,
    },
  ];

  return (
    <section id="principles" className="py-20 bg-ivory-200/50 border-b border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold font-serif">
            ಸಂರಕ್ಷಣಾ ಮೌಲ್ಯಗಳು (Preservation Principles)
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900">
            ಪ್ರಾಚೀನ ಪರಂಪರೆಗೆ ನ್ಯಾಯ ಸಲ್ಲಿಸುವ ತತ್ವಗಳು
          </h2>
          <p className="text-ink-600 text-sm sm:text-base leading-relaxed">
            ಐತಿಹಾಸಿಕ ದಾಖಲೆಗಳ ಸಂರಕ್ಷಣೆಯಲ್ಲಿ ನೈತಿಕ ಹೊಣೆಗಾರಿಕೆ ಅತ್ಯಂತ ಮುಖ್ಯ. ಅಕ್ಷರೋದ್ಧಾರವು ಈ ನಾಲ್ಕು ಅಚಲ ತತ್ವಗಳ ಅಡಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-ivory-50 rounded-xl p-6 sm:p-8 border border-ivory-300 shadow-parchment hover:border-gold-400 transition-colors flex gap-5 items-start"
              >
                <div className="p-3.5 rounded-lg bg-forest-700 text-gold-300 shrink-0 border border-gold-400/40">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-forest-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-800 leading-relaxed font-sans">
                    {item.description}
                  </p>
                  <p className="text-xs text-ink-500 italic font-sans pt-1">
                    {item.englishSub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
