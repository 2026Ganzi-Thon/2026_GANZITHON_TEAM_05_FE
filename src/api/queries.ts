import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { todayString } from '@/utils/date'
import { isApiEnabled } from './config'
import { archiveApi, collectionApi, missionsApi, reflectionApi } from './endpoints'

function useApiScope() {
  const userId = useAuthStore((state) => state.userId)
  const completed = useAuthStore((state) => state.onboardingCompleted)
  return { userId, enabled: isApiEnabled && !!userId && completed === true }
}
export function useCollectionQuery() {
  const scope = useApiScope()
  return useQuery({
    queryKey: ['api', scope.userId, 'collection'],
    queryFn: ({ signal }) => collectionApi.flowers(signal),
    enabled: scope.enabled,
  })
}
export function useResumableQuery() {
  const scope = useApiScope()
  return useQuery({
    queryKey: ['api', scope.userId, 'resumable'],
    queryFn: ({ signal }) => missionsApi.resumable(signal),
    enabled: scope.enabled,
  })
}
export function useReflectionQueries(month: string) {
  const scope = useApiScope()
  const summary = useQuery({
    queryKey: ['api', scope.userId, 'summary', month],
    queryFn: ({ signal }) => reflectionApi.summary(month, signal),
    enabled: scope.enabled,
  })
  const calendar = useQuery({
    queryKey: ['api', scope.userId, 'calendar', month],
    queryFn: ({ signal }) => reflectionApi.calendar(month, signal),
    enabled: scope.enabled,
  })
  return { summary, calendar }
}
export function useProgressQuery() {
  const scope = useApiScope()
  const to = todayString()
  return useQuery({
    queryKey: ['api', scope.userId, 'progress', to],
    queryFn: ({ signal }) => reflectionApi.progress('1970-01-01', to, signal),
    enabled: scope.enabled,
  })
}
export function useArchiveQuery() {
  const scope = useApiScope()
  return useInfiniteQuery({
    queryKey: ['api', scope.userId, 'archive'],
    queryFn: ({ pageParam, signal }) => archiveApi.list(pageParam, 10, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: scope.enabled,
  })
}
export function useRecordQuery(missionId: string) {
  const scope = useApiScope()
  return useQuery({
    queryKey: ['api', scope.userId, 'record', missionId],
    queryFn: ({ signal }) => archiveApi.detail(missionId, signal),
    enabled: scope.enabled && !!missionId,
  })
}
