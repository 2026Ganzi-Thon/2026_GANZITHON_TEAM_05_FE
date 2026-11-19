import { ApiError } from './client'
export function apiErrorMessage(error: unknown) {
  if (error instanceof ApiError)
    return error.message === 'Not Found'
      ? '요청한 정보를 아직 불러올 수 없어요. 잠시 후 다시 시도해 주세요.'
      : error.message
  return error instanceof Error ? error.message : '정보를 불러오지 못했어요. 다시 시도해 주세요.'
}
