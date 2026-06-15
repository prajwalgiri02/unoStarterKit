import { useEffect, useState } from 'react'

function remainingSeconds(isoTimestamp?: string | null): number {
  if (! isoTimestamp) {
    return 0
  }

  const target = new Date(isoTimestamp).getTime()

  if (Number.isNaN(target)) {
    return 0
  }

  return Math.max(0, Math.ceil((target - Date.now()) / 1000))
}

export default function useCountdownUntil(isoTimestamp?: string | null): number {
  const [seconds, setSeconds] = useState(() => remainingSeconds(isoTimestamp))

  useEffect(() => {
    setSeconds(remainingSeconds(isoTimestamp))
  }, [isoTimestamp])

  useEffect(() => {
    if (seconds <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setSeconds(remainingSeconds(isoTimestamp))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isoTimestamp, seconds])

  return seconds
}
