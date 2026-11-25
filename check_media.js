import https from 'node:https';

const options = {
  hostname: 'dribbble.com',
  path: '/shots/21103945-ChatGPT-AI-tool-redesign-Lazarev',
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
};
https.get(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const urls = data.match(/https:\/\/[^"'<>\s]+/gi) || [];
    const media = urls.filter(u => u.includes('.mp4') || u.includes('.webm') || u.includes('attachments') || u.includes('userupload'));
    console.log(JSON.stringify([...new Set(media)].slice(0, 15), null, 2));
  });
}).on('error', err => console.error(err));


