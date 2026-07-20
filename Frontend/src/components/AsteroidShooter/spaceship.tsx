import React, { type ReactNode } from 'react';

interface SpaceshipProps {
  children: ReactNode;
}

const Spaceship = ({ children }: SpaceshipProps) => {
  return (
    <div
      className="relative mx-auto h-[220px] w-[min(720px,92vw)] [filter:drop-shadow(0_0_22px_rgba(96,165,250,0.45))]"
      aria-hidden="true"
    >
      <div className="absolute inset-x-1/2 bottom-[-16px] h-8 w-[220px] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(circle,rgba(147,197,253,0.42),transparent_72%)] blur-[1px]" />

      <div className="absolute left-1/2 top-0 h-[118px] w-[66px] -translate-x-1/2 overflow-hidden rounded-[28px_28px_16px_16px] border border-slate-100/65 bg-[linear-gradient(180deg,rgba(191,219,254,0.98)_0%,rgba(37,99,235,0.96)_28%,rgba(15,23,42,0.98)_72%,rgba(2,6,23,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_24px_rgba(96,165,250,0.16)] animate-pulse">
        <div className="absolute left-1/2 top-[12px] h-[36px] w-[22px] -translate-x-1/2 rounded-[11px] border border-sky-100/45 bg-[linear-gradient(180deg,rgba(191,219,254,0.92)_0%,rgba(56,189,248,0.46)_100%)] shadow-[0_0_18px_rgba(125,211,252,0.35)]" />
        <div className="absolute inset-x-[8px] bottom-[10px] top-[64px] rounded-[12px] bg-[linear-gradient(180deg,rgba(59,130,246,0.22)_0%,rgba(30,41,59,0.04)_100%)]" />
      </div>

      <div className="absolute left-[calc(50%-74px)] top-[62px] h-[56px] w-[26px] -skew-x-[14deg] rounded-[14px_8px_18px_14px] border border-sky-200/45 bg-[linear-gradient(180deg,rgba(125,211,252,0.95)_0%,rgba(59,130,246,0.9)_34%,rgba(15,23,42,0.98)_100%)] shadow-[0_0_14px_rgba(96,165,250,0.18)] animate-pulse" />
      <div className="absolute right-[calc(50%-74px)] top-[62px] h-[56px] w-[26px] skew-x-[14deg] rounded-[8px_14px_14px_18px] border border-sky-200/45 bg-[linear-gradient(180deg,rgba(125,211,252,0.95)_0%,rgba(59,130,246,0.9)_34%,rgba(15,23,42,0.98)_100%)] shadow-[0_0_14px_rgba(96,165,250,0.18)] animate-pulse" />

      <div className="absolute left-1/2 bottom-[8px] h-[48px] w-[18px] -translate-x-1/2 rounded-b-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(244,114,182,0.95)_40%,rgba(251,191,36,0.98)_100%)] shadow-[0_0_20px_rgba(251,191,36,0.45)] animate-pulse" />
      <div className="absolute left-1/2 bottom-[-6px] h-[72px] w-[34px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.55)_0%,rgba(251,146,60,0.32)_30%,rgba(59,130,246,0.05)_58%,transparent_72%)] blur-[1px]" />

      <div className="absolute left-1/2 top-[70px] z-20 w-[min(520px,82vw)] -translate-x-1/2 rounded-[16px_16px_24px_24px] border border-sky-300/50 bg-[linear-gradient(180deg,rgba(8,14,30,0.96)_0%,rgba(6,12,28,0.9)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(198,226,255,0.18),0_0_34px_rgba(56,189,248,0.16)] max-[720px]:w-[min(440px,86vw)] max-[720px]:px-3 max-[720px]:py-3">
        <div className="pointer-events-none absolute inset-x-1/2 top-[-14px] h-[18px] w-[92px] -translate-x-1/2 rounded-b-[14px] bg-[linear-gradient(180deg,rgba(96,165,250,0.9),rgba(30,64,175,0.55))] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <div className="pointer-events-none absolute inset-x-4 top-3 h-px bg-gradient-to-r from-transparent via-sky-200/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-4 bottom-3 h-px bg-gradient-to-r from-transparent via-sky-200/25 to-transparent" />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default React.memo(Spaceship);
