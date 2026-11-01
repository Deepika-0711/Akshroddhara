import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  RefreshCw,
  Download,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sliders,
  Info,
  Clock,
  Layers,
  FileText,
  Copy,
  Check,
  FileDown,
  RotateCcw,
  BookOpen,
  GitCompare,
} from 'lucide-react';
import ImageComparisonSlider from './ImageComparisonSlider';
import TextRecoveryPanel from './TextRecoveryPanel';
import UnifiedReviewWorkspace from './UnifiedReviewWorkspace';
import {
  validateFileClient,
  enhanceDocumentApi,
  extractOcrApi,
  fetchPresets,
  MAX_FILE_SIZE_MB,
} from '../services/api';
import { createSampleImage } from '../services/sampleImages';

export default function DocumentWorkspace() {
  // Document state
  const [file, setFile] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  // Enhancement options state
  const [preset, setPreset] = useState('balanced');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contrast, setContrast] = useState(0.35);
  const [brightness, setBrightness] = useState(0.05);
  const [denoise, setDenoise] = useState(true);
  const [sharpen, setSharpen] = useState(true);
  const [binarizeMode, setBinarizeMode] = useState('none');

  // Enhancement processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [presetsList, setPresetsList] = useState([]);

  // OCR state
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [originalOcrText, setOriginalOcrText] = useState(''); // Pristine unmodified OCR output
  const [extractedText, setExtractedText] = useState(''); // Working edited copy
  const [ocrError, setOcrError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [ocrSourceUsed, setOcrSourceUsed] = useState(null); // 'enhanced' | 'original'

  // Step 5: Session Audit & Unified Review State
  const [workspaceMode, setWorkspaceMode] = useState('workspace'); // 'workspace' | 'review'
  const [sessionHistory, setSessionHistory] = useState([]);
  const [acceptedCorrections, setAcceptedCorrections] = useState([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState([]);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const fileInputRef = useRef(null);
  const ocrSectionRef = useRef(null);

  // Helper to record structured session events
  const recordSessionEvent = (event) => {
    const newRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString('kn-IN'),
      ...event,
    };
    setSessionHistory((prev) => [newRecord, ...prev]);
  };

  // Fetch presets on mount
  useEffect(() => {
    fetchPresets().then((data) => {
      if (data && data.length > 0) setPresetsList(data);
    });
  }, []);

  // Handle file selection (from file input, drop, or sample)
  const handleFile = (selectedFile) => {
    setErrorMessage(null);
    setEnhancedResult(null);
    setOcrResult(null);
    setOriginalOcrText('');
    setExtractedText('');
    setOcrError(null);

    // Client-side validation
    const validation = validateFileClient(selectedFile);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setFile(selectedFile);

    // Create object URL for preview and read dimensions
    const objectUrl = URL.createObjectURL(selectedFile);
    setOriginalPreview(objectUrl);

    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;

    recordSessionEvent({
      type: 'DOCUMENT_UPLOADED',
      title: 'ಹೊಸ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿದೆ (Document Uploaded)',
      details: {
        filename: selectedFile.name,
        sizeMB: (selectedFile.size / (1024 * 1024)).toFixed(2),
        source: 'user_upload',
      },
    });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Remove current document
  const handleRemoveDocument = () => {
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }
    setFile(null);
    setOriginalPreview(null);
    setDimensions(null);
    setEnhancedResult(null);
    setOcrResult(null);
    setOriginalOcrText('');
    setExtractedText('');
    setErrorMessage(null);
    setOcrError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load sample historical manuscript
  const handleLoadSample = async (sampleType) => {
    try {
      const sample = await createSampleImage(sampleType);
      handleFile(sample.file);
      if (sampleType === 'palm-leaf') {
        setPreset('palm-leaf');
      } else if (sampleType === 'stone-rubbing') {
        setPreset('stone-rubbing');
      } else {
        setPreset('faded-ink');
      }
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setErrorMessage('ಮಾದರಿ ಚಿತ್ರವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    }
  };

  // Execute actual image enhancement
  const handleEnhance = async () => {
    if (!file || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const options = {
        preset,
        contrast: showAdvanced ? contrast : undefined,
        brightness: showAdvanced ? brightness : undefined,
        denoise: showAdvanced ? denoise : undefined,
        sharpen: showAdvanced ? sharpen : undefined,
        binarizeMode: showAdvanced ? binarizeMode : undefined,
      };

      const result = await enhanceDocumentApi(file, options);
      setEnhancedResult(result);

      recordSessionEvent({
        type: 'IMAGE_ENHANCED',
        title: 'ಚಿತ್ರ ಸುಧಾರಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ (Image Enhanced)',
        details: {
          preset: result.presetUsed,
          durationMs: result.processingTimeMs,
          operationsCount: result.operationsApplied?.length || 0,
          source: 'image_processor',
        },
      });
    } catch (error) {
      console.error('Enhancement failed:', error);
      setErrorMessage(
        error.message ||
          'ಚಿತ್ರ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ (Image enhancement failed).'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute genuine Kannada OCR
  const handleRunOcr = async () => {
    if (!file || isOcrRunning) return;

    setIsOcrRunning(true);
    setOcrError(null);

    try {
      let targetFileOrBlob = file;
      let sourceName = 'original';

      // Prefer processing the enhanced image when available
      if (enhancedResult?.enhancedImage) {
        sourceName = 'enhanced';
        // Convert base64 data URI to binary Blob
        const fetchRes = await fetch(enhancedResult.enhancedImage);
        const blob = await fetchRes.blob();
        targetFileOrBlob = new File([blob], `enhanced_${file.name}`, { type: 'image/png' });
      }

      setOcrSourceUsed(sourceName);

      const result = await extractOcrApi(targetFileOrBlob, { language: 'kan' });
      setOcrResult(result);
      setOriginalOcrText(result.text || '');
      setExtractedText(result.text || '');

      recordSessionEvent({
        type: 'OCR_COMPLETED',
        title: 'ಕನ್ನಡ OCR ಪಠ್ಯ ಹೊರತೆಗೆಯಲಾಗಿದೆ (OCR Completed)',
        details: {
          charCount: result.text?.length || 0,
          sourceUsed: sourceName,
          durationMs: result.durationMs,
          source: 'ocr_engine',
        },
      });

      // Smooth scroll to OCR output section
      setTimeout(() => {
        if (ocrSectionRef.current) {
          ocrSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('OCR Extraction failed:', error);
      setOcrError(
        error.message ||
          'ಕನ್ನಡ ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
      );
    } finally {
      setIsOcrRunning(false);
    }
  };

  // Download enhanced image
  const handleDownloadImage = () => {
    if (!enhancedResult?.enhancedImage) return;

    const link = document.createElement('a');
    link.href = enhancedResult.enhancedImage;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    link.download = `enhanced_${baseName}_aksharoddhaara.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy extracted Kannada text
  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.warn('Clipboard write failed, fallback:', err);
    }
  };

  // Download extracted text as UTF-8 .txt
  const handleDownloadText = () => {
    if (!extractedText) return;
    // Prefix with UTF-8 BOM (\uFEFF) to guarantee exact Unicode rendering across Windows Notepad & editors
    const blob = new Blob(['\uFEFF' + extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'kannada_document';
    link.href = url;
    link.download = `kannada_text_${baseName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handlers for Step 5 Review and Recovery Audit
  const handleAcceptCorrection = (correction) => {
    setAcceptedCorrections((prev) => [correction, ...prev]);
    recordSessionEvent({
      type: 'SUGGESTION_ACCEPTED',
      title: 'AI ಮರುಪಡೆಯುವಿಕೆ ಸಲಹೆ ಸ್ವೀಕೃತ (Suggestion Accepted)',
      details: {
        originalSnippet: correction.originalSnippet,
        replacement: correction.replacementText,
        reason: correction.reason,
        source: 'ai_suggestion',
      },
    });
  };

  const handleRejectSuggestion = (rejection) => {
    setRejectedSuggestions((prev) => [rejection, ...prev]);
    recordSessionEvent({
      type: 'SUGGESTION_REJECTED',
      title: 'AI ಸಲಹೆ ತಿರಸ್ಕೃತ (Suggestion Rejected)',
      details: {
        originalSnippet: rejection.originalSnippet,
        rejectedText: rejection.rejectedText,
        reason: rejection.reason,
        source: 'user_action',
      },
    });
  };

  const handleRequestSuggestions = (reqData) => {
    recordSessionEvent({
      type: 'SUGGESTION_REQUESTED',
      title: 'ಅಸ್ಪಷ್ಟ ಪಠ್ಯಕ್ಕೆ ಸಲಹೆ ಕೋರಲಾಗಿದೆ (Suggestions Requested)',
      details: {
        selectedText: reqData.selectedText,
        damageNote: reqData.damageNote,
        source: 'user_action',
      },
    });
  };

  const handleManualEdit = () => {
    recordSessionEvent({
      type: 'MANUAL_EDIT',
      title: 'ಬಳಕೆದಾರರಿಂದ ಪಠ್ಯ ತಿದ್ದುಪಡಿ (Manual Working Text Edit)',
      details: {
        summary: 'ಬಳಕೆದಾರರು ಕಾರ್ಯಪ್ರತಿಯನ್ನು ನೇರವಾಗಿ ಸಂಪಾದಿಸಿದ್ದಾರೆ',
        source: 'manual_user_edit',
      },
    });
  };

  // Complete clean reset of current document session
  const executeResetSession = () => {
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
    }
    setFile(null);
    setOriginalPreview(null);
    setDimensions(null);
    setEnhancedResult(null);
    setOcrResult(null);
    setOriginalOcrText('');
    setExtractedText('');
    setErrorMessage(null);
    setOcrError(null);
    setSessionHistory([]);
    setAcceptedCorrections([]);
    setRejectedSuggestions([]);
    setWorkspaceMode('workspace');
    setResetConfirmOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header & Mode Navigation Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ivory-300 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold tracking-wider uppercase font-serif">
            <span>ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)</span>
            <span>•</span>
            <span>ಕನ್ನಡ ಡಿಜಿಟಲ್ ನಾವೀನ್ಯತಾ ಹ್ಯಾಕಥಾನ್ ೨೦೨೬</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900">
            {workspaceMode === 'workspace'
              ? 'ದಾಖಲೆ ಸುಧಾರಣಾ & ಅಕ್ಷರ ಗುರುತಿಸುವಿಕಾ ಕಾರ್ಯಕ್ಷೇತ್ರ'
              : 'ಏಕೀಕೃತ ದಾಖಲೆ ಪರಿಶೀಲನಾ ಕಾರ್ಯಕ್ಷೇತ್ರ'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-2xl leading-relaxed">
            {workspaceMode === 'workspace'
              ? 'ಹಸ್ತಪ್ರತಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಗಣಿತೀಯ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ಮೂಲಕ ಸ್ಪಷ್ಟತೆ ಹೆಚ್ಚಿಸಿ, ನಂತರ ಕನ್ನಡ OCR ಹಾಗೂ AI ಮರುಪಡೆಯುವಿಕೆಯನ್ನು ಚಲಾಯಿಸಿ.'
              : 'ಮೂಲ ಆಕರ, ಸುಧಾರಿತ ಚಿತ್ರ, ಮೂಲ OCR ಪಠ್ಯ ಮತ್ತು ನೀವು ಪರಿಶೀಲಿಸಿದ ತಿದ್ದುಪಡಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ತುಲನೆ ಮಾಡಿ ವರದಿ ರಫ್ತು ಮಾಡಿ.'}
          </p>
        </div>

        {/* View Mode Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex p-1 bg-ivory-200 rounded-xl border border-ivory-300 text-xs font-medium">
            <button
              onClick={() => setWorkspaceMode('workspace')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                workspaceMode === 'workspace'
                  ? 'bg-forest-700 text-ivory-50 shadow-sm font-semibold'
                  : 'text-ink-700 hover:bg-ivory-300'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ಕಾರ್ಯಕ್ಷೇತ್ರ (Workspace)</span>
            </button>

            <button
              onClick={() => setWorkspaceMode('review')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                workspaceMode === 'review'
                  ? 'bg-forest-700 text-ivory-50 shadow-sm font-semibold'
                  : 'text-ink-700 hover:bg-ivory-300'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>ಏಕೀಕೃತ ಪರಿಶೀಲನೆ (Review & Report)</span>
              {acceptedCorrections.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gold-400 text-ink-900 font-bold text-[10px]">
                  {acceptedCorrections.length}
                </span>
              )}
            </button>
          </div>

          {file && (
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-ivory-200 hover:bg-red-50 text-red-800 border border-ivory-300 hover:border-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Start New Document"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ಹೊಸ ದಾಖಲೆ (New)</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Workspace Mode OR Unified Review Mode */}
      {workspaceMode === 'review' ? (
        <UnifiedReviewWorkspace
          session={{
            file,
            originalPreview,
            dimensions,
            preset,
            enhancedResult,
            originalOcrText,
            workingText: extractedText,
            ocrSourceUsed,
            acceptedCorrections,
            rejectedSuggestions,
            sessionHistory,
            recordSessionEvent,
          }}
          onResetSession={() => setResetConfirmOpen(true)}
          onSwitchToWorkspace={() => setWorkspaceMode('workspace')}
        />
      ) : (
        /* Standard Restoration & OCR Workspace */
        <div className="space-y-12">
          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Enhancement Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upload Card */}
          <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-forest-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-gold-600" />
                <span>ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ (Upload)</span>
              </h3>
              {file && (
                <button
                  onClick={handleRemoveDocument}
                  className="text-xs text-red-700 hover:text-red-900 flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                  title="Remove Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ತೆರವುಗೊಳಿಸಿ (Remove)</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Dropzone */}
            {!file ? (
              <div>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-forest-600 bg-forest-50/80 scale-[1.01]'
                      : 'border-ivory-400 hover:border-gold-500 bg-ivory-100/60 hover:bg-ivory-200/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-14 h-14 mx-auto rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mb-3">
                    <FileImage className="w-7 h-7" />
                  </div>
                  <p className="font-medium text-ink-900 text-sm mb-1">
                    ಚಿತ್ರವನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ (Drag & drop here)
                  </p>
                  <p className="text-xs text-ink-500 mb-3">
                    ಅಥವಾ ನಿಮ್ಮ ಸಾಧನದಿಂದ ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ (or browse files)
                  </p>
                  <div className="inline-block px-3 py-1 rounded bg-ivory-300/80 text-[11px] text-ink-600 font-mono">
                    PNG, JPG, JPEG, WEBP (ಗರಿಷ್ಠ {MAX_FILE_SIZE_MB} MB)
                  </div>
                </div>

                {/* Built-in Historical Samples */}
                <div className="mt-5 pt-4 border-t border-ivory-300">
                  <div className="text-xs font-semibold text-ink-700 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                    <span>ತ್ವರಿತ ಪರೀಕ್ಷೆಗೆ ಮಾದರಿ ದಾಖಲೆಗಳು (Quick Samples):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => handleLoadSample('palm-leaf')}
                      className="px-2.5 py-2 rounded-lg bg-ivory-200 hover:bg-gold-100/70 border border-ivory-300 text-left transition-colors font-medium text-ink-800"
                    >
                      <div className="text-[11px] font-bold text-forest-800">ತಾಳೆಗರಿ ಪತ್ರ</div>
                      <div className="text-[10px] text-ink-500">Palm-Leaf Folio</div>
                    </button>
                    <button
                      onClick={() => handleLoadSample('stone-rubbing')}
                      className="px-2.5 py-2 rounded-lg bg-ivory-200 hover:bg-gold-100/70 border border-ivory-300 text-left transition-colors font-medium text-ink-800"
                    >
                      <div className="text-[11px] font-bold text-forest-800">ಶಿಲಾಶಾಸನ ಛಾಪು</div>
                      <div className="text-[10px] text-ink-500">Stone Rubbing</div>
                    </button>
                    <button
                      onClick={() => handleLoadSample('faded-paper')}
                      className="px-2.5 py-2 rounded-lg bg-ivory-200 hover:bg-gold-100/70 border border-ivory-300 text-left transition-colors font-medium text-ink-800"
                    >
                      <div className="text-[11px] font-bold text-forest-800">ಹಳೆಯ ಮುದ್ರಣ</div>
                      <div className="text-[10px] text-ink-500">1892 Aged Print</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Selected Document Info */
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-ivory-200/80 border border-ivory-300">
                  <div className="w-12 h-12 rounded bg-ivory-300 flex items-center justify-center shrink-0 overflow-hidden border border-ivory-400">
                    <img
                      src={originalPreview}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden flex-1 text-xs space-y-1">
                    <div className="font-semibold text-ink-900 truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-ink-600 flex flex-wrap gap-2 font-mono text-[11px]">
                      <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      {dimensions && (
                        <span>
                          • {dimensions.width} × {dimensions.height} px
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-forest-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">ಸೂಚನೆ (Notice):</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}
          </div>

          {/* Enhancement Configuration Card */}
          <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-ivory-300 pb-3">
              <h3 className="font-serif text-lg font-bold text-forest-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gold-600" />
                <span>ಸುಧಾರಣಾ ವಿಧಾನ (Enhancement Preset)</span>
              </h3>
            </div>

            {/* Presets Radio Options */}
            <div className="space-y-2.5 text-xs">
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  preset === 'balanced'
                    ? 'border-forest-600 bg-forest-50/60'
                    : 'border-ivory-300 hover:bg-ivory-100'
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  value="balanced"
                  checked={preset === 'balanced'}
                  onChange={(e) => setPreset(e.target.value)}
                  className="mt-0.5 text-forest-700 focus:ring-forest-600"
                />
                <div>
                  <div className="font-bold text-ink-900">
                    ಸಮತೋಲಿತ ಸುಧಾರಣೆ (Balanced Restoration - ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)
                  </div>
                  <div className="text-ink-600 mt-0.5">
                    ಗ್ರೇಸ್ಕೇಲ್, ಕಾಂಟ್ರಾಸ್ಟ್ ವಿಸ್ತರಣೆ ಮತ್ತು ಅಂಚುಗಳ ತೀಕ್ಷ್ಣಗೊಳಿಸುವಿಕೆ (General aged documents).
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  preset === 'palm-leaf'
                    ? 'border-forest-600 bg-forest-50/60'
                    : 'border-ivory-300 hover:bg-ivory-100'
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  value="palm-leaf"
                  checked={preset === 'palm-leaf'}
                  onChange={(e) => setPreset(e.target.value)}
                  className="mt-0.5 text-forest-700 focus:ring-forest-600"
                />
                <div>
                  <div className="font-bold text-ink-900">
                    ತಾಳೆಗರಿ ಕ್ರಮ (Palm-Leaf / ತಾಳೆಗರಿ Mode)
                  </div>
                  <div className="text-ink-600 mt-0.5">
                    ಕಂದು ಬಣ್ಣದ ಹಿನ್ನೆಲೆಯನ್ನು ನಿವಾರಿಸಿ ಅಕ್ಷರಗಳ ಕೊರೆತದ ಗೆರೆಗಳನ್ನು ಸ್ಪಷ್ಟಗೊಳಿಸುವ ಸ್ಥಳೀಯ ಅಡಾಪ್ಟಿವ್ ಥ್ರೆಶ್‌ಹೋಲ್ಡಿಂಗ್.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  preset === 'stone-rubbing'
                    ? 'border-forest-600 bg-forest-50/60'
                    : 'border-ivory-300 hover:bg-ivory-100'
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  value="stone-rubbing"
                  checked={preset === 'stone-rubbing'}
                  onChange={(e) => setPreset(e.target.value)}
                  className="mt-0.5 text-forest-700 focus:ring-forest-600"
                />
                <div>
                  <div className="font-bold text-ink-900">
                    ಶಿಲಾಶಾಸನ ಛಾಪು (Stone Inscription Estampage)
                  </div>
                  <div className="text-ink-600 mt-0.5">
                    ಕಲ್ಲಿನ ಒರಟು ಮೇಲ್ಮೈಯನ್ನು ಮರೆಮಾಚಿ ಕಪ್ಪು ಮಸಿ ಹಾಗೂ ಬಿಳಿ ಕಾಗದದ ವ್ಯತ್ಯಾಸ ಹೆಚ್ಚಿಸುವ ಒಟ್ಸು ಬೈನರೈಸೇಶನ್.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  preset === 'faded-ink'
                    ? 'border-forest-600 bg-forest-50/60'
                    : 'border-ivory-300 hover:bg-ivory-100'
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  value="faded-ink"
                  checked={preset === 'faded-ink'}
                  onChange={(e) => setPreset(e.target.value)}
                  className="mt-0.5 text-forest-700 focus:ring-forest-600"
                />
                <div>
                  <div className="font-bold text-ink-900">
                    ಅಳಿಸಿಹೋದ ಶಾಯಿ ಪುನಶ್ಚೇತನ (Faded Ink Recovery)
                  </div>
                  <div className="text-ink-600 mt-0.5">
                    ನೀರು ಅಥವಾ ಬೆಳಕಿನಿಂದ ಮಂಕಾಗಿರುವ ಶಾಯಿಯ ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಕುರುಹುಗಳನ್ನು ಹಿಡಿದಿಡುತ್ತದೆ.
                  </div>
                </div>
              </label>
            </div>

            {/* Toggle Advanced Fine Tuning */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>
                  {showAdvanced
                    ? '▼ ಸೂಕ್ಷ್ಮ ನಿಯಂತ್ರಣಗಳನ್ನು ಮರೆಮಾಡಿ'
                    : '▶ ಹಸ್ತಚಾಲಿತ ಸೂಕ್ಷ್ಮ ನಿಯಂತ್ರಣಗಳು (Manual Fine-Tuning)'}
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 rounded-lg bg-ivory-200/70 border border-ivory-300 space-y-4 text-xs">
                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-medium text-ink-800">
                      <span>ಕಾಂಟ್ರಾಸ್ಟ್ (Contrast):</span>
                      <span className="font-mono">{contrast.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-0.5"
                      max="0.8"
                      step="0.05"
                      value={contrast}
                      onChange={(e) => setContrast(parseFloat(e.target.value))}
                      className="w-full accent-forest-700"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-medium text-ink-800">
                      <span>ಪ್ರಕಾಶತೆ (Brightness):</span>
                      <span className="font-mono">{brightness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="-0.3"
                      max="0.4"
                      step="0.05"
                      value={brightness}
                      onChange={(e) => setBrightness(parseFloat(e.target.value))}
                      className="w-full accent-forest-700"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-800">
                      <input
                        type="checkbox"
                        checked={denoise}
                        onChange={(e) => setDenoise(e.target.checked)}
                        className="rounded text-forest-700"
                      />
                      <span>ಗಾಸಿಯನ್ ನಾಯ್ಸ್ ನಿವಾರಣೆ (Denoise)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-ink-800">
                      <input
                        type="checkbox"
                        checked={sharpen}
                        onChange={(e) => setSharpen(e.target.checked)}
                        className="rounded text-forest-700"
                      />
                      <span>ಅಕ್ಷರ ಅಂಚುಗಳ ಚೂಪಾಗಿಸುವಿಕೆ (Sharpen)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-3">
              {/* Image Enhancement Button */}
              <button
                onClick={handleEnhance}
                disabled={!file || isProcessing}
                className={`w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  !file || isProcessing
                    ? 'bg-ivory-300 text-ink-400 cursor-not-allowed border border-ivory-300'
                    : 'bg-forest-700 hover:bg-forest-800 text-ivory-50 border border-forest-800 shadow-parchment hover:shadow-parchment-lg'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gold-300" />
                    <span>ಗಣಿತೀಯ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ... (Processing Image)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold-300" />
                    <span>ದಾಖಲೆ ಸುಧಾರಿಸಿ (Enhance Document)</span>
                  </>
                )}
              </button>

              {/* Working Genuine Kannada OCR Action Button */}
              <button
                onClick={handleRunOcr}
                disabled={!file || isOcrRunning}
                className={`w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  !file || isOcrRunning
                    ? 'border border-ivory-300 text-ink-400 cursor-not-allowed bg-ivory-200/50'
                    : 'bg-gold-500 hover:bg-gold-600 text-ink-900 border border-gold-600 shadow-sm font-semibold'
                }`}
              >
                {isOcrRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-ink-900" />
                    <span>ಕನ್ನಡ OCR ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ... (Running OCR)</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-ink-900" />
                    <span>
                      {enhancedResult
                        ? 'ಸುಧಾರಿತ ಚಿತ್ರದಿಂದ ಅಕ್ಷರ ಹೊರತೆಗೆಯಿರಿ (Extract Kannada OCR)'
                        : 'ಕನ್ನಡ ಅಕ್ಷರ ಹೊರತೆಗೆಯಿರಿ (Extract Kannada Text)'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison Viewer & Results */}
        <div className="lg:col-span-7 space-y-6">
          {enhancedResult ? (
            /* Results Panel */
            <div className="space-y-4">
              {/* Image Comparison Slider */}
              <ImageComparisonSlider
                originalUrl={originalPreview}
                enhancedUrl={enhancedResult.enhancedImage}
                originalFilename={file?.name}
              />

              {/* Enhancement Metadata & Action Bar */}
              <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="font-serif font-bold text-forest-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-forest-600" />
                    <span>ಸುಧಾರಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ (Enhancement Complete)</span>
                  </div>
                  <div className="text-ink-600 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold-600" />
                      {enhancedResult.processingTimeMs} ms
                    </span>
                    <span>
                      • {enhancedResult.dimensions?.width} × {enhancedResult.dimensions?.height} px
                    </span>
                    <span>• {enhancedResult.operationsApplied?.length || 0} ಗಣಿತೀಯ ಕ್ರಿಯೆಗಳು</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadImage}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-ivory-50 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all border border-forest-800"
                  >
                    <Download className="w-4 h-4 text-gold-300" />
                    <span>ಚಿತ್ರ ಡೌನ್‌ಲೋಡ್</span>
                  </button>

                  <button
                    onClick={handleRunOcr}
                    disabled={isOcrRunning}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-ink-900 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all border border-gold-600"
                  >
                    {isOcrRunning ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-ink-900" />
                    ) : (
                      <FileText className="w-4 h-4 text-ink-900" />
                    )}
                    <span>OCR ಪಠ್ಯ ಹೊರತೆಗೆ</span>
                  </button>
                </div>
              </div>

              {/* Physical Limitation Disclaimer */}
              <div className="p-4 rounded-xl bg-ivory-200/70 border border-ivory-300 text-xs text-ink-700 flex items-start gap-3">
                <Info className="w-5 h-5 text-forest-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-ink-900">
                    ಸಂರಕ್ಷಣಾ ಮಿತಿ ಸೂಚನೆ (Preservation Scope):
                  </span>
                  <p className="leading-relaxed">
                    ಈ ಇಮೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್ ತಂತ್ರಜ್ಞಾನವು ಕಾಗದ ಅಥವಾ ತಾಳೆಗರಿಯ ಮೇಲಿರುವ ಮಸುಕಾದ ಮಸಿಯ ಕುರುಹುಗಳ ವ್ಯತ್ಯಾಸವನ್ನು (contrast) ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಿಸುತ್ತದೆ.
                    ಆದರೆ ಭೌತಿಕವಾಗಿ ಸಂಪೂರ್ಣ ಹರಿದುಹೋದ ಅಥವಾ ಸುಟ್ಟುಹೋದ ಭಾಗಗಳ ಮಾಹಿತಿಯನ್ನು ಯಾವುದೇ ಇಮೇಜ್ ಫಿಲ್ಟರ್‌ನಿಂದ ಮರಳಿ ಸೃಷ್ಟಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.
                  </p>
                </div>
              </div>
            </div>
          ) : originalPreview ? (
            /* Uploaded Preview before Enhancement */
            <div className="bg-ivory-50 rounded-xl border border-ivory-300 shadow-parchment p-6 flex flex-col items-center justify-center min-h-[440px] text-center space-y-4">
              <div className="w-full max-h-[380px] overflow-hidden rounded-lg border border-ivory-300 bg-parchment flex items-center justify-center p-3">
                <img
                  src={originalPreview}
                  alt="Original Document Preview"
                  className="max-h-[360px] w-auto object-contain rounded shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-serif font-bold text-ink-900 text-sm">
                    ಮೂಲ ದಾಖಲೆ ಸಿದ್ಧವಾಗಿದೆ (Original Document Ready)
                  </h4>
                  <p className="text-xs text-ink-600 max-w-md mt-1">
                    ಮೊದಲು "ದಾಖಲೆ ಸುಧಾರಿಸಿ" ಗುಂಡಿ ಒತ್ತಿ ಅಕ್ಷರಗಳ ಸ್ಪಷ್ಟತೆ ಹೆಚ್ಚಿಸಬಹುದು, ಅಥವಾ ನೇರವಾಗಿ OCR ಮೂಲಕ ಅಕ್ಷರಗಳನ್ನು ಹೊರತೆಗೆಯಬಹುದು.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleEnhance}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-ivory-50 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                    <span>ದಾಖಲೆ ಸುಧಾರಿಸಿ</span>
                  </button>
                  <button
                    onClick={handleRunOcr}
                    disabled={isOcrRunning}
                    className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-ink-900 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ನೇರ OCR ಚಾಲನೆ</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-ivory-50/80 rounded-xl border border-dashed border-ivory-300 p-12 flex flex-col items-center justify-center min-h-[440px] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-ivory-200 flex items-center justify-center text-ink-400">
                <Layers className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-serif font-bold text-ink-800 text-base">
                  ದಾಖಲೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ (Awaiting Document)
                </h4>
                <p className="text-xs text-ink-600 leading-relaxed">
                  ಎಡಭಾಗದಲ್ಲಿ ನಿಮ್ಮ ಹಳೆಯ ಕನ್ನಡ ಹಸ್ತಪ್ರತಿ ಅಥವಾ ಶಾಸನದ ಚಿತ್ರವನ್ನು ಸೇರಿಸಿ, ಅಥವಾ ತ್ವರಿತ ಪರೀಕ್ಷೆಗಾಗಿ ಮಾದರಿ ಹಸ್ತಪ್ರತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OCR Error Notification */}
      {ocrError && (
        <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">OCR ಪ್ರಕ್ರಿಯಾ ದೋಷ (OCR Error):</span>
            <p>{ocrError}</p>
          </div>
        </div>
      )}

      {/* OCR Text Extraction Results Section */}
      {ocrResult && (
        <div
          ref={ocrSectionRef}
          className="mt-12 bg-ivory-50 rounded-2xl border-2 border-gold-400/80 shadow-parchment-lg overflow-hidden transition-all duration-300"
        >
          {/* OCR Header Bar */}
          <div className="px-6 py-4 bg-forest-800 text-ivory-100 flex flex-wrap items-center justify-between gap-4 border-b border-gold-500/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-forest-900 border border-gold-400/60 flex items-center justify-center text-gold-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gold-300 flex items-center gap-2">
                  <span>ಹೊರತೆಗೆಯಲಾದ ಕನ್ನಡ ಪಠ್ಯ (Extracted Kannada Text)</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-ivory-300 font-mono">
                  <span>ಮಾದರಿ: Tesseract.js (kan)</span>
                  <span>•</span>
                  <span>
                    ಮೂಲ:{' '}
                    {ocrSourceUsed === 'enhanced'
                      ? 'ಸುಧಾರಿತ ಪ್ರತಿ (Enhanced Image)'
                      : 'ಮೂಲ ಪ್ರತಿ (Original Image)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats and Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block text-xs font-mono text-gold-200/90 pr-2">
                <div>{extractedText.length} ಅಕ್ಷರಗಳು (Characters)</div>
                <div className="text-[11px] text-ivory-400">
                  {ocrResult.durationMs ? `${ocrResult.durationMs} ms` : ''}
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyText}
                disabled={!extractedText}
                className="px-3.5 py-2 rounded-lg bg-forest-700 hover:bg-forest-600 text-gold-200 border border-gold-400/40 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                title="Copy Text to Clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-300" />
                    <span>ನಕಲಿಸಲಾಗಿದೆ! (Copied)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gold-300" />
                    <span>ಪಠ್ಯ ನಕಲಿಸಿ (Copy)</span>
                  </>
                )}
              </button>

              {/* Download .txt Button */}
              <button
                onClick={handleDownloadText}
                disabled={!extractedText}
                className="px-3.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-ink-900 border border-gold-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                title="Download as UTF-8 text file"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>ಡೌನ್‌ಲೋಡ್ .txt (Download)</span>
              </button>
            </div>
          </div>

          {/* OCR Content Area */}
          <div className="p-6 bg-parchment space-y-6">
            {ocrResult.detected && extractedText.length > 0 ? (
              /* Text Recovery & Investigation Panel */
              <TextRecoveryPanel
                originalOcrText={originalOcrText}
                workingText={extractedText}
                setWorkingText={setExtractedText}
                previewImage={enhancedResult?.enhancedImage || originalPreview}
                acceptedCorrections={acceptedCorrections}
                onAcceptCorrection={handleAcceptCorrection}
                onRejectSuggestion={handleRejectSuggestion}
                onRequestSuggestions={handleRequestSuggestions}
                onManualEdit={handleManualEdit}
              />
            ) : (
              /* No Text Detected Notice */
              <div className="p-8 text-center rounded-xl bg-ivory-100 border border-ivory-300 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-ink-900 text-base">
                  ಯಾವುದೇ ಸ್ಪಷ್ಟ ಪಠ್ಯ ಪತ್ತೆಯಾಗಿಲ್ಲ (No Clear Text Detected)
                </h4>
                <p className="text-xs text-ink-600 max-w-md mx-auto leading-relaxed">
                  ಈ ಚಿತ್ರದಲ್ಲಿ ಗುರುತಿಸಬಹುದಾದ ಕನ್ನಡ ಅಕ್ಷರಗಳು ಗೋಚರಿಸಲಿಲ್ಲ. ಕಾಂಟ್ರಾಸ್ಟ್ ಕಡಿಮೆ ಇದ್ದರೆ, ದಯವಿಟ್ಟು ಎಡಭಾಗದಲ್ಲಿ "ತಾಳೆಗರಿ ಕ್ರಮ" ಅಥವಾ "ಸಮತೋಲಿತ ಸುಧಾರಣೆ" ಬಳಸಿ ಚಿತ್ರವನ್ನು ಮೊದಲು ಸುಧಾರಿಸಿ, ನಂತರ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.
                </p>
                <button
                  onClick={handleEnhance}
                  className="mt-2 px-4 py-2 rounded-lg bg-forest-700 text-ivory-50 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-300" />
                  <span>ಚಿತ್ರ ಸುಧಾರಿಸಿ (Enhance Image)</span>
                </button>
              </div>
            )}

            {/* Honest Scientific & Preservation Disclaimer */}
            <div className="p-4 rounded-xl bg-ivory-200/80 border border-gold-300/60 text-xs text-ink-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-forest-900">
                <BookOpen className="w-4 h-4 text-gold-700" />
                <span>ಪ್ರಾಮಾಣಿಕತೆ ಮತ್ತು ಸಂರಕ್ಷಣಾ ಹೊಣೆಗಾರಿಕೆ (Honest Preservation Notice):</span>
              </div>
              <p className="leading-relaxed font-sans">
                ಇಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾದ ಪಠ್ಯವು Tesseract.js ಕನ್ನಡ ಭಾಷಾ ಮಾದರಿಯ ಮೂಲಕ ಚಿತ್ರದಲ್ಲಿ ಲಭ್ಯವಿರುವ ಪಿಕ್ಸೆಲ್‌ಗಳಿಂದ ನೇರವಾಗಿ ಹೊರತೆಗೆಯಲಾದ ನಿಜವಾದ ಫಲಿತಾಂಶವಾಗಿದೆ.
                ಹಳೆಯ ಹಸ್ತಪ್ರತಿಗಳಲ್ಲಿ ಅಕ್ಷರಗಳು ಸವೆದುಹೋಗಿದ್ದರೆ, ಮಸಿಯು ಚೆಲ್ಲಿದ್ದರೆ ಅಥವಾ ವಿಶಿಷ್ಟ ಪ್ರಾಚೀನ ಲಿಪಿಯಾಗಿದ್ದರೆ OCR ಅಕ್ಷರಗಳನ್ನು ತಪ್ಪಾಗಿ ಗುರುತಿಸಬಹುದು.
                ಅಕ್ಷರೋದ್ಧಾರವು ಎಂದಿಗೂ ಊಹಾತ್ಮಕ ಅಥವಾ ಕೃತಕ ಅಕ್ಷರಗಳನ್ನು ತಾನಾಗಿಯೇ ಸೃಷ್ಟಿಸುವುದಿಲ್ಲ.
              </p>
              <p className="text-[11px] text-ink-500 italic font-sans">
                OCR extracts its algorithmic interpretation of visible glyphs. It does not magically invent physically missing letters, nor should its output be considered verified historical truth without scholarly inspection.
              </p>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Start New Document Reset Confirmation Modal */}
      {resetConfirmOpen && (
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
              ಉಳಿಸಿಕೊಳ್ಳಲು ಬಯಸಿದರೆ ಮೊದಲು "ಏಕೀಕೃತ ಪರಿಶೀಲನೆ (Review & Report)" ತೆರೆದು ವರದಿ ರಫ್ತು ಮಾಡಿ.
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-ink-800 text-xs font-medium"
              >
                ಹಿಂದೆ ಹೋಗಿ (Keep Current Session)
              </button>
              <button
                onClick={executeResetSession}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-ivory-50 text-xs font-semibold shadow-sm"
              >
                ಹೌದು, ತೆರವುಗೊಳಿಸಿ (Reset & Start New)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
