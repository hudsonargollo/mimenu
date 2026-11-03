export function BrandMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#0B0A09" />
      <path
        d="M9 8h14v5a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V8z"
        fill="#3F127A"
      />
      <path
        d="M7 8a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8z"
        fill="#0B0A09"
      />
      <path
        d="M16 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        fill="#3F127A"
      />
      <path
        d="M8 18h2M22 18h2"
        stroke="#3F127A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 22h4"
        stroke="#3F127A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 26h12"
        stroke="#3F127A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
