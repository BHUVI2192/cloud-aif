import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-12 py-16 bg-[#263238] text-[#e6f3fb] border-t border-outline-variant/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-9 border-b pb-10 md:grid-cols-4 border-white/10">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src="/logo_192.png" alt="Ogenzo logo icon" className="h-[28px] w-auto rounded-sm object-contain brightness-0 invert" />
              <img src="/wordmark.svg" alt="Ogenzo logo wordmark" className="h-[20px] w-auto object-contain brightness-0 invert" />
            </div>
            <p className="max-w-[24em] text-[14px] leading-relaxed text-[#e6f3fb]/80 font-medium">
              A trusted local services marketplace connecting Shivamogga homes with verified professionals.
            </p>
          </div>
          <FooterCol title="Services" links={[["All categories", "/services"], ["Home repair", "/services/home-repair-handyman"], ["Cleaning", "/services/cleaning-pest-control"], ["Beauty", "/services/salon-spa-beauty"]]} />
          <FooterCol title="Company" links={[["How it works", "/how-it-works"], ["Become a provider", "/become-a-provider"], ["Support", "/support"], ["FAQ", "/faq"]]} />
          <FooterCol title="Legal" links={[["Privacy", "/privacy"], ["Terms", "/terms"]]} />
        </div>
        <div className="flex flex-wrap justify-between gap-2 pt-6 text-[13px] text-[#e6f3fb]/70 font-semibold">
          <span>© {new Date().getFullYear()} Ogenzo · Shivamogga, Karnataka</span>
          <span>Made for local trust.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-4 font-inter text-[14px] font-bold text-white uppercase tracking-wider">{title}</h4>
      <ul className="space-y-2.5 text-[14px] font-medium">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="hover:text-white transition duration-150 min-h-[44px] inline-flex items-center">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
