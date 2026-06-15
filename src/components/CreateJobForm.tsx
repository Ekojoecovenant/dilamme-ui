import { useState } from 'react'
import { JobsApi, type JobInterval, type CreateJobPayload } from '../api'
import toast from 'react-hot-toast'

const field: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 10px',
  color: 'var(--text)',
  fontSize: '12px',
  fontFamily: 'var(--mono)',
  transition: 'border-color 0.15s',
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontFamily: 'var(--mono)',
  fontWeight: 500,
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
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

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.payloadTo || !form.payloadSubject) {
      toast.error('"to" and "subject" are required')
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
      toast.success('job enqueued')
      onCreated()
    } catch {
      toast.error('failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '520px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'var(--text-muted)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '6px',
        }}>
          system / new job
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)' }}>
          Create Job
        </h1>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>

        <div>
          <label style={label}>job type</label>
          <select value={form.type} onChange={set('type')} style={field}>
            <option value="send_email">send_email</option>
          </select>
        </div>

        <div>
          <label style={label}>priority</label>
          <select value={form.priority} onChange={set('priority')} style={field}>
            <option value="1">1 · high</option>
            <option value="2">2 · medium</option>
            <option value="3">3 · low</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={label}>to</label>
            <input
              value={form.payloadTo}
              onChange={set('payloadTo')}
              placeholder="user@example.com"
              style={field}
            />
          </div>
          <div>
            <label style={label}>subject</label>
            <input
              value={form.payloadSubject}
              onChange={set('payloadSubject')}
              placeholder="Hello"
              style={field}
            />
          </div>
        </div>

        <div>
          <label style={label}>scheduled at <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={set('scheduledAt')}
            style={{ ...field, colorScheme: 'dark' }}
          />
        </div>

        <div>
          <label style={label}>interval <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
          <select value={form.interval} onChange={set('interval')} style={field}>
            <option value="">no recurrence</option>
            <option value="every_1_minute">every_1_minute</option>
            <option value="every_5_minutes">every_5_minutes</option>
            <option value="every_1_hour">every_1_hour</option>
          </select>
        </div>

        <div>
          <label style={label}>dependency ids <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
          <input
            value={form.dependencyIds}
            onChange={set('dependencyIds')}
            placeholder="uuid-1, uuid-2"
            style={field}
          />
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>
            job will not run until all listed jobs complete
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? 'var(--bg-elevated)' : 'var(--amber)',
            color: loading ? 'var(--text-muted)' : '#000',
            padding: '9px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontFamily: 'var(--mono)',
            fontWeight: 500,
            border: 'none',
            transition: 'opacity 0.15s',
            marginTop: '4px',
            letterSpacing: '0.04em',
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {loading ? 'enqueueing...' : 'enqueue job'}
        </button>
      </div>
    </div>
  )
}