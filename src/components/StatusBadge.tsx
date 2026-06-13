import { type JobStatus } from '../api'

const colors: Record<JobStatus, { bg: string; color: string }> = {
  pending:    { bg: '#1e2d4a', color: '#4f8ef7' },
  processing: { bg: '#2d2410', color: '#f5a623' },
  completed:  { bg: '#0f2d1e', color: '#34c97a' },
  failed:     { bg: '#2d1015', color: '#e8445a' },
  cancelled:  { bg: '#1e1e1e', color: '#8a95a8' },
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  const c = colors[status] ?? colors.cancelled
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  )
}