export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <img src="/favicon.svg" alt="" className="h-8 w-8" />
      <span className={`text-[15px] font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
        Appeal<span className="text-brand-500">Copilot</span>
      </span>
    </a>
  )
}
