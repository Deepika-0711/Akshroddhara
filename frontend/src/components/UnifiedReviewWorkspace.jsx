import React, { useState } from 'react';
import {
  FileText,
  FileDown,
  RefreshCw,
  GitCompare,
  History,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { computeTextDiff } from '../services/diffUtils';
import { exportJsonReport, exportHtmlReport } from '../services/reportGenerator';

export default function UnifiedReviewWorkspace({
  session,
  onResetSession,
  onSwitchToWorkspace,
}) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);
  const [expandedSection, setExpandedSection] = useState({
    images: true,
    textDiff: true,
    corrections: true,
    history: false,
  });

  const toggleSection = (section) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const diffResult = computeTextDiff(
    session.originalOcrText || '',
    session.workingText || ''
  );

  const handleExport = (format) => {
    if (format === 'json') {
      exportJsonReport(session);
      setExportNotice('JSON ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ (JSON report downloaded).');
    } else {
      exportHtmlReport(session);
      setExportNotice('ಮುದ್ರಣ-ಸಿದ್ಧ HTML ವರದಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ (HTML evidence report downloaded).');
    }

    if (session.recordSessionEvent) {
      session.recordSessionEvent({
        type: 'REPORT_EXPORTED',
        title: `ವರದಿ ರಫ್ತು ಮಾಡಲಾಗಿದೆ (${format.toUpperCase()})`,
        details: { format },
      });
    }

    setTimeout(() => setExportNotice(null), 4000);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Top Banner & Primary Actions Bar */}
      <div className="bg-ivory-50 rounded-2xl border-2 border-gold-400/80 shadow-parchment p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold tracking-wider uppercase font-serif">
            <span>ಹಂತ ೫ (Step 5)</span>
            <span>•</span>
            <span>ಏಕೀಕೃತ ದಾಖಲೆ ಪರಿಶೀಲನಾ ಕಾರ್ಯಕ್ಷೇತ್ರ (Unified Document Review Workspace)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            ದಾಖಲೆ ಸಾಕ್ಷ್ಯ ಸಂಗ್ರಹ ಮತ್ತು ಸಮಗ್ರ ಪರಿಶೀಲನೆ
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-2xl">
            ಮೂಲ ಚಿತ್ರ, ಸುಧಾರಿತ ಚಿತ್ರ, ಮೂಲ OCR ಪಠ್ಯ ಮತ್ತು ನೀವು ಪರಿಶೀಲಿಸಿದ ತಿದ್ದುಪಡಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಹೋಲಿಸಿ ನೋಡಿ ಸಾಕ್ಷ್ಯ ವರದಿ ರಫ್ತು ಮಾಡಿ.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-ivory-50 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all border border-forest-800"
          >
            <FileDown className="w-4 h-4 text-gold-300" />
            <span>ವರದಿ ರಫ್ತು (Export Report)</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-ivory-200 hover:bg-red-50 text-red-800 border border-ivory-300 hover:border-red-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ಹೊಸ ದಾಖಲೆ (Start New)</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification Banner */}
      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* SECTION 1 & 2: SOURCE IMAGES (ORIGINAL & ENHANCED) */}
      <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment overflow-hidden">
        <button
          onClick={() => toggleSection('images')}
          className="w-full px-6 py-4 bg-ivory-200/80 flex items-center justify-between text-left border-b border-ivory-300 font-serif font-bold text-forest-900 text-base hover:bg-ivory-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ImageIcon className="w-5 h-5 text-gold-600" />
            <span>೧ ಮತ್ತು ೨. ಮೂಲ ಹಾಗೂ ಸುಧಾರಿತ ಚಿತ್ರಗಳ ಹೋಲಿಕೆ (Visual Source Layers)</span>
          </div>
          {expandedSection.images ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSection.images && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-parchment">
            {/* Original Image Card */}
            <div className="flex flex-col rounded-xl overflow-hidden border border-ivory-300 bg-white/80 shadow-sm">
              <div className="bg-ivory-200 px-4 py-2.5 text-xs font-semibold text-ink-800 flex justify-between items-center border-b border-ivory-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-forest-600" />
                  <span>ಮೂಲ ಚಿತ್ರ (Layer 1: Original Source)</span>
                </span>
                <span className="text-ink-500 font-mono text-[11px] truncate max-w-[180px]">
                  {session.file?.name || 'ಯಾವುದೇ ಚಿತ್ರವಿಲ್ಲ'}
                </span>
              </div>
              <div className="p-4 flex items-center justify-center min-h-[260px]">
                {session.originalPreview ? (
                  <img
                    src={session.originalPreview}
                    alt="Original Document"
                    className="max-h-[340px] w-auto object-contain rounded"
                  />
                ) : (
                  <div className="text-xs text-ink-500 italic">ಮೂಲ ಚಿತ್ರ ಲಭ್ಯವಿಲ್ಲ</div>
                )}
              </div>
            </div>

            {/* Enhanced Image Card */}
            <div className="flex flex-col rounded-xl overflow-hidden border-2 border-forest-600/30 bg-white/90 shadow-sm">
              <div className="bg-forest-700 text-gold-200 px-4 py-2.5 text-xs font-semibold flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                  <span>ಸುಧಾರಿತ ಚಿತ್ರ (Layer 2: Enhanced Output)</span>
                </span>
                <span className="text-[11px] bg-forest-800 text-gold-300 px-2 py-0.5 rounded font-mono">
                  {session.enhancedResult ? session.enhancedResult.presetUsed : 'ಅನ್ವಯಿಸಿಲ್ಲ'}
                </span>
              </div>
              <div className="p-4 flex items-center justify-center min-h-[260px]">
                {session.enhancedResult?.enhancedImage ? (
                  <img
                    src={session.enhancedResult.enhancedImage}
                    alt="Enhanced Document"
                    className="max-h-[340px] w-auto object-contain rounded"
                  />
                ) : (
                  <div className="text-xs text-ink-500 italic p-6 text-center space-y-2">
                    <p>ಇನ್ನೂ ಚಿತ್ರ ಸುಧಾರಣೆ ಅನ್ವಯಿಸಿಲ್ಲ (Image enhancement not run yet).</p>
                    <button
                      onClick={onSwitchToWorkspace}
                      className="px-3 py-1.5 rounded bg-forest-700 text-ivory-50 text-xs font-medium"
                    >
                      ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಹೋಗಿ ಸುಧಾರಿಸಿ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3 & 4: TEXT COMPARISON & DIFF (ORIGINAL OCR vs WORKING TEXT) */}
      <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment overflow-hidden">
        <button
          onClick={() => toggleSection('textDiff')}
          className="w-full px-6 py-4 bg-ivory-200/80 flex items-center justify-between text-left border-b border-ivory-300 font-serif font-bold text-forest-900 text-base hover:bg-ivory-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <GitCompare className="w-5 h-5 text-gold-600" />
            <span>೩ ಮತ್ತು ೪. ಪಠ್ಯ ಹೋಲಿಕೆ ಮತ್ತು ವ್ಯತ್ಯಾಸಗಳು (Original OCR vs Working Text)</span>
          </div>
          {expandedSection.textDiff ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSection.textDiff && (
          <div className="p-6 space-y-6 bg-parchment">
            {/* Diff Highlight Visualizer */}
            <div className="bg-white rounded-xl border border-ivory-300 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-2 text-xs">
                <span className="font-semibold text-forest-900 flex items-center gap-2">
                  <span>ದೃಶ್ಯ ವ್ಯತ್ಯಾಸ ವಿಶ್ಲೇಷಣೆ (Color-Coded Visual Diff):</span>
                </span>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-red-700">
                    <span className="w-2.5 h-2.5 rounded bg-red-200 border border-red-400" />
                    <span>ಅಳಿಸಲಾದ/ತಿದ್ದಲಾದ OCR ಪದಗಳು</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 font-bold">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400" />
                    <span>ಮಾನವ-ದೃಢೀಕೃತ ಹೊಸ ಪದಗಳು</span>
                  </span>
                </div>
              </div>

              {/* Rendered Diff Chunks */}
              <div className="p-4 rounded-lg bg-ivory-50/80 font-serif text-base sm:text-lg leading-relaxed text-ink-900 whitespace-pre-wrap min-h-[140px]">
                {diffResult.chunks.length > 0 ? (
                  diffResult.chunks.map((chunk, idx) => {
                    if (chunk.type === 'added') {
                      return (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-900 font-bold px-1 rounded border border-emerald-300 inline-block my-0.5"
                          title="Added by user or accepted AI suggestion"
                        >
                          {chunk.value}
                        </span>
                      );
                    }
                    if (chunk.type === 'removed') {
                      return (
                        <span
                          key={idx}
                          className="bg-red-100 text-red-800 line-through px-1 rounded border border-red-300 inline-block my-0.5 opacity-80"
                          title="Original OCR token replaced"
                        >
                          {chunk.value}
                        </span>
                      );
                    }
                    return <span key={idx}>{chunk.value}</span>;
                  })
                ) : (
                  <span className="text-xs text-ink-500 italic">
                    ಯಾವುದೇ OCR ಪಠ್ಯ ಲಭ್ಯವಿಲ್ಲ (No text to compare yet).
                  </span>
                )}
              </div>
            </div>

            {/* Side-by-Side Text Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pristine OCR Output (Read-only) */}
              <div className="bg-white rounded-xl border border-ivory-300 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs border-b border-ivory-200 pb-2">
                  <span className="font-semibold text-ink-700">
                    ಮೂಲ OCR ಪ್ರತಿ (Layer 3: Pristine OCR Output)
                  </span>
                  <span className="text-[11px] bg-ivory-200 text-ink-600 px-2 py-0.5 rounded font-mono">
                    Read-Only
                  </span>
                </div>
                <div className="p-3 rounded bg-ivory-50/60 font-serif text-sm text-ink-800 min-h-[160px] whitespace-pre-wrap leading-relaxed">
                  {session.originalOcrText || '(ಯಾವುದೇ OCR ಪಠ್ಯವಿಲ್ಲ)'}
                </div>
              </div>

              {/* Working Edited Text */}
              <div className="bg-white rounded-xl border-2 border-forest-600/30 p-4 space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-xs border-b border-forest-200 pb-2">
                  <span className="font-semibold text-forest-900">
                    ಪ್ರಸ್ತುತ ಸಂಪಾದಿತ ಪ್ರತಿ (Layer 4: Current Working Text)
                  </span>
                  <span className="text-[11px] bg-forest-100 text-forest-800 px-2 py-0.5 rounded font-mono">
                    {diffResult.stats.hasChanges ? 'ಬದಲಾವಣೆಗಳಿವೆ' : 'ಬದಲಾವಣೆಯಿಲ್ಲ'}
                  </span>
                </div>
                <div className="p-3 rounded bg-ivory-50/60 font-serif text-sm text-ink-900 min-h-[160px] whitespace-pre-wrap leading-relaxed">
                  {session.workingText || '(ಯಾವುದೇ ಪಠ್ಯವಿಲ್ಲ)'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: AI SUGGESTIONS & HUMAN DECISIONS (ACCEPTED VS REJECTED) */}
      <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment overflow-hidden">
        <button
          onClick={() => toggleSection('corrections')}
          className="w-full px-6 py-4 bg-ivory-200/80 flex items-center justify-between text-left border-b border-ivory-300 font-serif font-bold text-forest-900 text-base hover:bg-ivory-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-gold-600" />
            <span>೫. AI ಸಲಹೆಗಳು ಮತ್ತು ಮಾನವ ನಿರ್ಧಾರಗಳು (Layer 5: AI Suggestions & Decisions)</span>
          </div>
          {expandedSection.corrections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSection.corrections && (
          <div className="p-6 space-y-6 bg-parchment">
            {/* Accepted Corrections List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-600" />
                <span>ಸ್ವೀಕೃತ ತಿದ್ದುಪಡಿಗಳು (Accepted Corrections — {session.acceptedCorrections?.length || 0})</span>
              </h4>

              {session.acceptedCorrections && session.acceptedCorrections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {session.acceptedCorrections.map((corr) => (
                    <div
                      key={corr.id}
                      className="p-3 rounded-lg bg-white border border-forest-300/60 shadow-sm space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ಸ್ವೀಕೃತ</span>
                        </span>
                        <span className="font-mono text-[10px] text-ink-400">{corr.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="font-serif line-through text-red-700/80 text-sm">
                          "{corr.originalSnippet}"
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-ink-400" />
                        <span className="font-serif font-bold text-forest-800 text-base">
                          "{corr.replacementText}"
                        </span>
                      </div>
                      {corr.reason && (
                        <p className="text-[11px] text-ink-600 italic line-clamp-2 pt-1 border-t border-ivory-200">
                          {corr.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-white/70 border border-ivory-300 text-xs text-ink-500 italic">
                  ಯಾವುದೇ AI ಸಲಹೆಯನ್ನು ಇನ್ನೂ ಸ್ವೀಕರಿಸಲಾಗಿಲ್ಲ (No suggestions accepted yet).
                </div>
              )}
            </div>

            {/* Rejected Suggestions List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>ತಿರಸ್ಕೃತ ಸಲಹೆಗಳು (Rejected Suggestions — {session.rejectedSuggestions?.length || 0})</span>
              </h4>

              {session.rejectedSuggestions && session.rejectedSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {session.rejectedSuggestions.map((rej) => (
                    <div
                      key={rej.id}
                      className="p-3 rounded-lg bg-white border border-red-200 shadow-sm space-y-1.5 text-xs opacity-85"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>ತಿರಸ್ಕೃತ</span>
                        </span>
                        <span className="font-mono text-[10px] text-ink-400">{rej.timestamp}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-ink-500 text-[11px]">ಮೂಲ: "{rej.originalSnippet}"</span>
                        <div className="font-serif text-sm font-semibold text-ink-600 line-through">
                          ಸಲಹೆ: "{rej.rejectedText}"
                        </div>
                      </div>
                      {rej.reason && (
                        <p className="text-[11px] text-ink-500 italic line-clamp-2 pt-1 border-t border-ivory-200">
                          {rej.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-white/70 border border-ivory-300 text-xs text-ink-500 italic">
                  ಯಾವುದೇ ಸಲಹೆಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿಲ್ಲ (No suggestions rejected).
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: CHRONOLOGICAL SESSION AUDIT TRAIL */}
      <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment overflow-hidden">
        <button
          onClick={() => toggleSection('history')}
          className="w-full px-6 py-4 bg-ivory-200/80 flex items-center justify-between text-left border-b border-ivory-300 font-serif font-bold text-forest-900 text-base hover:bg-ivory-200 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-gold-600" />
            <span>೬. ಅಧಿವೇಶನ ಪರಿಶೀಲನಾ ಇತಿಹಾಸ (Layer 6: Session Audit Trail — {session.sessionHistory?.length || 0})</span>
          </div>
          {expandedSection.history ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSection.history && (
          <div className="p-6 bg-parchment space-y-3">
            {session.sessionHistory && session.sessionHistory.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {session.sessionHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-white border border-ivory-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-forest-600 shrink-0" />
                      <span className="font-semibold text-ink-900">{item.title}</span>
                      {item.details?.source && (
                        <span className="text-[10px] bg-ivory-200 text-ink-600 px-1.5 py-0.5 rounded font-mono">
                          {item.details.source}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-ink-500 text-[11px]">
                      <span className="italic truncate max-w-xs">
                        {item.details?.summary || item.details?.replacement || ''}
                      </span>
                      <span className="font-mono text-[10px] text-ink-400">
                        {item.displayTime || item.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-white text-xs text-ink-500 italic">
                ಯಾವುದೇ ಅಧಿವೇಶನ ಕ್ರಿಯೆ ದಾಖಲಾಗಿಲ್ಲ (No events recorded in session yet).
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preservation Scope & Ethical Disclaimer */}
      <div className="p-5 rounded-xl bg-ivory-200/80 border border-gold-300 text-xs text-ink-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-forest-900">
          <BookOpen className="w-4 h-4 text-gold-700" />
          <span>ಡಿಜಿಟಲ್ ಸಂರಕ್ಷಣಾ ಹೊಣೆಗಾರಿಕೆ ನಿಯಮಾವಳಿ (Preservation Ethics Disclaimer):</span>
        </div>
        <p className="leading-relaxed font-sans">
          ಅಕ್ಷರೋದ್ಧಾರವು ಅನ್ವೇಷಣಾ ಸಹಾಯಕ ವ್ಯವಸ್ಥೆಯಾಗಿದೆ. ಈ ವರದಿಯಲ್ಲಿರುವ OCR ಫಲಿತಾಂಶಗಳು ಮತ್ತು AI ಮರುಪಡೆಯುವಿಕೆ ಸಲಹೆಗಳು ಕೇವಲ ಗಣಕೀಕೃತ ಊಹೆಗಳಾಗಿವೆ (probabilistic hypotheses).
          ಮಾನವ ಬಳಕೆದಾರರು ಸ್ವೀಕರಿಸಿದ ತಿದ್ದುಪಡಿಗಳು ಸ್ವತಂತ್ರ ಐತಿಹಾಸಿಕ ಸತ್ಯಗಳಲ್ಲ. ವಿದ್ವಾಂಸರು ಭೌತಿಕ ಹಸ್ತಪ್ರತಿಯ ಸಾಕ್ಷ್ಯದೊಂದಿಗೆ ತುಲನೆ ಮಾಡಿ ಅಂತಿಮ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಬೇಕು.
        </p>
      </div>

      {/* EXPORT REPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory-50 rounded-2xl max-w-md w-full p-6 border-2 border-gold-400 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-forest-800">
              <div className="p-2.5 rounded-lg bg-forest-100 border border-forest-200">
                <FileDown className="w-6 h-6 text-forest-700" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink-900">
                  ದಾಖಲೆ ಪುನರುಜ್ಜೀವನ ವರದಿ ರಫ್ತು
                </h3>
                <span className="text-xs text-gold-700 font-mono">
                  Export Recovery Evidence Report
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans">
              ಈ ವರದಿಯು ಪ್ರಸ್ತುತ ಅಧಿವೇಶನದ ಸಂಪೂರ್ಣ ಸಾಕ್ಷ್ಯಗಳನ್ನು ಒಳಗೊಂಡಿರುತ್ತದೆ: ಮೂಲ ಕಡತದ ವಿವರ, ಚಿತ್ರ ಸುಧಾರಣಾ ಮಾಹಿತಿ, ಮೂಲ OCR ಪಠ್ಯ, ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿಗಳು ಮತ್ತು ಕಾಲಾನುಕ್ರಮದ ಆಡಿಟ್ ಇತಿಹಾಸ.
            </p>

            <div className="p-3 rounded-lg bg-ivory-200 border border-ivory-300 text-xs text-ink-600 space-y-1">
              <div className="font-semibold text-forest-900">• ರಫ್ತು ಮಾಡಲಾಗುವ ಸ್ವರೂಪಗಳು:</div>
              <div>1. <strong>JSON Format:</strong> ಗಣಕೀಯ ಸಂಶೋಧನೆ ಮತ್ತು ಆರ್ಕೈವಲ್‌ಗಾಗಿ ರಚನಾತ್ಮಕ ದತ್ತಾಂಶ.</div>
              <div>2. <strong>HTML Format:</strong> ಮುದ್ರಿಸಬಹುದಾದ ಮತ್ತು ವೀಕ್ಷಿಸಬಹುದಾದ ಸಿದ್ಧ ಸಾಕ್ಷ್ಯ ವರದಿ.</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-ink-800 text-xs font-medium"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-ivory-50 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>JSON ಡೌನ್‌ಲೋಡ್</span>
              </button>
              <button
                onClick={() => handleExport('html')}
                className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-ink-900 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>HTML ಡೌನ್‌ಲೋಡ್</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START NEW DOCUMENT RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory-50 rounded-2xl max-w-md w-full p-6 border-2 border-red-300 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-800">
              <div className="p-2.5 rounded-lg bg-red-100 border border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-ink-900">
                  ಹೊಸ ದಾಖಲೆ ಪ್ರಾರಂಭಿಸಬೇಕೇ?
                </h3>
                <span className="text-xs text-red-700 font-mono">
                  Confirm Workspace Reset
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans">
              <strong>ಎಚ್ಚರಿಕೆ:</strong> ಹೊಸ ದಾಖಲೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿದರೆ, ಪ್ರಸ್ತುತ ದಾಖಲೆಯ ಚಿತ್ರಗಳು, OCR ಪಠ್ಯ, AI ಸಲಹೆಗಳು ಮತ್ತು ಪರಿಶೀಲನಾ ಇತಿಹಾಸವು ಸಂಪೂರ್ಣವಾಗಿ ತೆರವುಗೊಳ್ಳುತ್ತದೆ.
              ಉಳಿಸಿಕೊಳ್ಳಲು ಬಯಸಿದರೆ ಮೊದಲು "ವರದಿ ರಫ್ತು (Export Report)" ಮಾಡಿ.
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-ink-800 text-xs font-medium"
              >
                ಹಿಂದೆ ಹೋಗಿ (Keep Current Session)
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetSession();
                }}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-ivory-50 text-xs font-semibold shadow-sm"
              >
                ಹೌದು, ತೆರವುಗೊಳಿಸಿ (Reset & Start New)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
