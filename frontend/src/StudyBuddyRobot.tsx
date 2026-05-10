type StudyBuddyRobotProps = {
  className?: string;
  variant?: "default" | "compact";
};

/** Chibi study-buddy robot: white casing, magenta/pink face glow — matches Study Buddy title accent. */
export function StudyBuddyRobot({ className = "", variant = "default" }: StudyBuddyRobotProps) {
  const w = variant === "compact" ? 56 : 120;
  const h = variant === "compact" ? 70 : 150;
  return (
    <svg
      className={`study-buddy-robot ${className}`}
      width={w}
      height={h}
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Study Buddy robot</title>
      <ellipse cx="60" cy="152" rx="28" ry="5" fill="rgb(217 70 239 / 0.22)" />
      {/* hands */}
      <rect x="8" y="98" width="22" height="28" rx="8" fill="#fff8fc" stroke="#f3d0ec" strokeWidth="2" />
      <rect x="90" y="98" width="22" height="28" rx="8" fill="#fff8fc" stroke="#f3d0ec" strokeWidth="2" />
      <line x1="22" y1="108" x2="36" y2="88" stroke="#c4a8d4" strokeWidth="5" strokeLinecap="round" />
      <line x1="98" y1="108" x2="84" y2="88" stroke="#c4a8d4" strokeWidth="5" strokeLinecap="round" />
      {/* torso */}
      <path
        d="M38 148 L38 94 Q38 74 58 74 L62 74 Q82 74 82 94 L82 148 Q60 154 38 148Z"
        fill="#fdfcfe"
        stroke="#e8d4ef"
        strokeWidth="2.5"
      />
      {/* R badge */}
      <rect x="48" y="102" width="24" height="24" rx="4" fill="#2d1838" stroke="#86198f" strokeWidth="1.5" />
      <text
        x="60"
        y="119"
        textAnchor="middle"
        fill="#fff0f8"
        fontSize="14"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
      >
        R
      </text>
      {/* neck */}
      <rect x="54" y="68" width="12" height="10" rx="2" fill="#b8a0c8" />
      {/* head ears */}
      <circle cx="28" cy="42" r="8" fill="#fff6fb" stroke="#f5d0e8" strokeWidth="2" />
      <circle cx="92" cy="42" r="8" fill="#fff6fb" stroke="#f5d0e8" strokeWidth="2" />
      {/* head shell */}
      <rect x="24" y="12" width="72" height="62" rx="18" fill="#fffffe" stroke="#edd6ee" strokeWidth="2.5" />
      <circle cx="60" cy="18" r="4" fill="#a21caf" stroke="#86198f" strokeWidth="1" />
      {/* face screen */}
      <rect x="32" y="22" width="56" height="42" rx="10" fill="#0c1324" stroke="#2d1a32" strokeWidth="1.5" />
      <path d="M36 28h48M36 34h48M36 40h48M36 46h48M36 52h48" stroke="#1a2438" strokeWidth="0.6" opacity="0.45" />
      {/* glow eyes — magenta / pink */}
      <circle cx="46" cy="42" r="6" fill="#f472b6" opacity="0.98" className="study-buddy-eye" />
      <circle cx="74" cy="42" r="6" fill="#f472b6" opacity="0.98" className="study-buddy-eye" />
      <circle cx="46" cy="42" r="2.5" fill="#fff0f7" />
      <circle cx="74" cy="42" r="2.5" fill="#fff0f7" />
      {/* smile */}
      <path
        d="M48 52 Q60 60 72 52"
        stroke="#f9a8d4"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.98"
        className="study-buddy-smile"
      />
    </svg>
  );
}
