export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink">
      <svg
        viewBox="0 0 40 40"
        className={compact ? 'h-8 w-8' : 'h-10 w-10'}
        aria-hidden
        fill="none"
      >
        <rect x="4" y="7" width="20" height="26" rx="2.5" fill="#fff" stroke="#1F2A44" strokeWidth="1.7" />
        <path d="M9 14h12M9 18h9M9 22h11" stroke="#2A9D8F" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M26 6l2 5.2 5.4-1.2-2.8 5.2 4.8 4-6.2.6-.8 6-4-4.6-5.4 2.6 2-5.4-5.4-3.4 6-.8z"
          fill="#E9C46A"
          stroke="#1F2A44"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M30 28l5 8" stroke="#E06C5C" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="leading-tight">
        <span className="block font-display text-[1.05rem] font-semibold tracking-tight">
          Worksheet Wizard
        </span>
        {!compact ? (
          <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
            Print in 30 seconds
          </span>
        ) : null}
      </span>
    </span>
  )
}
