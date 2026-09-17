const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const USERS_FILE = path.join(__dirname, 'users.json');

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({
    users: [{ nama: "azka", password: "12345", role: "admin" }]
  }, null, 2));
}

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch (e) { return { users: [] }; }
}
function saveUsers(d) { fs.writeFileSync(USERS_FILE, JSON.stringify(d, null, 2)); }

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.url.indexOf('/api/login') === 0) {
    const u = new URL(req.url, 'http://localhost');
    const nama = (u.searchParams.get('nama') || '').trim();
    const password = (u.searchParams.get('password') || '').trim();
    const data = loadUsers();
    const user = data.users.find(x => x.nama.toLowerCase() === nama.toLowerCase());
    let r;
    if (!nama || !password) r = { success: false, message: 'Isi semua kolom!' };
    else if (!user) r = { success: false, message: 'Username gak terdaftar!' };
    else if (user.password !== password) r = { success: false, message: 'Password salah!' };
    else r = { success: true, message: 'Login berhasil!', user: { nama: user.nama, role: user.role || 'user' } };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(r));
    return;
  }

  if (req.url.indexOf('/api/register') === 0) {
    const u = new URL(req.url, 'http://localhost');
    const nama = (u.searchParams.get('nama') || '').trim();
    const password = (u.searchParams.get('password') || '').trim();
    let r;
    if (!nama || !password) r = { success: false, message: 'Isi nama dan password!' };
    else if (nama.length < 3) r = { success: false, message: 'Username min 3 karakter!' };
    else if (password.length < 5) r = { success: false, message: 'Password min 5 karakter!' };
    else {
      const data = loadUsers();
      if (data.users.find(x => x.nama.toLowerCase() === nama.toLowerCase())) {
        r = { success: false, message: 'Username udah terdaftar!' };
      } else {
        data.users.push({ nama, password, role: 'user', created: new Date().toISOString() });
        saveUsers(data);
        r = { success: true, message: 'Register berhasil! Silakan login.' };
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(r));
    return;
  }

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('File not found!'); return; }
    const ext = path.extname(filePath);
    let ct = 'text/html';
    if (ext === '.js') ct = 'application/javascript';
    else if (ext === '.css') ct = 'text/css';
    else if (ext === '.json') ct = 'application/json';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('AZKA PANEL - Port: ' + PORT);
});
