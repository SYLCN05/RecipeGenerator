import { useCallback, useRef, useState } from 'react'
import type { Language } from './types'

const localeFor = (language: Language): string => (language === 'tr' ? 'tr-TR' : 'nl-NL')

export function useSpeechRecognition(language: Language | null, onTranscriptChange: (transcript: string) => void) {
  const isSupported = typeof window !== 'undefined' && !!window.webkitSpeechRecognition
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  const start = useCallback(() => {
    if (!isSupported || !language || !window.webkitSpeechRecognition) return

    setError(null)
    finalTranscriptRef.current = ''
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = localeFor(language)
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscriptRef.current =
            (finalTranscriptRef.current ? `${finalTranscriptRef.current} ` : '') + result[0].transcript.trim()
        } else {
          interim += result[0].transcript
        }
      }
      onTranscriptChange(`${finalTranscriptRef.current} ${interim}`.trim())
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event) => {
      setIsListening(false)
      setError(
        event.error === 'not-allowed'
          ? 'Toegang tot de microfoon is geweigerd.'
          : 'Spraakherkenning is mislukt — typ je bericht in plaats daarvan.',
      )
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isSupported, language, onTranscriptChange])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  return { isSupported, isListening, error, start, stop }
}
