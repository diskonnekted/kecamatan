"use client";

import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            className={`rounded-2xl border bg-white transition-colors ${
              isOpen
                ? "border-[var(--color-primary)]"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full px-5 sm:px-6 py-4 flex items-start gap-4 text-left"
              aria-expanded={isOpen}
            >
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isOpen
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                }`}
              >
                {i + 1}
              </span>
              <span className="flex-1 font-semibold text-sm sm:text-base leading-snug">
                {item.question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`flex-shrink-0 transition-transform ${
                  isOpen ? "rotate-180 text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 pl-[3.25rem] sm:pl-[3.75rem]">
                <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line">
                  {item.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
