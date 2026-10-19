import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  X,
  Sparkles,
  Search,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// Popular Indian Metro Cities & Default PINs
const POPULAR_CITIES = [
  { city: 'Bengaluru', pincode: '560038', state: 'Karnataka', tag: 'Fast 2-Day Delivery' },
  { city: 'Mumbai', pincode: '400001', state: 'Maharashtra', tag: 'Express Delivery' },
  { city: 'New Delhi', pincode: '110001', state: 'Delhi NCR', tag: 'Same-Day Available' },
  { city: 'Hyderabad', pincode: '500001', state: 'Telangana', tag: 'Fast 2-Day Delivery' },
  { city: 'Chennai', pincode: '600001', state: 'Tamil Nadu', tag: 'Express Delivery' },
  { city: 'Kolkata', pincode: '700001', state: 'West Bengal', tag: 'Standard Delivery' },
  { city: 'Pune', pincode: '411001', state: 'Maharashtra', tag: 'Fast 2-Day Delivery' },
  { city: 'Ahmedabad', pincode: '380001', state: 'Gujarat', tag: 'Express Delivery' },
];

// Fallback Indian postal prefix lookup table
const PIN_PREFIX_MAP = {
  '11': { city: 'New Delhi', state: 'Delhi' },
  '12': { city: 'Gurugram', state: 'Haryana' },
  '13': { city: 'Chandigarh', state: 'Punjab' },
  '14': { city: 'Amritsar', state: 'Punjab' },
  '16': { city: 'Mohali', state: 'Punjab' },
  '20': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh' },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '24': { city: 'Dehradun', state: 'Uttarakhand' },
  '28': { city: 'Agra', state: 'Uttar Pradesh' },
  '30': { city: 'Jaipur', state: 'Rajasthan' },
  '34': { city: 'Jodhpur', state: 'Rajasthan' },
  '38': { city: 'Ahmedabad', state: 'Gujarat' },
  '39': { city: 'Surat', state: 'Gujarat' },
  '40': { city: 'Mumbai', state: 'Maharashtra' },
  '41': { city: 'Pune', state: 'Maharashtra' },
  '44': { city: 'Nagpur', state: 'Maharashtra' },
  '45': { city: 'Indore', state: 'Madhya Pradesh' },
  '46': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '50': { city: 'Hyderabad', state: 'Telangana' },
  '53': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  '56': { city: 'Bengaluru', state: 'Karnataka' },
  '57': { city: 'Mangalore', state: 'Karnataka' },
  '60': { city: 'Chennai', state: 'Tamil Nadu' },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu' },
  '68': { city: 'Kochi', state: 'Kerala' },
  '69': { city: 'Thiruvananthapuram', state: 'Kerala' },
  '70': { city: 'Kolkata', state: 'West Bengal' },
  '75': { city: 'Bhubaneswar', state: 'Odisha' },
  '78': { city: 'Guwahati', state: 'Assam' },
  '80': { city: 'Patna', state: 'Bihar' },
  '83': { city: 'Ranchi', state: 'Jharkhand' },
};

export const LocationModal = ({ isOpen, onClose, currentLocation, onSelectLocation }) => {
  const { success, error, info } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [customPin, setCustomPin] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  // 1. Analyze / Detect Current Location via Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      error('Geolocation is not supported by your browser.');
      return;
    }

    setAnalyzing(true);
    setAnalysisStep('Requesting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          setAnalysisStep(`GPS locked (Accuracy: ±${Math.round(accuracy || 30)}m). Analyzing address...`);

          // Attempt Reverse Geocoding with timeout
          let detectedCity = '';
          let detectedPincode = '';
          let detectedState = '';

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                signal: controller.signal,
                headers: { 'Accept-Language': 'en' },
              }
            );
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                detectedCity =
                  data.address.city ||
                  data.address.town ||
                  data.address.suburb ||
                  data.address.state_district ||
                  data.address.county ||
                  '';
                detectedPincode = data.address.postcode || '';
                detectedState = data.address.state || '';
              }
            }
          } catch (fetchErr) {
            // Reverse geocode timed out or blocked by network, fallback to coordinates proximity or default
            console.log('Reverse geocode fallback:', fetchErr);
          }

          // If reverse geocoding did not return postal code or city, approximate based on Indian coordinates
          if (!detectedCity || !detectedPincode) {
            // Approximate major Indian regions by lat/lon
            if (latitude >= 28.0 && latitude <= 29.0 && longitude >= 76.8 && longitude <= 77.5) {
              detectedCity = 'New Delhi';
              detectedPincode = '110001';
              detectedState = 'Delhi';
            } else if (latitude >= 18.8 && latitude <= 19.3 && longitude >= 72.7 && longitude <= 73.1) {
              detectedCity = 'Mumbai';
              detectedPincode = '400001';
              detectedState = 'Maharashtra';
            } else if (latitude >= 12.8 && latitude <= 13.2 && longitude >= 77.4 && longitude <= 77.8) {
              detectedCity = 'Bengaluru';
              detectedPincode = '560038';
              detectedState = 'Karnataka';
            } else if (latitude >= 17.2 && latitude <= 17.6 && longitude >= 78.3 && longitude <= 78.6) {
              detectedCity = 'Hyderabad';
              detectedPincode = '500001';
              detectedState = 'Telangana';
            } else if (latitude >= 12.9 && latitude <= 13.2 && longitude >= 80.1 && longitude <= 80.4) {
              detectedCity = 'Chennai';
              detectedPincode = '600001';
              detectedState = 'Tamil Nadu';
            } else if (latitude >= 22.4 && latitude <= 22.7 && longitude >= 88.2 && longitude <= 88.5) {
              detectedCity = 'Kolkata';
              detectedPincode = '700001';
              detectedState = 'West Bengal';
            } else {
              detectedCity = 'Detected Location';
              detectedPincode = '560001';
              detectedState = 'India';
            }
          }

          setAnalysisStep('Finalizing location...');
          setTimeout(() => {
            setAnalyzing(false);
            const newLoc = {
              city: detectedCity,
              pincode: detectedPincode,
              state: detectedState,
              isAutoDetected: true,
              lat: latitude,
              lng: longitude,
            };
            onSelectLocation(newLoc);
            success(`Location analyzed & set: ${detectedCity} (${detectedPincode})`);
            onClose();
          }, 600);
        } catch (err) {
          setAnalyzing(false);
          error('Could not parse location address. Please select your city below.');
        }
      },
      (err) => {
        setAnalyzing(false);
        if (err.code === 1) {
          error('Location permission was denied. Please select your city or enter PIN code below.');
        } else {
          error('Could not detect location. Please select your city below.');
        }
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  // 2. Handle Custom PIN Submission
  const handleApplyPin = (e) => {
    e.preventDefault();
    const cleanPin = customPin.trim().replace(/\D/g, '');

    if (cleanPin.length !== 6) {
      setPinError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setPinError('');
    const prefix = cleanPin.substring(0, 2);
    const match = PIN_PREFIX_MAP[prefix] || { city: 'India', state: '' };

    const newLoc = {
      city: match.city,
      pincode: cleanPin,
      state: match.state,
      isAutoDetected: false,
    };

    onSelectLocation(newLoc);
    success(`Delivery location updated to ${match.city} - ${cleanPin}`);
    onClose();
  };

  // 3. Handle City Selection
  const handleCityPick = (c) => {
    onSelectLocation({
      city: c.city,
      pincode: c.pincode,
      state: c.state,
      isAutoDetected: false,
    });
    success(`Delivery address set to ${c.city} (${c.pincode})`);
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={iconBadgeStyle}>
              <MapPin size={22} color="#2563eb" />
            </div>
            <div>
              <h3 style={modalTitleStyle}>Choose Your Delivery Location</h3>
              <p style={modalSubtitleStyle}>
                Delivery options, speeds and offers depend on your current location
              </p>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Close modal">
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Current Location Badge */}
        <div style={currentBannerStyle}>
          <span style={{ fontSize: '0.8rem', color: '#475569' }}>Currently delivering to:</span>
          <strong style={{ fontSize: '0.9rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            {currentLocation?.city || 'Bengaluru'} - {currentLocation?.pincode || '560038'}
          </strong>
        </div>

        {/* GPS Live Analyze Button */}
        <div style={{ marginBottom: '22px' }}>
          <button
            onClick={handleDetectLocation}
            disabled={analyzing}
            style={{
              ...detectBtnStyle,
              opacity: analyzing ? 0.85 : 1,
              cursor: analyzing ? 'wait' : 'pointer',
            }}
          >
            {analyzing ? (
              <>
                <Loader2 size={20} className="spin-animation" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Analyzing Location...</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{analysisStep}</div>
                </div>
              </>
            ) : (
              <>
                <div style={compassIconBox}>
                  <Compass size={20} color="#ffffff" />
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    Detect & Analyze Current Location
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#dbeafe' }}>
                    Uses device GPS coordinates for precise doorstep delivery estimate
                  </div>
                </div>
                <span style={gpsTagStyle}>Live GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div style={dividerStyle}>
          <span style={dividerTextStyle}>OR ENTER INDIAN PIN CODE</span>
        </div>

        {/* Manual PIN Code Form */}
        <form onSubmit={handleApplyPin} style={pinFormStyle}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              maxLength={6}
              value={customPin}
              onChange={(e) => {
                setCustomPin(e.target.value.replace(/\D/g, ''));
                if (pinError) setPinError('');
              }}
              placeholder="Enter 6-digit PIN code (e.g. 110001)"
              style={pinInputStyle}
            />
            <Search size={16} color="#94a3b8" style={pinSearchIcon} />
          </div>
          <button type="submit" style={applyBtnStyle}>
            Apply
          </button>
        </form>
        {pinError && <div style={errorMessageStyle}><AlertCircle size={14} /> {pinError}</div>}

        {/* Popular Cities Quick Select */}
        <div style={{ marginTop: '22px' }}>
          <div style={sectionLabelStyle}>
            <Building2 size={16} color="#2563eb" /> Popular Metros & Regions
          </div>
          <div style={cityGridStyle}>
            {POPULAR_CITIES.map((c) => {
              const isSelected =
                currentLocation?.pincode === c.pincode ||
                currentLocation?.city?.toLowerCase() === c.city.toLowerCase();
              return (
                <button
                  key={c.pincode}
                  onClick={() => handleCityPick(c)}
                  style={{
                    ...cityCardStyle,
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      {c.city}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                      {c.pincode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                    {c.tag}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Styles */
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
  animation: 'fadeIn 0.2s ease-out',
};

const modalCardStyle = {
  background: '#ffffff',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '540px',
  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  padding: '24px',
  border: '1.5px solid #e2e8f0',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '16px',
};

const iconBadgeStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: '#eff6ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const modalTitleStyle = {
  fontSize: '1.15rem',
  fontWeight: '800',
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-0.015em',
};

const modalSubtitleStyle = {
  fontSize: '0.78rem',
  color: '#64748b',
  margin: '2px 0 0 0',
};

const closeBtnStyle = {
  background: '#f1f5f9',
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s',
  flexShrink: 0,
};

const currentBannerStyle = {
  padding: '10px 14px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '18px',
};

const detectBtnStyle = {
  width: '100%',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '14px',
  padding: '14px 18px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
  transition: 'all 0.25s ease',
};

const compassIconBox = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const gpsTagStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  fontSize: '0.68rem',
  fontWeight: 800,
  padding: '4px 8px',
  borderRadius: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const dividerStyle = {
  textAlign: 'center',
  position: 'relative',
  margin: '18px 0 16px',
};

const dividerTextStyle = {
  background: '#ffffff',
  padding: '0 12px',
  fontSize: '0.7rem',
  fontWeight: 800,
  color: '#94a3b8',
  letterSpacing: '0.06em',
  position: 'relative',
  zIndex: 1,
};

const pinFormStyle = {
  display: 'flex',
  gap: '10px',
};

const pinInputStyle = {
  width: '100%',
  padding: '11px 14px 11px 36px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  fontSize: '0.875rem',
  color: '#0f172a',
  outline: 'none',
  fontWeight: 600,
};

const pinSearchIcon = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
};

const applyBtnStyle = {
  padding: '0 20px',
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
  flexShrink: 0,
};

const errorMessageStyle = {
  marginTop: '6px',
  fontSize: '0.75rem',
  color: '#dc2626',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 600,
};

const sectionLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: 800,
  color: '#334155',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const cityGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
};

const cityCardStyle = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #e2e8f0',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export default LocationModal;
