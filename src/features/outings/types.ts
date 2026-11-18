import type { EnergyLevel } from '@/types/condition'
export type Energy = EnergyLevel
export type Screen =
  | 'home'
  | 'resume'
  | 'conditions-1'
  | 'conditions-2'
  | 'conditions-3'
  | 'conditions-4'
  | 'defaults'
  | 'loading'
  | 'recommendations'
  | 'location-loading'
  | 'places'
  | 'detail'
  | 'active'
  | 'summary'
  | 'problem'
  | 'alternatives'
  | 'review-mood'
  | 'review-note'
export type ModalKind = 'rest' | 'exit' | 'stop' | 'save' | 'location' | 'change'
export interface Conditions {
  mood: string | null
  energy: Energy | null
  barriers: string[]
  distance: string | null
  time: string | null
  budget: string | null
}
export interface Mission {
  id: string
  title: string
  description: string
  level: Energy
  steps: string[]
  distance: string
  time: string
  budget: string
  placeType?: 'store' | 'park' | 'cafe'
}
export interface SavedMission {
  missionId: string
  checked: number[]
  date: string
  placeId: string
}
export interface ReviewDraft {
  mood: string | null
  note: string
  retry: string
  good: string
}
export interface OutingRecord extends ReviewDraft {
  id: string
  missionId: string
  title: string
  checked: number[]
  completed: boolean
  createdAt: string
}
export interface MockState {
  conditions: Conditions
  savedMissions: SavedMission[]
  records: OutingRecord[]
  resting: boolean
}
export interface Place {
  id: string
  name: string
  distance: string
  walk: string
  address: string
  coordinates?: { lat: number; lng: number }
}
