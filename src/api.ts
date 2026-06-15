import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({ baseURL: BASE })

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type JobPriority = 1 | 2 | 3
export type JobInterval = 'every_1_minute' | 'every_5_minutes' | 'every_1_hour'

export interface Job {
  id: string
  type: string
  payload: Record<string, unknown>
  status: JobStatus
  priority: JobPriority
  retryCount: number
  maxRetries: number
  scheduledAt: string | null
  interval: JobInterval | null
  lastRunAt: string | null
  nextRunAt: string | null
  startedAt: string | null
  completedAt: string | null
  errorDetails: Record<string, unknown> | null
  dependencyIds: string[]
  isDlq: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedJobs {
  data: Job[]
  total: number
  page: number
  totalPages: number
}

export interface CreateJobPayload {
  type: string
  payload: Record<string, unknown>
  priority?: JobPriority
  scheduledAt?: string
  interval?: JobInterval
  dependencyIds?: string[]
}

export interface JobStats {
  pending: number
  processing: number
  completed: number
  failed: number
  cancelled: number
  dlq: number
}

export const JobsApi = {
  list: (page = 1, limit = 50) =>
    api.get<PaginatedJobs>(`/jobs?page=${page}&limit=${limit}`).then(r => r.data),
  stats: () => api.get<JobStats>('/jobs/stats').then(r => r.data),
  create: (payload: CreateJobPayload) => api.post<Job>('/jobs', payload).then(r => r.data),
  cancel: (id: string) => api.patch<Job>(`/jobs/${id}/cancel`).then(r => r.data),
  dlq: () => api.get<Job[]>('/jobs/dlq').then(r => r.data),
  retryDlq: (id: string) => api.post<Job>(`/jobs/dlq/${id}/retry`).then(r => r.data),
}

export function connectSSE(onEvent: (event: unknown) => void): EventSource {
  const es = new EventSource(`${BASE}/events`)
  es.onmessage = (e) => onEvent(JSON.parse(e.data))
  return es
}