import { spawn } from 'node:child_process';

// Vite dev 서버 실행 후 포트 감지하여 Chrome으로 자동 오픈
// macOS 환경 전제: 'open -a "Google Chrome" <URL>' 사용

const vite = spawn('npm', ['run', 'dev', '--silent'], { stdio: ['ignore', 'pipe', 'pipe'] });

let opened = false;

function tryOpen(line) {
  if (opened) return;
  const m = line.match(/Local:\s*(http:\/\/localhost:\d+)/);
  if (m) {
    opened = true;
    const url = m[1];
    console.log('[dev:chrome] Detected Vite URL:', url);
    const opener = spawn('open', ['-a', 'Google Chrome', url]);
    opener.on('exit', code => {
      if (code !== 0) console.warn('[dev:chrome] Chrome open command exited with code', code);
    });
  }
}

vite.stdout.on('data', buf => {
  const text = buf.toString();
  process.stdout.write(text);
  text.split(/\r?\n/).forEach(tryOpen);
});

vite.stderr.on('data', buf => {
  process.stderr.write(buf.toString());
});

vite.on('exit', code => {
  console.log('[dev:chrome] Vite process exited with code', code);
});

