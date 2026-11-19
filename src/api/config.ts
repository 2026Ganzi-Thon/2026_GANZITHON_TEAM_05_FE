const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') ?? ''
export const isApiEnabled = configuredUrl !== ''
export const apiBaseUrl = configuredUrl.endsWith('/api/v1')
  ? configuredUrl
  : `${configuredUrl}/api/v1`
