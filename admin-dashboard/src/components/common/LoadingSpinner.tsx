import React from 'react';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Synchronizing fleet telemetry...',
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
      {/* Animated Logo Container with Charging Aura */}
      <div className="relative flex items-center justify-center mb-5">
        {/* Ambient Pulsing Glow */}
        <div
          className={`absolute rounded-full bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-sky-500/15 blur-2xl animate-pulse ${current.glowSize} pointer-events-none`}
        />

        {/* Animated URJA Logo */}
        <div className="relative z-10">
          <img
            src="/urja-loading-darkmode.svg"
            alt="URJA Animated Loader"
            className={`${current.imgDimensions} object-contain transition-all duration-300 drop-shadow-lg`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/urja-logo-darkmode.svg';
            }}
          />
        </div>
      </div>

      {/* Message with Clean Status Indicator */}
      {message && (
        <div className="space-y-2 max-w-md">
          <p className={`${current.textSize} font-medium text-slate-300 tracking-tight`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-urja-bg/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
