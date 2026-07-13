import Link from 'next/link';

const LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Support", href: "#" }
];

export function Footer() {
  return (
    <footer className="py-12 px-8 md:px-28 bg-[#050505] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span className="text-slate-500 text-sm">
        © 2026 CryptoBill Inc. All rights reserved.
      </span>
      <div className="flex items-center gap-6">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-slate-500 text-sm hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
