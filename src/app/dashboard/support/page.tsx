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
      // fallback
    }
  };

  return (
    <div className={cn("min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 select-none transition-colors duration-300 max-w-xl mx-auto", isDark ? "text-white" : "text-slate-800")}>
      {/* Icon badge */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-10">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4",
          isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-50"
        )}>
          <Clock className="w-3 h-3" />
          Coming Soon
        </span>
        <h1 className={cn("text-3xl font-black tracking-tight mb-4", isDark ? "text-white" : "text-slate-900")}>
          Help &amp; Support
        </h1>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-white/50">
          Our support centre is being built right now. We are working hard to bring you comprehensive FAQs, live chat, and a ticketing system soon.
        </p>
      </div>

      {/* Flat Links Area - No Bounding Boxes or Cards */}
      <div className="w-full flex flex-col gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
        
        {/* Flat link 1: Docs */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-500 flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Looking for specifications?</h3>
            <p className="text-[11px] text-slate-500 dark:text-white/40 leading-normal">
              Read our comprehensive <Link href="/dashboard/docs" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Project Documentation &amp; Spec</Link> to understand the user flow and P2P SDK.
            </p>
          </div>
        </div>

        {/* Flat link 2: Email */}
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-white/5 flex items-center justify-center text-indigo-500 flex-shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Need direct assistance?</h3>
            <p className="text-[11px] text-slate-500 dark:text-white/40 leading-normal">
              Drop us an email at <span className="font-mono text-slate-800 dark:text-white/80 font-bold">{email}</span>. We usually respond within 24 hours.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href={`mailto:${email}`}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Send Email <ArrowRight className="w-3 h-3" />
              </a>
              <button
                onClick={handleCopyEmail}
                className="text-[11px] font-bold text-slate-500 dark:text-white/40 hover:text-slate-850 dark:hover:text-white cursor-pointer"
              >
                {copied ? '✓ Copied!' : 'Copy Email Address'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
