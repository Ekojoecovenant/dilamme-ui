import { useEffect, useState } from 'react'
import { JobsApi, type JobStats } from '../api'
import { useSSE } from '../hooks/useSSE'

const stats = [
  { key: 'pending',    label: 'pending',    color: 'var(--blue)',   bg: 'var(--blue-bg)' },
  { key: 'processing', label: 'processing', color: 'var(--amber)',  bg: 'var(--amber-bg)' },
  { key: 'completed',  label: 'completed',  color: 'var(--green)',  bg: 'var(--green-bg)' },
  { key: 'failed',     label: 'failed',     color: 'var(--red)',    bg: 'var(--red-bg)' },
  { key: 'cancelled',  label: 'cancelled',  color: 'var(--text-sub)', bg: 'transparent' },
  { key: 'dlq',        label: 'dlq',        color: 'var(--purple)', bg: 'var(--purple-bg)' },
] as const

export default function Dashboard({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const [data, setData] = useState<JobStats | null>(null)

  const fetch = () => JobsApi.stats().then(setData)

  useSSE(() => fetch())
  useEffect(() => {
    fetch()
    const t = setInterval(fetch, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div>
      {/* header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          system / overview
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Job Queue Status
        </h1>
      </div>

      {/* stat grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '1px',
        background: 'var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: '24px',
        border: '1px solid var(--border)',
      }}>
        {stats.map(s => (
          <div
            key={s.key}
            onClick={() => onNavigate(s.key === 'dlq' ? 'dlq' : 'jobs')}
            style={{
              background: 'var(--bg-surface)',
              padding: '20px 16px',
              cursor: 'pointer',
              transition: 'background 0.12s',
              position: 'relative',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
          >
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 600,
              color: s.color,
              fontVariantNumeric: 'tabular-nums',
              fontFamily: 'var(--mono)',
              lineHeight: 1,
            }}>
              {data ? (data[s.key] ?? 0) : '·'}
            </div>
          </div>
        ))}
      </div>

      {/* actions */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginRight: '8px',
          letterSpacing: '0.06em',
        }}>
          actions /
        </span>
        {[
          { label: 'new job', tab: 'create', primary: true },
          { label: 'all jobs', tab: 'jobs', primary: false },
          { label: 'dead letter queue', tab: 'dlq', primary: false },
        ].map(a => (
          <button
            key={a.tab}
            onClick={() => onNavigate(a.tab)}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--radius-sm)',
              background: a.primary ? 'var(--amber)' : 'var(--bg-elevated)',
              color: a.primary ? '#000' : 'var(--text-sub)',
              fontSize: '12px',
              fontFamily: 'var(--mono)',
              fontWeight: a.primary ? 500 : 400,
              border: '1px solid ' + (a.primary ? 'var(--amber)' : 'var(--border-light)'),
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}