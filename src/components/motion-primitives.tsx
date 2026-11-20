"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";

const easeOut = [0.22, 1, 0.36, 1] as const;

// SSR-safe reveal: the hidden state (.rv) is only ever added by this component
// after hydration, so pre-JS / no-JS / crashed-JS renders always show content.
function observeAndReveal(el: HTMLElement, targets: HTMLElement[], margin: string) {
  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.remove("rv"));
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        targets.forEach((t) => t.classList.add("in"));
        io.disconnect();
      }
    },
    { rootMargin: margin, threshold: 0.01 }
  );
  io.observe(el);
  return () => io.disconnect();
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transitionDelay = `${delay * 90}ms`;
    el.classList.add("rv");
    return observeAndReveal(el, [el], "0px 0px -80px 0px");
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    kids.forEach((k, i) => {
      k.style.transitionDelay = `${i * 90}ms`;
      k.classList.add("rv");
    });
    return observeAndReveal(el, kids, "0px 0px -60px 0px");
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function AnimatedCounter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <span ref={ref} className={className}>
      {inView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CounterInner target={value} />
        </motion.span>
      ) : (
        <span>{value.toLocaleString()}</span>
      )}
      {suffix}
    </span>
  );
}

function CounterInner({ target }: { target: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, target, { duration: 1.6, ease: easeOut });
    return () => controls.stop();
  }, [mv, target]);
  return <motion.span>{text}</motion.span>;
}
