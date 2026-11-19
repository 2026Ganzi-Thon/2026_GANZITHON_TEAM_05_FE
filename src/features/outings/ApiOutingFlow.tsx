import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useApiMissionStore } from '@/stores/apiMissionStore'
import { useOutingStore } from '@/stores/outingStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import { useAuthStore } from '@/stores/authStore'
import { useCollectionStore } from '@/stores/collectionStore'
import { missionsApi, placesApi, reflectionApi } from '@/api/endpoints'
import type { MissionDetail, Recommendation, ResumableMission } from '@/api/contracts'
import { sortedSteps, toApiConditions, toMission, toPlace, searchRadius } from '@/api/presentation'
import { calendarStatuses, progressStatistics, resumableView } from '@/api/dashboard'
import {
  useCollectionQuery,
  useProgressQuery,
  useReflectionQueries,
  useResumableQuery,
} from '@/api/queries'
import { invalidateApiData, queryClient } from '@/lib/queryClient'
import { requestCurrentPosition } from '@/lib/kakaoMaps'
import { todayString } from '@/utils/date'
import { PATHS } from '@/constants/paths'
import BottomNav from '@/components/layout/BottomNav'
import ApiFeedback from '@/components/ui/ApiFeedback'
import { apiErrorMessage } from '@/api/errors'
import {
  Button,
  Card,
  Choices,
  Footer,
  Heading,
  InfoRows,
  Metrics,
  MissionChecks,
  Modal,
  NumberedSteps,
  Page,
  PlaceInfo,
  ReviewInput,
} from './components'
import {
  emptyConditions,
  emptyReview,
  missionTitles,
  problemOptions,
  reviewMoodOptions,
} from './mockData'
import { OUTING_SCREEN_PATHS } from './navigation'
import { HomeScreen } from './HomeScreen'
import OutingMap from './OutingMap'
import { shortDate } from './history'
import type { Screen } from './types'
import type { FlowerId } from '@/constants/flowers'

const nodes: Partial<Record<Screen, string>> = {
  resume: '72:7849',
  loading: '72:8925',
  recommendations: '72:8878',
  'location-loading': '72:8958',
  places: '72:9113',
  detail: '72:9039',
  active: '72:9291',
  summary: '72:9397',
  problem: '72:9559',
  alternatives: '72:9607',
  'review-mood': '72:9723',
  'review-note': '72:9772',
}

function ApiHome({
  start,
  rest,
  stop,
}: {
  start: () => void
  rest: () => void
  stop: (value: ResumableMission) => void
}) {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => todayString().slice(0, 7))
  const { summary, calendar } = useReflectionQueries(month)
  const progress = useProgressQuery()
  const resumable = useResumableQuery()
  const collection = useCollectionQuery()
  const conditions = useOutingStore((store) => store.state.conditions)
  useEffect(() => {
    if (!collection.data) return
    useCollectionStore.setState({
      owned: collection.data.flowers
        .filter((f) => f.owned && f.flowerNumber >= 1 && f.flowerNumber <= 18)
        .sort((a, b) => a.flowerNumber - b.flowerNumber)
        .map((f) => ({
          id: f.flowerNumber as FlowerId,
          acquiredAt: f.acquiredAt ?? '',
          name: f.name,
        })),
    })
  }, [collection.data])
  const queries = [summary, calendar, progress, resumable, collection]
  const error = queries.find((query) => query.error)?.error
  if (error || queries.some((query) => query.isPending))
    return (
      <div className="lt-screen lt-api-home-state">
        <Heading title="오늘의 기록을 불러오고 있어요" />
        <ApiFeedback
          loading={!error}
          error={error}
          onRetry={() => {
            for (const query of queries) void query.refetch()
          }}
        />
        <BottomNav />
      </div>
    )
  const statuses = calendarStatuses(calendar.data)
  return (
    <HomeScreen
      state={{
        conditions,
        records: [],
        savedMissions: resumable.data!.items.map(resumableView),
        restDates: Object.keys(statuses).filter((date) => statuses[date] === 'rest'),
        resting: false,
      }}
      onStart={start}
      onRest={rest}
      onResume={() => navigate(PATHS.RESUME)}
      onStop={(saved) => {
        const original = resumable.data!.items.find((item) => item.missionId === saved.id)
        if (original) stop(original)
      }}
      onNavigateExternal={(destination) =>
        navigate(destination === 'collection' ? PATHS.COLLECTION : PATHS.REFLECTION)
      }
      dashboard={{
        month,
        statuses,
        completed: summary.data!.counts.completed,
        statistics: progressStatistics(progress.data),
        onMonthChange: setMonth,
      }}
    />
  )
}

export default function ApiOutingFlow({ screen: route }: { screen: Screen }) {
  const navigate = useNavigate()
  const api = useApiMissionStore()
  const userId = useAuthStore((store) => store.userId)
  const conditions = useOutingStore((store) => store.state.conditions)
  const defaults = useUserDefaultsStore((store) => store.defaults)
  const resumable = useResumableQuery()
  const [modal, setModal] = useState<'rest' | 'location' | 'save' | 'stop' | 'change' | null>(null)
  const [stopTarget, setStopTarget] = useState<ResumableMission | null>(null)
  const [candidate, setCandidate] = useState<Recommendation | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [toast, setToast] = useState('')
  const [retry, setRetry] = useState(0)
  const [stepsPending, setStepsPending] = useState(0)
  const operation = useRef(false)
  const stepVersion = useRef(0)
  const [today] = useState(() => todayString())
  const go = useCallback(
    (next: Screen) => {
      setModal(null)
      setError(null)
      navigate(OUTING_SCREEN_PATHS[next])
    },
    [navigate],
  )
  const mission = api.mission
  const view = useMemo(() => (mission ? toMission(mission) : null), [mission])
  const missionSteps = useMemo(() => (mission ? sortedSteps(mission.steps) : []), [mission])
  const checked = missionSteps.flatMap((step, index) =>
    api.checkedStepIds.includes(step.stepId) ? [index] : [],
  )
  const allDone =
    missionSteps.length === 5 &&
    missionSteps.every((step) => api.checkedStepIds.includes(step.stepId))
  const places = useMemo(() => api.places.map(toPlace), [api.places])
  const selected =
    api.places.find((place) => place.placeId === api.selectedPlaceId) ?? api.places[0]
  const activePlace = useMemo(() => (mission?.place ? toPlace(mission.place) : null), [mission])
  const pageProps = { nodeId: nodes[route] ?? '72:8925', onBack: () => back() }

  function applyDetail(detail: MissionDetail) {
    useApiMissionStore.setState({
      mission: detail,
      pendingMissionId: null,
      checkedStepIds: sortedSteps(detail.steps)
        .filter((step) => step.completed)
        .map((step) => step.stepId),
      summarySaved: detail.status === 'paused' || detail.status === 'completed',
      reviewFinished: detail.review !== null,
      review: {
        mood: null,
        note: detail.review?.oneLine ?? '',
        retry: detail.review?.retryActivity ?? '',
        good: detail.review?.goodPoint ?? '',
      },
    })
  }
  async function run(action: () => Promise<void>) {
    if (operation.current) return
    operation.current = true
    setPending(true)
    setError(null)
    try {
      await action()
    } catch (error) {
      setError(error)
    } finally {
      operation.current = false
      setPending(false)
    }
  }
  function start() {
    const state = useOutingStore.getState().state
    useOutingStore.getState().setMockState({
      ...state,
      conditions: { ...(state.lastConditions ?? emptyConditions), mood: null, barriers: [] },
    })
    api.reset()
    go('conditions-1')
  }
  function back() {
    if (route === 'active') {
      setModal('save')
      return
    }
    if (route === 'summary') {
      if (mission?.status === 'completed') {
        reviewNext()
        return
      }
      void run(async () => {
        if (mission?.status === 'paused') {
          await missionsApi.resume(mission.missionId)
          applyDetail(await missionsApi.detail(mission.missionId))
        }
        go('active')
      })
      return
    }
    if (['problem', 'alternatives'].includes(route)) {
      go('active')
      return
    }
    if (route === 'detail') {
      go('places')
      return
    }
    if (route === 'places' || route === 'location-loading') {
      go(api.selectionMode === 'replace' ? 'active' : 'recommendations')
      return
    }
    if (route === 'review-note') {
      go('review-mood')
      return
    }
    if (route === 'review-mood') {
      go('summary')
      return
    }
    go('home')
  }
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2500)
    return () => window.clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    if (!['loading', 'location-loading', 'alternatives'].includes(route)) return
    let disposed = false
    const state = useApiMissionStore.getState()
    const selectedConditions = toApiConditions(
      useOutingStore.getState().state.conditions,
      defaults ?? undefined,
    )
    const request = async () => {
      if (route === 'loading') {
        const response = await queryClient.fetchQuery({
          queryKey: [
            'api',
            userId,
            'recommendations',
            selectedConditions,
            state.excludedRecommendationIds,
            retry,
          ],
          queryFn: () =>
            missionsApi.recommendations(selectedConditions, state.excludedRecommendationIds),
          staleTime: Infinity,
          retry: false,
        })
        if (disposed) return
        const form = useOutingStore.getState().state.conditions
        useOutingStore.getState().setMockState((previous) => ({
          ...previous,
          lastConditions: { ...form, mood: null, barriers: [] },
        }))
        useApiMissionStore.setState({
          recommendations: response.recommendations,
          excludedRecommendationIds: [
            ...new Set([
              ...state.excludedRecommendationIds,
              ...response.recommendations.map((item) => item.recommendationId),
            ]),
          ],
          fallback: response.fallback ?? false,
        })
        go('recommendations')
      } else if (route === 'location-loading') {
        if (!state.locationConsent || !state.selectedRecommendation?.placeCategory)
          throw new Error('먼저 장소 미션을 선택하고 위치 사용에 동의해 주세요.')
        const response = await queryClient.fetchQuery({
          queryKey: [
            'api',
            userId,
            'places',
            state.selectedRecommendation.recommendationId,
            state.searchAttempt,
            retry,
          ],
          queryFn: async () => {
            const position = state.position ?? (await requestCurrentPosition())
            const response = await placesApi.nearby(
              position.lat,
              position.lng,
              searchRadius(selectedConditions),
              state.selectedRecommendation!.placeCategory!,
            )
            return { ...response, position }
          },
          staleTime: Infinity,
          retry: false,
        })
        if (disposed) return
        useApiMissionStore.setState({
          position: response.position,
          places: response.items,
          selectedPlaceId: response.items[0]?.placeId ?? null,
        })
        go('places')
      } else {
        if (!state.mission) throw new Error('진행 중인 미션이 없어요.')
        const response = await queryClient.fetchQuery({
          queryKey: [
            'api',
            userId,
            'alternatives',
            state.mission.missionId,
            state.problem,
            state.alternativeTurn,
            retry,
          ],
          queryFn: () => missionsApi.alternatives(state.mission!.missionId, state.problem),
          staleTime: Infinity,
          retry: false,
        })
        if (disposed) return
        if (
          response.recommendations.some((item) => item.energyLevel !== state.mission!.energyLevel)
        )
          throw new Error('같은 단계의 대체 미션을 확인하지 못했어요. 다시 시도해 주세요.')
        useApiMissionStore.setState({
          alternatives: response.recommendations,
          fallback: response.fallback ?? false,
        })
      }
    }
    void request().catch((error) => {
      if (!disposed) setError(error)
    })
    return () => {
      disposed = true
    }
  }, [route, api.searchAttempt, api.alternativeTurn, retry, userId, go, defaults])

  async function createSelected(
    recommendation: Recommendation,
    placeId: string | null,
    replacing = false,
  ) {
    const current = useApiMissionStore.getState()
    let missionId = current.pendingMissionId
    if (!missionId) {
      if (replacing) {
        if (!current.mission) throw new Error('변경할 미션을 확인하지 못했어요.')
        missionId = (
          await missionsApi.replace(
            current.mission.missionId,
            recommendation.recommendationId,
            placeId,
          )
        ).newMissionId
      } else {
        if (current.mission?.status === 'in_progress' && current.checkedStepIds.length === 0) {
          if (
            current.mission.place?.placeId === placeId &&
            current.createdRecommendationId === recommendation.recommendationId
          ) {
            go('detail')
            return
          }
          await missionsApi.abandon(current.mission.missionId)
        }
        missionId = (await missionsApi.create(recommendation.recommendationId, placeId)).missionId
      }
      useApiMissionStore.setState({ pendingMissionId: missionId, mission: null })
    }
    applyDetail(await missionsApi.detail(missionId))
    useApiMissionStore.setState({
      resumed: false,
      reviewFinished: false,
      createdRecommendationId: recommendation.recommendationId,
    })
    void invalidateApiData()
    go(replacing || recommendation.missionType === 'non_place' ? 'active' : 'detail')
  }
  function selectRecommendation(recommendation: Recommendation) {
    const current = useApiMissionStore.getState()
    useApiMissionStore.setState({
      selectedRecommendation: recommendation,
      selectionMode: 'new',
      pendingMissionId:
        current.selectedRecommendation?.recommendationId === recommendation.recommendationId
          ? current.pendingMissionId
          : null,
      places: [],
      selectedPlaceId: null,
      review: { ...emptyReview },
    })
    if (recommendation.missionType === 'place') setModal('location')
    else void run(() => createSelected(recommendation, null))
  }
  async function saveProgress() {
    if (!mission) return
    if (allDone) await missionsApi.complete(mission.missionId)
    else
      await missionsApi.saveProgress(
        mission.missionId,
        useApiMissionStore.getState().checkedStepIds,
      )
    applyDetail(await missionsApi.detail(mission.missionId))
    useApiMissionStore.setState({ summarySaved: true })
    void invalidateApiData()
  }
  function reviewNext() {
    if (useApiMissionStore.getState().mission?.review) {
      setToast('이미 남긴 후기는 그대로 유지돼요')
      go('home')
    } else go('review-mood')
  }
  function toggleStep(index: number) {
    if (!mission || mission.status !== 'in_progress') return
    const current = useApiMissionStore.getState().checkedStepIds
    const stepId = missionSteps[index].stepId
    const next = missionSteps
      .filter((step) =>
        step.stepId === stepId ? !current.includes(stepId) : current.includes(step.stepId),
      )
      .map((step) => step.stepId)
    const version = ++stepVersion.current
    useApiMissionStore.setState({ checkedStepIds: next })
    setStepsPending((count) => count + 1)
    setError(null)
    void missionsApi
      .updateSteps(mission.missionId, next)
      .then((response) => {
        if (
          version === stepVersion.current &&
          useApiMissionStore.getState().mission?.missionId === mission.missionId
        )
          useApiMissionStore.setState({ checkedStepIds: response.completedStepIds })
      })
      .catch(async (error) => {
        if (version !== stepVersion.current) return
        setError(error)
        try {
          const detail = await missionsApi.detail(mission.missionId)
          if (version === stepVersion.current) applyDetail(detail)
        } catch {
          /* 상태 오류 안내를 유지한다. */
        }
      })
      .finally(() => setStepsPending((count) => count - 1))
  }
  async function confirmModal() {
    if (modal === 'rest') {
      await reflectionApi.rest(today)
      await invalidateApiData()
      setToast('오늘은 충분히 쉬어가요')
      setModal(null)
    }
    if (modal === 'location') {
      useApiMissionStore.setState({ locationConsent: true })
      go('location-loading')
    }
    if (modal === 'save') {
      await saveProgress()
      go('summary')
    }
    if (modal === 'stop' && stopTarget) {
      await missionsApi.abandon(stopTarget.missionId)
      if (mission?.missionId === stopTarget.missionId) api.reset()
      await invalidateApiData()
      go('home')
    }
    if (modal === 'change' && candidate) {
      useApiMissionStore.setState({
        selectedRecommendation: candidate,
        selectionMode: 'replace',
        pendingMissionId: null,
      })
      if (
        candidate.missionType === 'place' &&
        (!mission?.place || candidate.placeCategory !== mission.placeCategory)
      ) {
        useApiMissionStore.setState({ places: [], selectedPlaceId: null })
        setModal('location')
      } else
        await createSelected(
          candidate,
          candidate.missionType === 'place' ? (mission?.place?.placeId ?? null) : null,
          true,
        )
    }
  }
  function activeStop() {
    if (!mission) return
    setStopTarget({
      missionId: mission.missionId,
      title: mission.title,
      energyLevel: mission.energyLevel,
      startedAt: mission.startedAt,
      completedCount: checked.length,
      remainingCount: 5 - checked.length,
    })
    setModal('stop')
  }
  const message = error ? (
    <p className="lt-api-error" role="alert">
      {apiErrorMessage(error)}
    </p>
  ) : null
  const disabled = pending || stepsPending > 0
  let content: React.ReactNode
  if (route === 'home')
    content = (
      <ApiHome
        start={start}
        rest={() => setModal('rest')}
        stop={(value) => {
          setStopTarget(value)
          setModal('stop')
        }}
      />
    )
  else if (api.pendingMissionId && error)
    content = (
      <Page {...pageProps}>
        <Heading title="미션 정보를 확인하고 있어요" />
        <ApiFeedback
          error={error}
          onRetry={() =>
            void run(async () => {
              const detail = await missionsApi.detail(api.pendingMissionId!)
              applyDetail(detail)
              useApiMissionStore.setState({
                createdRecommendationId: api.selectedRecommendation?.recommendationId ?? null,
              })
              go(
                api.selectionMode === 'replace' ||
                  api.selectedRecommendation?.missionType === 'non_place'
                  ? 'active'
                  : 'detail',
              )
            })
          }
        />
      </Page>
    )
  else if (route === 'resume')
    content = (
      <Page {...pageProps}>
        <Heading title="이어할 미션이 있어요" subtitle="멈췄던 단계부터 다시 시작할 수 있어요" />
        {resumable.isPending || resumable.error ? (
          <ApiFeedback
            loading={resumable.isPending}
            error={resumable.error}
            onRetry={() => void resumable.refetch()}
          />
        ) : (
          <div className="lt-body">
            {message}
            {resumable.data!.items.map((saved) => (
              <Card key={saved.missionId} title={saved.title}>
                <InfoRows
                  rows={[
                    ['시작일', shortDate(saved.startedAt)],
                    ['완료한 단계', `${saved.completedCount}개`],
                    ['남은 단계', `${saved.remainingCount}개`],
                  ]}
                />
                <div className="lt-button-stack">
                  <Button
                    disabled={disabled}
                    onClick={() =>
                      void run(async () => {
                        await missionsApi.resume(saved.missionId)
                        applyDetail(await missionsApi.detail(saved.missionId))
                        useApiMissionStore.setState({ resumed: true })
                        go('active')
                      })
                    }
                  >
                    이어하기
                  </Button>
                  <Button
                    disabled={disabled}
                    variant="secondary"
                    onClick={() => {
                      setStopTarget(saved)
                      setModal('stop')
                    }}
                  >
                    그만하기
                  </Button>
                </div>
              </Card>
            ))}
            {!resumable.data!.items.length && (
              <Card title="이어할 미션이 아직 없어요">
                <Button onClick={start}>오늘의 외출 시작하기</Button>
              </Card>
            )}
            <p className="lt-hint lt-trim">
              중단한 미션은 시작 후 7일 동안 이어할 수 있어요.
              <br />
              이미 남긴 성공 기록은 그대로 유지돼요.
            </p>
          </div>
        )}
      </Page>
    )
  else if (route === 'loading' || route === 'location-loading')
    content = (
      <Page {...pageProps}>
        <Heading
          title={
            route === 'loading'
              ? '지금 조건에 맞는\n미션을 찾고 있어요'
              : '조건에 맞는\n주변 장소를 찾고 있어요'
          }
          subtitle={route === 'loading' ? '에너지와 외출 조건을 확인하고 있어요' : undefined}
        />
        <ApiFeedback
          places={route === 'location-loading'}
          loading={!error}
          error={error}
          onRetry={() => {
            setError(null)
            setRetry((value) => value + 1)
          }}
        >
          {!!error && (
            <Button variant="secondary" onClick={() => go('recommendations')}>
              다른 미션 선택하기
            </Button>
          )}
        </ApiFeedback>
      </Page>
    )
  else if (route === 'recommendations' || route === 'alternatives') {
    const alternative = route === 'alternatives'
    const options = alternative ? api.alternatives : api.recommendations
    const level = alternative
      ? (mission?.energyLevel ?? 1)
      : toApiConditions(conditions, defaults ?? undefined).energyLevel
    content = (
      <Page
        {...pageProps}
        footer={
          <Footer row={!alternative}>
            <Button
              disabled={disabled}
              variant="secondary"
              onClick={() => go(alternative ? 'active' : 'conditions-1')}
            >
              {alternative ? '하고있던 미션으로 돌아가기' : '조건 수정하기'}
            </Button>
            <Button
              disabled={disabled}
              onClick={() => {
                if (alternative)
                  useApiMissionStore.setState({
                    alternatives: [],
                    alternativeTurn: api.alternativeTurn + 1,
                  })
                else go('loading')
              }}
            >
              다른 미션 보기
            </Button>
          </Footer>
        }
      >
        <Heading
          title={alternative ? '동일한 단계의\n대체 미션이 있어요' : missionTitles[level]}
          subtitle={`에너지 ${level}단계에 맞췄어요`}
        />
        {!options.length ? (
          <ApiFeedback
            loading={alternative && !error}
            error={error}
            title={alternative ? undefined : '먼저 외출 조건을 선택해 주세요'}
            onRetry={
              alternative
                ? () => {
                    setError(null)
                    setRetry((value) => value + 1)
                  }
                : start
            }
          />
        ) : (
          <div className="lt-body">
            {message}
            {api.fallback && (
              <p className="lt-hint">추천 준비가 늦어져 미리 준비한 미션을 보여드려요.</p>
            )}
            {options.map((option, index) => (
              <Card
                key={option.recommendationId}
                title={option.title}
                description={option.description}
              >
                <Button
                  disabled={disabled}
                  variant={index === 0 ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (alternative) {
                      setCandidate(option)
                      setModal('change')
                    } else selectRecommendation(option)
                  }}
                >
                  이 미션으로 할게요
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Page>
    )
  } else if (route === 'places')
    content = (
      <Page
        {...pageProps}
        footer={
          selected && api.selectedRecommendation ? (
            <Footer>
              <Button
                disabled={disabled}
                onClick={() =>
                  void run(() =>
                    createSelected(
                      api.selectedRecommendation!,
                      selected.placeId,
                      api.selectionMode === 'replace',
                    ),
                  )
                }
              >
                이 장소로 할게요
              </Button>
            </Footer>
          ) : undefined
        }
      >
        <Heading eyebrow={api.selectedRecommendation?.title} title="이 미션, 어디에서 해볼까요?" />
        {!places.length ? (
          <ApiFeedback
            title="조건에 맞는 장소가 없어요"
            onRetry={() => {
              useApiMissionStore.setState({ searchAttempt: api.searchAttempt + 1 })
              go('location-loading')
            }}
          >
            <Button
              variant="secondary"
              onClick={() => go(api.selectionMode === 'replace' ? 'active' : 'recommendations')}
            >
              다른 미션 선택하기
            </Button>
          </ApiFeedback>
        ) : (
          <>
            <div className="lt-place-step-preview">
              <NumberedSteps
                steps={sortedSteps(api.selectedRecommendation?.steps ?? []).map(
                  (step) => step.text,
                )}
                compact
              />
              <p className="lt-hint lt-trim">스크롤해, 미션을 확인할 수 있어요</p>
            </div>
            <div className="lt-body">
              {message}
              <OutingMap
                places={places}
                selectedPlaceId={selected?.placeId ?? ''}
                onSelect={(selectedPlaceId) => useApiMissionStore.setState({ selectedPlaceId })}
                currentPosition={api.position}
              />
            </div>
            <section className="lt-body lt-place-picker">
              <h2 className="lt-section-title lt-trim">장소를 선택해주세요</h2>
              <div className="lt-place-options">
                {places.map((place, index) => (
                  <button
                    type="button"
                    key={place.id}
                    className={place.id === selected?.placeId ? 'is-selected' : ''}
                    aria-pressed={place.id === selected?.placeId}
                    onClick={() => useApiMissionStore.setState({ selectedPlaceId: place.id })}
                  >
                    <span className="lt-place-number">{index + 1}</span>
                    <strong className="lt-trim">{place.name}</strong>
                    <div className="lt-place-meta">
                      <span>{place.distance}</span>
                      <span>{place.walk}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </Page>
    )
  else if (!mission || !view)
    content = (
      <Page {...pageProps}>
        <Heading title="진행 중인 미션을 확인해 주세요" />
        <ApiFeedback title="먼저 미션을 선택해 주세요">
          <Button onClick={start}>오늘의 외출 시작하기</Button>
        </ApiFeedback>
      </Page>
    )
  else if (route === 'detail')
    content = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button onClick={() => go('active')}>이 미션으로 할게요</Button>
          </Footer>
        }
      >
        <Heading
          eyebrow={`${mission.energyLevel}단계 미션`}
          title={mission.title}
          subtitle={shortDate(mission.startedAt)}
        />
        <div className="lt-body lt-body--detail">
          <NumberedSteps title="이렇게 해볼 수 있어요" steps={view.steps} />
          <Metrics distance={view.distance} time={view.time} budget={view.budget} />
        </div>
        {activePlace && <PlaceInfo place={activePlace} currentPosition={api.position} />}
      </Page>
    )
  else if (route === 'active' && mission.status !== 'in_progress')
    content = (
      <Page {...pageProps}>
        <Heading
          title={
            mission.status === 'paused'
              ? '저장한 미션을 이어할까요?'
              : mission.status === 'completed'
                ? '이미 완료한 미션이에요'
                : '종료된 미션이에요'
          }
        />
        <div className="lt-body">
          {message}
          <Button
            disabled={disabled}
            onClick={() => {
              if (mission.status === 'paused')
                void run(async () => {
                  await missionsApi.resume(mission.missionId)
                  applyDetail(await missionsApi.detail(mission.missionId))
                  useApiMissionStore.setState({ resumed: true })
                })
              else if (mission.status === 'completed') go('summary')
              else start()
            }}
          >
            {mission.status === 'paused'
              ? '이어하기'
              : mission.status === 'completed'
                ? '수행 내역 보기'
                : '새 미션 시작하기'}
          </Button>
        </div>
      </Page>
    )
  else if (route === 'active')
    content = (
      <Page
        {...pageProps}
        onStop={!allDone ? activeStop : undefined}
        footer={
          allDone ? (
            <Footer>
              <Button
                disabled={disabled}
                onClick={() =>
                  void run(async () => {
                    await saveProgress()
                    go('summary')
                  })
                }
              >
                완료했어요
              </Button>
            </Footer>
          ) : (
            <Footer compact>
              <Button
                disabled={disabled}
                onClick={() => {
                  if (api.resumed)
                    void run(async () => {
                      await saveProgress()
                      reviewNext()
                    })
                  else setModal('save')
                }}
              >
                지금 단계까지 저장하기
              </Button>
              <Button
                disabled={disabled}
                variant="text"
                onClick={() => (api.resumed ? activeStop() : go('problem'))}
              >
                {api.resumed ? '이 미션 그만하고 싶어요' : '문제가 생겼어요'}
              </Button>
            </Footer>
          )
        }
      >
        <Heading
          eyebrow={`${mission.energyLevel}단계 미션`}
          title={mission.title}
          subtitle={shortDate(mission.startedAt)}
        />
        <div className="lt-body lt-body--checks">
          {message}
          <MissionChecks steps={view.steps} checked={checked} onToggle={toggleStep} />
          <p className="lt-hint lt-trim">처음부터 다시 해도 이전 성공 기록은 지워지지 않아요</p>
          {stepsPending > 0 && (
            <p className="lt-hint" role="status">
              수행 단계를 저장하고 있어요
            </p>
          )}
        </div>
        {activePlace && <PlaceInfo place={activePlace} currentPosition={api.position} />}
      </Page>
    )
  else if (route === 'summary')
    content = (
      <Page
        {...pageProps}
        nodeId={mission.status === 'completed' ? '72:9397' : '72:9477'}
        footer={
          mission.status === 'completed' ? (
            <Footer>
              <Button onClick={reviewNext}>확인했어요</Button>
            </Footer>
          ) : (
            <Footer row>
              <Button disabled={disabled} variant="secondary" onClick={back}>
                미션 계속하기
              </Button>
              <Button onClick={reviewNext}>저장하기</Button>
            </Footer>
          )
        }
      >
        <Heading eyebrow={mission.title} title="아래의 수행 내역을 저장할게요" />
        <div className="lt-body lt-body--detail">
          {message}
          <NumberedSteps steps={view.steps} checked={checked} />
          <Metrics distance={view.distance} time={view.time} budget={view.budget} />
        </div>
        {activePlace && <PlaceInfo place={activePlace} />}
      </Page>
    )
  else if (route === 'problem')
    content = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button
              onClick={() => {
                useApiMissionStore.setState({
                  alternatives: [],
                  alternativeTurn: api.alternativeTurn + 1,
                })
                go('alternatives')
              }}
            >
              대체 미션 선택하기
            </Button>
            <Button variant="secondary" onClick={() => go('active')}>
              하고있던 미션으로 돌아가기
            </Button>
          </Footer>
        }
      >
        <Heading eyebrow={mission.title} title={'상황이 어떻게\n달라졌나요?'} />
        <Choices
          options={problemOptions}
          selected={[problemOptions.indexOf(api.problem)]}
          onChange={(index) => useApiMissionStore.setState({ problem: problemOptions[index] })}
          label="달라진 상황"
        />
      </Page>
    )
  else if (route === 'review-mood' || route === 'review-note') {
    if (api.reviewFinished)
      content = (
        <Page {...pageProps}>
          <Heading title="이미 후기를 남긴 미션이에요" />
          <div className="lt-body">
            <Button onClick={() => go('home')}>홈으로 돌아가기</Button>
          </div>
        </Page>
      )
    else if (route === 'review-mood')
      content = (
        <Page
          {...pageProps}
          footer={
            <Footer>
              <Button onClick={() => go('review-note')}>다음</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  useApiMissionStore.setState({ review: { ...api.review, mood: null } })
                  go('review-note')
                }}
              >
                건너뛰기
              </Button>
            </Footer>
          }
        >
          <Heading
            title="외출 후 기분은 어떤가요?"
            subtitle="고르지 않아도 성공 기록은 그대로 남아요"
            progress={{ current: 1, total: 2 }}
          />
          <Choices
            options={reviewMoodOptions}
            selected={api.review.mood === null ? [] : [Number(api.review.mood)]}
            onChange={(index) =>
              useApiMissionStore.setState({ review: { ...api.review, mood: String(index) } })
            }
            label="외출 후 기분"
          />
        </Page>
      )
    else
      content = (
        <Page
          {...pageProps}
          footer={
            <Footer>
              <Button
                disabled={disabled}
                onClick={() =>
                  void run(async () => {
                    const review = useApiMissionStore.getState().review
                    await missionsApi.review(mission.missionId, {
                      moodAfter:
                        review.mood === null ? null : reviewMoodOptions[Number(review.mood)],
                      oneLine: review.note.trim() || null,
                      retryActivity: review.retry.trim() || null,
                      goodPoint: review.good.trim() || null,
                    })
                    useApiMissionStore.setState({ reviewFinished: true })
                    void invalidateApiData()
                    go('home')
                  })
                }
              >
                기록 저장하기
              </Button>
            </Footer>
          }
        >
          <Heading
            title="남기고 싶은 내용을 적어보세요"
            subtitle="모두 선택 사항이에요. 나에게만 보여요."
            progress={{ current: 2, total: 2 }}
          />
          <div className="lt-body lt-review-fields">
            {message}
            {(
              [
                ['note', '오늘의 한 줄 후기', '오늘의 작은 성공을 남겨보세요'],
                ['retry', '다시 해보고 싶은 활동', '다시 해보고 싶은 활동'],
                ['good', '오늘 외출에서 좋았던 점', '오늘 외출에서 좋았던 점'],
              ] as const
            ).map(([key, label, placeholder]) => (
              <ReviewInput
                key={key}
                label={label}
                placeholder={placeholder}
                value={api.review[key]}
                onChange={(value) =>
                  useApiMissionStore.setState({ review: { ...api.review, [key]: value } })
                }
              />
            ))}
          </div>
        </Page>
      )
  } else content = null

  const copies = {
    rest: ['오늘은 쉬어갈까요?', '오늘 충분한 휴식을 갖고,\n내일은 미션을 도전해봐요!', '72:8395'],
    location: [
      '주변 장소를 찾으려면\n위치 정보가 필요해요',
      '동의하면 현재 위치로 주변 장소를 찾아요.\n거절하면 장소가 없는 미션을 선택할 수 있어요.',
      '72:9265',
    ],
    save: [
      '이 미션 수행 내역을\n지금 단계까지 저장할게요',
      '다음에도 홈 화면에서 계속해서 이어할 수 있어요',
      '72:9686',
    ],
    stop: ['이 미션을 그만할까요?', '이미 남긴 성공 기록은 그대로 유지돼요', '72:8011'],
    change: [
      '이 미션으로 변경할까요?',
      '‘아니오’를 선택하면\n하고 있던 미션으로 돌아갈 수 있어요',
      '72:9654',
    ],
  } as const
  return (
    <div className="lt-app">
      {content}
      {modal && (
        <Modal
          title={copies[modal][0]}
          description={copies[modal][1]}
          nodeId={copies[modal][2]}
          onClose={() => {
            if (!pending) setModal(null)
          }}
          actions={
            modal === 'location' ? (
              <div className="lt-button-stack">
                <Button disabled={pending} onClick={() => void run(confirmModal)}>
                  동의하기
                </Button>
                <Button
                  disabled={pending}
                  variant="secondary"
                  onClick={() => go(api.selectionMode === 'replace' ? 'active' : 'recommendations')}
                >
                  거절하기
                </Button>
              </div>
            ) : (
              <>
                <Button
                  disabled={pending}
                  variant="secondary"
                  onClick={() => {
                    if (modal === 'change') go('active')
                    else setModal(null)
                  }}
                >
                  아니오
                </Button>
                <Button disabled={pending} onClick={() => void run(confirmModal)}>
                  예
                </Button>
              </>
            )
          }
        >
          {message}
          {modal === 'stop' && stopTarget && (
            <Card title={stopTarget.title}>
              <InfoRows
                rows={[
                  ['시작일', shortDate(stopTarget.startedAt)],
                  ['완료한 단계', `${stopTarget.completedCount}개`],
                  ['남은 단계', `${stopTarget.remainingCount}개`],
                ]}
              />
            </Card>
          )}
          {modal === 'save' && mission && (
            <Card title={mission.title}>
              <InfoRows
                rows={[
                  ['시작일', shortDate(mission.startedAt)],
                  ['완료한 단계', `${checked.length}개`],
                  ['남은 단계', `${5 - checked.length}개`],
                ]}
              />
            </Card>
          )}
          {modal === 'change' && candidate && (
            <Card title={candidate.title} description={candidate.description} />
          )}
        </Modal>
      )}
      {toast && (
        <div className="lt-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
