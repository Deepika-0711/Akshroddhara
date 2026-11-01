/**
 * Document Evidence & Recovery Report Generator for Aksharoddhaara
 * 
 * Exports structured JSON and standalone human-readable HTML reports
 * documenting the complete six-layer digital restoration workflow.
 */

import { computeTextDiff } from './diffUtils.js';

export const MANDATORY_DISCLAIMER =
  'ಗಮನಿಸಿ (Preservation Notice): ಅಕ್ಷರೋದ್ಧಾರ ಯೋಜನೆಯು ಡಿಜಿಟಲ್ ಸಂರಕ್ಷಣೆಯ ಸಹಾಯಕ ತಂತ್ರಜ್ಞಾನವಾಗಿದೆ. ಇಲ್ಲಿರುವ OCR ಫಲಿತಾಂಶಗಳು ಮತ್ತು AI ಮರುಪಡೆಯುವಿಕೆ ಸಲಹೆಗಳು ಗಣಕೀಕೃತ ಊಹೆಗಳಾಗಿದ್ದು (algorithmic hypotheses), ದೃಢೀಕೃತ ಐತಿಹಾಸಿಕ ಸತ್ಯಗಳಲ್ಲ. ಮಾನವ-ಸ್ವೀಕೃತ ತಿದ್ದುಪಡಿಗಳು ಬಳಕೆದಾರರ ವಿವೇಚನೆಗೆ ಒಳಪಟ್ಟಿದ್ದು, ಸ್ವತಂತ್ರ ವಿದ್ವಾಂಸರ ಪರಿಶೀಲನೆಗೆ ಪರ್ಯಾಯವಲ್ಲ (OCR output and AI suggestions may contain errors. Accepted corrections are user-reviewed hypotheses and not independently certified historical facts).';

/**
 * Compiles session data into a structured report object.
 */
export const buildReportData = (session) => {
  const diffResult = computeTextDiff(
    session.originalOcrText || '',
    session.workingText || ''
  );

  return {
    project: 'ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)',
    tagline: 'ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ',
    hackathon: 'Kannada Digital Innovation Hackathon 2026',
    generatedAt: new Date().toISOString(),
    displayDate: new Date().toLocaleString('kn-IN', { timeZoneName: 'short' }),
    document: {
      filename: session.file?.name || 'unknown_document',
      sizeBytes: session.file?.size || 0,
      sizeMB: session.file ? parseFloat((session.file.size / (1024 * 1024)).toFixed(2)) : 0,
      dimensions: session.dimensions || null,
      mimeType: session.file?.type || 'image/png',
    },
    restorationPipeline: {
      enhancementApplied: Boolean(session.enhancedResult),
      presetUsed: session.enhancedResult?.presetUsed || session.preset || 'none',
      processingTimeMs: session.enhancedResult?.processingTimeMs || null,
      operationsApplied: session.enhancedResult?.operationsApplied || [],
    },
    ocrExtraction: {
      engine: 'Tesseract.js (kan)',
      language: 'kan',
      sourceUsed: session.ocrSourceUsed || 'original',
      detected: Boolean(session.originalOcrText && session.originalOcrText.length > 0),
      rawOcrText: session.originalOcrText || '',
      characterCount: session.originalOcrText?.length || 0,
    },
    humanReviewAndCorrection: {
      finalWorkingText: session.workingText || '',
      diffStats: diffResult.stats,
      acceptedCorrectionsCount: session.acceptedCorrections?.length || 0,
      rejectedSuggestionsCount: session.rejectedSuggestions?.length || 0,
      totalSessionEventsCount: session.sessionHistory?.length || 0,
    },
    acceptedCorrections: session.acceptedCorrections || [],
    rejectedSuggestions: session.rejectedSuggestions || [],
    sessionAuditTrail: session.sessionHistory || [],
    disclaimer: MANDATORY_DISCLAIMER,
  };
};

/**
 * Downloads data as a file in the browser.
 */
const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates and triggers download of a structured JSON recovery report.
 */
export const exportJsonReport = (session) => {
  const report = buildReportData(session);
  const jsonString = JSON.stringify(report, null, 2);
  const blob = new Blob(['\uFEFF' + jsonString], { type: 'application/json;charset=utf-8' });

  const safeName = (session.file?.name || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  triggerDownload(blob, `aksharoddhaara_report_${safeName}_${timestamp}.json`);
  return report;
};

/**
 * Generates the complete standalone HTML string for the evidence report.
 */
export const generateHtmlReportString = (session) => {
  const report = buildReportData(session);
  const diffResult = computeTextDiff(
    session.originalOcrText || '',
    session.workingText || ''
  );

  const safeName = (session.file?.name || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();

  const diffHtml = diffResult.chunks
    .map((chunk) => {
      if (chunk.type === 'added') {
        return `<span style="background-color: #DCFCE7; color: #166534; font-weight: bold; padding: 2px 4px; border-radius: 4px; border: 1px solid #86EFAC;">${escapeHtml(chunk.value)}</span>`;
      }
      if (chunk.type === 'removed') {
        return `<span style="background-color: #FEE2E2; color: #991B1B; text-decoration: line-through; padding: 2px 4px; border-radius: 4px;">${escapeHtml(chunk.value)}</span>`;
      }
      return escapeHtml(chunk.value);
    })
    .join('');

  const acceptedRows = (report.acceptedCorrections || [])
    .map(
      (c, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #DC2626; text-decoration: line-through;">${escapeHtml(c.originalSnippet)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-weight: bold; color: #15803D;">${escapeHtml(c.replacementText)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 12px; color: #4B5563;">${escapeHtml(c.reason || '—')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 11px; font-family: monospace; color: #6B7280;">${escapeHtml(c.timestamp || '—')}</td>
      </tr>`
    )
    .join('');

  const rejectedRows = (report.rejectedSuggestions || [])
    .map(
      (r, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB;">${escapeHtml(r.originalSnippet || '—')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; color: #9CA3AF; text-decoration: line-through;">${escapeHtml(r.rejectedText)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 12px; color: #6B7280;">${escapeHtml(r.reason || '—')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 11px; font-family: monospace; color: #6B7280;">${escapeHtml(r.timestamp || '—')}</td>
      </tr>`
    )
    .join('');

  const historyRows = (report.sessionAuditTrail || [])
    .map(
      (h) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #F3F4F6; font-family: monospace; font-size: 11px; color: #6B7280;">${escapeHtml(h.displayTime || h.timestamp)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; font-size: 12px; color: #1F2937;">${escapeHtml(h.title)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #F3F4F6; font-size: 12px; color: #4B5563;">${escapeHtml(h.details?.summary || h.details?.replacement || '—')}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="kn">
<head>
  <meta charset="UTF-8">
  <title>ಅಕ್ಷರೋದ್ಧಾರ - ಪುನರುಜ್ಜೀವನ ವರದಿ (${escapeHtml(report.document.filename)})</title>
  <style>
    body { font-family: 'Noto Serif Kannada', 'Segoe UI', serif; background-color: #FAF7F2; color: #1C1917; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #FFFFFF; padding: 40px; border-radius: 12px; border: 1px solid #E2D6C0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h1, h2, h3 { color: #1B4332; }
    .header { border-bottom: 2px solid #C5A059; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; font-size: 13px; }
    .meta-item { background: #FAF6ED; padding: 12px 16px; border-radius: 8px; border: 1px solid #EDE5D5; }
    .card { background: #FAF7F2; border: 1px solid #E2D6C0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
    .disclaimer { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; font-size: 12px; color: #78350F; line-height: 1.6; border-radius: 4px; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #F4EFE6; padding: 10px; font-size: 12px; color: #1B4332; font-weight: 700; border-bottom: 2px solid #C5A059; }
    @media print { body { background: #FFF; padding: 0; } .container { box-shadow: none; border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 style="margin: 0; font-size: 28px;">ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)</h1>
        <p style="margin: 4px 0 0 0; color: #C5A059; font-style: italic;">« ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ » — ದಾಖಲೆ ಪುನರುಜ್ಜೀವನ ವರದಿ</p>
      </div>
      <div style="text-align: right; font-size: 11px; color: #6B7280;">
        <div>ದಿನಾಂಕ: ${escapeHtml(report.displayDate)}</div>
        <div style="font-family: monospace;">Kannada Digital Hackathon 2026</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>ಮೂಲ ಕಡತ (File):</strong> ${escapeHtml(report.document.filename)} (${report.document.sizeMB} MB)</div>
      <div class="meta-item"><strong>ಚಿತ್ರ ಸುಧಾರಣೆ (Enhancement):</strong> ${report.restorationPipeline.enhancementApplied ? 'ಸಕ್ರಿಯ (' + escapeHtml(report.restorationPipeline.presetUsed) + ')' : 'ಅನ್ವಯಿಸಿಲ್ಲ'}</div>
      <div class="meta-item"><strong>OCR ವಿಧಾನ (OCR Engine):</strong> ${escapeHtml(report.ocrExtraction.engine)} (${escapeHtml(report.ocrExtraction.sourceUsed)})</div>
      <div class="meta-item"><strong>ಅಂಗೀಕೃತ ತಿದ್ದುಪಡಿಗಳು (Corrections):</strong> ${report.humanReviewAndCorrection.acceptedCorrectionsCount} ಬದಲಾವಣೆಗಳು</div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; font-size: 16px;">೧. ಮೂಲ OCR ಮತ್ತು ಸಂಪಾದಿತ ಪ್ರತಿಯ ನಡುವಿನ ವ್ಯತ್ಯಾಸ (Text Diff)</h3>
      <div style="background: #FFFFFF; border: 1px solid #E5E7EB; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
        ${diffHtml || 'ಯಾವುದೇ ಪಠ್ಯ ವ್ಯತ್ಯಾಸವಿಲ್ಲ.'}
      </div>
    </div>

    <div class="card">
      <h3 style="margin-top: 0; font-size: 16px;">೨. ಅಂತಿಮವಾಗಿ ದೃಢೀಕರಿಸಿದ ಪಠ್ಯ (Final Working Text)</h3>
      <div style="background: #FFFFFF; border: 1px solid #E5E7EB; padding: 16px; border-radius: 6px; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
        ${escapeHtml(report.humanReviewAndCorrection.finalWorkingText || '(ಪಠ್ಯ ಲಭ್ಯವಿಲ್ಲ)')}
      </div>
    </div>

    ${
      report.acceptedCorrections.length > 0
        ? `
    <div class="card">
      <h3 style="margin-top: 0; font-size: 16px;">೩. ಮಾನವ-ಪರಿಶೀಲಿತ ತಿದ್ದುಪಡಿಗಳ ವಿವರ (Accepted Corrections)</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ಮೂಲ ಅಕ್ಷರ/ಪದ</th>
            <th>ಸ್ವೀಕೃತ ತಿದ್ದುಪಡಿ</th>
            <th>ಸಂಭಾವ್ಯ ಕಾರಣ</th>
            <th>ಸಮಯ</th>
          </tr>
        </thead>
        <tbody>
          ${acceptedRows}
        </tbody>
      </table>
    </div>`
        : ''
    }

    ${
      report.rejectedSuggestions.length > 0
        ? `
    <div class="card">
      <h3 style="margin-top: 0; font-size: 16px;">೪. ತಿರಸ್ಕೃತ ಸಲಹೆಗಳು (Rejected Suggestions)</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ಮೂಲ ಅಕ್ಷರ/ಪದ</th>
            <th>ತಿರಸ್ಕೃತ ಸಲಹೆ</th>
            <th>ಕಾರಣ</th>
            <th>ಸಮಯ</th>
          </tr>
        </thead>
        <tbody>
          ${rejectedRows}
        </tbody>
      </table>
    </div>`
        : ''
    }

    ${
      report.sessionAuditTrail.length > 0
        ? `
    <div class="card">
      <h3 style="margin-top: 0; font-size: 16px;">೫. ಅಧಿವೇಶನ ಪರಿಶೋಧನಾ ಇತಿಹಾಸ (Session Audit Trail)</h3>
      <table>
        <thead>
          <tr>
            <th>ಸಮಯ</th>
            <th>ಕ್ರಿಯೆ (Event)</th>
            <th>ವಿವರ (Details)</th>
          </tr>
        </thead>
        <tbody>
          ${historyRows}
        </tbody>
      </table>
    </div>`
        : ''
    }

    <div class="disclaimer">
      <strong>ಪ್ರಮುಖ ಸಂರಕ್ಷಣಾ ಹೊಣೆಗಾರಿಕೆ ಸೂಚನೆ (Preservation Disclaimer):</strong><br>
      ${escapeHtml(report.disclaimer)}
    </div>
  </div>
</body>
</html>`;

  return { report, html: htmlContent, safeName, timestamp };
};

/**
 * Generates and triggers download of a standalone human-readable HTML evidence report.
 */
export const exportHtmlReport = (session) => {
  const { report, html, safeName, timestamp } = generateHtmlReportString(session);
  const blob = new Blob(['\uFEFF' + html], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `aksharoddhaara_report_${safeName}_${timestamp}.html`);
  return report;
};

const escapeHtml = (str = '') => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
