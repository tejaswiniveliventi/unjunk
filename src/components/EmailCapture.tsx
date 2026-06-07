'use client'

import { useState } from 'react'

type Props = {
  searchId: string | null
  sessionId: string
}

export default function EmailCapture({ searchId, sessionId }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return
    setLoading(true)

    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, searchId, sessionId })
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)   // fail silently — don't block the user
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '24px',
        background: '#F0FFF6',
        borderRadius: 'var(--radius)',
        marginBottom: 40
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#00875A' }}>
          ✓ We'll follow up in 48 hours
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Let us know if the alternative actually tasted similar!
        </p>
      </div>
    )
  }

  return (
    <div style={{
      padding: '24px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: 40
    }}>
      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
        Did you try one of these?
      </p>
      <p style={{
        fontSize: 13,
        color: 'var(--text-secondary)',
        marginBottom: 16,
        lineHeight: 1.5
      }}>
        Drop your email and we'll send you a quick 3-question survey
        in 48 hours. Your feedback helps improve recommendations for everyone.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 14,
            border: '1.5px solid var(--border)',
            borderRadius: 8,
            outline: 'none',
            background: 'var(--bg)'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '...' : 'Notify me'}
        </button>
      </div>
    </div>
  )
}