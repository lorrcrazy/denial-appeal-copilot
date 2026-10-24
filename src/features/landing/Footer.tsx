import { Logo } from '../../components/Logo'
import { KFF, PHOTO_AUTHOR, PHOTO_CREDITS, PHOTO_LICENSE } from '../../data/credits'

export function Footer() {
  return (
    <footer className="bg-ink-950 py-14 text-slate-400">
      <div className="container-x grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-md text-sm">
            A hackathon prototype. Not legal or medical advice. Every letter, person, insurer, and Appeal Win in this demo is synthetic.
          </p>
          <p className="mt-4 text-xs">
            Appeal statistics:{' '}
            <a className="underline underline-offset-2 hover:text-white" href={KFF.url} target="_blank" rel="noreferrer">
              {KFF.label}
            </a>
            .
          </p>
        </div>
        <div className="text-xs">
          <p className="font-semibold text-slate-300">Photo credits</p>
          <p className="mt-2">
            Photos by {PHOTO_AUTHOR} via Wikimedia Commons,{' '}
            <a className="underline underline-offset-2 hover:text-white" href={PHOTO_LICENSE.url} target="_blank" rel="noreferrer">
              {PHOTO_LICENSE.name}
            </a>
            :
          </p>
          <ul className="mt-2 space-y-1">
            {PHOTO_CREDITS.map((c) => (
              <li key={c.file}>
                <a className="hover:text-white" href={c.url} target="_blank" rel="noreferrer">
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
