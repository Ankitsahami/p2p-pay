'use client';

import * as React from 'react';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Input } from "@/components/ui/input";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4";

const AVATARS = ["/avatar-1.png", "/avatar-2.png", "/avatar-3.png"];

export function Hero() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={HERO_VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Bottom fade to black */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-28 md:pt-32 px-6 text-center">
        {/* Avatar row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="flex -space-x-2">
            {AVATARS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-black object-cover"
              />
            ))}
          </div>
          <span className="text-slate-300 text-sm">
            8,500+ active utility payments settled
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] max-w-4xl text-white font-sans"
        >
          Pay Bills with <span className="font-serif italic font-normal text-slate-300">Crypto</span>{" "}
          Seamlessly
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg mt-6 max-w-xl text-slate-300"
        >
          Sign in with Google. Access a seedless smart contract wallet. Settle water, gas, broadband, and electricity dues gaslessly.
        </motion.p>

        {/* Email/Login form */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          onSubmit={handleStart}
          className="liquid-glass rounded-full p-2 mt-10 w-full max-w-lg flex items-center gap-2"
        >
          <input
            type="text"
            required
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your email or phone"
            className="flex-1 bg-transparent border-none text-white focus:outline-none px-4 text-sm placeholder-slate-500 min-w-0"
          />
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 bg-white text-black rounded-full px-8 py-3 text-sm font-semibold tracking-wide cursor-pointer disabled:opacity-50"
          >
            {loading ? "CONNECTING..." : "GET STARTED"}
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}
