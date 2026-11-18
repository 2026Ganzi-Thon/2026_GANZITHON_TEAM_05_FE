import { create } from 'zustand'
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
/** 화면 이동 중 선택을 유지하는 메모리 초안. 새로고침하면 초기화한다. */
export const useOnboardingDraftStore = create<OnboardingDraftState>((set) => ({
  ...structuredClone(initialDraft),
  setMood: (mood) => set({ mood }),
  setEnergy: (energy) => set({ energy }),
  setBarriers: (barriers) => set({ barriers }),
  setDistance: (distance) => set({ distance }),
  setDuration: (duration) => set({ duration }),
  setBudget: (budget) => set({ budget }),
  reset: () => set(structuredClone(initialDraft)),
}))
export function toConditions(draft: OnboardingDraftState): OutingConditions {
  return {
    mood: draft.mood,
    energy: draft.energy ?? DEFAULT_CONDITIONS.energy,
    barriers: [...draft.barriers],
    distance: draft.distance,
    duration: draft.duration,
    budget: draft.budget,
  }
}
