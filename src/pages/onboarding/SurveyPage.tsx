import { Navigate, useNavigate, useParams } from 'react-router'
import PageTitle from '@/components/layout/PageTitle'
import Screen from '@/components/layout/Screen'
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
import { PATHS, surveyPath } from '@/constants/paths'
import { useOnboardingDraftStore } from '@/stores/onboardingDraftStore'

const TOTAL_STEPS = 4
const DESCRIPTION = '선택을 기반으로 미션 조건 기본값이 설정돼요'

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
 */
export default function SurveyPage() {
  const navigate = useNavigate()
  const step = Number(useParams().step)

  if (!Number.isInteger(step) || step < 1 || step > TOTAL_STEPS) {
    return <Navigate to={surveyPath(1)} replace />
  }

  const handleNext = () => {
    navigate(step < TOTAL_STEPS ? surveyPath(step + 1) : PATHS.SURVEY_DEFAULTS)
  }

  return (
    <Screen bottom={<Button onClick={handleNext}>다음</Button>}>
      <PageTitle
        progress={{ current: step, total: TOTAL_STEPS }}
        title={TITLES[step]}
        description={DESCRIPTION}
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
