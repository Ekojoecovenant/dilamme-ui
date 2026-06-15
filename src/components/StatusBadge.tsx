import { type JobStatus } from '../api'

const config: Record<JobStatus, { color: string; bg: string }> = {
  pending:    { color: 'var(--blue)',     bg: 'var(--blue-bg)' },
  processing: { color: 'var(--amber)',    bg: 'var(--amber-bg)' },
  completed:  { color: 'var(--green)',    bg: 'var(--green-bg)' },
  failed:     { color: 'var(--red)',      bg: 'var(--red-bg)' },
  cancelled:  { color: 'var(--text-sub)', bg: 'transparent' },
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  const c = config[status] ?? config.cancelled
  return (
    <span style={{
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      fontWeight: 500,
      padding: '2px 7px',
      borderRadius: '3px',
      background: c.bg,
      color: c.color,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      border: `1px solid ${c.color}22`,
    }}>
      {status}
    </span>
  )
}