export default function Logo({ size = 28 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="var(--accent)" />
      <path d="M17 11v26M17 25c0-5 3-8 7-8s7 3 7 8v12" fill="none" stroke="#0d0d0d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
