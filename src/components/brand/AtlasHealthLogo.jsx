import React from 'react';

/**
 * Atlas Health — SVG logo mark
 * Stylized "A" in navy with a teal EKG/heartbeat crossbar.
 * Usage: <AtlasHealthLogo size={40} />
 */
export default function AtlasHealthLogo({
  size = 40,
  className = '',
  style = {},
  animate = false,
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-label="Atlas Health"
      role="img"
    >
      {/* Outer A strokes — navy */}
      <path
        d="M10 40 L24 8 L38 40"
        stroke="#003666"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* EKG heartbeat crossbar — teal */}
      <path
        d="M15 27 L18 27 L20 22 L22 32 L24 20 L26 30 L28 27 L33 27"
        stroke="#00BCD4"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {animate && (
          <animate
            attributeName="stroke-dashoffset"
            from="60"
            to="0"
            dur="1.4s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* Subtle dot at apex */}
      <circle cx="24" cy="8" r="2" fill="#003666" opacity="0.6" />
    </svg>
  );
}
