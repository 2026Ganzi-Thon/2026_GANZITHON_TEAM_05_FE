import { create } from 'zustand'

interface AuthState {
  userId: string | null
  signup: (id: string, password: string) => boolean
  login: (id: string, password: string) => boolean
  logout: () => void
}
/** 인증 API 연결 전 화면 이동용 목업. 계정 목록과 비밀번호를 저장하지 않는다. */
export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
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
  logout: () => set({ userId: null }),
}))
