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
    setSecilenSoru({
      ...rastgeleSoru,
      cevap: rastgeleSoru.cevap.toUpperCase() // Cevabı uppercase yapıyoruz
    });
  }, []);

  useEffect(() => {
    if (!secilenSoru) return;

    const handleKeyPress = (event) => {
      if (oyunDurumu !== 'devam') return;

      const key = event.key.toUpperCase(); // Tuş girişini uppercase yapıyoruz
      
      if (key === 'ENTER') {
        tahminKontrol();
      } else if (key === 'BACKSPACE') {
        setAktifTahmin(prev => prev.slice(0, -1));
      } else if (/^[A-ZÇĞİÖŞÜ]$/.test(key) && aktifTahmin.length < secilenSoru.cevap.length) {
        setAktifTahmin(prev => prev + key); // Uppercase harf ekliyoruz
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [secilenSoru, aktifTahmin, oyunDurumu]);

  const harfEkle = (harf) => {
    if (!secilenSoru) return;
    
    if (harf === 'ENTER') {
      tahminKontrol();
    } else if (harf === 'SİL') {
      setAktifTahmin(prev => prev.slice(0, -1));
    } else if (aktifTahmin.length < secilenSoru.cevap.length) {
      setAktifTahmin(prev => prev + harf.toUpperCase()); // Harfi uppercase yaparak ekliyoruz
    }
  };

  const tahminKontrol = () => {
    if (!secilenSoru) return;
    
    const upperTahmin = aktifTahmin.toUpperCase(); // Tahmini uppercase yapıyoruz
    
    if (upperTahmin.length !== secilenSoru.cevap.length) {
      alert(`Lütfen ${secilenSoru.cevap.length} harfli bir kelime girin!`);
      return;
    }

    const yeniTahmin = upperTahmin.split('').map((harf, index) => ({
      harf,
      durum: 'beklemede'
    }));

    const hedefKelime = secilenSoru.cevap.split('');
    const kullanildi = new Array(hedefKelime.length).fill(false);

    // İlk geçiş: Doğru yerdeki harfleri bul
    yeniTahmin.forEach((tahmin, i) => {
      if (tahmin.harf === hedefKelime[i]) {
        yeniTahmin[i].durum = 'dogru';
        kullanildi[i] = true;
      }
    });

    // İkinci geçiş: Yanlış yerdeki harfleri bul
    yeniTahmin.forEach((tahmin, i) => {
      if (tahmin.durum === 'beklemede') {
        const hedefIndex = hedefKelime.findIndex((h, j) => h === tahmin.harf && !kullanildi[j]);
        if (hedefIndex !== -1) {
          yeniTahmin[i].durum = 'var';
          kullanildi[hedefIndex] = true;
        } else {
          yeniTahmin[i].durum = 'yanlis';
        }
      }
    });

    const yeniTahminlerDizisi = [...tahminler, yeniTahmin];
    setTahminler(yeniTahminlerDizisi);
    setAktifTahmin('');

    // Harfleri sırayla çevir
    const sonTahminIndex = yeniTahminlerDizisi.length - 1;
    yeniTahmin.forEach((_, index) => {
      setTimeout(() => {
        const harfElementi = document.querySelector(
          `.tahmin-satiri:nth-child(${sonTahminIndex + 1}) .harf:nth-child(${index + 1})`
        );
        if (harfElementi) {
          harfElementi.classList.add('reveal');
        }
      }, index * 300);
    });

    // Oyun durumunu kontrol et
    setTimeout(() => {
      if (yeniTahmin.every(t => t.durum === 'dogru')) {
        setOyunDurumu('kazandi');
      } else if (yeniTahminlerDizisi.length >= SATIR_SAYISI) {
        setOyunDurumu('kaybetti');
      }
    }, yeniTahmin.length * 300);

    // Klavye renklerini güncelle
    const yeniKullanilmisHarfler = { ...kullanilmisHarfler };
    yeniTahmin.forEach(({ harf, durum }) => {
      const mevcutDurum = yeniKullanilmisHarfler[harf];
      if (durum === 'dogru' || (durum === 'var' && mevcutDurum !== 'dogru') || 
          (durum === 'yanlis' && !mevcutDurum)) {
        yeniKullanilmisHarfler[harf] = durum;
      }
    });
    setKullanilmisHarfler(yeniKullanilmisHarfler);
  };

  const renderTahminSatirlari = () => {
    const satirlar = [];
    
    // Yapılan tahminler
    for (let i = 0; i < tahminler.length; i++) {
      satirlar.push(
        <div key={i} className="tahmin-satiri">
          {tahminler[i].map((tahmin, j) => (
            <div key={j} className={`harf ${tahmin.durum}`}>
              {tahmin.harf}
            </div>
          ))}
        </div>
      );
    }
    
    // Aktif tahmin
    if (tahminler.length < SATIR_SAYISI) {
      satirlar.push(
        <div key="aktif" className="tahmin-satiri">
          {[...aktifTahmin.padEnd(secilenSoru.cevap.length)].map((harf, i) => (
            <div key={i} className={`harf ${harf === ' ' ? 'bos' : ''}`}>
              {harf !== ' ' ? harf : ''}
            </div>
          ))}
        </div>
      );
    }
    
    // Kalan boş satırlar
    for (let i = satirlar.length; i < SATIR_SAYISI; i++) {
      satirlar.push(
        <div key={i} className="tahmin-satiri">
          {[...Array(secilenSoru.cevap.length)].map((_, j) => (
            <div key={j} className="harf bos"></div>
          ))}
        </div>
      );
    }
    
    return satirlar;
  };

  const renderKlavye = () => {
    return (
      <div className="klavye">
        {KLAVYE_SATIRLARI.map((satir, i) => (
          <div key={i} className="klavye-satiri">
            {satir.map((harf) => (
              <button
                key={harf}
                className={`klavye-tus ${harf === 'ENTER' || harf === 'SİL' ? 'genis-tus' : ''} ${kullanilmisHarfler[harf] || ''}`}
                onClick={() => harfEkle(harf)}
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
            <div className="zorluk">Zorluk: {secilenSoru.zorluk}</div>
            <div className="aciklama">İpucu: {secilenSoru.aciklama}</div>
          </div>
        </div>
      </div>
      
      <div className="tahminler">
        {renderTahminSatirlari()}
      </div>

      {renderKlavye()}

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