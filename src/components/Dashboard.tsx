import { useEffect, useState } from 'react'
import { JobsApi, type JobStats } from '../api'
import { useSSE } from '../hooks/useSSE'

const statCards = [
  { key: 'pending',    label: 'Pending',    color: '#4f8ef7' },
  { key: 'processing', label: 'Processing', color: '#f5a623' },
  { key: 'completed',  label: 'Completed',  color: '#34c97a' },
  { key: 'failed',     label: 'Failed',     color: '#e8445a' },
  { key: 'cancelled',  label: 'Cancelled',  color: '#8a95a8' },
  { key: 'dlq',        label: 'DLQ',        color: '#a78bfa' },
] as const

export default function Dashboard({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = () => {
    JobsApi.stats()
      .then(setStats)
      .finally(() => setLoading(false))
  }

  // refresh stats on every SSE event
  useSSE(() => fetchStats())

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Live job counts — updates automatically
        </p>
      </div>

      {/* stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}>
        {statCards.map(({ key, label, color }) => (
          <div
            key={key}
            onClick={() => onNavigate(key === 'dlq' ? 'dlq' : 'jobs')}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = color
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
              {loading ? '—' : (stats?.[key] ?? 0)}
            </div>
          </div>
        ))}
      </div>

      {/* quick actions */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: '+ Create Job', tab: 'create', bg: 'var(--accent)' },
            { label: 'View All Jobs', tab: 'jobs', bg: 'var(--bg-elevated)' },
            { label: 'Dead Letter Queue', tab: 'dlq', bg: 'var(--bg-elevated)' },
          ].map(({ label, tab, bg }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              style={{
                background: bg,
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                border: '1px solid var(--border)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}