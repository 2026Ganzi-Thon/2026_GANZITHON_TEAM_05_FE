import { create } from 'zustand'
import type { ApiPlace, MissionDetail, Recommendation } from '@/api/contracts'
import type { ReviewDraft } from '@/features/outings/types'
import type { Coordinates } from '@/lib/kakaoMaps'

interface ApiMissionState {
  recommendations: Recommendation[]
  alternatives: Recommendation[]
  excludedRecommendationIds: string[]
  selectedRecommendation: Recommendation | null
  mission: MissionDetail | null
  checkedStepIds: string[]
  places: ApiPlace[]
  selectedPlaceId: string | null
  position: Coordinates | null
  searchRadiusMeters: number | null
  selectionMode: 'new' | 'replace'
  problem: string
  review: ReviewDraft
  resumed: boolean
  summarySaved: boolean
  pendingMissionId: string | null
  locationConsent: boolean
  searchAttempt: number
  reviewFinished: boolean
  fallback: boolean
  alternativeTurn: number
  createdRecommendationId: string | null
  reset: () => void
}
const initial = () => ({
  recommendations: [],
  alternatives: [],
  excludedRecommendationIds: [],
  selectedRecommendation: null,
  mission: null,
  checkedStepIds: [],
  places: [],
  selectedPlaceId: null,
  position: null,
  searchRadiusMeters: null,
  selectionMode: 'new' as const,
  problem: '눈/비가 와요',
  review: { mood: null, note: '', retry: '', good: '' },
  resumed: false,
  summarySaved: false,
  pendingMissionId: null,
  locationConsent: false,
  searchAttempt: 0,
  reviewFinished: false,
  fallback: false,
  alternativeTurn: 0,
  createdRecommendationId: null,
})
export const useApiMissionStore = create<ApiMissionState>((set) => ({
  ...initial(),
  reset: () => set(initial()),
}))
