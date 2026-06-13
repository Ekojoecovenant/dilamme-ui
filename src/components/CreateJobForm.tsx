import { useState } from 'react'
import { JobsApi, type JobInterval, type CreateJobPayload } from '../api'
import toast from 'react-hot-toast'

const inputStyle = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 12px',
  color: 'var(--text-primary)',
  fontSize: '13px',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

export default function CreateJobForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'send_email',
    priority: '2',
    payloadTo: '',
    payloadSubject: '',
    scheduledAt: '',
    interval: '' as JobInterval | '',
    dependencyIds: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.payloadTo || !form.payloadSubject) {
      toast.error('Email "to" and "subject" are required')
      return
    }

    const payload: CreateJobPayload = {
      type: form.type,
      priority: parseInt(form.priority) as 1 | 2 | 3,
      payload: { to: form.payloadTo, subject: form.payloadSubject },
    }

    if (form.scheduledAt) payload.scheduledAt = new Date(form.scheduledAt).toISOString()
    if (form.interval) payload.interval = form.interval
    if (form.dependencyIds.trim()) {
      payload.dependencyIds = form.dependencyIds.split(',').map(s => s.trim()).filter(Boolean)
    }

    setLoading(true)
    try {
      await JobsApi.create(payload)
      toast.success('Job created and enqueued!')
      onCreated()
    } catch {
      toast.error('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Create Job</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          New job will be enqueued into the heap immediately
        </p>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}>
        <div>
          <label style={labelStyle}>Job Type</label>
          <select value={form.type} onChange={set('type')} style={inputStyle}>
            <option value="send_email">send_email</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Priority</label>
          <select value={form.priority} onChange={set('priority')} style={inputStyle}>
            <option value="1">1 — High</option>
            <option value="2">2 — Medium</option>
            <option value="3">3 — Low</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>To (email)</label>
            <input
              value={form.payloadTo}
              onChange={set('payloadTo')}
              placeholder="user@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <input
              value={form.payloadSubject}
              onChange={set('payloadSubject')}
              placeholder="Welcome!"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Scheduled At (optional)</label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={set('scheduledAt')}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Recurring Interval (optional)</label>
          <select value={form.interval} onChange={set('interval')} style={inputStyle}>
            <option value="">No recurrence</option>
            <option value="every_1_minute">Every 1 minute</option>
            <option value="every_5_minutes">Every 5 minutes</option>
            <option value="every_1_hour">Every 1 hour</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Dependency Job IDs (optional)</label>
          <input
            value={form.dependencyIds}
            onChange={set('dependencyIds')}
            placeholder="uuid-1, uuid-2 (comma separated)"
            style={inputStyle}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Job will not run until all listed jobs are completed
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : '#fff',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'opacity 0.15s',
            marginTop: '4px',
          }}
        >
          {loading ? 'Creating...' : 'Create Job'}
        </button>
      </div>
    </div>
  )
}