'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'
import ResultsList from '@/components/ResultsList'
import EmailCapture from '@/components/EmailCapture'

export type Alternative = {
  rank: number
  name: string
  brand: string
  whySimilar: string
  keyCleanIngredients: string[]
  redFlagsRemoved: string[]
  estimatedNova: number
  cleanlinessScore: number
  explanation: string
  buyLinks: { platform: string; label: string; url: string }[]
}

export type SearchResult = {
  normalizedFood: string
  alternatives: Alternative[]
  fromCache: boolean
}

type AppState = 'idle' | 'loading' | 'results' | 'error'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [searchId, setSearchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [citySlug, setCitySlug] = useState<string>('')
  const [inputText, setInputText] = useState<string>('')

  // Generate or retrieve session ID
  const getSessionId = () => {
    let sid = localStorage.getItem('unjunk_session')
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
      localStorage.setItem('unjunk_session', sid)
    }
    return sid
  }

  const handleSearch = async (food: string, city: string) => {
    setAppState('loading')
    setError(null)
    setInputText(food)
    setCitySlug(city)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: food,
          citySlug: city,
          sessionId: getSessionId()
        })
      })

      const json = await res.json()

      if (!json.success) {
        setError(json.error ?? 'Something went wrong')
        setAppState('error')
        return
      }

      setResult(json.data)
      setAppState('results')

    } catch {
      setError('Network error. Please try again.')
      setAppState('error')
    }
  }

  const handleReset = () => {
    setAppState('idle')
    setResult(null)
    setError(null)
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: '0 24px'
      }}>
        <div style={{
          maxWidth: 720,
          margin: '0 auto',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🌿</span>
            <span style={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '-0.3px'
            }}>UnJunk</span>
          </div>
          {appState === 'results' && (
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              New search
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>

        {appState === 'idle' && (
          <SearchForm onSearch={handleSearch} />
        )}

        {appState === 'loading' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 16
          }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Finding cleaner alternatives...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {appState === 'error' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: 16,
            textAlign: 'center'
          }}>
            <span style={{ fontSize: 40 }}>😕</span>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {error}
            </p>
            <button
              onClick={handleReset}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Try again
            </button>
          </div>
        )}

        {appState === 'results' && result && (
          <>
            <ResultsList result={result} />
            <EmailCapture
              searchId={searchId}
              sessionId={getSessionId()}
            />
          </>
        )}

      </div>
    </main>
  )
}