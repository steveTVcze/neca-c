import React from 'react';
import { UploadCloud } from 'lucide-react';

export default function ImageUploader({ onImageSelect }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelect(file, imageUrl);
    }
  };

  return (
    <div style={styles.container}>
      <UploadCloud size={48} color="#6B7280" />
      <h2>Upload workwear photo</h2>
      <p style={{ color: '#6B7280' }}>Supported formats: JPG, PNG</p>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        style={styles.input} 
        id="file-upload"
      />
      <label htmlFor="file-upload" style={styles.button}>
        Choose file from computer
      </label>
    </div>
  );
}

const styles = {
  container: { border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '40px', textAlign: 'center', margin: '20px 0', backgroundColor: '#F9FAFB' },
  input: { display: 'none' },
  button: { display: 'inline-block', backgroundColor: '#2563EB', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }
};