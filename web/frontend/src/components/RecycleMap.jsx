import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- SPECIÁLNÍ ČERVENÁ IKONKA PRO UŽIVATELE ---
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- KOMPONENTA MAPY (Vracíme všechny XP funkce zpět) ---
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
        setStatus("Unable to retrieve your location. Please allow location access.");
      }
    );
  }, []);

  const fetchRecyclingSpots = async (lat, lon) => {
    // Okruh 3000 metrů (3 km) kolem uživatele
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* 1. ČERVENÝ ŠPENDLÍK PRO UŽIVATELE */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong style={{ color: '#111827' }}>You are here 📍</strong>
            </Popup>
          </Marker>

          {/* 2. MODRÉ ŠPENDLÍKY PRO NALEZENÉ KONTEJNERY */}
          {spots.map((spot) => {
            // Oficiální, čistý univerzální odkaz pro Google Maps Navigaci (přímo spustí trasu k cíli)
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`;
            
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lon]}>
                <Popup>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#111827' }}>{spot.name}</strong>
                  
                  {/* 3. POPUP TLAČÍTKO S NAVIGACÍ */}
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
const styles = {
  mapWrapper: { marginTop: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' },
  title: { marginTop: 0, marginBottom: '16px', color: '#374151', fontSize: '18px' },
  navButton: {
    display: 'inline-block',
    backgroundColor: '#2563EB',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center'
  }
};