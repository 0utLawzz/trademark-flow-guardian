import React, { useEffect, useState } from 'react';

/**
 * BrandHeader – displays the company logo, address, contact and payment details.
 * Data is fetched from the external brand API (https://brandex.pk/api/brand).
 * Expected JSON shape:
 * {
 *   "logoUrl": "https://.../logo.png",
 *   "name": "Acme Corp",
 *   "address": "123 Main St, City, Country",
 *   "contact": "+1 234 567 890",
 *   "paymentDetails": "Bank: XYZ Bank, IBAN: XX00 1234 5678 90"
 * }
 */
const BrandHeader: React.FC = () => {
  const [brand, setBrand] = useState<null | {
    logoUrl: string;
    name: string;
    address: string;
    contact: string;
    paymentDetails: string;
  }>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://brandex.pk/api/brand');
        const data = await res.json();
        setBrand(data);
      } catch (e) {
        console.error('Failed to load brand info', e);
      }
    })();
  }, []);

  if (!brand) return null;

  return (
    <div className="brand-header glass-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', marginBottom: '1rem' }}>
      <img src={brand.logoUrl} alt="logo" style={{ height: '60px', marginRight: '1rem' }} />
      <div>
        <h2 style={{ margin: 0, fontFamily: 'Inter, sans-serif' }}>{brand.name}</h2>
        <p style={{ margin: 0 }}>{brand.address}</p>
        <p style={{ margin: 0 }}>Contact: {brand.contact}</p>
        <p style={{ margin: 0 }}>Payment: {brand.paymentDetails}</p>
      </div>
    </div>
  );
};

export default BrandHeader;
