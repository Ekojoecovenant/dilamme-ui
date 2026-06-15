import { useEffect, useState } from 'react'
import { type Job, JobsApi } from '../api'
import { useSSE } from '../hooks/useSSE'
import toast from 'react-hot-toast'

function fmt(iso: string | null) {
  if (!iso) return '·'
  return new Date(iso).toLocaleString()
}

export default function DlqView() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState<string | null>(null)

  const fetchDlq = () => JobsApi.dlq().then(setJobs).finally(() => setLoading(false))

  useSSE(() => fetchDlq())
  useEffect(() => { fetchDlq() }, [])

  const handleRetry = async (id: string) => {
    setRetrying(id)
    try {
      await JobsApi.retryDlq(id)
      toast.success('re-enqueued')
      fetchDlq()
    } catch {
      toast.error('retry failed')
    } finally {
      setRetrying(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'var(--text-muted)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '6px',
        }}>
          system / dead letter queue
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Dead Letter Queue
        </h1>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          alert threshold: 10 entries · {jobs.length} current
        </div>
      </div>

      {loading ? (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', padding: '40px 0' }}>
          loading...
        </div>
      ) : jobs.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            dlq is empty
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {jobs.map(job => (
            <div
              key={job.id}
              style={{
                background: 'var(--bg-surface)',
                padding: '16px 20px',
                borderLeft: '2px solid var(--red)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* job header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 500, color: 'var(--text)' }}>
                    {job.type}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {job.id.slice(0, 8)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    background: 'var(--red-bg)',
                    color: 'var(--red)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    letterSpacing: '0.04em',
                  }}>
                    {job.retryCount} attempts
                  </span>
                </div>

                {/* error */}
                {job.errorDetails && (
                  <div style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 10px',
                    marginBottom: '8px',
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    color: 'var(--red)',
                    wordBreak: 'break-word',
                  }}>
                    {String(job.errorDetails.message ?? JSON.stringify(job.errorDetails))}
                  </div>
                )}

                {/* meta */}
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                  failed {fmt(job.updatedAt)} · created {fmt(job.createdAt)}
                </div>
              </div>

              {/* retry button */}
              <button
                onClick={() => handleRetry(job.id)}
                disabled={retrying === job.id}
                style={{
                  background: 'transparent',
                  color: retrying === job.id ? 'var(--text-muted)' : 'var(--green)',
                  border: `1px solid ${retrying === job.id ? 'var(--border-light)' : 'var(--green)'}`,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontFamily: 'var(--mono)',
                  flexShrink: 0,
                  opacity: retrying === job.id ? 0.5 : 0.8,
                  transition: 'all 0.15s',
                  cursor: retrying === job.id ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (retrying !== job.id) e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { if (retrying !== job.id) e.currentTarget.style.opacity = '0.8' }}
              >
                {retrying === job.id ? 'retrying...' : 'retry'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}