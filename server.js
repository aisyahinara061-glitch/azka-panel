module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  const url = req.url;
  
  // LOGIN
  if (url.indexOf('/api/login') === 0) {
    const u = new URL(url, 'http://localhost');
    const nama = (u.searchParams.get('nama') || '').trim();
    const password = (u.searchParams.get('password') || '').trim();
    
    const users = [
      { nama: 'azka', password: '12345', role: 'admin' },
      { nama: 'admin', password: 'admin123', role: 'admin' }
    ];
    
    const user = users.find(x => x.nama.toLowerCase() === nama.toLowerCase());
    let r;
    if (!nama || !password) r = { success: false, message: 'Isi semua kolom!' };
    else if (!user) r = { success: false, message: 'Username gak terdaftar!' };
    else if (user.password !== password) r = { success: false, message: 'Password salah!' };
    else r = { success: true, message: 'Login berhasil!', user: { nama: user.nama, role: user.role } };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(r));
  }
  
  // PING
  if (url.indexOf('/api/ping') === 0) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({ success: true }));
  }
  
  // DEFAULT
  res.setHeader('Content-Type', 'application/json');
  res.status(404).send(JSON.stringify({ error: 'Not found' }));
};
