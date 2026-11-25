const fs = require('fs');
const html = fs.readFileSync('temp_shader_template.html', 'utf8');

// Look for text in JSON or Next.js RSC payload
const matches = [];
const strRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
let match;
while ((match = strRegex.exec(html)) !== null) {
  const val = match[1];
  if (val.includes('shader') || val.includes('Lumen') || val.includes('template') || val.includes('Iridescence') || val.includes('shadcn')) {
    if (val.length < 300) matches.push(val);
  }
}
console.log('Sample matched strings:');
console.log(matches.slice(0, 30));
