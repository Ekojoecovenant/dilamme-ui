import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Dashboard from './components/Dashboard'
import JobsTable from './components/JobsTable'
import CreateJobForm from './components/CreateJobForm'
import DlqView from './components/DlqView'
import { useSSE } from './hooks/useSSE'
import './index.css'

type Tab = 'dashboard' | 'jobs' | 'create' | 'dlq'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const { connected } = useSSE()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          fontSize: '13px',
        }
      }} />

      {/* navbar */}
      <nav style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '52px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            ⚡ Dilamme Scheduler
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['dashboard', 'jobs', 'create', 'dlq'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t === 'dlq' ? 'DLQ' : t}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: connected ? 'var(--success)' : 'var(--danger)',
          }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {connected ? 'live' : 'disconnected'}
          </span>
        </div>
      </nav>

      {/* main content */}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'jobs'      && <JobsTable />}
        {tab === 'create'    && <CreateJobForm onCreated={() => setTab('jobs')} />}
        {tab === 'dlq'       && <DlqView />}
      </main>
    </div>
  )
}