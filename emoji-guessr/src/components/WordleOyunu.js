import React, { useState, useEffect } from 'react';
import data from '../data/data.json';
import '../styles/WordleOyunu.css';

const WordleOyunu = () => {
  const [secilenSoru, setSecilenSoru] = useState(null);
  const [tahmin, setTahmin] = useState('');
  const [tahminler, setTahminler] = useState([]);
  const [oyunDurumu, setOyunDurumu] = useState('devam');
  const maksimumTahmin = 6;

  useEffect(() => {
    // Rastgele soru seç
    const rastgeleSoru = data.data[Math.floor(Math.random() * data.data.length)];
    setSecilenSoru(rastgeleSoru);
  }, []);

  const tahminKontrol = (e) => {
    e.preventDefault();
    if (!tahmin) return;

    const yeniTahmin = tahmin.toUpperCase();
    const dogruCevap = secilenSoru.cevap.toUpperCase();

    if (yeniTahmin.length !== dogruCevap.length) {
      alert(`Lütfen ${dogruCevap.length} harfli bir kelime girin!`);
      return;
    }

    const sonuc = yeniTahmin.split('').map((harf, index) => {
      if (harf === dogruCevap[index]) {
        return { harf, durum: 'dogru' };
      } else if (dogruCevap.includes(harf)) {
        return { harf, durum: 'var' };
      } else {
        return { harf, durum: 'yanlis' };
      }
    });

    const yeniTahminler = [...tahminler, sonuc];
    setTahminler(yeniTahminler);
    setTahmin('');

    if (yeniTahmin === dogruCevap) {
      setOyunDurumu('kazandi');
    } else if (yeniTahminler.length >= maksimumTahmin) {
      setOyunDurumu('kaybetti');
    }
  };

  if (!secilenSoru) return <div>Yükleniyor...</div>;

  return (
    <div className="wordle-container">
      <h1>Emoji Tahmin Oyunu</h1>
      <div className="kategori">Kategori: {secilenSoru.kategori}</div>
      <div className="zorluk">Zorluk: {secilenSoru.zorluk}</div>
      <div className="emojiler">{secilenSoru.emojiler}</div>
      
      <div className="tahminler">
        {tahminler.map((tahminSatiri, satirIndex) => (
          <div key={satirIndex} className="tahmin-satiri">
            {tahminSatiri.map((tahminHarf, harfIndex) => (
              <div key={harfIndex} className={`harf ${tahminHarf.durum}`}>
                {tahminHarf.harf}
              </div>
            ))}
          </div>
        ))}
      </div>

      {oyunDurumu === 'devam' && (
        <form onSubmit={tahminKontrol}>
          <input
            type="text"
            value={tahmin}
            onChange={(e) => setTahmin(e.target.value)}
            maxLength={secilenSoru.cevap.length}
            disabled={oyunDurumu !== 'devam'}
            placeholder={`${secilenSoru.cevap.length} harfli kelime`}
          />
          <button type="submit">Tahmin Et</button>
        </form>
      )}

      {oyunDurumu === 'kazandi' && (
        <div className="sonuc kazandi">
          <p>Tebrikler! Doğru bildiniz!</p>
          <p className="aciklama">{secilenSoru.aciklama}</p>
        </div>
      )}
      
      {oyunDurumu === 'kaybetti' && (
        <div className="sonuc kaybetti">
          <p>Oyun bitti! Doğru cevap: {secilenSoru.cevap}</p>
          <p className="aciklama">{secilenSoru.aciklama}</p>
        </div>
      )}
    </div>
  );
};

export default WordleOyunu;