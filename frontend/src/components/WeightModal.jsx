import React, { useState, useEffect, useRef } from 'react';
import { X, Link2 } from 'lucide-react';

const overlay = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const card = {
  background: 'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(30,41,59,0.97))',
  border: '1px solid rgba(56,189,248,0.2)',
  borderRadius: 16, padding: '28px 32px', minWidth: 340,
  boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.08)',
};

const inputStyle = {
  width: '100%', background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, padding: '10px 14px', fontSize: 18, color: '#E2E8F0',
  outline: 'none', textAlign: 'center', fontWeight: 700, letterSpacing: 1,
  transition: 'border-color 0.2s',
};

const btnBase = {
  flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 12,
  fontWeight: 700, cursor: 'pointer', border: 'none',
  letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s',
};

/**
 * Glassmorphic modal that asks the user for an edge weight.
 *
 * Props:
 *   visible    – boolean
 *   title      – string  (e.g. "New Link" or "Edit Link Weight")
 *   subtitle   – string  (e.g. "London ↔ Paris")
 *   initial    – number  (default value in input)
 *   onConfirm  – (weight: number) => void
 *   onCancel   – () => void
 */
const WeightModal = ({ visible, title, subtitle, initial = 10, onConfirm, onCancel }) => {
  const [value, setValue] = useState(String(initial));
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setValue(String(initial));
      setError('');
      setTimeout(() => inputRef.current?.select(), 60);
    }
  }, [visible, initial]);

  if (!visible) return null;

  const submit = () => {
    const n = Number(value);
    if (isNaN(n) || n <= 0) { setError('Enter a positive number'); return; }
    onConfirm(n);
  };

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={card} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(56,189,248,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Link2 size={18} color="#38BDF8" />
            </div>
            <div>
              <p style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 700, margin: 0 }}>{title}</p>
              {subtitle && <p style={{ color: '#64748B', fontSize: 11, margin: 0, marginTop: 2 }}>{subtitle}</p>}
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Label */}
        <p style={{ color: '#94A3B8', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Weight / Distance (ms)
        </p>

        {/* Input */}
        <input
          ref={inputRef}
          type="number"
          min="1"
          value={value}
          onChange={e => { setValue(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{
            ...inputStyle,
            borderColor: error ? '#E11D48' : 'rgba(255,255,255,0.15)',
          }}
          onFocus={e => { e.target.style.borderColor = '#38BDF8'; }}
          onBlur={e => { e.target.style.borderColor = error ? '#E11D48' : 'rgba(255,255,255,0.15)'; }}
        />

        {error && <p style={{ color: '#F87171', fontSize: 11, marginTop: 6, textAlign: 'center' }}>{error}</p>}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >Cancel</button>
          <button onClick={submit} style={{ ...btnBase, background: 'linear-gradient(135deg,#0284C7,#38BDF8)', color: '#0F172A' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default WeightModal;
