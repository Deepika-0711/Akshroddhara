import React, { useState } from 'react';
import {
  Wand2,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  HelpCircle,
  History,
  GitCompare,
  FileText,
  Key,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import { suggestRecoveryApi } from '../services/api';

export default function TextRecoveryPanel({
  originalOcrText,
  workingText,
  setWorkingText,
  previewImage,
  acceptedCorrections = [],
  onAcceptCorrection,
  onRejectSuggestion,
  onRequestSuggestions,
  onManualEdit,
}) {
  // Selection and Input State
  const [selectedText, setSelectedText] = useState('');
  const [contextText, setContextText] = useState('');
  const [damageNote, setDamageNote] = useState('');
  const [selectionRange, setSelectionRange] = useState(null); // { start, end }

  // Recovery Suggestions State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [rejectedIds, setRejectedIds] = useState(new Set());
  const [requestError, setRequestError] = useState(null);
  const [setupGuide, setSetupGuide] = useState(null);
  const [cooldown, setCooldown] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState('working'); // 'working' | 'original' | 'compare'

  // Detect selection in the textarea
  const handleTextareaSelect = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    if (start !== end) {
      const selected = e.target.value.substring(start, end).trim();
      if (selected.length > 0) {
        setSelectedText(selected);
        setSelectionRange({ start, end });

        // Extract surrounding context (up to 60 characters before and after)
        const ctxStart = Math.max(0, start - 60);
        const ctxEnd = Math.min(e.target.value.length, end + 60);
        setContextText(e.target.value.substring(ctxStart, ctxEnd).trim());
        setRequestError(null);
      }
    }
  };

  // Submit request for possible readings
  const handleRequestSuggestions = async () => {
    if (!selectedText.trim()) {
      setRequestError(
        'ದಯವಿಟ್ಟು ಪಠ್ಯದಲ್ಲಿ ಅಸ್ಪಷ್ಟವಾಗಿರುವ ಒಂದು ಪದ ಅಥವಾ ಅಕ್ಷರವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Please select an unclear word or phrase in the working text above).'
      );
      return;
    }

    if (cooldown || isSubmitting) return;

    setIsSubmitting(true);
    setRequestError(null);
    setSetupGuide(null);
    setRejectedIds(new Set());

    try {
      const result = await suggestRecoveryApi({
        selectedText: selectedText.trim(),
        context: contextText || workingText.slice(0, 300),
        damageNote: damageNote.trim(),
      });

      setRecoveryData(result);

      if (onRequestSuggestions) {
        onRequestSuggestions({
          selectedText: selectedText.trim(),
          context: contextText || workingText.slice(0, 300),
          damageNote: damageNote.trim(),
          suggestionsCount: result.suggestions?.length || 0,
        });
      }

      // Trigger cooldown for 2 seconds to safeguard against accidental spam
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    } catch (err) {
      console.warn('Recovery suggestion error:', err);
      setRequestError(err.message);
      if (err.setupGuide) {
        setSetupGuide(err.setupGuide);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accept a suggestion: updates ONLY the working copy, never touching original OCR text
  const handleAcceptSuggestion = (suggestion, index) => {
    if (!suggestion?.text) return;

    const replacement = suggestion.text;
    let newWorkingText = workingText;

    if (
      selectionRange &&
      selectionRange.start !== undefined &&
      selectionRange.end !== undefined
    ) {
      // Precise slice replacement
      newWorkingText =
        workingText.substring(0, selectionRange.start) +
        replacement +
        workingText.substring(selectionRange.end);
    } else {
      // Fallback replace first occurrence of selected text
      newWorkingText = workingText.replace(selectedText, replacement);
    }

    setWorkingText(newWorkingText);

    // Record in central session state and audit log
    const auditRecord = {
      id: Date.now(),
      originalSnippet: selectedText,
      replacementText: replacement,
      reason: suggestion.reason || 'AI-assisted paleographical suggestion',
      timestamp: new Date().toLocaleTimeString('kn-IN'),
      source: 'ai_suggestion',
    };

    if (onAcceptCorrection) {
      onAcceptCorrection(auditRecord);
    }

    // Clear current selection and suggestion
    setSelectedText('');
    setSelectionRange(null);
    setRecoveryData(null);
  };

  // Reject a suggestion: records rejection but does NOT modify working text
  const handleRejectSuggestion = (suggestion, index) => {
    setRejectedIds((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });

    if (onRejectSuggestion) {
      onRejectSuggestion({
        id: Date.now(),
        originalSnippet: selectedText,
        rejectedText: suggestion.text,
        reason: suggestion.reason || 'User rejected suggestion',
        timestamp: new Date().toLocaleTimeString('kn-IN'),
      });
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-gold-300/60">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold tracking-wider uppercase font-serif">
            <span>ಹಂತ ೪ (Step 4)</span>
            <span>•</span>
            <span>ಹಾನಿ-ಅರಿವಿನ ಪಠ್ಯ ಪರಿಶೀಲನೆ (Damage-Aware Recovery Suggestions)</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-gold-600" />
            <span>ಅಸ್ಪಷ್ಟ ಅಕ್ಷರಗಳ ತನಿಖೆ ಮತ್ತು ಸಂಭಾವ್ಯ ಓದುಗಳು</span>
          </h3>
          <p className="text-xs text-ink-600">
            ಚಿತ್ರದಲ್ಲಿ ಅಳಿಸಿಹೋಗಿರುವ ಅಥವಾ ಸವೆದಿರುವ ಅಕ್ಷರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ ಸಂಭಾವ್ಯ ಪರ್ಯಾಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.
            ಎಲ್ಲಾ ಸಲಹೆಗಳೂ ಅನಿಶ್ಚಿತ ಊಹೆಗಳಾಗಿದ್ದು, ವಿದ್ವಾಂಸರ ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-ivory-200 rounded-lg border border-ivory-300 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('working')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'working'
                ? 'bg-forest-700 text-ivory-50 shadow-sm'
                : 'text-ink-700 hover:bg-ivory-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ಸಂಪಾದಿತ ಪ್ರತಿ (Working Copy)</span>
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'original'
                ? 'bg-forest-700 text-ivory-50 shadow-sm'
                : 'text-ink-700 hover:bg-ivory-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ಮೂಲ OCR ಪ್ರತಿ (Original)</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-forest-700 text-ivory-50 shadow-sm'
                : 'text-ink-700 hover:bg-ivory-300'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>ಹೋಲಿಕೆ (Compare)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Work Area */}
      {activeTab === 'working' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sub-column: Editable Text Area with Text Selection */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex justify-between items-center text-xs text-ink-600">
              <span className="font-semibold text-forest-800 flex items-center gap-1.5">
                <span>ಕೆಳಗಿನ ಪಠ್ಯದಲ್ಲಿ ಅಸ್ಪಷ್ಟ ಪದವನ್ನು ಹೈಲೈಟ್ (Select) ಮಾಡಿ:</span>
              </span>
              <span className="text-[11px] text-ink-500 font-mono">
                {workingText.length} ಅಕ್ಷರಗಳು
              </span>
            </div>

            <textarea
              value={workingText}
              onChange={(e) => setWorkingText(e.target.value)}
              onBlur={() => onManualEdit && onManualEdit()}
              onSelect={handleTextareaSelect}
              rows={9}
              className="w-full p-4 rounded-xl border-2 border-gold-300/80 focus:border-forest-700 focus:ring-2 focus:ring-forest-600/20 bg-white font-serif text-base sm:text-lg text-ink-900 leading-relaxed shadow-inner outline-none transition-all resize-y selection:bg-gold-300 selection:text-forest-900"
              placeholder="ಇಲ್ಲಿ ಪಠ್ಯವನ್ನು ಸಂಪಾದಿಸಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ..."
            />

            <div className="text-[11px] text-ink-500 flex items-center justify-between">
              <span>
                💡 ಸೂಚನೆ: ಮೌಸ್ ಅಥವಾ ಕರ್ಸರ್‌ನಿಂದ ಯಾವುದೇ ಸಂದಿಗ್ಧ ಪದವನ್ನು ಸೆಲೆಕ್ಟ್ ಮಾಡಿ, ಬಲಭಾಗದಲ್ಲಿ 'ಸಂಭಾವ್ಯ ಓದುಗಳ ಸಲಹೆ' ಒತ್ತಿ.
              </span>
            </div>
          </div>

          {/* Right Sub-column: Selection Inspector & Damage Note */}
          <div className="lg:col-span-5 bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment p-5 space-y-4">
            <h4 className="font-serif font-bold text-sm text-forest-900 border-b border-ivory-300 pb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-gold-600" />
              <span>ಆಯ್ಕೆಮಾಡಿದ ಅಸ್ಪಷ್ಟ ಭಾಗ (Selected Unclear Text)</span>
            </h4>

            {/* Selected Text Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-800">
                ಆಯ್ಕೆಮಾಡಿದ ಅಕ್ಷರ / ಪದ (Selected Text):
              </label>
              <input
                type="text"
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                placeholder="ಪಠ್ಯದಲ್ಲಿ ಪದವನ್ನು ಸೆಲೆಕ್ಟ್ ಮಾಡಿ ಅಥವಾ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                className="w-full p-2.5 rounded-lg border border-gold-300/80 bg-white font-serif text-ink-900 text-sm focus:border-forest-700 outline-none"
              />
            </div>

            {/* Optional Damage Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-800 flex justify-between">
                <span>ಕಣ್ಣಿಗೆ ಕಾಣುವ ಹಾನಿಯ ವಿವರ (Damage Observation - ಐಚ್ಛಿಕ):</span>
              </label>
              <input
                type="text"
                value={damageNote}
                onChange={(e) => setDamageNote(e.target.value)}
                placeholder="ಉದಾ: ಮೇಲಿನ ಸುರುಳಿ ಅಳಿಸಿಹೋಗಿದೆ, ಕಾಗದದ ತೇವಾಂಶದ ಕಲೆ..."
                className="w-full p-2.5 rounded-lg border border-ivory-300 bg-white text-ink-900 text-xs focus:border-forest-700 outline-none"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleRequestSuggestions}
              disabled={isSubmitting || cooldown || !selectedText.trim()}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                isSubmitting || cooldown || !selectedText.trim()
                  ? 'bg-ivory-300 text-ink-400 cursor-not-allowed border border-ivory-300'
                  : 'bg-forest-700 hover:bg-forest-800 text-ivory-50 border border-forest-800 shadow-parchment hover:shadow-parchment-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gold-300" />
                  <span>ತಜ್ಞ ಮಾದರಿಯೊಂದಿಗೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-gold-300" />
                  <span>ಸಂಭಾವ್ಯ ಓದುಗಳ ಸಲಹೆ (Suggest Possible Readings)</span>
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <p className="text-[11px] text-ink-500 italic leading-normal">
              🔒 ಗೌಪ್ಯತೆ: ನೀವು ಸ್ಪಷ್ಟವಾಗಿ ಸೆಲೆಕ್ಟ್ ಮಾಡಿದ ಪದ ಮತ್ತು ಅದರ ಸನಿಹದ ಸಾಲನ್ನು ಮಾತ್ರ AI ಸೇವೆಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ.
            </p>
          </div>
        </div>
      )}

      {/* Original OCR Tab View (Preserved Unaltered) */}
      {activeTab === 'original' && (
        <div className="bg-white rounded-xl border border-ivory-300 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-ivory-200 pb-2 text-xs">
            <span className="font-serif font-bold text-ink-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest-700" />
              <span>ಮೂಲ OCR ಫಲಿತಾಂಶ (Pristine Unmodified OCR Output)</span>
            </span>
            <span className="text-forest-700 font-mono text-[11px] bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              ಬದಲಾಯಿಸಲಾಗದ ಮೂಲ ಸ್ತರ (Read-Only Original Layer)
            </span>
          </div>
          <div className="p-4 rounded-lg bg-ivory-50 font-serif text-ink-900 leading-relaxed whitespace-pre-wrap text-base">
            {originalOcrText || '(ಯಾವುದೇ OCR ಪಠ್ಯವಿಲ್ಲ)'}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Tab */}
      {activeTab === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Original OCR */}
          <div className="bg-white rounded-xl border border-ivory-300 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-ivory-200 pb-2 text-xs font-semibold text-ink-700">
              <span>೧. ಮೂಲ OCR ಫಲಿತಾಂಶ (Original OCR)</span>
              <span className="text-[11px] text-ink-500 font-mono">ಮಾರ್ಪಡಿಸದ</span>
            </div>
            <div className="p-4 rounded-lg bg-ivory-100/70 font-serif text-sm text-ink-800 min-h-[220px] whitespace-pre-wrap leading-relaxed">
              {originalOcrText}
            </div>
          </div>

          {/* Right: Working Edited Copy */}
          <div className="bg-white rounded-xl border-2 border-forest-600/40 p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-forest-200 pb-2 text-xs font-semibold text-forest-900">
              <span>೨. ಬಳಕೆದಾರರು ಪರಿಶೀಲಿಸಿದ ಪ್ರತಿ (Working Edited Text)</span>
              <span className="text-[11px] bg-forest-100 text-forest-800 px-2 py-0.5 rounded font-mono">
                {acceptedCorrections.length} ತಿದ್ದುಪಡಿಗಳು
              </span>
            </div>
            <div className="p-4 rounded-lg bg-ivory-50 font-serif text-sm text-ink-900 min-h-[220px] whitespace-pre-wrap leading-relaxed">
              {workingText}
            </div>
          </div>
        </div>
      )}

      {/* Error & Setup Guidance Card */}
      {requestError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-ink-900 text-xs space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900">ಸೂಚನೆ (Notice):</span>
              <p>{requestError}</p>
            </div>
          </div>

          {/* Setup Guide Instructions if AI is not configured */}
          {setupGuide && (
            <div className="mt-3 p-3.5 rounded-lg bg-white/90 border border-amber-200 text-ink-800 space-y-2">
              <div className="font-semibold text-forest-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-gold-600" />
                <span>AI ಪ್ರೊವೈಡರ್ ಜೋಡಣೆ ಮಾರ್ಗದರ್ಶಿ (Setup Instructions):</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-ink-700 font-sans">
                {setupGuide.instructions?.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
              <div className="text-[11px] text-ink-500 pt-1">
                ಉಚಿತ ಗೂಗಲ್ ಜೆಮಿನೈ API ಕೀ ಪಡೆಯಲು:{' '}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-forest-700 underline font-medium inline-flex items-center gap-0.5"
                >
                  <span>Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recovery Suggestions Display Section */}
      {recoveryData && (
        <div className="p-6 rounded-2xl bg-ivory-50 border-2 border-gold-400 shadow-parchment-lg space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-ivory-300 gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-forest-900">
                  ಸಂಭಾವ್ಯ ಓದುಗಳ ಪಟ್ಟಿ (Proposed Readings)
                </span>
                <span className="text-[11px] bg-gold-200/90 text-ink-900 border border-gold-400 font-medium px-2 py-0.5 rounded">
                  ಆಯ್ಕೆ: "{recoveryData.selectedText}"
                </span>
              </div>
              <p className="text-xs text-ink-600">
                {recoveryData.explanation}
              </p>
            </div>

            {/* Mandatory Unverified Label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold self-start sm:self-auto">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>ದೃಢೀಕರಿಸದ ಊಹೆ — ಮಾನವ ಪರಿಶೀಲನೆ ಅಗತ್ಯ (Unverified suggestion)</span>
            </div>
          </div>

          {/* Suggestions List */}
          {recoveryData.suggestions && recoveryData.suggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recoveryData.suggestions.map((sug, idx) => {
                if (rejectedIds.has(idx)) return null;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white border border-ivory-300 shadow-sm hover:border-gold-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-ink-400">
                          ಆಯ್ಕೆ {idx + 1} (Option {idx + 1})
                        </span>
                        <span className="text-[10px] bg-ivory-200 text-ink-600 px-1.5 py-0.5 rounded">
                          ಸಂಭಾವ್ಯ
                        </span>
                      </div>

                      {/* Suggested Kannada Word */}
                      <div className="font-serif text-xl sm:text-2xl font-bold text-forest-800 tracking-wide">
                        {sug.text}
                      </div>

                      {/* Paleographical Reason */}
                      <p className="text-xs text-ink-700 leading-relaxed font-sans">
                        {sug.reason}
                      </p>
                    </div>

                    {/* Action Buttons: Accept / Reject */}
                    <div className="pt-2 border-t border-ivory-200 flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptSuggestion(sug, idx)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-forest-700 hover:bg-forest-800 text-ivory-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        title="Accept this suggestion into working text"
                      >
                        <Check className="w-3.5 h-3.5 text-gold-300" />
                        <span>ಸ್ವೀಕರಿಸಿ (Accept)</span>
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(sug, idx)}
                        className="py-1.5 px-2.5 rounded-lg bg-ivory-200 hover:bg-red-50 text-ink-600 hover:text-red-700 border border-ivory-300 text-xs font-medium flex items-center justify-center transition-colors"
                        title="Reject / Dismiss this suggestion"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Uninterpretable State */
            <div className="p-6 text-center rounded-xl bg-ivory-100 border border-ivory-300 space-y-2">
              <p className="font-serif font-bold text-sm text-ink-800">
                ಯಾವುದೇ ವಿಶ್ವಾಸಾರ್ಹ ಓದು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (No Reliable Reading Possible)
              </p>
              <p className="text-xs text-ink-600 max-w-lg mx-auto">
                ಆಯ್ಕೆಮಾಡಿದ ಭಾಗದಲ್ಲಿ ಹಾನಿ ಅತಿಯಾಗಿದ್ದು ಅಥವಾ ಆಧಾರ ಸಾಲದಾಗಿದ್ದು, ಕೃತಕವಾಗಿ ಸುಳ್ಳು ಪದಗಳನ್ನು ಸೃಷ್ಟಿಸುವುದನ್ನು ವ್ಯವಸ್ಥೆ ತಡೆದಿದೆ.
              </p>
            </div>
          )}

          {/* Request Another Set / Reset */}
          <div className="pt-2 flex justify-between items-center text-xs text-ink-500">
            <span>
              ಆಯ್ಕೆಯನ್ನು ಸ್ವೀಕರಿಸಿದರೆ ಅದು ಕೇವಲ ನಿಮ್ಮ ಸಂಪಾದಿತ ಪ್ರತಿಯನ್ನು ಅಪ್‌ಡೇಟ್ ಮಾಡುತ್ತದೆ; ಮೂಲ OCR ಪ್ರತಿ ಶಾಶ್ವತವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.
            </span>
            <button
              onClick={() => setRecoveryData(null)}
              className="text-ink-600 hover:text-forest-700 underline text-xs font-medium"
            >
              ಮುಚ್ಚಿ (Close Suggestions)
            </button>
          </div>
        </div>
      )}

      {/* Corrections Audit Log (Layer 6) */}
      {acceptedCorrections && acceptedCorrections.length > 0 && (
        <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-300 space-y-3 text-xs">
          <div className="flex items-center justify-between font-serif font-bold text-forest-800">
            <span className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-gold-600" />
              <span>ಮಾನವ-ದೃಢೀಕೃತ ತಿದ್ದುಪಡಿಗಳ ಇತಿಹಾಸ (Accepted Corrections Audit Log):</span>
            </span>
            <span className="text-[11px] font-mono text-ink-500">
              {acceptedCorrections.length} ಬದಲಾವಣೆಗಳು
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {acceptedCorrections.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded bg-white border border-ivory-200 flex items-center justify-between gap-3 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-serif line-through text-red-700/80">
                    "{item.originalSnippet}"
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-400" />
                  <span className="font-serif font-bold text-forest-800">
                    "{item.replacementText}"
                  </span>
                </div>
                <div className="flex items-center gap-3 text-ink-500">
                  <span className="italic truncate max-w-[240px] hidden sm:inline">
                    {item.reason}
                  </span>
                  <span className="font-mono text-[10px]">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
