'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

const MISSION_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4";

const PARAGRAPH_1 =
  "We're building a space where crypto meets convenience — where users find zero friction, liquidity providers find yield, and every utility payment becomes a seamless experience.";
const PARAGRAPH_2 =
  "A platform where stablecoins, social authentication, and account abstraction flow together — with less complexity, and more financial freedom for everyone involved.";

const HIGHLIGHT_WORDS = new Set(["crypto", "meets", "convenience"]);

function cleanWord(word: string) {
  return word.replace(/[—,.]/g, "").toLowerCase();
}

interface WordProps {
  word: string
  progress: MotionValue<number>
  range: [number, number]
  highlighted: boolean
}

function Word({ word, progress, range, highlighted }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span
      style={{
        opacity,
        color: highlighted
          ? "hsl(var(--foreground))"
          : "hsl(var(--hero-subtitle))",
      }}
      className="inline-block mr-[0.28em] text-white"
    >
      {word}
    </motion.span>
  );
}

interface RevealTextProps {
  text: string
  progress: MotionValue<number>
  wordOffset: number
  totalWords: number
  className: string
}

function RevealText({
  text,
  progress,
  wordOffset,
  totalWords,
  className,
}: RevealTextProps) {
  const words = text.split(" ");
  return (
    <p className={className}>
      {words.map((word, i) => {
        const idx = wordOffset + i
        const start = idx / totalWords
        const end = (idx + 1) / totalWords
        return (
          <Word
            key={i}
            word={word}
            progress={progress}
            range={[start, end]}
            highlighted={HIGHLIGHT_WORDS.has(cleanWord(word))}
          />
        )
      })}
    </p>
  );
}

export function Mission() {
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start 0.9", "start 0.2"],
  });

  const words1 = PARAGRAPH_1.split(" ");
  const words2 = PARAGRAPH_2.split(" ");
  const totalWords = words1.length + words2.length;

  return (
    <section id="mission" className="pt-0 pb-32 md:pb-44 px-6 bg-black">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Looping mission video */}
        <div className="w-full max-w-[800px] aspect-square rounded-2xl overflow-hidden mb-20 border border-white/10">
          <video
            className="w-full h-full object-cover"
            src={MISSION_VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        {/* Scroll-driven word reveal */}
        <div ref={textRef} className="w-full text-left md:text-center">
          <RevealText
            text={PARAGRAPH_1}
            progress={scrollYProgress}
            wordOffset={0}
            totalWords={totalWords}
            className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-tight text-white"
          />
          <RevealText
            text={PARAGRAPH_2}
            progress={scrollYProgress}
            wordOffset={words1.length}
            totalWords={totalWords}
            className="text-xl md:text-2xl lg:text-3xl font-medium mt-10 leading-snug text-slate-400"
          />
        </div>
      </div>
    </section>
  );
}
