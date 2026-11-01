function matriksQr(teks) {
  const q = qrcode(0, 'M');
  q.addData(teks);
  q.make();
  const n = q.getModuleCount();
  const m = [];
  for (let r = 0; r < n; r++) {
    m.push([]);
    for (let c = 0; c < n; c++) m[r].push(q.isDark(r, c));
  }
  return m;
}

function svgQr(m) {
  const n = m.length, tepi = 4, total = n + tepi * 2;
  let kotak = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (m[r][c]) {
        kotak += '<rect x="' + (c + tepi) + '" y="' + (r + tepi) +
                 '" width="1.02" height="1.02" rx=".2"/>';
      }
    }
  }
  return '<svg viewBox="0 0 ' + total + ' ' + total +
    '" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">' +
    '<rect width="100%" height="100%" fill="#fff"/><g fill="#000">' + kotak + '</g></svg>';
}

function unduhQr(m, namaFile) {
  const n = m.length, tepi = 4, skala = 12;
  const ukuran = (n + tepi * 2) * skala;
  const cv = document.createElement('canvas');
  cv.width = cv.height = ukuran;
  const x = cv.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, ukuran, ukuran);
  x.fillStyle = '#000';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!m[r][c]) continue;
      const px = (c + tepi) * skala, py = (r + tepi) * skala;
      if (x.roundRect) {
        x.beginPath();
        x.roundRect(px, py, skala + 0.5, skala + 0.5, skala * 0.2);
        x.fill();
      } else {
        x.fillRect(px, py, skala + 0.5, skala + 0.5);
      }
    }
  }
  cv.toBlob(b => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = namaFile;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
}