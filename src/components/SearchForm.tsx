'use client'

import { useState } from 'react'

const CITIES = [
  { slug: 'bangalore', name: 'Bangalore' },
  { slug: 'mumbai',    name: 'Mumbai' },
  { slug: 'delhi',     name: 'Delhi' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'pune',      name: 'Pune' },
  { slug: 'chennai',   name: 'Chennai' },
]

type Props = {
  onSearch: (food: string, city: string) => void
}

export default function SearchForm({ onSearch }: Props) {
  const [food, setFood] = useState('')
  const [city, setCity] = useState('')
  const [touched, setTouched] = useState(false)

  const isValid = food.trim().length >= 2 && city.length > 0

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    onSearch(food.trim(), city)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      gap: 12,
      textAlign: 'center'
    }}>
      {/* Hero */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          lineHeight: 1.2,
          marginBottom: 12
        }}>
          Eat the same.<br />
          <span style={{ color: 'var(--accent)' }}>Skip the junk.</span>
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 16,
          maxWidth: 380,
          lineHeight: 1.6
        }}>
          Type any packaged food and we'll find a cleaner,
          better-ingredient alternative available near you.
        </p>
      </div>

      {/* Form */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <input
          type="text"
          placeholder="e.g. Kurkure Masala Munch, Maggi, Oreo..."
          value={food}
          onChange={e => setFood(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: 15,
            border: touched && food.trim().length < 2
              ? '1.5px solid #E53935'
              : '1.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
            outline: 'none',
            transition: 'border-color 0.15s'
          }}
        />

        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: 15,
            border: touched && !city
              ? '1.5px solid #E53935'
              : '1.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
            outline: 'none',
            color: city ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <option value="" disabled>Select your city</option>
          {CITIES.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: 15,
            fontWeight: 700,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            transition: 'background 0.15s',
            letterSpacing: '0.1px'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          Find Clean Alternative →
        </button>

        {touched && !isValid && (
          <p style={{ color: '#E53935', fontSize: 13, textAlign: 'left' }}>
            Please enter a food name and select your city.
          </p>
        )}
      </div>

      {/* Examples */}
      <div style={{ marginTop: 24 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
          Popular searches
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Kurkure', 'Maggi', 'Oreo', 'Lays', 'Britannia Marie'].map(ex => (
            <button
              key={ex}
              onClick={() => setFood(ex)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                border: '1px solid var(--border)',
                borderRadius: 20,
                background: 'var(--bg-card)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'border-color 0.15s'
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}