const db = supabase.createClient(DL.SUPABASE_URL, DL.SUPABASE_KEY);

// Hanya izinkan alamat di dalam situs ini
function aman(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next : null;
}

// Pesan galat dalam bahasa Indonesia
function terjemah(pesan) {
  const p = (pesan || '').toLowerCase();
  if (p.includes('invalid login')) return 'Email atau password salah.';
  if (p.includes('not confirmed')) return 'Email belum diverifikasi. Cek kotak masuk kamu.';
  if (p.includes('already registered')) return 'Email sudah terdaftar. Silakan masuk.';
  if (p.includes('at least')) return 'Password minimal 8 karakter.';
  if (p.includes('rate limit') || p.includes('too many'))
    return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.';
  if (p.includes('valid email') || p.includes('invalid email'))
    return 'Format email tidak valid.';
  return pesan || 'Terjadi kesalahan. Coba lagi.';
}