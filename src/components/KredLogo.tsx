import React from 'react';

interface KredLogoProps {
  size?: 'small' | 'default' | 'large' | 'huge';
  variant?: 'dark' | 'light' | 'mono';
  showText?: boolean;
  className?: string;
}

export const KredLogoMark: React.FC<{
  size?: 'small' | 'default' | 'large' | 'huge';
  variant?: 'dark' | 'light' | 'mono';
  className?: string;
}> = ({ size = 'default', variant = 'dark', className = '' }) => {
  const dimensions =
    size === 'small'
      ? { w: 30, h: 20, r: 5, o: 3.5, o2: 5, stroke: '1.75px' }
      : size === 'large'
      ? { w: 60, h: 40, r: 8, o: 7, o2: 11, stroke: '2.25px' }
      : size === 'huge'
      ? { w: 90, h: 60, r: 12, o: 10, o2: 16, stroke: '2.5px' }
      : { w: 40, h: 27, r: 6, o: 5, o2: 7.5, stroke: '2px' };

  const strokeColor =
    variant === 'light'
      ? 'border-[#18181B]'
      : variant === 'mono'
      ? 'border-black'
      : 'border-white';

  const containerW = dimensions.w + dimensions.o2 * 1.5;
  const containerH = dimensions.h + dimensions.o2 * 1.5;

  return (
    <div
      className={`relative shrink-0 select-none ${className}`}
      style={{ width: containerW, height: containerH }}
      aria-label="KRED Stacked Wallet Logo"
    >
      {/* 3rd Layer: Deep Navy (Back) */}
      <div
        className={`absolute ${strokeColor} transition-transform`}
        style={{
          width: dimensions.w,
          height: dimensions.h,
          borderRadius: dimensions.r,
          borderWidth: dimensions.stroke,
          borderStyle: 'solid',
          left: dimensions.o2 * 1.5,
          top: dimensions.o2 * 1.5,
          backgroundColor: variant === 'mono' ? '#000000' : '#0E1E36',
        }}
      />
      {/* 2nd Layer: Signal Blue (Middle) */}
      <div
        className={`absolute ${strokeColor} transition-transform`}
        style={{
          width: dimensions.w,
          height: dimensions.h,
          borderRadius: dimensions.r,
          borderWidth: dimensions.stroke,
          borderStyle: 'solid',
          left: dimensions.o,
          top: dimensions.o2,
          backgroundColor: variant === 'mono' ? '#555555' : '#3A6EFF',
        }}
      />
      {/* 1st Layer: Vault Green (Front) */}
      <div
        className={`absolute ${strokeColor} shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform`}
        style={{
          width: dimensions.w,
          height: dimensions.h,
          borderRadius: dimensions.r,
          borderWidth: dimensions.stroke,
          borderStyle: 'solid',
          left: 0,
          top: 0,
          backgroundColor: variant === 'mono' ? '#ffffff' : '#10C77A',
        }}
      />
    </div>
  );
};

export const KredLogo: React.FC<KredLogoProps> = ({
  size = 'default',
  variant = 'dark',
  showText = true,
  className = '',
}) => {
  const textClass =
    size === 'small'
      ? 'text-[19px]'
      : size === 'large'
      ? 'text-[30px]'
      : size === 'huge'
      ? 'text-[40px]'
      : 'text-[23px]';

  const textColor =
    variant === 'light'
      ? 'text-white'
      : variant === 'mono'
      ? 'text-black'
      : 'text-[#18181B]';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <KredLogoMark size={size} variant={variant} />
      {showText && (
        <span
          className={`font-[600] tracking-[-0.035em] leading-none ${textClass} ${textColor} select-none`}
        >
          kred
        </span>
      )}
    </div>
  );
};

export const KredBouncingCardsLoader: React.FC<{
  label?: string;
  sublabel?: string;
  className?: string;
}> = ({
  label = 'Auditing credentials & requirements...',
  sublabel = 'KRED Sovereign AI Engine is synthesizing response',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white border border-[#E2E1DA] shadow-2xs ${className}`}
    >
      <style>{`
        @keyframes kredCardBounceWave {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.75;
          }
          40% {
            transform: translateY(-9px) scale(1.08);
            opacity: 1;
          }
          60% {
            transform: translateY(-3px) scale(1.02);
            opacity: 0.95;
          }
        }
        .kred-bounce-card-1 {
          animation: kredCardBounceWave 1.2s ease-in-out infinite;
          animation-delay: 0s;
        }
        .kred-bounce-card-2 {
          animation: kredCardBounceWave 1.2s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        .kred-bounce-card-3 {
          animation: kredCardBounceWave 1.2s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>

      {/* Stacked / Sequenced Logo Bouncing Cards */}
      <div className="relative flex items-center gap-1.5 py-1">
        {/* Card 1: Deep Navy (Logo Back Layer) */}
        <div
          className="kred-bounce-card-1 w-6 h-4 rounded-[4px] border-1.5 border-[#18181B] bg-[#0E1E36] shadow-xs shrink-0"
          title="Layer 1: Sovereign Vault"
        />

        {/* Card 2: Signal Blue (Logo Middle Layer) */}
        <div
          className="kred-bounce-card-2 w-6 h-4 rounded-[4px] border-1.5 border-[#18181B] bg-[#3A6EFF] shadow-xs shrink-0"
          title="Layer 2: AI Reasoning"
        />

        {/* Card 3: Vault Green (Logo Front Layer) */}
        <div
          className="kred-bounce-card-3 w-6 h-4 rounded-[4px] border-1.5 border-[#18181B] bg-[#10C77A] shadow-xs shrink-0"
          title="Layer 3: Cryptographic Verification"
        />
      </div>

      {/* Text Indicator */}
      <div className="flex flex-col text-left">
        <span className="text-[13px] font-semibold text-[#18181B] flex items-center gap-1.5 leading-snug">
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-[#71717A] leading-tight mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export const KredSmileyRobotMark: React.FC<{
  size?: 'small' | 'default' | 'large';
  className?: string;
}> = ({ size = 'default', className = '' }) => {
  const dim =
    size === 'small'
      ? { box: 28, head: 22, eye: 2.5, r: 6 }
      : size === 'large'
      ? { box: 44, head: 36, eye: 4, r: 10 }
      : { box: 34, head: 28, eye: 3, r: 8 };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dim.box, height: dim.box }}
      aria-label="KRED Smiley Robot Logo"
    >
      {/* Background card accent (Signal Blue offset) */}
      <div
        className="absolute rounded-[7px] bg-[#3A6EFF] border border-[#18181B]"
        style={{
          width: dim.head,
          height: dim.head - 2,
          right: 1,
          bottom: 1,
          opacity: 0.85,
        }}
      />

      {/* Front Robot Head (Vault Green & Dark Head with friendly smile) */}
      <div
        className="relative rounded-[8px] bg-[#10C77A] border-2 border-[#18181B] shadow-xs flex flex-col items-center justify-center overflow-hidden"
        style={{
          width: dim.head,
          height: dim.head,
          zIndex: 2,
        }}
      >
        {/* Cute top antenna dot */}
        <div className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#18181B]" />

        {/* Robot Visor Screen */}
        <div className="w-[82%] h-[68%] bg-[#0E1E36] rounded-[5px] border border-[#18181B]/40 flex flex-col items-center justify-center px-1">
          {/* Friendly Eyes */}
          <div className="flex items-center justify-between w-full px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10C77A] shadow-[0_0_4px_#10C77A] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#10C77A] shadow-[0_0_4px_#10C77A] animate-pulse" />
          </div>

          {/* Cheerful Curved Smile */}
          <svg
            className="w-3 h-1.5 mt-0.5 text-[#10C77A]"
            viewBox="0 0 16 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M2 2C4.5 6 11.5 6 14 2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default KredLogo;

