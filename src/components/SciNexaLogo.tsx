import React from 'react';

interface LogoIconProps {
  size?: number;
  inverted?: boolean;
  className?: string;
}

export const SciNexaLogoIcon: React.FC<LogoIconProps> = ({
  size = 32,
  inverted = false,
  className = ''
}) => {
  const bgFill = inverted ? '#fafafa' : '#0a0a0a';
  const strokeColor = inverted ? '#0a0a0a' : '#fafafa';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="48" height="48" rx="13" fill={bgFill} />
      <ellipse cx="24" cy="24" rx="16" ry="7.2" stroke={strokeColor} strokeOpacity="0.9" strokeWidth="1.4" />
      <ellipse
        cx="24"
        cy="24"
        rx="16"
        ry="7.2"
        stroke={strokeColor}
        strokeOpacity="0.55"
        strokeWidth="1.4"
        transform="rotate(60 24 24)"
      />
      <circle cx="24" cy="24" r="3.4" fill={strokeColor} />
      <circle cx="38.2" cy="24" r="1.5" fill={strokeColor} fillOpacity="0.9" />
    </svg>
  );
};

export const SciNexaBrand: React.FC<{ inverted?: boolean; compact?: boolean; className?: string }> = ({
  inverted = false,
  compact = false,
  className = ''
}) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <SciNexaLogoIcon size={compact ? 28 : 34} inverted={inverted} />
    <div className="leading-none text-start">
      <div
        className={`font-semibold tracking-[-0.04em] ${
          compact ? 'text-[15px]' : 'text-[17px]'
        } ${inverted ? 'text-white' : 'text-[#0a0a0a]'}`}
      >
        SciNexa
      </div>
      {!compact && (
        <div
          className={`mt-1 font-mono text-[9px] uppercase tracking-[0.18em] ${
            inverted ? 'text-white/45' : 'text-[#737373]'
          }`}
        >
          Science Observatory
        </div>
      )}
    </div>
  </div>
);
