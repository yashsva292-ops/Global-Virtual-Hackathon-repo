import React, { useState } from 'react';
import { tinyDiffieHellman } from '../../lib/simulation/cryptoEngine';
import './ReferenceSections.css';

export const DeeperExplorationSection: React.FC = () => {
  const [aPriv, setAPriv] = useState(6);
  const [bPriv, setBPriv] = useState(15);

  const dh = tinyDiffieHellman(23, 5, aPriv, bPriv);

  return (
    <div className="ref-sections-root inside-section-wrap">
      <section className="inside-section content" id="deeper-exploration" aria-labelledby="inside-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A closer look</p>
            <h2 id="inside-title">
              There’s more
              <br />
              {' '}
              <em>behind “encrypted”.</em>
            </h2>
          </div>
          <p>
            You have the main idea.
            <br />
            {' '}
            Open the questions you’re curious about.
          </p>
        </div>

        <div className="deep-layout">
          <aside className="deep-aside">
            <div className="key-illustration" aria-hidden="true">
              <svg viewBox="0 0 240 230">
                <circle cx="83" cy="78" r="42" />
                <circle cx="83" cy="78" r="16" />
                <path d="m113 108 80 80-19 19-14-14 10-10-13-13-10 10-17-17 10-10-47-47" />
              </svg>
            </div>
            <h3>
              A key isn’t a password
              <br />
              {' '}
              you have to remember.
            </h3>
            <p>
              It’s a number your device uses. The useful part is what the maths lets two devices do with it.
            </p>
            <span className="small">Choose a question to explore.</span>
          </aside>

          <div className="questions">
            <details>
              <summary>
                How do two phones make the same secret?<span>+</span>
              </summary>
              <div className="answer">
                <p>
                  Each phone makes a private value and a public value. The public values can travel openly. Each phone combines its own private value with the other phone’s public value. Both calculate the same shared secret.
                </p>
                <p>
                  The secret itself is never sent. With properly chosen modern parameters, finding it from the public values is impractical.
                </p>
                <div className="toy">
                  <p className="eyebrow">Try the maths with tiny numbers</p>
                  <p className="small">
                    This toy uses 23 and 5. It is easy to break. The main simulator uses elliptic-curve cryptography.
                  </p>
                  <div className="toy-inputs">
                    <div>
                      <label htmlFor="a-slider">Aarav’s private number</label>
                      <output id="a-value" htmlFor="a-slider">
                        {aPriv}
                      </output>
                      <input
                        id="a-slider"
                        type="range"
                        min={1}
                        max={21}
                        value={aPriv}
                        onChange={(e) => setAPriv(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label htmlFor="b-slider">Meera’s private number</label>
                      <output id="b-value" htmlFor="b-slider">
                        {bPriv}
                      </output>
                      <input
                        id="b-slider"
                        type="range"
                        min={1}
                        max={21}
                        value={bPriv}
                        onChange={(e) => setBPriv(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="toy-output" aria-live="polite">
                    <div>
                      <span>Aarav sends publicly</span>
                      <strong id="a-public">{dh.alicePublic}</strong>
                      <code id="a-formula">{`5^${aPriv} mod 23 = ${dh.alicePublic}`}</code>
                    </div>
                    <div>
                      <span>Meera sends publicly</span>
                      <strong id="b-public">{dh.bobPublic}</strong>
                      <code id="b-formula">{`5^${bPriv} mod 23 = ${dh.bobPublic}`}</code>
                    </div>
                  </div>
                  <p className="shared-result" id="toy-secret">
                    Both calculate the same secret: {dh.aliceShared}
                  </p>
                  <p className="small" id="toy-detail">
                    {`${dh.bobPublic}^${aPriv} mod 23 = ${dh.alicePublic}^${bPriv} mod 23 = ${dh.aliceShared}. “mod” means the remainder after division.`}
                  </p>
                </div>
                <p>
                  The main simulator uses ECDH for key agreement and HKDF to derive starting key material. It assumes authentic public keys. Agreement alone cannot prove who is at the other end.
                </p>
              </div>
            </details>

            <details>
              <summary>
                What are all these different keys?<span>+</span>
              </summary>
              <div className="answer">
                <p>They have different jobs. Calling every one “the key” hides how the system works.</p>
                <dl className="glossary">
                  <dt>Identity key pair</dt>
                  <dd>A longer-lived public/private pair associated with a device. It helps establish which device you are talking to.</dd>
                  <dt>Shared secret</dt>
                  <dd>Secret material both devices calculate during key agreement.</dd>
                  <dt>Root key</dt>
                  <dd>In a ratchet protocol, secret state that helps create or update chains when fresh key-agreement material arrives.</dd>
                  <dt>Chain key</dt>
                  <dd>A changing secret that produces a message key and the next chain key.</dd>
                  <dt>Message key</dt>
                  <dd>The symmetric secret used to protect one message. The recipient derives the matching key.</dd>
                  <dt>Nonce</dt>
                  <dd>A value used with encryption. AES-GCM must not reuse it with the same key. It can travel openly; it is not a secret key.</dd>
                </dl>
                <p>The identity private key does not directly decrypt every chat message. The message key does that job.</p>
              </div>
            </details>

            <details>
              <summary>
                Why does the key change for each message?<span>+</span>
              </summary>
              <div className="answer">
                <p>
                  A chain calculation produces a key for this message and the next chain key. The next message uses the new state. Later chain keys should not reveal earlier ones.
                </p>
                <div className="chain-strip">
                  <span>Chain key</span>
                  <b>produces</b>
                  <span>Message key</span>
                  <b>and</b>
                  <span>Next chain key</span>
                </div>
                <p>
                  Try “Send another message” above. It advances a real chain. The key fingerprint changes even when you type the same words.
                </p>
                <p>
                  <strong>The Double Ratchet adds fresh key agreement.</strong> New Diffie–Hellman exchanges mix fresh secret material into the root state. This can help protect future messages after a temporary compromise, once the attacker loses access and uncompromised material is mixed in.
                </p>
                <p>
                  The algorithm stays the same; the secrets change. Protecting older messages depends on deleting old keys. That does not erase readable chat history.
                </p>
                <p className="model-note">
                  This demo implements a one-way symmetric chain, not the full Double Ratchet. It keeps the last receive key for the tamper experiment. JavaScript cannot guarantee secure memory erasure.
                </p>
              </div>
            </details>

            <details>
              <summary>
                Can someone change a message on the way?<span>+</span>
              </summary>
              <div className="answer">
                <p>
                  Yes. Someone who can interfere with the connection can change encrypted bytes, block them or delay them.
                </p>
                <p>
                  An authentication tag lets the recipient check protected data. Without the secret key, making altered data pass that check is infeasible when the cryptography is used correctly.
                </p>
                <p>
                  Think of a seal people can see but cannot recreate for changed contents without the secret.{' '}
                  <strong>The tag is visible. The key is secret.</strong>
                </p>
                <p>
                  In this simulator, “Change one byte” flips one bit in a copy of the actual ciphertext. AES-GCM rejects it. The tag detects changes; it does not physically prevent them.
                </p>
              </div>
            </details>

            <details>
              <summary>
                What if the other person is offline?<span>+</span>
              </summary>
              <div className="answer">
                <p>
                  A device can prepare public setup material in advance: identity information, a signed prekey and one-time prekeys. The private parts stay on the device.
                </p>
                <p>
                  The sender fetches that public bundle, checks the signed prekey, and combines key-agreement results to establish a secret. The recipient calculates the matching secret on returning. Meanwhile, the server can hold encrypted messages.
                </p>
                <p>
                  A signature ties the prekey to an identity key. It does not, by itself, prove the human name behind that identity.
                </p>
                <p className="model-note">
                  This describes the X3DH pattern. Offline bundles, signatures and one-time-prekey management are explained here, not implemented in the demo.
                </p>
              </div>
            </details>

            <details>
              <summary>
                What does WhatsApp’s security code check?<span>+</span>
              </summary>
              <div className="answer">
                <p>
                  Key agreement helps only if you have the intended person’s public keys. Otherwise, someone could try substituting their own.
                </p>
                <p>
                  Comparing WhatsApp’s QR code or 60-digit security code with your contact helps verify the keys for the conversation. Compare through a trusted route, such as in person.
                </p>
                <p>You do not scan a QR code for every message. It is not a delivery address, password or secret message key.</p>
                <p>
                  WhatsApp also documents automatic key-verification measures, including key transparency. This demo assumes trusted endpoint keys; it does not reproduce those checks.
                </p>
              </div>
            </details>

            <details>
              <summary>
                Can the service still learn anything about the chat?<span>+</span>
              </summary>
              <div className="answer">
                <p>
                  Content and metadata are different. This model’s relay can see the routing header, message number and encrypted packet size. It needs a destination to deliver the packet.
                </p>
                <p>
                  End-to-end encryption protects content between endpoints. It does not automatically hide all account information, timing or communication patterns. Exactly what a service collects depends on its design and policies.
                </p>
                <p>
                  An unlocked or compromised endpoint can expose readable messages. The recipient can also copy or share them.
                </p>
              </div>
            </details>

            <details>
              <summary>
                What about calls, groups, devices and backups?<span>+</span>
              </summary>
              <div className="answer">
                <p>The goal is still to keep content secrets with the intended endpoints. The engineering changes with the job.</p>
                <dl className="glossary">
                  <dt>Calls</dt>
                  <dd>Encoded audio and video travel as protected data streams. This text-message demo does not simulate calling protocols.</dd>
                  <dt>Groups</dt>
                  <dd>Group members receive the ability to read messages through additional key-distribution rules. A member can still share what they receive.</dd>
                  <dt>Linked devices</dt>
                  <dd>WhatsApp documents separate device identities and encrypted delivery to intended devices. Every linked device is another endpoint to protect.</dd>
                  <dt>Backups</dt>
                  <dd>A saved copy needs its own protection. Do not assume a conversation’s protection automatically covers every backup. Review the app’s current backup settings.</dd>
                </dl>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};
