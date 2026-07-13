'use client';

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const SOLUTION_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4";

const FEATURES = [
  {
    title: "USDC Settlements",
    description: "Settle utility dues in USDC. Fast transaction speeds and stable values.",
  },
  {
    title: "Gasless Transfers",
    description: "All transactions are fully gas-sponsored. Pay only the exact bill value.",
  },
  {
    title: "Secure Escrows",
    description: "Protected by on-chain escrows. Released only when peer-to-peer UPI is verified.",
  },
  {
    title: "Social Onboarding",
    description: "Login with Google. Embedded smart contract wallets are deployed in the background.",
  },
];

export function Solution() {
  return (
    <section id="solution" className="py-32 md:py-44 px-6 border-t border-white/10 bg-black">
      <div className="max-w-5xl mx-auto">
        <motion.span
          {...fadeUp(0)}
          className="block text-xs tracking-[3px] uppercase text-slate-500 text-center mb-6"
        >
          SOLUTION
        </motion.span>

        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl md:text-6xl font-medium tracking-[-1.5px] text-center max-w-3xl mx-auto text-white"
        >
          The protocol for{" "}
          <span className="font-serif italic font-normal text-slate-300">seamless</span>{" "}
          bill payments
        </motion.h2>

        <motion.div
          {...fadeUp(0.2)}
          className="mt-16 rounded-2xl overflow-hidden aspect-[3/1] border border-white/10"
        >
          <video
            className="w-full h-full object-cover"
            src={SOLUTION_VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 mt-20">
          {FEATURES.map((feature, i) => (
            <motion.div key={feature.title} {...fadeUp(0.1 + i * 0.1)}>
              <h3 className="font-semibold text-white text-base mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
