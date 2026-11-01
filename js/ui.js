const IKON = { bintang: '★', hati: '♥', kopi: '☕', centang: '✓', mahkota: '♛' };

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function warnaAman(w) {
  return /^#[0-9a-fA-F]{6}$/.test(w) ? w : '#2563eb';
}

function htmlStempel(jumlah, target, ikon) {
  const simbol = IKON[ikon] || IKON.bintang;
  const kolom = target === 6 ? 3 : target === 8 ? 4 : target === 10 ? 5 : 6;
  let h = '';
  for (let i = 1; i <= target; i++) {
    const isi = i <= jumlah;
    h += '<span class="st' + (isi ? ' isi' : '') + '" style="animation-delay:' +
         (i * 40) + 'ms">' + (isi ? simbol : i) + '</span>';
  }
  return '<div class="stg" style="grid-template-columns:repeat(' + kolom + ',1fr)">' + h + '</div>';
}

function htmlKartu(k) {
  const mati = k.status_toko !== 'aktif';
  const sisa = Math.max(k.target_stempel - k.jumlah_stempel, 0);
  const info = mati ? 'Toko sedang tidak aktif'
    : sisa === 0 ? 'Kartu penuh! Tunjukkan ke kasir untuk klaim hadiah.'
    : 'Kumpulkan ' + sisa + ' stempel lagi untuk: ' + esc(k.teks_hadiah);
  return '<a class="kt' + (mati ? ' mati' : '') + '" style="--w:' + warnaAman(k.warna) +
    '" href="/t/' + esc(k.slug) + '">' +
    '<div class="kt-atas"><span style="display:flex;align-items:center;gap:8px">' +
    htmlLogo(k.logo_path, 28, k.toko_nama) + '<strong>' + esc(k.toko_nama) + '</strong></span><span>' +
    k.jumlah_stempel + '/' + k.target_stempel + '</span></div>' +
    htmlStempel(k.jumlah_stempel, k.target_stempel, k.ikon) +
    '<div class="kt-info">' + info + '</div></a>';
}

function urlLogo(path) {
  return path ? DL.SUPABASE_URL + '/storage/v1/object/public/logo/' + encodeURI(path) : '';
}

function htmlLogo(path, px, nama) {
  const u = urlLogo(path);
  if (!u) return '';
  return '<img src="' + esc(u) + '" alt="Logo ' + esc(nama || '') + '" width="' + px +
    '" height="' + px + '" style="width:' + px + 'px;height:' + px +
    'px;object-fit:contain;border-radius:12px;background:#fff">';
}