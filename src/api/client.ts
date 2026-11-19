import { apiBaseUrl } from './config'
import { expireSession, getAccessToken } from './session'

export class ApiError extends Error {
  status: number
  code: string
  constructor(message: string, status = 0, code = 'NETWORK_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
  authenticated?: boolean
  timeoutMs?: number
}
function errorDetail(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value))
    return (
      value
        .map((item) => (typeof item?.msg === 'string' ? item.msg : ''))
        .filter(Boolean)
        .join('\n') || null
    )
  return null
}
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const authenticated = options.authenticated !== false
  const token = getAccessToken()
  if (authenticated && !token) throw new ApiError('로그인이 필요해요.', 401, 'UNAUTHORIZED')
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(options.query ?? {}))
    if (value !== undefined) query.set(key, String(value))
  const controller = new AbortController()
  const abort = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) abort()
  else options.signal?.addEventListener('abort', abort, { once: true })
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, options.timeoutMs ?? 30000)
  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (authenticated) headers.Authorization = `Bearer ${token}`
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
    const response = await fetch(`${apiBaseUrl}${path}${query.size ? `?${query}` : ''}`, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'omit',
      signal: controller.signal,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
    const text = await response.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        if (response.ok)
          throw new ApiError(
            '서버 응답을 확인할 수 없어요. 다시 시도해 주세요.',
            response.status,
            'INVALID_RESPONSE',
          )
      }
    }
    if (!response.ok) {
      if (response.status === 401 && authenticated && getAccessToken() === token) expireSession()
      const error =
        data && typeof data === 'object' ? (data as { detail?: unknown; code?: unknown }) : null
      const message =
        errorDetail(error?.detail) ??
        (response.status === 401
          ? '로그인이 만료됐어요. 다시 로그인해 주세요.'
          : '요청을 완료하지 못했어요. 다시 시도해 주세요.')
      throw new ApiError(
        message,
        response.status,
        typeof error?.code === 'string' ? error.code : 'HTTP_ERROR',
      )
    }
    if (data === null || typeof data !== 'object')
      throw new ApiError(
        '서버 응답을 확인할 수 없어요. 다시 시도해 주세요.',
        response.status,
        'INVALID_RESPONSE',
      )
    return data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (options.signal?.aborted) throw error
    throw new ApiError(
      timedOut
        ? '응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.'
        : '서버에 연결할 수 없어요. 연결 상태를 확인해 주세요.',
      0,
      timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
    )
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', abort)
  }
}
