import React from 'react';
import './ReferenceSections.css';

interface ClosingSectionProps {
  onRestartSimulator: () => void;
  onExploreMechanism: () => void;
}

export const ClosingSectionAndFooter: React.FC<ClosingSectionProps> = ({
  onRestartSimulator,
  onExploreMechanism,
}) => {
  return (
    <div className="ref-sections-root">
      <section className="closing" id="closing-takeaway">
        <div
          className="closing-doodles"
          aria-hidden="true"
          style={{ backgroundImage: 'url(./whatsapp-doodle.svg)' }}
        />
        <div className="content">
          <div className="closing-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <path d="M10 18h20v18H10zM14 18v-7a6 6 0 0112 0v7M20 24v6" />
            </svg>
          </div>
          <p className="eyebrow">Now you know what happens</p>
          <h2>
            The next time you see
            <br />
            {' '}
            “end-to-end encrypted,”
            <br />
            {' '}
            <em>it’ll mean a little more.</em>
          </h2>
          <p>
            Your device encrypts. The relay delivers.
            <br />
            {' '}
            The recipient’s device checks and decrypts.
          </p>
          <div className="closing-actions">
            <button type="button" className="button light" onClick={onRestartSimulator}>
              Try another message
            </button>
            <button type="button" className="closing-link" onClick={onExploreMechanism}>
              Explore the mechanism
            </button>
          </div>
          <div className="closing-bottom">
            <span>Thank you for exploring with The Syntax Unveilers.</span>
            <span>Protect your device. Choose who you trust.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
