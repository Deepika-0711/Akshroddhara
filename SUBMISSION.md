# ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara) — Hackathon Submission

### *« ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ »*
**Tagline:** Every Faded Letter Holds a Story.  
**Hackathon:** Kannada Digital Innovation Hackathon 2026  
**Project Repository:** Aksharoddhaara  

---

## 1. Executive Summary

Karnataka possesses an extraordinary epigraphical and literary heritage spanning over fifteen centuries—from Kadamba and Western Ganga copper plates, 9th-century Badami and Shravanabelagola stone inscriptions, to thousands of medieval palm-leaf (*ತಾಳೆಗರಿ*) manuscripts housed in oriental research institutes, mutts, and private archives.

Due to physical decay, iron-gall and natural ink oxidation, insect grooving, surface abrasion, and paper acidification, thousands of historical documents are becoming illegible. 

**Aksharoddhaara (ಅಕ್ಷರೋದ್ಧಾರ)** is a digital preservation platform designed to assist conservators, epigraphists, researchers, and students in restoring character legibility in deteriorated Kannada records. Built with a strict **Six-Layer Digital Preservation Architecture**, the system ensures non-destructive image enhancement, authentic offline-first Kannada OCR, damage-aware paleographical recovery hypotheses, human-in-the-loop verification, and tamper-evident audit trails.

---

## 2. Six-Layer Digital Preservation Architecture

In digital heritage preservation, algorithmic alterations must never be conflated with physical source material. Aksharoddhaara enforces a strict separation across six distinct layers:

| Layer | Component | Mutability | Function & Integrity Guarantee |
| :--- | :--- | :--- | :--- |
| **Layer 1** | **Original Document** | Read-Only | Untouched uploaded file buffer preserved in pristine state. |
| **Layer 2** | **Enhanced Image** | Derived | Non-destructive pixel-level enhancement (PNG buffer). |
| **Layer 3** | **Pristine OCR Output** | Read-Only | Raw machine output returned by Tesseract.js (`kan`). |
| **Layer 4** | **Working Edited Text** | Mutable | Human scholar working copy with live token-level diff tracking. |
| **Layer 5** | **Recovery Hypotheses** | Transient | Paleographical alternatives with reasons; labeled `⚠️ Unverified suggestion`. |
| **Layer 6** | **Accepted Corrections** | Append-Only | Immutable audit log capturing all human-confirmed replacements. |

---

## 3. Implemented Features & Technical Scope

### 3.1 Document Workspace & Ingestion Pipeline
- **Formats Supported**: PNG, JPG, JPEG, and WEBP.
- **Validation**: Client-side and server-side validation enforcing a strict 10 MB maximum payload limit and MIME-type restrictions with dual Kannada and English feedback.
- **Metadata Extraction**: Computes and displays filename, MIME type, file size in megabytes, and natural pixel dimensions ($W \times H$).
- **Built-in Historical Manuscripts**: Procedurally generated test manuscripts for immediate testing:
  1. *Palm-Leaf Folio (ತಾಳೆಗರಿ ಹಸ್ತಪ್ರತಿ)*: Simulates fibrous brown palm leaf with incised Halegannada verse.
  2. *Stone Inscription Rubbing (ಶಿಲಾಶಾಸನ ಛಾಪು)*: Simulates Kadamba-era paper impression with charcoal texture and surface grain.
  3. *1892 Aged Paper Print*: Simulates paper yellowing, water damage rings, and faded lithographic typography.

### 3.2 Pure JavaScript Image Enhancement Engine (`POST /api/enhance`)
- **Zero Python Dependencies**: Powered by Jimp in pure JavaScript; runs cross-platform without external binary runtimes.
- **Mathematical Processing Pipeline**:
  - *Grayscale Conversion*: Eliminates age-induced chromatic staining and paper yellowing.
  - *Dynamic Contrast & Brightness Stretching*: Restores dynamic range to low-contrast stylus grooves.
  - *Gaussian Noise Reduction*: Attenuates background grain without smoothing character curve contours (ವ, ಮ, ರ, ಣ, ಳ).
  - *Unsharp Mask Convolution*: $3 \times 3$ spatial matrix kernel sharpening eroded Kannada ligatures and *vattu* marks.
  - *Global Otsu Binarization*: Optimal variance thresholding for stone rubbing estampages.
  - *Bradley-Roth Local Adaptive Thresholding*: Fast integral-image sliding-window thresholding resolving non-uniform lighting across palm-leaf folios.
- **Heritage Presets**: `balanced`, `palm-leaf`, `stone-rubbing`, `faded-ink`, and `high-contrast`.
- **Interactive Visual Comparison**:
  - Draggable split-slider divider.
  - Side-by-side synchronized view.
  - Enhanced-only zoomed view.

### 3.3 Genuine Kannada OCR (`POST /api/ocr`)
- **Tesseract.js Engine**: Optical Character Recognition using the official Kannada language model (`kan`).
- **Offline-First Caching**: Pre-bundled `kan.traineddata.gz` (1.92 MB) and `eng.traineddata.gz` in `backend/tessdata/` for zero-latency, offline recognition without external network calls.
- **Enhanced-First Pipeline**: Runs OCR on the enhanced image buffer by default to maximize character recognition fidelity.
- **Worker Concurrency Management**: Queued worker lifecycle preventing race conditions during concurrent recognition requests.
- **Export Formats**:
  - One-click copy to system clipboard.
  - UTF-8 text download with Byte Order Mark (`\uFEFF`) for compatibility with Windows Notepad and Unix utilities.

### 3.4 Damage-Aware Text Recovery Suggestions (`POST /api/recovery/suggest`)
- **Context-Aware Paleographical Analysis**: Allows users to select an abraded character or word, provide optional visual damage notes (e.g., "top loop faded", "water stain"), and request alternative readings.
- **Configurable AI Providers**: Supports Google Gemini 1.5 Flash (recommended) or OpenAI GPT-4o-mini via environment variables (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
- **Strict Digital Ethics**: AI is instructed as an epigraphical paleographer to suggest 1 to 3 plausible readings based strictly on visual glyph morphology (e.g., 'ರ' vs 'ದ', 'ವ' vs 'ಮ', eroded kagunita signs ಿ/ೀ/ು/ೂ) while strictly forbidden from fabricating historical facts.
- **Prominent Uncertainty Label**: Every suggestion carries the mandatory indicator: `⚠️ Unverified suggestion — human review required (ದೃಢೀಕರಿಸದ ಊಹೆ — ಮಾನವ ಪರಿಶೀಲನೆ ಅಗತ್ಯ)`.
- **Graceful Unconfigured Fallback**: If no API key is supplied, returns HTTP 503 `AI_NOT_CONFIGURED` with structured step-by-step instructions on obtaining a free Google AI Studio key.

### 3.5 Unified Review Workspace & Report Generation
- **Token-Level Kannada Text Diff**: Pure JavaScript Longest Common Subsequence (LCS) algorithm tokenizing authentic Kannada Unicode script and displaying color-coded additions, deletions, and unchanged segments.
- **Dual Export Capabilities**:
  - **Structured JSON Evidence Report**: Machine-readable audit export of the complete six-layer session state.
  - **Standalone HTML Evidence Report**: Printable, self-contained HTML document featuring metadata grid, side-by-side text diff, accepted corrections table, rejected suggestions table, and timestamped audit log.
- **Session Reset**: Protected "Start New Document" flow with modal confirmation to prevent accidental data loss.

---

## 4. Features NOT Implemented / Out of Scope

To maintain absolute academic and engineering honesty:
1. **Cryptographic SHA-256 Hashing**: Automatic SHA-256 document fingerprinting was not implemented in this version.
2. **Deep Learning Segmentation**: Complex multi-column page layout segmentation for non-linear palm-leaf commentaries is not implemented.
3. **Automated Epigraphical Dating**: Machine-learning dating of inscription paleography across centuries is out of scope.

---

## 5. Technology Stack Summary

- **Frontend**: React 18, Vite, Tailwind CSS (Heritage Parchment Theme), Lucide React.
- **Backend**: Node.js, Express, Multer (in-memory buffer storage), CORS, Dotenv.
- **Image Processing**: Jimp (Pure JavaScript, 100% native build-free).
- **OCR Engine**: Tesseract.js (Kannada `kan` model with local tessdata caching).
- **AI Recovery**: Google Gemini REST API / OpenAI API.
- **Testing**: Node.js Test Runner (29 backend tests + 5 frontend tests = 34 total automated tests).

---

## 6. How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Install Dependencies
```powershell
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 2. Configure Environment (Optional)
In `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10

# Optional: Add Gemini API key for live AI recovery suggestions
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Servers
```powershell
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
cd frontend
npm run dev
```

### 4. Run Automated Test Suites
```powershell
# Run backend test suite (29 tests)
cd backend
npm test

# Run frontend test suite (5 tests)
cd ../frontend
npm test
```
