import { useEffect, useState } from 'react'
import { type Job, JobsApi } from '../api'
import { useSSE } from '../hooks/useSSE'
import toast from 'react-hot-toast'

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export default function DlqView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)

  const fetchDlq = () => {
    JobsApi.dlq()
      .then(setJobs)
      .finally(() => setLoading(false))
  }

  useSSE(() => fetchDlq())
  useEffect(() => { fetchDlq() }, [])

  const handleRetry = async (id: string) => {
    setRetrying(id)
    try {
      await JobsApi.retryDlq(id)
      toast.success('Job re-enqueued from DLQ')
      fetchDlq()
    } catch {
      toast.error('Retry failed')
    } finally {
      setRetrying(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Dead Letter Queue</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Jobs that exhausted all 3 retry attempts — DLQ alert fires at 10 entries
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
          Loading...
        </div>
      ) : jobs.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '60px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
          <div>DLQ is empty — all jobs processed successfully</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map(job => (
            <div
              key={job.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{job.type}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}>
                      {job.id.slice(0, 8)}...
                    </span>
                    <span style={{
                      background: '#2d1015',
                      color: 'var(--danger)',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontWeight: 600,
                    }}>
                      {job.retryCount} attempts
                    </span>
                  </div>

                  {/* error details */}
                  {job.errorDetails && (
                    <div style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--danger)',
                    }}>
                      {String(job.errorDetails.message ?? JSON.stringify(job.errorDetails))}
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Failed at: {fmt(job.updatedAt)} · Created: {fmt(job.createdAt)}
                  </div>
                </div>

                <button
                  onClick={() => handleRetry(job.id)}
                  disabled={retrying === job.id}
                  style={{
                    background: retrying === job.id ? 'var(--bg-elevated)' : 'transparent',
                    color: retrying === job.id ? 'var(--text-muted)' : 'var(--success)',
                    border: `1px solid ${retrying === job.id ? 'var(--border)' : 'var(--success)'}`,
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (retrying !== job.id) {
                      e.currentTarget.style.background = 'var(--success)'
                      e.currentTarget.style.color = '#fff'
                    }
                  }}
                  onMouseLeave={e => {
                    if (retrying !== job.id) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--success)'
                    }
                  }}
                >
                  {retrying === job.id ? 'Retrying...' : '↺ Retry'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}