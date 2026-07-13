'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Our Mission", href: "#mission" },
  { label: "Services", href: "#solution" }
];

export function Navbar() {
  const router = useRouter();
  const { login, isAuthenticated, ready } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        await login();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-28 py-4 bg-[#050505]/40 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="w-7 h-7" innerClassName="w-3 h-3" />
          <span className="font-bold text-white text-lg tracking-tight">
            CryptoBill
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link, i) => (
            <div key={link.label} className="flex items-center gap-3">
              <a
                href={link.href}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
              {i < NAV_LINKS.length - 1 && (
                <span className="text-slate-600/50">•</span>
              )}
            </div>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleLogin}
            loading={loading}
            className="rounded-full bg-white text-black hover:bg-slate-200 px-6 py-2 text-xs font-semibold"
          >
            {isAuthenticated ? "DASHBOARD" : "ACCESS WALLET"}
          </Button>
        </div>
      </div>
    </header>
  );
}
