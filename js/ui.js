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

/* ---------- Kartu ukuran tetap 8:5 ---------- */
const IKON_SVG = {
  bintang: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  hati: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  kopi: 'M4 3h14a1 1 0 0 1 1 1v1h1.5A2.5 2.5 0 0 1 23 7.5v2a2.5 2.5 0 0 1-2.5 2.5H19v1a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V3zm15 4v3h1.5a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H19zM3 20h16v2H3z',
  centang: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  mahkota: 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z',
  api: 'M12 2c1 3.5-1 5-2.5 7C8 11 8 13 9 14.5 7.3 14 6 12.3 6 10.5 4 12.5 3 15 4.2 17.8 5.4 20.5 8.5 22 12 22s6.6-1.5 7.8-4.2C21 15 19.5 12 17.5 10c-.3 1.6-1.2 2.6-2.2 3 .8-3.8-.3-8.2-3.3-11z',
  petir: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  daun: 'M20 4C10 4 4 9 4 16c0 1.3.3 2.5.7 3.6l1.7-1.2C6.1 17.6 6 16.8 6 16c0-3 2.5-8 12-10-5 3-8 6.5-9.5 11.6.9.3 1.9.4 2.9.4 7 0 10.6-6 8.6-14z',
  hadiah: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z',
  jempol: 'M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z',
  piala: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  matahari: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zM11 20h2v3h-2zM1 11h3v2H1zM20 11h3v2h-3zM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4zM16.3 17.7l1.4-1.4 2.1 2.1-1.4 1.4zM16.3 6.3l2.1-2.1 1.4 1.4-2.1 2.1zM4.2 18.4l2.1-2.1 1.4 1.4-2.1 2.1z',
  bulan: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  tetesan: 'M12 2.7C9.5 6 5.5 10 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10 14.5 6 12 2.7z',
  tas: 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2z',
  permata: 'M6 3h12l4 6-10 13L2 9l4-6z'
};

const RE_ISI_IKON = /^(<(path|circle|rect|ellipse|polygon|polyline|line)( (d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|transform|fill|fill-rule|clip-rule|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|opacity|fill-opacity|stroke-opacity)="[0-9A-Za-z .,()#%+-]*")*\/>)+$/;
const RE_VB = /^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/;

function svgKustom(k) {
  if (!k || typeof k.isi !== 'string' || typeof k.vb !== 'string') return null;
  if (k.isi.length > 4096 || !RE_VB.test(k.vb) || !RE_ISI_IKON.test(k.isi)) return null;
  if (/url\(/i.test(k.isi) || / (fill|stroke)="(?!none"|currentColor")/.test(k.isi)) return null;
  return '<svg viewBox="' + k.vb + '" fill="currentColor" aria-hidden="true">' + k.isi + '</svg>';
}

function svgIkon(kunci, kustom) {
  if (typeof kunci === 'string' && /^c:[0-9]+$/.test(kunci)) {
    return svgKustom(kustom) || svgIkon('bintang');
  }
  const d = IKON_SVG[kunci] || IKON_SVG.bintang;
  return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' + d + '"/></svg>';
}

function htmlPilihIkon(aktif) {
  return Object.keys(IKON_SVG).map(k =>
    '<button type="button" class="ik-pilih' + (k === aktif ? ' pilih' : '') + '" data-ikon="' + k +
    '" aria-label="Ikon ' + k + '">' + svgIkon(k) + '</button>').join('');
}

function latarKartu(w, d) {
  const g = d.gaya || 'solid';
  if (g === 'right') return 'linear-gradient(135deg,' + w + ',color-mix(in srgb,' + w + ' 65%,#000))';
  if (g === 'left') return 'linear-gradient(225deg,' + w + ',color-mix(in srgb,' + w + ' 65%,#000))';
  if (g === 'vertikal') return 'linear-gradient(180deg,color-mix(in srgb,' + w + ' 85%,#fff),color-mix(in srgb,' + w + ' 70%,#000))';
  if (g === 'horizontal') return 'linear-gradient(0deg,color-mix(in srgb,' + w + ' 85%,#fff),color-mix(in srgb,' + w + ' 70%,#000))';
  if (g === 'highlight') return 'radial-gradient(circle at 15% 0%,color-mix(in srgb,' + w + ' 70%,#fff),' + w + ' 45%,color-mix(in srgb,' + w + ' 55%,#000))';
  if (g === 'gradient') return 'linear-gradient(135deg,' + w + ',' + (d.w_latar2 ? warnaAman(d.w_latar2) : '#7c3aed') + ')';
  return w;
}

function gayaKartu(warna, d) {
  d = d || {};
  const w = warnaAman(warna);
  const teks = d.w_teks ? warnaAman(d.w_teks) : '#ffffff';
  const terisi = d.w_terisi ? warnaAman(d.w_terisi) : '#ffffff';
  const ikon = d.w_ikon ? warnaAman(d.w_ikon) : w;
  const garis = d.w_garis ? warnaAman(d.w_garis) : terisi;
  const angka = d.w_angka ? warnaAman(d.w_angka) : teks;
  const bg = latarKartu(w, d);
  return '--bg:' + bg + ';--tx:' + teks + ';--si:' + terisi + ';--ik:' + ikon +
         ';--gr:' + garis + ';--an:' + angka;
}

function urlLatar(p) { return DL.SUPABASE_URL + '/storage/v1/object/public/latar/' + encodeURI(p); }

function htmlLatar(l) {
  if (!l || typeof l.p !== 'string' || !/^[0-9a-f-]{36}\/latar-[0-9]{1,16}\.webp$/.test(l.p)) return '';
  const n = (v, lo, hi, def) => Number.isFinite(Number(v)) ? Math.min(hi, Math.max(lo, Number(v))) : def;
  return '<img class="kd-latar" alt="" draggable="false" src="' + esc(urlLatar(l.p)) + '" style="width:' +
    n(l.w, 100, 1000, 100) + '%;left:' + n(l.l, -1000, 0, 0) + '%;top:' + n(l.t, -1000, 0, 0) + '%">';
}

function kartuDesain(o) {
  const d = o.desain || {};
  const t = d.tampil || {};
  const nampak = k => t[k] !== false;
  const hadiah = false;
  const target = o.target;
  const kolom = target === 6 ? 3 : target === 8 ? 4 : target === 10 ? 5 : 6;
  let st = '';
  for (let i = 1; i <= target; i++) {
    const isi = i <= o.isi;
    st += '<span class="kd-st' + (isi ? ' isi' : '') + '" style="animation-delay:' + (i * 40) + 'ms">' +
          (isi ? svgIkon(o.ikon, d.ikon_kustom) : i) + '</span>';
  }
  const sisa = Math.max(target - o.isi, 0);
  const teksHadiah = sisa === 0 ? 'Kartu penuh! Klaim hadiahmu di kasir.'
    : 'Kumpulkan ' + sisa + ' stempel lagi untuk: ' + esc(o.hadiah || '-');
  const logo = (nampak('logo') && o.logo) ? htmlLogo(o.logo, 28, o.nama) : '';
  const nama = nampak('nama') ? '<span>' + esc(o.nama) + '</span>' : '';
  return '<div class="kd' + (hadiah ? ' ada-hadiah' : '') + '" style="' + gayaKartu(o.warna, d) + '">' +
    htmlLatar(d.latar) +
    '<div class="kd-isi">' +
      '<div class="kd-atas"><div class="kd-nama">' + logo + nama + '</div>' +
        (nampak('jumlah') ? '<div class="kd-jml">' + o.isi + '/' + target + '</div>' : '') + '</div>' +
      '<div class="kd-grid" style="--k:' + kolom + '">' + st + '</div>' +
      '<div class="kd-hadiah">' + (hadiah ? teksHadiah : '') + '</div>' +
    '</div></div>';
}

function htmlKartu(k) {
  const mati = k.status_toko !== 'aktif';
  const sisa = Math.max(k.target_stempel - k.jumlah_stempel, 0);
  const info = mati ? 'Toko sedang tidak aktif'
    : sisa === 0 ? 'Kartu penuh! Tunjukkan ke kasir untuk klaim hadiah.'
    : 'Kumpulkan ' + sisa + ' stempel lagi untuk: ' + esc(k.teks_hadiah);
  return '<a class="kd-bungkus' + (mati ? ' mati' : '') + '" href="/t/' + esc(k.slug) + '">' +
    kartuDesain({
      nama: k.toko_nama, logo: k.logo_path, warna: k.warna, ikon: k.ikon,
      isi: k.jumlah_stempel, target: k.target_stempel, hadiah: k.teks_hadiah, desain: k.desain
    }) + '<div class="kd-info">' + info + '</div></a>';
}