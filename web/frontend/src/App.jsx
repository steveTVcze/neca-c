import React, { useState, useEffect } from 'react';
import { LoaderCircle, Sun, Moon, Smartphone, Shirt, Layers, Leaf, Cpu, Globe } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import nexaLogo from './assets/nexa_c_no_bg.svg'; 

// =========================================================================
// 🌐 CONFIG: Tady změň IP adresu, kdykoliv se ti po restartu hotspotu změní!
// =========================================================================
const BACKEND_URL = "https://eradicate-calculate-mountain.ngrok-free.dev"; 

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
  light: { bg: '#F3F4F6', card: '#FFFFFF', textTitle: '#111827', textBody: '#4B5563', border: '#E5E7EB', headerBg: 'rgba(255, 255, 255, 0.8)' },
  dark: { bg: '#0F172A', card: '#1E293B', textTitle: '#F9FAFB', textBody: '#94A3B8', border: '#334155', headerBg: 'rgba(15, 23, 42, 0.8)' }
};

// --- NGROK IMAGE HELPER ---
function NgrokImage({ src, alt, style }) {
  const [imgBlob, setImgBlob] = useState(null);

  useEffect(() => {
    fetch(src, {
      headers: { "ngrok-skip-browser-warning": "69420" }
    })
      .then(res => res.blob())
      .then(blob => setImgBlob(URL.createObjectURL(blob)))
      .catch(err => console.error("Error loading image:", err));
  }, [src]);

  if (!imgBlob) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB', color: '#6B7280' }}>
        <LoaderCircle size={24} className="spin-animation" style={{ marginRight: '10px', color: '#00B8A9' }} />
        Loading AI Scan...
      </div>
    );
  }

  return <img src={imgBlob} alt={alt} style={style} />;
}

// --- KOMPONENTA PRO B2B PORTÁL ---
function B2BPortal({ theme, onBack }) {
  const [formData, setFormData] = useState({ name: '', tier: 'Alliance', discount: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${BACKEND_URL}/partners`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420" 
        },
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
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#00B8A9', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← Back to App</button>
      <h2 style={{ color: theme.textTitle, marginTop: 0 }}>💼 NEXA Partner Portal</h2>
      <p style={{ color: theme.textBody, marginBottom: '30px' }}>Join our circular economy network and get direct leads from our AI analysis.</p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', padding: '20px', border: `1px solid ${theme.border}`, borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: theme.textTitle }}>🤝 NEXA Alliance</h3>
          <h1 style={{ margin: '0 0 10px 0', color: '#00B8A9' }}>14.95 € <span style={{ fontSize: '14px', color: theme.textBody }}>/mo</span></h1>
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
          
          <button type="submit" style={{ backgroundColor: '#00B8A9', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Join Partner Network</button>
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
                  backgroundColor: partner.tier === 'VIP' ? '#F59E0B' : '#2DD4BF', 
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
              backgroundColor: partner.tier === 'VIP' ? '#B45309' : '#00B8A9', 
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

// --- KOMPONENTA ABOUT US ---
function AboutUs({ theme, onBack }) {
  return (
    <div style={{ backgroundColor: theme.card, borderRadius: '20px', padding: '40px', border: `1px solid ${theme.border}` }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#00B8A9', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>← Back to App</button>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: theme.textTitle, fontSize: '36px', marginBottom: '10px' }}>Shaping the Circular Future</h1>
        <p style={{ color: theme.textBody, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          At NEXA, we believe that technology can solve the global textile waste crisis. 
          By combining AI-driven computer vision with local business networks, we make circularity easy and profitable.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '40px' }}>
        <div style={{ flex: '1 1 250px', padding: '25px', backgroundColor: theme.bg, borderRadius: '15px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <Cpu size={48} color="#00B8A9" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: theme.textTitle, marginBottom: '10px' }}>Advanced AI</h3>
          <p style={{ color: theme.textBody, fontSize: '14px', lineHeight: 1.6 }}>Our custom YOLO computer vision model instantly detects holes, stains, and wear, ensuring objective decisions on reusing, repairing, or recycling.</p>
        </div>
        
        <div style={{ flex: '1 1 250px', padding: '25px', backgroundColor: theme.bg, borderRadius: '15px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <Globe size={48} color="#00B8A9" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: theme.textTitle, marginBottom: '10px' }}>B2B Ecosystem</h3>
          <p style={{ color: theme.textBody, fontSize: '14px', lineHeight: 1.6 }}>We bridge the gap between consumers and local tailors or recycling centers. Our digital passport system tracks the lifecycle of every garment.</p>
        </div>

        <div style={{ flex: '1 1 250px', padding: '25px', backgroundColor: theme.bg, borderRadius: '15px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <Leaf size={48} color="#00B8A9" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: theme.textTitle, marginBottom: '10px' }}>Zero Waste</h3>
          <p style={{ color: theme.textBody, fontSize: '14px', lineHeight: 1.6 }}>Every item scanned is an item saved from the landfill. Our smart routing directs textiles to the optimal next step in their lifecycle.</p>
        </div>
      </div>
    </div>
  );
}

// --- HLAVNÍ APLIKACE ---
export default function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  
  // Řízení stránek: 'user' | 'b2b' | 'about'
  const [currentView, setCurrentView] = useState('user');
  
  const [step, setStep] = useState(1);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  
  const [defectsCount, setDefectsCount] = useState(null);
  const [itemId, setItemId] = useState(null);
  const [aiResultImageUrls, setAiResultImageUrls] = useState([]);

  const theme = darkMode ? themes.dark : themes.light;

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = theme.bg; 
  }, [darkMode, theme.bg]);

  const handleStartAnalysis = async () => {
    if (!frontImage || !backImage) return alert("Please upload both front and back photos.");
    
    setStep(2);

    const formData = new FormData();
    formData.append("files", frontImage.file);
    formData.append("files", backImage.file);

    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          "ngrok-skip-browser-warning": "69420"
        }
      });

      const data = await response.json();
      setDefectsCount(data.total_defects);
      setItemId(data.item_id);
      setAiResultImageUrls(data.result_image_urls || []);
      setStep(3);
    } catch (error) {
      alert("NEXA AI Connection Error. Check Backend.");
      setStep(1);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setFrontImage(null);
    setBackImage(null);
    setDefectsCount(null);
    setItemId(null);
    setAiResultImageUrls([]);
  };

  const resetToHome = () => {
    setCurrentView('user');
    resetFlow();
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
            onClick={resetToHome}
            style={{ height: '45px', width: 'auto', filter: darkMode ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.3s ease', cursor: 'pointer' }} 
          />
          
          {/* HLAVIČKA: PŘIDÁN ODKAZ "ABOUT US" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => setCurrentView('about')} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentView === 'about' ? '#00B8A9' : theme.textTitle, fontWeight: 'bold', fontSize: '15px', transition: 'color 0.2s' }}
            >
              About Us
            </button>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textTitle, display: 'flex', alignItems: 'center' }}>
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main style={styles.container}>
        {/* RENDER LOGIKA STRÁNEK */}
        {currentView === 'about' ? (
          <AboutUs theme={theme} onBack={() => setCurrentView('user')} />
        ) : currentView === 'b2b' ? (
          <B2BPortal theme={theme} onBack={() => setCurrentView('user')} />
        ) : (
          <>
            {step === 1 && (
              <div style={styles.card}>
                <h2 style={{ color: theme.textTitle, marginTop: 0, textAlign: 'center' }}>Scan your item</h2>
                <p style={{ color: theme.textBody, marginBottom: '30px', textAlign: 'center' }}>For accurate AI analysis, we need a photo of both the front and the back. Lay the item flat in good lighting.</p>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                  <div style={{ flex: '1 1 300px', border: `2px dashed ${frontImage ? '#10B981' : theme.border}`, borderRadius: '15px', padding: '30px', textAlign: 'center', backgroundColor: theme.bg }}>
                    <strong style={{ display: 'block', color: theme.textTitle, marginBottom: '10px' }}>FRONT VIEW</strong>
                    {frontImage ? (
                      <img src={frontImage.url} alt="Front" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }} />
                    ) : (
                      <>
                        <Smartphone size={40} color={theme.textBody} style={{ margin: '20px 0' }} />
                        <input type="file" accept="image/*" onChange={(e) => setFrontImage({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })} style={{ display: 'none' }} id="front-upload" />
                        <label htmlFor="front-upload" style={{ backgroundColor: '#00B8A9', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>Take Photo</label>
                      </>
                    )}
                  </div>

                  <div style={{ flex: '1 1 300px', border: `2px dashed ${backImage ? '#10B981' : theme.border}`, borderRadius: '15px', padding: '30px', textAlign: 'center', backgroundColor: theme.bg }}>
                    <strong style={{ display: 'block', color: theme.textTitle, marginBottom: '10px' }}>BACK VIEW</strong>
                    {backImage ? (
                      <img src={backImage.url} alt="Back" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }} />
                    ) : (
                      <>
                        <Smartphone size={40} color={theme.textBody} style={{ margin: '20px 0' }} />
                        <input type="file" accept="image/*" onChange={(e) => setBackImage({ file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) })} style={{ display: 'none' }} id="back-upload" />
                        <label htmlFor="back-upload" style={{ backgroundColor: '#00B8A9', color: 'white', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>Take Photo</label>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleStartAnalysis} 
                  disabled={!frontImage || !backImage}
                  style={{ width: '100%', backgroundColor: (frontImage && backImage) ? '#00B8A9' : theme.border, color: (frontImage && backImage) ? 'white' : theme.textBody, padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: (frontImage && backImage) ? 'pointer' : 'not-allowed' }}
                >
                  Analyze Both Sides
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ ...styles.card, textAlign: 'center', padding: '80px' }}>
                <LoaderCircle size={50} color="#00B8A9" className="spin-animation" />
                <h2 style={{ color: theme.textTitle, marginTop: '20px' }}>AI NEXA is scanning...</h2>
                <p style={{ color: theme.textBody }}>Analyzing both sides for holes, stains and wear.</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin-animation { animation: spin 1s linear infinite; }`}</style>
              </div>
            )}

            {step === 3 && (
              <ResultCard 
                aiImageUrls={aiResultImageUrls} 
                defectsCount={defectsCount} 
                itemId={itemId} 
                theme={theme} 
                onRestart={resetFlow} 
              />
            )}
          </>
        )}
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '20px', fontSize: '14px', color: theme.textBody, borderTop: `1px solid ${theme.border}`, backgroundColor: theme.headerBg }}>
        © 2026 NEXA Circular Solutions. Hämeenlinna, Finland. <br/>
        {currentView === 'user' && (
          <button onClick={() => setCurrentView('b2b')} style={{ background: 'none', border: 'none', color: '#00B8A9', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
            💼 NEXA For Business
          </button>
        )}
      </footer>
    </div>
  );
}

// --- VÝSLEDKOVÁ KARTA ---
function ResultCard({ aiImageUrls, defectsCount, itemId, theme, onRestart }) {
  const isRepair = defectsCount > 0 && defectsCount <= 2;
  const isRecycle = defectsCount > 2;
  
  const color = defectsCount === 0 ? '#10B981' : (isRepair ? '#F59E0B' : '#EF4444');
  const label = defectsCount === 0 ? 'NEXA REUSE' : (isRepair ? 'NEXA REPAIR' : 'NEXA RECYCLE');

  return (
    <>
      <div style={{ backgroundColor: theme.card, borderRadius: '20px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {aiImageUrls.map((url, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
                {idx === 0 ? 'FRONT SCAN' : 'BACK SCAN'}
              </span>
              <NgrokImage 
                src={`${BACKEND_URL}${url}`} 
                alt={`AI Scan ${idx}`} 
                style={{ width: '100%', borderRadius: '15px', objectFit: 'cover', border: `1px solid ${theme.border}`, minHeight: '200px' }} 
              />
            </div>
          ))}
        </div>
        
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ color: theme.textBody, fontSize: '14px', textTransform: 'uppercase' }}>Analysis Result</h3>
          <h2 style={{ color: color, fontSize: '32px', fontWeight: '900', margin: '10px 0' }}>{label}</h2>
          <p style={{ color: theme.textBody, lineHeight: 1.6, marginBottom: '20px' }}>
            {defectsCount === 0 ? "Perfect condition on both sides. Item can be sanitized and reused." : 
             (isRepair ? `Found total of ${defectsCount} minor defects across the item. Suitable for repair.` : `Found total of ${defectsCount} defects. Item must be recycled.`)}
          </p>
          
          {(defectsCount > 0) && (
            <PartnerRecommendations actionType={isRepair ? 'repair' : 'recycle'} theme={theme} />
          )}

          {itemId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px', padding: '20px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${itemId}`} alt="QR Code" style={{ width: '130px', height: '130px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: theme.textTitle, fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>Digital Passport ID</strong>
                <span style={{ display: 'block', color: theme.textBody, fontFamily: 'monospace', fontSize: '18px', backgroundColor: theme.card, padding: '8px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                  {itemId.split('-')[0].toUpperCase()}
                </span>
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: theme.textBody }}>Scan to track item history.</p>
              </div>
            </div>
          )}

          {(isRecycle || isRepair) && <ActionMap type={isRepair ? 'repair' : 'recycle'} theme={theme} />}
        </div>
      </div>
      <button onClick={onRestart} style={{ width: '100%', marginTop: '20px', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: theme.border, color: theme.textTitle, fontWeight: 'bold', cursor: 'pointer' }}>
        Start New Analysis
      </button>
    </>
  );
}

// --- DYNAMICKÁ MAPA ---
function ActionMap({ type, theme }) {
  const [userLocation, setUserLocation] = useState(null);
  const [spots, setSpots] = useState([]);
  const [status, setStatus] = useState("Locating you...");

  const mapTitle = type === 'repair' ? "📍 Nearest Tailors & Repair Shops" : "📍 Nearest Drop-off Points";

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
        setStatus(`Searching for nearest ${type === 'repair' ? 'tailors' : 'recycling spots'}...`);
        fetchSpots(lat, lon);
      },
      (error) => {
        console.warn("Poloha zablokována, používám záložní lokaci Hämeenlinna.");
        const fallbackLat = 60.995;
        const fallbackLon = 24.46;
        setUserLocation([fallbackLat, fallbackLon]);
        setStatus(`Using default location (Hämeenlinna)... searching for ${type === 'repair' ? 'tailors' : 'recycling spots'}...`);
        fetchSpots(fallbackLat, fallbackLon);
      }
    );
  }, [type]);

  const fetchSpots = async (lat, lon) => {
    let osmTags = "";
    if (type === 'repair') {
      osmTags = `
        node["craft"="tailor"](around:5000, ${lat}, ${lon});
        node["shop"="tailor"](around:5000, ${lat}, ${lon});
        node["shop"="clothes_repair"](around:5000, ${lat}, ${lon});
      `;
    } else {
      osmTags = `
        node["amenity"="recycling"]["recycling:clothes"="yes"](around:3000, ${lat}, ${lon});
        node["shop"="charity"](around:3000, ${lat}, ${lon});
        node["shop"="second_hand"](around:3000, ${lat}, ${lon});
      `;
    }

    const query = `[out:json];(${osmTags});out;`;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      const foundSpots = data.elements.map((el) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags.name || el.tags.operator || (type === 'repair' ? "Local Tailor" : "Textile Recycling Bin"),
      }));

      setSpots(foundSpots);
      setStatus(foundSpots.length > 0 ? "" : `No ${type === 'repair' ? 'tailors' : 'recycling spots'} found nearby.`);
    } catch (error) {
      setStatus("Error while fetching map data.");
    }
  };

  return (
    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', color: theme.textTitle, fontSize: '18px' }}>{mapTitle}</h3>

      {status && <p style={{ color: theme.textBody, fontStyle: 'italic', marginBottom: '12px' }}>{status}</p>}

      {userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: '350px', width: '100%', borderRadius: '8px', zIndex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <Marker position={userLocation} icon={userIcon}>
            <Popup><strong style={{ color: '#111827' }}>You are here 📍</strong></Popup>
          </Marker>

          {spots.map((spot) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`;
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lon]}>
                <Popup>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#111827' }}>{spot.name}</strong>
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', backgroundColor: '#00B8A9', color: 'white', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
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