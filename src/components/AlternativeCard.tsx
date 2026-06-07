import { Alternative } from '@/app/page'
import { link } from 'fs/promises'

type Props = {
  alternative: Alternative
}

const NOVA_LABELS: Record<number, string> = {
  1: 'Unprocessed',
  2: 'Minimally processed',
  3: 'Processed',
  4: 'Ultra-processed'
}

const NOVA_COLORS: Record<number, string> = {
  1: 'var(--nova-1)',
  2: 'var(--nova-2)',
  3: 'var(--nova-3)',
  4: 'var(--nova-4)'
}

const PLATFORM_ICONS: Record<string, string> = {
  blinkit:          '🟡',
  zepto:            '🔵',
  bigbasket:        '🟢',
  swiggy_instamart: '🟠',
  amazon_in:        '📦',
  amazon_us:        '📦',
  whole_foods:      '🌿',
  instacart:        '🛒'
}

export default function AlternativeCard({ alternative: alt }: Props) {
  const novaColor = NOVA_COLORS[alt.estimatedNova] ?? '#999'
  const scorePercent = Math.round((alt.cleanlinessScore / 12) * 100)

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 20,
      boxShadow: 'var(--shadow)'
    }}>
      {/* Top row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
      }}>
        <div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 4
          }}>
            #{alt.rank} Alternative
          </div>
          <h3 style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.2px',
            marginBottom: 2
          }}>
            {alt.name}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {alt.brand}
          </p>
        </div>

        {/* NOVA badge */}
        <div style={{
          background: novaColor,
          color: '#fff',
          borderRadius: 8,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          textAlign: 'center',
          minWidth: 52
        }}>
          NOVA {alt.estimatedNova}
          <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.9 }}>
            {NOVA_LABELS[alt.estimatedNova]}
          </div>
        </div>
      </div>

      {/* Cleanliness score bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginBottom: 6
        }}>
          <span>Cleanliness score</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {alt.cleanlinessScore}/12
          </span>
        </div>
        <div style={{
          height: 6,
          background: 'var(--border)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${scorePercent}%`,
            background: 'var(--accent)',
            borderRadius: 3,
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Explanation */}
      <p style={{
        fontSize: 14,
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
        marginBottom: 14
      }}>
        {alt.explanation}
      </p>

      {/* Red flags removed */}
      {alt.redFlagsRemoved.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 6
          }}>
            No more
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {alt.redFlagsRemoved.map(flag => (
              <span key={flag} style={{
                padding: '3px 10px',
                fontSize: 12,
                background: '#FFF0F0',
                color: '#E53935',
                borderRadius: 20,
                fontWeight: 500
              }}>
                ✕ {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clean ingredients */}
      {alt.keyCleanIngredients.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 6
          }}>
            Made with
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {alt.keyCleanIngredients.map(ing => (
              <span key={ing} style={{
                padding: '3px 10px',
                fontSize: 12,
                background: '#F0FFF6',
                color: '#00875A',
                borderRadius: 20,
                fontWeight: 500
              }}>
                ✓ {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buy links */}
      <div>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 8
        }}>
          Order now
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {alt.buyLinks.map(link => (
            <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 600,
                border: '1.5px solid var(--border)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'var(--text-primary)',
                background: 'var(--bg)',
                transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
                <span>{PLATFORM_ICONS[link.platform] ?? '🛒'}</span>
                <span>{link.label.replace('Buy on ', '')}</span>
            </a>
            ))}
        </div>
      </div>
    </div>
  )
}