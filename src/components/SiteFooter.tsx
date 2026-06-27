import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-12 py-16 text-[#c6d6cb]" style={{ background: "var(--forest)" }}>
      <div className="mx-auto max-w-[1180px] px-7">
        <div className="grid grid-cols-2 gap-9 border-b pb-10 md:grid-cols-4" style={{ borderColor: "rgba(255,255,255,.1)" }}>
          <div>
            <div className="mb-3 flex items-center gap-2.5 font-display text-[21px] font-semibold text-white">
              <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-[17px]" style={{ background: "var(--brand)" }}>C</span>
              Cloud AIF
            </div>
            <p className="max-w-[24em] text-[14px] leading-relaxed">
              A trusted local services marketplace connecting Shivamogga homes with verified professionals.
            </p>
          </div>
          <FooterCol title="Services" links={[["All categories", "/services"], ["Home repair", "/services/home-repair-handyman"], ["Cleaning", "/services/cleaning-pest-control"], ["Beauty", "/services/salon-spa-beauty"]]} />
          <FooterCol title="Company" links={[["How it works", "/how-it-works"], ["Become a provider", "/become-a-provider"], ["Support", "/support"], ["FAQ", "/faq"]]} />
          <FooterCol title="Legal" links={[["Privacy", "/privacy"], ["Terms", "/terms"]]} />
        </div>
        <div className="flex flex-wrap justify-between gap-2 pt-6 text-[13px]">
          <span>© {new Date().getFullYear()} Cloud AIF · Shivamogga, Karnataka</span>
          <span>Made for local trust.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="mb-4 font-sans text-[14px] font-semibold text-white">{title}</h4>
      <ul className="space-y-2.5 text-[14px]">
        {links.map(([label, href]) => (
          <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
