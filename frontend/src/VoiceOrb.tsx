export type VoiceOrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface VoiceOrbProps {
  state: VoiceOrbState
  disabled: boolean
  onClick: () => void
  label: string
}

export function VoiceOrb({ state, disabled, onClick, label }: VoiceOrbProps) {
  const modifier = state === 'idle' ? '' : ` voice-orb--${state}`
  return (
    <button
      type="button"
      className={`voice-orb${modifier}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    />
  )
}
