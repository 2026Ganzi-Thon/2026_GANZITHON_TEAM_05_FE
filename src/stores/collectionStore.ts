import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FLOWERS, type FlowerId } from '@/constants/flowers'

/** 꽃 1개를 얻는 데 필요한 "모두 완료" 일수 */
export const DAYS_PER_FLOWER = 3

export interface OwnedFlower {
  id: FlowerId
  /** 얻은 날 (YYYY-MM-DD) */
  acquiredAt: string
}

/**
 * 04 도감 (API 연결 전 localStorage 목업)
 *
 * 규칙 (기획서 3-10)
 * - "모두 완료"한 날이 3일 쌓일 때마다 꽃 1개. 연속일 필요는 없다.
 * - 쉰 날 · 일부 완료한 날은 세지 않는다.
 * - 꽃은 1번부터 차례대로 얻고, 한 번 얻은 꽃은 사라지지 않는다 (기록 삭제와 무관).
 * - 3일째를 채운 뒤 "다음 앱 실행" 때 준다 → 앱 시작 시 syncRewards() 호출.
 */
interface CollectionState {
  /** "모두 완료"한 날짜 목록 (YYYY-MM-DD, 중복 없음) */
  completedDates: string[]
  owned: OwnedFlower[]
  /** 얻었지만 아직 획득 팝업을 보여주지 않은 꽃 */
  pendingRewards: FlowerId[]

  /** 그날을 "모두 완료"한 날로 기록한다 (미션 수행 쪽에서 호출) */
  markDayCompleted: (date: string) => void
  /** 쌓인 일수만큼 꽃을 지급한다. 앱을 시작할 때 한 번 호출 */
  syncRewards: (today: string) => void
  /** 획득 팝업을 보여준 꽃을 대기 목록에서 뺀다 */
  dismissReward: (id: FlowerId) => void
  reset: () => void
}

const initialState = {
  completedDates: [] as string[],
  owned: [] as OwnedFlower[],
  pendingRewards: [] as FlowerId[],
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      ...initialState,

      markDayCompleted: (date) =>
        set((s) =>
          s.completedDates.includes(date) ? s : { completedDates: [...s.completedDates, date] },
        ),

      syncRewards: (today) =>
        set((s) => {
          const earned = Math.min(
            FLOWERS.length,
            Math.floor(s.completedDates.length / DAYS_PER_FLOWER),
          )
          if (earned <= s.owned.length) return s

          const newIds = FLOWERS.slice(s.owned.length, earned).map((f) => f.id)
          return {
            owned: [...s.owned, ...newIds.map((id) => ({ id, acquiredAt: today }))],
            pendingRewards: [...s.pendingRewards, ...newIds],
          }
        }),

      dismissReward: (id) =>
        set((s) => ({ pendingRewards: s.pendingRewards.filter((x) => x !== id) })),

      reset: () => set(initialState),
    }),
    { name: 'letit-collection' },
  ),
)

/** 오늘 날짜 (YYYY-MM-DD, 기기 시간 기준) */
export function todayString(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
