import React from 'react';
import { CheckCircle, Wrench, Trash2 } from 'lucide-react';
import RecycleMap from './RecycleMap';

export default function AnalysisResult({ imageUrl, defectsCount }) {
  
  let status = {};
  if (defectsCount === 0) {
    status = { text: 'REUSE', color: '#10B981', icon: <CheckCircle size={24} />, desc: 'Fabric is intact. Ready for cleaning.', type: 'reuse' };
  } else if (defectsCount <= 2) {
    status = { text: 'REPAIR', color: '#F59E0B', icon: <Wrench size={24} />, desc: `${defectsCount} defect(s) found. Send to tailor.`, type: 'repair' };
  } else {
    status = { text: 'RECYCLE', color: '#EF4444', icon: <Trash2 size={24} />, desc: `Too many defects (${defectsCount}). Send for textile recycling.`, type: 'recycle' };
  }

  return (
    <div style={styles.card}>
      <div style={styles.imageBox}>
        <img src={imageUrl} alt="Uploaded workwear" style={styles.image} />
      </div>
      
      <div style={styles.resultBox}>
        <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>AI Analysis Result</h3>
        <div style={{ ...styles.badge, backgroundColor: status.color }}>
          {status.icon}
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{status.text}</span>
        </div>
        <p style={{ marginTop: '16px', color: '#4B5563', fontSize: '16px' }}>{status.desc}</p>
        
        {status.type === 'recycle' && <RecycleMap />}
      </div>
    </div>
  );
}

const styles = {
  card: { display: 'flex', gap: '24px', marginTop: '32px', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', backgroundColor: 'white', flexWrap: 'wrap' },
  imageBox: { flex: '1', minWidth: '300px' },
  image: { width: '100%', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E5E7EB' },
  resultBox: { flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '12px', color: 'white', padding: '16px 24px', borderRadius: '8px' }
};