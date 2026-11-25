// A deliberately limited teaching protocol, not a production messenger.
// The two endpoint identities are assumed to be trusted. Browser Web Crypto
// supplies the primitives; this code implements the visible state and message flow.
const encoder = new TextEncoder();
export const bytes = text => encoder.encode(text);
export const hex = buffer => Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2,'0')).join('');
const random = length => crypto.getRandomValues(new Uint8Array(length));
const fingerprint = async raw => hex(await crypto.subtle.digest('SHA-256',raw)).slice(0,16);
async function initialChain(secret,salt) {
  const material=await crypto.subtle.importKey('raw',secret,'HKDF',false,['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt,info:bytes('delivered-never-read/teaching-chain-v2')},material,256));
}
export async function chainStep(chain) {
  const key=await crypto.subtle.importKey('raw',chain,{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const messageBytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,bytes('message-key')));
  const next=new Uint8Array(await crypto.subtle.sign('HMAC',key,bytes('next-chain')));
  const messageKey=await crypto.subtle.importKey('raw',messageBytes,'AES-GCM',false,['encrypt','decrypt']);
  const id=await fingerprint(messageBytes);
  messageBytes.fill(0);
  return {messageKey,next,id};
}
export async function newSession() {
  const pair=()=>crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const alice=await pair(),bob=await pair();
  const aSecret=await crypto.subtle.deriveBits({name:'ECDH',public:bob.publicKey},alice.privateKey,256);
  const bSecret=await crypto.subtle.deriveBits({name:'ECDH',public:alice.publicKey},bob.privateKey,256);
  const salt=random(32);
  const aChain=await initialChain(aSecret,salt),bChain=await initialChain(bSecret,salt);
  const match=hex(aSecret)===hex(bSecret);
  new Uint8Array(aSecret).fill(0);new Uint8Array(bSecret).fill(0);
  return {aChain,bChain,sent:0,received:0,aPublic:hex(await crypto.subtle.exportKey('raw',alice.publicKey)),bPublic:hex(await crypto.subtle.exportKey('raw',bob.publicKey)),salt:hex(salt),secretsMatch:match,id:hex(random(6))};
}
export async function seal(session,text) {
  const step=await chainStep(session.aChain);
  const iv=random(12),counter=session.sent+1;
  const header=JSON.stringify({from:'Aarav',to:'Meera',session:session.id,counter});
  const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:bytes(header),tagLength:128},step.messageKey,bytes(text)));
  session.aChain.fill(0);session.aChain=step.next;session.sent=counter;
  return {iv,header,ciphertext,keyId:step.id,counter};
}
export async function unseal(key,packet) {
  const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:packet.iv,additionalData:bytes(packet.header),tagLength:128},key,packet.ciphertext);
  return new TextDecoder().decode(raw);
}
// Advance the receiver only after a valid, in-order packet. Invalid packets
// leave its chain untouched. Last key is returned solely for the tamper lesson.
export async function receive(session,packet) {
  if(packet.counter!==session.received+1)throw new Error('Packet is not the next message.');
  const step=await chainStep(session.bChain);
  const text=await unseal(step.messageKey,packet);
  session.bChain.fill(0);session.bChain=step.next;session.received++;
  return {text,key:step.messageKey,keyId:step.id};
}
export function tamper(packet) {
  const ciphertext=packet.ciphertext.slice();ciphertext[0]^=1;
  return {...packet,ciphertext};
}
export const wrongKey=()=>crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
export function modPow(base,exponent,modulus) {
  let b=BigInt(base),e=BigInt(exponent),m=BigInt(modulus),result=1n;
  while(e>0n){if(e&1n)result=result*b%m;b=b*b%m;e>>=1n;}return Number(result);
}
export function toyAgreement(a,b){const p=23,g=5,A=modPow(g,a,p),B=modPow(g,b,p);return {p,g,a,b,A,B,alice:modPow(B,a,p),bob:modPow(A,b,p)};}
