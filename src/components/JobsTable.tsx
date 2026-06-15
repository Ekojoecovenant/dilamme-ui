import { useEffect, useState } from 'react'
import { JobsApi, type PaginatedJobs } from '../api'
import { useSSE } from '../hooks/useSSE'
import StatusBadge from './StatusBadge'
import toast from 'react-hot-toast'

const PRIORITY_LABEL: Record<number, string> = { 1: 'high', 2: 'med', 3: 'low' }
const PRIORITY_COLOR: Record<number, string> = {
  1: 'var(--red)',
  2: 'var(--amber)',
  3: 'var(--green)',
}

function fmt(iso: string | null) {
  if (!iso) return '·'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const th: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  color: 'var(--text-muted)',
  fontWeight: 400,
  fontSize: '10px',
  fontFamily: 'var(--mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-surface)',
}

export default function JobsTable() {
  const [result, setResult] = useState<PaginatedJobs | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchJobs = (p = page) => {
    JobsApi.list(p, 50)
      .then(setResult)
      .finally(() => setLoading(false))
  }

  useSSE(() => fetchJobs(page))
  useEffect(() => { fetchJobs(page) }, [page])

  const handleCancel = async (id: string) => {
    try {
      await JobsApi.cancel(id)
      toast.success('cancelled')
      fetchJobs(page)
    } catch {
      toast.error('cannot cancel')
    }
  }

  const jobs = result?.data ?? []
  const total = result?.total ?? 0
  const totalPages = result?.totalPages ?? 1

  return (
    <div>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '11px',
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '6px',
          }}>
            system / jobs
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
            Job Queue
          </h1>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {total.toLocaleString()} total · page {page} of {totalPages}
          </div>
        </div>
        <button
          onClick={() => fetchJobs(page)}
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--text-sub)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
            fontFamily: 'var(--mono)',
            border: '1px solid var(--border-light)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
        >
          refresh
        </button>
      </div>

      {/* table */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['id', 'type', 'priority', 'status', 'retries', 'scheduled', 'interval', 'created', ''].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    loading...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    no jobs found
                  </td>
                </tr>
              ) : jobs.map((job, i) => (
                <tr
                  key={job.id}
                  style={{ borderBottom: i < jobs.length - 1 ? '1px solid var(--border)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {job.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text)' }}>
                    {job.type}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      color: PRIORITY_COLOR[job.priority],
                      letterSpacing: '0.04em',
                    }}>
                      {PRIORITY_LABEL[job.priority]}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '11px', color: job.retryCount > 0 ? 'var(--orange)' : 'var(--text-muted)' }}>
                    {job.retryCount}/{job.maxRetries}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {fmt(job.scheduledAt)}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {job.interval ?? '·'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {fmt(job.createdAt)}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <button
                        onClick={() => handleCancel(job.id)}
                        style={{
                          background: 'transparent',
                          color: 'var(--red)',
                          fontSize: '10px',
                          fontFamily: 'var(--mono)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--red)',
                          opacity: 0.7,
                          transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                      >
                        cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            showing {((page - 1) * 50) + 1}–{Math.min(page * 50, total)} of {total.toLocaleString()}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                color: page === 1 ? 'var(--text-muted)' : 'var(--text-sub)',
                fontSize: '11px',
                fontFamily: 'var(--mono)',
                border: '1px solid var(--border-light)',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              prev
            </button>

            {/* page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: page === p ? 'var(--amber)' : 'var(--bg-elevated)',
                    color: page === p ? '#000' : 'var(--text-sub)',
                    fontSize: '11px',
                    fontFamily: 'var(--mono)',
                    border: '1px solid ' + (page === p ? 'var(--amber)' : 'var(--border-light)'),
                    fontWeight: page === p ? 500 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              )
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                color: page === totalPages ? 'var(--text-muted)' : 'var(--text-sub)',
                fontSize: '11px',
                fontFamily: 'var(--mono)',
                border: '1px solid var(--border-light)',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}