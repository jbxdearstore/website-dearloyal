(function () {
  function waktu(s) {
    return new Date(s).toLocaleString('id-ID',
      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

    function isiHtml(teks, dari) {
    return esc(teks || '').replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, u =>
      '<a href="' + u + '" target="_blank" rel="noopener noreferrer"' +
      (dari ? ' data-dari="' + esc(dari) + '"' : '') + '>' + u + '</a>');
  }

  function labelHtml(x) {
    if (x.jenis !== 'p') return '';
    if (x.tujuan === 'toko') {
      const logo = x.logo
        ? '<img src="' + esc(urlLogo(x.logo)) + '" alt="" width="14" height="14" onerror="this.remove()" ' +
          'style="width:14px;height:14px;object-fit:contain;border-radius:4px;background:#fff">'
        : '';
      return '<div class="lonceng-dari"><span class="lonceng-label" style="background:' +
        warnaAman(x.warna) + '">' + logo + esc(x.nama || 'Toko') + '</span></div>';
    }
    return '<div class="lonceng-dari"><span class="lonceng-label dl">DearLoyal</span></div>';
  }

  async function ambil() {
    const batas = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const r = await Promise.all([
      db.from('notifikasi').select('id,judul,isi,dibaca,dibuat_pada')
        .order('dibuat_pada', { ascending: false }).limit(30),
      db.from('pengumuman').select('id,judul,isi,dibuat_pada,tujuan,pengirim_nama,pengirim_warna,pengirim_logo')
        .gte('dibuat_pada', batas).order('dibuat_pada', { ascending: false }).limit(30),
      db.from('pengumuman_dibaca').select('pengumuman_id')
    ]);
    const sudah = new Set((r[2].data || []).map(x => x.pengumuman_id));
    const semua = (r[0].data || []).map(x => ({
      jenis: 'n', id: x.id, judul: x.judul, isi: x.isi, baca: x.dibaca, waktu: x.dibuat_pada
    })).concat((r[1].data || []).map(x => ({
    jenis: 'p', id: x.id, judul: x.judul, isi: x.isi, baca: sudah.has(x.id), waktu: x.dibuat_pada,
    tujuan: x.tujuan, nama: x.pengirim_nama, warna: x.pengirim_warna, logo: x.pengirim_logo
    })));
    semua.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
    return semua.slice(0, 30);
  }

  async function bangun(slot) {
    slot.dataset.siap = '1';
    const { data: s } = await db.auth.getSession();
    if (!s.session) return;
    const uid = s.session.user.id;

    slot.classList.add('lonceng');
    slot.innerHTML =
      '<button type="button" class="lonceng-tombol" aria-label="Notifikasi">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>' +
      '<path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
      '<span class="lonceng-angka"></span></button>' +
      '<div class="lonceng-panel"></div>';

    const tombol = slot.querySelector('.lonceng-tombol');
    const angka = slot.querySelector('.lonceng-angka');
    const panel = slot.querySelector('.lonceng-panel');
    let data = [];

    function hitung() {
      const n = data.filter(x => !x.baca).length;
      angka.textContent = n > 9 ? '9+' : String(n);
      angka.classList.toggle('ada', n > 0);
    }

    function gambar() {
      let h = '<div class="lonceng-judul">Notifikasi</div>';
      if (!data.length) {
        h += '<div class="lonceng-kosong">Belum ada kabar.</div>';
      } else {
        data.forEach(x => {
          h += '<div class="lonceng-item' + (x.baca ? '' : ' baru') + '">' + labelHtml(x) + '<b>' + esc(x.judul) +
            '</b>' + isiHtml(x.isi, x.tujuan === 'toko' ? (x.nama || 'toko ini') : null) +
            '<div class="redup">' + waktu(x.waktu) + '</div></div>';
        });
      }
      panel.innerHTML = h;
    }

    async function segarkan() { data = await ambil(); hitung(); }

    async function tandaiBaca() {
      const n = data.filter(x => x.jenis === 'n' && !x.baca).map(x => x.id);
      const p = data.filter(x => x.jenis === 'p' && !x.baca).map(x => x.id);
      if (n.length) await db.from('notifikasi').update({ dibaca: true }).in('id', n);
      if (p.length) await db.from('pengumuman_dibaca').upsert(
        p.map(id => ({ user_id: uid, pengumuman_id: id })),
        { onConflict: 'user_id,pengumuman_id', ignoreDuplicates: true });
      data.forEach(x => { x.baca = true; });
      hitung();
    }

    tombol.onclick = async (e) => {
      e.stopPropagation();
      const buka = !panel.classList.contains('buka');
      document.querySelectorAll('.lonceng-panel.buka').forEach(p => p.classList.remove('buka'));
      if (!buka) return;
      await segarkan();
      gambar();
      panel.classList.add('buka');
      tandaiBaca();
    };
      panel.onclick = (e) => {
      e.stopPropagation();
      const a = e.target.closest('a[data-dari]');
      if (a && !confirm('Kamu akan membuka tautan dari ' + a.dataset.dari +
        ', bukan dari DearLoyal. Lanjutkan hanya kalau kamu percaya.')) e.preventDefault();
    };

    await segarkan();
    const jam = setInterval(() => {
      if (!document.contains(slot)) return clearInterval(jam);
      if (!panel.classList.contains('buka')) segarkan();
    }, 60000);
  }

  function pindai() {
    document.querySelectorAll('.slot-lonceng:not([data-siap])').forEach(bangun);
  }
  document.addEventListener('click', () => {
    document.querySelectorAll('.lonceng-panel.buka').forEach(p => p.classList.remove('buka'));
  });
  new MutationObserver(pindai).observe(document.documentElement, { childList: true, subtree: true });
  pindai();
})();