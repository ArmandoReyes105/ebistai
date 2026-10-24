import Image from "next/image"
import Link from "next/link"

const FOOTER_LINKS = [
  { href: "/#preguntale", label: "Qué le preguntas" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#radar", label: "Radar" },
]

const SiteFooter = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Image src="/koi.png" alt="Ebistai" width={24} height={24} />
          <p className="text-sm text-muted-foreground">
            Ebistai, en beta privada.
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-4">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full text-sm font-semibold text-muted-foreground transition-colors duration-300 ease-fluid outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

export default SiteFooter
