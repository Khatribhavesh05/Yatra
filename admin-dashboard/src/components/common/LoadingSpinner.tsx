import React from 'react';
import yatraLogoMarkImg from '../../assets/yatra_logo_mark.png';

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
      logoHeight: 48,
      containerPadding: 'p-4',
      textSize: 'text-xs',
      glowSize: 'w-24 h-24',
    },
    md: {
      logoHeight: 64,
      containerPadding: 'p-8',
      textSize: 'text-sm',
      glowSize: 'w-40 h-40',
    },
    lg: {
      logoHeight: 80,
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
      {/* Animated Logo Container with Pulsing Aura */}
      <div className="relative flex items-center justify-center mb-5">
        {/* Ambient Pulsing Glow */}
        <div
          className={`absolute rounded-full bg-gradient-to-r from-teal-500/25 via-cyan-500/20 to-blue-500/15 blur-2xl animate-pulse ${current.glowSize} pointer-events-none`}
        />

        {/* Yatra Logo Mark Image */}
        <div className="relative z-10 animate-[pulse_2s_ease-in-out_infinite]">
          <img
            src={yatraLogoMarkImg}
            alt="Yatra Loading"
            style={{ width: `${current.logoHeight}px`, height: `${current.logoHeight}px` }}
            className="object-contain drop-shadow-xl"
          />
        </div>
      </div>

      {/* Message with Clean Status Indicator */}
      {message && (
        <div className="space-y-2 max-w-md">
          <p className={`${current.textSize} font-medium text-yatra-text-secondary tracking-tight`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-yatra-bg/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
