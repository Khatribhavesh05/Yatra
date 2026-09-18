import React from 'react';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading live data...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeConfig = {
    sm: {
      imgDimensions: 'h-14 w-auto max-w-[160px]',
      containerPadding: 'p-4',
      textSize: 'text-xs',
      glowSize: 'w-24 h-24',
    },
    md: {
      imgDimensions: 'h-24 w-auto max-w-[280px]',
      containerPadding: 'p-8',
      textSize: 'text-sm',
      glowSize: 'w-40 h-40',
    },
    lg: {
      imgDimensions: 'h-36 w-auto max-w-[400px]',
      containerPadding: 'p-12',
      textSize: 'text-base',
      glowSize: 'w-56 h-56',
    },
  };

  const current = sizeConfig[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center ${current.containerPadding} text-center select-none`}
      role="status"
      aria-live="polite"
    >
      {/* Animated Logo Container with Charging Energy Burst */}
      <div className="relative flex items-center justify-center mb-5">
        {/* Ambient Pulsing Glow behind the Logo */}
        <div
          className={`absolute rounded-full bg-gradient-to-r from-lime-400/30 via-emerald-400/25 to-sky-400/15 blur-2xl animate-pulse ${current.glowSize} pointer-events-none`}
        />

        {/* Animated Vector URJA Logo */}
        <div className="relative z-10">
          <img
            src="/urja-loading.svg"
            alt="URJA Animated Loader"
            className={`${current.imgDimensions} object-contain transition-all duration-300 drop-shadow-md`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/urja-logo.svg';
            }}
          />
        </div>
      </div>

      {/* Message with Clean Status Indicator */}
      {message && (
        <div className="space-y-2 max-w-md">
          <p className={`${current.textSize} font-semibold text-slate-800 tracking-tight`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

