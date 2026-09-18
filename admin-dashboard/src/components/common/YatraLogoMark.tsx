import React from 'react';

export interface YatraLogoMarkProps {
  size?: number;
  className?: string;
  variant?: 'badge' | 'plain' | 'circle';
}

/**
 * Official Yatra Brand Emblem / Logo Mark SVG component.
 * Features:
 *  - Curving road forming a subtle "Y" swoosh shape
 *  - Integrated eco leaf at top for green/clean energy
 *  - Electric bus silhouette on the road curve
 * 
 * Works crisp at any scale (24px to 120px+).
 */
export const YatraLogoMark: React.FC<YatraLogoMarkProps> = ({
  size = 48,
  className = '',
  variant = 'badge',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Yatra EV Fleet Emblem"
    >
      <defs>
        <linearGradient id="yatra_bg_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0f5132" />
        </linearGradient>

        <linearGradient id="yatra_road_grad" x1="10" y1="90" x2="85" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f5132" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>

        <linearGradient id="yatra_leaf_grad" x1="50" y1="10" x2="90" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>

        <filter id="yatra_shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Optional Background Emblem Shapes */}
      {variant === 'badge' && (
        <rect width="100" height="100" rx="22" fill="url(#yatra_bg_grad)" />
      )}
      {variant === 'circle' && (
        <circle cx="50" cy="50" r="48" fill="url(#yatra_bg_grad)" />
      )}

      {/* Main Vector Artwork */}
      <g filter="url(#yatra_shadow)">
        {/* 1. Curving Road / Y Swoosh Path */}
        <path
          d="M 16 86 C 22 66, 38 52, 48 44 C 62 33, 76 30, 88 33 C 78 46, 62 52, 48 60 C 38 67, 30 76, 26 86 Z"
          fill="url(#yatra_road_grad)"
        />
        {/* Left Arm of Y Swoosh */}
        <path
          d="M 32 46 C 22 36, 15 25, 12 16 C 20 20, 31 28, 42 40 Z"
          fill="#0d9488"
        />

        {/* Dashed Center Road Line */}
        <path
          d="M 21 82 C 30 68, 43 55, 51 47 C 62 38, 73 35, 82 35"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeDasharray="4 3"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* 2. Integrated Eco Leaf Shape at top right curve */}
        <path
          d="M 50 42 C 54 24, 69 11, 86 9 C 88 26, 75 40, 56 45 Z"
          fill="url(#yatra_leaf_grad)"
        />
        {/* Leaf Center Vein */}
        <path
          d="M 54 40 C 64 28, 74 20, 83 11"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* 3. Electric Bus Silhouette on Road */}
        <g transform="translate(34, 41) scale(0.72)">
          {/* Bus Body */}
          <rect x="0" y="0" width="34" height="20" rx="4" fill="#ffffff" />
          {/* Windows */}
          <rect x="3" y="3" width="8" height="7" rx="1.5" fill="#0f172a" />
          <rect x="13" y="3" width="7" height="7" rx="1" fill="#0f172a" />
          <rect x="22" y="3" width="8" height="7" rx="1" fill="#0f172a" />
          {/* Front EV Glow */}
          <circle cx="2" cy="14" r="1.5" fill="#2dd4bf" />
          {/* Wheels */}
          <circle cx="8" cy="20" r="3.5" fill="#0f172a" />
          <circle cx="8" cy="20" r="1.5" fill="#94a3b8" />
          <circle cx="26" cy="20" r="3.5" fill="#0f172a" />
          <circle cx="26" cy="20" r="1.5" fill="#94a3b8" />
          {/* EV Lightning Bolt Badge on Bus */}
          <path d="M 16 11 L 18.5 11 L 16 15 L 17.5 15 L 14.5 18.5 L 15.5 14.5 L 14 14.5 Z" fill="#10b981" />
        </g>
      </g>
    </svg>
  );
};

export default YatraLogoMark;
