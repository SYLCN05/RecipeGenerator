import { useCallback, useState } from 'react'
import type { Language } from './types'

const localeFor = (language: Language): string => (language === 'tr' ? 'tr-TR' : 'nl-NL')

export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(
    (text: string, language: Language) => {
      if (!isSupported || isMuted) return
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = localeFor(language)
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, isMuted],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      if (!muted) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      return !muted
    })
  }, [])

  return { isSupported, isMuted, isSpeaking, speak, toggleMute }
}
