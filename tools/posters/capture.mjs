// Captures frames of each story for the hub: the story stopped at a few moments of its scroll,
// with the text cards hidden, as WebP at two sizes (desktop landscape, phone portrait).
//
//   node tools/posters/capture.mjs [http://localhost:8774] [only-this-slug]
//
// Needs Google Chrome and a server for the built site (tools/serve.js). Talks to Chrome over the
// DevTools protocol directly, so there is nothing to install.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOTS } from './shots.mjs';

const BASE = process.argv[2] || 'http://localhost:8774';
const ONLY = process.argv[3] || '';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'img', 'posters');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const SIZES = {
  wide: { width: 1600, height: 1000, deviceScaleFactor: 1.5, mobile: false },
  tall: { width: 430, height: 860, deviceScaleFactor: 2, mobile: true },
};
// hide everything that is not the picture: cards, titles, the rail, the mockup flag
const HIDE = `.st-steps,.st-rail,.st-progress,.st-mockflag,.st-cue,.st-open-kick,.wp-site-blocks>header,#bar,.cookiebar,#toTop,.st-trip,.fly-bar,.pn-dir,.cs-tag{visibility:hidden!important}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'nfs-cap-'))}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });

let targets;
for (let i = 0; i < 50 && !targets; i++) {
  await sleep(200);
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch {}
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const waiters = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method) waiters.filter((w) => w.method === m.method).forEach((w) => { w.done(); waiters.splice(waiters.indexOf(w), 1); });
});
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const once = (method) => new Promise((done) => waiters.push({ method, done }));
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send('Page.enable');
for (const story of SHOTS) {
  if (ONLY && story.slug !== ONLY) continue;
  for (const [size, metrics] of Object.entries(SIZES)) {
    await send('Emulation.setDeviceMetricsOverride', metrics);
    await send('Emulation.setTouchEmulationEnabled', { enabled: metrics.mobile });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: `${BASE}/${story.slug}/` });
    await loaded;
    await sleep(900);
    await evaluate(`{ const st = document.createElement('style'); st.textContent = ${JSON.stringify(HIDE)}; document.head.append(st); }`);
    for (const [i, [sec, step]] of story.frames.entries()) {
      // put the step's middle in the middle of the screen, so the engine makes it the active one
      await evaluate(`(async () => {
        const step = document.querySelector(${JSON.stringify(sec)}).querySelectorAll('.st-step')[${step}];
        const r = step.getBoundingClientRect();
        const y = r.top + scrollY + r.height / 2 - innerHeight / 2;
        for (const f of [.96, .99, 1]) { scrollTo(0, y * f); dispatchEvent(new Event('scroll')); await new Promise(r => setTimeout(r, 220)); }
      })()`);
      await sleep(2700);
      const { result } = await send('Page.captureScreenshot', { format: 'webp', quality: size === 'wide' ? 80 : 78 });
      const file = join(OUT, `${story.slug}-${i + 1}-${size}.webp`);
      writeFileSync(file, Buffer.from(result.data, 'base64'));
      console.log('captured', file.replace(OUT + '/', ''), Math.round(result.data.length * 0.75 / 1024) + 'KB');
    }
  }
}
ws.close();
chrome.kill();
