import React from 'react';

interface YatraLogoProps {
  variant?: 'full' | 'icon' | 'full-dark';
  className?: string;
  height?: number;
}

/**
 * Yatra brand logo as an inline SVG component.
 * Variants:
 *  - full: Full "Yatra यात्रा" wordmark for light backgrounds
 *  - full-dark: Full wordmark for dark/colored backgrounds
 *  - icon: Compact "Y" lettermark icon
 */
const YatraLogo: React.FC<YatraLogoProps> = ({ variant = 'full', className = '', height = 36 }) => {
  if (variant === 'icon') {
    const size = height;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Yatra"
      >
        <rect width="40" height="40" rx="10" fill="#0D9488" />
        <path
          d="M12 10L20 22V30M28 10L20 22"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="12" r="3" fill="#2DD4BF" />
      </svg>
    );
  }

  const isLight = variant === 'full';
  const primaryColor = isLight ? '#0F172A' : '#F8FAFC';
  const accentColor = '#0D9488';
  const subtitleColor = isLight ? '#64748B' : '#94A3B8';
  const w = height * 3.6;

  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 180 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Yatra यात्रा"
    >
      {/* Icon mark */}
      <rect x="2" y="5" width="40" height="40" rx="10" fill={accentColor} />
      <path
        d="M14 15L22 27V35M30 15L22 27"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="17" r="2.5" fill="#2DD4BF" />

      {/* "Yatra" text */}
      <text
        x="50"
        y="30"
        fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
        fontSize="26"
        fontWeight="800"
        fill={primaryColor}
        letterSpacing="-0.5"
      >
        Yatra
      </text>

      {/* "यात्रा" Hindi subtitle */}
      <text
        x="50"
        y="45"
        fontFamily="'Noto Sans Devanagari', 'Inter', sans-serif"
        fontSize="10"
        fontWeight="500"
        fill={subtitleColor}
        letterSpacing="0.5"
      >
        यात्रा — Smart Mobility
      </text>
    </svg>
  );
};

export default YatraLogo;
