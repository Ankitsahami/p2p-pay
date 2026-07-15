'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, HelpCircle, MessageCircle, Zap, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

export default function SupportPage() {
  const [copied, setCopied] = React.useState(false);
  const email = 'ankitsahani008@gmail.com';
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className={cn("min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 select-none transition-colors duration-300", isDark ? "text-white" : "text-slate-800")}>
      {/* Floating background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className={cn("absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse", isDark ? "bg-blue-900/10 opacity-30" : "bg-blue-100 opacity-40")} />
        <div className={cn("absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000", isDark ? "bg-violet-900/10 opacity-20" : "bg-violet-100 opacity-30")} />
      </div>

      {/* Icon badge */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <HelpCircle className="w-12 h-12 text-white" />
        </div>
        {/* Ping animation */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </span>
        </span>
      </div>

      {/* Heading */}
      <div className="text-center max-w-lg mb-10">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 border",
          isDark
            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
            : "bg-blue-50 border border-blue-100 text-blue-600"
        )}>
          <Clock className="w-3 h-3" />
          Coming Soon
        </span>
        <h1 className={cn("text-4xl font-extrabold tracking-tight mb-4", isDark ? "text-white" : "text-slate-800")}>
          Help &amp; Support
        </h1>
        <p className={cn("text-base leading-relaxed", isDark ? "text-white/50" : "text-slate-500")}>
          Our full support centre is being built right now. We&apos;re working hard to bring you
          comprehensive FAQs, live chat, and a ticketing system very soon.
        </p>
      </div>

      {/* Feature chips — coming soon hints */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {[
          { icon: MessageCircle, label: 'Live Chat' },
          { icon: HelpCircle, label: 'FAQ Centre' },
          { icon: Zap, label: 'Instant Ticket' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold shadow-sm transition-colors",
              isDark
                ? "bg-white/5 border-white/10 text-white/70"
                : "bg-white border-slate-100 text-slate-500"
            )}
          >
            <Icon className="w-3.5 h-3.5 text-blue-400" />
            {label}
            <span className={cn(
              "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border",
              isDark
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-amber-50 text-amber-600 border-amber-100"
            )}>
              Soon
            </span>
          </div>
        ))}
      </div>

      {/* Documentation Card */}
      <Link href="/dashboard/docs" className="w-full max-w-md mb-6 block group">
        <div className={cn(
          "rounded-3xl p-6 border transition-all duration-300 flex items-center justify-between cursor-pointer",
          isDark
            ? "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20"
            : "bg-white border-slate-100 shadow-lg shadow-slate-100/50 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/80"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:scale-105 duration-350 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className={cn("text-sm font-extrabold", isDark ? "text-white" : "text-slate-800")}>Project Documentation</h3>
              <p className={cn("text-[10px] mt-0.5", isDark ? "text-white/40" : "text-slate-500")}>Introduction, P2P SDK guide &amp; user tutorials</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 duration-200 transition-all" />
        </div>
      </Link>

      {/* Contact card */}
      <div className={cn(
        "w-full max-w-md rounded-3xl p-8 border transition-all duration-300",
        isDark
          ? "bg-white/[0.04] border-white/[0.08]"
          : "bg-white border-slate-100 shadow-xl shadow-slate-100/80"
      )}>
        <p className={cn("text-xs font-bold uppercase tracking-wider mb-3", isDark ? "text-white/30" : "text-slate-400")}>
          Need help right now?
        </p>
        <h2 className={cn("text-lg font-extrabold mb-2", isDark ? "text-white" : "text-slate-800")}>Drop us an email</h2>
        <p className={cn("text-sm mb-6 leading-relaxed", isDark ? "text-white/50" : "text-slate-500")}>
          Our support team usually responds within 24&nbsp;hours on business days.
        </p>

        <div className={cn(
          "flex items-center gap-3 p-4 rounded-2xl border mb-4 transition-colors",
          isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-100"
        )}>
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-white/40" : "text-slate-400")}>Support Email</p>
            <p className={cn("text-sm font-bold truncate", isDark ? "text-white" : "text-slate-800")}>{email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={`mailto:${email}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
          >
            <Mail className="w-4 h-4" />
            Send Email
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={handleCopyEmail}
            className={cn(
              "px-4 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer",
              isDark
                ? "border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
