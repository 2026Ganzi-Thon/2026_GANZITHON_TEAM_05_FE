import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_CONDITIONS } from '@/constants/options'
import type {
  Barrier,
  Budget,
  Distance,
  Duration,
  EnergyLevel,
  Mood,
  OutingConditions,
} from '@/types/condition'

/**
 * 온보딩 기본값 설문(4장)에서 고르는 중인 값.
 * 새로고침해도 이어서 할 수 있게 sessionStorage에 둔다.
 */
interface OnboardingDraftState {
  mood: Mood | null
  energy: EnergyLevel | null
  barriers: Barrier[]
  distance: Distance
  duration: Duration
  budget: Budget
  setMood: (mood: Mood | null) => void
  setEnergy: (energy: EnergyLevel | null) => void
  setBarriers: (barriers: Barrier[]) => void
  setDistance: (distance: Distance) => void
  setDuration: (duration: Duration) => void
  setBudget: (budget: Budget) => void
  reset: () => void
}

const initialDraft = {
  mood: null,
  energy: null,
  barriers: [],
  distance: DEFAULT_CONDITIONS.distance,
  duration: DEFAULT_CONDITIONS.duration,
  budget: DEFAULT_CONDITIONS.budget,
}

export const useOnboardingDraftStore = create<OnboardingDraftState>()(
  persist(
    (set) => ({
      ...initialDraft,
      setMood: (mood) => set({ mood }),
      setEnergy: (energy) => set({ energy }),
      setBarriers: (barriers) => set({ barriers }),
      setDistance: (distance) => set({ distance }),
      setDuration: (duration) => set({ duration }),
      setBudget: (budget) => set({ budget }),
      reset: () => set(initialDraft),
    }),
    { name: 'letit-onboarding-draft', storage: createJSONStorage(() => sessionStorage) },
  ),
)

/** 고르지 않은 항목은 기본값으로 채운 최종 조건 */
export function toConditions(draft: OnboardingDraftState): OutingConditions {
  return {
    mood: draft.mood,
    energy: draft.energy ?? DEFAULT_CONDITIONS.energy,
    barriers: draft.barriers,
    distance: draft.distance,
    duration: draft.duration,
    budget: draft.budget,
  }
}
