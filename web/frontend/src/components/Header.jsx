import React from 'react';
import { Recycle } from 'lucide-react';

export default function Header() {
  return (
    <header style={styles.header}>
      <Recycle size={32} color="#10B981" />
      <h1 style={styles.title}>Smart Circular Workwear</h1>
      <span style={styles.badge}>Beta 0.1</span>
    </header>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#ffffff' },
  title: { margin: 0, fontSize: '24px', color: '#111827', fontWeight: 'bold' },
  badge: { backgroundColor: '#D1FAE5', color: '#065F46', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }
};