import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OutingConditions } from '@/types/condition'

/**
 * 온보딩 기본값 설문 결과.
 * - defaults가 null이면 아직 설문을 마치지 않은 사용자
 * - 외출 조건 입력에서 건너뛴 항목은 이 값을 쓴다
 */
interface UserDefaultsState {
  defaults: OutingConditions | null
  setDefaults: (defaults: OutingConditions) => void
  reset: () => void
}

export const useUserDefaultsStore = create<UserDefaultsState>()(
  persist(
    (set) => ({
      defaults: null,
      setDefaults: (defaults) => set({ defaults }),
      reset: () => set({ defaults: null }),
    }),
    { name: 'letit-user-defaults' },
  ),
)
