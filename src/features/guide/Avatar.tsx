export function Avatar({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <span className={`block shrink-0 overflow-hidden rounded-full bg-paper-200 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
        <path d="M13 34c0-14 8-23 19-23s19 9 19 23v12H13z" fill="#3A2A22" />
        <path d="M10 64c2-12 10-17 22-17s20 5 22 17z" fill="#C4603F" />
        <path d="M25 48c2 3 5 4 7 4s5-1 7-4" fill="none" stroke="#F6F6F5" strokeWidth="1.6" />
        <rect x="28" y="40" width="8" height="9" rx="3" fill="#C98F6B" />
        <ellipse cx="32" cy="31" rx="12" ry="13.5" fill="#DDA27C" />
        <path d="M19 30c2-9 8-14 15-14 6 0 11 4 12 10-7 0-13-2-17-7-2 5-6 9-10 11z" fill="#3A2A22" />
        <circle cx="27.5" cy="32" r="1.4" fill="#2A1E18" />
        <circle cx="36.5" cy="32" r="1.4" fill="#2A1E18" />
        <circle cx="24.8" cy="36.2" r="2.1" fill="#D9776A" opacity=".45" />
        <circle cx="39.2" cy="36.2" r="2.1" fill="#D9776A" opacity=".45" />
        <path d="M28 37.6c2.2 2 5.8 2 8 0" stroke="#7E3F2E" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  )
}
