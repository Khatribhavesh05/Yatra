import React from 'react';
import yatraLogoMarkImg from '../../assets/yatra_logo_mark.png';

interface YatraLogoProps {
  variant?: 'full' | 'icon' | 'full-dark';
  className?: string;
  height?: number;
  tagline?: string;
}

/**
 * Yatra brand logo component.
 * Integrates high-res Yatra emblem PNG image with brand typography.
 * Variants:
 *  - full: Full "Yatra यात्रा" wordmark for light backgrounds
 *  - full-dark: Full wordmark for dark/colored backgrounds
 *  - icon: Compact emblem mark
 */
const YatraLogo: React.FC<YatraLogoProps> = ({ variant = 'full', className = '', height = 36, tagline }) => {
  if (variant === 'icon') {
    return (
      <img
        src={yatraLogoMarkImg}
        alt="Yatra Emblem"
        style={{ width: `${height}px`, height: `${height}px` }}
        className={`object-contain ${className}`}
      />
    );
  }

  const isLight = variant === 'full';
  const primaryColor = isLight ? '#0F172A' : '#F8FAFC';
  const subtitleColor = isLight ? '#475569' : '#94A3B8';
  const displayText = tagline || 'यात्रा — स्मार्ट गतिशील राजस्थान';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ height: `${height}px` }}>
      <img
        src={yatraLogoMarkImg}
        alt="Yatra Emblem"
        style={{ width: `${height}px`, height: `${height}px` }}
        className="object-contain drop-shadow-sm"
      />
      <div className="flex flex-col justify-center select-none leading-none">
        <span
          className="font-extrabold tracking-tight"
          style={{
            fontSize: `${Math.max(16, height * 0.55)}px`,
            color: primaryColor,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          }}
        >
          Yatra
        </span>
        <span
          className="font-semibold tracking-wide mt-1"
          style={{
            fontSize: `${Math.max(9, height * 0.25)}px`,
            color: subtitleColor,
            fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif",
          }}
        >
          {displayText}
        </span>
      </div>
    </div>
  );
};

export default YatraLogo;
