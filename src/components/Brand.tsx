import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="MARTIAL ARTS ONE ホーム">
      <span className="grid size-9 place-items-center rounded-xl bg-navy ring-1 ring-gold-soft/40">
        <svg viewBox="0 0 64 64" className="size-6" aria-hidden>
          <circle cx="32" cy="32" r="17" fill="none" stroke="#c9a961" strokeWidth="3.5" />
          <path d="M32 19v26M19 32h26" stroke="#c9a961" strokeWidth="2.5" opacity=".55" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="wordmark block text-[13px] text-text">MARTIAL ARTS</span>
        {!compact && <span className="wordmark mt-1 block text-[11px] text-gold">ONE</span>}
      </span>
    </Link>
  );
}
