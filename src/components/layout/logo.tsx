export function LogoMark({ className = '' }: { className?: string }) {
  // Three courses of a wall stepping down: the F of FORTEBASE.
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className={className}>
      <rect x="2" y="3" width="24" height="6" rx="1.2" fill="var(--color-accent)" />
      <rect x="2" y="11" width="17" height="6" rx="1.2" fill="currentColor" />
      <rect x="2" y="19" width="9" height="6" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ name, descriptor, compact = false }: { name: string; descriptor?: string; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="h-7 w-7 shrink-0" />
      <span className="grid leading-none">
        <span className="font-display text-[17px] font-extrabold min-[360px]:text-[19px] tracking-[-0.01em]" style={{ fontStretch: '122%' }}>
          {name}
        </span>
        {!compact && descriptor ? <span className="label mt-1 hidden text-[11px] tracking-[0.06em] uppercase opacity-70 sm:block">{descriptor}</span> : null}
      </span>
    </span>
  );
}
