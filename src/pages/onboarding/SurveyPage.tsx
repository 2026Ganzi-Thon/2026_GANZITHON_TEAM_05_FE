import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
import TopNav from '@/components/layout/TopNav'
import Button from '@/components/ui/Button'
import ChoiceChipGroup from '@/components/ui/ChoiceChipGroup'
import OptionList, { MultiOptionList } from '@/components/ui/OptionList'
import {
  BARRIER_OPTIONS,
  BUDGET_OPTIONS,
  DISTANCE_OPTIONS,
  DURATION_OPTIONS,
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
} from '@/constants/options'
import { PATHS, myDefaultsPath, surveyPath } from '@/constants/paths'
import { isApiEnabled } from '@/api/config'
import { defaultsApi } from '@/api/endpoints'
import { apiErrorMessage } from '@/api/errors'
import { fromApiDefaults, toApiDefaults } from '@/api/presentation'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/stores/authStore'
import { toConditions, useOnboardingDraftStore } from '@/stores/onboardingDraftStore'
import { useUserDefaultsStore } from '@/stores/userDefaultsStore'
import FieldMessage from './components/FieldMessage'

const TOTAL_STEPS = 4
const DESCRIPTION = '선택을 기반으로 미션 조건 기본값이 설정돼요'
const EDIT_DESCRIPTION = '바꾼 설정은 다음 외출부터 건너뛴 항목에 쓰여요'

const TITLES: Record<number, string> = {
  1: '평소의 기분은 어떤가요?',
  2: '평소 외출할 에너지는\n어느 정도인가요?',
  3: '외출을 망설이는\n이유가 있나요?',
  4: '미션 수행 시\n원하는 조건을 설정해요',
}

/**
 * 00 온보딩 / 기본값 설문 01~04 (/onboarding/survey/:step)
 * - 건너뛰기 없이 "다음"만 있다
 * - 고르지 않고 넘어가면 그 항목은 기본값을 쓴다
 *
 * 마이페이지의 평소 외출 설정 변경(/my/defaults/:step)도 같은 화면을 쓴다(mode="edit").
 * 이때는 뒤로가기가 있고, 마지막 단계에서 바로 저장한 뒤 마이페이지로 돌아간다.
 */
export default function SurveyPage({ mode = 'onboarding' }: { mode?: 'onboarding' | 'edit' }) {
  const navigate = useNavigate()
  const step = Number(useParams().step)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const edit = mode === 'edit'
  const pathOf = edit ? myDefaultsPath : surveyPath

  if (!Number.isInteger(step) || step < 1 || step > TOTAL_STEPS) {
    return <Navigate to={pathOf(1)} replace />
  }

  const save = async () => {
    if (pending) return
    setPending(true)
    setError('')
    try {
      const conditions = toConditions(useOnboardingDraftStore.getState())
      if (isApiEnabled) {
        const response = await defaultsApi.save(toApiDefaults(conditions))
        useUserDefaultsStore.getState().setDefaults(fromApiDefaults(response))
        queryClient.setQueryData(['api', useAuthStore.getState().userId, 'defaults'], response)
      } else useUserDefaultsStore.getState().setDefaults(conditions)
      useOnboardingDraftStore.getState().reset()
      navigate(PATHS.MY, { replace: true, state: { saved: true } })
    } catch (error) {
      setError(apiErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) navigate(pathOf(step + 1))
    else if (edit) void save()
    else navigate(PATHS.SURVEY_DEFAULTS)
  }

  const last = edit && step === TOTAL_STEPS
  return (
    <Screen
      header={edit ? <TopNav /> : undefined}
      bottom={
        <>
          {error && <FieldMessage>{error}</FieldMessage>}
          <Button disabled={pending} onClick={handleNext}>
            {pending ? '저장하는 중이에요' : last ? '저장하기' : '다음'}
          </Button>
        </>
      }
    >
      <PageTitle
        progress={{ current: step, total: TOTAL_STEPS }}
        title={TITLES[step]}
        description={edit ? EDIT_DESCRIPTION : DESCRIPTION}
        className={edit ? 'pt-[15px]' : undefined}
      />
      <SurveyStep step={step} />
    </Screen>
  )
}

function SurveyStep({ step }: { step: number }) {
  const draft = useOnboardingDraftStore()

  switch (step) {
    case 1:
      return <OptionList options={MOOD_OPTIONS} value={draft.mood} onChange={draft.setMood} />
    case 2:
      return <OptionList options={ENERGY_OPTIONS} value={draft.energy} onChange={draft.setEnergy} />
    case 3:
      return (
        <MultiOptionList
          options={BARRIER_OPTIONS}
          value={draft.barriers}
          onChange={draft.setBarriers}
        />
      )
    default:
      return (
        <div className="flex flex-col gap-[25px] p-[20px]">
          <ChoiceChipGroup
            title="이동 가능 거리"
            options={DISTANCE_OPTIONS}
            value={draft.distance}
            onChange={draft.setDistance}
          />
          <ChoiceChipGroup
            title="사용 가능한 시간"
            options={DURATION_OPTIONS}
            value={draft.duration}
            onChange={draft.setDuration}
          />
          <ChoiceChipGroup
            title="사용 가능한 예산"
            options={BUDGET_OPTIONS}
            value={draft.budget}
            onChange={draft.setBudget}
          />
        </div>
      )
  }
}
