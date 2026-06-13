import { useEffect, useState } from 'react'
import { type Job, JobsApi } from '../api'
import { useSSE } from '../hooks/useSSE'
import StatusBadge from './StatusBadge'
import toast from 'react-hot-toast'

const PRIORITY_LABEL: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }
const PRIORITY_COLOR: Record<number, string> = {
  1: 'var(--priority-high)',
  2: 'var(--priority-medium)',
  3: 'var(--priority-low)',
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = () => {
    JobsApi.list()
      .then(setJobs)
      .finally(() => setLoading(false))
  }

  useSSE(() => fetchJobs())

  useEffect(() => { fetchJobs() }, [])

  const handleCancel = async (id: string) => {
    try {
      await JobsApi.cancel(id)
      toast.success('Job cancelled')
      fetchJobs()
    } catch {
      toast.error('Cannot cancel this job')
    }
  }

  if (loading) return (
    <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
      Loading jobs...
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Jobs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            {jobs.length} total — live updates via SSE
          </p>
        </div>
        <button
          onClick={fetchJobs}
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-secondary)',
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            border: '1px solid var(--border)',
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Type', 'Priority', 'Status', 'Retries', 'Scheduled', 'Interval', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No jobs yet
                  </td>
                </tr>
              ) : jobs.map((job, i) => (
                <tr
                  key={job.id}
                  style={{
                    borderBottom: i < jobs.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {job.id.slice(0, 8)}...
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{job.type}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: PRIORITY_COLOR[job.priority], fontWeight: 600, fontSize: '12px' }}>
                      {PRIORITY_LABEL[job.priority] ?? job.priority}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td style={{ padding: '10px 14px', color: job.retryCount > 0 ? 'var(--warning)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {job.retryCount}/{job.maxRetries}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {fmt(job.scheduledAt)}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {job.interval ?? '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {fmt(job.createdAt)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <button
                        onClick={() => handleCancel(job.id)}
                        style={{
                          background: 'transparent',
                          color: 'var(--danger)',
                          fontSize: '12px',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--danger)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--danger)'
                          e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--danger)'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}