import React from 'react';
import './ReferenceSections.css';

export const FuturePrivacySection: React.FC = () => {
  return (
    <div className="ref-sections-root">
      <section className="future-section" id="future-privacy" aria-labelledby="future-privacy-title">
        <div className="content">
          <div className="future-card">
            <header className="future-header">
              <p className="eyebrow">LOOKING AHEAD</p>
              <h2 id="future-privacy-title">
                Private today.
                <br />
                Still private tomorrow?
              </h2>
              <p className="future-intro">
                Tomorrow’s match may matter for a day, but a medical report, secret documents, and private conversations may need to stay private for years.
              </p>
            </header>

            <div className="future-threat-row">
              <div className="future-threat-copy">
                <h3>Store now. Decrypt later.</h3>
                <p>
                  An attacker can save encrypted communications today, hoping future technology will help reveal their contents. A sufficiently capable quantum computer could threaten some methods used to establish today’s secret keys.
                </p>
              </div>

              <div className="future-diagram" role="group" aria-label="Three stages of store now, decrypt later">
                <div className="future-stage">
                  <div className="future-stage-icon" aria-hidden="true">
                    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="10" width="28" height="20" rx="3" />
                      <path d="M6 13l14 9 14-9" />
                      <path d="M16 24h8" />
                    </svg>
                  </div>
                  <span className="future-stage-label">1. TODAY</span>
                  <span className="future-stage-caption">Encrypted data is collected.</span>
                </div>

                <div className="future-arrow" aria-hidden="true">
                  <svg viewBox="0 0 28 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 8h22" />
                    <path d="M19 3l5 5-5 5" />
                  </svg>
                </div>

                <div className="future-stage">
                  <div className="future-stage-icon" aria-hidden="true">
                    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="7" y="14" width="26" height="18" rx="2.5" />
                      <path d="M5 10h30v4H5z" />
                      <rect x="16.5" y="21" width="7" height="6" rx="1" />
                      <path d="M18 21v-2a2 2 0 0 1 4 0v2" />
                    </svg>
                  </div>
                  <span className="future-stage-label">2. STORED</span>
                  <span className="future-stage-caption">A copy is kept.</span>
                </div>

                <div className="future-arrow" aria-hidden="true">
                  <svg viewBox="0 0 28 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 8h22" />
                    <path d="M19 3l5 5-5 5" />
                  </svg>
                </div>

                <div className="future-stage">
                  <div className="future-stage-icon" aria-hidden="true">
                    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13" cy="22" r="5" />
                      <path d="M18 22h10v4m-3-4v3" />
                      <path d="M27 11a3.5 3.5 0 0 1 6.5 1.8c0 2-2.5 2.5-2.5 4.2" />
                      <circle cx="31" cy="20" r="0.8" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <span className="future-stage-label">3. POSSIBLE FUTURE</span>
                  <span className="future-stage-caption">An attempt to uncover its contents.</span>
                </div>
              </div>
            </div>

            <div className="future-panels">
              <div className="future-panel">
                <div className="future-panel-head">
                  <span className="future-panel-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                    </svg>
                  </span>
                  <div>
                    <span className="future-panel-label">Post-quantum cryptography</span>
                    <h3>New mathematics</h3>
                  </div>
                </div>
                <p>Methods designed to resist quantum attacks, running on ordinary devices.</p>
              </div>

              <div className="future-panel">
                <div className="future-panel-head">
                  <span className="future-panel-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                      <path d="M7 12c2.5-4 4.5-4 5 0s2.5 4 5 0" />
                    </svg>
                  </span>
                  <div>
                    <span className="future-panel-label">Quantum key distribution</span>
                    <h3>Keys through quantum signals</h3>
                  </div>
                </div>
                <p>
                  A separate approach using specialist equipment and signals such as photons—particles of light—to establish keys and check for signs of interference.
                </p>
                <p className="future-panel-clarification">It does not make stored messages disappear.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
