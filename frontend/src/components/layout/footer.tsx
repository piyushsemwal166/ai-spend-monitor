import Link from "next/link";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Organizations", href: "/organizations" },
      { label: "Projects", href: "/projects" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact Us", href: "/contact-us" },
      { label: "Security", href: "#" },
      { label: "Socials", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/60 py-14 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-display text-xl font-semibold text-slate-950 dark:text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-500 text-white">
                AS
              </span>
              AI Spend OS
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
              Modern spend governance for organizations managing AI usage, budgets, and accountability at scale.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{group.title}</h3>
              <div className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <Link key={link.label} href={link.href} className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/privacy-policy" className="transition hover:text-slate-900 dark:hover:text-white">Privacy Policy</Link>
            <span className="text-slate-400 dark:text-slate-500">|</span>
            <Link href="/terms-and-conditions" className="transition hover:text-slate-900 dark:hover:text-white">Terms &amp; Conditions</Link>
            <span className="text-slate-400 dark:text-slate-500">|</span>
            <Link href="/refund-policy" className="transition hover:text-slate-900 dark:hover:text-white">Refund Policy</Link>
          </div>

          <div>
            Support: <a href="mailto:piyushdattsemwal@gmail.com" className="transition hover:text-slate-900 dark:hover:text-white">piyushdattsemwal@gmail.com</a>
          </div>

          <div className="text-slate-500 dark:text-slate-400">© 2026 AI Spend OS. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}