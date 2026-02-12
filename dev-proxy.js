// Simple API proxy for local dev - routes /api/auth/* → :3851, /api/game/* → :3852
const http = require('http');

const proxy = (target, req, res) => {
  const url = new URL(target + req.url);
  const opts = { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method: req.method, headers: { ...req.headers, host: url.host } };
  const p = http.request(opts, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  p.on('error', (e) => { res.writeHead(502); res.end('Bad Gateway: ' + e.message); });
  req.pipe(p);
};

http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.url.startsWith('/api/auth/')) {
    req.url = req.url.replace('/api/auth', '');
    proxy('http://127.0.0.1:3851', req, res);
  } else if (req.url.startsWith('/api/game/')) {
    req.url = req.url.replace('/api/game', '');
    proxy('http://127.0.0.1:3852', req, res);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  }
}).listen(3853, () => console.log('API proxy on :3853'));
