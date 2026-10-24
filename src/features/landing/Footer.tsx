import { Logo } from '../../components/Logo'
import { KFF, PHOTO_CREDITS } from '../../data/credits'

export function Footer() {
  return (
    <footer className="border-t border-paper-200 bg-paper-100 py-14 text-ink-700">
      <div className="container-x grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-[15px]">Made at a hackathon by students who've watched people they love fight these letters. Not legal or medical advice. Every letter, person, and story here is made up.</p>
          <p className="mt-4 text-sm">
            Appeal numbers:{' '}
            <a className="underline underline-offset-2 hover:text-ink-950" href={KFF.url} target="_blank" rel="noreferrer">
              {KFF.label}
            </a>
          </p>
        </div>
        <div className="text-sm">
          <p className="font-bold text-ink-900">Photo credits</p>
          <ul className="mt-2 space-y-1">
            {PHOTO_CREDITS.map((c) => (
              <li key={c.file}>
                <a className="hover:text-ink-950 hover:underline" href={c.url} target="_blank" rel="noreferrer">
                  {c.title}
                </a>{' '}
                by {c.author},{' '}
                <a className="underline underline-offset-2" href={c.licenseUrl} target="_blank" rel="noreferrer">
                  {c.license}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
