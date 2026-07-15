'use client';

import * as React from 'react';
import { Mail, HelpCircle, MessageCircle, Zap, Clock, ArrowRight } from 'lucide-react';

export default function SupportPage() {
  const [copied, setCopied] = React.useState(false);
  const email = 'ankitsahani008@gmail.com';

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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 select-none">
      {/* Floating background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-100 rounded-full opacity-40 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-violet-100 rounded-full opacity-30 blur-3xl animate-pulse delay-1000" />
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-wider uppercase mb-4">
          <Clock className="w-3 h-3" />
          Coming Soon
        </span>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
          Help &amp; Support
        </h1>
        <p className="text-slate-500 text-base leading-relaxed">
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
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-xs font-semibold text-slate-500"
          >
            <Icon className="w-3.5 h-3.5 text-blue-400" />
            {label}
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100">
              Soon
            </span>
          </div>
        ))}
      </div>

      {/* Contact card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/80 p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Need help right now?
        </p>
        <h2 className="text-lg font-extrabold text-slate-800 mb-2">Drop us an email</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Our support team usually responds within 24&nbsp;hours on business days.
        </p>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Support Email</p>
            <p className="text-sm font-bold text-slate-800 truncate">{email}</p>
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
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
