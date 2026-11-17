import { PATHS } from '@/constants/paths'
import type { Screen } from './types'

export const OUTING_SCREEN_PATHS = {
  home: PATHS.HOME,
  resume: PATHS.RESUME,
  'conditions-1': PATHS.OUTING_MOOD,
  'conditions-2': PATHS.OUTING_ENERGY,
  'conditions-3': PATHS.OUTING_BARRIERS,
  'conditions-4': PATHS.OUTING_LIMITS,
  defaults: PATHS.OUTING_DEFAULTS,
  loading: PATHS.MISSION_LOADING,
  recommendations: PATHS.MISSIONS,
  'location-loading': PATHS.PLACE_LOADING,
  places: PATHS.MISSION_PLACES,
  detail: PATHS.MISSION_DETAIL,
  active: PATHS.MISSION_ACTIVE,
  summary: PATHS.MISSION_SUMMARY,
  problem: PATHS.MISSION_PROBLEM,
  alternatives: PATHS.MISSION_ALTERNATIVES,
  'review-mood': PATHS.REVIEW_MOOD,
  'review-note': PATHS.REVIEW_NOTE,
} satisfies Record<Screen, string>
