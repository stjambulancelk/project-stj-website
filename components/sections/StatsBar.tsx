"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 5, suffix: ".0★", label: "Google Rating", note: "28+ verified reviews" },
  { value: 24, suffix: "/7", label: "Hours Available", note: "365 days a year" },
  { value: 100, suffix: "+", label: "Events Covered", note: "Sports, corporate & community" },
  { value: 3, suffix: "+", label: "Years Serving", note: "Southern Province" },
];

function useCountUp(target: number, duration = 1500, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function StatItem({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const count = useCountUp(stat.value, 1200, active);
  return (
    <div className="text-center px-6 py-2">
      <p className="text-4xl lg:text-5xl font-bold text-white mb-1">
        {count}<span className="text-emerald-400">{stat.suffix}</span>
      </p>
      <p className="text-white font-semibold text-sm mb-0.5">{stat.label}</p>
      <p className="text-slate-400 text-xs">{stat.note}</p>
    </div>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-16 bg-navy-gradient overflow-hidden"
    >
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true"
        style={{ backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <div className="container-main relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}
