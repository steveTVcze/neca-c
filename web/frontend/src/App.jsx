import React, { useState } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [defectsCount, setDefectsCount] = useState(null);

  const handleImageSelect = async (file, imageUrl) => {
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file); 

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend server responded with an error");
      }

      const data = await response.json();
      console.log("Data z backendu:", data);

      setDefectsCount(data.total_defects);
      
    } catch (error) {
      console.error("Chyba při komunikaci s backendem:", error);
      alert("Nedaří se připojit k Python backendu! Zkontroluj, zda ti běží uvicorn.");
      setSelectedImage(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#F3F4F6', minHeight: '100vh', margin: 0, paddingBottom: '40px' }}>
      <Header />
      
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {!selectedImage && (
          <ImageUploader onImageSelect={handleImageSelect} />
        )}

        {isAnalyzing && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: '#2563EB' }}>⚙️ AI is analyzing the fabric...</h2>
            <p>Please wait.</p>
          </div>
        )}
        {!isAnalyzing && selectedImage && defectsCount !== null && (
          <>
            <AnalysisResult imageUrl={selectedImage} defectsCount={defectsCount} />
            
            <button 
              onClick={() => { setSelectedImage(null); setDefectsCount(null); }}
              style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: '#E5E7EB', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Upload another item
            </button>
          </>
        )}
      </main>
    </div>
  );
}