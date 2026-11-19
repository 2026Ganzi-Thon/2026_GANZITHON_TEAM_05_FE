let accessToken: string | null = null
const expiryListeners = new Set<() => void>()
export const getAccessToken = () => accessToken
export const setAccessToken = (value: string | null) => {
  accessToken = value
}
export function onSessionExpired(listener: () => void) {
  expiryListeners.add(listener)
  return () => {
    expiryListeners.delete(listener)
  }
}
export function expireSession() {
  accessToken = null
  for (const listener of expiryListeners) listener()
}
