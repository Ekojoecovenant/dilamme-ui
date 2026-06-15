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
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text)',
            border: '1px solid var(--border-light)',
            fontSize: '12px',
            fontFamily: 'var(--mono)',
            borderRadius: 'var(--radius-sm)',
          }
        }}
      />

      {/* nav */}
      <nav style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* logo */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--text-sub)',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '6px', height: '6px',
            borderRadius: '1px',
            background: 'var(--amber)',
            display: 'inline-block',
          }} />
          dilamme-scheduler
        </div>

        {/* tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {(['dashboard', 'jobs', 'create', 'dlq'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-sub)',
                fontSize: '12px',
                fontWeight: tab === t ? 500 : 400,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.03em',
                position: 'relative',
                transition: 'color 0.15s',
                borderBottom: tab === t ? '1px solid var(--amber)' : '1px solid transparent',
              }}
            >
              {t === 'dlq' ? 'DLQ' : t}
            </button>
          ))}
        </div>

        {/* status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: connected ? 'var(--green)' : 'var(--text-muted)',
        }}>
          <div style={{
            width: '5px', height: '5px',
            borderRadius: '50%',
            background: connected ? 'var(--green)' : 'var(--text-muted)',
          }} />
          {connected ? 'connected' : 'offline'}
        </div>
      </nav>

      {/* content */}
      <main style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'jobs'      && <JobsTable />}
        {tab === 'create'    && <CreateJobForm onCreated={() => setTab('jobs')} />}
        {tab === 'dlq'       && <DlqView />}
      </main>
    </div>
  )
}