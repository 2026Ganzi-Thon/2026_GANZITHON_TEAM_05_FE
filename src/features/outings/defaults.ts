import {
  BARRIER_OPTIONS,
  BUDGET_OPTIONS,
  DEFAULT_CONDITIONS,
  DISTANCE_OPTIONS,
  DURATION_OPTIONS,
  MOOD_OPTIONS,
} from '@/constants/options'
import type { OutingConditions } from '@/types/condition'
import type { Conditions } from './types'

/** 온보딩 담당자가 저장한 공통 기본값을 외출 조건 화면에서도 재사용한다. */
export function resolveOutingDefaults(value: OutingConditions | null): Conditions {
  const defaults = value ?? DEFAULT_CONDITIONS
  return {
    mood: MOOD_OPTIONS.find((option) => option.value === defaults.mood)?.label ?? null,
    energy: defaults.energy,
    barriers: BARRIER_OPTIONS.filter((option) => defaults.barriers.includes(option.value)).map(
      (option) => option.label,
    ),
    distance:
      DISTANCE_OPTIONS.find((option) => option.value === defaults.distance)?.label ?? '10분 이내',
    time: DURATION_OPTIONS.find((option) => option.value === defaults.duration)?.label ?? '30분',
    budget:
      BUDGET_OPTIONS.find((option) => option.value === defaults.budget)?.label ?? '5,000원 이하',
  }
}
