import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { emptyConditions, emptyReview, initialMockState } from '@/features/outings/mockData'
import type { MockState, ReviewDraft } from '@/features/outings/types'

export interface OutingSession {
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
  missionId: 'store',
  checked: [],
  resumed: false,
  placeId: 'dosan',
  recommendationTurn: 0,
  problem: 0,
  candidateId: 'walk',
  review: { ...emptyReview, mood: '0' },
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

/** 백엔드 연동 전 목업. 수행 중 새로고침해도 미션·장소·체크·후기를 유지한다. */
export const useOutingStore = create<OutingStore>()(
  persist(
    (set) => ({
      state: structuredClone(initialMockState),
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
      reset: () =>
        set({ state: structuredClone(initialMockState), session: structuredClone(initialSession) }),
    }),
    {
      name: 'letit-outings-mock',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        const previous = persistedState as Pick<OutingStore, 'state' | 'session'>
        const conditions = previous?.state?.conditions
        // 이전 빌드에서 자동 저장된 피그마 예시값만 비운다. 기록·수행 단계는 보존한다.
        const hasDemoConditions =
          conditions?.mood === '기분 전환이 필요해요' &&
          conditions.energy === 2 &&
          conditions.barriers.length === 2 &&
          conditions.barriers.includes('몸이 피곤하고 힘들어요') &&
          conditions.barriers.includes('사람 많은 곳이 부담스러워요') &&
          conditions.distance === '10분 이내' &&
          conditions.time === '1시간' &&
          conditions.budget === '5,000원 이하'
        if (version < 2 && hasDemoConditions) {
          return {
            ...previous,
            state: { ...previous.state, conditions: structuredClone(emptyConditions) },
          }
        }
        return previous
      },
    },
  ),
)
