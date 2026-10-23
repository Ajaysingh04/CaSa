import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame } from 'lucide-react';

// Clean fallback banner in case no banners exist in database (no old external images)
const fallbackBanners = [
  {
    _id: 'default-welcome',
    title: 'Welcome to CASA Premium Shopping',
    subtitle: 'Discover handpicked collections across Fashion, Electronics, Home & Daily Essentials',
    badge: 'Official Store',
    tag: 'EXCLUSIVE DEALS',
    image: '',
    link: '/products',
    buttonText: 'Shop Now',
    accentColor: '#1d4ed8',
  },
];

const carouselWrapperStyle = {
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  background: '#09101d',
  userSelect: 'none',
};

const slideBgStyle = {
  position: 'absolute',
  inset: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  filter: 'saturate(1.08) contrast(1.02)',
};

const contentContainerStyle = {
  position: 'relative',
  zIndex: 10,
};

const contentBoxStyle = {
  maxWidth: '580px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const tagStyle = {
  alignSelf: 'flex-start',
  background: 'rgba(15, 23, 42, 0.65)',
  color: '#fed7aa',
  border: '1.5px solid rgba(249, 115, 22, 0.7)',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontWeight: '800',
  fontSize: '0.74rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
};

const badgeStyle = {
  alignSelf: 'flex-start',
  background: 'rgba(15, 23, 42, 0.65)',
  color: '#fef08a',
  border: '1.5px solid rgba(245, 158, 11, 0.7)',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontWeight: '700',
  fontSize: '0.74rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  backdropFilter: 'blur(6px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
};

const subtitleStyle = {
  maxWidth: '560px',
  lineHeight: 1.6,
};

const btnRowStyle = {
  marginTop: '8px',
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const navBtnStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 20,
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.18)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
};

const prevBtnStyle = {
  ...navBtnStyle,
  left: '20px',
};

const nextBtnStyle = {
  ...navBtnStyle,
  right: '20px',
};

const dotsContainerStyle = {
  position: 'absolute',
  bottom: '18px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 20,
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  background: 'rgba(0, 0, 0, 0.35)',
  backdropFilter: 'blur(6px)',
  padding: '4px 12px',
  borderRadius: '9999px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
};

const dotStyle = {
  height: '7px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  padding: 0,
};

const counterStyle = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '0.72rem',
  fontWeight: '700',
  marginLeft: '6px',
  letterSpacing: '0.04em',
};

const HeroCarousel = ({ banners = [], loading = false }) => {
  const activeBanners = banners && banners.length > 0 ? banners : (loading ? [] : fallbackBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-play interval with pause on hover
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused]);

  // Reset index if banners array changes and index out of bounds
  useEffect(() => {
    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  // If loading and no banners yet, render skeleton shimmer without flashing old content
  if (loading && activeBanners.length === 0) {
    return (
      <div style={carouselWrapperStyle}>
        <style>{`
          @keyframes heroShimmerAnim {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .hero-shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 200% 100%;
            animation: heroShimmerAnim 1.8s infinite linear;
          }
        `}</style>
        <div className="hero-slide-container" style={{ minHeight: '420px', display: 'flex', alignItems: 'center', background: '#09101d' }}>
          <div className="container hero-content-padding" style={contentContainerStyle}>
            <div style={{ ...contentBoxStyle, background: 'rgba(8, 16, 32, 0.65)' }}>
              <div className="hero-shimmer" style={{ width: '130px', height: '24px', borderRadius: '9999px' }} />
              <div className="hero-shimmer" style={{ width: '75%', height: '42px', borderRadius: '10px' }} />
              <div className="hero-shimmer" style={{ width: '55%', height: '20px', borderRadius: '6px' }} />
              <div className="hero-shimmer" style={{ width: '160px', height: '46px', borderRadius: '10px', marginTop: '10px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      style={carouselWrapperStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        .hero-slide-container {
          min-height: 480px;
          position: relative;
          display: flex;
          align-items: center;
          transition: all 0.4s ease;
        }
        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(8, 14, 28, 0.72) 0%, rgba(8, 14, 28, 0.38) 42%, rgba(8, 14, 28, 0.02) 72%, transparent 100%);
          pointer-events: none;
        }
        .hero-content-padding {
          position: relative;
          z-index: 10;
          padding: 40px 24px;
        }
        .hero-content-box {
          max-width: 580px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .hero-title {
          font-size: clamp(1.85rem, 4.2vw, 3.25rem);
          line-height: 1.14;
          letter-spacing: -0.025em;
          color: #ffffff;
          font-weight: 900;
          text-shadow: 0 3px 12px rgba(0, 0, 0, 0.85), 0 1px 3px rgba(0, 0, 0, 0.9);
          margin: 0;
        }
        .hero-subtitle {
          font-size: clamp(0.92rem, 1.8vw, 1.15rem);
          color: #f8fafc;
          line-height: 1.55;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
          margin: 0;
          max-width: 520px;
        }
        .hero-btn-main {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-btn-main:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
        }
        .hero-nav-arrow {
          opacity: 0.85;
          transition: all 0.2s ease;
        }
        .hero-nav-arrow:hover {
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
          background: rgba(255, 255, 255, 0.35) !important;
        }

        /* Mobile specific: sleek app-style card banner with zero overlapping arrows and perfect legibility */
        @media (max-width: 768px) {
          .hero-nav-arrow {
            display: none !important; /* Hide intrusive desktop arrow circles on mobile swipe */
          }
          .hero-slide-container {
            min-height: 220px !important;
            max-height: 260px !important;
            height: 54vw !important;
            align-items: flex-end !important;
            border-radius: 16px !important;
            margin: 8px 12px 12px !important;
            overflow: hidden !important;
            box-shadow: 0 6px 20px -3px rgba(15, 23, 42, 0.28) !important;
          }
          .hero-bg-overlay {
            background: linear-gradient(180deg, rgba(8, 14, 28, 0.05) 0%, rgba(8, 14, 28, 0.45) 42%, rgba(8, 14, 28, 0.92) 100%) !important;
          }
          .hero-content-padding {
            padding: 12px 14px 24px !important;
            width: 100% !important;
          }
          .hero-content-box {
            max-width: 100% !important;
            gap: 6px !important;
          }
          .hero-tag-badge-group {
            gap: 6px !important;
          }
          .hero-tag-badge-group > span {
            padding: 2px 7px !important;
            font-size: 0.65rem !important;
          }
          .hero-title {
            font-size: 1.22rem !important;
            line-height: 1.18 !important;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9) !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .hero-subtitle {
            font-size: 0.74rem !important;
            line-height: 1.3 !important;
            color: #e2e8f0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 1 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .hero-btn-main {
            padding: 5px 13px !important;
            font-size: 0.75rem !important;
            border-radius: 9999px !important;
            margin-top: 2px !important;
            gap: 5px !important;
          }
          .hero-dots-container {
            bottom: 7px !important;
            padding: 2px 8px !important;
            transform: translateX(-50%) scale(0.85) !important;
          }
        }
      `}</style>

      <div className="hero-slide-container">
        {/* Background Layer with Crossfade */}
        {activeBanners.map((b, idx) => {
          const bgImg = b.image ? `url("${b.image}")` : 'none';
          return (
            <div
              key={b._id || idx}
              style={{
                ...slideBgStyle,
                backgroundImage: bgImg,
                backgroundColor: b.accentColor ? `${b.accentColor}25` : '#09101d',
                opacity: currentIndex === idx ? 1 : 0,
                zIndex: currentIndex === idx ? 1 : 0,
                transform: currentIndex === idx ? 'scale(1)' : 'scale(1.03)',
                transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 6s ease-out',
              }}
            >
              <div className="hero-bg-overlay" />
            </div>
          );
        })}

        {/* Slide Content */}
        <div className="container hero-content-padding" style={contentContainerStyle}>
          <div className="hero-content-box animate-slide-up" key={currentBanner._id || currentIndex}>
            {/* Tag & Badge Row */}
            <div className="hero-tag-badge-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {currentBanner.tag && (
                <span style={tagStyle}>
                  <Flame size={13} color="#f97316" />
                  {currentBanner.tag}
                </span>
              )}
              {currentBanner.badge && (
                <span style={badgeStyle}>
                  <Sparkles size={13} color="#fbbf24" />
                  {currentBanner.badge}
                </span>
              )}
            </div>

            <h1 className="hero-title">{currentBanner.title}</h1>
            
            {currentBanner.subtitle && (
              <p className="hero-subtitle">{currentBanner.subtitle}</p>
            )}

            <div style={btnRowStyle}>
              <Link
                to={currentBanner.link || '/products'}
                className="btn btn-primary btn-lg hero-btn-main"
                style={{
                  background: currentBanner.accentColor || '#1d4ed8',
                  borderColor: currentBanner.accentColor || '#1d4ed8',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{currentBanner.buttonText || 'Shop Collection'}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Controls (Previous / Next Buttons) */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="hero-nav-arrow hero-nav-prev"
              style={prevBtnStyle}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="hero-nav-arrow hero-nav-next"
              style={nextBtnStyle}
              aria-label="Next Slide"
            >
              <ChevronRight size={24} />
            </button>

            {/* Slide Dots and Counter */}
            <div className="hero-dots-container" style={dotsContainerStyle}>
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    ...dotStyle,
                    width: currentIndex === idx ? '32px' : '8px',
                    background: currentIndex === idx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
              <span style={counterStyle}>
                {currentIndex + 1} / {activeBanners.length}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroCarousel;
