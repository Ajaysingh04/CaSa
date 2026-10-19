import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame } from 'lucide-react';

const defaultBanners = [
  {
    _id: 'default-1',
    title: 'CASA Grand Diwali & Festive Mega Sale',
    subtitle: 'Flat 50% - 75% Off Across 15+ Categories | Top Indian & Global Brands',
    badge: 'Limited Time Offer',
    tag: 'MEGA FESTIVAL SALE',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1800&auto=format&fit=crop&q=85',
    link: '/products',
    buttonText: 'Shop Grand Sale',
    accentColor: '#1d4ed8',
  },
  {
    _id: 'default-2',
    title: 'Royal Indian Ethnic & Sarees',
    subtitle: 'Pure Kanjivaram, Banarasi & Designer Lehengas Crafted by Master Weavers',
    badge: 'Heritage Couture',
    tag: 'HANDLOOM CRAFT',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1800&auto=format&fit=crop&q=85',
    link: '/category/womens-fashion',
    buttonText: 'Explore Collection',
    accentColor: '#be185d',
  },
];

const HeroCarousel = ({ banners = [] }) => {
  const activeBanners = banners && banners.length > 0 ? banners : defaultBanners;
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
          min-height: 420px;
          position: relative;
          display: flex;
          align-items: center;
          transition: all 0.4s ease;
        }
        .hero-title {
          font-size: clamp(1.75rem, 4vw, 3.25rem);
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: #ffffff;
          font-weight: 900;
          text-shadow: 0 2px 10px rgba(0,0,0,0.4);
        }
        .hero-subtitle {
          font-size: clamp(0.9rem, 1.8vw, 1.15rem);
          color: #f1f5f9;
          line-height: 1.55;
          text-shadow: 0 1px 6px rgba(0,0,0,0.5);
        }
        .hero-btn-main {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-btn-main:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
        @media (max-width: 640px) {
          .hero-slide-container {
            min-height: 380px;
          }
          .hero-content-padding {
            padding: 36px 16px 56px !important;
          }
          .hero-nav-arrow {
            width: 36px !important;
            height: 36px !important;
          }
          .hero-nav-prev {
            left: 8px !important;
          }
          .hero-nav-next {
            right: 8px !important;
          }
        }
      `}</style>

      <div className="hero-slide-container">
        {/* Background Layer with Crossfade */}
        {activeBanners.map((b, idx) => (
          <div
            key={b._id || idx}
            style={{
              ...slideBgStyle,
              backgroundImage: `url(${b.image})`,
              opacity: currentIndex === idx ? 1 : 0,
              zIndex: currentIndex === idx ? 1 : 0,
              transform: currentIndex === idx ? 'scale(1)' : 'scale(1.03)',
              transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 6s ease-out',
            }}
          >
            <div style={gradientOverlayStyle} />
          </div>
        ))}

        {/* Slide Content */}
        <div className="container hero-content-padding" style={contentContainerStyle}>
          <div style={contentBoxStyle} key={currentBanner._id || currentIndex} className="animate-slide-up">
            {/* Tag & Badge Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
              <p className="hero-subtitle" style={subtitleStyle}>{currentBanner.subtitle}</p>
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
            <div style={dotsContainerStyle}>
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
  backgroundPosition: 'center right',
  filter: 'saturate(1.18) contrast(1.05) brightness(1.02)',
};

const gradientOverlayStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(90deg, rgba(7, 15, 30, 0.88) 0%, rgba(7, 15, 30, 0.52) 42%, rgba(7, 15, 30, 0.08) 75%, transparent 100%)',
};

const contentContainerStyle = {
  position: 'relative',
  zIndex: 10,
  padding: '40px 24px',
};

const contentBoxStyle = {
  maxWidth: '640px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  background: 'rgba(8, 16, 32, 0.48)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  padding: '30px 34px',
  borderRadius: '22px',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
};

const tagStyle = {
  alignSelf: 'flex-start',
  background: 'rgba(249, 115, 22, 0.25)',
  color: '#fdba74',
  border: '1px solid rgba(249, 115, 22, 0.5)',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontWeight: '800',
  fontSize: '0.75rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  backdropFilter: 'blur(6px)',
};

const badgeStyle = {
  alignSelf: 'flex-start',
  background: 'rgba(245, 158, 11, 0.22)',
  color: '#fef08a',
  border: '1px solid rgba(245, 158, 11, 0.45)',
  padding: '4px 12px',
  borderRadius: '9999px',
  fontWeight: '700',
  fontSize: '0.75rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  backdropFilter: 'blur(6px)',
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

export default HeroCarousel;
