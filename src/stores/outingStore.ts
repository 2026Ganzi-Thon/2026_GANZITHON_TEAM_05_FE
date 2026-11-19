import { create } from 'zustand'
import { emptyReview } from '@/features/outings/mockData'
import { createMockOutingState } from '@/mocks/data'
import type { MockState, ReviewDraft } from '@/features/outings/types'
import { isApiEnabled } from '@/api/config'
import { emptyConditions } from '@/features/outings/mockData'

const initialState = (): MockState =>
  isApiEnabled
    ? {
        conditions: structuredClone(emptyConditions),
        savedMissions: [],
        records: [],
        resting: false,
        restDates: [],
      }
    : createMockOutingState()

export interface OutingSession {
  runId: string
  startedAt: string
  missionId: string
  checked: number[]
  resumed: boolean
  placeId: string
  recommendationTurn: number
  problem: number
  candidateId: string
  review: ReviewDraft
  recordId: string | null
}
const initialSession: OutingSession = {
  runId: '',
  startedAt: '',
  missionId: 'store',
  checked: [],
  resumed: false,
  placeId: 'cu',
  recommendationTurn: 0,
  problem: 0,
  candidateId: 'walk',
  review: { ...emptyReview },
  recordId: null,
}
type Update<T> = T | ((previous: T) => T)
interface OutingStore {
  state: MockState
  session: OutingSession
  setMockState: (update: Update<MockState>) => void
  updateSession: <K extends keyof OutingSession>(key: K, update: Update<OutingSession[K]>) => void
  reset: () => void
}
/** 현재 페이지에서만 동작하는 메모리 목업. 새로고침하면 예시 데이터로 돌아간다. */
export const useOutingStore = create<OutingStore>((set) => ({
  state: initialState(),
  session: structuredClone(initialSession),
  setMockState: (update) =>
    set((store) => ({
      state: typeof update === 'function' ? update(store.state) : update,
    })),
  updateSession: (key, update) =>
    set((store) => ({
      session: {
        ...store.session,
        [key]: typeof update === 'function' ? update(store.session[key]) : update,
      },
    })),
  reset: () => set({ state: initialState(), session: structuredClone(initialSession) }),
}))
