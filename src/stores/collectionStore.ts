import { create } from 'zustand'
import { FLOWERS, type FlowerId } from '@/constants/flowers'
import { createMockCollectionState } from '@/mocks/data'
import { isApiEnabled } from '@/api/config'
export { todayString } from '@/utils/date'

export const DAYS_PER_FLOWER = 3
export interface OwnedFlower {
  id: FlowerId
  acquiredAt: string
  name?: string
}
interface CollectionState {
  completedDates: string[]
  owned: OwnedFlower[]
  pendingRewards: FlowerId[]
  markDayCompleted: (date: string) => void
  syncRewards: (today: string) => void
  dismissReward: (id: FlowerId) => void
  reset: () => void
}
/** 도감 예시와 보상 동작을 확인하는 메모리 목업. 브라우저에 저장하지 않는다. */
const initialState = () =>
  isApiEnabled ? { completedDates: [], owned: [], pendingRewards: [] } : createMockCollectionState()
export const useCollectionStore = create<CollectionState>((set) => ({
  ...initialState(),
  markDayCompleted: (date) =>
    set((s) =>
      s.completedDates.includes(date) ? s : { completedDates: [...s.completedDates, date] },
    ),
  syncRewards: (today) =>
    set((s) => {
      const earned = Math.min(FLOWERS.length, Math.floor(s.completedDates.length / DAYS_PER_FLOWER))
      if (earned <= s.owned.length) return s
      const newIds = FLOWERS.slice(s.owned.length, earned).map((f) => f.id)
      return {
        owned: [...s.owned, ...newIds.map((id) => ({ id, acquiredAt: today }))],
        pendingRewards: [...s.pendingRewards, ...newIds],
      }
    }),
  dismissReward: (id) => set((s) => ({ pendingRewards: s.pendingRewards.filter((x) => x !== id) })),
  reset: () => set(initialState()),
}))
