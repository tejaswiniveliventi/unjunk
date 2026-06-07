import { SearchResult, Alternative } from '@/app/page'
import AlternativeCard from './AlternativeCard'

type Props = {
  result: SearchResult
}

export default function ResultsList({ result }: Props) {
  return (
    <div style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          Cleaner alternatives to
        </p>
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.3px'
        }}>
          {result.normalizedFood}
        </h2>
      </div>

      {/* Cards */}
      {result.alternatives.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🤔</p>
          <p>No clean alternatives found for this product.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Try a different food name.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.alternatives.map(alt => (
            <AlternativeCard key={alt.rank} alternative={alt} />
          ))}
        </div>
      )}
    </div>
  )
}