import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateEndpointKeyPair,
  deriveSymmetricMessageKey,
  encryptMessage,
} from '../../lib/simulation/cryptoEngine';
import './ReferenceSections.css';

const STORY_TEXTS = [
  'Everyone thinks I’m ready for tomorrow. Honestly, I’m nervous.',
  'You don’t have to pretend with me. We’ll practise together.',
];

export const WhyPrivacyMattersStory: React.FC = () => {
  const [storyMode, setStoryMode] = useState<'friend' | 'relay'>('friend');
  const [storyCiphers, setStoryCiphers] = useState<string[] | null>(null);
  const [storyError, setStoryError] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    let active = true;
    async function initStoryCrypto() {
      try {
        if (typeof window === 'undefined' || !window.isSecureContext || !window.crypto?.subtle) {
          if (active) setStoryError(true);
          return;
        }
        const aarav = await generateEndpointKeyPair();
        const meera = await generateEndpointKeyPair();

        const { key: key1 } = await deriveSymmetricMessageKey(
          aarav.privateKey,
          meera.publicKey,
          'story-salt-msg-1',
          'story-msg-1'
        );
        const { key: key2 } = await deriveSymmetricMessageKey(
          meera.privateKey,
          aarav.publicKey,
          'story-salt-msg-2',
          'story-msg-2'
        );

        const p1 = await encryptMessage(
          STORY_TEXTS[0],
          key1,
          aarav.publicKeyJwk,
          meera.publicKeyJwk,
          'Aarav',
          'Meera'
        );
        const p2 = await encryptMessage(
          STORY_TEXTS[1],
          key2,
          meera.publicKeyJwk,
          aarav.publicKeyJwk,
          'Meera',
          'Aarav'
        );

        if (active) {
          setStoryCiphers([p1.ciphertextHex, p2.ciphertextHex]);
        }
      } catch {
        if (active) setStoryError(true);
      }
    }
    initStoryCrypto();
    return () => {
      active = false;
    };
  }, []);

  const quizFeedback =
    quizAnswer === 'no'
      ? 'Exactly. A recipient can copy, photograph or share what they receive. Encryption protects the journey, not every choice at the other end.'
      : quizAnswer === 'yes'
      ? 'The recipient can still copy, photograph or share the message. Encryption protects the journey; it cannot make a person keep a secret.'
      : 'Choose an answer.';

  return (
    <div className="ref-sections-root">
      <section className="story-section" id="why-privacy-matters">
        <div className="content story-grid">
          <div className="story-copy">
            <p className="eyebrow">Why it matters</p>
            <h2>
              Some messages need
              <br />
              {' '}
              <em>an audience of one.</em>
            </h2>
            <p>
              Not every private message contains a grand secret. Sometimes it contains something you’re only ready to tell one person.
            </p>
            <p className="story-line">
              To the network, encrypted data.
              <br />
              {' '}
              To a friend, a moment of trust.
            </p>
            <p className="small">An illustrative conversation, with separately computed encryption.</p>
          </div>

          <div className="story-demo">
            <div className="view-switch" role="group" aria-label="View the story">
              <div
                className={`view-switch-pill ${storyMode === 'relay' ? 'is-relay' : ''}`}
                aria-hidden="true"
              />
              <button
                type="button"
                id="story-friend"
                className={storyMode === 'friend' ? 'selected' : ''}
                aria-pressed={storyMode === 'friend'}
                onClick={() => setStoryMode('friend')}
              >
                The friend sees
              </button>
              <button
                type="button"
                id="story-relay"
                className={storyMode === 'relay' ? 'selected' : ''}
                aria-pressed={storyMode === 'relay'}
                onClick={() => setStoryMode('relay')}
              >
                The relay receives
              </button>
            </div>

            <div
              className={`story-window${storyMode === 'relay' ? ' network' : ''}`}
              id="story-window"
              aria-live="polite"
            >
              <div
                className={`story-doodles${storyMode === 'relay' ? ' is-relay' : ''}`}
                aria-hidden="true"
                style={{ backgroundImage: 'url(./whatsapp-doodle.svg)' }}
              />
              <AnimatePresence mode="wait">
                {storyMode === 'friend' ? (
                  <motion.div
                    key="friend"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="story-window-inner"
                  >
                    <span className="small">AARAV &amp; MEERA</span>
                    <div className="story-bubble sent">{STORY_TEXTS[0]}</div>
                    <div className="story-bubble reply">{STORY_TEXTS[1]}</div>
                    <span className="story-delivery">A private moment, delivered.</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="relay"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="story-window-inner"
                  >
                    <span className="small">THE RELAY’S VIEW</span>
                    <div className="story-cipher">
                      {storyCiphers
                        ? storyCiphers.join('\n\n')
                        : storyError
                        ? 'Encryption is unavailable in this browser.'
                        : 'Preparing this example’s encrypted packet…'}
                    </div>
                    <p>
                      Visible: the endpoints, message numbers and packet sizes. The conversation’s contents remain encrypted.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="privacy-question">
              <p>Can encryption stop the recipient from sharing it?</p>
              <div className="quiz-buttons">
                <button
                  type="button"
                  data-answer="yes"
                  className={quizAnswer === 'yes' ? 'selected' : ''}
                  aria-pressed={quizAnswer === 'yes'}
                  onClick={() => setQuizAnswer('yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  data-answer="no"
                  className={quizAnswer === 'no' ? 'selected' : ''}
                  aria-pressed={quizAnswer === 'no'}
                  onClick={() => setQuizAnswer('no')}
                >
                  No
                </button>
              </div>
              <p id="quiz-feedback" className="small" aria-live="polite">
                {quizFeedback}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
