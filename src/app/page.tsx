'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';

/* ─── Inline Icons ─────────────────────────────────────────────────────────── */
const ArrowUpRight = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7" /><path d="M7 7h10v10" />
  </svg>
);
const Play = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4" /></svg>
);
const ClockIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const GlobeIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const ShieldIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5 3.9 9.7 9 11 5.1-1.3 9-6 9-11V7l-9-5z" />
  </svg>
);
const ZapIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4.09 12.78a1 1 0 0 0 .73 1.66H11l-1 8 8.91-10.78A1 1 0 0 0 18 10H13V2z" />
  </svg>
);

/* ─── FadingVideo ───────────────────────────────────────────────────────────── */
function FadingVideo({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafId = useRef<number | null>(null);
  const fadingOut = useRef(false);

  useEffect(() => () => { if (rafId.current) cancelAnimationFrame(rafId.current); }, []);

  const fadeIn = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    let t0: number | null = null;
    const run = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 500, 1);
      if (videoRef.current) videoRef.current.style.opacity = String(p);
      if (p < 1) rafId.current = requestAnimationFrame(run);
    };
    rafId.current = requestAnimationFrame(run);
  };

  const fadeOut = () => {
    if (fadingOut.current) return;
    fadingOut.current = true;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    let t0: number | null = null;
    const init = videoRef.current ? parseFloat(videoRef.current.style.opacity || '1') : 1;
    const run = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 550, 1);
      if (videoRef.current) videoRef.current.style.opacity = String(Math.max(init * (1 - p), 0));
      if (p < 1) rafId.current = requestAnimationFrame(run);
    };
    rafId.current = requestAnimationFrame(run);
  };

  return (
    <video ref={videoRef} src={src} className={className}
      style={{ opacity: 0, transition: 'none', ...style }}
      autoPlay muted playsInline preload="auto"
      onLoadedData={() => { fadingOut.current = false; fadeIn(); }}
      onTimeUpdate={() => {
        const v = videoRef.current;
        if (!v || !v.duration || isNaN(v.duration)) return;
        if (v.duration - v.currentTime <= 0.55 && !fadingOut.current) fadeOut();
      }}
      onEnded={() => {
        const v = videoRef.current;
        if (v) { v.currentTime = 0; fadingOut.current = false; v.play().then(fadeIn).catch(fadeIn); }
      }}
    />
  );
}

/* ─── BlurText ──────────────────────────────────────────────────────────────── */
function BlurText({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <motion.div className={className} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
      {words.map((word, i) => (
        <motion.span key={i} style={{ display: 'inline-block', marginRight: '0.28em' }}
          variants={{ hidden: { filter: 'blur(10px)', opacity: 0, y: 50 }, visible: { filter: 'blur(0px)', opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } } }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // If already authenticated, go to dashboard; otherwise open Privy login modal
  const handleEnterApp = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      login();
    }
  };

  const fadeUpBlur = (delay: number) => ({
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' as const },
  });

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white/20 selection:text-white overflow-x-hidden" style={{ fontFamily: "'Barlow', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 pointer-events-none">
        <div className="pointer-events-auto cursor-pointer" onClick={() => scrollTo('hero')}>
          <div className="liquid-glass h-12 w-auto px-4 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300">
            <span className="font-bold text-base text-white tracking-tight">P2P-Pay</span>
          </div>
        </div>

        <div className="hidden md:flex items-center pointer-events-auto">
          <div className="liquid-glass rounded-full px-2 py-1.5 flex items-center gap-1">
            {[
              { label: 'Overview', action: () => scrollTo('hero') },
              { label: 'How It Works', action: () => scrollTo('how-it-works') },
              { label: 'Security', action: () => scrollTo('security') },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer">
                {label}
              </button>
            ))}
            <button onClick={() => handleEnterApp()}
              className="bg-white text-black font-medium text-xs px-4 py-2 rounded-full flex items-center gap-1 hover:bg-white/95 active:scale-95 transition-all cursor-pointer ml-2">
              Enter App <ArrowUpRight className="h-3.5 w-3.5 stroke-black stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="flex items-center justify-center pointer-events-auto md:pointer-events-none">
          <button onClick={() => handleEnterApp()}
            className="md:hidden liquid-glass h-10 px-4 rounded-full flex items-center gap-1.5 text-sm font-medium text-white cursor-pointer hover:bg-white/5 active:scale-95 transition-all">
            Enter App <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section id="hero" className="relative min-h-screen w-full bg-black flex flex-col justify-between">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <FadingVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4"
            className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top"
            style={{ width: '120%', height: '120%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black z-[1]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-36 pb-12 px-4 text-center">
          {/* Badge */}
          <motion.div {...fadeUpBlur(0.4)}
            className="liquid-glass rounded-full px-3.5 py-1.5 inline-flex items-center gap-2 text-xs font-light tracking-wide text-white/95">
            <span className="bg-white text-black font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
              Live
            </span>
            <span>P2P-Pay — Now Live on Base Sepolia</span>
          </motion.div>

          {/* Headline */}
          <div className="mt-6 max-w-4xl">
            <BlurText
              text="Pay Utility Bills with Crypto Without Intermediaries"
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold italic text-white leading-[0.85] tracking-[-3px]"
            />
          </div>

          {/* Subtext */}
          <motion.p {...fadeUpBlur(0.8)}
            className="text-sm md:text-base text-white/90 max-w-2xl font-light leading-snug mt-6 px-4">
            Pay electricity, water, gas, broadband, FASTag, credit card bills and more using USDC on Base.
            Secured by on-chain escrow — no banks, no spreads, instant settlement.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div {...fadeUpBlur(1.1)} className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button onClick={() => handleEnterApp()}
              className="liquid-glass-strong rounded-full px-6 py-3 flex items-center gap-2 text-sm font-medium text-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-white/5">
              Pay a Bill Now
              <ArrowUpRight className="h-4 w-4 stroke-white stroke-2" />
            </button>
            <button onClick={() => setShowInfo(true)}
              className="group flex items-center gap-2 text-white/95 text-sm font-medium hover:text-white cursor-pointer active:scale-95 transition-transform">
              <div className="liquid-glass h-8 w-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="h-3 w-3 text-white ml-0.5" />
              </div>
              <span>How P2P-Pay works</span>
            </button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div {...fadeUpBlur(1.3)} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left hover:scale-[1.03] transition-transform duration-300 group">
              <div className="text-white/60 group-hover:text-white transition-colors">
                <ClockIcon className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div className="text-4xl font-bold italic tracking-[-1px] leading-none mt-4 text-white">0% Fees</div>
              <div className="text-xs text-white/70 font-light mt-2 tracking-wide">No intermediary spreads. Pay exactly what you owe.</div>
            </div>
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left hover:scale-[1.03] transition-transform duration-300 group">
              <div className="text-white/60 group-hover:text-white transition-colors">
                <GlobeIcon className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div className="text-4xl font-bold italic tracking-[-1px] leading-none mt-4 text-white">Instant</div>
              <div className="text-xs text-white/70 font-light mt-2 tracking-wide">On-chain escrow settles to merchant in seconds.</div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Trust Bar */}
        <motion.div {...fadeUpBlur(1.4)} className="relative z-10 flex flex-col items-center gap-4 pb-8 pt-6 px-4">
          <div className="liquid-glass rounded-full px-5 py-2 text-[11px] md:text-xs font-light text-white/80 select-none uppercase tracking-widest">
            A trusted, decentralised alternative to conventional bill payment
          </div>
        </motion.div>
      </section>

      {/* ── SECTION 2: HOW IT WORKS ── */}
      <section id="how-it-works" className="relative min-h-screen w-full bg-black flex flex-col justify-between">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <FadingVideo
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-[1]" />
        </div>

        <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-28 pb-12 flex flex-col min-h-screen justify-between">
          <div className="mb-auto max-w-4xl text-left">
            <motion.div initial={{ filter: 'blur(5px)', opacity: 0, y: 15 }} whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.6 }}
              className="text-sm font-medium text-white/85 mb-4 uppercase tracking-widest">
              // How It Works
            </motion.div>
            <motion.h2 initial={{ filter: 'blur(8px)', opacity: 0, y: 20 }} whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="font-bold italic text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] text-white">
              Connect, Pay,<br />and Settle
            </motion.h2>
          </div>

          {/* Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {[
              {
                delay: 0.2,
                icon: <GlobeIcon className="h-5 w-5" />,
                tags: ['Privy Login', 'Smart Wallet', 'No Gas'],
                title: '1. Connect Wallet',
                desc: 'Sign in with email or social — a smart wallet is created instantly. No seed phrases, no complexity. Gas is abstracted away so you start immediately.',
              },
              {
                delay: 0.35,
                icon: <ZapIcon className="h-5 w-5" />,
                tags: ['USDC', 'GG Token', 'INR/USD'],
                title: '2. Select & Pay Bill',
                desc: 'Choose your biller — electricity, water, broadband, FASTag and more. Enter amount in INR and pay with USDC or GG Token. Funds lock in on-chain escrow instantly.',
              },
              {
                delay: 0.5,
                icon: <ShieldIcon className="h-5 w-5" />,
                tags: ['Auto Release', 'P2P Merchant', 'On-chain'],
                title: '3. Merchant Settles',
                desc: 'A verified P2P merchant picks up the order and releases payment to the biller. Escrow auto-releases funds — trustless, transparent, and fully auditable on-chain.',
              },
            ].map(({ delay, icon, tags, title, desc }) => (
              <motion.div key={title}
                initial={{ filter: 'blur(10px)', opacity: 0, y: 35 }}
                whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.8, delay, ease: 'easeOut' }}
                className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0 text-white/95 group-hover:bg-white/5 transition-all">
                    {icon}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {tags.map((tag) => (
                      <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 whitespace-nowrap bg-white/[0.02]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-1" />
                <div className="mt-6 text-left">
                  <h3 className="font-bold italic text-3xl md:text-4xl tracking-[-1px] leading-none text-white">{title}</h3>
                  <p className="text-sm text-white/90 font-light leading-snug max-w-[32ch] mt-4">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section Footer */}
          <div className="mt-12 flex justify-between items-center w-full border-t border-white/5 pt-6 text-[11px] text-white/40 tracking-wider select-none">
            <div>© 2026 P2P-PAY. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => scrollTo('hero')}>BACK TO TOP</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleEnterApp()}>ENTER APP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: SECURITY ── */}
      <section id="security" className="relative min-h-[60vh] w-full bg-black flex flex-col items-center justify-center px-8 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black pointer-events-none" />
        <div className="relative z-10 max-w-3xl text-center">
          <motion.div initial={{ filter: 'blur(5px)', opacity: 0, y: 15 }} whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}
            className="text-sm font-medium text-white/60 mb-4 uppercase tracking-widest">
            // Security
          </motion.div>
          <motion.h2 initial={{ filter: 'blur(8px)', opacity: 0, y: 20 }} whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="font-bold italic text-5xl md:text-6xl leading-tight tracking-[-2px] text-white mb-6">
            Your funds are always safe
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/70 font-light text-base leading-relaxed mb-10">
            All payments flow through auditable smart-contract escrow on Base. Funds only release when the merchant confirms settlement. If anything fails, your USDC is automatically returned.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => handleEnterApp()}
              className="liquid-glass-strong rounded-full px-8 py-4 text-sm font-semibold text-white flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
              Start Paying Bills
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-24 w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-6 text-[11px] text-white/30 tracking-wider select-none gap-4">
          <div>© 2026 P2P-PAY. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <a href="mailto:ankitsahani008@gmail.com" className="hover:text-white transition-colors">CONTACT</a>
            <span onClick={() => handleEnterApp()} className="hover:text-white cursor-pointer transition-colors">ENTER APP</span>
          </div>
        </div>
      </section>

      {/* ── Info Modal ── */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setShowInfo(false)}>
            <motion.div initial={{ scale: 0.95, y: 20, filter: 'blur(10px)' }} animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ scale: 0.95, y: 20, filter: 'blur(10px)' }} transition={{ duration: 0.4, ease: 'easeOut' }}
              className="liquid-glass-strong w-full max-w-lg rounded-[2rem] p-8 text-left relative"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowInfo(false)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full liquid-glass flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all cursor-pointer">
                <span className="text-white text-lg font-light leading-none">×</span>
              </button>
              <h3 className="font-bold italic text-4xl text-white tracking-tight leading-none mb-4">How P2P-Pay Works</h3>
              <p className="text-sm text-white/80 font-light leading-relaxed mb-4">
                P2P-Pay connects users who want to pay bills in crypto with verified merchants who have local currency.
              </p>
              <p className="text-sm text-white/80 font-light leading-relaxed mb-4">
                When you submit a bill payment, your USDC locks in an on-chain escrow smart contract. A merchant accepts the order, pays the biller in local currency (INR), and submits proof on-chain.
              </p>
              <p className="text-sm text-white/80 font-light leading-relaxed">
                Once verified, the escrow releases your USDC to the merchant — trustless, instant, and fully transparent on the Base blockchain.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
