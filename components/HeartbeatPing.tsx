'use client'

import { useEffect } from 'react'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = localStorage.getItem('session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('session_id', sid)
  }
  return sid
}

export default function HeartbeatPing() {
  useEffect(() => {
    const sessionId = getSessionId()
    if (!sessionId) return

    function ping() {
      fetch('/api/presencia/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {})
    }

    ping()
    const interval = setInterval(ping, 60000)
    return () => clearInterval(interval)
  }, [])

  return null
}
