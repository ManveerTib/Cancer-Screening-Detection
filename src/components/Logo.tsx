import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M100 10 L170 40 L170 90 C170 130 145 165 100 190 C55 165 30 130 30 90 L30 40 Z"
        className="fill-white dark:fill-slate-800 stroke-slate-900 dark:stroke-white"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Shield inner border */}
      <path
        d="M100 20 L160 45 L160 90 C160 125 138 155 100 177 C62 155 40 125 40 90 L40 45 Z"
        className="fill-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900"
        strokeWidth="0"
      />

      {/* Circuit nodes on top */}
      <g className="stroke-slate-900 dark:stroke-white" strokeWidth="4" fill="none">
        {/* Left node */}
        <circle cx="70" cy="50" r="6" className="fill-white dark:fill-slate-800" />
        <line x1="70" y1="56" x2="85" y2="75" />

        {/* Center node */}
        <circle cx="100" cy="40" r="6" className="fill-white dark:fill-slate-800" />
        <line x1="100" y1="46" x2="100" y2="75" />

        {/* Right node */}
        <circle cx="130" cy="50" r="6" className="fill-white dark:fill-slate-800" />
        <line x1="130" y1="56" x2="115" y2="75" />
      </g>

      {/* Robot head - blue rounded rectangle */}
      <rect
        x="65"
        y="75"
        width="70"
        height="50"
        rx="15"
        className="fill-blue-500 stroke-slate-900 dark:stroke-white"
        strokeWidth="5"
      />

      {/* Left ear/antenna */}
      <rect
        x="55"
        y="90"
        width="10"
        height="20"
        rx="5"
        className="fill-slate-900 dark:fill-white"
      />

      {/* Right ear/antenna */}
      <rect
        x="135"
        y="90"
        width="10"
        height="20"
        rx="5"
        className="fill-slate-900 dark:fill-white"
      />

      {/* Left eye */}
      <circle
        cx="82"
        cy="95"
        r="8"
        className="fill-slate-900 dark:fill-slate-900"
      />

      {/* Right eye */}
      <circle
        cx="118"
        cy="95"
        r="8"
        className="fill-slate-900 dark:fill-slate-900"
      />

      {/* Smile */}
      <path
        d="M 80 108 Q 100 118 120 108"
        className="stroke-slate-900 dark:stroke-slate-900"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Connection point from nodes to robot head */}
      <line
        x1="85"
        y1="75"
        x2="100"
        y2="75"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="3"
      />
      <line
        x1="100"
        y1="75"
        x2="115"
        y2="75"
        className="stroke-slate-900 dark:stroke-white"
        strokeWidth="3"
      />
    </svg>
  );
};
