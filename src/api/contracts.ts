export type ApiMood = 'lethargic' | 'depressed' | 'anxious' | 'refresh' | 'unsure'
export type ApiBarrier = 'tired' | 'preparation' | 'crowded' | 'alone' | 'cost' | 'no_reason'
export type ApiEnergy = 0 | 1 | 2 | 3 | 4
export interface ApiConditions {
  mood: ApiMood | null
  energyLevel: ApiEnergy
  barriers: ApiBarrier[]
  distanceLimit: '5min' | '10min' | '20min' | 'any'
  timeLimit: '10min' | '30min' | '60min' | 'any'
  budgetLimit: 0 | 5000 | 10000 | null
}
export interface ApiDefaults extends ApiConditions {
  onboardingCompleted: boolean
}
export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: { userId: string; username: string }
}
export interface ApiStep {
  stepId: string
  order: number
  text: string
  completed?: boolean
}
export type MissionStatus = 'in_progress' | 'paused' | 'completed' | 'abandoned' | 'replaced'
export interface Recommendation {
  recommendationId: string
  title: string
  description: string
  energyLevel: ApiEnergy
  missionType: 'place' | 'non_place'
  placeCategory: string | null
  steps: ApiStep[]
  estimatedDurationMinutes: number
  estimatedCost: number
}
export interface ApiPlace {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
  distanceMeters: number
  walkingMinutes: number | null
}
export interface ApiReview {
  moodAfter: string | null
  oneLine: string | null
  retryActivity: string | null
  goodPoint: string | null
}
export interface MissionDetail extends Omit<Recommendation, 'recommendationId'> {
  missionId: string
  status: MissionStatus
  startedAt: string
  completedAt: string | null
  resumableUntil?: string | null
  place: ApiPlace | null
  review: ApiReview | null
}
export interface MissionProgress {
  missionId: string
  status: MissionStatus
  completedStepIds: string[]
  completedCount: number
  remainingCount: number
  resumableUntil?: string | null
}
export interface ResumableMission {
  missionId: string
  title: string
  energyLevel: ApiEnergy
  startedAt: string
  completedCount: number
  remainingCount: number
  resumableUntil?: string | null
}
export interface MissionSummary {
  missionId?: string
  title: string
  startedAt?: string
  date?: string
}
export interface ReflectionSummary {
  month: string
  counts: { completed: number; partial: number; notCompleted: number }
  firstMission: MissionSummary | null
  latestMission: MissionSummary | null
}
export type ApiDayStatus = 'completed' | 'partial' | 'rest' | 'undecided'
export interface CalendarResponse {
  month: string
  days: { date: string; status: ApiDayStatus }[]
}
export interface ArchiveItem {
  missionId: string
  title: string
  energyLevel: ApiEnergy
  startedAt: string
  endedAt: string
  completedCount: number
  remainingCount: number
  status: MissionStatus
}
export interface ArchiveResponse {
  items: ArchiveItem[]
  page: number
  pageSize: number
  total: number
  hasNext: boolean
}
export interface ReflectionProgress {
  firstMission: MissionSummary | null
  latestMission: MissionSummary | null
  completedByEnergy: { energyLevel: ApiEnergy; count?: number; completedCount?: number }[]
  distanceChanges?: { date: string; distanceMeters: number }[]
  distanceHistory?: { date: string; distanceMeters: number }[]
}
export interface ApiFlower {
  flowerNumber: number
  name: string
  description: string
  owned: boolean
  acquiredAt: string | null
}
export interface CollectionResponse {
  cumulativeCompletedDays: number
  flowers: ApiFlower[]
  pendingClaimCount: number
}
export interface ClaimResponse {
  claimedFlowers: ApiFlower[]
  pendingClaimCount: number
}
