import { newSession, seal, receive, unseal, tamper, toyAgreement, hex } from './engine.mjs';
const $ = id => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let phase = 0, session = null, packet = null, accepted = null, busy = false, messageNumber = 0;

// Each stage has one primary action. Encryption state is separate from animation.
const steps = [
  ['WRITE', 'Start with something ordinary.', 'A question, a plan, an inside joke. Right now, it is plain text: words anyone who sees this screen can read.', 'Make our keys', 'The keys are made on the two simulated phones.'],
  ['MAKE KEYS', 'Two phones. One shared secret.', 'Each phone keeps a private key and shares a public key. Each combines its private key with the other’s public key. Both calculate the same secret; the relay never receives that secret.', 'Encrypt my message', 'We use that secret to derive a key for this message.'],
  ['ENCRYPT', 'It leaves the phone as unreadable data.', 'Your message was encrypted inside Aarav’s phone. The relay gets ciphertext, a visible check tag and delivery details. It does not get the secret message key.', 'Deliver to Meera', 'The letters and numbers in the middle are real output.'],
  ['READ', 'Her phone checks it. Then the words appear.', 'Meera’s phone derives the matching message key. The authentication check passes, so it accepts and decrypts the message. Try changing the encrypted data on its way.', 'Change one byte', 'We’ll alter a copy of the packet and check it again.'],
  ['TEST IT', 'One changed byte. The check fails.', 'The altered copy was rejected. The tag doesn’t stop someone changing or blocking data. It makes an unauthorised change detectable. The original packet has not changed.', 'Send another message', 'The next message uses a newly derived message key.']
];
function setKey(id, title, note) {
  const el = $(id);
  el.querySelector('strong').textContent = title;
  el.querySelector(':scope > div > span').textContent = note;
}
function render() {
  const [label, title, copy, action, note] = steps[phase];
  $('step-label').textContent = `STEP ${phase + 1} OF 5 · ${label}`;
  $('step-title').textContent = title;
  $('step-copy').textContent = copy;
  $('next').textContent = action;
  $('action-note').textContent = note;
  $('message').readOnly = phase >= 2;
  document.querySelector('.lab-shell').dataset.stage = phase;
  $('secondary').hidden = phase < 3;
  $('secondary').textContent = phase === 4 ? 'Check the original again' : 'Send another message';
  document.querySelectorAll('[data-phase]').forEach(el => {
    const n = Number(el.dataset.phase);
    el.classList.toggle('current', n === phase);
    el.classList.toggle('done', n < phase);
    if (n === phase) el.setAttribute('aria-current', 'step');
    else el.removeAttribute('aria-current');
  });
  if (phase === 1 && messageNumber > 0) {
    $('step-title').textContent = 'Same conversation. A fresh message key.';
    $('step-copy').textContent = 'The chain moves forward. Each phone derives a new message key from its current chain state. Try sending the same words and compare the key fingerprints below.';
  }
}
function count() {
  $('char-count').textContent = `${$('message').value.length} / 280`;
  if ($('message').value.trim()) {
    $('message-hint').hidden = true;
    $('message').removeAttribute('aria-invalid');
  }
}
function hasMessage() {
  const valid = Boolean($('message').value.trim());
  $('message-hint').hidden = valid;
  if (!valid) { $('message').setAttribute('aria-invalid', 'true'); $('message').focus(); }
  return valid;
}
function clearMessage() {
  packet = null; accepted = null;
  $('sender-badge').textContent = 'Plain text';
  $('recipient-badge').textContent = 'Waiting';
  $('received-message').className = 'received-message';
  $('received-message').replaceChildren();
  const dots = document.createElement('span');
  dots.className = 'waiting-mark'; dots.textContent = '···'; dots.setAttribute('aria-hidden', 'true');
  const p = document.createElement('p'); p.textContent = 'Nothing has arrived yet.';
  $('received-message').append(dots, p);
  const empty = document.createElement('span'); empty.className = 'packet-empty';
  empty.textContent = 'Your encrypted message will appear here.';
  $('relay-packet').replaceChildren(empty);
  $('packet-meta').textContent = 'It delivers data between the phones.';
  $('packet-details').hidden = true; $('packet-details').open = false;
  $('sender-status').textContent = 'Your message starts here, readable.';
  $('recipient-status').textContent = 'Her phone will check before accepting.';
}
function resetUI() {
  phase = 0; session = null; messageNumber = 0;
  $('key-chips').replaceChildren(); $('key-history').hidden = true; $('takeaway').hidden = true;
  $('app-error').hidden = true; $('message-hint').hidden = true;
  $('message').removeAttribute('aria-invalid');
  setKey('sender-key', 'No keys yet', 'We’ll make them next.');
  setKey('recipient-key', 'No keys yet', 'Her phone needs its own keys.');
  clearMessage(); render(); count();
}
function showPacket(p, changed = false) {
  $('relay-packet').textContent = hex(p.ciphertext).match(/.{1,4}/g).join(' ');
  $('packet-meta').textContent = changed ? 'One bit changed in a copy. The tag is untouched.' : `${p.ciphertext.length} encrypted bytes, including a 16-byte check tag.`;
  $('packet-details').hidden = false;
  $('packet-header').textContent = p.header;
  $('packet-nonce').textContent = hex(p.iv);
  $('packet-cipher').textContent = hex(p.ciphertext.slice(0, -16));
  $('packet-tag').textContent = hex(p.ciphertext.slice(-16));
}
function showAccepted() {
  $('received-message').className = 'received-message delivered';
  // User-supplied text is never interpreted as HTML.
  $('received-message').textContent = accepted.text;
  $('recipient-badge').textContent = 'Verified';
  $('recipient-status').textContent = 'Check passed. Your original words, restored.';
  setKey('recipient-key', `Key ${messageNumber} · ${accepted.keyId.slice(0, 8)}`, 'Matches the sender’s message key.');
}
async function run(fn) {
  if (busy) return;
  busy = true;
  ['next', 'secondary', 'reset'].forEach(id => $(id).disabled = true);
  try { await fn(); $('app-error').hidden = true; }
  catch {
    $('app-error').hidden = false;
    $('app-error').textContent = 'This operation could not finish. Start over to create a fresh session. Your text stays in this page.';
  } finally {
    busy = false;
    ['next', 'secondary', 'reset'].forEach(id => $(id).disabled = false);
  }
}
function another() {
  phase = 1; clearMessage(); render();
  setKey('sender-key', 'Chain ready for next message', 'A new message key will be derived.');
  setKey('recipient-key', 'Matching chain state', 'Ready to derive the same next key.');
  $('message').focus({ preventScroll: true });
  if (innerWidth < 800) $('message').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
}
$('next').addEventListener('click', () => run(async () => {
  if (phase === 0) {
    if (!hasMessage()) return;
    session = await newSession();
    if (!session.secretsMatch) throw new Error('Key agreement mismatch');
    setKey('sender-key', 'Shared secret calculated', 'Private key stays on this phone.');
    setKey('recipient-key', 'Same secret calculated', 'Her private key stays on her phone.');
    $('sender-status').textContent = 'Only the public value is shared.';
    $('recipient-status').textContent = 'Both calculations agree. The secret was not sent.';
    phase = 1;
  } else if (phase === 1) {
    if (!hasMessage()) return;
    packet = await seal(session, $('message').value); messageNumber++;
    showPacket(packet);
    setKey('sender-key', `Key ${messageNumber} · ${packet.keyId.slice(0, 8)}`, 'Used here. Never sent to the relay.');
    $('sender-badge').textContent = 'Encrypted';
    $('sender-status').textContent = 'Encrypted here, before the data leaves.';
    $('recipient-status').textContent = 'Her phone has not received the packet yet.';
    const chip = document.createElement('span'); chip.className = 'key-chip';
    chip.textContent = `#${messageNumber} ${packet.keyId.slice(0, 12)}`;
    $('key-chips').append(chip);
    if ($('key-chips').children.length > 8) $('key-chips').firstElementChild.remove();
    $('key-history').hidden = messageNumber < 2;
    phase = 2;
  } else if (phase === 2) {
    accepted = await receive(session, packet); showAccepted();
    phase = 3; $('takeaway').hidden = false;
  } else if (phase === 3) {
    const altered = tamper(packet); showPacket(altered, true);
    let rejected = false;
    try { await unseal(accepted.key, altered); } catch { rejected = true; }
    if (!rejected) throw new Error('Changed packet was accepted');
    $('received-message').className = 'received-message rejected';
    const heading = document.createElement('strong'); heading.textContent = 'Message rejected';
    const p = document.createElement('p'); p.textContent = 'The authentication check failed. No altered message is shown.';
    $('received-message').replaceChildren(heading, p);
    $('recipient-badge').textContent = 'Rejected';
    $('recipient-status').textContent = 'This tests an altered copy. It does not recall the original.';
    phase = 4; $('key-history').hidden = false;
  } else { another(); return; }
  render();
}));
$('secondary').addEventListener('click', () => run(async () => {
  if (phase === 4) {
    if (await unseal(accepted.key, packet) !== accepted.text) throw new Error('Original mismatch');
    showPacket(packet); showAccepted(); phase = 3; render();
  } else another();
}));
$('reset').addEventListener('click', () => { if (!busy) resetUI(); });
$('message').addEventListener('input', count);

// Tiny modular arithmetic belongs only to the optional teaching experiment.
function updateToy() {
  const a = Number($('a-slider').value), b = Number($('b-slider').value), t = toyAgreement(a, b);
  $('a-value').value = a; $('b-value').value = b;
  $('a-public').textContent = t.A; $('b-public').textContent = t.B;
  $('a-formula').textContent = `5^${a} mod 23 = ${t.A}`;
  $('b-formula').textContent = `5^${b} mod 23 = ${t.B}`;
  $('toy-secret').textContent = `Both calculate the same secret: ${t.alice}`;
  $('toy-detail').textContent = `${t.B}^${a} mod 23 = ${t.A}^${b} mod 23 = ${t.alice}. “mod” means the remainder after division.`;
}
$('a-slider').addEventListener('input', updateToy); $('b-slider').addEventListener('input', updateToy);

const storyTexts = ['Everyone thinks I’m ready for tomorrow. Honestly, I’m nervous.', 'You don’t have to pretend with me. We’ll practise together.'];
let storyPackets = null, storyPlain = null, storyMode = 'friend', storyError = false;
function renderStory() {
  for (const mode of ['friend', 'relay']) {
    $(`story-${mode}`).classList.toggle('selected', storyMode === mode);
    $(`story-${mode}`).setAttribute('aria-pressed', String(storyMode === mode));
  }
  const pane = $('story-window'); pane.replaceChildren(); pane.classList.toggle('network', storyMode === 'relay');
  const label = document.createElement('span'); label.className = 'small'; pane.append(label);
  if (storyMode === 'friend') {
    label.textContent = 'AARAV & MEERA';
    (storyPlain || storyTexts).forEach((text, i) => {
      const bubble = document.createElement('div'); bubble.className = `story-bubble ${i ? 'reply' : 'sent'}`;
      bubble.textContent = text; pane.append(bubble);
    });
    const note = document.createElement('span'); note.className = 'story-delivery'; note.textContent = 'A private moment, delivered.'; pane.append(note);
  } else {
    label.textContent = 'THE RELAY’S VIEW';
    const output = document.createElement('div'); output.className = 'story-cipher';
    output.textContent = storyPackets ? storyPackets.map(p => hex(p.ciphertext)).join('\n\n') : storyError ? 'Encryption is unavailable in this browser.' : 'Preparing this example’s encrypted packet…';
    const note = document.createElement('p'); note.textContent = 'Visible: the endpoints, message numbers and packet sizes. The conversation’s contents remain encrypted.';
    pane.append(output, note);
  }
}
$('story-friend').addEventListener('click', () => { storyMode = 'friend'; renderStory(); });
$('story-relay').addEventListener('click', () => { storyMode = 'relay'; renderStory(); });
document.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-answer]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  $('quiz-feedback').textContent = button.dataset.answer === 'no' ? 'Exactly. A recipient can copy, photograph or share what they receive. Encryption protects the journey, not every choice at the other end.' : 'The recipient can still copy, photograph or share the message. Encryption protects the journey; it cannot make a person keep a secret.';
}));

let heroTimer;
async function replayHero() {
  $('replay-hero').disabled = true;
  try {
    const s = await newSession(), p = await seal(s, 'See you tomorrow?'); await receive(s, p);
    $('hero-cipher').textContent = hex(p.ciphertext).slice(0, 20);
    const scene = document.querySelector('.hero-scene');
    scene.classList.remove('travel'); void scene.offsetWidth; scene.classList.add('travel');
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => { scene.classList.remove('travel'); $('replay-hero').disabled = false; }, reducedMotion.matches ? 0 : 4700);
  } catch { $('hero-cipher').textContent = 'Encrypted message'; $('replay-hero').disabled = false; }
}
$('replay-hero').addEventListener('click', replayHero);
let queued = false;
window.addEventListener('scroll', () => {
  if (queued) return; queued = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('.scroll-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`; queued = false;
  });
}, { passive: true });
document.querySelectorAll('a[href="#lab"]').forEach(a => a.addEventListener('click', () => {
  setTimeout(() => $('lab-title').focus({ preventScroll: true }), reducedMotion.matches ? 0 : 450);
}));
resetUI(); updateToy();
if (!window.isSecureContext || !crypto.subtle) {
  $('app-error').hidden = false;
  $('app-error').textContent = 'This experiment needs HTTPS and Web Crypto. Open the published HTTPS link in a current browser.';
  $('next').disabled = true; $('reset').disabled = true; storyError = true;
} else {
  replayHero();
  (async () => {
    try {
      const s = await newSession(), packets = [], plain = [];
      for (const text of storyTexts) { const p = await seal(s, text); packets.push(p); plain.push((await receive(s, p)).text); }
      storyPackets = packets; storyPlain = plain; renderStory();
    } catch { storyError = true; renderStory(); }
  })();
}
