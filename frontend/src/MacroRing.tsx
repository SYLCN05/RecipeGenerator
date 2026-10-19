const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface MacroRingProps {
  value: number
  max: number
  unit: string
  label: string
  color: string
}

export function MacroRing({ value, max, unit, label, color }: MacroRingProps) {
  const fraction = Math.min(Math.max(value, 0) / max, 1)
  const dashOffset = CIRCUMFERENCE * (1 - fraction)

  return (
    <div className="macro-ring">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="#333" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <div className="macro-ring-label">
        {value}
        {unit}
        <br />
        {label}
      </div>
    </div>
  )
}
