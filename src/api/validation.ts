import { ApiError } from './client'
import type {
  ApiStep,
  MissionDetail,
  RecommendationsResponse,
  MissionProgress,
  StepProgress,
} from './contracts'
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function invalid(): never {
  throw new ApiError('미션 정보를 확인하지 못했어요. 다시 불러와 주세요.', 0, 'INVALID_MISSION')
}
export function validateSteps(steps: ApiStep[]) {
  if (
    !Array.isArray(steps) ||
    steps.length !== 5 ||
    steps.some((step) => !step || typeof step !== 'object') ||
    new Set(steps.map((step) => step.stepId)).size !== 5 ||
    new Set(steps.map((step) => step.order)).size !== 5
  )
    invalid()
  for (const step of steps)
    if (
      !uuid.test(step.stepId) ||
      !Number.isInteger(step.order) ||
      step.order < 1 ||
      step.order > 5 ||
      typeof step.text !== 'string'
    )
      invalid()
}
export function validateRecommendations<T extends RecommendationsResponse>(response: T) {
  if (!Array.isArray(response.recommendations) || response.recommendations.length !== 2) invalid()
  for (const value of response.recommendations) {
    if (
      !uuid.test(value.recommendationId) ||
      !Number.isFinite(value.estimatedDurationMinutes) ||
      !Number.isFinite(value.estimatedCost) ||
      !['place', 'non_place'].includes(value.missionType) ||
      !Number.isInteger(value.energyLevel) ||
      value.energyLevel < 0 ||
      value.energyLevel > 4 ||
      typeof value.title !== 'string' ||
      typeof value.description !== 'string'
    )
      invalid()
    validateSteps(value.steps)
  }
  return { ...response, fallback: response.fallbackUsed ?? response.fallback ?? false }
}
export function validateMission(value: MissionDetail) {
  if (
    !uuid.test(value.missionId) ||
    !Number.isFinite(value.estimatedCost) ||
    !Number.isFinite(value.estimatedDurationMinutes) ||
    !['in_progress', 'paused', 'completed', 'abandoned', 'replaced'].includes(value.status) ||
    !(value.review === null || typeof value.review === 'object')
  )
    invalid()
  validateSteps(value.steps)
  if (value.steps.some((step) => typeof step.completed !== 'boolean')) invalid()
  return value
}
export function checkedResponse<T>(value: T, valid: boolean): T {
  if (!valid)
    throw new ApiError('서버 응답을 확인하지 못했어요. 다시 불러와 주세요.', 0, 'INVALID_RESPONSE')
  return value
}
export function validateMissionId<T extends { missionId: string }>(value: T): T {
  return checkedResponse(value, uuid.test(value.missionId))
}
export function validateProgress(
  value: StepProgress & Partial<Pick<MissionProgress, 'completedCount' | 'remainingCount'>>,
): MissionProgress {
  checkedResponse(
    value,
    uuid.test(value.missionId) &&
      Array.isArray(value.completedStepIds) &&
      value.completedStepIds.every((id) => uuid.test(id)) &&
      new Set(value.completedStepIds).size === value.completedStepIds.length &&
      value.completedStepIds.length <= 5,
  )
  const completedCount = value.completedStepIds.length
  checkedResponse(
    value,
    (value.completedCount === undefined || value.completedCount === completedCount) &&
      (value.remainingCount === undefined || value.remainingCount === 5 - completedCount),
  )
  return { ...value, completedCount, remainingCount: 5 - completedCount }
}
