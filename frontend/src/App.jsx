import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./index.css";

/* ─────────────────────────────────────────────
   Inline SVG Icons
   No external library needed.
   Stroke-based, consistent with design system.
───────────────────────────────────────────── */

const IconShield = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconInbox = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const IconAlertCircle = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconInfo = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const IconGithub = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function App() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiStatus, setApiStatus] = useState("checking"); // "checking" | "online" | "offline"

  // Check backend health automatically
  const checkApiHealth = useCallback(async () => {
    try {
      await axios.get("/api/", { timeout: 3000 });
      setApiStatus("online");
    } catch {
      try {
        await axios.get("http://127.0.0.1:8000/", { timeout: 3000 });
        setApiStatus("online");
      } catch {
        setApiStatus("offline");
      }
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 15000);
    return () => clearInterval(interval);
  }, [checkApiHealth]);

  // Format backend / network errors into user-friendly messages
  const formatErrorMessage = useCallback((err) => {
    if (!err.response) {
      return "Network Error: Unable to reach the backend server. Please verify FastAPI is running at http://127.0.0.1:8000.";
    }

    const status = err.response.status;
    if (status === 422) {
      return "Validation Error: The submitted news title or text format was rejected by the model service.";
    }
    if (status === 500) {
      return "Server Error (500): The AI prediction service encountered an internal error. Please try again.";
    }

    return (
      err.response.data?.detail ||
      err.message ||
      "An unexpected error occurred while processing your request."
    );
  }, []);

  const predictNews = async () => {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    // Client-side validation before sending request
    const errors = {};
    if (!trimmedTitle) {
      errors.title = "News title cannot be empty.";
    }
    if (!trimmedText) {
      errors.text = "News article content cannot be empty.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setResult(null);
      return;
    }

    // Reset error states & activate loading
    setFieldErrors({});
    setApiError(null);
    setLoading(true);

    const payload = { title: trimmedTitle, text: trimmedText };

    try {
      // Primary route via Vite dev proxy
      const response = await axios.post("/api/predict", payload);
      setResult(response.data);
      setApiStatus("online");
    } catch (err) {
      try {
        // Direct fallback route to FastAPI server
        const response = await axios.post(
          "http://127.0.0.1:8000/predict",
          payload
        );
        setResult(response.data);
        setApiStatus("online");
      } catch (fallbackErr) {
        setResult(null);
        setApiError(formatErrorMessage(fallbackErr));
        setApiStatus("offline");
        console.error("API Error:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (fieldErrors.title) {
      setFieldErrors((prev) => ({ ...prev, title: null }));
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (fieldErrors.text) {
      setFieldErrors((prev) => ({ ...prev, text: null }));
    }
  };

  const isButtonDisabled = loading || !title.trim() || !text.trim();

  return (
    <div className="app">
      {/* ══════════════════════════════════════
          TOP NAVIGATION BAR
          Sticky · Brand + Model badge + API Status
      ══════════════════════════════════════ */}
      <nav
        className="topnav"
        role="navigation"
        aria-label="Application navigation"
      >
        <div className="topnav-inner">
          <div className="topnav-brand">
            <span className="topnav-icon">
              <IconShield />
            </span>
            <span className="topnav-name">Fake News Detector</span>
          </div>

          <div className="topnav-controls">
            {/* Automatic API Connection Status Indicator */}
            <span
              className="api-status-badge"
              aria-label={`Backend Status: ${apiStatus}`}
            >
              <span
                className={`api-status-dot ${apiStatus}`}
                aria-hidden="true"
              />
              {apiStatus === "online" && "Backend Connected"}
              {apiStatus === "offline" && "Backend Offline"}
              {apiStatus === "checking" && "Connecting..."}
            </span>

            <span className="model-pill" aria-label="Model: DistilBERT">
              DistilBERT
            </span>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          PAGE BODY
          All scrollable content lives here
      ══════════════════════════════════════ */}
      <div className="page-body">
        {/* ──────────────────────────────────
            HERO SECTION
            Eyebrow → Heading → Description
        ────────────────────────────────── */}
        <header className="page-hero" role="banner">
          <div className="page-hero-inner">
            <span className="hero-eyebrow">AI-Powered Analysis</span>

            <h1 className="hero-heading">Fake News Detector</h1>

            <p className="hero-subtext">
              Analyze the credibility of news articles using an AI-powered
              DistilBERT model.
            </p>
          </div>
        </header>

        {/* ──────────────────────────────────
            WORKSPACE
            Outer card wrapping both panels
        ────────────────────────────────── */}
        <main className="page-workspace" id="main-content">
          <div className="workspace-card">
            {/* ════════════════════
                PANEL 01 — ARTICLE
                Input panel
            ════════════════════ */}
            <section
              className="workspace-panel"
              aria-labelledby="panel-input-heading"
            >
              <div className="workspace-panel-header">
                <span className="panel-eyebrow">01</span>
                <h2 id="panel-input-heading" className="panel-heading">
                  Article
                </h2>
                <p className="panel-subtext">
                  Enter a headline and paste the complete article body.
                </p>
              </div>

              {/* Title field */}
              <div className="field-group">
                <label htmlFor="news-title">News Title</label>
                <input
                  id="news-title"
                  type="text"
                  placeholder="Enter news title..."
                  value={title}
                  disabled={loading}
                  onChange={handleTitleChange}
                  className={fieldErrors.title ? "input-error" : ""}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={
                    fieldErrors.title ? "news-title-error" : undefined
                  }
                />
                {fieldErrors.title && (
                  <span
                    id="news-title-error"
                    className="text-xs text-error mt-1"
                    role="alert"
                  >
                    {fieldErrors.title}
                  </span>
                )}
              </div>

              {/* Article body field */}
              <div className="field-group">
                <label htmlFor="news-article">News Article</label>
                <textarea
                  id="news-article"
                  rows="10"
                  placeholder="Paste the complete article here..."
                  value={text}
                  disabled={loading}
                  onChange={handleTextChange}
                  className={fieldErrors.text ? "input-error" : ""}
                  aria-invalid={Boolean(fieldErrors.text)}
                  aria-describedby={
                    fieldErrors.text ? "news-article-error" : undefined
                  }
                />
                {fieldErrors.text && (
                  <span
                    id="news-article-error"
                    className="text-xs text-error mt-1"
                    role="alert"
                  >
                    {fieldErrors.text}
                  </span>
                )}
              </div>

              {/* Submit button */}
              <div className="analyze-row">
                <button
                  type="button"
                  onClick={predictNews}
                  disabled={isButtonDisabled}
                  aria-busy={loading}
                  aria-label={
                    loading ? "Analyzing news article" : "Analyze news article"
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Article"
                  )}
                </button>
              </div>
            </section>

            {/* Hairline divider between panels */}
            <div
              className="workspace-divider"
              role="separator"
              aria-hidden="true"
            />

            {/* ════════════════════
                PANEL 02 — ANALYSIS
                Results panel
            ════════════════════ */}
            <section
              className="workspace-panel"
              aria-labelledby="panel-results-heading"
              aria-live="polite"
            >
              <div className="workspace-panel-header">
                <span className="panel-eyebrow">02</span>
                <h2 id="panel-results-heading" className="panel-heading">
                  Analysis
                </h2>
                <p className="panel-subtext">
                  Prediction results will appear here after analysis.
                </p>
              </div>

              {apiError ? (
                /* ── Error state ── */
                <div className="error-card" role="alert">
                  <div className="error-card-icon">
                    <IconAlertCircle />
                  </div>
                  <div>{apiError}</div>
                </div>
              ) : result ? (
                /* ── Result state ── */
                <>
                  <div className="result-card">
                    <h2>Prediction Result</h2>

                    <div
                      className={
                        result.prediction === "Real"
                          ? "badge real"
                          : "badge fake"
                      }
                    >
                      {result.prediction === "Real"
                        ? "✓ Likely Real News"
                        : "⚠ Likely Fake News"}
                    </div>

                    <p className="ai-summary">
                      {result.prediction === "Real"
                        ? "This article appears to contain language patterns commonly associated with legitimate news reporting."
                        : "This article contains language patterns that resemble misinformation detected during model training."}
                    </p>

                    <div className="metric">
                      <div className="metric-header">
                        <span>Confidence</span>
                        <span className="text-mono">{result.confidence}%</span>
                      </div>
                      <div className="progress">
                        <div
                          className="fill blue"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span>Fake Probability</span>
                        <span className="text-mono">{result.fake_probability}%</span>
                      </div>
                      <div className="progress">
                        <div
                          className="fill red"
                          style={{ width: `${result.fake_probability}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-header">
                        <span>Real Probability</span>
                        <span className="text-mono">{result.real_probability}%</span>
                      </div>
                      <div className="progress">
                        <div
                          className="fill green"
                          style={{ width: `${result.real_probability}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* ── Analysis Metadata Section ── */}
                    <div className="analysis-metadata">
                      <div className="meta-item">
                        <span className="meta-label">Model</span>
                        <span className="meta-value text-mono">DistilBERT</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Inference</span>
                        <span className="meta-value text-mono">&lt; 1 second</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Task</span>
                        <span className="meta-value">Binary Classification</span>
                      </div>
                    </div>
                  </div>

                /* ── AI Disclaimer (renders only after prediction) ── */
                  <div className="ai-disclaimer" role="note">
                    <span className="ai-disclaimer-icon">
                      <IconInfo />
                    </span>
                    <span>
                      <strong>Disclaimer:</strong> This application uses a fine-tuned DistilBERT model to estimate whether a news article is likely fake or real. Predictions are AI-generated and may not always be accurate. Always verify important information using reliable and trusted news sources.
                    </span>
                  </div>
                </>
              ) : (
                /* ── Empty state ── */
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <IconInbox />
                  </div>

                  <p className="empty-state-title">No analysis yet</p>

                  <p className="empty-state-description">
                    Paste a news article above and click{" "}
                    <strong>Analyze Article</strong> to begin.
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* ──────────────────────────────────
            PAGE FOOTER
        ────────────────────────────────── */}
        <footer className="page-footer" role="contentinfo">
          <div className="page-footer-inner">
            <div className="footer-left">
              <span className="footer-author">Built by Tanay Chaturvedi</span>
              <span className="footer-tech">
                React &bull; FastAPI &bull; DistilBERT &bull; PyTorch
              </span>
            </div>

            <div className="footer-right">
              <a
                href="https://github.com/Tanay-chaturvedi/Fake_News_Detector"
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
                aria-label="View source code on GitHub"
              >
                <IconGithub />
                GitHub
              </a>
              <span className="footer-version">v1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;