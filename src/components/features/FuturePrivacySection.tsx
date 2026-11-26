import React from 'react';
import './ReferenceSections.css';

export const FuturePrivacySection: React.FC = () => {
  return (
    <div className="ref-sections-root">
      <section className="future-section" id="future-privacy" aria-labelledby="future-privacy-title">
        <div className="content">
          <div className="future-inner">
            <p className="eyebrow">Looking ahead</p>
            <h2 id="future-privacy-title">Private today. Still private tomorrow?</h2>
            <div className="future-body">
              <p>
                Some messages need to stay private for years. Attackers can save encrypted traffic today, hoping future quantum computers will help uncover its secrets. Post-quantum cryptography uses new mathematics; quantum key distribution is a separate approach that can use photons to establish keys. This simulator demonstrates neither approach.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
