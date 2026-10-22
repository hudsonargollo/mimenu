import { useEffect, useRef, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  /** Delay in ms before the animation starts (when in-view) */
  delay?: number;
  /** Animation direction */
  direction?: "up" | "left" | "right" | "none";
  /** Stagger children animations */
  stagger?: boolean;
  /** Override the default class (replaces children directly) */
  asChild?: string;
  className?: string;
}

/**
 * ScrollReveal — wraps children with an intersection-observer-triggered
 * reveal animation.  Uses CSS classes from index.css (.reveal, .reveal.in-view, etc.)
 * Falls back gracefully for prefers-reduced-motion users.
 */
const ScrollReveal = ({
  children,
  delay = 0,
  direction = "up",
  stagger = false,
  className,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Skip animation if user prefers reduced motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const dirClass = {
    up: "reveal",
    left: "reveal left",
    right: "reveal right",
    none: "reveal",
  }[direction];

  const staggerClass = stagger ? "reveal-stagger" : dirClass;

  return (
    <div
      ref={ref}
      className={cn(
        staggerClass,
        inView && "in-view",
        stagger && "in-view",
        delay && !stagger && `delay-[${delay}ms]`,
        className,
      )}
      style={delay && !stagger ? { animationDelay: `${delay}ms` } : {}}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
