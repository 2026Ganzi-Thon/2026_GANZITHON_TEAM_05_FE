import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import ChoiceChipGroup from '@/components/ui/ChoiceChipGroup'
import { PATHS } from '@/constants/paths'
import { useOutingStore, type OutingSession } from '@/stores/outingStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import { todayString } from '@/stores/collectionStore'
import { reconcileCollectionDays, resumableMissions, shortDate } from './history'
import MissionSkeletons from '@/components/ui/MissionSkeletons'
import { OUTING_SCREEN_PATHS } from './navigation'
import { resolveOutingDefaults } from './defaults'
import { createOutingRecord } from './records'
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
import { HomeScreen } from './HomeScreen'
import OutingMap from './OutingMap'
import {
  alternativeMissions,
  barrierOptions,
  cafes,
  conditionGroups,
  emptyConditions,
  emptyReview,
  energyOptions,
  missionById,
  missionTitles,
  moodOptions,
  parks,
  problemOptions,
  recommendMissions,
  reviewMoodOptions,
  store,
} from './mockData'

import type { Conditions, Energy, Mission, ModalKind, SavedMission, Screen } from './types'
import './letit.css'
import { isApiEnabled } from '@/api/config'
import ApiOutingFlow from './ApiOutingFlow'

const screenNodes: Record<Screen, string> = {
  home: '72:7657',
  resume: '72:7849',
  'conditions-1': '72:8085',
  'conditions-2': '72:8138',
  'conditions-3': '72:8191',
  'conditions-4': '72:8249',
  defaults: '72:8324',
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
export interface OutingFlowProps {
  screen: Screen
}
export default function OutingFlow(props: OutingFlowProps) {
  return isApiEnabled && !props.screen.startsWith('conditions-') && props.screen !== 'defaults' ? (
    <ApiOutingFlow {...props} />
  ) : (
    <MockOutingFlow {...props} />
  )
}
function MockOutingFlow({ screen: route }: OutingFlowProps) {
  const navigate = useNavigate()
  const { state, session, setMockState: setState, updateSession } = useOutingStore()
  const userDefaults = useUserDefaultsStore((store) => store.defaults)
  const effectiveDefaults = resolveOutingDefaults(userDefaults)
  const {
    missionId,
    checked,
    resumed,
    placeId,
    recommendationTurn,
    problem,
    candidateId,
    review,
    recordId,
    runId,
    startedAt,
  } = session
  const setField =
    <K extends keyof OutingSession>(key: K) =>
    (value: OutingSession[K] | ((previous: OutingSession[K]) => OutingSession[K])) =>
      updateSession(key, value)
  const setMissionId = setField('missionId')
  const setChecked = setField('checked')
  const setResumed = setField('resumed')
  const setPlaceId = setField('placeId')
  const setRecommendationTurn = setField('recommendationTurn')
  const setProblem = setField('problem')
  const setCandidateId = setField('candidateId')
  const setReview = setField('review')
  const setRecordId = setField('recordId')
  const [modal, setModal] = useState<ModalKind | null>(null)
  const [toast, setToast] = useState('')
  const go = useCallback(
    (next: Screen) => {
      setModal(null)
      navigate(OUTING_SCREEN_PATHS[next])
    },
    [navigate, setModal],
  )
  const onNavigateExternal = (destination: 'collection' | 'reflection') =>
    navigate(destination === 'collection' ? PATHS.COLLECTION : PATHS.REFLECTION)
  const mission = missionById(missionId)
  // 건너뛴 항목은 매번 가입 설문에서 고른 값을 기본값으로 쓴다.
  const reusableDefaults = effectiveDefaults
  const energy = state.conditions.energy ?? reusableDefaults.energy!
  const places =
    mission.placeType === 'store' ? [store] : mission.placeType === 'cafe' ? cafes : parks
  const selectedPlace = places.find((p) => p.id === placeId) ?? places[0]
  const steps = mission.steps.map((step, index) =>
    mission.placeType && index === 2
      ? `${selectedPlace.name} 도착하기`
      : mission.placeType === 'store' && index === 3
        ? `${selectedPlace.name}에서 물건 구매하기`
        : step,
  )
  const allDone = checked.length === mission.steps.length
  const shownTitle = mission.id === 'store' ? '편의점 다녀오기' : mission.title
  const summaryTitle = mission.id === 'store' ? '편의점 다녀오기' : mission.title
  const summarySteps = steps
  const savedMission = state.savedMissions.find((m) => m.id === runId)
  const missionDate = shortDate(startedAt || new Date().toISOString())
  const saved = resumableMissions(state)

  useEffect(() => {
    // 후기를 저장한 뒤 브라우저 뒤로가기로 돌아와 같은 기록을 다시 만들지 않는다.
    if (route.startsWith('review-') && !recordId) go('home')
  }, [route, recordId, go])

  useEffect(() => {
    if (route !== 'loading') return
    const conditions = {
      ...reusableDefaults,
      ...Object.fromEntries(Object.entries(state.conditions).filter(([, value]) => value !== null)),
    } as Conditions
    setState((prev) => ({ ...prev, conditions }))
    // 로딩 진입 한 번에 이번 외출의 조건을 확정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])

  useEffect(() => {
    if (!['loading', 'location-loading'].includes(route)) return
    const timer = window.setTimeout(
      () => go(route === 'loading' ? 'recommendations' : 'places'),
      850,
    )
    return () => window.clearTimeout(timer)
  }, [route, go])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function updateConditions(patch: Partial<Conditions>) {
    setState((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, ...patch },
    }))
  }
  function start() {
    setState((prev) => ({
      ...prev,
      resting: false,
      conditions: structuredClone(emptyConditions),
    }))
    setRecordId(null)
    setReview({ ...emptyReview })
    go('conditions-1')
  }
  function back() {
    if (route.startsWith('conditions-')) {
      const step = Number(route.at(-1))
      if (step === 1) setModal('exit')
      else go(`conditions-${step - 1}` as Screen)
      return
    }
    const backRoutes: Partial<Record<Screen, Screen>> = {
      resume: 'home',
      defaults: 'conditions-4',
      recommendations: 'conditions-4',
      detail: 'places',
      places: 'recommendations',
      problem: 'active',
      alternatives: 'active',
      summary: 'active',
      'review-mood': 'summary',
      'review-note': 'review-mood',
      loading: 'conditions-4',
      'location-loading': 'recommendations',
    }
    if (route === 'active') {
      setModal('save')
      return
    }
    go(backRoutes[route] ?? 'home')
  }
  function advanceCondition(skip = false) {
    const step = Number(route.at(-1))
    if (skip)
      updateConditions(
        step === 1
          ? { mood: reusableDefaults.mood }
          : step === 2
            ? { energy: reusableDefaults.energy }
            : step === 3
              ? { barriers: reusableDefaults.barriers }
              : {
                  distance: reusableDefaults.distance,
                  time: reusableDefaults.time,
                  budget: reusableDefaults.budget,
                },
      )
    if (step < 4) go(`conditions-${step + 1}` as Screen)
    else {
      setRecommendationTurn(0)
      go(
        skip ||
          state.conditions.energy === null ||
          !state.conditions.distance ||
          !state.conditions.time ||
          !state.conditions.budget
          ? 'defaults'
          : 'loading',
      )
    }
  }
  function selectMission(next: Mission) {
    updateSession('runId', crypto.randomUUID())
    updateSession('startedAt', new Date().toISOString())
    setMissionId(next.id)
    setResumed(false)
    setChecked([])
    setRecordId(null)
    setReview({ ...emptyReview })
    setPlaceId(
      next.placeType === 'store' ? store.id : next.placeType === 'cafe' ? cafes[0].id : parks[0].id,
    )
    if (next.placeType) setModal('location')
    else go('active')
  }
  function resumeMission(saved: SavedMission) {
    updateSession('runId', saved.id)
    updateSession('startedAt', saved.startedAt)
    setMissionId(saved.missionId)
    setChecked(saved.checked)
    setPlaceId(saved.placeId)
    setResumed(true)
    setRecordId(null)
    setReview({ ...emptyReview })
    go('active')
  }
  function saveProgress() {
    setState((prev) => ({
      ...prev,
      savedMissions: [
        ...prev.savedMissions.filter((s) => s.id !== runId),
        {
          id: runId,
          missionId,
          checked: [...checked],
          date: missionDate,
          startedAt: startedAt || new Date().toISOString(),
          placeId,
        },
      ],
    }))
  }
  function saveRecord() {
    const record = createOutingRecord({
      id: recordId,
      missionId,
      title: summaryTitle,
      checked: [...checked],
      completed: allDone,
      runId,
      startedAt: startedAt || new Date().toISOString(),
      mission: {
        ...mission,
        steps,
        distance: mission.placeType ? selectedPlace.walk : mission.distance,
      },
      place: mission.placeType ? selectedPlace : undefined,
      ...review,
      mood: review.mood === null ? null : reviewMoodOptions[Number(review.mood)],
    })
    const id = record.id
    setState((prev) => {
      return {
        ...prev,
        savedMissions: allDone
          ? prev.savedMissions.filter((s) => s.id !== runId)
          : [
              ...prev.savedMissions.filter((s) => s.id !== runId),
              {
                id: runId,
                missionId,
                checked: [...checked],
                date: missionDate,
                startedAt: startedAt || new Date().toISOString(),
                placeId,
              },
            ],
        records: [...prev.records.filter((r) => r.id !== id), record],
      }
    })
    setRecordId(id)
    reconcileCollectionDays(useOutingStore.getState().state)
    go('review-mood')
  }
  function finishReview() {
    if (recordId)
      setState((prev) => ({
        ...prev,
        records: prev.records.map((record) =>
          record.id === recordId
            ? {
                ...record,
                ...review,
                mood: review.mood === null ? null : reviewMoodOptions[Number(review.mood)],
              }
            : record,
        ),
      }))
    else {
      const record = createOutingRecord({
        missionId,
        title: summaryTitle,
        checked: [...checked],
        completed: allDone,
        runId,
        startedAt: startedAt || new Date().toISOString(),
        mission: {
          ...mission,
          steps,
          distance: mission.placeType ? selectedPlace.walk : mission.distance,
        },
        place: mission.placeType ? selectedPlace : undefined,
        ...review,
        mood: review.mood === null ? null : reviewMoodOptions[Number(review.mood)],
      })
      setState((prev) => ({
        ...prev,
        records: [...prev.records, record],
      }))
      reconcileCollectionDays(useOutingStore.getState().state)
    }
    setToast('외출 기록을 저장했어요')
    setReview({ ...emptyReview })
    setRecordId(null)
    go('home')
  }
  function confirmModal() {
    if (modal === 'rest') {
      setState((prev) => ({
        ...prev,
        resting: true,
        restDates: [...new Set([...prev.restDates, todayString()])],
      }))
      setToast('오늘은 충분히 쉬어가요')
      setModal(null)
    }
    if (modal === 'exit') go('home')
    if (modal === 'location') go('location-loading')
    if (modal === 'stop') {
      setState((prev) => ({
        ...prev,
        savedMissions: prev.savedMissions.filter((s) => s.id !== runId),
      }))
      setToast('미션을 그만했어요')
      go('home')
    }
    if (modal === 'save') {
      saveProgress()
      go('summary')
    }
    if (modal === 'change') {
      const removedDates = state.records
        .filter((record) => record.runId === runId)
        .map((record) => todayString(new Date(record.createdAt)))
      setState((prev) => ({
        ...prev,
        savedMissions: prev.savedMissions.filter((saved) => saved.id !== runId),
        records: prev.records.filter((record) => record.runId !== runId),
      }))
      reconcileCollectionDays(useOutingStore.getState().state, removedDates)
      updateSession('runId', crypto.randomUUID())
      updateSession('startedAt', new Date().toISOString())
      setMissionId(candidateId)
      setChecked([])
      setResumed(false)
      setRecordId(null)
      go('active')
      setToast('새로운 미션으로 변경했어요')
    }
  }

  const pageProps = { onBack: back, nodeId: screenNodes[route] }
  const nextFooter = (
    <Footer>
      <Button onClick={() => advanceCondition()}>다음</Button>
      <Button variant="secondary" onClick={() => advanceCondition(true)}>
        건너뛰기
      </Button>
      <p className="lt-hint lt-skip-hint">건너뛴 항목들은 평소 설정을 기준으로 추천해 드려요</p>
    </Footer>
  )
  let screen
  if (route === 'home')
    screen = (
      <HomeScreen
        state={state}
        onStart={start}
        onResume={() => go('resume')}
        onRest={() => setModal('rest')}
        onStop={(saved) => {
          updateSession('runId', saved.id)
          updateSession('startedAt', saved.startedAt)
          setMissionId(saved.missionId)
          setChecked(saved.checked)
          setResumed(true)
          setModal('stop')
        }}
        onNavigateExternal={onNavigateExternal}
      />
    )
  else if (route === 'resume')
    screen = (
      <Page {...pageProps}>
        <Heading title="이어할 미션이 있어요" subtitle="멈췄던 단계부터 다시 시작할 수 있어요" />
        <div className="lt-body lt-body--resume">
          {saved.map((saved) => (
            <Card key={saved.id} title={missionById(saved.missionId).title.replace('집 앞 ', '')}>
              <InfoRows
                rows={[
                  ['시작일', shortDate(saved.startedAt)],
                  ['완료한 단계', `${saved.checked.length}개`],
                  [
                    '남은 단계',
                    `${missionById(saved.missionId).steps.length - saved.checked.length}개`,
                  ],
                ]}
              />
              <div className="lt-button-stack">
                <Button onClick={() => resumeMission(saved)}>이어하기</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    updateSession('runId', saved.id)
                    updateSession('startedAt', saved.startedAt)
                    setMissionId(saved.missionId)
                    setChecked(saved.checked)
                    setResumed(true)
                    setModal('stop')
                  }}
                >
                  그만하기
                </Button>
              </div>
            </Card>
          ))}
          {!saved.length && (
            <Card
              title="이어할 미션이 아직 없어요"
              description="새로운 미션으로 작은 외출을 시작해봐요"
            >
              <Button onClick={start}>오늘의 외출 시작하기</Button>
            </Card>
          )}
          <p className="lt-hint lt-trim">
            중단한 미션은 시작 후 7일 동안 이어할 수 있어요.
            <br />
            이미 남긴 성공 기록은 그대로 유지돼요.
          </p>
        </div>
      </Page>
    )
  else if (route.startsWith('conditions-')) {
    const step = Number(route.at(-1))
    const titles = [
      '지금 기분은 어떤가요?',
      '지금 외출할 에너지는\n어느 정도인가요?',
      '외출을 망설이는\n이유가 있나요?',
      '미션 수행 시\n원하는 조건을 설정해요',
    ]
    const subtitles = [
      '고르지 않아도 미션을 추천받을 수 있어요',
      '지금 할 수 있는 범위를 골라주세요',
      '해당하는 것을 모두 골라도, 건너뛰어도 돼요',
      '해당하는 것을 선택해주세요',
    ]
    screen = (
      <Page
        {...pageProps}
        onSkip={() => {
          setState((prev) => ({
            ...prev,
            conditions: { ...reusableDefaults },
          }))
          go('defaults')
        }}
        footer={nextFooter}
      >
        <Heading
          title={titles[step - 1]}
          subtitle={subtitles[step - 1]}
          progress={{ current: step, total: 4 }}
        />
        {step === 1 && (
          <Choices
            label="지금 기분"
            options={moodOptions}
            selected={[moodOptions.indexOf(state.conditions.mood ?? '')]}
            onChange={(i) => updateConditions({ mood: moodOptions[i] })}
          />
        )}
        {step === 2 && (
          <Choices
            label="외출 에너지"
            options={energyOptions}
            selected={[state.conditions.energy ?? -1]}
            onChange={(i) => updateConditions({ energy: i as Energy })}
          />
        )}
        {step === 3 && (
          <Choices
            label="외출 장벽"
            options={barrierOptions}
            multiple
            selected={barrierOptions.flatMap((text, i) =>
              state.conditions.barriers.includes(text) ? [i] : [],
            )}
            onChange={(i) =>
              updateConditions({
                barriers: state.conditions.barriers.includes(barrierOptions[i])
                  ? state.conditions.barriers.filter((b) => b !== barrierOptions[i])
                  : [...state.conditions.barriers, barrierOptions[i]],
              })
            }
          />
        )}
        {step === 4 && (
          <div className="lt-body lt-condition-groups">
            {conditionGroups.map((group) => (
              <ChoiceChipGroup
                key={group.key}
                title={group.label}
                className="lt-condition-chip"
                options={group.options.map((label) => ({ value: label, label }))}
                value={state.conditions[group.key]}
                onChange={(value) => updateConditions({ [group.key]: value })}
              />
            ))}
          </div>
        )}
      </Page>
    )
  } else if (route === 'defaults') {
    const conditions = {
      ...reusableDefaults,
      ...Object.fromEntries(Object.entries(state.conditions).filter(([, value]) => value !== null)),
    } as Conditions
    screen = (
      <Page
        {...pageProps}
        footer={
          <Footer compact>
            <Button
              onClick={() => {
                updateConditions(conditions)
                go('loading')
              }}
            >
              이 조건으로 추천받기
            </Button>
            <Button variant="text" onClick={() => go('conditions-1')}>
              조건 계속 입력하기
            </Button>
          </Footer>
        }
      >
        <Heading
          title={'입력하지 않아도\n바로 추천받을 수 있어요'}
          subtitle="건너뛴 항목은 아래 기본값을 사용해요"
        />
        <div className="lt-body">
          <Card>
            <InfoRows
              spacious
              rows={[
                ['현재 기분', conditions.mood ?? '선택 안 함'],
                [
                  '외출 에너지',
                  `${conditions.energy}단계: ${['집 안에서', '현관 밖까지', '집 근처까지', '가까운 장소까지', '조금 더 멀리'][conditions.energy!]}`,
                ],
                [
                  '외출 장벽',
                  conditions.barriers.length
                    ? `${conditions.barriers.length}개 선택`
                    : '선택 안 함',
                ],
                [
                  '거리',
                  conditions.distance === '상관없음' ? '상관없음' : `도보 ${conditions.distance}`,
                ],
                ['시간', conditions.time === '상관없음' ? '상관없음' : `${conditions.time} 이내`],
                ['예산', conditions.budget!],
              ]}
            />
          </Card>
          <p className="lt-hint lt-trim">기본값은 마이에서 평소 외출 설정으로 바꿀 수 있어요.</p>
        </div>
      </Page>
    )
  } else if (route === 'loading' || route === 'location-loading')
    screen = (
      <Page {...pageProps}>
        <Heading
          title={
            route === 'loading'
              ? '지금 조건에 맞는\n미션을 찾고 있어요'
              : '조건에 맞는\n주변 장소를 찾고 있어요'
          }
          subtitle={route === 'loading' ? '에너지와 외출 조건을 확인하고 있어요' : undefined}
        />
        <MissionSkeletons places={route === 'location-loading'} />
      </Page>
    )
  else if (route === 'recommendations' || route === 'alternatives') {
    const alternatives = route === 'alternatives'
    const options = alternatives
      ? alternativeMissions(mission.level, mission.id, recommendationTurn)
      : recommendMissions(energy, recommendationTurn)
    screen = (
      <Page
        {...pageProps}
        nodeId={
          alternatives ? '72:9607' : ['72:8784', '72:8831', '72:8878', '72:8992', '72:8992'][energy]
        }
        footer={
          alternatives ? (
            <Footer compact>
              <Button onClick={() => setRecommendationTurn((v) => v + 1)}>다른 미션 보기</Button>
              <Button variant="text" onClick={() => go('active')}>
                하고있던 미션으로 돌아가기
              </Button>
            </Footer>
          ) : (
            <Footer row>
              <Button variant="secondary" onClick={() => go('conditions-1')}>
                조건 수정하기
              </Button>
              <Button onClick={() => setRecommendationTurn((v) => v + 1)}>다른 미션 보기</Button>
            </Footer>
          )
        }
      >
        <Heading
          title={alternatives ? '동일한 단계의\n대체 미션이 있어요' : missionTitles[energy]}
          subtitle={`에너지 ${alternatives ? mission.level : energy}단계에 맞췄어요`}
        />
        <div className="lt-body">
          {options.map((option, i) => (
            <Card key={option.id} title={option.title} description={option.description}>
              <Button
                variant={i === 0 ? 'primary' : 'secondary'}
                onClick={() => {
                  if (alternatives) {
                    setCandidateId(option.id)
                    setModal('change')
                  } else selectMission(option)
                }}
              >
                이 미션으로 할게요
              </Button>
            </Card>
          ))}
        </div>
      </Page>
    )
  } else if (route === 'places')
    screen = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button
              onClick={() => {
                setChecked([])
                go('detail')
              }}
            >
              이 장소로 할게요
            </Button>
          </Footer>
        }
      >
        <Heading eyebrow={mission.title} title="이 미션, 어디에서 해볼까요?" />
        <div className="lt-place-step-preview">
          <NumberedSteps steps={steps} compact />
          <p className="lt-hint lt-trim">스크롤해, 미션을 확인할 수 있어요</p>
        </div>
        <div className="lt-body">
          <OutingMap
            park
            places={places}
            selectedPlaceId={selectedPlace.id}
            onSelect={setPlaceId}
          />
        </div>
        <section className="lt-body lt-place-picker">
          <h2 className="lt-section-title lt-trim">장소를 선택해주세요</h2>
          <div className="lt-place-options">
            {places.map((place, i) => (
              <button
                key={place.id}
                className={selectedPlace.id === place.id ? 'is-selected' : ''}
                aria-pressed={selectedPlace.id === place.id}
                onClick={() => setPlaceId(place.id)}
                type="button"
              >
                <span className="lt-place-number">
                  <span className="lt-trim">{i + 1}</span>
                </span>
                <strong className="lt-trim">{place.name}</strong>
                <div className="lt-place-meta">
                  <span className="lt-trim">{place.distance}</span>
                  <span className="lt-trim">{place.walk}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </Page>
    )
  else if (route === 'detail')
    screen = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button
              onClick={() => {
                setChecked([])
                setResumed(false)
                go('active')
              }}
            >
              이 미션으로 할게요
            </Button>
          </Footer>
        }
      >
        <Heading
          eyebrow={`${mission.level}단계 미션`}
          title={mission.id === 'store' ? '집 앞 편의점\n다녀오기' : mission.title}
          subtitle={missionDate}
        />
        <div className="lt-body lt-body--detail">
          <NumberedSteps title="이렇게 해볼 수 있어요" steps={steps} />
          <Metrics
            distance={mission.placeType ? selectedPlace.walk : mission.distance}
            time={mission.time}
            budget={mission.budget}
          />
        </div>
        {mission.placeType && (
          <PlaceInfo place={selectedPlace} park={mission.placeType !== 'store'} />
        )}
      </Page>
    )
  else if (route === 'active')
    screen = (
      <Page
        {...pageProps}
        onStop={
          !resumed && !allDone && mission.placeType !== 'park' ? () => setModal('stop') : undefined
        }
        nodeId={
          resumed
            ? allDone
              ? '72:7956'
              : '72:7905'
            : allDone
              ? '72:9342'
              : mission.placeType === 'park'
                ? '72:9203'
                : '72:9291'
        }
        footer={
          allDone ? (
            <Footer>
              <Button onClick={() => go('summary')}>완료했어요</Button>
            </Footer>
          ) : (
            <Footer compact>
              <Button onClick={() => (resumed ? saveRecord() : setModal('save'))}>
                지금 단계까지 저장하기
              </Button>
              <Button variant="text" onClick={() => (resumed ? setModal('stop') : go('problem'))}>
                {resumed ? '이 미션 그만하고 싶어요' : '문제가 생겼어요'}
              </Button>
            </Footer>
          )
        }
      >
        <Heading eyebrow={`${mission.level}단계 미션`} title={shownTitle} subtitle={missionDate} />
        <div className="lt-body lt-body--checks">
          <MissionChecks
            steps={steps}
            checked={checked}
            onToggle={(index) =>
              setChecked((prev) =>
                prev.includes(index)
                  ? prev.filter((i) => i !== index)
                  : [...prev, index].sort((a, b) => a - b),
              )
            }
          />
          <p className="lt-hint lt-trim">처음부터 다시 해도 이전 성공 기록은 지워지지 않아요</p>
        </div>
        {mission.placeType && (
          <PlaceInfo place={selectedPlace} park={mission.placeType !== 'store'} />
        )}
      </Page>
    )
  else if (route === 'summary')
    screen = (
      <Page
        {...pageProps}
        nodeId={allDone ? '72:9397' : '72:9477'}
        footer={
          allDone ? (
            <Footer>
              <Button onClick={saveRecord}>확인했어요</Button>
            </Footer>
          ) : (
            <Footer row>
              <Button variant="secondary" onClick={() => go('active')}>
                미션 계속하기
              </Button>
              <Button onClick={saveRecord}>저장하기</Button>
            </Footer>
          )
        }
      >
        <Heading eyebrow={summaryTitle} title="아래의 수행 내역을 저장할게요" />
        <div className="lt-body lt-body--detail">
          <NumberedSteps steps={summarySteps} checked={checked} />
          <Metrics
            distance={mission.placeType ? selectedPlace.walk : mission.distance}
            time={mission.time}
            budget={mission.budget}
          />
        </div>
        {mission.placeType && (
          <PlaceInfo place={selectedPlace} park={mission.placeType !== 'store'} />
        )}
      </Page>
    )
  else if (route === 'problem')
    screen = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button
              onClick={() => {
                setRecommendationTurn(0)
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
        <Heading eyebrow={summaryTitle} title={'상황이 어떻게\n달라졌나요?'} />
        <Choices
          options={problemOptions}
          selected={[problem]}
          onChange={setProblem}
          label="달라진 상황"
        />
      </Page>
    )
  else if (route === 'review-mood')
    screen = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button onClick={() => go('review-note')}>다음</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setReview((prev) => ({ ...prev, mood: null }))
                go('review-note')
              }}
            >
              건너뛰기
            </Button>
          </Footer>
        }
      >
        <Heading
          progress={{ current: 1, total: 2 }}
          title="미션 후 기분은 어떤가요?"
          subtitle="고르지 않아도 성공 기록은 그대로 남아요"
        />
        <Choices
          options={reviewMoodOptions}
          selected={review.mood === null ? [] : [Number(review.mood)]}
          onChange={(i) => setReview((prev) => ({ ...prev, mood: String(i) }))}
          label="미션 후 기분"
        />
      </Page>
    )
  else
    screen = (
      <Page
        {...pageProps}
        footer={
          <Footer>
            <Button onClick={finishReview}>기록 저장하기</Button>
          </Footer>
        }
      >
        <Heading
          progress={{ current: 2, total: 2 }}
          title="남기고 싶은 내용을 적어보세요"
          subtitle="모두 선택 사항이에요. 나에게만 보여요."
        />
        <div className="lt-body lt-review-fields">
          <ReviewInput
            label="오늘의 한 줄 후기"
            value={review.note}
            placeholder="바깥 공기를 느낄 수 있었어요."
            onChange={(note) => setReview((prev) => ({ ...prev, note }))}
          />
          <ReviewInput
            label="다시 해보고 싶은 활동"
            value={review.retry}
            placeholder="건물 주변 잠깐 걷기"
            onChange={(retry) => setReview((prev) => ({ ...prev, retry }))}
          />
          <ReviewInput
            label="오늘 외출에서 좋았던 점"
            value={review.good}
            placeholder="집 근처가 생각보다 조용했어요."
            onChange={(good) => setReview((prev) => ({ ...prev, good }))}
          />
        </div>
      </Page>
    )

  const modalCopy: Record<ModalKind, [string, string, string]> = {
    rest: ['오늘은 쉬어갈까요?', '오늘 충분한 휴식을 갖고,\n내일은 미션을 도전해봐요!', '72:8395'],
    exit: [
      '설정을 나갈까요?',
      '지금까지 선택한 조건을 이어서 입력하거나\n홈으로 돌아갈 수 있어요',
      '72:8369',
    ],
    stop: [
      '이 미션을 그만할까요?',
      '이미 남긴 성공 기록은 그대로 유지돼요',
      resumed ? '72:8011' : '88:101',
    ],
    save: [
      '이 미션 수행 내역을\n지금 단계까지 저장할게요',
      '다음에도 홈 화면에서 계속해서 이어할 수 있어요',
      '72:9686',
    ],
    location: [
      '주변 장소를 찾으려면\n위치 정보가 필요해요',
      '거절하면 미션 선택으로 돌아가요.\n장소가 없는 미션은 계속 이용할 수 있어요.',
      '72:9265',
    ],
    change: [
      '이 미션으로 변경할까요?',
      '‘아니오’를 선택하면\n하고 있던 미션으로 돌아갈 수 있어요',
      '72:9654',
    ],
  }
  return (
    <div className="lt-app">
      {screen}
      {modal && (
        <Modal
          title={modalCopy[modal][0]}
          description={modalCopy[modal][1]}
          nodeId={modalCopy[modal][2]}
          onClose={() => setModal(null)}
          actions={
            modal === 'location' ? (
              <div className="lt-button-stack">
                <Button onClick={confirmModal}>동의하기</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setModal(null)
                    setToast('장소 선택을 취소했어요')
                  }}
                >
                  거절하기
                </Button>
              </div>
            ) : modal === 'exit' ? (
              <>
                <Button variant="secondary" onClick={confirmModal}>
                  홈으로 돌아가기
                </Button>
                <Button onClick={() => setModal(null)}>계속 입력하기</Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => (modal === 'change' ? go('active') : setModal(null))}
                >
                  아니오
                </Button>
                <Button onClick={confirmModal}>예</Button>
              </>
            )
          }
        >
          {(modal === 'stop' || modal === 'save') && (
            <Card title={summaryTitle}>
              <InfoRows
                rows={[
                  [
                    '시작일',
                    resumed || route === 'resume'
                      ? (savedMission?.date ?? missionDate)
                      : missionDate,
                  ],
                  ['완료한 단계', `${checked.length}개`],
                  ['남은 단계', `${mission.steps.length - checked.length}개`],
                ]}
              />
            </Card>
          )}
          {modal === 'change' && (
            <Card
              title={missionById(candidateId).title}
              description={missionById(candidateId).description}
            />
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
