"use client";

interface TechWavesProps {
  className?: string;
  color?: string;
}

export default function TechWaves({ className = "", color = "#10b981" }: TechWavesProps) {
  return (
    <div className={`tech-wave ${className}`} aria-hidden="true">
      {/* Wave 1 — fastest */}
      <svg
        className="wave-1 absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 60C180 10 360 110 540 60C720 10 900 110 1080 60C1260 10 1350 90 1440 60V120H0V60Z"
          fill={color}
          fillOpacity="0.12"
        />
      </svg>
      {/* Wave 2 — medium */}
      <svg
        className="wave-2 absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 50C240 0 480 100 720 50C960 0 1200 100 1440 50V100H0V50Z"
          fill={color}
          fillOpacity="0.07"
        />
      </svg>
      {/* Wave 3 — slowest */}
      <svg
        className="wave-3 absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 40C360 -10 720 90 1080 40C1260 15 1380 65 1440 40V80H0V40Z"
          fill={color}
          fillOpacity="0.05"
        />
      </svg>
    </div>
  );
}
