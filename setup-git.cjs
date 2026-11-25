const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function getMinGitUrl() {
  return new Promise((resolve, reject) => {
    https.get('https://api.github.com/repos/git-for-windows/git/releases/latest', {
      headers: { 'User-Agent': 'Node.js' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        const asset = json.assets.find(a => a.name.startsWith('MinGit-') && a.name.endsWith('-64-bit.zip'));
        if (asset) {
          resolve(asset.browser_download_url);
        } else {
          reject(new Error('MinGit asset not found'));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching MinGit release URL...');
  const url = await getMinGitUrl();
  console.log('Found URL:', url);

  const zipPath = path.join(process.env.TEMP, 'mingit.zip');
  console.log('Downloading MinGit to:', zipPath);
  await downloadFile(url, zipPath);
  console.log('Download complete.');

  const installDir = 'C:\\Users\\admin\\AppData\\Local\\Programs\\git';
  fs.mkdirSync(installDir, { recursive: true });

  console.log('Extracting to:', installDir);
  execSync(`tar -xf "${zipPath}" -C "${installDir}"`, { stdio: 'inherit' });
  console.log('MinGit extracted successfully!');

  const gitExe = path.join(installDir, 'cmd', 'git.exe');
  console.log('Testing git executable:', gitExe);
  execSync(`"${gitExe}" --version`, { stdio: 'inherit' });
}

main().catch(console.error);
