import type { CSSProperties } from 'react';

type IconName = 'bracket' | 'check' | 'reset' | 'trophy' | 'arrow' | 'save' | 'close';

const paths: Record<IconName, string> = {
  bracket: 'M4 3v6h7v6H4v6M11 12h9M20 7v10',
  check: 'm5 12 4 4L19 6',
  reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  trophy: 'M8 3h8v7a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 3v5m-4 2h8m-6-2h4',
  arrow: 'M4 12h16m-5-5 5 5-5 5',
  save: 'M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9M7 3v6h6m-6 12v-6h9v6m0-15 2 2 4-4',
  close: 'm6 6 12 12M6 18 18 6',
};

export function Icon({ name, size = 16, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
