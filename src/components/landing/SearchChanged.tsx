'use client';

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const PLATFORMS = [
  {
    icon: "/icon-chatgpt.png",
    name: "Stable Settlement",
    description: "Settle bills using USDC. Low costs, predictable value, on-chain proof of payment.",
  },
  {
    icon: "/icon-perplexity.png",
    name: "Privy Embedded Wallets",
    description: "Sign up via social OAuth. Instantly deploy your secure smart contract wallet gaslessly.",
  },
  {
    icon: "/icon-google.png",
    name: "P2P Escrow Protocol",
    description: "Decentralized on-chain escrow swaps crypto directly to fiat for your billing provider.",
  },
];

export function SearchChanged() {
  return (
    <section id="how-it-works" className="pt-52 md:pt-64 pb-6 md:pb-9 px-6 bg-black">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          {...fadeUp(0)}
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] text-white"
        >
          Payments have <span className="font-serif italic font-normal text-slate-300">changed.</span> Have
          you?
        </motion.h2>

        <motion.p
          {...fadeUp(0.1)}
          className="text-slate-400 text-lg max-w-2xl mx-auto mt-8 mb-24"
        >
          The way we pay utility bills has shifted on-chain. Consumers no
          longer need complex web3 setups or browser extensions — they login with social accounts and execute transactions gaslessly.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20">
          {PLATFORMS.map((platform, i) => (
            <motion.div
              key={platform.name}
              {...fadeUp(0.15 + i * 0.1)}
              className="flex flex-col items-center"
            >
              <img
                src={platform.icon}
                alt={platform.name}
                className="w-[200px] h-[200px] object-contain mb-6"
              />
              <h3 className="font-semibold text-white text-base mb-2">{platform.name}</h3>
              <p className="text-slate-400 text-sm max-w-[220px]">
                {platform.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          {...fadeUp(0.2)}
          className="text-slate-500 text-sm text-center"
        >
          If you don't take charge of your financial privacy, who will?
        </motion.p>
      </div>
    </section>
  );
}
