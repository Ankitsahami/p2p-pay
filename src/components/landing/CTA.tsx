'use client';

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "./Logo";
import { fadeUp } from "@/lib/motion";

const HLS_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export function CTA() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: any = null;
    let cancelled = false;

    import("hls.js").then(({ default: Hls }) => {
      if (cancelled || !video) return;

      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(HLS_URL);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = HLS_URL;
      }
    });

    return () => {
      cancelled = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        await login();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmin = () => {
    router.push("/admin");
  };

  return (
    <section className="relative py-32 md:py-44 px-6 border-t border-white/10 overflow-hidden bg-black">
      {/* HLS background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/45 z-[1]" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
        <motion.div {...fadeUp(0)}>
          <Logo className="w-10 h-10 mb-8" innerClassName="w-5 h-5" />
        </motion.div>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl md:text-6xl font-medium tracking-[-1.5px] text-white"
        >
          <span className="font-serif italic font-normal text-slate-300">
            Start Settle Dues
          </span>
        </motion.h2>

        <motion.p
          {...fadeUp(0.2)}
          className="text-slate-400 text-lg mt-6 max-w-md"
        >
          Connect with Google, deploy your smart wallet, and pay any real-world utility bill with crypto instantly.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
        >
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-white text-black rounded-lg px-8 py-3.5 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "CONNECTING..." : "CONNECT WALLET"}
          </button>
          <button
            onClick={handleAdmin}
            className="liquid-glass rounded-lg px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            VIEW ADMIN PORTAL
          </button>
        </motion.div>
      </div>
    </section>
  );
}
