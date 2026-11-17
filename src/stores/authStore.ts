import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 로그인 상태 (API 연결 전 localStorage mock).
 * API가 붙으면 signup / login 내부만 요청으로 바꾸면 된다.
 */
interface AuthState {
  userId: string | null
  /** mock 계정 목록 { 아이디: 비밀번호 } */
  accounts: Record<string, string>
  /** 이미 있는 아이디면 false */
  signup: (id: string, password: string) => boolean
  /** 아이디 · 비밀번호가 맞지 않으면 false */
  login: (id: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      accounts: {},
      signup: (id, password) => {
        if (get().accounts[id]) return false
        set((s) => ({ accounts: { ...s.accounts, [id]: password }, userId: id }))
        return true
      },
      login: (id, password) => {
        if (get().accounts[id] !== password) return false
        set({ userId: id })
        return true
      },
      logout: () => set({ userId: null }),
    }),
    { name: 'letit-auth' },
  ),
)
