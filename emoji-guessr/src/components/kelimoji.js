import React, { useState, useEffect } from 'react';
import data from '../data/data.json';
import '../styles/kelimoji.css';

const Kelimoji = () => {
  const [secilenSoru, setSecilenSoru] = useState(null);
  const [aktifTahmin, setAktifTahmin] = useState('');
  const [tahminler, setTahminler] = useState([]);
  const [oyunDurumu, setOyunDurumu] = useState('devam');
  const [kullanilmisHarfler, setKullanilmisHarfler] = useState({});
  const SATIR_SAYISI = 6;

  const KLAVYE_SATIRLARI = [
    ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
    ['ENTER', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'SİL']
  ];

  useEffect(() => {
    const rastgeleSoru = data.data[Math.floor(Math.random() * data.data.length)];
    setSecilenSoru(rastgeleSoru);
  }, []);

  useEffect(() => {
    if (!secilenSoru) return;

    const handleKeyPress = (event) => {
      if (oyunDurumu !== 'devam') return;

      const turkceKarakterler = {
        'i': 'İ',
        'ı': 'I',
        'ğ': 'Ğ',
        'ü': 'Ü',
        'ş': 'Ş',
        'ö': 'Ö',
        'ç': 'Ç'
      };

      if (event.key === 'Enter') {
        tahminKontrol();
      } else if (event.key === 'Backspace') {
        harfSil();
      } else {
        const harf = event.key.toUpperCase();
        const turkceHarf = turkceKarakterler[event.key] || harf;
        
        if (/^[A-ZÇĞİÖŞÜ]$/.test(turkceHarf)) {
          harfEkle(turkceHarf);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [secilenSoru, aktifTahmin, oyunDurumu]);

  const harfEkle = (harf) => {
    if (!secilenSoru) return;
    
    if (aktifTahmin.length < secilenSoru.cevap.length && harf !== 'ENTER' && harf !== 'SİL') {
      setAktifTahmin(prev => prev + harf);
    }
  };

  const harfSil = () => {
    setAktifTahmin(prev => prev.slice(0, -1));
  };

  const tahminKontrol = () => {
    if (!secilenSoru) return;

    if (aktifTahmin.length !== secilenSoru.cevap.length) {
      alert(`Lütfen ${secilenSoru.cevap.length} harfli bir kelime girin!`);
      return;
    }

    const dogruCevap = secilenSoru.cevap.toUpperCase();
    const yeniKullanilmisHarfler = { ...kullanilmisHarfler };

    const sonuc = aktifTahmin.split('').map((harf, index) => {
      if (harf === dogruCevap[index]) {
        yeniKullanilmisHarfler[harf] = 'dogru';
        return { harf, durum: 'dogru' };
      } else if (dogruCevap.includes(harf)) {
        if (yeniKullanilmisHarfler[harf] !== 'dogru') {
          yeniKullanilmisHarfler[harf] = 'var';
        }
        return { harf, durum: 'var' };
      } else {
        yeniKullanilmisHarfler[harf] = 'yanlis';
        return { harf, durum: 'yanlis' };
      }
    });

    setKullanilmisHarfler(yeniKullanilmisHarfler);
    const yeniTahminler = [...tahminler, sonuc];
    setTahminler(yeniTahminler);
    setAktifTahmin('');

    if (aktifTahmin === dogruCevap) {
      setOyunDurumu('kazandi');
    } else if (yeniTahminler.length >= SATIR_SAYISI) {
      setOyunDurumu('kaybetti');
    }
  };

  const klavyeTusunaBasildi = (harf) => {
    if (oyunDurumu !== 'devam') return;

    if (harf === 'ENTER') {
      tahminKontrol();
    } else if (harf === 'SİL') {
      harfSil();
    } else {
      harfEkle(harf);
    }
  };

  const renderTahminSatirlari = () => {
    if (!secilenSoru) return null;

    const satirlar = [];
    const harfSayisi = secilenSoru.cevap.length;
    
    // Yapılan tahminler
    for (let i = 0; i < tahminler.length; i++) {
      satirlar.push(
        <div key={`tahmin-${i}`} className="tahmin-satiri">
          {tahminler[i].map((harf, harfIndex) => (
            <div key={harfIndex} className={`harf ${harf.durum}`}>
              {harf.harf}
            </div>
          ))}
        </div>
      );
    }
    
    // Aktif tahmin satırı
    if (tahminler.length < SATIR_SAYISI) {
      satirlar.push(
        <div key="aktif" className="tahmin-satiri">
          {Array(harfSayisi).fill(null).map((_, index) => (
            <div key={index} className="harf">
              {aktifTahmin[index] || ''}
            </div>
          ))}
        </div>
      );
    }
    
    // Kalan boş satırlar
    for (let i = tahminler.length + 1; i < SATIR_SAYISI; i++) {
      satirlar.push(
        <div key={`bos-${i}`} className="tahmin-satiri">
          {Array(harfSayisi).fill(null).map((_, index) => (
            <div key={index} className="harf bos"></div>
          ))}
        </div>
      );
    }
    
    return satirlar;
  };

  const renderKlavye = () => {
    return (
      <div className="klavye">
        {KLAVYE_SATIRLARI.map((satir, satirIndex) => (
          <div key={satirIndex} className="klavye-satiri">
            {satir.map((harf) => (
              <button
                key={harf}
                className={`klavye-tus ${kullanilmisHarfler[harf] || ''} ${
                  harf === 'ENTER' || harf === 'SİL' ? 'genis-tus' : ''
                }`}
                onClick={() => klavyeTusunaBasildi(harf)}
                disabled={oyunDurumu !== 'devam'}
              >
                {harf}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (!secilenSoru) return <div>Yükleniyor...</div>;

  return (
    <div className="wordle-container">
      <div className="oyun-bilgileri">
        <div className="emoji-ipucu">
          <div className="emojiler">{secilenSoru.emojiler}</div>
          <div className="ipucu-container">
            <div className="kategori">Kategori: {secilenSoru.kategori}</div>
            <div className="aciklama">İpucu: {secilenSoru.aciklama}</div>
          </div>
        </div>
      </div>
      

      <div className="tahminler">
        {renderTahminSatirlari()}
      </div>
  
      {renderKlavye()}
  
    
  
      {/* Popup'lar */}
      {oyunDurumu !== 'devam' && (
        <div className="popup-overlay">
          <div className={`popup ${oyunDurumu}`}>
            <div className="popup-emoji">
              {oyunDurumu === 'kazandi' ? '🎉' : '😔'}
            </div>
            <div className="popup-baslik">
              {oyunDurumu === 'kazandi' ? 'Tebrikler!' : 'Oyun Bitti!'}
            </div>
            <div className="popup-mesaj">
              {oyunDurumu === 'kazandi' 
                ? 'Doğru bildiniz!'
                : `Doğru cevap: ${secilenSoru.cevap}`
              }
            </div>
            <button 
              className="yeni-oyun-btn"
              onClick={() => window.location.reload()}
            >
              Yeni Oyun
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kelimoji;