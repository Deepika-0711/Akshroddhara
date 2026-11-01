# ಅಕ್ಷರೋದ್ಧಾರ (Aksharoddhaara)
### *« ಅಳಿದ ಅಕ್ಷರಗಳಿಗೆ ಮರುಜೀವ »*
**Giving New Life to Faded Letters: Digital Preservation, Image Enhancement, Kannada OCR & Damage-Aware Text Recovery**

---

## 🏛️ Project Context

**Aksharoddhaara (ಅಕ್ಷರೋದ್ಧಾರ)** is being developed for the **Kannada Digital Innovation Hackathon 2026**.

Karnataka boasts one of South Asia's richest epigraphical and manuscript traditions, spanning over 1,500 years of recorded history—from the 5th-century Halmidi inscription and Kadamba royal copper plates to thousands of palm-leaf (*ತಾಳೆಗರಿ*) manuscripts housed in oriental libraries and mutts across the state.

A significant portion of these ancient records suffer from age-related deterioration:
- Fading iron-gall and natural carbon inks.
- Surface abrasion and insect grooving on palm leaves.
- Weathering, lichen growth, and non-uniform lighting on stone estampages (*ಶಿಲಾಶಾಸನ ಛಾಪು*).
- Paper acidification and water damage on 19th-century lithographic prints.

**Aksharoddhaara** is designed as a functional Minimum Viable Product (MVP) to help conservators, epigraphists, researchers, and citizens restore the readability of damaged Kannada documents using verifiable, pixel-level mathematical image processing, genuine optical character recognition (OCR), and human-verified damage-aware text recovery suggestions.

---

## 🧭 Core Preservation Principles

In accordance with strict digital conservation ethics:
1. **Preserve the Original Document**: The original image is always retained in its pristine state. All enhancement and thresholding operations are non-destructive.
2. **Distinguish Fact from Prediction**: Legible physical marks are clearly demarcated from algorithmic predictions or reconstructions.
3. **Transparent Uncertainty**: The platform never fabricates false certainty or hides image ambiguity.
4. **Human-in-the-Loop**: Algorithms assist in visual contrast recovery and initial glyph transcription; epigraphists and scholars retain ultimate authority over historical interpretation.
5. **Physical Substrate Reality**: Image enhancement recovers contrast from faint remaining ink and stylus grooves, but cannot invent data where the physical substrate has been destroyed.

---

## 📚 Six-Layer Preservation Architecture

Aksharoddhaara enforces strict separation between every stage of digital processing:

| Layer | Type | Mutability | Description |
| :--- | :--- | :--- | :--- |
| **1. Original Document** | Image | Read-only | Untouched, pristine uploaded file buffer. |
| **2. Enhanced Image** | Image | Derived | Grayscale, contrast stretched, and adaptively thresholded PNG. |
| **3. Pristine OCR Output** | Text | Read-only | Exact machine output returned by Tesseract.js (`kan`). |
| **4. Working Edited Text** | Text | Mutable | User-editable working copy for scholarly transcription. |
| **5. Recovery Hypotheses** | JSON | Transient | Algorithmic readings with paleographical reasons; explicitly marked as unverified. |
| **6. Accepted Corrections** | Audit Log | Append-only | Immutable log tracking every replacement made by the human reviewer. |

---

## ⚙️ Features Implemented

### 1. Document Workspace & Upload Pipeline
- **Flexible Ingestion**: Drag-and-drop or file-picker upload supporting PNG, JPG, JPEG, and WEBP formats.
- **Client & Server Validation**: Enforces configurable file size limits (default 10 MB) and MIME-type restrictions with clear Kannada and English feedback.
- **Document Metadata**: Instant extraction and display of filename, file size, and pixel dimensions ($W \times H$).
- **One-Click Historical Samples**: Built-in simulated manuscripts (Palm-Leaf Folio, Stone Inscription Rubbing, and 1892 Aged Print) for immediate evaluation without requiring external files.

### 2. Real JavaScript Image Enhancement (`POST /api/enhance`)
- **Grayscale Conversion**: Eliminates age-induced paper yellowing and non-uniform chromatic stains.
- **Adaptive Contrast & Brightness Stretching**: Expands dynamic range for low-contrast stylus incisions and faded inks.
- **Gaussian Noise Reduction**: Suppresses substrate grain and stone irregularities without destroying character curves (ವ, ಮ, ರ, ಣ, ಳ).
- **Unsharp Mask Convolution**: 3×3 spatial convolution kernel restoring edge definition to faded Kannada ligatures and *kagunita* signs.
- **Heritage-Specific Presets**:
  - `balanced`: General dynamic range expansion and edge crisping.
  - `palm-leaf`: Integral-image local adaptive thresholding tuned for brown palm-leaf folios.
  - `stone-rubbing`: Otsu binarization for paper impressions of stone carvings.
  - `faded-ink`: High-sensitivity adaptive binarization for water-damaged ink.
- **Manual Fine-Tuning Controls**: Real-time sliders for contrast, brightness, noise reduction, and sharpening.
- **Split-View Comparison Slider**: Interactive draggable divider comparing original and enhanced images.

### 3. Genuine Kannada OCR (`POST /api/ocr`)
- **Tesseract.js Integration**: Real optical character recognition using the official Kannada language model (`kan`).
- **Offline-First Model Caching**: Bundles and caches `kan.traineddata.gz` locally in `backend/tessdata/` so OCR runs reliably offline with zero latency or external dependency.
- **Enhanced-First Pipeline**: Prioritizes running OCR on the enhanced image (where contrast and character edges have been restored), falling back to the original image if no enhancement was run.
- **Worker Lifecycle Management**: Thread-safe queued worker reuse avoiding worker re-instantiation overhead on every request.
- **Full Kannada Unicode Fidelity**:
  - Direct display in an editable `<textarea>` with `Noto Serif Kannada` typography.
  - Instant one-click **Copy to Clipboard** with visual feedback.
  - One-click **Download as UTF-8 .txt** file with UTF-8 Byte Order Mark (`\uFEFF`) ensuring distortion-free display in Windows Notepad and code editors.
  - Clean detection status reporting if an image contains no detectable text.

### 4. Damage-Aware Text Recovery Suggestions (`POST /api/recovery/suggest`)
- **User-Selected Unclear Text**: Users select an unclear word or passage in the working text and can optionally provide visual damage observations (e.g. "top stroke abraded", "water stain over consonant").
- **Configurable AI Provider Integration**: Supports Google Gemini API (recommended) or OpenAI via server-side environment variables (`GEMINI_API_KEY` or `OPENAI_API_KEY`).
- **Paleographical Prompt Engineering**: Instructs models to suggest up to 3 plausible readings based on Kannada visual glyph similarities ('ರ' vs 'ದ', 'ವ' vs 'ಮ', eroded kagunita vowel signs) while strictly forbidding fabricated historical facts.
- **Unverified Labeling**: All suggestions are prominently labeled: `⚠️ Unverified suggestion — human review required (ದೃಢೀಕರಿಸದ ಊಹೆ — ಮಾನವ ಪರಿಶೀಲನೆ ಅಗತ್ಯ)`.
- **Human-in-the-Loop Review**: Accepting a suggestion modifies **only** the working copy; the pristine OCR output remains untouched.
- **Side-by-Side Comparison**: Switch between Working Copy, Original OCR, and a dual-pane comparison view with an immutable corrections audit trail.
- **Safe Fallback & Setup Guidance**: If no AI key is configured, the backend returns HTTP 503 (`AI_NOT_CONFIGURED`) with step-by-step instructions displayed in the UI for obtaining a free Gemini API key.

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Fast, responsive modern UI with strict component isolation. |
| **Styling** | Tailwind CSS | Heritage palette (ivory, forest green, antique gold). |
| **Backend** | Node.js (v24) + Express | Lightweight, stateless API with centralized error handling. |
| **Image Processing**| Jimp (Pure JavaScript) | 100% JavaScript; zero Python, zero native build tool dependencies. |
| **Kannada OCR** | Tesseract.js (`kan`) | Client-safe backend OCR with local traineddata caching. |
| **AI Suggestions** | Google Gemini / OpenAI | Configurable damage-aware paleographic hypotheses via server-side REST. |
| **Typography** | Noto Serif / Sans Kannada | Authentic Unicode Kannada rendering. |
| **Icons** | Lucide React | Heritage and document conservation iconography. |

---

## 🚀 Installation & Running

### Prerequisites
- Node.js (v18 or higher; tested on v24.19.0)
- npm (v9 or higher; tested on v11.17.0)

### 1. Install Backend Dependencies
```powershell
cd backend
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd ../frontend
npm install
```

### 3. Configure Environment Variables (Optional for AI Suggestions)
In `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE_MB=10

# AI Provider Configuration (Step 4 - Text Recovery Suggestions)
# Free tier key obtainable from https://aistudio.google.com
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Backend Development Server
From the `backend` folder:
```powershell
npm run dev
# Or: node src/server.js
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).*

### 5. Run Frontend Development Server
From the `frontend` folder in a separate terminal:
```powershell
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxying to `http://localhost:5000`.*

### 6. Run Automated Tests
```powershell
cd backend
npm test
```
*Executes all 29 automated unit and integration tests across image processing, thresholding, oversized file rejections, Kannada OCR, and text recovery suggestions.*

---

## 📡 API Specification

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `{ "status": "ok", "service": "Aksharoddhaara API", "version": "1.0.0" }`

### 2. Document Enhancement
- **Endpoint**: `POST /api/enhance`
- **Content-Type**: `multipart/form-data`
- **Fields**: `image` (PNG, JPG, WEBP; max 10 MB), `preset` (optional)

### 3. Kannada Optical Character Recognition (OCR)
- **Endpoint**: `POST /api/ocr`
- **Content-Type**: `multipart/form-data`
- **Fields**: `image` (PNG, JPG, WEBP; max 10 MB), `language` (`kan` default)

### 4. Damage-Aware Text Recovery Suggestions
- **Endpoint**: `POST /api/recovery/suggest`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "selectedText": "ಸಾ..ತ್ಯ",
  "context": "ಕರ್ಣಾಟ ಸಾ..ತ್ಯ ಪರಂಪರೆ ಮತ್ತು ಪ್ರಾಚೀನ ಗ್ರಂಥಗಳು",
  "damageNote": "Water stain obscuring middle character"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "selectedText": "ಸಾ..ತ್ಯ",
  "context": "ಕರ್ಣಾಟ ಸಾ..ತ್ಯ ಪರಂಪರೆ ಮತ್ತು ಪ್ರಾಚೀನ ಗ್ರಂಥಗಳು",
  "damageNote": "Water stain obscuring middle character",
  "status": "needs_human_review",
  "suggestions": [
    {
      "text": "ಸಾಹಿತ್ಯ",
      "reason": "ಅಕ್ಷರ 'ಹಿ' ಯ ಮೇಲಿನ ಇ-ಕಾರದ ಸುರುಳಿ ಸವೆದುಹೋಗಿದೆ, ಸಂದರ್ಭವು 'ಸಾಹಿತ್ಯ'ವನ್ನು ಬಲವಾಗಿ ಸೂಚಿಸುತ್ತದೆ."
    },
    {
      "text": "ಸಾಹಿತ್ಯಂ",
      "reason": "ಪ್ರಾಚೀನ ಹಳೆಗನ್ನಡ ಗ್ರಂಥಗಳಲ್ಲಿ ಅನುಸ್ವಾರಾಂತ ರೂಪ ಸಾಧ್ಯತೆ."
    }
  ],
  "explanation": "ಮೊದಲ ಅಕ್ಷರ ಸ್ಪಷ್ಟವಾಗಿದೆ, ಎರಡನೆಯ ಅಕ್ಷರದಲ್ಲಿ ವೊವೆಲ್ ಸೈನ್ ತೇವಾಂಶದಿಂದ ಮಸುಕಾಗಿದೆ.",
  "provider": "gemini",
  "disclaimer": "ದೃಢೀಕರಿಸದ ಊಹೆ — ಮಾನವ ಪರಿಶೀಲನೆ ಅಗತ್ಯ (Unverified suggestion — human review required)."
}
```
- **When AI Not Configured (`503 Service Unavailable`)**:
```json
{
  "success": false,
  "error": {
    "code": "AI_NOT_CONFIGURED",
    "message": "AI Provider is not configured. Please set GEMINI_API_KEY (or OPENAI_API_KEY) in backend/.env to enable live damage-aware recovery suggestions.",
    "setupGuide": { ... }
  }
}
```

---

## ⚠️ Known Limitations & Preservation Disclaimers
1. **Physical Medium Loss**: Neither image enhancement, OCR, nor AI suggestions can reconstruct text where the physical substrate (parchment, palm leaf) has been completely torn, burned, or destroyed.
2. **Hypotheses vs. Historical Fact**: AI suggestions represent paleographical hypotheses based on character morphology and context; they must never be presented or published as verified original historical text without certified epigraphist review.
3. **Stateless Privacy**: In accordance with user privacy, uploaded documents, OCR outputs, and working texts exist only in-memory during the active browser session.
