import React, { useState, useEffect } from 'react';
import { UploadCloud, LoaderCircle, Sun, Moon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import nexaLogo from './assets/nexa_c_no_bg.svg'; 

// --- FIX PRO ZOBRAZENÍ ZÁKLADNÍCH MODRÝCH IKONEK VE VITE ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- SPECIÁLNÍ ČERVENÁ IKONKA PRO TVOU POLOHU ---
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const themes = {
  light: {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    textTitle: '#111827',
    textBody: '#4B5563',
    border: '#E5E7EB',
    headerBg: 'rgba(255, 255, 255, 0.8)',
  },
  dark: {
    bg: '#0F172A', 
    card: '#1E293B',
    textTitle: '#F9FAFB',
    textBody: '#94A3B8',
    border: '#334155',
    headerBg: 'rgba(15, 23, 42, 0.8)',
  }
};

// --- KOMPONENTA PRO B2B PORTÁL ---
function B2BPortal({ theme, onBack }) {
  const [formData, setFormData] = useState({ name: '', tier: 'Alliance', discount: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const BACKEND_URL = "http://172.31.131.20:8000"; 
      await fetch(`${BACKEND_URL}/partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); onBack(); }, 3000);
    } catch (error) {
      alert("Error saving partner. Check backend.");
    }
  };

  return (
    <div style={{ backgroundColor: theme.card, borderRadius: '20px', padding: '30px', border: `1px solid ${theme.border}` }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← Back to App</button>
      <h2 style={{ color: theme.textTitle, marginTop: 0 }}>💼 NEXA Partner Portal</h2>
      <p style={{ color: theme.textBody, marginBottom: '30px' }}>Join our circular economy network and get direct leads from our AI analysis.</p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: theme.textTitle }}>🤝 NEXA Alliance</h3>
          <h1 style={{ margin: '0 0 10px 0', color: '#2563EB' }}>14.95 € <span style={{ fontSize: '14px', color: theme.textBody }}>/mo</span></h1>
          <p style={{ color: theme.textBody, fontSize: '14px' }}>Offer exclusive coupons to users immediately after AI diagnosis.</p>
        </div>
        <div style={{ flex: '1', padding: '20px', border: '2px solid #F59E0B', borderRadius: '12px', backgroundColor: theme.bg === '#0F172A' ? '#1E293B' : '#FEF3C7' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#B45309' }}>⭐ NEXA VIP</h3>
          <h1 style={{ margin: '0 0 10px 0', color: '#B45309' }}>20.95 € <span style={{ fontSize: '14px' }}>/mo</span></h1>
          <p style={{ color: theme.textBody, fontSize: '14px' }}>Guaranteed #1 recommendation spot in your local area.</p>
        </div>
      </div>

      {submitted ? (
        <div style={{ padding: '20px', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
          Welcome to NEXA! Your company is now live in our system.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Company Name (e.g. EcoTailor)" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.textTitle }} />
          
          <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.textTitle }}>
            <option value="Alliance">NEXA Alliance (14.95 €)</option>
            <option value="VIP">NEXA VIP (20.95 €)</option>
          </select>
          
          <input type="text" placeholder="Offer/Discount (e.g. -10% with NEXA)" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bg, color: theme.textTitle }} />
          
          <button type="submit" style={{ backgroundColor: '#2563EB', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Join Partner Network</button>
        </form>
      )}
    </div>
  );
}

// --- KOMPONENTA PRO ZOBRAZENÍ PLATÍCÍCH PARTNERŮ ---
function PartnerRecommendations({ actionType, theme }) {
  const partners = actionType === 'repair' ? [
    { id: 1, name: "EcoTailor Hämeenlinna", tier: "VIP", badge: "⭐ VIP Partner", discount: null, desc: "Puts company first in the list" },
    { id: 2, name: "Ompelimo GreenFix", tier: "Alliance", badge: "🤝 Alliance Partner", discount: "-10% off with NEXA", desc: "Exclusive discount coupons" }
  ] : [
    { id: 3, name: "Fida Premium Recycle", tier: "VIP", badge: "⭐ VIP Partner", discount: null, desc: "Top priority recommendation" },
    { id: 4, name: "UFF Alliance Hub", tier: "Alliance", badge: "🤝 Alliance Partner", discount: "Free coffee drop-off", desc: "Exclusive partner perks" }
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <h4 style={{ color: theme.textTitle, marginBottom: '12px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
        Sponsored Recommendations
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {partners.map(partner => (
          <div key={partner.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px', 
            backgroundColor: partner.tier === 'VIP' ? (theme.bg === '#0F172A' ? '#382b0e' : '#FEF3C7') : theme.bg, 
            border: `1px solid ${partner.tier === 'VIP' ? '#F59E0B' : theme.border}`,
            borderRadius: '12px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ color: partner.tier === 'VIP' ? '#F59E0B' : theme.textTitle, fontSize: '16px' }}>
                  {partner.name}
                </strong>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  backgroundColor: partner.tier === 'VIP' ? '#F59E0B' : '#3B82F6', 
                  color: 'white', 
                  padding: '2px 8px', 
                  borderRadius: '12px' 
                }}>
                  {partner.badge}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: partner.tier === 'VIP' ? '#F59E0B' : theme.textBody }}>
                {partner.discount ? `🎁 ${partner.discount}` : partner.desc}
              </p>
            </div>
            
            <button style={{ 
              backgroundColor: partner.tier === 'VIP' ? '#B45309' : '#2563EB', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}>
              Go
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- HLAVNÍ APLIKACE ---
export default function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [defectsCount, setDefectsCount] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [currentView, setCurrentView] = useState('user');

  const theme = darkMode ? themes.dark : themes.light;

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = theme.bg; 
  }, [darkMode, theme.bg]);

  const handleImageSelect = async (file, imageUrl) => {
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);
    setDefectsCount(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const BACKEND_URL = "http://172.31.131.20:8000"; 
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setDefectsCount(data.total_defects);
      setItemId(data.item_id);
    } catch (error) {
      alert("NEXA AI Connection Error. Check Backend.");
      setSelectedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const styles = {
    app: { backgroundColor: theme.bg, color: theme.textBody, minHeight: '100vh', width: '100%', fontFamily: "'Inter', sans-serif", transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' },
    header: { backgroundColor: theme.headerBg, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, zIndex: 1000 },
    container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', width: '100%', boxSizing: 'border-box', flex: 1 },
    card: { backgroundColor: theme.card, borderRadius: '20px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
          
          <img 
            src={nexaLogo} 
            alt="NEXA Logo" 
            style={{ 
              height: '45px', 
              width: 'auto',
              filter: darkMode ? 'brightness(0) invert(1)' : 'none',
              transition: 'filter 0.3s ease'
            }} 
          />

          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textTitle }}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {currentView === 'b2b' ? (
          <B2BPortal theme={theme} onBack={() => setCurrentView('user')} />
        ) : (
          <>
            {!selectedImage && (
              <div style={styles.card}>
                <div style={{ border: `2px dashed ${theme.border}`, borderRadius: '15px', padding: '60px', textAlign: 'center' }}>
                  <UploadCloud size={60} color={theme.textBody} style={{ marginBottom: '20px' }} />
                  <h2 style={{ color: theme.textTitle }}>Analyze your workwear</h2>
                  <p style={{ color: theme.textBody, marginBottom: '30px' }}>Our AI scans for holes, stains and wear.</p>
                  
                  <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files[0], URL.createObjectURL(e.target.files[0]))} style={{ display: 'none' }} id="file-upload" />
                  <label htmlFor="file-upload" style={{ backgroundColor: '#2563EB', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
                    Upload Photo
                  </label>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div style={{ ...styles.card, textAlign: 'center', padding: '80px' }}>
                <LoaderCircle size={50} color="#2563EB" className="spin-animation" />
                <h2 style={{ color: theme.textTitle, marginTop: '20px' }}>AI NEXA is scanning...</h2>
                <style>{`
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                  .spin-animation { animation: spin 1s linear infinite; }
                `}</style>
              </div>
            )}

            {!isAnalyzing && selectedImage && defectsCount !== null && (
              <ResultCard 
                imageUrl={selectedImage} 
                defectsCount={defectsCount} 
                itemId={itemId} 
                theme={theme} 
                onRestart={() => { 
                  setSelectedImage(null); 
                  setDefectsCount(null); 
                  setItemId(null);
                }} 
              />
            )}
          </>
        )}
      </main>

      {/* PATIČKA S B2B PŘEPÍNAČEM */}
      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '20px', fontSize: '14px', color: theme.textBody, borderTop: `1px solid ${theme.border}`, backgroundColor: theme.headerBg }}>
        © 2026 NEXA Circular Solutions. Hämeenlinna, Finland. <br/>
        {currentView === 'user' && (
          <button onClick={() => setCurrentView('b2b')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            💼 NEXA For Business
          </button>
        )}
      </footer>
    </div>
  );
}

// --- VÝSLEDKOVÁ KARTA ---
function ResultCard({ imageUrl, defectsCount, itemId, theme, onRestart }) {
  const isRecycle = defectsCount > 2;
  const color = defectsCount === 0 ? '#10B981' : (defectsCount <= 2 ? '#F59E0B' : '#EF4444');
  const label = defectsCount === 0 ? 'NEXA REUSE' : (defectsCount <= 2 ? 'NEXA REPAIR' : 'NEXA RECYCLE');

  return (
    <>
      <div style={{ backgroundColor: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
        <img src={imageUrl} alt="Analysis" style={{ flex: '1 1 300px', borderRadius: '15px', maxHeight: '400px', objectFit: 'cover' }} />
        
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ color: theme.textBody, fontSize: '14px', textTransform: 'uppercase' }}>Analysis Result</h3>
          <h2 style={{ color: color, fontSize: '32px', fontWeight: '900', margin: '10px 0' }}>{label}</h2>
          <p style={{ color: theme.textBody, lineHeight: 1.6, marginBottom: '20px' }}>
            {defectsCount === 0 ? "Perfect condition. Item can be sanitized and reused." : 
             (defectsCount <= 2 ? `Found ${defectsCount} minor defects. Suitable for repair.` : `Found ${defectsCount} defects. Item must be recycled.`)}
          </p>
          
          {/* PLATÍCÍ PARTNEŘI SE UKÁŽOU, POKUD JE POTŘEBA OPRAVA NEBO RECYKLACE */}
          {(defectsCount > 0) && (
            <PartnerRecommendations actionType={defectsCount <= 2 ? 'repair' : 'recycle'} theme={theme} />
          )}

          {/* QR KÓD PŘES BEZPEČNÉ API */}
          {itemId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '15px', backgroundColor: theme.bg, borderRadius: '10px', border: `1px solid ${theme.border}` }}>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${itemId}`} 
                  alt="QR Code" 
                  style={{ width: '64px', height: '64px' }} 
                />
              </div>
              <div>
                <strong style={{ display: 'block', color: theme.textTitle, fontSize: '12px', textTransform: 'uppercase' }}>Digital Passport ID</strong>
                <span style={{ color: theme.textBody, fontFamily: 'monospace', fontSize: '14px' }}>{itemId.split('-')[0].toUpperCase()}</span>
              </div>
            </div>
          )}

          {isRecycle && <RecycleMap theme={theme} />}
        </div>
      </div>
      <button onClick={onRestart} style={{ width: '100%', marginTop: '20px', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: theme.border, color: theme.textTitle, fontWeight: 'bold', cursor: 'pointer' }}>
        New Analysis
      </button>
    </>
  );
}

// --- DYNAMICKÁ MAPA (Se záchrannou lokací) ---
function RecycleMap({ theme }) {
  const [userLocation, setUserLocation] = useState(null);
  const [spots, setSpots] = useState([]);
  const [status, setStatus] = useState("Locating you...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLocation([lat, lon]);
        setStatus("Searching for nearest recycling spots...");
        fetchRecyclingSpots(lat, lon);
      },
      (error) => {
        console.warn("Poloha zablokována, používám záložní lokaci.");
        const fallbackLat = 60.995;
        const fallbackLon = 24.46;
        
        setUserLocation([fallbackLat, fallbackLon]);
        setStatus("Using default location (Hämeenlinna)...");
        fetchRecyclingSpots(fallbackLat, fallbackLon);
      }
    );
  }, []);

  const fetchRecyclingSpots = async (lat, lon) => {
    const query = `
      [out:json];
      (
        node["amenity"="recycling"]["recycling:clothes"="yes"](around:3000, ${lat}, ${lon});
        node["shop"="charity"](around:3000, ${lat}, ${lon});
        node["shop"="second_hand"](around:3000, ${lat}, ${lon});
      );
      out;
    `;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      const foundSpots = data.elements.map((el) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags.name || el.tags.operator || "Textile Recycling Bin",
      }));

      setSpots(foundSpots);
      setStatus(foundSpots.length > 0 ? "" : "No recycling spots found within 3 km.");
    } catch (error) {
      setStatus("Error while fetching map data.");
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: theme.bg, borderRadius: '15px', border: `1px solid ${theme.border}` }}>
      <h4 style={{ color: theme.textTitle, margin: '0 0 12px 0' }}>📍 Nearest Drop-off Points</h4>

      {status && <p style={{ color: theme.textBody, fontSize: '14px', fontStyle: 'italic', margin: '0 0 12px 0' }}>{status}</p>}

      {userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '10px', zIndex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong style={{ color: '#111827' }}>You are here 📍</strong>
            </Popup>
          </Marker>

          {spots.map((spot) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=$${spot.lat},${spot.lon}`;
            
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lon]}>
                <Popup>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#111827' }}>{spot.name}</strong>
                  
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  >
                    🗺️ Navigate here
                  </a>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
}