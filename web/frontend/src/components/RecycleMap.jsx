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

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function RecycleMap() {
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
    // set the radius from 5 kms to 3 kms to get more relevant results
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
    <div style={styles.mapWrapper}>
      <h3 style={styles.title}>📍 Nearest Drop-off Points</h3>

      {status && <p style={{ color: '#6B7280', fontStyle: 'italic' }}>{status}</p>}

      {userLocation && (
        <MapContainer center={userLocation} zoom={13} style={{ height: '350px', width: '100%', borderRadius: '8px', zIndex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* User pin  */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <strong>You are here 📍</strong>
            </Popup>
          </Marker>



          {/* Recycling spots */}
          {spots.map((spot) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`;
            
            return (
              <Marker key={spot.id} position={[spot.lat, spot.lon]}>
                <Popup>
                  <strong style={{ display: 'block', marginBottom: '8px' }}>{spot.name}</strong>
                  
                  <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    style={styles.navButton}
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