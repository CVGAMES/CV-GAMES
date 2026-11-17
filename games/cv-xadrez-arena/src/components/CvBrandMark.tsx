import { useState } from 'react';

interface CvBrandMarkProps {
  compact?: boolean;
  size?: 'compact' | 'default' | 'hero';
}

export function resolveAssetUrl(relativePath: string): string {
  const cleanPath = relativePath.replace(/^\/+/, '');
  const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
  const rawBase =
    typeof metaEnv?.BASE_URL === 'string' && metaEnv.BASE_URL.length > 0
      ? metaEnv.BASE_URL
      : './';
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${normalizedBase}${cleanPath}`;
}

export const CV_OFFICIAL_LOGO_URL = resolveAssetUrl('assets/aistudio/onconee_83c694f6.png');

export function CvBrandMark({ compact = false, size }: CvBrandMarkProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedSize = size ?? (compact ? 'compact' : 'default');

  const logoSizeClass =
    resolvedSize === 'hero'
      ? 'w-16 h-16'
      : resolvedSize === 'compact'
        ? 'w-9 h-9'
        : 'w-11 h-11';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div
        className={`${logoSizeClass} aspect-square shrink-0 flex items-center justify-center`}
      >
        {!imgFailed ? (
          <img
            src={CV_OFFICIAL_LOGO_URL}
            alt="Logo oficial CV GAMES"
            data-testid="cv-official-logo"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain block drop-shadow-[0_4px_14px_rgba(34,211,238,0.28)]"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-[#0e1529] border border-[#06b6d4]/50 flex items-center justify-center font-display font-extrabold text-sm text-[#22d3ee]">
            CV
          </div>
        )}
      </div>
      <div className="flex flex-col leading-none text-left">
        <div className="flex items-baseline gap-1 font-display tracking-wider">
          <span
            className={`${
              resolvedSize === 'hero'
                ? 'text-lg'
                : resolvedSize === 'compact'
                  ? 'text-sm'
                  : 'text-base'
            } font-extrabold text-[#22d3ee]`}
          >
            CV
          </span>
          <span
            className={`${
              resolvedSize === 'hero'
                ? 'text-lg'
                : resolvedSize === 'compact'
                  ? 'text-sm'
                  : 'text-base'
            } font-bold text-white`}
          >
            GAMES
          </span>
        </div>
        {resolvedSize !== 'compact' && (
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#94a3b8] mt-1">
            Coleção Oficial 3D
          </span>
        )}
      </div>
    </div>
  );
}
