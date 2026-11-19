import { create } from 'zustand'
import { MOCK_USER_DEFAULTS } from '@/mocks/data'
import type { OutingConditions } from '@/types/condition'
import { isApiEnabled } from '@/api/config'

interface UserDefaultsState {
  defaults: OutingConditions | null
  setDefaults: (defaults: OutingConditions) => void
  reset: () => void
}
/** 첫 화면 확인용 기본값과 이번 실행에서 선택한 설문 결과만 메모리에 둔다. */
export const useUserDefaultsStore = create<UserDefaultsState>((set) => ({
  defaults: isApiEnabled ? null : structuredClone(MOCK_USER_DEFAULTS),
  setDefaults: (defaults) => set({ defaults: structuredClone(defaults) }),
  reset: () => set({ defaults: null }),
}))
