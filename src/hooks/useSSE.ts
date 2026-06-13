import { useEffect, useRef, useState, useCallback } from 'react'
import { connectSSE } from '../api'

type Listener = (event: unknown) => void

// global SSE connection — one instance shared across all components
let globalEs: EventSource | null = null
const listeners = new Set<Listener>()

function getSSE() {
  if (!globalEs || globalEs.readyState === EventSource.CLOSED) {
    globalEs = connectSSE((event) => {
      listeners.forEach(l => l(event))
    })
  }
  return globalEs
}

export function useSSE(onEvent?: Listener) {
  const [connected, setConnected] = useState(false)
  const listenerRef = useRef<Listener | null>(null)

  useEffect(() => {
    const es = getSSE()

    const checkState = () => setConnected(es.readyState === EventSource.OPEN)
    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    checkState()

    if (onEvent) {
      listenerRef.current = onEvent
      listeners.add(onEvent)
    }

    return () => {
      if (listenerRef.current) {
        listeners.delete(listenerRef.current)
      }
    }
  }, [])

  const emit = useCallback((event: unknown) => {
    listeners.forEach(l => l(event))
  }, [])

  return { connected, emit }
}