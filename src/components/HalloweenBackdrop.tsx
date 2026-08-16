function BatSvg() {
  return (
    <svg
      className="bat-svg"
      viewBox="0 0 64 40"
      width="56"
      height="36"
      aria-hidden="true"
    >
      <path
        d="M32 14
           C29 10 23 6 14 5
           C9 4 5 5 3 8
           C1 11 2 14 6 16
           C10 18 14 18 18 20
           C13 24 11 28 12 33
           C16 32 22 30 27 26
           C29 27 31 28 33 28
           C35 28 37 27 39 26
           C44 30 50 32 54 33
           C55 28 53 24 48 20
           C52 18 56 18 60 16
           C64 14 65 11 63 8
           C61 5 57 4 52 5
           C43 6 37 10 34 14
           Z"
      />
    </svg>
  )
}

function Spiderweb() {
  return (
    <svg
      className="absolute right-0 top-0 z-2 opacity-60"
      width="190"
      height="190"
      viewBox="0 0 190 190"
      aria-hidden="true"
    >
      <g stroke="#8a78a8" strokeWidth="1.4" fill="none" opacity="0.55">
        <path d="M0 0 L190 0 M0 0 L0 190" />
        <path d="M0 0 L134 134" />
        <path d="M0 0 L180 55" />
        <path d="M0 0 L55 180" />
        <path d="M0 0 L190 120" />
        <path d="M0 0 L120 190" />
        <path d="M0 0 L190 185" />
        <path d="M0 0 L185 190" />
        <path d="M20 20 Q95 20 95 95 Q95 170 170 170" />
        <path d="M45 45 Q90 45 90 90 Q90 135 135 135" />
        <path d="M70 70 Q90 70 90 90 Q90 110 110 110" />
      </g>
      <circle cx="86" cy="86" r="3" fill="#cbbcf0" />
    </svg>
  )
}

export function HalloweenBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="noise-overlay" />
      <div aria-hidden="true" className="moon" />
      <div aria-hidden="true" className="fog">
        <div className="fog-blob" />
        <div className="fog-blob" />
        <div className="fog-blob" />
      </div>
      <div aria-hidden="true" className="bat bat-1">
        <BatSvg />
      </div>
      <div aria-hidden="true" className="bat bat-2">
        <BatSvg />
      </div>
      <div aria-hidden="true" className="bat bat-3">
        <BatSvg />
      </div>
      <div aria-hidden="true" className="absolute left-0 top-0 z-[2]">
        <Spiderweb />
      </div>
      <div aria-hidden="true" className="absolute bottom-0 right-0 z-[2] rotate-180 opacity-40">
        <Spiderweb />
      </div>
    </>
  )
}
