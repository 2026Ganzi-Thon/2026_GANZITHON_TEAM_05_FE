import { create } from 'zustand'
import type { AuthResponse } from '@/api/contracts'
import { ApiError } from '@/api/client'
import { onSessionExpired, setAccessToken } from '@/api/session'
import { queryClient } from '@/lib/queryClient'
import { useOutingStore } from './outingStore'
import { useCollectionStore } from './collectionStore'
import { useUserDefaultsStore } from './userDefaultsStore'
import { useApiMissionStore } from './apiMissionStore'
import { useOnboardingDraftStore } from './onboardingDraftStore'

interface AuthState {
  userId: string | null
  username: string | null
  onboardingCompleted: boolean | null
  setSession: (response: AuthResponse, onboardingCompleted?: boolean | null) => void
  completeOnboarding: (completed: boolean) => void
  signup: (id: string, password: string) => boolean
  login: (id: string, password: string) => boolean
  logout: () => void
}
/** API 토큰과 화면 상태는 메모리에만 보관한다. */
export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  username: null,
  onboardingCompleted: null,
  setSession: (response, onboardingCompleted = null) => {
    if (
      !response.accessToken ||
      response.tokenType?.toLowerCase() !== 'bearer' ||
      !response.user?.userId
    )
      throw new ApiError(
        '로그인 응답을 확인하지 못했어요. 다시 시도해 주세요.',
        0,
        'INVALID_RESPONSE',
      )
    queryClient.clear()
    useOnboardingDraftStore.getState().reset()
    useOutingStore.getState().reset()
    useCollectionStore.getState().reset()
    useApiMissionStore.getState().reset()
    useUserDefaultsStore.getState().reset()
    setAccessToken(response.accessToken)
    set({ userId: response.user.userId, username: response.user.username, onboardingCompleted })
  },
  completeOnboarding: (onboardingCompleted) => set({ onboardingCompleted }),
  signup: (id, password) => {
    if (!id.trim() || !password) return false
    set({ userId: id.trim() })
    return true
  },
  login: (id, password) => {
    if (!id.trim() || !password) return false
    set({ userId: id.trim() })
    return true
  },
  logout: () => {
    setAccessToken(null)
    useOnboardingDraftStore.getState().reset()
    queryClient.clear()
    useOutingStore.getState().reset()
    useCollectionStore.getState().reset()
    useApiMissionStore.getState().reset()
    useUserDefaultsStore.getState().reset()
    set({ userId: null, username: null, onboardingCompleted: null })
  },
}))
const unsubscribe = onSessionExpired(() => useAuthStore.getState().logout())
if (import.meta.hot) import.meta.hot.dispose(unsubscribe)
