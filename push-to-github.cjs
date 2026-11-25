const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const git = 'C:\\Users\\admin\\AppData\\Local\\Programs\\git\\cmd\\git.exe';

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
    if (out.trim()) console.log(out.trim());
    return { success: true, output: out };
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.stdout) console.log(`stdout: ${err.stdout}`);
    if (err.stderr) console.error(`stderr: ${err.stderr}`);
    return { success: false, error: err };
  }
}

async function main() {
  // Check if .git exists
  if (!fs.existsSync('.git')) {
    run(`"${git}" init`);
  }

  // Set user info if not configured
  run(`"${git}" config user.name "HimHacks"`);
  run(`"${git}" config user.email "himhacks@users.noreply.github.com"`);

  // Add all files
  run(`"${git}" add .`);

  // Commit
  run(`"${git}" commit -m "feat: launch WhatsApp End-to-End Encryption interactive experience"`);

  // Remote setup
  run(`"${git}" remote remove origin`);
  run(`"${git}" remote add origin https://github.com/HimHacks/N.git`);
  run(`"${git}" branch -M main`);

  // Push
  console.log('Attempting git push to origin main...');
  const pushRes = run(`"${git}" push -u origin main`);

  if (!pushRes.success) {
    console.log('Push may need force or authentication check. Trying git push --force...');
    run(`"${git}" push -u origin main --force`);
  }
}

main().catch(console.error);
