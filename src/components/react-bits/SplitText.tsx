"use client";

import { useEffect, useState } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function SplitText({ text, className = "", delay = 50, stagger = 20 }: SplitTextProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!mounted || prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(" ");

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: word animation order is static
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap mr-[0.25em]">
          {Array.from(word).map((char, charIndex) => {
            const index = wordIndex * 5 + charIndex;
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: character animation order is static
                key={`${char}-${charIndex}`}
                className="inline-block transition-all duration-500 ease-out"
                style={{
                  transitionDelay: `${delay + index * stagger}ms`,
                  animation: `fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay + index * stagger}ms both`,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
