#!/usr/bin/env node
/*
 * Harmonices bridge
 *  - serves ../index.html on http://localhost:20809 (a secure context, so Web MIDI and Web Bluetooth work)
 *  - relays Ableton Link (tempo, beat, play state, peers) to the page over a WebSocket at /link
 * Only listens on 127.0.0.1 and only accepts WebSocket connections from localhost pages.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 20809);
const PAGE = path.join(__dirname, '..', 'index.html');

let link = null;
try {
  const AbletonLink = require('abletonlink');
  link = new AbletonLink(84, 4, true);
  link.enablePlayStateSync();
} catch (e) {
  console.warn('Ableton Link could not load (' + e.message + '). The page and MIDI still work.');
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    fs.createReadStream(PAGE).pipe(res);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});

const localOrigin = o => !o || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o) || o === 'null';
const wss = new WebSocketServer({
  server,
  path: '/link',
  verifyClient: ({ origin }) => localOrigin(origin),
});

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'hello', link: !!link }));
  ws.on('message', raw => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (!link) return;
    if (m.type === 'bpm' && Number.isFinite(m.bpm) && m.bpm >= 20 && m.bpm <= 999) link.bpm = m.bpm;
    if (m.type === 'play') m.playing ? link.play() : link.stop();
  });
});

if (link) {
  link.startUpdate(15, (beat, phase, bpm, playing, peers) => {
    if (!wss.clients.size) return;
    const msg = JSON.stringify({ type: 'link', beat, phase, bpm, playing, peers, quantum: link.quantum });
    for (const c of wss.clients) if (c.readyState === 1) c.send(msg);
  });
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Harmonices: open http://localhost:${PORT} in Chrome or Edge`);
  console.log(`Ableton Link: ${link ? 'on (the session shows up in Live and other Link apps)' : 'not available'}`);
});
